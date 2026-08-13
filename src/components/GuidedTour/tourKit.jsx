// ═══════════════════════════════════════════════════════════════════════════
// Guided Tour kit — theme-engine-native building blocks.
// Everything reads C / FONT / PATH_COLORS tokens (CSS custom properties),
// so all themes, modes, typefaces, type scales, and the colorblind palette
// apply automatically, exactly as on the Explore side.
// ═══════════════════════════════════════════════════════════════════════════
import React, { useEffect, useRef, useState } from "react";
import { C, FONT } from "../../explore/styles/tokens";
import * as Icons from "../../explore/components/Icons";
import { ChevronDown } from "lucide-react";
import { useLegibleColor } from "../../explore/lib/colorUtils";
import { Tooltip, useTooltip } from "../../explore/components/Tooltip";

export const EXPLORE_BASE = "/";

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

// ── ExhibitBadge: Otl Aicher–style wayfinding pictogram ────────────────────
// Bold geometric badge with exhibit number + icon. Used everywhere an exhibit
// is referenced so readers always know which path they're looking at.
export function ExhibitBadge({ station, size = "md", showLabel = false }) {
  const Icon = Icons[station.icon];
  const isLg = size === "lg";
  const numSize = isLg ? "1.8rem" : "1.1rem";
  const titleSize = isLg ? "2rem" : "1.25rem";
  const iconSize = isLg ? 22 : 14;
  const badgeLegibleCol = useLegibleColor("var(--c-bg)", station.colorVar);
  const labelLegibleCol = useLegibleColor(station.colorVar, "var(--c-bg)");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: isLg ? "1.2rem" : "0.8rem" }}>
      <div style={{
        background: station.colorVar, borderRadius: "8px",
        width: isLg ? 64 : 42, height: isLg ? 64 : 42,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px",
        boxShadow: `0 0 15px color-mix(in srgb, ${station.colorVar} 40%, transparent)`
      }}>
        {Icon && <Icon size={iconSize} color={badgeLegibleCol} strokeWidth={2.2} />}
        <div style={{
          fontFamily: FONT.condensed, fontWeight: 800,
          fontSize: numSize, color: badgeLegibleCol,
          letterSpacing: "0.05em", lineHeight: 1,
        }}>
          {station.num}
        </div>
      </div>
      {showLabel && (
        <div>
          <div style={{
            fontFamily: FONT.condensed, fontWeight: 700,
            fontSize: "0.65rem", color: labelLegibleCol,
            textTransform: "uppercase", letterSpacing: "0.14em",
            lineHeight: 1, marginBottom: "0.3rem",
          }}>
            Interactive Explorer
          </div>
          <div style={{
            fontFamily: FONT.display, fontSize: titleSize,
            fontWeight: 700, color: C.textBright, lineHeight: 1.15,
          }}>
            {station.title}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ShareTools: subtle share icons for deep-linking ────────────────────────
export function ShareTools({ title }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    const anchorId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${anchorId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <button 
        onClick={handleCopy}
        title="Copy link to this finding"
        style={{
          background: "transparent",
          border: "none",
          color: copied ? C.green : C.dim,
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 0.2s",
          fontFamily: FONT.mono,
          fontSize: "0.6rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {copied ? "Copied!" : <Icons.Share2 size={14} />}
      </button>
    </div>
  );
}

// ── Lens: the guide's wall text ────────────────────────────────────────────
export function Lens({ children, center }) {
  return (
    <Reveal>
      <p style={{
        fontFamily: FONT.body, fontWeight: 300, fontSize: "1rem", color: C.muted,
        lineHeight: 1.75, margin: center ? "0 auto 1.4rem" : "0 0 1.4rem 1.6rem",
        maxWidth: 740, textAlign: center ? "center" : "left",
      }}>
        {children}
      </p>
    </Reveal>
  );
}

// ── TourCard: ruled data card (Bureau DNA on theme tokens) ─────────────────
export function TourCard({ id, title, refText, children, style, exhibitStation }) {
  const PortalIcon = exhibitStation ? Icons[exhibitStation.icon] : null;

  return (
    <Reveal>
      <div id={id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')} style={{
        position: "relative",
        background: C.bgCard, border: `1px solid ${C.ghost}`,
        borderRadius: 12, marginBottom: "1.5rem",
        boxShadow: `0 8px 30px rgba(0,0,0,0.05)`,
        scrollMarginTop: 90,
        ...style
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
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {refText && (
              <div style={{ fontFamily: FONT.mono, fontSize: "0.52rem", color: C.dim, letterSpacing: "0.06em" }}>
                {refText}
              </div>
            )}
            <ShareTools title={title} />
          </div>
        </div>
        <div style={{ padding: "1.6rem 1.5rem" }}>{children}</div>
        {exhibitStation && (
          <div className="exhibit-portal" style={{
            borderTop: `2px solid color-mix(in srgb, ${exhibitStation.colorVar} 40%, transparent)`,
            padding: "1.5rem",
            background: `linear-gradient(180deg, color-mix(in srgb, ${exhibitStation.colorVar} 5%, transparent) 0%, color-mix(in srgb, ${exhibitStation.colorVar} 15%, var(--c-bgDeep)) 100%)`,
            boxShadow: `inset 0 4px 15px color-mix(in srgb, var(--c-text) 5%, transparent)`,
            borderRadius: "0 0 12px 12px",
            position: "relative",
            overflow: "hidden",
            marginTop: "1rem"
          }}>
            {PortalIcon && (
              <div style={{ position: "absolute", right: "-10%", bottom: "-40%", opacity: 0.1, pointerEvents: "none", transform: "rotate(-10deg)" }}>
                <PortalIcon size={240} color={exhibitStation.colorVar} />
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", position: "relative", zIndex: 2 }}>
              <ExhibitBadge station={exhibitStation} size="md" showLabel />
              <a href={EXPLORE_BASE + exhibitStation.route} 
                 className="insert-coin-btn"
                 style={{
                  fontFamily: FONT.condensed, fontWeight: 800, fontSize: "0.85rem",
                  letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none",
                  color: "var(--c-bg)", display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  background: exhibitStation.colorVar,
                  padding: "0.4rem 1.2rem", borderRadius: 999,
                  border: `2px solid color-mix(in srgb, ${exhibitStation.colorVar} 80%, var(--c-textBright))`,
                  whiteSpace: "nowrap", transition: "all 0.2s ease"
              }}>
                Enter Exhibit ➔
              </a>
            </div>
            {exhibitStation.exhibitTeaser && (
              <div style={{
                fontFamily: FONT.body, fontSize: "0.95rem", color: "var(--c-text)",
                lineHeight: 1.5, marginTop: "1rem", paddingTop: "0.8rem",
                borderTop: `1px dashed color-mix(in srgb, ${exhibitStation.colorVar} 30%, transparent)`,
                position: "relative", zIndex: 2
              }}>
                {exhibitStation.exhibitTeaser}
              </div>
            )}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "100%",
              background: `linear-gradient(0deg, transparent 0%, color-mix(in srgb, ${exhibitStation.colorVar} 5%, transparent) 50%, transparent 100%)`,
              opacity: 0.5, pointerEvents: "none", zIndex: 1
            }} />
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
  const validD = d === undefined || isNaN(d) ? 0 : d;
  const mag = Math.abs(validD);
  const bgOpacity = mag >= 1.5 ? 0.14 : mag >= 1.0 ? 0.10 : mag >= 0.5 ? 0.07 : 0.04;
  return (
    <span
      title={tooltip || `Cohen's d = ${validD.toFixed(2)} — effect size`}
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
      d&thinsp;=&thinsp;{validD.toFixed(2)} {stars}
    </span>
  );
}

// ── EffectSizeRow: a labeled row with an effect size bar + badge ───────────
const PARAM_DESCS = {
  "Mobile Skin": "The intact foreskin is a double-layered mucous membrane that glides back and forth over the glans. Circumcision removes this structure, tethering the remaining shaft skin tightly.",
  "Light Touch": "The foreskin is densely packed with specialized fine-touch sensory receptors which are highly sensitive to light pressure and texture.",
  "Variety": "An intact penis features multiple distinct sensory zones (ridged band, frenulum, inner mucosa) which each respond differently to stimuli.",
  "Duration": "The natural gliding mechanism reduces friction, meaning sexual stamina and comfort can be maintained longer without irritation.",
  "Ease": "The inner mucosa naturally retains moisture, allowing for smooth, friction-free movement without the need for artificial lubricants.",
  "Intensity": "The high density of nerve endings in the specialized erogenous tissue provides sharp, highly concentrated peaks of sensation."
};

export function EffectSizeRow({ label, d, stars, colorVar, maxD = 2.0 }) {
  const [ref, seen] = useInView();
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  const validD = d === undefined || isNaN(d) ? 0 : d;
  const pct = Math.min(100, (Math.abs(validD) / maxD) * 100);
  
  const desc = PARAM_DESCS[label];

  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: "0.6rem", margin: "0.35rem 0" }}>
      <span 
        style={{
          fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.68rem",
          letterSpacing: "0.06em", textTransform: "uppercase", color: C.textBright,
          width: 120, flexShrink: 0, textAlign: "right", lineHeight: 1.25,
          cursor: desc ? "help" : "default",
          borderBottom: desc ? `1px dotted ${C.ghost}` : "none",
        }}
        onMouseEnter={(e) => desc && showTooltip(e, desc)}
        onMouseMove={desc ? moveTooltip : undefined}
        onMouseLeave={desc ? hideTooltip : undefined}
      >
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
        d={validD.toFixed(2)} {stars}
      </span>
      <Tooltip {...tooltip} />
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
        background: "transparent", border: "none",
        color: C.goldBright, cursor: "pointer", verticalAlign: "middle",
        marginLeft: "0.4rem", transition: "all 0.2s ease",
        padding: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = C.textBright;
        e.currentTarget.style.transform = "scale(1.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = C.goldBright;
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <Icons.Info size={16} style={{ verticalAlign: "middle", pointerEvents: "none" }} />
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
        <ChevronDown size={12} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
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


