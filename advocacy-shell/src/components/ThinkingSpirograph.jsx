import React, { useRef, useEffect, useMemo } from 'react';
import { C, FONT } from '../styles/tokens';

const gcd = (a, b) => { 
  a = Math.round(a); 
  b = Math.round(b); 
  while (b) { const t = a % b; a = b; b = t; } 
  return a || 1; 
};

export default function ThinkingSpirograph({ text = "Consulting Archives..." }) {
  const safeGold = "var(--c-goldBright)";
  const canvasRef = useRef(null);
  const layers = useMemo(() => {
    // The classic Spirograph wheel set for Ring 105
    const wheels = [24, 30, 32, 36, 40, 42, 45, 48, 50, 52, 56, 60, 63, 64, 72, 75, 80, 84];
    
    // Pick 1 random wheel for a clean, single spirograph
    const shuffled = [...wheels].sort(() => 0.5 - Math.random());
    const pickedWheels = shuffled.slice(0, 1);
    
    const thematicColors = [
      [212, 160, 48],  // Gold
      [59, 130, 246],  // Blue
      [16, 185, 129],  // Green
      [244, 63, 94],   // Rose
      [139, 92, 246],  // Purple
      [249, 115, 22],  // Orange
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
    
    const thematicColors = [
      [212, 160, 48], // Gold
      [59, 130, 246], // Blue
      [16, 185, 129], // Green
      [244, 63, 94],  // Rose
      [139, 92, 246], // Purple
      [249, 115, 22], // Orange
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
        
        // Every 60 units of 't' we switch color (approx 5 seconds at 60fps)
        const CHUNK = 60;
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
          
          // Draw the solid line segment with lower opacity so the playhead stands out!
          ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.25)`; 
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
      <div style={{ animation: "cssSpin 10s linear infinite" }}>
        <canvas ref={canvasRef} style={{ opacity: 0.9 }} />
      </div>
      {text && (
        <div style={{
          marginTop: "1rem",
          fontFamily: FONT.condensed,
          fontSize: "0.85rem",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: safeGold,
          animation: "synthesisPulse 2s infinite ease-in-out"
        }}>
          {text}
        </div>
      )}
      <style>{`
        @keyframes synthesisPulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; text-shadow: 0 0 10px rgba(212,160,48,0.4); }
          100% { opacity: 0.4; }
        }
        @keyframes cssSpin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
