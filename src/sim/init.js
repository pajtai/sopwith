// Object spawn helpers + level setup. Ported from src/swinit.c.
//
// Phase 6 scope: enough to spawn a player plane, a computer plane, and
// the static targets/balloons/oxen, plus the per-tic spawners used by
// movers (initshot/initbomb/initmiss/initburst/initexpl/initsmok).

import {
	ANGLES,
	BOMBLIFE,
	BULLIFE,
	BULSPEED,
	BURSTLIFE,
	EXPLLIFE,
	FALLCOUNT,
	FLOCKLIFE,
	BIRDLIFE,
	MISSLIFE,
	MAXBOMBS,
	MAXBURSTS,
	MAXMISSILES,
	MAXROUNDS,
	MAXFUEL,
	MAXCRASH,
	MAX_PLANES,
	MAX_Y,
	MIN_SPEED,
	MAX_SPEED,
	NUM_STRAY_BIRDS,
	SIN,
	COS,
} from "./constants.js";
import {
	OBSTATE,
	OBTYPE,
	OBENDSTATUS,
	PLAYMODE,
	FACTION,
	createObject,
} from "./types.js";
import { state, topobj, botobj } from "./state.js";
import {
	allocobj,
	deallobj,
	insertx,
	deletex,
	setdxdy,
	movexy,
	copyobj,
} from "./object.js";
import { symbols } from "./symbols.js";
import {
	moveplyr,
	movecomp,
	moveshot,
	movebomb,
	movemiss,
	moveburst,
	movetarg,
	movepowerup,
	moveexpl,
	movesmok,
	moveflck,
	moveballoon,
	movebird,
	moveox,
	moverefs,
} from "./move.js";
import { CollisionTest, scorepln } from "./collision.js";
import { initsound } from "./sound.js";
import { in_range, clamp_min, clamp_max, clamp_range, imin, imax } from "./util.js";
import { bindMoverefs } from "./auto.js";
import { swclearsplats } from "./splat.js";

function initobjs() {
	topobj.ob_xnext = topobj.ob_next = botobj;
	botobj.ob_xprev = botobj.ob_prev = topobj;
	topobj.ob_x = -32767;
	botobj.ob_x = 32767;
	state.objbot = state.objtop = state.deltop = state.delbot = null;
	state.objfree = null;
}

export function initgrnd() {
	const src = state.currgame.gm_ground;
	state.ground = new Int32Array(src.length);
	state.ground.set(src);
}

export function initpln(obp, orig) {
	let ob;
	if (!obp) {
		ob = allocobj();
		ob.ob_original_ob = orig;
		state.planes[state.num_planes++] = ob;
	} else {
		ob = obp;
	}

	ob.ob_type = OBTYPE.PLANE;
	ob.ob_x = ob.ob_original_ob.x;
	const minx = ob.ob_x;
	const maxx = ob.ob_x + 20;
	const groundLen = state.ground.length;
	let height = 0;
	for (let x = minx; x <= maxx && x < groundLen; x++) {
		height = imax(height, state.ground[x]);
	}
	ob.ob_y = height + 13;
	ob.ob_orig_y = ob.ob_y;

	ob.ob_lx = ob.ob_ly = ob.ob_speed = ob.ob_flaps = ob.ob_accel =
		ob.ob_hitcount = ob.ob_bdelay = ob.ob_mdelay = ob.ob_bsdelay = 0;
	setdxdy(ob, 0, 0);
	ob.ob_orient = ob.ob_original_ob.orient;
	ob.ob_angle = ob.ob_orient ? ANGLES / 2 : 0;
	ob.ob_target = ob.ob_missiletarget = null;
	ob.ob_firing = ob.ob_mfiring = null;
	ob.ob_bombing = ob.ob_bfiring = ob.ob_home = false;
	ob.ob_symbol = symbols.symbol_plane[0].sym[ob.ob_orient ? 4 : 0];
	ob.ob_athome = true;
	ob.ob_onmap = true;
	ob.ob_flightscore.combatwound = false;

	if (!obp || ob.ob_state === OBSTATE.CRASHED) {
		ob.ob_rounds = MAXROUNDS;
		ob.ob_bombs = MAXBOMBS;
		ob.ob_missiles = MAXMISSILES;
		ob.ob_bursts = MAXBURSTS;
		ob.ob_life = MAXFUEL;
	}
	if (!obp) {
		ob.ob_endsts = OBENDSTATUS.PLAYING;
		ob.ob_target = null;
		insertx(ob, topobj);
	} else {
		insertx(ob, deletex(ob));
	}

	ob.ob_state = OBSTATE.FLYING;
	ob.ob_goingsun = false;
	return ob;
}

