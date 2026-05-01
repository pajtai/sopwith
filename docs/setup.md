# Setup

## Requirements

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) — install globally with `npm i -g pnpm` or via Corepack: `corepack enable`. The repo pins `packageManager: pnpm@10.28.2` in `package.json`, so Corepack will use the matching version automatically.

## Install

```
pnpm install
```

## Repo layout

```
.
├── docs/                    documentation (this directory)
├── maps/                    .sop mission files (source data)
├── plans/                   design / porting plans
├── public/                  static assets served as-is
│   ├── index.html
│   ├── manifest.json
│   ├── icon-*.png, loading.gif
│   ├── bundle.js            built by esbuild (gitignored)
│   └── data/                .sop files copied here at build time (gitignored)
├── scripts/                 build / data-copy helpers
│   ├── copy-data.js         maps/*.sop → public/data/, generates missions.json
│   ├── build.js             esbuild production build → dist/
│   └── copy-dist.js
├── src/                     source code (esbuild entrypoint: src/main.js)
│   ├── sim/                 simulation (game logic, ported from C)
│   └── ui/                  UI screens (menu, hiscore, etc.)
├── dist/                    production build output (gitignored)
├── package.json
└── pnpm-lock.yaml
```

## Scripts

| Command         | What it does                                                                                                  |
|-----------------|---------------------------------------------------------------------------------------------------------------|
| `pnpm dev`      | Copies `maps/*.sop` → `public/data/`, then runs esbuild's dev server on `http://0.0.0.0:5173/`.               |
| `pnpm watch`    | Same as `dev`, plus `esbuild --watch`: rebuilds on file change and live-reloads the browser via `/esbuild` SSE. |
| `pnpm build`    | Produces a hashed, minified production bundle and copies static assets into `dist/`.                          |
| `pnpm copy-data`| Just the data-copy step (mostly a build dependency).                                                          |

## Live reload

`public/index.html` includes an `EventSource("/esbuild")` snippet, gated to `localhost`/`127.0.0.1`/`0.0.0.0`. When `pnpm watch` is running, esbuild dispatches a `change` event on rebuild and the page reloads automatically. In production builds the snippet still ships but the EventSource fails open and is harmless.

## Production build

`pnpm build`:

1. Re-runs `copy-data` to refresh `public/data/`.
2. Bundles `src/main.js` to `dist/bundle-<hash>.js` (minified, sourcemap).
3. Copies everything in `public/` (except the dev `bundle.js`) into `dist/`.
4. Rewrites `dist/index.html` to point at the hashed bundle filename.

The contents of `dist/` are static and can be served by any web server.
