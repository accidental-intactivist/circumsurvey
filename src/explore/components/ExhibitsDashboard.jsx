import { useState } from "react";
import { C, FONT, resolveCssColor } from "../styles/tokens";
import { EXHIBIT_ROUTES, ROUTE_META } from "./ExploreMasthead";
import * as Icons from "./Icons";

// ── Exhibit Card (Internal Slide-Up Reveal) ─────────────────────────────────

function ExhibitCard({ exhibit, meta }) {
  const [hovered, setHovered] = useState(false);
  const color = resolveCssColor(exhibit.colorVar || "var(--c-gold)");
  const CardIcon = Icons[exhibit.icon] || Icons.Compass;

  return (
    <a
      href={`#/${exhibit.route}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "block",
        height: 145, // Fixed height prevents layout shift
        borderRadius: 14,
        overflow: "hidden",
        textDecoration: "none",
        cursor: "pointer",
        background: C.bgCard,
        border: `1px solid ${hovered ? `${color}50` : C.ghost}`,
        boxShadow: hovered 
          ? `0 12px 30px rgba(0,0,0,0.5), 0 0 0 1px ${color}30, inset 0 0 60px ${color}10` 
          : `0 2px 10px rgba(0,0,0,0.3)`,
        transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        transform: hovered ? "translateY(-3px)" : "none",
      }}
    >
      {/* Background Vibrant Gradient Layer */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(ellipse at 80% 0%, ${color}20 0%, transparent 60%),
          linear-gradient(145deg, transparent 40%, ${color}10 100%)
        `,
        opacity: hovered ? 1 : 0.3,
        transition: "opacity 0.4s ease",
      }} />

      {/* Background Graphic */}
      <div style={{
        position: "absolute",
        right: -10,
        top: -10,
        opacity: hovered ? 0.15 : 0.05,
        transform: hovered ? "scale(1.1) rotate(-5deg)" : "scale(1) rotate(0deg)",
        transition: "all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
        pointerEvents: "none",
      }}>
        <CardIcon size={120} color={color} />
      </div>

      {/* Top vibrant line */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: hovered ? 3 : 2,
        background: `linear-gradient(90deg, ${color}, ${color}60, transparent)`,
        opacity: hovered ? 1 : 0.5,
        transition: "all 0.3s ease",
      }} />

      {/* Sliding Content Container */}
      <div style={{
        position: "absolute",
        inset: 0,
        padding: "1.1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end", // Align bottom
      }}>
        {/* Wrapper that slides up */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          transform: hovered ? "translateY(0)" : "translateY(55px)", // 55px pushes the description fully out of view
          transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}>
          
          {/* Header Info (Always visible, moves up) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              alignSelf: "flex-start",
              padding: "0.2rem 0.5rem",
              borderRadius: 20,
              background: hovered ? `${color}25` : `${color}15`,
              border: `1px solid ${color}30`,
              transition: "background 0.3s ease",
            }}>
              <CardIcon size={12} color={color} />
              <span style={{
                fontFamily: FONT.mono,
                fontSize: "0.55rem",
                fontWeight: 700,
                color: color,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                {exhibit.num}
              </span>
            </div>

            <h4 style={{
              fontFamily: FONT.display,
              fontSize: "1.05rem",
              fontWeight: 700,
              color: hovered ? C.textBright : C.text,
              margin: 0,
              lineHeight: 1.2,
              textShadow: hovered ? `0 2px 10px ${color}40` : "none",
              transition: "color 0.3s ease, text-shadow 0.3s ease",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {exhibit.label}
            </h4>
          </div>

          {/* Description (Slides in from bottom) */}
          <div style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
            transitionDelay: hovered ? "0.05s" : "0s",
            height: 50, // Reserve exact space so translation amount is predictable
          }}>
            <p style={{
              fontFamily: FONT.body,
              fontSize: "0.72rem",
              color: C.muted,
              margin: 0,
              lineHeight: 1.45,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {meta.desc || "Interactive data exhibit."}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────

export default function ExhibitsDashboard() {
  return (
    <div>
      <h3 style={{
        fontFamily: FONT.condensed,
        fontSize: "0.85rem",
        fontWeight: 700,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: "1rem",
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
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "0.8rem",
      }}>
        {EXHIBIT_ROUTES.map(ex => {
          const meta = ROUTE_META[ex.route] || {};
          return <ExhibitCard key={ex.route} exhibit={ex} meta={meta} />;
        })}
      </div>
    </div>
  );
}
