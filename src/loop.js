// Fixed-timestep simulation tick + per-rAF render.
// Matches the C build's FPS = 10 (one logical tick every 100ms).

import { FPS } from "./sim/constants.js";

const TICK_MS = 1000 / FPS;
const MAX_CATCHUP = 5; // cap ticks per frame to avoid spiral-of-death

export function startLoop({ tick, render }) {
	let last = performance.now();
	let acc = 0;

	function frame(now) {
		const dt = now - last;
		last = now;
		acc += dt;

		let n = 0;
		while (acc >= TICK_MS && n < MAX_CATCHUP) {
			tick();
			acc -= TICK_MS;
			n++;
		}
		if (n === MAX_CATCHUP) acc = 0;

		render(acc / TICK_MS);
		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}
