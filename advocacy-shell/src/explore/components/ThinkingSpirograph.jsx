import React, { useRef, useEffect, useMemo } from 'react';
import { C, FONT } from '../styles/tokens';
import { ensureLegibleHex, useLegibleColor } from '../lib/colorUtils';
import { UNDERLOOM_CONFIG } from '../../components/GuidedTour/LoomChoreography';

const gcd = (a, b) => { 
  a = Math.round(a); 
  b = Math.round(b); 
  while (b) { const t = a % b; a = b; b = t; } 
  return a || 1; 
};

export default function ThinkingSpirograph() {
  const safeGold = useLegibleColor("var(--c-gold)", "var(--c-bgCard)");
  const canvasRef = useRef(null);
  const layers = useMemo(() => {
    // The classic Spirograph wheel set for Ring 105
    const wheels = [24, 30, 32, 36, 40, 42, 45, 48, 50, 52, 56, 60, 63, 64, 72, 75, 80, 84];
    
    // Pick 1 random wheel for a clean, single spirograph
    const shuffled = [...wheels].sort(() => 0.5 - Math.random());
    const pickedWheels = shuffled.slice(0, 1);
    
    const thematicColors = [
      [212, 160, 48],  // Gold
    ];
    
    return pickedWheels.map((wheel, i) => ({
      gearRing: 105,
      gearWheel: wheel,
      penHole: 0.6 + Math.random() * 0.35, // 0.6 to 0.95
      twist: Math.random() * Math.PI * 2,
      ecc: 0,
      scaleMult: 1.0 - (i * 0.15), // Slightly nest them
      color: thematicColors[i % thematicColors.length]
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const dpr = window.devicePixelRatio || 1;
    const size = 160; 
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Precalculate properties for each layer
    const parsedLayers = layers.map(fig => {
      const rg = Math.max(24, fig.gearRing);
      const rw = Math.max(6, Math.min(fig.gearWheel, rg - 6));
      const revs = rw / gcd(rg, rw);
      const q = (rg - rw) / rw;
      const Rr = rg - rw;
      const d = fig.penHole * rw;
      const scale = ((size * 0.42) / (Rr + d)) * fig.scaleMult;
      const totalTheta = revs * Math.PI * 2;
      return { ...fig, rg, rw, revs, q, Rr, d, scale, totalTheta };
    });
    
    // The longest drawing time dictates the total span
    const maxTheta = Math.max(...parsedLayers.map(l => l.totalTheta));
    
    const speed = 0.20; 
    let time = maxTheta * 0.8; 
    const tailLength = maxTheta * 0.95;
    
    const rootStyle = getComputedStyle(document.documentElement);
    const bgHex = rootStyle.getPropertyValue('--c-bgCard').trim() || '#ffffff';
    
    const hexToRgb = (hex) => {
      const c = (hex || '').replace('#', '').trim();
      if (c.length === 6) return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)];
      return [212, 160, 48]; // Fallback to Gold
    };

    const getSafeColor = (varName) => {
      const raw = rootStyle.getPropertyValue(varName).trim();
      return hexToRgb(ensureLegibleHex(raw, bgHex));
    };

    const thematicColors = [
      getSafeColor('--c-gold'),
      getSafeColor('--c-red'),
      getSafeColor('--c-blue'),
      getSafeColor('--c-green')
    ];

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      time += speed;
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      parsedLayers.forEach(layer => {
        const { q, Rr, d, scale, twist, totalTheta } = layer;
        
        const currentTwist = twist + time * 0.04;
        const cr = Math.cos(currentTwist);
        const sr = Math.sin(currentTwist);
        
        // Only draw the most recent full revolution so it doesn't get infinitely slow
        // but because it perfectly overlaps, it looks like a continuous drawing
        const startT = Math.max(0, time - totalTheta);
        const endT = time;
        
        // Every 120 units of 't' (~10 seconds at speed 0.20), we switch color
        const CHUNK = 120;
        let t = startT;
        while (t < endT) {
          const chunkEnd = Math.min(endT, Math.floor(t / CHUNK) * CHUNK + CHUNK);
          
          ctx.beginPath();
          for (let step = t; step <= chunkEnd + 0.05; step += 0.05) {
            const drawT = Math.min(step, chunkEnd);
            const x1 = (Rr * Math.cos(drawT) + d * Math.cos(q * drawT)) * scale;
            const y1 = (Rr * Math.sin(drawT) - d * Math.sin(q * drawT)) * scale;
            
            const px = size / 2 + x1 * cr - y1 * sr;
            const py = size / 2 + x1 * sr + y1 * cr;
            
            if (step === t) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          
          const colorIdx = Math.floor(t / CHUNK) % thematicColors.length;
          const color = thematicColors[colorIdx];
          
          // Draw the solid line segment
          ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.85)`; 
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 0;
          ctx.stroke();
          
          t = chunkEnd;
        }
        
        // Draw the glowing playhead
        const headStart = Math.max(0, time - 1.5);
        ctx.beginPath();
        for (let step = headStart; step <= time + 0.05; step += 0.05) {
          const drawT = Math.min(step, time);
          const x1 = (Rr * Math.cos(drawT) + d * Math.cos(q * drawT)) * scale;
          const y1 = (Rr * Math.sin(drawT) - d * Math.sin(q * drawT)) * scale;
          
          const px = size / 2 + x1 * cr - y1 * sr;
          const py = size / 2 + x1 * sr + y1 * cr;
          
          if (step === headStart) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        
        const headColorIdx = Math.floor(time / CHUNK) % thematicColors.length;
        const headColor = thematicColors[headColorIdx];
        
        ctx.strokeStyle = `rgba(${headColor[0]}, ${headColor[1]}, ${headColor[2]}, 1.0)`; 
        ctx.lineWidth = 2.0;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${headColor[0]}, ${headColor[1]}, ${headColor[2]}, 1.0)`;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    
    animationFrameId = requestAnimationFrame(render);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [layers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px' }}>
      <canvas ref={canvasRef} style={{ opacity: 0.9 }} />
      <div style={{
        marginTop: "2rem",
        fontFamily: FONT.condensed,
        fontSize: "0.85rem",
        fontWeight: 600,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: safeGold,
        animation: "synthesisPulse 2s infinite ease-in-out"
      }}>
        Synthesizing Data...
      </div>
      <style>{`
        @keyframes synthesisPulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; text-shadow: 0 0 10px ${safeGold}66; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
