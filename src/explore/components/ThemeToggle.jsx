import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FONT } from '../styles/tokens';

export default function ThemeToggle() {
  const { mode, setMode, palette, setPalette, typeScale, setTypeScale } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      background: "var(--c-bgSoft)",
      borderRadius: 6,
      overflow: "hidden",
      fontFamily: FONT.body,
      fontSize: "0.85rem",
      color: "var(--c-muted)",
      border: "1px solid var(--c-ghost)",
      boxShadow: isOpen ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
      transition: "box-shadow 0.2s"
    }}>
      {/* ── COLLAPSED BUTTON ── */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "0.6rem 0.8rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--c-textBright)",
          fontFamily: FONT.condensed,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.1em" }}>⚙️</span>
          <span>Theme & Access</span>
        </div>
        <span style={{ 
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
          transition: "transform 0.2s ease" 
        }}>▼</span>
      </button>

      {/* ── EXPANDED CONTROLS ── */}
      {isOpen && (
        <div style={{
          padding: "1rem",
          borderTop: "1px solid var(--c-ghost)",
          background: "var(--c-bg)",
        }}>
          {/* Mode Toggle */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ marginBottom: "0.5rem", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mode</div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button 
                onClick={() => setMode('dark')}
                style={{
                  flex: 1, padding: "0.4rem", background: mode === 'dark' ? "var(--c-bgDeep)" : "transparent",
                  color: mode === 'dark' ? "var(--c-gold)" : "var(--c-muted)",
                  border: `1px solid ${mode === 'dark' ? "var(--c-gold)" : "var(--c-ghost)"}`,
                  borderRadius: 3, cursor: "pointer", fontFamily: FONT.condensed
                }}>Dark</button>
              <button 
                onClick={() => setMode('light')}
                style={{
                  flex: 1, padding: "0.4rem", background: mode === 'light' ? "var(--c-bgDeep)" : "transparent",
                  color: mode === 'light' ? "var(--c-gold)" : "var(--c-muted)",
                  border: `1px solid ${mode === 'light' ? "var(--c-gold)" : "var(--c-ghost)"}`,
                  borderRadius: 3, cursor: "pointer", fontFamily: FONT.condensed
                }}>Bureau</button>
            </div>
          </div>

          {/* Palette Toggle */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ marginBottom: "0.5rem", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Palette</div>
            <select 
              value={palette} 
              onChange={e => setPalette(e.target.value)}
              style={{
                width: "100%", padding: "0.4rem", background: "var(--c-bgDeep)", color: "var(--c-text)",
                border: "1px solid var(--c-ghost)", borderRadius: 3, fontFamily: FONT.body, cursor: "pointer"
              }}
            >
              <option value="standard">Rigorous Standard</option>
              <option value="colorblind">Colorblind Safe</option>
              <option value="vaporwave">Vapor-Wave (Easter Egg)</option>
            </select>
          </div>

          {/* Font Scale Toggle */}
          <div>
            <div style={{ marginBottom: "0.5rem", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Type Scale</div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {['standard', 'large', 'xlarge'].map(scale => (
                <button 
                  key={scale}
                  onClick={() => setTypeScale(scale)}
                  style={{
                    flex: 1, padding: "0.4rem", background: typeScale === scale ? "var(--c-bgDeep)" : "transparent",
                    color: typeScale === scale ? "var(--c-gold)" : "var(--c-muted)",
                    border: `1px solid ${typeScale === scale ? "var(--c-gold)" : "var(--c-ghost)"}`,
                    borderRadius: 3, cursor: "pointer", fontFamily: FONT.condensed,
                    textTransform: "capitalize"
                  }}>{scale === 'standard' ? 'Std' : scale === 'large' ? 'Lg' : 'XL'}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
