import { mkdirSync, copyFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const mapsDir = join(here, "..", "maps");
const outDir = join(here, "..", "public", "data");

mkdirSync(outDir, { recursive: true });
const missions = [];
for (const name of readdirSync(mapsDir).sort()) {
	if (name.endsWith(".sop")) {
		copyFileSync(join(mapsDir, name), join(outDir, name));
		missions.push(name);
	}
}
writeFileSync(
	join(outDir, "missions.json"),
	JSON.stringify({ missions }, null, 2) + "\n",
);
console.log(`copied .sop files from ${mapsDir} -> ${outDir}`);
