import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FONT } from '../styles/tokens';

export default function ThemeToggle() {
  const { 
    theme, setTheme, 
    typeface, setTypeface,
    mode, setMode, 
    colorblind, setColorblind, 
    dyslexicFont, setDyslexicFont,
    typeScale, setTypeScale 
  } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleBtnStyle = {
    background: isOpen ? "var(--c-bgSoft)" : "transparent",
    border: "1px solid var(--c-ghost)",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--c-textBright)",
    transition: "all 0.2s",
  };

  const sectionLabelStyle = {
    marginBottom: "0.5rem", 
    fontSize: "0.7rem", 
    textTransform: "uppercase", 
    letterSpacing: "0.08em",
    color: "var(--c-dim)",
    fontFamily: FONT.condensed,
    fontWeight: 700
  };

  const buttonStyle = (isActive) => ({
    flex: 1, 
    padding: "0.4rem", 
    background: isActive ? "var(--c-bgDeep)" : "transparent",
    color: isActive ? "var(--c-gold)" : "var(--c-muted)",
    border: `1px solid ${isActive ? "var(--c-gold)" : "var(--c-ghost)"}`,
    borderRadius: 4, 
    cursor: "pointer", 
    fontFamily: FONT.condensed,
    textAlign: "center",
    fontSize: "0.8rem",
    textTransform: "capitalize",
    transition: "all 0.15s"
  });

  return (
    <div ref={containerRef} style={{ position: "relative", zIndex: 100 }}>
      {/* ── GEAR ICON BUTTON ── */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={toggleBtnStyle}
        aria-label="Settings"
        onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = "var(--c-bgSoft)"; }}
        onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ fontSize: "1.1rem" }}>⚙️</span>
      </button>

      {/* ── POPOVER MENU ── */}
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 0.5rem)",
          right: 0,
          width: "280px",
          background: "var(--c-bgCard)",
          border: "1px solid var(--c-ghost)",
          borderRadius: 8,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          overflow: "hidden",
          fontFamily: FONT.body,
        }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid var(--c-ghost)" }}>
            <h4 style={{ margin: 0, fontFamily: FONT.display, color: "var(--c-textBright)", fontSize: "1.1rem" }}>Display Settings</h4>
          </div>
          
          <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            
            {/* THEME */}
            <div>
              <div style={sectionLabelStyle}>Theme Aesthetic</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {['standard', 'vaporwave', 'evergreen', 'ocean'].map(t => (
                  <button key={t} onClick={() => setTheme(t)} style={buttonStyle(theme === t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* MODE */}
            <div>
              <div style={sectionLabelStyle}>Color Mode</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setMode('dark')} style={buttonStyle(mode === 'dark')}>Dark</button>
                <button onClick={() => setMode('light')} style={buttonStyle(mode === 'light')}>Light</button>
              </div>
            </div>

            {/* TYPEFACE */}
            <div>
              <div style={sectionLabelStyle}>Typeface Family</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setTypeface('bureau')} style={buttonStyle(typeface === 'bureau')}>Bureau</button>
                <button onClick={() => setTypeface('tomorrow')} style={buttonStyle(typeface === 'tomorrow')}>Tomorrow</button>
              </div>
            </div>

            {/* TYPE SCALE */}
            <div>
              <div style={sectionLabelStyle}>Typography Size</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {['standard', 'large', 'xlarge'].map(scale => (
                  <button key={scale} onClick={() => setTypeScale(scale)} style={buttonStyle(typeScale === scale)}>
                    {scale === 'standard' ? 'Std' : scale === 'large' ? 'Lg' : 'XL'}
                  </button>
                ))}
              </div>
            </div>

            {/* ACCESSIBILITY */}
            <div>
              <div style={sectionLabelStyle}>Accessibility</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", color: "var(--c-text)" }}>
                  <input 
                    type="checkbox" 
                    checked={colorblind} 
                    onChange={(e) => setColorblind(e.target.checked)} 
                    style={{ accentColor: "var(--c-gold)" }}
                  />
                  Colorblind Safe Charts (Wong)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", color: "var(--c-text)" }}>
                  <input 
                    type="checkbox" 
                    checked={dyslexicFont} 
                    onChange={(e) => setDyslexicFont(e.target.checked)} 
                    style={{ accentColor: "var(--c-gold)" }}
                  />
                  Dyslexic Friendly Font (Lexend)
                </label>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
