/*
 * Pixel Madhav: a small character that lives in the page.
 *
 * - Drawn in code on a 48×56 canvas (no image files), with a light outline so it reads on the dark theme.
 * - Wide screens: roams a click-through layer over the empty right margin (walks the bottom edge,
 *   bounces off the side, climbs the wall, flies a rocket pack). Smaller screens: a strip below the footer.
 * - Comic sound effects are short HTML bubbles, shown now and then, never flashing.
 * - Starts paused for people who prefer reduced motion. Pause and Hide are remembered.
 *
 * Behaviours (what it does and where it goes) live in BEHAVIOURS; poses and frames live in ANIMS.
 */
(() => {
  const root = document.querySelector("[data-buddy]");
  if (!root) return;
  const sprite = root.querySelector("[data-buddy-sprite]");
  const canvas = sprite.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const bubble = root.querySelector("[data-buddy-sfx]");
  const pokeBtn = root.querySelector("[data-buddy-poke]");
  const pauseBtn = root.querySelector("[data-buddy-pause]");
  const hideBtn = root.querySelector("[data-buddy-hide]");
  const showBtn = document.querySelector("[data-buddy-show]");
  const controls = root.querySelector(".buddy__controls");

  const W = 48, H = 56, FRAME_MS = 120, HEAD_TOP = 18;
  const off = document.createElement("canvas");
  off.width = W; off.height = H;
  const g = off.getContext("2d");

  // Colours. Change skin/shirt/etc. here.
  const P = {
    outline: [244, 244, 242],
    hair: "#221a33", hairHi: "#4a3d6b",
    skin: "#e2a67e", skinShade: "#bf8159",
    white: "#ffffff", eye: "#1b1530", mouth: "#6b1d2a", tongue: "#ff6f86", blush: "#ff8fab",
    shirt: "#3b7ddd", shirtShade: "#2b5fae",
    shorts: "#283553", sock: "#ffffff", shoe: "#ff4b4b", sole: "#f4f4f2",
    red: "#ff4b4b", yellow: "#ffd23f", ball: "#d9f23a", cyan: "#5fd3ff", pink: "#ff7ac2",
    green: "#4cd964", brown: "#7a4a2a", metal: "#b8c0cc", dark: "#2b2b3a", grey: "#6b7280",
  };

  // ---------- Drawing helpers (on the offscreen canvas) ----------
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
    note: ["0110", "0101", "0100", "1100", "1100"],
    z: ["111", "001", "010", "100", "111"],
    heart: ["01010", "11111", "11111", "01110", "00100"],
    star: ["010", "111", "010"],
    bulb: ["01110", "11111", "11111", "11111", "01110", "00100"],
  };

  // ---------- The character ----------
  // Hand positions are top-left of a 2×2 block, in "standing" coordinates; bob is added automatically.
  function arm(sx, sy, hx, hy) {
    line(sx, sy, hx, hy, (x, y, t) => rect(x, y, 2, 2, t < 0.4 ? P.shirt : P.skin));
    rect(hx, hy, 2, 2, P.skin);
  }

  function eyes(type, hy, look) {
    for (const e of [19, 26]) {
      if (type === "happy") { px(e, hy + 8, P.eye); px(e + 1, hy + 7, P.eye); px(e + 2, hy + 8, P.eye); }
      else if (type === "closed") rect(e, hy + 8, 3, 1, P.eye);
      else if (type === "sleepy") { rect(e, hy + 7, 3, 1, P.eye); rect(e, hy + 8, 3, 1, P.white); }
      else if (type === "wide") { rect(e, hy + 5, 3, 4, P.white); px(e + 1, hy + 7, P.eye); }
      else if (type === "dizzy") { px(e, hy + 6, P.eye); px(e + 2, hy + 6, P.eye); px(e + 1, hy + 7, P.eye); px(e, hy + 8, P.eye); px(e + 2, hy + 8, P.eye); }
      else if (type === "star") glyph(GLYPHS.star, e, hy + 6, P.yellow);
      else if (type === "heart") { px(e, hy + 6, P.pink); px(e + 2, hy + 6, P.pink); rect(e, hy + 7, 3, 1, P.pink); px(e + 1, hy + 8, P.pink); }
      else {
        rect(e, hy + 6, 3, 3, P.white);
        const lx = look.x < -0.35 ? 0 : look.x > 0.35 ? 2 : 1;
        const ly = look.y < -0.35 ? 0 : 1;
        rect(e + lx, hy + 6 + ly, 1, 2, P.eye);
        if (type === "determined") rect(e, hy + 5, 3, 1, P.eye);
      }
    }
  }

  function mouth(type, hy) {
    const y = hy + 10;
    if (type === "grin") { rect(22, y, 4, 2, P.mouth); rect(22, y, 4, 1, P.white); }
    else if (type === "open") { rect(22, y, 4, 3, P.mouth); rect(23, y + 2, 2, 1, P.tongue); }
    else if (type === "o") rect(23, y, 2, 2, P.mouth);
    else if (type === "flat") rect(22, y + 1, 4, 1, P.mouth);
    else if (type === "wavy") { px(22, y + 1, P.mouth); px(23, y, P.mouth); px(24, y + 1, P.mouth); px(25, y, P.mouth); }
    else if (type === "grit") { rect(21, y, 6, 2, P.mouth); rect(22, y, 4, 2, P.white); px(24, y, P.mouth); px(24, y + 1, P.mouth); }
    else if (type === "tongue") { px(22, y, P.mouth); rect(23, y + 1, 2, 1, P.mouth); px(25, y, P.mouth); px(24, y + 2, P.tongue); }
    else { px(22, y, P.mouth); rect(23, y + 1, 2, 1, P.mouth); px(25, y, P.mouth); }
  }

  function body(o = {}) {
    const b = o.bob || 0;
    const look = o.look || { x: 0, y: 0 };
    const hy = HEAD_TOP + b, ty = 34 + b;
    const lh = o.lh || [14, 40], rh = o.rh || [32, 40];
    const liftL = o.lift === "L" ? 2 : 0, liftR = o.lift === "R" ? 2 : 0;

    // rocket pack (behind everything)
    if (o.pack) {
      for (const tx of [13, 32]) {
        rect(tx, ty + 1, 3, 8, P.metal); rect(tx, ty, 3, 1, P.red); rect(tx, ty + 9, 3, 1, P.dark);
        if (o.flame != null) {
          const len = 5 + (o.flame % 3);
          for (let i = 0; i < len; i++) {
            const narrow = i >= len - 2;
            rect(tx + (narrow ? 1 : 0), ty + 10 + i, narrow ? 1 : 3, 1, i < 2 ? "#fff3b0" : i < 4 ? "#ffb02e" : "#ff5a36");
          }
        }
      }
    }
    // legs, socks, shoes
    rect(19, 46, 3, 4 - liftL, P.skin); rect(19, 50 - liftL, 3, 1, P.sock);
    rect(18, 51 - liftL, 5, 1, P.shoe); rect(18, 52 - liftL, 5, 1, P.sole);
    rect(26, 46, 3, 4 - liftR, P.skin); rect(26, 50 - liftR, 3, 1, P.sock);
    rect(25, 51 - liftR, 5, 1, P.shoe); rect(25, 52 - liftR, 5, 1, P.sole);
    // shorts and shirt
    rect(18, b < 0 ? 42 : 43, 12, b < 0 ? 4 : 3, P.shorts);
    rect(18, ty, 12, 9, P.shirt); rect(18, ty + 8, 12, 1, P.shirtShade);
    rect(22, ty, 4, 1, P.skinShade);
    glyph(["10001", "11011", "10101"], 21, ty + 3, P.white); // a tiny "M" on the shirt
    // head
    rect(17, hy, 14, 1, P.hair); rect(16, hy + 1, 16, 4, P.hair);
    px(18, hy - 1, P.hair); px(22, hy - 1, P.hair); px(23, hy - 2, P.hair); px(27, hy - 1, P.hair);
    rect(20, hy + 1, 4, 1, P.hairHi); px(26, hy + 2, P.hairHi);
    rect(17, hy + 4, 14, 9, P.skin); rect(18, hy + 13, 12, 1, P.skin); rect(19, hy + 14, 10, 1, P.skinShade);
    rect(17, hy + 4, 3, 1, P.hair); rect(22, hy + 4, 3, 1, P.hair); rect(28, hy + 4, 3, 1, P.hair);
    rect(16, hy + 5, 1, 3, P.hair); rect(31, hy + 5, 1, 3, P.hair);
    rect(16, hy + 8, 1, 4, P.skin); rect(31, hy + 8, 1, 4, P.skin);
    rect(15, hy + 8, 1, 3, P.skin); rect(32, hy + 8, 1, 3, P.skin);
    px(15, hy + 9, P.skinShade); px(32, hy + 9, P.skinShade);
    eyes(o.eyes || "normal", hy, look);
    if (o.blush) { rect(17, hy + 9, 2, 1, P.blush); rect(29, hy + 9, 2, 1, P.blush); }
    mouth(o.mouth || "smile", hy);
    if (o.under) o.under(b);
    arm(16, ty + 1, lh[0], lh[1] + b);
    arm(30, ty + 1, rh[0], rh[1] + b);
    if (o.over) o.over(b);
  }

  // ---------- Props ----------
  function racket(hx, hy, deg) {
    const a = (deg * Math.PI) / 180, gx = hx + 0.5, gy = hy + 0.5;
    for (let d = 1; d <= 5; d++) px(Math.round(gx + d * Math.cos(a)), Math.round(gy + d * Math.sin(a)), P.dark);
    const cx = gx + 10 * Math.cos(a), cy = gy + 10 * Math.sin(a);
    for (let dx = -3; dx <= 3; dx++) for (let dy = -3; dy <= 3; dy++)
      if (dx * dx + dy * dy <= 10) px(Math.round(cx + dx), Math.round(cy + dy), (dx + dy) % 2 ? "#cfd8e3" : P.white);
    for (let t = 0; t < 32; t++) {
      const th = (t / 32) * Math.PI * 2;
      px(Math.round(cx + 4 * Math.cos(th)), Math.round(cy + 4 * Math.sin(th)), P.red);
    }
  }
  function tennisBall(x, y, c = P.ball) { rect(x, y, 3, 3, c); px(x, y, P.white); }
  function dumbbell(hx, hy) {
    rect(hx - 2, hy - 1, 2, 4, P.dark); rect(hx + 2, hy - 1, 2, 4, P.dark);
    px(hx - 2, hy, P.red); px(hx + 3, hy, P.red);
  }
  function apple(x, y) { px(x + 2, y, P.brown); rect(x + 3, y, 2, 1, P.green); rect(x, y + 1, 5, 4, P.red); px(x + 1, y + 2, "#ff9a9a"); }
  function piano(pl, pr) {
    rect(5, 41, 38, 7, P.red); rect(6, 42, 36, 3, P.white);
    for (let x = 8; x < 42; x += 3) px(x, 44, "#cfd8e3");
    [9, 12, 18, 21, 24, 30, 33, 39].forEach((x) => rect(x, 42, 1, 2, P.dark));
    if (pl) rect(pl, 43, 2, 2, P.cyan);
    if (pr) rect(pr, 43, 2, 2, P.pink);
    rect(8, 48, 2, 6, P.dark); rect(38, 48, 2, 6, P.dark);
  }
  function phone(f, b) {
    rect(20, 36 + b, 8, 9, P.dark);
    const cols = [P.pink, P.cyan, P.yellow, P.green];
    for (let i = 0; i < 6; i++) rect(21 + (i % 3) * 2, 37 + b + Math.floor(i / 3) * 3, 2, 3, cols[(i + f) % 4]);
  }

  // ---------- Animations (poses per frame) ----------
  // Each returns nothing; `s` carries live info like where the cursor is (s.look).
  // events: { frameNumber: ["TEXT", tone] } shows a comic bubble once when that frame is reached.
  const ANIMS = {
    idle: { draw: (f, s) => body({ eyes: f % 34 >= 32 ? "closed" : "normal", look: s.look }) },

    walk: {
      draw(f, s) {
        const k = f % 4;
        body({ lift: k === 1 ? "L" : k === 3 ? "R" : null, bob: k % 2 ? -1 : 0, look: s.look,
          lh: [14, k === 1 ? 38 : k === 3 ? 41 : 40], rh: [32, k === 3 ? 38 : k === 1 ? 41 : 40] });
      },
    },

    squash: { draw: () => body({ bob: 2, eyes: "happy", mouth: "grin", lh: [13, 42], rh: [33, 42] }) },
    jump: { draw: () => body({ bob: -1, eyes: "happy", mouth: "open", blush: true, lh: [12, 30], rh: [34, 30], lift: "L" }) },

    tennis: {
      events: { 4: ["POW!"], 20: ["THWACK!"] },
      draw(f) {
        const k = f % 8;
        const hands = [[32, 38], [33, 39], [34, 41], [34, 42], [33, 35], [30, 32], [26, 30], [32, 38]];
        const angles = [-70, -40, 10, 35, -40, -100, -150, -80];
        const balls = [[45, 22], [43, 26], [42, 30], [41, 29], [41, 26], [44, 21], [46, 16], null];
        const rh = hands[k];
        body({
          rh, eyes: k === 2 || k === 3 ? "determined" : k === 4 ? "wide" : k >= 5 ? "happy" : "normal",
          look: { x: 1, y: -0.2 }, mouth: k === 4 ? "grit" : k >= 5 ? "grin" : "smile",
          under: (b) => racket(rh[0], rh[1] + b, angles[k]),
        });
        if (balls[k]) tennisBall(balls[k][0], balls[k][1]);
        if (k === 4) { px(45, 25, P.white); px(46, 23, P.yellow); px(44, 31, P.yellow); px(46, 29, P.white); }
      },
    },

    piano: {
      events: { 6: ["PLINK!", "pink"], 22: ["LA LA LA!", "pink"] },
      draw(f) {
        const left = f % 2 === 0;
        const lx = [16, 19, 14, 18][f % 4], rx = [28, 31, 27, 30][(f + 1) % 4];
        body({ lh: [lx, left ? 38 : 37], rh: [rx, left ? 37 : 38], bob: f % 4 < 2 ? 0 : 1,
          eyes: f % 8 < 4 ? "closed" : "happy", mouth: f % 6 < 3 ? "o" : "smile", blush: true,
          over: () => piano(lx, rx) });
        const cols = [P.pink, P.cyan, P.yellow];
        for (let i = 0; i < 3; i++) {
          const t = (f + i * 5) % 15;
          glyph(GLYPHS.note, 36 + (i % 2) * 5, 34 - t * 2, cols[i]);
        }
      },
    },

    gym: {
      events: { 4: ["HNNG!", "cool"], 20: ["+1 STRENGTH", "cool"] },
      draw(f) {
        const k = f % 8;
        const ys = [41, 37, 31, 24, 22, 22, 31, 37];
        const y = ys[k], up = y <= 24;
        const lh = [up ? 15 : 14, y], rh = [up ? 31 : 32, y];
        body({ lh, rh, eyes: up ? "closed" : "determined", mouth: up ? "grit" : "flat", look: { x: 0, y: -1 },
          over: (b) => { dumbbell(lh[0], lh[1] + b); dumbbell(rh[0], rh[1] + b); } });
        if (up) { px(34, 22 + (k % 2), P.cyan); px(34, 23 + (k % 2), P.cyan); px(13, 25 - (k % 2), P.cyan); }
      },
    },

    nap: {
      events: { 3: ["YAWWWN…", "white"], 16: ["Zzz…", "white"], 40: ["Zzz…", "white"], 54: ["HUH?!"] },
      draw(f) {
        if (f < 12) {
          const ys = [41, 36, 29, 22, 20, 20, 20, 20, 22, 29, 36, 41];
          const up = ys[f] <= 22;
          body({ lh: [up ? 13 : 14, ys[f]], rh: [up ? 33 : 32, ys[f]], eyes: f >= 3 && f < 10 ? "closed" : "sleepy",
            mouth: f >= 3 && f < 9 ? "open" : "o" });
          return;
        }
        if (f >= 52) { body({ eyes: "wide", mouth: "o", lh: [12, 34], rh: [34, 34], bob: -1 }); return; }
        const s = f - 12;
        body({ eyes: "closed", mouth: "o", bob: s % 10 < 5 ? 0 : 1 });
        const r = s % 8 < 4 ? 1 : 2; // snot bubble, the classic
        rect(28, 27 - r, r + 1, r + 1, P.cyan);
        glyph(GLYPHS.z, 34, 16 - (s % 8), "#9fc9ff");
        if (s % 16 >= 6) glyph(GLYPHS.z, 39, 12 - ((s - 6) % 8), "#cfe3ff");
      },
    },

    gif: {
      events: { 10: ["GIF!", "pink"] },
      draw(f) {
        const typing = f < 10;
        body({
          lh: [19, typing && f % 2 ? 41 : 40], rh: [27, typing && f % 2 === 0 ? 41 : 40],
          look: { x: 0, y: 1 }, eyes: typing ? "normal" : "happy", mouth: typing ? "tongue" : "grin", blush: !typing,
          over: (b) => phone(f, b),
        });
        if (f >= 11 && f < 22) glyph(GLYPHS.heart, 34, 30 - (f - 11) * 2, P.pink);
      },
    },

    apple: {
      events: { 5: ["BONK!"], 17: ["AHA!"] },
      draw(f) {
        const fall = [-8, -4, 0, 5, 10, 13];
        const bounce = [[28, 9], [33, 8], [37, 13], [40, 22], [41, 33], [42, 48]];
        const dizzy = f >= 5 && f <= 12;
        const idea = f >= 17;
        body({
          eyes: dizzy ? "dizzy" : f >= 13 && f < 17 ? "normal" : idea ? "happy" : "normal",
          look: { x: f >= 13 && f < 17 ? 1 : 0, y: f < 5 ? -1 : 0.5 },
          mouth: dizzy ? "wavy" : idea ? "grin" : "flat", bob: f === 5 ? 1 : 0, blush: idea,
          rh: idea ? [33, 22] : undefined,
        });
        if (f < 6) apple(21, fall[f]);
        else if (f < 12) apple(...bounce[f - 6]);
        else apple(42, 48);
        if (dizzy) for (let i = 0; i < 3; i++) {
          const th = ((f * 0.9) + i * 2.1);
          glyph(GLYPHS.star, Math.round(23 + 10 * Math.cos(th)), Math.round(15 + 2 * Math.sin(th)), P.yellow);
        }
        if (idea) {
          glyph(GLYPHS.bulb, 21, 4, P.yellow); rect(22, 10, 3, 1, P.grey);
          if (f % 2) { px(19, 3, P.yellow); px(27, 3, P.yellow); px(18, 7, P.yellow); px(28, 7, P.yellow); }
        }
      },
    },

    juggle: {
      draw(f) {
        body({ lh: [14, f % 2 ? 36 : 38], rh: [32, f % 2 ? 38 : 36], eyes: "normal", look: { x: Math.cos(f / 2), y: -1 }, mouth: "o" });
        const cols = [P.ball, P.pink, P.cyan];
        for (let i = 0; i < 3; i++) {
          const th = (((f + i * 4) % 12) / 12) * Math.PI * 2;
          tennisBall(Math.round(22 + 12 * Math.cos(th)), Math.round(22 + 9 * Math.sin(th)), cols[i]);
        }
      },
    },

    wave: { draw: (f) => body({ rh: f % 4 < 2 ? [33, 22] : [35, 25], eyes: "happy", mouth: "grin", blush: true }) },
    dizzy: { draw: (f) => body({ eyes: "dizzy", mouth: "wavy", bob: f % 4 < 2 ? 0 : 1 }) },
    whoa: { draw: () => body({ eyes: "wide", mouth: "o", lh: [12, 32], rh: [34, 32] }) },
    love: { draw: (f) => body({ eyes: "heart", mouth: "grin", blush: true, bob: f % 4 < 2 ? 0 : -1 }) },

    climb: {
      draw(f) {
        const k = f % 4 < 2;
        body({ lh: [14, k ? 22 : 28], rh: [32, k ? 28 : 22], lift: k ? "L" : "R", eyes: "determined", look: { x: 0.5, y: -1 }, mouth: "flat" });
      },
    },
    slide: { draw: (f) => body({ lh: [12, 22], rh: [34, 22], eyes: "star", mouth: "open", blush: true, lift: f % 2 ? "L" : "R" }) },
    rocket: { draw: (f, s) => body({ pack: true, flame: f, lh: [12, 37], rh: [34, 37], eyes: s.landing ? "happy" : "star", mouth: "open", blush: true, lift: "L" }) },
    pack: { draw: () => body({ pack: true, lh: [13, 40], rh: [33, 40], eyes: "determined", mouth: "grin" }) },
  };

  // ---------- Composite: outline + soft shadow ----------
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
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(16, 54, 16, 1); ctx.fillRect(18, 55, 12, 1);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  // ---------- State ----------
  const CANCEL = Symbol("cancel");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const roamQuery = window.matchMedia("(min-width: 1240px)");
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } },
  };

  let paused = store.get("buddy-paused") === null ? reduceMotion.matches : store.get("buddy-paused") === "1";
  let hidden = store.get("buddy-hidden") === "1";
  let visible = !document.hidden, inView = true;
  let scale = 3, sw = W * 3, sh = H * 3, bw = 0, bh = 0, roam = false;
  let x = 0, y = 0, placed = false;
  let anim = { name: "idle", start: 0, s: { look: { x: 0, y: 0 } } };
  let frame = 0, frameAcc = 0, now = 0, last = 0, raf = null;
  let timers = [], motion = null, gen = 0;
  let mouse = null, lastSay = -1e9, bubbleTimer = null;
  let lastBehaviour = null, hiddenAt = 0;

  // ---------- Layout ----------
  const floorY = () => Math.max(0, bh - sh - (roam ? 6 : 2));
  const maxX = () => Math.max(0, bw - sw);
  const minY = () => (roam ? controls.offsetTop + controls.offsetHeight + 8 : 0);

  function layout() {
    roam = roamQuery.matches;
    const r = root.getBoundingClientRect();
    bw = r.width; bh = r.height;
    scale = roam ? (bw >= W * 3 + 8 ? 3 : 2) : window.innerWidth >= 600 ? 3 : 2;
    sw = W * scale; sh = H * scale;
    canvas.style.width = sw + "px"; canvas.style.height = sh + "px";
    bubble.style.bottom = sh - HEAD_TOP * scale + 6 + "px";
    if (!placed) { x = maxX() * (roam ? 0.5 : 0.85); y = floorY(); placed = true; }
    x = Math.min(Math.max(0, x), maxX());
    y = Math.min(Math.max(minY(), y), floorY());
    if (!motion) y = floorY();
    place();
  }
  const place = () => { sprite.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`; };

  // ---------- Speech bubbles ----------
  function say(text, tone, force) {
    if (!force && now - lastSay < 2500) return;
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
    if (mouse && roam) {
      const r = sprite.getBoundingClientRect();
      const dx = mouse.x - (r.left + r.width / 2), dy = mouse.y - (r.top + r.height * 0.45);
      const len = Math.hypot(dx, dy) || 1;
      anim.s.look = { x: dx / len, y: dy / len };
    }
    g.clearRect(0, 0, W, H);
    def.draw(f, anim.s);
    composite(y >= floorY() - 1);
    if (def.events && def.events[f] && !paused) say(...def.events[f]);
  }

  // ---------- Clock: timers and movement only advance while running ----------
  const running = () => !paused && !hidden && visible && inView;
  function wait(ms) { return new Promise((res, rej) => timers.push({ at: now + ms, res, rej })); }
  function move(tx, ty, speed, arc = 0) {
    tx = Math.min(Math.max(0, tx), maxX());
    ty = Math.min(Math.max(minY(), ty), floorY());
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
      place();
      if (p >= 1) { const m = motion; motion = null; m.res(); }
    }
    frameAcc += dt;
    if (frameAcc >= FRAME_MS) { frameAcc %= FRAME_MS; frame++; draw(); }
    raf = requestAnimationFrame(loop);
  }
  function kick() {
    if (running() && raf === null) { last = 0; raf = requestAnimationFrame(loop); }
  }

  // ---------- Behaviours ----------
  const rand = (a, b) => a + Math.random() * (b - a);
  const k = () => scale / 3;
  async function walkTo(tx) {
    anim.s.look = { x: tx > x ? 1 : -1, y: 0 };
    setAnim("walk", { look: { x: tx > x ? 1 : -1, y: 0 } });
    await move(tx, floorY(), 75 * k());
  }
  async function activity(name, frames) { setAnim(name); await wait(frames * FRAME_MS); }

  const BEHAVIOURS = {
    stroll: { weight: 3, run: async () => { await walkTo(rand(0, maxX())); } },
    bounce: {
      weight: 2,
      async run() {
        const right = Math.random() < 0.6, edge = right ? maxX() : 0;
        await walkTo(edge);
        setAnim("squash"); say("BOING!", null, true);
        await wait(220);
        setAnim("jump");
        await move(edge + (right ? -1 : 1) * Math.min(90 * k(), maxX() / 2), floorY(), 200 * k(), 40 * k());
        setAnim("squash"); await wait(160);
      },
    },
    tennis: { weight: 2, run: () => activity("tennis", 24) },
    piano: { weight: 2, run: () => activity("piano", 32) },
    gym: { weight: 2, run: () => activity("gym", 24) },
    nap: { weight: 1, run: () => activity("nap", 58) },
    gif: { weight: 2, run: () => activity("gif", 24) },
    apple: { weight: 1, run: () => activity("apple", 28) },
    juggle: { weight: 1, run: () => activity("juggle", 24) },
    rocket: {
      weight: 1.5,
      async run() {
        setAnim("pack"); await wait(500);
        setAnim("rocket"); say("WHOOSH!", "cool", true);
        const top = roam ? rand(minY(), Math.max(minY(), floorY() - bh * 0.4)) : Math.max(0, floorY() - 24);
        await move(roam ? rand(0, maxX()) : x, top, 160 * k());
        await wait(roam ? 900 : 300);
        setAnim("rocket", { landing: true });
        await move(x, floorY(), 70 * k());
        setAnim("squash"); say("TA-DA!", null, true); await wait(700);
      },
    },
    climb: {
      weight: 1.5, roamOnly: true,
      async run() {
        await walkTo(maxX());
        setAnim("climb");
        await move(maxX(), Math.max(minY(), floorY() - rand(0.3, 0.6) * bh), 45 * k());
        setAnim("whoa"); await wait(500);
        setAnim("slide"); say("WHEEE!", "cool", true);
        await move(maxX(), floorY(), 240 * k());
        setAnim("squash"); await wait(240);
      },
    },
  };

  function pick() {
    const names = Object.keys(BEHAVIOURS).filter((n) => n !== lastBehaviour && (roam || !BEHAVIOURS[n].roamOnly));
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
        const name = pick();
        lastBehaviour = name;
        await BEHAVIOURS[name].run();
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
    if (pokes.length >= 4) { pokes = []; react("dizzy", "OKAY, OKAY!", null, 1600); return; }
    if (pokes.length === 3) { react("love", "HEHE!", "pink"); return; }
    const hi = ["HI!", "HEY!", "YO!", "HELLO!"];
    react("wave", hi[Math.floor(Math.random() * hi.length)]);
  });

  function setPaused(value, remember) {
    paused = value;
    pauseBtn.firstChild.textContent = paused ? "Play" : "Pause";
    if (remember) store.set("buddy-paused", paused ? "1" : "0");
    if (paused) { bubble.classList.remove("is-on"); setAnim(anim.name === "walk" ? "idle" : anim.name); }
    kick();
  }
  pauseBtn.addEventListener("click", () => setPaused(!paused, true));

  function setHidden(value) {
    hidden = value;
    store.set("buddy-hidden", hidden ? "1" : "0");
    root.hidden = hidden;
    if (showBtn) showBtn.hidden = !hidden;
    if (!hidden) { layout(); kick(); pokeBtn.focus(); }
    else if (showBtn) showBtn.focus();
  }
  hideBtn.addEventListener("click", () => setHidden(true));
  if (showBtn) showBtn.addEventListener("click", () => setHidden(false));

  // Reacting to the page: fast scrolling, reaching the end, coming back to the tab, the cursor nearby.
  let lastScroll = { y: window.scrollY, t: performance.now() }, lastWhoa = -1e9, saidEnd = false, lastHey = -1e9;
  window.addEventListener("scroll", () => {
    const t = performance.now(), sy = window.scrollY;
    const speed = Math.abs(sy - lastScroll.y) / Math.max(1, t - lastScroll.t) * 1000;
    lastScroll = { y: sy, t };
    if (!running()) return;
    if (speed > 3000 && t - lastWhoa > 25000 && !motion) { lastWhoa = t; react("whoa", "WHOA!", "cool", 1100); }
    else if (!saidEnd && sy + window.innerHeight >= document.documentElement.scrollHeight - 4 && sy > 200) {
      saidEnd = true; react("wave", "THE END!", "white", 1300);
    }
  }, { passive: true });

  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mouse = { x: e.clientX, y: e.clientY };
    if (!roam || !running() || motion) return;
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
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => { inView = roam || entries[0].isIntersecting; kick(); }).observe(root);
  }
  let resizeTimer = null;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); });
  roamQuery.addEventListener?.("change", () => { interrupt(); placed = false; layout(); brain(); kick(); });
  reduceMotion.addEventListener?.("change", (e) => { if (store.get("buddy-paused") === null) setPaused(e.matches, false); });

  // ---------- Start ----------
  if (showBtn) showBtn.hidden = !hidden;
  root.hidden = hidden;
  layout();
  setPaused(paused, false);
  setAnim("idle");
  brain();
  kick();

  // For previewing from the console: buddy.do("rocket"), buddy.pose("apple", 20)
  window.buddy = {
    behaviours: Object.keys(BEHAVIOURS),
    poses: Object.keys(ANIMS),
    do(name) {
      if (!BEHAVIOURS[name]) return;
      interrupt();
      const mine = gen;
      BEHAVIOURS[name].run().then(() => { if (mine === gen) brain(); }, (e) => { if (e !== CANCEL) throw e; });
      kick();
    },
    pose(name, f = 0) { if (!ANIMS[name]) return; setPaused(true, false); interrupt(); anim = { name, start: frame - f, s: anim.s }; draw(); },
  };
})();
