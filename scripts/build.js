import { build } from "esbuild";
import {
	mkdirSync,
	rmSync,
	readdirSync,
	copyFileSync,
	statSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const publicDir = join(root, "public");
const distDir = join(root, "dist");

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

const result = await build({
	entryPoints: [join(root, "src", "main.js")],
	bundle: true,
	minify: true,
	sourcemap: true,
	outdir: distDir,
	entryNames: "bundle-[hash]",
	metafile: true,
	logLevel: "info",
});

let bundleName = null;
for (const out of Object.keys(result.metafile.outputs)) {
	const name = basename(out);
	if (name.startsWith("bundle-") && name.endsWith(".js")) {
		bundleName = name;
		break;
	}
}
if (!bundleName) throw new Error("could not locate hashed bundle in metafile");

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

const htmlPath = join(distDir, "index.html");
const html = readFileSync(htmlPath, "utf8").replace(
	/<script src="bundle\.js"><\/script>/,
	`<script src="${bundleName}"></script>`,
);
writeFileSync(htmlPath, html);

console.log(`built ${distDir} with ${bundleName}`);
