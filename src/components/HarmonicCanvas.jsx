import React, { useEffect, useRef, useState } from 'react';
import { resolveCssColor } from '../explore/styles/tokens';
import { useTelemetry } from '../explore/lib/telemetry';

// ── The Harmonic Loom configuration ────────────────────────────────────────
// Single source of truth for the masthead's motion + glisten. The component
// reads it below, and the AI Docent echoes it via the `/loom` command, so the
// live values are always discoverable from inside the app.
//   • moirePhaseSpread → PHASE SHIFTING (the moiré: layers sliding past each other)
//   • parentSeparation / loopAmpScale → TENSION & RELEASE (knots, then wide arcs)
//   • travelSpeed / waveFreq / ampYScale → CONTINUOUS OSCILLATION (the slow drift)
// An interactive tuner that mirrors this math lives at docs/harmonic-tuner.html.
export const LOOM_CONFIG = {
  speed: 0.018,            // global time scale
  travelSpeed: 0.0014,     // traveling-wave propagation along each curve
  waveFreq: 3.80,          // number of waves packed along a curve
  moirePhaseSpread: 520,   // per-line time offset across ribbon depth (the moiré)
  ampXScale: 0.47,         // horizontal sweep amplitude
  ampYScale: 0.58,         // vertical sweep amplitude
  rippleAmpScale: 0.52,    // fast secondary "wind ripple"
  loopAmpScale: 0.32,      // figure-8 / knot-forming push
  parentSeparation: 0.32,  // vertical gap between the two parent curves (smaller = more knots)
  endAnchorMargin: 0.15,   // how far past the edge the line ENDS are pinned (×half)
  nodeCount: 6,            // control points per curve — MORE = more kinks/weave
  kinkDepth: 0.5,          // how hard interior points wander (>1 = curvier, knottier)
  focalLength: 1270,       // perspective depth (lower = stronger 3D)
  lineWidth: 4,            // stroke weight multiplier
  // THE GLISTEN — an occasional event, organised by COLOUR FAMILY. Lines are
  // binned by hue into `glintGroups` families; each family gets its own glint
  // that alternates direction and is staggered in time, so glints cross.
  glintGroups: 2,          // colour families, each with its own glint lane
  glintInterval: 20,       // SECONDS between a family's glints (families staggered)
  glintSpeed: 0.05,        // pace of a pass (line-lengths/sec)
  glintWidth: 0.15,        // streak (tail) length as a FRACTION of the line
  glintStrength: 0.5,      // brightness of the streak (0–1)
  glintTint: 0,            // HOLOGRAPHIC saturation: 0 = vivid rainbow, 1 = pearly white
};

