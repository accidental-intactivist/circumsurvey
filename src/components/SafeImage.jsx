import React, { useState, useEffect } from 'react';
import { ZoomIn, X, ExternalLink, ShieldAlert, BookOpen, Copy, Check, FileText } from 'lucide-react';
import { C, FONT } from '../styles/tokens';

/**
 * Parses caption, archival provenance, document ID, page number, and licensing
 * from props, structured alt text delimiters, or URL search parameters.
 */
function parseImageMetadata({ src, alt, docId, pageNumber, source, attribution, license }) {
  let isExplicitSafe = false;
  let rawText = (alt || '').trim();

  if (rawText.toLowerCase().startsWith('safe:')) {
    isExplicitSafe = true;
    rawText = rawText.slice(5).trim();
  }

  let caption = '';
  let metaDocId = docId || null;
  let metaPage = pageNumber || null;
  let metaSource = source || attribution || null;
  let metaLicense = license || null;

  // 1. Pipe-separated format: "Caption | Source: ABC | Doc: 123 | Page: 4 | License: Open Access"
  if (rawText.includes('|')) {
    const parts = rawText.split('|').map(s => s.trim());
    caption = parts[0] || '';
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const colonIdx = part.indexOf(':');
      if (colonIdx !== -1) {
        const key = part.slice(0, colonIdx).trim().toLowerCase();
        const val = part.slice(colonIdx + 1).trim();
        if (['source', 'provenance', 'author', 'archive', 'credit', 'collection'].includes(key)) {
          metaSource = metaSource || val;
        } else if (['doc', 'docid', 'document', 'id', 'record'].includes(key)) {
          metaDocId = metaDocId || val;
        } else if (['page', 'pg', 'p', 'plate', 'fig'].includes(key)) {
          metaPage = metaPage || val;
        } else if (['license', 'rights', 'status', 'copyright'].includes(key)) {
          metaLicense = metaLicense || val;
        }
      } else if (!metaSource) {
        metaSource = part;
      }
    }
  } else {
    // 2. Bracketed or parenthetical metadata: "Caption (Source: ABC, Doc: 123, Page: 4)"
    const match = rawText.match(/\(([^)]+)\)$/) || rawText.match(/\[([^\]]+)\]$/);
    if (match) {
      caption = rawText.replace(match[0], '').trim();
      match[1].split(/[,;]/).forEach(item => {
        const colonIdx = item.indexOf(':');
        if (colonIdx !== -1) {
          const k = item.slice(0, colonIdx).trim().toLowerCase();
          const v = item.slice(colonIdx + 1).trim();
          if (['source', 'provenance', 'credit'].includes(k)) metaSource = metaSource || v;
          else if (['doc', 'docid'].includes(k)) metaDocId = metaDocId || v;
          else if (['page', 'pg', 'p'].includes(k)) metaPage = metaPage || v;
          else if (['license', 'rights'].includes(k)) metaLicense = metaLicense || v;
        }
      });
    } else {
      // 3. Em-dash separator: "Caption — Source: ABC"
      const dashParts = rawText.split(/\s*—\s*|\s*--\s*/);
      if (dashParts.length > 1) {
        caption = dashParts[0].trim();
        metaSource = metaSource || dashParts.slice(1).join(' — ').trim();
      } else {
        caption = rawText;
      }
    }
  }

  // 4. Query params on URL if present
  if (src && src.includes('?')) {
    try {
      const q = new URLSearchParams(src.split('?')[1]);
      if (!metaDocId && q.get('doc')) metaDocId = q.get('doc');
      if (!metaPage && q.get('page')) metaPage = q.get('page');
      if (!metaSource && q.get('source')) metaSource = q.get('source');
      if (!metaLicense && q.get('license')) metaLicense = q.get('license');
    } catch(e) {}
  }

  // 5. Automatic matching for curated high-res micrograph assets
  if (src) {
    const filenameMatch = src.match(/([a-f0-9]{16})\.webp/i);
    if (filenameMatch) {
      const matchedId = filenameMatch[1];
      if (!metaDocId) metaDocId = matchedId;
      if (!metaSource) metaSource = 'Cepeda-Emiliani et al. (2025), Andrology';
      if (!metaLicense) metaLicense = 'Open Access Micrograph';
      isExplicitSafe = true;
    } else if (src.includes('gomco')) {
      if (!metaDocId) metaDocId = 'umass-ms1205-raw-efbf6dd4';
      if (!metaSource) metaSource = 'Goldstein & Yellen (1935) / UMass Archive';
      if (!metaLicense) metaLicense = 'Public Domain Schematic';
      isExplicitSafe = true;
    } else if (src.includes('mogen')) {
      if (!metaSource) metaSource = 'Harry Bronstein (1954) / Surgical Patent Archive';
      if (!metaLicense) metaLicense = 'Public Domain Schematic';
      isExplicitSafe = true;
    } else if (src.includes('plastibell')) {
      if (!metaSource) metaSource = 'Hollister Inc. / Historical Medical Device Archive';
      if (!metaLicense) metaLicense = 'Clinical Device Specification';
      isExplicitSafe = true;
    }
  }

  return {
    isSafe: isExplicitSafe,
    caption: caption || 'Archival Figure',
    docId: metaDocId,
    pageNumber: metaPage,
    source: metaSource,
    license: metaLicense
  };
}

