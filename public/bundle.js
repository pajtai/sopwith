(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/sim/constants.js
  var constants_exports = {};
  __export(constants_exports, {
    ANGLES: () => ANGLES,
    BIRDLIFE: () => BIRDLIFE,
    BOMBLIFE: () => BOMBLIFE,
    BULLIFE: () => BULLIFE,
    BULSPEED: () => BULSPEED,
    BURSTLIFE: () => BURSTLIFE,
    CLOSE: () => CLOSE,
    COS: () => COS,
    DEFAULT_PORT: () => DEFAULT_PORT,
    EXPLLIFE: () => EXPLLIFE,
    FALLCOUNT: () => FALLCOUNT,
    FLOCKLIFE: () => FLOCKLIFE,
    FPS: () => FPS,
    GAUGEX: () => GAUGEX,
    HOME: () => HOME,
    K_ACCEL: () => K_ACCEL,
    K_BOMB: () => K_BOMB,
    K_BREAK: () => K_BREAK,
    K_DEACC: () => K_DEACC,
    K_FLAPD: () => K_FLAPD,
    K_FLAPU: () => K_FLAPU,
    K_FLIP: () => K_FLIP,
    K_HARRYKEYS: () => K_HARRYKEYS,
    K_HOME: () => K_HOME,
    K_MISSILE: () => K_MISSILE,
    K_SHOT: () => K_SHOT,
    K_SOUND: () => K_SOUND,
    K_STARBURST: () => K_STARBURST,
    MAXBOMBS: () => MAXBOMBS,
    MAXBURSTS: () => MAXBURSTS,
    MAXCRASH: () => MAXCRASH,
    MAXCRCOUNT: () => MAXCRCOUNT,
    MAXFUEL: () => MAXFUEL,
    MAXMISSILES: () => MAXMISSILES,
    MAXROUNDS: () => MAXROUNDS,
    MAX_NET_LAG: () => MAX_NET_LAG,
    MAX_OBJS: () => MAX_OBJS,
    MAX_PLANES: () => MAX_PLANES,
    MAX_PLYR: () => MAX_PLYR,
    MAX_SPEED: () => MAX_SPEED,
    MAX_THROTTLE: () => MAX_THROTTLE,
    MAX_Y: () => MAX_Y,
    MEDAL_COMPETENCE: () => MEDAL_COMPETENCE,
    MEDAL_PURPLEHEART: () => MEDAL_PURPLEHEART,
    MEDAL_VALOUR: () => MEDAL_VALOUR,
    MIN_SPEED: () => MIN_SPEED,
    MISSLIFE: () => MISSLIFE,
    NEAR: () => NEAR,
    NUM_STRAY_BIRDS: () => NUM_STRAY_BIRDS,
    ORIENTS: () => ORIENTS,
    QUIT: () => QUIT,
    RIBBON_ACE: () => RIBBON_ACE,
    RIBBON_COMPETENCE2: () => RIBBON_COMPETENCE2,
    RIBBON_PERFECT: () => RIBBON_PERFECT,
    RIBBON_PREVALOUR: () => RIBBON_PREVALOUR,
    RIBBON_SERVICE: () => RIBBON_SERVICE,
    RIBBON_TOPACE: () => RIBBON_TOPACE,
    SAFERESET: () => SAFERESET,
    SCR_CENTR: () => SCR_CENTR,
    SCR_HGHT: () => SCR_HGHT,
    SCR_MNSH: () => SCR_MNSH,
    SCR_MXSH: () => SCR_MXSH,
    SCR_WDTH: () => SCR_WDTH,
    SIN: () => SIN,
    SMOKELIFE: () => SMOKELIFE,
    STALLCOUNT: () => STALLCOUNT,
    SYM_HGHT: () => SYM_HGHT,
    SYM_WDTH: () => SYM_WDTH,
    TARGHITCOUNT: () => TARGHITCOUNT,
    WRLD_RSX: () => WRLD_RSX,
    WRLD_RSY: () => WRLD_RSY,
    sintab: () => sintab
  });
  var FPS = 10;
  var DEFAULT_PORT = 3847;
  var MAX_Y = 200;
  var MIN_SPEED = 4;
  var MAX_SPEED = 8;
  var MAX_THROTTLE = 4;
  var MAXCRCOUNT = 10;
  var FALLCOUNT = 10;
  var STALLCOUNT = 6;
  var TARGHITCOUNT = 10;
  var SCR_WDTH = 320;
  var SCR_HGHT = 200;
  var SCR_CENTR = SCR_WDTH / 2 - 8;
  var SCR_MNSH = 16;
  var SCR_MXSH = 75;
  function WRLD_RSX(gm_max_x) {
    return Math.floor(gm_max_x / 320 * 2 + 1);
  }
  var WRLD_RSY = Math.floor(MAX_Y / SCR_MNSH + 1);
  var GAUGEX = SCR_CENTR - 25;
  var MAXROUNDS = 200;
  var MAXBOMBS = 5;
  var MAXMISSILES = 5;
  var MAXBURSTS = 5;
  var MAXFUEL = 9e3;
  var MAXCRASH = 5;
  var MAX_PLANES = 16;
  var MAX_PLYR = 4;
  var MAX_OBJS = 100;
  var NUM_STRAY_BIRDS = 1;
  var ANGLES = 16;
  var ORIENTS = 2;
  var SYM_WDTH = 16;
  var SYM_HGHT = 16;
  var BULSPEED = 10;
  var BULLIFE = 10;
  var BOMBLIFE = 5;
  var MISSLIFE = 50;
  var BURSTLIFE = 20;
  var EXPLLIFE = 3;
  var SMOKELIFE = 10;
  var BIRDLIFE = 4;
  var FLOCKLIFE = 5;
  var NEAR = 150 * 150;
  var CLOSE = 32;
  var HOME = 16;
  var SAFERESET = 32;
  var QUIT = -5e3;
  var K_ACCEL = 1;
  var K_DEACC = 2;
  var K_FLAPU = 4;
  var K_FLAPD = 8;
  var K_FLIP = 16;
  var K_SHOT = 32;
  var K_HARRYKEYS = 64;
  var K_BOMB = 256;
  var K_HOME = 512;
  var K_SOUND = 1024;
  var K_BREAK = 2048;
  var K_MISSILE = 4096;
  var K_STARBURST = 8192;
  var MEDAL_PURPLEHEART = 0;
  var MEDAL_COMPETENCE = 1;
  var MEDAL_VALOUR = 2;
  var RIBBON_ACE = 0;
  var RIBBON_TOPACE = 1;
  var RIBBON_PERFECT = 2;
  var RIBBON_SERVICE = 3;
  var RIBBON_COMPETENCE2 = 4;
  var RIBBON_PREVALOUR = 5;
  var MAX_NET_LAG = 12;
  var sintab = Object.freeze([
    0,
    98,
    181,
    237,
    256,
    237,
    181,
    98,
    0,
    -98,
    -181,
    -237,
    -256,
    -237,
    -181,
    -98
  ]);
  function SIN(x) {
    let i = x % ANGLES;
    if (i < 0) i += ANGLES;
    return sintab[i];
  }
  function COS(x) {
    let i = (x + ANGLES / 4) % ANGLES;
    if (i < 0) i += ANGLES;
    return sintab[i];
  }

  // src/loop.js
  var TICK_MS = 1e3 / FPS;
  var MAX_CATCHUP = 5;
  function startLoop({ tick, render }) {
    let last = performance.now();
    let acc = 0;
    function frame(now) {
      const dt = now - last;
      last = now;
      acc += dt;
      let n = 0;
      while (acc >= TICK_MS && n < MAX_CATCHUP) {
        tick();
        acc -= TICK_MS;
        n++;
      }
      if (n === MAX_CATCHUP) acc = 0;
      render(acc / TICK_MS);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // src/video.js
  var COLOR_MAPPINGS = [
    [0, 3, 3, 3],
    // FACTION_NONE — all white
    [0, 1, 2, 3],
    // PLAYER1 — cyan fuselage, magenta wings
    [0, 2, 1, 3],
    // PLAYER2 — magenta fuselage, cyan wings
    [0, 1, 3, 2],
    // PLAYER3
    [0, 2, 3, 1],
    // PLAYER4
    [0, 3, 1, 2],
    // PLAYER5
    [0, 3, 2, 1],
    // PLAYER6
    [0, 1, 1, 3],
    // PLAYER7 — all-cyan
    [0, 2, 2, 3]
    // PLAYER8 — all-magenta
  ];
  function rgba(r, g, b) {
    return 255 << 24 | b << 16 | g << 8 | r;
  }
  var VIDEO_PALETTES = [
    { name: "CGA 1", colors: [rgba(0, 0, 0), rgba(0, 255, 255), rgba(255, 0, 255), rgba(255, 255, 255)] },
    { name: "CGA 2", colors: [rgba(0, 0, 0), rgba(0, 255, 0), rgba(255, 0, 0), rgba(255, 255, 0)] },
    { name: "CGA 3", colors: [rgba(0, 0, 0), rgba(0, 255, 255), rgba(255, 0, 0), rgba(255, 255, 255)] },
    { name: "Mono Amber", colors: [rgba(0, 0, 0), rgba(255, 170, 16), rgba(242, 125, 0), rgba(255, 226, 52)] },
    { name: "Mono Green", colors: [rgba(0, 0, 0), rgba(12, 238, 56), rgba(8, 202, 48), rgba(49, 253, 90)] },
    { name: "Mono Grey", colors: [rgba(0, 0, 0), rgba(222, 222, 210), rgba(182, 186, 182), rgba(255, 255, 255)] },
    { name: "Tosh LCD 1", colors: [rgba(213, 226, 138), rgba(150, 160, 150), rgba(120, 120, 160), rgba(0, 20, 200)] },
    { name: "Tosh LCD 2", colors: [rgba(0, 20, 200), rgba(120, 120, 160), rgba(150, 160, 150), rgba(213, 226, 138)] },
    { name: "Tosh LCD 3", colors: [rgba(114, 136, 121), rgba(75, 110, 117), rgba(66, 90, 117), rgba(39, 70, 109)] },
    { name: "IBM LCD", colors: [rgba(107, 133, 136), rgba(86, 107, 110), rgba(66, 82, 84), rgba(46, 57, 59)] },
    { name: "Tandy LCD", colors: [rgba(72, 173, 104), rgba(54, 140, 97), rgba(36, 108, 90), rgba(19, 74, 84)] },
    { name: "Gas Plasma", colors: [rgba(125, 27, 2), rgba(211, 65, 0), rgba(168, 46, 1), rgba(254, 84, 0)] },
    { name: "Atari", colors: [rgba(0, 0, 0), rgba(0, 119, 255), rgba(255, 0, 0), rgba(255, 255, 255)] },
    { name: "Muted", colors: [rgba(0, 0, 0), rgba(120, 195, 214), rgba(197, 81, 197), rgba(199, 199, 199)] }
  ];
  var activePalette = 0;
  var VID_PITCH = SCR_WDTH;
  var VRAM_SIZE = SCR_WDTH * SCR_HGHT;
  var vidBuffer = new Uint8Array(VRAM_SIZE);
  var canvas = null;
  var ctx = null;
  var imageData = null;
  var pixels32 = null;
  function initVideo(canvasEl) {
    canvas = canvasEl;
    canvas.width = SCR_WDTH;
    canvas.height = SCR_HGHT;
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    imageData = ctx.createImageData(SCR_WDTH, SCR_HGHT);
    pixels32 = new Uint32Array(imageData.data.buffer);
    clear();
  }
  function offset(x, y) {
    return (SCR_HGHT - 1 - y) * VID_PITCH + x;
  }
  function clear() {
    vidBuffer.fill(0);
  }
  function xorPixel(x, y, clr) {
    if (x < 0 || x >= SCR_WDTH || y < 0 || y >= SCR_HGHT) return;
    vidBuffer[offset(x, y)] ^= clr & 3;
  }
  function box(x, y, w, h, c) {
    const top = SCR_HGHT - 1 - y;
    for (let row = 0; row <= h; row++) {
      const py = top + row;
      if (py < 0 || py >= SCR_HGHT) continue;
      const start = py * VID_PITCH + x;
      let runW = w;
      if (x + runW > SCR_WDTH) runW = SCR_WDTH - x;
      if (runW <= 0) continue;
      vidBuffer.fill(c & 3, start, start + runW);
    }
  }
  function fuselageColor(faction) {
    const idx = Math.max(0, Math.min(faction, COLOR_MAPPINGS.length - 1));
    return COLOR_MAPPINGS[idx][1];
  }
  function drawSymbol(x, y, symbol, faction) {
    if (!symbol) return;
    let w = symbol.w;
    let h = symbol.h;
    if (w === 1 && h === 1) {
      xorPixel(x, y, faction);
      return;
    }
    const leftSkip = x < 0 ? -x : 0;
    if (x + w > SCR_WDTH) w = SCR_WDTH - x;
    if (h > y + 1) h = y + 1;
    if (w <= leftSkip || h <= 0) return;
    const mapping = COLOR_MAPPINGS[Math.max(0, Math.min(faction, COLOR_MAPPINGS.length - 1))];
    const src = symbol.data;
    let dstRow = (SCR_HGHT - 1 - y) * VID_PITCH + x + leftSkip;
    let srcRow = 0;
    for (let y1 = 0; y1 < h; y1++) {
      for (let x1 = leftSkip; x1 < w; x1++) {
        const i = src[srcRow + x1];
        if (i) vidBuffer[dstRow + (x1 - leftSkip)] ^= mapping[i];
      }
      srcRow += symbol.w;
      dstRow += VID_PITCH;
    }
  }
  function dispGround(gptr, gOffset, xstart, w) {
    const SCR_H_MINUS_1 = SCR_HGHT - 1;
    let g = gOffset;
    let sptr = xstart;
    let y = SCR_H_MINUS_1;
    let hc = Math.min(gptr[g++], SCR_H_MINUS_1);
    let hl = hc;
    let hr;
    for (let x = 0; x < w - 1; x++) {
      hr = Math.min(gptr[g++], SCR_H_MINUS_1);
      if (y > hl) {
        sptr += VID_PITCH * (y - hl);
        y = hl;
      }
      if (y > hr) {
        sptr += VID_PITCH * (y - hr);
        y = hr;
      }
      if (y >= hc) {
        sptr += VID_PITCH * (y - hc + 1);
        y = hc - 1;
      }
      while (y < hc) {
        y++;
        sptr -= VID_PITCH;
        vidBuffer[sptr] ^= 3;
      }
      hl = hc;
      hc = hr;
      sptr++;
    }
    sptr += (y - hc) * VID_PITCH;
    vidBuffer[sptr] ^= 3;
  }
  var SBAR_HGHT = 19;
  function dispGroundSolid(gptr, gOffset, xstart, w) {
    const SCR_H_MINUS_1 = SCR_HGHT - 1;
    for (let x = xstart, gi = gOffset; x < xstart + w; x++) {
      const gc = Math.min(gptr[gi++], SCR_H_MINUS_1);
      let sptr = (SCR_H_MINUS_1 - SBAR_HGHT) * VID_PITCH + x;
      for (let y = gc - SBAR_HGHT + 1; y > 0; y--) {
        vidBuffer[sptr] ^= 3;
        sptr -= VID_PITCH;
      }
    }
  }
  function setVideoPalette(i) {
    if (i >= 0 && i < VIDEO_PALETTES.length) activePalette = i;
  }
  function getVideoPaletteName(i) {
    return VIDEO_PALETTES[i]?.name ?? "";
  }
  function getNumVideoPalettes() {
    return VIDEO_PALETTES.length;
  }
  function getActivePaletteIndex() {
    return activePalette;
  }
  function present() {
    if (!ctx) return;
    const lut = VIDEO_PALETTES[activePalette].colors;
    const out = pixels32;
    const buf = vidBuffer;
    for (let i = 0; i < VRAM_SIZE; i++) out[i] = lut[buf[i] & 3];
    ctx.putImageData(imageData, 0, 0);
  }

  // src/input.js
  function initInput() {
  }

  // src/audio.js
  function initAudio() {
  }

  // src/sim/types.js
  var types_exports = {};
  __export(types_exports, {
    FACTION: () => FACTION,
    GROUND_RENDER: () => GROUND_RENDER,
    NUM_FACTIONS: () => NUM_FACTIONS,
    NUM_POWERUP_TYPES: () => NUM_POWERUP_TYPES,
    NUM_TARGET_TYPES: () => NUM_TARGET_TYPES,
    OBENDSTATUS: () => OBENDSTATUS,
    OBSTATE: () => OBSTATE,
    OBTYPE: () => OBTYPE,
    PLAYMODE: () => PLAYMODE,
    POWERUP: () => POWERUP,
    TARGET: () => TARGET,
    TRANSFORM: () => TRANSFORM,
    createFlightScore: () => createFlightScore,
    createGames: () => createGames,
    createObject: () => createObject,
    createOriginalOb: () => createOriginalOb,
    createScore: () => createScore
  });
  var TARGET = Object.freeze({
    HANGAR: 0,
    FACTORY: 1,
    OIL_TANK: 2,
    TANK: 3,
    TRUCK: 4,
    TANKER_TRUCK: 5,
    FLAG: 6,
    TENT: 7,
    CUSTOM1: 8,
    CUSTOM2: 9,
    CUSTOM3: 10,
    CUSTOM4: 11,
    CUSTOM5: 12,
    CUSTOM_PASSIVE1: 13,
    CUSTOM_PASSIVE2: 14,
    CUSTOM_PASSIVE3: 15,
    CUSTOM_PASSIVE4: 16,
    CUSTOM_PASSIVE5: 17,
    RADIO_TOWER: 18,
    WATER_TOWER: 19
  });
  var NUM_TARGET_TYPES = 20;
  var POWERUP = Object.freeze({
    AMMO: 0,
    BOMB: 1,
    FUEL: 2,
    AMMO_BIG: 3,
    BOMB_BIG: 4,
    FUEL_BIG: 5
  });
  var NUM_POWERUP_TYPES = 6;
  var GROUND_RENDER = Object.freeze({
    PREF: 0,
    LINE: 1,
    SOLID: 2
  });
  var PLAYMODE = Object.freeze({
    UNSET: 0,
    SINGLE: 1,
    COMPUTER: 2,
    ASYNCH: 3,
    NOVICE: 4
  });
  var OBSTATE = Object.freeze({
    WAITING: 0,
    FLYING: 1,
    HIT: 2,
    CRASHED: 3,
    FALLING: 4,
    STANDING: 5,
    STALLED: 6,
    REBUILDING: 7,
    WOUNDED: 8,
    WOUNDSTALL: 9,
    FINISHED: 91
  });
  var OBENDSTATUS = Object.freeze({
    PLAYING: 0,
    WINNER: 1,
    LOSER: 2
  });
  var OBTYPE = Object.freeze({
    GROUND: 0,
    PLANE: 1,
    BOMB: 2,
    SHOT: 3,
    TARGET: 4,
    EXPLOSION: 5,
    SMOKE: 6,
    FLOCK: 7,
    BIRD: 8,
    OX: 9,
    MISSILE: 10,
    STARBURST: 11,
    BALLOON: 12,
    POWERUP: 13,
    DUMMYTYPE: 99
  });
  var FACTION = Object.freeze({
    NONE: 0,
    PLAYER1: 1,
    PLAYER2: 2,
    PLAYER3: 3,
    PLAYER4: 4,
    PLAYER5: 5,
    PLAYER6: 6,
    PLAYER7: 7,
    PLAYER8: 8
  });
  var NUM_FACTIONS = 9;
  var TRANSFORM = Object.freeze({
    NONE: 0,
    ROTATE90: 1,
    ROTATE180: 2,
    ROTATE270: 3,
    FLIP: 4,
    FLIP_ROTATE90: 5,
    MIRROR: 6,
    MIRROR_ROTATE90: 7
  });
  function createFlightScore() {
    return {
      planekills: 0,
      valour: 0,
      killscore: 0,
      combatwound: false
    };
  }
  function createScore() {
    return {
      score: 0,
      planekills: 0,
      valour: 0,
      landings: 0,
      medals_nr: 0,
      medals: [0, 0, 0],
      ribbons_nr: 0,
      ribbons: [0, 0, 0, 0, 0, 0]
    };
  }
  function createOriginalOb() {
    return {
      type: OBTYPE.DUMMYTYPE,
      x: 0,
      orient: 0,
      territory_l: 0,
      territory_r: 0,
      faction: FACTION.NONE,
      transform: TRANSFORM.NONE
    };
  }
  function createObject() {
    return {
      ob_state: OBSTATE.WAITING,
      ob_x: 0,
      ob_y: 0,
      ob_dx: 0,
      ob_dy: 0,
      ob_angle: 0,
      ob_orient: 0,
      ob_speed: 0,
      ob_accel: 0,
      ob_flaps: 0,
      ob_firing: null,
      ob_rounds: 0,
      ob_hitcount: 0,
      ob_life: 0,
      ob_owner: null,
      ob_faction: FACTION.NONE,
      ob_target: null,
      ob_bombs: 0,
      ob_clr: 0,
      ob_lx: 0,
      ob_ly: 0,
      ob_ldx: 0,
      ob_ldy: 0,
      ob_next: null,
      ob_prev: null,
      ob_soundf: null,
      ob_movef: null,
      ob_xnext: null,
      ob_xprev: null,
      ob_crashcnt: 0,
      ob_symbol: null,
      ob_bdelay: 0,
      ob_type: OBTYPE.DUMMYTYPE,
      ob_sound: null,
      ob_missiles: 0,
      ob_mfiring: null,
      ob_mdelay: 0,
      ob_missiletarget: null,
      ob_bursts: 0,
      ob_bsdelay: 0,
      ob_plrnum: 0,
      ob_endsts: OBENDSTATUS.PLAYING,
      ob_score: createScore(),
      ob_flightscore: createFlightScore(),
      ob_original_ob: null,
      ob_orig_y: 0,
      ob_bombing: false,
      ob_drwflg: false,
      ob_onmap: false,
      ob_home: false,
      ob_athome: false,
      ob_bfiring: false,
      ob_goingsun: false
    };
  }
  function createGames() {
    return {
      gm_rseed: 0,
      gm_objects: [],
      gm_num_objects: 0,
      gm_ground: null,
      // populated from .sop file
      gm_max_x: 0
    };
  }

  // src/sim/state.js
  function makeSentinel(x) {
    const ob = createObject();
    ob.ob_x = x;
    ob.ob_xprev = null;
    ob.ob_xnext = null;
    return ob;
  }
  var topobj = makeSentinel(-32767);
  var botobj = makeSentinel(32767);
  var state = {
    // Configuration flags (src/swmain.c:32-44)
    conf_missiles: false,
    conf_solidground: false,
    conf_hudsplats: false,
    conf_wounded: false,
    conf_animals: true,
    conf_harrykeys: false,
    conf_medals: true,
    conf_big_explosions: true,
    conf_video_palette: 0,
    // Game state (src/swmain.c:46-77)
    playmode: PLAYMODE.UNSET,
    currgame: null,
    // GAMES
    consoleplayer: null,
    // OBJECTS
    numtarg: new Array(9).fill(0),
    // [NUM_FACTIONS]; index by faction
    countmove: 0,
    gamenum: 0,
    gmaxspeed: 0,
    gminspeed: 0,
    targrnge: 0,
    titleflg: false,
    soundflg: false,
    displx: 0,
    planes: new Array(MAX_PLANES).fill(null),
    // OBJECTS*[MAX_PLANES]
    num_planes: 0,
    // Object list pointers
    objbot: null,
    objtop: null,
    objfree: null,
    deltop: null,
    delbot: null,
    endcount: 0,
    player: 0,
    plyrplane: false,
    compplane: false,
    explseed: 0,
    keydelay: -1,
    dispcnt: 0,
    endstat: 0,
    maxcrash: 0,
    restart_flag: false,
    // Mutable copy of currgame.gm_ground — Phase 6 onward (src/swinit.c:42).
    ground: null,
    // src/swmove.c:38: set when player has flown long enough to no longer
    // need novice mode hand-holding.
    successful_flight: false,
    quit: false,
    last_ground_time: 0,
    // Network/multiplayer (out of scope for first JS release but kept for
    // shape compatibility with code that references them).
    latest_player_commands: Array.from(
      { length: MAX_PLYR },
      () => new Array(MAX_NET_LAG).fill(0)
    ),
    latest_player_time: new Array(MAX_PLYR).fill(0),
    num_players: 0
  };

  // src/sim/yocton.js
  var TOKEN_STRING = "STRING";
  var TOKEN_COLON = "COLON";
  var TOKEN_OPEN = "OPEN";
  var TOKEN_CLOSE = "CLOSE";
  var TOKEN_EOF = "EOF";
  var UTF8_BOM = "\uFEFF";
  function isSymbolChar(ch) {
    if (!ch) return false;
    const c = ch.charCodeAt(0);
    if (c >= 48 && c <= 57) return true;
    if (c >= 65 && c <= 90) return true;
    if (c >= 97 && c <= 122) return true;
    return ch === "_" || ch === "-" || ch === "+" || ch === ".";
  }
  var Tokenizer = class {
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
        } else if (c === " " || c === "	" || c === "\r" || c === "\n") {
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
        case "n":
          return "\n";
        case "t":
          return "	";
        case "\\":
          return "\\";
        case '"':
          return '"';
        case "x": {
          const hex = this.text.substr(this.i, 2);
          if (!/^[0-9a-fA-F]{2}$/.test(hex)) {
            throw this.error("\\x must be followed by two hex digits");
          }
          this.i += 2;
          const v = parseInt(hex, 16);
          if (v === 0 || v >= 32) {
            throw this.error("\\x escape limited to 0x01-0x1f");
          }
          return String.fromCharCode(v);
        }
        default:
          throw this.error(`unknown escape \\${c}`);
      }
    }
    readString() {
      let out = "";
      for (; ; ) {
        if (this.i >= this.text.length) throw this.error("unexpected EOF in string");
        const c = this.advance();
        if (c === '"') {
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
            this.advance();
            continue;
          }
          this.i = save;
          this.line = saveLine;
          return out;
        } else if (c === "\\") {
          out += this.readEscape();
        } else if (c.charCodeAt(0) < 32 && c !== "	") {
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
        case ":":
          return { type: TOKEN_COLON };
        case "{":
          return { type: TOKEN_OPEN };
        case "}":
          return { type: TOKEN_CLOSE };
        case '"':
          return { type: TOKEN_STRING, value: this.readString() };
        case "&":
          throw this.error("`&` only valid between quoted strings");
        default:
          return { type: TOKEN_STRING, value: this.readSymbol(c) };
      }
    }
  };
  var YoctonObject = class {
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
  };
  function parseObject(tk, isRoot) {
    const obj = new YoctonObject();
    for (; ; ) {
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
  function parseYocton(text) {
    const tk = new Tokenizer(text);
    return parseObject(tk, true);
  }

  // src/sim/games.js
  var OBTYPE_NAMES = [
    "GROUND",
    "PLANE",
    "BOMB",
    "SHOT",
    "TARGET",
    "EXPLOSION",
    "SMOKE",
    "FLOCK",
    "BIRD",
    "OX",
    "MISSILE",
    "STARBURST",
    "BALLOON",
    "POWERUP"
  ];
  var TRANSFORM_NAMES = [
    "NONE",
    "ROTATE90",
    "ROTATE180",
    "ROTATE270",
    "FLIP",
    "FLIP_ROTATE90",
    "MIRROR",
    "MIRROR_ROTATE90"
  ];
  var FACTION_NAMES = [
    "NONE",
    "PLAYER1",
    "PLAYER2",
    "PLAYER3",
    "PLAYER4",
    "PLAYER5",
    "PLAYER6",
    "PLAYER7",
    "PLAYER8"
  ];
  var TEXT_ALIGN = Object.freeze({ LEFT: 0, CENTER: 1, RIGHT: 2 });
  var TEXT_ALIGN_NAMES = ["LEFT", "CENTER", "RIGHT"];
  function lookupEnum(names, value, fallback) {
    if (value == null) return fallback;
    const idx = names.indexOf(value);
    if (idx >= 0) return idx;
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
  }
  function readObject(yo) {
    const ob = createOriginalOb();
    for (const p of yo.props) {
      if (p.type !== "string") continue;
      switch (p.name) {
        case "x":
          ob.x = parseInt(p.value, 10) || 0;
          break;
        case "orient":
          ob.orient = parseInt(p.value, 10) || 0;
          break;
        case "territory_l":
          ob.territory_l = parseInt(p.value, 10) || 0;
          break;
        case "territory_r":
          ob.territory_r = parseInt(p.value, 10) || 0;
          break;
        case "transform":
          ob.transform = lookupEnum(TRANSFORM_NAMES, p.value, TRANSFORM.NONE);
          break;
        case "type":
          ob.type = lookupEnum(OBTYPE_NAMES, p.value, OBTYPE.DUMMYTYPE);
          break;
        case "faction":
        case "owner":
          ob.faction = lookupEnum(FACTION_NAMES, p.value, FACTION.NONE);
          break;
      }
    }
    return ob;
  }
  function readGround(yo) {
    const out = [];
    for (const p of yo.props) {
      if (p.name === "_" && p.type === "string") {
        const n = parseInt(p.value, 10);
        if (Number.isFinite(n)) out.push(n);
      }
    }
    return Int32Array.from(out);
  }
  function processLevel(games, levelObj) {
    for (const p of levelObj.props) {
      if (p.name === "object" && p.type === "object") {
        games.gm_objects.push(readObject(p.value));
      } else if (p.name === "ground" && p.type === "object") {
        games.gm_ground = readGround(p.value);
        games.gm_max_x = games.gm_ground.length;
      }
    }
    games.gm_num_objects = games.gm_objects.length;
  }
  function processSymbols(symbolsObj) {
    const out = {};
    for (const p of symbolsObj.props) {
      if (p.type !== "object") continue;
      const frames = {};
      for (const fp of p.value.props) {
        if (fp.type !== "string") continue;
        const frameNum = parseInt(fp.name, 10);
        if (Number.isFinite(frameNum) && frameNum >= 0 && frameNum < 256) {
          frames[frameNum] = fp.value;
        }
      }
      out[p.name] = frames;
    }
    return out;
  }
  function processSounds(soundsObj) {
    return {
      title_tune: soundsObj.getString("title_tune", null)
    };
  }
  function processTitle(titleObj) {
    const items = [];
    for (const p of titleObj.props) {
      if (p.type !== "object") continue;
      const inner = p.value;
      switch (p.name) {
        case "text": {
          items.push({
            kind: "text",
            text: inner.getString("text", ""),
            x: inner.getInt("x", 0),
            y: inner.getInt("y", 0),
            color: inner.getInt("color", 3),
            align: lookupEnum(TEXT_ALIGN_NAMES, inner.getString("align", null), TEXT_ALIGN.LEFT)
          });
          break;
        }
        case "ground":
          items.push({ kind: "ground", render: GROUND_RENDER.PREF, ground: readGround(inner) });
          break;
        case "ground_line":
          items.push({ kind: "ground", render: GROUND_RENDER.LINE, ground: readGround(inner) });
          break;
        case "ground_solid":
          items.push({ kind: "ground", render: GROUND_RENDER.SOLID, ground: readGround(inner) });
          break;
        case "symbol":
          items.push({
            kind: "symbol",
            name: inner.getString("name", null),
            x: inner.getInt("x", 0),
            y: inner.getInt("y", 0),
            frame: inner.getInt("frame", 0),
            transform: lookupEnum(TRANSFORM_NAMES, inner.getString("transform", null), TRANSFORM.NONE),
            faction: lookupEnum(FACTION_NAMES, inner.getString("faction", null), FACTION.PLAYER1)
          });
          break;
        case "line":
          items.push({
            kind: "line",
            x1: inner.getInt("x1", -1),
            y1: inner.getInt("y1", -1),
            x2: inner.getInt("x2", -1),
            y2: inner.getInt("y2", -1),
            color: inner.getInt("color", 3)
          });
          break;
      }
    }
    return items;
  }
  function loadMission(text) {
    const root = parseYocton(text);
    const games = createGames();
    games.gm_rseed = 12345;
    let symbols2 = {};
    let sounds = null;
    let title = null;
    for (const p of root.props) {
      if (p.type !== "object") continue;
      switch (p.name) {
        case "level":
          processLevel(games, p.value);
          break;
        case "symbols":
          symbols2 = processSymbols(p.value);
          break;
        case "sounds":
          sounds = processSounds(p.value);
          break;
        case "title":
          title = processTitle(p.value);
          break;
      }
    }
    return { games, symbols: symbols2, sounds, title };
  }

  // src/sim/symbol.js
  var COLOR_CHARS = " *-#";
  function getDimensions(text) {
    let w = 0;
    let h = 0;
    let i = 0;
    while (i < text.length) {
      const lineStart = i;
      while (i < text.length && text[i] !== "\n") i++;
      const lineEnd = i;
      if (i === text.length && lineStart === lineEnd) break;
      w = Math.max(w, lineEnd - lineStart + 1 >> 1);
      h++;
      if (i < text.length) i++;
    }
    return { w, h };
  }
  function rotate(x, y, w, h, rotations, mirror) {
    for (let i = 0; i < rotations; i++) {
      const tmp = x;
      x = y;
      y = w - 1 - tmp;
      const tw = w;
      w = h;
      h = tw;
    }
    if (mirror) y = h - 1 - y;
    return [x, y];
  }
  function sopsymFromText(text, rotations, mirror) {
    const { w, h } = getDimensions(text);
    const outW = (rotations & 1) === 0 ? w : h;
    const outH = (rotations & 1) === 0 ? h : w;
    const data = new Uint8Array(outW * outH);
    let x = 0, y = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === "\n") {
        x = 0;
        y++;
        continue;
      }
      const ci = COLOR_CHARS.indexOf(ch);
      const c = ci < 0 ? 0 : ci;
      if (x < w * 2 && y < h && x % 2 === 0) {
        const [dx, dy] = rotate(x >> 1, y, w, h, rotations, mirror);
        data[dy * outW + dx] = c;
      }
      x++;
    }
    return { data, w: outW, h: outH };
  }
  function symsetFromText(text) {
    const sym = new Array(8);
    for (let r = 0; r < 4; r++) {
      sym[r] = sopsymFromText(text, r, false);
      sym[r + 4] = sopsymFromText(text, r, true);
    }
    return { sym, name: "", frame: 0 };
  }
  var symbolPixel = { data: new Uint8Array([3]), w: 1, h: 1 };

  // src/sim/symbols.js
  var REGISTRY = [
    { key: "symbol_bomb", name: "swbmbsym", frames: 2 },
    { key: "symbol_targets", name: "swtrgsym", frames: NUM_TARGET_TYPES },
    { key: "symbol_target_hit", name: "swhtrsym", frames: NUM_TARGET_TYPES },
    { key: "symbol_debris", name: "swexpsym", frames: 8 },
    { key: "symbol_flock", name: "swflksym", frames: 2 },
    { key: "symbol_bird", name: "swbrdsym", frames: 2 },
    { key: "symbol_ox", name: "swoxsym", frames: 2 },
    { key: "symbol_shotwin", name: "swshtsym", frames: 1 },
    { key: "symbol_birdsplat", name: "swsplsym", frames: 1 },
    { key: "symbol_missile", name: "swmscsym", frames: 4 },
    { key: "symbol_burst", name: "swbstsym", frames: 2 },
    { key: "symbol_plane", name: "swplnsym", frames: 4 },
    { key: "symbol_plane_hit", name: "swhitsym", frames: 4 },
    { key: "symbol_plane_win", name: "swwinsym", frames: 4 },
    { key: "symbol_medal", name: "swmedalsym", frames: 3 },
    { key: "symbol_ribbon", name: "swribbonsym", frames: 6 },
    { key: "symbol_balloon", name: "swballoonsym", frames: 6 },
    { key: "symbol_powerups", name: "swpowerupsym", frames: NUM_POWERUP_TYPES },
    { key: "symbol_powerup_collected", name: "swpowercollsym", frames: NUM_POWERUP_TYPES }
  ];
  var symbols = {
    symbol_pixel: symbolPixel
  };
  function placeholderSymset() {
    const empty = { data: new Uint8Array(1), w: 1, h: 1 };
    return { sym: [empty, empty, empty, empty, empty, empty, empty, empty], name: "", frame: 0 };
  }
  function buildSymbols(missionSymbols) {
    for (const entry of REGISTRY) {
      const frames = missionSymbols[entry.name] || {};
      const arr = new Array(entry.frames);
      for (let i = 0; i < entry.frames; i++) {
        const text = frames[i];
        if (typeof text === "string" && text.length > 0) {
          const ss = symsetFromText(text);
          ss.name = entry.name;
          ss.frame = i;
          arr[i] = ss;
        } else {
          arr[i] = placeholderSymset();
        }
      }
      symbols[entry.key] = arr;
    }
    return symbols;
  }

  // src/sim/object.js
  var object_exports = {};
  __export(object_exports, {
    PlaneIsFlying: () => PlaneIsFlying,
    PlaneIsKilled: () => PlaneIsKilled,
    PlaneIsStalled: () => PlaneIsStalled,
    PlaneIsWounded: () => PlaneIsWounded,
    allocobj: () => allocobj,
    copyobj: () => copyobj,
    deallobj: () => deallobj,
    deletex: () => deletex,
    insertx: () => insertx,
    movexy: () => movexy,
    setdxdy: () => setdxdy,
    updateobjpos: () => updateobjpos
  });
  function insertx(ob, obp) {
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
  function deletex(ob) {
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
  function updateobjpos(ob) {
    if (ob.ob_xprev === null && ob.ob_xnext === null) return;
    insertx(ob, deletex(ob));
  }
  function copyobj(to, from) {
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
    const fresh = createObject();
    for (const k in fresh) ob[k] = fresh[k];
  }
  function allocobj() {
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
  function deallobj(ob) {
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
  function movexy(ob) {
    const game = state.currgame;
    const maxX = game ? game.gm_max_x - 10 : 32767;
    const fracX = ob.ob_lx + ob.ob_ldx;
    const xCarry = fracX >>> 16;
    let x = ob.ob_x + ob.ob_dx + xCarry;
    let lx = fracX & 65535;
    if (x < 0) {
      x = 0;
      lx = 0;
    } else if (x > maxX) {
      x = maxX;
      lx = 0;
    }
    ob.ob_x = x;
    ob.ob_lx = lx;
    const fracY = ob.ob_ly + ob.ob_ldy;
    const yCarry = fracY >>> 16;
    ob.ob_y = ob.ob_y + ob.ob_dy + yCarry;
    ob.ob_ly = fracY & 65535;
    updateobjpos(ob);
    return [ob.ob_x, ob.ob_y];
  }
  function setdxdy(obj, dx, dy) {
    obj.ob_dx = dx >> 8;
    obj.ob_ldx = dx << 8 & 65535;
    obj.ob_dy = dy >> 8;
    obj.ob_ldy = dy << 8 & 65535;
  }
  function PlaneIsKilled(stateVal) {
    return stateVal !== OBSTATE.FLYING && stateVal !== OBSTATE.STALLED && stateVal !== OBSTATE.WOUNDED && stateVal !== OBSTATE.WOUNDSTALL;
  }
  function PlaneIsStalled(stateVal) {
    return stateVal === OBSTATE.STALLED || stateVal === OBSTATE.WOUNDSTALL;
  }
  function PlaneIsWounded(stateVal) {
    return stateVal === OBSTATE.WOUNDED || stateVal === OBSTATE.WOUNDSTALL;
  }
  function PlaneIsFlying(stateVal) {
    return stateVal === OBSTATE.FLYING || stateVal === OBSTATE.WOUNDED;
  }

  // src/sim/sound.js
  var SOUND = Object.freeze({
    S_NONE: 0,
    S_PLANE: 1,
    S_SHOT: 2,
    S_BOMB: 3,
    S_HIT: 4,
    S_FALLING: 5,
    S_EXPLOSION: 6
  });
  function sound(_id, _x, _ob) {
  }
  function initsound(_ob, _id) {
  }
  function stopsound(_ob) {
  }
  function swsound() {
  }

  // src/sim/util.js
  function in_range(min, val, max) {
    return val >= min && val <= max;
  }
  function clamp_min(val, min) {
    return val < min ? min : val;
  }
  function clamp_max(val, max) {
    return val > max ? max : val;
  }
  function clamp_range(min, val, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }
  function imin(a, b) {
    return a < b ? a : b;
  }
  function imax(a, b) {
    return a > b ? a : b;
  }

  // src/sim/move.js
  var SUCCESSFUL_FLIGHT_TIME = 8 * FPS;
  var moverefs = {
    gohome: null,
    swauto: null,
    initshot: null,
    initbomb: null,
    initmiss: null,
    initburst: null,
    initsmok: null,
    initplyr: null,
    initcomp: null,
    initdisp: null,
    scorepln: null,
    loser: null,
    winner: null,
    swrestart: null,
    swend: null,
    ctlbreak: () => false,
    hitpln: null
  };
  function symangle(ob) {
    const dx = ob.ob_dx;
    const dy = ob.ob_dy;
    if (dx === 0) {
      if (dy < 0) return 6;
      if (dy > 0) return 2;
      return 6;
    }
    if (dx > 0) {
      if (dy < 0) return 7;
      if (dy > 0) return 1;
      return 0;
    }
    if (dy < 0) return 5;
    if (dy > 0) return 3;
    return 4;
  }
  function topup(ob, field, max) {
    if (ob[field] === max) return;
    if (max < 20) {
      if (state.countmove % 20 === 0) ob[field]++;
    } else {
      ob[field] += Math.floor(max / 100);
    }
    ob[field] = clamp_max(ob[field], max);
  }
  function refuel(ob) {
    topup(ob, "ob_life", MAXFUEL);
    topup(ob, "ob_rounds", MAXROUNDS);
    topup(ob, "ob_bombs", MAXBOMBS);
    topup(ob, "ob_missiles", MAXMISSILES);
    topup(ob, "ob_bursts", MAXBURSTS);
  }
  function PlaneSoundCallback(ob) {
    if (ob.ob_firing) {
      sound(SOUND.S_SHOT, 0, ob);
      return;
    }
    switch (ob.ob_state) {
      case OBSTATE.FALLING:
        if (ob.ob_dy >= 0) sound(SOUND.S_HIT, 0, ob);
        else sound(SOUND.S_FALLING, ob.ob_y, ob);
        break;
      case OBSTATE.FLYING:
        sound(SOUND.S_PLANE, -ob.ob_speed, ob);
        break;
      case OBSTATE.STALLED:
      case OBSTATE.WOUNDED:
      case OBSTATE.WOUNDSTALL:
        sound(SOUND.S_HIT, 0, ob);
        break;
    }
  }
  function nearpln(ob) {
    const obx = ob.ob_x;
    for (let obt = state.objtop; obt !== null; obt = obt.ob_next) {
      if (obt.ob_type !== OBTYPE.PLANE || obt.ob_faction === ob.ob_faction) {
        continue;
      }
      if (obt.ob_movef === movecomp) {
        if (state.playmode !== PLAYMODE.COMPUTER || in_range(
          obt.ob_original_ob.territory_l,
          obx,
          obt.ob_original_ob.territory_r
        )) {
          const obc = obt.ob_target;
          if (!obc || Math.abs(obx - obt.ob_x) < Math.abs(obc.ob_x - obt.ob_x)) {
            obt.ob_target = ob;
          }
        }
      }
    }
  }
  function interpret(ob, key) {
    ob.ob_flaps = 0;
    ob.ob_bombing = false;
    ob.ob_bfiring = false;
    ob.ob_mfiring = null;
    ob.ob_firing = null;
    let st = ob.ob_state;
    const FINISHED = OBSTATE.FINISHED;
    if (PlaneIsKilled(st) && st !== OBSTATE.FALLING) return;
    if (st !== OBSTATE.FALLING) {
      if (state.endstat) {
        if (state.endstat === OBENDSTATUS.LOSER && state.plyrplane && moverefs.gohome) {
          moverefs.gohome(ob);
        }
        return;
      }
      if (key & K_BREAK) {
        ob.ob_life = -5e3;
        ob.ob_home = false;
        if (ob.ob_athome) {
          ob.ob_state = st = OBSTATE.CRASHED;
          ob.ob_hitcount = 0;
        }
        if (state.plyrplane) state.quit = true;
      }
      if (key & K_HOME) {
        if (st === OBSTATE.FLYING || st === OBSTATE.WOUNDED) {
          ob.ob_home = true;
        }
      }
    }
    if (!PlaneIsWounded(st) || (state.countmove & 1) !== 0) {
      if (key & K_FLAPU) {
        ob.ob_flaps++;
        ob.ob_home = false;
      }
      if (key & K_FLAPD) {
        ob.ob_flaps--;
        ob.ob_home = false;
      }
      if (key & K_FLIP && !ob.ob_athome) {
        ob.ob_orient = ob.ob_orient ? 0 : 1;
        ob.ob_home = false;
      }
      if (key & K_DEACC) {
        if (ob.ob_accel) ob.ob_accel--;
        ob.ob_home = false;
      }
      if (key & K_ACCEL) {
        if (ob.ob_accel < MAX_THROTTLE) ob.ob_accel++;
        ob.ob_home = false;
      }
    }
    if (key & K_SHOT && st < FINISHED) ob.ob_firing = ob;
    if (key & K_MISSILE && st < FINISHED) ob.ob_mfiring = ob;
    if (key & K_BOMB && st < FINISHED) ob.ob_bombing = true;
    if (key & K_STARBURST && st < FINISHED) ob.ob_bfiring = true;
    if (key & K_SOUND) {
      if (state.plyrplane) {
        if (state.soundflg) {
          sound(0, 0, null);
          swsound();
        }
        state.soundflg = !state.soundflg;
      }
    }
    if (ob.ob_home && moverefs.gohome) moverefs.gohome(ob);
  }
  var gravity = [0, -1, -2, -3, -4, -3, -2, -1, 0, 1, 2, 3, 4, 3, 2, 1];
  function stallpln(ob) {
    ob.ob_ldx = 0;
    ob.ob_ldy = 0;
    ob.ob_orient = 0;
    ob.ob_dx = 0;
    ob.ob_angle = 7 * ANGLES / 8;
    ob.ob_speed = 0;
    ob.ob_dy = 0;
    ob.ob_hitcount = STALLCOUNT;
    ob.ob_state = ob.ob_state === OBSTATE.WOUNDED ? OBSTATE.WOUNDSTALL : OBSTATE.STALLED;
    ob.ob_athome = false;
    return true;
  }
  function selectPlaneSymbol(ob) {
    const sPlane = symbols.symbol_plane;
    const sHit = symbols.symbol_plane_hit;
    const sWin = symbols.symbol_plane_win;
    if (ob.ob_endsts === OBENDSTATUS.WINNER && ob.ob_goingsun) {
      const idx = clamp_max(Math.floor(state.endcount / 18), sWin.length - 1);
      ob.ob_symbol = sWin[idx].sym[0];
    } else if (ob.ob_state === OBSTATE.FINISHED) {
      ob.ob_symbol = null;
    } else if (ob.ob_state === OBSTATE.FALLING && !ob.ob_dx && ob.ob_dy < 0) {
      ob.ob_symbol = sHit[ob.ob_orient % 4].sym[0];
    } else if (ob.ob_orient) {
      const a = (16 - ob.ob_angle) % 16;
      ob.ob_symbol = sPlane[a % 4].sym[4 + Math.floor(a / 4)];
    } else {
      ob.ob_symbol = sPlane[ob.ob_angle % 4].sym[Math.floor(ob.ob_angle / 4)];
    }
  }
  function movepln(ob) {
    let nangle, nspeed, limit, update;
    let stalled = false;
    let stVal = ob.ob_state;
    ob.ob_soundf = PlaneSoundCallback;
    switch (stVal) {
      case OBSTATE.FINISHED:
      case OBSTATE.WAITING:
        return false;
      case OBSTATE.CRASHED:
        ob.ob_hitcount--;
        break;
      case OBSTATE.FALLING:
        ob.ob_hitcount -= 2;
        if (ob.ob_dy < 0 && ob.ob_dx) {
          if ((ob.ob_orient ? 1 : 0) ^ (ob.ob_dx < 0 ? 1 : 0)) {
            ob.ob_hitcount -= ob.ob_flaps;
          } else {
            ob.ob_hitcount += ob.ob_flaps;
          }
        }
        if (ob.ob_hitcount <= 0) {
          if (ob.ob_dy < 0) {
            if (ob.ob_dx < 0) ob.ob_dx++;
            else if (ob.ob_dx > 0) ob.ob_dx--;
            else ob.ob_orient++;
          }
          if (ob.ob_dy > -10) ob.ob_dy--;
          ob.ob_hitcount = FALLCOUNT;
        }
        ob.ob_angle = symangle(ob) * 2;
        if (ob.ob_dy <= 0) initsound(ob, SOUND.S_FALLING);
        break;
      case OBSTATE.STALLED:
      case OBSTATE.WOUNDSTALL:
      case OBSTATE.FLYING:
      case OBSTATE.WOUNDED: {
        let newState;
        if (stVal === OBSTATE.STALLED) newState = OBSTATE.FLYING;
        else if (stVal === OBSTATE.WOUNDSTALL) newState = OBSTATE.WOUNDED;
        if (stVal === OBSTATE.STALLED || stVal === OBSTATE.WOUNDSTALL) {
          stalled = ob.ob_angle !== 3 * ANGLES / 4 || ob.ob_speed < state.gminspeed;
          if (!stalled) {
            ob.ob_state = stVal = newState;
          }
        } else {
          stalled = ob.ob_y >= MAX_Y;
          if (stalled) {
            if (state.playmode === PLAYMODE.NOVICE) {
              ob.ob_angle = 3 * ANGLES / 4;
              stalled = false;
            } else {
              stallpln(ob);
              stVal = ob.ob_state;
            }
          }
        }
        if (ob.ob_goingsun) break;
        if (ob.ob_life <= 0 && !ob.ob_athome && !PlaneIsKilled(stVal)) {
          if (moverefs.hitpln) moverefs.hitpln(ob);
          if (moverefs.scorepln) moverefs.scorepln(ob, OBTYPE.GROUND);
          return movepln(ob);
        }
        if (ob.ob_firing && moverefs.initshot) moverefs.initshot(ob, null);
        if (ob.ob_bombing && moverefs.initbomb) moverefs.initbomb(ob);
        if (ob.ob_mfiring && moverefs.initmiss) moverefs.initmiss(ob);
        if (ob.ob_bfiring && moverefs.initburst) moverefs.initburst(ob);
        nangle = ob.ob_angle;
        nspeed = ob.ob_speed;
        update = ob.ob_flaps;
        if (update) {
          if (ob.ob_orient) nangle -= update;
          else nangle += update;
          nangle = (nangle % ANGLES + ANGLES) % ANGLES;
        }
        if (!(state.countmove & 3)) {
          if (!stalled && nspeed < state.gminspeed && state.playmode !== PLAYMODE.NOVICE) {
            nspeed--;
            update = true;
          } else {
            limit = state.gminspeed + ob.ob_accel + gravity[nangle];
            if (nspeed < limit) {
              nspeed++;
              update = true;
            } else if (nspeed > limit) {
              nspeed--;
              update = true;
            }
          }
        }
        if (update) {
          if (ob.ob_athome) {
            if (ob.ob_accel || ob.ob_flaps) nspeed = state.gminspeed;
            else nspeed = 0;
          } else if (nspeed <= 0 && !stalled) {
            if (state.playmode === PLAYMODE.NOVICE) {
              nspeed = 1;
            } else {
              stallpln(ob);
              return movepln(ob);
            }
          }
          ob.ob_speed = nspeed;
          ob.ob_angle = nangle;
          if (stalled) {
            ob.ob_dx = 0;
            ob.ob_ldx = 0;
            ob.ob_ldy = 0;
            ob.ob_dy = -nspeed;
          } else {
            setdxdy(ob, nspeed * COS(nangle), nspeed * SIN(nangle));
          }
        }
        if (stalled) {
          ob.ob_hitcount--;
          if (ob.ob_hitcount <= 0) {
            ob.ob_orient = ob.ob_orient ? 0 : 1;
            ob.ob_angle = (3 * ANGLES / 2 - ob.ob_angle) % ANGLES;
            ob.ob_hitcount = STALLCOUNT;
          }
        }
        if (!state.compplane) {
          ob.ob_life -= ob.ob_speed;
        } else if (ob.ob_life > 100) {
          ob.ob_life -= ob.ob_speed;
        }
        if (ob.ob_speed) ob.ob_athome = false;
        break;
      }
    }
    selectPlaneSymbol(ob);
    const [x, y] = movexy(ob);
    if (!in_range(0, x, state.currgame.gm_max_x - 16)) {
      ob.ob_x = clamp_range2(0, x, state.currgame.gm_max_x - 16);
      updateobjpos(ob);
    }
    if (!state.compplane && state.consoleplayer.ob_endsts === OBENDSTATUS.PLAYING && !PlaneIsKilled(ob.ob_state)) {
      nearpln(ob);
    }
    if (ob.ob_bdelay) ob.ob_bdelay--;
    if (ob.ob_mdelay) ob.ob_mdelay--;
    if (ob.ob_bsdelay) ob.ob_bsdelay--;
    if (!state.compplane && ob.ob_athome && ob.ob_state === OBSTATE.FLYING) {
      refuel(ob);
    }
    if (in_range(0, y, MAX_Y - 1)) {
      if (ob.ob_state === OBSTATE.FALLING || PlaneIsWounded(ob.ob_state)) {
        if (moverefs.initsmok) moverefs.initsmok(ob);
      }
      return state.plyrplane || ob.ob_state < OBSTATE.FINISHED;
    }
    return false;
  }
  function clamp_range2(min, val, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }
  function moveplyr(ob) {
    state.compplane = false;
    state.plyrplane = state.player === ob.ob_plrnum;
    state.endstat = state.consoleplayer.ob_endsts;
    if (state.endstat) {
      state.endcount--;
      if (state.endcount <= 0) {
        if (state.playmode !== PLAYMODE.ASYNCH && !state.quit && moverefs.swrestart) {
          moverefs.swrestart();
          return true;
        }
        if (moverefs.swend) moverefs.swend(null, true);
      }
    }
    let multkey = state.latest_player_commands[ob.ob_plrnum][state.countmove % MAX_NET_LAG];
    if ((multkey & K_HARRYKEYS) !== 0 && ob.ob_orient) {
      if (multkey & (K_FLAPU | K_FLAPD)) {
        multkey ^= K_FLAPU | K_FLAPD;
      }
    }
    interpret(ob, multkey);
    if (ob.ob_state === OBSTATE.CRASHED && ob.ob_hitcount <= 0) {
      if (state.playmode !== PLAYMODE.ASYNCH) ob.ob_crashcnt++;
      if (state.endstat !== OBENDSTATUS.WINNER && (ob.ob_life <= -5e3 || state.playmode !== PLAYMODE.ASYNCH && ob.ob_crashcnt >= MAXCRASH)) {
        if (!state.endstat && moverefs.loser) moverefs.loser(ob);
      } else {
        if (moverefs.initplyr) moverefs.initplyr(ob, ob.ob_original_ob);
        if (moverefs.initdisp) moverefs.initdisp(true);
        if (state.endstat === OBENDSTATUS.WINNER) {
          if (moverefs.ctlbreak() && moverefs.swend) moverefs.swend(null, true);
          if (moverefs.winner) moverefs.winner(ob);
        }
      }
    }
    return movepln(ob);
  }
  function movecomp(ob) {
    state.compplane = true;
    state.plyrplane = false;
    ob.ob_flaps = 0;
    ob.ob_bfiring = false;
    ob.ob_bombing = false;
    ob.ob_mfiring = null;
    state.endstat = ob.ob_endsts;
    if (!state.dispcnt) ob.ob_firing = null;
    switch (ob.ob_state) {
      case OBSTATE.WOUNDED:
      case OBSTATE.WOUNDSTALL:
        if (state.countmove & 1) break;
      // fallthrough
      case OBSTATE.FLYING:
      case OBSTATE.STALLED:
        if (state.endstat && moverefs.gohome) {
          moverefs.gohome(ob);
          break;
        }
        if (!state.dispcnt && moverefs.swauto) moverefs.swauto(ob);
        break;
      case OBSTATE.CRASHED:
        ob.ob_firing = null;
        if (ob.ob_hitcount <= 0 && !state.endstat && moverefs.initcomp) {
          moverefs.initcomp(ob, ob.ob_original_ob);
        }
        break;
      default:
        ob.ob_firing = null;
        break;
    }
    return movepln(ob);
  }
  function adjustfall(ob) {
    ob.ob_life--;
    if (ob.ob_life <= 0) {
      if (ob.ob_dy < 0) {
        if (ob.ob_dx < 0) ob.ob_dx++;
        else if (ob.ob_dx > 0) ob.ob_dx--;
      }
      if (ob.ob_dy > -10) ob.ob_dy--;
      ob.ob_life = BOMBLIFE;
    }
  }
  function moveshot(ob) {
    ob.ob_life--;
    if (ob.ob_life <= 0) {
      deallobj(ob);
      return false;
    }
    const [x, y] = movexy(ob);
    if (!in_range(0, x, state.currgame.gm_max_x - 1) || !in_range(state.ground[x] + 1, y, MAX_Y - 1)) {
      deallobj(ob);
      return false;
    }
    ob.ob_symbol = symbols.symbol_pixel;
    return true;
  }
  function BombSoundCallback(ob) {
    if (ob.ob_dy <= 0) sound(SOUND.S_BOMB, -ob.ob_y, ob);
  }
  function movebomb(ob) {
    ob.ob_soundf = BombSoundCallback;
    if (ob.ob_life < 0) {
      deallobj(ob);
      ob.ob_state = OBSTATE.FINISHED;
      return false;
    }
    adjustfall(ob);
    if (ob.ob_dy <= 0) initsound(ob, SOUND.S_BOMB);
    const [x, y] = movexy(ob);
    if (y < 0 || !in_range(0, x, state.currgame.gm_max_x - 1)) {
      deallobj(ob);
      stopsound(ob);
      ob.ob_state = OBSTATE.FINISHED;
      return false;
    }
    const ang = symangle(ob);
    ob.ob_symbol = symbols.symbol_bomb[ang % 2].sym[Math.floor(ang / 2)];
    if (y >= MAX_Y) return false;
    return true;
  }
  function movemiss(ob) {
    if (ob.ob_life < 0) {
      deallobj(ob);
      ob.ob_state = OBSTATE.FINISHED;
      return false;
    }
    let x, y, angle;
    if (ob.ob_state === OBSTATE.FLYING) {
      let obt = ob.ob_missiletarget;
      if (obt && obt !== ob.ob_owner && ob.ob_life & 1) {
        if (obt.ob_missiletarget) obt = obt.ob_missiletarget;
        if (moverefs.aim) moverefs.aim(ob, obt.ob_x, obt.ob_y, null, false);
        angle = ob.ob_angle = ((ob.ob_angle + ob.ob_flaps) % ANGLES + ANGLES) % ANGLES;
        setdxdy(ob, ob.ob_speed * COS(angle), ob.ob_speed * SIN(angle));
      }
      [x, y] = movexy(ob);
      ob.ob_life--;
      if (ob.ob_life <= 0 || y >= MAX_Y * 3 / 2) {
        ob.ob_state = OBSTATE.FALLING;
        ob.ob_life++;
      }
    } else {
      adjustfall(ob);
      ob.ob_angle = (ob.ob_angle + 1) % ANGLES;
      [x, y] = movexy(ob);
    }
    if (y < 0 || !in_range(0, x, state.currgame.gm_max_x - 1)) {
      deallobj(ob);
      ob.ob_state = OBSTATE.FINISHED;
      return false;
    }
    ob.ob_symbol = symbols.symbol_missile[ob.ob_angle % 4].sym[Math.floor(ob.ob_angle / 4)];
    if (y >= MAX_Y) return false;
    return true;
  }
  function moveburst(ob) {
    if (ob.ob_life < 0) {
      ob.ob_owner.ob_missiletarget = null;
      deallobj(ob);
      return false;
    }
    adjustfall(ob);
    const [x, y] = movexy(ob);
    if (!in_range(0, x, state.currgame.gm_max_x - 1) || y <= state.ground[x]) {
      ob.ob_owner.ob_missiletarget = null;
      deallobj(ob);
      return false;
    }
    ob.ob_owner.ob_missiletarget = ob;
    ob.ob_symbol = symbols.symbol_burst[ob.ob_life & 1].sym[0];
    return y < MAX_Y;
  }
  function TargetSoundCallback(ob) {
    if (ob.ob_firing) sound(SOUND.S_SHOT, 0, ob);
  }
  var target_aggression = [
    2,
    2,
    2,
    2,
    5,
    5,
    0,
    0,
    2,
    2,
    2,
    5,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  function FindEnemyPlane(ob) {
    for (let obp = state.objtop; obp !== null; obp = obp.ob_next) {
      if (obp.ob_type !== OBTYPE.PLANE || obp.ob_faction === ob.ob_faction) continue;
      if (state.playmode !== PLAYMODE.ASYNCH && obp.ob_faction !== 1) continue;
      if (PlaneIsKilled(obp.ob_state)) continue;
      const r = moverefs.range(ob.ob_x, ob.ob_y, obp.ob_x, obp.ob_y);
      if (in_range(1, r, state.targrnge - 1)) return obp;
    }
    return null;
  }
  function movetarg(ob) {
    const oldsym = ob.ob_symbol;
    const transform = ob.ob_original_ob.transform;
    ob.ob_soundf = TargetSoundCallback;
    ob.ob_firing = null;
    const aggression = target_aggression[ob.ob_orient] || 0;
    if (ob.ob_state === OBSTATE.STANDING && state.gamenum > 0 && aggression > 0 && (state.gamenum > 1 || state.countmove % aggression === aggression - 1)) {
      const plane = FindEnemyPlane(ob);
      if (plane && moverefs.initshot) {
        moverefs.initshot(ob, plane);
        ob.ob_firing = plane;
      }
    }
    ob.ob_hitcount = clamp_min(ob.ob_hitcount - 1, 0);
    const live = symbols.symbol_targets[ob.ob_orient].sym[transform];
    const dead = symbols.symbol_target_hit[ob.ob_orient].sym[transform];
    ob.ob_symbol = ob.ob_state === OBSTATE.STANDING ? live : dead;
    ob.ob_x += Math.floor((oldsym.w - ob.ob_symbol.w) / 2);
    ob.ob_y -= oldsym.h - ob.ob_symbol.h;
    return true;
  }
  function movepowerup(ob) {
    const transform = ob.ob_original_ob.transform;
    if (ob.ob_state === OBSTATE.STANDING) {
      ob.ob_symbol = symbols.symbol_powerups[ob.ob_orient].sym[transform];
    } else {
      ob.ob_symbol = symbols.symbol_powerup_collected[ob.ob_orient].sym[transform];
    }
    return true;
  }
  function movesmok(ob) {
    const planestate = ob.ob_owner.ob_state;
    ob.ob_life--;
    if (ob.ob_life <= 0 || planestate !== OBSTATE.FALLING && planestate !== OBSTATE.CRASHED && !PlaneIsWounded(planestate)) {
      deallobj(ob);
      return false;
    }
    ob.ob_symbol = symbols.symbol_pixel;
    return true;
  }
  function moveflck(ob) {
    if (ob.ob_life === -1) {
      deallobj(ob);
      return false;
    }
    ob.ob_life--;
    if (ob.ob_life <= 0) {
      ob.ob_orient = ob.ob_orient ? 0 : 1;
      ob.ob_life = FLOCKLIFE;
    }
    if (ob.ob_x < ob.ob_original_ob.territory_l) ob.ob_dx = Math.abs(ob.ob_dx);
    else if (ob.ob_x > ob.ob_original_ob.territory_r) ob.ob_dx = -Math.abs(ob.ob_dx);
    movexy(ob);
    ob.ob_symbol = symbols.symbol_flock[ob.ob_orient].sym[0];
    return true;
  }
  function moveballoon(ob) {
    const orig = ob.ob_original_ob;
    if (ob.ob_life === -1) {
      deallobj(ob);
      return false;
    }
    if (ob.ob_state === OBSTATE.FLYING && state.gamenum > 0 && state.countmove % 7 === 0) {
      const plane = FindEnemyPlane(ob);
      if (plane && plane.ob_y < ob.ob_y && moverefs.initshot) {
        moverefs.initshot(ob, plane);
        ob.ob_firing = plane;
      }
    }
    const step = state.countmove + orig.x;
    const dx = SIN(Math.floor(step / 7)) * 128;
    const dy = SIN(Math.floor(step / 3)) * 128;
    ob.ob_dx = dx >> 16;
    ob.ob_ldx = dx & 65535;
    ob.ob_dy = dy >> 16;
    ob.ob_ldy = dy & 65535;
    movexy(ob);
    const f = orig.orient * 3 + (dx >= 2e4 ? 2 : dx <= -2e4 ? 0 : 1);
    ob.ob_symbol = symbols.symbol_balloon[f].sym[orig.transform];
    return true;
  }
  function checkwall(ob, direction) {
    let x = ob.ob_x;
    for (let cnt = 0; cnt < 20; cnt++) {
      if (!in_range(0, x, state.currgame.gm_max_x - 1)) return true;
      if (state.ground[x] > ob.ob_y + 10) return true;
      if (direction < 0) x--;
      else x++;
    }
    return false;
  }
  function movebird(ob) {
    if (ob.ob_life === -1) {
      deallobj(ob);
      return false;
    }
    if (ob.ob_life === -2) {
      ob.ob_dy = -ob.ob_dy;
      ob.ob_dx = (state.countmove & 7) - 4;
      if (checkwall(ob, ob.ob_dx)) ob.ob_dx = -ob.ob_dx;
      ob.ob_life = BIRDLIFE;
    } else {
      ob.ob_life--;
      if (ob.ob_life <= 0) {
        ob.ob_orient = ob.ob_orient ? 0 : 1;
        ob.ob_life = BIRDLIFE;
      }
    }
    const [x, y] = movexy(ob);
    ob.ob_symbol = symbols.symbol_bird[ob.ob_orient].sym[0];
    if (!in_range(0, x, state.currgame.gm_max_x - 1) || !in_range(state.ground[x] + 1, y, MAX_Y - 1)) {
      ob.ob_y -= ob.ob_dy;
      ob.ob_life = -2;
      return false;
    }
    return true;
  }
  function moveox(ob) {
    const transform = ob.ob_original_ob.transform;
    ob.ob_symbol = symbols.symbol_ox[ob.ob_state !== OBSTATE.STANDING ? 1 : 0].sym[transform];
    return true;
  }
  function swmove() {
    if (state.deltop) {
      state.delbot.ob_next = state.objfree;
      state.objfree = state.deltop;
      state.deltop = state.delbot = null;
    }
    state.dispcnt++;
    if (state.dispcnt >= state.keydelay) state.dispcnt = 0;
    let ob = state.objtop;
    while (ob) {
      const obn = ob.ob_next;
      ob.ob_drwflg = ob.ob_movef ? ob.ob_movef(ob) : false;
      ob = obn;
    }
    state.countmove++;
    if (state.consoleplayer && state.consoleplayer.ob_athome) {
      state.last_ground_time = state.countmove;
    } else if (state.countmove - state.last_ground_time > SUCCESSFUL_FLIGHT_TIME) {
      state.successful_flight = true;
    }
  }

  // src/sim/collision.js
  function CollisionTest(_a, _b) {
    return false;
  }

  // src/sim/auto.js
  var courseadj = 0;
  function range(x, y, ax, ay) {
    let dx = Math.abs(x - ax);
    let dy = Math.abs(y - ay);
    dy += dy >> 1;
    if (dx < 125 && dy < 125) return dx * dx + dy * dy;
    if (dx < dy) {
      const t = dx;
      dx = dy;
      dy = t;
    }
    return -(7 * dx + (dy << 2) >> 3);
  }
  function shoot(obt, obs) {
    const obsp = createObject();
    const obtsp = createObject();
    copyobj(obsp, obs);
    copyobj(obtsp, obt);
    let nspeed = obsp.ob_speed + BULSPEED;
    setdxdy(obsp, nspeed * COS(obsp.ob_angle), nspeed * SIN(obsp.ob_angle));
    obsp.ob_x += SYM_WDTH / 2;
    obsp.ob_y -= SYM_HGHT / 2;
    let nangle = obtsp.ob_angle;
    nspeed = obtsp.ob_speed;
    let rprev = NEAR;
    for (let i = 0; i < BULLIFE; i++) {
      const [obx, oby] = movexy(obsp);
      if (obtsp.ob_state === OBSTATE.FLYING || obtsp.ob_state === OBSTATE.WOUNDED) {
        const r2 = obtsp.ob_flaps;
        if (r2) {
          if (obtsp.ob_orient) nangle -= r2;
          else nangle += r2;
          nangle = (nangle % ANGLES + ANGLES) % ANGLES;
          setdxdy(obtsp, nspeed * COS(nangle), nspeed * SIN(nangle));
        }
      }
      const [obtx, obty] = movexy(obtsp);
      const r = range(obx, oby, obtx, obty);
      if (!in_range(0, r, rprev)) return 0;
      if (in_range(obtx, obx, obtx + SYM_WDTH - 1) && in_range(obty - SYM_HGHT + 1, oby, obty)) {
        return 1 + (i > BULLIFE / 3 ? 1 : 0);
      }
      rprev = r;
    }
    return 0;
  }
  function WithinHomeRange(ob, x, y) {
    const orig = ob.ob_original_ob;
    return Math.abs(x - orig.x) < HOME && Math.abs(y - ob.ob_orig_y) < HOME;
  }
  function IsTarget(ob) {
    return ob.ob_type === OBTYPE.TARGET || ob.ob_type === OBTYPE.OX;
  }
  function tstcrash2(ob, x, y, alt, dy) {
    if (alt > 50) return false;
    let lookahead = 3;
    if (ob.ob_home && WithinHomeRange(ob, x, y)) lookahead = 1;
    if (alt + Math.floor(dy * lookahead / 256) < 8) return true;
    const xl = clamp_min(x - 32, ob.ob_x - 32 - state.gmaxspeed);
    const xr = clamp_max(x + 32, ob.ob_x + 32 + state.gmaxspeed);
    let obt = ob;
    while (obt.ob_xprev !== null && obt.ob_xprev.ob_x >= xl) obt = obt.ob_xprev;
    for (; obt.ob_xnext !== null; obt = obt.ob_xnext) {
      if (!IsTarget(obt) || obt.ob_x < xl) continue;
      if (obt.ob_x > xr) return false;
      const yt = obt.ob_y + (obt.ob_state === OBSTATE.STANDING ? 16 : 8);
      if (y <= yt) return true;
    }
    return false;
  }
  function IsWingman(plane, plane2) {
    const midpoint = plane2.ob_original_ob.territory_l + plane2.ob_original_ob.territory_r >> 1;
    return plane !== plane2 && plane.ob_faction === plane2.ob_faction && in_range(plane.ob_original_ob.territory_l, midpoint, plane.ob_original_ob.territory_r);
  }
  function FindWingmen(plane) {
    const result = { ahead: null, behind: null };
    if (plane.ob_target === null) return result;
    const direction = plane.ob_target.ob_x > plane.ob_x ? 1 : -1;
    const isAheadOf = (a, b) => a.ob_x * direction >= b.ob_x * direction;
    for (let i = 0; i < state.num_planes; i++) {
      const wingman = state.planes[i];
      if (!wingman || !IsWingman(plane, wingman) || !PlaneIsFlying(wingman.ob_state)) continue;
      if (isAheadOf(wingman, plane) && (result.ahead === null || isAheadOf(result.ahead, wingman))) {
        result.ahead = wingman;
      }
      if (!isAheadOf(wingman, plane) && (result.behind === null || isAheadOf(wingman, result.behind))) {
        result.behind = wingman;
      }
    }
    return result;
  }
  function aim(ob, ax, ay, obt, longway) {
    if (PlaneIsStalled(ob.ob_state) && ob.ob_angle !== 3 * ANGLES / 4) {
      ob.ob_flaps = -1;
      ob.ob_accel = MAX_THROTTLE;
      return 0;
    }
    let x = ob.ob_x;
    let y = ob.ob_y;
    const dx = x - ax;
    const { ahead, behind } = FindWingmen(ob);
    if (ob.ob_athome && ahead !== null && Math.abs(ob.ob_x - ahead.ob_x) < 64) {
      return 0;
    }
    if (Math.abs(dx) <= 160) {
      if (!longway) ob.ob_hitcount = 0;
    } else if (ahead !== null && Math.abs(ob.ob_x - ahead.ob_x) < 80) {
      return aim(ob, ahead.ob_x + 20, ahead.ob_y - 20, null, false);
    } else {
      if (ob.ob_dx && dx < 0 === ob.ob_dx < 0) {
        if (!ob.ob_hitcount) ob.ob_hitcount = y > MAX_Y - 50 ? 2 : 1;
        return aim(ob, x, ob.ob_hitcount === 1 ? y + 25 : y - 25, null, true);
      }
      ob.ob_hitcount = 0;
      let height = clamp_max(y + 100, MAX_Y - 50 - courseadj);
      if (behind !== null) height = clamp_max(height + 32, MAX_Y - 32);
      return aim(ob, x + (dx < 0 ? 150 : -150), height, null, true);
    }
    if (ob.ob_speed) {
      const dy = y - ay;
      if (dy !== 0 && Math.abs(dy) < 6) {
        if (dy < 0) y++;
        else y--;
        ob.ob_y = y;
      } else if (dx !== 0 && Math.abs(dx) < 6) {
        if (dx < 0) x++;
        else x--;
        ob.ob_x = x;
        updateobjpos(ob);
      }
    }
    const obs = createObject();
    copyobj(obs, ob);
    let nspeed = obs.ob_speed + 1;
    if (nspeed > state.gmaxspeed && obs.ob_type === OBTYPE.PLANE) nspeed = state.gmaxspeed;
    else if (nspeed < state.gminspeed) nspeed = state.gminspeed;
    const cflaps = [0, -1, 1];
    const crange = [0, 0, 0];
    const ccrash = [0, 0, 0];
    const calt = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      const nangle = ((obs.ob_angle + (obs.ob_orient ? -cflaps[i] : cflaps[i])) % ANGLES + ANGLES) % ANGLES;
      setdxdy(obs, nspeed * COS(nangle), nspeed * SIN(nangle));
      const [nx, ny] = movexy(obs);
      crange[i] = range(nx, ny, ax, ay);
      const groundIdx = clamp_max(nx + 8, state.currgame.gm_max_x - 1);
      calt[i] = ny - state.currgame.gm_ground[groundIdx];
      ccrash[i] = tstcrash2(ob, nx, ny, calt[i], nspeed * SIN(nangle));
      copyobj(obs, ob);
    }
    if (obt) {
      const i = shoot(obt, obs);
      if (i) {
        if (ob.ob_missiles && state.conf_missiles && i === 2) {
          ob.ob_mfiring = obt.ob_athome ? ob : obt;
        } else {
          ob.ob_firing = obt;
        }
      }
    }
    let rmin = 32767;
    let n = 0;
    for (let i = 0; i < 3; i++) {
      const r = crange[i];
      if (in_range(0, r, rmin - 1) && !ccrash[i]) {
        rmin = r;
        n = i;
      }
    }
    if (rmin === 32767) {
      rmin = -32767;
      for (let i = 0; i < 3; i++) {
        const r = crange[i];
        if (r < 0 && r > rmin && !ccrash[i]) {
          rmin = r;
          n = i;
        }
      }
    }
    if (ob.ob_speed < state.gminspeed) ob.ob_accel = MAX_THROTTLE;
    if (rmin === -32767) {
      if (ob.ob_accel) ob.ob_accel--;
      n = 0;
      let dy = calt[0];
      if (calt[1] > calt[0]) {
        dy = calt[1];
        n = 1;
      }
      if (calt[2] > dy) n = 2;
    } else {
      if (ob.ob_accel < MAX_THROTTLE) ob.ob_accel++;
    }
    if (ahead !== null && Math.abs(ahead.ob_x - ob.ob_x) < 24) {
      ob.ob_accel = clamp_min(1, ahead.ob_accel - 2);
    } else if (behind !== null && Math.abs(behind.ob_x - ob.ob_x) > 32 && ob.ob_dy === 0) {
      ob.ob_accel = clamp_min(1, behind.ob_accel - 2);
    }
    ob.ob_flaps = cflaps[n];
    if (ob.ob_type === OBTYPE.PLANE && !ob.ob_flaps) {
      if (ob.ob_speed) ob.ob_orient = ob.ob_dx < 0 ? 1 : 0;
    }
    return 0;
  }
  function gohome(ob) {
    if (ob.ob_athome) return 0;
    courseadj = ((state.countmove & 31) < 16 ? 1 : 0) << 4;
    if (WithinHomeRange(ob, ob.ob_x, ob.ob_y)) {
      if (state.plyrplane && moverefs.initplyr) {
        moverefs.initplyr(ob, ob.ob_original_ob);
        if (moverefs.initdisp) moverefs.initdisp(true);
      } else if (state.compplane && moverefs.initcomp) {
        moverefs.initcomp(ob, ob.ob_original_ob);
      } else if (moverefs.initpln) {
        moverefs.initpln(ob, ob.ob_original_ob);
      }
      return 0;
    }
    if (ob.ob_state === OBSTATE.WOUNDED && state.countmove & 1) return 0;
    return aim(ob, ob.ob_original_ob.x, ob.ob_orig_y, null, false);
  }
  function cruise(ob) {
    courseadj = ((state.countmove & 31) < 16 ? 1 : 0) << 4;
    const orgx = ob.ob_original_ob.x;
    const maxx = state.currgame.gm_max_x;
    aim(
      ob,
      courseadj + clamp_range(Math.floor(maxx / 3), orgx, Math.floor(2 * maxx / 3)),
      MAX_Y - 50 - (courseadj >> 1),
      null,
      false
    );
  }
  function attack(obp, ob) {
    courseadj = ((state.countmove & 31) < 16 ? 1 : 0) << 4;
    if (ob.ob_speed) {
      aim(
        obp,
        ob.ob_x - (CLOSE * COS(ob.ob_angle) >> 8),
        ob.ob_y - (CLOSE * SIN(ob.ob_angle) >> 8),
        ob,
        false
      );
    } else {
      aim(obp, ob.ob_x, ob.ob_y + 4, ob, false);
    }
  }
  function swauto(ob) {
    if (ob.ob_target !== null) attack(ob, ob.ob_target);
    else if (!ob.ob_athome) cruise(ob);
    ob.ob_target = null;
  }
  function bindMoverefs() {
    moverefs.gohome = gohome;
    moverefs.swauto = swauto;
    moverefs.aim = aim;
    moverefs.range = range;
  }

  // src/sim/init.js
  function initobjs() {
    topobj.ob_xnext = topobj.ob_next = botobj;
    botobj.ob_xprev = botobj.ob_prev = topobj;
    topobj.ob_x = -32767;
    botobj.ob_x = 32767;
    state.objbot = state.objtop = state.deltop = state.delbot = null;
    state.objfree = null;
  }
  function initgrnd() {
    const src = state.currgame.gm_ground;
    state.ground = new Int32Array(src.length);
    state.ground.set(src);
  }
  function initpln(obp, orig) {
    let ob;
    if (!obp) {
      ob = allocobj();
      ob.ob_original_ob = orig;
      state.planes[state.num_planes++] = ob;
    } else {
      ob = obp;
    }
    ob.ob_type = OBTYPE.PLANE;
    ob.ob_x = ob.ob_original_ob.x;
    const minx = ob.ob_x;
    const maxx = ob.ob_x + 20;
    const groundLen = state.ground.length;
    let height = 0;
    for (let x = minx; x <= maxx && x < groundLen; x++) {
      height = imax(height, state.ground[x]);
    }
    ob.ob_y = height + 13;
    ob.ob_orig_y = ob.ob_y;
    ob.ob_lx = ob.ob_ly = ob.ob_speed = ob.ob_flaps = ob.ob_accel = ob.ob_hitcount = ob.ob_bdelay = ob.ob_mdelay = ob.ob_bsdelay = 0;
    setdxdy(ob, 0, 0);
    ob.ob_orient = ob.ob_original_ob.orient;
    ob.ob_angle = ob.ob_orient ? ANGLES / 2 : 0;
    ob.ob_target = ob.ob_missiletarget = null;
    ob.ob_firing = ob.ob_mfiring = null;
    ob.ob_bombing = ob.ob_bfiring = ob.ob_home = false;
    ob.ob_symbol = symbols.symbol_plane[0].sym[ob.ob_orient ? 4 : 0];
    ob.ob_athome = true;
    ob.ob_onmap = true;
    ob.ob_flightscore.combatwound = false;
    if (!obp || ob.ob_state === OBSTATE.CRASHED) {
      ob.ob_rounds = MAXROUNDS;
      ob.ob_bombs = MAXBOMBS;
      ob.ob_missiles = MAXMISSILES;
      ob.ob_bursts = MAXBURSTS;
      ob.ob_life = MAXFUEL;
    }
    if (!obp) {
      ob.ob_endsts = OBENDSTATUS.PLAYING;
      ob.ob_target = null;
      insertx(ob, topobj);
    } else {
      insertx(ob, deletex(ob));
    }
    ob.ob_state = OBSTATE.FLYING;
    ob.ob_goingsun = false;
    return ob;
  }
  function initplyr(obp, orig) {
    const ob = initpln(obp, orig);
    if (!obp) {
      ob.ob_movef = moveplyr;
      ob.ob_faction = ob.ob_original_ob.faction;
      ob.ob_clr = ob.ob_faction;
      state.endcount = 0;
      ob.ob_plrnum = state.num_players++;
      if (ob.ob_plrnum === state.player) state.consoleplayer = ob;
    }
  }
  function initcomp(obp, orig) {
    const ob = initpln(obp, orig);
    if (!obp) {
      ob.ob_movef = movecomp;
      ob.ob_faction = FACTION.PLAYER2;
      ob.ob_clr = ob.ob_faction;
    }
    if (state.playmode === PLAYMODE.SINGLE || state.playmode === PLAYMODE.NOVICE) {
      ob.ob_state = OBSTATE.FINISHED;
      ob.ob_onmap = false;
      deletex(ob);
    }
  }
  function isrange(x, y, ax, ay) {
    let dx = Math.abs(x - ax);
    let dy = Math.abs(y - ay);
    dy += dy >> 1;
    if (dx > 100 || dy > 100) return -1;
    if (dx < dy) {
      const t = dx;
      dx = dy;
      dy = t;
    }
    return Math.floor((7 * dx + 4 * dy) / 8);
  }
  function AdjustBullet(bullet, src) {
    const next_src = createObject();
    const next_bullet = createObject();
    copyobj(next_src, src);
    movexy(next_src);
    for (; ; ) {
      copyobj(next_bullet, bullet);
      movexy(next_bullet);
      if (!CollisionTest(next_bullet, next_src)) return;
      if (bullet.ob_dx < 0) bullet.ob_x -= 2;
      else bullet.ob_x += 2;
      if (bullet.ob_dy < 0) bullet.ob_y -= 2;
      else bullet.ob_y += 2;
    }
  }
  function initshot(obo, targ) {
    if (!targ && !state.compplane && !obo.ob_rounds) return;
    const ob = allocobj();
    if (!ob) return;
    if (state.playmode !== PLAYMODE.NOVICE) obo.ob_rounds--;
    const bspeed = BULSPEED + state.gamenum;
    if (targ) {
      const x = targ.ob_x + (targ.ob_dx << 2);
      const y = targ.ob_y + (targ.ob_dy << 2);
      const dx = x - obo.ob_x;
      const dy = y - obo.ob_y;
      const r = isrange(x, y, obo.ob_x, obo.ob_y);
      if (r < 1) {
        deallobj(ob);
        return;
      }
      ob.ob_dx = Math.trunc(dx * bspeed / r);
      ob.ob_dy = Math.trunc(dy * bspeed / r);
      ob.ob_ldx = ob.ob_ldy = 0;
    } else {
      const nspeed = obo.ob_speed + bspeed;
      const nangle = obo.ob_angle;
      setdxdy(ob, nspeed * COS(nangle), nspeed * SIN(nangle));
    }
    ob.ob_type = OBTYPE.SHOT;
    ob.ob_x = obo.ob_x + Math.floor(obo.ob_symbol.w / 2);
    ob.ob_y = obo.ob_y - Math.floor(obo.ob_symbol.h / 2);
    ob.ob_lx = obo.ob_lx;
    ob.ob_ly = obo.ob_ly;
    ob.ob_life = BULLIFE;
    ob.ob_owner = obo;
    ob.ob_clr = obo.ob_clr;
    ob.ob_symbol = symbols.symbol_pixel;
    ob.ob_soundf = null;
    ob.ob_movef = moveshot;
    ob.ob_speed = 0;
    if (obo.ob_type === OBTYPE.BALLOON) ob.ob_y -= 4;
    AdjustBullet(ob, obo);
    insertx(ob, obo);
  }
  function initbomb(obo) {
    if (!state.compplane && !obo.ob_bombs || obo.ob_bdelay) return;
    const ob = allocobj();
    if (!ob) return;
    if (state.playmode !== PLAYMODE.NOVICE) obo.ob_bombs--;
    obo.ob_bdelay = 10;
    ob.ob_type = OBTYPE.BOMB;
    ob.ob_state = OBSTATE.FALLING;
    ob.ob_dx = obo.ob_dx;
    ob.ob_dy = obo.ob_dy;
    ob.ob_onmap = true;
    let angle;
    if (obo.ob_orient) angle = (obo.ob_angle + ANGLES / 4) % ANGLES;
    else angle = (obo.ob_angle + 3 * ANGLES / 4) % ANGLES;
    ob.ob_x = obo.ob_x + (COS(angle) * 10 >> 8) + 4;
    ob.ob_y = obo.ob_y + (SIN(angle) * 10 >> 8) - 4;
    ob.ob_lx = ob.ob_ly = ob.ob_ldx = ob.ob_ldy = 0;
    ob.ob_life = BOMBLIFE;
    ob.ob_owner = obo;
    ob.ob_clr = obo.ob_clr;
    ob.ob_symbol = symbols.symbol_bomb[0].sym[0];
    ob.ob_movef = movebomb;
    insertx(ob, obo);
  }
  function initmiss(obo) {
    if (obo.ob_mdelay || !obo.ob_missiles || !state.conf_missiles) return;
    const ob = allocobj();
    if (!ob) return;
    if (state.playmode !== PLAYMODE.NOVICE) obo.ob_missiles--;
    obo.ob_mdelay = 5;
    ob.ob_type = OBTYPE.MISSILE;
    ob.ob_state = OBSTATE.FLYING;
    const angle = ob.ob_angle = obo.ob_angle;
    ob.ob_x = obo.ob_x + (COS(angle) >> 4) + 4;
    ob.ob_y = obo.ob_y + (SIN(angle) >> 4) - 4;
    ob.ob_lx = ob.ob_ly = 0;
    const nspeed = state.gmaxspeed + (state.gmaxspeed >> 1);
    ob.ob_speed = nspeed;
    setdxdy(ob, nspeed * COS(angle), nspeed * SIN(angle));
    ob.ob_life = MISSLIFE;
    ob.ob_owner = obo;
    ob.ob_clr = obo.ob_clr;
    ob.ob_symbol = symbols.symbol_missile[0].sym[0];
    ob.ob_soundf = null;
    ob.ob_movef = movemiss;
    ob.ob_missiletarget = obo.ob_mfiring;
    ob.ob_orient = ob.ob_accel = ob.ob_flaps = 0;
    ob.ob_onmap = true;
    insertx(ob, obo);
  }
  function initburst(obo) {
    if (obo.ob_bsdelay || !obo.ob_bursts || !state.conf_missiles) return;
    const ob = allocobj();
    if (!ob) return;
    ob.ob_bsdelay = 5;
    if (state.playmode !== PLAYMODE.NOVICE) obo.ob_bursts--;
    ob.ob_type = OBTYPE.STARBURST;
    ob.ob_state = OBSTATE.FALLING;
    let angle;
    if (obo.ob_orient) angle = (obo.ob_angle + 3 * ANGLES / 8) % ANGLES;
    else angle = (obo.ob_angle + 5 * ANGLES / 8) % ANGLES;
    setdxdy(ob, state.gminspeed * COS(angle), state.gminspeed * SIN(angle));
    ob.ob_dx += obo.ob_dx;
    ob.ob_dy += obo.ob_dy;
    ob.ob_x = obo.ob_x + (COS(angle) * 10 >> 10) + 4;
    ob.ob_y = obo.ob_y + (SIN(angle) * 10 >> 10) - 4;
    ob.ob_lx = ob.ob_ly = 0;
    ob.ob_life = BURSTLIFE;
    ob.ob_owner = obo;
    ob.ob_clr = obo.ob_clr;
    ob.ob_symbol = symbols.symbol_burst[0].sym[0];
    ob.ob_soundf = null;
    ob.ob_movef = moveburst;
    insertx(ob, obo);
  }
  function AddPlayerTarget(ob, orig) {
    switch (orig.faction) {
      case FACTION.NONE:
        ob.ob_faction = FACTION.NONE;
        break;
      case FACTION.PLAYER1:
      case FACTION.PLAYER5:
      case FACTION.PLAYER7:
        ob.ob_faction = FACTION.PLAYER1;
        break;
      case FACTION.PLAYER2:
      case FACTION.PLAYER4:
      case FACTION.PLAYER6:
      case FACTION.PLAYER8:
        ob.ob_faction = FACTION.PLAYER2;
        break;
      case FACTION.PLAYER3:
        ob.ob_faction = state.playmode === PLAYMODE.ASYNCH ? FACTION.PLAYER1 : FACTION.PLAYER2;
        break;
      default:
        ob.ob_faction = FACTION.NONE;
    }
    state.numtarg[ob.ob_faction]++;
  }
  function Flatten(minx, maxx, headroom) {
    let minh = 999;
    let maxh = 0;
    const g = state.ground;
    for (let x = minx; x <= maxx; x++) {
      minh = imin(minh, g[x]);
      maxh = imax(maxh, g[x]);
    }
    let aveh = minh + maxh >> 1;
    aveh = clamp_max(aveh, MAX_Y - headroom - 1);
    for (let x = minx; x <= maxx; x++) g[x] = aveh;
    return aveh;
  }
  function inittarget(orig) {
    const ob = allocobj();
    ob.ob_symbol = symbols.symbol_targets[orig.orient].sym[0];
    ob.ob_x = orig.x;
    ob.ob_y = Flatten(ob.ob_x, ob.ob_x + ob.ob_symbol.w - 1, ob.ob_symbol.h) + ob.ob_symbol.h;
    ob.ob_dx = ob.ob_dy = ob.ob_lx = ob.ob_ly = ob.ob_ldx = ob.ob_ldy = ob.ob_angle = ob.ob_hitcount = 0;
    ob.ob_type = OBTYPE.TARGET;
    ob.ob_state = OBSTATE.STANDING;
    ob.ob_orient = orig.orient;
    AddPlayerTarget(ob, orig);
    ob.ob_clr = ob.ob_faction;
    ob.ob_movef = movetarg;
    ob.ob_onmap = true;
    return ob;
  }
  function initpowerup(orig) {
    const ob = allocobj();
    ob.ob_symbol = symbols.symbol_powerups[orig.orient].sym[0];
    ob.ob_x = orig.x;
    ob.ob_y = Flatten(ob.ob_x, ob.ob_x + ob.ob_symbol.w - 1, ob.ob_symbol.h) + ob.ob_symbol.h;
    ob.ob_dx = ob.ob_dy = ob.ob_lx = ob.ob_ly = ob.ob_ldx = ob.ob_ldy = ob.ob_angle = ob.ob_hitcount = 0;
    ob.ob_type = OBTYPE.POWERUP;
    ob.ob_state = OBSTATE.STANDING;
    ob.ob_orient = orig.orient;
    ob.ob_clr = FACTION.PLAYER1;
    ob.ob_movef = movepowerup;
    ob.ob_onmap = false;
    return ob;
  }
  function initsmok(obo) {
    const ob = allocobj();
    if (!ob) return;
    ob.ob_type = OBTYPE.SMOKE;
    ob.ob_x = obo.ob_x + 8;
    ob.ob_y = obo.ob_y - 8;
    ob.ob_dx = obo.ob_dx;
    ob.ob_dy = obo.ob_dy;
    ob.ob_lx = ob.ob_ly = ob.ob_ldx = ob.ob_ldy = 0;
    ob.ob_life = 10;
    ob.ob_owner = obo;
    ob.ob_soundf = null;
    ob.ob_movef = movesmok;
    ob.ob_clr = obo.ob_clr;
  }
  function initbird(obo, i) {
    const ibx = [8, 3, 0, 6, 7, 14, 10, 12];
    const iby = [16, 1, 8, 3, 12, 10, 7, 14];
    const ibdx = [-2, 2, -3, 3, -1, 1, 0, 0];
    const ibdy = [-1, -2, -1, -2, -1, -2, -1, -2];
    const ob = allocobj();
    if (!ob) return;
    ob.ob_type = OBTYPE.BIRD;
    ob.ob_x = obo.ob_x + ibx[i];
    ob.ob_y = obo.ob_y - iby[i];
    ob.ob_dx = ibdx[i];
    ob.ob_dy = ibdy[i];
    ob.ob_orient = ob.ob_lx = ob.ob_ly = ob.ob_ldx = ob.ob_ldy = 0;
    ob.ob_life = BIRDLIFE;
    ob.ob_faction = obo.ob_faction;
    ob.ob_symbol = symbols.symbol_bird[0].sym[0];
    ob.ob_soundf = null;
    ob.ob_movef = movebird;
    ob.ob_clr = obo.ob_clr;
    insertx(ob, topobj);
  }
  function initflock(orig) {
    if (state.playmode === PLAYMODE.NOVICE || !state.conf_animals) return null;
    const ob = allocobj();
    if (!ob) return null;
    ob.ob_type = OBTYPE.FLOCK;
    ob.ob_state = OBSTATE.FLYING;
    ob.ob_x = orig.x;
    ob.ob_y = MAX_Y - 1;
    ob.ob_dx = ob.ob_x < state.currgame.gm_max_x / 2 ? 2 : -2;
    ob.ob_dy = ob.ob_lx = ob.ob_ly = ob.ob_ldx = ob.ob_ldy = 0;
    ob.ob_orient = 0;
    ob.ob_life = FLOCKLIFE;
    ob.ob_faction = FACTION.NONE;
    ob.ob_symbol = symbols.symbol_flock[0].sym[0];
    ob.ob_soundf = null;
    ob.ob_movef = moveflck;
    ob.ob_clr = 1;
    ob.ob_onmap = true;
    for (let j = 0; j < NUM_STRAY_BIRDS; j++) initbird(ob, 1);
    return ob;
  }
  function initballoon(orig) {
    const ob = allocobj();
    if (!ob) return null;
    ob.ob_type = OBTYPE.BALLOON;
    ob.ob_state = OBSTATE.FLYING;
    ob.ob_life = 1;
    ob.ob_x = orig.x;
    ob.ob_y = MAX_Y - 16 + Math.floor(SIN(orig.x) / 32);
    ob.ob_dx = 0;
    ob.ob_dy = 0;
    ob.ob_orient = 0;
    ob.ob_symbol = symbols.symbol_balloon[0].sym[0];
    ob.ob_soundf = null;
    ob.ob_movef = moveballoon;
    ob.ob_faction = orig.faction;
    ob.ob_clr = ob.ob_faction;
    ob.ob_onmap = true;
    AddPlayerTarget(ob, orig);
    return ob;
  }
  function initox(orig) {
    if (state.playmode === PLAYMODE.NOVICE || !state.conf_animals) return null;
    const ob = allocobj();
    if (!ob) return null;
    ob.ob_type = OBTYPE.OX;
    ob.ob_state = OBSTATE.STANDING;
    ob.ob_x = orig.x;
    ob.ob_y = state.ground[ob.ob_x] + 16;
    ob.ob_orient = ob.ob_lx = ob.ob_ly = ob.ob_ldx = ob.ob_ldy = ob.ob_dx = ob.ob_dy = 0;
    ob.ob_faction = FACTION.NONE;
    ob.ob_symbol = symbols.symbol_ox[0].sym[orig.transform];
    ob.ob_soundf = null;
    ob.ob_movef = moveox;
    ob.ob_clr = 1;
    return ob;
  }
  function inittargets() {
    state.numtarg.fill(0);
    for (let i = 0; i < state.currgame.gm_num_objects; i++) {
      const orig = state.currgame.gm_objects[i];
      let ob = null;
      switch (orig.type) {
        case OBTYPE.TARGET:
          ob = inittarget(orig);
          break;
        case OBTYPE.OX:
          ob = initox(orig);
          break;
        case OBTYPE.FLOCK:
          ob = initflock(orig);
          break;
        case OBTYPE.BALLOON:
          ob = initballoon(orig);
          break;
        case OBTYPE.POWERUP:
          ob = initpowerup(orig);
          break;
        default:
          continue;
      }
      if (ob !== null) {
        ob.ob_original_ob = orig;
        insertx(ob, topobj);
      }
    }
  }
  function initgdep() {
    state.gmaxspeed = MAX_SPEED + state.gamenum;
    state.gminspeed = MIN_SPEED + state.gamenum;
    let r = 150;
    if (state.gamenum < 6) r -= 15 * (6 - state.gamenum);
    state.targrnge = r * r;
  }
  function swclearsplats() {
  }
  function initdisp(_reset) {
    swclearsplats();
  }
  function swrestart() {
    state.restart_flag = true;
  }
  function swend(_score, _high) {
    state.restart_flag = true;
  }
  function loser(ob) {
    ob.ob_endsts = OBENDSTATUS.LOSER;
    state.endcount = 30;
  }
  function winner(ob) {
    ob.ob_endsts = OBENDSTATUS.WINNER;
    state.endcount = 30;
  }
  function scorepln(_ob, _t) {
  }
  function bindMoverefsAll() {
    bindMoverefs();
    moverefs.initshot = initshot;
    moverefs.initbomb = initbomb;
    moverefs.initmiss = initmiss;
    moverefs.initburst = initburst;
    moverefs.initsmok = initsmok;
    moverefs.initplyr = initplyr;
    moverefs.initcomp = initcomp;
    moverefs.initpln = initpln;
    moverefs.initdisp = initdisp;
    moverefs.scorepln = scorepln;
    moverefs.loser = loser;
    moverefs.winner = winner;
    moverefs.swrestart = swrestart;
    moverefs.swend = swend;
    moverefs.hitpln = (ob) => {
      ob.ob_ldx = 0;
      ob.ob_ldy = 0;
      ob.ob_hitcount = FALLCOUNT;
      ob.ob_state = OBSTATE.FALLING;
      ob.ob_athome = false;
      return true;
    };
  }
  function swinitlevel() {
    bindMoverefsAll();
    swclearsplats();
    initgrnd();
    initobjs();
    state.num_players = 0;
    state.num_planes = 0;
    state.planes.fill(null);
    let player1_ob = null;
    let player2_ob = null;
    const orig_planes = [];
    for (let i = 0; i < state.currgame.gm_num_objects; i++) {
      const plane = state.currgame.gm_objects[i];
      if (plane.type !== OBTYPE.PLANE) continue;
      if (state.playmode === PLAYMODE.ASYNCH && plane.faction > FACTION.PLAYER2) continue;
      if (plane.faction > FACTION.PLAYER4) continue;
      orig_planes.push(plane);
      if (player1_ob === null && plane.faction === FACTION.PLAYER1) player1_ob = plane;
      if (player2_ob === null && plane.faction === FACTION.PLAYER2) player2_ob = plane;
    }
    if (!player1_ob) {
      throw new Error("mission has no PLAYER1 plane");
    }
    if (state.keydelay === -1) state.keydelay = 1;
    initplyr(null, player1_ob);
    state.maxcrash = MAXCRASH;
    for (const op of orig_planes) {
      if (op !== player1_ob && op !== player2_ob) initcomp(null, op);
    }
    inittargets();
    initdisp(false);
    initgdep();
    state.countmove = 0;
    state.successful_flight = false;
    state.last_ground_time = 0;
  }

  // src/main.js
  var canvas2 = document.getElementById("game");
  initVideo(canvas2);
  initInput(canvas2);
  initAudio();
  var mission = null;
  var booted = false;
  var keyState = /* @__PURE__ */ new Set();
  var KEY_BINDINGS = /* @__PURE__ */ new Map([
    ["ArrowUp", K_FLAPU],
    ["KeyW", K_FLAPU],
    ["ArrowDown", K_FLAPD],
    ["KeyS", K_FLAPD],
    ["ArrowLeft", K_DEACC],
    ["ArrowRight", K_ACCEL],
    ["KeyA", K_DEACC],
    ["KeyD", K_ACCEL],
    ["Comma", K_FLIP],
    ["Space", K_SHOT],
    ["KeyB", K_BOMB],
    ["KeyH", K_HOME],
    ["KeyM", K_MISSILE],
    ["KeyX", K_STARBURST]
  ]);
  window.addEventListener("keydown", (e) => {
    if (KEY_BINDINGS.has(e.code)) {
      keyState.add(e.code);
      e.preventDefault();
    }
  });
  window.addEventListener("keyup", (e) => {
    if (KEY_BINDINGS.has(e.code)) {
      keyState.delete(e.code);
      e.preventDefault();
    }
  });
  window.addEventListener("blur", () => keyState.clear());
  function buildKeyMask() {
    let mask = 0;
    for (const code of keyState) mask |= KEY_BINDINGS.get(code) ?? 0;
    return mask;
  }
  async function boot() {
    const text = await fetch("./data/original.sop").then((r) => r.text());
    mission = loadMission(text);
    state.currgame = mission.games;
    state.playmode = PLAYMODE.SINGLE;
    state.gamenum = 0;
    state.player = 0;
    state.conf_animals = true;
    state.conf_big_explosions = true;
    buildSymbols(mission.symbols);
    swinitlevel();
    booted = true;
    console.log(
      `mission: ${mission.games.gm_num_objects} objects, ground ${mission.games.gm_max_x} cols`
    );
    console.log(`spawned ${state.num_planes} planes; consoleplayer at`, state.consoleplayer && [state.consoleplayer.ob_x, state.consoleplayer.ob_y]);
  }
  var SBAR_HGHT2 = 19;
  function renderScene() {
    clear();
    const game = state.currgame;
    const player = state.consoleplayer;
    let displx = 0;
    if (player) {
      displx = player.ob_x - 160;
      if (displx < 0) displx = 0;
      const maxScroll = game.gm_max_x - SCR_WDTH;
      if (displx > maxScroll) displx = maxScroll;
    }
    state.displx = displx;
    const ground = state.ground;
    const w = Math.min(SCR_WDTH, game.gm_max_x - displx);
    if (ground && w > 0) {
      dispGround(ground, displx, 0, w);
    }
    for (let ob = state.objtop; ob !== null; ob = ob.ob_next) {
      if (!ob.ob_symbol || !ob.ob_drwflg) continue;
      const sx = ob.ob_x - displx;
      if (sx + ob.ob_symbol.w < 0 || sx >= SCR_WDTH) continue;
      drawSymbol(sx, ob.ob_y, ob.ob_symbol, ob.ob_faction);
    }
    box(0, SBAR_HGHT2 - 1, SCR_WDTH - 1, SBAR_HGHT2 - 1, 1);
    box(0, SBAR_HGHT2, SCR_WDTH - 1, 0, 3);
  }
  startLoop({
    tick() {
      if (!booted) return;
      const idx = state.countmove % MAX_NET_LAG;
      state.latest_player_commands[0][idx] = buildKeyMask();
      swmove();
      if (state.restart_flag) {
        state.restart_flag = false;
        swinitlevel();
      }
    },
    render() {
      if (booted) renderScene();
      else clear();
      present();
    }
  });
  globalThis.__sopwith = {
    constants: constants_exports,
    types: types_exports,
    state,
    get mission() {
      return mission;
    },
    get planes() {
      return state.planes.slice(0, state.num_planes);
    },
    get player() {
      return state.consoleplayer;
    },
    symbols,
    object: object_exports,
    vidBuffer,
    VID_PITCH,
    fuselageColor,
    setVideoPalette,
    getNumVideoPalettes,
    getVideoPaletteName,
    getActivePaletteIndex,
    dispGround,
    dispGroundSolid,
    pressKey: (mask) => {
      state.latest_player_commands[0][state.countmove % MAX_NET_LAG] = mask;
    }
  };
  boot().catch((e) => {
    console.error("boot failed:", e);
  });
  console.log("sopwith.js boot");
})();
