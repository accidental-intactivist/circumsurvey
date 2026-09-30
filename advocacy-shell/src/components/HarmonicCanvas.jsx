import React, { useEffect, useRef } from 'react';

// ── Simplified resolveCssColor for Phase 2 ──
// Phase 2 doesn't have the complex theme system, so we just resolve
// CSS vars from the document or return static fallbacks.
const FALLBACKS = {
  '--c-red': '#e53935',
  '--c-gold': '#d4a030',
  '--c-blue': '#42a5f5',
};

function resolveCssColor(varStr) {
  const match = String(varStr).match(/var\(([^)]+)\)/);
  if (match) {
    const varName = match[1];
    if (typeof window !== 'undefined') {
      const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      if (val) return val;
    }
    if (FALLBACKS[varName]) return FALLBACKS[varName];
  }
  if (typeof varStr === 'string' && (varStr.startsWith('#') || varStr.startsWith('rgb'))) return varStr;
  return null;
}

// ── The Harmonic Loom configuration ────────────────────────────────────────
export const LOOM_CONFIG = {
  speed: 0.018,
  travelSpeed: 0.0014,
  waveFreq: 3.80,
  moirePhaseSpread: 520,
  ampXScale: 0.47,
  ampYScale: 0.58,
  rippleAmpScale: 0.52,
  loopAmpScale: 0.32,
  parentSeparation: 0.32,
  endAnchorMargin: 0.15,
  nodeCount: 6,
  kinkDepth: 0.5,
  focalLength: 1270,
  lineWidth: 4,
  glintGroups: 2,
  glintInterval: 20,
  glintSpeed: 0.05,
  glintWidth: 0.15,
  glintStrength: 0.5,
  glintTint: 0,
};

