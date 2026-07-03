import { useState } from "react";
import { C, FONT, resolveCssColor } from "../styles/tokens";
import { EXHIBIT_ROUTES, ROUTE_META } from "./ExploreMasthead";
import * as Icons from "./Icons";

// ── Compact Exhibit Card (Gemstone Aesthetic) ────────────────────────────────

// Exported so other views (e.g. the Special Report guided tour) can reuse the
// gemstone tiles with a custom link target (`href`/`onClick`) while keeping
// the exact Explore look. Defaults preserve dashboard behavior.
export function ExhibitCard({ exhibit, meta, href, onClick }) {
  const [hovered, setHovered] = useState(false);
  const color = resolveCssColor(exhibit.colorVar || "var(--c-gold)");
  const CardIcon = Icons[exhibit.icon] || Icons.Compass;

  return (
    <a
      href={href || `#/${exhibit.route}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        aspectRatio: "1 / 1", // Clean square
        borderRadius: 16,
        overflow: "hidden",
        textDecoration: "none",
        cursor: "pointer",
        background: C.bgCard,
        border: `1px solid ${hovered ? `${color}70` : `${color}25`}`,
        boxShadow: hovered 
          ? `0 12px 30px rgba(0,0,0,0.6), 0 0 0 1px ${color}50, inset 0 0 40px ${color}15` 
          : `0 4px 12px rgba(0,0,0,0.4)`,
        transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        transform: hovered ? "translateY(-4px)" : "none",
      }}
    >
      {/* Gemstone Vibrant Gradient Layer */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at 50% 40%, ${color}${hovered ? '35' : '15'} 0%, transparent 70%)`,
        transition: "background 0.3s ease",
      }} />

      {/* Top Left: Exhibit Number */}
      <div style={{
        position: "absolute",
        top: "0.75rem",
        left: "0.75rem",
        zIndex: 2,
      }}>
        <span style={{
          fontFamily: FONT.mono,
          fontSize: "0.6rem",
          fontWeight: 800,
          color: C.textBright,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          background: `color-mix(in srgb, ${color} 15%, ${C.bgCard})`,
          padding: "0.25rem 0.6rem",
          borderRadius: 999,
          border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
          boxShadow: `0 2px 4px rgba(0,0,0,0.1)`,
          transition: "all 0.3s ease"
        }}>
          {exhibit.num}
        </span>
      </div>

      {/* Center: Large Glowing Icon */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
        transform: hovered ? "scale(1.1)" : "scale(1)",
        transition: "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}>
        <CardIcon 
          size={52} 
          color={color} 
          style={{
            filter: hovered ? `drop-shadow(0 0 12px ${color}60)` : `drop-shadow(0 0 4px ${color}20)`,
            transition: "filter 0.3s ease",
            opacity: hovered ? 1 : 0.85
          }}
        />
      </div>

      {/* Bottom: Title Area */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "1.5rem 1rem 0.8rem",
        background: `linear-gradient(to top, color-mix(in srgb, ${color} 90%, transparent) 0%, color-mix(in srgb, ${color} 50%, transparent) 60%, transparent 100%)`,
        zIndex: 2,
        transform: hovered ? "translateY(100%)" : "translateY(0)", // Hide title on hover to make room for desc
        transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}>
        <h4 style={{
          fontFamily: FONT.display,
          fontSize: "1rem",
          fontWeight: 700,
          color: C.textBright,
          margin: 0,
          lineHeight: 1.15,
          textAlign: "center",
          textShadow: `0 1px 3px color-mix(in srgb, ${C.bg} 80%, transparent)`
        }}>
          {exhibit.label}
        </h4>
      </div>

      {/* Overlay: Description (Option A: Slide up glassmorphism) */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `color-mix(in srgb, ${color} 85%, transparent)`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderTop: `1px solid color-mix(in srgb, ${C.textBright} 15%, transparent)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "1.2rem",
        zIndex: 3,
        transform: hovered ? "translateY(0)" : "translateY(100%)",
        opacity: hovered ? 1 : 0,
        transition: "all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)",
        overflow: "hidden", // Keep ghost icon contained
      }}>
        {/* Ghost Icon behind text */}
        <CardIcon 
          size={120} 
          color={C.bgCard} 
          style={{
            position: "absolute",
            bottom: -15,
            right: -15,
            transform: "rotate(-10deg)",
            opacity: 0.12,
            zIndex: 0,
            pointerEvents: "none"
          }}
        />

        <h4 style={{
          position: "relative",
          zIndex: 1,
          fontFamily: FONT.display,
          fontSize: "0.95rem",
          fontWeight: 700,
          color: C.textBright,
          margin: "0 0 0.5rem 0",
          lineHeight: 1.15,
          textAlign: "center",
        }}>
          {exhibit.label}
        </h4>
        <p style={{
          position: "relative",
          zIndex: 1,
          fontFamily: FONT.body,
          fontSize: "0.75rem",
          color: C.textBright,
          margin: 0,
          lineHeight: 1.45,
          textAlign: "center",
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {meta.desc || exhibit.tagline || "Interactive data exhibit."}
        </p>
      </div>
    </a>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────

export default function ExhibitsDashboard() {
  return (
    <div style={{ marginBottom: "3rem" }}>
      <h3 style={{
        fontFamily: FONT.condensed,
        fontSize: "0.85rem",
        fontWeight: 700,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: "1.2rem",
        marginTop: 0,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        borderBottom: `1px solid ${C.ghost}`,
        paddingBottom: "0.5rem",
      }}>
        Explore All Exhibits
      </h3>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", // 6 columns on wide screens!
        gap: "1rem",
      }}>
        {EXHIBIT_ROUTES.map(ex => {
          const meta = ROUTE_META[ex.route] || {};
          return <ExhibitCard key={ex.route} exhibit={ex} meta={meta} />;
        })}
      </div>
    </div>
  );
}
