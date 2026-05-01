// Persistent config — replaces src/swconf.c (sopwith.cfg) with a single
// versioned blob in localStorage["sopwith.config"].
//
// Schema v1:
//   {
//     version: 1,
//     conf:   { conf_missiles, conf_solidground, conf_hudsplats,
//               conf_wounded, conf_animals, conf_harrykeys,
//               conf_big_explosions, conf_medals, conf_video_palette },
//     keys:   { <gamekey-id>: <KeyboardEvent.code>, ... },
//   }
//
// Anything not recognized at load time is ignored; missing fields keep
// their compiled-in defaults. Bumping `version` and adding a migration
// here is the way to evolve the schema without losing existing saves.

import { state } from "./state.js";
import { setKeyBinding, getKeyBinding } from "../input.js";
import {
	KEY_PULLUP,
	KEY_PULLDOWN,
	KEY_FLIP,
	KEY_BOMB,
	KEY_FIRE,
	KEY_HOME,
	KEY_MISSILE,
	KEY_STARBURST,
	KEY_ACCEL,
	KEY_DECEL,
	KEY_SOUND,
} from "../input.js";

const STORAGE_KEY = "sopwith.config";
const VERSION = 1;

const BOOL_FLAGS = [
	"conf_missiles",
	"conf_solidground",
	"conf_hudsplats",
	"conf_wounded",
	"conf_animals",
	"conf_harrykeys",
	"conf_big_explosions",
	"conf_medals",
];
const INT_FLAGS = ["conf_video_palette"];

const BINDABLE_KEYS = [
	KEY_PULLUP, KEY_PULLDOWN, KEY_FLIP, KEY_BOMB, KEY_FIRE,
	KEY_HOME, KEY_MISSILE, KEY_STARBURST, KEY_ACCEL, KEY_DECEL, KEY_SOUND,
];

function readStorage() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed || parsed.version !== VERSION) {
			console.warn(`config: unrecognized version ${parsed?.version} — ignoring`);
			return null;
		}
		return parsed;
	} catch (e) {
		console.warn("config: failed to parse, resetting", e);
		return null;
	}
}

export function loadConfig() {
	const blob = readStorage();
	if (!blob) return;

	const conf = blob.conf || {};
	for (const k of BOOL_FLAGS) {
		if (typeof conf[k] === "boolean") state[k] = conf[k];
	}
	for (const k of INT_FLAGS) {
		if (Number.isInteger(conf[k])) state[k] = conf[k];
	}

	const keys = blob.keys || {};
	for (const gk of BINDABLE_KEYS) {
		const code = keys[gk];
		if (typeof code === "string" && code.length > 0) {
			setKeyBinding(gk, code);
		}
	}
}

export function saveConfig() {
	const conf = {};
	for (const k of BOOL_FLAGS) conf[k] = !!state[k];
	for (const k of INT_FLAGS) conf[k] = state[k] | 0;

	const keys = {};
	for (const gk of BINDABLE_KEYS) {
		const code = getKeyBinding(gk);
		if (code) keys[gk] = code;
	}

	try {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ version: VERSION, conf, keys }),
		);
	} catch (e) {
		console.warn("config: save failed", e);
	}
}
