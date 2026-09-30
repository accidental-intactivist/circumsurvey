import React, { useState, useEffect, useRef } from 'react';
import { C, FONT } from '../styles/tokens';
import { Database, FileText, Users, Network } from 'lucide-react';

const CountUp = ({ end, duration = 2000, separator = "," }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };
    
    // Start animation when component mounts
    animationFrame = requestAnimationFrame(step);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString('en-US')}</span>;
};

export default function LiveStatsBar() {
  return (
    <div style={{
      width: '100%',
      padding: '2rem 0',
      background: 'rgba(0, 0, 0, 0.2)',
      borderTop: `1px solid rgba(255, 255, 255, 0.05)`,
      borderBottom: `1px solid rgba(255, 255, 255, 0.05)`,
      marginBottom: '4rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle sweeping gradient background */}
      <div style={{
        position: 'absolute',
        top: 0, left: '-100%', right: '100%', bottom: 0,
        background: 'linear-gradient(90deg, transparent, rgba(212,160,48,0.03), transparent)',
        animation: 'sweep 8s linear infinite'
      }} />
      <style>{`
        @keyframes sweep {
          0% { transform: translateX(0); }
          100% { transform: translateX(200%); }
        }
      `}</style>
      
      <div style={{
        maxWidth: '1140px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '2rem',
        padding: '0 2rem'
      }}>
        {[
          { label: 'Phase 1 Participants', count: 500, icon: Users, color: 'var(--c-orange)' },
          { label: 'Key Entities Tracked', count: 4403, icon: Network, color: 'var(--c-blue)' },
          { label: 'Archival Documents', count: 1248, icon: FileText, color: 'var(--c-purple)' },
          { label: 'Verified Relationships', count: 8752, icon: Database, color: 'var(--c-green)' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40, borderRadius: '50%', 
                background: `rgba(255,255,255,0.03)`, marginBottom: '1rem',
                border: `1px solid rgba(255,255,255,0.05)`
              }}>
                <Icon size={18} color={stat.color} />
              </div>
              <div style={{
                fontFamily: FONT.mono, fontSize: '2.5rem', fontWeight: 700, 
                color: 'white', marginBottom: '0.25rem',
                textShadow: `0 0 20px ${stat.color}40`
              }}>
                <CountUp end={stat.count} />
              </div>
              <div style={{ fontFamily: FONT.condensed, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