export function initplyr(obp, orig) {
	const ob = initpln(obp, orig);
	if (!obp) {
		ob.ob_movef = moveplyr;
		ob.ob_faction = ob.ob_original_ob.faction;
		ob.ob_clr = ob.ob_faction;
		state.endcount = 0;
		ob.ob_plrnum = state.num_players++;
		if (ob.ob_plrnum === state.player) state.consoleplayer = ob;
	}
}

export function initcomp(obp, orig) {
	const ob = initpln(obp, orig);
	if (!obp) {
		ob.ob_movef = movecomp;
		ob.ob_faction = FACTION.PLAYER2;
		ob.ob_clr = ob.ob_faction;
	}
	if (state.playmode === PLAYMODE.SINGLE || state.playmode === PLAYMODE.NOVICE) {
		ob.ob_state = OBSTATE.FINISHED;
		ob.ob_onmap = false;
		deletex(ob);
	}
}

function isrange(x, y, ax, ay) {
	let dx = Math.abs(x - ax);
	let dy = Math.abs(y - ay);
	dy += dy >> 1;
	if (dx > 100 || dy > 100) return -1;
	if (dx < dy) { const t = dx; dx = dy; dy = t; }
	return Math.floor((7 * dx + 4 * dy) / 8);
}

function AdjustBullet(bullet, src) {
	const next_src = createObject();
	const next_bullet = createObject();
	copyobj(next_src, src);
	movexy(next_src);
	for (;;) {
		copyobj(next_bullet, bullet);
		movexy(next_bullet);
		if (!CollisionTest(next_bullet, next_src)) return;
		if (bullet.ob_dx < 0) bullet.ob_x -= 2; else bullet.ob_x += 2;
		if (bullet.ob_dy < 0) bullet.ob_y -= 2; else bullet.ob_y += 2;
	}
}

export function initshot(obo, targ) {
	if (!targ && !state.compplane && !obo.ob_rounds) return;
	const ob = allocobj();
	if (!ob) return;

	if (state.playmode !== PLAYMODE.NOVICE) obo.ob_rounds--;

	const bspeed = BULSPEED + state.gamenum;

	if (targ) {
		const x = targ.ob_x + (targ.ob_dx << 2);
		const y = targ.ob_y + (targ.ob_dy << 2);
		const dx = x - obo.ob_x;
		const dy = y - obo.ob_y;
		const r = isrange(x, y, obo.ob_x, obo.ob_y);
		if (r < 1) { deallobj(ob); return; }
		ob.ob_dx = Math.trunc((dx * bspeed) / r);
		ob.ob_dy = Math.trunc((dy * bspeed) / r);
		ob.ob_ldx = ob.ob_ldy = 0;
	} else {
		const nspeed = obo.ob_speed + bspeed;
		const nangle = obo.ob_angle;
		setdxdy(ob, nspeed * COS(nangle), nspeed * SIN(nangle));
	}

	ob.ob_type = OBTYPE.SHOT;
	ob.ob_x = obo.ob_x + Math.floor(obo.ob_symbol.w / 2);
	ob.ob_y = obo.ob_y - Math.floor(obo.ob_symbol.h / 2);
	ob.ob_lx = obo.ob_lx;
	ob.ob_ly = obo.ob_ly;
	ob.ob_life = BULLIFE;
	ob.ob_owner = obo;
	ob.ob_clr = obo.ob_clr;
	ob.ob_symbol = symbols.symbol_pixel;
	ob.ob_soundf = null;
	ob.ob_movef = moveshot;
	ob.ob_speed = 0;

	if (obo.ob_type === OBTYPE.BALLOON) ob.ob_y -= 4;

	AdjustBullet(ob, obo);
	insertx(ob, obo);
}

