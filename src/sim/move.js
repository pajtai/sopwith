// Per-type movers ported from src/swmove.c.
//
// Each mover takes a single OBJECTS record, advances it one tic, and
// returns a "should be drawn this frame" flag (the C `ob_drwflg`).
// `swmove()` is the dispatch loop — it calls the per-object `ob_movef`
// function pointer to run the right mover for that object's type.

import {
	ANGLES,
	MAX_Y,
	MAX_THROTTLE,
	BULLIFE,
	BULSPEED,
	BOMBLIFE,
	MISSLIFE,
	BURSTLIFE,
	EXPLLIFE,
	SMOKELIFE,
	BIRDLIFE,
	FLOCKLIFE,
	FALLCOUNT,
	STALLCOUNT,
	MAXCRASH,
	MAXCRCOUNT,
	SAFERESET,
	MAXFUEL,
	MAXROUNDS,
	MAXBOMBS,
	MAXMISSILES,
	MAXBURSTS,
	K_ACCEL,
	K_DEACC,
	K_FLAPU,
	K_FLAPD,
	K_FLIP,
	K_SHOT,
	K_BOMB,
	K_HOME,
	K_SOUND,
	K_BREAK,
	K_MISSILE,
	K_STARBURST,
	K_HARRYKEYS,
	MAX_NET_LAG,
	FPS,
	SIN,
	COS,
} from "./constants.js";
import { OBSTATE, OBTYPE, PLAYMODE, OBENDSTATUS } from "./types.js";
import { state } from "./state.js";
import {
	movexy,
	setdxdy,
	updateobjpos,
	deallobj,
	PlaneIsKilled,
	PlaneIsStalled,
	PlaneIsWounded,
	PlaneIsFlying,
} from "./object.js";
import { symbols } from "./symbols.js";
import { sound, initsound, stopsound, swsound, SOUND } from "./sound.js";
import { in_range, clamp_max, clamp_min } from "./util.js";

// Flight-skill threshold from src/swmove.c:31.
const SUCCESSFUL_FLIGHT_TIME = 8 * FPS;

// Function refs are populated by init.js so we don't import a cycle.
export const moverefs = {
	gohome: null,
	swauto: null,
	initshot: null,
	initbomb: null,
	initmiss: null,
	initburst: null,
	initsmok: null,
	initplyr: null,
	initcomp: null,
	initdisp: null,
	scorepln: null,
	loser: null,
	winner: null,
	swrestart: null,
	swend: null,
	ctlbreak: () => false,
	hitpln: null,
};

// Pick angle index 0..7 from a (dx, dy) pair (src/swmove.c:127).
function symangle(ob) {
	const dx = ob.ob_dx;
	const dy = ob.ob_dy;
	if (dx === 0) {
		if (dy < 0) return 6;
		if (dy > 0) return 2;
		return 6;
	}
	if (dx > 0) {
		if (dy < 0) return 7;
		if (dy > 0) return 1;
		return 0;
	}
	if (dy < 0) return 5;
	if (dy > 0) return 3;
	return 4;
}

// `topup` (src/swmove.c:101): refuel/rearm gauges over time.
function topup(ob, field, max) {
	if (ob[field] === max) return;
	if (max < 20) {
		if (state.countmove % 20 === 0) ob[field]++;
	} else {
		ob[field] += Math.floor(max / 100);
	}
	ob[field] = clamp_max(ob[field], max);
}

function refuel(ob) {
	topup(ob, "ob_life", MAXFUEL);
	topup(ob, "ob_rounds", MAXROUNDS);
	topup(ob, "ob_bombs", MAXBOMBS);
	topup(ob, "ob_missiles", MAXMISSILES);
	topup(ob, "ob_bursts", MAXBURSTS);
}

function PlaneSoundCallback(ob) {
	if (ob.ob_firing) {
		sound(SOUND.S_SHOT, 0, ob);
		return;
	}
	switch (ob.ob_state) {
		case OBSTATE.FALLING:
			if (ob.ob_dy >= 0) sound(SOUND.S_HIT, 0, ob);
			else sound(SOUND.S_FALLING, ob.ob_y, ob);
			break;
		case OBSTATE.FLYING:
			sound(SOUND.S_PLANE, -ob.ob_speed, ob);
			break;
		case OBSTATE.STALLED:
		case OBSTATE.WOUNDED:
		case OBSTATE.WOUNDSTALL:
			sound(SOUND.S_HIT, 0, ob);
			break;
	}
}

