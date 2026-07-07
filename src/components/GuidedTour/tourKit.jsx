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
          Exhibit {station.num}
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

// ── BarRows: colorful horizontal bars — the visual sibling of DataRows.
// Use this instead of dotted ledgers wherever a number deserves a bar.
// rows: [{ label, value (number), suffix, decimals, colorVar, max }]
export function BarRows({ rows, max = 100 }) {
  const [ref, seen] = useInView();
  return (
    <div ref={ref}>
      {rows.map((r, i) => {
        const rowMax = r.max ?? max;
        const pct = Math.max(0, Math.min(100, (r.value / rowMax) * 100));
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", margin: "0.45rem 0" }}>
            <span style={{
              fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.7rem",
              letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted,
              width: 200, flexShrink: 0, textAlign: "right", lineHeight: 1.25,
            }}>
              {r.label}
            </span>
            <div style={{ flex: 1, height: 16, background: "rgba(255,255,255,.06)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 3, background: r.colorVar || C.gold,
                width: seen ? `${pct}%` : 0,
                transition: `width .9s cubic-bezier(.25,.8,.3,1) ${(i * 0.07).toFixed(2)}s`,
              }} />
            </div>
            <span style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: "0.82rem", color: r.colorVar || C.textBright, width: 58, flexShrink: 0 }}>
              <CountUp to={r.value} suffix={r.suffix || "%"} decimals={r.decimals ?? (String(r.value).includes(".") ? 1 : 0)} run={seen} />
            </span>
          </div>
        );
      })}
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

// ── PullStat: full-width display-type breathing moment between stations.
// The single most powerful editorial device in data journalism: a huge
// number, one quiet line, and whitespace. Use at most 3–4 per page.
export function PullStat({ kicker, stat, line, colorVar }) {
  const [ref, seen] = useInView(0.4);
  return (
    <div ref={ref} style={{
      textAlign: "center", padding: "5.5rem 1rem 5rem", maxWidth: 780, margin: "0 auto",
      opacity: seen ? 1 : 0, transform: seen ? "none" : "translateY(18px) scale(.985)",
      transition: "opacity .9s ease, transform .9s cubic-bezier(.2,.7,.3,1)",
    }}>
      {kicker && (
        <div style={{
          fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.7rem",
          letterSpacing: "0.26em", textTransform: "uppercase", color: C.muted, marginBottom: "1rem",
        }}>
          {kicker}
        </div>
      )}
      <div style={{
        fontFamily: FONT.display, fontWeight: 800, fontSize: "clamp(3rem, 8vw, 5.5rem)",
        lineHeight: 1, color: colorVar || C.goldBright, letterSpacing: "-0.02em",
        textShadow: `0 0 60px color-mix(in srgb, ${colorVar || C.goldBright} 18%, transparent)`,
      }}>
        {stat}
      </div>
      {line && (
        <div style={{
          fontFamily: FONT.body, fontWeight: 300, fontSize: "1.05rem", color: C.muted,
          marginTop: "1.1rem", lineHeight: 1.6, maxWidth: 520, marginLeft: "auto", marginRight: "auto",
        }}>
          {line}
        </div>
      )}
    </div>
  );
}

// ── MethodPillars: the methodology as four scannable pillars, not prose ────
export function MethodPillars({ pillars }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1.6rem 2rem", padding: "0.4rem 0",
    }}>
      {pillars.map(({ Icon, title, line, colorVar }) => (
        <div key={title} style={{ textAlign: "center" }}>
          {Icon && (
            <div style={{ marginBottom: "0.7rem" }}>
              <Icon size={30} color={colorVar || C.goldBright} />
            </div>
          )}
          <div style={{
            fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.72rem",
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: colorVar || C.goldBright, marginBottom: "0.4rem",
          }}>
            {title}
          </div>
          <div style={{ fontFamily: FONT.body, fontWeight: 300, fontSize: "0.82rem", color: C.muted, lineHeight: 1.55 }}>
            {line}
          </div>
        </div>
      ))}
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

