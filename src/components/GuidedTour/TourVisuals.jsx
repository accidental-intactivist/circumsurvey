// ═══════════════════════════════════════════════════════════════════════════
// Guided Tour visuals — theme-token SVG renditions of the exhibits'
// signature charts (flowchart, atlas, dumbbell separation, sankey, mirrors).
// All colors are CSS custom properties → theme/mode/colorblind reactive.
// ═══════════════════════════════════════════════════════════════════════════
import React, { useEffect, useRef, useState } from "react";
import { C, FONT } from "../../explore/styles/tokens";
import {
  PATHS, PLEASURE_METRICS, pooledMean, SANKEY,
  ATLAS_ROWS, ATLAS_REGIONS, RESENTMENT_MIRROR,
  MIRROR_PAIR_DATA,
} from "./tourData";
import { useInView, CountUp, EXPLORE_BASE } from "./tourKit";
import { useLegibleColor } from "../../explore/lib/colorUtils";
import { Heart, Circle, Activity, Users, HelpCircle, BookOpen, ArrowRight, AlertTriangle, Grid } from "lucide-react";
import CorrelationExplorerPage from "../../explore/pages/CorrelationExplorerPage";
import MultiSankeyChart from "../../explore/components/MultiSankeyChart";
import { RESTORATION_COLOR_MAP, RATING_QUESTIONS, RCI_DEFINITIONS } from "../../explore/pages/RestorationJourneyPage";
import { getQuestions } from "../../explore/lib/api";

const ICON_MAP = { Heart, Circle, Activity, Users, HelpCircle, BookOpen, AlertTriangle };

const mono = { fontFamily: FONT.mono };
const disp = { fontFamily: FONT.display };

