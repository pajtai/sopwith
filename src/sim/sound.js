// Sound trigger logic — direct port of src/swsound.c.
//
// The C code operates on PIT timer divisors ("count" values): the PC
// speaker frequency is TIMER_FREQ / count Hz. We keep that math intact
// so `S_PLANE`, `S_HIT`, etc., come out identical to the SDL build, and
// only convert to Hz at the boundary into audio.js.

import { speakerOutput, speakerOff } from "../audio.js";
import { state } from "./state.js";
import { OBTYPE } from "./types.js";

const TIMER_FREQ = 1193280; // PIT clock, src/sdl/pcsound.c:32

// Priorities ported from src/swsound.h:17. Lower number wins, so order
// matters — keep the values verbatim.
export const SOUND = Object.freeze({
	S_NONE: 0,
	S_TITLE: 5,
	S_EXPLOSION: 10,
	S_BOMB: 20,
	S_SHOT: 30,
	S_FALLING: 40,
	S_HIT: 50,
	S_PLANE: 60,
});

const SNDSIZE = 100;

// C major scale frequencies (src/swsound.c:36).
const NOTE_FREQ = [523, 554, 587, 622, 659, 698, 740, 784, 831, 880, 932, 988];
// Map a..g → index into NOTE_FREQ (src/swsound.c:52).
const NOTE_INDEX = [9, 11, 0, 2, 4, 5, 7];

// Title / explosion music — "Wild Blue Yonder" (src/swsound.c:79).
const EXPLTUNE =
	"<b4/>d8/d2/r16/c8/<b8/a8/b4./>c4./c+4./d4./" +
	"e4/g8/g2/r16/a8/g8/e8/d2./" +
	"<b4/>d8/d2/r16/c8/<b8/a8/b4./>c4./c+4./d4./" +
	"e4/a8/a2/r16/g8/f+8/e8/d2./" +
	"d8/g2/r16/g8/g+2/r16/g+8/a2/r16/a8/>c2/<r16/" +
	"b8/a8/g8/b4/g8/b4/g8/a4./g1/";

// Pre-shuffled random table from src/swsound.c:103.
const SEED = [
	0x90B9, 0xBCFB, 0x6564, 0x3313, 0x3190, 0xA980, 0xBCF0, 0x6F97, 0x37F4,
	0x064B, 0x9FD8, 0x595B, 0x1EEE, 0x820C, 0x4201, 0x651E, 0x848E, 0x15D5,
	0x1DE7, 0x1585, 0xA850, 0x213B, 0x3953, 0x1EB0, 0x97A7, 0x35DD, 0xAF2F,
	0x1629, 0xBE9B, 0x243F, 0x847D, 0x313A, 0x3295, 0xBC11, 0x6E6D, 0x3398,
	0xAD43, 0x51CE, 0x8F95, 0x507E, 0x499E, 0x3BC1, 0x5243, 0x2017, 0x9510,
	0x9865, 0x65F6, 0x6B56, 0x36B9, 0x5026,
];
let seedIdx = 0;
function swrand(modulo) {
	if (seedIdx >= 50) seedIdx = 0;
	return SEED[seedIdx++] % modulo;
}

// Continuous tone table (linked free-list). One TONETAB record per
// actively-buzzing object — planes falling, bombs dropping, etc. Direct
// port of src/swsound.c:69.
const tonePool = [];
let firstTone = null;
let freeTone = null;

let soundtype = 32767;
let soundparm = 32767;
let soundobj = null;
let lastfreq = 0;
let lastobj = null;
let toneadj = null;
let soundticks = 0;

let numexpls = 0;
let explplace = 0;
let expltone = 0;
let explticks = 0;
let exploctv = 256;

let titlplace = 0;
let titltone = 0;
let titlticks = 0;
let titloctv = 256;

// Tune-walker state shared by explnote/titlnote (matches C statics).
let tune = "";
let place = 0;
let tunefreq = 0;
let tunedura = 0;
let octavefactor = 256;