// ── EffectSizeBadge: inline "d = 1.78 ★★★" badge ─────────────────────────
export function EffectSizeBadge({ d, stars, colorVar, tooltip }) {
  const mag = Math.abs(d);
  const bgOpacity = mag >= 1.5 ? 0.14 : mag >= 1.0 ? 0.10 : mag >= 0.5 ? 0.07 : 0.04;
  return (
    <span
      title={tooltip || `Cohen's d = ${d.toFixed(2)} — effect size`}
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.3rem",
        fontFamily: FONT.mono, fontSize: "0.62rem", fontWeight: 700,
        padding: "0.2rem 0.55rem", borderRadius: 100,
        color: colorVar || C.red,
        background: `color-mix(in srgb, ${colorVar || C.red} ${Math.round(bgOpacity * 100)}%, transparent)`,
        border: `1px solid color-mix(in srgb, ${colorVar || C.red} 25%, transparent)`,
        whiteSpace: "nowrap",
      }}
    >
      d&thinsp;=&thinsp;{d.toFixed(2)} {stars}
    </span>
  );
}

// ── EffectSizeRow: a labeled row with an effect size bar + badge ───────────
export function EffectSizeRow({ label, d, stars, colorVar, maxD = 2.0 }) {
  const [ref, seen] = useInView();
  const pct = Math.min(100, (Math.abs(d) / maxD) * 100);
  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: "0.6rem", margin: "0.35rem 0" }}>
      <span style={{
        fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.68rem",
        letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted,
        width: 120, flexShrink: 0, textAlign: "right", lineHeight: 1.25,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 18, background: "rgba(255,255,255,.06)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
        <div style={{
          height: "100%", borderRadius: 3, background: colorVar || C.red,
          width: seen ? `${pct}%` : 0,
          transition: "width 1.1s cubic-bezier(.25,.8,.3,1)",
        }} />
      </div>
      <span style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: "0.72rem", color: colorVar || C.red, width: 80, flexShrink: 0 }}>
        d={d.toFixed(2)} {stars}
      </span>
    </div>
  );
}

