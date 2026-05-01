// Low-level PC-speaker audio backend (WebAudio).
//
// Single AudioContext + one square-wave OscillatorNode + one GainNode kept
// alive for the lifetime of the page. Frequency changes go through a
// 2 ms gain duck so we never click. Mirrors the role of `Speaker_Output`
// / `Speaker_Off` in src/sdl/pcsound.c — but instead of generating PCM
// samples in a callback, the browser's audio thread renders the square
// wave for us with sample-accurate timing.
//
// Safari/iOS notes:
//   - AudioContext starts suspended; we resume on the first user gesture
//     (pointerdown / keydown / touchstart). Listeners fire once.
//   - A silent looping AudioBufferSourceNode keeps the audio pipeline
//     "warm" so the first real tone has no startup latency.

let ctx = null;
let osc = null;
let gain = null;
let unlocked = false;
let speakerOn = false;
let currentHz = 0;

const VOLUME = 0.05;     // 1.0 = full scale; matches ~the C VOLUME=4000/32768.
const RAMP = 0.002;       // 2 ms gain ramps to avoid clicks.

function unlock() {
	if (unlocked) {
		if (ctx && ctx.state === "suspended") ctx.resume();
		return;
	}
	const Ctx = window.AudioContext || window.webkitAudioContext;
	if (!Ctx) return;
	ctx = new Ctx();

	osc = ctx.createOscillator();
	osc.type = "square";
	osc.frequency.value = 440;

	gain = ctx.createGain();
	gain.gain.value = 0;

	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.start();

	// Silent looper — Safari otherwise aggressively suspends a quiet ctx.
	const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
	const src = ctx.createBufferSource();
	src.buffer = buf;
	src.loop = true;
	src.connect(ctx.destination);
	src.start();

	unlocked = true;
	if (ctx.state === "suspended") ctx.resume();
}

export function initAudio() {
	const handler = () => unlock();
	window.addEventListener("pointerdown", handler);
	window.addEventListener("keydown", handler);
	window.addEventListener("touchstart", handler, { passive: true });
}

// Start (or change) the speaker tone at `hz`. Brief gain duck around any
// frequency change suppresses pops on rapid tone shifts.
export function speakerOutput(hz) {
	if (!unlocked || !ctx || hz <= 0) {
		if (hz <= 0) speakerOff();
		return;
	}
	const t = ctx.currentTime;
	if (!speakerOn) {
		gain.gain.cancelScheduledValues(t);
		gain.gain.setValueAtTime(0, t);
		osc.frequency.setValueAtTime(hz, t);
		gain.gain.linearRampToValueAtTime(VOLUME, t + RAMP);
		speakerOn = true;
	} else if (Math.abs(hz - currentHz) > 0.5) {
		// Duck → switch frequency → duck back up.
		gain.gain.cancelScheduledValues(t);
		gain.gain.setValueAtTime(gain.gain.value, t);
		gain.gain.linearRampToValueAtTime(0, t + RAMP);
		osc.frequency.setValueAtTime(hz, t + RAMP);
		gain.gain.linearRampToValueAtTime(VOLUME, t + RAMP * 2);
	}
	currentHz = hz;
}

export function speakerOff() {
	if (!unlocked || !ctx || !speakerOn) return;
	const t = ctx.currentTime;
	gain.gain.cancelScheduledValues(t);
	gain.gain.setValueAtTime(gain.gain.value, t);
	gain.gain.linearRampToValueAtTime(0, t + RAMP);
	speakerOn = false;
	currentHz = 0;
}

export function isAudioReady() { return unlocked; }
