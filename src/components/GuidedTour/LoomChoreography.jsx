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
// HarmonicCanvas), beam racer (grid floor + light-cycles), canyon flight
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
  ["#ch-prologue", "tartan"], // researcher's letter — woven sett, NOT ribbon:
                              // right under the masthead, the ribbon read as
                              // a HarmonicCanvas duplicate (Tone's call)
  ["#st05", "tron"],          // demographics — grid floor, racing beams
  ["#st01", "flow"],          // survey map — every stream feeds the branching board
  ["#demonstration-band", "canyon"], // lights down — the flight begins here
  ["#st03", "canyon"],        // pleasure gap — flying the data terrain
  ["#st02", "moire"],         // mirror pairs — interference is the point
  ["#st06", "moire"],         // narrative mirrors
  ["#st07", "pendulum"],      // culture & generations — the slow swing of eras
  ["#st09", "moire"],         // religious mirrors
  ["#st08", "quiet"],         // observer lens — restraint for the witnesses
  ["#st04", "tartan"],        // correlations — crossed bands for cross-tabulation
  ["#st10", "pendulum"],      // restoration journey — rings patiently retraced
  ["#st11", "moire"],         // before & after — two states, slight offset
  ["#st13", "quiet"],         // for parents — sober decision environment
  ["#st12", "canyon"],        // by the numbers
  ["#st14", "flow"],          // forward view — every stream converges
  ["#ch-epilogue", "quiet"],
];

