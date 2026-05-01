// Canvas2D video backend.
//
// Indexed-color 320x200 backbuffer (one byte = palette index per pixel).
// Y is inverted: row 0 in the buffer is the BOTTOM of the screen, matching
// the C code's `vid_vram + (SCR_HGHT - 1 - y) * vid_pitch + x` addressing
// (see `src/video.c:182`). Keeping the convention identical avoids
// translating coordinates in every gameplay file.

import { SCR_WDTH, SCR_HGHT } from "./sim/constants.js";

// Per-faction recolor table from src/video.c:24.
// COLOR_MAPPINGS[faction][src_pixel] -> palette index (0..3).
const COLOR_MAPPINGS = [
	[0, 3, 3, 3], // FACTION_NONE — all white
	[0, 1, 2, 3], // PLAYER1 — cyan fuselage, magenta wings
	[0, 2, 1, 3], // PLAYER2 — magenta fuselage, cyan wings
	[0, 1, 3, 2], // PLAYER3
	[0, 2, 3, 1], // PLAYER4
	[0, 3, 1, 2], // PLAYER5
	[0, 3, 2, 1], // PLAYER6
	[0, 1, 1, 3], // PLAYER7 — all-cyan
	[0, 2, 2, 3], // PLAYER8 — all-magenta
];

// Multi-palette set ported from src/sdl/video.c:40. RGBA32 packed
// little-endian as 0xAABBGGRR for direct write into ImageData.
function rgba(r, g, b) {
	return (0xff << 24) | (b << 16) | (g << 8) | r;
}

const VIDEO_PALETTES = [
	{ name: "CGA 1",      colors: [rgba(0,0,0), rgba(0,255,255), rgba(255,0,255), rgba(255,255,255)] },
	{ name: "CGA 2",      colors: [rgba(0,0,0), rgba(0,255,0), rgba(255,0,0), rgba(255,255,0)] },
	{ name: "CGA 3",      colors: [rgba(0,0,0), rgba(0,255,255), rgba(255,0,0), rgba(255,255,255)] },
	{ name: "Mono Amber", colors: [rgba(0,0,0), rgba(255,170,16), rgba(242,125,0), rgba(255,226,52)] },
	{ name: "Mono Green", colors: [rgba(0,0,0), rgba(12,238,56), rgba(8,202,48), rgba(49,253,90)] },
	{ name: "Mono Grey",  colors: [rgba(0,0,0), rgba(222,222,210), rgba(182,186,182), rgba(255,255,255)] },
	{ name: "Tosh LCD 1", colors: [rgba(213,226,138), rgba(150,160,150), rgba(120,120,160), rgba(0,20,200)] },
	{ name: "Tosh LCD 2", colors: [rgba(0,20,200), rgba(120,120,160), rgba(150,160,150), rgba(213,226,138)] },
	{ name: "Tosh LCD 3", colors: [rgba(0x72,0x88,0x79), rgba(0x4b,0x6e,0x75), rgba(0x42,0x5a,0x75), rgba(0x27,0x46,0x6d)] },
	{ name: "IBM LCD",    colors: [rgba(0x6b,0x85,0x88), rgba(0x56,0x6b,0x6e), rgba(0x42,0x52,0x54), rgba(0x2e,0x39,0x3b)] },
	{ name: "Tandy LCD",  colors: [rgba(0x48,0xad,0x68), rgba(0x36,0x8c,0x61), rgba(0x24,0x6c,0x5a), rgba(0x13,0x4a,0x54)] },
	{ name: "Gas Plasma", colors: [rgba(0x7d,0x1b,0x02), rgba(0xd3,0x41,0x00), rgba(0xa8,0x2e,0x01), rgba(0xfe,0x54,0x00)] },
	{ name: "Atari",      colors: [rgba(0x00,0x00,0x00), rgba(0x00,0x77,0xff), rgba(0xff,0x00,0x00), rgba(0xff,0xff,0xff)] },
	{ name: "Muted",      colors: [rgba(0x00,0x00,0x00), rgba(0x78,0xc3,0xd6), rgba(0xc5,0x51,0xc5), rgba(0xc7,0xc7,0xc7)] },
];

let activePalette = 0;

export const VID_PITCH = SCR_WDTH;
export const VRAM_SIZE = SCR_WDTH * SCR_HGHT;

export const vidBuffer = new Uint8Array(VRAM_SIZE);

let canvas = null;
let ctx = null;
let imageData = null;
let pixels32 = null;

export function initVideo(canvasEl) {
	canvas = canvasEl;
	canvas.width = SCR_WDTH;
	canvas.height = SCR_HGHT;
	ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	imageData = ctx.createImageData(SCR_WDTH, SCR_HGHT);
	pixels32 = new Uint32Array(imageData.data.buffer);
	clear();
}

function offset(x, y) {
	return (SCR_HGHT - 1 - y) * VID_PITCH + x;
}

export function clear() {
	vidBuffer.fill(0);
}

export function plotPixel(x, y, clr) {
	if (x < 0 || x >= SCR_WDTH || y < 0 || y >= SCR_HGHT) return;
	vidBuffer[offset(x, y)] = clr & 3;
}

