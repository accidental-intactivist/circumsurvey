import React, { useState } from 'react';
import { EyeOff, ZoomIn, X, ExternalLink, ShieldAlert } from 'lucide-react';
import { C, FONT } from '../styles/tokens';

const SafeImage = ({ src, alt, docId, pageNumber }) => {
  const [revealed, setRevealed] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // We check if the AI has explicitly flagged this as a safe image (e.g. ![safe:Logo](url))
  // Otherwise, we default to protecting it since it may be a clinical diagram or sensitive protest material.
  const isSafe = alt?.toLowerCase().includes('safe:');
  const cleanAlt = alt?.replace(/safe:/i, '').trim();

  if (isSafe || revealed) {
    return (
      <>
        <figure 
          style={{ 
            margin: '1.25rem 0', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${C.ghost}`,
            borderRadius: '8px',
            padding: '0.75rem',
            position: 'relative',
            maxWidth: '100%'
          }}
        >
          <div 
            style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', cursor: 'zoom-in' }}
            onClick={() => setIsZoomed(true)}
            title="Click to view full resolution archival figure"
          >
            <img 
              src={src} 
              alt={cleanAlt} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '420px',
                objectFit: 'contain',
                borderRadius: '6px', 
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }} 
            />
            <div 
              style={{
                position: 'absolute',
                bottom: '0.5rem',
                right: '0.5rem',
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(4px)',
                borderRadius: '4px',
                padding: '0.25rem 0.45rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.65rem',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <ZoomIn size={11} color="#38bdf8" />
              <span>Zoom</span>
            </div>
          </div>

          {cleanAlt && (
            <figcaption 
              style={{ 
                fontSize: '0.75rem', 
                color: C.dim, 
                marginTop: '0.65rem', 
                textAlign: 'center',
                lineHeight: 1.4,
                padding: '0 0.5rem'
              }}
            >
              {cleanAlt}
            </figcaption>
          )}

          {(docId || pageNumber) && (
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <a 
                href={`/library/${docId || ''}${pageNumber ? `?page=${pageNumber}` : ''}`}
                style={{
                  fontSize: '0.68rem',
                  fontFamily: FONT.condensed,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#38bdf8',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>View Source in Library {pageNumber ? `(Page ${pageNumber})` : ''}</span>
                <ExternalLink size={10} />
              </a>
            </div>
          )}
        </figure>

        {/* Fullscreen Lightbox */}
        {isZoomed && (
          <div 
            onClick={() => setIsZoomed(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: 'rgba(0, 0, 0, 0.92)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
          >
            <button 
              onClick={() => setIsZoomed(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
            <img 
              src={src} 
              alt={cleanAlt} 
              style={{ 
                maxWidth: '92vw', 
                maxHeight: '85vh', 
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }} 
            />
            {cleanAlt && (
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '1rem', maxWidth: '800px', textAlign: 'center' }}>
                {cleanAlt}
              </p>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <div 
      onClick={() => setRevealed(true)}
      style={{ 
        margin: '1rem 0', 
        padding: '2.5rem 1rem', 
        background: 'rgba(239, 68, 68, 0.05)', 
        border: '1px dashed rgba(239, 68, 68, 0.35)', 
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.09)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
    >
      {/* Blurred background preview */}
      <div style={{ position: 'absolute', inset: 0, background: `url(${src}) center/cover`, filter: 'blur(30px) opacity(0.2)' }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
        <ShieldAlert color="#ef4444" size={26} />
        <strong style={{ color: '#f87171', fontSize: '0.9rem' }}>Sensitive Archival Figure Hidden</strong>
        <span style={{ fontSize: '0.8rem', color: C.textBright, maxWidth: '280px', lineHeight: 1.4 }}>
          This image may contain clinical, anatomical, or surgical archival material.
          <br/><br/>
          <span style={{ textDecoration: 'underline', color: '#60a5fa', fontWeight: 600 }}>Click to reveal</span> (18+)
        </span>
      </div>
    </div>
  );
};

export default SafeImage;
