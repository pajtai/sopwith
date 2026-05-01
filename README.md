# sdl-sopwith (vanilla JS port)

Port of https://github.com/fragglet/sdl-sopwith

JavaScript port of SDL Sopwith. See `plans/2026-04-30-vanilla-js-port.md` for the porting plan, and `docs/setup.md` for development setup.

## Dev

```
pnpm install
pnpm run dev
```

Opens an esbuild dev server at `http://localhost:5173/`. The dev script first copies `maps/*.sop` into `public/data/` so they can be `fetch`-ed.

## Watch (with live reload)

```
pnpm run watch
```

Same as `dev`, but rebuilds on file change and the page auto-reloads via esbuild's `/esbuild` SSE endpoint.

## Build

```
pnpm run build
```

Produces a static bundle in `dist/`.