// ── Exhibit 01: Survey Map flowchart with traveling respondent dots ────────
export function SurveyFlowchart() {
  const svgRef = useRef(null);
  const [ref, seen] = useInView(0.15);
  const paths = [
    { d: "M380,54 L380,96",                       col: C.gold },
    { d: "M380,144 L380,178",                     col: C.gold },
    { d: "M310,240 C180,265 95,280 95,316",       col: PATHS.intact.color },
    { d: "M355,258 C330,285 285,290 285,316",     col: PATHS.circumcised.color },
    { d: "M405,258 C430,285 475,290 475,316",     col: PATHS.restoring.color },
    { d: "M450,240 C580,265 665,280 665,316",     col: PATHS.observer.color },
  ];
  // traveling dots along the connector paths
  useEffect(() => {
    if (!seen) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const svg = svgRef.current;
    if (!svg) return;
    const els = Array.from(svg.querySelectorAll("path[data-flow]"));
    const dots = Array.from(svg.querySelectorAll("circle[data-dot]")).map((el, i) => ({
      el, p: els[[0, 1, 2, 3, 4, 5, 2, 4][i % 8]], off: Math.random(), speed: 0.0022 + Math.random() * 0.0012,
    }));
    let raf, running = true;
    const tick = () => {
      if (!running) return;
      dots.forEach((dt) => {
        dt.off += dt.speed; if (dt.off > 1) dt.off = 0;
        const len = dt.p.getTotalLength();
        const pt = dt.p.getPointAtLength(dt.off * len);
        dt.el.setAttribute("cx", pt.x); dt.el.setAttribute("cy", pt.y);
        dt.el.setAttribute("opacity", Math.sin(dt.off * Math.PI) * 0.9);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(raf); };
  }, [seen]);

  const Box = ({ x, y, w, h, col, l1, l2 }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} style={{ fill: C.bgCard, stroke: col, strokeWidth: 1.6 }} />
      <text x={x + w / 2} y={y + (l2 ? h / 2 - 4 : h / 2 + 4)} textAnchor="middle"
        style={{ ...disp, fontSize: 12, fontWeight: 700, fill: "var(--c-text)" }}>{l1}</text>
      {l2 && <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle"
        style={{ fontFamily: FONT.body, fontSize: 9.5, fill: "var(--c-muted)" }}>{l2}</text>}
    </g>
  );
  const P = [
    { x: 20,  col: PATHS.intact.color,      n: "INTACT",      c: `n = ${PATHS.intact.n}` },
    { x: 210, col: PATHS.circumcised.color, n: "CIRCUMCISED", c: `n = ${PATHS.circumcised.n}` },
    { x: 400, col: PATHS.restoring.color,   n: "RESTORING",   c: `n = ${PATHS.restoring.n}` },
    { x: 590, col: PATHS.observer.color,    n: "OBSERVER",    c: `n = ${PATHS.observer.n}` },
  ];
  return (
    <div ref={ref}>
      <svg ref={svgRef} viewBox="0 0 760 430" width="100%" role="img"
        aria-label="Flowchart: 500 respondents pass universal questions, reach the pathway fork, and divide into four pathways.">
        {paths.map((p, i) => (
          <path key={i} data-flow d={p.d} style={{ stroke: p.col, strokeWidth: 1.8, fill: "none", strokeLinecap: "round" }} />
        ))}
        <Box x={290} y={12} w={180} h={42} col={C.goldBright} l1="500 RESPONDENTS" l2="one anonymous door in" />
        <Box x={240} y={96} w={280} h={48} col={C.orange} l1="UNIVERSAL QUESTIONS" l2="experience asked BEFORE status" />
        <path d="M380,178 L490,222 L380,266 L270,222 Z" style={{ fill: C.bgCard, stroke: C.red, strokeWidth: 2 }} />
        <text x={380} y={216} textAnchor="middle" style={{ ...disp, fontSize: 13, fontWeight: 700, fill: "var(--c-red)" }}>THE FORK</text>
        <text x={380} y={232} textAnchor="middle" style={{ fontFamily: FONT.body, fontSize: 9.5, fill: "var(--c-muted)" }}>what is your status?</text>
        {P.map((p) => <Box key={p.n} x={p.x} y={316} w={150} h={50} col={p.col} l1={p.n} l2={p.c} />)}
        {[...Array(8)].map((_, i) => <circle key={i} data-dot r={3.2} opacity={0}
          style={{ fill: [C.gold, C.gold, PATHS.intact.color, PATHS.circumcised.color, PATHS.restoring.color, PATHS.observer.color, PATHS.intact.color, PATHS.restoring.color][i] }} />)}
        <text x={380} y={398} textAnchor="middle" style={{ ...mono, fontSize: 10, fontWeight: 600, fill: "var(--c-dim)" }}>
          355 QUESTIONS ACROSS ALL PATHWAYS — EVERY ONE PHRASED FOR THE LIFE THAT ANSWERS IT
        </text>
      </svg>
    </div>
  );
}

// ── Exhibit 05: punch-card atlas ───────────────────────────────────────────
export function PunchCardAtlas() {
  const [ref, seen] = useInView();
  const dots = [];
  ATLAS_ROWS.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      const reg = ATLAS_REGIONS[row[rx]];
      if (reg) dots.push({ x: 8 + rx * 9, y: 10 + ry * 9, reg, delay: rx * 14 });
    }
  });
  const legend = Object.values(ATLAS_REGIONS).sort((a, b) => b.n - a.n);
  return (
    <div ref={ref}>
      <svg viewBox="0 0 580 200" width="100%" role="img"
        aria-label="Dot-matrix world map showing respondent origins concentrated in North America.">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={3.1}
            style={{
              fill: d.reg.colorVar, fillOpacity: d.reg.a,
              opacity: seen ? 1 : 0, transition: `opacity .5s ease ${d.delay}ms`,
            }} />
        ))}
      </svg>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginTop: "0.8rem" }}>
        {legend.map((r) => (
          <span key={r.name} style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.66rem",
            letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted,
          }}>
            <i style={{ width: 9, height: 9, borderRadius: "50%", background: r.colorVar, display: "inline-block" }} />
            {r.name} <b style={mono}>{r.n}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Exhibit 03: dumbbell separation (dots slide from pooled → pathway) ─────
export function DumbbellSeparation() {
  const [ref, seen] = useInView(0.25);
  const X0 = 210, X1 = 830, YT = 44, RH = 56;
  const gx = (v) => X0 + ((Math.max(1, Math.min(5, v)) - 1) / 4) * (X1 - X0);
  return (
    <div ref={ref}>
      <svg viewBox="0 0 860 400" width="100%" role="img"
        aria-label="Dumbbell chart: intact respondents rate 4.0-4.5 across six metrics while circumcised rate 2.0-3.0.">
        {[1, 2, 3, 4, 5].map((t) => (
          <g key={t}>
            <line x1={gx(t)} y1={YT - 16} x2={gx(t)} y2={YT + PLEASURE_METRICS.length * RH}
              style={{ stroke: C.ghost, strokeWidth: 1, strokeDasharray: "3 3" }} />
            <text x={gx(t)} y={YT - 24} textAnchor="middle" style={{ ...mono, fontSize: 12, fontWeight: 600, fill: "var(--c-muted)" }}>{t}.0</text>
          </g>
        ))}
        {PLEASURE_METRICS.map((q, i) => {
          const y = YT + i * RH + RH / 2;
          const pool = pooledMean(q);
          const dots = [
            { v: q.circumcised, col: PATHS.circumcised.color, r: 7 },
            { v: q.restoring,   col: PATHS.restoring.color,   r: 5.5 },
            { v: q.intact,      col: PATHS.intact.color,      r: 7 },
          ];
          return (
            <g key={q.label}>
              <text x={X0 - 22} y={y + 4} textAnchor="end"
                style={{ ...disp, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", fill: "var(--c-text)" }}>
                {q.label}
              </text>
              <line x1={gx(1)} y1={y} x2={gx(5)} y2={y} style={{ stroke: "rgba(255,255,255,.06)", strokeWidth: 6, strokeLinecap: "round" }} />
              <line x1={gx(q.circumcised)} y1={y} x2={gx(q.intact)} y2={y}
                style={{ stroke: C.red, strokeWidth: 2, strokeDasharray: "5 4", opacity: seen ? 1 : 0, transition: "opacity .6s ease 1.1s" }} />
              <text x={gx(q.circumcised)} y={y - 13} textAnchor="middle"
                style={{ ...mono, fontSize: 11, fontWeight: 700, fill: PATHS.circumcised.color, opacity: seen ? 1 : 0, transition: "opacity .6s ease 1.1s" }}>
                {q.circumcised.toFixed(2)}
              </text>
              <text x={gx(q.intact)} y={y - 13} textAnchor="middle"
                style={{ ...mono, fontSize: 11, fontWeight: 700, fill: PATHS.intact.color, opacity: seen ? 1 : 0, transition: "opacity .6s ease 1.1s" }}>
                {q.intact.toFixed(2)}
              </text>
              {dots.map((d, si) => (
                <circle key={si} cx={gx(d.v)} cy={y} r={d.r}
                  style={{
                    fill: d.col, stroke: "var(--c-bgDeep)", strokeWidth: 1.5,
                    transform: seen ? "none" : `translateX(${(gx(pool) - gx(d.v)).toFixed(1)}px)`,
                    transition: `transform 1.3s cubic-bezier(.25,.8,.3,1) ${(i * 0.08 + si * 0.05).toFixed(2)}s`,
                  }} />
              ))}
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: "1.1rem", flexWrap: "wrap", justifyContent: "center" }}>
        {[["Intact", PATHS.intact.color], ["Restoring", PATHS.restoring.color], ["Circumcised", PATHS.circumcised.color]].map(([l, c]) => (
          <span key={l} style={{
            display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: FONT.condensed,
            fontWeight: 600, fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted,
          }}>
            <i style={{ width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Exhibit 14: convergence sankey ─────────────────────────────────────────
export function ConvergenceSankey() {
  const [ref, seen] = useInView(0.2);
  const SC = 0.62, GAP = 14, LX = 150, RX = 610, NW = 20, TOP = 34;
  const L = SANKEY.left.map((n) => ({ ...n, color: PATHS[n.key].color }));
  const R = SANKEY.right.map((n) => ({ ...n }));
  let y = TOP; L.forEach((nd) => { nd.y = y; nd.h = nd.n * SC; nd.off = 0; y += nd.h + GAP; });
  y = TOP + 14; R.forEach((nd) => { nd.y = y; nd.h = nd.n * SC; nd.off = 0; y += nd.h + GAP + 8; });
  const flows = SANKEY.flows.map((f, fi) => {
    const a = L[f.l], b = R[f.r], h = f.n * SC;
    const y0 = a.y + a.off, y1 = b.y + b.off;
    a.off += h; b.off += h;
    const x0 = LX + NW, x1 = RX, mid = (x0 + x1) / 2;
    return {
      key: fi, col: a.color, delay: fi * 0.1,
      d: `M${x0},${y0} C${mid},${y0} ${mid},${y1} ${x1},${y1} L${x1},${y1 + h} C${mid},${y1 + h} ${mid},${y0 + h} ${x0},${y0 + h} Z`,
    };
  });
  return (
    <div ref={ref}>
      <svg viewBox="0 0 780 420" width="100%" role="img"
        aria-label="Sankey: ribbons from all four pathways flow overwhelmingly into keep intact — 433 of 500.">
        {flows.map((f) => (
          <path key={f.key} d={f.d}
            style={{ fill: f.col, fillOpacity: 0.35, opacity: seen ? 1 : 0, transition: `opacity 1s ease ${f.delay}s` }} />
        ))}
        {L.map((nd) => (
          <g key={nd.key}>
            <rect x={LX} y={nd.y} width={NW} height={nd.h} rx={2} style={{ fill: nd.color }} />
            <text x={LX - 10} y={nd.y + nd.h / 2 + 1} textAnchor="end"
              style={{ ...disp, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", fill: "var(--c-text)" }}>{nd.name}</text>
            <text x={LX - 10} y={nd.y + nd.h / 2 + 14} textAnchor="end"
              style={{ ...mono, fontSize: 9.5, fill: "var(--c-muted)" }}>n = {nd.n}</text>
          </g>
        ))}
        {R.map((nd) => (
          <g key={nd.key}>
            <rect x={RX} y={nd.y} width={NW} height={nd.h} rx={2} style={{ fill: nd.colorVar }} />
            <text x={RX + NW + 10} y={nd.y + Math.max(nd.h / 2, 9) + 1}
              style={{ ...disp, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", fill: "var(--c-text)" }}>{nd.name}</text>
            <text x={RX + NW + 10} y={nd.y + Math.max(nd.h / 2, 9) + 14}
              style={{ ...mono, fontSize: 9.5, fill: "var(--c-muted)" }}>{nd.n} of 500</text>
          </g>
        ))}
        <text x={(LX + RX) / 2} y={410} textAnchor="middle" style={{ ...mono, fontSize: 10, fontWeight: 600, fill: "var(--c-dim)" }}>
          "IF YOU HAD A SON TODAY" — RIBBON WIDTH = RESPONDENTS
        </text>
      </svg>
    </div>
  );
}

// ── Exhibit 06: word mirrors ───────────────────────────────────────────────
export function WordMirrors({ wordsCirc, wordsIntact }) {
  const [ref, seen] = useInView();
  const Panel = ({ words, colorVar, title, tint }) => (
    <div style={{ flex: 1, minWidth: 250, padding: "1.2rem 1.4rem", textAlign: "center", background: tint }}>
      <div style={{
        fontFamily: FONT.display, fontWeight: 700, fontSize: "0.74rem", letterSpacing: "0.12em",
        textTransform: "uppercase", marginBottom: "0.7rem", color: colorVar,
        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
      }}>
        <i style={{ width: 9, height: 9, borderRadius: "50%", background: colorVar, display: "inline-block" }} />{title}
      </div>
      {words.map(([w, wt], i) => (
        <span key={w} style={{
          display: "inline-block", fontFamily: FONT.display, lineHeight: 1.35, margin: "0.05rem 0.35rem",
          fontSize: `${(0.68 + wt * 0.82).toFixed(2)}rem`, fontWeight: wt > 0.8 ? 700 : 500, color: colorVar,
          opacity: seen ? 1 : 0, transform: seen ? "none" : "translateY(6px)",
          transition: `opacity .6s ease ${i * 70}ms, transform .6s ease ${i * 70}ms`,
        }}>
          {w}
        </span>
      ))}
    </div>
  );
  return (
    <div ref={ref} style={{ display: "flex", flexWrap: "wrap" }}>
      <Panel words={wordsCirc} colorVar={PATHS.circumcised.color} title="Circumcised, in their words"
        tint="color-mix(in srgb, var(--path-circumcised) 4%, transparent)" />
      <Panel words={wordsIntact} colorVar={PATHS.intact.color} title="Intact, in their words"
        tint="color-mix(in srgb, var(--path-intact) 4%, transparent)" />
    </div>
  );
}

// ── Exhibit 02: resentment/regret mirror ───────────────────────────────────
export function ResentmentMirror() {
  const [ref, seen] = useInView();
  const Side = ({ data, pathway }) => (
    <div style={{
      flex: 1, minWidth: 250, padding: "1.4rem",
      background: `color-mix(in srgb, ${PATHS[pathway].color} 4%, transparent)`,
    }}>
      <div style={{
        fontFamily: FONT.display, fontWeight: 700, fontSize: "0.78rem", marginBottom: "0.15rem",
        color: PATHS[pathway].color, display: "flex", alignItems: "center", gap: "0.4rem",
      }}>
        <i style={{ width: 9, height: 9, borderRadius: "50%", background: PATHS[pathway].color, display: "inline-block" }} />
        The {PATHS[pathway].label} Pathway
      </div>
      <div style={{ fontFamily: FONT.body, fontWeight: 300, fontSize: "0.74rem", color: C.muted, fontStyle: "italic", margin: "0 0 0.7rem", lineHeight: 1.45 }}>
        {data.question}
      </div>
      {data.rows.map((r) => (
        <div key={r.label} style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.32rem" }}>
          <div style={{ flex: 1, height: 14, background: "rgba(255,255,255,.06)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3, background: r.colorVar,
              width: seen ? `${r.pct}%` : 0, transition: "width .9s cubic-bezier(.25,.8,.3,1)",
              display: "flex", alignItems: "center", paddingLeft: 4,
              fontFamily: FONT.mono, fontSize: "0.48rem", fontWeight: 700, color: "rgba(0,0,0,.55)",
            }}>
              {r.pct > 40 ? `${Math.round(r.pct)}%` : ""}
            </div>
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: "0.62rem", color: C.muted, width: 92, flexShrink: 0 }}>{r.label}</div>
          <div style={{ fontFamily: FONT.mono, fontSize: "0.62rem", fontWeight: 700, color: C.text, width: 40, textAlign: "right", flexShrink: 0 }}>{r.pct}%</div>
        </div>
      ))}
    </div>
  );
  return (
    <div ref={ref} style={{ display: "flex", flexWrap: "wrap" }}>
      <Side data={RESENTMENT_MIRROR.circumcised} pathway="circumcised" />
      <Side data={RESENTMENT_MIRROR.intact} pathway="intact" />
    </div>
  );
}

// ── MirrorPairToggle: interactive toggle for curated mirror pairs ───────────
const PAIR_ORDER = ["resentment", "curiosity", "advantages", "triggers", "thought_level"];

export function MirrorPairToggle() {
  const [active, setActive] = useState("resentment");
  const [ref, seen] = useInView();
  const pair = MIRROR_PAIR_DATA[active];
  
  // Calculate a legible color for the white text against the gold active background
  const activeTextColor = useLegibleColor("#ffffff", "var(--c-gold)", 4.5);

  // Check if both sides share the same row labels → butterfly layout
  const circLabels = pair.circumcised.rows.map(r => r.label);
  const intactLabels = pair.intact.rows.map(r => r.label);
  const labelsMatch = circLabels.length === intactLabels.length && circLabels.every((l, i) => l === intactLabels[i]);

  const Side = ({ data, pathway }) => (
    <div style={{
      flex: 1, minWidth: 250, padding: "1.4rem",
      background: `color-mix(in srgb, ${PATHS[pathway].color} 4%, transparent)`,
    }}>
      <div style={{
        fontFamily: FONT.display, fontWeight: 700, fontSize: "0.78rem", marginBottom: "0.15rem",
        color: PATHS[pathway].color, display: "flex", alignItems: "center", gap: "0.4rem",
      }}>
        <i style={{ width: 9, height: 9, borderRadius: "50%", background: PATHS[pathway].color, display: "inline-block" }} />
        The {PATHS[pathway].label} Pathway
      </div>
      <div style={{ fontFamily: FONT.body, fontWeight: 300, fontSize: "0.74rem", color: C.muted, fontStyle: "italic", margin: "0 0 0.7rem", lineHeight: 1.45 }}>
        {data.question}
      </div>
      {data.rows.map((r) => (
        <div key={r.label} style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.32rem" }}>
          <div style={{ flex: 1, height: 14, background: "rgba(255,255,255,.06)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3, background: r.colorVar,
              width: seen ? `${r.pct}%` : 0, transition: "width .9s cubic-bezier(.25,.8,.3,1)",
              display: "flex", alignItems: "center", paddingLeft: 4,
              fontFamily: FONT.mono, fontSize: "0.48rem", fontWeight: 700, color: "rgba(0,0,0,.55)",
            }}>
              {r.pct > 40 ? `${Math.round(r.pct)}%` : ""}
            </div>
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: "0.62rem", color: C.muted, width: 110, flexShrink: 0 }}>{r.label}</div>
          <div style={{ fontFamily: FONT.mono, fontSize: "0.62rem", fontWeight: 700, color: C.text, width: 40, textAlign: "right", flexShrink: 0 }}>{r.pct}%</div>
        </div>
      ))}
    </div>
  );

  // Build butterfly rows from matching data
  const butterflyRows = labelsMatch
    ? circLabels.map((label, i) => ({
        label,
        circPct: pair.circumcised.rows[i].pct,
        intactPct: pair.intact.rows[i].pct,
      }))
    : [];

  return (
    <div ref={ref}>
      {/* Toggle buttons */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "0.4rem",
        marginBottom: "1rem", justifyContent: "center",
      }}>
        {PAIR_ORDER.map((key) => {
          const p = MIRROR_PAIR_DATA[key];
          const isActive = active === key;
          return (
            <button key={key} onClick={() => setActive(key)} style={{
              fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.62rem",
              letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: "pointer", border: "none", borderRadius: 100,
              padding: "0.4rem 0.85rem",
              color: isActive ? activeTextColor : C.muted,
              background: isActive ? "var(--c-gold)" : "rgba(255,255,255,0.06)",
              transition: "all .2s ease",
              transform: isActive ? "scale(1.05)" : "none",
              boxShadow: isActive ? "0 2px 8px rgba(212,160,48,0.3)" : "none",
            }}>
              {p.concept}
            </button>
          );
        })}
      </div>

      {/* Mirror display — butterfly if labels match, dual-panel otherwise */}
      <div key={active} style={{ animation: "fadeSlideIn 0.35s ease" }}>
        {labelsMatch ? (
          <div>
            <TourButterflyChart
              rows={butterflyRows}
              intactLabel="Intact"
              circLabel="Circumcised"
              subtitles={{ intact: pair.intact.question, circumcised: pair.circumcised.question }}
            />
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Side data={pair.circumcised} pathway="circumcised" />
            <Side data={pair.intact} pathway="intact" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export function ProjectionGate({ onPredict, predicted }) {
  const [choice, setChoice] = useState(null);
  
  const blindBtnStyle = {
    fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.08em",
    textTransform: "uppercase", cursor: "pointer",
    color: C.text, background: "transparent",
    border: `1px solid ${C.dim}`, borderRadius: 100, padding: "0.5rem 1.4rem",
    transition: "all .15s ease",
  };

  return (
    <div style={{ padding: "1rem 0 0" }}>
      <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
        {/* GROUP A */}
        <div style={{ flex: 1, minWidth: 200, maxWidth: 240, background: "rgba(255,255,255,0.02)", border: `1px solid ${C.ghost}`, borderRadius: 8, padding: "1.5rem", textAlign: "center" }}>
          <div style={{ fontFamily: FONT.display, fontSize: "0.8rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            {predicted ? "Intact Cohort" : "Group A"}
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: "2.4rem", fontWeight: 700, color: predicted ? PATHS.intact.color : C.textBright, transition: "color 0.4s ease" }}>
            3.7
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: "0.75rem", color: C.dim, marginTop: "0.2rem" }}>out of 5</div>
        </div>

        {/* GROUP B */}
        <div style={{ flex: 1, minWidth: 200, maxWidth: 240, background: "rgba(255,255,255,0.02)", border: `1px solid ${C.ghost}`, borderRadius: 8, padding: "1.5rem", textAlign: "center" }}>
          <div style={{ fontFamily: FONT.display, fontSize: "0.8rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            {predicted ? "Circumcised Cohort" : "Group B"}
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: "2.4rem", fontWeight: 700, color: predicted ? PATHS.circumcised.color : C.textBright, transition: "color 0.4s ease" }}>
            2.6
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: "0.75rem", color: C.dim, marginTop: "0.2rem" }}>out of 5</div>
        </div>
      </div>

      {!predicted ? (
        <div style={{ textAlign: "center" }}>
          <h3 style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.05em", textTransform: "uppercase", color: C.text, margin: "0 0 1rem" }}>
            Based on these reports, which group is Circumcised?
          </h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => { setChoice('A'); onPredict('A'); }} style={blindBtnStyle} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.target.style.background = 'transparent'}>Group A</button>
            <button onClick={() => { setChoice('B'); onPredict('B'); }} style={blindBtnStyle} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.target.style.background = 'transparent'}>Group B</button>
            <button onClick={() => { setChoice('neither'); onPredict('neither'); }} style={blindBtnStyle} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.target.style.background = 'transparent'}>I can't tell</button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", marginTop: "1rem", fontFamily: FONT.mono, fontSize: "0.65rem", color: C.goldBright, letterSpacing: "0.1em" }}>
          DATA UNSEALED · THE DEMONSTRATION BELOW IS NOW OPEN
        </div>
      )}
    </div>
  );
}

// ── CuratedInsightsToggle ──────────────────────────────────────────────────
export function CuratedInsightsToggle() {
  const [activeIdx, setActiveIdx] = useState(0);

  const INSIGHTS = [
    { id: "sex-vs-regret", label: "Sexuality to Pathway to Regret", mode: "flow", x: "sexuality", y: "pathway", z: "aggregate_regret" },
    { id: "soc-vs-pathway", label: "Socioeconomics vs. Pathway", mode: "pairwise", x: "socioeconomic", y: "pathway" },
    { id: "pol-vs-norms", label: "Politics vs. Social Norms", mode: "pairwise", x: "political_identity", y: "final_social_norm_perception" },
    { id: "gen-trad-path", label: "Generation to Tradition to Pathway", mode: "flow", x: "generation", y: "primary_tradition", z: "pathway" },
    { id: "trad-path-regret", label: "Tradition to Pathway to Regret", mode: "flow", x: "primary_tradition", y: "pathway", z: "aggregate_regret" },
    { id: "upb-path-pride", label: "Upbringing to Pathway to Pride", mode: "flow", x: "family_upbringing", y: "pathway", z: "exp_pride_satisfaction_rating" },
    { id: "sex-path-lube", label: "Sexuality to Pathway to Lubrication", mode: "flow", x: "sexuality", y: "pathway", z: "exp_lubrication_need" },
  ];

  const activeInsight = INSIGHTS[activeIdx];
  const activeTextColor = useLegibleColor("#ffffff", "var(--c-gold)", 4.5);

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div style={{ fontFamily: FONT.display, fontSize: "0.85rem", fontWeight: 700, color: C.textBright, marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Grid size={16} color={C.gold} />
        Curated Insights
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        {INSIGHTS.map((insight, idx) => (
          <button
            key={insight.id}
            onClick={() => setActiveIdx(idx)}
            style={{
              fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.62rem",
              letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: "pointer", border: "none", borderRadius: 100,
              padding: "0.4rem 0.85rem",
              color: activeIdx === idx ? activeTextColor : C.muted,
              background: activeIdx === idx ? "var(--c-gold)" : "rgba(255,255,255,0.06)",
              transition: "all .2s ease",
              transform: activeIdx === idx ? "scale(1.05)" : "none",
              boxShadow: activeIdx === idx ? "0 2px 8px rgba(212,160,48,0.3)" : "none",
            }}
            onMouseEnter={e => { 
              if (activeIdx !== idx) {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = C.text;
              }
            }}
            onMouseLeave={e => { 
              if (activeIdx !== idx) {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = C.muted;
              }
            }}
          >
            {insight.label}
          </button>
        ))}
      </div>
      
      <div style={{ 
        background: "rgba(0,0,0,0.2)", 
        border: `1px solid ${C.dim}`, 
        borderRadius: 8, 
        padding: "0.5rem", 
        minHeight: 480, 
        position: "relative" 
      }}>
        <CorrelationExplorerPage inlineMode={true} inlineConfig={activeInsight} />
      </div>
    </div>
  );
}

// ── Compact butterfly chart for the tour ──────────────────────────────────
export function TourButterflyChart({ rows, title, intactLabel = "Intact", circLabel = "Circumcised", intactN, circN, subtitles }) {
  const maxPct = Math.max(...rows.flatMap(r => [r.intactPct, r.circPct]), 1);
  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.bgCard} 0%, color-mix(in srgb, ${C.bgCard} 85%, ${PATHS.intact.color}) 100%)`,
      border: `2px solid ${C.ghost}`,
      borderRadius: 12, padding: "1.4rem 1.8rem", marginTop: "1.1rem",
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.15)`,
    }}>
      {title && (
        <div style={{ fontFamily: FONT.condensed, fontWeight: 800, fontSize: "1rem", color: C.textBright,
          textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center", marginBottom: "1.2rem" }}>
          {title}
        </div>
      )}
      {subtitles && (
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180, textAlign: "right" }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "0.72rem", color: PATHS.intact.color, display: "flex", alignItems: "center", gap: "0.35rem", justifyContent: "flex-end", marginBottom: "0.15rem" }}>
              <i style={{ width: 8, height: 8, borderRadius: "50%", background: PATHS.intact.color, display: "inline-block" }} />
              Intact
            </div>
            <div style={{ fontFamily: FONT.body, fontSize: "0.7rem", color: C.muted, fontStyle: "italic", lineHeight: 1.4 }}>
              "{subtitles.intact}"
            </div>
          </div>
          <div style={{ width: 150, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 180, textAlign: "left" }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "0.72rem", color: PATHS.circumcised.color, display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.15rem" }}>
              <i style={{ width: 8, height: 8, borderRadius: "50%", background: PATHS.circumcised.color, display: "inline-block" }} />
              Circumcised
            </div>
            <div style={{ fontFamily: FONT.body, fontSize: "0.7rem", color: C.muted, fontStyle: "italic", lineHeight: 1.4 }}>
              "{subtitles.circumcised}"
            </div>
          </div>
        </div>
      )}
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ flex: 1, textAlign: "right", fontFamily: FONT.condensed, fontWeight: 800, fontSize: "0.8rem",
          color: PATHS.intact.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {intactLabel}{intactN ? ` (N=${intactN})` : ""}
        </div>
        <div style={{ width: 150, textAlign: "center", fontFamily: FONT.mono, fontSize: "0.65rem", color: C.muted, fontWeight: 700 }}>
          ← vs →
        </div>
        <div style={{ flex: 1, textAlign: "left", fontFamily: FONT.condensed, fontWeight: 800, fontSize: "0.8rem",
          color: PATHS.circumcised.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {circLabel}{circN ? ` (N=${circN})` : ""}
        </div>
      </div>
      {/* Data rows */}
      {rows.map((row) => (
        <div key={row.label} style={{ display: "flex", alignItems: "center", marginBottom: "0.45rem", minHeight: 30 }}>
          {/* Intact bar (grows right-to-left) */}
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontFamily: FONT.mono, fontSize: "0.8rem", fontWeight: 700, color: PATHS.intact.color, flexShrink: 0 }}>
              {row.intactPct.toFixed(1)}%
            </span>
            <div style={{ width: `${(row.intactPct / maxPct) * 100}%`, height: 22, borderRadius: "4px 0 0 4px",
              background: PATHS.intact.color,
              boxShadow: `0 2px 6px color-mix(in srgb, ${PATHS.intact.color} 40%, transparent)`,
              transition: "width 0.6s ease", minWidth: row.intactPct > 0 ? 4 : 0,
            }} />
          </div>
          {/* Center label */}
          <div style={{ width: 150, textAlign: "center", fontFamily: FONT.condensed, fontWeight: 700,
            fontSize: "0.85rem", color: C.textBright, textTransform: "uppercase", letterSpacing: "0.04em",
            lineHeight: 1.2, flexShrink: 0, padding: "0 0.2rem",
          }}>
            {row.label}
          </div>
          {/* Circumcised bar (grows left-to-right) */}
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: `${(row.circPct / maxPct) * 100}%`, height: 22, borderRadius: "0 4px 4px 0",
              background: PATHS.circumcised.color,
              boxShadow: `0 2px 6px color-mix(in srgb, ${PATHS.circumcised.color} 40%, transparent)`,
              transition: "width 0.6s ease", minWidth: row.circPct > 0 ? 4 : 0,
            }} />
            <span style={{ fontFamily: FONT.mono, fontSize: "0.8rem", fontWeight: 700, color: PATHS.circumcised.color, flexShrink: 0 }}>
              {row.circPct.toFixed(1)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Compact Generational Shift Stacked Bar Chart for the tour ─────────────
export function GenerationalShiftChart({ data }) {
  // Colors for the 5 satisfaction states (from green to red)
  const colors = {
    proud: "#2e7d32",
    somewhatProud: "#66bb6a",
    neutral: "var(--c-dim)",
    somewhatDissatisfied: "#e57373",
    dissatisfied: "#c62828"
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)",
      border: `1px solid ${C.ghost}`,
      borderRadius: 10, padding: "1.2rem 1.2rem", marginTop: "1.1rem",
    }}>
      <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.68rem", color: C.gold,
        textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", marginBottom: "0.4rem" }}>
        Circumcised Satisfaction By Generation
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.mono, fontSize: "0.5rem", color: C.dim, textTransform: "uppercase", marginBottom: "1.2rem" }}>
        <span>← Proud & Satisfied</span>
        <span>Dissatisfied →</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {data.map((row) => (
          <div key={row.gen} style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <div style={{ width: 65, textAlign: "right", fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.6rem", color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {row.gen}
            </div>
            
            <div style={{ flex: 1, display: "flex", height: 16, borderRadius: 4, overflow: "hidden", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ width: `${row.proud}%`, background: colors.proud }} title={`Very Proud: ${row.proud}%`} />
              <div style={{ width: `${row.somewhatProud}%`, background: colors.somewhatProud }} title={`Generally Proud: ${row.somewhatProud}%`} />
              <div style={{ width: `${row.neutral}%`, background: colors.neutral }} title={`Neutral: ${row.neutral}%`} />
              <div style={{ width: `${row.somewhatDissatisfied}%`, background: colors.somewhatDissatisfied }} title={`Somewhat Dissatisfied: ${row.somewhatDissatisfied}%`} />
              <div style={{ width: `${row.dissatisfied}%`, background: colors.dissatisfied }} title={`Very Dissatisfied: ${row.dissatisfied}%`} />
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1.2rem", flexWrap: "wrap" }}>
        {[
          { label: "Very Proud", color: colors.proud },
          { label: "Generally Proud", color: colors.somewhatProud },
          { label: "Neutral", color: colors.neutral },
          { label: "Somewhat Dissat.", color: colors.somewhatDissatisfied },
          { label: "Very Dissat.", color: colors.dissatisfied }
        ].map(k => (
          <div key={k.label} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: k.color }} />
            <span style={{ fontFamily: FONT.mono, fontSize: "0.45rem", color: C.muted, textTransform: "uppercase" }}>{k.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TourObserverBreakdown ────────────────────────────────────────────────
export function TourObserverBreakdown() {
  const [activeId, setActiveId] = useState(null);

  const roles = [
    { 
      id: "partner", label: "Partners", n: 5, icon: "Heart",
      color: "#e879f9",
      desc: "Intimacy observations",
      insight: "Consistently reported noticing distinct mechanical and sensory differences when comparing intact and circumcised partners during intimacy."
    },
    { 
      id: "parent", label: "Parents", n: 7, icon: "Circle",
      color: "#fb923c",
      desc: "Decision factors & regret",
      insight: "Many expressed deep frustration over the lack of informed consent and incomplete anatomical guidance provided by pediatricians at birth."
    },
    { 
      id: "healthcare", label: "Healthcare Providers", n: 2, icon: "Activity",
      color: "#34d399",
      desc: "Medical realities",
      insight: "Highlighted a stark disconnect between standard medical training protocols and the complex anatomical realities they observe in daily practice."
    },
    { 
      id: "advocate", label: "Advocates", n: 7, icon: "AlertTriangle",
      color: "#f87171",
      desc: "Policy & analysis",
      insight: "Emphasized the human rights perspective and pointed out methodological flaws in historical studies that ignored foreskin function."
    },
    { 
      id: "skeptic", label: "Skeptics", n: 4, icon: "HelpCircle",
      color: "#60a5fa",
      desc: "Persuasion & critique",
      insight: "Questioned the intactivist framing, often focusing on social norms or challenging the severity of the sensory impact."
    },
    { 
      id: "curious", label: "Researchers", n: 5, icon: "BookOpen",
      color: "#fbbf24",
      desc: "Shaping factors",
      insight: "Focused on understanding the cultural and social climate that perpetuates the practice without medical necessity."
    }
  ];
  
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)",
      border: `1px solid ${C.ghost}`, borderRadius: 10, padding: "1.6rem", marginTop: "1.2rem"
    }}>
      <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.68rem", color: PATHS.observer.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem", textAlign: "center" }}>
        Key Observations by Role (n=37)
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.8rem" }}>
        {roles.map(r => {
          const isActive = activeId === r.id;
          const Icon = ICON_MAP[r.icon] || Users;
          const col = r.color;
          return (
            <div 
              key={r.id} 
              onMouseEnter={() => setActiveId(r.id)}
              onMouseLeave={() => setActiveId(null)}
              style={{
                display: "flex", flexDirection: "column",
                background: isActive ? `color-mix(in srgb, ${col} 10%, transparent)` : "rgba(255,255,255,0.02)", 
                border: `1px solid ${isActive ? col : C.dim}`, 
                borderRadius: 8, padding: "1rem 1.2rem", 
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", 
                cursor: "default",
                transform: isActive ? "scale(1.02)" : "scale(1)",
                boxShadow: isActive ? `0 4px 12px color-mix(in srgb, ${col} 20%, transparent)` : "none"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Icon size={18} color={isActive ? col : C.muted} style={{ transition: "color 0.3s ease" }} />
                  <div>
                    <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: "0.95rem", color: isActive ? C.textBright : C.text, lineHeight: 1.1 }}>{r.label}</div>
                    <div style={{ fontFamily: FONT.body, fontSize: "0.65rem", color: C.muted, fontStyle: "italic", marginTop: "0.2rem" }}>{r.desc}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" }}>
                   <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: col, opacity: isActive ? 1 : 0.7 }}>n={r.n}</span>
                   <div style={{ width: 30, height: 3, borderRadius: 2, background: C.ghost, overflow: "hidden" }}>
                     <div style={{ height: "100%", width: `${(r.n / 37) * 100}%`, background: col, opacity: isActive ? 1 : 0.6, transition: "opacity 0.3s ease" }} />
                   </div>
                </div>
              </div>
              <div style={{ 
                fontFamily: FONT.body, fontSize: "0.8rem", color: C.muted, lineHeight: 1.5,
                flexGrow: 1
              }}>
                "{r.insight}"
              </div>
              <div style={{ 
                marginTop: "0.8rem", overflow: "hidden",
                maxHeight: isActive ? 40 : 0, opacity: isActive ? 1 : 0,
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
              }}>
                <a href={`${EXPLORE_BASE}observer-lens?role=${r.id}`} style={{
                  display: "inline-flex", alignItems: "center", gap: "0.3rem",
                  fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em",
                  color: col, textDecoration: "none",
                }}>
                  Explore {r.label} Data <ArrowRight size={12} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: "1rem", fontFamily: FONT.body, fontSize: "0.7rem", color: C.dim, fontStyle: "italic" }}>
        Hover or tap to reveal insights
      </div>
    </div>
  );
}

// ── Tour Restoration Pathway ─
export function TourRestorationPathway() {
  const [outcomeId, setOutcomeId] = useState("restore_impact_rating_sensation");
  const [questionsMap, setQuestionsMap] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { questions } = await getQuestions();
        const map = {};
        if (questions) {
          questions.forEach(q => map[q.id] = q);
        }
        setQuestionsMap(map);
      } catch (err) {
        console.error("Failed to load questions for restoration pathway", err);
      }
    }
    load();
  }, []);

  if (!questionsMap || !questionsMap["restore_rci_start"] || !questionsMap["restore_duration"] || !questionsMap["restore_rci_current"] || !questionsMap[outcomeId]) {
    return <div style={{ padding: "2rem", color: C.dim, fontStyle: "italic", textAlign: "center" }}>Loading restoration flow data...</div>;
  }

  return (
    <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div className="mobile-scroll-hint" style={{ background: "rgba(0,0,0,0.15)", border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1rem", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ minWidth: 600 }}>
        <MultiSankeyChart
          pathQuestions={[
            questionsMap["restore_rci_start"],
            questionsMap["restore_rci_current"],
            questionsMap[outcomeId],
            questionsMap["restore_duration"]
          ]}
          headers={[
            "Starting CI", 
            "Current RCI", 
            <div key="dropdown" style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
              <span style={{ fontFamily: FONT.condensed, color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em" }}>Outcome:</span>
              <select
                value={outcomeId}
                onChange={(e) => setOutcomeId(e.target.value)}
                style={{
                  padding: "0.2rem 0.4rem", borderRadius: 4, border: `1px solid #a855f7`,
                  background: C.bgDeep, color: C.textBright, fontFamily: FONT.body,
                  fontWeight: 600, fontSize: "11px", cursor: "pointer", outline: "none"
                }}
              >
                {RATING_QUESTIONS.map(rq => (
                  <option key={rq.id} value={rq.id}>{rq.label}</option>
                ))}
              </select>
            </div>,
            "Years Restoring"
          ]}
          customColorMap={RESTORATION_COLOR_MAP}
          height={400}
        />
      </div>
      </div>
        
      {/* RCI Legend */}
      <div style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem", maxWidth: 800, margin: "0 auto", width: "100%" }}>
          <h3 style={{ fontFamily: FONT.condensed, color: C.textBright, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.2rem", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem" }}>
            <span style={{ marginRight: "0.5rem" }}>🟣</span> Coverage Index Reference
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {RCI_DEFINITIONS.map(def => (
              <div key={def.index} style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start", breakInside: "avoid", marginBottom: "0.5rem" }}>
                <div style={{ 
                  background: RESTORATION_COLOR_MAP[def.label], 
                  color: "#ffffff", 
                  fontWeight: 700, 
                  fontSize: "0.8rem",
                  padding: "0.2rem 0.6rem", 
                  borderRadius: 4,
                  minWidth: 45,
                  textAlign: "center"
                }}>
                  {def.label}
                </div>
                <div style={{ fontSize: "0.85rem", color: C.text, lineHeight: 1.4, flex: 1 }}>
                  {def.desc}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ── TestimonyRotator ─────────────────────────────────────────────────────
const CIRC_QUOTES = [
  "Please don't. Let him decide for himself when he's old enough. You can't undo it.",
  "I wish my parents had researched instead of just going along with the hospital's default.",
  "It's his body, not yours. He will have to live with your choice for the rest of his life.",
  "I didn't know what I was missing until I started restoring. The difference is night and day.",
  "Nobody asked me. That's the part that hurts the most — the choice was never mine.",
  "Don't let a doctor tell you it's 'just a snip.' They're removing thousands of nerve endings.",
  "I've spent years grieving something I can't get back. Please just wait and let him choose.",
  "The locker-room argument is dead. Rates are below 50% now. Your son won't be the odd one out.",
  "If he wants it done later, he can choose that. But you can never give it back.",
  "I was told it was cleaner, healthier. None of that turned out to be true in my experience.",
];

const INTACT_QUOTES = [
  "My parents left me intact and I am grateful every single day. There is nothing to fix.",
  "The gliding mechanism is real. It's not just skin — it's a functional part of the sexual experience.",
  "Trust your son's body. Nature doesn't make mistakes that need a scalpel to correct at birth.",
  "I've never had a single hygiene issue. It takes five seconds in the shower. That's it.",
  "Every partner I've had has noticed the difference — and preferred it. The mechanics are just different.",
  "My parents simply said 'we didn't see a reason to cut part of our baby off.' That was enough.",
  "I'm raising my son intact too. Once you understand what the foreskin actually does, the choice is obvious.",
  "I grew up in the US as an outlier. Not once did I wish I'd been circumcised. Not once.",
  "The sensitivity is real. I can't imagine voluntarily giving that up, and I wouldn't impose it on a child.",
  "Leave him whole. He can always choose later. You can never choose to undo it.",
];

function shuffleSlice(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function TestimonyRotator() {
  const [circSet, setCircSet] = useState(() => shuffleSlice(CIRC_QUOTES, 3));
  const [intactSet, setIntactSet] = useState(() => shuffleSlice(INTACT_QUOTES, 3));
  const [fadeKey, setFadeKey] = useState(0);

  const refresh = () => {
    setCircSet(shuffleSlice(CIRC_QUOTES, 3));
    setIntactSet(shuffleSlice(INTACT_QUOTES, 3));
    setFadeKey(k => k + 1);
  };

  // Auto-rotate every 20 seconds
  useEffect(() => {
    const t = setInterval(refresh, 20000);
    return () => clearInterval(t);
  }, []);

  const QuoteList = ({ quotes, pathway }) => (
    <div style={{
      background: `color-mix(in srgb, ${PATHS[pathway].color} 5%, transparent)`,
      border: `1px solid ${C.ghost}`, borderTop: `3px solid ${PATHS[pathway].color}`,
      borderRadius: "0 0 8px 8px", padding: "1.2rem",
    }}>
      <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "0.85rem", color: PATHS[pathway].color, marginBottom: "0.3rem" }}>
        {pathway === "circumcised" ? "From Circumcised Men" : "From Intact Men"}
      </div>
      <div style={{ fontFamily: FONT.body, fontSize: "0.68rem", color: C.dim, fontStyle: "italic", marginBottom: "0.9rem" }}>
        {pathway === "circumcised"
          ? "\"If you could speak directly to parents considering whether to circumcise their son, what would you say?\""
          : "\"What message would you give to parents considering whether to circumcise their son?\""}
      </div>
      <div key={fadeKey} style={{ animation: "fadeSlideIn 0.45s ease" }}>
        {quotes.map((q, i) => (
          <div key={q} style={{
            fontFamily: FONT.body, fontSize: "0.78rem", color: C.text, lineHeight: 1.55,
            padding: "0.6rem 0", borderBottom: i < quotes.length - 1 ? `1px solid ${C.ghost}` : "none",
          }}>
            "{q}"
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ fontFamily: FONT.condensed, fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", color: C.textBright, textAlign: "center", marginBottom: "1rem" }}>
        What Grown Sons Wish Their Parents Knew
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        <QuoteList quotes={circSet} pathway="circumcised" />
        <QuoteList quotes={intactSet} pathway="intact" />
      </div>
      <div style={{ textAlign: "center", marginTop: "0.8rem" }}>
        <button onClick={refresh} style={{
          fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.65rem",
          letterSpacing: "0.08em", textTransform: "uppercase",
          background: "none", border: `1px solid ${C.dim}`, borderRadius: 100,
          padding: "0.35rem 1rem", color: C.muted, cursor: "pointer",
          transition: "all .2s ease",
        }}
          onMouseEnter={e => { e.target.style.borderColor = C.gold; e.target.style.color = C.textBright; }}
          onMouseLeave={e => { e.target.style.borderColor = C.dim; e.target.style.color = C.muted; }}
        >
          ↻ More voices ({CIRC_QUOTES.length + INTACT_QUOTES.length} total)
        </button>
      </div>
    </div>
  );
}

// ── ParentInsightCharts ──────────────────────────────────────────────────
// Frozen data from observe_parent_intact_factors & observe_parent_intact_regret_reconsider
const INTACT_FACTORS = [
  { label: "Ethical beliefs / bodily autonomy", pct: 22.2, color: "#f87171" },
  { label: "No clear medical necessity",        pct: 22.2, color: "#fbbf24" },
  { label: "Foreskin function & sensitivity",   pct: 16.7, color: "#34d399" },
  { label: "Independent research",              pct: 16.7, color: "#67e8f9" },
  { label: "Surgical risk concerns",            pct: 13.9, color: "#fb923c" },
  { label: "Partner preference",                pct:  2.8, color: "#e879f9" },
  { label: "Medical claims unconvincing",        pct:  2.8, color: "#f472b6" },
  { label: "Other",                             pct:  2.8, color: "#a78bfa" },
];

// Frozen data from final_healthier_hygienic_belief (N=500)
const HEALTH_BELIEFS = [
  { label: "Intact significantly healthier",                      pct: 35.4, color: "#34d399" },
  { label: "Intact slightly healthier (foreskin protection)",     pct: 27.4, color: "#6ee7b7" },
  { label: "No significant difference",                          pct: 17.4, color: "#fbbf24" },
  { label: "Circumcised slightly healthier / more hygienic",     pct:  9.6, color: "#f87171" },
  { label: "Circumcised significantly healthier (medical)",      pct:  7.6, color: "#ef4444" },
  { label: "Genuinely unsure",                                   pct:  2.6, color: "#60a5fa" },
];

function MiniDonut({ segments, size = 140, thickness = 28, label }) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        {segments.map((s, i) => {
          const dashLen = (s.pct / 100) * circ;
          const el = (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={s.color} strokeWidth={thickness}
              strokeDasharray={`${dashLen} ${circ - dashLen}`}
              strokeDashoffset={-offset}
              style={{ transition: "stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease" }}
            />
          );
          offset += dashLen;
          return el;
        })}
      </svg>
      {label && (
        <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.62rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "0.5rem", textAlign: "center" }}>
          {label}
        </div>
      )}
    </div>
  );
}

export function ParentInsightCharts() {
  const [ref, seen] = useInView();

  return (
    <div ref={ref} style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "1rem", marginTop: "1.2rem", marginBottom: "1rem",
    }}>
      {/* Chart 1: Why parents kept intact */}
      <div style={{
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 10,
        padding: "1.2rem",
      }}>
        <div style={{ fontFamily: FONT.condensed, fontWeight: 800, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: C.textBright, marginBottom: "1rem" }}>
          Why Parents Kept Their Sons Intact
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <MiniDonut segments={seen ? INTACT_FACTORS : INTACT_FACTORS.map(s => ({ ...s, pct: 0 }))} size={120} thickness={22} label="n = 8" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            {INTACT_FACTORS.map((f) => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
                <div style={{ fontFamily: FONT.body, fontSize: "0.62rem", color: C.muted, flex: 1 }}>{f.label}</div>
                <div style={{ fontFamily: FONT.mono, fontSize: "0.6rem", fontWeight: 700, color: C.text, flexShrink: 0 }}>{f.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 2: Regret about keeping intact */}
      <div style={{
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 10,
        padding: "1.2rem",
      }}>
        <div style={{ fontFamily: FONT.condensed, fontWeight: 800, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: C.textBright, marginBottom: "1rem" }}>
          Any Regret About Keeping Intact?
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "center" }}>
          <MiniDonut
            segments={seen ? [{ pct: 100, color: PATHS.intact.color }] : [{ pct: 0, color: PATHS.intact.color }]}
            size={120} thickness={22} label="n = 7"
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT.mono, fontSize: "2.2rem", fontWeight: 800, color: PATHS.intact.color, lineHeight: 1 }}>
              100%
            </div>
            <div style={{ fontFamily: FONT.body, fontSize: "0.75rem", color: C.muted, lineHeight: 1.4, marginTop: "0.3rem" }}>
              "Extremely proud and confident it was the right choice"
            </div>
            <div style={{
              marginTop: "0.6rem", fontFamily: FONT.body, fontSize: "0.65rem", color: C.dim, fontStyle: "italic",
              borderTop: `1px solid ${C.ghost}`, paddingTop: "0.5rem",
            }}>
              Zero regret. Zero reconsideration. Every parent who kept their son intact reported complete confidence.
            </div>
          </div>
        </div>
      </div>

      {/* Chart 3: Health & hygiene beliefs — full width */}
      <div style={{
        gridColumn: "1 / -1",
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 10,
        padding: "1.2rem",
      }}>
        <div style={{ fontFamily: FONT.condensed, fontWeight: 800, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: C.textBright, marginBottom: "0.4rem" }}>
          "Which State Is Medically Healthier?"
        </div>
        <div style={{ fontFamily: FONT.body, fontSize: "0.65rem", color: C.dim, fontStyle: "italic", marginBottom: "1rem" }}>
          Putting aside personal satisfaction — which state do respondents believe is healthier or more hygienic? (N = 500)
        </div>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <MiniDonut
            segments={seen ? HEALTH_BELIEFS : HEALTH_BELIEFS.map(s => ({ ...s, pct: 0 }))}
            size={140} thickness={26} label="N = 500"
          />
          <div style={{ flex: 1, minWidth: 240, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {HEALTH_BELIEFS.map((f) => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
                <div style={{ fontFamily: FONT.body, fontSize: "0.68rem", color: C.muted, flex: 1, lineHeight: 1.35 }}>{f.label}</div>
                <div style={{ fontFamily: FONT.mono, fontSize: "0.65rem", fontWeight: 700, color: C.text, flexShrink: 0 }}>{f.pct}%</div>
              </div>
            ))}
            <div style={{
              marginTop: "0.6rem", paddingTop: "0.5rem", borderTop: `1px solid ${C.ghost}`,
              fontFamily: FONT.body, fontSize: "0.7rem", color: C.muted, lineHeight: 1.5,
            }}>
              <strong style={{ color: C.textBright }}>62.8%</strong> believe intact is healthier.{" "}
              <strong style={{ color: C.textBright }}>17.2%</strong> favor circumcised.{" "}
              The hygiene argument — the most common justification parents hear — is not supported by the people who live in these bodies.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AsymmetryOfChoice() {
  return (
    <div style={{ marginTop: "4rem", marginBottom: "4rem" }}>
      <div style={{
        textAlign: "center",
        marginBottom: "2.5rem"
      }}>
        <h3 style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "2rem", textTransform: "uppercase", letterSpacing: "0.05em", color: C.textBright, margin: "0 0 0.5rem" }}>
          The Asymmetry of Regret
        </h3>
        <p style={{ fontFamily: FONT.body, fontSize: "1.1rem", color: C.muted, maxWidth: 700, margin: "0 auto", lineHeight: 1.6 }}>
          When parents are on the fence, the decision is often framed as a 50/50 choice between two equal, valid options. Our dataset reveals that this is a statistical illusion. The outcomes of these two choices are fundamentally asymmetrical.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        {/* Column A: Intact */}
        <div style={{
          background: "color-mix(in srgb, var(--path-intact) 8%, transparent)",
          border: `1px solid color-mix(in srgb, var(--path-intact) 25%, transparent)`,
          borderRadius: 8,
          padding: "2rem",
          display: "flex", flexDirection: "column", gap: "1.5rem"
        }}>
          <h4 style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "1.2rem", color: "var(--path-intact)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0, borderBottom: `1px solid color-mix(in srgb, var(--path-intact) 20%, transparent)`, paddingBottom: "0.5rem" }}>
            The Intact Choice
            <span style={{ display: "block", fontSize: "0.8rem", color: C.muted, marginTop: "0.2rem" }}>(The Reversible Path)</span>
          </h4>
          
          <div>
            <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>The Data</div>
            <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.5 }}>
              <strong style={{ color: C.textBright }}>0%</strong> of intact men in our study reported frequent or strong regret about being left whole.
            </div>
          </div>

          <div>
            <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>The Future Option</div>
            <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.5 }}>
              If a male reaches 18 and decides he prefers a circumcised aesthetic or encounters a rare, unmanageable medical issue, he can walk into a clinic and consent to the surgery himself.
            </div>
          </div>

          <div>
            <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>The Risk Factor</div>
            <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: "var(--path-intact)", lineHeight: 1.5, fontWeight: 600 }}>
              Near zero. The decision preserves 100% of his anatomy and 100% of his future agency.
            </div>
          </div>
        </div>

        {/* Column B: Circumcised */}
        <div style={{
          background: "color-mix(in srgb, var(--path-circumcised) 8%, transparent)",
          border: `1px solid color-mix(in srgb, var(--path-circumcised) 25%, transparent)`,
          borderRadius: 8,
          padding: "2rem",
          display: "flex", flexDirection: "column", gap: "1.5rem"
        }}>
          <h4 style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "1.2rem", color: "var(--path-circumcised)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0, borderBottom: `1px solid color-mix(in srgb, var(--path-circumcised) 20%, transparent)`, paddingBottom: "0.5rem" }}>
            The Circumcision Choice
            <span style={{ display: "block", fontSize: "0.8rem", color: C.muted, marginTop: "0.2rem" }}>(The Irreversible Path)</span>
          </h4>
          
          <div>
            <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>The Data</div>
            <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.5 }}>
              Over <strong style={{ color: C.textBright }}>60%</strong> of circumcised men in our engaged cohort report frequent and strong feelings of resentment, loss, or grief.
            </div>
          </div>

          <div>
            <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>The Future Option</div>
            <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.5 }}>
              If a male reaches adulthood and wishes he was intact, the highly innervated tissue is permanently gone. He faces a lifetime of diminished sensation, or years of painful "restoration" to simulate a fraction of what was taken.
            </div>
          </div>

          <div>
            <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>The Risk Factor</div>
            <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: "var(--path-circumcised)", lineHeight: 1.5, fontWeight: 600 }}>
              Massive. The decision permanently removes functional tissue and completely overrides his future agency.
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: "2.5rem",
        padding: "1.5rem",
        background: "rgba(255,255,255,0.03)",
        borderLeft: `4px solid ${C.goldBright}`,
        borderRadius: 4
      }}>
        <p style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.textBright, margin: 0, lineHeight: 1.6 }}>
          You do not have to guess what your son will want. If you leave him intact, you leave the choice to him. If you circumcise him, you are placing a permanent, high-risk bet on his future body using a scalpel. The data shows that a vast number of men deeply resent losing that gamble.
        </p>
      </div>
    </div>
  );
}

