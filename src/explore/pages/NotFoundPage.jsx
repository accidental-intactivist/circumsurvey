import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { C, FONT, RAINBOW } from "../styles/tokens";
import * as Icons from "../components/Icons";
import { ROUTE_META, EXHIBIT_ROUTES } from "../components/ExploreMasthead";

export default function NotFoundPage({ onOpenDocent }) {
  const navigate = useNavigate();

  // Pick 3 random exhibits on each mount (Fisher-Yates shuffle, then slice)
  const suggestions = useMemo(() => {
    const pool = EXHIBIT_ROUTES.map(ex => ({
      ...ex,
      ...ROUTE_META[ex.route],
      id: ex.route,
      route: `/explore#/${ex.route}`,
      icon: Icons[ex.icon] || Icons.Compass,
    }));
    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 3);
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>

      {/* ── Rainbow rule (signature Tomorrow Bureau divider) ── */}
      <div style={{
        height: 3,
        background: RAINBOW,
        borderRadius: 2,
        marginBottom: "3rem",
        opacity: 0.6,
      }} />

      {/* ── Hero area with subtle Harmonic accent ── */}
      <div style={{ position: "relative", marginBottom: "2.5rem" }}>
        {/* Large ghosted icon — matches exhibit header pattern */}
        <div style={{
          position: "absolute",
          right: "-5%",
          bottom: "-30%",
          opacity: 0.08,
          pointerEvents: "none",
          transform: "rotate(-10deg)",
        }}>
          <Icons.Compass size={280} color={C.gold} />
        </div>

        <div style={{
          fontFamily: FONT.condensed,
          fontWeight: 700,
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: C.gold,
          marginBottom: "0.75rem",
        }}>
          Navigation
        </div>

        <h1 style={{
          fontFamily: FONT.display,
          fontSize: "2.8rem",
          fontWeight: 800,
          color: C.textBright,
          margin: 0,
          lineHeight: 1.15,
        }}>
          Topic Not Found
        </h1>

        <p style={{
          fontFamily: FONT.body,
          fontSize: "1.05rem",
          color: C.muted,
          lineHeight: 1.7,
          marginTop: "1rem",
          maxWidth: 540,
        }}>
          We couldn't find what you were looking for — the link may be
          outdated or mistyped. You can browse one of the suggested
          topics below, or ask our Research Assistant for help
          finding what you need.
        </p>
      </div>

      {/* ── Ask the AI Docent CTA ── */}
      {onOpenDocent && (
        <button
          onClick={onOpenDocent}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            background: `linear-gradient(135deg, rgba(255,200,50,0.12), rgba(255,200,50,0.04))`,
            border: `1px solid ${C.gold}50`,
            padding: "0.7rem 1.4rem",
            borderRadius: 999,
            fontFamily: FONT.condensed,
            fontWeight: 700,
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: C.goldBright,
            cursor: "pointer",
            transition: "all 0.25s ease",
            marginBottom: "2.5rem",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, rgba(255,200,50,0.22), rgba(255,200,50,0.08))`;
            e.currentTarget.style.borderColor = C.goldBright;
            e.currentTarget.style.boxShadow = `0 0 20px rgba(255,200,50,0.15)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, rgba(255,200,50,0.12), rgba(255,200,50,0.04))`;
            e.currentTarget.style.borderColor = `${C.gold}50`;
            e.currentTarget.style.boxShadow = `none`;
          }}
        >
          <Icons.Sparkles size={16} /> Ask the Research Assistant
        </button>
      )}

      {/* ── Suggestion cards (gemstone style) ── */}
      <div style={{
        fontFamily: FONT.condensed,
        fontWeight: 600,
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: C.dim,
        marginBottom: "1rem",
      }}>
        Suggested Topics
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "3rem",
      }}>
        {suggestions.map((ex) => (
          <SuggestionCard key={ex.id} exhibit={ex} navigate={navigate} />
        ))}
      </div>

      {/* ── Return link ── */}
      <button
        onClick={() => navigate("/explore")}
        style={{
          background: "transparent",
          color: C.muted,
          border: `1px solid ${C.ghost}`,
          padding: "0.55rem 1.4rem",
          borderRadius: 999,
          fontFamily: FONT.condensed,
          fontWeight: 700,
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          cursor: "pointer",
          transition: "all 0.25s ease",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = C.gold;
          e.currentTarget.style.color = C.goldBright;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = C.ghost;
          e.currentTarget.style.color = C.muted;
        }}
      >
        <Icons.ArrowLeft size={14} /> Return to Master Index
      </button>
    </div>
  );
}


// ── Suggestion Card (mini gemstone) ──────────────────────────────────────────

function SuggestionCard({ exhibit, navigate }) {
  const [hovered, setHovered] = React.useState(false);
  const CardIcon = exhibit.icon || Icons.Compass;

  return (
    <div
      onClick={() => navigate(exhibit.route)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: C.bgCard,
        border: `1px solid ${hovered ? C.gold + "60" : C.ghost}`,
        borderRadius: 14,
        padding: "1.5rem 1.25rem",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered
          ? `0 10px 25px rgba(0,0,0,0.5), inset 0 0 30px rgba(255,200,50,0.04)`
          : `0 2px 8px rgba(0,0,0,0.3)`,
        overflow: "hidden",
      }}
    >
      {/* Subtle radial glow on hover */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at 50% 30%, ${C.gold}${hovered ? "18" : "08"} 0%, transparent 70%)`,
        transition: "background 0.3s ease",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
        {/* Top group: kicker + title */}
        <div>
          {/* Icon + Kicker row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.75rem",
          }}>
            <CardIcon
              size={18}
              color={hovered ? C.goldBright : C.gold}
              style={{ transition: "color 0.2s ease", opacity: 0.9 }}
            />
            <span style={{
              fontFamily: FONT.condensed,
              fontWeight: 700,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: C.gold,
            }}>
              {exhibit.kicker}
            </span>
          </div>

          <h3 style={{
            fontFamily: FONT.display,
            fontSize: "1.1rem",
            fontWeight: 700,
            color: C.textBright,
            margin: 0,
            lineHeight: 1.2,
          }}>
            {exhibit.title}
          </h3>
        </div>

        {/* Bottom: description */}
        <p style={{
          fontFamily: FONT.body,
          fontSize: "0.82rem",
          color: C.dim,
          lineHeight: 1.45,
          margin: "0.75rem 0 0",
        }}>
          {exhibit.desc}
        </p>
      </div>

      {/* Arrow indicator */}
      <div style={{
        position: "absolute",
        bottom: "1rem",
        right: "1rem",
        color: hovered ? C.goldBright : C.ghost,
        transition: "all 0.25s ease",
        transform: hovered ? "translateX(2px)" : "none",
      }}>
        <Icons.ArrowRight size={14} />
      </div>
    </div>
  );
}
