// Sprite parser ported from src/swsymbol.c.
//
// Sprites are stored as ASCII grids in mission (.sop) files. Two source
// columns make one sprite pixel, so a 32-char-wide line is a 16-wide
// sprite. Color characters are " *-#" (0..3); other chars are treated
// as transparent (0).
//
// For each text grid we produce a `symset` of 8 rotations: 0/90/180/270
// + the same four mirrored, matching `SymsetFromText` in
// `src/swsymbol.c:1344`.

const COLOR_CHARS = " *-#";

function getDimensions(text) {
	let w = 0;
	let h = 0;
	let i = 0;
	while (i < text.length) {
		const lineStart = i;
		while (i < text.length && text[i] !== "\n") i++;
		const lineEnd = i;
		if (i === text.length && lineStart === lineEnd) break;
		w = Math.max(w, ((lineEnd - lineStart) + 1) >> 1);
		h++;
		if (i < text.length) i++;
	}
	return { w, h };
}

// In-place rotation/mirror matching `Rotate` in src/swsymbol.c:1262.
// Returns [dx, dy].
function rotate(x, y, w, h, rotations, mirror) {
	for (let i = 0; i < rotations; i++) {
		const tmp = x;
		x = y;
		y = w - 1 - tmp;
		const tw = w;
		w = h;
		h = tw;
	}
	if (mirror) y = h - 1 - y;
	return [x, y];
}

function sopsymFromText(text, rotations, mirror) {
	const { w, h } = getDimensions(text);
	const outW = (rotations & 1) === 0 ? w : h;
	const outH = (rotations & 1) === 0 ? h : w;
	const data = new Uint8Array(outW * outH);

	let x = 0, y = 0;
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (ch === "\n") {
			x = 0;
			y++;
			continue;
		}
		const ci = COLOR_CHARS.indexOf(ch);
		const c = ci < 0 ? 0 : ci;
		if (x < w * 2 && y < h && (x % 2) === 0) {
			const [dx, dy] = rotate(x >> 1, y, w, h, rotations, mirror);
			data[dy * outW + dx] = c;
		}
		x++;
	}
	return { data, w: outW, h: outH };
}

// Build a symset = 4 rotations + 4 mirrored rotations.
export function symsetFromText(text) {
	const sym = new Array(8);
	for (let r = 0; r < 4; r++) {
		sym[r] = sopsymFromText(text, r, false);
		sym[r + 4] = sopsymFromText(text, r, true);
	}
	return { sym, name: "", frame: 0 };
}

// Single-pixel sprite used for bullets etc. (src/swsymbol.c:1399)
export const symbolPixel = { data: new Uint8Array([3]), w: 1, h: 1 };
