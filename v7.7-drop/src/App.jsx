// ═══════════════════════════════════════════════════════════════
// v7 — "The Special Report" final form
// Editorial design language × Magazine-quality editorial motion
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  META, PATHWAY,
  ALL_QUESTIONS, MIRROR_PAIRS, QUOTE_GALLERIES,
  CURATED_SECTIONS
} from "./data.js";
import {
  DEMOGRAPHIC_DIMENSIONS,
  DEMOGRAPHIC_BASE_RATE,
  DEMOGRAPHIC_OUTLIERS,
  DEMOGRAPHIC_META,
} from "./demographics.js";
import { VOICES_THEMES } from "./voices.js";

// ── Type scale (bumped per Tone's feedback) ────────────────────
const TYPE = {
  // Display
  mastheadHero:    "clamp(3rem, 8vw, 6rem)",      // landing HUGE
  heroDisplay:     "clamp(2.6rem, 6.5vw, 4.8rem)", // card hero
  sectionTitle:    "clamp(1.7rem, 3.2vw, 2.4rem)",
  cardQuestion:    "clamp(1.2rem, 2vw, 1.55rem)",  // up from 1.1
  cardLabel:       "clamp(0.72rem, 1vw, 0.85rem)", // eyebrows
  body:            "clamp(0.95rem, 1.1vw, 1.05rem)", // up from 0.85 to min 1rem
  bodySmall:       "clamp(0.82rem, 1vw, 0.9rem)",
  dataValue:       "clamp(1.05rem, 1.2vw, 1.2rem)", // the numbers
  dataLabel:       "clamp(0.88rem, 1.05vw, 0.98rem)",
  bigStat:         "clamp(2.6rem, 4.5vw, 3.8rem)",  // stat callouts
  pullQuote:       "clamp(1.3rem, 2.5vw, 1.9rem)",   // pull quotes
  nav:             "clamp(0.7rem, 0.85vw, 0.8rem)",
  mono:            "clamp(0.62rem, 0.75vw, 0.72rem)",
};

// ── Paper-grain SVG (encoded as data URI, under 1KB) ───────────
// Subtle fractal noise filter applied with low opacity
const GRAIN_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.17 0 0 0 0 0.15 0 0 0 0 0.13 0 0 0 0.085 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>`;

// ── Color system ───────────────────────────────────────────────
const C = {
  bg:        "#0a0a0c",
  bgSoft:    "#131316",
  bgDeep:    "#050506",
  pageText:  "#eee",
  pageTextBright: "#fff",
  pageMuted: "#999",
  pageDim:   "#666",
  pageGhost: "#2a2a30",

  paper:         "#faf6f0",
  paperWarm:     "#f4ede0",
  paperEdge:     "#f0ece4",
  paperInk:      "#2a2622",
  paperInkText:  "#faf6f0",
  paperInkDeep:  "#1a1815",
  paperSubtle:   "#3a3530",  // darker, more readable
  paperDim:      "#5a5450",
  paperGhost:    "#8a8680",
  paperRule:     "#e8e2d8",
  paperRuleDash: "#d4cfc4",
  paperFill:     "#f0ece4",
  paperBarBg:    "#eae4da",
  dotLeader:     "#c4bdb0",

  gold:       "#d4a030",
  goldBright: "#e8b840",
  goldDeep:   "#a87e18",

  red:          "#d94f4f",
  redBright:    "#e85d50",
  redDeep:      "#a03030",
  orange:       "#e8a44a",
  orangeBright: "#f09860",
  yellow:       "#e8c868",
  yellowBright: "#f0c840",
  green:        "#68b878",
  greenDeep:    "#4a8a58",
  blue:         "#5b93c7",
  blueBright:   "#5888c0",
  blueDeep:     "#3a6f9a",
  lightBlue:    "#8bb8d9",
  neutral:      "#a0a0a0",
};

// ── Community-validated pathway palette ────────────────────────
const PATH_COLORS = {
  intact:      "#5b93c7",
  circumcised: "#d94f4f",
  restoring:   "#e8c868",
  observer:    "#a0a0a0",
  all_circ:    "#cc6855",
};

const PATH_BG = {
  intact:      "rgba(91,147,199,0.10)",
  circumcised: "rgba(217,79,79,0.10)",
  restoring:   "rgba(232,200,104,0.10)",
  observer:    "rgba(160,160,160,0.10)",
  all_circ:    "rgba(204,104,85,0.10)",
};

const pathColor = (p) => PATH_COLORS[p] || C.neutral;
const pathBg    = (p) => PATH_BG[p]     || "rgba(0,0,0,0.05)";

// ── Gradient grammar ───────────────────────────────────────────
const PATH_GRADIENTS = {
  intact:      "linear-gradient(90deg, #5b93c7, #68b878)",
  circumcised: "linear-gradient(90deg, #d94f4f, #e8a44a)",
  restoring:   "linear-gradient(90deg, #e8c868, #d94f4f)",
  observer:    "linear-gradient(90deg, #a0a0a0, #d4a030)",
  all_circ:    "linear-gradient(90deg, #d94f4f, #e8c868)",
};

const RAINBOW_GRAD = "linear-gradient(90deg, #d94f4f, #e8a44a, #e8c868, #68b878, #5b93c7)";

function mirrorGradient(l, r) {
  const lc = pathColor(l), rc = pathColor(r);
  return `linear-gradient(90deg, ${lc} 0%, ${lc} 40%, ${rc} 60%, ${rc} 100%)`;
}

// ── Consensus detection ────────────────────────────────────────
function isConsensus(q) {
  if (!q.data || q.type === "avg") return false;
  const pathways = Object.keys(q.data).filter(p => Array.isArray(q.data[p]));
  if (pathways.length < 3) return false;
  const tops = pathways.map(p => {
    const arr = q.data[p];
    if (!arr || !arr.length) return null;
    return { idx: arr.indexOf(Math.max(...arr)), val: Math.max(...arr) };
  }).filter(Boolean);
  if (tops.length < 3) return false;
  const firstIdx = tops[0].idx;
  return tops.every(t => t.idx === firstIdx && t.val >= 75);
}

function questionGradient(q) {
  if (isConsensus(q)) return RAINBOW_GRAD;
  const pathways = q.pathways || (q.data ? Object.keys(q.data).filter(p =>
    q.type === "avg" ? q.data[p] != null : Array.isArray(q.data[p])
  ) : []);
  if (pathways.length === 1) return PATH_GRADIENTS[pathways[0]] || PATH_GRADIENTS.observer;
  if (pathways.length >= 4) return RAINBOW_GRAD;
  return RAINBOW_GRAD;
}

const CATS = [...new Set(ALL_QUESTIONS.map(q => q.cat))];

const ALL_CIRC_META = {
  label: "All Circumcised Respondents",
  short: "All Circ.",
  n: (PATHWAY.circumcised?.n || 0) + (PATHWAY.restoring?.n || 0),
  emoji: "🔵🟣",
};

function getCombinedData(q) {
  const cN = PATHWAY.circumcised.n, rN = PATHWAY.restoring.n, total = cN + rN;
  if (q.type === "avg") {
    return (q.data.circumcised * cN + q.data.restoring * rN) / total;
  }
  return q.data.circumcised.map((v, i) => (v * cN + q.data.restoring[i] * rN) / total);
}

function refCode(q, n) {
  const base = `FORM CS-${(q.id || "").toUpperCase().substring(0, 10)}`;
  return `${base} · PHASE 1 · N = ${n || META.totalRespondents}`;
}

// ── Paper styles (with grain) ──────────────────────────────────
const PAPER_BG = `url("${GRAIN_SVG}"), linear-gradient(180deg, ${C.paper} 0%, ${C.paperWarm} 100%)`;

// ── IntersectionObserver hooks ────────────────────────────────
function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let el = ref.current;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    // Try immediately; retry once on next frame if ref wasn't attached yet
    const attach = () => {
      el = ref.current;
      if (!el) return false;
      // Check if already in viewport NOW — for elements that mount already visible
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh * 1.5 && rect.bottom > -vh * 0.5) {
        setVisible(true);
        return true;
      }
      const obs = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) { setVisible(true); obs.unobserve(e.target); }
        }),
        { threshold: 0, rootMargin: "200px 0px 200px 0px", ...options }
      );
      obs.observe(el);
      return obs;
    };
    const result = attach();
    if (result === false) {
      // Retry on next frame
      const raf = requestAnimationFrame(() => {
        const r2 = attach();
        if (r2 === false) setVisible(true); // Give up gracefully — just show it
      });
      return () => cancelAnimationFrame(raf);
    }
    return () => { if (result && result.disconnect) result.disconnect(); };
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style, className }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
      ...style,
    }}>{children}</div>
  );
}

// Animated tween 0 → 1 over duration ms once visible
function useTween(visible, duration = 800, ease = (p) => 1 - Math.pow(1 - p, 3)) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start;
    let raf;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      setProgress(ease(p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [visible, duration]);
  return progress;
}

// Count-up animation for big numbers
function CountUp({ to, suffix = "", duration = 1600, visible = true, decimals = 0 }) {
  const p = useTween(visible, duration);
  const val = to * p;
  return (
    <>{val.toFixed(decimals)}{suffix}</>
  );
}

// ═══════════════════════════════════════════════════════════════
// CIRCUMSURVEY SEAL — custom SVG badge
// Inspired by your Data Studio donut's red star logo
// ═══════════════════════════════════════════════════════════════

function CircumSurveySeal({ size = 44, ringColor = C.red, starColor = C.gold }) {
  // At large sizes (footer), use the real CircumSurvey logo PNG —
  // it has "CIRCUM SURVEY. ONLINE" text and the character you expect.
  // At small sizes (nav, 28px), the PNG's detail gets lost, so we fall
  // back to a stylized SVG that reads better as a tiny badge.
  if (size >= 80) {
    return (
      <img
        src="/circumsurvey-logo.png"
        width={size}
        height={size}
        alt="CircumSurvey.online"
        style={{
          display: "block",
          width: size,
          height: size,
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
        }}
      />
    );
  }

  // Stylized small-size mark — big star, red disc, text arc only if it fits
  const r = size / 2;
  const cx = r, cy = r;
  const showText = size >= 40;

  const starR = r * (showText ? 0.48 : 0.62);
  const starIR = starR * 0.4;
  const starPts = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? starR : starIR;
    starPts.push(`${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`);
  }

  const textR = r * 0.78;
  const pathId = `seal-text-path-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))" }}
      role="img"
      aria-label="CircumSurvey.online"
    >
      <defs>
        <path
          id={pathId}
          d={`M ${cx},${cy} m ${-textR},0 a ${textR},${textR} 0 1,1 ${textR * 2},0 a ${textR},${textR} 0 1,1 ${-textR * 2},0`}
          fill="none"
        />
      </defs>
      <circle cx={cx} cy={cy} r={r - 0.5} fill={ringColor} />
      <circle cx={cx} cy={cy} r={r - 0.5} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
      {showText && (
        <text
          fill={C.paper}
          fontFamily="'Barlow Condensed', sans-serif"
          fontWeight="800"
          fontSize={size * 0.155}
          letterSpacing="0.5"
        >
          <textPath href={`#${pathId}`} startOffset="0%">
            CIRCUMSURVEY · ONLINE ·&#160;
          </textPath>
        </text>
      )}
      <polygon points={starPts.join(" ")} fill={starColor} />
    </svg>
  );
}


// ═══════════════════════════════════════════════════════════════
// BUREAU CARD with paper grain + animated rainbow shimmer
// ═══════════════════════════════════════════════════════════════

function BureauCard({ title, refText, stamp, stampColor, gradient, cardLabel, children, style, shimmer }) {
  const [ref, visible] = useReveal();
  const useRainbow = gradient === RAINBOW_GRAD;
  return (
    <div
      ref={ref}
      style={{
        background: PAPER_BG,
        border: `2.5px solid ${C.paperInk}`,
        borderRadius: 10,
        position: "relative",
        overflow: "hidden",
        marginBottom: "3rem",
        boxShadow: visible ? "0 6px 32px rgba(0,0,0,0.35)" : "0 2px 8px rgba(0,0,0,0.15)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.75s ease-out, transform 0.75s ease-out, box-shadow 0.75s ease-out",
        ...style,
      }}
    >
      {/* Accent gradient bar with optional shimmer */}
      <div style={{ position: "relative", height: 6, background: gradient || RAINBOW_GRAD, overflow: "hidden" }}>
        {useRainbow && shimmer !== false && (
          <div style={{
            position: "absolute",
            top: 0, left: 0,
            width: "30%",
            height: "100%",
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
            animation: "bureauShimmer 7s ease-in-out infinite",
          }} />
        )}
      </div>

      {/* Dark letterhead strip */}
      <div style={{
        background: C.paperInk,
        color: C.paperInkText,
        padding: "0.7rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "0.6rem",
        flexWrap: "wrap",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: TYPE.cardLabel,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}>
          <span style={{ color: C.red, fontSize: "1.05em" }}>★</span>
          {title}
          {cardLabel && (
            <span style={{
              marginLeft: "0.5rem",
              padding: "0.15rem 0.5rem",
              background: "rgba(212,160,48,0.2)",
              border: `1px solid rgba(212,160,48,0.4)`,
              color: C.goldBright,
              borderRadius: 2,
              fontSize: "0.82em",
              letterSpacing: "0.1em",
            }}>{cardLabel}</span>
          )}
        </div>
        {refText && (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: TYPE.mono,
            color: C.pageMuted,
            letterSpacing: "0.05em",
          }}>{refText}</div>
        )}
      </div>

      {children}

      {stamp && (
        <div style={{
          position: "absolute",
          bottom: 16,
          right: 20,
          fontFamily: "'Josefin Sans', sans-serif",
          fontWeight: 600,
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: C.orangeBright,
          background: "rgba(240,152,96,0.08)",
          border: `1.5px solid ${C.orangeBright}`,
          padding: "0.3rem 0.85rem",
          opacity: 0.85,
          borderRadius: 100,
          zIndex: 2,
        }}>{stamp}</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// THE CINEMATIC HERO — full-viewport data-driven entry
// ═══════════════════════════════════════════════════════════════

// Data poetry — devastating numbers that cycle
const HERO_FACTS = [
  {
    big:   "96%",
    line1: "prioritize the child's right",
    line2: "to bodily autonomy.",
    context: "Across every pathway — intact, circumcised, restoring, observer.",
    color: C.blue,
  },
  {
    big:   "80%",
    line1: "of restoring respondents",
    line2: "report strong, frequent resentment.",
    context: "0% said they have never felt negative about their circumcision.",
    color: C.red,
  },
  {
    big:   "47.6%",
    line1: "describe the decision as",
    line2: "\"routine / automatic.\"",
    context: "Only 2.7% were offered it as a neutral choice with pros and cons.",
    color: C.orange,
  },
  {
    big:   "52%",
    line1: "of circumcised respondents",
    line2: "prefer the intact appearance.",
    context: "A quiet majority, in their own words.",
    color: C.yellow,
  },
  {
    big:   "88%",
    line1: "of intact respondents would",
    line2: "keep their son intact.",
    context: "78% of circumcised respondents would make the same choice for their son.",
    color: C.green,
  },
];

function RotatingFact() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("in"); // in | holding | out
  useEffect(() => {
    let t;
    if (phase === "in")      t = setTimeout(() => setPhase("holding"), 1200);
    else if (phase === "holding") t = setTimeout(() => setPhase("out"), 4500);
    else if (phase === "out")     t = setTimeout(() => {
      setIdx(i => (i + 1) % HERO_FACTS.length);
      setPhase("in");
    }, 700);
    return () => clearTimeout(t);
  }, [phase]);

  const fact = HERO_FACTS[idx];
  const visible = phase !== "out";
  const opacity = phase === "holding" ? 1 : phase === "in" ? 1 : 0;
  const y = phase === "in" ? 0 : phase === "holding" ? 0 : -16;

  return (
    <div style={{
      textAlign: "center",
      maxWidth: 820,
      margin: "0 auto",
      opacity,
      transform: `translateY(${y}px)`,
      transition: "opacity 0.6s ease-out, transform 0.7s ease-out",
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 800,
        fontSize: TYPE.mastheadHero,
        color: fact.color,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        marginBottom: "1.25rem",
        textShadow: `0 0 48px ${fact.color}22`,
        transition: "color 0.7s ease-out, text-shadow 0.7s ease-out",
      }}>
        <CountUp to={parseFloat(fact.big)} suffix={fact.big.replace(/[\d.]+/g, "")}
          duration={1400} decimals={fact.big.includes(".") ? 1 : 0}
          visible={phase === "in" || phase === "holding"} />
      </div>

      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 600,
        fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)",
        color: C.pageText,
        lineHeight: 1.3,
        marginBottom: "0.3rem",
      }}>
        {fact.line1}
      </div>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 600,
        fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)",
        color: C.pageText,
        lineHeight: 1.3,
        marginBottom: "1.25rem",
      }}>
        {fact.line2}
      </div>
      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 400,
        fontStyle: "italic",
        fontSize: TYPE.body,
        color: C.pageMuted,
        lineHeight: 1.55,
        maxWidth: 540,
        margin: "0 auto",
      }}>
        {fact.context}
      </div>
    </div>
  );
}

