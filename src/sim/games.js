// Mission file consumer ported from src/swgames.c.
//
// Builds a `GAMES` object from a parsed yocton tree:
//   { gm_objects: original_ob_t[], gm_num_objects, gm_ground: Int32Array,
//     gm_max_x, gm_rseed }
// plus parsed sprite overrides (`symbols { ... }`) and title-screen
// instructions (`title { ... }`). Sprite overrides return as a map
// `{ [name]: { [frame]: text } }` so Phase 8 can apply them after the
// base symset has been generated.

import { parseYocton } from "./yocton.js";
import { OBTYPE, FACTION, TRANSFORM, GROUND_RENDER, createOriginalOb, createGames } from "./types.js";

const OBTYPE_NAMES = [
	"GROUND", "PLANE", "BOMB", "SHOT", "TARGET",
	"EXPLOSION", "SMOKE", "FLOCK", "BIRD", "OX",
	"MISSILE", "STARBURST", "BALLOON", "POWERUP",
];

const TRANSFORM_NAMES = [
	"NONE", "ROTATE90", "ROTATE180", "ROTATE270",
	"FLIP", "FLIP_ROTATE90", "MIRROR", "MIRROR_ROTATE90",
];

const FACTION_NAMES = [
	"NONE", "PLAYER1", "PLAYER2", "PLAYER3", "PLAYER4",
	"PLAYER5", "PLAYER6", "PLAYER7", "PLAYER8",
];

const TEXT_ALIGN = Object.freeze({ LEFT: 0, CENTER: 1, RIGHT: 2 });
const TEXT_ALIGN_NAMES = ["LEFT", "CENTER", "RIGHT"];

function lookupEnum(names, value, fallback) {
	if (value == null) return fallback;
	const idx = names.indexOf(value);
	if (idx >= 0) return idx;
	const n = parseInt(value, 10);
	return Number.isFinite(n) ? n : fallback;
}

function readObject(yo) {
	const ob = createOriginalOb();
	for (const p of yo.props) {
		if (p.type !== "string") continue;
		switch (p.name) {
			case "x": ob.x = parseInt(p.value, 10) || 0; break;
			case "orient": ob.orient = parseInt(p.value, 10) || 0; break;
			case "territory_l": ob.territory_l = parseInt(p.value, 10) || 0; break;
			case "territory_r": ob.territory_r = parseInt(p.value, 10) || 0; break;
			case "transform": ob.transform = lookupEnum(TRANSFORM_NAMES, p.value, TRANSFORM.NONE); break;
			case "type": ob.type = lookupEnum(OBTYPE_NAMES, p.value, OBTYPE.DUMMYTYPE); break;
			case "faction":
			case "owner": // legacy alias from src/swgames.c:339
				ob.faction = lookupEnum(FACTION_NAMES, p.value, FACTION.NONE);
				break;
		}
	}
	return ob;
}

// `ground { _: 199 _: 199 ... }` — ground heightmap. The C parser uses
// repeated `_:` props for each column.
function readGround(yo) {
	const out = [];
	for (const p of yo.props) {
		if (p.name === "_" && p.type === "string") {
			const n = parseInt(p.value, 10);
			if (Number.isFinite(n)) out.push(n);
		}
	}
	return Int32Array.from(out);
}

function processLevel(games, levelObj) {
	for (const p of levelObj.props) {
		if (p.name === "object" && p.type === "object") {
			games.gm_objects.push(readObject(p.value));
		} else if (p.name === "ground" && p.type === "object") {
			games.gm_ground = readGround(p.value);
			games.gm_max_x = games.gm_ground.length;
		}
	}
	games.gm_num_objects = games.gm_objects.length;
}

// Sprite overrides: `symbols { name { 0: "..." 1: "..." } ... }`.
// Returns a map keyed by sprite name -> array of frame texts (sparse).
function processSymbols(symbolsObj) {
	const out = {};
	for (const p of symbolsObj.props) {
		if (p.type !== "object") continue;
		const frames = {};
		for (const fp of p.value.props) {
			if (fp.type !== "string") continue;
			const frameNum = parseInt(fp.name, 10);
			if (Number.isFinite(frameNum) && frameNum >= 0 && frameNum < 256) {
				frames[frameNum] = fp.value;
			}
		}
		out[p.name] = frames;
	}
	return out;
}

function processSounds(soundsObj) {
	return {
		title_tune: soundsObj.getString("title_tune", null),
	};
}

function processTitle(titleObj) {
	const items = []; // ordered list of title-screen instructions
	for (const p of titleObj.props) {
		if (p.type !== "object") continue;
		const inner = p.value;
		switch (p.name) {
			case "text": {
				items.push({
					kind: "text",
					text: inner.getString("text", ""),
					x: inner.getInt("x", 0),
					y: inner.getInt("y", 0),
					color: inner.getInt("color", 3),
					align: lookupEnum(TEXT_ALIGN_NAMES, inner.getString("align", null), TEXT_ALIGN.LEFT),
				});
				break;
			}
			case "ground":
				items.push({ kind: "ground", render: GROUND_RENDER.PREF, ground: readGround(inner) });
				break;
			case "ground_line":
				items.push({ kind: "ground", render: GROUND_RENDER.LINE, ground: readGround(inner) });
				break;
			case "ground_solid":
				items.push({ kind: "ground", render: GROUND_RENDER.SOLID, ground: readGround(inner) });
				break;
			case "symbol":
				items.push({
					kind: "symbol",
					name: inner.getString("name", null),
					x: inner.getInt("x", 0),
					y: inner.getInt("y", 0),
					frame: inner.getInt("frame", 0),
					transform: lookupEnum(TRANSFORM_NAMES, inner.getString("transform", null), TRANSFORM.NONE),
					faction: lookupEnum(FACTION_NAMES, inner.getString("faction", null), FACTION.PLAYER1),
				});
				break;
			case "line":
				items.push({
					kind: "line",
					x1: inner.getInt("x1", -1),
					y1: inner.getInt("y1", -1),
					x2: inner.getInt("x2", -1),
					y2: inner.getInt("y2", -1),
					color: inner.getInt("color", 3),
				});
				break;
		}
	}
	return items;
}

// Top-level entry. Returns:
//   { games, symbols, sounds, title }
// `games` follows the C `GAMES` struct shape; the other fields are
// populated only if the corresponding top-level block existed.
export function loadMission(text) {
	const root = parseYocton(text);
	const games = createGames();
	games.gm_rseed = 12345;
	let symbols = {};
	let sounds = null;
	let title = null;

	for (const p of root.props) {
		if (p.type !== "object") continue;
		switch (p.name) {
			case "level":
				processLevel(games, p.value);
				break;
			case "symbols":
				symbols = processSymbols(p.value);
				break;
			case "sounds":
				sounds = processSounds(p.value);
				break;
			case "title":
				title = processTitle(p.value);
				break;
		}
	}

	return { games, symbols, sounds, title };
}

export { TEXT_ALIGN };
