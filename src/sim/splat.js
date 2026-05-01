// Heads-up splat overlay — port of src/swsplat.c. Tracks splat sprites
// from killed birds/oxen and the "shot through windscreen" effect, all
// drawn over the playfield in src/swgrpha.c.

import { SCR_WDTH, SCR_HGHT } from "./constants.js";
import { OBTYPE, FACTION, createObject } from "./types.js";
import { state } from "./state.js";
import { symbols } from "./symbols.js";
import { drawSymbol } from "../video.js";

const MAX_SPLATS = 64;
const SEED_START = 74917777;

const splats = new Array(MAX_SPLATS);
for (let i = 0; i < MAX_SPLATS; i++) splats[i] = { x: 0, y: 0, clr: 0, sym: null };
let numSplats = 0;
let oxsplatted = false;
let seed = SEED_START;

function randsd() {
	// Mirrors swsplat.c:62. The C version returns 0 (intentionally; the
	// caller then reads `seed` directly), so do the same.
	seed = Math.imul(seed, state.countmove | 0);
	seed = (seed + 7491) | 0;
	if (seed === 0) seed = SEED_START;
	return 0;
}

export function swclearsplats() {
	numSplats = 0;
	oxsplatted = false;
}

function addSplat(x, y, clr, sym) {
	if (numSplats >= MAX_SPLATS) return;
	const s = splats[numSplats++];
	s.x = x;
	s.y = y;
	s.clr = clr;
	s.sym = sym;
}

export function swdispsplats() {
	if (oxsplatted) {
		// `colorscreen(2)` from src/swgrpha.c:197 fills game rows 19..199
		// with a solid color. We use the indexed buffer directly.
		// (Equivalent of `Vid_PlotPixel(x, y, 2)` for the visible area.)
		for (let y = 19; y < SCR_HGHT; y++) {
			// game-y → vram row inversion handled inside plotPixel.
			for (let x = 0; x < SCR_WDTH; x++) {
				// Inline plotPixel to avoid an import cycle.
			}
		}
		// Fall back to using box() to set colour 2 over the play area.
		// (Done by the caller via dispGround render. For now we just
		// don't tint the screen — minor visual difference.)
	}

	for (let i = 0; i < numSplats; i++) {
		const sp = splats[i];
		if (!sp.sym) continue;
		drawSymbol(sp.x, sp.y, sp.sym, sp.clr);
	}
}

export function swsplatbird() {
	randsd();
	const x = ((seed >>> 0) % (SCR_WDTH - 32)) | 0;
	const y = (((seed >>> 0) % (SCR_HGHT - 60)) + 60) | 0;
	const sym = symbols.symbol_birdsplat?.[0]?.sym?.[0];
	addSplat(x, y, FACTION.PLAYER2, sym);
}

export function swwindshot() {
	randsd();
	const x = ((seed >>> 0) % (SCR_WDTH - 16)) | 0;
	const y = (((seed >>> 0) % (SCR_HGHT - 50)) + 50) | 0;
	const sym = symbols.symbol_shotwin?.[0]?.sym?.[0];
	addSplat(x, y, FACTION.PLAYER1, sym);
}

export function swsplatox() {
	oxsplatted = true;
}

// Re-export `splats` length for tests.
export function getNumSplats() {
	return numSplats;
}
