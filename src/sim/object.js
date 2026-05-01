// Object pool & linked-list helpers. Ported from src/swobject.c.
//
// Two list structures coexist:
//   • allocation list: ob_prev / ob_next, head=state.objtop, tail=state.objbot.
//     Iteration order is creation order. The free list (state.objfree) reuses
//     deleted nodes.
//   • X-position list: ob_xprev / ob_xnext, kept sorted ascending by ob_x,
//     with sentinels topobj/botobj at -32767 / +32767.
//
// JS port is a near-1:1 of the C original — no GC reliance, since the C
// code carefully recycled OBJECTS records and several callers stash raw
// pointers (e.g. ob->ob_target) that persist across frames.

import { state, topobj, botobj } from "./state.js";
import { createObject, OBSTATE } from "./types.js";

export function insertx(ob, obp) {
	let obs = obp;
	const obx = ob.ob_x;
	if (obx < obs.ob_x) {
		while (obs.ob_xprev !== null && obx < obs.ob_xprev.ob_x) {
			obs = obs.ob_xprev;
		}
		ob.ob_xprev = obs.ob_xprev;
		ob.ob_xnext = obs;
	} else {
		while (obs.ob_xnext !== null && obx > obs.ob_xnext.ob_x) {
			obs = obs.ob_xnext;
		}
		ob.ob_xprev = obs;
		ob.ob_xnext = obs.ob_xnext;
	}
	if (ob.ob_xprev !== null) ob.ob_xprev.ob_xnext = ob;
	if (ob.ob_xnext !== null) ob.ob_xnext.ob_xprev = ob;
	return true;
}

export function deletex(ob) {
	let oldpos = topobj;
	if (ob.ob_xprev !== null) {
		oldpos = ob.ob_xprev;
		ob.ob_xprev.ob_xnext = ob.ob_xnext;
	}
	if (ob.ob_xnext !== null) {
		oldpos = ob.ob_xnext;
		ob.ob_xnext.ob_xprev = ob.ob_xprev;
	}
	ob.ob_xprev = null;
	ob.ob_xnext = null;
	return oldpos;
}

export function updateobjpos(ob) {
	if (ob.ob_xprev === null && ob.ob_xnext === null) return;
	insertx(ob, deletex(ob));
}

// Shallow-copy fields and clear list pointers (src/swobject.c:106).
export function copyobj(to, from) {
	for (const k in from) {
		if (Object.prototype.hasOwnProperty.call(from, k)) {
			to[k] = from[k];
		}
	}
	to.ob_xprev = null;
	to.ob_xnext = null;
	to.ob_prev = null;
	to.ob_next = null;
}

function resetObject(ob) {
	// Mirror calloc(1, sizeof(OBJECTS)). We zero every field so that
	// recycled objects from the free list don't leak old values.
	const fresh = createObject();
	for (const k in fresh) ob[k] = fresh[k];
}

export function allocobj() {
	let ob;
	if (state.objfree !== null) {
		ob = state.objfree;
		state.objfree = ob.ob_next;
		resetObject(ob);
	} else {
		ob = createObject();
	}

	ob.ob_next = null;
	ob.ob_prev = state.objbot;

	if (state.objbot !== null) {
		state.objbot.ob_next = ob;
	} else {
		state.objtop = ob;
	}

	ob.ob_sound = null;
	ob.ob_drwflg = false;
	ob.ob_onmap = false;

	state.objbot = ob;
	return ob;
}

export function deallobj(ob) {
	deletex(ob);

	const prev = ob.ob_prev;
	if (prev !== null) {
		prev.ob_next = ob.ob_next;
	} else {
		state.objtop = ob.ob_next;
	}

	const next = ob.ob_next;
	if (next !== null) {
		next.ob_prev = ob.ob_prev;
	} else {
		state.objbot = ob.ob_prev;
	}

	ob.ob_next = null;
	if (state.delbot !== null) {
		state.delbot.ob_next = ob;
	} else {
		state.deltop = ob;
	}
	state.delbot = ob;
}

// 16-bit fixed-point position update (src/swobject.c:175).
// ob_lx/ob_ly are unsigned 16-bit fractional positions; ob_x/ob_y are
// the integer pixel positions. The C code expresses this as a 32-bit
// fixed-point number with the integer part in the high 16 bits — we
// keep the same shape but compute integer/fractional separately because
// ob_x can exceed 16 bits in modern wide-map missions.
export function movexy(ob) {
	const game = state.currgame;
	const maxX = game ? game.gm_max_x - 10 : 0x7fff;

	const fracX = ob.ob_lx + ob.ob_ldx;
	const xCarry = fracX >>> 16;
	let x = ob.ob_x + ob.ob_dx + xCarry;
	let lx = fracX & 0xffff;
	if (x < 0) { x = 0; lx = 0; }
	else if (x > maxX) { x = maxX; lx = 0; }
	ob.ob_x = x;
	ob.ob_lx = lx;

	const fracY = ob.ob_ly + ob.ob_ldy;
	const yCarry = fracY >>> 16;
	ob.ob_y = ob.ob_y + ob.ob_dy + yCarry;
	ob.ob_ly = fracY & 0xffff;

	updateobjpos(ob);
	return [ob.ob_x, ob.ob_y];
}

export function setdxdy(obj, dx, dy) {
	obj.ob_dx = dx >> 8;
	obj.ob_ldx = (dx << 8) & 0xffff;
	obj.ob_dy = dy >> 8;
	obj.ob_ldy = (dy << 8) & 0xffff;
}

// State predicates (src/swobject.c:21).
export function PlaneIsKilled(stateVal) {
	return (
		stateVal !== OBSTATE.FLYING &&
		stateVal !== OBSTATE.STALLED &&
		stateVal !== OBSTATE.WOUNDED &&
		stateVal !== OBSTATE.WOUNDSTALL
	);
}

export function PlaneIsStalled(stateVal) {
	return stateVal === OBSTATE.STALLED || stateVal === OBSTATE.WOUNDSTALL;
}

export function PlaneIsWounded(stateVal) {
	return stateVal === OBSTATE.WOUNDED || stateVal === OBSTATE.WOUNDSTALL;
}

export function PlaneIsFlying(stateVal) {
	return stateVal === OBSTATE.FLYING || stateVal === OBSTATE.WOUNDED;
}