// Find a plane targeting candidate (src/swmove.c:71). Pulls in any
// flying plane of a different faction that's the closest target for
// the candidate computer plane.
function nearpln(ob) {
	const obx = ob.ob_x;
	for (let obt = state.objtop; obt !== null; obt = obt.ob_next) {
		if (obt.ob_type !== OBTYPE.PLANE || obt.ob_faction === ob.ob_faction) {
			continue;
		}
		// movecomp is a function — compare by reference.
		if (obt.ob_movef === movecomp) {
			if (
				state.playmode !== PLAYMODE.COMPUTER ||
				in_range(
					obt.ob_original_ob.territory_l,
					obx,
					obt.ob_original_ob.territory_r,
				)
			) {
				const obc = obt.ob_target;
				if (!obc || Math.abs(obx - obt.ob_x) < Math.abs(obc.ob_x - obt.ob_x)) {
					obt.ob_target = ob;
				}
			}
		}
	}
}

// Player input dispatch (src/swmove.c:250).
function interpret(ob, key) {
	ob.ob_flaps = 0;
	ob.ob_bombing = false;
	ob.ob_bfiring = false;
	ob.ob_mfiring = null;
	ob.ob_firing = null;

	let st = ob.ob_state;
	const FINISHED = OBSTATE.FINISHED;

	if (PlaneIsKilled(st) && st !== OBSTATE.FALLING) return;

	if (st !== OBSTATE.FALLING) {
		if (state.endstat) {
			if (state.endstat === OBENDSTATUS.LOSER && state.plyrplane && moverefs.gohome) {
				moverefs.gohome(ob);
			}
			return;
		}

		if (key & K_BREAK) {
			ob.ob_life = -5000; // QUIT
			ob.ob_home = false;
			if (ob.ob_athome) {
				ob.ob_state = st = OBSTATE.CRASHED;
				ob.ob_hitcount = 0;
			}
			if (state.plyrplane) state.quit = true;
		}

		if (key & K_HOME) {
			if (st === OBSTATE.FLYING || st === OBSTATE.WOUNDED) {
				ob.ob_home = true;
			}
		}
	}

	if (!PlaneIsWounded(st) || (state.countmove & 1) !== 0) {
		if (key & K_FLAPU) { ob.ob_flaps++; ob.ob_home = false; }
		if (key & K_FLAPD) { ob.ob_flaps--; ob.ob_home = false; }
		if ((key & K_FLIP) && !ob.ob_athome) {
			ob.ob_orient = ob.ob_orient ? 0 : 1;
			ob.ob_home = false;
		}
		if (key & K_DEACC) {
			if (ob.ob_accel) ob.ob_accel--;
			ob.ob_home = false;
		}
		if (key & K_ACCEL) {
			if (ob.ob_accel < MAX_THROTTLE) ob.ob_accel++;
			ob.ob_home = false;
		}
	}

	if ((key & K_SHOT) && st < FINISHED) ob.ob_firing = ob;
	if ((key & K_MISSILE) && st < FINISHED) ob.ob_mfiring = ob;
	if ((key & K_BOMB) && st < FINISHED) ob.ob_bombing = true;
	if ((key & K_STARBURST) && st < FINISHED) ob.ob_bfiring = true;

	if (key & K_SOUND) {
		if (state.plyrplane) {
			if (state.soundflg) {
				sound(0, 0, null);
				swsound();
			}
			state.soundflg = !state.soundflg;
		}
	}

	if (ob.ob_home && moverefs.gohome) moverefs.gohome(ob);
}

const gravity = [0, -1, -2, -3, -4, -3, -2, -1, 0, 1, 2, 3, 4, 3, 2, 1];

