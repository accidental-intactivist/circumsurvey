// ═══════════════════════════════════════════════════════════════════════════
// THE UNDERLOOM (LoomChoreography) — the Guided Tour's scroll-choreographed
// background. The masthead has the Harmonic Loom; this is the loom beneath
// the report. It shares the masthead's palette (red→gold→blue spectrum on
// the quiet ribbon) and its glisten (LOOM_CONFIG glint values, imported —
// single source of truth), raking holographic light across every formation.
//
// One fixed, TRANSPARENT canvas behind the whole tour. 64 threads morph
// between named formations as the reader scrolls between stations; the
// theme's own background always shows through (no palette flips mid-scroll —
// the theme engine rules above all).
//
// Formations: quiet ribbon (editorial), harlequin tartan (crossing sett
// bands — the full ribbon loom was retired: too close to the masthead's
// HarmonicCanvas), beam racer (grid floor + light-cycles), glacier flyover
// (wireframe terrain flythrough), moiré + blips (traveling saw-tooth
// packets), pendulum harmonograph (Coral-Records-style nested decaying
// ellipses, slow precession — replaced the chaotic drawing spirograph),
// convergence (+ glisten).
//
// Discipline (see loom-choreography-v2.html draft, workspace root):
//   R1 alpha budget ≤ ~0.35 · R2 morphs only in gutters between stations
//   R3 motion damps to 30% at scroll-rest · R6 prefers-reduced-motion freezes
//   R7 every color resolves through --c-* / --path-* tokens.
// Standalone tuner for all constants: loom-choreography-v2.html (⚙ Tune).
// ═══════════════════════════════════════════════════════════════════════════
import React, { useEffect, useRef } from "react";
import { resolveCssColor } from "../../explore/styles/tokens";
import { LOOM_CONFIG } from "../HarmonicCanvas";

// Region → formation map. Anchors are the tour's own station/chapter ids;
// missing anchors are skipped, and regions are sorted by document position.
const REGIONS = [
  ["#ch-prologue", "tartan"], // researcher's letter
  ["#act-1-mechanics", "canyon"], // lights down — the flight begins here
  ["#sexual-experience-the-pleasure-gap", "canyon"], // pleasure gap
  ["#lubrication-dependency", "canyon"], // lube dependency
  ["#act-2-emotion", "moire"], // transition to emotions
  ["#gratitude-vs-regret", "moire"], // mirror pairs
  ["#the-raw-words", "pulsar"], // narrative mirrors
  ["#act-3-restoration", "pendulum"], // restoration journey
  ["#the-restoring-cohort-in-numbers", "pendulum"], // restoration numbers
  ["#act-4-resolution", "flow"], // convergence
  ["#the-convergence", "flow"], // forward view
  ["#appendix", "quiet"], // sober appendix
  ["#the-survey-architecture", "flow"], // survey architecture
  ["#respondent-census-origins", "tron"], // demographics
  ["#the-generational-faultline", "pendulum"], // culture & generations
  ["#for-new-expectant-parents", "quiet"] // for parents
];

// Tuned in the standalone draft's ⚙ Tune panel; stamp new values from there.
// Exported so the Docent's Bobbin Threadbare easter egg (CopilotChat.jsx)
// can recite the Underloom's pattern alongside the masthead's LOOM_CONFIG.
export const UNDERLOOM_CONFIG = {
  RIB: { waveFreq: 1.5, spread: 1.2, sep: 0.22, speed: 0.3, amp: 0.9 },
  TAR: { angle: 1.1, driftPx: 9.5, breathe: 0.065, alpha: 0.4 },
  TRON: { zN: 1.8, zF: 34, rows: 28, lanes: 30, racers: 6, horizon: 0.27, camY: 1.5, laneW: 1.4, speed: 3.4, gridSpeed: 1.2, trail: 3.5 },
  // CANYON FLIGHT — the original Fractalus terrain, restored by Tone's
  // request (the glacier experiment lost the Separation's drama).
  CAN: { zN: 1.6, zF: 26, horizon: 0.26, camY: 2.2, speed: 0.5, xSpan: 30, wall: 3.1, valley: 0.2 },
  MO: { angle: 0.63, drift: 0.028, blipEvery: 3, blipSpeed: 1, teeth: 2, blipAmp: 0.023, blipWin: 0.02 },
  // TRUE HYPOTROCHOIDS: each figure is the pattern-guide pen trace itself —
  // 21 threads each carry one consecutive arc of the closed curve, and the
  // perpetual pen re-inks it round and round. Gears follow the guide's
  // semantics (ring/wheel teeth → points = wheel/gcd), penHole = d. shape/
  // lobe emulate the tin's non-circular wheels by modulating pen distance.
  // Each figure wears ONE solid strand-group color: red / gold / blue.
  // Defaults from the Ring 105 guide: Sunflower-35, 7-Star, Daisy-7.
  // px/py: each figure's home position (fractions of W/H from center) — set
  // two figures to the same spot to STACK their patterns. mutate = fireworks
  // mode: a figure inks in, holds, dissolves, then rerolls itself into a new
  // random pattern-guide figure at a new spot (figs below seed the first
  // volley). hold = how long a completed figure lingers, in figure-lengths.
  // Seed trio stamped from Tone's screenshot: the three dense 105-point nets.
  // Defaults stamped from Tone's tuning session, 2026-07-09: three big slow
  // hypotrochoids, fireworks OFF (mutate 0) so they sit as tuned.
  PEN: {
    draw: 0.05, prec: 0.025, sway: 0.025, mutate: 0, hold: 0.1,
    figs: [
      { gearRing: 119, gearWheel: 40, penHole: 0.65, size: 0.8, ecc: 0, twist: 1.4, shape: 0, lobe: 0, px: -0.27, py: -0.17 },
      { gearRing: 105, gearWheel: 64, penHole: 0.9, size: 0.64, ecc: 0, twist: 0.4, shape: 0, lobe: 0, px: 0.39, py: 0.02 },
      { gearRing: 107, gearWheel: 60, penHole: 0.9, size: 0.48, ecc: 0, twist: 0.9, shape: 0, lobe: 0, px: 0.07, py: 0.3 },
    ],
  },
  // Unknown Pleasures — the pulsar stack (canyon's inverse: flat-on signal;
  // speed = forward travel over the range, rows cresting at the horizon;
  // sharp = peakiness of the ridge field — high = sparse JD spikes)
  PUL: { height: 0.14, env: 0.26, drift: 0.35, speed: 0.02, sharp: 2.6 },
  FL: { pinch: 0.03, shimmer: 0.006, bendIn: 0.18, bendOut: 0.85 },
  GLN: { groups: 2, interval: 20, speed: 0.05, width: 0.15, strength: 0.5, tint: 0, scatter: 0.12 },
  ENG: { gutterA: 0.4, gutterB: 0.66, idleFloor: 0.3, alphaMul: 1, lineWidth: 1.6 },
};

