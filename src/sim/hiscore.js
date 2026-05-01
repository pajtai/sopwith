// High score table — port of src/hiscore.c. Persists to
// localStorage["sopwith.hiscores"] as a versioned JSON blob.
//
// Schema v1:
//   {
//     version: 1,
//     scores: [
//       { name: "DLC", score: 6500,
//         medals_nr: 0, medals: [0,0,0],
//         ribbons_nr: 0, ribbons: [0,0,0,0,0,0] },
//       ...
//     ]
//   }
//
// Default table comes from src/hiscore.c:43 verbatim — same names, same
// score thresholds, so a fresh install matches the C build.

const STORAGE_KEY = "sopwith.hiscores";
const VERSION = 1;
export const MAX_HIGH_SCORES = 10;

function makeScore(name, score) {
	return {
		name,
		score,
		medals_nr: 0,
		medals: [0, 0, 0],
		ribbons_nr: 0,
		ribbons: [0, 0, 0, 0, 0, 0],
	};
}

const DEFAULTS = [
	["DLC", 6500], // David L. Clark
	["DG",  6000], // Dave Growden (Ox)
	["JHC", 5500], // Jack Cole
	["JS",  5000], // Jesse Smith
	["JH",  4500], // Josh Horowitz
	["CR",  4000], // Christoph Reichenbach
	["AMJ", 3500], // Andrew Jenner
	["HJM", 3000], // Harry Mason
	["BMB", 2500], // BMB Compuscience
	["SDH", 2000], // Simon Howard
];

let highScores = DEFAULTS.map(([n, s]) => makeScore(n, s));

export function getHighScores() {
	return highScores;
}

function sanitizeEntry(raw) {
	if (!raw || typeof raw !== "object") return null;
	const name = typeof raw.name === "string" ? raw.name.slice(0, 3) : "";
	const score = Number.isFinite(raw.score) ? raw.score | 0 : 0;
	const e = makeScore(name, score);
	if (Number.isInteger(raw.medals_nr)) e.medals_nr = Math.max(0, Math.min(3, raw.medals_nr));
	if (Array.isArray(raw.medals)) {
		for (let i = 0; i < 3 && i < raw.medals.length; i++) e.medals[i] = raw.medals[i] | 0;
	}
	if (Number.isInteger(raw.ribbons_nr)) e.ribbons_nr = Math.max(0, Math.min(6, raw.ribbons_nr));
	if (Array.isArray(raw.ribbons)) {
		for (let i = 0; i < 6 && i < raw.ribbons.length; i++) e.ribbons[i] = raw.ribbons[i] | 0;
	}
	return e;
}

export function loadHiScores() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return;
		const blob = JSON.parse(raw);
		if (!blob || blob.version !== VERSION || !Array.isArray(blob.scores)) {
			console.warn(`hiscore: bad blob — keeping defaults`);
			return;
		}
		const next = [];
		for (const entry of blob.scores) {
			const ok = sanitizeEntry(entry);
			if (ok) next.push(ok);
			if (next.length >= MAX_HIGH_SCORES) break;
		}
		while (next.length < MAX_HIGH_SCORES) {
			next.push(DEFAULTS[next.length] ? makeScore(...DEFAULTS[next.length]) : makeScore("", 0));
		}
		highScores = next;
	} catch (e) {
		console.warn("hiscore: load failed, keeping defaults", e);
	}
}

export function saveHiScores() {
	try {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ version: VERSION, scores: highScores }),
		);
	} catch (e) {
		console.warn("hiscore: save failed", e);
	}
}

// Rank logic from src/hiscore.c:309 — score, then medals_nr, then
// ribbons_nr. `a > b` iff a beats b.
function compare(a, b) {
	if (a.score !== b.score) return a.score - b.score;
	if (a.medals_nr !== b.medals_nr) return a.medals_nr - b.medals_nr;
	if (a.ribbons_nr !== b.ribbons_nr) return a.ribbons_nr - b.ribbons_nr;
	return 0;
}

// Returns the insert index for a new score, or -1 if it doesn't qualify.
export function newHighScoreIndex(score) {
	const candidate = sanitizeEntry({ name: "", ...score });
	if (!candidate) return -1;
	for (let i = 0; i < MAX_HIGH_SCORES; i++) {
		if (compare(candidate, highScores[i]) > 0) return i;
	}
	return -1;
}

export function isNewHighScore(score) {
	return newHighScoreIndex(score) >= 0;
}

// Insert at the qualifying index, push lower entries down, drop tail.
// Returns the inserted index, or -1 if the score didn't qualify.
export function addHighScore(name, score) {
	const idx = newHighScoreIndex(score);
	if (idx < 0) return -1;
	const entry = sanitizeEntry({ name, ...score });
	if (!entry) return -1;
	highScores.splice(idx, 0, entry);
	highScores.length = MAX_HIGH_SCORES;
	saveHiScores();
	return idx;
}