export function xorPixel(x, y, clr) {
	if (x < 0 || x >= SCR_WDTH || y < 0 || y >= SCR_HGHT) return;
	vidBuffer[offset(x, y)] ^= clr & 3;
}

// `Vid_Box` from src/video.c:247 — fills h+1 rows from top y downward
// (game-y decreasing). Each row writes w bytes via memset.
export function box(x, y, w, h, c) {
	const top = SCR_HGHT - 1 - y;
	for (let row = 0; row <= h; row++) {
		const py = top + row;
		if (py < 0 || py >= SCR_HGHT) continue;
		const start = py * VID_PITCH + x;
		let runW = w;
		if (x + runW > SCR_WDTH) runW = SCR_WDTH - x;
		if (runW <= 0) continue;
		vidBuffer.fill(c & 3, start, start + runW);
	}
}

export function fuselageColor(faction) {
	const idx = Math.max(0, Math.min(faction, COLOR_MAPPINGS.length - 1));
	return COLOR_MAPPINGS[idx][1];
}

export function drawSymbol(x, y, symbol, faction) {
	if (!symbol) return;
	let w = symbol.w;
	let h = symbol.h;

	const mapping =
		COLOR_MAPPINGS[
			Math.max(0, Math.min(faction, COLOR_MAPPINGS.length - 1))
		];

	if (w === 1 && h === 1) {
		const i = symbol.data[0];
		if (i) xorPixel(x, y, mapping[i]);
		return;
	}

	const leftSkip = x < 0 ? -x : 0;
	if (x + w > SCR_WDTH) w = SCR_WDTH - x;
	if (h > y + 1) h = y + 1;
	if (w <= leftSkip || h <= 0) return;
	const src = symbol.data;
	let dstRow = (SCR_HGHT - 1 - y) * VID_PITCH + x + leftSkip;
	let srcRow = 0;
	for (let y1 = 0; y1 < h; y1++) {
		for (let x1 = leftSkip; x1 < w; x1++) {
			const i = src[srcRow + x1];
			if (i) vidBuffer[dstRow + (x1 - leftSkip)] ^= mapping[i];
		}
		srcRow += symbol.w;
		dstRow += VID_PITCH;
	}
}

// Draw line-mode ground from src/video.c:105. `gptr` is a Int32Array (or
// number[]) of column heights; `xstart` is the screen column to start
// at; `w` is the number of columns to draw. Heights are clamped to
// SCR_HGHT-1; each column XORs a vertical run of pixels.
export function dispGround(gptr, gOffset, xstart, w) {
	const SCR_H_MINUS_1 = SCR_HGHT - 1;
	let g = gOffset;
	let sptr = xstart; // We track sptr as a vidBuffer index.
	let y = SCR_H_MINUS_1; // initial vram-row index
	let hc = Math.min(gptr[g++], SCR_H_MINUS_1);
	let hl = hc;
	let hr;
	for (let x = 0; x < w - 1; x++) {
		hr = Math.min(gptr[g++], SCR_H_MINUS_1);
		if (y > hl) {
			sptr += VID_PITCH * (y - hl);
			y = hl;
		}
		if (y > hr) {
			sptr += VID_PITCH * (y - hr);
			y = hr;
		}
		if (y >= hc) {
			sptr += VID_PITCH * (y - hc + 1);
			y = hc - 1;
		}
		while (y < hc) {
			y++;
			sptr -= VID_PITCH;
			vidBuffer[sptr] ^= 0x3;
		}
		hl = hc;
		hc = hr;
		sptr++;
	}
	sptr += (y - hc) * VID_PITCH;
	vidBuffer[sptr] ^= 0x3;
}

// Solid-fill ground from src/video.c:160. SBAR_HGHT (status bar height)
// is 19 lines.
const SBAR_HGHT = 19;
export function dispGroundSolid(gptr, gOffset, xstart, w) {
	const SCR_H_MINUS_1 = SCR_HGHT - 1;
	for (let x = xstart, gi = gOffset; x < xstart + w; x++) {
		const gc = Math.min(gptr[gi++], SCR_H_MINUS_1);
		let sptr = (SCR_H_MINUS_1 - SBAR_HGHT) * VID_PITCH + x;
		for (let y = gc - SBAR_HGHT + 1; y > 0; y--) {
			vidBuffer[sptr] ^= 3;
			sptr -= VID_PITCH;
		}
	}
}

// Active palette controls.
export function setVideoPalette(i) {
	if (i >= 0 && i < VIDEO_PALETTES.length) activePalette = i;
}
export function getVideoPaletteName(i) {
	return VIDEO_PALETTES[i]?.name ?? "";
}
export function getNumVideoPalettes() {
	return VIDEO_PALETTES.length;
}
export function getActivePaletteIndex() {
	return activePalette;
}

export function present() {
	if (!ctx) return;
	const lut = VIDEO_PALETTES[activePalette].colors;
	const out = pixels32;
	const buf = vidBuffer;
	for (let i = 0; i < VRAM_SIZE; i++) out[i] = lut[buf[i] & 3];
	ctx.putImageData(imageData, 0, 0);
}

// For tests/inspection.
export const _palettes = VIDEO_PALETTES;