export default function LoomChoreography({ themeKey = "", opacity = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId = null;
    let resizeObserver = null;
    let remeasureTimer = null;

    // ── Low-power / reduced-motion detection (mirrors HarmonicCanvas) ──
    const prefersReduced = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = typeof window.matchMedia === "function"
      && window.matchMedia("(pointer: coarse)").matches;
    const fewCores = (navigator.hardwareConcurrency || 8) <= 4;
    const smallScreen = Math.min(window.innerWidth || 9999, window.innerHeight || 9999) < 700;
    const lowPower = prefersReduced || coarsePointer || fewCores || smallScreen;

    // Background canvas: fill-rate is the enemy — cap DPR aggressively.
    // (The masthead HarmonicCanvas keeps its higher fidelity; this layer is
    // atmosphere and reads fine at 1.25x.)
    const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.25);
    const L = lowPower ? 44 : 64;
    const P = lowPower ? 80 : 120; // max per-line resolution; most lines use far less
    const MIN_FRAME_INTERVAL = 1000 / (lowPower ? 24 : 30);

    let W = window.innerWidth, H = window.innerHeight;
    let sizeScale = 1;
    let T = prefersReduced ? 7 : 0; // reduced motion: freeze at a settled pose

    const { RIB, TAR, TRON, CAN, MO, PEN, PUL, FL, GLN, ENG } = UNDERLOOM_CONFIG;

    // ── Theme tokens (R7: the engine rules above all) ──
    const parseColor = (cssVar, fallback) => {
      const raw = resolveCssColor(`var(${cssVar})`);
      if (!raw) return fallback;
      if (raw.startsWith("#")) {
        return raw.length === 4
          ? raw.slice(1).split("").map((c) => parseInt(c + c, 16))
          : [parseInt(raw.slice(1, 3), 16), parseInt(raw.slice(3, 5), 16), parseInt(raw.slice(5, 7), 16)];
      }
      const m = raw.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      return m ? [+m[1], +m[2], +m[3]] : fallback;
    };

    const PAL = {
      red: parseColor("--c-red", [217, 79, 79]),
      yel: parseColor("--c-yellow", [232, 200, 104]),
      lbl: parseColor("--c-ltBlue", [139, 184, 217]),
      blu: parseColor("--c-blue", [91, 147, 199]),
      gold: parseColor("--c-gold", [212, 160, 48]),
      green: parseColor("--c-green", [104, 184, 120]),
      bright: parseColor("--c-textBright", [255, 255, 255]),
      text: parseColor("--c-text", [238, 238, 238]),
    };
    const PAT = {
      intact: parseColor("--path-intact", [42, 157, 143]),
      circ: parseColor("--path-circumcised", [231, 111, 81]),
      rest: parseColor("--path-restoring", [233, 196, 106]),
      obs: parseColor("--path-observer", [120, 104, 184]),
    };

    // ── Helpers ──
    const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const gcd = (a, b) => { a = Math.round(a); b = Math.round(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
    const ss = (a, b, x) => { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
    const lerp = (a, b, m) => a + (b - a) * m;
    const wrap = (a, b) => ((a % b) + b) % b;
    const mixc = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
    // The masthead's red→gold→blue spectrum as a ramp (t: 0..1). The quiet
    // ribbon wears it; per Tone it is the MODEL for the other formations —
    // continuous colorPos means richer color AND hue-true glint families.
    const spec3 = (t) => (t < 0.5 ? mixc(PAL.red, PAL.gold, t * 2) : mixc(PAL.gold, PAL.blu, (t - 0.5) * 2));

    // ── RIBBON LOOM (HarmonicCanvas DNA: parents, phase spread, taper) ──
    const parentY = (u, tau, seed, amp) => {
      const half = Math.max(W, H) / 2;
      const trav = tau * RIB.speed - u * RIB.waveFreq * 6.283;
      const ripple = tau * RIB.speed * 2.2 - u * RIB.waveFreq * 2.5 * 6.283 + seed;
      const loop = (tau * RIB.speed * 1.9 - u * RIB.waveFreq * 1.7 * 6.283 + seed * 2.1) * 1.5;
      return (Math.sin(trav + seed) * 0.33 + Math.cos(ripple) * 0.18 + Math.cos(loop) * 0.21) * half * amp;
    };
    const split = Math.round(L * 0.625); // ribbon 1 / ribbon 2 split
    const ribbonPt = (i, u, o, amp) => {
      let blend, seedA, seedB;
      if (i < split) { blend = 0.5 - Math.cos((i / (split - 1)) * Math.PI) * 0.5; seedA = 1.7; seedB = 4.2; }
      else { blend = 0.5 - Math.cos(((i - split) / (L - split - 1)) * Math.PI) * 0.5; seedA = 2.9; seedB = 0.8; }
      const tau = T + (blend - 0.5) * RIB.spread;
      const half = Math.max(W, H) / 2;
      const taper = Math.pow(Math.sin(Math.PI * u), 0.7);
      const yA = parentY(u, tau, seedA, amp) - RIB.sep * half * amp * 2;
      const yB = parentY(u, tau + 0.9, seedB, amp) + RIB.sep * half * amp * 2 * (i < split ? 1 : 1.6);
      const y = H * 0.5 + lerp(yA, yB, blend) * taper;
      const loopX = Math.sin(tau * RIB.speed * 1.9 - u * RIB.waveFreq * 1.7 * 6.283 + blend * 3) * half * 0.10 * amp * taper;
      const x = (-0.06 + 1.12 * u) * W + Math.cos(tau * RIB.speed - u * RIB.waveFreq * 6.283 + blend * 2) * half * 0.14 * amp * taper + loopX;
      const z = Math.sin(tau * 0.8 + u * 4 + blend * 5) * 0.35;
      const sc = 1 / (1 + z * 0.25);
      o.x = W * 0.5 + (x - W * 0.5) * sc;
      o.y = H * 0.5 + (y - H * 0.5) * sc;
    };
    const ribbonCol = (i, alphaScale, pal1, pal2, pal3) => {
      let tt, c;
      if (i < split) { tt = i / (split - 1); c = mixc(pal1, pal2, tt); }
      else { tt = (i - split) / (L - split - 1); c = mixc(pal2, pal3, tt); }
      const bl = 0.5 - Math.cos(tt * Math.PI) * 0.5;
      const al = Math.sin(bl * Math.PI) * 0.5 + 0.2;
      // HarmonicCanvas-weight threads: thick in the ribbon's belly, fine at
      // the bunched edges — the depth-shaded width is half the lushness.
      const w = (1.1 + 2.7 * Math.sin(bl * Math.PI)) * sizeScale;
      return [c[0], c[1], c[2], al * alphaScale, w];
    };

    // ── BEAM RACER world paths (deterministic, init once) ──
    const racers = [];
    for (let r = 0; r < TRON.racers; r++) {
      let x = Math.round(hash(r * 7.7) * 10 - 5), z = TRON.zN + 0.2, n = 0;
      const pts = [[x, z]];
      while (z < TRON.zF + 8 && n < 80) {
        if (n % 2 === 0) { z += 3 + 5 * hash(r * 31.7 + n * 3.1); }
        else {
          const dx = (hash(r * 17.3 + n * 5.7) < 0.5 ? -1 : 1) * (1 + Math.floor(hash(r * 23.9 + n * 2.3) * 2));
          x = Math.max(-6, Math.min(6, x + dx));
        }
        pts.push([x, z]); n++;
      }
      const cum = [0]; let tot = 0;
      for (let q = 1; q < pts.length; q++) {
        tot += Math.abs(pts[q][0] - pts[q - 1][0]) * TRON.laneW + Math.abs(pts[q][1] - pts[q - 1][1]);
        cum.push(tot);
      }
      racers.push({ pts, cum, tot });
    }
    const rw = { x: 0, z: 0 };
    const racerAt = (R, s) => {
      s = Math.max(0, Math.min(R.tot, s));
      let i = 1; while (i < R.cum.length - 1 && R.cum[i] < s) i++;
      const c0 = R.cum[i - 1], c1 = R.cum[i], t = c1 > c0 ? (s - c0) / (c1 - c0) : 0;
      rw.x = lerp(R.pts[i - 1][0], R.pts[i][0], t);
      rw.z = lerp(R.pts[i - 1][1], R.pts[i][1], t);
    };
    const projFloor = (xw, zw, o) => {
      zw = Math.max(0.9, zw);
      const f = 0.92 * Math.min(W, H);
      o.x = W * 0.5 + xw * f / zw;
      o.y = H * TRON.horizon + TRON.camY * f / zw;
    };
    const tronRowZ = (i) => TRON.zN + wrap(i * ((TRON.zF - TRON.zN) / TRON.rows) - T * TRON.gridSpeed, TRON.zF - TRON.zN);
    const tronFade = (zw) => ss(TRON.zN, TRON.zN + 1.4, zw) * (1 - ss(TRON.zF - 6, TRON.zF, zw));

    // ── CANYON FLIGHT (world-stable terrain, camera flying forward) ──
    // ── CANYON FLIGHT surface — the original Fractalus terrain, restored ──
    const canyonH = (xw, zw) => {
      const b = Math.sin(xw * 0.5 + zw * 0.4) + 0.6 * Math.sin(xw * 1.1 - zw * 0.23 + 1.7) + 0.35 * Math.sin(xw * 2.2 + zw * 0.72 + 4);
      const h01 = (b + 1.95) / 3.9;
      const env = 0.12 + 0.88 * ss(0.10, CAN.valley, Math.abs(xw) / (CAN.xSpan * 0.5));
      return h01 * CAN.wall * env;
    };
    const canyonRowZ = (i) => CAN.zN + wrap(i * ((CAN.zF - CAN.zN) / L) - T * CAN.speed, CAN.zF - CAN.zN);
    const canyonFade = (zw) => ss(CAN.zN, CAN.zN + 1.1, zw) * (1 - ss(CAN.zF - 6, CAN.zF, zw));

    // ── HARLEQUIN TARTAN sett ──
    // Two crossing diagonal band sets; each repeating block of 8 lines is a
    // woven "sett" of [spacing-units, token, width, alpha-mul]. Straight
    // lines (2 points each) — the cheapest formation in the registry.
    // PALETTE POLICY: decorative formations use theme-reactive --c-* data
    // colors so every theme repaints them (--path-* tokens are universal by
    // design — semantic anchors — and are reserved for formations where
    // pathway MEANING matters, i.e. the convergence streams).
    const SETT = [
      [1.6, "gold", 2.6, 1.0], [0.5, "grey", 0.9, 0.65], [1.0, "red", 1.8, 0.9], [0.5, "green", 0.9, 0.6],
      [1.7, "blue", 2.6, 1.0], [0.6, "gold", 1.0, 0.7], [1.1, "yellow", 1.8, 0.9], [0.5, "grey", 0.9, 0.6],
    ];
    const settHalf = Math.floor(L / 2);
    const settTotalU = SETT.reduce((s, e) => s + e[0], 0);
    const settPrefix = [];
    { let acc = 0; for (const e of SETT) { settPrefix.push(acc + e[0] / 2); acc += e[0]; } }
    const settSpanU = Math.ceil(settHalf / SETT.length) * settTotalU;
    const settOffU = (k) => Math.floor(k / SETT.length) * settTotalU + settPrefix[k % SETT.length];
    const tartanColor = (key) => (
      key === "gold" ? PAL.gold : key === "grey" ? PAL.lbl : key === "red" ? PAL.red
        : key === "green" ? PAL.green : key === "blue" ? PAL.blu : PAL.yel
    );
    // Spectrum positions (0 = red … 0.5 = gold … 1 = blue) for hue-binned
    // glint families — the masthead's colorPos, adapted to a discrete sett.
    const settHue = { red: 0.05, gold: 0.35, yellow: 0.5, green: 0.7, grey: 0.85, blue: 0.95 };

    // Per-frame derived spirograph geometry (filled by pendulum.prep)
    const penD = { cyc: 21, prog: -1, fam: [{}, {}, {}] }; // per-family gearing (variety)

    // ── THE GLISTEN, engine-wide ── faithful port of the Harmonic Loom's
    // glint pass: colour families staggered in time, alternating travel
    // directions so opposite-moving glints cross, holographic hue drift
    // (tint desaturates toward pearly white), quick tail falloff. Runs on
    // whichever formation is on stage — the streak follows that formation's
    // own geometry via pt(i,u).
    let glintT = 0; // real-seconds accumulator, decoupled from damp (like the masthead)
    const glisten = (F, wgt) => {
      if (wgt < 0.02 || GLN.groups <= 0) return;
      // formations may override glint cadence/size (F.glint) — the spirograph
      // runs a much denser sparkle so streaks crowd its mesh
      const gi = F.glint || GLN;
      const period = Math.max(0.5, gi.interval !== undefined ? gi.interval : GLN.interval);
      const gWidth = gi.width !== undefined ? gi.width : GLN.width;
      const gStrength = gi.strength !== undefined ? gi.strength : GLN.strength;
      const travelT = Math.min(period, 1 / Math.max(0.001, gi.speed !== undefined ? gi.speed : GLN.speed));
      const sat = Math.max(0, Math.min(100, Math.round(95 - (gi.tint !== undefined ? gi.tint : GLN.tint) * 60)));
      ctx.lineCap = "round";
      for (let i = 0; i < L; i++) {
        const c = F.col(i);
        if (c[3] < 0.01) continue; // invisible thread — no streak
        // HUE BINNING — the masthead's actual trick: every thread reports
        // its position on the red→gold→blue spectrum via the formation's
        // hue(i), and glint families are COLOUR families binned on that
        // axis. One pass lights the warm threads together; the cool ones
        // answer from the other direction. Formations without a hue map
        // fall back to index order.
        const cp = F.hue ? F.hue(i) : i / L;
        const g = Math.min(GLN.groups - 1, Math.max(0, Math.floor(cp * GLN.groups)));
        // gi.sync = ONE cohesive wave: every thread travels the same
        // direction on the same clock (no family stagger, no crossing) —
        // the cascade order alone carries the wave through the formation.
        const baseDir = gi.sync ? 1 : (g % 2 === 0 ? 1 : -1);
        // STRUCTURED CASCADE (not random): threads fire in the order the
        // formation declares — depth for the canyon (a pulse receding into
        // the scene), station for the spirograph (glints chase the pen),
        // height for convergence. Low scatter = the masthead's coherent
        // rake; formation overrides (F.scatter) widen it into a cascade.
        const ord = F.order ? F.order(i) : cp;
        const effScatter = F.scatter !== undefined ? F.scatter : GLN.scatter;
        const gOff = gi.sync ? 0 : (g / GLN.groups) * period;
        // The streak rides the thread's VISIBLE span (F.span), not blindly
        // u∈[0,1] — perspective formations map u far past the viewport.
        const spn = F.span ? F.span(i) : null;
        const s0 = spn ? spn[0] : 0, s1 = spn ? spn[1] : 1;
        // Streak hue seeded from the thread's spectrum position, like the
        // masthead (colorPos * 60) — the shimmer tracks the thread's colour.
        const hueBase = glintT * 30 + g * 140 + cp * 60;
        // Streak brightness rides the thread's own visibility — un-inked or
        // ghost-faint threads carry no glint, so trails only ever appear
        // where the pen has already been.
        const vis = Math.min(1, c[3] * 5);
        if (vis <= 0.01) continue;
        // gi.crisscross = the masthead's crossing glints, adapted: TWO
        // counter-running waves — the second cascades from the opposite end,
        // half a period behind — so holographic trails meet and cross on
        // the figure, again and again as the pen draws.
        const passes = gi.crisscross ? 2 : 1;
        for (let ps = 0; ps < passes; ps++) {
          const dir = gi.crisscross ? (ps === 0 ? 1 : -1) : baseDir;
          const pOrd = ps === 0 ? ord : 1 - ord;
          const pOff = gi.crisscross ? ps * period * 0.5 : gOff;
          // cascade offsets span the PERIOD (not one crossing), so fast
          // crossings become one bright head sweeping thread-to-thread.
          const localT = wrap(glintT - pOff - pOrd * effScatter * period, period);
          if (localT >= travelT) continue;
          const hp = localT / travelT;
          const uHead = s0 + (dir === 1 ? hp : 1 - hp) * (s1 - s0);
          const uTail = Math.max(s0, Math.min(s1, uHead - dir * gWidth * (s1 - s0)));
          F.pt(i, uTail, pA);
          F.pt(i, uHead, pB);
          if (Math.abs(pA.x - pB.x) + Math.abs(pA.y - pB.y) < 2) continue;
          const grad = ctx.createLinearGradient(pA.x, pA.y, pB.x, pB.y);
          const hb = hueBase + ps * 80; // the counter-wave shimmers offset
          for (let q = 0; q <= 6; q++) {
            const f = q / 6;
            const hue = wrap(hb + f * 150, 360);
            grad.addColorStop(f, `hsla(${hue.toFixed(0)}, ${sat}%, ${(60 + f * 28).toFixed(0)}%, ${(Math.pow(f, 1.8) * gStrength * wgt * vis).toFixed(3)})`);
          }
          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.max(1, c[4] * 1.5 * ENG.lineWidth); // glints ride the same weight
          ctx.beginPath();
          for (let s2 = 0; s2 <= 20; s2++) {
            F.pt(i, uTail + (uHead - uTail) * (s2 / 20), pA);
            if (s2 === 0) ctx.moveTo(pA.x, pA.y); else ctx.lineTo(pA.x, pA.y);
          }
          ctx.stroke();
        }
      }
      ctx.lineCap = "butt";
    };

    // ── Formation registry ──
    // pt(i,u,o) geometry · col(i)→[r,g,b,a,width] · pts(i)→per-line point
    // budget (straight lines need 2 points, not 120 — the main perf lever) ·
    // prep() once per frame · glow() overlay pass.
    const FORMS = {
      tartan: {
        pt: (i, u, o) => {
          const g = i < settHalf ? 0 : 1;
          const k = g ? i - settHalf : i;
          const a = TAR.angle * (g ? 1 : -1);
          const ca = Math.cos(a), sa = Math.sin(a);
          const span = Math.hypot(W, H) * 1.05;
          const unitPx = (span / settSpanU) * (1 + TAR.breathe * Math.sin(T * 0.11 + g * 2.4));
          const shift = (g ? 1 : -1) * T * TAR.driftPx; // the weave slides, slowly
          const offPx = wrap(settOffU(k) * unitPx + shift, span) - span / 2;
          const len = Math.hypot(W, H) * 1.2;
          const cx = W * 0.5 - sa * offPx, cy = H * 0.5 + ca * offPx;
          o.x = cx + ca * (u - 0.5) * len;
          o.y = cy + sa * (u - 0.5) * len;
        },
        col: (i) => {
          const k = (i < settHalf ? i : i - settHalf) % SETT.length;
          const e = SETT[k];
          const c = tartanColor(e[1]);
          return [c[0], c[1], c[2], TAR.alpha * e[3], e[2] * sizeScale];
        },
        hue: (i) => settHue[SETT[(i < settHalf ? i : i - settHalf) % SETT.length][1]],
        pts: () => 2, // every band is straight — the diamonds come from crossing
      },
      quiet: {
        // The masthead's own spectrum — red through gold to blue across the
        // ribbon's depth — at editorial volume. The two looms share a palette.
        pt: (i, u, o) => ribbonPt(i, u, o, RIB.amp * 0.45),
        col: (i) => ribbonCol(i, 0.26, PAL.red, PAL.gold, PAL.blu),
        // exact masthead colorPos: ribbon 1 spans red→gold, ribbon 2 gold→blue
        hue: (i) => (i < split ? (i / (split - 1)) * 0.5 : 0.5 + ((i - split) / (L - split - 1)) * 0.5),
        pts: () => 56,
      },
      tron: {
        pt: (i, u, o) => {
          if (i < TRON.rows) projFloor((u - 0.5) * 34, tronRowZ(i), o);
          else if (i < TRON.rows + TRON.lanes) {
            const k = i - TRON.rows;
            projFloor((k - (TRON.lanes - 1) / 2) * TRON.laneW, TRON.zN + u * (TRON.zF - TRON.zN), o);
          } else {
            const rr = (i - TRON.rows - TRON.lanes) % TRON.racers;
            const R = racers[rr];
            const head = wrap(T * TRON.speed + rr * (R.tot / TRON.racers) * 1.7, R.tot + 9);
            racerAt(R, head - TRON.trail * (1 - u));
            projFloor(rw.x * TRON.laneW, rw.z, o);
          }
        },
        col: (i) => {
          if (i < TRON.rows) {
            const zw = tronRowZ(i);
            const near = 1 - (zw - TRON.zN) / (TRON.zF - TRON.zN);
            // rows now carry the spectrum across depth (warm near → cool far)
            // AND gradient warm→cool ALONG the row, plus the perspective weight
            const c = spec3(0.15 + 0.7 * near), c2 = spec3(0.35 + 0.55 * near);
            return [c[0], c[1], c[2], (0.13 + 0.16 * near) * tronFade(zw), (0.6 + 5 / zw) * sizeScale, c2[0], c2[1], c2[2]];
          }
          if (i < TRON.rows + TRON.lanes) {
            // lanes ramp the spectrum across the floor and gradient near→far
            const t = (i - TRON.rows) / (TRON.lanes - 1);
            const c = spec3(t), c2 = spec3(Math.min(1, t + 0.12));
            return [c[0], c[1], c[2], 0.16, 1.5 * sizeScale, c2[0], c2[1], c2[2]];
          }
          const rr = (i - TRON.rows - TRON.lanes) % TRON.racers;
          const c = [PAL.red, PAL.gold, PAL.blu, PAL.green, PAL.yel, PAL.lbl][rr]; // theme-reactive
          const R = racers[rr];
          const head = wrap(T * TRON.speed + rr * (R.tot / TRON.racers) * 1.7, R.tot + 9);
          // the beam swells as it nears the viewer, thins toward the horizon
          racerAt(R, Math.min(R.tot, head));
          const wZ = Math.max(1.2, rw.z);
          return [c[0], c[1], c[2], head < R.tot ? 0.78 : 0, Math.min(5, 1.0 + 6 / wZ) * sizeScale];
        },
        hue: (i) => {
          if (i < TRON.rows) return 0.9; // structural rows stay in the cool lane
          if (i < TRON.rows + TRON.lanes) return (i - TRON.rows) / (TRON.lanes - 1);
          return [0.05, 0.35, 0.95, 0.7, 0.5, 0.85][(i - TRON.rows - TRON.lanes) % TRON.racers];
        },
        pts: (i) => (i < TRON.rows + TRON.lanes ? 2 : 48), // grid lines are straight
      },
      canyon: {
        pt: (i, u, o) => {
          const zw = canyonRowZ(i);
          const xw = (u - 0.5) * CAN.xSpan;
          const f = 0.9 * Math.min(W, H);
          o.x = W * 0.5 + xw * f / zw * 0.85;
          o.y = H * CAN.horizon + (CAN.camY - canyonH(xw, zw)) * f / zw;
        },
        col: (i) => {
          const zw = canyonRowZ(i);
          const near = 1 - (zw - CAN.zN) / (CAN.zF - CAN.zN);
          // the original mono-cool ramp — pale at the horizon, blue up close
          const c = mixc(PAL.lbl, PAL.blu, near);
          return [c[0], c[1], c[2], (0.05 + 0.33 * Math.pow(near, 1.6)) * canyonFade(zw), (0.7 + 1.7 * near) * sizeScale];
        },
        // all-cool formation: only the cool glint lane fires — hue-honest
        hue: (i) => 0.8 + 0.15 * (1 - (canyonRowZ(i) - CAN.zN) / (CAN.zF - CAN.zN)),
        // glint pulse recedes INTO the canyon, and each row's streak rides
        // only its VISIBLE span (near rows map u far past the viewport)
        order: (i) => (canyonRowZ(i) - CAN.zN) / (CAN.zF - CAN.zN),
        scatter: 0.85,
        span: (i) => {
          const zw = canyonRowZ(i);
          const halfU = Math.min(0.5, (0.62 * W * zw) / (0.9 * Math.min(W, H) * 0.85 * CAN.xSpan));
          return [0.5 - halfU, 0.5 + halfU];
        },
        pts: (i) => {
          // near ridges deserve detail; far ridges are a few pixels tall
          const near = 1 - (canyonRowZ(i) - CAN.zN) / (CAN.zF - CAN.zN);
          return 24 + Math.round(near * (P - 24));
        },
      },
      // Unknown Pleasures — the CP 1919 pulsar stack. The canyon's inverse:
      // flat-on, no perspective, pure stacked signal. Rows of quiet lines in
      // the theme's text token; peaks wake in a center channel, strongest in
      // the middle rows, bumps drifting slowly. Monochrome by design.
      pulsar: {
        pt: (i, u, o) => {
          // The rows TRAVEL over one continuous WORLD FIELD (the canyon's
          // trick, flat-on): every row samples the same terrain at its depth,
          // so ridgelines persist row-to-row and flow coherently toward the
          // reader instead of each row rolling its own dice.
          const prog = i / L + T * PUL.speed;
          const v = wrap(prog, 1);
          const wD = prog * 3.1;            // world depth — adjacent rows sample nearby terrain
          const x = (u - 0.5) * 12;         // world x
          const dr = T * PUL.drift * 0.08;  // the range itself evolves, slowly
          const b = Math.sin(x * 0.9 + wD * 1.3 + dr)
            + 0.6 * Math.sin(x * 1.9 - wD * 0.8 + 1.7 - dr * 0.7)
            + 0.35 * Math.sin(x * 4.2 + wD * 2.1 + 4.0)
            + 0.18 * Math.sin(x * 9.3 - wD * 3.7 + 2.2);
          const h01 = Math.max(0, (b + 2.13) / 4.26);
          const s = Math.pow(h01, PUL.sharp) * 2.2; // sharpen → sparse JD spikes
          const env = Math.exp(-Math.pow((u - 0.5) / PUL.env, 2));
          const rowAmp = 0.15 + 0.85 * Math.pow(Math.sin(v * Math.PI), 1.5);
          const yRow = H * (0.12 + 0.76 * v);
          o.x = u * W;
          o.y = yRow - env * s * rowAmp * H * PUL.height;
        },
        col: (i) => {
          const v = wrap(i / L + T * PUL.speed, 1);
          const near = Math.pow(Math.sin(v * Math.PI), 1.5);
          // monochrome by design (CP 1919) but with more body: thicker rows,
          // brightening toward the front of the stack for luminous depth
          const c = mixc(PAL.text, PAL.bright, near * 0.5);
          const edge = ss(0, 0.07, v) * (1 - ss(0.93, 1, v)); // fade the wrap seam
          return [c[0], c[1], c[2], (0.12 + 0.20 * near) * edge, (1.2 + 1.3 * near) * sizeScale];
        },
        hue: () => 0.5, // monochrome — one glint lane, like the sleeve
        order: (i) => wrap(i / L + T * PUL.speed, 1), // cascade rides the travel
        scatter: 0.7,
        pts: () => 100,
      },
      moire: {
        pt: (i, u, o) => {
          const half = L / 2;
          const g = i < half ? 0 : 1;
          const k = g ? i - half : i;
          const d = g ? 0.045 + MO.drift * Math.sin(T * 0.07) : 0;
          const a = MO.angle + d;
          const ca = Math.cos(a), sa = Math.sin(a);
          const span = Math.max(W, H) * 1.15, len = Math.hypot(W, H) * 1.2;
          const off = ((k / (half - 1)) - 0.5) * span;
          const cx = W * 0.5 - sa * off, cy = H * 0.5 + ca * off;
          let x = cx + ca * (u - 0.5) * len;
          let y = cy + sa * (u - 0.5) * len;
          if (i % MO.blipEvery === 0) {
            const pos = 0.5 + 0.5 * Math.asin(Math.sin(T * MO.blipSpeed * (0.5 + 0.4 * hash(i * 2.1)) + hash(i) * 6.283)) * (2 / Math.PI);
            const dist = Math.abs(u - pos);
            if (dist < MO.blipWin) {
              const envT = 1 - dist / MO.blipWin;
              const fr = ((u - (pos - MO.blipWin)) / (2 * MO.blipWin)) * MO.teeth;
              const saw = 2 * (fr - Math.floor(fr)) - 1;
              const disp = envT * saw * H * MO.blipAmp;
              x += -sa * disp; y += ca * disp;
            }
          }
          o.x = x; o.y = y;
        },
        col: (i) => {
          // quiet-ribbon treatment: each grid carries its own half of the
          // spectrum, and each LINE now gradients along its length toward the
          // adjacent hue — richer, meatier, no flat monochrome lines
          const half = L / 2;
          const k = i < half ? i : i - half;
          const pos = i < half ? 0.5 + (k / (half - 1)) * 0.5 : (k / (half - 1)) * 0.5;
          const c = spec3(pos), c2 = spec3(wrap(pos + 0.18, 1));
          const blip = i % MO.blipEvery === 0;
          return [c[0], c[1], c[2], blip ? 0.22 : 0.15, (blip ? 2.0 : 1.5) * sizeScale, c2[0], c2[1], c2[2]];
        },
        hue: (i) => {
          const half = L / 2;
          const k = i < half ? i : i - half;
          return i < half ? 0.5 + (k / (half - 1)) * 0.5 : (k / (half - 1)) * 0.5;
        },
        pts: (i) => (i % MO.blipEvery === 0 ? P : 2), // only blip carriers bend
      },
      // Pendulum harmonograph — a SPIROGRAPH SIMULATOR with the Coral sleeve
      // / '70s Hanna-Barbera structure: loop centers march around a squashed
      // orbit, geometry driven by real gear semantics (ring teeth ÷ wheel
      // teeth = petal advance; pen hole = loop size). The pen draws
      // CONTINUOUSLY: each family's newest loop inks itself while the oldest
      // dissolves as the pen comes back around. Never resets, never hurries.
      pendulum: {
        prep: () => {
          penD.cyc = Math.floor(L / 3);
          penD.prog = PEN.draw > 0 ? T * PEN.draw : -1; // -1 = complete figure, no drawing cycle
          const cyc = penD.cyc;
          penD.life = cyc * (1 + PEN.hold + 0.3); // ink + hold + dissolve, in arc-units
          for (let f = 0; f < 3; f++) {
            const fig = PEN.figs[f];
            const G = penD.fam[f];
            let src = fig;
            if (PEN.mutate > 0) {
              // FIREWORKS: each figure lives one lifecycle (ink in → hold →
              // dissolve), then rerolls into a new random pattern-guide
              // figure at a new spot. Staggered thirds so they come and go.
              const tf = T * Math.max(0.05, PEN.draw) + f * penD.life / 3;
              const lap = Math.floor(tf / penD.life);
              G.lp = tf - lap * penD.life;
              if (G.lap === undefined) { G.lap = lap; G.rig = { ...fig }; } // first volley = the seed config
              else if (G.lap !== lap) {
                G.lap = lap;
                const wheels = [24, 30, 32, 36, 40, 42, 45, 48, 50, 52, 56, 60, 63, 64, 72, 75, 80, 84];
                G.rig = {
                  gearRing: 105,
                  gearWheel: wheels[Math.floor(hash(lap * 37.7 + f * 11.3) * wheels.length)],
                  penHole: 0.6 + 0.38 * hash(lap * 17.3 + f * 5.7),
                  size: 0.3 + 0.35 * hash(lap * 53.1 + f * 29.9),
                  px: (hash(lap * 71.7 + f * 3.1) - 0.5) * 0.6,
                  py: -0.1 + 0.45 * hash(lap * 91.3 + f * 7.9),
                };
              }
              src = G.rig;
            } else { G.lp = -1; }
            const rg = Math.max(24, src.gearRing);
            const rw = Math.max(6, Math.min(src.gearWheel, rg - 6));
            // The TRUE curve: closes after wheel/gcd revolutions, with
            // ring/gcd points — exactly the pattern guide's arithmetic.
            const revs = rw / gcd(rg, rw);
            G.q = (rg - rw) / rw;                    // wheel spin per carrier rev
            G.Rr = rg - rw;                          // carrier radius (teeth units)
            G.d = src.penHole * rw;                  // pen distance from wheel center
            G.segT = (6.283 * revs) / cyc;           // arc of curve per thread
            G.scale = (Math.min(W, H) * src.size * 0.55) / (G.Rr + G.d);
            G.px = src.px !== undefined ? src.px : fig.px;
            G.py = src.py !== undefined ? src.py : fig.py;
            G.ecc = fig.ecc;
            G.rotOff = fig.twist;                    // static orientation offset
            G.m = Math.round(fig.shape);
            G.lobe = fig.lobe;
            G.ptsSeg = Math.max(24, Math.min(P, Math.round(24 + (revs / cyc) * 72)));
          }
        },
        pt: (i, u, o) => {
          const fam = i % 3, k = (i - fam) / 3;
          const G = penD.fam[fam];
          let t;
          if (G.lp >= 0) {
            // fireworks: arcs ink once in order, sit, then the whole figure fades
            const frac = Math.max(0, Math.min(1, G.lp - k));
            t = k * G.segT + u * frac * G.segT;
          } else {
            let ph = 1, absIdx = k;
            if (penD.prog >= 0) {
              ph = wrap(penD.prog - k, penD.cyc);
              absIdx = penD.prog - ph; // the pen keeps circling the closed figure
            }
            t = absIdx * G.segT + u * Math.min(1, ph) * G.segT;
          }
          // shape/lobe: the tin's non-circular wheels, as pen-distance breathing
          const dm = G.d * (1 + (G.m ? G.lobe * Math.cos(G.m * G.q * t) : 0));
          const x1 = (G.Rr * Math.cos(t) + dm * Math.cos(G.q * t)) * G.scale;
          const y1 = (G.Rr * Math.sin(t) - dm * Math.sin(G.q * t)) * G.scale * (1 - G.ecc);
          const rot = G.rotOff + T * PEN.prec * (fam === 1 ? -1 : 1);
          const cr = Math.cos(rot), sr = Math.sin(rot);
          const cx = W * (0.5 + G.px) + Math.sin(T * 0.07 + fam * 2.1) * W * PEN.sway;
          const cy = H * (0.47 + G.py) + Math.cos(T * 0.055 + fam * 1.4) * H * PEN.sway * 0.6;
          o.x = cx + x1 * cr - y1 * sr;
          o.y = cy + (x1 * sr + y1 * cr) * 0.9;
        },
        col: (i) => {
          const fam = i % 3, k = (i - fam) / 3;
          const G = penD.fam[fam];
          // each figure's strand-group color, and each arc gradients from
          // its base hue toward a brighter tip — richer, more luminous ink
          const c = [PAL.red, PAL.gold, PAL.blu][fam];
          const c2 = mixc(c, PAL.bright, 0.4);
          let alMul = 1;
          if (G.lp >= 0) {
            alMul = Math.max(0, Math.min(1, G.lp - k)) > 0 ? 1 : 0; // not yet inked = invisible
            const holdEnd = penD.cyc * (1 + PEN.hold);
            if (G.lp > holdEnd) alMul *= Math.max(0, 1 - (G.lp - holdEnd) / (penD.life - holdEnd)); // the firework fades
          } else if (penD.prog >= 0) {
            const ph = wrap(penD.prog - k, penD.cyc);
            alMul = 1 - ss(penD.cyc - 2.5, penD.cyc - 0.2, ph); // oldest arcs dissolve ahead of the pen
          }
          return [c[0], c[1], c[2], 0.26 * alMul, 1.6 * sizeScale, c2[0], c2[1], c2[2]];
        },
        hue: (i) => [0.05, 0.5, 0.95][i % 3], // red / gold / blue strand groups
        // Glints chase the pen in inking order; colour lanes cross from
        // opposite directions.
        order: (i) => ((i - (i % 3)) / 3) / Math.max(1, penD.cyc),
        // near-unison so the wave doesn't teleport arc-to-arc (arcs are
        // spatially scattered around the rosette): a faint lead only.
        scatter: 0.12,
        // TOTALLY CHILL, quiet-ribbon style: one soft, slow, coherent wave —
        // all arcs light at nearly the same parameter, so a single glowing
        // contour glides smoothly THROUGH the whole figure rather than a
        // bright head jumping between arcs. sync = one direction/clock;
        // narrow + dim + pale so it's a gentle sheen, never a manic streak.
        glint: { interval: 26, width: 0.16, speed: 0.032, sync: true, tint: 0.6, strength: 0.3 },
        pts: (i) => {
          const fam = i % 3, k = (i - fam) / 3;
          const G = penD.fam[fam];
          const base = G.ptsSeg || 52; // dense figures need dense arcs
          let frac = 1;
          if (G.lp >= 0) frac = Math.max(0, Math.min(1, G.lp - k));
          else if (penD.prog >= 0) frac = Math.min(1, wrap(penD.prog - k, penD.cyc));
          return 8 + Math.round(frac * (base - 8)); // resolution grows with the ink
        },
      },
      flow: {
        pt: (i, u, o) => {
          const v = i / (L - 1);
          const y0 = H * (0.06 + 0.88 * v);
          const bend = ss(FL.bendIn, FL.bendOut, u);
          const yT = H * 0.5 + (v - 0.5) * H * FL.pinch;
          o.x = u * W;
          o.y = lerp(y0, yT, bend) + Math.sin(u * 9 + T * 0.4 + i) * H * FL.shimmer * (1 - bend * 0.8);
        },
        col: (i) => {
          const c = [PAT.intact, PAT.circ, PAT.rest, PAT.obs][i % 4];
          return [c[0], c[1], c[2], 0.20, 1.6 * sizeScale];
        },
        hue: (i) => [0.65, 0.12, 0.48, 0.95][i % 4], // teal / orange / yellow / purple
        order: (i) => i / (L - 1), // cascade runs top→bottom through the streams
        pts: () => 48,
        scatter: 0.45, // parallel streams: sync would read as a solid bar — keep the cascade wide
      },
    };

    // ── Region measurement (anchors may mount/resize as data loads) ──
    let regions = []; // [{center, f}] sorted by center
    let gateTop = Infinity; // top of the first anchor — the masthead line
    const measureRegions = () => {
      const found = [];
      let gate = Infinity;
      for (const [sel, f] of REGIONS) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const top = r.top + window.scrollY;
        if (top < gate) gate = top;
        found.push({ center: top + r.height / 2, f });
      }
      found.sort((a, b) => a.center - b.center);
      regions = found;
      gateTop = gate;
    };

    const resizeCanvas = () => {
      W = window.innerWidth; H = window.innerHeight;
      sizeScale = Math.max(0.3, Math.min(1, Math.hypot(W, H) / 1400));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureRegions();
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Content (maps, API data) shifts heights after mount — remeasure calmly.
    if (typeof ResizeObserver === "function") {
      let pending = null;
      resizeObserver = new ResizeObserver(() => {
        if (pending) return;
        pending = setTimeout(() => { pending = null; measureRegions(); }, 400);
      });
      resizeObserver.observe(document.body);
    } else {
      remeasureTimer = setInterval(measureRegions, 3000);
    }

    let lastScrollT = -1e9;
    const onScroll = () => { lastScrollT = performance.now(); };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── The masthead's pause button rules ALL looms ──
    // Initial state from the same localStorage key HarmonicCanvas persists;
    // live toggles arrive via the cs-loom-pause event from SquishHeader.
    let loomPaused = false;
    let pausedSig = null; // scroll/viewport signature of the held frozen frame
    try { loomPaused = localStorage.getItem("cs_loom_paused") === "true"; } catch { /* private mode */ }
    const onPauseToggle = (e) => { loomPaused = !!(e.detail && e.detail.paused); };
    window.addEventListener("cs-loom-pause", onPauseToggle);

    const pA = { x: 0, y: 0 }, pB = { x: 0, y: 0 };
    let damp = 1;
    let lastFrameTime = performance.now();
    let idleCleared = false;

    const render = (now) => {
      animationFrameId = requestAnimationFrame(render);
      const elapsed = now - lastFrameTime;
      if (elapsed < MIN_FRAME_INTERVAL) return;
      const delta = Math.min(elapsed, 100);
      lastFrameTime = now;

      // Paused (masthead button): HOLD A FROZEN FRAME instead of blanking —
      // the formations become a still engraving. Time (and the glint clock)
      // freeze, but we re-render a single static frame whenever scroll or
      // viewport changes, so a paused page still shows the right formation
      // at every station — for ~zero CPU at rest.
      if (loomPaused) {
        const sig = window.scrollY + "|" + W + "|" + H;
        if (pausedSig === sig) return;
        pausedSig = sig;
      } else {
        pausedSig = null;
      }

      const p = window.scrollY + H * 0.5;

      // ── MASTHEAD GATE ── the SquishHeader zone belongs to HarmonicCanvas.
      // Above the first station anchor this layer draws NOTHING (and burns no
      // CPU); it fades in as the prologue approaches the viewport center.
      const reveal = ss(gateTop - H * 0.35, gateTop + H * 0.15, p);
      if (reveal <= 0.001 || regions.length === 0) {
        if (!idleCleared) { ctx.clearRect(0, 0, W, H); idleCleared = true; }
        return;
      }
      idleCleared = false;

      const dt = delta / 1000;
      if (!loomPaused) glintT += dt; // the glisten keeps its own clock, like the masthead's
      const scrolling = (now - lastScrollT) < 200;
      damp += ((scrolling ? 1 : ENG.idleFloor) - damp) * 0.04;
      if (!prefersReduced && !loomPaused) T += dt * (0.35 + 0.65 * damp);

      ctx.clearRect(0, 0, W, H); // TRANSPARENT — the theme's background rules

      let k = 0;
      while (k < regions.length - 1 && p > regions[k + 1].center) k++;
      let mix = 0;
      if (k < regions.length - 1) {
        const raw = (p - regions[k].center) / (regions[k + 1].center - regions[k].center);
        mix = ss(ENG.gutterA, ENG.gutterB, raw);
      }
      const A = regions[k], B = regions[Math.min(k + 1, regions.length - 1)];
      const FA = FORMS[A.f], FB = FORMS[B.f];
      if (FA.prep) FA.prep();
      if (mix > 0.001 && FB !== FA && FB.prep) FB.prep();

      const blending = mix > 0.001;
      for (let i = 0; i < L; i++) {
        const ca = FA.col(i), cb = blending ? FB.col(i) : ca;
        const al = lerp(ca[3], cb[3], mix) * ENG.alphaMul * reveal;
        if (al < 0.004) continue;
        // Per-line point budget: straight lines cost 2 points, detail costs
        // more — when blending, take the greedier of the two formations.
        let n = FA.pts ? FA.pts(i) : P;
        if (blending && FB.pts) n = Math.max(n, FB.pts(i));
        if (blending) n = Math.max(n, 24); // curves mid-morph need enough joints
        ctx.lineWidth = Math.max(0.5, lerp(ca[4], cb[4], mix) * ENG.lineWidth);
        // RICHNESS: a formation's col() may return a SECOND colour (elems 5-7)
        // for a per-line gradient — the Harmonic Loom's along-thread spectrum.
        const grad2 = !blending && ca.length >= 8;
        let fx = 0, fy = 0, lx = 0, ly = 0;
        ctx.beginPath();
        for (let j = 0; j < n; j++) {
          const u = j / (n - 1);
          FA.pt(i, u, pA);
          let x = pA.x, y = pA.y;
          if (blending) { FB.pt(i, u, pB); x = lerp(x, pB.x, mix); y = lerp(y, pB.y, mix); }
          if (j === 0) { ctx.moveTo(x, y); fx = x; fy = y; } else ctx.lineTo(x, y);
          lx = x; ly = y;
        }
        if (grad2) {
          const g = ctx.createLinearGradient(fx, fy, lx, ly);
          g.addColorStop(0, `rgba(${ca[0] | 0},${ca[1] | 0},${ca[2] | 0},${al.toFixed(3)})`);
          g.addColorStop(1, `rgba(${ca[5] | 0},${ca[6] | 0},${ca[7] | 0},${al.toFixed(3)})`);
          ctx.strokeStyle = g;
        } else {
          ctx.strokeStyle = `rgba(${lerp(ca[0], cb[0], mix) | 0},${lerp(ca[1], cb[1], mix) | 0},${lerp(ca[2], cb[2], mix) | 0},${al.toFixed(3)})`;
        }
        ctx.stroke();
      }

      // The glisten rides whichever formation is on stage; it fades out
      // early in the morph so streaks never ghost across two geometries.
      if (!prefersReduced) {
        glisten(FA, Math.max(0, 1 - mix * 2.5) * reveal);
        if (blending && FB !== FA) glisten(FB, Math.max(0, (mix - 0.6) * 2.5) * reveal);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("cs-loom-pause", onPauseToggle);
      if (resizeObserver) resizeObserver.disconnect();
      if (remeasureTimer) clearInterval(remeasureTimer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [themeKey]);

  return (
    <canvas
      ref={canvasRef}
      className="ph-no-capture"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        opacity,
        transition: "opacity 1.5s ease",
      }}
    />
  );
}