// ── EffectBenchmarkChart: lollipop chart comparing effect sizes against known benchmarks ──
export function EffectBenchmarkChart({ benchmarks, maxD = 2.2 }) {
  const [ref, seen] = useInView();
  return (
    <div ref={ref} style={{ padding: "0.4rem 0" }}>
      {/* Reference scale */}
      <div style={{
        display: "flex", justifyContent: "space-between", marginBottom: "0.2rem", marginLeft: 160,
        fontFamily: FONT.mono, fontSize: "0.48rem", color: C.dim, letterSpacing: "0.08em",
      }}>
        {[0, 0.5, 1.0, 1.5, 2.0].map((v) => (
          <span key={v} style={{ width: `${(v / maxD) * 100}%`, textAlign: "center" }}>{v.toFixed(1)}</span>
        ))}
      </div>
      {/* Reference lines */}
      <div style={{ position: "relative", marginLeft: 160, height: 0, marginBottom: "0.1rem" }}>
        {[0.2, 0.5, 0.8].map((v) => (
          <div key={v} style={{
            position: "absolute", left: `${(v / maxD) * 100}%`, top: -4, height: benchmarks.length * 30 + 8,
            borderLeft: `1px dashed ${C.ghost}`,
          }}>
            <span style={{
              position: "absolute", top: -14,
              fontFamily: FONT.mono, fontSize: "0.44rem", color: C.dim,
              transform: "translateX(-50%)", whiteSpace: "nowrap",
            }}>
              {v === 0.2 ? "small" : v === 0.5 ? "medium" : "large"}
            </span>
          </div>
        ))}
      </div>
      {benchmarks.map((b, i) => {
        const pct = Math.min(100, (b.d / maxD) * 100);
        return (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.28rem 0" }}>
            <span style={{
              fontFamily: FONT.body, fontWeight: b.highlight ? 700 : 400,
              fontSize: "0.68rem", color: b.highlight ? C.textBright : C.muted,
              width: 155, flexShrink: 0, textAlign: "right", lineHeight: 1.25,
            }}>
              {b.label}
            </span>
            <div style={{ flex: 1, height: 14, position: "relative" }}>
              {/* Track */}
              <div style={{ position: "absolute", top: 6, left: 0, right: 0, height: 2, background: "rgba(255,255,255,.06)", borderRadius: 1 }} />
              {/* Lollipop line */}
              <div style={{
                position: "absolute", top: 2, left: 0, height: 10,
                width: seen ? `${pct}%` : 0,
                borderTop: `2px solid ${b.color}`,
                transition: `width 1s cubic-bezier(.25,.8,.3,1) ${i * 0.12}s`,
                marginTop: 4,
              }} />
              {/* Dot */}
              <div style={{
                position: "absolute", top: 1, width: 12, height: 12, borderRadius: "50%",
                background: b.highlight ? b.color : "transparent",
                border: `2.5px solid ${b.color}`,
                left: seen ? `calc(${pct}% - 6px)` : "-6px",
                transition: `left 1s cubic-bezier(.25,.8,.3,1) ${i * 0.12}s`,
              }} />
            </div>
            <span style={{
              fontFamily: FONT.mono, fontWeight: 800, fontSize: "0.66rem",
              color: b.highlight ? b.color : C.muted, width: 40, flexShrink: 0,
            }}>
              {b.d.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Narrative Engine Building Blocks ───────────────────────────────────────

export function ChapterDivider({ id, act, title, children }) {
  return (
    <div id={id} style={{ margin: "6rem 0 3rem", textAlign: "center", scrollMarginTop: 90 }}>
      <div style={{ borderTop: `1px solid ${C.ghost}`, width: 60, margin: "0 auto 2rem" }} />
      <div style={{
        fontFamily: FONT.mono, fontSize: "0.62rem", color: C.goldBright, letterSpacing: "0.25em",
        textTransform: "uppercase", marginBottom: "0.8rem", fontWeight: 600,
      }}>
        {act}
      </div>
      <h2 style={{
        fontFamily: FONT.display, fontSize: "2.8rem", fontWeight: 800,
        color: C.textBright, letterSpacing: "-0.03em", margin: "0 0 1.2rem", lineHeight: 1.1,
      }}>
        {title}
      </h2>
      <div style={{
        fontFamily: FONT.body, fontSize: "1.1rem", fontWeight: 300, color: C.text,
        maxWidth: 680, margin: "0 auto", lineHeight: 1.6,
      }}>
        {children}
      </div>
    </div>
  );
}

export function DocentMarker({ topic, onClick }) {
  return (
    <button
      onClick={onClick}
      title={`Ask the Docent about ${topic}`}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 26, height: 26, borderRadius: "50%", border: `1px solid ${C.gold}`,
        background: `color-mix(in srgb, ${C.gold} 12%, transparent)`,
        color: C.goldBright, cursor: "pointer", verticalAlign: "middle",
        marginLeft: "0.4rem", transition: "all 0.2s ease",
        fontFamily: FONT.mono, fontSize: "0.8rem", padding: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = C.gold;
        e.currentTarget.style.color = C.bgDeep;
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `color-mix(in srgb, ${C.gold} 12%, transparent)`;
        e.currentTarget.style.color = C.goldBright;
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <Icons.Info size={14} style={{ verticalAlign: "middle", pointerEvents: "none" }} />
    </button>
  );
}

export function ResearcherFootnote({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: "1rem" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none", border: "none", padding: 0, cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          fontFamily: FONT.mono, fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase",
          color: open ? C.textBright : C.dim, transition: "color 0.2s",
        }}
      >
        <Icons.ChevronDown size={12} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
        {open ? "Close Academic Detail" : "For Researchers: Academic Detail"}
      </button>
      {open && (
        <div style={{
          marginTop: "0.6rem", padding: "0.8rem 1rem", background: "rgba(255,255,255,0.03)",
          borderLeft: `2px solid ${C.dim}`, borderRadius: "0 4px 4px 0",
          fontFamily: FONT.mono, fontSize: "0.65rem", color: C.muted, lineHeight: 1.6,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}


