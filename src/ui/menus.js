// Menu definitions. Mirrors the structure of src/swtitle.c (main menu)
// and src/swconf.c (options menu) but adapted for the event-driven JS
// menu system in `./menu.js`.

import { state } from "../sim/state.js";
import { PLAYMODE } from "../sim/types.js";
import {
	getActivePaletteIndex,
	getNumVideoPalettes,
	getVideoPaletteName,
	setVideoPalette,
} from "../video.js";
import {
	getKeyBinding,
	setKeyBinding,
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
import { startKeyRebind } from "./menu.js";
import { saveConfig } from "../sim/config.js";

let availableMissions = [];
export function setAvailableMissions(list) {
	availableMissions = list.slice();
}

let onStartGame = null;
let onLoadMission = null;
export function configureMenus({ start, loadMission }) {
	onStartGame = start;
	onLoadMission = loadMission;
}

const KEY_BINDABLE = [
	{ key: KEY_PULLUP,    label: "Pull Up" },
	{ key: KEY_PULLDOWN,  label: "Pull Down" },
	{ key: KEY_FLIP,      label: "Flip Plane" },
	{ key: KEY_ACCEL,     label: "Accelerate" },
	{ key: KEY_DECEL,     label: "Decelerate" },
	{ key: KEY_FIRE,      label: "Fire Gun" },
	{ key: KEY_BOMB,      label: "Drop Bomb" },
	{ key: KEY_HOME,      label: "Fly Home" },
	{ key: KEY_MISSILE,   label: "Missile" },
	{ key: KEY_STARBURST, label: "Starburst" },
	{ key: KEY_SOUND,     label: "Toggle Sound" },
];

function buildKeybindMenu() {
	return {
		title: "Key Bindings",
		items: KEY_BINDABLE.map((entry) => ({
			key: "1",
			label: entry.label,
			value: () => getKeyBinding(entry.key) ?? "(none)",
			action: () => {
				startKeyRebind({
					label: entry.label,
					onRebind: (code) => {
						setKeyBinding(entry.key, code);
						saveConfig();
					},
				});
			},
		})),
	};
}

function buildOptionsMenu() {
	return {
		title: "Options",
		items: [
			{
				key: "P",
				label: "Cycle Video Palette",
				value: () => getVideoPaletteName(getActivePaletteIndex()),
				action: () => {
					const next =
						(getActivePaletteIndex() + 1) % getNumVideoPalettes();
					setVideoPalette(next);
					state.conf_video_palette = next;
					saveConfig();
				},
			},
			{
				key: "S",
				label: "Solid Ground",
				value: () => (state.conf_solidground ? "on" : "off"),
				action: () => {
					state.conf_solidground = !state.conf_solidground;
					saveConfig();
				},
			},
			{
				key: "M",
				label: "Missiles",
				value: () => (state.conf_missiles ? "on" : "off"),
				action: () => {
					state.conf_missiles = !state.conf_missiles;
					saveConfig();
				},
			},
			{
				key: "A",
				label: "Animals",
				value: () => (state.conf_animals ? "on" : "off"),
				action: () => {
					state.conf_animals = !state.conf_animals;
					saveConfig();
				},
			},
			{
				key: "W",
				label: "Wounded Planes",
				value: () => (state.conf_wounded ? "on" : "off"),
				action: () => {
					state.conf_wounded = !state.conf_wounded;
					saveConfig();
				},
			},
			{
				key: "K",
				label: "Key Bindings >>>",
				action: () => ({ menu: buildKeybindMenu() }),
			},
		],
	};
}

function buildMissionMenu() {
	return {
		title: "Mission Select",
		items: availableMissions.map((name) => ({
			key: "1",
			label: name,
			action: () => {
				onLoadMission?.(name);
				return "close";
			},
		})),
	};
}

export function buildMainMenu() {
	return {
		title: "S O P W I T H",
		items: [
			{
				key: "S",
				label: "Single Player",
				action: () => {
					state.playmode = PLAYMODE.SINGLE;
					onStartGame?.();
					return "close";
				},
			},
			{
				key: "N",
				label: "Novice (single player)",
				action: () => {
					state.playmode = PLAYMODE.NOVICE;
					onStartGame?.();
					return "close";
				},
			},
			{
				key: "C",
				label: "Versus Computer",
				action: () => {
					state.playmode = PLAYMODE.COMPUTER;
					onStartGame?.();
					return "close";
				},
			},
			{
				key: "M",
				label: "Mission Select >>>",
				action: () => ({ menu: buildMissionMenu() }),
			},
			{
				key: "O",
				label: "Game Options >>>",
				action: () => ({ menu: buildOptionsMenu() }),
			},
		],
	};
}
