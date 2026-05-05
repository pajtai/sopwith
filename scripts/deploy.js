import { execSync } from "node:child_process";
import { cpSync, existsSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const distDir = join(root, "dist");

function run(cmd) {
	console.log(`$ ${cmd}`);
	execSync(cmd, { stdio: "inherit", cwd: root });
}

function out(cmd) {
	return execSync(cmd, { cwd: root }).toString().trim();
}

const original = out("git rev-parse --abbrev-ref HEAD");
if (original === "gh-pages") {
	console.error("refuse to deploy from gh-pages; switch to a source branch first");
	process.exit(1);
}
if (out("git status --porcelain") !== "") {
	console.error("working tree not clean; commit or stash before deploying");
	process.exit(1);
}

run("pnpm build");
if (!existsSync(distDir)) {
	console.error(`build did not produce ${distDir}`);
	process.exit(1);
}

const stage = join(tmpdir(), `sopwith-deploy-${Date.now()}`);
cpSync(distDir, stage, { recursive: true });
console.log(`staged build at ${stage}`);

const sourceSha = out(`git rev-parse --short ${original}`);
let onGhPages = false;
try {
	try {
		run("git fetch origin gh-pages");
	} catch {
		console.warn("could not fetch origin/gh-pages; continuing with local branch");
	}
	run("git checkout gh-pages");
	onGhPages = true;
	try {
		run("git pull --ff-only origin gh-pages");
	} catch {
		console.warn("no fast-forward from origin/gh-pages; continuing");
	}

	// Wipe tracked files so removed assets don't linger. Untracked dirs
	// (dist/, node_modules/, .idea/, public/) are preserved by git rm
	// because .gitignore keeps them untracked on this branch.
	try {
		run("git rm -rf .");
	} catch {
		// empty branch, nothing tracked — fine
	}

	// Rewrite .gitignore so the source-branch dirs stay untracked even if a
	// prior deploy clobbered it. This is what keeps `git add -A` below from
	// committing dist/, node_modules/, etc.
	writeFileSync(join(root, ".gitignore"), ".idea/\ndist/\nnode_modules/\npublic/\n");

	for (const name of readdirSync(stage)) {
		cpSync(join(stage, name), join(root, name), { recursive: true });
	}

	run("git add -A");
	if (out("git status --porcelain") === "") {
		console.log("no changes to deploy");
	} else {
		run(`git commit -m "deploy from ${original}@${sourceSha}"`);
		run("git push origin gh-pages");
	}
} finally {
	if (onGhPages) {
		try {
			run("git reset --hard HEAD");
		} catch {}
		run(`git checkout ${original}`);
	}
	rmSync(stage, { recursive: true, force: true });
}

console.log(`\ndeployed ${original}@${sourceSha} → gh-pages`);
