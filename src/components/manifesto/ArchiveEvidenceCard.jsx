import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, FileText, ShieldCheck, Database, Award, Scale } from 'lucide-react';
import { FONT } from '../../styles/tokens';
import SafeImage from '../SafeImage';
import MediaEmbed from '../MediaEmbed';

export default function ArchiveEvidenceCard({ exhibit, index, chapterRoman }) {
  if (!exhibit) return null;

  const getBadgeIcon = (badge) => {
    const b = (badge || '').toLowerCase();
    if (b.includes('telemetry') || b.includes('survey')) return <Database size={13} color="#facc15" />;
    if (b.includes('legal') || b.includes('complaint') || b.includes('statutory')) return <Scale size={13} color="#34d399" />;
    if (b.includes('bioethics') || b.includes('international') || b.includes('consensus')) return <ShieldCheck size={13} color="#22d3ee" />;
    if (b.includes('admission') || b.includes('landmark')) return <Award size={13} color="#fb7185" />;
    return <FileText size={13} color="#facc15" />;
  };

  const isExternal = exhibit.link && (exhibit.link.startsWith('http://') || exhibit.link.startsWith('https://'));

  return (
    <aside className="manifesto-evidence-card">
      {/* Decorative Archival Watermark */}
      <div 
        style={{
          position: 'absolute',
          right: '-1.5rem',
          bottom: '-1.5rem',
          userSelect: 'none',
          pointerEvents: 'none',
          opacity: 0.04,
          fontFamily: FONT.display,
          fontSize: '7rem',
          color: '#d4a030',
          fontWeight: 900
        }}
      >
        {chapterRoman || 'ARCHIVE'}
      </div>

      <div className="manifesto-evidence-inner">
        {/* Header Ribbon */}
        <div className="manifesto-evidence-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="manifesto-badge-pill">
              {getBadgeIcon(exhibit.badge)}
              {exhibit.badge || 'Archive Evidence'}
            </span>
            <span className="manifesto-evidence-accession">
              [PRIMARY ARCHIVE EXHIBIT #{index !== undefined ? String(index + 1).padStart(2, '0') : '01'}]
            </span>
          </div>

          <span 
            style={{
              fontSize: '0.68rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#888',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            title="Archival record replacing speculative illustration"
          >
            <ShieldCheck size={12} color="#34d399" />
            Authentic Primary Source
          </span>
        </div>

        {/* Title */}
        <h4 
          className="manifesto-evidence-title"
          style={{ fontFamily: FONT.display }}
        >
          {exhibit.title}
        </h4>

        {/* Provenance */}
        {exhibit.provenance && (
          <div className="manifesto-evidence-provenance">
            <span style={{ color: '#d4a030', fontWeight: 700 }}>PROVENANCE:</span>
            <span>{exhibit.provenance}</span>
          </div>
        )}

        {/* Verbatim Quotation / Excerpt */}
        {exhibit.quote && (
          <blockquote className="manifesto-evidence-quote">
            &ldquo;{exhibit.quote}&rdquo;
          </blockquote>
        )}

        {/* Archival Figure / Diagram if present */}
        {exhibit.image && (
          <div style={{ margin: '0.75rem 0' }}>
            <SafeImage 
              src={exhibit.image} 
              alt={exhibit.caption || exhibit.title} 
              docId={exhibit.docId}
              pageNumber={exhibit.pageNumber}
            />
          </div>
        )}

        {/* Archival Video if present */}
        {(exhibit.videoUrl || exhibit.video) && (
          <div style={{ margin: '0.75rem 0' }}>
            <MediaEmbed
              url={exhibit.videoUrl || exhibit.video}
              title={exhibit.title}
              host={exhibit.provenance}
              aspectRatio="16/9"
            />
          </div>
        )}

        {/* Action Link to Archive Primary Source */}
        {exhibit.link && (
          <div className="manifesto-evidence-footer">
            <span style={{ fontSize: '0.72rem', color: '#777' }}>
              Verified from 3,200+ Document Archive Corpus
            </span>

            {isExternal ? (
              <a
                href={exhibit.link}
                target="_blank"
                rel="noopener noreferrer"
                className="manifesto-evidence-action-btn"
              >
                <span>{exhibit.actionLabel || 'Inspect External Source'}</span>
                <ExternalLink size={13} />
              </a>
            ) : (
              <Link
                to={exhibit.link}
                className="manifesto-evidence-action-btn"
              >
                <span>{exhibit.actionLabel || 'Inspect in Library'}</span>
                <ExternalLink size={13} />
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
