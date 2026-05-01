// Computer-plane AI. Ported from src/swauto.c.
// Drives `movecomp`-flagged planes by computing a target position and
// applying flap/throttle adjustments.

import { ANGLES, BULLIFE, BULSPEED, CLOSE, HOME, MAX_Y, MAX_THROTTLE, NEAR, SYM_WDTH, SYM_HGHT, SIN, COS } from "./constants.js";
import { OBSTATE, OBTYPE, PLAYMODE } from "./types.js";
import { state } from "./state.js";
import { copyobj, movexy, setdxdy, updateobjpos, PlaneIsStalled, PlaneIsFlying } from "./object.js";
import { createObject } from "./types.js";
import { in_range, clamp_min, clamp_max, clamp_range } from "./util.js";
import { moverefs, movecomp } from "./move.js";

let courseadj = 0;

export function range(x, y, ax, ay) {
	let dx = Math.abs(x - ax);
	let dy = Math.abs(y - ay);
	dy += dy >> 1;
	if (dx < 125 && dy < 125) return dx * dx + dy * dy;
	if (dx < dy) { const t = dx; dx = dy; dy = t; }
	return -((7 * dx + (dy << 2)) >> 3);
}

function shoot(obt, obs) {
	const obsp = createObject();
	const obtsp = createObject();
	copyobj(obsp, obs);
	copyobj(obtsp, obt);
	let nspeed = obsp.ob_speed + BULSPEED;
	setdxdy(obsp, nspeed * COS(obsp.ob_angle), nspeed * SIN(obsp.ob_angle));
	obsp.ob_x += SYM_WDTH / 2;
	obsp.ob_y -= SYM_HGHT / 2;

	let nangle = obtsp.ob_angle;
	nspeed = obtsp.ob_speed;
	let rprev = NEAR;

	for (let i = 0; i < BULLIFE; i++) {
		const [obx, oby] = movexy(obsp);
		if (obtsp.ob_state === OBSTATE.FLYING || obtsp.ob_state === OBSTATE.WOUNDED) {
			const r = obtsp.ob_flaps;
			if (r) {
				if (obtsp.ob_orient) nangle -= r; else nangle += r;
				nangle = ((nangle % ANGLES) + ANGLES) % ANGLES;
				setdxdy(obtsp, nspeed * COS(nangle), nspeed * SIN(nangle));
			}
		}
		const [obtx, obty] = movexy(obtsp);
		const r = range(obx, oby, obtx, obty);
		if (!in_range(0, r, rprev)) return 0;
		if (
			in_range(obtx, obx, obtx + SYM_WDTH - 1) &&
			in_range(obty - SYM_HGHT + 1, oby, obty)
		) {
			return 1 + (i > BULLIFE / 3 ? 1 : 0);
		}
		rprev = r;
	}
	return 0;
}

function WithinHomeRange(ob, x, y) {
	const orig = ob.ob_original_ob;
	return Math.abs(x - orig.x) < HOME && Math.abs(y - ob.ob_orig_y) < HOME;
}

function IsTarget(ob) {
	return ob.ob_type === OBTYPE.TARGET || ob.ob_type === OBTYPE.OX;
}

function tstcrash2(ob, x, y, alt, dy) {
	if (alt > 50) return false;
	let lookahead = 3;
	if (ob.ob_home && WithinHomeRange(ob, x, y)) lookahead = 1;
	if (alt + Math.floor((dy * lookahead) / 256) < 8) return true;

	const xl = clamp_min(x - 32, ob.ob_x - 32 - state.gmaxspeed);
	const xr = clamp_max(x + 32, ob.ob_x + 32 + state.gmaxspeed);

	let obt = ob;
	while (obt.ob_xprev !== null && obt.ob_xprev.ob_x >= xl) obt = obt.ob_xprev;
	for (; obt.ob_xnext !== null; obt = obt.ob_xnext) {
		if (!IsTarget(obt) || obt.ob_x < xl) continue;
		if (obt.ob_x > xr) return false;
		const yt = obt.ob_y + (obt.ob_state === OBSTATE.STANDING ? 16 : 8);
		if (y <= yt) return true;
	}
	return false;
}

