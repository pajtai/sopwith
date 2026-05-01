# Plan: Port SDL Sopwith from C to Vanilla JavaScript

## Context

This repo currently builds a C/SDL2 game (~13K LOC across `src/*.c` and `src/sdl/*.c`) with a secondary emscripten/WASM target produced via `embuild.sh`. The decision is to replace the C codebase with a hand-written vanilla JavaScript port that runs natively in the browser — no SDL, no emscripten, no WASM, no framework (e.g. Phaser).

Why vanilla JS over a framework: Sopwith is a software-framebuffer game. `src/swgrpha.c` and `src/sdl/video.c` write pixels into a 320x200 buffer and blit to an SDL surface. That maps directly onto Canvas2D + `ImageData`, so existing rendering logic (sprite masks, line draws, palette swaps for the CGA/mono "monitor" modes) ports nearly 1:1. A retained-mode framework would require throwing that out.

Scope of the port:
- Keep faithful gameplay: 10 FPS internal tick (`FPS` in `src/sw.h:90`), 320x200 logical resolution, 8-orientation plane sprites, CGA palette + alternate "monitor" palettes, original missions from `maps/*.sop`.
- Drop multiplayer for first release. `swasynio.c` and `tcpcomm.c` are out of scope; can be revisited later via WebRTC/WebSocket.
- Keep the game data files (`maps/*.sop`) as-is; the JS port loads them at runtime via `fetch`.
- Replace the autotools/SDL build system with a tiny JS toolchain (esbuild + a static dev server). No bundler lock-in, no TypeScript (user requested vanilla JS).
- Preserve the existing C source on `trunk` until the port reaches feature parity, then delete it in a single commit at the end.

The port lives in a new `web/` directory at the repo root so it can grow alongside the C code without conflicts. When it ships, `web/` becomes the project root and the C tree is removed.

Out of scope:
- Multiplayer (TCP/IP)
- Native desktop/mobile builds
- Game expansion or new features beyond what the C version has

---

## Phase 1: JS Project Scaffolding
**Confidence: 95%**

