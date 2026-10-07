import React, { useRef, useEffect } from 'react';

/**
 * PlotterCanvas — High-performance procedural line art engine.
 * 
 * Draws oscilloscopic waveforms and spirographic patterns that respond
 * to scroll progress and the active narrative act. Colors are read from
 * CSS custom properties for full theme compatibility.
 * 
 * Act-specific color temperature morphing:
 *   Act 0 (The Question): Cool cyan/teal
 *   Act 1 (Who Showed Up): Warm gold
 *   Act 2 (What They Told Us): Warm amber/magenta
 *   Act 3 (Why Did It Happen): High contrast → fading
 *   Act 4 (Now You Know): Warm golden bloom
 */

// Per-act color palettes — we interpolate between these
const ACT_PALETTES = [
  { stroke: [0, 200, 180],  glow: [0, 255, 200],  opacity: 0.7  },  // Act 0: cyan/teal
  { stroke: [212, 160, 48], glow: [232, 184, 64],  opacity: 0.5  },  // Act 1: warm gold
  { stroke: [217, 79, 79],  glow: [232, 120, 100], opacity: 0.6  },  // Act 2: amber/red
  { stroke: [232, 164, 74], glow: [240, 152, 96],  opacity: 0.5  },  // Act 3: orange
  { stroke: [232, 200, 104],glow: [255, 220, 130], opacity: 0.8  },  // Act 4: golden
];

function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export default function PlotterCanvas({ scrollProgress, activeStep }) {
  const canvasRef = useRef(null);
  const progressRef = useRef(scrollProgress);
  const stepRef = useRef(activeStep);

  // Keep refs updated for the render loop without re-triggering effects
  useEffect(() => { progressRef.current = scrollProgress; }, [scrollProgress]);
  useEffect(() => { stepRef.current = activeStep; }, [activeStep]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let currentBlend = 0; // smooth blend between steps

    const dpr = window.devicePixelRatio || 1;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Detect if we're in a light mode (for clearing)
    const isLightMode = () => {
      const mode = document.documentElement.getAttribute('data-mode');
      return mode === 'light';
    };

    // Get blended color for current act position
    const getActColor = (type) => {
      const step = stepRef.current;
      const a = ACT_PALETTES[Math.min(step, ACT_PALETTES.length - 1)];
      const b = ACT_PALETTES[Math.min(step + 1, ACT_PALETTES.length - 1)];
      const rgb = lerpColor(a[type], b[type], currentBlend);
      const opacity = a.opacity + (b.opacity - a.opacity) * currentBlend;
      return { rgb, opacity };
    };

    // ── Procedural Generators ──────────────────────────────────

    const drawJoyDivisionWave = (ctx, w, h, progress) => {
      const lines = 35;
      const steps = 60;
      const revealProgress = Math.min(1, progress * 2.5);
      if (revealProgress <= 0) return;

      const { rgb, opacity } = getActColor('stroke');
      const { rgb: glowRgb } = getActColor('glow');
      
      ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`;
      ctx.lineWidth = 1.2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(${glowRgb[0]},${glowRgb[1]},${glowRgb[2]},0.4)`;

      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        const yBase = h * 0.2 + (i * (h * 0.6) / lines);
        
        for (let j = 0; j <= steps; j++) {
          const x = (j / steps) * w;
          const distFromCenter = Math.abs((steps / 2) - j) / (steps / 2);
          const peakHeight = Math.max(0, 1 - distFromCenter);
          const noise = Math.sin(j * 0.5 + i) * Math.cos(j * 0.2 - i * 0.5);
          const y = yBase - (peakHeight * noise * 45 * revealProgress) - (peakHeight * 18 * revealProgress);
          
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const drawSpirograph = (ctx, w, h, progress) => {
      if (progress <= 0) return;
      
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) / 4;
      
      const R = scale * 0.6;
      const r = scale * 0.21;
      const d = scale * 0.28;

      const { rgb, opacity } = getActColor('stroke');
      const { rgb: glowRgb } = getActColor('glow');

      ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = `rgba(${glowRgb[0]},${glowRgb[1]},${glowRgb[2]},0.5)`;
      ctx.beginPath();

      const totalTheta = 50 * Math.PI;
      const currentTheta = progress * totalTheta;

      for (let theta = 0; theta <= currentTheta; theta += 0.08) {
        const x = cx + (R - r) * Math.cos(theta) + d * Math.cos(((R - r) / r) * theta);
        const y = cy + (R - r) * Math.sin(theta) - d * Math.sin(((R - r) / r) * theta);
        
        if (theta === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    // ── Main Render Loop ──────────────────────────────────────

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const progress = progressRef.current;
      const step = stepRef.current;

      // Smooth blend toward current step (for color transitions)
      const targetBlend = (progress * 5) % 1; // fractional position within current act
      currentBlend += (targetBlend - currentBlend) * 0.05;

      // Clear with trailing effect — theme-aware, very transparent
      ctx.shadowBlur = 0;
      if (isLightMode()) {
        ctx.fillStyle = 'rgba(250, 246, 240, 0.5)';
      } else {
        ctx.fillStyle = 'rgba(10, 10, 12, 0.5)';
      }
      ctx.fillRect(0, 0, w, h);

      // Draw motifs based on current act
      if (step <= 1) {
        const waveProgress = Math.min(1, Math.max(0, progress * 3));
        drawJoyDivisionWave(ctx, w, h, waveProgress);
      }
      
      if (step >= 2) {
        const spiroProgress = Math.min(1, Math.max(0, (progress - 0.4) * 2.0));
        drawSpirograph(ctx, w, h, spiroProgress);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        opacity: 0.3,
      }}
    />
  );
}
