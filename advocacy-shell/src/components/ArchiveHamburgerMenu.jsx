import React, { useState, useEffect, useRef } from 'react';
import { Menu, Layout, Settings2, BookOpen, User, Archive, Key, List, FileText, Globe, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { ThemeSettingsPanel } from './ThemeToggle';

export default function ArchiveHamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main'); 
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setCurrentView('main');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
    setTimeout(() => setCurrentView('main'), 300);
  };

  const buttonStyle = {
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 600,
    fontSize: "0.85rem",
    color: "var(--c-textBright)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    textDecoration: "none",
    padding: "0.75rem 1rem",
    borderRadius: 8,
    transition: "background 0.2s, color 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
  };

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: isOpen ? "rgba(255,255,255,0.1)" : "transparent",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          cursor: "pointer",
          color: isOpen ? "var(--c-textBright)" : "var(--c-muted)",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.color = "var(--c-textBright)";
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.color = "var(--c-muted)";
            e.currentTarget.style.background = "transparent";
          }
        }}
        aria-label="Archive Navigation Menu"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="lux-lens" style={{
          position: "absolute",
          top: "calc(100% + 0.5rem)",
          right: 0,
          background: "var(--c-bgCard)",
          borderRadius: 12,
          minWidth: "260px",
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
          overflow: "hidden"
        }}>
          {currentView === 'main' ? (
            <div style={{ padding: "0.75rem" }}>
              <div style={{ padding: "0.5rem", marginBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: "bold" }}>
                  Public Archive
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <Link to="/graph" onClick={handleLinkClick} style={{ ...buttonStyle, color: "var(--c-goldBright)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Globe size={16} /> Knowledge Graph
                </Link>
                <Link to="/survey-stats" onClick={handleLinkClick} style={{ ...buttonStyle, color: "var(--c-goldBright)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Archive size={16} /> Live Survey Stats
                </Link>
                <Link to="/library" onClick={handleLinkClick} style={buttonStyle}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <BookOpen size={16} /> Digital Library
                </Link>
                <Link to="/news" onClick={handleLinkClick} style={buttonStyle}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Globe size={16} /> News & Updates
                </Link>

                <Link to="/entities" onClick={handleLinkClick} style={buttonStyle}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <User size={16} /> Key Figures & Organizations
                </Link>
              </div>

              <div style={{ padding: "1rem 0.5rem 0.5rem", marginTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: "bold" }}>
                  Staff Tools
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.5rem" }}>
                <Link to="/admin/cms" onClick={handleLinkClick} style={buttonStyle}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <FileText size={16} /> CMS Wrangler
                </Link>
                <Link to="/admin/inventory" onClick={handleLinkClick} style={buttonStyle}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <List size={16} /> Archive Tracker
                </Link>
                <Link to="/admin/entities" onClick={handleLinkClick} style={buttonStyle}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Key size={16} /> Entity Manager
                </Link>
              </div>

              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0.5rem 0" }} />
              
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentView('theme'); }}
                style={{ ...buttonStyle, color: "var(--c-muted)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <Settings2 size={16} /> Theme & Display
              </button>

              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0.5rem 0" }} />
              
              <div style={{ padding: "0.25rem 0.5rem" }}>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button 
                      style={{ ...buttonStyle, color: "var(--c-goldBright)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <LogIn size={16} /> Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: { width: 28, height: 28 } } }} />
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', color: 'var(--c-textBright)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>My Account</span>
                  </div>
                </SignedIn>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", padding: "1rem" }}>
              <div style={{ borderBottom: "1px solid var(--c-ghost)", marginBottom: "0.5rem" }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentView('main'); }}
                  style={{ ...buttonStyle, padding: "0.5rem", marginBottom: "0.5rem", color: "var(--c-textBright)" }}
                >
                  &larr; Back to Menu
                </button>
              </div>
              <div style={{ maxHeight: "calc(100dvh - 8rem)", overflowY: "auto", overflowX: "hidden" }}>
                <ThemeSettingsPanel />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