function stallpln(ob) {
	ob.ob_ldx = 0;
	ob.ob_ldy = 0;
	ob.ob_orient = 0;
	ob.ob_dx = 0;
	ob.ob_angle = (7 * ANGLES) / 8;
	ob.ob_speed = 0;
	ob.ob_dy = 0;
	ob.ob_hitcount = STALLCOUNT;
	ob.ob_state = ob.ob_state === OBSTATE.WOUNDED ? OBSTATE.WOUNDSTALL : OBSTATE.STALLED;
	ob.ob_athome = false;
	return true;
}

function selectPlaneSymbol(ob) {
	const sPlane = symbols.symbol_plane;
	const sHit = symbols.symbol_plane_hit;
	const sWin = symbols.symbol_plane_win;
	if (ob.ob_endsts === OBENDSTATUS.WINNER && ob.ob_goingsun) {
		const idx = clamp_max(Math.floor(state.endcount / 18), sWin.length - 1);
		ob.ob_symbol = sWin[idx].sym[0];
	} else if (ob.ob_state === OBSTATE.FINISHED) {
		ob.ob_symbol = null;
	} else if (ob.ob_state === OBSTATE.FALLING && !ob.ob_dx && ob.ob_dy < 0) {
		ob.ob_symbol = sHit[ob.ob_orient % 4].sym[0];
	} else if (ob.ob_orient) {
		const a = (16 - ob.ob_angle) % 16;
		ob.ob_symbol = sPlane[a % 4].sym[4 + Math.floor(a / 4)];
	} else {
		ob.ob_symbol = sPlane[ob.ob_angle % 4].sym[Math.floor(ob.ob_angle / 4)];
	}
}

