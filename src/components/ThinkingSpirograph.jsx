import React, { useRef, useEffect } from 'react';
import { FONT } from '../styles/tokens';

const gcd = (a, b) => { 
  a = Math.round(a); 
  b = Math.round(b); 
  while (b) { const t = a % b; a = b; b = t; } 
  return a || 1; 
};

// Curated wheel set for Ring 105 producing gorgeous symmetrical rosettes
const WHEELS = [24, 30, 32, 36, 40, 42, 45, 48, 50, 52, 56, 60, 63, 64, 72, 75, 80, 84];

const THEME_PALETTE = [
  { rgb: [212, 160, 48], hex: '#d4a030' }, // Gold
  { rgb: [56, 189, 248], hex: '#38bdf8' }, // Electric Cyan
  { rgb: [16, 185, 129], hex: '#10b981' }, // Emerald Green
  { rgb: [245, 158, 11], hex: '#f59e0b' }, // Amber
  { rgb: [168, 85, 247], hex: '#a855f7' }, // Purple
  { rgb: [239, 68, 68],  hex: '#ef4444' }, // Crimson Red
];

/**
 * ThinkingSpirograph — Mathematical Progressive Line-Drawing Loader
 * 
 * CRITICAL ARCHITECTURAL RULE:
 * This component MUST progressively DRAW lines in real-time onto the canvas.
 * It must NEVER use CSS rotation (e.g. cssSpin) or pre-render a static shape.
 * The beauty and brand identity of this spinner comes from the user actively 
 * watching the glowing pen tip trace out hypocycloid curves line-by-line.
 */
export default function ThinkingSpirograph({ text = "Consulting Archives...", size = 160 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    // Offscreen trail canvas to accumulate drawn line segments with zero performance cost
    const trailCanvas = document.createElement('canvas');
    trailCanvas.width = canvas.width;
    trailCanvas.height = canvas.height;
    const trailCtx = trailCanvas.getContext('2d');
    trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    trailCtx.lineCap = 'round';
    trailCtx.lineJoin = 'round';

    let colorIdx = Math.floor(Math.random() * THEME_PALETTE.length);

    // Generator for a new spirograph gear setup
    const createPattern = () => {
      const wheel = WHEELS[Math.floor(Math.random() * WHEELS.length)];
      const rg = 105;
      const rw = Math.max(6, Math.min(wheel, rg - 6));
      const revs = rw / gcd(rg, rw);
      const q = (rg - rw) / rw;
      const Rr = rg - rw;
      const penHole = 0.62 + Math.random() * 0.32;
      const d = penHole * rw;
      const scale = (size * 0.43) / (Rr + d);
      const totalTheta = revs * Math.PI * 2;
      const twist = Math.random() * Math.PI * 2;
      const cr = Math.cos(twist);
      const sr = Math.sin(twist);
      const color = THEME_PALETTE[colorIdx % THEME_PALETTE.length];
      colorIdx++;

      return {
        q, Rr, d, scale, totalTheta, cr, sr, color,
        duration: Math.min(7500, Math.max(4500, revs * 1100))
      };
    };

    let pattern = createPattern();
    let theta = 0;
    let phase = 'drawing'; // 'drawing' | 'holding' | 'fading'
    let phaseStartTime = performance.now();
    let lastTime = performance.now();

    const getPoint = (t, p) => {
      const x = (p.Rr * Math.cos(t) + p.d * Math.cos(p.q * t)) * p.scale;
      const y = (p.Rr * Math.sin(t) - p.d * Math.sin(p.q * t)) * p.scale;
      return {
        x: size / 2 + x * p.cr - y * p.sr,
        y: size / 2 + x * p.sr + y * p.cr
      };
    };

    let prevPoint = getPoint(0, pattern);
    trailCtx.clearRect(0, 0, size, size);

    const strokeW = Math.max(0.9, (size / 160) * 1.35);

    const render = (now) => {
      const dt = Math.min(now - lastTime, 100);
      lastTime = now;

      if (phase === 'drawing') {
        const speed = pattern.totalTheta / pattern.duration; // radians per ms
        const nextTheta = Math.min(pattern.totalTheta, theta + speed * dt);

        // Progressively trace lines from theta to nextTheta in fine increments
        const stepSize = 0.04;
        trailCtx.beginPath();
        trailCtx.strokeStyle = `rgba(${pattern.color.rgb[0]}, ${pattern.color.rgb[1]}, ${pattern.color.rgb[2]}, 0.82)`;
        trailCtx.lineWidth = strokeW;
        trailCtx.moveTo(prevPoint.x, prevPoint.y);

        let t = theta;
        while (t < nextTheta) {
          t = Math.min(nextTheta, t + stepSize);
          const pt = getPoint(t, pattern);
          trailCtx.lineTo(pt.x, pt.y);
          prevPoint = pt;
        }
        trailCtx.stroke();
        theta = nextTheta;

        // When complete, transition to brief celebratory hold
        if (theta >= pattern.totalTheta) {
          phase = 'holding';
          phaseStartTime = now;
        }
      } else if (phase === 'holding') {
        if (now - phaseStartTime > 1600) {
          phase = 'fading';
          phaseStartTime = now;
        }
      } else if (phase === 'fading') {
        const fadeElapsed = now - phaseStartTime;
        const fadeDuration = 600;
        if (fadeElapsed >= fadeDuration) {
          pattern = createPattern();
          theta = 0;
          prevPoint = getPoint(0, pattern);
          trailCtx.clearRect(0, 0, size, size);
          phase = 'drawing';
          phaseStartTime = now;
        }
      }

      // Render to main display canvas
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      if (phase === 'fading') {
        const fadeProgress = (now - phaseStartTime) / 600;
        ctx.globalAlpha = Math.max(0, 1 - fadeProgress);
      } else {
        ctx.globalAlpha = 1;
      }

      // 1. Draw accumulated line trail
      ctx.drawImage(trailCanvas, 0, 0, size, size);

      // 2. Draw glowing leading pen tip (only while actively drawing)
      if (phase === 'drawing') {
        ctx.save();
        ctx.shadowBlur = size > 60 ? 12 : 6;
        ctx.shadowColor = pattern.color.hex;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        const tipRadius = Math.max(1.8, (size / 160) * 3);
        ctx.arc(prevPoint.x, prevPoint.y, tipRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${pattern.color.rgb[0]}, ${pattern.color.rgb[1]}, ${pattern.color.rgb[2]}, 0.6)`;
        ctx.beginPath();
        ctx.arc(prevPoint.x, prevPoint.y, tipRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [size]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: `${size + 20}px` }}>
      {/* Canvas is stationary — NO CSS ROTATION! Lines are drawn mathematically in real time */}
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {text && (
        <div style={{
          marginTop: size > 80 ? "1rem" : "0.5rem",
          fontFamily: FONT.condensed,
          fontSize: size > 80 ? "0.85rem" : "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--c-goldBright)",
          animation: "synthesisPulse 2s infinite ease-in-out",
          textAlign: "center"
        }}>
          {text}
        </div>
      )}
      <style>{`
        @keyframes synthesisPulse {
          0% { opacity: 0.45; }
          50% { opacity: 1; text-shadow: 0 0 10px rgba(212,160,48,0.5); }
          100% { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}
