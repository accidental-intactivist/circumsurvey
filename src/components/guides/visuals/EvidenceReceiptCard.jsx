import React, { useState } from 'react';
import { ExternalLink, BookOpen, Check, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { FONT } from '../../../styles/tokens';

export default function EvidenceReceiptCard({ citation, title, summary, source, url, documentId }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2dccf',
      borderRadius: '10px',
      padding: '0.9rem 1.1rem',
      margin: '0.75rem 0',
      boxShadow: '0 2px 10px rgba(31, 37, 35, 0.04)',
      transition: 'all 0.2s ease'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'rgba(26, 92, 58, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1a5c3a',
            flexShrink: 0
          }}>
            <FileText size={15} />
          </div>
          <div>
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: '0.92rem', color: '#1f2523', lineHeight: 1.25 }}>
              {title || citation}
            </div>
            {source && (
              <div style={{ fontSize: '0.74rem', color: '#777', fontFamily: FONT.mono }}>
                {source}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {summary && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1a5c3a',
                fontSize: '0.78rem',
                fontFamily: FONT.condensed,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}
            >
              {isExpanded ? <>Less <ChevronUp size={12} /></> : <>Evidence <ChevronDown size={12} /></>}
            </button>
          )}

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: '#f2ede3',
                color: '#333',
                padding: '0.3rem 0.6rem',
                borderRadius: '5px',
                fontSize: '0.74rem',
                fontFamily: FONT.mono,
                textDecoration: 'none'
              }}
            >
              <span>Source</span> <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      {/* Expanded Abstract & Context */}
      {isExpanded && summary && (
        <div style={{
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #eee',
          fontSize: '0.84rem',
          color: '#555',
          lineHeight: 1.5,
          fontFamily: FONT.body
        }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>{summary}</p>
          {documentId && (
            <a
              href={`/library/${documentId}`}
              style={{
                color: '#1a5c3a',
                fontWeight: 700,
                fontSize: '0.78rem',
                fontFamily: FONT.condensed,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <BookOpen size={12} /> View in Digital Library Archive &rarr;
            </a>
          )}
        </div>
      )}
    </div>
  );
}