function IsWingman(plane, plane2) {
	const midpoint = (plane2.ob_original_ob.territory_l + plane2.ob_original_ob.territory_r) >> 1;
	return (
		plane !== plane2 &&
		plane.ob_faction === plane2.ob_faction &&
		in_range(plane.ob_original_ob.territory_l, midpoint, plane.ob_original_ob.territory_r)
	);
}

function FindWingmen(plane) {
	const result = { ahead: null, behind: null };
	if (plane.ob_target === null) return result;
	const direction = plane.ob_target.ob_x > plane.ob_x ? 1 : -1;
	const isAheadOf = (a, b) => a.ob_x * direction >= b.ob_x * direction;
	for (let i = 0; i < state.num_planes; i++) {
		const wingman = state.planes[i];
		if (!wingman || !IsWingman(plane, wingman) || !PlaneIsFlying(wingman.ob_state)) continue;
		if (isAheadOf(wingman, plane) && (result.ahead === null || isAheadOf(result.ahead, wingman))) {
			result.ahead = wingman;
		}
		if (!isAheadOf(wingman, plane) && (result.behind === null || isAheadOf(wingman, result.behind))) {
			result.behind = wingman;
		}
	}
	return result;
}

export function aim(ob, ax, ay, obt, longway) {
	if (PlaneIsStalled(ob.ob_state) && ob.ob_angle !== (3 * ANGLES) / 4) {
		ob.ob_flaps = -1;
		ob.ob_accel = MAX_THROTTLE;
		return 0;
	}

	let x = ob.ob_x;
	let y = ob.ob_y;
	const dx = x - ax;
	const { ahead, behind } = FindWingmen(ob);

	if (ob.ob_athome && ahead !== null && Math.abs(ob.ob_x - ahead.ob_x) < 64) {
		return 0;
	}

	if (Math.abs(dx) <= 160) {
		if (!longway) ob.ob_hitcount = 0;
	} else if (ahead !== null && Math.abs(ob.ob_x - ahead.ob_x) < 80) {
		return aim(ob, ahead.ob_x + 20, ahead.ob_y - 20, null, false);
	} else {
		if (ob.ob_dx && (dx < 0) === (ob.ob_dx < 0)) {
			if (!ob.ob_hitcount) ob.ob_hitcount = y > MAX_Y - 50 ? 2 : 1;
			return aim(ob, x, ob.ob_hitcount === 1 ? y + 25 : y - 25, null, true);
		}
		ob.ob_hitcount = 0;
		let height = clamp_max(y + 100, MAX_Y - 50 - courseadj);
		if (behind !== null) height = clamp_max(height + 32, MAX_Y - 32);
		return aim(ob, x + (dx < 0 ? 150 : -150), height, null, true);
	}

	if (ob.ob_speed) {
		const dy = y - ay;
		if (dy !== 0 && Math.abs(dy) < 6) {
			if (dy < 0) y++; else y--;
			ob.ob_y = y;
		} else if (dx !== 0 && Math.abs(dx) < 6) {
			if (dx < 0) x++; else x--;
			ob.ob_x = x;
			updateobjpos(ob);
		}
	}

	const obs = createObject();
	copyobj(obs, ob);

	let nspeed = obs.ob_speed + 1;
	if (nspeed > state.gmaxspeed && obs.ob_type === OBTYPE.PLANE) nspeed = state.gmaxspeed;
	else if (nspeed < state.gminspeed) nspeed = state.gminspeed;

	const cflaps = [0, -1, 1];
	const crange = [0, 0, 0];
	const ccrash = [0, 0, 0];
	const calt = [0, 0, 0];

	for (let i = 0; i < 3; i++) {
		const nangle = (((obs.ob_angle + (obs.ob_orient ? -cflaps[i] : cflaps[i])) % ANGLES) + ANGLES) % ANGLES;
		setdxdy(obs, nspeed * COS(nangle), nspeed * SIN(nangle));
		const [nx, ny] = movexy(obs);
		crange[i] = range(nx, ny, ax, ay);
		const groundIdx = clamp_max(nx + 8, state.currgame.gm_max_x - 1);
		calt[i] = ny - state.currgame.gm_ground[groundIdx];
		ccrash[i] = tstcrash2(ob, nx, ny, calt[i], nspeed * SIN(nangle));
		copyobj(obs, ob);
	}

	if (obt) {
		const i = shoot(obt, obs);
		if (i) {
			if (ob.ob_missiles && state.conf_missiles && i === 2) {
				ob.ob_mfiring = obt.ob_athome ? ob : obt;
			} else {
				ob.ob_firing = obt;
			}
		}
	}

	let rmin = 32767;
	let n = 0;
	for (let i = 0; i < 3; i++) {
		const r = crange[i];
		if (in_range(0, r, rmin - 1) && !ccrash[i]) {
			rmin = r;
			n = i;
		}
	}
	if (rmin === 32767) {
		rmin = -32767;
		for (let i = 0; i < 3; i++) {
			const r = crange[i];
			if (r < 0 && r > rmin && !ccrash[i]) {
				rmin = r;
				n = i;
			}
		}
	}

	if (ob.ob_speed < state.gminspeed) ob.ob_accel = MAX_THROTTLE;

	if (rmin === -32767) {
		if (ob.ob_accel) ob.ob_accel--;
		n = 0;
		let dy = calt[0];
		if (calt[1] > calt[0]) { dy = calt[1]; n = 1; }
		if (calt[2] > dy) n = 2;
	} else {
		if (ob.ob_accel < MAX_THROTTLE) ob.ob_accel++;
	}

	if (ahead !== null && Math.abs(ahead.ob_x - ob.ob_x) < 24) {
		ob.ob_accel = clamp_min(1, ahead.ob_accel - 2);
	} else if (behind !== null && Math.abs(behind.ob_x - ob.ob_x) > 32 && ob.ob_dy === 0) {
		ob.ob_accel = clamp_min(1, behind.ob_accel - 2);
	}

	ob.ob_flaps = cflaps[n];
	if (ob.ob_type === OBTYPE.PLANE && !ob.ob_flaps) {
		if (ob.ob_speed) ob.ob_orient = ob.ob_dx < 0 ? 1 : 0;
	}
	return 0;
}

