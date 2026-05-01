// Top-level scene state machine. Mirrors the high-level flow of
// `swmain` (src/swmain.c:169) without the C goto-restart structure:
//
//   TITLE     →  press start            → PLAYING
//   PLAYING   →  player wins/loses      → ENDING
//   PLAYING   →  player respawns        → PLAYING (no transition)
//   ENDING    →  endcount expires       → TITLE
//
// `consoleplayer.ob_endsts` distinguishes WINNER/LOSER; while it is
// PLAYING the simulation is in PLAYING regardless of crashes (the
// player respawns mid-level).

export const SCENE = Object.freeze({
	TITLE: "title",
	PLAYING: "playing",
	ENDING: "ending",
});

const sceneState = {
	current: SCENE.TITLE,
};

export function getScene() {
	return sceneState.current;
}

export function setScene(next) {
	sceneState.current = next;
}
