// Input handling — keyboard + touch.
// Mirrors src/video.c:43 (`Vid_GetGameKeys`) and src/sdl/video.c:99
// (default `keybindings` table). Maintains a `keysdown[NUM_KEYS]` array
// of bit-flags so the simulation stays unaware of the input source.

import {
	K_ACCEL,
	K_DEACC,
	K_FLAPU,
	K_FLAPD,
	K_FLIP,
	K_SHOT,
	K_BOMB,
	K_HOME,
	K_SOUND,
	K_MISSILE,
	K_STARBURST,
} from "./sim/constants.js";

// `gamekey` enum from src/video.h:24.
export const KEY_UNKNOWN = 0;
export const KEY_PULLUP = 1;
export const KEY_PULLDOWN = 2;
export const KEY_FLIP = 3;
export const KEY_BOMB = 4;
export const KEY_FIRE = 5;
export const KEY_HOME = 6;
export const KEY_MISSILE = 7;
export const KEY_STARBURST = 8;
export const KEY_ACCEL = 9;
export const KEY_DECEL = 10;
export const KEY_SOUND = 11;
export const NUM_KEYS = 12;

// Per-key bit flags, src/video.h:51.
export const KEYDOWN_KEYBOARD = 1 << 0;
export const KEYDOWN_WAS_PRESSED = 1 << 1;
export const KEYDOWN_TOUCH = 1 << 2;
export const KEYDOWN_GAMEPAD = 1 << 3;

export const keysdown = new Int32Array(NUM_KEYS);

// Default bindings — KeyboardEvent.code values matching the SDL scancodes
// in src/sdl/video.c:99.
const DEFAULT_BINDINGS = {
	[KEY_PULLUP]: "Comma",
	[KEY_PULLDOWN]: "Slash",
	[KEY_FLIP]: "Period",
	[KEY_BOMB]: "KeyB",
	[KEY_FIRE]: "Space",
	[KEY_HOME]: "KeyH",
	[KEY_MISSILE]: "KeyV",
	[KEY_STARBURST]: "KeyC",
	[KEY_ACCEL]: "KeyX",
	[KEY_DECEL]: "KeyZ",
	[KEY_SOUND]: "KeyS",
};

const codeToKey = new Map();
for (const [k, code] of Object.entries(DEFAULT_BINDINGS)) {
	codeToKey.set(code, Number(k));
}

export function getKeyBinding(gamekey) {
	for (const [code, k] of codeToKey) {
		if (k === gamekey) return code;
	}
	return null;
}

export function setKeyBinding(gamekey, code) {
	for (const [c, k] of [...codeToKey]) {
		if (k === gamekey) codeToKey.delete(c);
	}
	if (code) codeToKey.set(code, gamekey);
}

function translateCode(code) {
	const k = codeToKey.get(code);
	return k === undefined ? KEY_UNKNOWN : k;
}

function clearTransientState() {
	for (let i = 0; i < NUM_KEYS; i++) {
		keysdown[i] &= ~(KEYDOWN_KEYBOARD | KEYDOWN_TOUCH);
	}
}

let initialized = false;

export function initInput(canvasEl) {
	if (initialized) return;
	initialized = true;

	window.addEventListener("keydown", (e) => {
		const k = translateCode(e.code);
		if (k === KEY_UNKNOWN) return;
		// Browser key-repeat would re-set WAS_PRESSED on every repeat; we
		// already have the key down, so only update on the initial press.
		if (!e.repeat) {
			keysdown[k] |= KEYDOWN_KEYBOARD | KEYDOWN_WAS_PRESSED;
		}
		e.preventDefault();
	});

	window.addEventListener("keyup", (e) => {
		const k = translateCode(e.code);
		if (k === KEY_UNKNOWN) return;
		keysdown[k] &= ~KEYDOWN_KEYBOARD;
		e.preventDefault();
	});

	// Tab-away or focus loss: drop all held keys so they don't stick.
	window.addEventListener("blur", clearTransientState);
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) clearTransientState();
	});

	initTouch(canvasEl);
}

