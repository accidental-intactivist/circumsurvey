import React from "react";
import { C, FONT, resolveCssColor } from "../styles/tokens";
import { useRouter } from "../lib/router";
import { ROUTE_META, EXHIBIT_ROUTES } from "./ExploreMasthead";
import * as Icons from "./Icons";

// ═══════════════════════════════════════════════════════════════════════════
// ExhibitHero — the standard title card at the top of every exhibit.
//
// The card self-configures from the exhibit catalog based on the current route
// so the theme color, icon, and number ALWAYS match the dashboard tile and the
// breadcrumb — no per-page color/icon plumbing required:
//   • color  → the exhibit's catalog color, resolved through the theme engine
//   • icon   → the exhibit's catalog icon
//   • number → derived from the catalog kicker ("Interactive Exhibit 03")
//
// Routes not in the catalog (Methodology, By the Numbers, Report) fall back to
// the gold accent and any explicitly passed `color` / `BackgroundIcon`.
// `title` always overrides so exhibits can keep custom display names.
// ═══════════════════════════════════════════════════════════════════════════

export default function ExhibitHero({
  exhibitNumber: manualExhibitNumber,
  title,
  description,
  color = C.goldBright,
  gradientColor = C.gold,
  BackgroundIcon,
}) {
  const { route } = useRouter();
  const ex = EXHIBIT_ROUTES.find((e) => e.route === route);

  // Color + gradient: catalog wins (theme-engine-resolved), else explicit prop.
  const resolvedColor = ex ? resolveCssColor(ex.colorVar) : resolveCssColor(color);
  const resolvedGradient = ex ? resolvedColor : resolveCssColor(gradientColor);

  // Icon: catalog wins, else explicit override.
  const Icon = (ex && Icons[ex.icon]) || BackgroundIcon || null;

  // Number: explicit override, else derive from the catalog kicker.
  let exhibitNumber = manualExhibitNumber;
  if (!exhibitNumber && ROUTE_META[route]?.kicker) {
    const kicker = ROUTE_META[route].kicker;
    exhibitNumber = kicker.startsWith("Exhibit ") ? kicker.replace("Exhibit ", "") : kicker;
  }

  return (
    <div style={{
      background: `linear-gradient(135deg, ${resolvedColor}14 0%, ${resolvedColor}03 100%)`,
      backdropFilter: "blur(16px)",
      border: `1px solid ${resolvedColor}40`,
      borderRadius: 12,
      padding: "2rem",
      marginBottom: "4rem",
      position: "relative",
      overflow: "hidden",
      boxShadow: `0 6px 0 rgba(0,0,0,0.15)`
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${resolvedGradient}, ${resolvedColor})` }} />

      {Icon && (
        <div style={{ position: "absolute", right: "-5%", bottom: "-20%", opacity: 0.15, pointerEvents: "none", transform: "rotate(-10deg)" }}>
          <Icon size={320} color={resolvedColor} />
        </div>
      )}

      {exhibitNumber && (
        <div style={{
          fontFamily: FONT.condensed,
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: resolvedColor,
          marginBottom: "0.6rem"
        }}>
          {/^\d+$/.test(String(exhibitNumber)) ? `Interactive Exhibit ${exhibitNumber}` : exhibitNumber}
        </div>
      )}

      <h1 style={{
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: "2.5rem",
        color: C.textBright,
        lineHeight: 1.15,
        letterSpacing: "-0.025em",
        marginBottom: "1rem"
      }}>
        {title}
      </h1>

      {description && (
        <p style={{
          fontFamily: FONT.body,
          fontSize: "1.05rem",
          color: C.text,
          lineHeight: 1.6,
          maxWidth: 900,
          margin: 0
        }}>
          {description}
        </p>
      )}
    </div>
  );
}
