import React, { useEffect, useState } from 'react';

export default function RegistrationMarks({ activeAct, scrollProgress }) {
  // We simulate "Live Registration" lock-in
  // The marks change style based on the scroll threshold
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    // Lock in precisely when hitting the middle of an act
    const isLocked = scrollProgress > 0.4 && scrollProgress < 0.6;
    setLocked(isLocked);
  }, [scrollProgress]);

  // CSS variables for theming
  const markColor = locked ? 'var(--c-primary)' : 'var(--c-dim)';
  const weight = locked ? 1.5 : 0.5;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 5,
      fontFamily: "var(--f-mono, 'JetBrains Mono', monospace)",
      fontSize: '0.65rem',
      color: markColor,
      textTransform: 'uppercase',
      letterSpacing: '0.1em'
    }}>
      {/* Top Left Registration */}
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <Crosshair color={markColor} weight={weight} />
        <span style={{ opacity: 0.7 }}>SCROLL_Y: {Math.round(scrollProgress * 100)}%</span>
      </div>

      {/* Top Right Registration */}
      <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <Crosshair color={markColor} weight={weight} />
        <span style={{ opacity: 0.7 }}>ACT: {activeAct}</span>
      </div>

      {/* Bottom Left: Slug Stats */}
      <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', opacity: 0.8 }}>
        <div>ENG: KINETIC_V1</div>
        <div>INTERPOLATION: LERP / DE CASTELJAU</div>
        <div>POINTS: {locked ? 'LOCKED' : 'AMBIENT WAVE'}</div>
      </div>

      {/* Bottom Right Registration */}
      <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <Crosshair color={markColor} weight={weight} />
        <span style={{ opacity: 0.7 }}>TARGET_SYS_READY</span>
      </div>
    </div>
  );
}

function Crosshair({ color, weight }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={weight} strokeLinecap="square">
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="0" x2="12" y2="24" />
      <line x1="0" y1="12" x2="24" y2="12" />
    </svg>
  );
}
