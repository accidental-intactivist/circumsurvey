import React, { useState } from 'react';
import { EyeOff } from 'lucide-react';
import { C } from '../styles/tokens';

const SafeImage = ({ src, alt }) => {
  const [revealed, setRevealed] = useState(false);
  
  // We check if the AI has explicitly flagged this as a safe image (e.g. ![safe:Logo](url))
  // Otherwise, we default to protecting it since it may be a clinical diagram or sensitive protest material.
  const isSafe = alt?.toLowerCase().includes('safe:');
  const cleanAlt = alt?.replace(/safe:/i, '').trim();

  if (isSafe || revealed) {
    return (
      <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={src} alt={cleanAlt} style={{ maxWidth: '100%', borderRadius: '4px', border: `1px solid ${C.ghost}` }} />
        {cleanAlt && <span style={{ fontSize: '0.75rem', color: C.dim, marginTop: '0.5rem', fontStyle: 'italic' }}>{cleanAlt}</span>}
      </div>
    );
  }

  return (
    <div 
      onClick={() => setRevealed(true)}
      style={{ 
        margin: '1rem 0', 
        padding: '3rem 1rem', 
        background: 'rgba(255,50,50,0.05)', 
        border: `1px dashed rgba(255,50,50,0.3)`, 
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,50,50,0.1)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,50,50,0.05)'}
    >
      {/* Blurred background preview if possible */}
      <div style={{ position: 'absolute', inset: 0, background: `url(${src}) center/cover`, filter: 'blur(25px) opacity(0.3)' }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
        <EyeOff color="rgba(255,50,50,0.8)" size={24} />
        <strong style={{ color: 'rgba(255,50,50,0.9)' }}>Sensitive Content Hidden</strong>
        <span style={{ fontSize: '0.8rem', color: C.textBright, maxWidth: '250px' }}>
          This image may contain clinical, anatomical, or otherwise sensitive material. 
          <br/><br/>
          <span style={{textDecoration: 'underline'}}>Click to reveal</span> (18+)
        </span>
      </div>
    </div>
  );
};

export default SafeImage;