export function ExitInterview() {
  const [choice, setChoice] = useState(null);

  return (
    <div style={{ marginTop: "4rem", marginBottom: "4rem", padding: "3rem 1.5rem", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.ghost}`, borderRadius: 12, textAlign: "center" }}>
      <h3 style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "2rem", textTransform: "uppercase", letterSpacing: "0.05em", color: C.textBright, margin: "0 0 1rem" }}>
        The Final Question
      </h3>
      <p style={{ fontFamily: FONT.body, fontSize: "1.1rem", color: C.muted, maxWidth: 600, margin: "0 auto 2.5rem", lineHeight: 1.6 }}>
        Having weighed the mechanics, the history, and the lived experiences of hundreds of men—what choice will you make for the next generation?
      </p>

      {!choice ? (
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setChoice("intact")}
            style={{
              padding: "1rem 2.5rem",
              background: "color-mix(in srgb, var(--path-intact) 15%, transparent)",
              border: `2px solid var(--path-intact)`,
              borderRadius: 8,
              color: C.textBright,
              fontFamily: FONT.condensed, fontWeight: 700, fontSize: "1.2rem", textTransform: "uppercase", letterSpacing: "0.05em",
              cursor: "pointer", transition: "all 0.2s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "color-mix(in srgb, var(--path-intact) 25%, transparent)"}
            onMouseLeave={e => e.currentTarget.style.background = "color-mix(in srgb, var(--path-intact) 15%, transparent)"}
          >
            Leave Intact
          </button>
          <button
            onClick={() => setChoice("circ")}
            style={{
              padding: "1rem 2.5rem",
              background: "rgba(255,255,255,0.05)",
              border: `2px solid ${C.ghost}`,
              borderRadius: 8,
              color: C.muted,
              fontFamily: FONT.condensed, fontWeight: 700, fontSize: "1.2rem", textTransform: "uppercase", letterSpacing: "0.05em",
              cursor: "pointer", transition: "all 0.2s ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = C.textBright;
              e.currentTarget.style.borderColor = C.text;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = C.muted;
              e.currentTarget.style.borderColor = C.ghost;
            }}
          >
            Circumcise
          </button>
        </div>
      ) : (
        <div style={{ animation: "fadeSlideIn 0.5s ease" }}>
          <div style={{ padding: "1.5rem", background: choice === "intact" ? "color-mix(in srgb, var(--path-intact) 10%, transparent)" : "color-mix(in srgb, var(--path-circumcised) 10%, transparent)", border: `1px solid ${choice === "intact" ? "var(--path-intact)" : "var(--path-circumcised)"}`, borderRadius: 8, display: "inline-block", textAlign: "left", maxWidth: 500 }}>
            <p style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "1.2rem", color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.5rem" }}>
              Thank You for Reviewing the Evidence.
            </p>
            <p style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.muted, margin: "0 0 1.5rem", lineHeight: 1.5 }}>
              {choice === "intact" 
                ? "Your choice aligns with 86.6% of the 500 respondents in this study. The paradigm is shifting, but it only changes when people share the truth." 
                : "While the data leads many to a different conclusion, we appreciate you taking the time to review the findings and participate in the inquiry."}
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: "The Accidental Intactivist's Inquiry", url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }
                }}
                style={{
                  background: C.goldBright, color: "var(--c-bgDeep)", border: "none", padding: "0.6rem 1.2rem", borderRadius: 100,
                  fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em",
                  cursor: "pointer", transition: "all 0.2s ease"
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.gold}
                onMouseLeave={e => e.currentTarget.style.background = C.goldBright}
              >
                Share This Report
              </button>
              
              <a
                href="/explore/resources"
                style={{
                  display: "inline-block",
                  background: "transparent", color: C.goldBright, border: `1px solid ${C.goldBright}`, padding: "0.6rem 1.2rem", borderRadius: 100,
                  fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em",
                  cursor: "pointer", transition: "all 0.2s ease", textDecoration: "none", textAlign: "center"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(212, 160, 48, 0.1)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Get Involved & Learn More
              </a>
            </div>
            <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, margin: "1.5rem 0 0", lineHeight: 1.5 }}>
              Explore advocacy organizations, support networks, and foundational literature to continue the work.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function LubeTaxCalculator() {
  const [cost, setCost] = useState(12);
  const [bottlesPerYear, setBottlesPerYear] = useState(4);
  const [years, setYears] = useState(50); // adult active years

  const lifetimeCost = cost * bottlesPerYear * years;

  return (
    <div style={{ marginTop: "3rem", padding: "2rem", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.ghost}`, borderRadius: 8 }}>
      <h4 style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "1.2rem", color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 1.5rem" }}>
        The Lifetime Lube Tax
      </h4>
      <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, marginBottom: "2rem", lineHeight: 1.6 }}>
        The intact penis is a naturally self-lubricating system. When the specialized tissue responsible for this is surgically removed, it must often be replaced by artificial means for the rest of a man's life.
      </p>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        <div>
          <label style={{ display: "block", fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.85rem", color: C.dim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            Avg. Bottle Cost ($)
          </label>
          <input 
            type="range" min="5" max="30" value={cost} onChange={e => setCost(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.goldBright }}
          />
          <div style={{ fontFamily: FONT.mono, fontWeight: 700, color: C.textBright, marginTop: "0.5rem" }}>${cost}</div>
        </div>
        <div>
          <label style={{ display: "block", fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.85rem", color: C.dim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            Bottles Per Year
          </label>
          <input 
            type="range" min="1" max="12" value={bottlesPerYear} onChange={e => setBottlesPerYear(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.goldBright }}
          />
          <div style={{ fontFamily: FONT.mono, fontWeight: 700, color: C.textBright, marginTop: "0.5rem" }}>{bottlesPerYear}</div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.ghost}`, paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "1rem", color: C.dim, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Estimated Lifetime Cost:
        </div>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: "2.5rem", color: C.red, lineHeight: 1 }}>
          ${lifetimeCost.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export function PartnersEcho() {
  const [page, setPage] = useState(0);
  const quotes = [
    {
      text: "My partner is intact. It causes less vaginal chafing issues during sex.",
      author: "Survey Respondent · Partner"
    },
    {
      text: "Not as much lubrication [is] needed. He seems to get more pleasure during intimate time.",
      author: "Survey Respondent · Partner"
    },
    {
      text: "...There was some communication needed in the beginning because I had never been with someone who was intact but he was very knowledgeable and just kind of told me the differences between the two. It was never an issue.",
      author: "Survey Respondent · Partner"
    }
  ];
  
  const quote = quotes[page];

  return (
    <div style={{ marginTop: "3rem", padding: "2.5rem", background: "rgba(91, 147, 199, 0.05)", borderLeft: `4px solid ${PATHS.observer.color}`, borderRadius: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", color: PATHS.observer.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          The Partner's Echo
        </div>
        <div style={{ height: 1, flex: 1, background: `color-mix(in srgb, ${PATHS.observer.color} 30%, transparent)` }} />
      </div>
      
      <div style={{ fontFamily: FONT.display, fontSize: "1.2rem", fontStyle: "italic", color: C.textBright, lineHeight: 1.5, marginBottom: "1rem" }}>
        “{quote.text}”
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: FONT.mono, fontSize: "0.8rem", color: C.dim }}>
          — {quote.author}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {quotes.map((_, i) => (
            <div 
              key={i} 
              onClick={() => setPage(i)}
              style={{ width: 8, height: 8, borderRadius: "50%", background: page === i ? PATHS.observer.color : C.ghost, cursor: "pointer", transition: "background 0.2s ease" }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HistoricalIntentReveal() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div style={{ margin: "2rem 0", padding: "1.5rem", background: "rgba(0,0,0,0.2)", border: `1px solid ${C.ghost}`, borderRadius: 8, position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h4 style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "1.1rem", color: C.dim, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
          Archival Evidence: 1888
        </h4>
        <button 
          onClick={() => setRevealed(!revealed)}
          style={{ background: revealed ? "transparent" : C.goldBright, color: revealed ? C.goldBright : C.bgDeep, border: `1px solid ${C.goldBright}`, padding: "0.4rem 1rem", borderRadius: 4, fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s ease" }}
        >
          {revealed ? "Hide Document" : "Declassify"}
        </button>
      </div>

      <div style={{ position: "relative", filter: revealed ? "none" : "blur(4px)", opacity: revealed ? 1 : 0.4, transition: "all 0.8s ease", fontFamily: "'Courier New', Courier, monospace", fontSize: "1.05rem", lineHeight: 1.6, color: C.textBright, background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: 4, borderLeft: `3px solid ${C.red}` }}>
        "A remedy which is almost always successful in small boys is circumcision... The operation should be performed by a surgeon without administering an anaesthetic, as the brief pain attending the operation will have a salutary effect upon the mind, especially if it be connected with the idea of punishment."
        <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: C.dim, fontStyle: "italic" }}>
          — Dr. John Harvey Kellogg, "Treatment for Self-Abuse and its Effects" (1888)
        </div>
      </div>

      {!revealed && (
        <div style={{ position: "absolute", top: "60%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
          <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "1.5rem", color: C.red, textTransform: "uppercase", letterSpacing: "0.2em", border: `2px solid ${C.red}`, padding: "0.5rem 1rem", transform: "rotate(-5deg)", display: "inline-block", background: "rgba(0,0,0,0.8)", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
            Redacted
          </div>
        </div>
      )}
    </div>
  );
}

export function RestorationGradient() {
  const [activeStage, setActiveStage] = useState(0);

  const STAGES = [
    {
      title: "Baseline (CI-1)",
      duration: "Year 0",
      mechanics: "High skin tension, immobility. Glans is exposed and keratinized (callused) to protect against friction.",
      functionDesc: "No gliding action. Friction is borne directly by the keratinized glans and remaining shaft skin.",
      color: "var(--path-circumcised)",
      progress: 0
    },
    {
      title: "Mitosis & Expansion",
      duration: "Months 1-12",
      mechanics: "Applied mechanical tension triggers mitosis (cell division). Both inner mucosa and outer skin begin to lengthen.",
      functionDesc: "Slack skin bunches behind the corona, but no functional change yet.",
      color: "#d97706",
      progress: 20
    },
    {
      title: "\"The Hump\" (CI-4)",
      duration: "Years 1-2",
      mechanics: "A notoriously slow phase. Significant tissue volume is required to physically push the skin tube over the wide ridge of the corona.",
      functionDesc: "Intermittent rollover when seated or cold. Highly variable day-to-day.",
      color: "#ca8a04",
      progress: 40
    },
    {
      title: "Dekeratinization",
      duration: "Years 3-4",
      mechanics: "The glans is consistently covered while flaccid. The trapped mucosal environment causes dekeratinization—the shedding of the callused layer.",
      functionDesc: "Dramatic increase in mucosal sensitivity. The glans returns to an internal organ state.",
      color: "var(--path-restoring)",
      progress: 60
    },
    {
      title: "Mechanical Gliding",
      duration: "Years 5+",
      mechanics: "The skin tube is now long enough to accommodate an erection. Mitosis continues to create sufficient slack.",
      functionDesc: "The skin glides over the glans during intercourse. The need for artificial lubrication drops significantly.",
      color: "#10b981",
      progress: 80
    },
    {
      title: "The Future / Foregen",
      duration: "Biological Limit",
      mechanics: "Mitosis cannot recreate specialized anatomical structures. However, regenerative medicine projects (e.g., Foregen) are working to decellularize and repopulate intact donor tissue matrices using stem cells.",
      functionDesc: "Currently, the ridged band and specialized nerve networks are permanently lost. Future therapies aim to graft and restore full innervation and original structures.",
      color: "var(--path-intact)",
      progress: 100,
      isLimit: true
    }
  ];

  const current = STAGES[activeStage];

  return (
    <div style={{ margin: "3rem 0", padding: "2rem", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.ghost}`, borderRadius: 8, position: "relative" }}>
      <h4 style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "1.1rem", color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 1.5rem", textAlign: "center" }}>
        The Mechanical Recovery Gradient
      </h4>
      <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.dim, textAlign: "center", marginBottom: "2rem" }}>
        Select a stage below to explore the biological mechanics and functional limits of tissue expansion over a 5+ year timeline.
      </p>

      {/* Stepper / Timeline */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", marginBottom: "5rem", marginTop: "4rem" }}>
        {/* Background Track */}
        <div style={{ position: "absolute", top: "50%", left: "2%", right: "2%", height: 4, background: C.bgDeep, zIndex: 0, borderRadius: 2, transform: "translateY(-50%)" }} />
        
        {/* Progress Fill */}
        <div style={{ position: "absolute", top: "50%", left: "2%", width: `${current.progress * 0.96}%`, height: 4, background: current.color, zIndex: 1, transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)", borderRadius: 2, transform: "translateY(-50%)" }} />
        
        {/* Unreachable dotted line */}
        <div style={{ position: "absolute", top: "50%", left: "78.8%", right: "2%", height: 4, background: "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(100, 200, 150, 0.3) 4px, rgba(100, 200, 150, 0.3) 8px)", zIndex: 2, transform: "translateY(-50%)" }} />

        {STAGES.map((stage, i) => {
          const isActive = i === activeStage;
          const isPast = i <= activeStage;
          const isNext = i === activeStage + 1;
          
          return (
            <div 
              key={i}
              onClick={() => setActiveStage(i)}
              style={{ 
                position: "relative", display: "flex", justifyContent: "center", alignItems: "center",
                cursor: "pointer", zIndex: 3, flex: 1, opacity: isPast || isActive || isNext ? 1 : 0.65,
                transition: "opacity 0.3s"
              }}
            >
              {/* Duration Text (Top) */}
              <div style={{ position: "absolute", bottom: "100%", paddingBottom: "1.4rem", fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.65rem", color: stage.isLimit ? C.red : stage.color, textTransform: "uppercase", textAlign: "center", width: "120%", opacity: 0.8, pointerEvents: "none" }}>
                {stage.duration}
              </div>

              {/* Circle Node */}
              <div style={{ 
                width: isActive ? 20 : 12, height: isActive ? 20 : 12, 
                borderRadius: "50%", 
                background: stage.isLimit ? "transparent" : (isPast ? stage.color : C.bgDeep),
                border: stage.isLimit ? `2px dashed ${stage.color}` : `2px solid ${isPast ? stage.color : C.muted}`,
                transition: "all 0.3s",
                boxShadow: isActive && !stage.isLimit ? `0 0 10px ${stage.color}` : "none",
                animation: isNext ? "gentlePulse 2s infinite" : "none"
              }} />

              {/* Title Text (Bottom) */}
              <div style={{ position: "absolute", top: "100%", paddingTop: "1.4rem", fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.75rem", color: isActive ? C.textBright : C.muted, textTransform: "uppercase", textAlign: "center", width: "100%", padding: "1.4rem 0.2rem 0", wordWrap: "break-word", lineHeight: 1.2, pointerEvents: "none" }}>
                {stage.title}
              </div>
            </div>
          );
        })}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gentlePulse {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); transform: scale(1); }
          50% { box-shadow: 0 0 0 8px rgba(255,255,255,0); transform: scale(1.15); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); transform: scale(1); }
        }
      `}} />

      {/* Info Panel */}
      <div style={{ 
        background: `color-mix(in srgb, ${current.isLimit ? C.red : current.color} 6%, ${C.bgDeep})`, 
        border: `1px solid ${current.isLimit ? C.red : current.color}`, 
        borderRadius: 8, padding: "1.5rem", minHeight: 140, transition: "all 0.5s ease",
        boxShadow: `inset 0 0 30px color-mix(in srgb, ${current.isLimit ? C.red : current.color} 10%, transparent)`
      }}>
        <div style={{ display: "flex", gap: "2rem" }}>
          <div style={{ flex: 1 }}>
            <h5 style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", color: current.isLimit ? C.red : current.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem", transition: "color 0.5s" }}>
              Mechanics
            </h5>
            <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.textBright, lineHeight: 1.5, margin: 0 }}>
              {current.mechanics}
            </p>
          </div>
          <div style={{ width: 1, background: C.ghost }} />
          <div style={{ flex: 1 }}>
            <h5 style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", color: current.isLimit ? C.red : current.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem", transition: "color 0.5s" }}>
              Functional Impact
            </h5>
            <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.textBright, lineHeight: 1.5, margin: 0 }}>
              {current.functionDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