function movepln(ob) {
	let nangle, nspeed, limit, update;
	let stalled = false;
	let stVal = ob.ob_state;

	ob.ob_soundf = PlaneSoundCallback;

	switch (stVal) {
		case OBSTATE.FINISHED:
		case OBSTATE.WAITING:
			return false;

		case OBSTATE.CRASHED:
			ob.ob_hitcount--;
			break;

		case OBSTATE.FALLING:
			ob.ob_hitcount -= 2;
			if (ob.ob_dy < 0 && ob.ob_dx) {
				if ((ob.ob_orient ? 1 : 0) ^ (ob.ob_dx < 0 ? 1 : 0)) {
					ob.ob_hitcount -= ob.ob_flaps;
				} else {
					ob.ob_hitcount += ob.ob_flaps;
				}
			}
			if (ob.ob_hitcount <= 0) {
				if (ob.ob_dy < 0) {
					if (ob.ob_dx < 0) ob.ob_dx++;
					else if (ob.ob_dx > 0) ob.ob_dx--;
					else ob.ob_orient++;
				}
				if (ob.ob_dy > -10) ob.ob_dy--;
				ob.ob_hitcount = FALLCOUNT;
			}
			ob.ob_angle = symangle(ob) * 2;
			if (ob.ob_dy <= 0) initsound(ob, SOUND.S_FALLING);
			break;

		case OBSTATE.STALLED:
		case OBSTATE.WOUNDSTALL:
		case OBSTATE.FLYING:
		case OBSTATE.WOUNDED: {
			let newState;
			if (stVal === OBSTATE.STALLED) newState = OBSTATE.FLYING;
			else if (stVal === OBSTATE.WOUNDSTALL) newState = OBSTATE.WOUNDED;

			if (stVal === OBSTATE.STALLED || stVal === OBSTATE.WOUNDSTALL) {
				stalled =
					ob.ob_angle !== (3 * ANGLES) / 4 ||
					ob.ob_speed < state.gminspeed;
				if (!stalled) {
					ob.ob_state = stVal = newState;
				}
			} else {
				stalled = ob.ob_y >= MAX_Y;
				if (stalled) {
					if (state.playmode === PLAYMODE.NOVICE) {
						ob.ob_angle = (3 * ANGLES) / 4;
						stalled = false;
					} else {
						stallpln(ob);
						stVal = ob.ob_state;
					}
				}
			}

			if (ob.ob_goingsun) break;

			if (ob.ob_life <= 0 && !ob.ob_athome && !PlaneIsKilled(stVal)) {
				if (moverefs.hitpln) moverefs.hitpln(ob);
				if (moverefs.scorepln) moverefs.scorepln(ob, OBTYPE.GROUND);
				return movepln(ob);
			}

			if (ob.ob_firing && moverefs.initshot) moverefs.initshot(ob, null);
			if (ob.ob_bombing && moverefs.initbomb) moverefs.initbomb(ob);
			if (ob.ob_mfiring && moverefs.initmiss) moverefs.initmiss(ob);
			if (ob.ob_bfiring && moverefs.initburst) moverefs.initburst(ob);

			nangle = ob.ob_angle;
			nspeed = ob.ob_speed;
			update = ob.ob_flaps;

			if (update) {
				if (ob.ob_orient) nangle -= update;
				else nangle += update;
				nangle = ((nangle % ANGLES) + ANGLES) % ANGLES;
			}

			if (!(state.countmove & 0x0003)) {
				if (!stalled && nspeed < state.gminspeed && state.playmode !== PLAYMODE.NOVICE) {
					nspeed--;
					update = true;
				} else {
					limit = state.gminspeed + ob.ob_accel + gravity[nangle];
					if (nspeed < limit) { nspeed++; update = true; }
					else if (nspeed > limit) { nspeed--; update = true; }
				}
			}

			if (update) {
				if (ob.ob_athome) {
					if (ob.ob_accel || ob.ob_flaps) nspeed = state.gminspeed;
					else nspeed = 0;
				} else if (nspeed <= 0 && !stalled) {
					if (state.playmode === PLAYMODE.NOVICE) {
						nspeed = 1;
					} else {
						stallpln(ob);
						return movepln(ob);
					}
				}

				ob.ob_speed = nspeed;
				ob.ob_angle = nangle;

				if (stalled) {
					ob.ob_dx = 0;
					ob.ob_ldx = 0;
					ob.ob_ldy = 0;
					ob.ob_dy = -nspeed;
				} else {
					setdxdy(ob, nspeed * COS(nangle), nspeed * SIN(nangle));
				}
			}

			if (stalled) {
				ob.ob_hitcount--;
				if (ob.ob_hitcount <= 0) {
					ob.ob_orient = ob.ob_orient ? 0 : 1;
					ob.ob_angle = (((3 * ANGLES) / 2) - ob.ob_angle) % ANGLES;
					ob.ob_hitcount = STALLCOUNT;
				}
			}

			if (!state.compplane) {
				ob.ob_life -= ob.ob_speed;
			} else if (ob.ob_life > 100) {
				ob.ob_life -= ob.ob_speed;
			}

			if (ob.ob_speed) ob.ob_athome = false;
			break;
		}
	}

	selectPlaneSymbol(ob);

	const [x, y] = movexy(ob);

	if (!in_range(0, x, state.currgame.gm_max_x - 16)) {
		ob.ob_x = clamp_range(0, x, state.currgame.gm_max_x - 16);
		updateobjpos(ob);
	}

	if (
		!state.compplane &&
		state.consoleplayer.ob_endsts === OBENDSTATUS.PLAYING &&
		!PlaneIsKilled(ob.ob_state)
	) {
		nearpln(ob);
	}

	if (ob.ob_bdelay) ob.ob_bdelay--;
	if (ob.ob_mdelay) ob.ob_mdelay--;
	if (ob.ob_bsdelay) ob.ob_bsdelay--;

	if (!state.compplane && ob.ob_athome && ob.ob_state === OBSTATE.FLYING) {
		refuel(ob);
	}

	if (in_range(0, y, MAX_Y - 1)) {
		if (
			ob.ob_state === OBSTATE.FALLING ||
			PlaneIsWounded(ob.ob_state)
		) {
			if (moverefs.initsmok) moverefs.initsmok(ob);
		}
		return state.plyrplane || ob.ob_state < OBSTATE.FINISHED;
	}
	return false;
}

function clamp_range(min, val, max) {
	if (val < min) return min;
	if (val > max) return max;
	return val;
}