// Returns the K_* bitmask consumed by swmove. Mirrors src/video.c:43.
// Edge-triggered keys (FLIP, SOUND, MISSILE, STARBURST) are cleared on
// read so a single press fires once.
export function getGameKeys() {
	let c = 0;

	if (keysdown[KEY_FLIP]) {
		keysdown[KEY_FLIP] = 0;
		c |= K_FLIP;
	}
	if (keysdown[KEY_PULLUP]) c |= K_FLAPU;
	if (keysdown[KEY_PULLDOWN]) c |= K_FLAPD;
	if (keysdown[KEY_ACCEL]) c |= K_ACCEL;
	if (keysdown[KEY_DECEL]) c |= K_DEACC;
	if (keysdown[KEY_SOUND]) {
		keysdown[KEY_SOUND] = 0;
		c |= K_SOUND;
	}
	if (keysdown[KEY_BOMB]) c |= K_BOMB;
	if (keysdown[KEY_FIRE]) c |= K_SHOT;
	if (keysdown[KEY_HOME]) c |= K_HOME;
	if (keysdown[KEY_MISSILE]) {
		keysdown[KEY_MISSILE] = 0;
		c |= K_MISSILE;
	}
	if (keysdown[KEY_STARBURST]) {
		keysdown[KEY_STARBURST] = 0;
		c |= K_STARBURST;
	}

	for (let i = 0; i < NUM_KEYS; i++) {
		keysdown[i] &= ~KEYDOWN_WAS_PRESSED;
	}

	return c;
}

// Touch overlay — DOM-based for now since the canvas-level text renderer
// lands in Phase 9. Mirrors the gameplay buttons from src/touch_area.c:33
// (Stick up/down/flip, Throttle up/down/home, Fire, Bomb).
const TOUCH_BUTTONS = [
	{ label: "▲", key: KEY_PULLUP, group: "stick" },
	{ label: "▼", key: KEY_PULLDOWN, group: "stick" },
	{ label: "Flip", key: KEY_FLIP, group: "stick" },
	{ label: "+", key: KEY_ACCEL, group: "throttle" },
	{ label: "−", key: KEY_DECEL, group: "throttle" },
	{ label: "Home", key: KEY_HOME, group: "throttle" },
	{ label: "Fire", key: KEY_FIRE, group: "actions" },
	{ label: "Bomb", key: KEY_BOMB, group: "actions" },
];

function initTouch(canvasEl) {
	const coarse =
		typeof window.matchMedia === "function" &&
		window.matchMedia("(pointer: coarse)").matches;
	if (!coarse || !canvasEl) return;

	const overlay = document.createElement("div");
	overlay.id = "touch-overlay";
	overlay.style.cssText = [
		"position:fixed",
		"left:0",
		"right:0",
		"bottom:0",
		"display:grid",
		"grid-template-columns:repeat(4,1fr)",
		"gap:6px",
		"padding:8px",
		"z-index:10",
		"user-select:none",
		"-webkit-user-select:none",
		"touch-action:none",
	].join(";");

	for (const { label, key } of TOUCH_BUTTONS) {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.textContent = label;
		btn.dataset.gamekey = String(key);
		btn.style.cssText = [
			"padding:16px 0",
			"font:600 16px/1 system-ui, sans-serif",
			"background:rgba(0,0,0,0.55)",
			"color:#fff",
			"border:1px solid rgba(255,255,255,0.4)",
			"border-radius:8px",
			"touch-action:none",
			"-webkit-tap-highlight-color:transparent",
		].join(";");

		const press = (e) => {
			e.preventDefault();
			if (typeof btn.setPointerCapture === "function" && e.pointerId != null) {
				try {
					btn.setPointerCapture(e.pointerId);
				} catch {
					// ignore capture failures
				}
			}
			keysdown[key] |= KEYDOWN_TOUCH | KEYDOWN_WAS_PRESSED;
			btn.style.background = "rgba(255,255,255,0.3)";
		};
		const release = (e) => {
			e.preventDefault();
			keysdown[key] &= ~KEYDOWN_TOUCH;
			btn.style.background = "rgba(0,0,0,0.55)";
		};

		btn.addEventListener("pointerdown", press);
		btn.addEventListener("pointerup", release);
		btn.addEventListener("pointercancel", release);
		btn.addEventListener("contextmenu", (e) => e.preventDefault());
		overlay.appendChild(btn);
	}

	document.body.appendChild(overlay);
}
