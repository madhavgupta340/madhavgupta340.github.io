/*
 * Pixel Madhav: a tiny companion drawn on a 32×28 canvas.
 * Every activity is a function that draws one frame. Add your own to ACTS.
 * It pauses when the tab is hidden or it's scrolled out of view, starts paused
 * for people who prefer reduced motion, and remembers the Pause/Play choice.
 */
(() => {
  const root = document.querySelector("[data-buddy]");
  if (!root) return;
  const canvas = root.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const figure = root.querySelector("[data-buddy-next]");
  const toggle = root.querySelector("[data-buddy-toggle]");
  const toggleLabel = root.querySelector("[data-buddy-toggle-label]");

  const W = 32, H = 28, FRAME_MS = 150;
  const C = {
    ink: "#141414", skin: "#d9d6d0", shirt: "#3c3c3c", pants: "#1f1f1f",
    mid: "#8a8a8a", light: "#c4c4c0", paper: "#ffffff", shadow: "#e6e6e2",
    apple: "#5a5a5a", ball: "#cfdc3c", bulb: "#f0cf45",
  };

  // ---------- Drawing helpers ----------
  const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  const px = (x, y, c) => rect(x, y, 1, 1, c);
  const glyph = (rows, x, y, c) =>
    rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === "1") px(x + i, y + j, c); }));

  function line(x0, y0, x1, y1, each) {
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
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

  const FONT = {
    G: ["111", "100", "101", "101", "111"],
    I: ["111", "010", "010", "010", "111"],
    F: ["111", "100", "110", "100", "100"],
    Z: ["111", "010", "111"],
    BIGZ: ["1111", "0010", "0100", "1111"],
    NOTE: ["011", "010", "010", "110"],
    BANG: ["1", "1", "1", "0", "1"],
  };

  // ---------- The character ----------
  // Hands are given as the top-left of a 2×2 block. Shoulders are at (11,12) and (19,12).
  function arm(sx, sy, hx, hy) {
    line(sx, sy, hx, hy, (x, y, t) => rect(x, y, 2, 2, t < 0.45 ? C.shirt : C.skin));
    rect(hx, hy, 2, 2, C.skin);
  }

  function body(o = {}) {
    const b = o.bob || 0;
    const lh = o.lh || [11, 16];
    const rh = o.rh || [19, 16];

    rect(11, 26, 10, 1, C.shadow);
    // legs and shoes
    rect(13, 18, 6, 2, C.pants);
    rect(13, 20, 2, 5, C.pants);
    rect(17, 20, 2, 5, C.pants);
    rect(12, 25, 3, 1, C.ink);
    rect(17, 25, 3, 1, C.ink);
    // torso
    rect(13, 12, 6, 6, C.shirt);
    // head
    rect(13, 5 + b, 6, 2, C.ink);
    rect(12, 6 + b, 1, 3, C.ink);
    rect(19, 6 + b, 1, 3, C.ink);
    rect(13, 7 + b, 6, 4, C.skin);
    rect(12, 9 + b, 1, 2, C.ink);
    rect(19, 9 + b, 1, 2, C.ink);
    rect(13, 11 + b, 6, 1, C.ink);
    // eyes
    const eyes = o.eyes || "open";
    if (eyes === "closed") { px(14, 9 + b, C.ink); px(17, 9 + b, C.ink); }
    else if (eyes === "wide") { rect(14, 7 + b, 1, 3, C.ink); rect(17, 7 + b, 1, 3, C.ink); }
    else if (eyes === "right") { rect(15, 8 + b, 1, 2, C.ink); rect(18, 8 + b, 1, 2, C.ink); }
    else { rect(14, 8 + b, 1, 2, C.ink); rect(17, 8 + b, 1, 2, C.ink); }
    // mouth
    const mouth = o.mouth || "smile";
    if (mouth === "open") rect(15, 10 + b, 2, 2, C.ink);
    else if (mouth === "grin") { rect(15, 10 + b, 2, 1, C.ink); px(14, 10 + b, C.mid); px(17, 10 + b, C.mid); }
    else if (mouth === "flat") rect(15, 10 + b, 2, 1, C.mid);
    else { px(15, 10 + b, C.mid); px(16, 10 + b, C.mid); }

    if (o.under) o.under();
    arm(11, 12, lh[0], lh[1]);
    arm(19, 12, rh[0], rh[1]);
    if (o.over) o.over();
  }

  // ---------- Props ----------
  function racket(hx, hy, deg) {
    const a = (deg * Math.PI) / 180, gx = hx + 0.5, gy = hy + 0.5;
    for (let d = 1; d <= 4; d++) px(Math.round(gx + d * Math.cos(a)), Math.round(gy + d * Math.sin(a)), C.ink);
    const cx = gx + 7 * Math.cos(a), cy = gy + 7 * Math.sin(a);
    for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++)
      if (dx * dx + dy * dy <= 4) px(Math.round(cx + dx), Math.round(cy + dy), (dx + dy) % 2 ? C.light : C.paper);
    for (let t = 0; t < 24; t++) {
      const th = (t / 24) * Math.PI * 2;
      px(Math.round(cx + 2.8 * Math.cos(th)), Math.round(cy + 2.8 * Math.sin(th)), C.ink);
    }
  }
  const ball = (x, y) => rect(x, y, 2, 2, C.ball);
  function dumbbell(hx, hy) { rect(hx - 1, hy - 1, 1, 4, C.ink); rect(hx + 2, hy - 1, 1, 4, C.ink); }
  function apple(x, y) { px(x + 1, y, C.ink); px(x + 2, y, C.mid); rect(x, y + 1, 3, 3, C.apple); }
  function keyboard(pressL, pressR) {
    rect(6, 17, 20, 4, C.paper);
    rect(6, 17, 20, 1, C.ink); rect(6, 20, 20, 1, C.ink);
    rect(6, 17, 1, 4, C.ink); rect(25, 17, 1, 4, C.ink);
    for (let x = 8; x < 25; x += 2) px(x, 19, C.light);
    [8, 10, 14, 16, 18, 22].forEach((x) => px(x, 18, C.ink));
    if (pressL) px(11, 19, C.mid);
    if (pressR) px(21, 19, C.mid);
    rect(7, 21, 1, 5, C.ink); rect(24, 21, 1, 5, C.ink);
  }
  function bubble(letters) {
    rect(19, 0, 13, 7, C.paper);
    rect(19, 0, 13, 1, C.ink); rect(19, 6, 13, 1, C.ink);
    rect(19, 0, 1, 7, C.ink); rect(31, 0, 1, 7, C.ink);
    px(20, 7, C.ink);
    [FONT.G, FONT.I, FONT.F].slice(0, letters).forEach((g, i) => glyph(g, 20 + i * 4, 1, C.ink));
  }

  // ---------- Activities ----------
  // len: frames per loop, loops: how many times it repeats, label: used in the accessible name.
  const ACTS = {
    idle: {
      label: "hanging out", len: 30, loops: 1,
      draw: (f) => body({ eyes: f >= 27 ? "closed" : f >= 14 && f < 20 ? "right" : "open" }),
    },

    tennis: {
      label: "playing tennis", len: 8, loops: 3,
      draw(f) {
        const hands = [[20, 14], [20, 15], [21, 15], [21, 16], [20, 13], [18, 12], [16, 11], [19, 14]];
        const angles = [-60, -30, 10, 30, -45, -110, -150, -90];
        const balls = [[30, 6], [28, 9], [27, 12], [27, 10], [27, 7], [29, 5], [31, 3], null];
        const rh = hands[f];
        body({ rh, mouth: f === 4 ? "flat" : "smile", under: () => racket(rh[0], rh[1], angles[f]) });
        if (balls[f]) ball(balls[f][0], balls[f][1]);
      },
    },

    piano: {
      label: "playing piano", len: 8, loops: 4,
      draw(f) {
        const left = f % 2 === 0;
        body({
          lh: [10, left ? 16 : 15], rh: [20, left ? 15 : 16],
          bob: f % 4 < 2 ? 0 : 1, eyes: f % 8 < 4 ? "closed" : "open",
          over: () => keyboard(left, !left),
        });
        for (let i = 0; i < 2; i++) {
          const t = (f + i * 4) % 8;
          glyph(FONT.NOTE, 22 + i * 5, 12 - t, i ? C.mid : C.ink);
        }
      },
    },

    gym: {
      label: "lifting weights", len: 8, loops: 3,
      draw(f) {
        const ys = [16, 12, 8, 3, 3, 3, 8, 12];
        const y = ys[f], up = y === 3;
        const lh = [up ? 10 : 11, y], rh = [up ? 20 : 19, y];
        body({ lh, rh, eyes: up ? "closed" : "open", mouth: up ? "flat" : "smile",
          over: () => { dumbbell(lh[0], lh[1]); dumbbell(rh[0], rh[1]); } });
        if (f === 4 || f === 5) { px(21, 7 + (f - 4), C.light); px(21, 8 + (f - 4), C.mid); }
      },
    },

    nap: {
      label: "yawning and taking a nap", len: 34, loops: 1,
      draw(f) {
        if (f < 10) {
          const ys = [16, 13, 8, 3, 3, 3, 3, 8, 13, 16];
          const y = ys[f], up = y === 3;
          body({ lh: [up ? 10 : 11, y], rh: [up ? 20 : 19, y],
            eyes: f >= 3 ? "closed" : "open", mouth: up ? "open" : "smile" });
          return;
        }
        const s = f - 10;
        body({ eyes: "closed", mouth: "flat", bob: s % 8 < 4 ? 0 : 1 });
        glyph(FONT.Z, 22, 6 - (s % 6), C.mid);
        if (s % 12 >= 4) glyph(FONT.BIGZ, 25, 4 - ((s - 4) % 6) / 2 | 0, C.ink);
      },
    },

    gif: {
      label: "replying with a GIF", len: 22, loops: 1,
      draw(f) {
        const typing = f < 8;
        body({
          lh: [13, typing && f % 2 ? 15 : 14], rh: [17, typing && f % 2 === 0 ? 15 : 14],
          mouth: f >= 9 ? "grin" : "smile",
          under: () => {
            rect(14, 13, 4, 5, C.ink);
            rect(15, 14, 2, 3, typing && f % 2 ? C.light : C.mid);
          },
        });
        if (f === 8) { rect(21, 4, 2, 2, C.ink); }
        else if (f > 8 && f < 20) bubble(Math.min(3, f - 8));
      },
    },

    apple: {
      label: "getting bonked by Newton's apple", len: 24, loops: 1,
      draw(f) {
        const fall = [[15, -4], [15, -2], [15, 0], [15, 2]];
        const bounce = [[18, 1], [21, 3], [23, 8], [24, 15], [25, 22]];
        const hit = f >= 4 && f <= 7;
        const idea = f >= 14;
        body({
          eyes: hit ? "wide" : f >= 9 && f < 14 ? "right" : "open",
          mouth: idea ? "grin" : hit ? "open" : "flat",
          bob: f === 4 ? 1 : 0,
          rh: idea ? [20, 6] : undefined,
        });
        if (f < 4) apple(...fall[f]);
        else if (f < 9) apple(...bounce[f - 4]);
        else apple(25, 22);
        if (hit) {
          glyph(FONT.BANG, 22, 0, C.ink);
          const c = f % 2 ? C.light : C.mid;
          px(10, 4, c); px(21, 6, c); px(11, 2, c);
        }
        if (idea) {
          glyph(["010", "111", "111", "010"], 15, 0, C.bulb);
          px(16, 3, C.mid);
          if (f % 2) { px(13, 0, C.light); px(19, 0, C.light); px(13, 3, C.light); px(19, 3, C.light); }
        }
      },
    },

    juggle: {
      label: "juggling tennis balls", len: 12, loops: 3,
      draw(f) {
        body({ lh: [10, f % 2 ? 13 : 15], rh: [20, f % 2 ? 15 : 13], eyes: "wide" });
        for (let i = 0; i < 3; i++) {
          const th = (((f + i * 4) % 12) / 12) * Math.PI * 2;
          ball(Math.round(15 + 6 * Math.cos(th)), Math.round(9 + 6 * Math.sin(th)));
        }
      },
    },

    wave: {
      label: "waving hello", len: 4, loops: 3,
      draw: (f) => body({ rh: f < 2 ? [20, 5] : [21, 7], mouth: "grin" }),
    },
  };

  const PLAYLIST = ["tennis", "piano", "gym", "nap", "gif", "apple", "juggle"];

  // ---------- State ----------
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let stored = null;
  try { stored = localStorage.getItem("buddy-paused"); } catch (e) { /* storage blocked */ }
  let paused = stored === null ? reduceMotion.matches : stored === "1";
  let visible = !document.hidden;
  let inView = true;
  let queue = [];
  let act = "idle", frame = 0, loop = 0, last = null, timer = null;

  function pickNext() {
    if (queue.length) return queue.shift();
    if (act !== "idle") return "idle";
    const options = PLAYLIST.filter((a) => a !== last);
    return options[Math.floor(Math.random() * options.length)];
  }

  function start(name) {
    if (name !== "idle" && name !== "wave") last = name;
    act = name; frame = 0;
    loop = name === "idle" ? -Math.floor(Math.random() * 2) : 0; // idle lasts 1–2 loops
    figure.setAttribute("aria-label", `Pixel Madhav, ${ACTS[name].label}. Click for something new`);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ACTS[act].draw(frame);
  }

  function step() {
    frame++;
    if (frame >= ACTS[act].len) {
      frame = 0;
      loop++;
      if (loop >= ACTS[act].loops) start(pickNext());
    }
    draw();
  }

  function schedule() {
    clearTimeout(timer);
    if (!paused && visible && inView) timer = setTimeout(() => { step(); schedule(); }, FRAME_MS);
  }

  function setPaused(value, remember) {
    paused = value;
    toggleLabel.textContent = paused ? "Play" : "Pause";
    if (remember) { try { localStorage.setItem("buddy-paused", paused ? "1" : "0"); } catch (e) { /* ignore */ } }
    schedule();
  }

  // Clicking shows something new. When paused, show a still frame from it instead of animating.
  figure.addEventListener("click", () => {
    const next = PLAYLIST.filter((a) => a !== last)[Math.floor(Math.random() * (PLAYLIST.length - 1))];
    if (paused) {
      start(next);
      frame = Math.floor(ACTS[next].len / 2);
      draw();
      return;
    }
    queue = [next];
    start("wave");
    draw();
    schedule();
  });
  toggle.addEventListener("click", () => setPaused(!paused, true));

  document.addEventListener("visibilitychange", () => { visible = !document.hidden; schedule(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; schedule(); }).observe(root);
  }
  reduceMotion.addEventListener?.("change", (e) => {
    let saved = null;
    try { saved = localStorage.getItem("buddy-paused"); } catch (err) { /* ignore */ }
    if (saved === null) setPaused(e.matches, false);
  });

  root.hidden = false;
  start("idle");
  draw();
  setPaused(paused, false);

  // For previewing from the browser console: buddy.play("gif"), or buddy.show("tennis", 4) for one still frame.
  window.buddy = {
    activities: Object.keys(ACTS),
    play: (name) => { if (ACTS[name]) { queue = []; start(name); draw(); schedule(); } },
    show: (name, f = 0) => { if (ACTS[name]) { setPaused(true, false); start(name); frame = f % ACTS[name].len; draw(); } },
  };
})();
