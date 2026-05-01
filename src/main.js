import { startLoop } from "./loop.js";
import {
	initVideo,
	clear,
	present,
	drawSymbol,
	dispGround,
	dispGroundSolid,
	fuselageColor,
	setVideoPalette,
	getNumVideoPalettes,
	getVideoPaletteName,
	getActivePaletteIndex,
	vidBuffer,
	VID_PITCH,
} from "./video.js";
import { initInput, getGameKeys, keysdown } from "./input.js";
import { initAudio } from "./audio.js";
import * as constants from "./sim/constants.js";
import * as types from "./sim/types.js";
import { state } from "./sim/state.js";
import { loadMission } from "./sim/games.js";
import { buildSymbols, symbols } from "./sim/symbols.js";
import { swinitlevel } from "./sim/init.js";
import { swmove } from "./sim/move.js";
import { swcollsn } from "./sim/collision.js";
import { swdispsplats } from "./sim/splat.js";
import * as object from "./sim/object.js";
import { initsndt, sound, swsound, swsndupdate, soundoff, SOUND } from "./sim/sound.js";
import { loadConfig, saveConfig } from "./sim/config.js";
import { loadHiScores, isNewHighScore } from "./sim/hiscore.js";
import { dispstatusbar } from "./ui/statusbar.js";
import { drawTitleBackground, drawTitleTextElements } from "./ui/title.js";
import { dispendmessage } from "./ui/end.js";
import {
	drawHighScoreTable,
	drawHiScoreEntry,
	startHiScoreEntry,
	isHiScoreEntryActive,
	handleHiScoreKey,
} from "./ui/hiscore.js";
import {
	openMenu,
	closeMenu,
	isMenuOpen,
	drawMenuScene,
	handleMenuKey,
	isRebinding,
	drawRebindOverlay,
	handleRebindKey,
} from "./ui/menu.js";
import {
	buildMainMenu,
	configureMenus,
	setAvailableMissions,
} from "./ui/menus.js";
import { SCENE, getScene, setScene } from "./screens.js";

const canvas = document.getElementById("game");
initVideo(canvas);
initInput(canvas);
initAudio();
initsndt();
state.soundflg = true;

let mission = null;
let missionName = null;
let booted = false;
// Cached original.sop text. Mods overlay on top of this so they can omit
// sections — matches the C code where GenerateSymbols (src/swsymbol.c:1413)
// populates built-in defaults before LoadCustomLevel applies overrides.
let baselineText = null;

function mergeSymbols(base, mod) {
	const out = {};
	const names = new Set([
		...Object.keys(base || {}),
		...Object.keys(mod || {}),
	]);
	for (const n of names) {
		out[n] = { ...(base?.[n] || {}), ...(mod?.[n] || {}) };
	}
	return out;
}

async function loadMissionFile(name) {
	if (name !== "original.sop" && baselineText === null) {
		baselineText = await fetch(`./data/original.sop`).then((r) => r.text());
	}

	const text = await fetch(`./data/${name}`).then((r) => r.text());
	const m = loadMission(text);

	if (name !== "original.sop") {
		const baseline = loadMission(baselineText);
		m.symbols = mergeSymbols(baseline.symbols, m.symbols);
		if (!m.games.gm_num_objects) m.games = baseline.games;
		if (!m.title) m.title = baseline.title;
		if (!m.sounds) m.sounds = baseline.sounds;
	}

	mission = m;
	missionName = name;
	state.currgame = mission.games;
	state.gamenum = 0;
	state.player = 0;
	buildSymbols(mission.symbols);
	swinitlevel();
}

async function boot() {
	state.playmode = types.PLAYMODE.SINGLE;
	state.conf_animals = true;
	state.conf_big_explosions = true;

	loadConfig();
	loadHiScores();
	// Re-apply palette to the live video backend after loadConfig
	// possibly changed state.conf_video_palette.
	setVideoPalette(state.conf_video_palette | 0);

	await loadMissionFile("original.sop");

	// Load mission list for the mission-select submenu.
	try {
		const manifest = await fetch("./data/missions.json").then((r) => r.json());
		setAvailableMissions(manifest.missions || []);
	} catch (e) {
		console.warn("missions.json missing — mission-select disabled");
	}

	configureMenus({
		start: startGame,
		loadMission: async (name) => {
			await loadMissionFile(name);
			startGame();
		},
	});

	booted = true;
	openMenu(buildMainMenu());

	console.log(
		`mission: ${mission.games.gm_num_objects} objects, ground ${mission.games.gm_max_x} cols`,
	);
}

function startGame() {
	if (!booted) return;
	closeMenu();
	state.titleflg = false;
	soundoff();
	swinitlevel();
	setScene(SCENE.PLAYING);
}

function returnToTitle() {
	const player = state.consoleplayer;
	const score = player ? player.ob_score : null;

	swinitlevel();
	state.restart_flag = false;
	setScene(SCENE.TITLE);

	// Hi-scores apply only to the canonical mission setup (mirrors the
	// gating in src/hiscore.c:382). For the JS port we keep it simple:
	// any single-player run on `original.sop` qualifies.
	const eligible =
		score &&
		missionName === "original.sop" &&
		(state.playmode === types.PLAYMODE.SINGLE ||
			state.playmode === types.PLAYMODE.NOVICE ||
			state.playmode === types.PLAYMODE.COMPUTER);

	if (eligible && isNewHighScore(score)) {
		startHiScoreEntry(score, () => openMenu(buildMainMenu()));
	} else {
		openMenu(buildMainMenu());
	}
}