const SafeImage = (props) => {
  const { src, alt, docId, pageNumber, source, attribution, license } = props;
  const [revealed, setRevealed] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  const meta = parseImageMetadata({ src, alt, docId, pageNumber, source, attribution, license });

  // Escape key handler for lightbox
  useEffect(() => {
    if (!isZoomed) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsZoomed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  const handleCopyCitation = (e) => {
    e.stopPropagation();
    let text = `"${meta.caption}".`;
    if (meta.source) text += ` Source: ${meta.source}.`;
    if (meta.docId) text += ` Intactivism Primary Archive [Doc ID: ${meta.docId}${meta.pageNumber ? `, Page ${meta.pageNumber}` : ''}].`;
    if (meta.license) text += ` (${meta.license})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Render the attribution bar shared between inline figure and lightbox
  const renderAttributionCard = (isModal = false) => (
    <div 
      className="archival-attribution-card"
      style={{
        width: '100%',
        marginTop: isModal ? '1rem' : '0.65rem',
        padding: isModal ? '0.85rem 1.15rem' : '0.65rem 0.85rem',
        background: isModal ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderLeft: '3px solid var(--c-gold, #d4a030)',
        borderRadius: '0 6px 6px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        boxSizing: 'border-box',
        maxWidth: isModal ? '900px' : '100%'
      }}
    >
      {/* Caption & License Badge */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ 
          fontSize: isModal ? '0.95rem' : '0.82rem', 
          fontWeight: 600, 
          color: 'var(--c-textBright, #f8fafc)', 
          lineHeight: 1.4,
          fontFamily: FONT.sans
        }}>
          {meta.caption}
        </span>
        {meta.license && (
          <span style={{
            fontSize: '0.62rem',
            fontFamily: FONT.condensed,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.15rem 0.4rem',
            borderRadius: '3px',
            background: 'rgba(212, 160, 48, 0.12)',
            color: 'var(--c-goldBright, #facc15)',
            border: '1px solid rgba(212, 160, 48, 0.25)',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}>
            {meta.license}
          </span>
        )}
      </div>

      {/* Source Provenance & Interactive Links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        flexWrap: 'wrap',
        fontSize: '0.72rem',
        color: 'var(--c-muted, #94a3b8)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        paddingTop: '0.35rem'
      }}>
        {meta.source ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0, flex: 1 }}>
            <BookOpen size={12} color="var(--c-gold, #d4a030)" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <strong style={{ color: '#cbd5e1' }}>Provenance:</strong> {meta.source}
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FileText size={12} color="#60a5fa" />
            <span style={{ color: '#94a3b8' }}>Intactivism Archival Collection</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
          {/* Copy Citation Button */}
          <button
            onClick={handleCopyCitation}
            title="Copy scholarly archival citation to clipboard"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0.2rem 0.4rem',
              color: copied ? '#4ade80' : '#94a3b8',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.68rem',
              fontFamily: FONT.condensed,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={e => !copied && (e.currentTarget.style.color = '#f8fafc')}
            onMouseLeave={e => !copied && (e.currentTarget.style.color = '#94a3b8')}
          >
            {copied ? <Check size={11} color="#4ade80" /> : <Copy size={11} />}
            <span>{copied ? 'Copied' : 'Cite'}</span>
          </button>

          {/* Deep link into Library archive */}
          {meta.docId && (
            <a 
              href={`/library/${meta.docId}${meta.pageNumber ? `?page=${meta.pageNumber}` : ''}`}
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                fontSize: '0.7rem',
                fontFamily: FONT.condensed,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#38bdf8',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 600,
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#7dd3fc'}
              onMouseLeave={e => e.currentTarget.style.color = '#38bdf8'}
            >
              <span>View In Library {meta.pageNumber ? `(Page ${meta.pageNumber})` : ''}</span>
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  // If flagged as safe or unlocked by the user, render inline
  if (meta.isSafe || revealed) {
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
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Image Container with Zoom Trigger */}
          <div 
            style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', cursor: 'zoom-in' }}
            onClick={() => setIsZoomed(true)}
            title="Click to view full resolution archival figure"
          >
            <img 
              src={src} 
              alt={meta.caption} 
              loading="lazy"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '440px',
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
                background: 'rgba(0, 0, 0, 0.78)',
                backdropFilter: 'blur(4px)',
                borderRadius: '4px',
                padding: '0.25rem 0.45rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.65rem',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                userSelect: 'none'
              }}
            >
              <ZoomIn size={11} color="#38bdf8" />
              <span>Full Res</span>
            </div>
          </div>

          {/* Professional Archival Attribution Card */}
          {renderAttributionCard(false)}
        </figure>

        {/* Fullscreen Lightbox */}
        {isZoomed && (
          <div 
            onClick={() => setIsZoomed(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: 'rgba(0, 0, 0, 0.94)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              boxSizing: 'border-box'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsZoomed(false)}
              aria-label="Close image viewer"
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <X size={20} />
            </button>

            {/* High Res Figure */}
            <div 
              onClick={e => e.stopPropagation()} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '100%', maxHeight: '100%' }}
            >
              <img 
                src={src} 
                alt={meta.caption} 
                style={{ 
                  maxWidth: '92vw', 
                  maxHeight: '74vh', 
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }} 
              />
              {renderAttributionCard(true)}
            </div>
          </div>
        )}
      </>
    );
  }

  // Sensitive / Unrevealed state (18+ clinical shield)
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
        <span style={{ fontSize: '0.8rem', color: C.textBright, maxWidth: '320px', lineHeight: 1.4 }}>
          {meta.caption ? `"${meta.caption}"` : 'This image may contain clinical, anatomical, or surgical archival material.'}
          <br/><br/>
          <span style={{ textDecoration: 'underline', color: '#60a5fa', fontWeight: 600 }}>Click to reveal figure</span> (18+)
        </span>
      </div>
    </div>
  );
};

export default SafeImage;