// Ambient respondent-dot artwork in background — "portrait of every respondent"
// Dot counts come from META.pathwayCounts (live-updated by useLiveMeta hook).
function RespondentArtwork({ opacity = 0.25 }) {
  const dots = useMemo(() => {
    const pc = META.pathwayCounts || {};
    const arr = [];
    const groups = [
      { count: pc.intact      ?? 142, color: PATH_COLORS.intact },
      { count: pc.circumcised ?? 213, color: PATH_COLORS.circumcised },
      { count: pc.restoring   ?? 109, color: PATH_COLORS.restoring },
      { count: pc.observer    ?? 37,  color: PATH_COLORS.observer },
    ];
    let i = 0;
    groups.forEach(g => {
      for (let k = 0; k < g.count; k++) {
        // Sunflower spiral (Vogel's model)
        const idx = i++;
        const a = idx * 2.39996323; // golden angle
        const r = Math.sqrt(idx) * 18;
        arr.push({ idx, a, r, color: g.color });
      }
    });
    return arr;
  }, []);

  return (
    <svg width="100%" height="100%" viewBox="-400 -400 800 800"
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
      preserveAspectRatio="xMidYMid slice"
    >
      <g style={{ animation: "bureauRotate 120s linear infinite", transformOrigin: "center" }}>
        {dots.map(d => (
          <circle key={d.idx}
            cx={d.r * Math.cos(d.a)}
            cy={d.r * Math.sin(d.a)}
            r={2.2}
            fill={d.color}
          />
        ))}
      </g>
    </svg>
  );
}

function CinematicHero() {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { setTimeout(() => setRevealed(true), 80); }, []);
  return (
    <div style={{
      position: "relative",
      minHeight: "82vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "3rem 1.5rem 4rem",
      overflow: "hidden",
      background: `radial-gradient(ellipse at center, ${C.bgSoft} 0%, ${C.bg} 50%, ${C.bgDeep} 100%)`,
      borderBottom: `1px solid ${C.pageGhost}`,
    }}>
      <RespondentArtwork opacity={0.2} />

      {/* Rainbow bar at very top */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 4,
        background: RAINBOW_GRAD,
      }} />

      {/* Top eyebrow — publication masthead */}
      <div style={{
        position: "absolute",
        top: "1.5rem",
        left: "50%",
        transform: `translateX(-50%) translateY(${revealed ? 0 : -10}px)`,
        opacity: revealed ? 1 : 0,
        transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        zIndex: 5,
      }}>
        <span style={{ color: C.red, fontSize: "1rem" }}>★</span>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: TYPE.cardLabel,
          color: C.gold,
          textTransform: "uppercase",
          letterSpacing: "0.22em",
        }}>Special Report</span>
        <span style={{ color: C.red, fontSize: "1rem" }}>★</span>
      </div>

      {/* Publication title — "The Accidental Intactivist's Inquiry" in big */}
      <Reveal delay={150}>
        <div style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          position: "relative",
          zIndex: 2,
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(0.75rem, 1.2vw, 0.88rem)",
            color: C.gold,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            marginBottom: "0.5rem",
          }}>An Anonymous Survey · Findings Updated Live</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 800,
            fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
            color: C.pageTextBright,
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
            margin: 0,
          }}>The Accidental Intactivist's Inquiry</h1>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: "clamp(1.05rem, 1.6vw, 1.3rem)",
            color: C.pageMuted,
            marginTop: "0.4rem",
          }}>{META.totalRespondents} Voices · Six Pathways · One Question, Asked Honestly</div>
        </div>
      </Reveal>

      {/* Rotating facts */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", minHeight: "22rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <RotatingFact />
      </div>

      {/* Scroll cue */}
      <Reveal delay={1200}>
        <div style={{
          position: "relative",
          marginTop: "3rem",
          textAlign: "center",
          zIndex: 2,
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "0.7rem",
            color: C.gold,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            marginBottom: "0.8rem",
          }}>Scroll to Begin</div>
          <div style={{
            width: 1, height: 48,
            margin: "0 auto",
            background: `linear-gradient(180deg, ${C.gold}, transparent)`,
          }} />
        </div>
      </Reveal>

      {/* Rainbow gradient accent at bottom edge of hero */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: 3,
        background: RAINBOW_GRAD,
        opacity: 0.5,
      }} />
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// EDITOR'S LETTER — Tone's first-person introduction as card #1
// ═══════════════════════════════════════════════════════════════

function EditorsLetter() {
  return (
    <BureauCard
      title="A Note from the Lead Researcher"
      refText="FROM THE DESK OF TONE PETTIT · LEAD RESEARCHER"
      stamp="Letter"
      stampColor={C.gold}
      gradient={PATH_GRADIENTS.intact}
      cardLabel="INTRODUCTION"
    >
      <div style={{ padding: "2.5rem 2.5rem 2rem", position: "relative" }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: TYPE.cardLabel,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: C.gold,
          marginBottom: "0.5rem",
        }}>From the Lead Researcher</div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 800,
          fontSize: TYPE.sectionTitle,
          color: C.paperInk,
          lineHeight: 1.15,
          letterSpacing: "-0.015em",
          marginBottom: "1.5rem",
        }}>The 'Why' Behind This Inquiry</h2>

        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 400,
          fontSize: TYPE.body,
          color: C.paperSubtle,
          lineHeight: 1.75,
        }}>
          <p style={{ marginBottom: "1rem" }}>
            My name is Tone Pettit, and I am the "Accidental Intactivist." This project was
            born from a lifetime of observation and a single, persistent question.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            By a conscious choice of my parents in the 1970s, I grew up intact — an outlier
            in a US culture where routine infant circumcision was the unquestioned norm. I
            became an <em>accidental witness</em> to a profound alteration that nearly all
            my friends, my partners, and men in the media had undergone — something my
            parents had simply dismissed as unnecessary.
          </p>

          <p style={{
            marginBottom: "1.5rem",
            padding: "1.1rem 1.35rem",
            background: "rgba(217,79,79,0.06)",
            borderLeft: `3px solid ${C.red}`,
            borderRadius: "0 4px 4px 0",
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: "clamp(1.1rem, 1.5vw, 1.3rem)",
            color: C.paperInk,
            lineHeight: 1.5,
          }}>
            In a culture so obsessed with sex, where we seemingly want every experience to
            be as good as possible, how did this one topic become so taboo?
          </p>

          <p style={{ marginBottom: "1rem" }}>
            Everyone seems to have an opinion about whether infant circumcision should or
            shouldn't be done — but I almost never hear adults talking honestly about their
            own lived experience with their own anatomy.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            I had so many questions. How did men actually <em>feel</em> about being cut?
            Was it something they ever thought about? What was their sexual experience
            truly like? This survey is my way of finally asking those questions.
          </p>

          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 800,
            fontSize: "clamp(1.2rem, 1.6vw, 1.4rem)",
            color: C.paperInk,
            letterSpacing: "-0.01em",
            marginTop: "2rem",
            marginBottom: "0.75rem",
          }}>So — what did we find?</h3>

          <p style={{ marginBottom: "1rem" }}>
            It turns out this is a conversation a lot of people have been waiting to have.
            We are now the custodians of <strong style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, color: C.paperInk }}>hundreds of
            vivid, often heartbreaking accounts</strong> of a procedure performed on millions,
            usually without their consent.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            <strong style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, color: C.paperInk }}>96% of every pathway agrees</strong> the
            child should have the right to decide. Intact, circumcised, restoring, observer
            — no other question in this survey produces a consensus that strong. It is the
            rare finding where everyone quietly agrees on the ethics, and yet the default
            practice continues anyway.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            <strong style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, color: C.paperInk }}>86% of circumcised respondents</strong> report
            some level of resentment, loss, anger, or grief. Only 14% say "no, never." The
            cultural shorthand that "they don't remember, they don't care" collapses on
            contact with the data.
          </p>
          <p style={{ marginBottom: "1.5rem" }}>
            <strong style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, color: C.paperInk }}>Only 2.7% of circumcised respondents</strong>{" "}
            say the decision was presented to their parents as a neutral choice with pros
            and cons. Nearly half — 47.6% — describe it as "routine or automatic." That is
            not informed consent. That is cultural autopilot.
          </p>

          <p style={{ marginBottom: "1rem" }}>
            What follows is a data instrument, not an advocacy document. I am not here to
            tell you how to feel. I am here to share what <em>{respondentsAsProse(META.totalRespondents)} people
            said when finally asked</em> — and to bring these essential stories into
            the light.
          </p>
        </div>

        {/* Signature block — Tone's real contact info */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "1.1rem",
          marginTop: "2rem",
          paddingTop: "1.5rem",
          borderTop: `1px dashed ${C.paperRuleDash}`,
        }}>
          <img
            src="/tone-headshot.jpg"
            alt="Tone Pettit"
            width="76"
            height="76"
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${C.paperInk}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 700,
              fontSize: TYPE.bodySmall,
              color: C.paperInk,
            }}>Tone Pettit</div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: "0.72rem",
              color: C.paperDim,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "0.25rem",
            }}>The Accidental Intactivist · Lead Researcher</div>
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontStyle: "italic",
              fontSize: "0.74rem",
              color: C.paperGhost,
              marginBottom: "0.4rem",
            }}>Born Washington State, 1977 · Based in Seattle</div>
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.78rem",
              color: C.paperDim,
              lineHeight: 1.5,
            }}>
              <a href="mailto:tone@circumsurvey.online" style={{ color: C.paperSubtle, textDecoration: "none" }}>tone@circumsurvey.online</a>
              {" · "}
              <a href="https://reddit.com/u/c4charkey" target="_blank" rel="noreferrer" style={{ color: C.paperSubtle, textDecoration: "none" }}>reddit.com/u/c4charkey</a>
            </div>
          </div>
          <svg width="120" height="42" viewBox="0 0 150 48" style={{ flexShrink: 0, marginTop: "0.4rem" }}>
            <path
              d="M 8,32 Q 14,18 22,26 T 35,28 M 30,24 Q 38,14 44,24 T 52,32 M 50,22 L 56,32 M 56,22 L 62,32 M 62,30 Q 68,22 74,28 T 82,30 M 82,22 Q 88,18 92,28 L 98,22 M 98,22 Q 104,32 110,24 T 120,28 M 118,26 Q 126,20 132,28 T 142,30"
              stroke={C.paperInk}
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
          </svg>
        </div>
      </div>
    </BureauCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION TITLE CARD — magazine-chapter divider
// ═══════════════════════════════════════════════════════════════

function SectionTitleCard({ chapter, totalChapters, title, subtitle, quote, id }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      id={id}
      style={{
        margin: "4rem -1.5rem 3rem",  // negative margin breaks out of container slightly
        padding: "4rem 2rem 4.5rem",
        position: "relative",
        textAlign: "center",
        scrollMarginTop: "4rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.9s ease-out, transform 0.9s ease-out",
        borderTop: `1px solid ${C.pageGhost}`,
        borderBottom: `1px solid ${C.pageGhost}`,
        background: `linear-gradient(180deg, transparent 0%, ${C.bgSoft} 50%, transparent 100%)`,
      }}
    >
      {/* Rainbow mini-bar at top */}
      <div style={{
        position: "absolute",
        top: -1,
        left: "50%",
        transform: "translateX(-50%)",
        width: 140,
        height: 3,
        background: RAINBOW_GRAD,
        borderRadius: 2,
      }} />

      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700,
        fontSize: TYPE.cardLabel,
        textTransform: "uppercase",
        letterSpacing: "0.3em",
        color: C.gold,
        marginBottom: "1rem",
      }}>
        <span style={{ color: C.red, marginRight: "0.5rem" }}>★</span>
        Chapter {chapter} of {totalChapters}
        <span style={{ color: C.red, marginLeft: "0.5rem" }}>★</span>
      </div>

      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 800,
        fontSize: "clamp(2.2rem, 5.5vw, 4rem)",
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        color: C.pageTextBright,
        marginBottom: subtitle ? "0.75rem" : quote ? "2rem" : 0,
      }}>{title}</h2>

      {subtitle && (
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(1.1rem, 2vw, 1.45rem)",
          color: C.pageMuted,
          maxWidth: 620,
          margin: "0 auto 2rem",
          lineHeight: 1.4,
        }}>{subtitle}</div>
      )}

      {quote && (
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(1rem, 1.4vw, 1.2rem)",
          color: C.gold,
          maxWidth: 520,
          margin: "0 auto",
          lineHeight: 1.5,
        }}>"{quote}"</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DEVASTATING NUMBER — full-bleed interstitial between sections
// ═══════════════════════════════════════════════════════════════

