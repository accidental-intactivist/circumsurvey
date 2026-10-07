import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3-force';
import { EXHIBIT_DATA } from '../../data_exhibits';
import { PATHWAY } from '../../data';

export default function BeliefSwarm({ activeBeliefKey = 'medicallyHealthier' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const simRef = useRef(null);
  const nodesRef = useRef([]);
  const [dimensions, setDimensions] = useState({ w: 800, h: 400 });

  // Generate nodes based on EXHIBIT_DATA
  useEffect(() => {
    const beliefData = EXHIBIT_DATA.beliefs[activeBeliefKey];
    if (!beliefData) return;

    const newNodes = [];
    let idCounter = 0;
    
    // Convert aggregate counts into individual nodes
    Object.keys(beliefData.counts).forEach(pathway => {
      const answers = beliefData.counts[pathway];
      Object.keys(answers).forEach(answer => {
        const count = answers[answer];
        // Downsample slightly for performance if needed, but 500 is fine for canvas
        for (let i = 0; i < count; i++) {
          newNodes.push({
            id: idCounter++,
            pathway: pathway.toLowerCase(),
            answer: answer, // "Intact", "Circumcised", "Neutral / Equal"
            x: dimensions.w / 2 + (Math.random() - 0.5) * 50,
            y: dimensions.h / 2 + (Math.random() - 0.5) * 50,
            r: 3
          });
        }
      });
    });

    nodesRef.current = newNodes;

    // Setup Simulation
    const targetY = dimensions.h / 2;
    const getTargetX = (answer) => {
        if (answer === "Intact") return dimensions.w * 0.2;
        if (answer === "Circumcised") return dimensions.w * 0.8;
        return dimensions.w * 0.5; // Neutral
    };

    simRef.current = d3.forceSimulation(nodesRef.current)
      .force('x', d3.forceX(d => getTargetX(d.answer)).strength(0.1))
      .force('y', d3.forceY(targetY).strength(0.1))
      .force('collide', d3.forceCollide().radius(d => d.r + 1).iterations(2))
      .alpha(1)
      .restart();

  }, [activeBeliefKey, dimensions]);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let raf;
    const render = () => {
      ctx.clearRect(0, 0, dimensions.w, dimensions.h);
      
      // Draw centers labels
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '14px var(--f-condensed, sans-serif)';
      ctx.textAlign = 'center';
      ctx.fillText('ASSOCIATED WITH INTACT', dimensions.w * 0.2, dimensions.h - 40);
      ctx.fillText('NEUTRAL / EQUAL', dimensions.w * 0.5, dimensions.h - 40);
      ctx.fillText('ASSOCIATED WITH CIRCUMCISED', dimensions.w * 0.8, dimensions.h - 40);

      // Draw nodes
      nodesRef.current.forEach(node => {
        const p = PATHWAY[node.pathway] || PATHWAY.circumcised;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      raf = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(raf);
  }, [dimensions]);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width && height) {
        setDimensions({ w: width, h: height });
        if (canvasRef.current) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const currentQuestion = EXHIBIT_DATA.beliefs[activeBeliefKey]?.question || "";
  const cleanedQuestion = currentQuestion.replace(/Please indicate.*\[|\]/g, '').trim();

  return (
    <div style={{ width: '100%', margin: '4rem 0' }}>
      <h3 style={{ 
        fontFamily: 'var(--f-display, serif)', 
        fontSize: '2rem', 
        textAlign: 'center',
        marginBottom: '1rem',
        color: 'var(--c-textBright)'
      }}>
        What "Everyone Knows": {cleanedQuestion}
      </h3>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '400px', 
          position: 'relative',
          background: 'var(--c-bgCard)',
          border: '1px solid var(--c-ghost)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <canvas 
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
}
