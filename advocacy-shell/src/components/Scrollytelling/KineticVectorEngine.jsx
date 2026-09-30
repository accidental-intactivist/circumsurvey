import React, { useRef, useEffect, useMemo } from 'react';
import { samplePathToPoints } from './utils/svgSampler';

const MAN_PATHS = [
  "M314.74,252.85c2.3,5.4,5.43,10.44,6.4,16.39.62,3.8-.19,7.46-.68,11.1-.54,4.01-.24,7.96-.1,11.91.23,6.61.66,13.23.96,19.84.54,11.72,1.16,23.44,1.08,35.17-.06,8.16-.99,16.26-2.13,24.33-.38,2.64-.68,5.31-.69,7.94-.06,12.7-1.47,25.27-3.24,37.82-1.64,11.67-1.75,23.42-1.6,35.18.07,5.64-.91,11.18-2.16,16.65-.31,1.35-.86,2.77-2.07,3.71",
  "M224.81,267.66c-1.13,2.38-.62,4.97-.7,7.41-.32,9.8.41,19.58,1.16,29.36.49,6.33.91,12.68,1.15,19.04.31,8.13,1.02,16.24,1.86,24.33.88,8.47,2.13,16.9,2.95,25.39,1.02,10.57,1.04,21.16,1.57,31.74.58,11.56,1.86,23.07,4.45,34.38,1.87,8.19,3.24,16.43,3.18,24.86-.02,2.53.57,4.98,1.29,7.41.88,2.98,2.63,4.81,5.84,5.02",
  "M271.36,302.84c-1.58,3-1.14,6.35-1.51,9.53-.88,7.48-1.79,14.96-2.5,22.47-.5,5.2-1.11,10.41-1.21,15.61-.28,14.73-1.64,29.42-1.68,44.17-.03,8.6.31,17.13,1.54,25.67,1.44,10.04,3.4,20.03,4.24,30.15.61,7.38,1.13,14.8.09,22.21-.5,3.59-1.93,4.42-4.77,2.35-2.28-1.66-4.75-2.95-7.43-3.63-4.71-1.19-8.51.75-10.5,5.8-2.22,5.63-5.21,10.56-9.52,14.86-2.15,2.15-3.21,5.12-3.3,8.39-.08,2.95.67,4.7,4.57,5.77,5.5,1.51,11.15,1.5,16.63-.02,3.08-.86,5.87-2.36,6.45-6.26.35-2.33,1.87-4.29,4.16-5.28,2.19-.94,2.78-2.57,2.66-4.79-.11-2.11-.32-4.22-.35-6.35-.03-1.51-.03-3.7-1.08-4.37-2.47-1.56-4.7-3.68-7.84-4.14-3.77-.56-7.42.21-11.11.57",
  "M270.83,293.31c5.33-2.46,6.66-7.15,6.87-12.43.11-2.75-.18-5.47-.48-8.2-.17-1.5-.83-1.85-2.16-1.87-1.57-.03-3.05.43-4.47.89-1.27.41-1.98,1.51-1.91,3.11.28,6.03.18,12.07,1.74,18.02.35,1.33-.09,3.19.19,4.71,1.23,6.74,3.78,13.14,5.29,19.83,1.97,8.71,4.22,17.37,5.41,26.21,1.04,7.71,2.06,15.45,2.26,23.26.07,2.57.3,5.19,1.26,7.68.86,2.23,2.01,4.01,4.49,4.82,1.05.34,2.28.97,2.75,2.25-.58,1.73-2.19,2.39-3.3,3.45-1.73,1.65-2.38,3.62-2.61,5.86-1.05,10.64-1.28,21.33-1,32,.15,5.64.66,11.28.73,16.93.07,5.39-.71,10.67-2.11,15.87-1.1,4.08-1.14,8.25-1.04,12.43.03,1.4.74,2.23,2.07,2.98,3.04,1.72,6.23,3.11,9.58,3.79,2.46.5,5.06.94,7.65.63,2.66-.32,5.38-.45,7.62-2.28,3.73,4.52,7.25,9.03,12.21,12.07,2.73,1.67,5.72,2.84,8.47,4.49,3,1.8,5.61,3.89,6.08,7.68.29,2.32-.59,3.8-2.9,4.51-4.41,1.36-8.94,1.82-13.49,1.53-5.9-.38-11.49-2.1-16.65-5-3.97-2.23-8.42-2.66-12.71-3.66-1.58-.37-3.21-.63-4.74-1.12-3.95-1.26-4.77-2.46-4.2-6.57.46-3.35.51-6.74,1.23-10.07.26-1.2.54-2.35,1.09-3.42.98-.08,1.19.52,1.68,1.28,2.67,4.13,5.46,4.24,9.19.57",
  "M252.58,85.96c-.28,6.44.52,12.88-.71,19.32-.91,4.75-3.26,7.62-7.7,9.62-4.47,2.02-8.49,5.04-12.75,7.55-5.18,3.06-10.37,6.12-15.35,9.51-3.17,2.16-4.75,5.31-6.09,8.74-2.18,5.56-3.24,11.4-4.46,17.2-1.76,8.38-3.8,16.69-6.38,24.85-1.31,4.16-.98,4.72,3.18,6.39,4.95,1.98,10.19,2.49,15.36,3.38,3.33.57,6.71.83,9.97,1.39,1-.57.86-1.81,1.66-2.42"
];

