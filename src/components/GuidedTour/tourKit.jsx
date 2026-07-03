// ═══════════════════════════════════════════════════════════════════════════
// Guided Tour kit — theme-engine-native building blocks.
// Everything reads C / FONT / PATH_COLORS tokens (CSS custom properties),
// so all themes, modes, typefaces, type scales, and the colorblind palette
// apply automatically, exactly as on the Explore side.
// ═══════════════════════════════════════════════════════════════════════════
import React, { useEffect, useRef, useState } from "react";
import { C, FONT } from "../../explore/styles/tokens";
import * as Icons from "../../explore/components/Icons";

export const EXPLORE_BASE = "/explore#/";

// ── useInView: one-shot reveal trigger ─────────────────────────────────────
export function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } });
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

// ── Reveal: fade/slide-up wrapper ──────────────────────────────────────────
export function Reveal({ children, style }) {
  const [ref, seen] = useInView();
  return (
    <div ref={ref} style={{
      opacity: seen ? 1 : 0,
      transform: seen ? "none" : "translateY(14px)",
      transition: "opacity .8s ease, transform .8s ease",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── CountUp (easeOutCubic), theme-safe ─────────────────────────────────────
export function CountUp({ to, suffix = "", decimals = 0, run = true, duration = 950 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf, t0;
    const step = (now) => {
      if (!t0) t0 = now;
      const f = Math.min(1, (now - t0) / duration);
      setVal(to * (1 - Math.pow(1 - f, 3)));
      if (f < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, run, duration]);
  return <>{val.toFixed(decimals)}{suffix}</>;
}

// ── StationHero: ExhibitHero-consistent title card + enter link ────────────
// Mirrors explore/components/ExhibitHero.jsx (tint, border, top bar, kicker,
// watermark icon) with an explicit catalog entry + anchor id + enter pill.
export function StationHero({ station }) {
  const Icon = Icons[station.icon];
  const col = station.colorVar;
  return (
    <Reveal>
      <div id={`st${station.num}`} style={{
        position: "relative", overflow: "hidden", borderRadius: 12,
        padding: "2rem", margin: "4.5rem 0 1.4rem",
        background: `linear-gradient(135deg, color-mix(in srgb, ${col} 8%, transparent) 0%, color-mix(in srgb, ${col} 1%, transparent) 100%)`,
        backdropFilter: "blur(16px)",
        border: `1px solid color-mix(in srgb, ${col} 25%, transparent)`,
        boxShadow: "0 6px 0 rgba(0,0,0,0.15)",
        scrollMarginTop: 90,
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: col }} />
        {Icon && (
          <div style={{ position: "absolute", right: "-5%", bottom: "-20%", opacity: 0.15, pointerEvents: "none", transform: "rotate(-10deg)" }}>
            <Icon size={300} color={col} />
          </div>
        )}
        <div style={{
          fontFamily: FONT.condensed, fontSize: "0.75rem", fontWeight: 700,
          letterSpacing: "0.2em", textTransform: "uppercase", color: col, marginBottom: "0.6rem",
        }}>
          Interactive Exhibit {station.num}
        </div>
        <h2 style={{
          fontFamily: FONT.display, fontWeight: 800, fontSize: "2.1rem",
          color: C.textBright, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 0.6rem",
        }}>
          {station.title}
        </h2>
        <p style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.text, lineHeight: 1.6, maxWidth: 680, margin: 0 }}>
          {station.tagline}
        </p>
        <a href={EXPLORE_BASE + station.route} style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem", marginTop: "1.1rem",
          fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.72rem",
          letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none",
          borderRadius: 100, padding: "0.45rem 1.1rem", color: col,
          border: `1px solid color-mix(in srgb, ${col} 40%, transparent)`,
          background: `color-mix(in srgb, ${col} 10%, transparent)`,
        }}>
          Enter the exhibit ➔
        </a>
      </div>
    </Reveal>
  );
}

// ── Lens: the guide's wall text ────────────────────────────────────────────
export function Lens({ children, center }) {
  return (
    <Reveal>
      <p style={{
        fontFamily: FONT.body, fontWeight: 300, fontSize: "1rem", color: C.muted,
        lineHeight: 1.75, margin: center ? "0 auto 1.4rem" : "0 0 1.4rem",
        maxWidth: 740, textAlign: center ? "center" : "left",
      }}>
        {children}
      </p>
    </Reveal>
  );
}

// ── TourCard: ruled data card (Bureau DNA on theme tokens) ─────────────────
export function TourCard({ title, refText, stamp, children, style }) {
  return (
    <Reveal>
      <div style={{
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
        position: "relative", overflow: "visible", marginBottom: "2.4rem",
        scrollMarginTop: 90, ...style,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: "0.75rem", flexWrap: "wrap", padding: "0.7rem 1.4rem",
          borderBottom: `1px solid ${C.ghost}`, background: "rgba(255,255,255,0.02)",
          borderRadius: "12px 12px 0 0",
        }}>
          <div style={{
            fontFamily: FONT.display, fontWeight: 700, fontSize: "0.74rem",
            textTransform: "uppercase", letterSpacing: "0.14em", color: C.text,
            display: "flex", alignItems: "center", gap: "0.45rem",
          }}>
            <span style={{ color: C.red }}>★</span> {title}
          </div>
          {refText && (
            <div style={{ fontFamily: FONT.mono, fontSize: "0.52rem", color: C.dim, letterSpacing: "0.06em" }}>
              {refText}
            </div>
          )}
        </div>
        <div style={{ padding: "1.6rem 1.5rem" }}>{children}</div>
        {stamp && (
          <div style={{
            position: "absolute", bottom: 14, right: 18,
            fontFamily: FONT.display, fontWeight: 700, fontSize: "0.5rem",
            textTransform: "uppercase", letterSpacing: "0.14em", color: C.red,
            border: `2px solid ${C.red}`, padding: "0.2rem 0.45rem",
            transform: "rotate(-4deg)", opacity: 0.45, borderRadius: 2, pointerEvents: "none",
          }}>
            {stamp}
          </div>
        )}
      </div>
    </Reveal>
  );
}

// ── DataRows: dotted-leader ledger rows with count-up values ───────────────
export function DataRows({ rows }) {
  const [ref, seen] = useInView();
  return (
    <div ref={ref}>
      {rows.map((r, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "baseline", gap: "0.5rem", padding: "0.5rem 0",
          borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
        }}>
          <span style={{
            fontFamily: FONT.display, fontWeight: 600, fontSize: "0.76rem", color: C.text,
            width: 230, flexShrink: 0, display: "flex", alignItems: "center", gap: "0.4rem",
          }}>
            {r.swatch && <i style={{ width: 9, height: 9, borderRadius: "50%", background: r.swatch, display: "inline-block", flexShrink: 0 }} />}
            {r.label}
          </span>
          <span style={{ flex: 1, borderBottom: "2px dotted rgba(255,255,255,0.14)", marginBottom: 3, minWidth: 20 }} />
          <span style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: "0.92rem", color: r.colorVar || C.textBright, flexShrink: 0 }}>
            {typeof r.value === "number"
              ? <CountUp to={r.value} suffix={r.suffix || ""} decimals={r.decimals ?? 0} run={seen} />
              : r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── ArrowNote ──────────────────────────────────────────────────────────────
export function ArrowNote({ lines }) {
  return (
    <div style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.dim, marginTop: "0.85rem", lineHeight: 1.7 }}>
      {lines.map((l, i) => (
        <div key={i}><span style={{ color: C.gold, fontWeight: 700 }}>→ </span>{l}</div>
      ))}
    </div>
  );
}

// ── StatCallout ────────────────────────────────────────────────────────────
export function StatCallout({ big, colorVar, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.85rem", marginTop: "1.1rem",
      padding: "0.8rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: 10,
      borderLeft: `4px solid ${colorVar}`,
    }}>
      <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "2rem", lineHeight: 1, color: colorVar }}>{big}</div>
      <div style={{ fontFamily: FONT.body, fontWeight: 300, fontSize: "0.76rem", color: C.muted, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

// ── SectionKicker: centered "LIVED REALITY"-style heading pair ─────────────
export function SectionKicker({ kicker, title, colorVar }) {
  return (
    <Reveal style={{ textAlign: "center", margin: "4rem 0 1.2rem" }}>
      <div style={{ borderBottom: `5px dotted ${C.ghost}`, opacity: 0.5, marginBottom: "2.4rem" }} />
      <div style={{
        fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.72rem",
        letterSpacing: "0.24em", textTransform: "uppercase", color: colorVar || C.goldBright, marginBottom: "0.4rem",
      }}>
        {kicker}
      </div>
      <h2 style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: "1.8rem", color: C.textBright, margin: 0 }}>
        {title}
      </h2>
    </Reveal>
  );
}
