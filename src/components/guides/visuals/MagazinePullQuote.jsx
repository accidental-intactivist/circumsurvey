import React from 'react';
import { Quote } from 'lucide-react';
import { FONT } from '../../../styles/tokens';

export default function MagazinePullQuote({ quote, author, attribution, theme = 'teal' }) {
  const accentColor = theme === 'amber' ? '#d4a030' : theme === 'coral' ? '#d94f4f' : '#1a5c3a';
  const bgColor = theme === 'amber' ? 'rgba(212, 160, 48, 0.06)' : theme === 'coral' ? 'rgba(217, 79, 79, 0.06)' : 'rgba(26, 92, 58, 0.06)';

  return (
    <figure style={{
      margin: '2.5rem 0',
      padding: '2rem 2.25rem',
      background: `linear-gradient(135deg, ${bgColor} 0%, rgba(255, 255, 255, 0.6) 100%)`,
      borderLeft: `5px solid ${accentColor}`,
      borderRadius: '0 16px 16px 0',
      boxShadow: '0 8px 30px rgba(31, 37, 35, 0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Quote Mark Watermark */}
      <span style={{
        position: 'absolute',
        top: '-15px',
        right: '15px',
        fontFamily: FONT.display,
        fontSize: '7rem',
        color: accentColor,
        opacity: 0.12,
        lineHeight: 1,
        pointerEvents: 'none',
        userSelect: 'none'
      }}>
        “
      </span>

      <blockquote style={{
        fontFamily: FONT.display,
        fontStyle: 'italic',
        fontSize: '1.25rem',
        lineHeight: 1.5,
        color: '#1f2523',
        margin: '0 0 1rem 0',
        position: 'relative',
        zIndex: 1
      }}>
        "{quote}"
      </blockquote>

      <figcaption style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        paddingTop: '0.75rem',
        fontSize: '0.82rem',
        color: '#555',
        position: 'relative',
        zIndex: 1
      }}>
        <div>
          <strong style={{ color: '#222' }}>{author}</strong>
          {attribution && <span style={{ color: '#777' }}> • {attribution}</span>}
        </div>
        <span style={{
          fontFamily: FONT.mono,
          fontSize: '0.68rem',
          textTransform: 'uppercase',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          background: 'rgba(0, 0, 0, 0.05)',
          color: accentColor,
          fontWeight: 700
        }}>
          Verified Testimony
        </span>
      </figcaption>
    </figure>
  );
}
