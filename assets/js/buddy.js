/*
 * Pixel Madhav: a slim little character that lives in the browser window.
 *
 * - Drawn in code on a 36×38 canvas and scaled by whole numbers, so pixels stay crisp.
 * - Where it lives depends on the space available, recalculated whenever the window resizes:
 *     roam: a click-through layer over the empty right margin (walks the bottom edge, bounces off
 *           the side, climbs the wall, flies off with a little rocket)
 *     dock: a slim bar fixed to the bottom of the window on narrower screens; the page gets matching
 *           bottom padding so it never covers anything
 * - Comic sound effects are short bubbles shown now and then (roam mode only). Nothing flashes.
 * - Starts paused for people who prefer reduced motion. Pause and Hide are remembered.
 *
 * Poses live in ANIMS, things it does in BEHAVIOURS, colours in P.
 */
(() => {
  const root = document.querySelector("[data-buddy]");
  if (!root) return;
  const stage = root.querySelector("[data-buddy-stage]");
  const sprite = root.querySelector("[data-buddy-sprite]");
  const canvas = sprite.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const bubble = root.querySelector("[data-buddy-sfx]");
  const pokeBtn = root.querySelector("[data-buddy-poke]");
  const controls = root.querySelector("[data-buddy-controls]");
  const pauseBtn = root.querySelector("[data-buddy-pause]");
  const hideBtn = root.querySelector("[data-buddy-hide]");
  const showBtn = document.querySelector("[data-buddy-show]");

  const W = 36, H = 38, FRAME_MS = 120;
  const HAIR_TOP = 11, FEET = 37;          // rows: top of the hair, just below the shoes
  const CONTENT_HALF = 416;                // half of the widest content (52rem), in px
  const DOCK_HEIGHT = 64;

  const off = document.createElement("canvas");
  off.width = W; off.height = H;
  const g = off.getContext("2d");

  // Colours. Change skin, shirt, etc. here.
  const P = {
    outline: [27, 26, 23],
    hair: "#2a2130", skin: "#e8b38b", blush: "#ff8fb8", eye: "#1b1a17",
    shirt: "#ff5a1f", stripe: "#ffc83d", pants: "#2f5bea", shoe: "#ffffff", sole: "#b9b4a8",
    red: "#ff5a1f", yellow: "#ffc83d", blue: "#2f5bea", green: "#1fae6b", pink: "#ff8fb8", cyan: "#54c7ff",
    ball: "#d4e83a", white: "#ffffff", grey: "#cfcabe", dark: "#3a3833",
  };

  // ---------- Drawing helpers ----------
  const rect = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const px = (x, y, c) => rect(x, y, 1, 1, c);
  const glyph = (rows, x, y, c) =>
    rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === "1") px(x + i, y + j, c); }));
  function line(x0, y0, x1, y1, each) {
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    const pts = [];
    let err = dx + dy;
    for (;;) {
      pts.push([x0, y0]);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    pts.forEach((p, i) => each(p[0], p[1], i / Math.max(1, pts.length - 1)));
  }
  const GLYPHS = {
    note: ["011", "010", "010", "110", "110"],
    z: ["111", "010", "111"],
    heart: ["101", "111", "010"],
    star: ["010", "111", "010"],
  };

  // ---------- The character ----------
  // Hands are single pixels given in "standing" coordinates; the bob is added automatically.
  // Raised arms bend out at the elbow first, so they go up beside the head instead of across the face.
  function arm(sx, sy, hx, hy) {
    if (hy < sy - 1) {
      const ex = sx < 18 ? 13 : 23, ey = sy - 1;
      line(sx, sy, ex, ey, (x, y) => px(x, y, P.shirt));
      line(ex, ey, hx, hy, (x, y) => px(x, y, P.skin));
      return;
    }
    line(sx, sy, hx, hy, (x, y, t) => px(x, y, t < 0.3 ? P.shirt : P.skin));
  }

  function eyes(type, hy, look) {
    const lx = look.x < -0.4 ? -1 : look.x > 0.4 ? 1 : 0;
    const ly = look.y < -0.4 ? -1 : 0;
    for (const e of [16, 20]) {
      const y = hy + 4;
      if (type === "happy") { px(e - 1, y + 1, P.eye); px(e, y, P.eye); px(e + 1, y + 1, P.eye); }
      else if (type === "closed") rect(e - 1, y + 1, 3, 1, P.eye);
      else if (type === "sleepy") { rect(e - 1, y + 1, 3, 1, P.eye); px(e, y + 2, P.eye); }
      else if (type === "wide") rect(e, y - 1, 1, 3, P.eye);
      else if (type === "dizzy") { px(e - 1, y - 1, P.eye); px(e + 1, y - 1, P.eye); px(e, y, P.eye); px(e - 1, y + 1, P.eye); px(e + 1, y + 1, P.eye); }
      else if (type === "star") glyph(GLYPHS.star, e - 1, y - 1, P.yellow);
      else if (type === "heart") glyph(GLYPHS.heart, e - 1, y - 1, P.pink);
      else {
        rect(e + lx, y + ly, 1, 2, P.eye);
        if (type === "determined") rect(e === 16 ? 15 : 20, y - 1, 2, 1, P.eye);
      }
    }
  }

  function body(o = {}) {
    const b = o.bob || 0, look = o.look || { x: 0, y: 0 };
    const hy = HAIR_TOP + b, ty = 20 + b;
    const lh = o.lh || [14, 26], rh = o.rh || [22, 26];
    const liftL = o.lift === "L" ? 1 : 0, liftR = o.lift === "R" ? 1 : 0;

    // legs and shoes (they don't bob)
    rect(16, 29, 2, 6 - liftL, P.pants); rect(19, 29, 2, 6 - liftR, P.pants);
    rect(15, 35 - liftL, 3, 1, P.shoe); rect(15, 36 - liftL, 3, 1, P.sole);
    rect(19, 35 - liftR, 3, 1, P.shoe); rect(19, 36 - liftR, 3, 1, P.sole);
    rect(16, b < 0 ? 26 : 27, 5, b < 0 ? 3 : 2, P.pants);
    // torso
    rect(16, ty, 5, 7, P.shirt); rect(16, ty + 3, 5, 1, P.stripe);
    px(18, ty - 1, P.skin);
    // head: hair, face, ears
    rect(15, hy, 7, 2, P.hair); px(17, hy - 1, P.hair); px(19, hy - 1, P.hair); px(20, hy - 1, P.hair);
    rect(14, hy + 1, 1, 3, P.hair); rect(22, hy + 1, 1, 2, P.hair);
    rect(15, hy + 2, 7, 5, P.skin); rect(16, hy + 7, 5, 1, P.skin);
    rect(15, hy + 2, 2, 1, P.hair); px(19, hy + 2, P.hair);
    px(14, hy + 4, P.skin); px(22, hy + 4, P.skin);
    eyes(o.eyes || "normal", hy, look);
    if (o.blush) { px(15, hy + 6, P.blush); px(21, hy + 6, P.blush); }
    if (o.under) o.under(b);
    arm(15, ty, lh[0], lh[1] + b);
    arm(21, ty, rh[0], rh[1] + b);
    if (o.over) o.over(b);
  }

  // ---------- Props ----------
  function racket(hx, hy, deg) {
    const a = (deg * Math.PI) / 180;
    for (let d = 1; d <= 3; d++) px(Math.round(hx + d * Math.cos(a)), Math.round(hy + d * Math.sin(a)), P.dark);
    const cx = hx + 6 * Math.cos(a), cy = hy + 6 * Math.sin(a);
    for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++)
      if (dx * dx + dy * dy <= 4) px(Math.round(cx + dx), Math.round(cy + dy), (dx + dy) % 2 ? P.grey : P.white);
    for (let t = 0; t < 24; t++) {
      const th = (t / 24) * Math.PI * 2;
      px(Math.round(cx + 2.6 * Math.cos(th)), Math.round(cy + 2.6 * Math.sin(th)), P.red);
    }
  }
  const ball = (x, y, c = P.ball) => rect(x, y, 2, 2, c);
  const dumbbell = (hx, hy) => { rect(hx - 1, hy - 1, 1, 3, P.dark); rect(hx + 1, hy - 1, 1, 3, P.dark); };
  function piano(pl, pr) {
    rect(6, 26, 24, 4, P.grey);
    rect(7, 26, 22, 2, P.white);
    [9, 11, 15, 17, 19, 23, 25].forEach((x) => px(x, 26, P.dark));
    if (pl) px(pl, 27, P.cyan);
    if (pr) px(pr, 27, P.pink);
    px(8, 29, P.red); px(10, 29, P.blue); px(26, 29, P.yellow); px(28, 29, P.green);  // little knobs
    rect(8, 30, 1, 7, P.dark); rect(27, 30, 1, 7, P.dark);
  }
  function headphones(b) {
    const hy = HAIR_TOP + b;
    rect(15, hy - 2, 7, 1, P.blue); px(14, hy - 1, P.blue); px(22, hy - 1, P.blue); px(13, hy, P.blue); px(23, hy, P.blue);
    rect(13, hy + 2, 2, 3, P.yellow); rect(22, hy + 2, 2, 3, P.yellow);
  }
  function rocket(x, y, flame) {
    px(x + 1, y, P.red);
    rect(x, y + 1, 3, 4, P.white); px(x + 1, y + 2, P.blue);
    px(x - 1, y + 4, P.red); px(x + 3, y + 4, P.red); rect(x, y + 5, 3, 1, P.red);
    if (flame != null) {
      px(x + 1, y + 6, "#fff3b0");
      if (flame % 3 !== 0) px(x + 1, y + 7, "#ffb02e");
      if (flame % 3 === 2) { px(x, y + 7, "#ffb02e"); px(x + 2, y + 7, "#ffb02e"); px(x + 1, y + 8, "#ff5a36"); }
    }
  }

  // ---------- Animations ----------
  // draw(frame, state). events: { frame: ["TEXT", tone] } shows a comic bubble once at that frame.
  const ANIMS = {
    idle: {
      draw(f, s) {
        const tap = f % 60 >= 44 && f % 60 < 52;
        body({ eyes: f % 36 >= 34 ? "closed" : "normal", look: s.look, lift: tap && f % 2 ? "R" : null });
      },
    },
    walk: {
      draw(f, s) {
        const k = f % 4;
        body({ lift: k === 1 ? "L" : k === 3 ? "R" : null, bob: k % 2 ? -1 : 0, look: s.look,
          lh: [14, k === 1 ? 25 : k === 3 ? 27 : 26], rh: [22, k === 3 ? 25 : k === 1 ? 27 : 26] });
      },
    },
    squash: { draw: () => body({ bob: 1, eyes: "happy", lh: [13, 26], rh: [23, 26] }) },
    jump: { draw: () => body({ bob: -1, eyes: "happy", blush: true, lh: [13, 16], rh: [23, 16], lift: "L" }) },

    tennis: {
      events: { 4: ["POW!"], 20: ["THWACK!"] },
      draw(f) {
        const k = f % 8;
        const hands = [[22, 23], [23, 24], [24, 26], [24, 27], [22, 20], [20, 18], [17, 17], [22, 24]];
        const angles = [-70, -40, 10, 35, -40, -100, -150, -80];
        const balls = [[34, 10], [32, 13], [30, 16], [30, 15], [28, 13], [31, 9], [34, 6], null];
        const rh = hands[k];
        body({ rh, look: { x: 1, y: -0.5 }, eyes: k === 2 || k === 3 ? "determined" : k === 4 ? "wide" : k >= 5 ? "happy" : "normal",
          under: (b) => racket(rh[0], rh[1] + b, angles[k]) });
        if (balls[k]) ball(...balls[k]);
        if (k === 4) { px(31, 12, P.yellow); px(30, 10, P.yellow); px(31, 15, P.yellow); }
      },
    },

    keepy: {
      events: { 30: ["NICE!"] },
      draw(f) {
        const ys = [21, 17, 14, 12, 11, 12, 14, 17];
        const k = f % 8;
        body({ rh: [22, k === 0 ? 23 : 22], eyes: "normal", look: { x: 1, y: -1 },
          under: (b) => racket(22, (k === 0 ? 23 : 22) + b, -8) });
        ball(27, ys[k]);
      },
    },

    piano: {
      events: { 6: ["PLINK!", "pink"], 22: ["PLONK!", "pink"] },
      draw(f) {
        const left = f % 2 === 0;
        const lx = [13, 15, 12, 14][f % 4], rx = [21, 23, 20, 22][(f + 1) % 4];
        body({ lh: [lx, left ? 25 : 24], rh: [rx, left ? 24 : 25], bob: f % 4 < 2 ? 0 : 1,
          eyes: f % 8 < 4 ? "closed" : "happy", blush: true, over: () => piano(lx, rx) });
        const cols = [P.pink, P.blue, P.red];
        for (let i = 0; i < 3; i++) {
          const t = (f + i * 5) % 15;
          glyph(GLYPHS.note, 26 + (i % 2) * 4, 22 - t, cols[i]);
        }
      },
    },

    gym: {
      events: { 4: ["HUP!", "blue"], 20: ["+1 STR", "blue"] },
      draw(f) {
        const k = f % 8;
        const ys = [26, 22, 18, 12, 9, 9, 18, 22];
        const y = ys[k], up = y <= 12;
        const lh = [up ? 13 : 14, y], rh = [up ? 23 : 22, y];
        body({ lh, rh, eyes: up ? "closed" : "determined", look: { x: 0, y: -1 },
          over: (b) => { dumbbell(lh[0], lh[1] + b); dumbbell(rh[0], rh[1] + b); } });
        if (up) { px(23, 12 + (k % 2), P.cyan); px(23, 13 + (k % 2), P.cyan); }
      },
    },

    yawn: {
      events: { 4: ["YAWWN~", "white"], 18: ["Zzz…", "white"], 37: ["!?"] },
      draw(f) {
        if (f < 12) {
          const ys = [26, 22, 16, 10, 8, 8, 8, 8, 10, 16, 22, 26];
          const up = ys[f] <= 10;
          body({ lh: [up ? 13 : 14, ys[f]], rh: [up ? 23 : 22, ys[f]], eyes: f >= 3 && f < 10 ? "closed" : "sleepy", bob: up ? -1 : 0 });
          if (f >= 5 && f < 10) px(22, HAIR_TOP + 5 - 1, P.cyan); // a sleepy tear
          return;
        }
        if (f >= 36) { body({ eyes: "wide", lh: [13, 18], rh: [23, 18], bob: -1 }); return; }
        const s = f - 12;
        body({ eyes: "closed", bob: s % 10 < 5 ? 0 : 1 });
        glyph(GLYPHS.z, 24, 9 - (s % 8), P.blue);
        if (s % 16 >= 6) glyph(GLYPHS.z, 28, 6 - ((s - 6) % 8), P.cyan);
      },
    },

    music: {
      events: { 8: ["BOP BOP!", "pink"], 40: ["♪ ♪", "pink"] },
      draw(f) {
        const beat = f % 4 < 2;
        body({ bob: beat ? 0 : 1, eyes: f % 16 < 8 ? "happy" : "closed", blush: true, lift: beat ? null : "R",
          rh: f % 32 < 16 ? [23, 15] : [22, 26], lh: [14, beat ? 26 : 25],
          over: (b) => headphones(b) });
        const cols = [P.pink, P.blue, P.yellow];
        for (let i = 0; i < 3; i++) {
          const t = (f + i * 4) % 12;
          glyph(GLYPHS.note, i % 2 ? 7 + (t % 3) : 26 - (t % 3), 16 - t, cols[i]);
        }
      },
    },

    rocketReady: { draw: () => body({ lh: [16, 8], rh: [20, 8], eyes: "determined", look: { x: 0, y: -1 }, over: () => rocket(17, 1, null) }) },
    rocketFly: {
      draw: (f, s) => body({ lh: [16, 8], rh: [20, 8], eyes: s.landing ? "happy" : "star", blush: true, lift: f % 2 ? "L" : "R",
        over: () => rocket(17, 1, f) }),
    },

    climb: {
      draw(f) {
        const k = f % 4 < 2;
        body({ lh: [14, k ? 14 : 18], rh: [22, k ? 18 : 14], lift: k ? "L" : "R", eyes: "determined", look: { x: 1, y: -1 } });
      },
    },
    slide: { draw: (f) => body({ lh: [13, 13], rh: [23, 13], eyes: "star", blush: true, lift: f % 2 ? "L" : "R" }) },
    wave: { draw: (f) => body({ rh: f % 4 < 2 ? [23, 13] : [24, 15], eyes: "happy", blush: true }) },
    love: { draw: (f) => body({ eyes: "heart", blush: true, bob: f % 4 < 2 ? 0 : -1 }) },
    dizzy: { draw: (f) => body({ eyes: "dizzy", bob: f % 4 < 2 ? 0 : 1 }) },
    whoa: { draw: () => body({ eyes: "wide", lh: [13, 17], rh: [23, 17] }) },
  };

  // ---------- Composite: crisp ink outline + soft shadow ----------
  function composite(grounded) {
    const src = g.getImageData(0, 0, W, H).data;
    const out = ctx.createImageData(W, H);
    const d = out.data;
    const [or, og, ob] = P.outline;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (src[i + 3]) { d[i] = src[i]; d[i + 1] = src[i + 1]; d[i + 2] = src[i + 2]; d[i + 3] = 255; continue; }
      const near = (x > 0 && src[i - 1]) || (x < W - 1 && src[i + 7]) || (y > 0 && src[i - W * 4 + 3]) || (y < H - 1 && src[i + W * 4 + 3]);
      if (near) { d[i] = or; d[i + 1] = og; d[i + 2] = ob; d[i + 3] = 255; }
    }
    ctx.putImageData(out, 0, 0);
    if (grounded) {
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "rgba(27,26,23,0.18)";
      ctx.fillRect(13, 37, 11, 1);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  // ---------- State ----------
  const CANCEL = Symbol("cancel");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } },
  };

  let paused = store.get("buddy-paused") === null ? reduceMotion.matches : store.get("buddy-paused") === "1";
  let hidden = store.get("buddy-hidden") === "1";
  let visible = !document.hidden;
  let mode = null, scale = 3, sw = W * 3, sh = H * 3, bw = 0, bh = 0;
  let x = 0, y = 0, placed = false;
  let anim = { name: "idle", start: 0, s: { look: { x: 0, y: 0 } } };
  let frame = 0, frameAcc = 0, now = 0, last = 0, raf = null;
  let timers = [], motion = null, gen = 0;
  let mouse = null, lastSay = -1e9, bubbleTimer = null, lastBehaviour = null, hiddenAt = 0;

  // ---------- Layout: pick roam or dock, size, and keep the sprite inside the bounds ----------
  const floorY = () => bh - FEET * scale - (mode === "roam" ? 8 : 4);
  const minY = () => (mode === "roam" ? controls.offsetTop + controls.offsetHeight + 12 : floorY() - 8);
  const maxX = () => Math.max(0, bw - sw);
  const clampX = (v) => Math.min(Math.max(0, v), maxX());
  const clampY = (v) => Math.min(Math.max(Math.min(minY(), floorY()), v), floorY());

  function layout() {
    const gutter = window.innerWidth / 2 - CONTENT_HALF - 12;
    const next = gutter >= W * 3 + 24 ? "roam" : "dock";
    const nextScale = next === "roam" ? (gutter >= W * 4 + 24 ? 4 : 3) : 2;
    const changed = next !== mode;
    mode = next; scale = nextScale;

    root.classList.toggle("buddy--roam", mode === "roam");
    root.classList.toggle("buddy--dock", mode === "dock");
    if (mode === "roam") root.style.setProperty("--roam-width", Math.floor(gutter) + "px");
    root.style.setProperty("--controls-width", controls.offsetWidth + 20 + "px");
    document.documentElement.style.setProperty("--dock", !hidden && mode === "dock" ? DOCK_HEIGHT + "px" : "0px");

    sw = W * scale; sh = H * scale;
    canvas.style.width = sw + "px"; canvas.style.height = sh + "px";
    bubble.style.bottom = sh - HAIR_TOP * scale + 8 + "px";
    const r = stage.getBoundingClientRect();
    bw = r.width; bh = r.height;

    if (!placed || changed) { x = maxX() * (mode === "roam" ? 0.5 : 0.85); y = floorY(); placed = true; }
    x = clampX(x);
    y = motion ? clampY(y) : floorY();
    if (motion) { motion.tx = clampX(motion.tx); motion.ty = clampY(motion.ty); }
    place();
    if (anim) draw();
    return changed;
  }
  const place = () => { sprite.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`; };

  // ---------- Speech bubbles ----------
  function say(text, tone, force) {
    if (mode !== "roam" || (!force && now - lastSay < 2500)) return;
    lastSay = now;
    bubble.textContent = text;
    if (tone) bubble.dataset.tone = tone; else delete bubble.dataset.tone;
    bubble.classList.add("is-on");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove("is-on"), 1500);
  }

  // ---------- Drawing ----------
  function setAnim(name, s = {}) {
    anim = { name, start: frame, s: Object.assign({ look: anim.s.look }, s) };
    draw();
  }
  function draw() {
    const f = frame - anim.start;
    const def = ANIMS[anim.name];
    if (mouse && mode === "roam" && (anim.name === "idle" || anim.name === "walk")) {
      const r = sprite.getBoundingClientRect();
      const dx = mouse.x - (r.left + r.width / 2), dy = mouse.y - (r.top + r.height * 0.4);
      const len = Math.hypot(dx, dy) || 1;
      anim.s.look = { x: dx / len, y: dy / len };
    }
    g.clearRect(0, 0, W, H);
    def.draw(f, anim.s);
    composite(y >= floorY() - 1);
    if (def.events && def.events[f] && !paused) say(...def.events[f]);
  }

  // ---------- Clock: timers and movement only advance while running ----------
  const running = () => !paused && !hidden && visible;
  const wait = (ms) => new Promise((res, rej) => timers.push({ at: now + ms, res, rej }));
  function move(tx, ty, speed, arc = 0) {
    tx = clampX(tx); ty = clampY(ty);
    const dist = Math.hypot(tx - x, ty - y);
    return new Promise((res, rej) => {
      motion = { fx: x, fy: y, tx, ty, arc, t: 0, dur: Math.max(1, (dist / speed) * 1000), res, rej };
    });
  }
  function interrupt() {
    gen++;
    timers.forEach((t) => t.rej(CANCEL)); timers = [];
    if (motion) { motion.rej(CANCEL); motion = null; }
  }

  function loop(ts) {
    if (!running()) { raf = null; return; }
    const dt = last ? Math.min(250, ts - last) : 0;
    last = ts; now += dt;
    for (const t of timers.filter((t) => t.at <= now)) { timers.splice(timers.indexOf(t), 1); t.res(); }
    if (motion) {
      motion.t += dt;
      const p = Math.min(1, motion.t / motion.dur);
      x = motion.fx + (motion.tx - motion.fx) * p;
      y = motion.fy + (motion.ty - motion.fy) * p - motion.arc * 4 * p * (1 - p);
      if (p >= 1) { const m = motion; motion = null; m.res(); }
    }
    x = clampX(x);
    y = Math.min(y, floorY());
    place();
    frameAcc += dt;
    if (frameAcc >= FRAME_MS) { frameAcc %= FRAME_MS; frame++; draw(); }
    raf = requestAnimationFrame(loop);
  }
  function kick() { if (running() && raf === null) { last = 0; raf = requestAnimationFrame(loop); } }

  // ---------- Behaviours ----------
  const rand = (a, b) => a + Math.random() * (b - a);
  const k = () => scale / 3;
  async function walkTo(tx) {
    setAnim("walk", { look: { x: tx > x ? 1 : -1, y: 0 } });
    await move(tx, floorY(), 70 * k());
  }
  async function activity(name, frames) { setAnim(name); await wait(frames * FRAME_MS); }

  const BEHAVIOURS = {
    stroll: { weight: 3, run: () => walkTo(rand(0, maxX())) },
    bounce: {
      weight: 2,
      async run() {
        const right = Math.random() < 0.6, edge = right ? maxX() : 0;
        await walkTo(edge);
        setAnim("squash"); say("BOING!", null, true);
        await wait(200);
        setAnim("jump");
        await move(edge + (right ? -1 : 1) * Math.min(80 * k(), maxX() / 2), floorY(), 190 * k(), mode === "roam" ? 36 * k() : 6);
        setAnim("squash"); await wait(150);
      },
    },
    tennis: { weight: 2, run: () => activity("tennis", 24) },
    keepy: { weight: 1, run: () => activity("keepy", 32) },
    piano: { weight: 2, run: () => activity("piano", 32) },
    gym: { weight: 2, run: () => activity("gym", 24) },
    yawn: { weight: 1, run: () => activity("yawn", 40) },
    music: { weight: 2, run: () => activity("music", 48) },
    rocket: {
      weight: 1.5,
      async run() {
        setAnim("rocketReady"); await wait(600);
        setAnim("rocketFly"); say("WHOOSH!", "blue", true);
        if (mode === "roam") {
          await move(rand(0, maxX()), rand(minY(), Math.max(minY(), floorY() - bh * 0.45)), 150 * k());
          await wait(800);
          setAnim("rocketFly", { landing: true });
          await move(x, floorY(), 60 * k());
        } else {
          await move(x, floorY() - 6, 30);
          await wait(1200);
          setAnim("rocketFly", { landing: true });
          await move(x, floorY(), 20);
        }
        setAnim("squash"); say("TA-DA!", null, true); await wait(600);
      },
    },
    climb: {
      weight: 1.5, roamOnly: true,
      async run() {
        await walkTo(maxX());
        setAnim("climb");
        await move(maxX(), Math.max(minY(), floorY() - rand(0.3, 0.55) * bh), 40 * k());
        setAnim("whoa"); await wait(450);
        setAnim("slide"); say("WHEEE!", "blue", true);
        await move(maxX(), floorY(), 230 * k());
        setAnim("squash"); await wait(220);
      },
    },
  };

  function pick() {
    const names = Object.keys(BEHAVIOURS).filter((n) => n !== lastBehaviour && (mode === "roam" || !BEHAVIOURS[n].roamOnly));
    let r = Math.random() * names.reduce((s, n) => s + BEHAVIOURS[n].weight, 0);
    for (const n of names) { r -= BEHAVIOURS[n].weight; if (r <= 0) return n; }
    return names[0];
  }

  async function brain() {
    const mine = gen;
    try {
      for (;;) {
        setAnim("idle");
        await wait(rand(2200, 4500));
        lastBehaviour = pick();
        await BEHAVIOURS[lastBehaviour].run();
        if (mine !== gen) return;
      }
    } catch (e) { if (e !== CANCEL) throw e; }
  }

  // Interrupt whatever is happening, react, then carry on.
  async function react(name, text, tone, ms = 1400) {
    interrupt();
    const mine = gen;
    if (paused) {
      setAnim(name); say(text, tone, true);
      setTimeout(() => { if (mine === gen && paused) setAnim("idle"); }, 1600);
      return;
    }
    try {
      if (y < floorY() - 1) { setAnim("slide"); await move(x, floorY(), 220 * k()); }
      setAnim(name); say(text, tone, true);
      await wait(ms);
    } catch (e) { if (e !== CANCEL) throw e; return; }
    if (mine === gen) brain();
  }

  // ---------- Interaction ----------
  let pokes = [];
  pokeBtn.addEventListener("click", () => {
    pokes = pokes.filter((t) => performance.now() - t < 2500).concat(performance.now());
    if (pokes.length >= 4) { pokes = []; react("dizzy", "OKAY OKAY!", null, 1600); return; }
    if (pokes.length === 3) { react("love", "HEHE!", "pink"); return; }
    const hi = ["HI!", "HEY!", "YO!", "HELLO!"];
    react("wave", hi[Math.floor(Math.random() * hi.length)]);
  });

  function setPaused(value, remember) {
    paused = value;
    pauseBtn.firstChild.textContent = paused ? "Play" : "Pause";
    if (remember) store.set("buddy-paused", paused ? "1" : "0");
    if (paused) { bubble.classList.remove("is-on"); if (anim.name === "walk") setAnim("idle"); }
    kick();
  }
  pauseBtn.addEventListener("click", () => setPaused(!paused, true));

  function setHidden(value) {
    hidden = value;
    store.set("buddy-hidden", hidden ? "1" : "0");
    root.hidden = hidden;
    if (showBtn) showBtn.hidden = !hidden;
    layout();
    if (!hidden) { kick(); pokeBtn.focus(); } else if (showBtn) showBtn.focus();
  }
  hideBtn.addEventListener("click", () => setHidden(true));
  if (showBtn) showBtn.addEventListener("click", () => setHidden(false));

  // Reacting to the page.
  let lastScroll = { y: window.scrollY, t: performance.now() }, lastWhoa = -1e9, saidEnd = false, lastHey = -1e9;
  window.addEventListener("scroll", () => {
    const t = performance.now(), sy = window.scrollY;
    const speed = (Math.abs(sy - lastScroll.y) / Math.max(1, t - lastScroll.t)) * 1000;
    lastScroll = { y: sy, t };
    if (!running()) return;
    if (speed > 3000 && t - lastWhoa > 25000 && !motion) { lastWhoa = t; react("whoa", "WHOA!", "blue", 1100); }
    else if (!saidEnd && sy > 200 && sy + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      saidEnd = true; react("wave", "THE END!", "white", 1300);
    }
  }, { passive: true });

  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mouse = { x: e.clientX, y: e.clientY };
    if (mode !== "roam" || !running() || motion) return;
    const r = sprite.getBoundingClientRect();
    const near = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < 150;
    if (near && performance.now() - lastHey > 20000 && anim.name === "idle") { lastHey = performance.now(); react("wave", "HEY!"); }
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
    if (!visible) hiddenAt = performance.now();
    else if (performance.now() - hiddenAt > 15000 && !paused && !hidden) react("wave", "OH HI!");
    kick();
  });

  // Recalculate on every resize (debounced a little), and restart cleanly if the mode changed.
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (layout()) { interrupt(); brain(); kick(); }
    }, 100);
  });
  reduceMotion.addEventListener?.("change", (e) => { if (store.get("buddy-paused") === null) setPaused(e.matches, false); });

  // ---------- Start ----------
  if (showBtn) showBtn.hidden = !hidden;
  root.hidden = hidden;
  layout();
  setPaused(paused, false);
  setAnim("idle");
  brain();
  kick();

  // For previewing from the browser console: buddy.do("rocket"), buddy.pose("music", 3)
  window.buddy = {
    behaviours: Object.keys(BEHAVIOURS),
    poses: Object.keys(ANIMS),
    do(name) {
      if (!BEHAVIOURS[name]) return;
      interrupt();
      const mine = gen;
      if (paused) setPaused(false, false);
      BEHAVIOURS[name].run().then(() => { if (mine === gen) brain(); }, (e) => { if (e !== CANCEL) throw e; });
      kick();
    },
    pose(name, f = 0) { if (!ANIMS[name]) return; setPaused(true, false); interrupt(); anim = { name, start: frame - f, s: anim.s }; draw(); },
  };
})();