export function initbomb(obo) {
	if ((!state.compplane && !obo.ob_bombs) || obo.ob_bdelay) return;
	const ob = allocobj();
	if (!ob) return;

	if (state.playmode !== PLAYMODE.NOVICE) obo.ob_bombs--;
	obo.ob_bdelay = 10;
	ob.ob_type = OBTYPE.BOMB;
	ob.ob_state = OBSTATE.FALLING;
	ob.ob_dx = obo.ob_dx;
	ob.ob_dy = obo.ob_dy;
	ob.ob_onmap = true;

	let angle;
	if (obo.ob_orient) angle = (obo.ob_angle + ANGLES / 4) % ANGLES;
	else angle = (obo.ob_angle + (3 * ANGLES) / 4) % ANGLES;

	ob.ob_x = obo.ob_x + ((COS(angle) * 10) >> 8) + 4;
	ob.ob_y = obo.ob_y + ((SIN(angle) * 10) >> 8) - 4;
	ob.ob_lx = ob.ob_ly = ob.ob_ldx = ob.ob_ldy = 0;
	ob.ob_life = BOMBLIFE;
	ob.ob_owner = obo;
	ob.ob_clr = obo.ob_clr;
	ob.ob_symbol = symbols.symbol_bomb[0].sym[0];
	ob.ob_movef = movebomb;

	insertx(ob, obo);
}

export function initmiss(obo) {
	if (obo.ob_mdelay || !obo.ob_missiles || !state.conf_missiles) return;
	const ob = allocobj();
	if (!ob) return;

	if (state.playmode !== PLAYMODE.NOVICE) obo.ob_missiles--;
	obo.ob_mdelay = 5;

	ob.ob_type = OBTYPE.MISSILE;
	ob.ob_state = OBSTATE.FLYING;

	const angle = ob.ob_angle = obo.ob_angle;
	ob.ob_x = obo.ob_x + (COS(angle) >> 4) + 4;
	ob.ob_y = obo.ob_y + (SIN(angle) >> 4) - 4;
	ob.ob_lx = ob.ob_ly = 0;
	const nspeed = state.gmaxspeed + (state.gmaxspeed >> 1);
	ob.ob_speed = nspeed;
	setdxdy(ob, nspeed * COS(angle), nspeed * SIN(angle));

	ob.ob_life = MISSLIFE;
	ob.ob_owner = obo;
	ob.ob_clr = obo.ob_clr;
	ob.ob_symbol = symbols.symbol_missile[0].sym[0];
	ob.ob_soundf = null;
	ob.ob_movef = movemiss;
	ob.ob_missiletarget = obo.ob_mfiring;
	ob.ob_orient = ob.ob_accel = ob.ob_flaps = 0;
	ob.ob_onmap = true;

	insertx(ob, obo);
}

export function initburst(obo) {
	if (obo.ob_bsdelay || !obo.ob_bursts || !state.conf_missiles) return;
	const ob = allocobj();
	if (!ob) return;
	ob.ob_bsdelay = 5;
	if (state.playmode !== PLAYMODE.NOVICE) obo.ob_bursts--;

	ob.ob_type = OBTYPE.STARBURST;
	ob.ob_state = OBSTATE.FALLING;

	let angle;
	if (obo.ob_orient) angle = (obo.ob_angle + (3 * ANGLES) / 8) % ANGLES;
	else angle = (obo.ob_angle + (5 * ANGLES) / 8) % ANGLES;

	setdxdy(ob, state.gminspeed * COS(angle), state.gminspeed * SIN(angle));
	ob.ob_dx += obo.ob_dx;
	ob.ob_dy += obo.ob_dy;

	ob.ob_x = obo.ob_x + ((COS(angle) * 10) >> 10) + 4;
	ob.ob_y = obo.ob_y + ((SIN(angle) * 10) >> 10) - 4;
	ob.ob_lx = ob.ob_ly = 0;
	ob.ob_life = BURSTLIFE;
	ob.ob_owner = obo;
	ob.ob_clr = obo.ob_clr;
	ob.ob_symbol = symbols.symbol_burst[0].sym[0];
	ob.ob_soundf = null;
	ob.ob_movef = moveburst;

	insertx(ob, obo);
}

