import React, { useMemo } from 'react';

// Simple seeded PRNG
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export default function CausticsBackground({ textSeed = "default", baseColor = "#030305" }) {
  const { facets, seed } = useMemo(() => {
    let h = 0;
    for(let i=0; i<textSeed.length; i++) h = Math.imul(31, h) + textSeed.charCodeAt(i) | 0;
    const seed = Math.abs(h) % 1000;
    const rng = mulberry32(seed);
    
    // 6 to 9 intersecting shards/facets
    const numFacets = 6 + Math.floor(rng() * 4); 
    const generatedFacets = [];
    
    // Rainbow palette for holographic effect
    const colors = ['#ff0040', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#8000ff'];
    
    for (let i = 0; i < numFacets; i++) {
      // Create geometric shard crossing the container
      const ptsCount = rng() > 0.5 ? 4 : 3;
      const pts = [];
      
      // Random anchor points extending past the edges for clean overlaps
      if (ptsCount === 4) {
        pts.push(`${rng() * 100}% -10%`); // Top edge
        pts.push(`110% ${rng() * 100}%`); // Right edge
        pts.push(`${rng() * 100}% 110%`); // Bottom edge
        pts.push(`-10% ${rng() * 100}%`); // Left edge
      } else {
        const edges = [
          `${rng() * 100}% -10%`,
          `110% ${rng() * 100}%`,
          `${rng() * 100}% 110%`,
          `-10% ${rng() * 100}%`
        ];
        // Pick 3 random edges for a triangle crossing through
        edges.sort(() => rng() - 0.5);
        pts.push(edges[0], edges[1], edges[2]);
      }
      
      const gradAngle = rng() * 360;
      const maskAngle = rng() * 360;
      const shiftedColors = [...colors].sort(() => rng() - 0.5);
      
      const thickness = 1.0 + rng() * 1.5;
      const gap = thickness + 1 + rng() * 4;
      
      // Slowed down organically: 20 to 45 seconds for a very gentle cycle
      const dur = 20 + rng() * 25; 
      const isReverse = rng() > 0.5;
      
      generatedFacets.push({
        clipPath: `polygon(${pts.join(', ')})`,
        gradient: `linear-gradient(${gradAngle.toFixed(0)}deg, ${shiftedColors.join(', ')})`,
        mask: `repeating-linear-gradient(${maskAngle.toFixed(0)}deg, black, black ${thickness.toFixed(1)}px, transparent ${thickness.toFixed(1)}px, transparent ${gap.toFixed(1)}px)`,
        dur: `${dur.toFixed(1)}s`,
        dir: isReverse ? 'reverse' : 'normal',
        delay: `-${rng() * 30}s`
      });
    }
    
    return { facets: generatedFacets, seed };
  }, [textSeed]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: baseColor, pointerEvents: 'none' }}>
      
      {/* Light Source wandering very slowly to activate the color-dodge holograms */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(0,240,255,0.7) 20%, rgba(255,0,85,0.4) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        opacity: 0.85,
        mixBlendMode: 'screen',
        animation: `organicWander-${seed} 35s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate`
      }} />

      {/* Container blurs the light source beneath it */}
      <div style={{ 
        position: 'absolute', inset: 0, 
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)' 
      }}>
        {/* Shards / Diffraction Gratings */}
        {facets.map((f, i) => (
          <div key={i} style={{
            position: 'absolute',
            inset: '-10%', 
            clipPath: f.clipPath,
            background: f.gradient,
            backgroundSize: '400% 400%',
            WebkitMaskImage: f.mask,
            maskImage: f.mask,
            mixBlendMode: 'color-dodge',
            opacity: 0.85,
            animation: `rippleColors-${seed} ${f.dur} linear infinite ${f.dir}`,
            animationDelay: f.delay
          }} />
        ))}
      </div>
      
      {/* Subtle darkening vignette on top of everything to center focus */}
      <div style={{
        position: 'absolute', inset: 0,
        boxShadow: 'inset 0 0 100px rgba(3,3,5,0.95)',
        zIndex: 10
      }} />

      <style>{`
        @keyframes rippleColors-${seed} {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        @keyframes organicWander-${seed} {
          0% { transform: translate(-80%, -80%) scale(0.9); }
          33% { transform: translate(30%, 10%) scale(1.3); }
          66% { transform: translate(-30%, 50%) scale(0.9); }
          100% { transform: translate(60%, -60%) scale(1.2); }
        }
      `}</style>
    </div>
  );
}
