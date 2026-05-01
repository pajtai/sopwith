// Symset registry. Mirrors the static symset arrays declared in
// src/swsymbol.c:1377-1395 (`symbol_plane`, `symbol_bomb`, etc).
// Mission files supply the ASCII grids in their `symbols { ... }` block;
// this module turns each frame into a symset (8 rotations).

import { symsetFromText, symbolPixel } from "./symbol.js";
import { NUM_TARGET_TYPES, NUM_POWERUP_TYPES } from "./types.js";

// Frame-count expectations from src/swsymbol.c:1377.
const REGISTRY = [
	{ key: "symbol_bomb",              name: "swbmbsym",        frames: 2 },
	{ key: "symbol_targets",           name: "swtrgsym",        frames: NUM_TARGET_TYPES },
	{ key: "symbol_target_hit",        name: "swhtrsym",        frames: NUM_TARGET_TYPES },
	{ key: "symbol_debris",            name: "swexpsym",        frames: 8 },
	{ key: "symbol_flock",             name: "swflksym",        frames: 2 },
	{ key: "symbol_bird",              name: "swbrdsym",        frames: 2 },
	{ key: "symbol_ox",                name: "swoxsym",         frames: 2 },
	{ key: "symbol_shotwin",           name: "swshtsym",        frames: 1 },
	{ key: "symbol_birdsplat",         name: "swsplsym",        frames: 1 },
	{ key: "symbol_missile",           name: "swmscsym",        frames: 4 },
	{ key: "symbol_burst",             name: "swbstsym",        frames: 2 },
	{ key: "symbol_plane",             name: "swplnsym",        frames: 4 },
	{ key: "symbol_plane_hit",         name: "swhitsym",        frames: 4 },
	{ key: "symbol_plane_win",         name: "swwinsym",        frames: 4 },
	{ key: "symbol_medal",             name: "swmedalsym",      frames: 3 },
	{ key: "symbol_ribbon",            name: "swribbonsym",     frames: 6 },
	{ key: "symbol_balloon",           name: "swballoonsym",    frames: 6 },
	{ key: "symbol_powerups",          name: "swpowerupsym",    frames: NUM_POWERUP_TYPES },
	{ key: "symbol_powerup_collected", name: "swpowercollsym",  frames: NUM_POWERUP_TYPES },
];

export const symbols = {
	symbol_pixel: symbolPixel,
};

// Stub-symset for frames the mission omits. 1x1 transparent pixel.
function placeholderSymset() {
	const empty = { data: new Uint8Array(1), w: 1, h: 1 };
	return { sym: [empty, empty, empty, empty, empty, empty, empty, empty], name: "", frame: 0 };
}

export function buildSymbols(missionSymbols) {
	for (const entry of REGISTRY) {
		const frames = missionSymbols[entry.name] || {};
		const arr = new Array(entry.frames);
		for (let i = 0; i < entry.frames; i++) {
			const text = frames[i];
			if (typeof text === "string" && text.length > 0) {
				const ss = symsetFromText(text);
				ss.name = entry.name;
				ss.frame = i;
				arr[i] = ss;
			} else {
				arr[i] = placeholderSymset();
			}
		}
		symbols[entry.key] = arr;
	}
	return symbols;
}