export function moveplyr(ob) {
	state.compplane = false;
	state.plyrplane = state.player === ob.ob_plrnum;
	state.endstat = state.consoleplayer.ob_endsts;

	if (state.endstat) {
		state.endcount--;
		if (state.endcount <= 0) {
			if (state.playmode !== PLAYMODE.ASYNCH && !state.quit && moverefs.swrestart) {
				moverefs.swrestart();
				return true;
			}
			if (moverefs.swend) moverefs.swend(null, true);
		}
	}

	let multkey = state.latest_player_commands[ob.ob_plrnum][state.countmove % MAX_NET_LAG];
	if ((multkey & K_HARRYKEYS) !== 0 && ob.ob_orient) {
		if (multkey & (K_FLAPU | K_FLAPD)) {
			multkey ^= K_FLAPU | K_FLAPD;
		}
	}

	interpret(ob, multkey);

	if (ob.ob_state === OBSTATE.CRASHED && ob.ob_hitcount <= 0) {
		if (state.playmode !== PLAYMODE.ASYNCH) ob.ob_crashcnt++;
		if (
			state.endstat !== OBENDSTATUS.WINNER &&
			(ob.ob_life <= -5000 ||
				(state.playmode !== PLAYMODE.ASYNCH && ob.ob_crashcnt >= MAXCRASH))
		) {
			if (!state.endstat && moverefs.loser) moverefs.loser(ob);
		} else {
			if (moverefs.initplyr) moverefs.initplyr(ob, ob.ob_original_ob);
			if (moverefs.initdisp) moverefs.initdisp(true);
			if (state.endstat === OBENDSTATUS.WINNER) {
				if (moverefs.ctlbreak() && moverefs.swend) moverefs.swend(null, true);
				if (moverefs.winner) moverefs.winner(ob);
			}
		}
	}

	return movepln(ob);
}

export function movecomp(ob) {
	state.compplane = true;
	state.plyrplane = false;
	ob.ob_flaps = 0;
	ob.ob_bfiring = false;
	ob.ob_bombing = false;
	ob.ob_mfiring = null;
	state.endstat = ob.ob_endsts;

	if (!state.dispcnt) ob.ob_firing = null;

	switch (ob.ob_state) {
		case OBSTATE.WOUNDED:
		case OBSTATE.WOUNDSTALL:
			if (state.countmove & 1) break;
			// fallthrough
		case OBSTATE.FLYING:
		case OBSTATE.STALLED:
			if (state.endstat && moverefs.gohome) {
				moverefs.gohome(ob);
				break;
			}
			if (!state.dispcnt && moverefs.swauto) moverefs.swauto(ob);
			break;
		case OBSTATE.CRASHED:
			ob.ob_firing = null;
			if (ob.ob_hitcount <= 0 && !state.endstat && moverefs.initcomp) {
				moverefs.initcomp(ob, ob.ob_original_ob);
			}
			break;
		default:
			ob.ob_firing = null;
			break;
	}

	return movepln(ob);
}

function adjustfall(ob) {
	ob.ob_life--;
	if (ob.ob_life <= 0) {
		if (ob.ob_dy < 0) {
			if (ob.ob_dx < 0) ob.ob_dx++;
			else if (ob.ob_dx > 0) ob.ob_dx--;
		}
		if (ob.ob_dy > -10) ob.ob_dy--;
		ob.ob_life = BOMBLIFE;
	}
}

export function moveshot(ob) {
	ob.ob_life--;
	if (ob.ob_life <= 0) { deallobj(ob); return false; }
	const [x, y] = movexy(ob);
	if (
		!in_range(0, x, state.currgame.gm_max_x - 1) ||
		!in_range(state.ground[x] + 1, y, MAX_Y - 1)
	) {
		deallobj(ob);
		return false;
	}
	ob.ob_symbol = symbols.symbol_pixel;
	return true;
}

function BombSoundCallback(ob) {
	if (ob.ob_dy <= 0) sound(SOUND.S_BOMB, -ob.ob_y, ob);
}

