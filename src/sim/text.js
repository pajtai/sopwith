// Bitmap text rendering — port of src/swtext.c.
//
// Cursor is in 8-pixel character cells, top-left origin. plotPixel uses
// game-y (0 = bottom of screen), so each glyph's top-left game-y is
// SCR_HGHT - 1 - (curY*8) and rows descend in game-y as we walk down
// the glyph.

import { FONT_DATA, CP437 } from "./font.js";
import { SCR_HGHT } from "./constants.js";
import { plotPixel } from "../video.js";

let curX = 0;
let curY = 0;
let curColor = 3;

function unicodeToCp437(u) {
	if (u < CP437.length && CP437[u] === u) return u;
	for (let i = 0; i < CP437.length; i++) if (CP437[i] === u) return i;
	return 0;
}

function drawChar(px, topGameY, codePoint) {
	const c = unicodeToCp437(codePoint);
	if (c === 0) return;
	const off = c * 8;
	for (let y2 = 0; y2 < 8; y2++) {
		let m = 0x80;
		const row = FONT_DATA[off + y2];
		for (let x2 = 0; x2 < 8; x2++) {
			if (row & m) plotPixel(px + x2, topGameY - y2, curColor);
			m >>= 1;
		}
	}
}

function decodeUtf8(s, i) {
	const c = s.charCodeAt(i);
	if (c < 0x80) return [c, 1];
	const cp = s.codePointAt(i);
	return [cp, cp > 0xffff ? 2 : 1];
}

export function swcolor(c) { curColor = c & 0x7f; }
export function swposcur(x, y) { curX = x; curY = y; }
export function getCursorPosition() { return { x: curX, y: curY }; }

export function swputc(codePoint) {
	if (codePoint === 0x0a) {
		curX = 0;
		curY++;
		return;
	}
	drawChar(curX * 8, SCR_HGHT - 1 - curY * 8, codePoint);
	curX++;
}

export function swputs(s) {
	for (let i = 0; i < s.length; ) {
		const [cp, len] = decodeUtf8(s, i);
		swputc(cp);
		i += len;
	}
}

export function utf8Strlen(s) {
	let n = 0;
	for (let i = 0; i < s.length; ) {
		const [, len] = decodeUtf8(s, i);
		i += len;
		n++;
	}
	return n;
}
