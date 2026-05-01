import { mkdirSync, copyFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, "..", "public");
const distDir = join(here, "..", "dist");

function walk(srcDir, dstDir) {
	mkdirSync(dstDir, { recursive: true });
	for (const name of readdirSync(srcDir)) {
		if (name === "bundle.js" || name === "bundle.js.map") continue;
		const src = join(srcDir, name);
		const dst = join(dstDir, name);
		if (statSync(src).isDirectory()) walk(src, dst);
		else copyFileSync(src, dst);
	}
}

walk(publicDir, distDir);
console.log(`copied static assets ${publicDir} -> ${distDir}`);
