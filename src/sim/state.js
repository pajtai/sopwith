// Mutable global state. Mirrors the file-scope globals in the C codebase
// (mostly src/swmain.c). Modules import `state` and read/write fields on it.

import { MAX_PLANES, MAX_PLYR, MAX_NET_LAG } from "./constants.js";
import { PLAYMODE, OBSTATE, OBTYPE, FACTION, createObject } from "./types.js";

// Linked-list sentinels matching `topobj`/`botobj` in src/swmain.c. They
// are not real objects — they exist only as termination markers in the
// X-position list.
function makeSentinel(x) {
	const ob = createObject();
	ob.ob_x = x;
	ob.ob_xprev = null;
	ob.ob_xnext = null;
	return ob;
}

export const topobj = makeSentinel(-32767);
export const botobj = makeSentinel(32767);

export const state = {
	// Configuration flags (src/swmain.c:32-44)
	conf_missiles: false,
	conf_solidground: false,
	conf_hudsplats: false,
	conf_wounded: false,
	conf_animals: true,
	conf_harrykeys: false,
	conf_medals: true,
	conf_big_explosions: true,
	conf_video_palette: 0,

	// Game state (src/swmain.c:46-77)
	playmode: PLAYMODE.UNSET,
	currgame: null, // GAMES
	consoleplayer: null, // OBJECTS
	numtarg: new Array(9).fill(0), // [NUM_FACTIONS]; index by faction
	countmove: 0,

	gamenum: 0,
	gmaxspeed: 0,
	gminspeed: 0,
	targrnge: 0,

	titleflg: false,
	soundflg: false,

	displx: 0,

	planes: new Array(MAX_PLANES).fill(null), // OBJECTS*[MAX_PLANES]
	num_planes: 0,

	// Object list pointers
	objbot: null,
	objtop: null,
	objfree: null,
	deltop: null,
	delbot: null,

	endcount: 0,
	player: 0,
	plyrplane: false,
	compplane: false,
	explseed: 0,

	keydelay: -1,
	dispcnt: 0,
	endstat: 0,
	maxcrash: 0,
	restart_flag: false,

	// Mutable copy of currgame.gm_ground — Phase 6 onward (src/swinit.c:42).
	ground: null,

	// src/swmove.c:38: set when player has flown long enough to no longer
	// need novice mode hand-holding.
	successful_flight: false,
	quit: false,
	last_ground_time: 0,

	// Network/multiplayer (out of scope for first JS release but kept for
	// shape compatibility with code that references them).
	latest_player_commands: Array.from({ length: MAX_PLYR }, () =>
		new Array(MAX_NET_LAG).fill(0),
	),
	latest_player_time: new Array(MAX_PLYR).fill(0),
	num_players: 0,
};

// Reset helper for starting a new game without churning module references.
export function resetState() {
	state.playmode = PLAYMODE.UNSET;
	state.currgame = null;
	state.consoleplayer = null;
	state.numtarg.fill(0);
	state.countmove = 0;
	state.gamenum = 0;
	state.gmaxspeed = 0;
	state.gminspeed = 0;
	state.targrnge = 0;
	state.titleflg = false;
	state.displx = 0;
	state.planes.fill(null);
	state.num_planes = 0;
	state.objbot = null;
	state.objtop = null;
	state.objfree = null;
	state.deltop = null;
	state.delbot = null;
	state.endcount = 0;
	state.player = 0;
	state.plyrplane = false;
	state.compplane = false;
	state.explseed = 0;
	state.keydelay = -1;
	state.dispcnt = 0;
	state.endstat = 0;
	state.maxcrash = 0;
	state.restart_flag = false;
	state.num_players = 0;
	state.ground = null;
	state.successful_flight = false;
	state.quit = false;
	state.last_ground_time = 0;

	topobj.ob_xnext = null;
	topobj.ob_xprev = null;
	botobj.ob_xnext = null;
	botobj.ob_xprev = null;
}