function DevastatingNumber({ big, line1, line2, context, color = C.red, decimals = 0 }) {
  const [ref, visible] = useReveal();
  const tween = useTween(visible, 1400);
  // Parse the number part (could be "96", "52%", "88.8", "0")
  const numStr = String(big);
  const numMatch = numStr.match(/^([\d.]+)(.*)$/);
  const numVal = numMatch ? parseFloat(numMatch[1]) : 0;
  const suffix = numMatch ? numMatch[2] : "";

  return (
    <div
      ref={ref}
      style={{
        margin: "3rem -1.5rem",
        padding: "6rem 2rem",
        background: C.bgDeep,
        borderTop: `1px solid ${C.pageGhost}`,
        borderBottom: `1px solid ${C.pageGhost}`,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Radial color wash */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at center, ${color}15 0%, transparent 60%)`,
        pointerEvents: "none",
      }} />

      {/* Subtle dot artwork */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: 0.15,
        background: `radial-gradient(circle, ${color} 1px, transparent 1.5px)`,
        backgroundSize: "32px 32px",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 800,
          fontSize: "clamp(4rem, 12vw, 9rem)",
          color,
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          marginBottom: "1.5rem",
          textShadow: `0 0 80px ${color}33`,
        }}>
          {(numVal * tween).toFixed(decimals)}{suffix}
        </div>

        {line1 && (
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 500,
            fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
            color: C.pageTextBright,
            lineHeight: 1.25,
            maxWidth: 800,
            margin: "0 auto 0.3rem",
          }}>{line1}</div>
        )}
        {line2 && (
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 500,
            fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
            color: C.pageTextBright,
            lineHeight: 1.25,
            maxWidth: 800,
            margin: "0 auto 1.5rem",
          }}>{line2}</div>
        )}

        {context && (
          <div style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: TYPE.body,
            color: C.pageMuted,
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.55,
          }}>{context}</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PULL QUOTE SEPARATOR — respondent voice between sections
// ═══════════════════════════════════════════════════════════════

function PullQuoteSeparator({ quote, attribution, pathway }) {
  const [ref, visible] = useReveal();
  const color = pathColor(pathway);
  return (
    <div
      ref={ref}
      style={{
        margin: "3rem -1rem",
        padding: "3rem 2rem",
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 1s ease-out, transform 1s ease-out",
      }}
    >
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 400,
        fontStyle: "italic",
        fontSize: TYPE.pullQuote,
        color: C.pageTextBright,
        maxWidth: 720,
        margin: "0 auto 1rem",
        lineHeight: 1.4,
        letterSpacing: "-0.005em",
      }}>
        <span style={{ color: C.red, fontSize: "0.7em", marginRight: "0.4rem", verticalAlign: "top" }}>★</span>
        {quote}
        <span style={{ color: C.red, fontSize: "0.7em", marginLeft: "0.4rem", verticalAlign: "top" }}>★</span>
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700,
        fontSize: TYPE.cardLabel,
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        color,
      }}>— {attribution}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NARRATIVE PROGRESS RAIL — sticky right-side chapter indicator
// ═══════════════════════════════════════════════════════════════

function NarrativeRail({ sections, activeId }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  return (
    <div style={{
      position: "fixed",
      right: "1.25rem",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 90,
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      alignItems: "flex-end",
    }}>
      {sections.map((sec, i) => {
        const isActive = activeId === sec.id;
        const isHover = hoverIdx === i;
        return (
          <button
            key={sec.id}
            onClick={() => {
              const el = document.getElementById(sec.id);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem 0.35rem",
              borderRadius: 3,
            }}
          >
            {/* Label appears on hover */}
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: isActive ? C.gold : C.pageMuted,
              opacity: isHover || isActive ? 1 : 0,
              transform: isHover || isActive ? "translateX(0)" : "translateX(8px)",
              transition: "opacity 0.2s, transform 0.2s",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}>{sec.title}</span>

            {/* Dot / star indicator */}
            <span style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: isActive ? C.gold : "transparent",
              border: `1.5px solid ${isActive ? C.gold : isHover ? C.pageText : C.pageDim}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.5rem",
              color: C.bg,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              transition: "all 0.2s",
              transform: isActive ? "scale(1.15)" : "scale(1)",
            }}>{isActive ? "★" : ""}</span>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ACTIVE SECTION TRACKER — Intersection Observer for rail
// ═══════════════════════════════════════════════════════════════

function useActiveSection(sectionIds) {
  const [active, setActive] = useState(sectionIds[0]);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      entries => {
        // Find the entry that's most visible (highest intersection ratio)
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sectionIds]);
  return active;
}
function Pie({ data, colors, size = 150, currentPathway }) {
  const [ref, visible] = useReveal();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start;
    let raf;
    const dur = 800;
    const step = t => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [visible]);
  // Safety: if animation never fired, force render after 2.5s
  useEffect(() => {
    const t = setTimeout(() => setProgress(p => p === 0 ? 1 : p), 2500);
    return () => clearTimeout(t);
  }, []);

  const total = data.reduce((a, b) => a + b, 0);
  if (!total) return <svg ref={ref} width={size} height={size} />;
  const r = size / 2 - 3, cx = size / 2, cy = size / 2;
  const rad = d => (d - 90) * Math.PI / 180;
  const pathwayMeta = currentPathway ? PATHWAY[currentPathway] || ALL_CIRC_META : null;

  let cum = 0;
  return (
    <svg ref={ref} width={size} height={size} style={{ display: "block" }}>
      {data.map((v, i) => {
        if (v <= 0) return null;
        const s = cum / total * 360; cum += v; const e = cum / total * 360;
        const revealedEnd = s + (e - s) * progress;
        if (revealedEnd <= s) return null;
        const la = revealedEnd - s > 180 ? 1 : 0;
        const x1 = cx + r * Math.cos(rad(s)), y1 = cy + r * Math.sin(rad(s));
        const x2 = cx + r * Math.cos(rad(revealedEnd)), y2 = cy + r * Math.sin(rad(revealedEnd));
        return (
          <path key={i}
            d={`M${cx},${cy}L${x1},${y1}A${r},${r} 0 ${la},1 ${x2},${y2}Z`}
            fill={colors[i % colors.length]}
            stroke={C.paper}
            strokeWidth="2"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.38} fill={C.paper} />
      {pathwayMeta && progress > 0.7 && (
        <>
          <text x={cx} y={cy - 2} textAnchor="middle"
            fontFamily="'Barlow Condensed', sans-serif" fontSize="9" fontWeight="700"
            fill={C.paperInk} letterSpacing="0.1em" opacity={(progress - 0.7) / 0.3}>
            SHOWING
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle"
            fontFamily="'Barlow Condensed', sans-serif" fontSize="7.5" fontWeight="600"
            fill={C.paperDim} opacity={(progress - 0.7) / 0.3}>
            {pathwayMeta.emoji} {pathwayMeta.short}
          </text>
        </>
      )}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// ANIMATED STACKED BAR — 100% stacks per pathway, grows from baseline
// ═══════════════════════════════════════════════════════════════

function StackedBar({ q, width = 400, height = 280 }) {
  const [ref, visible] = useReveal();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start;
    let raf;
    const dur = 900;
    const step = t => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [visible]);
  // Safety: if after 2.5s nothing happened, force render
  useEffect(() => {
    const t = setTimeout(() => setProgress(p => p === 0 ? 1 : p), 2500);
    return () => clearTimeout(t);
  }, []);

  const pathways = (q.pathways || Object.keys(q.data)).filter(
    p => p !== "all_circ" && Array.isArray(q.data[p])
  );
  if (pathways.length === 0) return <svg ref={ref} width={width} height={height} />;

  // Bumped padTop to fit axis-title row; bumped padBottom so pathway labels don't clip
  const padLeft = 36, padRight = 8, padTop = 34, padBottom = 62;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const barW = Math.min(70, plotW / pathways.length * 0.72);
  const gapW = (plotW - barW * pathways.length) / (pathways.length + 1);

  const stacks = pathways.map(p => {
    const vals = q.data[p] || [];
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    let cum = 0;
    return {
      pathway: p,
      segments: vals.map((v, i) => {
        const pct = (v / total) * 100;
        const seg = { i, pct, y0: cum, y1: cum + pct };
        cum += pct;
        return seg;
      }),
    };
  });

  return (
    <svg ref={ref} width={width} height={height} style={{ display: "block", maxWidth: "100%", height: "auto" }}>
      {/* Axis title — makes clear these stacks are BELIEFS BY pathway */}
      <text x={padLeft + plotW / 2} y={14} textAnchor="middle"
        fontFamily="'Barlow Condensed', sans-serif"
        fontSize="9.5" fontWeight="800" fill={C.gold}
        letterSpacing="0.18em">
        RESPONSES BY PATHWAY
      </text>
      <line x1={padLeft} x2={width - padRight} y1={22} y2={22}
        stroke={C.gold} strokeWidth="0.5" opacity="0.35" />

      {/* Gridlines */}
      {[0, 25, 50, 75, 100].map(tick => {
        const y = padTop + plotH - (tick / 100) * plotH;
        return (
          <g key={tick}>
            <line x1={padLeft} x2={width - padRight} y1={y} y2={y}
              stroke={C.paperRule}
              strokeWidth={tick === 0 ? 1.5 : 0.7}
              strokeDasharray={tick === 0 ? "" : "2,3"}
              opacity={tick === 0 || tick === 100 ? 1 : 0.6} />
            <text x={padLeft - 6} y={y + 3} textAnchor="end"
              fontFamily="'JetBrains Mono', monospace" fontSize="8" fontWeight="600" fill={C.paperDim}>
              {tick}%
            </text>
          </g>
        );
      })}

      {stacks.map((stack, si) => {
        const x = padLeft + gapW + si * (barW + gapW);
        const pathwayMeta = PATHWAY[stack.pathway];
        const pathwayC = pathColor(stack.pathway);
        const labelX = x + barW / 2;
        return (
          <g key={stack.pathway}>
            {stack.segments.map(seg => {
              if (seg.pct < 0.5) return null;
              // Animate: each bar fills up from the baseline
              const revealedPct = Math.max(0, Math.min(seg.pct, seg.y1 * progress - seg.y0 * progress));
              const visibleY1 = seg.y0 + revealedPct;
              if (visibleY1 <= seg.y0) return null;
              const y = padTop + plotH - (visibleY1 / 100) * plotH;
              const h = ((visibleY1 - seg.y0) / 100) * plotH;
              const segColor = q.colors[seg.i % q.colors.length];
              const showLabel = seg.pct >= 6 && progress > 0.85;
              const isYellow = segColor === C.yellow || segColor === C.yellowBright || segColor === "#e8c868";
              return (
                <g key={seg.i}>
                  <rect x={x} y={y} width={barW} height={h}
                    fill={segColor} stroke={C.paper} strokeWidth="1" />
                  {showLabel && (
                    <text x={x + barW / 2} y={y + h / 2 + 3} textAnchor="middle"
                      fontFamily="'JetBrains Mono', monospace"
                      fontSize={seg.pct >= 16 ? "9.5" : "8"}
                      fontWeight="700"
                      fill={isYellow ? C.paperInk : "#fff"}
                      opacity={(progress - 0.85) / 0.15}>
                      {seg.pct.toFixed(1)}%
                    </text>
                  )}
                </g>
              );
            })}

            {/* Pathway label group — emoji + name + n, more visually grounded */}
            {/* Subtle connector line from bar base to label */}
            <line x1={labelX} x2={labelX}
              y1={padTop + plotH + 2} y2={padTop + plotH + 8}
              stroke={pathwayC} strokeWidth="1.5" opacity="0.6" />
            <text x={labelX} y={padTop + plotH + 22} textAnchor="middle"
              fontFamily="'Playfair Display', serif" fontSize="13" fontWeight="700" fill={pathwayC}>
              {pathwayMeta.emoji}
            </text>
            <text x={labelX} y={padTop + plotH + 38} textAnchor="middle"
              fontFamily="'Barlow Condensed', sans-serif" fontSize="11" fontWeight="800"
              fill={C.paperInk} letterSpacing="0.05em">
              {pathwayMeta.short.toUpperCase()}
            </text>
            <text x={labelX} y={padTop + plotH + 51} textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace" fontSize="8" fontWeight="600" fill={C.paperDim}>
              n={pathwayMeta.n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StackedBarLegend({ opts, colors }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", paddingTop: "0.5rem" }}>
      {opts.map((opt, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <div style={{
            width: 14, height: 14,
            background: colors[i % colors.length],
            borderRadius: 2,
            border: `1px solid ${C.paperRule}`,
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.72rem",
            color: C.paperInk,
            lineHeight: 1.3,
          }}>{opt}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ANIMATED GROUPED BAR — clusters of pathway bars per metric
// ═══════════════════════════════════════════════════════════════

function GroupedBar({ questions, pathways = ["circumcised","restoring","intact"], width = 640, height = 340, yMax = 5 }) {
  const [ref, visible] = useReveal();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start;
    let raf;
    const dur = 1100;
    const step = t => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [visible]);
  // Safety: if animation never fired, force render after 2.5s
  useEffect(() => {
    const t = setTimeout(() => setProgress(p => p === 0 ? 1 : p), 2500);
    return () => clearTimeout(t);
  }, []);

  const padLeft = 36, padRight = 8, padTop = 24, padBottom = 72;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const n = questions.length;
  const groupW = plotW / n;
  const barW = Math.min(26, (groupW * 0.72) / pathways.length);
  const barGap = 2;
  const groupInnerW = barW * pathways.length + barGap * (pathways.length - 1);
  const groupPad = (groupW - groupInnerW) / 2;

  const yTicks = [];
  for (let i = 0; i <= yMax * 2; i++) yTicks.push(i / 2);

  return (
    <svg ref={ref} width={width} height={height} style={{ display: "block", maxWidth: "100%", height: "auto" }} viewBox={`0 0 ${width} ${height}`}>
      {yTicks.map(tick => {
        const y = padTop + plotH - (tick / yMax) * plotH;
        return (
          <g key={tick}>
            <line x1={padLeft} x2={width - padRight} y1={y} y2={y}
              stroke={C.paperRule}
              strokeWidth={tick === 0 ? 1.5 : 0.7}
              strokeDasharray={tick === 0 || tick === yMax ? "" : "2,3"}
              opacity={Number.isInteger(tick) ? 1 : 0.5} />
            {Number.isInteger(tick) && (
              <text x={padLeft - 6} y={y + 3} textAnchor="end"
                fontFamily="'JetBrains Mono', monospace" fontSize="8" fontWeight="600" fill={C.paperDim}>
                {tick}
              </text>
            )}
          </g>
        );
      })}

      {questions.map((metric, mi) => {
        const gx = padLeft + mi * groupW + groupPad;
        return (
          <g key={metric.id}>
            {pathways.map((p, pi) => {
              const v = metric.data[p];
              if (v == null) return null;
              const color = pathColor(p);
              const barX = gx + pi * (barW + barGap);
              // Staggered reveal — each bar delays by group index + bar index
              const startAt = (mi * 0.08 + pi * 0.03);
              const localP = Math.max(0, Math.min(1, (progress - startAt) / (1 - startAt)));
              const fullH = (v / yMax) * plotH;
              const barH = fullH * localP;
              const barY = padTop + plotH - barH;
              return (
                <g key={p}>
                  <rect x={barX} y={barY} width={barW} height={barH}
                    fill={color} stroke={C.paperInk} strokeWidth="0.5" />
                  {localP > 0.9 && (
                    <text x={barX + barW / 2} y={barY - 4} textAnchor="middle"
                      fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fontWeight="700"
                      fill={color}
                      opacity={(localP - 0.9) / 0.1}>
                      {v.toFixed(1)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Metric label — two lines */}
            <text x={gx + groupInnerW / 2} y={height - padBottom + 16} textAnchor="middle"
              fontFamily="'Playfair Display', serif" fontSize="10" fontWeight="700" fill={C.paperInk}>
              {(metric.label.split(" ").slice(0, Math.ceil(metric.label.split(" ").length / 2))).join(" ")}
            </text>
            <text x={gx + groupInnerW / 2} y={height - padBottom + 30} textAnchor="middle"
              fontFamily="'Playfair Display', serif" fontSize="10" fontWeight="700" fill={C.paperInk}>
              {(metric.label.split(" ").slice(Math.ceil(metric.label.split(" ").length / 2))).join(" ")}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      {pathways.map((p, pi) => {
        const meta = PATHWAY[p];
        if (!meta) return null;
        const color = pathColor(p);
        const totalLegendW = pathways.length * 110;
        const startX = (width - totalLegendW) / 2;
        const lx = startX + pi * 110;
        const ly = height - 10;
        return (
          <g key={p}>
            <rect x={lx} y={ly - 9} width={12} height={10} fill={color} stroke={C.paperInk} strokeWidth="0.5" />
            <text x={lx + 16} y={ly} fontFamily="'Barlow Condensed', sans-serif"
              fontSize="10" fontWeight="700" fill={C.paperInk} letterSpacing="0.05em">
              {meta.short.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// PLEASURE GAP HERO — featured grouped bar at top of that section
// ═══════════════════════════════════════════════════════════════

function PleasureGapHero() {
  const sexQs = ALL_QUESTIONS.filter(q => q.cat === "Sexual Experience" && q.type === "avg");
  if (sexQs.length === 0) return null;

  const questions = sexQs.map(q => ({
    id: q.id,
    label: q.q.replace(/\s*\(1–5 scale\)\s*$/, ""),
    data: q.data,
  }));

  let biggestGap = null;
  sexQs.forEach(q => {
    if (q.data.intact && q.data.circumcised) {
      const delta = q.data.intact - q.data.circumcised;
      if (!biggestGap || Math.abs(delta) > Math.abs(biggestGap.delta)) {
        biggestGap = {
          delta,
          label: q.q.replace(/\s*\(1–5 scale\)\s*$/, ""),
          intact: q.data.intact,
          circumcised: q.data.circumcised,
        };
      }
    }
  });

  return (
    <BureauCard
      title="The Pleasure Gap — Direct Comparison"
      refText={`FORM CS-PLEASURE · SEXUAL EXPERIENCE · N = ${META.totalRespondents}`}
      stamp="Featured"
      stampColor={C.gold}
      gradient={RAINBOW_GRAD}
      cardLabel="ALL PATHWAYS"
    >
      <div style={{ padding: "1.75rem 1.75rem 1rem" }}>
        <FormField
          label="Grouped Comparison"
          question="How do the three pathways compare on self-reported sexual experience?"
          body="Each cluster shows the mean rating (1–5 scale) for one dimension. Bars for Circumcised, Restoring, and Intact respondents sit side-by-side so the Pleasure Gap is visible at a glance: the blue Intact bar consistently sits above the other two across every dimension."
        />

        <div style={{ display: "flex", justifyContent: "center", margin: "1rem 0" }}>
          <GroupedBar
            questions={questions}
            pathways={["circumcised", "restoring", "intact"]}
            width={640} height={340} yMax={5}
          />
        </div>

        {biggestGap && (
          <StatCallout
            number={`${biggestGap.delta > 0 ? "+" : ""}${biggestGap.delta.toFixed(1)}`}
            text={<>The largest gap is <strong>{biggestGap.label}</strong>: Intact respondents rate it <strong>{biggestGap.intact.toFixed(2)}</strong>, Circumcised respondents <strong>{biggestGap.circumcised.toFixed(2)}</strong> — a {Math.abs(biggestGap.delta / biggestGap.intact * 100).toFixed(0)}% gap on a 5-point scale.</>}
            color={C.red}
          />
        )}

        <ArrowNotes notes={[
          "Intact Pathway leads on every single dimension",
          "Circumcised and Restoring Pathways track closely — restoration recovers partial function",
          "Detail cards below break down each dimension individually",
        ]} />
      </div>
    </BureauCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// PATHWAY CHIPS
// ═══════════════════════════════════════════════════════════════

function PathwayChips({ pathways, active, onChange, showCombined }) {
  const options = showCombined && pathways.includes("circumcised") && pathways.includes("restoring")
    ? ["all_circ", ...pathways]
    : pathways;
  return (
    <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", justifyContent: "center" }}>
      {options.map(p => {
        const meta = p === "all_circ" ? ALL_CIRC_META : PATHWAY[p];
        if (!meta) return null;
        const on = active === p;
        const color = pathColor(p);
        return (
          <button key={p} onClick={() => onChange(p)} style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.62rem",
            fontWeight: 700,
            padding: "0.2rem 0.55rem",
            borderRadius: 100,
            cursor: "pointer",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            background: on ? pathBg(p) : "transparent",
            color: on ? color : C.paperGhost,
            border: on ? `1.5px solid ${color}` : `1px solid ${C.paperRuleDash}`,
            transform: on ? "scale(1.05)" : "",
            transition: "all 0.15s",
          }}>{meta.emoji} {meta.short}</button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FORM FIELD
// ═══════════════════════════════════════════════════════════════

function FormField({ label, question, body, last, children }) {
  return (
    <div style={{
      marginBottom: last ? 0 : "1.25rem",
      paddingBottom: last ? 0 : "1rem",
      borderBottom: last ? "none" : `1px dashed ${C.paperRuleDash}`,
    }}>
      {label && (
        <div style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontWeight: 600,
          fontSize: "0.66rem",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: C.orangeBright,
          marginBottom: "0.5rem",
        }}>{label}</div>
      )}
      {question && (
        <div style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontWeight: 600,
          fontSize: "1.18rem",
          color: C.paperInk,
          lineHeight: 1.32,
          marginBottom: body ? "0.55rem" : 0,
          letterSpacing: "-0.005em",
        }}>{question}</div>
      )}
      {body && (
        <div style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 400,
          fontSize: "0.9rem",
          color: C.paperSubtle,
          lineHeight: 1.65,
        }}>{body}</div>
      )}
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DATA ROW
// ═══════════════════════════════════════════════════════════════

function DataRow({ label, value, color, last }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "baseline",
      gap: "0.5rem",
      padding: "0.45rem 0",
      borderBottom: last ? "none" : `1px solid ${C.paperRule}`,
    }}>
      <span style={{
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 500,
        fontSize: "0.8rem",
        color: C.paperInk,
        minWidth: 140,
        maxWidth: 200,
        flexShrink: 0,
      }}>{label}</span>
      <span style={{
        flex: 1,
        borderBottom: `2px dotted ${C.dotLeader}`,
        marginBottom: 3,
        minWidth: 20,
      }} />
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 800,
        fontSize: "0.92rem",
        color: color || C.paperInk,
        flexShrink: 0,
      }}>{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ARROW NOTES
// ═══════════════════════════════════════════════════════════════

function ArrowNotes({ notes }) {
  if (!notes || notes.length === 0) return null;
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "0.62rem",
      color: C.paperDim,
      marginTop: "0.9rem",
      lineHeight: 1.8,
    }}>
      {notes.map((note, i) => (
        <div key={i}>
          <span style={{ color: C.gold, fontWeight: 700 }}>→</span> {note}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAT CALLOUT
// ═══════════════════════════════════════════════════════════════

function StatCallout({ number, text, color }) {
  const c = color || C.red;
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.85rem",
      marginTop: "1.1rem",
      padding: "0.85rem 1rem",
      background: C.paperFill,
      borderRadius: 2,
      borderLeft: `4px solid ${c}`,
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 800,
        fontSize: "2.2rem",
        lineHeight: 1,
        color: c,
        flexShrink: 0,
      }}>{number}</div>
      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 400,
        fontSize: "0.78rem",
        color: C.paperSubtle,
        lineHeight: 1.5,
      }}>{text}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LANGUAGE NOTE
// ═══════════════════════════════════════════════════════════════

function LanguageNote({ children }) {
  return (
    <div style={{
      margin: "0 1.5rem 1rem",
      padding: "0.55rem 0.85rem",
      background: "rgba(212,160,48,0.09)",
      borderLeft: `3px solid ${C.gold}`,
      borderRadius: "0 3px 3px 0",
      fontFamily: "'Barlow', sans-serif",
      fontSize: "0.75rem",
      fontStyle: "italic",
      color: "#7a6a42",
      lineHeight: 1.55,
    }}>
      <strong style={{ color: C.gold, fontWeight: 700, fontStyle: "normal", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.1em" }}>★ Language Note · </strong>{" "}
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QUOTE GALLERY — voices from the survey
// ═══════════════════════════════════════════════════════════════

function QuoteGallery({ gallery }) {
  if (!gallery) return null;
  return (
    <div style={{
      marginTop: "1.25rem",
      paddingTop: "1.25rem",
      borderTop: `1px dashed ${C.paperRuleDash}`,
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700,
        fontSize: "0.6rem",
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        color: C.gold,
        marginBottom: "0.7rem",
        display: "flex",
        alignItems: "center",
        gap: "0.35rem",
      }}>
        <span style={{ color: C.red }}>★</span> Voices from the Survey
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: "0.7rem",
      }}>
        {Object.entries(gallery).map(([pathway, quotes]) => {
          const meta = PATHWAY[pathway];
          const color = pathColor(pathway);
          return quotes.map((qt, i) => (
            <Reveal key={`${pathway}-${i}`} delay={i * 80}>
              <div style={{
                padding: "0.7rem 0.9rem",
                background: pathBg(pathway),
                borderLeft: `3px solid ${color}`,
                borderRadius: "0 4px 4px 0",
              }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 400,
                  fontStyle: "italic",
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  color: "#3a3530",
                  marginBottom: "0.4rem",
                }}>"{qt.text}"</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.55rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color,
                }}>— {meta.short} Pathway · {qt.context}</div>
              </div>
            </Reveal>
          ));
        })}
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.55rem",
        color: C.paperGhost,
        marginTop: "0.6rem",
      }}>★ Anonymous quotes from open-ended responses. All identifying details removed.</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CARD SUMMARIES — editorial callouts keyed to question id
// These render in the right column of QCard as an interpretation,
// replacing the redundant "mean rating" legend. Only cards with a
// summary here get the enhanced treatment; others render minimally.
// ═══════════════════════════════════════════════════════════════

const CARD_SUMMARIES = {
  // ── Sexual Experience (six avg cards) ──────────────────────────
  "intensity": {
    headline: "Intact respondents rate orgasm intensity 25% higher.",
    body: "On a 1–5 scale, intact men average 3.73 vs 2.99 for circumcised men — a gap of three-quarters of a full point. Restoring respondents land at 2.93, close to where they started, suggesting intensity recovers more slowly than other dimensions.",
    frame: "gap",
  },
  "duration_r": {
    headline: "Orgasm duration sees the second-largest gap.",
    body: "Intact respondents average 3.80; circumcised 2.81. A full point of separation on a 5-point scale is large in survey terms — comparable to the gap between 'satisfied' and 'very dissatisfied' on an attitudinal scale. Restoring at 2.65 is actually below the circumcised average, which some restorers attribute to keratinization recovery being incomplete.",
    frame: "gap",
  },
  "ease": {
    headline: "The smallest Pleasure Gap — but still present.",
    body: "Ease of reaching orgasm shows the narrowest spread of the six dimensions (3.43 vs 2.91, a 15% gap). This matters because 'ease' is the metric most confounded by arousal, partner dynamics, and psychological factors — the fact that it still shows a measurable gap rather than none at all is notable.",
    frame: "gap",
  },
  "light": {
    headline: "Intact respondents report 41% more sensitivity to light touch.",
    body: "3.67 vs 2.60 — the third-largest Pleasure Gap and the one most directly tied to the anatomy. Light-touch receptors concentrated in the foreskin's ridged band are removed by circumcision. Restoring respondents report 2.67, a modest recovery that tracks with the documented de-keratinization process.",
    frame: "gap",
  },
  "mobile": {
    headline: "The largest gap in the entire Sexual Experience module.",
    body: "Pleasure from gliding / mobile skin: 3.88 intact, 2.49 circumcised — a 36% gap, the widest measured. This is the mechanical function most completely lost in circumcision: the foreskin's ability to slide over the glans creating frictionless sensation. Restorers at 3.00 are the clearest demonstration that even partial mechanical restoration moves the needle.",
    frame: "gap",
  },
  "variety": {
    headline: "Intact respondents report 46% more variety of sensation.",
    body: "3.78 vs 2.58. 'Variety' here means the range of pleasurable sensations reported — from subtle to intense, from localized to full-body. A narrower dynamic range is consistent with keratinization, nerve remodeling, and the loss of the foreskin's distinct sensation-class. Restorers sit at 2.65, suggesting variety is harder to recover than raw sensitivity.",
    frame: "gap",
  },
};

// ═══════════════════════════════════════════════════════════════
// QUESTION CARD
// ═══════════════════════════════════════════════════════════════

function QCard({ q, defaultPathway, forceCardLabel }) {
  const isAvg = q.type === "avg";
  const pathways = q.pathways || (q.data ? Object.keys(q.data) : []);
  const canCombine = pathways.includes("circumcised") && pathways.includes("restoring");
  const [active, setActive] = useState(defaultPathway || (canCombine ? "all_circ" : pathways[0]));
  const canStack = !isAvg && pathways.filter(p => Array.isArray(q.data[p])).length >= 2;
  const [chartType, setChartType] = useState(canStack ? "stacked" : "pie");

  const currentData = active === "all_circ" ? getCombinedData(q) : q.data[active];
  const currentMeta = active === "all_circ" ? ALL_CIRC_META : PATHWAY[active];
  const gallery = QUOTE_GALLERIES[q.id];

  const consensus = isConsensus(q);
  const gradient = questionGradient(q);
  const cardLabelText = forceCardLabel || (consensus ? "CONSENSUS · ALL PATHWAYS AGREE" : null);

  const notes = [];
  if (!isAvg && q.data.intact && q.data.circumcised) {
    const intactIdx = q.data.intact.indexOf(Math.max(...q.data.intact));
    const circIdx = q.data.circumcised.indexOf(Math.max(...q.data.circumcised));
    if (intactIdx !== circIdx) {
      notes.push(`Intact Pathway most frequent: ${q.opts[intactIdx]} (${q.data.intact[intactIdx]}%)`);
      notes.push(`Circumcised Pathway most frequent: ${q.opts[circIdx]} (${q.data.circumcised[circIdx]}%)`);
    }
  }
  if (isAvg && q.data.intact && q.data.circumcised) {
    const delta = q.data.intact - q.data.circumcised;
    const pct = Math.abs(delta / q.data.intact * 100).toFixed(0);
    notes.push(`Δ ${delta.toFixed(2)} (${pct}% ${delta > 0 ? "lower" : "higher"} in circumcised vs intact)`);
  }

  return (
    <BureauCard
      title={`${q.cat} Assessment`}
      refText={refCode(q, META.totalRespondents)}
      stamp={consensus ? "Consensus" : "Preliminary"}
      stampColor={consensus ? C.gold : C.red}
      gradient={gradient}
      cardLabel={cardLabelText}
    >
      <div style={{ padding: "1.75rem 1.75rem 1.5rem" }}>
        <FormField label="Question" question={q.q} body={q.sub} />

        {q.note && (
          <div style={{
            padding: "0.5rem 0.75rem",
            background: "rgba(212,160,48,0.09)",
            borderLeft: `3px solid ${C.gold}`,
            borderRadius: "0 3px 3px 0",
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.75rem",
            fontStyle: "italic",
            color: "#7a6a42",
            marginBottom: "1rem",
          }}>{q.note}</div>
        )}

        {canStack && (
          <div style={{ display: "flex", gap: "0.3rem", marginBottom: "1rem", alignItems: "center" }}>
            <span style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontWeight: 600,
              fontSize: "0.64rem",
              color: C.paperDim,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              marginRight: "0.25rem",
            }}>View</span>
            {[
              { id: "stacked", l: "Stacked" },
              { id: "pie",     l: "Pie" },
            ].map(t => (
              <button key={t.id} onClick={() => setChartType(t.id)} style={{
                padding: "0.22rem 0.6rem",
                borderRadius: 100,
                cursor: "pointer",
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.64rem",
                fontWeight: 600,
                border: chartType === t.id ? `1.5px solid ${C.orangeBright}` : `1px solid ${C.paperRuleDash}`,
                background: chartType === t.id ? "rgba(240,152,96,0.10)" : "transparent",
                color: chartType === t.id ? C.orangeBright : C.paperGhost,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>{t.l}</button>
            ))}
          </div>
        )}

        {!isAvg && canStack && chartType === "stacked" && (
          <>
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "1rem" }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <StackedBar q={q} width={400} height={280} />
              </div>
              <div style={{ minWidth: 180, flex: "0 1 230px" }}>
                <div style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.64rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: C.orangeBright,
                  marginBottom: "0.45rem",
                }}>Response Options</div>
                <StackedBarLegend opts={q.opts} colors={q.colors} />
              </div>
            </div>
            <ArrowNotes notes={notes} />
          </>
        )}

        {(isAvg || !canStack || chartType === "pie") && (
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ width: 170, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.55rem" }}>
              {isAvg ? (
                <div style={{ width: 160, height: 160, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "0.5rem", paddingBottom: "0.3rem" }}>
                  {pathways.map(p => {
                    const v = q.data[p];
                    if (v == null) return null;
                    const h = (v / 5) * 130;
                    const color = pathColor(p);
                    const meta = PATHWAY[p];
                    return (
                      <AnimatedBar key={p} color={color} targetHeight={h} label={v.toFixed(2)} emoji={meta.emoji} />
                    );
                  })}
                </div>
              ) : (
                <>
                  <Pie data={currentData || []} colors={q.colors} currentPathway={active} />
                  <PathwayChips pathways={pathways} active={active} onChange={setActive} showCombined={canCombine} />
                </>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              {isAvg ? (
                /* AVG CARDS: show editorial summary, not redundant legend */
                <>
                  {CARD_SUMMARIES[q.id] ? (
                    <div style={{
                      padding: "0 0 0.5rem 0",
                    }}>
                      <div style={{
                        fontFamily: "'Josefin Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.62rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                        color: C.orangeBright,
                        marginBottom: "0.5rem",
                      }}>The Finding</div>
                      <div style={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        color: C.paperInk,
                        lineHeight: 1.3,
                        letterSpacing: "-0.005em",
                        marginBottom: "0.65rem",
                      }}>{CARD_SUMMARIES[q.id].headline}</div>
                      <div style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontSize: "0.85rem",
                        color: C.paperSubtle,
                        lineHeight: 1.6,
                      }}>{CARD_SUMMARIES[q.id].body}</div>
                    </div>
                  ) : (
                    <div style={{ paddingTop: "1rem" }} />
                  )}
                  <ArrowNotes notes={notes} />
                </>
              ) : (
                /* NON-AVG CARDS: keep the existing Response Distribution */
                <FormField
                  label={`Response Distribution — ${currentMeta.emoji} ${currentMeta.label} (n = ${currentMeta.n})`}
                  last
                >
                  <div style={{ marginTop: "0.5rem" }}>
                    {(q.opts || []).map((opt, i) => (
                      <DataRow key={i} label={opt} value={`${(currentData?.[i] ?? 0).toFixed(1)}%`}
                        color={q.colors[i % q.colors.length]}
                        last={i === q.opts.length - 1} />
                    ))}
                  </div>
                  <ArrowNotes notes={notes} />
                </FormField>
              )}
            </div>
          </div>
        )}

        <QuoteGallery gallery={gallery} />
      </div>
    </BureauCard>
  );
}

// Animated vertical bar for the avg-scale mini chart
function AnimatedBar({ color, targetHeight, label, emoji }) {
  const [ref, visible] = useReveal();
  const [h, setH] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start;
    let raf;
    const dur = 700;
    const step = t => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setH(targetHeight * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [visible, targetHeight]);
  // Safety: if animation never fired, force final height after 2.5s
  useEffect(() => {
    const t = setTimeout(() => setH(curr => curr === 0 ? targetHeight : curr), 2500);
    return () => clearTimeout(t);
  }, [targetHeight]);
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem" }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", fontWeight: 700, color }}>{label}</span>
      <div style={{ width: 24, height: `${h}px`, background: color, borderRadius: "3px 3px 0 0", transition: "height 0.05s linear" }} />
      <span style={{ fontSize: "0.5rem", color: C.paperGhost }}>{emoji}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MIRROR CARD — the devastating juxtapositions
// ═══════════════════════════════════════════════════════════════

function MirrorSide({ side, colors, bgColor }) {
  const meta = PATHWAY[side.pathway];
  const color = pathColor(side.pathway);

  return (
    <div style={{ flex: 1, minWidth: 240, padding: "1.5rem", background: bgColor }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700,
        fontSize: "0.9rem",
        color,
        marginBottom: "0.2rem",
      }}>{meta.emoji} {meta.label}</div>
      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 400,
        fontSize: "0.78rem",
        color: C.paperDim,
        fontStyle: "italic",
        marginBottom: "0.85rem",
        lineHeight: 1.45,
      }}>{side.q}</div>

      {side.opts.map((opt, i) => (
        <MirrorBar key={i} opt={opt} value={side.data[i] || 0} color={colors[i % colors.length]} delay={i * 90} />
      ))}
    </div>
  );
}

function MirrorBar({ opt, value, color, delay }) {
  const [ref, visible] = useReveal();
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      let start;
      let raf;
      const dur = 700;
      const step = t => {
        if (!start) start = t;
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setW(value * eased);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, delay);
    return () => clearTimeout(timer);
  }, [visible, value, delay]);
  // Safety: if animation never fired, force final value after 2.5s + delay
  useEffect(() => {
    const t = setTimeout(() => setW(curr => curr === 0 ? value : curr), 2500 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.35rem" }}>
      <div style={{ flex: 1, height: 16, background: C.paperBarBg, borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${w}%`, background: color, borderRadius: 3,
          display: "flex", alignItems: "center", paddingLeft: 5,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.52rem", fontWeight: 700, color: "rgba(255,255,255,0.9)",
        }}>{w > 14 ? `${Math.round(value)}%` : ""}</div>
      </div>
      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.65rem", color: C.paperDim, width: 98, flexShrink: 0 }}>{opt}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", fontWeight: 700, color: C.paperInk, width: 38, textAlign: "right", flexShrink: 0 }}>{value.toFixed(1)}%</span>
    </div>
  );
}

function MirrorCard({ pair }) {
  const gallery = QUOTE_GALLERIES[pair.id];
  const leftMeta  = PATHWAY[pair.left.pathway];
  const rightMeta = PATHWAY[pair.right.pathway];
  const gradient  = mirrorGradient(pair.left.pathway, pair.right.pathway);

  return (
    <BureauCard
      title={`Mirror · ${pair.title}`}
      refText={`${leftMeta.short.toUpperCase()} ⇔ ${rightMeta.short.toUpperCase()} · PARALLEL QUESTION PAIR`}
      stamp="Mirror"
      stampColor={C.gold}
      gradient={gradient}
      cardLabel="MIRROR · PARALLEL QUESTION PAIR"
    >
      {pair.note && <LanguageNote>{pair.note}</LanguageNote>}
      {pair.sub && (
        <div style={{
          padding: "0 1.5rem 1rem",
          fontFamily: "'Playfair Display', serif",
          fontWeight: 400,
          fontStyle: "italic",
          fontSize: "0.9rem",
          color: C.paperSubtle,
          lineHeight: 1.45,
        }}>{pair.sub}</div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240, borderRight: `1px dashed ${C.paperRuleDash}` }}>
          <MirrorSide side={pair.left} colors={pair.colors} bgColor={pathBg(pair.left.pathway).replace("0.10", "0.04")} />
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <MirrorSide side={pair.right} colors={pair.colors} bgColor={pathBg(pair.right.pathway).replace("0.10", "0.04")} />
        </div>
      </div>

      {gallery && (
        <div style={{ padding: "0 1.5rem 1.75rem" }}>
          <QuoteGallery gallery={gallery} />
        </div>
      )}
    </BureauCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// SIX PATHWAYS — the survey's full architecture
// ═══════════════════════════════════════════════════════════════

// Pathway metadata for the intro card and the voices section
// This is a superset of PATHWAY in data.js — adds trans and intersex
// n values pulled from META.pathwayCounts so they auto-update when
// /api/count mutates META (see useLiveMeta hook in App).
const PATHWAY_META_EXT = [
  {
    id: "intact", emoji: "🟢", label: "The Intact Pathway",
    short: "Intact",
    get n() { return META.pathwayCounts?.intact ?? 142; },
    color: "#5b93c7",
    description: "Men never circumcised. Their parents, for varied reasons, chose not to follow the default.",
    featured_in: "chapters 1–7, plus demographics & voices",
  },
  {
    id: "circumcised", emoji: "🔵", label: "The Circumcised Pathway",
    short: "Circumcised",
    get n() { return META.pathwayCounts?.circumcised ?? 213; },
    color: "#d94f4f",
    description: "Men who were circumcised, generally as infants, without their consent.",
    featured_in: "chapters 1–7, plus demographics & voices",
  },
  {
    id: "restoring", emoji: "🟣", label: "The Restoration Pathway",
    short: "Restoring",
    get n() { return META.pathwayCounts?.restoring ?? 109; },
    color: "#e8c868",
    description: "Men actively restoring — or who have completed restoring — their foreskin.",
    featured_in: "chapters on restoration & voices",
  },
  {
    id: "observer", emoji: "🟠", label: "The Observer, Partner & Ally Pathway",
    short: "Observer",
    get n() { return META.pathwayCounts?.observer ?? 37; },
    color: "#a0a0a0",
    description: "Partners, parents of AMAB children, doctors, therapists, intactivists — witnesses without a personal anatomical stake.",
    featured_in: "universal questions & voices",
  },
  {
    id: "trans", emoji: "🔴", label: "The Trans · Gender-Affirming Surgery Pathway",
    short: "Trans",
    get n() { return META.pathwayCounts?.trans ?? 0; },
    color: "#e85d50",
    description: "Trans men reflecting on pre-surgery circumcision state and choices made during gender-affirming bottom surgery.",
    featured_in: "awaiting first respondent",
    dormant: true,
  },
  {
    id: "intersex", emoji: "⚪", label: "The Intersex Pathway",
    short: "Intersex",
    get n() { return META.pathwayCounts?.intersex ?? 0; },
    color: "#b0a888",
    description: "Intersex respondents connecting routine infant circumcision to the broader frame of non-consensual genital surgery (IGM).",
    featured_in: "awaiting first respondent",
    dormant: true,
  },
];

function SixPathwaysCard() {
  return (
    <div id="section-six-pathways" style={{ scrollMarginTop: "4rem" }}>
      <BureauCard
        title="The Six Pathways"
        refText="SURVEY ARCHITECTURE · SIX BRANCHES, ONE INQUIRY"
        stamp="Architecture"
        stampColor={C.gold}
        gradient={RAINBOW_GRAD}
        cardLabel="HOW THE INQUIRY IS STRUCTURED"
      >
        <div style={{ padding: "2rem 2.25rem 2.25rem" }}>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
            fontSize: TYPE.body,
            color: C.paperSubtle,
            lineHeight: 1.7,
            marginBottom: "1.75rem",
          }}>
            The survey isn't one questionnaire with a single audience — it's{" "}
            <strong style={{ color: C.paperInk }}>six parallel branches</strong>,
            each tailored to a distinct experience of this issue. Every branch asks
            some of the same questions, but each also asks things only that
            pathway can meaningfully answer.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem",
          }}>
            {PATHWAY_META_EXT.map(p => (
              <div
                key={p.id}
                style={{
                  background: p.dormant ? "rgba(200,195,185,0.15)" : "rgba(255,255,255,0.5)",
                  border: `1px solid ${C.paperRuleDash}`,
                  borderLeft: `4px solid ${p.color}`,
                  borderRadius: 3,
                  padding: "1.15rem 1.25rem",
                  opacity: p.dormant ? 0.85 : 1,
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.55rem",
                  marginBottom: "0.2rem",
                }}>
                  <span style={{ fontSize: "1.35rem" }}>{p.emoji}</span>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: C.paperInk,
                    lineHeight: 1.25,
                    letterSpacing: "-0.005em",
                  }}>{p.short}</div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.72rem",
                    color: p.dormant ? C.paperDim : p.color,
                    fontWeight: 700,
                    marginLeft: "auto",
                  }}>
                    n = {p.n}
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.68rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: p.color,
                  marginBottom: "0.55rem",
                }}>{p.label}</div>
                <div style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "0.85rem",
                  color: C.paperSubtle,
                  lineHeight: 1.55,
                  marginBottom: "0.65rem",
                }}>{p.description}</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.7rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: C.paperDim,
                  fontWeight: 600,
                  fontStyle: p.dormant ? "italic" : "normal",
                }}>
                  {p.dormant ? "★ We're listening — if this is you, your survey is waiting" : `Featured ${p.featured_in}`}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: "1.5rem",
            padding: "1rem 1.25rem",
            background: "rgba(91,147,199,0.06)",
            borderLeft: `3px solid ${C.blue}`,
            borderRadius: "0 4px 4px 0",
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "0.95rem",
            color: C.paperSubtle,
            lineHeight: 1.6,
          }}>
            The trans and intersex pathways exist in the survey because this
            conversation is part of a larger coalition — genital autonomy is a
            question about consent and bodily integrity that crosses identity
            lines. Those pathways have no respondents yet. Their columns in
            this report are quiet on purpose.{" "}
            <a
              href="https://forms.gle/FQ8o9g7j1yU3Cw7n7"
              target="_blank"
              rel="noreferrer"
              style={{ color: C.blue, fontWeight: 700, textDecoration: "underline" }}
            >If you are a voice we haven't heard yet, the survey is here.</a>
          </div>
        </div>
      </BureauCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VOICES SECTION — parallel pathway columns of curated quotes
// ═══════════════════════════════════════════════════════════════

// One quote, rendered consistently across all cards
function VoiceQuote({ quote, pathwayColor, compact }) {
  return (
    <blockquote style={{
      margin: 0,
      padding: compact ? "0.7rem 0.85rem 0.7rem 1rem" : "0.85rem 1rem 0.9rem 1.15rem",
      background: "rgba(255,255,255,0.55)",
      borderLeft: `3px solid ${pathwayColor}`,
      borderRadius: "0 3px 3px 0",
      marginBottom: "0.65rem",
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: compact ? "0.88rem" : "0.93rem",
        color: C.paperInk,
        lineHeight: 1.55,
        fontStyle: "italic",
        marginBottom: "0.4rem",
        whiteSpace: "pre-wrap",
      }}>
        &ldquo;{quote.text}&rdquo;
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "0.7rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: C.paperDim,
        fontWeight: 600,
      }}>
        {quote.age ? `Age ${quote.age}` : "Age —"}
        {quote.generation && ` · ${quote.generation}`}
      </div>
    </blockquote>
  );
}

// One pathway column within a theme card
function PathwayColumn({ pathwayId, pathwayMeta, subtitle, quotes, expanded, onToggle }) {
  const initiallyVisible = 4;
  const visibleQuotes = expanded ? quotes : quotes.slice(0, initiallyVisible);
  const hiddenCount = quotes.length - initiallyVisible;
  const dormant = pathwayMeta.dormant;

  return (
    <div style={{
      flex: 1,
      minWidth: 260,
      background: dormant ? "rgba(200,195,185,0.12)" : "rgba(255,255,255,0.25)",
      border: `1px solid ${C.paperRuleDash}`,
      borderTop: `4px solid ${pathwayMeta.color}`,
      borderRadius: "3px",
      padding: "1.1rem 1.15rem 1.25rem",
      opacity: dormant ? 0.85 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.45rem", marginBottom: "0.25rem" }}>
        <span style={{ fontSize: "1.1rem" }}>{pathwayMeta.emoji}</span>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "1rem",
          color: C.paperInk,
          letterSpacing: "-0.005em",
        }}>{pathwayMeta.short}</div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.7rem",
          color: C.paperDim,
          marginLeft: "auto",
          fontWeight: 700,
        }}>
          n = {pathwayMeta.n}
        </div>
      </div>
      {subtitle && (
        <div style={{
          fontFamily: "'Barlow', sans-serif",
          fontStyle: "italic",
          fontSize: "0.78rem",
          color: C.paperSubtle,
          marginBottom: "0.85rem",
          lineHeight: 1.4,
        }}>{subtitle}</div>
      )}
      {dormant ? (
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "0.9rem",
          color: C.paperDim,
          lineHeight: 1.55,
          padding: "0.8rem 0",
        }}>
          No respondents yet. This pathway exists in the survey —{" "}
          <a
            href="https://forms.gle/FQ8o9g7j1yU3Cw7n7"
            target="_blank"
            rel="noreferrer"
            style={{ color: pathwayMeta.color, fontWeight: 700, textDecoration: "underline" }}
          >your voice is welcome here</a>.
        </div>
      ) : quotes.length === 0 ? (
        <div style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: "0.85rem",
          color: C.paperDim,
          fontStyle: "italic",
          padding: "0.5rem 0",
        }}>
          This question was not asked of the {pathwayMeta.short.toLowerCase()} pathway.
        </div>
      ) : (
        <>
          {visibleQuotes.map(q => (
            <VoiceQuote key={q.row_idx} quote={q} pathwayColor={pathwayMeta.color} compact />
          ))}
          {hiddenCount > 0 && (
            <button
              onClick={onToggle}
              style={{
                width: "100%",
                marginTop: "0.35rem",
                padding: "0.45rem 0.7rem",
                background: "transparent",
                border: `1px dashed ${pathwayMeta.color}`,
                borderRadius: 3,
                color: pathwayMeta.color,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {expanded ? "Show fewer" : `Read ${hiddenCount} more`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function VoicesThemeCard({ theme, pathways, universal }) {
  const [expanded, setExpanded] = useState({});
  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }));

  return (
    <div style={{ scrollMarginTop: "4rem" }}>
      <BureauCard
        title={theme.title}
        refText={theme.desc.toUpperCase()}
        stamp={universal ? "Universal" : "Voices"}
        stampColor={C.gold}
        gradient={RAINBOW_GRAD}
        cardLabel={universal ? "ASKED OF EVERY PATHWAY" : "IN THEIR OWN WORDS"}
      >
        <div style={{ padding: "1.75rem 2rem 2rem" }}>
          <div style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}>
            {pathways.map(p => {
              const meta = PATHWAY_META_EXT.find(m => m.id === p.id);
              const quotes = theme.pathways[p.id] || [];
              return (
                <PathwayColumn
                  key={p.id}
                  pathwayId={p.id}
                  pathwayMeta={meta}
                  subtitle={p.subtitle}
                  quotes={quotes}
                  expanded={!!expanded[p.id]}
                  onToggle={() => toggle(p.id)}
                />
              );
            })}
          </div>
        </div>
      </BureauCard>
    </div>
  );
}

function VoicesSection() {
  // Configuration: which themes render in which pathway order
  // The parallel-pair themes show pathways that were asked the question
  // The universal themes show all six
  const cards = [
    {
      theme_id: "message_to_parents",
      universal: false,
      pathways: [
        { id: "intact",      subtitle: VOICES_THEMES.message_to_parents.subtitle_intact || "What growing up intact was like" },
        { id: "circumcised", subtitle: VOICES_THEMES.message_to_parents.subtitle_circumcised || "What I'd say to my parents" },
      ],
    },
    {
      theme_id: "advantages",
      universal: false,
      pathways: [
        { id: "intact" },
        { id: "circumcised" },
        { id: "restoring", subtitle: "Motivations to restore" },
      ],
    },
    {
      theme_id: "drawbacks",
      universal: false,
      pathways: [
        { id: "intact" },
        { id: "circumcised" },
        { id: "restoring", subtitle: "Before restoring, how did you feel?" },
      ],
    },
    {
      theme_id: "wish_understood",
      universal: false,
      pathways: [
        { id: "intact" },
        { id: "circumcised" },
        { id: "restoring" },
      ],
    },
    {
      theme_id: "when_feelings",
      universal: false,
      pathways: [
        { id: "intact" },
        { id: "circumcised" },
      ],
    },
    {
      theme_id: "outlier_parents",
      universal: false,
      pathways: [
        { id: "intact" },
      ],
    },
    {
      theme_id: "final_straw",
      universal: false,
      pathways: [
        { id: "restoring" },
      ],
    },
    {
      theme_id: "stereotype_intact",
      universal: true,
      pathways: [
        { id: "intact" },
        { id: "circumcised" },
        { id: "restoring" },
        { id: "observer" },
        { id: "trans" },
        { id: "intersex" },
      ],
    },
    {
      theme_id: "stereotype_circ",
      universal: true,
      pathways: [
        { id: "intact" },
        { id: "circumcised" },
        { id: "restoring" },
        { id: "observer" },
        { id: "trans" },
        { id: "intersex" },
      ],
    },
    {
      theme_id: "most_important_info",
      universal: true,
      pathways: [
        { id: "intact" },
        { id: "circumcised" },
        { id: "restoring" },
        { id: "observer" },
        { id: "trans" },
        { id: "intersex" },
      ],
    },
    {
      theme_id: "trauma_metaphor",
      universal: true,
      pathways: [
        { id: "intact" },
        { id: "circumcised" },
        { id: "restoring" },
        { id: "observer" },
        { id: "trans" },
        { id: "intersex" },
      ],
    },
  ];

  return (
    <div id="section-voices" style={{ scrollMarginTop: "4rem" }}>
      {/* Voices section intro */}
      <BureauCard
        title="In Their Own Words · The Record"
        refText="CURATED TESTIMONY ACROSS THE SIX PATHWAYS"
        stamp="Voices"
        stampColor={C.gold}
        gradient={RAINBOW_GRAD}
        cardLabel="NARRATIVE TESTIMONY"
      >
        <div style={{ padding: "1.75rem 2rem 1.75rem" }}>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
            fontSize: TYPE.body,
            color: C.paperSubtle,
            lineHeight: 1.7,
            marginBottom: "1rem",
          }}>
            Numbers summarize. They do not{" "}
            <em>witness</em>. The survey's free-text questions collected
            thousands of words of lived experience — sometimes tender,
            sometimes furious, often both at once. The cards below juxtapose
            responses to the same question across pathways, so the comparisons
            the survey was designed to surface become visible on the page.
          </p>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.85rem",
            color: C.paperDim,
            fontStyle: "italic",
            lineHeight: 1.6,
          }}>
            Each quote is shown with age and generation for context. Names and
            identifying details have been removed. The full curation rationale
            — including responses I chose not to surface and why — is available
            in the site's documentation. Quotes are drawn directly from survey
            responses with no edits to wording except for redaction of specific
            identifying details.
          </p>
        </div>
      </BureauCard>

      {/* Render each theme card */}
      {cards.map(cardSpec => {
        const theme = VOICES_THEMES[cardSpec.theme_id];
        if (!theme) return null;
        return (
          <VoicesThemeCard
            key={cardSpec.theme_id}
            theme={theme}
            pathways={cardSpec.pathways}
            universal={cardSpec.universal}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DEMOGRAPHICS EXPLORER — "who circs and who doesn't?"
// An interactive filter tool for the outlier-parents question
// ═══════════════════════════════════════════════════════════════

function DemographicsExplorerCard() {
  const [selectedDim, setSelectedDim] = useState("family_politics");
  const [sortMode, setSortMode] = useState("natural"); // natural | intact | size

  const currentDim = DEMOGRAPHIC_DIMENSIONS.find(d => d.id === selectedDim) || DEMOGRAPHIC_DIMENSIONS[0];
  const baseRate = DEMOGRAPHIC_BASE_RATE;

  // Sort categories based on current mode
  const categories = useMemo(() => {
    const cats = [...currentDim.categories];
    if (sortMode === "intact") {
      cats.sort((a, b) => b.pct_intact - a.pct_intact);
    } else if (sortMode === "size") {
      cats.sort((a, b) => b.total - a.total);
    }
    return cats;
  }, [currentDim, sortMode]);

  // Find max bar width for proportional rendering — use count of largest category
  const maxTotal = Math.max(...categories.map(c => c.total), 1);

  // Colors for the two outcome segments (stacked)
  const colorIntact = "#5b93c7";      // blue
  const colorCirc = "#d94f4f";        // red
  const colorBase = C.paperBarBg;     // neutral fill

  return (
    <div id="section-demographics" style={{ scrollMarginTop: "4rem" }}>
      <BureauCard
        title="Demographics Explorer"
        refText="CROSS-TAB · WHO CIRCS AND WHO DOESN'T"
        stamp="Explorer"
        stampColor={C.gold}
        gradient={`linear-gradient(90deg, ${C.blue}, ${C.gold}, ${C.red})`}
        cardLabel="INTERACTIVE · CIRCUMCISION OUTCOMES BY DEMOGRAPHIC"
      >
        <div style={{ padding: "2rem 2.25rem 2.25rem" }}>

          {/* Intro copy */}
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 800,
            fontSize: "clamp(1.3rem, 2vw, 1.65rem)",
            color: C.paperInk,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            marginBottom: "0.75rem",
          }}>Why did <em>outlier parents</em> leave us intact, while so many were convinced otherwise?</h3>

          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
            fontSize: TYPE.body,
            color: C.paperSubtle,
            lineHeight: 1.7,
            marginBottom: "1.5rem",
          }}>
            Routine infant circumcision is the default in American hospitals. But not every family
            followed the default. Slice the respondent pool by the demographic signals that shape
            parenting decisions — politics, education, religion, generation, country — and a portrait
            of the "outlier parent" begins to emerge.
          </p>

          {/* Base rate context banner */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "rgba(91,147,199,0.06)",
            borderLeft: `3px solid ${C.blue}`,
            borderRadius: "0 4px 4px 0",
            padding: "0.85rem 1.15rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: C.blue,
            }}>Overall base rate</div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: C.paperInk,
            }}>
              <span style={{ color: colorIntact }}>{baseRate.pct_intact}% intact</span>
              {" · "}
              <span style={{ color: colorCirc }}>{baseRate.pct_circumcised}% circumcised</span>
              {" · "}
              <span style={{ color: C.paperDim }}>n = {baseRate.total}</span>
            </div>
            <div style={{
              flex: 1,
              minWidth: 200,
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.75rem",
              fontStyle: "italic",
              color: C.paperDim,
              lineHeight: 1.5,
            }}>
              Self-selected sample. The broader U.S. rate is higher. This tool shows variation{" "}
              <em>within our respondents</em>, not absolute circumcision prevalence.
            </div>
          </div>

          {/* Dimension selector */}
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: C.gold,
            marginBottom: "0.6rem",
          }}>Slice by dimension:</div>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.4rem",
            marginBottom: "1.25rem",
          }}>
            {DEMOGRAPHIC_DIMENSIONS.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDim(d.id)}
                style={{
                  padding: "0.5rem 0.95rem",
                  border: `1.5px solid ${d.id === selectedDim ? C.paperInk : C.paperRuleDash}`,
                  borderRadius: 20,
                  background: d.id === selectedDim ? C.paperInk : "rgba(255,255,255,0.6)",
                  color: d.id === selectedDim ? C.paper : C.paperSubtle,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (d.id !== selectedDim) e.currentTarget.style.background = "rgba(255,255,255,0.95)";
                }}
                onMouseLeave={(e) => {
                  if (d.id !== selectedDim) e.currentTarget.style.background = "rgba(255,255,255,0.6)";
                }}
              >{d.short}</button>
            ))}
          </div>

          {/* Sort toggle */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "1.25rem",
          }}>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: C.paperDim,
              fontWeight: 700,
            }}>Sort:</span>
            {[
              { id: "natural", label: "Natural order" },
              { id: "intact",  label: "% Intact (high→low)" },
              { id: "size",    label: "Sample size" },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSortMode(opt.id)}
                style={{
                  padding: "0.35rem 0.7rem",
                  background: "transparent",
                  border: "none",
                  borderBottom: opt.id === sortMode ? `2px solid ${C.gold}` : "2px solid transparent",
                  color: opt.id === sortMode ? C.paperInk : C.paperDim,
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: opt.id === sortMode ? 700 : 400,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >{opt.label}</button>
            ))}
          </div>

          {/* Dimension title */}
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: "1.2rem",
            color: C.paperInk,
            marginBottom: "0.3rem",
          }}>{currentDim.label}</div>
          {currentDim.note && (
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.75rem",
              fontStyle: "italic",
              color: C.paperDim,
              marginBottom: "0.5rem",
            }}>{currentDim.note}</div>
          )}

          {/* The bar chart */}
          <div style={{ marginTop: "0.75rem", marginBottom: "1.5rem" }}>
            {categories.map((cat) => {
              const relativeWidth = Math.max((cat.total / maxTotal) * 100, 8); // floor at 8% for readability
              const deviation = cat.pct_intact - baseRate.pct_intact;
              // Only show the % label if the segment is wide enough on screen to fit it.
              // Heuristic: segment_px ≈ container_px * (relativeWidth/100) * (pct/100)
              // We want at least ~30px for a label to fit comfortably.
              // Assume container is ~720px at worst case → threshold = 30 / (720 * relativeWidth/100) * 100
              const segWidthEstimate = (relativeWidth / 100) * 720;
              const intactLabelFits = (cat.pct_intact / 100) * segWidthEstimate >= 32;
              const circLabelFits   = (cat.pct_circumcised / 100) * segWidthEstimate >= 32;
              return (
                <div key={cat.category} style={{ marginBottom: "0.95rem" }}>
                  {/* Header row: label + stats */}
                  <div style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    marginBottom: "0.25rem",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}>
                    <div style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      color: C.paperInk,
                      flex: 1,
                      minWidth: 180,
                    }}>{cat.category}</div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.78rem",
                      color: C.paperDim,
                      whiteSpace: "nowrap",
                    }}>
                      {cat.pct_intact}% intact
                      {" · "}
                      n = {cat.total}
                      {" · "}
                      <span style={{
                        color: deviation > 3 ? colorIntact : deviation < -3 ? colorCirc : C.paperDim,
                        fontWeight: 700,
                      }}>
                        {deviation > 0 ? "+" : ""}{deviation.toFixed(1)}pp
                      </span>
                    </div>
                  </div>

                  {/* Stacked bar — intact (blue) vs circumcised (red) */}
                  <div style={{
                    position: "relative",
                    height: 24,
                    width: `${relativeWidth}%`,
                    background: colorBase,
                    borderRadius: 3,
                    overflow: "hidden",
                    display: "flex",
                    minWidth: 140,
                  }}>
                    <div style={{
                      width: `${cat.pct_intact}%`,
                      background: colorIntact,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 6,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.95)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}>
                      {intactLabelFits ? `${cat.pct_intact}%` : ""}
                    </div>
                    <div style={{
                      width: `${cat.pct_circumcised}%`,
                      background: colorCirc,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingRight: 6,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.95)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}>
                      {circLabelFits ? `${cat.pct_circumcised}%` : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{
            display: "flex",
            gap: "1.25rem",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: C.paperDim,
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: 12, height: 12, background: colorIntact, borderRadius: 2 }} /> Intact
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: 12, height: 12, background: colorCirc, borderRadius: 2 }} /> Circumcised (incl. restoring)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ fontWeight: 700, color: C.paperDim }}>pp vs base</span> = percentage points above / below the {baseRate.pct_intact}% baseline
            </span>
          </div>

          {/* Outlier insights panel */}
          <div style={{
            background: "rgba(212,160,48,0.06)",
            border: `1px solid ${C.paperRuleDash}`,
            borderLeft: `4px solid ${C.gold}`,
            borderRadius: "0 4px 4px 0",
            padding: "1.25rem 1.5rem",
            marginBottom: "0.5rem",
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.gold,
              marginBottom: "0.5rem",
            }}>★ Outlier Signal</div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "1.05rem",
              color: C.paperInk,
              lineHeight: 1.3,
              marginBottom: "0.85rem",
            }}>Which dimensions most distinguish households that kept their boys intact?</div>
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.85rem",
              color: C.paperSubtle,
              lineHeight: 1.65,
            }}>
              Ranked by the <em>spread</em> between the most-intact and least-intact categories within
              each dimension. Larger spread = stronger signal.
            </div>

            <ol style={{
              listStyle: "none",
              padding: 0,
              margin: "1rem 0 0 0",
              counterReset: "outlier",
            }}>
              {DEMOGRAPHIC_OUTLIERS.slice(0, 6).map((o, i) => (
                <li
                  key={o.dimension_id}
                  onClick={() => setSelectedDim(o.dimension_id)}
                  style={{
                    counterIncrement: "outlier",
                    padding: "0.65rem 0",
                    borderBottom: i < 5 ? `1px dashed ${C.paperRuleDash}` : "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.6)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 800,
                    fontSize: "1.4rem",
                    color: C.gold,
                    width: 28,
                    flexShrink: 0,
                  }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: C.paperDim,
                      marginBottom: "0.15rem",
                    }}>{o.dimension_label}  ·  Spread {o.spread}pp</div>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 400,
                      fontSize: "0.92rem",
                      color: C.paperInk,
                      lineHeight: 1.4,
                    }}>
                      <strong style={{ color: colorIntact, fontFamily: "'Barlow', sans-serif", fontWeight: 700 }}>{o.most_intact_pct}% intact</strong>
                      {" "}among{" "}
                      <em>{o.most_intact_category}</em>
                      {" "}(n={o.most_intact_n})
                      {" "}vs.{" "}
                      <strong style={{ color: colorCirc, fontFamily: "'Barlow', sans-serif", fontWeight: 700 }}>{o.least_intact_pct}%</strong>
                      {" "}among{" "}
                      <em>{o.least_intact_category}</em>
                      {" "}(n={o.least_intact_n})
                    </div>
                  </div>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "0.68rem",
                    color: C.gold,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>View →</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Reflection pull quote */}
          <div style={{
            marginTop: "1.5rem",
            padding: "1.25rem 1.5rem",
            background: "rgba(91,147,199,0.06)",
            borderLeft: `3px solid ${C.blue}`,
            borderRadius: "0 4px 4px 0",
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "1rem",
              color: C.paperSubtle,
              lineHeight: 1.65,
            }}>
              My own parents made a "conscious choice" in the 1970s that put me in the 30.5%
              intact minority of this sample. Within their cohort — U.S.-born Boomers, middle-class,
              college-educated — that choice was especially rare. What distinguished them? A
              question mark, instead of the default.
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: C.paperDim,
              marginTop: "0.85rem",
              fontWeight: 700,
            }}>— Tone Pettit, Lead Researcher</div>
          </div>

          {/* Methodology note */}
          <div style={{
            marginTop: "1.5rem",
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.72rem",
            color: C.paperDim,
            lineHeight: 1.55,
            fontStyle: "italic",
          }}>
            Aggregates shown include only respondents with a classified pathway
            (intact, circumcised, or restoring; n = {baseRate.total}). Observer pathway respondents
            are excluded from this view since their demographics describe themselves, not a
            circumcision decision made about them. Minimum cell size: {DEMOGRAPHIC_META.minCellSize}.
            Smaller cells are combined into "Other" to protect anonymity.
          </div>
        </div>
      </BureauCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ACT ON THIS — four cards that convert "so what?" into action
// ═══════════════════════════════════════════════════════════════

function UrgentPlaintiffCard() {
  return (
    <div id="section-urgent-plaintiff" style={{ scrollMarginTop: "4rem" }}>
      <BureauCard
        title="Urgent: Washington State Plaintiff Search"
        refText="EQUAL PROTECTION LAWSUIT · TIME-SENSITIVE"
        stamp="Urgent"
        stampColor={C.red}
        gradient={`linear-gradient(90deg, ${C.red}, #e85d50, #e8a44a)`}
        cardLabel="★ URGENT CALL TO ACTION"
        shimmer={false}
      >
        <div style={{ padding: "2rem 2.25rem 2.25rem" }}>
          {/* URGENT badge */}
          <div style={{
            display: "inline-block",
            background: C.red,
            color: "#fff",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "0.72rem",
            letterSpacing: "0.2em",
            padding: "0.35rem 0.85rem",
            borderRadius: 2,
            marginBottom: "0.9rem",
            textTransform: "uppercase",
          }}>★ Urgent · Time-Sensitive</div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 800,
            fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
            color: C.paperInk,
            lineHeight: 1.2,
            letterSpacing: "-0.015em",
            marginBottom: "1rem",
          }}>A courageous plaintiff could unlock a landmark case.</h2>

          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
            fontSize: TYPE.body,
            color: C.paperSubtle,
            lineHeight: 1.7,
            marginBottom: "1.25rem",
          }}>
            Leaders from <strong style={{ color: C.paperInk }}>Intact Global</strong>,{" "}
            <strong style={{ color: C.paperInk }}>Doctors Opposing Circumcision</strong>, and the{" "}
            <strong style={{ color: C.paperInk }}>Washington Initiative for Boys and Men</strong> are
            preparing a potential Equal Protection lawsuit arguing that Washington State's failure
            to protect boys from non-consensual genital cutting, while protecting girls, violates
            its own constitution. To move forward, the lawsuit needs a plaintiff.
          </p>

          {/* Criteria box */}
          <div style={{
            background: "rgba(217,79,79,0.06)",
            border: `1px dashed ${C.red}`,
            borderRadius: 4,
            padding: "1.1rem 1.35rem",
            marginBottom: "1.5rem",
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: C.red,
              marginBottom: "0.6rem",
            }}>We are looking for a "regret parent" who meets <em>all three</em> criteria:</div>
            <ul style={{
              margin: 0,
              paddingLeft: "1.25rem",
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.95rem",
              color: C.paperSubtle,
              lineHeight: 1.7,
            }}>
              <li>You are a parent who now <strong style={{ color: C.paperInk }}>regrets the decision</strong> to have your son circumcised.</li>
              <li>Your son was <strong style={{ color: C.paperInk }}>born AND circumcised in Washington State</strong>.</li>
              <li>The circumcision occurred <strong style={{ color: C.paperInk }}>on or after March 1, 2023</strong>.</li>
            </ul>
          </div>

          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "1rem",
            color: C.paperSubtle,
            lineHeight: 1.65,
            marginBottom: "1.5rem",
          }}>
            If you are this person — or if you know a family who might be — your story could be
            the key that unlocks equal legal protection for the next generation of Washington
            boys. All communications are handled in the strictest confidence.
          </p>

          {/* Two contact paths */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a
              href="mailto:plaintiff@circumsurvey.online"
              style={{
                display: "inline-block",
                padding: "0.8rem 1.4rem",
                background: C.red,
                color: "#fff",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                textDecoration: "none",
                borderRadius: 3,
                fontSize: "0.95rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >✉ Reach Out Confidentially</a>
            <a
              href="https://forms.gle/FQ8o9g7j1yU3Cw7n7"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                padding: "0.8rem 1.4rem",
                background: "transparent",
                color: C.paperInk,
                border: `2px solid ${C.paperInk}`,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                textDecoration: "none",
                borderRadius: 3,
                fontSize: "0.95rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >★ Take the Survey</a>
          </div>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.78rem",
            color: C.paperDim,
            marginTop: "0.9rem",
            lineHeight: 1.5,
          }}>
            If taking the survey, mention your potential plaintiff status in one of the
            open-ended fields. Direct email: <a href="mailto:plaintiff@circumsurvey.online" style={{ color: C.red, fontWeight: 600 }}>plaintiff@circumsurvey.online</a>
          </p>
        </div>
      </BureauCard>
    </div>
  );
}

function StrategicPartnersCard() {
  const partners = [
    {
      name: "Doctors Opposing Circumcision",
      short: "DOC",
      logo: "/partners/doc.png",
      url: "https://doctorsopposingcircumcision.org/",
      color: C.blue,
      blurb: "Seattle-based international organization of medical professionals, founded in 1995 on the principle of \"First, do no harm.\" Our survey is featured on their official site.",
    },
    {
      name: "Intact Global",
      short: "Intact Global",
      logo: "/partners/intact-global.png",
      url: "https://intactglobal.org/",
      color: C.red,
      blurb: "Legal advocacy led by attorney Eric Clopper. Preparing a landmark Washington State Equal Protection lawsuit — our dataset is an active tool in their strategic litigation.",
    },
    {
      name: "GALDEF",
      short: "Genital Autonomy Legal Defense & Education Fund",
      logo: "/partners/galdef.png",
      url: "https://www.galdef.org/",
      color: "#1f6b78", // GALDEF teal
      blurb: "Co-founded by Tim Hammond, whose pioneering survey work on long-term harms was a direct inspiration for this project. Strategic path toward academic review at Quinnipiac.",
    },
    {
      name: "WIBM",
      short: "Washington Initiative for Boys and Men",
      logo: "/partners/wibm.png",
      url: "https://wibm.us/",
      color: "#1f6b78", // WIBM teal
      blurb: "Leading political advocacy group in Washington State. Our project provides WA-specific data as evidence for their legislative efforts to secure bodily integrity for boys.",
    },
  ];

  return (
    <div id="section-partners" style={{ scrollMarginTop: "4rem" }}>
      <BureauCard
        title="Strategic Partners & Collaborators"
        refText="AN INDEPENDENT PROJECT, SUPPORTED BY ESTABLISHED ADVOCACY"
        stamp="Partners"
        stampColor={C.gold}
        gradient={RAINBOW_GRAD}
        cardLabel="STRATEGIC ALLIANCES"
      >
        <div style={{ padding: "2rem 2.25rem 2.25rem" }}>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
            fontSize: TYPE.body,
            color: C.paperSubtle,
            lineHeight: 1.7,
            marginBottom: "1.75rem",
          }}>
            What began as an independent inquiry has earned the recognition of leaders and
            organizations who have been doing this work for decades. We are honored to be in
            active collaboration with:
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem",
          }}>
            {partners.map(p => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  color: "inherit",
                  background: "rgba(255,255,255,0.5)",
                  border: `1px solid ${C.paperRuleDash}`,
                  borderTop: `3px solid ${p.color}`,
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "background 0.2s, transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.92)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.5)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Logo container — white background so logos have room to breathe */}
                <div style={{
                  background: "#fff",
                  padding: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 140,
                  borderBottom: `1px solid ${C.paperRuleDash}`,
                }}>
                  <img
                    src={p.logo}
                    alt={`${p.name} logo`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>

                {/* Content */}
                <div style={{ padding: "1.1rem 1.25rem 1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: C.paperInk,
                    lineHeight: 1.25,
                    letterSpacing: "-0.005em",
                    marginBottom: "0.2rem",
                  }}>{p.name}</div>
                  {p.short !== p.name && (
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: "0.72rem",
                      color: p.color,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      marginBottom: "0.55rem",
                    }}>{p.short}</div>
                  )}
                  <div style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 400,
                    fontSize: "0.85rem",
                    color: C.paperSubtle,
                    lineHeight: 1.55,
                    marginBottom: "0.75rem",
                    flex: 1,
                  }}>{p.blurb}</div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "0.72rem",
                    color: p.color,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 800,
                  }}>Visit {p.name} →</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </BureauCard>
    </div>
  );
}

function ResourcesCard() {
  const resources = [
    {
      title: "The Accidental Intactivist Manifesto",
      sub: "125 pages · PDF",
      blurb: "The foundational document behind this research. Personal insight, scientific inquiry, and cultural critique — the history, ethics, anatomy, and emotional truth.",
      url: "https://drive.google.com/file/d/1C3T_nDzIPHSWDUcrvvvcrH_Iallk06pT/view?usp=sharing",
      color: C.red,
      cta: "Download PDF",
    },
    {
      title: "2-Page Survey Overview",
      sub: "Methodology prospectus · PDF",
      blurb: "Goals, methodology, ethical framework. For sharing with organizations, researchers, journalists, and anyone interested in the research design.",
      url: "https://drive.google.com/file/d/1TzhNbktVBKKzh6JGaKti2G0hxyUOb_ol/view?usp=drive_link",
      color: C.blue,
      cta: "Download PDF",
    },
    {
      title: "Shareable Flyers & QR Code",
      sub: "Full-page posters, 2×2 handout cards, QR image",
      blurb: "For posting on community bulletin boards, info tables, local fairs, and conferences. Help us reach 500+ diverse perspectives.",
      url: "https://www.circumsurvey.online/resources-downloads",
      color: C.gold,
      cta: "Browse Materials",
    },
    {
      title: "The Accidental Intactivist on Substack",
      sub: "Ongoing analysis · Essays · Preliminary findings",
      blurb: "Follow along for deeper analysis, survey updates, and related essays. Paid subscription directly funds the continuation of this work.",
      url: "https://theaccidentalintactivist.substack.com/",
      color: C.green,
      cta: "Read & Subscribe",
    },
  ];

  return (
    <div id="section-resources" style={{ scrollMarginTop: "4rem" }}>
      <BureauCard
        title="Dig Deeper · Resources & Downloads"
        refText="MANIFESTO · METHODOLOGY · SHAREABLES"
        stamp="Library"
        stampColor={C.gold}
        gradient={PATH_GRADIENTS.restoring}
        cardLabel="FOR FURTHER INQUIRY"
      >
        <div style={{ padding: "2rem 2.25rem 2.25rem" }}>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
            fontSize: TYPE.body,
            color: C.paperSubtle,
            lineHeight: 1.7,
            marginBottom: "1.75rem",
          }}>
            The data on this site is one phase of a larger inquiry. For context, methodology,
            and materials you can share with others, these are the canonical sources:
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
          }}>
            {resources.map(r => (
              <a
                key={r.title}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  background: "rgba(255,255,255,0.5)",
                  border: `1px solid ${C.paperRuleDash}`,
                  borderTop: `3px solid ${r.color}`,
                  borderRadius: 3,
                  padding: "1.15rem 1.25rem",
                  transition: "background 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.9)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.5)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: C.paperInk,
                  lineHeight: 1.25,
                  marginBottom: "0.25rem",
                  letterSpacing: "-0.005em",
                }}>{r.title}</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.72rem",
                  color: r.color,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  marginBottom: "0.6rem",
                }}>{r.sub}</div>
                <div style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "0.85rem",
                  color: C.paperSubtle,
                  lineHeight: 1.55,
                  marginBottom: "0.7rem",
                }}>{r.blurb}</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.78rem",
                  color: r.color,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 800,
                }}>{r.cta} →</div>
              </a>
            ))}
          </div>
        </div>
      </BureauCard>
    </div>
  );
}