// Helper to draw a smooth cubic spline through an array of points
function drawSpline(ctx, points, tension = 0.5) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[0];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i !== points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
    const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
    const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
    const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  ctx.stroke();
}

export default function KineticVectorEngine({ activeState = 'ambient', scrollProgress = 0, globalOpacity = 0.8 }) {
  const canvasRef = useRef(null);
  
  // Create our 5 lines (characters)
  const lines = useMemo(() => {
    return MAN_PATHS.map((path, index) => {
      // 100 points ensures buttery smooth paths and complex shape mapping
      const targetPoints = samplePathToPoints(path, 100);
      return {
        id: index,
        fx: 0.0005 + (index * 0.00015), // Unique frequencies per line
        fy: 0.0007 + (index * 0.0002),
        px: Math.random() * Math.PI * 2,
        py: Math.random() * Math.PI * 2,
        targetPoints,
        currentPoints: Array(100).fill().map(() => ({ x: 0, y: 0 }))
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    let w, h;
    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    let animationFrameId;
    let time = 0;
    
    const lerp = (a, b, t) => a + (b - a) * t;

    // Smooth physics target
    let currentGather = activeState === 'gather' ? 1 : 0;
    let currentFirework = activeState === 'firework' ? 1 : 0;
    
    const render = () => {
      time += 16; // approx 16ms per frame
      
      const targetGather = activeState === 'gather' ? 1 : 0;
      const targetFirework = activeState === 'firework' ? 1 : 0;
      
      // Spring lerp for states
      currentGather += (targetGather - currentGather) * 0.04;
      currentFirework += (targetFirework - currentFirework) * 0.04;
      
      // We clear with a very subtle trail (opacity 0.8) to give slight motion blur
      ctx.clearRect(0, 0, w, h);
      
      const computedStyle = getComputedStyle(document.documentElement);
      const strokeColor = computedStyle.getPropertyValue('--c-primary') || 'rgba(212, 160, 48, 0.8)';
      
      // Strict hairline
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.2; 
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      lines.forEach((line) => {
        const span = Math.max(w, h);
        
        line.currentPoints.forEach((pt, i) => {
          // AMBIENT STATE: Sweeping Lissajous curves
          // The `i * 20` offset makes the points follow each other in a continuous ribbon
          const t = time + (i * 25);
          
          const ambX = w/2 + Math.sin(t * line.fx + line.px) * (span * 0.35) 
                           + Math.cos(t * line.fy * 0.5) * (span * 0.1);
          const ambY = h/2 + Math.cos(t * line.fy + line.py) * (span * 0.35) 
                           + Math.sin(t * line.fx * 0.5) * (span * 0.1);
                           
          // FIREWORK STATE: Flocking to top-left and bursting
          const burstRadius = i * 2;
          const fireX = w * 0.15 + Math.cos(line.px + i * 0.1) * burstRadius + Math.sin(time*0.002)*10;
          const fireY = h * 0.15 + Math.sin(line.py + i * 0.1) * burstRadius + Math.cos(time*0.002)*10;

          // GATHER STATE: The SVG continuous man drawing
          const targetPt = line.targetPoints[i];
          const scale = Math.min(w, h) * 0.5; // Scale to fit screen
          const gatherX = w / 2 + targetPt.x * scale;
          const gatherY = h / 2 + targetPt.y * scale;
          
          // Interpolate between the 3 states
          let finalX = ambX;
          let finalY = ambY;
          
          if (currentGather > 0.001) {
            finalX = lerp(finalX, gatherX, currentGather);
            finalY = lerp(finalY, gatherY, currentGather);
          }
          if (currentFirework > 0.001) {
            finalX = lerp(finalX, fireX, currentFirework);
            finalY = lerp(finalY, fireY, currentFirework);
          }
          
          pt.x = finalX;
          pt.y = finalY;
        });
        
        // Draw the line as a buttery smooth Catmull-Rom spline
        drawSpline(ctx, line.currentPoints, 0.5);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [lines, activeState]);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0, // Behind narrative content
        pointerEvents: 'none',
        opacity: globalOpacity,
        transition: 'opacity 0.8s ease',
      }}
    />
  );
}