export default function HarmonicCanvas({ position = 'absolute', opacity = 1, themeKey = '', paused = false }) {
  const canvasRef = useRef(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let pausedHeld = false;

    const prefersReduced = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = typeof window.matchMedia === 'function'
      && window.matchMedia('(pointer: coarse)').matches;
    const fewCores = (navigator.hardwareConcurrency || 8) <= 4;
    const smallScreen = Math.min(window.innerWidth || 9999, window.innerHeight || 9999) < 700;
    const lowPower = prefersReduced || coarsePointer || fewCores || smallScreen;

    const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pausedHeld = false;
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

    const lerp = (start, end, t) => start + (end - start) * t;

    const PARAMS = LOOM_CONFIG;

    const createNode = (type, wavy = false) => ({
      type, wavy,
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

    const sep = PARAMS.parentSeparation;
    const r1_p1 = createHorizontalCurve(-sep);
    const r1_p2 = createHorizontalCurve(sep);
    const r2_p1 = createHorizontalCurve(-sep * 0.7);
    const r2_p2 = createHorizontalCurve(sep * 1.3);

    const parseColor = (cssVar, fallback) => {
      const raw = resolveCssColor(`var(${cssVar})`);
      if (!raw) return fallback;
      if (raw.startsWith('#')) {
        const hex = raw.length === 4
          ? raw.slice(1).split('').map(c => parseInt(c + c, 16))
          : [parseInt(raw.slice(1,3),16), parseInt(raw.slice(3,5),16), parseInt(raw.slice(5,7),16)];
        return hex;
      }
      const m = raw.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (m) return [+m[1], +m[2], +m[3]];
      return fallback;
    };

    const focalLength = PARAMS.focalLength;
    const steps = lowPower ? 30 : 48;
    const halfSteps = lowPower ? 20 : 32;

    let initialized = false;
    let deferTimer;
    const precomputedStyles1 = [];
    const precomputedStyles2 = [];
    const precomputedRGB1 = [];
    const precomputedRGB2 = [];

    const initColors = () => {
      const cRed = parseColor('--c-red', [229, 57, 53]);
      const cGold = parseColor('--c-gold', [212, 160, 48]);
      const cBlue = parseColor('--c-blue', [66, 165, 245]);

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
      phase: Math.random() * Math.PI * 2
    }));

    let time = 0;
    let glintTime = 0;
    let lastFrameTime = performance.now();
    const MIN_FRAME_INTERVAL = 1000 / (lowPower ? 24 : 30);
    const SPEED = PARAMS.speed;

    const evalParentNode = (n, t) => {
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      const span = Math.max(cw, ch);
      const half = span / 2;
      const xFract = n.xFract ?? 0.5;
      const xBase = -half - 100 + xFract * (span + 200);
      const speed = PARAMS.travelSpeed;
      const waveFreq = PARAMS.waveFreq;
      const travelingPhase = t * speed - xFract * waveFreq * Math.PI * 2;
      const phaseX = t * n.fx + n.px + travelingPhase;
      const phaseY = t * n.fy + n.py + travelingPhase * 1.5;
      const ripplePhase = t * (speed * 2.2) - xFract * (waveFreq * 2.5) * Math.PI * 2 + n.px;
      const loopPhase = t * (speed * 1.9) - xFract * (waveFreq * 1.7) * Math.PI * 2 + n.py;
      const k = n.type === 'inner' ? PARAMS.kinkDepth : 1;
      const ampX = half * PARAMS.ampXScale * n.ax * k;
      const ampY = half * PARAMS.ampYScale * n.ay * k;
      const rippleAmp = half * PARAMS.rippleAmpScale * n.ay * k;
      const loopAmp = half * PARAMS.loopAmpScale * n.ax * k;
      const offset = (n.offsetYMultiplier ?? 0) * half;
      const y = Math.sin(phaseY) * ampY + Math.cos(ripplePhase) * rippleAmp + Math.cos(loopPhase * 1.5) * (rippleAmp * 1.2) + offset;

      if (n.type === 'left' || n.type === 'right') {
        const dir = n.type === 'left' ? -1 : 1;
        return { x: dir * half * (1 + PARAMS.endAnchorMargin), y, z: 0 };
      }

      const x = xBase + Math.cos(phaseX) * ampX + Math.sin(loopPhase) * loopAmp;
      const z = Math.sin(t * n.fz + n.pz) * n.az;
      return { x, y, z };
    };

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
        x: 0.5 * (2*p1.x + (-p0.x+p2.x)*t + (2*p0.x-5*p1.x+4*p2.x-p3.x)*t2 + (-p0.x+3*p1.x-3*p2.x+p3.x)*t3),
        y: 0.5 * (2*p1.y + (-p0.y+p2.y)*t + (2*p0.y-5*p1.y+4*p2.y-p3.y)*t2 + (-p0.y+3*p1.y-3*p2.y+p3.y)*t3)
      };
    };

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
        const linearBlend = i / ribbonSteps;
        const blend = 0.5 - Math.cos(linearBlend * Math.PI) * 0.5;
        const lineTime = time + (linearBlend - 0.5) * PARAMS.moirePhaseSpread;
        const line = linesToDraw[lineIdx++];
        const nc = parent1.length;
        let zSum = 0, scaleSum = 0;
        for (let j = 0; j < nc; j++) {
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
        line.avgZ = zSum / nc;
        line.scale = scaleSum / nc;
        line.style = precomputedStyles[i];
        line.rgb = precomputedRGB[i];
        line.colorPos = colorStart + (ribbonSteps > 0 ? i / ribbonSteps : 0) * (colorEnd - colorStart);
      }
      return lineIdx;
    };

    const render = (now) => {
      if (!initialized) return;
      if (!isVisible) { animationFrameId = null; return; }
      const elapsed = now - lastFrameTime;
      if (elapsed < MIN_FRAME_INTERVAL) { animationFrameId = requestAnimationFrame(render); return; }
      const delta = Math.min(elapsed, 100);
      lastFrameTime = now;
      if (pausedRef.current) {
        if (pausedHeld) { animationFrameId = requestAnimationFrame(render); return; }
        pausedHeld = true;
      } else { pausedHeld = false; }

      time += delta * SPEED;
      glintTime += delta;
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      const diag = Math.sqrt(cw * cw + ch * ch);
      const sizeScale = Math.max(0.3, diag / 1400);
      ctx.clearRect(0, 0, cw, ch);

      let idx = 0;
      idx = generateRibbon(r1_p1, r1_p2, precomputedStyles1, precomputedRGB1, steps, idx, 0, 0.5);
      generateRibbon(r2_p1, r2_p2, precomputedStyles2, precomputedRGB2, halfSteps, idx, 0.5, 1);
      linesToDraw.sort((a, b) => b.avgZ - a.avgZ);

      const styleGroups = new Map();
      for (const line of linesToDraw) {
        const w = Math.max(0.4, line.scale * PARAMS.lineWidth * Math.min(sizeScale, 1));
        const key = `${line.style}|${w.toFixed(2)}`;
        if (!styleGroups.has(key)) styleGroups.set(key, { style: line.style, width: w, lines: [] });
        styleGroups.get(key).lines.push(line);
      }

      for (const group of styleGroups.values()) {
        ctx.strokeStyle = group.style;
        ctx.lineWidth = group.width;
        ctx.beginPath();
        for (const line of group.lines) traceSpline(line.pts);
        ctx.stroke();
      }

      // ── Glisten ──
      if (PARAMS.glintGroups > 0) {
        const groups = Math.max(1, Math.round(PARAMS.glintGroups));
        const tailFrac = Math.max(0.02, PARAMS.glintWidth);
        const sat = Math.max(0, Math.min(100, Math.round(95 - PARAMS.glintTint * 60)));
        const A = PARAMS.glintStrength;
        const N = lowPower ? 32 : 64;
        const tSec = glintTime / 1000;
        const period = Math.max(0.5, PARAMS.glintInterval);
        const spd = Math.max(0.001, PARAMS.glintSpeed);
        const travelT = Math.min(period, 1 / spd);

        const headByGroup = new Array(groups);
        const dirByGroup = new Array(groups);
        let anyActive = false;
        for (let g = 0; g < groups; g++) {
          dirByGroup[g] = (g % 2 === 0) ? 1 : -1;
          const off = (g / groups) * period;
          const localT = (((tSec - off) % period) + period) % period;
          if (localT < travelT) { headByGroup[g] = localT / travelT; anyActive = true; }
          else headByGroup[g] = -1;
        }

        if (anyActive) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          for (const line of linesToDraw) {
            const g = Math.min(groups - 1, Math.max(0, Math.floor((line.colorPos || 0) * groups)));
            const hp0 = headByGroup[g];
            if (hp0 < 0) continue;
            const dir = dirByGroup[g];
            const pts = line.pts;
            const w = Math.max(1, line.scale * PARAMS.lineWidth * sizeScale * 1.5);
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
              return { x: sx[i-1] + (sx[i]-sx[i-1])*t, y: sy[i-1] + (sy[i]-sy[i-1])*t };
            };
            const hp = dir === 1 ? hp0 : (1 - hp0);
            const sHead = hp * total;
            const sTail = dir === 1 ? Math.max(0, sHead - tailLen) : Math.min(total, sHead + tailLen);
            if (Math.abs(sHead - sTail) < 0.5) continue;
            const T = at(sTail), H = at(sHead);
            const grad = ctx.createLinearGradient(T.x, T.y, H.x, H.y);
            const hueBase = glintTime * 0.03 + g * 140 + (line.colorPos || 0) * 60;
            for (let q = 0; q <= 6; q++) {
              const f = q / 6;
              const hue = (((hueBase + f * 150) % 360) + 360) % 360;
              const light = 60 + f * 28;
              const alpha = Math.pow(f, 1.8) * A;
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
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
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
