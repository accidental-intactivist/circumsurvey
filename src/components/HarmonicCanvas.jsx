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

    const createHorizontalCurve = (offsetYMultiplier = 0) => [
      { ...createNode('left'), xFract: 0.0, offsetYMultiplier },
      { ...createNode('inner', true), xFract: 0.33, offsetYMultiplier },
      { ...createNode('inner', true), xFract: 0.66, offsetYMultiplier },
      { ...createNode('right'), xFract: 1.0, offsetYMultiplier }
    ];

    // Define the Two Invisible Parent Lines for Ribbon 1
    const r1_p1 = createHorizontalCurve(-0.35);
    const r1_p2 = createHorizontalCurve(0.35);

    // Define the Two Invisible Parent Lines for Ribbon 2
    const r2_p1 = createHorizontalCurve(-0.25);
    const r2_p2 = createHorizontalCurve(0.45);

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

    const focalLength = 800;

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
    const linesToDraw = Array.from({ length: totalLines }, () => ({
      x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0,
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

    // Speed multiplier: lower = slower. Was effectively ~10.66 per 16ms frame 
    // (≈666 units/sec). We slow it down to ~50 units/sec for a very chilled feel.
    const SPEED = 0.03;

    const evalParentNode = (n, t) => {
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      const span = Math.max(cw, ch);
      const half = span / 2;

      const xFract = n.xFract ?? 0.5;
      const xBase = -half - 100 + xFract * (span + 200);

      const speed = 0.0012;
      const waveFreq = 2.8; // Increased for more waves (scarf-like)
      const travelingPhase = t * speed - xFract * waveFreq * Math.PI * 2;

      const phaseX = t * n.fx + n.px + travelingPhase;
      const phaseY = t * n.fy + n.py + travelingPhase * 1.5;
      
      // Secondary fast ripple for scarf-in-the-wind effect
      const ripplePhase = t * (speed * 2.2) - xFract * (waveFreq * 2.5) * Math.PI * 2 + n.px;
      
      // "Unstarched" looping phase to force figure-8 knots and backward folds
      const loopPhase = t * (speed * 1.9) - xFract * (waveFreq * 1.7) * Math.PI * 2 + n.py;

      const ampX = half * 0.55 * n.ax;
      const ampY = half * 0.75 * n.ay; 
      const rippleAmp = half * 0.20 * n.ay; 
      const loopAmp = half * 0.35 * n.ax; // Large enough horizontal push to fold the fabric backwards

      // X includes the base traveling sweep + a looping modifier
      const x = xBase + Math.cos(phaseX) * ampX + Math.sin(loopPhase) * loopAmp;
      
      const offset = (n.offsetYMultiplier ?? 0) * half;
      
      // Y includes base sweep + wind ripples + a figure-8 vertical knot component tied to the loop
      const y = Math.sin(phaseY) * ampY + Math.cos(ripplePhase) * rippleAmp + Math.cos(loopPhase * 1.5) * (rippleAmp * 1.2) + offset;
      
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

      const p1_0 = evalParentNode(parent1[0], time);
      const p1_1 = evalParentNode(parent1[1], time);
      const p1_2 = evalParentNode(parent1[2], time);
      const p1_3 = evalParentNode(parent1[3], time);

      const p2_0 = evalParentNode(parent2[0], time);
      const p2_1 = evalParentNode(parent2[1], time);
      const p2_2 = evalParentNode(parent2[2], time);
      const p2_3 = evalParentNode(parent2[3], time);

      let lineIdx = startIdx;
      for (let i = 0; i <= ribbonSteps; i++) {
        // Faux 3D Shading: Cosine interpolation bunches lines up at the edges (0 and 1) and spreads them out in the middle
        const linearBlend = i / ribbonSteps;
        const blend = 0.5 - Math.cos(linearBlend * Math.PI) * 0.5;
        const c0 = lerpNode(p1_0, p2_0, blend);
        const c1 = lerpNode(p1_1, p2_1, blend);
        const c2 = lerpNode(p1_2, p2_2, blend);
        const c3 = lerpNode(p1_3, p2_3, blend);

        const scale0 = focalLength / Math.max(1, focalLength + c0.z);
        const scale1 = focalLength / Math.max(1, focalLength + c1.z);
        const scale2 = focalLength / Math.max(1, focalLength + c2.z);
        const scale3 = focalLength / Math.max(1, focalLength + c3.z);

        const line = linesToDraw[lineIdx++];
        
        line.x0 = cx + c0.x * scale0; line.y0 = cy + c0.y * scale0;
        line.x1 = cx + c1.x * scale1; line.y1 = cy + c1.y * scale1;
        line.x2 = cx + c2.x * scale2; line.y2 = cy + c2.y * scale2;
        line.x3 = cx + c3.x * scale3; line.y3 = cy + c3.y * scale3;

        line.avgZ = (c0.z + c1.z + c2.z + c3.z) * 0.25;
        line.scale = (scale0 + scale1 + scale2 + scale3) * 0.25;
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
        // Significantly increase thickness for bolder lines (from 0.7 to 1.8)
        const w = Math.max(0.4, line.scale * 1.8 * sizeScale);
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
          ctx.moveTo(line.x0, line.y0);
          ctx.bezierCurveTo(line.x1, line.y1, line.x2, line.y2, line.x3, line.y3);
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
