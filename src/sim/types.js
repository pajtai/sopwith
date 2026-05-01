// Enum-equivalent constants ported from src/sw.h.
// Values match the C enum order; do not reorder.

export const TARGET = Object.freeze({
	HANGAR: 0,
	FACTORY: 1,
	OIL_TANK: 2,
	TANK: 3,
	TRUCK: 4,
	TANKER_TRUCK: 5,
	FLAG: 6,
	TENT: 7,
	CUSTOM1: 8,
	CUSTOM2: 9,
	CUSTOM3: 10,
	CUSTOM4: 11,
	CUSTOM5: 12,
	CUSTOM_PASSIVE1: 13,
	CUSTOM_PASSIVE2: 14,
	CUSTOM_PASSIVE3: 15,
	CUSTOM_PASSIVE4: 16,
	CUSTOM_PASSIVE5: 17,
	RADIO_TOWER: 18,
	WATER_TOWER: 19,
});
export const NUM_TARGET_TYPES = 20;

export const POWERUP = Object.freeze({
	AMMO: 0,
	BOMB: 1,
	FUEL: 2,
	AMMO_BIG: 3,
	BOMB_BIG: 4,
	FUEL_BIG: 5,
});
export const NUM_POWERUP_TYPES = 6;

export const GROUND_RENDER = Object.freeze({
	PREF: 0,
	LINE: 1,
	SOLID: 2,
});

export const PLAYMODE = Object.freeze({
	UNSET: 0,
	SINGLE: 1,
	COMPUTER: 2,
	ASYNCH: 3,
	NOVICE: 4,
});

export const OBSTATE = Object.freeze({
	WAITING: 0,
	FLYING: 1,
	HIT: 2,
	CRASHED: 3,
	FALLING: 4,
	STANDING: 5,
	STALLED: 6,
	REBUILDING: 7,
	WOUNDED: 8,
	WOUNDSTALL: 9,
	FINISHED: 91,
});

export const OBENDSTATUS = Object.freeze({
	PLAYING: 0,
	WINNER: 1,
	LOSER: 2,
});

export const OBTYPE = Object.freeze({
	GROUND: 0,
	PLANE: 1,
	BOMB: 2,
	SHOT: 3,
	TARGET: 4,
	EXPLOSION: 5,
	SMOKE: 6,
	FLOCK: 7,
	BIRD: 8,
	OX: 9,
	MISSILE: 10,
	STARBURST: 11,
	BALLOON: 12,
	POWERUP: 13,
	DUMMYTYPE: 99,
});

export const FACTION = Object.freeze({
	NONE: 0,
	PLAYER1: 1,
	PLAYER2: 2,
	PLAYER3: 3,
	PLAYER4: 4,
	PLAYER5: 5,
	PLAYER6: 6,
	PLAYER7: 7,
	PLAYER8: 8,
});
export const NUM_FACTIONS = 9;

export const TRANSFORM = Object.freeze({
	NONE: 0,
	ROTATE90: 1,
	ROTATE180: 2,
	ROTATE270: 3,
	FLIP: 4,
	FLIP_ROTATE90: 5,
	MIRROR: 6,
	MIRROR_ROTATE90: 7,
});

// Factories — JS analogues of C structs in src/sw.h.

export function createFlightScore() {
	return {
		planekills: 0,
		valour: 0,
		killscore: 0,
		combatwound: false,
	};
}

export function createScore() {
	return {
		score: 0,
		planekills: 0,
		valour: 0,
		landings: 0,
		medals_nr: 0,
		medals: [0, 0, 0],
		ribbons_nr: 0,
		ribbons: [0, 0, 0, 0, 0, 0],
	};
}

export function createOriginalOb() {
	return {
		type: OBTYPE.DUMMYTYPE,
		x: 0,
		orient: 0,
		territory_l: 0,
		territory_r: 0,
		faction: FACTION.NONE,
		transform: TRANSFORM.NONE,
	};
}

// OBJECTS — the central per-entity record from src/sw.h:301.
// All fields zeroed; pointer-typed fields default to null. Function
// pointers (ob_soundf, ob_movef) are populated by the simulation code.
export function createObject() {
	return {
		ob_state: OBSTATE.WAITING,
		ob_x: 0,
		ob_y: 0,
		ob_dx: 0,
		ob_dy: 0,
		ob_angle: 0,
		ob_orient: 0,
		ob_speed: 0,
		ob_accel: 0,
		ob_flaps: 0,
		ob_firing: null,
		ob_rounds: 0,
		ob_hitcount: 0,
		ob_life: 0,
		ob_owner: null,
		ob_faction: FACTION.NONE,
		ob_target: null,
		ob_bombs: 0,
		ob_clr: 0,
		ob_lx: 0,
		ob_ly: 0,
		ob_ldx: 0,
		ob_ldy: 0,
		ob_next: null,
		ob_prev: null,
		ob_soundf: null,
		ob_movef: null,
		ob_xnext: null,
		ob_xprev: null,
		ob_crashcnt: 0,
		ob_symbol: null,
		ob_bdelay: 0,
		ob_type: OBTYPE.DUMMYTYPE,
		ob_sound: null,
		ob_missiles: 0,
		ob_mfiring: null,
		ob_mdelay: 0,
		ob_missiletarget: null,
		ob_bursts: 0,
		ob_bsdelay: 0,
		ob_plrnum: 0,
		ob_endsts: OBENDSTATUS.PLAYING,
		ob_score: createScore(),
		ob_flightscore: createFlightScore(),
		ob_original_ob: null,
		ob_orig_y: 0,
		ob_bombing: false,
		ob_drwflg: false,
		ob_onmap: false,
		ob_home: false,
		ob_athome: false,
		ob_bfiring: false,
		ob_goingsun: false,
	};
}

export function createGames() {
	return {
		gm_rseed: 0,
		gm_objects: [],
		gm_num_objects: 0,
		gm_ground: null, // populated from .sop file
		gm_max_x: 0,
	};
}
