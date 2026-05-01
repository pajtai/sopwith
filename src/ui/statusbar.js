// Status bar — port of src/swstbar.c.
//
// Phase 8 scope: gauges (crashes/fuel/bombs/bullets, plus missiles/flares
// when conf_missiles is set), map (ground silhouette + colored dots for
// objects), and the horizontal divider line at SCR_MNSH+2. The
// score/medals/ribbons rely on bitmap-font text rendering, which lands in
// Phase 9; this module leaves space for them.

import {
	GAUGEX,
	MAXBOMBS,
	MAXBURSTS,
	MAXFUEL,
	MAXMISSILES,
	MAXROUNDS,
	MAX_Y,
	SCR_CENTR,
	SCR_MNSH,
	SCR_WDTH,
	WRLD_RSY,
	WRLD_RSX,
} from "../sim/constants.js";
import { state } from "../sim/state.js";
import { plotPixel, fuselageColor, box } from "../video.js";
import { swcolor, swposcur, swputs } from "../sim/text.js";
import { imax, clamp_max, in_range } from "../sim/util.js";

function dispgge(x, cury, maxy, clr) {
	let top = clamp_max(9, Math.floor((cury * 10) / maxy) - 1);
	let y = 0;
	for (; y <= top; y++) plotPixel(x, y, clr);
	for (; y <= 9; y++) plotPixel(x, y, 0);
}

function dispgauges(ob) {
	if (!ob) return;
	let x = GAUGEX;
	const sep = state.conf_missiles ? 3 : 5;

	// crashes/lives
	dispgge((x += sep), state.maxcrash - ob.ob_crashcnt, state.maxcrash, 1);
	// fuel
	dispgge((x += sep), ob.ob_life >> 4, MAXFUEL >> 4, 1);
	// bombs
	dispgge((x += sep), ob.ob_bombs, MAXBOMBS, 2);
	// bullets
	dispgge((x += sep), ob.ob_rounds, MAXROUNDS, 3);

	if (state.conf_missiles) {
		dispgge((x += sep), ob.ob_missiles, MAXMISSILES, 1);
		dispgge((x += sep), ob.ob_bursts, MAXBURSTS, 2);
	}
}

function dispmapobjects(rsx) {
	const game = state.currgame;
	for (let ob = state.objtop; ob; ob = ob.ob_next) {
		if (!ob.ob_onmap || ob.ob_x < 0 || ob.ob_x >= game.gm_max_x) continue;
		if (!ob.ob_symbol) continue;
		const mapx = ob.ob_x + (ob.ob_symbol.w >> 1);
		const groundy = state.ground[ob.ob_x] | 0;
		let mapy;
		if (ob.ob_y - ob.ob_symbol.h <= groundy) {
			mapy = ob.ob_y - ob.ob_symbol.h + 8;
		} else {
			mapy = ob.ob_y - (ob.ob_symbol.h >> 1);
		}
		const x = SCR_CENTR + Math.floor(mapx / rsx);
		const y = Math.floor(mapy / WRLD_RSY);
		if (y < SCR_MNSH - 1) {
			plotPixel(x, y, fuselageColor(ob.ob_clr));
		}
	}
}

function dispmap() {
	const game = state.currgame;
	if (!game) return;
	const rsx = WRLD_RSX(game.gm_max_x);
	const ground = state.ground;

	let dx = 0;
	let sx = SCR_CENTR;
	let maxh = 0;
	let y = 0;

	for (let x = 0; x < game.gm_max_x; x++) {
		maxh = imax(maxh, ground[x]);
		dx++;
		if (dx === rsx) {
			maxh = Math.floor(maxh / WRLD_RSY);
			if (maxh === y) {
				plotPixel(sx, maxh, 7);
			} else if (maxh > y) {
				for (++y; y <= maxh; y++) plotPixel(sx, y, 7);
			} else {
				for (--y; y >= maxh; y--) plotPixel(sx, y, 7);
			}
			y = maxh;
			plotPixel(sx, 0, 11);
			sx++;
			dx = 0;
			maxh = 0;
		}
	}

	const mapH = Math.floor(MAX_Y / WRLD_RSY);
	for (let yy = 0; yy <= mapH; yy++) {
		plotPixel(SCR_CENTR, yy, 11);
		plotPixel(sx, yy, 11);
	}

	dispmapobjects(rsx);

	// Top edge of status bar.
	for (let x = 0; x < SCR_WDTH; x++) {
		plotPixel(x, SCR_MNSH + 2, 7);
	}
}

function dispscore(ob) {
	if (!ob || !ob.ob_score) return;
	box(0, 16, 48 + 32, 16, 0);
	const score = ob.ob_score.score | 0;
	let x;
	if (!in_range(-9999, score, 99999)) x = 0;
	else if (!in_range(-999, score, 9999)) x = 1;
	else x = 2;
	swposcur(x, 24);
	swcolor(ob.ob_clr);
	swputs(String(score));
}

export function dispstatusbar() {
	dispmap();
	dispscore(state.consoleplayer);
	dispgauges(state.consoleplayer);
}