function AddPlayerTarget(ob, orig) {
	switch (orig.faction) {
		case FACTION.NONE:
			ob.ob_faction = FACTION.NONE;
			break;
		case FACTION.PLAYER1:
		case FACTION.PLAYER5:
		case FACTION.PLAYER7:
			ob.ob_faction = FACTION.PLAYER1;
			break;
		case FACTION.PLAYER2:
		case FACTION.PLAYER4:
		case FACTION.PLAYER6:
		case FACTION.PLAYER8:
			ob.ob_faction = FACTION.PLAYER2;
			break;
		case FACTION.PLAYER3:
			ob.ob_faction = state.playmode === PLAYMODE.ASYNCH ? FACTION.PLAYER1 : FACTION.PLAYER2;
			break;
		default:
			ob.ob_faction = FACTION.NONE;
	}
	state.numtarg[ob.ob_faction]++;
}

function Flatten(minx, maxx, headroom) {
	let minh = 999;
	let maxh = 0;
	const g = state.ground;
	for (let x = minx; x <= maxx; x++) {
		minh = imin(minh, g[x]);
		maxh = imax(maxh, g[x]);
	}
	let aveh = (minh + maxh) >> 1;
	aveh = clamp_max(aveh, MAX_Y - headroom - 1);
	for (let x = minx; x <= maxx; x++) g[x] = aveh;
	return aveh;
}

function inittarget(orig) {
	const ob = allocobj();
	ob.ob_symbol = symbols.symbol_targets[orig.orient].sym[0];
	ob.ob_x = orig.x;
	ob.ob_y = Flatten(ob.ob_x, ob.ob_x + ob.ob_symbol.w - 1, ob.ob_symbol.h) + ob.ob_symbol.h;
	ob.ob_dx = ob.ob_dy = ob.ob_lx = ob.ob_ly = ob.ob_ldx = ob.ob_ldy = ob.ob_angle = ob.ob_hitcount = 0;
	ob.ob_type = OBTYPE.TARGET;
	ob.ob_state = OBSTATE.STANDING;
	ob.ob_orient = orig.orient;
	AddPlayerTarget(ob, orig);
	ob.ob_clr = ob.ob_faction;
	ob.ob_movef = movetarg;
	ob.ob_onmap = true;
	return ob;
}

function initpowerup(orig) {
	const ob = allocobj();
	ob.ob_symbol = symbols.symbol_powerups[orig.orient].sym[0];
	ob.ob_x = orig.x;
	ob.ob_y = Flatten(ob.ob_x, ob.ob_x + ob.ob_symbol.w - 1, ob.ob_symbol.h) + ob.ob_symbol.h;
	ob.ob_dx = ob.ob_dy = ob.ob_lx = ob.ob_ly = ob.ob_ldx = ob.ob_ldy = ob.ob_angle = ob.ob_hitcount = 0;
	ob.ob_type = OBTYPE.POWERUP;
	ob.ob_state = OBSTATE.STANDING;
	ob.ob_orient = orig.orient;
	ob.ob_clr = FACTION.PLAYER1;
	ob.ob_movef = movepowerup;
	ob.ob_onmap = false;
	return ob;
}

function TargetExplosionSize(target_type) {
	const s = symbols.symbol_target_hit[target_type].sym[0];
	let n = 0;
	for (let i = 0; i < s.w * s.h; i++) if (s.data[i] !== 0) n++;
	return clamp_range(10, n, 64);
}

