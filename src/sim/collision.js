// Collision detection + kill resolution. Port of src/swcollsn.c.
//
// `swcollsn()` runs once per tic after `swmove()` (matching the order
// in src/swmain.c:228). It walks the X-sorted object list, finds
// pixel-perfect intersections via `CollisionTest`, additionally tests
// plane/bomb/missile vs ground via `tstcrash`, then applies kill
// transitions through `swkill` for each pair.

import {
	BULLIFE,
	FALLCOUNT,
	MAXBOMBS,
	MAXFUEL,
	MAXROUNDS,
	TARGHITCOUNT,
} from "./constants.js";
import {
	FACTION,
	NUM_FACTIONS,
	OBSTATE,
	OBTYPE,
	PLAYMODE,
	POWERUP,
	TARGET,
} from "./types.js";
import { state, topobj, botobj } from "./state.js";
import { PlaneIsFlying, PlaneIsWounded } from "./object.js";
import { stopsound } from "./sound.js";
import { initexpl, initbird } from "./init.js";
import { crashpln, hitpln, moverefs, movecomp, moveplyr } from "./move.js";
import { swsplatbird, swsplatox, swwindshot } from "./splat.js";
import { clamp_max, clamp_min } from "./util.js";

const MAX_OBJS = 100;
const KILL_BUF = MAX_OBJS * 2;

const killed = new Array(KILL_BUF).fill(null);
const killer = new Array(KILL_BUF).fill(null);
let killptr = 0;

const MAX_PLYR = 4;
const collsdx = new Int32Array(MAX_PLYR);
const collsdy = new Int32Array(MAX_PLYR);
const collsno = new Array(MAX_PLYR).fill(null);
let collptr = 0;
let collxadj = 0;
let collyadj = 0;

// Pixel-perfect collision test. Mirrors src/swcollsn.c:39.
export function CollisionTest(ob1, ob2) {
	if (
		(ob1.ob_type === OBTYPE.PLANE && ob1.ob_state >= OBSTATE.FINISHED) ||
		(ob2.ob_type === OBTYPE.PLANE && ob2.ob_state >= OBSTATE.FINISHED) ||
		(ob1.ob_type === OBTYPE.EXPLOSION && ob2.ob_type === OBTYPE.EXPLOSION)
	) {
		return false;
	}

	const s1 = ob1.ob_symbol;
	const s2 = ob2.ob_symbol;
	if (!s1 || !s2) return false;

	let x1, x2, w;
	if (ob1.ob_x < ob2.ob_x) {
		x1 = ob2.ob_x - ob1.ob_x;
		x2 = 0;
		w = clamp_max(s1.w - x1, s2.w);
	} else {
		x1 = 0;
		x2 = ob1.ob_x - ob2.ob_x;
		w = clamp_max(s2.w - x2, s1.w);
	}
	if (w <= 0) return false;

	let y1, y2, h;
	if (ob1.ob_y < ob2.ob_y) {
		y1 = 0;
		y2 = ob2.ob_y - ob1.ob_y;
		h = clamp_max(s2.h - y2, s1.h);
	} else {
		y1 = ob1.ob_y - ob2.ob_y;
		y2 = 0;
		h = clamp_max(s1.h - y1, s2.h);
	}
	if (h <= 0) return false;

	const data1 = s1.data;
	const data2 = s2.data;
	const stride1 = s1.w;
	const stride2 = s2.w;
	let row1 = stride1 * y1 + x1;
	let row2 = stride2 * y2 + x2;
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			if (data1[row1 + x] && data2[row2 + x]) return true;
		}
		row1 += stride1;
		row2 += stride2;
	}
	return false;
}

// Returns [scoreObject, reverse] — reverse indicates the score should
// be subtracted rather than added. Mirrors src/swcollsn.c:121.
function getScoreObject(ob) {
	if (state.playmode !== PLAYMODE.ASYNCH) {
		const reverse =
			ob.ob_faction === FACTION.PLAYER1 || ob.ob_faction === FACTION.NONE;
		return [state.planes[0], reverse];
	}
	const target = state.planes[ob.ob_faction === FACTION.PLAYER1 ? 1 : 0];
	const reverse = ob.ob_faction === FACTION.NONE;
	return [target, reverse];
}

