// Helper macros from src/std.h ported to JS.

export function in_range(min, val, max) {
	return val >= min && val <= max;
}

export function clamp_min(val, min) {
	return val < min ? min : val;
}

export function clamp_max(val, max) {
	return val > max ? max : val;
}

export function clamp_range(min, val, max) {
	if (val < min) return min;
	if (val > max) return max;
	return val;
}

export function imin(a, b) { return a < b ? a : b; }
export function imax(a, b) { return a > b ? a : b; }
