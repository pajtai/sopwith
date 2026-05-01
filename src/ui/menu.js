// Menu system. Adapted from src/swmenu.c — the C version blocks on
// Vid_GetChar in a busy loop; we run event-driven, rendering the
// current menu each frame and consuming keypresses asynchronously.
//
// A menu is `{ title, items: [{key, label, action, ...}], parent? }`.
// `action` runs on selection; if it returns "back" or undefined the
// menu pops to its parent (or closes if no parent).

import { SCR_WDTH, SCR_HGHT } from "../sim/constants.js";
import { state } from "../sim/state.js";
import { box, drawSymbol } from "../video.js";
import { swcolor, swposcur, swputs, utf8Strlen } from "../sim/text.js";
import { symbols } from "../sim/symbols.js";
import { FACTION } from "../sim/types.js";

const MENU_KEYS = "1234567890ABCDEFGHIJKL";

let stack = [];
let selected = 0;

export function isMenuOpen() {
	return stack.length > 0;
}

export function openMenu(menu) {
	stack = [menu];
	selected = 0;
}

export function closeMenu() {
	stack = [];
	selected = 0;
}

function pushMenu(menu) {
	stack.push(menu);
	selected = 0;
}

function popMenu() {
	stack.pop();
	selected = 0;
}

function currentMenu() {
	return stack.length === 0 ? null : stack[stack.length - 1];
}

// ----- rendering -----------------------------------------------------------

function drawBackground(menu) {
	// Decorative planes on either side of the title (src/swmenu.c:117).
	const titleLen = utf8Strlen(menu.title || "");
	const xCell = 19 - (titleLen >> 1);
	const planeL = symbols.symbol_plane?.[0]?.sym?.[0];
	const planeR = symbols.symbol_plane?.[0]?.sym?.[6];
	if (planeL) drawSymbol(xCell * 8 - 32, SCR_HGHT - 10, planeL, FACTION.PLAYER1);
	if (planeR) drawSymbol((xCell + titleLen) * 8 + 16, SCR_HGHT - 10, planeR, FACTION.PLAYER2);

	swcolor(2);
	swposcur(xCell, 2);
	swputs(menu.title || "");

	swcolor(1);
	swposcur(1, 22);
	swputs("   ESC - Exit Menu");
}

export function drawMenuScene() {
	const menu = currentMenu();
	if (!menu) return;

	// Black background fill.
	box(0, SCR_HGHT - 1, SCR_WDTH - 1, SCR_HGHT - 1, 0);

	drawBackground(menu);

	swposcur(0, 5);
	swcolor(3);

	let keyNum = 0;
	const renderedKeys = [];
	let row = 5;

	for (let i = 0; i < menu.items.length; i++) {
		const item = menu.items[i];
		if (!item.label) continue;

		let key = item.key;
		let suffix = "";
		if (key === "1") {
			key = MENU_KEYS[keyNum++];
			suffix = ":";
		}
		renderedKeys.push({ key, item });

		const isSel = i === selected;
		const prefix = isSel ? "   \x1a" : "";
		swcolor(isSel ? 2 : item.label.includes(">>>") ? 2 : 3);

		swposcur(0, row);
		const label = item.label;
		const text = `${prefix.padEnd(5, " ")}${key} - ${label}${suffix}`;
		swputs(text);

		if (item.value !== undefined) {
			swposcur(28, row);
			swputs(item.value());
		}
		row++;
	}

	return renderedKeys;
}

// ----- input ---------------------------------------------------------------

function findItemForKey(menu, key) {
	let keyNum = 0;
	for (const item of menu.items) {
		if (!item.label) continue;
		let k = item.key;
		if (k === "1") {
			k = MENU_KEYS[keyNum++];
		}
		if (k && key.toUpperCase() === k.toUpperCase()) return item;
	}
	return null;
}

function moveSelection(menu, dir) {
	let next = selected;
	for (;;) {
		next += dir;
		if (next < 0 || next >= menu.items.length) return;
		if (menu.items[next].label) {
			selected = next;
			return;
		}
	}
}

export function handleMenuKey(e) {
	const menu = currentMenu();
	if (!menu) return false;

	if (e.code === "Escape") {
		if (stack.length > 1) popMenu();
		else closeMenu();
		e.preventDefault();
		return true;
	}

	if (e.code === "ArrowUp") {
		moveSelection(menu, -1);
		e.preventDefault();
		return true;
	}
	if (e.code === "ArrowDown") {
		moveSelection(menu, 1);
		e.preventDefault();
		return true;
	}
	if (e.code === "Enter" || e.code === "NumpadEnter" || e.code === "Space") {
		const item = menu.items[selected];
		if (item?.action) runAction(item);
		e.preventDefault();
		return true;
	}

	// Letter/number key — match against item keys.
	const ch = e.key.length === 1 ? e.key : "";
	if (ch) {
		const item = findItemForKey(menu, ch);
		if (item?.action) {
			runAction(item);
			e.preventDefault();
			return true;
		}
	}

	return false;
}

function runAction(item) {
	const result = item.action();
	if (result && typeof result === "object" && result.menu) {
		pushMenu(result.menu);
	} else if (result === "back") {
		if (stack.length > 1) popMenu();
		else closeMenu();
	} else if (result === "close") {
		closeMenu();
	}
}

// Capture-and-rebind input flow. While a key-rebind menu is active, the
// next non-Escape key event is captured and stored on the binding.
let rebindTarget = null;
let rebindLabel = "";

export function startKeyRebind({ label, onRebind }) {
	rebindTarget = onRebind;
	rebindLabel = label;
}

export function isRebinding() {
	return rebindTarget !== null;
}

export function drawRebindOverlay() {
	if (!rebindTarget) return;
	box(0, SCR_HGHT - 1, SCR_WDTH - 1, SCR_HGHT - 1, 0);
	swcolor(3);
	swposcur(10, 5);
	swputs("Press the new key for: ");
	swcolor(2);
	swposcur(14, 7);
	swputs(rebindLabel);
	swcolor(1);
	swposcur(1, 22);
	swputs("   ESC - Cancel");
}

export function handleRebindKey(e) {
	if (!rebindTarget) return false;
	if (e.code === "Escape") {
		rebindTarget = null;
		e.preventDefault();
		return true;
	}
	// Ignore pure modifier presses.
	if (e.code.startsWith("Shift") || e.code.startsWith("Control") ||
		e.code.startsWith("Alt") || e.code.startsWith("Meta")) {
		return true;
	}
	const cb = rebindTarget;
	rebindTarget = null;
	cb(e.code);
	e.preventDefault();
	return true;
}
