// Title screen — port of src/swtitle.c. Renders the static title
// elements (sample sprites + decorative blip lines + copyright text)
// directly into the indexed framebuffer. Phase 9 wires bitmap font
// rendering for all on-screen text; the menu system in ./menu.js draws
// over this background when active.

import { SCR_HGHT, SCR_WDTH } from "../sim/constants.js";
import { state } from "../sim/state.js";
import {
	clear,
	dispGround,
	dispGroundSolid,
	drawSymbol,
	plotPixel,
} from "../video.js";
import { swcolor, swposcur, swputs, utf8Strlen } from "../sim/text.js";
import { symbols } from "../sim/symbols.js";

const X_OFFSET = (SCR_WDTH / 2) - 160;

function drawLine(x1, y1, x2, y2, color) {
	const cnt = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2)) + 1;
	for (let i = 0; i < cnt; i++) {
		const j = cnt - i;
		const x = Math.floor((x1 * i + x2 * j) / cnt);
		const y = Math.floor((y1 * i + y2 * j) / cnt);
		plotPixel(x, SCR_HGHT - 1 - y, color);
	}
}

function drawTitleSymbol(sym, x, y, faction) {
	if (!sym) return;
	drawSymbol(x + X_OFFSET, SCR_HGHT - 1 - y, sym, faction);
}

function centerText(text, row, color) {
	const len = utf8Strlen(text);
	const x = 20 - ((len + 1) >> 1) + (X_OFFSET >> 3);
	swcolor(color);
	swposcur(x, row);
	swputs(text);
}

export function drawTitleBackground() {
	clear();

	if (state.ground && state.currgame) {
		const w = Math.min(SCR_WDTH, state.currgame.gm_max_x);
		if (state.conf_solidground) {
			dispGroundSolid(state.ground, 0, 0, w);
		} else {
			dispGround(state.ground, 0, 0, w);
		}
	}

	const plane0 = symbols.symbol_plane?.[0]?.sym?.[0];
	const plane1Hit = symbols.symbol_plane?.[1]?.sym?.[6];
	const target = symbols.symbol_targets?.[3]?.sym?.[0];
	const ox = symbols.symbol_ox?.[0]?.sym?.[0];
	const planeHit = symbols.symbol_plane_hit?.[0]?.sym?.[0];

	if (plane0) drawTitleSymbol(plane0, 40, 19, 1);
	if (plane1Hit) drawTitleSymbol(plane1Hit, 130, 119, 2);
	if (target) drawTitleSymbol(target, 23, 108, 2);
	if (ox) drawTitleSymbol(ox, 212, 108, 1);
	if (planeHit) drawTitleSymbol(planeHit, 270, 39, 2);

	for (const yLine of [9, 14, 19, 24, 29, 34]) {
		drawLine(280 + X_OFFSET, yLine, 280 + X_OFFSET, yLine, 2);
	}
}

export function drawTitleTextElements() {
	centerText("SDL", 2, 2);
	centerText("S O P W I T H", 4, 3);
	centerText("Press SPACE / ENTER to play", 6, 3);

	swcolor(3);
	swposcur(0 + (X_OFFSET >> 3), 9);
	swputs("(c) 1984, 1985, 1987 ");
	swcolor(1);
	swputs("BMB");
	swcolor(3);
	swputs(" Compuscience");
	swposcur(0 + (X_OFFSET >> 3), 10);
	swputs("(c) 1984-2000 David L. Clark");
	swposcur(0 + (X_OFFSET >> 3), 11);
	swputs("(c) 2001-2024 Simon Howard, Jesse Smith");
	swposcur(0 + (X_OFFSET >> 3) + 4, 12);
	swcolor(3);
	swputs("Distributed under the ");
	swcolor(1);
	swputs("GNU GPL");
}