window.addEventListener(
	"keydown",
	(e) => {
		if (!booted) return;
		// Hi-score name entry takes priority over everything else.
		if (isHiScoreEntryActive()) {
			handleHiScoreKey(e);
			e.stopImmediatePropagation();
			return;
		}
		// Rebind capture: swallow every key event while active so the
		// gameplay input listener doesn't also see them.
		if (isRebinding()) {
			handleRebindKey(e);
			e.stopImmediatePropagation();
			return;
		}
		if (isMenuOpen()) {
			handleMenuKey(e);
			// Menu must consume the key so gameplay input doesn't also
			// process letter/digit keys (which are bound to gamekeys).
			e.stopImmediatePropagation();
			return;
		}
		if (e.code === "Escape" && getScene() === SCENE.PLAYING) {
			openMenu(buildMainMenu());
			e.preventDefault();
			e.stopImmediatePropagation();
			return;
		}
		if (
			getScene() === SCENE.TITLE &&
			(e.code === "Space" || e.code === "Enter" || e.code === "NumpadEnter")
		) {
			startGame();
			e.preventDefault();
		}
	},
	true,
);

function renderPlaying() {
	clear();

	const game = state.currgame;
	const player = state.consoleplayer;
	let displx = 0;
	if (player) {
		displx = player.ob_x - constants.SCR_CENTR;
		if (displx < 0) displx = 0;
		const maxScroll = game.gm_max_x - constants.SCR_WDTH;
		if (displx > maxScroll) displx = maxScroll;
	}
	state.displx = displx;

	// Match src/swgrpha.c:137 (`swdisp`): status bar → splats →
	// end-message → objects → ground (XOR last for correct silhouette).
	dispstatusbar();

	if (state.conf_hudsplats) swdispsplats();
	dispendmessage();

	for (let ob = state.objtop; ob !== null; ob = ob.ob_next) {
		if (!ob.ob_symbol || !ob.ob_drwflg) continue;
		const sx = ob.ob_x - displx;
		if (sx + ob.ob_symbol.w < 0 || sx >= constants.SCR_WDTH) continue;
		const clr = ob.ob_type === types.OBTYPE.SHOT ? 3 : ob.ob_clr;
		drawSymbol(sx, ob.ob_y, ob.ob_symbol, clr);
	}

	const ground = state.ground;
	const w = Math.min(constants.SCR_WDTH, game.gm_max_x - displx);
	if (ground && w > 0) {
		if (state.conf_solidground) {
			dispGroundSolid(ground, displx, 0, w);
		} else {
			dispGround(ground, displx, 0, w);
		}
	}
}

function tickPlaying() {
	const idx = state.countmove % constants.MAX_NET_LAG;
	state.latest_player_commands[0][idx] = getGameKeys();
	swmove();
	swcollsn();

	// Per-object sound callbacks. C runs these inside the render loop
	// (src/swgrpha.c:178); we call them at end of tick instead so menus
	// and pauses don't keep retriggering tones.
	for (let ob = state.objtop; ob !== null; ob = ob.ob_next) {
		if (ob.ob_drwflg && typeof ob.ob_soundf === "function") {
			ob.ob_soundf(ob);
		}
	}
	swsound();

	const player = state.consoleplayer;
	const playing = player && player.ob_endsts === types.OBENDSTATUS.PLAYING;
	if (!playing && getScene() === SCENE.PLAYING) {
		setScene(SCENE.ENDING);
	}

	if (state.restart_flag) {
		state.restart_flag = false;
		if (getScene() === SCENE.ENDING) {
			returnToTitle();
		} else {
			swinitlevel();
		}
	}
}

startLoop({
	tick() {
		if (!booted) return;
		// Title music plays whenever we're on the title scene, even
		// with the main menu overlaid (the menu is part of the title
		// experience). Only suppress sound when a menu is open mid-game.
		if (getScene() === SCENE.TITLE) {
			sound(SOUND.S_TITLE, 0, null);
			return;
		}
		if (isMenuOpen()) {
			soundoff();
			return;
		}
		if (getScene() === SCENE.PLAYING || getScene() === SCENE.ENDING) {
			tickPlaying();
		}
	},
	render() {
		swsndupdate();
		if (!booted) {
			clear();
			present();
			return;
		}
		switch (getScene()) {
			case SCENE.TITLE:
				drawTitleBackground();
				if (isHiScoreEntryActive()) {
					drawHiScoreEntry();
				} else if (!isMenuOpen()) {
					// Alternate title text and high score table every
					// HIGH_SCORE_PERIOD ms — matches src/swtitle.c:289.
					const phase = Math.floor(performance.now() / 5000) & 1;
					if (phase === 0) drawTitleTextElements();
					else drawHighScoreTable();
				}
				break;
			case SCENE.PLAYING:
			case SCENE.ENDING:
				renderPlaying();
				break;
		}
		if (isMenuOpen()) drawMenuScene();
		if (isRebinding()) drawRebindOverlay();
		present();
	},
});

globalThis.__sopwith = {
	constants,
	types,
	state,
	get mission() { return mission; },
	get planes() { return state.planes.slice(0, state.num_planes); },
	get player() { return state.consoleplayer; },
	get scene() { return getScene(); },
	symbols,
	object,
	vidBuffer,
	VID_PITCH,
	fuselageColor,
	setVideoPalette,
	getNumVideoPalettes,
	getVideoPaletteName,
	getActivePaletteIndex,
	dispGround,
	dispGroundSolid,
	startGame,
	returnToTitle,
	openMenu: () => openMenu(buildMainMenu()),
	pressKey: (mask) => {
		state.latest_player_commands[0][state.countmove % constants.MAX_NET_LAG] = mask;
	},
	keysdown,
	getGameKeys,
};

boot().catch((e) => {
	console.error("boot failed:", e);
});
console.log("sopwith.js boot");
