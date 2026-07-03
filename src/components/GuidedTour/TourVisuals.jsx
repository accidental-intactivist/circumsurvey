// ═══════════════════════════════════════════════════════════════════════════
// Guided Tour visuals — theme-token SVG renditions of the exhibits'
// signature charts (flowchart, atlas, dumbbell separation, sankey, mirrors).
// All colors are CSS custom properties → theme/mode/colorblind reactive.
// ═══════════════════════════════════════════════════════════════════════════
import React, { useEffect, useRef, useState } from "react";
import { C, FONT } from "../../explore/styles/tokens";
import {
  PATHS, PLEASURE_METRICS, pooledMean, SANKEY,
  ATLAS_ROWS, ATLAS_REGIONS, WORDS_CIRC, WORDS_INTACT, RESENTMENT_MIRROR,
} from "./tourData";
import { useInView, CountUp } from "./tourKit";

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
export function WordMirrors() {
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
      <Panel words={WORDS_CIRC} colorVar={PATHS.circumcised.color} title="Circumcised, in their words"
        tint="color-mix(in srgb, var(--path-circumcised) 4%, transparent)" />
      <Panel words={WORDS_INTACT} colorVar={PATHS.intact.color} title="Intact, in their words"
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

// ── Audience-participation projection gate ─────────────────────────────────
export function ProjectionGate({ onPredict, predicted }) {
  const OPTIONS = [
    { key: "split", label: "They split wide apart" },
    { key: "small", label: "Small differences" },
    { key: "same",  label: "About the same" },
  ];
  const [choice, setChoice] = useState(null);
  return (
    <div style={{ textAlign: "center", padding: "0.4rem 0" }}>
      <h3 style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "1.35rem", letterSpacing: "0.03em", textTransform: "uppercase", color: C.textBright, margin: "0 0 0.4rem" }}>
        Then came the fork.
      </h3>
      <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.muted, margin: 0 }}>
        “Are you circumcised?” — and every answer above could suddenly be sorted. What do you expect happened to these numbers?
      </p>
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1.2rem" }}>
        {OPTIONS.map((o) => (
          <button key={o.key} onClick={() => { setChoice(o.key); onPredict(o.key); }} style={{
            fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.08em",
            textTransform: "uppercase", cursor: "pointer",
            color: choice === o.key ? C.goldBright : C.muted,
            background: choice === o.key ? "rgba(212,160,48,.14)" : "transparent",
            border: `1.5px solid ${choice === o.key ? "var(--c-goldBright)" : C.ghost}`,
            borderRadius: 100, padding: "0.55rem 1.2rem", transition: "all .15s ease",
            transform: choice === o.key ? "scale(1.05)" : "none",
          }}>
            {o.label}
          </button>
        ))}
      </div>
      {predicted && (
        <div style={{ marginTop: "1rem", fontFamily: FONT.mono, fontSize: "0.62rem", color: C.goldBright }}>
          PROJECTION RECORDED · THE DEMONSTRATION BELOW IS NOW OPEN
        </div>
      )}
    </div>
  );
}
