import { useState, useEffect, useRef } from "react";
import { C, FONT } from "../styles/tokens";
import { EXHIBIT_ROUTES } from "./ExploreMasthead";

export default function InlineBreadcrumb({ currentRoute, navigate }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const currentExhibit = EXHIBIT_ROUTES.find(e => e.route === currentRoute) || { label: "Unknown" };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.8rem",
      marginBottom: "1.2rem",
      flexWrap: "wrap",
    }}>
      <a href="#/" style={{
        fontFamily: FONT.condensed,
        fontSize: "0.7rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: C.muted,
        textDecoration: "none"
      }}>← Master Index</a>
      <span style={{ color: C.dim }}>/</span>
      <span style={{
        fontFamily: FONT.condensed,
        fontSize: "0.7rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: C.gold,
      }}>Exhibits</span>
      <span style={{ color: C.dim }}>/</span>
      
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0",
            fontFamily: FONT.condensed,
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: C.textBright,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          {currentExhibit.label}
          <span style={{ fontSize: "0.55rem", color: C.dim, transform: `rotate(${dropdownOpen ? 180 : 0}deg)`, transition: "transform 0.2s" }}>▼</span>
        </button>
        
        {dropdownOpen && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 0.8rem)",
            left: -10,
            width: "260px",
            background: C.bgCard,
            border: `1px solid ${C.ghost}`,
            borderRadius: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.55)",
            overflow: "hidden",
            zIndex: 200,
            padding: "0.4rem 0",
          }}>
            {EXHIBIT_ROUTES.map((ex) => {
              const isCurrent = ex.route === currentRoute;
              return (
                <button
                  key={ex.route}
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate(ex.route);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    padding: "0.45rem 1rem",
                    background: isCurrent ? "rgba(212, 160, 48, 0.08)" : "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{
                    fontFamily: FONT.condensed,
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: isCurrent ? C.goldBright : C.dim,
                    marginBottom: "0.1rem",
                  }}>
                    {ex.num}
                  </span>
                  <span style={{
                    fontFamily: FONT.body,
                    fontSize: "0.8rem",
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent ? C.textBright : C.muted,
                  }}>
                    {ex.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