### Description
Set up `web/` as a vanilla-JS project with a minimal toolchain: `package.json`, esbuild for bundling, a static dev server (esbuild's `--servedir` is fine), and an `index.html` that mounts a 320x200 (scaled-up) canvas. No game code yet — just an empty game loop that clears the canvas and a `requestAnimationFrame` driver throttled to the game's logical 10 FPS tick (with interpolated render frames). This phase produces a runnable shell that future phases hang code off.

Module layout to create (empty stubs, populated in later phases):
- `web/src/main.js` — entry; boots the loop
- `web/src/loop.js` — fixed-timestep tick at FPS=10, render every rAF
- `web/src/video.js` — Canvas2D + ImageData backend (Vid_* equivalents)
- `web/src/input.js` — keyboard/touch
- `web/src/audio.js` — WebAudio PC-speaker emulation
- `web/src/sim/` — gameplay modules (objects, move, collision, ai, games, symbol, etc.)
- `web/src/ui/` — title, menu, status bar, end screen, hiscore
- `web/src/data/` — runtime-loaded mission files copied/symlinked from `maps/`
- `web/index.html`, `web/package.json`, `web/.gitignore`

### References
- `src/sw.h:90` — `FPS 10`, `MAX_Y 200`, `SCR_WDTH 320`, `SCR_HGHT 200`
- `pkg/emscripten/sopwith.html` — existing HTML harness; reference for canvas sizing, mobile viewport meta, touch detection
- `src/sdl/main.c` — current platform entry; minimal, just calls `swmain()`

### Implementation Steps
- [x] Create `web/` directory and `package.json` with `esbuild` as the only dep, plus `dev` and `build` scripts
- [x] Add `web/.gitignore` for `node_modules/` and `dist/`
- [x] Write `web/index.html` with a `<canvas id="game" width="320" height="200">`, integer-scaled via CSS `image-rendering: pixelated`
- [x] Stub the module files listed above with one-line ESM exports
- [x] Implement `web/src/loop.js`: fixed 100ms simulation tick accumulator, `requestAnimationFrame` render
- [x] `npm run dev` serves a black canvas; confirm in browser
- [x] Add a top-level README note explaining `web/` is the in-progress JS port

### Verification Steps
- [x] `cd web && npm install && npm run dev` opens a blank black 320x200 canvas (scaled up) without console errors
- [x] `console.log` in the tick fires at ~10 Hz; render fires at display refresh rate

---

## Phase 2: Core Constants, Types, and Globals
**Confidence: 90%**

### Description
Translate the type system and constants in `src/sw.h` and `src/swsymbol.h` into JS. C `enum`s become frozen object literals (`export const TARGET = Object.freeze({HANGAR: 0, ...})`); `typedef struct` becomes plain JS object factories. The `OBJECTS` struct (object pool node; defined in `src/sw.h` after line 260) is the central game-state record — every plane, bullet, bomb, target, etc., is one. Port it as a factory `createObject()` returning a plain object with all fields zeroed.

Also port the trig table `sintab[ANGLES]` from `src/swmain.c:78` and the global game-config flags (`conf_missiles`, `conf_solidground`, etc., `src/swmain.c:30-40`). Globals live in a single `web/src/sim/state.js` module exporting a mutable singleton — this matches the C codebase's heavy use of file-scope globals and keeps the port shape straightforward.

Assumes Phase 1 is complete (`web/src/sim/` exists).

### References
- `src/sw.h` — all constants, enums, `OBJECTS` and related structs
- `src/swsymbol.h` — `sopsym_t`, `faction_t`
- `src/swmain.c:30-78` — config flags and `sintab`

### Implementation Steps
- [x] Create `web/src/sim/constants.js` with `FPS`, `SCR_WDTH/HGHT`, `MAX_Y`, `ANGLES=16`, `MAX_PLANES`, `MAX_OBJS`, key masks (`K_ACCEL` etc.), `BULSPEED`, `BULLIFE`, etc.
- [x] Create `web/src/sim/types.js` with frozen enums: `OBSTATE`, `OBTYPE`, `PLAYMODE`, `TARGET_TYPE`, `POWERUP_TYPE`, `FACTION`, etc.
- [x] Create `web/src/sim/state.js` exporting a singleton `state` object with all C globals: `playmode`, `currgame`, `consoleplayer`, `numtarg`, `planes`, `objbot/top/free/deltop/delbot`, `endcount`, `player`, `restart_flag`, `conf_*` flags, etc.
- [x] Port `sintab` as a `Float32Array` or plain `Int32Array` (multiplied by 256 to match C)
- [x] Add `createObject()` factory returning a fully-zeroed `OBJECTS` record

### Verification Steps
- [x] `import` constants and types from another module without runtime errors
- [x] `sintab` length 16, values match `src/swmain.c:78` table (spot-check 0/4/8/12)
- [x] `createObject()` returns an object with every field present (cross-check against the `OBJECTS` definition in `src/sw.h`)

---

## Phase 3: Sprite Data and Symbol Blitter
**Confidence: 75%**

### Description
Port `src/swsymbol.c` (1447 LOC, mostly data). Sprites are stored as 16x16 ASCII grids (`*` = pixel set, `-` = secondary color, ` ` = transparent) inside `.sop` mission files (see `maps/original.sop`). At C startup, the parser converts ASCII sprites into `sopsym_t` records (bit-packed pixel + mask arrays). For the JS port, do the same conversion but produce `Uint8Array`-backed sprites suitable for Canvas2D pixel-level blitting.

`Vid_DispSymbol(x, y, sym, faction)` becomes `drawSymbol()` in `web/src/video.js`, writing into the `ImageData` backbuffer. Faction coloring is handled via `Vid_FuselageColor()`-equivalent palette indexing.

This phase is rated 75% because the bit layout and palette index math in `swsymbol.c` and `src/sdl/video.c` is fiddly — there may be one-pass-then-fix cycles around palette mapping and odd/even pixel pairing (CGA was 4-color; later SDL backend uses 8-color extension).

### References
- `src/swsymbol.c` — sprite parser and blit logic
- `src/swsymbol.h` — `sopsym_t` definition
- `src/sdl/video.c` — palette tables, `Vid_DispSymbol` SDL impl
- `maps/original.sop` — reference for ASCII sprite format
- `src/swgrpha.c` — `Vid_DispSymbol` caller patterns

### Implementation Steps
- [x] Port the ASCII-grid parser (`load_symbol`-style) into `web/src/sim/symbol.js`; output `{w, h, pixels: Uint8Array, mask: Uint8Array}` per orientation
- [x] Port faction palette mapping (`Vid_FuselageColor`) into `web/src/video.js`
- [x] Implement `drawSymbol(x, y, sym, faction)` that writes RGBA into the `ImageData` buffer with mask handling
- [x] Implement basic `Vid_PlotPixel`, `Vid_XorPixel`, `Vid_Box`, `Vid_ClearBuf` against `ImageData`
- [x] Smoke test: load one sprite from a hard-coded ASCII grid, draw it on canvas

### Verification Steps
- [x] One known sprite (e.g. `swplnsym` orientation 0 from `maps/original.sop`) renders pixel-identical to a screenshot of the C build at the same orientation
- [x] Faction recolor (player vs enemy plane) produces the expected fuselage color
- [x] Mask is correct — transparent pixels do not overwrite background

---

## Phase 4: Mission File Parser (`.sop` / yocton)
**Confidence: 80%**

### Description
The `.sop` mission file format is parsed by `src/yocton.c` (832 LOC, a generic key-value/block parser) and consumed by `src/swgames.c` (608 LOC, builds `GAMES` struct from the parsed tree). Port both. The browser cannot read local files directly, so `web/src/data/` will contain the mission files (copied/symlinked from `maps/`) and they're loaded with `fetch('./data/original.sop').then(r => r.text())`.

`yocton.c` is a recursive-descent parser over a token stream. It maps cleanly to a JS class with the same structure. `swgames.c` is mostly switch-on-key-name dispatch — straightforward to translate.

The parsed output feeds three things: ground heightmap (`GRNDTYPE` array), object spawn table, and sprite table (consumed by Phase 3). Phase 3 sprites can either be hardcoded from `original.sop` first, or loaded fully through this phase — recommend the latter so custom missions work for free.

### References
- `src/yocton.c` + `src/yocton.h` — parser
- `src/swgames.c` + `src/swgames.h` — mission consumer; `GAMES` struct and `LoadCustomLevel`
- `maps/original.sop`, `maps/sopwith1.sop` — primary test inputs
- `doc/sopwith-mission.5` — file format documentation

### Implementation Steps
- [x] Port `yocton.c` to `web/src/sim/yocton.js` (parser yielding nested object tree)
- [x] Port `swgames.c` to `web/src/sim/games.js`; export `loadMission(text)` returning a `GAMES`-shaped object
- [x] Wire `web/src/data/` (build script copies `maps/*.sop` into it on `npm run dev`/`build`)
- [x] In `main.js`, `await loadMission(await fetch('./data/original.sop').then(r => r.text()))` and stash on `state.currgame`
- [x] Pipe parsed sprite section into Phase 3's symbol loader

### Verification Steps
- [x] Parsing `original.sop` produces a `GAMES` object whose `gm_max_x`, ground height samples, and object count match values printed from a debug build of the C code
- [x] Parsing `sopwith1.sop` works without errors
- [x] An invalid/truncated file produces a useful error, not a silent crash

---

## Phase 5: Canvas2D Video Backend + Palettes + Ground
**Confidence: 80%**

### Description
Complete the `Vid_*` API in `web/src/video.js` against Canvas2D. This phase replaces all of `src/sdl/video.c` (1002 LOC) and `src/video.c` (289 LOC) plus the line-art parts of `src/swgrpha.c`. The model is a 320x200 indexed-color backbuffer (`Uint8Array`, one byte = palette index per pixel) that is converted to RGBA via the active palette LUT each frame and written to `ImageData`. This matches the C code's `vid_vram` exactly and lets palette swaps (CGA, mono green, mono amber, etc.) be a LUT change with no rerendering.

Implement the multi-palette set from `src/sdl/video.c` (`Vid_SetVideoPalette`, `Vid_GetVideoPaletteName`, `Vid_GetNumVideoPalettes`). Implement `Vid_DispGround` and `Vid_DispGround_Solid` from `swgrpha.c`. Implement `Vid_Box`. Implement integer scaling: present 320x200 indexed → RGBA → `putImageData` to an offscreen canvas, then `drawImage` scaled to the visible canvas.

Assumes Phases 2–3 are complete (constants, sintab, sprite blitter all writing to the indexed buffer).

### References
- `src/sdl/video.c` — palette tables (search for `palette[]` arrays), scaling, fullscreen
- `src/video.h` — full `Vid_*` API
- `src/swgrpha.c` — `Vid_DispGround*`, line drawing
- `src/swstbar.c` — uses `Vid_Box` extensively

### Implementation Steps
- [x] Allocate `vidBuffer = new Uint8Array(320 * 200)` in `video.js`; expose `vid_vram`-equivalent
- [x] Port palette tables from `src/sdl/video.c`; one `Uint32Array(256)` LUT per palette
- [x] Implement `presentFrame()`: walks `vidBuffer`, looks up palette → writes to `ImageData`, `putImageData` to offscreen, `drawImage` scaled to visible canvas
- [x] Implement `Vid_DispGround` and `Vid_DispGround_Solid` (line and filled variants)
- [x] Implement `Vid_Box`, `Vid_ClearBuf`, `Vid_PlotPixel`, `Vid_XorPixel`
- [x] Add palette switcher (cycle via key for now; menu integration later)

### Verification Steps
- [x] Drawing a few sprites + ground in `main.js` produces a visually correct landscape (compare to a screenshot of the C build)
- [x] Each palette renders correctly when switched at runtime
- [x] Integer scaling stays crisp (no blurring) on Hi-DPI displays

---

## Phase 6: Object Pool, Movement, and AI
**Confidence: 70%**

### Description
Port the simulation core: `src/swobject.c` (object pool / linked list), `src/swmove.c` (1237 LOC — physics for planes, bombs, bullets, missiles, birds, oxen, smoke, splat, etc.), and `src/swauto.c` (479 LOC — computer-controlled plane AI). These are large procedural files with heavy globals and pointer arithmetic over linked lists, but no platform dependencies — they translate directly to JS once the object pool and `state` singleton (Phase 2) exist.

The 70% confidence reflects volume, not difficulty. `swmove.c` has many sub-cases (one per `obtype_t`); each is small but easy to typo. Plan on an iterative debug pass once visible (Phase 8) — bugs here will manifest as planes flying wrong, bombs missing, AI doing nothing.

Approach: port in this order: `swobject.js` first (pool), then a `swmove.js` skeleton with one case at a time (start with `PLANE`), verify each visibly. Don't try to land it in one shot.

### References
- `src/swobject.c` + `src/swobject.h` — `addobj`, `delobj`, `objbot/top/free` linked list
- `src/swmove.c` + `src/swmove.h` — `mainmove`, per-type movers
- `src/swauto.c` + `src/swauto.h` — AI; depends on `swmove` helpers
- `src/sw.h` — `OBJECTS` fields are the contract

### Implementation Steps
- [x] `web/src/sim/object.js` — object pool, `addobj`, `delobj`, free-list walk
- [x] `web/src/sim/move.js` — `mainmove` dispatch + per-type move handlers
- [x] `web/src/sim/auto.js` — AI driver
- [x] Hook into Phase 1's tick: each tick = `mainmove()` then `auto_*` for each computer plane
- [x] Render loop draws all objects in the list (sprites already work from Phase 3)

### Verification Steps
- [x] Single-player plane spawns on the runway and responds to throttle/flip via input (Phase 7); flying physics feel right (gravity, stall, lift)
- [x] Bombs fall and impact ground correctly
- [x] AI plane takes off and pursues the player without getting stuck
- [x] No object pool leaks after extended play (free-list size stable)

---

## Phase 7: Input Handling (Keyboard + Touch)
**Confidence: 90%**

### Description
Replace `src/sdl/video.c`'s SDL event loop and `src/touch_area.c` with `web/src/input.js` using browser `KeyboardEvent` and `TouchEvent`/`PointerEvent`. Maintain the same `keysdown[NUM_KEYS]` global array and `Vid_GetGameKeys()` API so the simulation modules don't care about the source.

Default key bindings come from `src/sdl/video.c`'s `keybindings` table. Persist user-customized bindings via `localStorage` (Phase 11 wires this up properly). Touch controls use the existing `touch_button` schema in `src/video.h:114`.

This is straightforward — listed at 90% because the failure modes (key repeat, focus loss, mobile virtual keyboard, iOS audio-unlock-on-touch) are all known and documented.

### References
- `src/sdl/video.c` — SDL key event handling, default bindings
- `src/touch_area.c` — touch button hit-testing logic
- `src/video.h:14-50` — `gamekey` enum, `keysdown` flags

### Implementation Steps
- [x] `web/src/input.js` — `keydown`/`keyup` listeners, mapping `KeyboardEvent.code` to `gamekey`
- [x] Track per-key flags: `KEYDOWN_KEYBOARD`, `KEYDOWN_WAS_PRESSED`, etc., matching C
- [x] Implement `getGameKeys()` returning the C `K_*` bitmask used by `swmove.c`
- [x] Touch overlay: render touch buttons in `Vid_DrawTouchControls` (port from `swstbar.c`/`touch_area.c`); pointer-down sets the corresponding gamekey
- [x] Show touch UI only on coarse-pointer devices (`matchMedia('(pointer: coarse)')`)

### Verification Steps
- [x] All game keys work (throttle, bomb, fire, flip, home, missile, starburst, sound)
- [x] Holding a key does not cause repeat-fire on systems with key repeat
- [x] Tab-away then back does not leave a key stuck "down"
- [x] On a mobile device, touch buttons fire the correct gamekey

---

## Phase 8: Game Loop Wiring + Title Screen + Status Bar
**Confidence: 75%**

### Description
First playable build. Port `src/swmain.c` (294 LOC — the main game loop, level start/end, score handling) and the platform-independent parts of `src/swinit.c` (1364 LOC — most of it is command-line parsing and mission selection that's not relevant to the browser; the relevant parts are world initialization, plane spawning, ground generation). Port `src/swtitle.c` (487 LOC — title screen, plane animation) and `src/swstbar.c` (215 LOC — status bar with fuel, bombs, score gauges).

End state of this phase: launching `npm run dev` shows the title screen, pressing Start drops into a single-player game on `original.sop`, the status bar updates, the plane is flyable, and crashes/wins return to the title screen.

Confidence 75% — this is where Phase 6 bugs surface. Budget time for an iterative debug pass against the C build's behavior (run both side by side).

### References
- `src/swmain.c` — `swmain()` and game-mode dispatch
- `src/swinit.c` — `setupgame`, `initworld`, `initplyr` are the parts to port; ignore `parseargs` etc.
- `src/swtitle.c` — title rendering, demo plane
- `src/swstbar.c` — gauges
- `src/swend.c` — end-of-game screen (small, fold in here)

### Implementation Steps
- [x] Port `swinit` world setup (object spawning from mission, ground init) into `web/src/sim/init.js`
- [x] Port `swmain` loop into `web/src/main.js` driving Phase 1's tick
- [x] Port `swtitle.js` and wire as initial state
- [x] Port `swstbar.js` and call from render
- [x] Port `swend.js` (end-of-game scoring screen)

### Verification Steps
- [x] Title screen shows the demo plane animation
- [x] Pressing Start begins a game; pressing Back returns from a paused state (Back/pause defers to Phase 9 menu)
- [x] Player can fly a full mission (take off, drop bombs on a target, land, take off again)
- [x] Status bar gauges update correctly (fuel decreases, bombs drop, score increments) — score text deferred to Phase 9 (bitmap font)
- [x] Game-over conditions (max crashes, all targets destroyed) trigger the end screen

---

## Phase 9: Collision, Splat, Text, Menus
**Confidence: 70%**

### Description
Port the remaining gameplay subsystems: `src/swcollsn.c` (694 LOC — pairwise object collision detection, the most algorithmically dense file), `src/swsplat.c` (113 LOC — splat / debris sprites after kills), `src/swtext.c` (290 LOC — text rendering using bitmap font), and `src/swmenu.c` (390 LOC — menu system: difficulty, palette select, key rebinding, mission select).

Collision is rated 70% because it uses bbox + per-pixel mask checks pulling from the sprite mask data in Phase 3 — any mask-bit-order mistake from Phase 3 surfaces here as collisions misfiring. Test by flying into things at every angle.

Menu is straightforward but has many screens. The bitmap font (`src/font.h`) is hardcoded data; copy it verbatim into a JS array.

### References
- `src/swcollsn.c` + `src/swcollsn.h` — collision dispatch and per-pair handlers
- `src/swsplat.c` — death animations
- `src/swtext.c` — text drawing API used everywhere
- `src/swmenu.c` — menu screens
- `src/font.h` — bitmap font data
- `src/swsymbol.c` — sprite mask data layout (relevant for collision)

### Implementation Steps
- [x] Port `font.h` to a `Uint8Array` in `web/src/sim/font.js`
- [x] Port `swtext.js` (text rendering, used by menu/status/end)
- [x] Port `swcollsn.js`; integrate with `mainmove` from Phase 6
- [x] Port `swsplat.js`
- [x] Port `swmenu.js` with all submenus (options, palette, controls, mission select)
- [x] Wire menu into title screen flow

### Verification Steps
- [x] Plane-vs-plane, plane-vs-bullet, bomb-vs-target, plane-vs-ground collisions all detect at the right pixel
- [x] Killed objects spawn appropriate splat/explosion
- [x] All menu screens reachable from the title and from in-game pause; rebinding a key persists for the session
- [x] Mission-select menu lists all `.sop` files in `web/src/data/`

---

## Phase 10: Sound (PC Speaker via WebAudio)
**Confidence: 65%**

### Description
Port `src/swsound.c` (589 LOC — sound trigger logic, tone tables) and `src/sdl/pcsound.c` (331 LOC — PC speaker emulation). The PC speaker is a square-wave generator with tone changes scheduled at fixed intervals; in WebAudio this becomes an `OscillatorNode` of type `'square'` with frequency changes via `setValueAtTime` queued on the `AudioContext` clock.

Tricky bits: (1) iOS/Safari requires user gesture to start audio — initialize on first input; (2) the C code uses a callback-driven sample buffer for the SDL backend, but for a square-wave PC-speaker emulation we can drive the oscillator directly without a sample buffer at all, simplifying the port; (3) the title music is a tone sequence in `original.sop` parsed by Phase 4 — confirm that path during testing.

Confidence 65% because PC speaker timing is finicky and Safari's WebAudio scheduling has gotchas. May require fallback to scheduled `AudioBufferSourceNode` if oscillator-frequency-ramp jitter is audible.

### References
- `src/swsound.c` + `src/swsound.h` — high-level sound triggers (`Sound_*`)
- `src/sdl/pcsound.c` — PC speaker square-wave generator
- `src/pcsound.h` — backend API
- `maps/original.sop` — title music tone sequence

### Implementation Steps
- [x] `web/src/audio.js` — `AudioContext`, single `OscillatorNode + GainNode`, lazy init on first input
- [x] Port `swsound.js` — high-level trigger map (`Sound_Engine`, `Sound_Bomb`, etc.)
- [x] Port the tone-table walker that reads scheduled tones and converts to scheduled `setValueAtTime` calls
- [x] Wire the sound-on/off toggle (`KEY_SOUND`)
- [x] Title music plays on title screen

### Verification Steps
- [ ] Engine, bomb, gun, and crash sounds play when triggered
- [ ] Title music plays in correct tempo (compare to C build by ear)
- [ ] Audio works in Chrome, Firefox, Safari, mobile Safari (after first user gesture)
- [ ] No console errors when audio context is suspended (e.g. tab in background)

---

## Phase 11: Config and High Scores via localStorage
**Confidence: 90%**

### Description
Port `src/swconf.c` (308 LOC — reads/writes `~/.sopwith.cfg`) and `src/hiscore.c` (404 LOC — reads/writes `hiscores.txt`). Replace file I/O with `localStorage` keyed under `sopwith.config` and `sopwith.hiscores`. The data shapes are small and well-defined; no ambiguity. Schema-version the stored JSON so future changes can migrate.

### References
- `src/swconf.c` — config keys (palette, key bindings, conf_* flags)
- `src/hiscore.c` — high score table format and ranking logic
- `doc/sopwith.cfg.5` — config format docs

### Implementation Steps
- [x] `web/src/sim/config.js` — `loadConfig()`, `saveConfig()` over `localStorage`
- [x] `web/src/sim/hiscore.js` — `loadHiScores()`, `saveHiScores()`, `addScore()`, ranking
- [x] Hook config load into boot (Phase 8); save on menu changes
- [x] Hook hiscore display into end-of-game (Phase 8)
- [x] Schema-version both blobs (`{ version: 1, ... }`) and add a one-line migration shim

### Verification Steps
- [ ] Changing palette in the menu, reloading the page, palette stays
- [ ] Posting a high score, reloading, score appears
- [ ] Manually corrupting a localStorage entry yields a clean reset rather than a crash

---

## Phase 12: Build, Polish, Cutover
**Confidence: 85%**

### Description
Final pass before retiring the C code. Tighten the `npm run build` output (single-bundle JS, hashed filename, copied data files), add a basic CI workflow that runs `npm run build` on push, and ship a static `dist/` deployable to GitHub Pages or any static host. Then delete the C tree (`src/`, `pkg/macos`, `pkg/win32`, `configure.ac`, `Makefile.am`, `autogen.sh`, `embuild.sh`, `pkg/emscripten`) in a single commit and promote `web/` contents to the repo root.

Cutover is a one-way commit — confirm with the user before doing it. Tag the last C commit beforehand (e.g. `git tag final-c-build`) so the C source is recoverable.

### References
- `pkg/emscripten/sopwith.html` — reference for production-quality HTML harness (favicon, PWA manifest, viewport, error UI)
- `pkg/emscripten/manifest.json` — PWA manifest to port over

### Implementation Steps
- [x] Production esbuild config: minify, single bundle, content-hashed filename, source map
- [x] Copy `pkg/emscripten/manifest.json`, `icon-192.png`, `icon-512.png`, `loading.gif` into `web/public/`
- [x] Add GitHub Actions workflow: `npm install && npm run build`; optional `actions/deploy-pages`
- [ ] Smoke test on Chrome, Firefox, Safari, mobile Safari
- [ ] Tag `final-c-build` on the last C commit
- [ ] In a single commit, delete C tree and promote `web/` to root
- [ ] Update `README.md` for the JS build (replace autotools instructions with `npm install && npm run dev`)

### Verification Steps
- [ ] `npm run build` produces a `dist/` that runs from any static server with no console errors
- [ ] `final-c-build` tag points to the last commit before C deletion; `git checkout final-c-build` builds the C version
- [ ] Lighthouse / DevTools audit: no major errors, app loads in under 2s on a mid-range mobile connection
- [ ] All gameplay verifications from prior phases still pass on the production build