export function movebomb(ob) {
	ob.ob_soundf = BombSoundCallback;
	if (ob.ob_life < 0) { deallobj(ob); ob.ob_state = OBSTATE.FINISHED; return false; }
	adjustfall(ob);
	if (ob.ob_dy <= 0) initsound(ob, SOUND.S_BOMB);
	const [x, y] = movexy(ob);
	if (y < 0 || !in_range(0, x, state.currgame.gm_max_x - 1)) {
		deallobj(ob);
		stopsound(ob);
		ob.ob_state = OBSTATE.FINISHED;
		return false;
	}
	const ang = symangle(ob);
	ob.ob_symbol = symbols.symbol_bomb[ang % 2].sym[Math.floor(ang / 2)];
	if (y >= MAX_Y) return false;
	return true;
}

export function movemiss(ob) {
	if (ob.ob_life < 0) { deallobj(ob); ob.ob_state = OBSTATE.FINISHED; return false; }
	let x, y, angle;
	if (ob.ob_state === OBSTATE.FLYING) {
		let obt = ob.ob_missiletarget;
		if (obt && obt !== ob.ob_owner && (ob.ob_life & 1)) {
			if (obt.ob_missiletarget) obt = obt.ob_missiletarget;
			if (moverefs.aim) moverefs.aim(ob, obt.ob_x, obt.ob_y, null, false);
			angle = ob.ob_angle = ((ob.ob_angle + ob.ob_flaps) % ANGLES + ANGLES) % ANGLES;
			setdxdy(ob, ob.ob_speed * COS(angle), ob.ob_speed * SIN(angle));
		}
		[x, y] = movexy(ob);
		ob.ob_life--;
		if (ob.ob_life <= 0 || y >= (MAX_Y * 3) / 2) {
			ob.ob_state = OBSTATE.FALLING;
			ob.ob_life++;
		}
	} else {
		adjustfall(ob);
		ob.ob_angle = (ob.ob_angle + 1) % ANGLES;
		[x, y] = movexy(ob);
	}
	if (y < 0 || !in_range(0, x, state.currgame.gm_max_x - 1)) {
		deallobj(ob);
		ob.ob_state = OBSTATE.FINISHED;
		return false;
	}
	ob.ob_symbol = symbols.symbol_missile[ob.ob_angle % 4].sym[Math.floor(ob.ob_angle / 4)];
	if (y >= MAX_Y) return false;
	return true;
}

export function moveburst(ob) {
	if (ob.ob_life < 0) {
		ob.ob_owner.ob_missiletarget = null;
		deallobj(ob);
		return false;
	}
	adjustfall(ob);
	const [x, y] = movexy(ob);
	if (!in_range(0, x, state.currgame.gm_max_x - 1) || y <= state.ground[x]) {
		ob.ob_owner.ob_missiletarget = null;
		deallobj(ob);
		return false;
	}
	ob.ob_owner.ob_missiletarget = ob;
	ob.ob_symbol = symbols.symbol_burst[ob.ob_life & 1].sym[0];
	return y < MAX_Y;
}

function TargetSoundCallback(ob) {
	if (ob.ob_firing) sound(SOUND.S_SHOT, 0, ob);
}

const target_aggression = [
	2, 2, 2, 2, 5, 5, 0, 0,
	2, 2, 2, 5, 5, 0, 0, 0, 0, 0, 0, 0,
];

function FindEnemyPlane(ob) {
	for (let obp = state.objtop; obp !== null; obp = obp.ob_next) {
		if (obp.ob_type !== OBTYPE.PLANE || obp.ob_faction === ob.ob_faction) continue;
		if (state.playmode !== PLAYMODE.ASYNCH && obp.ob_faction !== 1 /* PLAYER1 */) continue;
		if (PlaneIsKilled(obp.ob_state)) continue;
		const r = moverefs.range(ob.ob_x, ob.ob_y, obp.ob_x, obp.ob_y);
		if (in_range(1, r, state.targrnge - 1)) return obp;
	}
	return null;
}

