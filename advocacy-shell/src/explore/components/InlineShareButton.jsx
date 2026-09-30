import React, { useState } from 'react';
import { C, FONT } from '../styles/tokens';
import { Share2, Check } from 'lucide-react';
import { useTelemetry } from '../lib/telemetry';

export default function InlineShareButton({ text, url = window.location.href, label = "Share this finding" }) {
  const [copied, setCopied] = useState(false);
  const { trackEvent } = useTelemetry();

  const handleShare = () => {
    trackEvent('viral_loop_share_clicked', { share_text: text, url });
    
    // Check if the native share API is available
    if (navigator.share) {
      navigator.share({
        title: "The Accidental Intactivist's Inquiry",
        text: text,
        url: url
      }).catch(err => {
        if (err.name !== "AbortError") {
          fallbackCopy();
        }
      });
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const fullText = `${text} ${url}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.4rem 0.8rem",
        background: "rgba(212,160,48,0.15)", // Gold tint
        border: `1px solid rgba(212,160,48,0.4)`,
        borderRadius: 100,
        color: C.textBright,
        fontFamily: FONT.condensed,
        fontWeight: 600,
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        cursor: "pointer",
        transition: "all 0.2s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(212,160,48,0.25)";
        e.currentTarget.style.transform = "scale(1.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(212,160,48,0.15)";
        e.currentTarget.style.transform = "scale(1)";
      }}
      aria-label={label}
    >
      {copied ? <Check size={14} color={C.green} /> : <Share2 size={14} color={C.goldBright} />}
      {copied ? "Copied to Clipboard!" : label}
    </button>
  );
}
