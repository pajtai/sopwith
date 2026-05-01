// Constants ported from src/sw.h.
// Comments and names mirror the C source so cross-references stay readable.

export const FPS = 10;

export const DEFAULT_PORT = 3847;

export const MAX_Y = 200;
export const MIN_SPEED = 4;
export const MAX_SPEED = 8;
export const MAX_THROTTLE = 4;

export const MAXCRCOUNT = 10;
export const FALLCOUNT = 10;
export const STALLCOUNT = 6;
export const TARGHITCOUNT = 10;

export const SCR_WDTH = 320;
export const SCR_HGHT = 200;
export const SCR_CENTR = SCR_WDTH / 2 - 8;
export const SCR_MNSH = 16;
export const SCR_MXSH = 75;

// WRLD_RSX/WRLD_RSY depend on currgame->gm_max_x; expose helpers instead of constants.
export function WRLD_RSX(gm_max_x) {
	return Math.floor((gm_max_x / 320) * 2 + 1);
}
export const WRLD_RSY = Math.floor(MAX_Y / SCR_MNSH + 1);

export const GAUGEX = SCR_CENTR - 25;

export const MAXROUNDS = 200;
export const MAXBOMBS = 5;
export const MAXMISSILES = 5;
export const MAXBURSTS = 5;
export const MAXFUEL = 9000;
export const MAXCRASH = 5;

export const MAX_PLANES = 16;
export const MAX_PLYR = 4;
export const MAX_OBJS = 100;
export const NUM_STRAY_BIRDS = 1;

export const ANGLES = 16;
export const ORIENTS = 2;
export const SYM_WDTH = 16;
export const SYM_HGHT = 16;

export const BULSPEED = 10;
export const BULLIFE = 10;
export const BOMBLIFE = 5;
export const MISSLIFE = 50;
export const BURSTLIFE = 20;
export const EXPLLIFE = 3;
export const SMOKELIFE = 10;
export const BIRDLIFE = 4;
export const FLOCKLIFE = 5;

export const NEAR = 150 * 150;
export const CLOSE = 32;
export const HOME = 16;
export const SAFERESET = 32;

export const QUIT = -5000;

// Keyboard word masks from src/sw.h:189
export const K_ACCEL = 0x0001;
export const K_DEACC = 0x0002;
export const K_FLAPU = 0x0004;
export const K_FLAPD = 0x0008;
export const K_FLIP = 0x0010;
export const K_SHOT = 0x0020;
export const K_HARRYKEYS = 0x0040;
export const K_BOMB = 0x0100;
export const K_HOME = 0x0200;
export const K_SOUND = 0x0400;
export const K_BREAK = 0x0800;
export const K_MISSILE = 0x1000;
export const K_STARBURST = 0x2000;

// Medal/ribbon ids from src/sw.h:223
export const MEDAL_PURPLEHEART = 0;
export const MEDAL_COMPETENCE = 1;
export const MEDAL_VALOUR = 2;

export const RIBBON_ACE = 0;
export const RIBBON_TOPACE = 1;
export const RIBBON_PERFECT = 2;
export const RIBBON_SERVICE = 3;
export const RIBBON_COMPETENCE2 = 4;
export const RIBBON_PREVALOUR = 5;

// From src/swmain.h:22
export const MAX_NET_LAG = 12;

// Sine table of pi/8 increments * 256, from src/swmain.c:80.
// length === ANGLES (16).
export const sintab = Object.freeze([
	0, 98, 181, 237, 256, 237, 181, 98,
	0, -98, -181, -237, -256, -237, -181, -98,
]);

export function SIN(x) {
	let i = x % ANGLES;
	if (i < 0) i += ANGLES;
	return sintab[i];
}

export function COS(x) {
	let i = (x + (ANGLES / 4)) % ANGLES;
	if (i < 0) i += ANGLES;
	return sintab[i];
}
