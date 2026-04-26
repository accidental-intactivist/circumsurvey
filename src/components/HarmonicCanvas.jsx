import React, { useEffect, useRef } from 'react';

export default function HarmonicCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas to full window size
    const resizeCanvas = () => {
      // Find the hero container dimensions, not just window
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId) {
          render();
        } else if (!isVisible && animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      });
    }, { rootMargin: '100px' });
    observer.observe(canvas);

    // Helper functions for math and colors
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

    const createCornerCurve = () => [
      createNode('bottom'), createNode('inner', true), createNode('inner', true), createNode('right')
    ];

    const curve1A = createHorizontalCurve();
    const curve1B = createHorizontalCurve();
    
    const curve2A = createVerticalCurve();
    const curve2B = createVerticalCurve();

    const curve3A = createCornerCurve();
    const curve3B = createCornerCurve();

    // Custom colors mapping to our C object
    const cRed = [217, 79, 79];     // C.red
    const cGold = [212, 160, 48];   // C.gold
    const cBlue = [91, 147, 199];   // C.blue

    const focalLength = 800;
    const steps = 45;
    const halfSteps = Math.floor(steps / 2);
    
    const precomputedStyles1 = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const alpha = Math.sin(t * Math.PI) * 0.6 + 0.3; // Increased alpha for visibility
      
      const r1 = Math.round(lerp(cRed[0], cGold[0], t));
      const g1 = Math.round(lerp(cRed[1], cGold[1], t));
      const b1 = Math.round(lerp(cRed[2], cGold[2], t));
      precomputedStyles1.push(`rgba(${r1}, ${g1}, ${b1}, ${alpha})`);
    }

    const precomputedStyles2 = [];
    for (let i = 0; i <= halfSteps; i++) {
      const t = i / halfSteps;
      const alpha = Math.sin(t * Math.PI) * 0.6 + 0.3;
      
      const r2 = Math.round(lerp(cGold[0], cBlue[0], t));
      const g2 = Math.round(lerp(cGold[1], cBlue[1], t));
      const b2 = Math.round(lerp(cGold[2], cBlue[2], t));
      precomputedStyles2.push(`rgba(${r2}, ${g2}, ${b2}, ${alpha})`);
    }

    const precomputedStyles3 = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const alpha = Math.sin(t * Math.PI) * 0.6 + 0.3;
      
      const r3 = Math.round(lerp(cBlue[0], cRed[0], t));
      const g3 = Math.round(lerp(cBlue[1], cRed[1], t));
      const b3 = Math.round(lerp(cBlue[2], cRed[2], t));
      precomputedStyles3.push(`rgba(${r3}, ${g3}, ${b3}, ${alpha})`);
    }

    const totalLines = (steps + 1) * 2 + (halfSteps + 1);
    const linesToDraw = Array.from({ length: totalLines }, () => ({
      x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0,
      avgZ: 0, scale: 0, style: ''
    }));

    let time = 0;

    const render = () => {
      if (!isVisible) {
        animationFrameId = null;
        return;
      }
      time += 10.66;

      // Clear rect instead of solid fill so we can see the container's background gradient
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      let lineIdx = 0;

      const evalNode = (n) => {
        const z = Math.sin(time * n.fz + n.pz) * n.az;
        const scale = focalLength / Math.max(1, focalLength + z);
        
        let x, y;
        let waveX = 0;
        let waveY = 0;
        
        if (n.wavy) {
          waveX = Math.sin(time * n.fx * 5.5 + n.px) * (n.ax * 0.35);
          waveY = Math.cos(time * n.fy * 4.2 + n.py) * (n.ay * 0.35);

          const swell = Math.pow(Math.sin(time * n.loopSwell + n.px), 6); 
          const loopRadius = n.ax * 2.5 * swell;
          
          waveX += Math.cos(time * n.loopSpeed + n.py) * loopRadius;
          waveY += Math.sin(time * n.loopSpeed + n.pz) * loopRadius;
        }

        if (n.type === 'inner') {
          x = (Math.sin(time * n.fx + n.px) * n.ax + waveX) * cx * 1.1;
          y = (Math.cos(time * n.fy + n.py) * n.ay + waveY) * cy * 1.1;
        } else if (n.type === 'left') {
          x = -(cx + 50) / scale; 
          y = sweep(time * n.fy + n.py) * n.ay * cy * 1.2;
        } else if (n.type === 'right') {
          x = (cx + 50) / scale;
          y = sweep(time * n.fy + n.py) * n.ay * cy * 1.2;
        } else if (n.type === 'top') {
          x = sweep(time * n.fx + n.px) * n.ax * cx * 1.2;
          y = -(cy + 50) / scale;
        } else if (n.type === 'bottom') {
          x = sweep(time * n.fx + n.px) * n.ax * cx * 1.2;
          y = (cy + 50) / scale;
        }
        return { x, y, z };
      };

      const generateRibbon = (cA, cB, precomputedStyles, ribbonSteps) => {
        const p0A = evalNode(cA[0]), p1A = evalNode(cA[1]), p2A = evalNode(cA[2]), p3A = evalNode(cA[3]);
        const p0B = evalNode(cB[0]), p1B = evalNode(cB[1]), p2B = evalNode(cB[2]), p3B = evalNode(cB[3]);

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
      };

      generateRibbon(curve1A, curve1B, precomputedStyles1, steps);
      generateRibbon(curve2A, curve2B, precomputedStyles2, halfSteps);
      generateRibbon(curve3A, curve3B, precomputedStyles3, steps);

      linesToDraw.sort((a, b) => b.avgZ - a.avgZ);

      linesToDraw.forEach(line => {
        ctx.lineWidth = Math.max(0.5, line.scale * 2.5); // Bumped thickness
        ctx.strokeStyle = line.style;
        ctx.beginPath();
        ctx.moveTo(line.x0, line.y0);
        ctx.bezierCurveTo(line.x1, line.y1, line.x2, line.y2, line.x3, line.y3);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

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
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
