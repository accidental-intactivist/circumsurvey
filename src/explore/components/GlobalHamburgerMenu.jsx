import React, { useState, useEffect, useRef } from 'react';
import { Menu, Layout, Sparkles, BookOpen, HelpCircle, LogIn, LogOut, User, FileText, Settings2 } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from "@clerk/clerk-react";
import ThemeToggle from './ThemeToggle';
import { FONT } from '../styles/tokens';

export default function GlobalHamburgerMenu({ onOpenDocent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditorialUnlocked, setIsEditorialUnlocked] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    try {
      if (localStorage.getItem("cs_editorial_unlocked") === "true") {
        setIsEditorialUnlocked(true);
      }
    } catch (e) {}

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = () => setIsOpen(false);

  const buttonStyle = {
    fontFamily: FONT.condensed,
    fontWeight: 700,
    fontSize: "0.85rem",
    color: "var(--c-text)",
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
          width: "36px",
          height: "36px",
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
        aria-label="Global Navigation Menu"
      >
        <Menu size={22} />
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 0.5rem)",
          right: 0,
          background: "var(--c-bgCard)",
          border: `1px solid var(--c-ghost)`,
          borderRadius: 12,
          padding: "0.75rem",
          minWidth: "260px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02) inset",
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
          backdropFilter: "blur(20px)"
        }}>
          {/* Account Section */}
          <div style={{ 
            padding: "0.5rem 0.5rem 1rem", 
            borderBottom: "1px solid var(--c-ghost)", 
            marginBottom: "0.5rem",
            display: "flex", 
            flexDirection: "column",
            gap: "0.75rem"
          }}>
            <span style={{ 
              fontFamily: FONT.condensed, 
              fontWeight: 700, 
              fontSize: "0.75rem", 
              color: "var(--c-dim)", 
              textTransform: "uppercase", 
              letterSpacing: "0.15em" 
            }}>
              Account
            </span>

            <SignedOut>
              <SignInButton mode="modal">
                <button style={{ 
                  ...buttonStyle, 
                  background: "rgba(91, 147, 199, 0.1)",
                  color: "var(--c-blue)",
                  border: "1px solid rgba(91, 147, 199, 0.2)",
                  justifyContent: "center"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(91, 147, 199, 0.2)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(91, 147, 199, 0.1)"}
                >
                  <LogIn size={16} />
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.2)", padding: "0.5rem", borderRadius: 8, border: "1px solid var(--c-ghost)" }}>
                <UserButton appearance={{ elements: { userButtonAvatarBox: { width: 32, height: 32 } } }} />
                <SignOutButton>
                  <button style={{ 
                    background: "transparent", 
                    border: "none", 
                    color: "var(--c-red)", 
                    cursor: "pointer", 
                    fontFamily: FONT.condensed, 
                    fontWeight: 700, 
                    fontSize: "0.75rem", 
                    textTransform: "uppercase", 
                    letterSpacing: "0.1em",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.4rem 0.6rem",
                    borderRadius: 6,
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(217, 79, 79, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            </SignedIn>
          </div>

          {/* Navigation Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <a 
              href="https://forms.gle/FQ8o9g7j1yU3Cw7n7" 
              target="_blank"
              rel="noreferrer"
              onClick={handleLinkClick} 
              style={{ ...buttonStyle, color: "var(--c-blue)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(91, 147, 199, 0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <Layout size={16} />
              Take the Survey
            </a>
            
            <button 
              onClick={() => {
                handleLinkClick();
                if (onOpenDocent) onOpenDocent();
                else window.dispatchEvent(new CustomEvent('open-docent'));
              }} 
              style={{ ...buttonStyle, color: "var(--c-goldBright)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(212, 160, 48, 0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <Sparkles size={16} />
              Research Assistant
            </button>

            <a 
              href="/explore/report" 
              onClick={handleLinkClick} 
              style={{ ...buttonStyle, color: "var(--c-textBright)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <FileText size={16} />
              Report Builder
            </a>
            
            <div style={{ height: 1, background: "var(--c-ghost)", margin: "0.25rem 0", opacity: 0.5 }} />

            {isEditorialUnlocked && (
              <a 
                href="/explore/editorial" 
                onClick={handleLinkClick} 
                style={{ ...buttonStyle, color: "var(--c-purple)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <BookOpen size={16} />
                Editorial
              </a>
            )}
            
            <a 
              href="/explore/about" 
              onClick={handleLinkClick} 
              style={buttonStyle}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <User size={16} />
              About the Author
            </a>
            
            <a 
              href="/explore/faq" 
              onClick={handleLinkClick} 
              style={buttonStyle}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <HelpCircle size={16} />
              FAQ & Methodology
            </a>
            
            <a 
              href="/explore/contact" 
              onClick={handleLinkClick} 
              style={buttonStyle}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <User size={16} />
              Contact
            </a>
          </div>

          <div style={{ height: 1, background: "var(--c-ghost)", margin: "0.5rem 0", opacity: 0.5 }} />
          
          <ThemeToggle renderTrigger={({ isOpen, toggle }) => (
            <button 
              onClick={toggle}
              style={{ 
                ...buttonStyle, 
                color: "var(--c-muted)", 
                background: isOpen ? "rgba(255,255,255,0.04)" : "transparent" 
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={(e) => e.currentTarget.style.background = isOpen ? "rgba(255,255,255,0.04)" : "transparent"}
            >
              <Settings2 size={16} />
              Theme & Display
            </button>
          )} />
        </div>
      )}
    </div>
  );
}
