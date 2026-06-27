import React, { useEffect, useRef } from 'react';
import { resolveCssColor } from '../explore/styles/tokens';

export default function HarmonicCanvas({ position = 'absolute', opacity = 1, themeKey = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // ── Device pixel ratio for crisp rendering without overdraw ──
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x

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
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId) {
          lastFrameTime = performance.now();
          animationFrameId = requestAnimationFrame(render);
        } else if (!isVisible && animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      });
    }, { rootMargin: '100px' });
    observer.observe(canvas);

    // ── Helper functions ──
    const lerp = (start, end, t) => start + (end - start) * t;
    const sweep = (t) => Math.asin(Math.sin(t)) * (2 / Math.PI);

    // ── Tunable motion parameters ───────────────────────────────────────────
    // These drive the three behaviours the masthead is going for:
    //   • moirePhaseSpread → PHASE SHIFTING: each stacked line samples the
    //     curves at a slightly offset time, so the layers slide past one another
    //     and read as a translucent ribbon rotating in space (the moiré effect).
    //   • parentSeparation / loopAmpScale → TENSION & RELEASE: how far the two
    //     invisible parent curves sit apart and how hard the looping term shoves
    //     them, so they cross into tight knots, then unravel into wide arcs.
    //   • travelSpeed / waveFreq / ampYScale → CONTINUOUS OSCILLATION: the slow
    //     Lissajous "breathing" drift of the anchor points.
    // An interactive tuner that mirrors this math lives at docs/harmonic-tuner.html —
    // dial it there, then copy the values back into this block.
    const PARAMS = {
      speed: 0.03,             // global time scale (higher = faster overall)
      travelSpeed: 0.0012,     // traveling-wave propagation along each curve
      waveFreq: 2.8,           // number of waves packed along a curve
      moirePhaseSpread: 420,   // per-line time offset across ribbon depth (the moiré)
      ampXScale: 0.55,         // horizontal sweep amplitude
      ampYScale: 0.75,         // vertical sweep amplitude
      rippleAmpScale: 0.20,    // fast secondary "wind ripple"
      loopAmpScale: 0.35,      // figure-8 / knot-forming push
      parentSeparation: 0.35,  // vertical gap between the two parent curves (smaller = more knots)
      endAnchorMargin: 0.6,    // how far past the edge the line ENDS are pinned (×half). Keeps endpoints off-canvas
      nodeCount: 7,            // control points per curve — MORE = more kinks/weave along each line (min 4)
      kinkDepth: 1.35,         // how hard interior points wander (>1 = curvier, knottier; 1 = gentle arcs)
      focalLength: 800,        // perspective depth (lower = stronger 3D)
      lineWidth: 1.8,          // stroke weight multiplier
    };

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

    // Higher density of steps to make it look like a detailed mesh ribbon, similar to the ad
    const steps = 48;
    const halfSteps = 32;

    let initialized = false;
    let deferTimer;
    const precomputedStyles1 = [];
    const precomputedStyles2 = [];

    const initColors = () => {
      const cRed = parseColor('--c-red', [217, 79, 79]);
      const cGold = parseColor('--c-gold', [212, 160, 48]);
      const cBlue = parseColor('--c-blue', [91, 147, 199]);

      precomputedStyles1.length = 0;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const alpha = Math.sin(t * Math.PI) * 0.5 + 0.2;
        const r = Math.round(lerp(cRed[0], cGold[0], t));
        const g = Math.round(lerp(cRed[1], cGold[1], t));
        const b = Math.round(lerp(cRed[2], cGold[2], t));
        precomputedStyles1.push(`rgba(${r}, ${g}, ${b}, ${alpha})`);
      }

      precomputedStyles2.length = 0;
      for (let i = 0; i <= halfSteps; i++) {
        const t = i / halfSteps;
        const alpha = Math.sin(t * Math.PI) * 0.5 + 0.2;
        const r = Math.round(lerp(cGold[0], cBlue[0], t));
        const g = Math.round(lerp(cGold[1], cBlue[1], t));
        const b = Math.round(lerp(cGold[2], cBlue[2], t));
        precomputedStyles2.push(`rgba(${r}, ${g}, ${b}, ${alpha})`);
      }
      initialized = true;
    };

    const totalLines = (steps + 1) + (halfSteps + 1);
    const nodeCount = Math.max(4, Math.round(PARAMS.nodeCount));
    const linesToDraw = Array.from({ length: totalLines }, () => ({
      pts: Array.from({ length: nodeCount }, () => ({ x: 0, y: 0 })),
      avgZ: 0, scale: 0, style: ''
    }));

    // ── Delta-time animation ──
    // Instead of `time += constant` per frame (which runs faster on 
    // high-refresh displays), we accumulate real elapsed milliseconds.
    // This makes the animation speed identical on 60Hz, 120Hz, or 240Hz.
    let time = 0;
    let lastFrameTime = performance.now();

    // Target ~30fps for this ambient animation — no need for 60+fps
    const MIN_FRAME_INTERVAL = 1000 / 30; // ~33ms

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

    const generateRibbon = (parent1, parent2, precomputedStyles, ribbonSteps, startIdx) => {
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
      time += delta * SPEED;
      lastFrameTime = now;

      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;

      // Scale line thickness proportional to container size
      // Reference diagonal ~1400px (full-viewport hero). Smaller containers get thinner lines.
      const diag = Math.sqrt(cw * cw + ch * ch);
      const sizeScale = Math.max(0.3, diag / 1400);

      ctx.clearRect(0, 0, cw, ch);

      let idx = 0;
      idx = generateRibbon(r1_p1, r1_p2, precomputedStyles1, steps, idx);
      generateRibbon(r2_p1, r2_p2, precomputedStyles2, halfSteps, idx);

      // Z-sort for depth ordering
      linesToDraw.sort((a, b) => b.avgZ - a.avgZ);

      // ── Batch draw with a single path where possible ──
      // Group by style to minimize state changes (significant perf win on canvas)
      const styleGroups = new Map();
      for (const line of linesToDraw) {
        // Stroke weight (PARAMS.lineWidth), scaled by depth + container size
        const w = Math.max(0.4, line.scale * PARAMS.lineWidth * sizeScale);
        const key = `${line.style}|${w.toFixed(2)}`;
        if (!styleGroups.has(key)) {
          styleGroups.set(key, { style: line.style, width: w, lines: [] });
        }
        styleGroups.get(key).lines.push(line);
      }

      for (const group of styleGroups.values()) {
        ctx.strokeStyle = group.style;
        ctx.lineWidth = group.width;
        ctx.beginPath();
        for (const line of group.lines) {
          const pts = line.pts;
          const n = pts.length;
          ctx.moveTo(pts[0].x, pts[0].y);
          // Catmull-Rom → cubic bezier: one smooth curve woven through every
          // control point, so the line kinks and twists instead of arcing once.
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
        }
        ctx.stroke();
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
    };
  }, [themeKey]);

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
