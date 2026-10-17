import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { captureEvent } from '../../lib/telemetry';

export default function AtlasShareModal({
  isOpen,
  onClose,
  title,
  statSummary,
  citation,
  url,
  geoName,
  metricLabel,
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      captureEvent('atlas_share_modal_opened', { geo: geoName, metric: metricLabel });
    }
  }, [isOpen, geoName, metricLabel]);

  if (!isOpen) return null;

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  
  const formattedCitation = [
    geoName ? `${geoName}: ${statSummary}` : title,
    citation ? `Source: ${citation}` : null,
    `The Global Genital Integrity Atlas`,
    shareUrl
  ].filter(Boolean).join(' — ');

  const shareText = encodeURIComponent(
    geoName
      ? `${geoName}: ${statSummary} (${metricLabel}) — The Global Genital Integrity Atlas`
      : `Explore The Global Genital Integrity Atlas: official reported data & evidence ledger`
  );
  const encodedUrl = encodeURIComponent(shareUrl);

  const socialLinks = {
    x: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${shareText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    captureEvent('atlas_share_copy_link', { geo: geoName });
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(formattedCitation);
    setCopiedCitation(true);
    captureEvent('atlas_share_copy_citation', { geo: geoName });
    setTimeout(() => setCopiedCitation(false), 2200);
  };

  return (
    <div className="at-share-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Share dialog">
      <div className="at-share-modal" onClick={e => e.stopPropagation()}>
        <header className="at-share-head">
          <div>
            <div className="gd-series"><Share2 size={13} /> Granular Share & Export</div>
            <h3 className="at-share-title">{geoName || 'Global View'} · {metricLabel}</h3>
          </div>
          <button type="button" className="at-icon-btn" onClick={onClose} aria-label="Close share dialog">
            <X size={18} />
          </button>
        </header>

        {statSummary && (
          <div className="at-share-stat-card">
            <div className="at-share-stat-val">{statSummary}</div>
            {citation && <div className="at-share-stat-src">📄 {citation}</div>}
          </div>
        )}

        <div className="at-share-section">
          <label className="at-share-label">Direct Deep-Link</label>
          <div className="at-share-input-group">
            <input type="text" readOnly value={shareUrl} className="at-share-input" />
            <button type="button" className="gd-btn gd-btn--primary at-share-btn" onClick={handleCopyLink}>
              {copiedLink ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Link</>}
            </button>
          </div>
        </div>

        <div className="at-share-section">
          <label className="at-share-label">Citable Stat Summary (Markdown & Text)</label>
          <div className="at-share-input-group">
            <input type="text" readOnly value={formattedCitation} className="at-share-input" />
            <button type="button" className="gd-btn at-share-btn" onClick={handleCopyCitation}>
              {copiedCitation ? <><Check size={14} style={{ color: '#10b981' }} /> Copied</> : <><Copy size={14} /> Copy Citation</>}
            </button>
          </div>
        </div>

        <div className="at-share-section">
          <label className="at-share-label">Social Broadcast</label>
          <div className="at-share-social-grid">
            <a href={socialLinks.x} target="_blank" rel="noopener noreferrer" className="at-share-social-btn">
              <span>𝕏</span> Share on X
            </a>
            <a href={socialLinks.reddit} target="_blank" rel="noopener noreferrer" className="at-share-social-btn">
              <span style={{ color: '#ff4500' }}>●</span> Share on Reddit
            </a>
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="at-share-social-btn">
              <span style={{ color: '#0a66c2' }}>in</span> LinkedIn
            </a>
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="at-share-social-btn">
              <span style={{ color: '#1877f2' }}>f</span> Facebook
            </a>
          </div>
        </div>

        <footer className="at-share-foot">
          <Link to="/share" className="at-share-studio-link" onClick={onClose}>
            <Sparkles size={14} /> Open in <strong>Share Studio</strong> to generate customized cards & posters &rarr;
          </Link>
        </footer>
      </div>
    </div>
  );
}