export function movetarg(ob) {
	const oldsym = ob.ob_symbol;
	const transform = ob.ob_original_ob.transform;

	ob.ob_soundf = TargetSoundCallback;
	ob.ob_firing = null;

	const aggression = target_aggression[ob.ob_orient] || 0;
	if (
		ob.ob_state === OBSTATE.STANDING &&
		state.gamenum > 0 &&
		aggression > 0 &&
		(state.gamenum > 1 || state.countmove % aggression === aggression - 1)
	) {
		const plane = FindEnemyPlane(ob);
		if (plane && moverefs.initshot) {
			moverefs.initshot(ob, plane);
			ob.ob_firing = plane;
		}
	}

	ob.ob_hitcount = clamp_min(ob.ob_hitcount - 1, 0);

	const live = symbols.symbol_targets[ob.ob_orient].sym[transform];
	const dead = symbols.symbol_target_hit[ob.ob_orient].sym[transform];
	ob.ob_symbol = ob.ob_state === OBSTATE.STANDING ? live : dead;

	ob.ob_x += Math.floor((oldsym.w - ob.ob_symbol.w) / 2);
	ob.ob_y -= oldsym.h - ob.ob_symbol.h;

	return true;
}

export function movepowerup(ob) {
	const transform = ob.ob_original_ob.transform;
	if (ob.ob_state === OBSTATE.STANDING) {
		ob.ob_symbol = symbols.symbol_powerups[ob.ob_orient].sym[transform];
	} else {
		ob.ob_symbol = symbols.symbol_powerup_collected[ob.ob_orient].sym[transform];
	}
	return true;
}

function ExplosionSoundCallback(ob) {
	if (ob.ob_orient) sound(SOUND.S_EXPLOSION, ob.ob_hitcount, ob);
}

export function moveexpl(ob) {
	ob.ob_soundf = ExplosionSoundCallback;
	const orient = ob.ob_orient;
	if (ob.ob_life < 0) {
		if (orient) stopsound(ob);
		deallobj(ob);
		return false;
	}
	ob.ob_life--;
	if (ob.ob_life <= 0) {
		if (ob.ob_dy < 0) {
			if (ob.ob_dx < 0) ob.ob_dx++;
			else if (ob.ob_dx > 0) ob.ob_dx--;
		}
		if ((ob.ob_orient && ob.ob_dy > -10) || (!ob.ob_orient && ob.ob_dy > -state.gminspeed)) {
			ob.ob_dy--;
		}
		ob.ob_life = EXPLLIFE;
	}
	const [x, y] = movexy(ob);
	if (!in_range(0, x, state.currgame.gm_max_x - 1) || y <= state.ground[x]) {
		if (orient) stopsound(ob);
		deallobj(ob);
		return false;
	}
	ob.ob_hitcount++;
	ob.ob_symbol = symbols.symbol_debris[ob.ob_orient].sym[0];
	return y < MAX_Y;
}

export function movesmok(ob) {
	const planestate = ob.ob_owner.ob_state;
	ob.ob_life--;
	if (
		ob.ob_life <= 0 ||
		(planestate !== OBSTATE.FALLING &&
			planestate !== OBSTATE.CRASHED &&
			!PlaneIsWounded(planestate))
	) {
		deallobj(ob);
		return false;
	}
	ob.ob_symbol = symbols.symbol_pixel;
	return true;
}

export function moveflck(ob) {
	if (ob.ob_life === -1) { deallobj(ob); return false; }
	ob.ob_life--;
	if (ob.ob_life <= 0) {
		ob.ob_orient = ob.ob_orient ? 0 : 1;
		ob.ob_life = FLOCKLIFE;
	}
	if (ob.ob_x < ob.ob_original_ob.territory_l) ob.ob_dx = Math.abs(ob.ob_dx);
	else if (ob.ob_x > ob.ob_original_ob.territory_r) ob.ob_dx = -Math.abs(ob.ob_dx);
	movexy(ob);
	ob.ob_symbol = symbols.symbol_flock[ob.ob_orient].sym[0];
	return true;
}

export function moveballoon(ob) {
	const orig = ob.ob_original_ob;
	if (ob.ob_life === -1) { deallobj(ob); return false; }

	if (ob.ob_state === OBSTATE.FLYING && state.gamenum > 0 && state.countmove % 7 === 0) {
		const plane = FindEnemyPlane(ob);
		if (plane && plane.ob_y < ob.ob_y && moverefs.initshot) {
			moverefs.initshot(ob, plane);
			ob.ob_firing = plane;
		}
	}

	const step = state.countmove + orig.x;
	const dx = SIN(Math.floor(step / 7)) * 128;
	const dy = SIN(Math.floor(step / 3)) * 128;
	ob.ob_dx = dx >> 16;
	ob.ob_ldx = dx & 0xffff;
	ob.ob_dy = dy >> 16;
	ob.ob_ldy = dy & 0xffff;
	movexy(ob);

	const f = orig.orient * 3 + (dx >= 20000 ? 2 : dx <= -20000 ? 0 : 1);
	ob.ob_symbol = symbols.symbol_balloon[f].sym[orig.transform];
	return true;
}