function ApplySpriteSizeOffset(ob, obo, angle) {
	const rangex = clamp_min(obo.ob_symbol.w, 16) - 16;
	const rangey = clamp_min(obo.ob_symbol.h, 16) - 16;
	ob.ob_x += Math.floor((COS(angle) * rangex) / (256 * 2));
	ob.ob_y += Math.floor((SIN(angle) * rangey) / (256 * 2));
	ob.ob_y -= rangey;
}

function IsExplosive(ob) {
	if (ob.ob_type === OBTYPE.TARGET) {
		return ob.ob_orient === 2 || ob.ob_orient === 5 || ob.ob_orient === 12 || ob.ob_orient === 17;
	}
	if (ob.ob_type === OBTYPE.POWERUP) {
		return ob.ob_orient === 2 || ob.ob_orient === 5;
	}
	return false;
}

export function initexpl(obo, small) {
	const obox = obo.ob_x + Math.floor(obo.ob_symbol.w / 2);
	const oboy = obo.ob_y + Math.floor(obo.ob_symbol.h / 2);
	const obodx = obo.ob_dx >> 2;
	const obody = obo.ob_dy >> 2;
	const oboclr = obo.ob_clr;
	const obotype = obo.ob_type;

	let ic;
	let speed;
	if (IsExplosive(obo)) {
		ic = 1;
		speed = state.conf_big_explosions ? state.gminspeed + 4 : state.gminspeed;
	} else {
		speed = state.gminspeed >> ((state.explseed & 7) !== 7 ? 1 : 0);
		if (small) ic = 6;
		else if (obotype === OBTYPE.TARGET) ic = Math.floor(110 / TargetExplosionSize(obo.ob_orient));
		else ic = 2;
	}

	let mansym = obotype === OBTYPE.PLANE && (obo.ob_state === OBSTATE.FLYING || obo.ob_state === OBSTATE.WOUNDED);

	for (let i = 1; i <= 15; i += ic) {
		const ob = allocobj();
		if (!ob) return;
		ob.ob_type = OBTYPE.EXPLOSION;
		setdxdy(ob, COS(i) * speed, SIN(i) * speed);
		ob.ob_dx += obodx;
		ob.ob_dy += obody;
		ob.ob_x = obox + ob.ob_dx;
		ob.ob_y = oboy + ob.ob_dy;
		ApplySpriteSizeOffset(ob, obo, i);

		state.explseed = (state.explseed * ob.ob_x * ob.ob_y) | 0;
		state.explseed = (state.explseed + 7491) | 0;
		if (!state.explseed) state.explseed = 74917777;

		ob.ob_life = EXPLLIFE;
		let orient = (state.explseed & 0x01c0) >> 6;
		ob.ob_orient = orient;
		if (mansym && (!orient || orient === 7)) {
			orient = 0;
			ob.ob_orient = 0;
			mansym = false;
			ob.ob_dx = obodx;
			ob.ob_dy = -state.gminspeed;
		}
		ob.ob_lx = ob.ob_ly = ob.ob_hitcount = ob.ob_speed = 0;
		ob.ob_owner = obo;
		ob.ob_clr = oboclr;
		ob.ob_symbol = symbols.symbol_debris[0].sym[0];
		ob.ob_movef = moveexpl;
		if (orient) initsound(ob, /*S_EXPLOSION*/ 6);
		insertx(ob, obo);
	}
}

export function initsmok(obo) {
	const ob = allocobj();
	if (!ob) return;
	ob.ob_type = OBTYPE.SMOKE;
	ob.ob_x = obo.ob_x + 8;
	ob.ob_y = obo.ob_y - 8;
	ob.ob_dx = obo.ob_dx;
	ob.ob_dy = obo.ob_dy;
	ob.ob_lx = ob.ob_ly = ob.ob_ldx = ob.ob_ldy = 0;
	ob.ob_life = 10; // SMOKELIFE
	ob.ob_owner = obo;
	ob.ob_soundf = null;
	ob.ob_movef = movesmok;
	ob.ob_clr = obo.ob_clr;
}