export function gohome(ob) {
	if (ob.ob_athome) return 0;
	courseadj = ((state.countmove & 0x001f) < 16 ? 1 : 0) << 4;
	if (WithinHomeRange(ob, ob.ob_x, ob.ob_y)) {
		if (state.plyrplane && moverefs.initplyr) {
			moverefs.initplyr(ob, ob.ob_original_ob);
			if (moverefs.initdisp) moverefs.initdisp(true);
		} else if (state.compplane && moverefs.initcomp) {
			moverefs.initcomp(ob, ob.ob_original_ob);
		} else if (moverefs.initpln) {
			moverefs.initpln(ob, ob.ob_original_ob);
		}
		return 0;
	}
	if (ob.ob_state === OBSTATE.WOUNDED && (state.countmove & 1)) return 0;
	return aim(ob, ob.ob_original_ob.x, ob.ob_orig_y, null, false);
}

function cruise(ob) {
	courseadj = ((state.countmove & 0x001f) < 16 ? 1 : 0) << 4;
	const orgx = ob.ob_original_ob.x;
	const maxx = state.currgame.gm_max_x;
	aim(
		ob,
		courseadj + clamp_range(Math.floor(maxx / 3), orgx, Math.floor((2 * maxx) / 3)),
		MAX_Y - 50 - (courseadj >> 1),
		null,
		false,
	);
}

function attack(obp, ob) {
	courseadj = ((state.countmove & 0x001f) < 16 ? 1 : 0) << 4;
	if (ob.ob_speed) {
		aim(
			obp,
			ob.ob_x - ((CLOSE * COS(ob.ob_angle)) >> 8),
			ob.ob_y - ((CLOSE * SIN(ob.ob_angle)) >> 8),
			ob,
			false,
		);
	} else {
		aim(obp, ob.ob_x, ob.ob_y + 4, ob, false);
	}
}

export function swauto(ob) {
	if (ob.ob_target !== null) attack(ob, ob.ob_target);
	else if (!ob.ob_athome) cruise(ob);
	ob.ob_target = null;
}

// Wire AI references back into the move dispatcher.
export function bindMoverefs() {
	moverefs.gohome = gohome;
	moverefs.swauto = swauto;
	moverefs.aim = aim;
	moverefs.range = range;
}
