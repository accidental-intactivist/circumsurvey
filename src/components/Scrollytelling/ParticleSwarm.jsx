import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { getCount } from '../../explore/lib/api';
import { PATH_COLORS } from '../../explore/styles/tokens';

gsap.registerPlugin(ScrollTrigger);

export default function ParticleSwarm() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const particles = useRef([]);
  const animState = useRef({ progress: 0 });
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    getCount().then(data => setCounts(data.by_pathway || { intact: 150, circumcised: 300, restoring: 54, observer: 0 }));
  }, []);

  useGSAP(() => {
    if (!counts) return;

    const intactCount = counts.intact || 0;
    const circCount = counts.circumcised || 0;
    const restoringCount = counts.restoring || 0;
    const observerCount = counts.observer || 0;
    const totalParticles = intactCount + circCount + restoringCount + observerCount;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.parentElement.clientWidth;
    let height = canvas.parentElement.clientHeight;
    
    const updateSize = () => {
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Initialize Particles
    particles.current = Array.from({ length: totalParticles }).map((_, i) => {
      let c = PATH_COLORS.observer;
      if (i < intactCount) c = PATH_COLORS.intact;
      else if (i < intactCount + circCount) c = PATH_COLORS.circumcised;
      else if (i < intactCount + circCount + restoringCount) c = PATH_COLORS.restoring;

      return {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        originX: Math.random() * width,
        originY: Math.random() * height,
        targetX: Math.random() * width,
        targetY: Math.random() * height,
        color: c,
        size: Math.random() * 1.5 + 1
      };
    });

    // Formations Logic
    const getFormationTarget = (particle, actIndex) => {
      // Act 0: Chaotic Cloud
      if (actIndex < 1) {
        return {
          x: particle.originX + Math.sin(particle.id) * 50,
          y: particle.originY + Math.cos(particle.id) * 50
        };
      }
      // Act 1: Gentle Swirl (Lens)
      if (actIndex >= 1 && actIndex < 2) {
        const angle = (particle.id / totalParticles) * Math.PI * 2;
        const radius = 100 + (particle.id % 50);
        return {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius
        };
      }
      // Act 2: The Baseline (3 Columns)
      if (actIndex >= 2 && actIndex < 3) {
        let col = 0;
        if (particle.color === PATH_COLORS.circumcised) col = 1;
        if (particle.color === PATH_COLORS.restoring) col = 2;
        
        const colWidth = width / 3;
        const xCenter = col * colWidth + (colWidth / 2);
        
        // Stack them in a looser, organic grid
        const pointsPerRow = 12;
        const rowIndex = Math.floor(particle.id / pointsPerRow);
        const colIndex = particle.id % pointsPerRow;
        
        // Add slight jitter so it feels like a swarm, not a rigid grid
        const jitterX = Math.sin(particle.id * 3.1) * 3;
        const jitterY = Math.cos(particle.id * 2.7) * 3;
        
        return {
          x: xCenter - (pointsPerRow * 12) / 2 + (colIndex * 12) + jitterX,
          y: height * 0.7 - (rowIndex * 12) + jitterY
        };
      }
      // Act 3 & 4 & 5: Tight Clusters / Pleasure Gap
      if (actIndex >= 3) {
        const targetX = particle.color === PATH_COLORS.circumcised ? width * 0.35 : width * 0.65;
        const targetY = height * 0.5 + (Math.sin(particle.id) * 150);
        return {
          x: targetX + (Math.cos(particle.id * 1.3) * 80) + (Math.sin(particle.id * 2.1) * 20),
          y: targetY + (Math.cos(particle.id * 3.4) * 20)
        };
      }
      return { x: particle.originX, y: particle.originY };
    };

    // Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      const actFloat = animState.current.progress * 5; // Maps 0-1 to 0-5 Acts
      
      particles.current.forEach(p => {
        const target = getFormationTarget(p, actFloat);
        
        // Easing / Interpolation towards target
        p.x += (target.x - p.x) * 0.05;
        p.y += (target.y - p.y) * 0.05;

        // Draw Particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        
        // Make them pulse slightly based on scroll
        const alpha = 0.5 + Math.sin(Date.now() * 0.005 + p.id) * 0.3;
        ctx.globalAlpha = alpha;
        ctx.fill();
      });
    };

    // Keep rendering
    gsap.ticker.add(render);

    // ScrollTrigger to drive progress
    ScrollTrigger.create({
      trigger: ".scrolly-engine",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        // self.progress is 0 to 1
        animState.current.progress = self.progress;
      }
    });

    return () => {
      window.removeEventListener('resize', updateSize);
      gsap.ticker.remove(render);
    };
  }, { scope: containerRef, dependencies: [counts] });

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />
    </div>
  );
}