function scoretarg(obp, score) {
	const [ob, reverse] = getScoreObject(obp);
	if (!ob || !ob.ob_score) return;
	if (reverse) ob.ob_score.score -= score;
	else ob.ob_score.score += score;
}

function isHumanFaction(f) {
	for (let i = 0; i < MAX_PLYR; i++) {
		const p = state.planes[i];
		if (p && p.ob_faction === f && p.ob_movef === moveplyr) return true;
	}
	return false;
}

// CheckForWinner — src/swcollsn.c:169.
function checkForWinner() {
	for (let i = FACTION.PLAYER1; i < NUM_FACTIONS; i++) {
		if (!isHumanFaction(i)) continue;
		let foundOther = false;
		for (let j = FACTION.PLAYER1; j < NUM_FACTIONS; j++) {
			if (i !== j && state.numtarg[j] > 0) {
				foundOther = true;
				break;
			}
		}
		if (!foundOther) return i;
	}
	return FACTION.NONE;
}

function endgame(winningFaction) {
	let ob = state.objtop;
	while (ob && ob.ob_type === OBTYPE.PLANE) {
		if (ob.ob_endsts === 0 /* PLAYING */) {
			const winner =
				ob.ob_faction === winningFaction &&
				(ob.ob_crashcnt < 4 /* MAXCRASH-1 */ ||
					(ob.ob_crashcnt < 5 && !planeIsKilled(ob.ob_state)));
			if (winner) {
				moverefs.winner?.(ob);
			} else {
				moverefs.loser?.(ob);
			}
		}
		ob = ob.ob_next;
	}
}

function planeIsKilled(s) {
	return (
		s === OBSTATE.FALLING ||
		s === OBSTATE.CRASHED ||
		s === OBSTATE.HIT ||
		s === OBSTATE.WOUNDSTALL
	);
}

function computeValour(ob) {
	const [so, reverse] = getScoreObject(ob);
	if (reverse || !so || !so.ob_original_ob) return 0;

	const xHome = so.ob_original_ob.x;
	const distance = Math.abs(xHome - so.ob_x);
	let valour = distance < 500 ? 0 : Math.floor((distance - 500) / 350);

	const fuelfraction = ob.ob_life > 0 ? Math.floor(MAXFUEL / ob.ob_life) : 1000;
	if (fuelfraction > 9) valour++;
	if (PlaneIsWounded(so.ob_state)) valour = (valour + 1) * 3;
	else valour *= 2;
	return valour;
}

// scorepln — src/swcollsn.c:642. Exported and stitched into moverefs.
export function scorepln(ob, type) {
	const hadTakenOff = ob.ob_life < MAXFUEL - Math.floor(MAXFUEL / 100);
	scoretarg(ob, 50);

	if (
		type === OBTYPE.BOMB ||
		type === OBTYPE.SHOT ||
		type === OBTYPE.MISSILE ||
		type === OBTYPE.PLANE
	) {
		const [scobj, reverse] = getScoreObject(ob);
		if (!reverse && scobj?.ob_flightscore) {
			if (hadTakenOff) {
				if (type !== OBTYPE.PLANE) scobj.ob_flightscore.planekills++;
				scobj.ob_flightscore.valour += 4 * (2 + computeValour(ob));
			}
			scobj.ob_flightscore.killscore += 3;
		}
	}
}

function targetDestroyed(ob, type) {
	const [so, reverse] = getScoreObject(ob);
	if (
		!reverse &&
		so?.ob_flightscore &&
		(type === OBTYPE.BOMB ||
			type === OBTYPE.SHOT ||
			type === OBTYPE.MISSILE ||
			type === OBTYPE.PLANE)
	) {
		so.ob_flightscore.killscore += 4;
		so.ob_flightscore.valour += 3 * computeValour(ob);
	}
	scoretarg(ob, ob.ob_orient === TARGET.OIL_TANK ? 200 : 100);
	state.numtarg[ob.ob_faction]--;

	const winner = checkForWinner();
	if (winner !== FACTION.NONE) endgame(winner);
}

