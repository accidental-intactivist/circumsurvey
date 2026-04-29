import React, { useEffect, useRef } from 'react';

export default function HarmonicCanvas({ position = 'absolute', opacity = 1 }) {
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
      ax: Math.random() * 0.2 + 0.9,
      ay: Math.random() * 0.2 + 0.9,
      az: (Math.random() * 0.5 + 0.5) * 800,
      fx: (Math.random() * 0.00035) + 0.00015,
      fy: (Math.random() * 0.00035) + 0.00015,
      fz: (Math.random() * 0.00035) + 0.00015,
      px: Math.random() * Math.PI * 2,
      py: Math.random() * Math.PI * 2,
      pz: Math.random() * Math.PI * 2,
      loopSpeed: (Math.random() * 0.002) + 0.001,
      loopSwell: (Math.random() * 0.0008) + 0.0004,
    });

    const createHorizontalCurve = () => [
      createNode('left'), createNode('inner'), createNode('inner'), createNode('right')
    ];
    const createVerticalCurve = () => [
      createNode('top'), createNode('inner', true), createNode('inner', true), createNode('bottom')
    ];
    const curve1A = createHorizontalCurve();
    const curve1B = createHorizontalCurve();
    const curve2A = createVerticalCurve();
    const curve2B = createVerticalCurve();

    // Custom colors
    const cRed = [217, 79, 79];
    const cGold = [212, 160, 48];
    const cBlue = [91, 147, 199];

    const focalLength = 800;

    // ── Reduced step count: 24 instead of 45 ──
    // This cuts the number of bezier curves nearly in half while 
    // keeping the ribbons visually smooth.
    const steps = 24;
    const halfSteps = Math.floor(steps / 2);
    
    // Pre-compute color styles (these never change)
    const precomputedStyles1 = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const alpha = Math.sin(t * Math.PI) * 0.6 + 0.3;
      const r = Math.round(lerp(cRed[0], cGold[0], t));
      const g = Math.round(lerp(cRed[1], cGold[1], t));
      const b = Math.round(lerp(cRed[2], cGold[2], t));
      precomputedStyles1.push(`rgba(${r}, ${g}, ${b}, ${alpha})`);
    }

    const precomputedStyles2 = [];
    for (let i = 0; i <= halfSteps; i++) {
      const t = i / halfSteps;
      const alpha = Math.sin(t * Math.PI) * 0.6 + 0.3;
      const r = Math.round(lerp(cGold[0], cBlue[0], t));
      const g = Math.round(lerp(cGold[1], cBlue[1], t));
      const b = Math.round(lerp(cGold[2], cBlue[2], t));
      precomputedStyles2.push(`rgba(${r}, ${g}, ${b}, ${alpha})`);
    }

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
    // (≈666 units/sec). We slow it down to ~400 units/sec for a more relaxed feel.
    const SPEED = 0.4;

    const evalNode = (n, t) => {
      const z = Math.sin(t * n.fz + n.pz) * n.az;
      const scale = focalLength / Math.max(1, focalLength + z);
      
      let waveX = 0;
      let waveY = 0;
      
      if (n.wavy) {
        waveX = Math.sin(t * n.fx * 5.5 + n.px) * (n.ax * 0.35);
        waveY = Math.cos(t * n.fy * 4.2 + n.py) * (n.ay * 0.35);

        const swell = Math.pow(Math.sin(t * n.loopSwell + n.px), 6); 
        const loopRadius = n.ax * 2.5 * swell;
        
        waveX += Math.cos(t * n.loopSpeed + n.py) * loopRadius;
        waveY += Math.sin(t * n.loopSpeed + n.pz) * loopRadius;
      }

      let x, y;
      // Use CSS dimensions (not canvas pixel dimensions) for coordinate space
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      const halfW = cw / 2;
      const halfH = ch / 2;

      if (n.type === 'inner') {
        x = (Math.sin(t * n.fx + n.px) * n.ax + waveX) * halfW * 1.1;
        y = (Math.cos(t * n.fy + n.py) * n.ay + waveY) * halfH * 1.1;
      } else if (n.type === 'left') {
        x = -(halfW + 50) / scale; 
        y = sweep(t * n.fy + n.py) * n.ay * halfH * 1.2;
      } else if (n.type === 'right') {
        x = (halfW + 50) / scale;
        y = sweep(t * n.fy + n.py) * n.ay * halfH * 1.2;
      } else if (n.type === 'top') {
        x = sweep(t * n.fx + n.px) * n.ax * halfW * 1.2;
        y = -(halfH + 50) / scale;
      } else if (n.type === 'bottom') {
        x = sweep(t * n.fx + n.px) * n.ax * halfW * 1.2;
        y = (halfH + 50) / scale;
      }
      return { x, y, z };
    };

    const generateRibbon = (cA, cB, precomputedStyles, ribbonSteps, startIdx) => {
      const p0A = evalNode(cA[0], time), p1A = evalNode(cA[1], time);
      const p2A = evalNode(cA[2], time), p3A = evalNode(cA[3], time);
      const p0B = evalNode(cB[0], time), p1B = evalNode(cB[1], time);
      const p2B = evalNode(cB[2], time), p3B = evalNode(cB[3], time);

      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      const cx = cw / 2;
      const cy = ch / 2;

      let lineIdx = startIdx;
      for (let i = 0; i <= ribbonSteps; i++) {
        const t = i / ribbonSteps;

        const p0x = lerp(p0A.x, p0B.x, t), p0y = lerp(p0A.y, p0B.y, t), p0z = lerp(p0A.z, p0B.z, t);
        const p1x = lerp(p1A.x, p1B.x, t), p1y = lerp(p1A.y, p1B.y, t), p1z = lerp(p1A.z, p1B.z, t);
        const p2x = lerp(p2A.x, p2B.x, t), p2y = lerp(p2A.y, p2B.y, t), p2z = lerp(p2A.z, p2B.z, t);
        const p3x = lerp(p3A.x, p3B.x, t), p3y = lerp(p3A.y, p3B.y, t), p3z = lerp(p3A.z, p3B.z, t);

        const scale0 = focalLength / Math.max(1, focalLength + p0z);
        const scale1 = focalLength / Math.max(1, focalLength + p1z);
        const scale2 = focalLength / Math.max(1, focalLength + p2z);
        const scale3 = focalLength / Math.max(1, focalLength + p3z);

        const line = linesToDraw[lineIdx++];
        
        line.x0 = cx + p0x * scale0; line.y0 = cy + p0y * scale0;
        line.x1 = cx + p1x * scale1; line.y1 = cy + p1y * scale1;
        line.x2 = cx + p2x * scale2; line.y2 = cy + p2y * scale2;
        line.x3 = cx + p3x * scale3; line.y3 = cy + p3y * scale3;

        line.avgZ = (p0z + p1z + p2z + p3z) * 0.25;
        line.scale = (scale0 + scale1 + scale2 + scale3) * 0.25;
        line.style = precomputedStyles[i];
      }
      return lineIdx;
    };

    const render = (now) => {
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
      idx = generateRibbon(curve1A, curve1B, precomputedStyles1, steps, idx);
      generateRibbon(curve2A, curve2B, precomputedStyles2, halfSteps, idx);

      // Z-sort for depth ordering
      linesToDraw.sort((a, b) => b.avgZ - a.avgZ);

      // ── Batch draw with a single path where possible ──
      // Group by style to minimize state changes (significant perf win on canvas)
      const styleGroups = new Map();
      for (const line of linesToDraw) {
        const w = Math.max(0.5, line.scale * 2.5 * sizeScale);
        const key = `${line.style}|${w.toFixed(1)}`;
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

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

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
      }}
    />
  );
}
