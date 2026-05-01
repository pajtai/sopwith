// Yocton parser ported from src/yocton.c.
//
// Yocton is a small key-value/tree text format. Each object is a sequence
// of properties; each property has a string name and either a string
// value (`name: value`) or a nested object (`name { ... }`). Strings can
// be bare (alphanumeric + `_-+.`) or `"quoted"` with C-style escapes
// (`\n \t \\ \" \xHH`). Quoted strings can be concatenated with `&`
// across lines. Line comments start with `//`.
//
// Unlike the C implementation, this parser builds the entire tree
// up-front (`parseYocton(text) -> root object`). The browser already has
// the file in memory so streaming buys nothing here.

const TOKEN_STRING = "STRING";
const TOKEN_COLON = "COLON";
const TOKEN_OPEN = "OPEN";
const TOKEN_CLOSE = "CLOSE";
const TOKEN_EOF = "EOF";

const UTF8_BOM = "﻿";

function isSymbolChar(ch) {
	if (!ch) return false;
	const c = ch.charCodeAt(0);
	if (c >= 48 && c <= 57) return true; // 0-9
	if (c >= 65 && c <= 90) return true; // A-Z
	if (c >= 97 && c <= 122) return true; // a-z
	return ch === "_" || ch === "-" || ch === "+" || ch === ".";
}

class Tokenizer {
	constructor(text) {
		this.text = text;
		this.i = 0;
		this.line = 1;
		this.tokenLine = 1;
	}

	peek() {
		return this.i < this.text.length ? this.text[this.i] : "";
	}

	advance() {
		const c = this.text[this.i++];
		if (c === "\n") this.line++;
		return c;
	}

	skipSpacesAndComments() {
		while (this.i < this.text.length) {
			const c = this.peek();
			if (c === "/") {
				if (this.text[this.i + 1] !== "/") {
					throw this.error("expected // comment");
				}
				while (this.i < this.text.length && this.peek() !== "\n") {
					this.advance();
				}
			} else if (c === UTF8_BOM) {
				this.advance();
			} else if (c === " " || c === "\t" || c === "\r" || c === "\n") {
				this.advance();
			} else {
				return;
			}
		}
	}

	error(msg) {
		return new Error(`yocton: line ${this.tokenLine}: ${msg}`);
	}

	readEscape() {
		if (this.i >= this.text.length) throw this.error("unexpected EOF in escape");
		const c = this.advance();
		switch (c) {
			case "n": return "\n";
			case "t": return "\t";
			case "\\": return "\\";
			case '"': return '"';
			case "x": {
				const hex = this.text.substr(this.i, 2);
				if (!/^[0-9a-fA-F]{2}$/.test(hex)) {
					throw this.error("\\x must be followed by two hex digits");
				}
				this.i += 2;
				const v = parseInt(hex, 16);
				if (v === 0 || v >= 0x20) {
					throw this.error("\\x escape limited to 0x01-0x1f");
				}
				return String.fromCharCode(v);
			}
			default:
				throw this.error(`unknown escape \\${c}`);
		}
	}

	readString() {
		// opening `"` already consumed
		let out = "";
		for (;;) {
			if (this.i >= this.text.length) throw this.error("unexpected EOF in string");
			const c = this.advance();
			if (c === '"') {
				// Check for `&` continuation.
				const save = this.i;
				const saveLine = this.line;
				this.skipSpacesAndComments();
				if (this.peek() === "&") {
					this.advance();
					this.skipSpacesAndComments();
					this.tokenLine = this.line;
					if (this.peek() !== '"') {
						throw this.error("quoted string must follow `&`");
					}
					this.advance(); // consume opening `"`
					continue;
				}
				// Roll back to where we were so the next token can read it.
				this.i = save;
				this.line = saveLine;
				return out;
			} else if (c === "\\") {
				out += this.readEscape();
			} else if (c.charCodeAt(0) < 0x20 && c !== "\t") {
				throw this.error(`raw control char 0x${c.charCodeAt(0).toString(16)} in string`);
			} else {
				out += c;
			}
		}
	}

	readSymbol(first) {
		if (!isSymbolChar(first)) {
			throw this.error(`unexpected character '${first}'`);
		}
		let out = first;
		while (isSymbolChar(this.peek())) {
			out += this.advance();
		}
		return out;
	}

	next() {
		this.skipSpacesAndComments();
		this.tokenLine = this.line;
		if (this.i >= this.text.length) return { type: TOKEN_EOF };
		const c = this.advance();
		switch (c) {
			case ":": return { type: TOKEN_COLON };
			case "{": return { type: TOKEN_OPEN };
			case "}": return { type: TOKEN_CLOSE };
			case '"': return { type: TOKEN_STRING, value: this.readString() };
			case "&":
				throw this.error("`&` only valid between quoted strings");
			default:
				return { type: TOKEN_STRING, value: this.readSymbol(c) };
		}
	}
}

// A parsed object is `{ props: Prop[] }` where each `Prop` is
// `{ name, type: 'string'|'object', value: string | YoctonObject }`.

class YoctonObject {
	constructor() {
		this.props = [];
	}
	// First matching prop, or null.
	find(name) {
		for (const p of this.props) if (p.name === name) return p;
		return null;
	}
	findAll(name) {
		return this.props.filter((p) => p.name === name);
	}
	// Convenience getters.
	getString(name, fallback) {
		const p = this.find(name);
		return p && p.type === "string" ? p.value : fallback;
	}
	getObject(name) {
		const p = this.find(name);
		return p && p.type === "object" ? p.value : null;
	}
	getInt(name, fallback) {
		const p = this.find(name);
		if (!p || p.type !== "string") return fallback;
		const n = parseInt(p.value, 10);
		return Number.isFinite(n) ? n : fallback;
	}
}

function parseObject(tk, isRoot) {
	const obj = new YoctonObject();
	for (;;) {
		const tok = tk.next();
		if (tok.type === TOKEN_EOF) {
			if (!isRoot) throw tk.error("unexpected EOF inside object");
			return obj;
		}
		if (tok.type === TOKEN_CLOSE) {
			if (isRoot) throw tk.error("unexpected `}` at top level");
			return obj;
		}
		if (tok.type !== TOKEN_STRING) {
			throw tk.error("expected property name");
		}
		const name = tok.value;
		const next = tk.next();
		if (next.type === TOKEN_COLON) {
			const v = tk.next();
			if (v.type !== TOKEN_STRING) {
				throw tk.error("expected string value after `:`");
			}
			obj.props.push({ name, type: "string", value: v.value });
		} else if (next.type === TOKEN_OPEN) {
			const child = parseObject(tk, false);
			obj.props.push({ name, type: "object", value: child });
		} else {
			throw tk.error("expected `:` or `{` after property name");
		}
	}
}

export function parseYocton(text) {
	const tk = new Tokenizer(text);
	return parseObject(tk, true);
}

export { YoctonObject };