export function initbird(obo, i) {
	const ibx = [8, 3, 0, 6, 7, 14, 10, 12];
	const iby = [16, 1, 8, 3, 12, 10, 7, 14];
	const ibdx = [-2, 2, -3, 3, -1, 1, 0, 0];
	const ibdy = [-1, -2, -1, -2, -1, -2, -1, -2];
	const ob = allocobj();
	if (!ob) return;
	ob.ob_type = OBTYPE.BIRD;
	ob.ob_x = obo.ob_x + ibx[i];
	ob.ob_y = obo.ob_y - iby[i];
	ob.ob_dx = ibdx[i];
	ob.ob_dy = ibdy[i];
	ob.ob_orient = ob.ob_lx = ob.ob_ly = ob.ob_ldx = ob.ob_ldy = 0;
	ob.ob_life = BIRDLIFE;
	ob.ob_faction = obo.ob_faction;
	ob.ob_symbol = symbols.symbol_bird[0].sym[0];
	ob.ob_soundf = null;
	ob.ob_movef = movebird;
	ob.ob_clr = obo.ob_clr;
	insertx(ob, topobj);
}

function initflock(orig) {
	if (state.playmode === PLAYMODE.NOVICE || !state.conf_animals) return null;
	const ob = allocobj();
	if (!ob) return null;
	ob.ob_type = OBTYPE.FLOCK;
	ob.ob_state = OBSTATE.FLYING;
	ob.ob_x = orig.x;
	ob.ob_y = MAX_Y - 1;
	ob.ob_dx = ob.ob_x < state.currgame.gm_max_x / 2 ? 2 : -2;
	ob.ob_dy = ob.ob_lx = ob.ob_ly = ob.ob_ldx = ob.ob_ldy = 0;
	ob.ob_orient = 0;
	ob.ob_life = FLOCKLIFE;
	ob.ob_faction = FACTION.NONE;
	ob.ob_symbol = symbols.symbol_flock[0].sym[0];
	ob.ob_soundf = null;
	ob.ob_movef = moveflck;
	ob.ob_clr = 1;
	ob.ob_onmap = true;
	for (let j = 0; j < NUM_STRAY_BIRDS; j++) initbird(ob, 1);
	return ob;
}

function initballoon(orig) {
	const ob = allocobj();
	if (!ob) return null;
	ob.ob_type = OBTYPE.BALLOON;
	ob.ob_state = OBSTATE.FLYING;
	ob.ob_life = 1;
	ob.ob_x = orig.x;
	ob.ob_y = MAX_Y - 16 + Math.floor(SIN(orig.x) / 32);
	ob.ob_dx = 0;
	ob.ob_dy = 0;
	ob.ob_orient = 0;
	ob.ob_symbol = symbols.symbol_balloon[0].sym[0];
	ob.ob_soundf = null;
	ob.ob_movef = moveballoon;
	ob.ob_faction = orig.faction;
	ob.ob_clr = ob.ob_faction;
	ob.ob_onmap = true;
	AddPlayerTarget(ob, orig);
	return ob;
}

function initox(orig) {
	if (state.playmode === PLAYMODE.NOVICE || !state.conf_animals) return null;
	const ob = allocobj();
	if (!ob) return null;
	ob.ob_type = OBTYPE.OX;
	ob.ob_state = OBSTATE.STANDING;
	ob.ob_x = orig.x;
	ob.ob_y = state.ground[ob.ob_x] + 16;
	ob.ob_orient = ob.ob_lx = ob.ob_ly = ob.ob_ldx = ob.ob_ldy = ob.ob_dx = ob.ob_dy = 0;
	ob.ob_faction = FACTION.NONE;
	ob.ob_symbol = symbols.symbol_ox[0].sym[orig.transform];
	ob.ob_soundf = null;
	ob.ob_movef = moveox;
	ob.ob_clr = 1;
	return ob;
}