function GetInvolvedCard() {
  const paths = [
    {
      id: "ambassador",
      title: "Become a Survey Ambassador",
      color: C.gold,
      icon: "★",
      blurb: "The single highest-impact thing you can do right now. Share the survey with friends, family, colleagues, and online communities. Use our printable flyers, posters, and QR codes at events.",
      actions: [
        { label: "circumsurvey.online", url: "https://circumsurvey.online", primary: true },
        { label: "Shareables", url: "https://www.circumsurvey.online/resources-downloads" },
      ],
    },
    {
      id: "volunteer",
      title: "Volunteer Your Skills",
      color: C.blue,
      icon: "✎",
      blurb: "Translation (Spanish / Hebrew / German / Arabic), data analysis & visualization, regional outreach, content writing. Tell us what you can do.",
      actions: [
        { label: "volunteer@circumsurvey.online", url: "mailto:volunteer@circumsurvey.online", primary: true },
      ],
    },
    {
      id: "support",
      title: "Support Independent Research",
      color: C.red,
      icon: "♥",
      blurb: "This work is 100% grassroots, no institutional funding. A one-time tip via Buy Me a Coffee or a paid Substack subscription directly fuels the next phase of research.",
      logo: "/partners/bmc.png",
      logoAlt: "Buy Me a Coffee",
      actions: [
        { label: "Buy Me a Coffee", url: "https://coff.ee/accidental.intactivist", primary: true },
        { label: "Substack", url: "https://theaccidentalintactivist.substack.com/subscribe" },
      ],
    },
    {
      id: "collab",
      title: "Organizational Collaboration",
      color: C.green,
      icon: "◈",
      blurb: "If you represent an organization whose mission aligns with bodily integrity and informed consent, let's talk about signal-boosting, data-sharing, and co-authored outputs.",
      actions: [
        { label: "info@circumsurvey.online", url: "mailto:info@circumsurvey.online", primary: true },
      ],
    },
  ];

  return (
    <div id="section-get-involved" style={{ scrollMarginTop: "4rem" }}>
      <BureauCard
        title="Four Ways to Get Involved"
        refText="AMBASSADOR · VOLUNTEER · SUPPORTER · COLLABORATOR"
        stamp="Action"
        stampColor={C.gold}
        gradient={RAINBOW_GRAD}
        cardLabel="FROM SO-WHAT TO SO-THIS"
      >
        <div style={{ padding: "2rem 2.25rem 2.25rem" }}>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
            fontSize: TYPE.body,
            color: C.paperSubtle,
            lineHeight: 1.7,
            marginBottom: "1.75rem",
          }}>
            The data does not interpret itself. If any of what you've read here moves you, here
            are the concrete paths — from five minutes to long-term:
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: "1rem",
          }}>
            {paths.map(p => (
              <div
                key={p.id}
                style={{
                  background: "rgba(255,255,255,0.5)",
                  border: `1px solid ${C.paperRuleDash}`,
                  borderLeft: `4px solid ${p.color}`,
                  borderRadius: 3,
                  padding: "1.15rem 1.25rem",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <span style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.15rem",
                    color: p.color,
                    fontWeight: 700,
                  }}>{p.icon}</span>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: C.paperInk,
                    lineHeight: 1.25,
                    letterSpacing: "-0.005em",
                  }}>{p.title}</div>
                </div>
                <div style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "0.85rem",
                  color: C.paperSubtle,
                  lineHeight: 1.55,
                  marginBottom: "0.85rem",
                  flex: 1,
                }}>{p.blurb}</div>

                {/* Optional service logo (e.g. BMC for support) */}
                {p.logo && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#fff",
                    border: `1px solid ${C.paperRuleDash}`,
                    borderRadius: 3,
                    padding: "0.5rem 0.75rem",
                    marginBottom: "0.75rem",
                    height: 48,
                  }}>
                    <img
                      src={p.logo}
                      alt={p.logoAlt || ""}
                      style={{
                        height: "100%",
                        width: "auto",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                )}

                {/* Actions: primary button + any secondary links */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                  {p.actions.map((action, i) => action.primary ? (
                    <a
                      key={i}
                      href={action.url}
                      target={action.url.startsWith("http") ? "_blank" : undefined}
                      rel={action.url.startsWith("http") ? "noreferrer" : undefined}
                      style={{
                        display: "inline-block",
                        padding: "0.55rem 0.95rem",
                        background: p.color,
                        color: "#fff",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700,
                        textDecoration: "none",
                        borderRadius: 3,
                        fontSize: "0.78rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >{action.label}</a>
                  ) : (
                    <a
                      key={i}
                      href={action.url}
                      target={action.url.startsWith("http") ? "_blank" : undefined}
                      rel={action.url.startsWith("http") ? "noreferrer" : undefined}
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "0.75rem",
                        color: p.color,
                        textDecoration: "none",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        borderBottom: `1px dashed ${p.color}`,
                        paddingBottom: 1,
                      }}
                    >{action.label} →</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </BureauCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HERO CARD
// ═══════════════════════════════════════════════════════════════

function SectionLabel({ id, title, subtitle }) {
  return (
    <Reveal>
      <div id={id} style={{ marginBottom: "1.25rem", scrollMarginTop: "4rem" }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "0.7rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.gold,
          marginBottom: "0.4rem",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
        }}>
          <span>{title}</span>
          <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.gold} 0%, transparent 100%)` }} />
        </div>
        {subtitle && (
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.1rem",
            fontWeight: 400,
            fontStyle: "italic",
            color: C.pageMuted,
            lineHeight: 1.4,
          }}>{subtitle}</div>
        )}
      </div>
    </Reveal>
  );
}

// ═══════════════════════════════════════════════════════════════
// OBSERVER SECTION
// ═══════════════════════════════════════════════════════════════

function ObserverSection() {
  const observerQs = ALL_QUESTIONS.filter(q => q.data && q.data.observer);

  return (
    <div>
      <BureauCard
        title="The Witnesses · Observer Pathway"
        refText={`FORM CS-OBS · N = ${PATHWAY.observer.n}`}
        stamp="Witnesses"
        stampColor={C.gold}
        gradient={PATH_GRADIENTS.observer}
        cardLabel="OBSERVER PATHWAY"
      >
        <div style={{ padding: "1.75rem 1.75rem 1.5rem" }}>
          <FormField
            label="Pathway Description"
            question="Partners, parents, healthcare professionals, and allies"
            body="Respondents who have observed the impact of circumcision in others' lives. Their independent witness perspective — without a personal anatomical stake — makes their answers striking. The Observer Pathway includes spouses, partners, parents of AMAB children, doctors, researchers, therapists, and intactivists."
          />

          <StatCallout
            number={`${PATHWAY.observer.n}`}
            text="observer, partner, and ally respondents. 97% prioritize bodily autonomy. 90.9% would keep their sons intact. 48.5% strongly prefer the intact aesthetic."
            color={C.gold}
          />
        </div>
      </BureauCard>

      {observerQs.map(q => <QCard key={q.id} q={q} defaultPathway="observer" />)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════

function Sidebar({ open, onClose, onSelect, activeId }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(new Set(["Curated Findings"]));
  const toggle = cat => setExpanded(prev => {
    const n = new Set(prev);
    n.has(cat) ? n.delete(cat) : n.add(cat);
    return n;
  });

  const sections = [
    { cat: "Curated Findings", color: C.gold, items: CURATED_SECTIONS.map(s => ({ id: `section-${s.id}`, label: s.title, isSection: true })) },
    { cat: "The Six Pathways", color: C.gold, items: [
      { id: "section-six-pathways", label: "Survey Architecture", isSection: true },
      { id: "section-voices",       label: "In Their Own Words — The Record", isSection: true },
    ]},
    { cat: "Mirror Pairs",     color: C.red,    items: MIRROR_PAIRS.map(p => ({ id: p.id, label: p.title })) },
    { cat: "Observer Pathway", color: C.neutral, items: [{ id: "section-observer", label: `The Witnesses (n=${PATHWAY.observer.n})`, isSection: true }] },
    { cat: "★ Act on This",    color: C.red,    items: [
      { id: "section-demographics",     label: "Demographics Explorer", isSection: true },
      { id: "section-urgent-plaintiff", label: "★ Urgent: WA Plaintiff Search", isSection: true },
      { id: "section-partners",         label: "Strategic Partners", isSection: true },
      { id: "section-resources",        label: "Resources & Downloads", isSection: true },
      { id: "section-get-involved",     label: "Ways to Get Involved", isSection: true },
    ]},
    ...CATS.map(cat => ({
      cat, color: C.pageDim,
      items: ALL_QUESTIONS.filter(q => q.cat === cat).map(q => ({ id: q.id, label: q.q })),
    })),
  ];

  const matchesSearch = item => !search || item.label.toLowerCase().includes(search.toLowerCase());

  return (
    <>
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 320,
        background: C.bgSoft,
        borderRight: `1px solid ${C.pageGhost}`,
        zIndex: 200,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{
          padding: "0.85rem 1rem",
          borderBottom: `1px solid ${C.pageGhost}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: C.gold,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
          }}>★ Navigate</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: C.pageDim, cursor: "pointer",
            fontSize: "1.2rem", padding: "0.2rem",
          }}>✕</button>
        </div>

        <div style={{ padding: "0.5rem 0.75rem" }}>
          <input
            type="text"
            placeholder="Search all questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.pageGhost}`,
              borderRadius: 4,
              color: C.pageText,
              fontSize: "0.8rem",
              fontFamily: "'Barlow', sans-serif",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 0.5rem 1rem" }}>
          {sections.map(sec => {
            const visible = sec.items.filter(matchesSearch);
            if (search && visible.length === 0) return null;
            const isOpen = expanded.has(sec.cat) || !!search;
            return (
              <div key={sec.cat} style={{ marginBottom: "0.25rem" }}>
                <button onClick={() => toggle(sec.cat)} style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0.55rem",
                  background: "none", border: "none", cursor: "pointer",
                  color: sec.color,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  textAlign: "left",
                  borderRadius: 3,
                }}>
                  <span>{sec.cat} ({visible.length})</span>
                  <span style={{ fontSize: "0.6rem", transition: "transform 0.15s", transform: isOpen ? "rotate(180deg)" : "" }}>▾</span>
                </button>
                {isOpen && visible.map(item => {
                  const isActive = activeId === item.id;
                  return (
                    <button key={item.id} onClick={() => onSelect(item.id)} style={{
                      display: "block", width: "100%",
                      textAlign: "left",
                      padding: "0.35rem 0.5rem 0.35rem 1.25rem",
                      background: isActive ? "rgba(212,160,48,0.10)" : "none",
                      border: "none", cursor: "pointer",
                      color: isActive ? C.gold : C.pageDim,
                      fontSize: "0.75rem",
                      lineHeight: 1.4,
                      borderRadius: 3,
                      borderLeft: isActive ? `2px solid ${C.gold}` : "2px solid transparent",
                      transition: "all 0.1s",
                      fontFamily: "'Barlow', sans-serif",
                    }}>
                      {item.label.length > 58 ? item.label.substring(0, 55) + "..." : item.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div style={{
          padding: "0.6rem 0.75rem",
          borderTop: `1px solid ${C.pageGhost}`,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.58rem",
          color: C.pageDim,
          textAlign: "center",
          letterSpacing: "0.05em",
        }}>
          ★ {ALL_QUESTIONS.length + MIRROR_PAIRS.length} items · {META.totalRespondents} respondents
        </div>
      </div>
      {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 150, backdropFilter: "blur(2px)" }} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// METHODOLOGY MODAL
// ═══════════════════════════════════════════════════════════════

function MethodologyModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.8)",
      zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
      backdropFilter: "blur(3px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.paper,
        border: `2.5px solid ${C.paperInk}`,
        borderRadius: 3,
        maxWidth: 580,
        width: "100%",
        maxHeight: "85vh",
        overflowY: "auto",
        position: "relative",
        boxShadow: "0 5px 50px rgba(0,0,0,0.6)",
      }}>
        <div style={{ height: 5, background: RAINBOW_GRAD }} />
        <div style={{
          position: "absolute",
          top: -11, left: 24,
          fontSize: "1.1rem",
          color: C.red,
          background: "rgba(0,0,0,0.85)",
          padding: "0 0.35rem",
          lineHeight: 1,
        }}>★</div>

        <div style={{
          background: C.paperInk,
          color: C.paperInkText,
          padding: "0.55rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
          }}>
            <span style={{ color: C.red }}>★</span> Methodology & Ethics
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.pageMuted, cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
        </div>

        <div style={{ padding: "2rem 1.75rem" }}>
          <FormField label="About This Inquiry" question="Methodology & Ethics" />
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", color: C.paperSubtle, lineHeight: 1.7 }}>
            <p style={{ marginBottom: "0.9rem", fontStyle: "italic", color: C.gold, fontFamily: "'Playfair Display', serif", fontSize: "0.95rem" }}>
              "We are not telling people how to feel. We are creating a platform for them to anonymously share how they actually feel and what they actually experience."
            </p>
            <p style={{ marginBottom: "0.7rem" }}><strong style={{ color: C.paperInk }}>Anonymous & voluntary.</strong> No emails, IPs, or personal identifiers collected. Every question optional.</p>
            <p style={{ marginBottom: "0.7rem" }}><strong style={{ color: C.paperInk }}>Designed to reduce framing bias.</strong> Sexual experience questions appear before pathway assignment.</p>
            <p style={{ marginBottom: "0.7rem" }}><strong style={{ color: C.paperInk }}>All perspectives welcome.</strong> The survey actively solicits satisfied circumcised experiences alongside those who feel harmed.</p>
            <p style={{ marginBottom: "0.7rem" }}><strong style={{ color: C.paperInk }}>Language.</strong> "Resentment" (not regret) for circumcised respondents. "Pathways" not cohorts. "Respondents" throughout.</p>
            <p style={{ marginBottom: "0.7rem" }}><strong style={{ color: C.paperInk }}>Sample sizes vary by question.</strong> Sexual experience rating questions have lower response rates (n=33-86 per pathway) than the structured distribution questions (n=109-210). Sample sizes are always shown.</p>
            <p style={{ marginBottom: "1rem" }}><strong style={{ color: C.paperInk }}>Limitations.</strong> Self-selection bias is inherent to anonymous online surveys. Results reflect experiences of those who chose to participate. Descriptive, not inferential statistics.</p>

            <a href="https://circumsurvey.online/about" target="_blank" rel="noreferrer" style={{
              display: "inline-block",
              padding: "0.6rem 1.2rem",
              background: C.paperInk, color: C.paper,
              textDecoration: "none",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              borderRadius: 2,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>Read Full Methodology →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════
// MAIN APP — v7 assembly
// ═══════════════════════════════════════════════════════════════

// Narrative sections for the progress rail
// These IDs correspond to the DOM ids we set on SectionTitleCard / card containers
function getNarrativeSections() {
  return [
    { id: "hero", title: "The Inquiry" },
    { id: "letter", title: "Editor's Letter" },
    { id: "section-six-pathways", title: "The Six Pathways" },
    ...CURATED_SECTIONS.map((s, i) => ({
      id: `section-${s.id}`,
      title: s.title,
    })),
    { id: "section-voices", title: "In Their Own Words" },
    { id: "section-demographics", title: "Demographics Explorer" },
    { id: "section-urgent-plaintiff", title: "★ Urgent Call" },
    { id: "section-partners", title: "Strategic Partners" },
    { id: "section-resources", title: "Resources" },
    { id: "section-get-involved", title: "Get Involved" },
  ];
}

// Devastating numbers, one per curated section
const SECTION_INTERSTITIALS = {
  "pleasure_gap": {
    big: "36%",
    line1: "lower pleasure from",
    line2: "mobile skin gliding.",
    context: "Intact respondents rate it 3.88, circumcised respondents 2.49 — across every dimension of sexual experience, intact leads.",
    color: "#d94f4f",
  },
  "resentment": {
    big: "0%",
    line1: "of restoring respondents",
    line2: "said \"no, never.\"",
    context: "Every single restoring respondent reported feeling some resentment, loss, anger, or grief about their circumcision.",
    color: "#e85d50",
  },
  "handling": {
    big: "47.6%",
    line1: "describe the decision as",
    line2: "\"routine or automatic.\"",
    context: "Only 2.7% of circumcised respondents say it was offered as a neutral choice with pros and cons.",
    color: "#e8a44a",
  },
  "future_sons": {
    big: "88%",
    line1: "of intact respondents would",
    line2: "keep their son intact.",
    context: "78% of circumcised, 98% of restoring, and 91% of observer respondents would do the same.",
    color: "#68b878",
  },
  "autonomy": {
    big: "96%",
    line1: "prioritize the child's",
    line2: "right to bodily autonomy.",
    context: "A near-universal consensus across all four pathways — the rare finding where every voice agrees.",
    color: "#5b93c7",
  },
};

// Pull quotes between sections (rotate from a small curated list)
const PULL_QUOTES = [
  {
    quote: "I, at 57 years old, have never had a normal intimate relationship. The mutilation is always there.",
    attribution: "Circumcised Pathway",
    pathway: "circumcised",
  },
  {
    quote: "Only as a teen or young adult did I feel self-conscious — due to stigma from movies and pop culture.",
    attribution: "Intact Pathway",
    pathway: "intact",
  },
  {
    quote: "Every day I'm reminded of what was taken from me. Restoring is the only thing that's given me hope.",
    attribution: "Restoring Pathway",
    pathway: "restoring",
  },
];

// ── Respondent count → readable prose ─────────────────────────
// Renders META.totalRespondents as natural English prose that stays
// honest as the count grows (e.g. "over five hundred" at n=501,
// "nearly six hundred" at n=580, "over one thousand" at n=1001+).
// Rounds DOWN to nearest 100 so the phrase is always conservative.
function respondentsAsProse(n) {
  if (!n || n < 100) return "hundreds of";
  if (n >= 1000) {
    if (n < 1100) return "over one thousand";
    return `over ${n.toLocaleString()}`;
  }
  const hundred = Math.floor(n / 100) * 100;
  const words = {
    100: "one hundred",
    200: "two hundred",
    300: "three hundred",
    400: "four hundred",
    500: "five hundred",
    600: "six hundred",
    700: "seven hundred",
    800: "eight hundred",
    900: "nine hundred",
    1000: "one thousand",
  };
  const base = words[hundred] || `${hundred}`;
  // If we're within 50 of the next hundred-boundary, say "nearly X" instead
  const nextHundred = hundred + 100;
  if (nextHundred - n <= 50 && words[nextHundred]) {
    return `nearly ${words[nextHundred]}`;
  }
  return `over ${base}`;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState("curated");

  // ── Live count: fetch from /api/count on mount, fall back silently ──
  // If the Worker is up and D1 has data, this overrides the baked-in
  // META.totalRespondents and META.pathwayCounts with live numbers.
  // If it fails (Worker down, CORS issue, network error), the baked-in
  // numbers stay. No loading spinner — the site renders immediately with
  // static data and upgrades in place when live data arrives.
  const [liveNonce, setLiveNonce] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 3000); // 3s timeout

    fetch("/api/count", { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        clearTimeout(timeoutId);
        if (cancelled || !data || typeof data.total !== "number") return;
        // Mutate META in place — safe because this is our own import
        if (data.total > 0) META.totalRespondents = data.total;
        if (data.by_pathway) {
          Object.entries(data.by_pathway).forEach(([p, n]) => {
            if (META.pathwayCounts[p] !== undefined) {
              META.pathwayCounts[p] = n;
            }
            if (PATHWAY[p] !== undefined) {
              PATHWAY[p].n = n;
            }
          });
        }
        // Trigger re-render so every META.totalRespondents site refreshes
        setLiveNonce(n => n + 1);
      })
      .catch(() => {
        // Silent fallback — static numbers already rendered
        clearTimeout(timeoutId);
      });

    return () => { cancelled = true; ctrl.abort(); };
  }, []);

  const narrativeSections = useMemo(() => getNarrativeSections(), []);
  const activeSection = useActiveSection(
    view === "curated" && !activeId ? narrativeSections.map(s => s.id) : []
  );

  const handleSelect = id => {
    if (id.startsWith("section-")) {
      const sid = id.replace("section-", "");
      if (sid === "observer") setView("observer");
      else setView("curated");
      setActiveId(null);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else if (MIRROR_PAIRS.find(p => p.id === id)) {
      setView("mirror"); setActiveId(id);
    } else {
      setView("all"); setActiveId(id);
    }
    setSidebarOpen(false);
  };

  const currentQ = ALL_QUESTIONS.find(q => q.id === activeId);
  const currentM = MIRROR_PAIRS.find(p => p.id === activeId);

  const showRail = view === "curated" && !activeId;

  return (
    <div style={{
      fontFamily: "'Barlow', sans-serif",
      background: C.bg,
      color: C.pageText,
      minHeight: "100vh",
    }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onSelect={handleSelect} activeId={activeId} />
      <MethodologyModal open={methodologyOpen} onClose={() => setMethodologyOpen(false)} />

      {showRail && <NarrativeRail sections={narrativeSections} activeId={activeSection} />}

      {/* Sticky nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,12,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.pageGhost}`,
        display: "flex", alignItems: "center",
        padding: "0.7rem 1.5rem",
        gap: "0.75rem", flexWrap: "wrap",
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{
          background: "none", border: `1px solid ${C.pageGhost}`, borderRadius: 4,
          color: C.pageMuted, cursor: "pointer",
          padding: "0.4rem 0.7rem",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700, fontSize: "0.75rem",
          textTransform: "uppercase", letterSpacing: "0.12em",
          display: "flex", alignItems: "center", gap: "0.4rem",
        }}>
          <span style={{ color: C.red }}>★</span> Navigate
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, minWidth: 180 }}>
          <CircumSurveySeal size={28} />
          <a href="https://circumsurvey.online" target="_blank" rel="noreferrer" style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: C.gold,
            textDecoration: "none",
            lineHeight: 1.15,
          }}>
            The Accidental Intactivist's Inquiry
          </a>
        </div>

        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", alignItems: "center" }}>
          {[
            { id: "curated",  l: "Curated" },
            { id: "all",      l: "All Questions" },
            { id: "mirror",   l: "Mirrors" },
            { id: "observer", l: "Witnesses" },
          ].map(t => (
            <button key={t.id} onClick={() => { setView(t.id); setActiveId(null); window.scrollTo({top: 0, behavior: "smooth"}); }} style={{
              padding: "0.35rem 0.75rem",
              borderRadius: 100,
              cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.7rem",
              fontWeight: 700,
              border: view === t.id ? `1.5px solid ${C.gold}` : `1px solid ${C.pageGhost}`,
              background: view === t.id ? "rgba(212,160,48,0.12)" : "transparent",
              color: view === t.id ? C.gold : C.pageDim,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>{t.l}</button>
          ))}

          {/* Visual divider — these jump to sections within the curated view */}
          <span style={{
            width: 1, height: 16,
            background: C.pageGhost,
            margin: "0 0.2rem",
          }} />

          {/* Section jump pills — only visible/relevant in curated view */}
          {[
            { id: "section-voices",       l: "Voices",       icon: "✎" },
            { id: "section-demographics", l: "Demographics", icon: "◈" },
          ].map(s => (
            <button key={s.id} onClick={() => {
              setView("curated");
              setActiveId(null);
              setTimeout(() => {
                const el = document.getElementById(s.id);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 100);
            }} style={{
              padding: "0.35rem 0.75rem",
              borderRadius: 100,
              cursor: "pointer",
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.7rem",
              fontWeight: 600,
              border: `1px solid ${C.orangeBright}`,
              background: "rgba(240,152,96,0.08)",
              color: C.orangeBright,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}>
              <span>{s.icon}</span>
              {s.l}
            </button>
          ))}
        </div>

        <button onClick={() => setMethodologyOpen(true)} style={{
          background: "none", border: "none", color: C.pageMuted, cursor: "pointer",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "0.72rem", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.1em",
        }}>★ Methodology</button>

        <a href="https://forms.gle/FQ8o9g7j1yU3Cw7n7" target="_blank" rel="noreferrer" style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "0.7rem",
          fontWeight: 700,
          color: C.bg,
          background: C.gold,
          padding: "0.4rem 0.9rem",
          borderRadius: 3,
          textDecoration: "none",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}>Take Survey</a>
      </nav>

      {/* Cinematic Hero — only in curated mode, no activeId */}
      {view === "curated" && !activeId && (
        <div id="hero">
          <CinematicHero />
        </div>
      )}

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "2rem 1.5rem 3rem" }}>

        {activeId && currentQ && <QCard q={currentQ} />}
        {activeId && currentM && <MirrorCard pair={currentM} />}

        {view === "curated" && !activeId && (
          <>
            <div id="letter">
              <EditorsLetter />
            </div>

            {/* ═══════ SIX PATHWAYS — survey architecture, after the letter ═══════ */}
            <SixPathwaysCard />

            {CURATED_SECTIONS.map((sec, si) => {
              const interstitial = SECTION_INTERSTITIALS[sec.id];
              const pullQuote = PULL_QUOTES[si % PULL_QUOTES.length];
              return (
                <div key={sec.id}>
                  {/* Interstitial between sections (not before first) */}
                  {si > 0 && interstitial && (
                    <DevastatingNumber
                      big={interstitial.big}
                      line1={interstitial.line1}
                      line2={interstitial.line2}
                      context={interstitial.context}
                      color={interstitial.color}
                      decimals={interstitial.big.includes(".") ? 1 : 0}
                    />
                  )}

                  {/* Section title card */}
                  <SectionTitleCard
                    id={`section-${sec.id}`}
                    chapter={si + 1}
                    totalChapters={CURATED_SECTIONS.length}
                    title={sec.title}
                    subtitle={sec.desc}
                  />

                  {/* Pleasure gap hero before the cards in that section */}
                  {sec.id === "pleasure_gap" && <PleasureGapHero />}

                  {/* Section content */}
                  {sec.question_ids.map(id => {
                    const q = ALL_QUESTIONS.find(x => x.id === id);
                    const m = MIRROR_PAIRS.find(x => x.id === id);
                    if (q) return <QCard key={id} q={q} />;
                    if (m) return <MirrorCard key={id} pair={m} />;
                    return null;
                  })}

                  {/* Pull quote after section */}
                  {si < CURATED_SECTIONS.length - 1 && (
                    <PullQuoteSeparator
                      quote={pullQuote.quote}
                      attribution={pullQuote.attribution}
                      pathway={pullQuote.pathway}
                    />
                  )}
                </div>
              );
            })}

            {/* ═══════ VOICES — the narrative record, all six pathways ═══════ */}
            <VoicesSection />

            {/* ═══════ DEMOGRAPHICS EXPLORER — the outlier-parents question ═══════ */}
            <DemographicsExplorerCard />

            {/* ═══════ ACT ON THIS — from "so what?" to "so this" ═══════ */}
            <UrgentPlaintiffCard />
            <StrategicPartnersCard />
            <ResourcesCard />
            <GetInvolvedCard />
          </>
        )}

        {view === "all" && !activeId && (
          <>
            {CATS.map(cat => (
              <div key={cat} style={{ marginBottom: "2.5rem" }}>
                <SectionLabel title={cat} />
                {ALL_QUESTIONS.filter(q => q.cat === cat).map(q => <QCard key={q.id} q={q} />)}
              </div>
            ))}
          </>
        )}

        {view === "mirror" && !activeId && (
          <>
            <SectionLabel
              title="Mirror Comparisons"
              subtitle="The same conceptual question, asked from opposite pathway perspectives. Asymmetries in awareness, curiosity, resentment, and social attention."
            />
            {MIRROR_PAIRS.map(p => <MirrorCard key={p.id} pair={p} />)}
          </>
        )}

        {view === "observer" && !activeId && (
          <div id="section-observer">
            <SectionLabel title="The Witnesses" subtitle="The Observer, Partner & Ally Pathway" />
            <ObserverSection />
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ borderTop: `1px solid ${C.pageGhost}`, padding: "4rem 1.5rem", textAlign: "center" }}>
        <div style={{ height: 4, width: 180, margin: "0 auto 1.5rem", background: RAINBOW_GRAD, borderRadius: 2 }} />
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
          color: C.gold,
          marginBottom: "0.75rem",
          letterSpacing: "-0.01em",
        }}>Add Your Voice</div>
        <p style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: TYPE.body,
          color: C.pageMuted,
          maxWidth: 480,
          margin: "0 auto 2rem",
          lineHeight: 1.6,
        }}>Every perspective strengthens this dataset. 30–90 minutes, fully anonymous, every question optional.</p>
        <a href="https://forms.gle/FQ8o9g7j1yU3Cw7n7" target="_blank" rel="noreferrer" style={{
          display: "inline-block",
          padding: "0.9rem 2.4rem",
          background: C.gold,
          color: C.bg,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          textDecoration: "none",
          borderRadius: 3,
          fontSize: "1rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}>★ Take the Survey</a>
      </div>

      {/* Footer */}
      <footer style={{
        padding: "2.5rem 1.5rem",
        textAlign: "center",
        fontFamily: "'Barlow', sans-serif",
        fontSize: TYPE.bodySmall,
        color: C.pageDim,
        borderTop: `1px solid ${C.pageGhost}`,
        lineHeight: 2,
      }}>
        <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
          <CircumSurveySeal size={96} />
        </div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "0.95rem",
          color: C.gold,
          marginBottom: "0.5rem",
        }}>The Accidental Intactivist's Inquiry</div>
        <a href="https://circumsurvey.online" style={{ color: C.gold, textDecoration: "none" }}>circumsurvey.online</a> · {META.phase} · n = {META.totalRespondents}
        <br />By Tone Pettit · <a href="mailto:tone@circumsurvey.online" style={{ color: C.gold, textDecoration: "none" }}>tone@circumsurvey.online</a>
        <br />
        <a href="https://circumsurvey.online/about" target="_blank" rel="noreferrer" style={{ color: C.pageMuted, textDecoration: "none" }}>Methodology</a>
        {" · "}
        <a href="https://theaccidentalintactivist.substack.com" target="_blank" rel="noreferrer" style={{ color: C.pageMuted, textDecoration: "none" }}>Substack</a>
        {" · "}
        <a href="https://coff.ee/accidental.intactivist" target="_blank" rel="noreferrer" style={{ color: C.pageMuted, textDecoration: "none" }}>Support</a>
        <br />
        <span style={{ fontSize: "0.75rem", color: C.pageMuted }}>
          Strategic partners: <a href="https://doctorsopposingcircumcision.org" target="_blank" rel="noreferrer" style={{ color: C.pageMuted }}>DOC</a>
          {" · "}<a href="https://intactglobal.org" target="_blank" rel="noreferrer" style={{ color: C.pageMuted }}>Intact Global</a>
          {" · "}<a href="https://galdef.org" target="_blank" rel="noreferrer" style={{ color: C.pageMuted }}>GALDEF</a>
          {" · "}<a href="https://wibm.us" target="_blank" rel="noreferrer" style={{ color: C.pageMuted }}>WIBM</a>
        </span>
        <br />
        <span style={{ fontSize: "0.72rem", color: C.red, fontWeight: 600, letterSpacing: "0.02em" }}>
          ★ WA plaintiff search (Equal Protection lawsuit):{" "}
          <a href="mailto:plaintiff@circumsurvey.online" style={{ color: C.red, textDecoration: "underline" }}>plaintiff@circumsurvey.online</a>
        </span>
      </footer>
    </div>
  );
}