// Tuned in the standalone draft's ⚙ Tune panel; stamp new values from there.
// Exported so the Docent's Bobbin Threadbare easter egg (CopilotChat.jsx)
// can recite the Underloom's pattern alongside the masthead's LOOM_CONFIG.
export const UNDERLOOM_CONFIG = {
  RIB: { waveFreq: 1.5, spread: 1.2, sep: 0.22, speed: 0.3, amp: 0.9 },
  TAR: { angle: 1.1, driftPx: 9.5, breathe: 0.065, alpha: 0.4 },
  TRON: { zN: 1.8, zF: 34, rows: 28, lanes: 30, racers: 6, horizon: 0.27, camY: 1.5, laneW: 1.4, speed: 3.4, gridSpeed: 1.2, trail: 3.5 },
  CAN: { zN: 1.6, zF: 26, horizon: 0.26, camY: 2.2, speed: 0.5, xSpan: 30, wall: 3.1, valley: 0.2 },
  MO: { angle: 0.63, drift: 0.028, blipEvery: 3, blipSpeed: 1, teeth: 2, blipAmp: 0.023, blipWin: 0.02 },
  PEN: { gearRing: 48, gearWheel: 44, penHole: 0.85, size: 0.43, draw: 0.3, shrink: 0, ecc: 0.66, twist: 0.95, prec: 0.11, sway: 0.025, spreadX: 0.26 },
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

    const { RIB, TAR, TRON, CAN, MO, PEN, FL, GLN, ENG } = UNDERLOOM_CONFIG;

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
    };
    const PAT = {
      intact: parseColor("--path-intact", [42, 157, 143]),
      circ: parseColor("--path-circumcised", [231, 111, 81]),
      rest: parseColor("--path-restoring", [233, 196, 106]),
      obs: parseColor("--path-observer", [120, 104, 184]),
    };

    // ── Helpers ──
    const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const ss = (a, b, x) => { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
    const lerp = (a, b, m) => a + (b - a) * m;
    const wrap = (a, b) => ((a % b) + b) % b;
    const mixc = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];

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
    const penD = { cyc: 21, step: 0, orbit: 0, loopR: 0, prog: -1 };

    // ── THE GLISTEN, engine-wide ── faithful port of the Harmonic Loom's
    // glint pass: colour families staggered in time, alternating travel
    // directions so opposite-moving glints cross, holographic hue drift
    // (tint desaturates toward pearly white), quick tail falloff. Runs on
    // whichever formation is on stage — the streak follows that formation's
    // own geometry via pt(i,u).
    let glintT = 0; // real-seconds accumulator, decoupled from damp (like the masthead)
    const glisten = (F, wgt) => {
      if (wgt < 0.02 || GLN.groups <= 0) return;
      const period = Math.max(0.5, GLN.interval);
      const travelT = Math.min(period, 1 / Math.max(0.001, GLN.speed));
      const sat = Math.max(0, Math.min(100, Math.round(95 - GLN.tint * 60)));
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
        const dir = g % 2 === 0 ? 1 : -1;
        // STRUCTURED CASCADE (not random): threads fire in the order the
        // formation declares — depth for the canyon (a pulse receding into
        // the scene), station for the spirograph (glints chase the pen),
        // height for convergence. Low scatter = the masthead's coherent
        // rake; formation overrides (F.scatter) widen it into a cascade.
        const ord = F.order ? F.order(i) : cp;
        const effScatter = F.scatter !== undefined ? F.scatter : GLN.scatter;
        const localT = wrap(glintT - (g / GLN.groups) * period - ord * effScatter * travelT, period);
        if (localT >= travelT) continue;
        const hp = localT / travelT;
        // The streak rides the thread's VISIBLE span (F.span), not blindly
        // u∈[0,1] — perspective formations map u far past the viewport.
        const spn = F.span ? F.span(i) : null;
        const s0 = spn ? spn[0] : 0, s1 = spn ? spn[1] : 1;
        const uHead = s0 + (dir === 1 ? hp : 1 - hp) * (s1 - s0);
        const uTail = Math.max(s0, Math.min(s1, uHead - dir * GLN.width * (s1 - s0)));
        F.pt(i, uTail, pA);
        F.pt(i, uHead, pB);
        if (Math.abs(pA.x - pB.x) + Math.abs(pA.y - pB.y) < 2) continue;
        const grad = ctx.createLinearGradient(pA.x, pA.y, pB.x, pB.y);
        // Streak hue seeded from the thread's spectrum position, like the
        // masthead (colorPos * 60) — the shimmer tracks the thread's colour.
        const hueBase = glintT * 30 + g * 140 + cp * 60;
        // Streak brightness rides the thread's own visibility — a ghost-faint
        // far row carries a ghost-faint glint, never a spotlight.
        const vis = Math.min(1, c[3] * 5);
        for (let q = 0; q <= 6; q++) {
          const f = q / 6;
          const hue = wrap(hueBase + f * 150, 360);
          grad.addColorStop(f, `hsla(${hue.toFixed(0)}, ${sat}%, ${(60 + f * 28).toFixed(0)}%, ${(Math.pow(f, 1.8) * GLN.strength * wgt * vis).toFixed(3)})`);
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
          if (i < TRON.rows) { const c = PAL.lbl; return [c[0], c[1], c[2], 0.17 * tronFade(tronRowZ(i)), 1]; }
          if (i < TRON.rows + TRON.lanes) { const c = PAL.lbl; return [c[0], c[1], c[2], 0.10, 1]; }
          const rr = (i - TRON.rows - TRON.lanes) % TRON.racers;
          const c = [PAL.red, PAL.gold, PAL.blu, PAL.green, PAL.yel, PAL.lbl][rr]; // theme-reactive
          const R = racers[rr];
          const head = wrap(T * TRON.speed + rr * (R.tot / TRON.racers) * 1.7, R.tot + 9);
          return [c[0], c[1], c[2], head < R.tot ? 0.72 : 0, 2.2 * sizeScale];
        },
        hue: (i) => (i < TRON.rows + TRON.lanes ? 0.9 : [0.05, 0.35, 0.95, 0.7, 0.5, 0.85][(i - TRON.rows - TRON.lanes) % TRON.racers]),
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
          const c = mixc(PAL.lbl, PAL.blu, near);
          return [c[0], c[1], c[2], (0.05 + 0.33 * Math.pow(near, 1.6)) * canyonFade(zw), (0.7 + 1.7 * near) * sizeScale];
        },
        // all-cool formation: threads live in the blue family, so only the
        // cool glint lane fires here — hue-honest, like the masthead's
        // "quiet families are skipped entirely"
        hue: (i) => 0.8 + 0.15 * (1 - (canyonRowZ(i) - CAN.zN) / (CAN.zF - CAN.zN)),
        // Glint choreography: a pulse that recedes INTO the canyon — rows
        // fire in depth order (not a linear sweep, not everyone at once)...
        order: (i) => (canyonRowZ(i) - CAN.zN) / (CAN.zF - CAN.zN),
        scatter: 0.85,
        // ...and each row's streak rides only its VISIBLE span, so near rows
        // finally carry beam riders across the foreground instead of glinting
        // off-screen (a near row's u-range spans several screen-widths).
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
          const c = i < L / 2 ? PAL.blu : PAL.red;
          return [c[0], c[1], c[2], i % MO.blipEvery === 0 ? 0.19 : 0.12, 1];
        },
        hue: (i) => (i < L / 2 ? 0.9 : 0.08), // the two grids ARE the two hue families
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
          const rg = Math.max(24, PEN.gearRing);
          const rw = Math.max(6, Math.min(PEN.gearWheel, rg - 6));
          penD.cyc = Math.floor(L / 3);
          penD.step = 6.283 * rw / (rg - rw); // petal advance per loop — the gear ratio speaking
          const S = Math.min(W, H) * PEN.size;
          penD.orbit = S * (rg - rw) / rg;
          penD.loopR = S * (rw / rg) * PEN.penHole;
          penD.prog = PEN.draw > 0 ? T * PEN.draw : -1; // -1 = complete figure, no drawing cycle
        },
        pt: (i, u, o) => {
          const fam = i % 3, k = (i - fam) / 3;
          let ph = 1, absIdx = k;
          if (penD.prog >= 0) {
            ph = wrap(penD.prog - k, penD.cyc);
            absIdx = penD.prog - ph; // continuous loop index — stations advance forever
          }
          const arc = Math.min(1, ph); // the loop being inked grows to full
          const thC = fam * 2.09 + absIdx * penD.step + T * PEN.prec * (fam === 1 ? -1 : 1);
          const r = penD.loopR * (1 - k * PEN.shrink);
          const cx = W * (0.5 + [-PEN.spreadX, PEN.spreadX, 0][fam]) + Math.cos(thC) * penD.orbit + Math.sin(T * 0.07 + fam * 2.1) * W * PEN.sway;
          const cy = H * (0.47 + [-0.06, 0.05, 0.34][fam]) + Math.sin(thC) * penD.orbit * 0.55 + Math.cos(T * 0.055 + fam * 1.4) * H * PEN.sway * 0.6;
          const th = u * 6.283 * arc;
          const ringRot = thC * PEN.twist;
          const x1 = Math.cos(th) * r, y1 = Math.sin(th) * r * (1 - PEN.ecc);
          const cr = Math.cos(ringRot), sr = Math.sin(ringRot);
          o.x = cx + x1 * cr - y1 * sr;
          o.y = cy + (x1 * sr + y1 * cr) * 0.9;
        },
        col: (i) => {
          const fam = i % 3, k = (i - fam) / 3;
          // the Coral trio (green / red / pale) in theme-reactive tokens
          const c = [PAL.green, PAL.red, PAL.lbl][fam];
          let alMul = 1;
          if (penD.prog >= 0) {
            const ph = wrap(penD.prog - k, penD.cyc);
            alMul = 1 - ss(penD.cyc - 2.5, penD.cyc - 0.2, ph); // oldest loops dissolve ahead of the pen
          }
          return [c[0], c[1], c[2], (k % 5 === 0 ? 0.30 : 0.185) * alMul, 1.3 * sizeScale];
        },
        hue: (i) => [0.68, 0.06, 0.88][i % 3], // green / red / pale on the spectrum axis
        // Glints chase the pen: loops fire in inking order (newest first),
        // cascading back around the whole figure — front-to-back — while the
        // colour lanes cross it left-to-right from opposite directions.
        order: (i) => {
          const k = (i - (i % 3)) / 3;
          return penD.prog >= 0 ? wrap(penD.prog - k, penD.cyc) / Math.max(1, penD.cyc) : k / Math.max(1, penD.cyc);
        },
        scatter: 0.9,
        pts: (i) => {
          if (penD.prog < 0) return 52;
          const ph = wrap(penD.prog - ((i - (i % 3)) / 3), penD.cyc);
          return 8 + Math.round(Math.min(1, ph) * 44); // resolution grows with the ink
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
        ctx.strokeStyle = `rgba(${lerp(ca[0], cb[0], mix) | 0},${lerp(ca[1], cb[1], mix) | 0},${lerp(ca[2], cb[2], mix) | 0},${al.toFixed(3)})`;
        ctx.lineWidth = Math.max(0.5, lerp(ca[4], cb[4], mix) * ENG.lineWidth);
        ctx.beginPath();
        for (let j = 0; j < n; j++) {
          const u = j / (n - 1);
          FA.pt(i, u, pA);
          let x = pA.x, y = pA.y;
          if (blending) { FB.pt(i, u, pB); x = lerp(x, pB.x, mix); y = lerp(y, pB.y, mix); }
          if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
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