function inittargets() {
	state.numtarg.fill(0);
	for (let i = 0; i < state.currgame.gm_num_objects; i++) {
		const orig = state.currgame.gm_objects[i];
		let ob = null;
		switch (orig.type) {
			case OBTYPE.TARGET: ob = inittarget(orig); break;
			case OBTYPE.OX: ob = initox(orig); break;
			case OBTYPE.FLOCK: ob = initflock(orig); break;
			case OBTYPE.BALLOON: ob = initballoon(orig); break;
			case OBTYPE.POWERUP: ob = initpowerup(orig); break;
			default: continue;
		}
		if (ob !== null) {
			ob.ob_original_ob = orig;
			insertx(ob, topobj);
		}
	}
}

function initgdep() {
	state.gmaxspeed = MAX_SPEED + state.gamenum;
	state.gminspeed = MIN_SPEED + state.gamenum;
	let r = 150;
	if (state.gamenum < 6) r -= 15 * (6 - state.gamenum);
	state.targrnge = r * r;
}

// Reset display state — Phase 8 placeholder.
function initdisp(_reset) { swclearsplats(); }

// Restart current level on death — Phase 8 will replace with full
// title-screen flow. For now we just rebuild the level.
export function swrestart() {
	state.restart_flag = true;
}

export function swend(_score, _high) {
	state.restart_flag = true;
}

function loser(ob) { ob.ob_endsts = OBENDSTATUS.LOSER; state.endcount = 30; }
function winner(ob) { ob.ob_endsts = OBENDSTATUS.WINNER; state.endcount = 30; }

// Wire all init helpers into move.js's late-bound dispatch table.
export function bindMoverefsAll() {
	bindMoverefs();
	moverefs.initshot = initshot;
	moverefs.initbomb = initbomb;
	moverefs.initmiss = initmiss;
	moverefs.initburst = initburst;
	moverefs.initsmok = initsmok;
	moverefs.initplyr = initplyr;
	moverefs.initcomp = initcomp;
	moverefs.initpln = initpln;
	moverefs.initdisp = initdisp;
	moverefs.scorepln = scorepln;
	moverefs.loser = loser;
	moverefs.winner = winner;
	moverefs.swrestart = swrestart;
	moverefs.swend = swend;
	moverefs.hitpln = (ob) => {
		ob.ob_ldx = 0;
		ob.ob_ldy = 0;
		ob.ob_hitcount = FALLCOUNT;
		ob.ob_state = OBSTATE.FALLING;
		ob.ob_athome = false;
		return true;
	};
}

// Build a level from state.currgame. Mirrors `swinitlevel` in
// src/swinit.c:1069. Caller must set state.playmode and state.gamenum
// first.
export function swinitlevel() {
	bindMoverefsAll();
	swclearsplats();
	initgrnd();
	initobjs();

	state.num_players = 0;
	state.num_planes = 0;
	state.planes.fill(null);

	let player1_ob = null;
	let player2_ob = null;
	const orig_planes = [];
	for (let i = 0; i < state.currgame.gm_num_objects; i++) {
		const plane = state.currgame.gm_objects[i];
		if (plane.type !== OBTYPE.PLANE) continue;
		if (state.playmode === PLAYMODE.ASYNCH && plane.faction > FACTION.PLAYER2) continue;
		if (plane.faction > FACTION.PLAYER4) continue;
		orig_planes.push(plane);
		if (player1_ob === null && plane.faction === FACTION.PLAYER1) player1_ob = plane;
		if (player2_ob === null && plane.faction === FACTION.PLAYER2) player2_ob = plane;
	}
	if (!player1_ob) {
		throw new Error("mission has no PLAYER1 plane");
	}
	if (state.keydelay === -1) state.keydelay = 1;

	initplyr(null, player1_ob);

	if (state.playmode === PLAYMODE.ASYNCH) {
		state.maxcrash = MAXCRASH * 2;
		if (!player2_ob) throw new Error("ASYNCH mission has no PLAYER2 plane");
		initplyr(null, player2_ob);
	} else {
		state.maxcrash = MAXCRASH;
		player2_ob = null;
	}

	for (const op of orig_planes) {
		if (op !== player1_ob && op !== player2_ob) initcomp(null, op);
	}

	inittargets();
	initdisp(false);
	initgdep();

	state.countmove = 0;
	state.successful_flight = false;
	state.last_ground_time = 0;
}