function scorepenalty(ttype, obt, score) {
	if (
		ttype === OBTYPE.SHOT ||
		ttype === OBTYPE.BOMB ||
		ttype === OBTYPE.MISSILE ||
		(ttype === OBTYPE.PLANE &&
			(obt.ob_state === OBSTATE.FLYING ||
				obt.ob_state === OBSTATE.WOUNDED ||
				(obt.ob_state === OBSTATE.FALLING &&
					obt.ob_hitcount === FALLCOUNT)) &&
			!obt.ob_athome)
	) {
		scoretarg(obt, score);
		return true;
	}
	return false;
}

const CRTDEPTH = [1, 2, 2, 3, 3, 2, 2, 1];

function crater(ob) {
	const sym = ob.ob_symbol;
	if (!sym) return;
	const ground = state.ground;
	const xmin = ob.ob_x + ((sym.w - 8) >> 1);
	const xmax = xmin + 7;
	for (let x = xmin, i = 0; x <= xmax; x++, i++) {
		if (x < 0 || x >= ground.length) continue;
		const ymax = ground[x];
		let ymin = ymax - CRTDEPTH[i] + 1;
		const y = clamp_min(20, state.currgame.gm_ground[x] - 20);
		if (ymin <= y) ymin = y + 1;
		ground[x] = ymin - 1;
	}
}

function isYoungShot(ob) {
	return ob && ob.ob_type === OBTYPE.SHOT && ob.ob_life >= BULLIFE - 1;
}

function powerupCollected(powerup, plane) {
	powerup.ob_state = OBSTATE.FINISHED;
	switch (powerup.ob_orient) {
		case POWERUP.AMMO:
			plane.ob_rounds = clamp_max(
				plane.ob_rounds + (MAXROUNDS >> 1),
				MAXROUNDS,
			);
			break;
		case POWERUP.AMMO_BIG:
			plane.ob_rounds = MAXROUNDS;
			break;
		case POWERUP.FUEL:
			plane.ob_life = clamp_max(plane.ob_life + (MAXFUEL >> 1), MAXFUEL);
			break;
		case POWERUP.FUEL_BIG:
			plane.ob_life = MAXFUEL;
			break;
		case POWERUP.BOMB:
			plane.ob_bombs = clamp_max(plane.ob_bombs + (MAXBOMBS >> 1), MAXBOMBS);
			break;
		case POWERUP.BOMB_BIG:
			plane.ob_bombs = MAXBOMBS;
			break;
	}
}