function checkwall(ob, direction) {
	let x = ob.ob_x;
	for (let cnt = 0; cnt < 20; cnt++) {
		if (!in_range(0, x, state.currgame.gm_max_x - 1)) return true;
		if (state.ground[x] > ob.ob_y + 10) return true;
		if (direction < 0) x--;
		else x++;
	}
	return false;
}

export function movebird(ob) {
	if (ob.ob_life === -1) { deallobj(ob); return false; }
	if (ob.ob_life === -2) {
		ob.ob_dy = -ob.ob_dy;
		ob.ob_dx = (state.countmove & 7) - 4;
		if (checkwall(ob, ob.ob_dx)) ob.ob_dx = -ob.ob_dx;
		ob.ob_life = BIRDLIFE;
	} else {
		ob.ob_life--;
		if (ob.ob_life <= 0) {
			ob.ob_orient = ob.ob_orient ? 0 : 1;
			ob.ob_life = BIRDLIFE;
		}
	}
	const [x, y] = movexy(ob);
	ob.ob_symbol = symbols.symbol_bird[ob.ob_orient].sym[0];
	if (
		!in_range(0, x, state.currgame.gm_max_x - 1) ||
		!in_range(state.ground[x] + 1, y, MAX_Y - 1)
	) {
		ob.ob_y -= ob.ob_dy;
		ob.ob_life = -2;
		return false;
	}
	return true;
}

export function moveox(ob) {
	const transform = ob.ob_original_ob.transform;
	ob.ob_symbol = symbols.symbol_ox[ob.ob_state !== OBSTATE.STANDING ? 1 : 0].sym[transform];
	return true;
}

// Plane crash & damage transitions (src/swmove.c:1172).
export function crashpln(ob) {
	const orig = ob.ob_original_ob;
	if (ob.ob_dx < 0) ob.ob_angle = (ob.ob_angle + 2) % ANGLES;
	else ob.ob_angle = (ob.ob_angle + ANGLES - 2) % ANGLES;
	ob.ob_state = OBSTATE.CRASHED;
	ob.ob_athome = false;
	ob.ob_dx = ob.ob_dy = ob.ob_ldx = ob.ob_ldy = ob.ob_speed = 0;
	ob.ob_hitcount =
		Math.abs(orig.x - ob.ob_x) < SAFERESET && Math.abs(ob.ob_orig_y - ob.ob_y) < SAFERESET
			? MAXCRCOUNT << 1
			: MAXCRCOUNT;
	return true;
}

export function hitpln(ob) {
	ob.ob_ldx = 0;
	ob.ob_ldy = 0;
	ob.ob_hitcount = FALLCOUNT;
	ob.ob_state = OBSTATE.FALLING;
	ob.ob_athome = false;
	return true;
}

// Top-level tic dispatch (src/swmove.c:40).
export function swmove() {
	if (state.deltop) {
		state.delbot.ob_next = state.objfree;
		state.objfree = state.deltop;
		state.deltop = state.delbot = null;
	}

	state.dispcnt++;
	if (state.dispcnt >= state.keydelay) state.dispcnt = 0;

	let ob = state.objtop;
	while (ob) {
		const obn = ob.ob_next;
		ob.ob_drwflg = ob.ob_movef ? ob.ob_movef(ob) : false;
		ob = obn;
	}

	state.countmove++;
	if (state.consoleplayer && state.consoleplayer.ob_athome) {
		state.last_ground_time = state.countmove;
	} else if (state.countmove - state.last_ground_time > SUCCESSFUL_FLIGHT_TIME) {
		state.successful_flight = true;
	}
}
