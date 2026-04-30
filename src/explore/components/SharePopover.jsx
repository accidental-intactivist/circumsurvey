import React, { useState, useRef, useEffect } from "react";
import { C, FONT } from "../styles/tokens";

export default function SharePopover({ url, questionId, questionPrompt, onExportImage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const text = encodeURIComponent(`Check out this finding from the Accidental Intactivist's Inquiry: "${questionPrompt}"`);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = {
    x: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${text}`,
  };

  const popoverButtonStyle = {
    display: "block",
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    padding: "0.6rem 1rem",
    color: C.text,
    fontFamily: FONT.body,
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "background 0.1s",
  };

  return (
    <div style={{ position: "relative" }} ref={popoverRef}>
      <button
        onClick={toggleOpen}
        style={{
          background: isOpen ? "rgba(212,160,48,0.15)" : "transparent",
          border: `1px solid ${C.gold}`,
          color: C.goldBright,
          fontFamily: FONT.condensed,
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "0.4rem 0.8rem",
          borderRadius: 4,
          cursor: "pointer",
          transition: "all 0.15s",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        📤 Share
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 0.5rem)",
          right: 0,
          background: C.bgCard,
          border: `1px solid ${C.ghost}`,
          borderRadius: 8,
          width: "200px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          zIndex: 100,
          overflow: "hidden",
        }}>
          <button 
            style={popoverButtonStyle} 
            onClick={handleCopyLink}
            onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.target.style.background = "transparent"}
          >
            🔗 {copied ? "Copied!" : "Copy Link"}
          </button>
          
          <button 
            style={popoverButtonStyle} 
            onClick={() => {
              setIsOpen(false);
              onExportImage();
            }}
            onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.target.style.background = "transparent"}
          >
            📸 Save as Image
          </button>

          <div style={{ height: "1px", background: C.ghost, margin: "0.2rem 0" }} />

          <a href={shareLinks.x} target="_blank" rel="noopener noreferrer" style={{...popoverButtonStyle, textDecoration: "none"}}>
            <span style={{opacity: 0.8}}>𝕏</span> Share on X
          </a>
          <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" style={{...popoverButtonStyle, textDecoration: "none"}}>
            <span style={{opacity: 0.8, color: "#1877F2"}}>f</span> Share on Facebook
          </a>
          <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{...popoverButtonStyle, textDecoration: "none"}}>
            <span style={{opacity: 0.8, color: "#0A66C2"}}>in</span> Share on LinkedIn
          </a>
          <a href={shareLinks.reddit} target="_blank" rel="noopener noreferrer" style={{...popoverButtonStyle, textDecoration: "none"}}>
            <span style={{opacity: 0.8, color: "#FF4500"}}>🤖</span> Share on Reddit
          </a>
        </div>
      )}
    </div>
  );
}