export function initsndt() {
	tonePool.length = 0;
	for (let i = 0; i < SNDSIZE; i++) {
		tonePool.push({ tt_tone: 0, tt_chng: 0, tt_next: null, tt_prev: null });
	}
	for (let i = 0; i < SNDSIZE - 1; i++) {
		tonePool[i].tt_next = tonePool[i + 1];
	}
	tonePool[SNDSIZE - 1].tt_next = null;
	firstTone = null;
	freeTone = tonePool[0];

	soundtype = soundparm = 32767;
	soundobj = null;
	lastfreq = 0;
	lastobj = null;
	toneadj = null;
	soundticks = 0;

	numexpls = 0;
	explplace = 0;
	expltone = 0;
	explticks = 0;
	exploctv = 256;

	titlplace = 0;
	titltone = 0;
	titlticks = 0;
	titloctv = 256;
	state.titleflg = false;
}

function allocton() {
	if (!freeTone) return null;
	const tt = freeTone;
	freeTone = tt.tt_next;
	tt.tt_next = firstTone;
	tt.tt_prev = null;
	if (firstTone) firstTone.tt_prev = tt;
	firstTone = tt;
	return firstTone;
}

function deallton(tt) {
	const prev = tt.tt_prev;
	if (prev) prev.tt_next = tt.tt_next;
	else firstTone = tt.tt_next;
	if (tt.tt_next) tt.tt_next.tt_prev = tt.tt_prev;
	tt.tt_next = freeTone;
	freeTone = tt;
}

// Convert a PIT-timer count into a frequency. Matches the SDL backend's
// Speaker_Output: actual_hz = TIMER_FREQ / count.
function tone(count) {
	if (!state.soundflg) return;
	if (lastfreq === count) return;
	if (count <= 0) speakerOff();
	else speakerOutput(TIMER_FREQ / count);
	lastfreq = count;
}

export function soundoff() {
	if (lastfreq) {
		speakerOff();
		lastfreq = 0;
	}
}

// Tune parser (src/swsound.c:234). Pulls one note from `tune` starting at
// `place`, populating `tunefreq` (PIT count, 0 = rest) and `tunedura`
// (length in soundadj ticks).
const NOTEEND = "/";
const UPOCT = ">";
const DNOCT = "<";
const SHARP = "+";
const FLAT = "-";
const DOT = ".";
const REST = "R";

function isAlpha(ch) { return ch >= "A" && ch <= "Z"; }
function isDigit(ch) { return ch >= "0" && ch <= "9"; }

function playnote() {
	let dottednote = 2;
	let noteoctavefactor = 256;
	let indexadj = 0;
	let index = 0;
	let noteletter = "";
	let durstring = "";
	let firstplace = true;

	for (;;) {
		if (place === 0) octavefactor = 256;

		if (place >= tune.length) {
			place = 0;
			if (firstplace) continue;
			break;
		}

		const charatplace = tune[place].toUpperCase();
		place++;

		firstplace = false;
		if (charatplace === NOTEEND) break;

		if (isAlpha(charatplace)) {
			if (charatplace === REST) {
				noteletter = REST;
			} else if (charatplace >= "A" && charatplace <= "G") {
				index = NOTE_INDEX[charatplace.charCodeAt(0) - "A".charCodeAt(0)];
				noteletter = charatplace;
			}
		} else {
			switch (charatplace) {
				case UPOCT: octavefactor <<= 1; break;
				case DNOCT: octavefactor >>= 1; break;
				case SHARP: indexadj++; break;
				case FLAT: indexadj--; break;
				case DOT:   dottednote = 3; break;
				default:
					if (isDigit(charatplace)) durstring += charatplace;
					break;
			}
		}
	}

	let duration = parseInt(durstring, 10);
	if (!duration || duration <= 0) duration = 4;
	duration = Math.floor((1440 * dottednote / (60 * duration)) / 2);

	if (noteletter === REST) {
		tunefreq = 0;
	} else {
		index += indexadj;
		while (index < 0) { index += 12; noteoctavefactor = Math.floor(noteoctavefactor / 2); }
		while (index >= 12) { index -= 12; noteoctavefactor *= 2; }

		let freq = NOTE_FREQ[index];
		freq = (freq * octavefactor) >> 8;
		freq = (freq * noteoctavefactor) >> 8;
		// Same constant the C uses (src/swsound.c:331). Result is a PIT
		// count; the actual Hz comes out a touch flat (~89.7%) — matches
		// the historical SOPWITH behavior, so we preserve it.
		tunefreq = Math.floor(1331000 / freq);
	}
	tunedura = duration;
}

function adjcont() {
	if (!lastobj) return;
	const tt = lastobj.ob_sound;
	if (tt && typeof tt === "object") {
		tone(tt.tt_tone + tt.tt_chng * soundticks);
	}
}