function swkill(ob1, ob2) {
	const ob = ob1;
	const obt = ob2;
	const ttype = obt ? obt.ob_type : OBTYPE.GROUND;

	if (
		(ttype === OBTYPE.BIRD || ttype === OBTYPE.FLOCK) &&
		ob.ob_type !== OBTYPE.PLANE
	) {
		return;
	}

	switch (ob.ob_type) {
		case OBTYPE.BOMB:
		case OBTYPE.MISSILE: {
			initexpl(ob, 0);
			ob.ob_life = -1;
			if (!obt) crater(ob);
			stopsound(ob);
			return;
		}
		case OBTYPE.SHOT: {
			if (!(obt && obt.ob_type === OBTYPE.PLANE && isYoungShot(ob))) {
				ob.ob_life = 1;
			}
			return;
		}
		case OBTYPE.STARBURST: {
			if (ttype === OBTYPE.MISSILE || ttype === OBTYPE.BOMB || !obt) {
				ob.ob_life = 1;
			}
			return;
		}
		case OBTYPE.EXPLOSION: {
			if (!obt) {
				ob.ob_life = 1;
				stopsound(ob);
			}
			return;
		}
		case OBTYPE.BALLOON: {
			if (ob.ob_state !== OBSTATE.FLYING) return;
			if (
				ttype !== OBTYPE.PLANE &&
				ttype !== OBTYPE.SHOT &&
				ttype !== OBTYPE.BOMB
			) {
				return;
			}
			ob.ob_state = OBSTATE.FINISHED;
			ob.ob_onmap = false;
			ob.ob_life = -1;
			initexpl(ob, 0);
			targetDestroyed(ob, ttype);
			return;
		}
		case OBTYPE.POWERUP:
		case OBTYPE.TARGET: {
			if (ob.ob_state !== OBSTATE.STANDING) return;
			if (ttype === OBTYPE.EXPLOSION || ttype === OBTYPE.STARBURST) return;

			if (ttype === OBTYPE.SHOT) {
				ob.ob_hitcount += TARGHITCOUNT;
				if (ob.ob_hitcount <= TARGHITCOUNT * (state.gamenum + 1)) return;
			}

			ob.ob_state = OBSTATE.FINISHED;
			ob.ob_onmap = false;

			if (
				ob.ob_type === OBTYPE.POWERUP &&
				obt &&
				obt.ob_movef === moveplyr &&
				obt.ob_type === OBTYPE.PLANE &&
				PlaneIsFlying(obt.ob_state)
			) {
				powerupCollected(ob, obt);
			} else {
				initexpl(ob, 0);
				if (ob.ob_type === OBTYPE.TARGET) targetDestroyed(ob, ttype);
			}
			return;
		}
		case OBTYPE.PLANE: {
			const st = ob.ob_state;
			if (isYoungShot(obt)) return;
			if (st === OBSTATE.CRASHED) return;
			if (ob.ob_endsts === 1 /* WINNER */) return;
			if (ttype === OBTYPE.POWERUP) return;
			if (ttype === OBTYPE.STARBURST || (ttype === OBTYPE.BIRD && ob.ob_athome)) {
				return;
			}

			if (!obt) {
				if (st === OBSTATE.FALLING) {
					stopsound(ob);
					initexpl(ob, 1);
					crater(ob);
				} else if (st < OBSTATE.FINISHED) {
					scorepln(ob, ttype);
					initexpl(ob, 1);
					crater(ob);
				}
				crashpln(ob);
				return;
			}

			if (st >= OBSTATE.FINISHED) return;

			if (st === OBSTATE.FALLING) {
				if (ob === state.consoleplayer) {
					if (ttype === OBTYPE.SHOT) swwindshot();
					else if (ttype === OBTYPE.OX) swsplatox();
					else if (ttype === OBTYPE.BIRD || ttype === OBTYPE.FLOCK) swsplatbird();
				}
				return;
			}

			if (
				ttype === OBTYPE.SHOT ||
				ttype === OBTYPE.BIRD ||
				ttype === OBTYPE.OX ||
				ttype === OBTYPE.FLOCK
			) {
				if (ob === state.consoleplayer) {
					if (ttype === OBTYPE.SHOT) swwindshot();
					else if (ttype === OBTYPE.OX) swsplatox();
					else swsplatbird();
				}

				if (state.conf_wounded && !ob.ob_athome) {
					if (ttype === OBTYPE.SHOT) {
						if (ob.ob_flightscore) ob.ob_flightscore.combatwound = true;
					}
					if (st === OBSTATE.FLYING) {
						ob.ob_state = OBSTATE.WOUNDED;
						return;
					}
					if (st === OBSTATE.STALLED) {
						ob.ob_state = OBSTATE.WOUNDSTALL;
						return;
					}
				}
			} else {
				initexpl(ob, 1);
				if (ttype === OBTYPE.PLANE) {
					collxadj = -collxadj;
					collyadj = -collyadj;
					if (collptr < MAX_PLYR) {
						collsdx[collptr] = ((ob.ob_dx + obt.ob_dx) >> 1) + collxadj;
						collsdy[collptr] = ((ob.ob_dy + obt.ob_dy) >> 1) + collyadj;
						collsno[collptr++] = ob;
					}
				}
			}

			hitpln(ob);
			scorepln(ob, ttype);
			return;
		}
		case OBTYPE.BIRD: {
			ob.ob_life = scorepenalty(ttype, obt, 25) ? -1 : -2;
			return;
		}
		case OBTYPE.FLOCK: {
			if (
				ttype !== OBTYPE.FLOCK &&
				ttype !== OBTYPE.BIRD &&
				ob.ob_state === OBSTATE.FLYING
			) {
				for (let i = 0; i < 8; i++) initbird(ob, i);
				ob.ob_life = -1;
				ob.ob_state = OBSTATE.FINISHED;
			}
			return;
		}
		case OBTYPE.OX: {
			if (ob.ob_state !== OBSTATE.STANDING) return;
			if (ttype === OBTYPE.EXPLOSION || ttype === OBTYPE.STARBURST) return;
			scorepenalty(ttype, obt, 200);
			ob.ob_state = OBSTATE.FINISHED;
			return;
		}
		default:
			return;
	}
}