export default function HarmonicCanvas({ position = 'absolute', opacity = 1, themeKey = '', paused = false }) {
  const canvasRef = useRef(null);
  const pausedRef = useRef(paused);
  const { trackEvent } = useTelemetry();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Yield the main thread for FCP before spinning up heavy canvases
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    // Paused = HOLD, not blank: when paused we draw exactly one frame and
    // keep it (reset on resize so a held frame is never stretched/blank).
    let pausedHeld = false;

    // ── Low-power / mobile detection ──
    // Phones (and reduced-motion users) get a lighter render: lower DPR, fewer
    // threads, coarser glint sampling, and a slower frame cap — so the masthead
    // never thrashes a small browser. Desktop keeps full fidelity.
    const prefersReduced = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = typeof window.matchMedia === 'function'
      && window.matchMedia('(pointer: coarse)').matches;
    const fewCores = (navigator.hardwareConcurrency || 8) <= 4;
    const smallScreen = Math.min(window.innerWidth || 9999, window.innerHeight || 9999) < 700;
    const lowPower = prefersReduced || coarsePointer || fewCores || smallScreen;

    // ── Device pixel ratio for crisp rendering without overdraw ──
    const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);

    // Set canvas to parent size, respecting DPR
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pausedHeld = false; // resizing clears the canvas — re-draw the held frame
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let isVisible = true;
    let startTime = null;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId) {
          lastFrameTime = performance.now();
          animationFrameId = requestAnimationFrame(render);
          if (!startTime) {
            startTime = Date.now();
          }
        } else if (!isVisible && animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
          if (startTime) {
            const dwellTime = Date.now() - startTime;
            trackEvent('harmonic_canvas_dwelled', { dwell_time_ms: dwellTime });
            startTime = null;
          }
        }
      });
    }, { rootMargin: '100px' });
    observer.observe(canvas);

    // ── Helper functions ──
    const lerp = (start, end, t) => start + (end - start) * t;
    const sweep = (t) => Math.asin(Math.sin(t)) * (2 / Math.PI);

    // Motion + glisten config (the "Harmonic Loom"). Single source of truth is
    // LOOM_CONFIG at module scope (also surfaced by the Docent's /loom command).
    const PARAMS = LOOM_CONFIG;

    const createNode = (type, wavy = false) => ({
      type,
      wavy,
      ax: Math.random() * 0.5 + 0.7,
      ay: Math.random() * 0.5 + 0.7,
      az: (Math.random() * 0.5 + 0.5) * 600,
      fx: (Math.random() * 0.0015) + 0.0005,
      fy: (Math.random() * 0.0015) + 0.0005,
      fz: (Math.random() * 0.0015) + 0.0005,
      px: Math.random() * Math.PI * 2,
      py: Math.random() * Math.PI * 2,
      pz: Math.random() * Math.PI * 2,
    });

    // A curve is a chain of nodeCount control points spread across the width.
    // The first/last are off-canvas anchors; everything between is an "inner"
    // point free to wander — more of them ⇒ more kinks and twists per line.
    const createHorizontalCurve = (offsetYMultiplier = 0) => {
      const n = Math.max(4, Math.round(PARAMS.nodeCount));
      const nodes = [];
      for (let i = 0; i < n; i++) {
        const xFract = i / (n - 1);
        const type = i === 0 ? 'left' : i === n - 1 ? 'right' : 'inner';
        nodes.push({ ...createNode(type, type === 'inner'), xFract, offsetYMultiplier });
      }
      return nodes;
    };

    // Define the Two Invisible Parent Lines for Ribbon 1 (symmetric gap)
    const sep = PARAMS.parentSeparation;
    const r1_p1 = createHorizontalCurve(-sep);
    const r1_p2 = createHorizontalCurve(sep);

    // Define the Two Invisible Parent Lines for Ribbon 2 (offset gap so the
    // two ribbons cross at different moments → richer moiré where they overlap)
    const r2_p1 = createHorizontalCurve(-sep * 0.7);
    const r2_p2 = createHorizontalCurve(sep * 1.3);

    // Custom colors
    // ── Read theme colors from CSS custom properties ──
    // Falls back to the standard palette if vars aren't set.
    const parseColor = (cssVar, fallback) => {
      const raw = resolveCssColor(`var(${cssVar})`);
      if (!raw) return fallback;
      // Handle hex
      if (raw.startsWith('#')) {
        const hex = raw.length === 4
          ? raw.slice(1).split('').map(c => parseInt(c + c, 16))
          : [parseInt(raw.slice(1,3),16), parseInt(raw.slice(3,5),16), parseInt(raw.slice(5,7),16)];
        return hex;
      }
      // Handle rgb(r, g, b)
      const m = raw.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (m) return [+m[1], +m[2], +m[3]];
      return fallback;
    };

    const focalLength = PARAMS.focalLength;

    // Higher density of steps to make it look like a detailed mesh ribbon, similar to the ad.
    // Fewer threads on low-power devices to keep the per-frame work down.
    const steps = lowPower ? 30 : 48;
    const halfSteps = lowPower ? 20 : 32;

    let initialized = false;
    let deferTimer;
    const precomputedStyles1 = [];
    const precomputedStyles2 = [];

    // Per-line base RGB (parallel to precomputedStyles) so the glisten can paint
    // each sparkle as a "brightened" version of that thread's own colour — which
    // is what keeps the shimmer theme-responsive (it tracks the weave palette).
    const precomputedRGB1 = [];
    const precomputedRGB2 = [];

    const initColors = () => {
      const cRed = parseColor('--c-red', [217, 79, 79]);
      const cGold = parseColor('--c-gold', [212, 160, 48]);
      const cBlue = parseColor('--c-blue', [91, 147, 199]);

      precomputedStyles1.length = 0;
      precomputedRGB1.length = 0;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const alpha = Math.sin(t * Math.PI) * 0.5 + 0.2;
        const r = Math.round(lerp(cRed[0], cGold[0], t));
        const g = Math.round(lerp(cRed[1], cGold[1], t));
        const b = Math.round(lerp(cRed[2], cGold[2], t));
        precomputedStyles1.push(`rgba(${r}, ${g}, ${b}, ${alpha})`);
        precomputedRGB1.push([r, g, b]);
      }

      precomputedStyles2.length = 0;
      precomputedRGB2.length = 0;
      for (let i = 0; i <= halfSteps; i++) {
        const t = i / halfSteps;
        const alpha = Math.sin(t * Math.PI) * 0.5 + 0.2;
        const r = Math.round(lerp(cGold[0], cBlue[0], t));
        const g = Math.round(lerp(cGold[1], cBlue[1], t));
        const b = Math.round(lerp(cGold[2], cBlue[2], t));
        precomputedStyles2.push(`rgba(${r}, ${g}, ${b}, ${alpha})`);
        precomputedRGB2.push([r, g, b]);
      }

      initialized = true;
    };

    const totalLines = (steps + 1) + (halfSteps + 1);
    const nodeCount = Math.max(4, Math.round(PARAMS.nodeCount));
    const linesToDraw = Array.from({ length: totalLines }, () => ({
      pts: Array.from({ length: nodeCount }, () => ({ x: 0, y: 0 })),
      avgZ: 0, scale: 0, style: '', rgb: [255, 255, 255], colorPos: 0,
      phase: Math.random() * Math.PI * 2 // stable per-thread seed
    }));

    // (The glisten is drawn in the render loop as sweeping light bars — see below.)

    // ── Delta-time animation ──
    // Instead of `time += constant` per frame (which runs faster on 
    // high-refresh displays), we accumulate real elapsed milliseconds.
    // This makes the animation speed identical on 60Hz, 120Hz, or 240Hz.
    let time = 0;
    let glintTime = 0; // real-ms accumulator for the glisten sweep (decoupled from speed)
    let lastFrameTime = performance.now();

    // Target ~30fps for this ambient animation (24fps on low-power) — no need for 60+fps
    const MIN_FRAME_INTERVAL = 1000 / (lowPower ? 24 : 30);

    // Speed multiplier: lower = slower, for a chilled ambient feel. (See PARAMS.)
    const SPEED = PARAMS.speed;

    const evalParentNode = (n, t) => {
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      const span = Math.max(cw, ch);
      const half = span / 2;

      const xFract = n.xFract ?? 0.5;
      const xBase = -half - 100 + xFract * (span + 200);

      const speed = PARAMS.travelSpeed;
      const waveFreq = PARAMS.waveFreq; // waves packed along each curve (scarf-like)
      const travelingPhase = t * speed - xFract * waveFreq * Math.PI * 2;

      const phaseX = t * n.fx + n.px + travelingPhase;
      const phaseY = t * n.fy + n.py + travelingPhase * 1.5;
      
      // Secondary fast ripple for scarf-in-the-wind effect
      const ripplePhase = t * (speed * 2.2) - xFract * (waveFreq * 2.5) * Math.PI * 2 + n.px;
      
      // "Unstarched" looping phase to force figure-8 knots and backward folds
      const loopPhase = t * (speed * 1.9) - xFract * (waveFreq * 1.7) * Math.PI * 2 + n.py;

      // Interior points wander harder (kinkDepth) so each line genuinely kinks
      // and twists rather than tracing one gentle arc. End anchors keep k = 1.
      const k = n.type === 'inner' ? PARAMS.kinkDepth : 1;
      const ampX = half * PARAMS.ampXScale * n.ax * k;
      const ampY = half * PARAMS.ampYScale * n.ay * k;
      const rippleAmp = half * PARAMS.rippleAmpScale * n.ay * k;
      const loopAmp = half * PARAMS.loopAmpScale * n.ax * k; // horizontal push to fold the fabric backwards

      const offset = (n.offsetYMultiplier ?? 0) * half;

      // Y includes base sweep + wind ripples + a figure-8 vertical knot component tied to the loop
      const y = Math.sin(phaseY) * ampY + Math.cos(ripplePhase) * rippleAmp + Math.cos(loopPhase * 1.5) * (rippleAmp * 1.2) + offset;

      // END ANCHORS OFF-CANVAS: the first/last control point of every curve (the
      // bezier endpoints) is pinned beyond the screen edge and held at flat depth
      // (z = 0) so perspective can't pull it back toward center. The line endpoints
      // therefore always live off-screen — you only ever see the ribbon's body
      // flowing through the frame, never a loose end dancing in the middle. The
      // ends still drift vertically, so the ribbon enters/exits at varying heights.
      if (n.type === 'left' || n.type === 'right') {
        const dir = n.type === 'left' ? -1 : 1;
        return {
          x: dir * half * (1 + PARAMS.endAnchorMargin),
          y,
          z: 0,
        };
      }

      // X includes the base traveling sweep + a looping modifier
      const x = xBase + Math.cos(phaseX) * ampX + Math.sin(loopPhase) * loopAmp;

      const z = Math.sin(t * n.fz + n.pz) * n.az;

      return { x, y, z };
    };

    const lerpNode = (pA, pB, t) => ({
      x: lerp(pA.x, pB.x, t),
      y: lerp(pA.y, pB.y, t),
      z: lerp(pA.z, pB.z, t)
    });

    // Position on the rendered Catmull-Rom spline at u∈[0,1] along the whole line
    // — used to scatter glisten sparkles exactly onto the threads.
    const splinePoint = (pts, u) => {
      const n = pts.length;
      const seg = Math.min(n - 2, Math.floor(u * (n - 1)));
      const t = u * (n - 1) - seg;
      const p0 = pts[seg - 1] || pts[0];
      const p1 = pts[seg];
      const p2 = pts[seg + 1];
      const p3 = pts[seg + 2] || pts[n - 1];
      const t2 = t * t, t3 = t2 * t;
      return {
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
      };
    };

    // Trace a Catmull-Rom spline through a line's points onto the current path
    // (caller handles beginPath/strokeStyle/stroke). Shared by the base weave
    // draw and the glisten overlay so they always follow identical geometry.
    const traceSpline = (pts) => {
      const n = pts.length;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let s = 0; s < n - 1; s++) {
        const p0 = pts[s - 1] || pts[0];
        const p1 = pts[s];
        const p2 = pts[s + 1];
        const p3 = pts[s + 2] || pts[n - 1];
        ctx.bezierCurveTo(
          p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
          p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
          p2.x, p2.y
        );
      }
    };

    const generateRibbon = (parent1, parent2, precomputedStyles, precomputedRGB, ribbonSteps, startIdx, colorStart, colorEnd) => {
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      const cx = cw / 2;
      const cy = ch / 2;

      let lineIdx = startIdx;
      for (let i = 0; i <= ribbonSteps; i++) {
        // Faux 3D Shading: Cosine interpolation bunches lines up at the edges (0 and 1) and spreads them out in the middle
        const linearBlend = i / ribbonSteps;
        const blend = 0.5 - Math.cos(linearBlend * Math.PI) * 0.5;

        // PHASE SHIFTING (moiré): sample the parent curves at a per-line time
        // offset so adjacent layers slide across one another instead of moving
        // as one rigid ruled surface. This is what turns the flat fan of lines
        // into a translucent ribbon that appears to twist in 3D.
        const lineTime = time + (linearBlend - 0.5) * PARAMS.moirePhaseSpread;

        const line = linesToDraw[lineIdx++];
        const nodeCount = parent1.length;
        let zSum = 0;
        let scaleSum = 0;

        // Thread the line through ALL nodeCount points (blended between the two
        // parent curves), each with its own perspective scale. More points here
        // = more kinks; a single cubic could only ever arc once.
        for (let j = 0; j < nodeCount; j++) {
          const a = evalParentNode(parent1[j], lineTime);
          const b = evalParentNode(parent2[j], lineTime);
          const cz = lerp(a.z, b.z, blend);
          const sc = focalLength / Math.max(1, focalLength + cz);
          const pt = line.pts[j];
          pt.x = cx + lerp(a.x, b.x, blend) * sc;
          pt.y = cy + lerp(a.y, b.y, blend) * sc;
          zSum += cz;
          scaleSum += sc;
        }

        line.avgZ = zSum / nodeCount;
        line.scale = scaleSum / nodeCount;
        line.style = precomputedStyles[i];
        line.rgb = precomputedRGB[i];
        // Position along the full red→gold→blue spectrum, for binning into hue families.
        line.colorPos = colorStart + (ribbonSteps > 0 ? i / ribbonSteps : 0) * (colorEnd - colorStart);
      }
      return lineIdx;
    };

    const render = (now) => {
      if (!initialized) return;
      if (!isVisible) {
        animationFrameId = null;
        return;
      }

      // ── Frame throttle: skip if less than MIN_FRAME_INTERVAL elapsed ──
      const elapsed = now - lastFrameTime;
      if (elapsed < MIN_FRAME_INTERVAL) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // ── Delta-time accumulation ──
      // Clamp delta to avoid huge jumps if tab was backgrounded
      const delta = Math.min(elapsed, 100);
      lastFrameTime = now;

      if (pausedRef.current) {
        if (pausedHeld) {
          animationFrameId = requestAnimationFrame(render);
          return; // frame already held — skip all work
        }
        pausedHeld = true; // draw exactly one frame below, then hold it
      } else {
        pausedHeld = false;
      }

      time += delta * SPEED;
      glintTime += delta;

      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;

      // Scale line thickness proportional to container size
      // Reference diagonal ~1400px (full-viewport hero). Smaller containers get thinner lines.
      const diag = Math.sqrt(cw * cw + ch * ch);
      const sizeScale = Math.max(0.3, diag / 1400);

      ctx.clearRect(0, 0, cw, ch);

      let idx = 0;
      idx = generateRibbon(r1_p1, r1_p2, precomputedStyles1, precomputedRGB1, steps, idx, 0, 0.5);
      generateRibbon(r2_p1, r2_p2, precomputedStyles2, precomputedRGB2, halfSteps, idx, 0.5, 1);

      // Z-sort for depth ordering
      linesToDraw.sort((a, b) => b.avgZ - a.avgZ);

      // ── Batch draw with a single path where possible ──
      // Group by style to minimize state changes (significant perf win on canvas)
      const styleGroups = new Map();
      for (const line of linesToDraw) {
        // Stroke weight (PARAMS.lineWidth), scaled by depth + container size
        // Cap the width's size-scaling at 1× so strands don't fatten and blur into
        // each other on large/full-screen displays — keeps individual strands crisp.
        const w = Math.max(0.4, line.scale * PARAMS.lineWidth * Math.min(sizeScale, 1));
        const key = `${line.style}|${w.toFixed(2)}`;
        if (!styleGroups.has(key)) {
          styleGroups.set(key, { style: line.style, width: w, lines: [] });
        }
        styleGroups.get(key).lines.push(line);
      }

      // ── Base weave: the threads themselves ──
      for (const group of styleGroups.values()) {
        ctx.strokeStyle = group.style;
        ctx.lineWidth = group.width;
        ctx.beginPath();
        for (const line of group.lines) traceSpline(line.pts);
        ctx.stroke();
      }

      // ── The glisten: one glint PER COLOUR FAMILY. Lines are binned by hue into
      // `glintGroups` families; each family glints on its own staggered interval and
      // alternates travel direction (left→right vs right→left), so opposite-moving
      // glints of different hues cross. Arc-length paced for a smooth glide; quiet
      // families are skipped entirely. ──
      if (PARAMS.glintGroups > 0) {
        const groups = Math.max(1, Math.round(PARAMS.glintGroups));
        const tailFrac = Math.max(0.02, PARAMS.glintWidth);
        const sat = Math.max(0, Math.min(100, Math.round(95 - PARAMS.glintTint * 60))); // holographic saturation (higher glintTint = whiter)
        const A = PARAMS.glintStrength;
        const N = lowPower ? 32 : 64; // glint samples per line — coarser on phones
        const tSec = glintTime / 1000;
        const period = Math.max(0.5, PARAMS.glintInterval);
        const speed = Math.max(0.001, PARAMS.glintSpeed);
        const travelT = Math.min(period, 1 / speed); // time for one comet to cross a line

        // Per-family head progress (0..1, or -1 when quiet) + travel direction.
        const headByGroup = new Array(groups);
        const dirByGroup = new Array(groups);
        let anyActive = false;
        for (let g = 0; g < groups; g++) {
          dirByGroup[g] = (g % 2 === 0) ? 1 : -1;            // alternate L→R / R→L
          const offset = (g / groups) * period;              // stagger families in time
          const localT = (((tSec - offset) % period) + period) % period;
          if (localT < travelT) { headByGroup[g] = localT / travelT; anyActive = true; }
          else headByGroup[g] = -1;
        }

        if (anyActive) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          for (const line of linesToDraw) {
            const g = Math.min(groups - 1, Math.max(0, Math.floor((line.colorPos || 0) * groups)));
            const hp0 = headByGroup[g];
            if (hp0 < 0) continue; // this colour family isn't glinting right now
            const dir = dirByGroup[g];

            const pts = line.pts;
            const w = Math.max(1, line.scale * PARAMS.lineWidth * sizeScale * 1.5);

            // Dense sample + ARC LENGTH for a constant-speed glide.
            const sx = [], sy = [], cum = [];
            let total = 0, px0 = 0, py0 = 0;
            for (let i = 0; i <= N; i++) {
              const p = splinePoint(pts, i / N);
              sx[i] = p.x; sy[i] = p.y;
              if (i === 0) cum[i] = 0;
              else { total += Math.hypot(p.x - px0, p.y - py0); cum[i] = total; }
              px0 = p.x; py0 = p.y;
            }
            if (total < 1) continue;
            const tailLen = tailFrac * total;
            const at = (s) => {
              let i = 1;
              while (i < N && cum[i] < s) i++;
              const c0 = cum[i - 1], c1 = cum[i];
              const t = c1 > c0 ? (s - c0) / (c1 - c0) : 0;
              return { x: sx[i - 1] + (sx[i] - sx[i - 1]) * t, y: sy[i - 1] + (sy[i] - sy[i - 1]) * t };
            };

            // Head sweeps from the family's start side; tail trails behind it.
            const hp = dir === 1 ? hp0 : (1 - hp0);
            const sHead = hp * total;
            const sTail = dir === 1 ? Math.max(0, sHead - tailLen) : Math.min(total, sHead + tailLen);
            if (Math.abs(sHead - sTail) < 0.5) continue;
            const T = at(sTail), H = at(sHead);
            // HOLOGRAPHIC: a prism of hue runs along the streak, and the base hue
            // drifts over time (offset per colour family) so the glint shimmers
            // like a hologram. Alpha falls off quickly toward the tail (short-lived);
            // higher glintTint desaturates the spectrum toward a pearly white.
            const grad = ctx.createLinearGradient(T.x, T.y, H.x, H.y);
            const hueBase = glintTime * 0.03 + g * 140 + (line.colorPos || 0) * 60;
            for (let q = 0; q <= 6; q++) {
              const f = q / 6;
              const hue = (((hueBase + f * 150) % 360) + 360) % 360;
              const light = 60 + f * 28;             // whiter toward the head
              const alpha = Math.pow(f, 1.8) * A;     // quick tail falloff → short-lived
              grad.addColorStop(f, `hsla(${hue.toFixed(0)}, ${sat}%, ${light.toFixed(0)}%, ${alpha.toFixed(3)})`);
            }
            ctx.strokeStyle = grad;
            ctx.lineWidth = w;
            ctx.beginPath();
            ctx.moveTo(T.x, T.y);
            const sLo = Math.min(sTail, sHead), sHi = Math.max(sTail, sHead);
            if (dir === 1) { for (let i = 0; i <= N; i++) if (cum[i] > sLo && cum[i] < sHi) ctx.lineTo(sx[i], sy[i]); }
            else { for (let i = N; i >= 0; i--) if (cum[i] > sLo && cum[i] < sHi) ctx.lineTo(sx[i], sy[i]); }
            ctx.lineTo(H.x, H.y);
            ctx.stroke();
          }
          ctx.lineCap = 'butt';
          ctx.lineJoin = 'miter';
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    deferTimer = setTimeout(() => {
      initColors();
      if (isVisible && !animationFrameId) {
        lastFrameTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    }, 0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
      if (deferTimer) clearTimeout(deferTimer);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (startTime) {
        const dwellTime = Date.now() - startTime;
        trackEvent('harmonic_canvas_dwelled', { dwell_time_ms: dwellTime });
      }
    };
  }, [themeKey, trackEvent, mounted]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity,
        transition: 'opacity 1.5s ease',
      }}
    />
  );
}