let savefreq = 0;
function adjshot() {
	if (lastfreq === 0xF000) tone(savefreq);
	else { savefreq = lastfreq; tone(0xF000); }
}

function explnote() {
	place = explplace;
	tune = EXPLTUNE;
	octavefactor = exploctv;
	playnote();
	explplace = place;
	expltone = tunefreq;
	explticks += tunedura;
	exploctv = octavefactor;
}

function adjexpl() {
	explticks--;
	if (explticks >= 0) return;
	explnote();
}

function titlnote() {
	place = titlplace;
	tune = EXPLTUNE;
	octavefactor = titloctv;
	playnote();
	titlplace = place;
	titltone = tunefreq;
	titlticks += tunedura;
	titloctv = octavefactor;
	soundoff();
	tone(titltone);
}

function adjtitl() {
	titlticks--;
	if (titlticks >= 0) return;
	titlnote();
}

function soundadj() {
	soundticks++;
	if (lastfreq && toneadj) toneadj();
	if (numexpls) adjexpl();
	if (state.titleflg) adjtitl();
}

export function swsound() {
	for (let tt = firstTone; tt !== null; tt = tt.tt_next) {
		tt.tt_tone += tt.tt_chng * soundticks;
	}
	soundticks = 0;
	state.titleflg = false;

	switch (soundtype) {
		case 0:
		case 32767:
		default:
			soundoff();
			lastobj = null;
			toneadj = null;
			break;

		case SOUND.S_PLANE:
			if (soundparm) tone(0xF000 + soundparm * 0x1000);
			else tone(0xD000);
			lastobj = null;
			toneadj = null;
			break;

		case SOUND.S_BOMB:
		case SOUND.S_FALLING:
			if (soundobj === lastobj) break;
			toneadj = adjcont;
			lastobj = soundobj;
			adjcont();
			break;

		case SOUND.S_HIT:
			tone(swrand(2) ? 0x9000 : 0xF000);
			lastobj = null;
			toneadj = null;
			break;

		case SOUND.S_EXPLOSION:
			tone(expltone);
			toneadj = null;
			lastobj = null;
			break;

		case SOUND.S_SHOT:
			tone(0x1000);
			toneadj = adjshot;
			lastobj = null;
			break;
	}

	soundtype = soundparm = 32767;
}

export function sound(type, parm, ob) {
	if (type === SOUND.S_TITLE) {
		if (!state.titleflg) {
			titlplace = 0;
			titlnote();
			toneadj = null;
			lastobj = null;
			state.titleflg = true;
		}
	} else if (type < soundtype) {
		soundtype = type;
		soundparm = parm;
		soundobj = ob;
	} else if (type === soundtype && parm < soundparm) {
		soundparm = parm;
		soundobj = ob;
	}
}

export function initsound(ob, type) {
	if (ob.ob_sound) return;

	if (ob.ob_type === OBTYPE.EXPLOSION) {
		if (++numexpls === 1) {
			explplace = 0;
			explnote();
		}
		ob.ob_sound = true; // sentinel — deallocation skips this case
		return;
	}

	const tt = allocton();
	if (!tt) return;
	switch (type) {
		case SOUND.S_BOMB:    tt.tt_tone = 0x0300; tt.tt_chng = 8;  break;
		case SOUND.S_FALLING: tt.tt_tone = 0x1200; tt.tt_chng = -8; break;
		default: break;
	}
	ob.ob_sound = tt;
}

export function stopsound(ob) {
	const tt = ob.ob_sound;
	if (!tt) return;
	if (ob.ob_type === OBTYPE.EXPLOSION) {
		numexpls--;
	} else {
		deallton(tt);
	}
	ob.ob_sound = null;
}

// 18.2 Hz tick driver (src/swsound.c:557). Drives note transitions for
// the title music and continuous-tone slides.
let lastclock = 0;
const TICK_MS = 1000 / 18.2;
export function swsndupdate() {
	const now = typeof performance !== "undefined" ? performance.now() : Date.now();
	if (lastclock === 0) lastclock = now;
	let n = 0;
	while (now > lastclock + TICK_MS && n < 8) {
		lastclock += TICK_MS;
		soundadj();
		n++;
	}
	// If the tab was backgrounded, snap forward instead of replaying the
	// gap — avoids a flood of catch-up note transitions on resume.
	if (n >= 8) lastclock = now;
}