// Walk the X-sorted object list looking for bbox overlaps; pixel-test
// each candidate pair via CollisionTest. Mirrors src/swcollsn.c:513.
function tstcrash(obp) {
	const sym = obp.ob_symbol;
	if (!sym) return;
	const ground = state.ground;
	for (let x = 0; x < sym.w; x++) {
		const gx = obp.ob_x + x;
		if (gx < 0 || gx >= ground.length) continue;
		const y = obp.ob_y - ground[gx];
		if (y >= sym.h) continue;
		if (y < 0 || sym.data[y * sym.w + x]) {
			if (killptr < KILL_BUF) {
				killed[killptr] = obp;
				killer[killptr] = null;
				killptr++;
			}
			return;
		}
	}
}

export function swcollsn() {
	collptr = 0;
	killptr = 0;
	collxadj = 2;
	collyadj = 1;
	if (state.countmove & 1) {
		collxadj = -collxadj;
		collyadj = -collyadj;
	}

	const ground = state.ground;
	for (let ob = topobj.ob_xnext; ob && ob !== botobj; ob = ob.ob_xnext) {
		const sym = ob.ob_symbol;
		if (!sym) continue;
		const xmax = ob.ob_x + sym.w - 1;
		const ymax = ob.ob_y;
		const ymin = ymax - sym.h + 1;

		for (
			let obp = ob.ob_xnext;
			obp && obp !== botobj && obp.ob_x <= xmax;
			obp = obp.ob_xnext
		) {
			if (!obp.ob_symbol) continue;
			if (
				obp.ob_y >= ymin &&
				obp.ob_y - obp.ob_symbol.h + 1 <= ymax &&
				CollisionTest(ob, obp) &&
				killptr < KILL_BUF - 1
			) {
				killed[killptr] = ob;
				killer[killptr] = obp;
				killptr++;
				killed[killptr] = obp;
				killer[killptr] = ob;
				killptr++;
			}
		}

		const ot = ob.ob_type;
		if (ground) {
			const groundLen = ground.length;
			const xCenter = ob.ob_x + 8;
			const xCenterB = ob.ob_x + 4;
			if (
				(ot === OBTYPE.PLANE &&
					ob.ob_state !== OBSTATE.FINISHED &&
					ob.ob_state !== OBSTATE.WAITING &&
					xCenter >= 0 &&
					xCenter < groundLen &&
					ob.ob_y < ground[xCenter] + 24) ||
				((ot === OBTYPE.BOMB || ot === OBTYPE.MISSILE) &&
					xCenterB >= 0 &&
					xCenterB < groundLen &&
					ob.ob_y < ground[xCenterB] + 12)
			) {
				tstcrash(ob);
			}
		}
	}

	for (let i = 0; i < killptr; i++) {
		swkill(killed[i], killer[i]);
		killed[i] = null;
		killer[i] = null;
	}

	for (let i = 0; i < collptr; i++) {
		const ob = collsno[i];
		ob.ob_dx = collsdx[i];
		ob.ob_dy = collsdy[i];
		collsno[i] = null;
	}
}
