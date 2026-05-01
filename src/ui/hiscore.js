// High-score table renderer + new-score name-entry overlay.
// Draws the same TOP PILOTS table the C build shows on the title
// screen, and provides a small in-canvas name prompt activated when a
// player score qualifies.

import { SCR_HGHT } from "../sim/constants.js";
import { box } from "../video.js";
import { swcolor, swposcur, swputs } from "../sim/text.js";
import {
	getHighScores,
	addHighScore,
	isNewHighScore,
	MAX_HIGH_SCORES,
} from "../sim/hiscore.js";

const TABLE_X = 9;
const TABLE_Y = 1;
const TABLE_W = 23;
const TABLE_H = 13;

export function drawHighScoreTable() {
	const scores = getHighScores();

	// Black-out background patch (matches src/hiscore.c:294).
	box(TABLE_X * 8 - 8, SCR_HGHT - TABLE_Y * 8 + 4, TABLE_W * 8 + 8, TABLE_H * 8, 0);

	swcolor(2);
	swposcur(TABLE_X + 3, TABLE_Y);
	swputs("TOP PILOTS");

	swcolor(3);
	for (let i = 0; i < MAX_HIGH_SCORES; i++) {
		const hs = scores[i];
		if (!hs) continue;
		swposcur(TABLE_X, TABLE_Y + 2 + i);
		const padded = (hs.name || "").padEnd(3, " ").slice(0, 3);
		const score = String(hs.score | 0).padStart(4, " ");
		swputs(`${padded} ....... ${score}`);
	}
}

// --- Name-entry overlay ----------------------------------------------
//
// While active, gameplay is paused and the title scene defers — main.js
// drives the prompt via handleHiScoreKey/drawHiScoreEntry. On Enter we
// commit, save, and call the supplied onDone() callback.

let entryActive = false;
let entryScore = null;
let entryName = "";
let entryOnDone = null;

export function startHiScoreEntry(score, onDone) {
	if (!isNewHighScore(score)) {
		onDone?.(-1);
		return false;
	}
	entryActive = true;
	entryScore = score;
	entryName = "";
	entryOnDone = onDone;
	return true;
}

export function isHiScoreEntryActive() {
	return entryActive;
}

export function handleHiScoreKey(e) {
	if (!entryActive) return false;

	if (e.code === "Enter" || e.code === "NumpadEnter") {
		const name = (entryName || "AAA").slice(0, 3).toUpperCase();
		const idx = addHighScore(name, entryScore);
		const cb = entryOnDone;
		entryActive = false;
		entryScore = null;
		entryName = "";
		entryOnDone = null;
		cb?.(idx);
		e.preventDefault();
		return true;
	}

	if (e.code === "Escape") {
		const cb = entryOnDone;
		entryActive = false;
		entryScore = null;
		entryName = "";
		entryOnDone = null;
		cb?.(-1);
		e.preventDefault();
		return true;
	}

	if (e.code === "Backspace") {
		entryName = entryName.slice(0, -1);
		e.preventDefault();
		return true;
	}

	// Single character — accept letters and digits, cap at 3.
	const ch = e.key.length === 1 ? e.key.toUpperCase() : "";
	if (ch && /^[A-Z0-9]$/.test(ch) && entryName.length < 3) {
		entryName += ch;
		e.preventDefault();
		return true;
	}
	return false;
}

export function drawHiScoreEntry() {
	if (!entryActive) return;

	drawHighScoreTable();

	swcolor(2);
	swposcur(2, 15);
	swputs("NEW HIGH SCORE!");
	swcolor(3);
	swposcur(2, 17);
	const score = String(entryScore?.score | 0).padStart(4, " ");
	const padded = entryName.padEnd(3, " ").slice(0, 3);
	swputs(`${padded} ....... ${score}`);

	swposcur(TABLE_X - 1, 17);
	swputs("[    ]");

	// Cursor — blink the next-char slot.
	const showCursor = (Math.floor(performance.now() / 400) & 1) === 0;
	if (showCursor && entryName.length < 3) {
		swposcur(TABLE_X + entryName.length, 17);
		swputs("_");
	}

	swcolor(1);
	swposcur(1, 22);
	swputs("   ENTER - Save     ESC - Skip");
}
