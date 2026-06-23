// ═══════════════════════════════════════════════════════════════════════════
// ByTheNumbersPage.jsx — "By the Numbers: Which Factors Matter?"
// An interactive factor-analysis explorer. Four sections:
//   1. Factor Finder — animated bubble cluster sized by n, colored by outcome
//   2. How Many Are Like Me? — persona builder with live delta comparisons
//   3. Test Your Assumptions — dynamic quiz against the data
//   4. Factor Grid — heatmap of which demographics predict which outcomes
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { C, FONT, PATH_COLORS, resolveCssColor } from "../styles/tokens";
import { getAggregate, getResponseDistribution, getCount } from "../lib/api";
import DemographicFilterBar, { DEMOGRAPHIC_DIMENSIONS } from "../components/DemographicFilterBar";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import ExhibitHero from "../components/ExhibitHero";
import { useTooltip, Tooltip } from "../components/Tooltip";
import * as Icons from "../components/Icons";

// ── Dimensions & Outcomes ──────────────────────────────────────────────────

const ANALYSIS_DIMENSIONS = [
  { id: "generation", label: "Generation", column: "generation" },
  { id: "country_born", label: "Country of Birth", column: "country_born" },
  { id: "education", label: "Education", column: "education" },
  { id: "politics", label: "Political Leaning", column: "politics" },
  { id: "primary_tradition", label: "Religion", column: "primary_tradition" },
  { id: "socioeconomic", label: "Socioeconomic Status", column: "socioeconomic" },
  { id: "sexuality", label: "Sexuality", column: "sexuality" },
  { id: "family_upbringing", label: "Family Upbringing", column: "family_upbringing" },
];

const OUTCOME_METRICS = [
  { id: "pathway_intact", label: "Intact Rate", qid: "final_social_norm_perception", extractor: "pathway_intact", color: PATH_COLORS.intact, unit: "%" },
  { id: "resentment", label: "Strong Resentment", qid: "circ_regret_feeling", extractor: "strong_resentment", color: C.red, unit: "%" },
  { id: "keep_intact", label: "Would Keep Son Intact", qid: "final_child_decision_reason", extractor: "keep_intact", color: C.green, unit: "%" },
  { id: "lube_always", label: "Always Needs Lube", qid: "exp_lubrication_need", extractor: "lube_always", color: C.blue, unit: "%" },
  { id: "intact_aesthetic", label: "Prefers Intact Look", qid: "final_aesthetic_preference", extractor: "intact_aesthetic", color: C.ltBlue, unit: "%" },
];

// ── Extractors: pull a single % from a distribution ────────────────────────

function extractMetric(extractor, distribution, n) {
  if (!distribution || !n || n === 0) return null;
  const find = (substr) => distribution.find(d => d.label && d.label.toLowerCase().includes(substr.toLowerCase()))?.n || 0;

  switch (extractor) {
    case "pathway_intact":
      // This is special — we use the aggregate by pathway to get intact count
      return null; // Handled differently via pathway counts
    case "strong_resentment":
      return (find("strong and frequent") / n) * 100;
    case "keep_intact":
      return (find("remains intact") / n) * 100;
    case "lube_always":
      return (find("always or almost always necessary") / n) * 100;
    case "intact_aesthetic": {
      const strong = find("strongly prefer the appearance of the intact");
      const slight = find("slightly prefer the appearance of the intact");
      return ((strong + slight) / n) * 100;
    }
    default:
      return null;
  }
}

// ── Shorten labels ─────────────────────────────────────────────────────────

function shorten(label) {
  if (!label) return "";
  let s = label;
  s = s.replace(/\s*\([^)]*\)\s*$/, "");
  s = s.replace("Millennial/Gen Y", "Millennial");
  s = s.replace("Xennial/Oregon Trail", "Xennial");
  s = s.replace("United States of America (USA)", "USA");
  s = s.replace("United States of America", "USA");
  s = s.replace("United Kingdom", "UK");
  s = s.replace("Atheist / Agnostic / Secular", "Secular");
  s = s.replace("Secular / Atheist / Agnostic", "Secular");
  s = s.replace("No significant religious/spiritual/cultural tradition influencing this topic.", "Secular");
  s = s.replace("Spiritual but not religious", "Spiritual");
  s = s.replace("New Age / Spiritual but not religious", "New Age");
  s = s.replace("Very Liberal / Progressive / Left-Leaning", "V. Liberal");
  s = s.replace("Very Conservative / Right-Leaning", "V. Conservative");
  s = s.replace("Liberal / Progressive", "Liberal");
  s = s.replace("Moderate / Centrist", "Moderate");
  s = s.replace("Apolitical / Not focused on politics", "Apolitical");
  s = s.replace("Prefer not to say / Unsure", "Undisclosed");
  s = s.replace("Straight/Heterosexual", "Straight");
  s = s.replace(/^I was raised by one or both.*$/, "Biological Parents");
  s = s.replace(/^I was adopted as an infant.*$/, "Adopted (Infant)");
  s = s.replace(/^I was adopted as a child.*$/, "Adopted (Child)");
  s = s.replace(/^I was raised primarily.*$/, "Other Structure");
  s = s.replace("Prefer not to say.", "Undisclosed");
  // Shorten education
  s = s.replace("Less than high school diploma or equivalent", "< High School");
  s = s.replace("High school diploma or GED", "High School");
  s = s.replace("Trade School Certificate / Pre-Apprenticeship Program", "Trade School");
  s = s.replace("Journeyman Certification / Licensed Tradesperson", "Journeyman");
  s = s.replace("Some college / Associate's degree", "Some College");
  s = s.replace("Bachelor's degree", "Bachelor's");
  s = s.replace("Master's degree", "Master's");
  s = s.replace("Professional degree", "Prof. Degree");
  s = s.replace("Doctoral degree", "Doctorate");
  // Shorten SES
  s = s.replace(/^Upper income.*$/, "Upper Income");
  s = s.replace(/^Upper-middle income.*$/, "Upper-Middle");
  s = s.replace(/^Middle income.*$/, "Middle");
  s = s.replace(/^Working class.*$/, "Working Class");
  s = s.replace(/^Lower income.*$/, "Lower Income");

  if (s.length > 22) s = s.slice(0, 20) + "…";
  return s;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function SectionHeader({ number, title, subtitle, icon }) {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "0.75rem",
        marginBottom: "0.6rem",
      }}>
        <span style={{
          fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.18em",
          textTransform: "uppercase", color: C.goldBright, fontWeight: 700,
        }}>
          {icon} {number}
        </span>
      </div>
      <h2 style={{
        fontFamily: FONT.display, fontSize: "2rem", fontWeight: 700,
        color: C.textBright, margin: 0, lineHeight: 1.2, letterSpacing: "-0.015em",
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{
          fontFamily: FONT.body, fontSize: "1rem", color: C.muted,
          lineHeight: 1.5, marginTop: "0.6rem", marginBottom: 0,
          maxWidth: 700, fontWeight: 300,
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: FACTOR FINDER — Bubble Cluster
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 0: SNAPSHOT WALL — Striking standalone statistics
// ═══════════════════════════════════════════════════════════════════════════

const SNAPSHOT_DEFINITIONS = [
  {
    id: "respondents", label: "Total Respondents", big: true,
    fetch: () => getCount().then(d => ({ value: d.total, note: `${d.by_pathway?.circumcised || 0} circumcised · ${d.by_pathway?.intact || 0} intact · ${d.by_pathway?.restoring || 0} restoring · ${d.by_pathway?.observer || 0} observers` })),
  },
  {
    id: "resentment_circ", label: "of circumcised men report strong, frequent resentment or grief",
    fetch: () => getResponseDistribution("circ_regret_feeling", { pathway: "circumcised" }).then(d => {
      const strong = d.distribution?.find(x => x.label?.includes("strong and frequent"));
      return { value: strong ? `${strong.pct.toFixed(0)}%` : "—", n: d.n };
    }),
  },
  {
    id: "resentment_restoring", label: "of restoring men report strong, frequent resentment — the highest of any group",
    fetch: () => getResponseDistribution("circ_regret_feeling", { pathway: "restoring" }).then(d => {
      const strong = d.distribution?.find(x => x.label?.includes("strong and frequent"));
      return { value: strong ? `${strong.pct.toFixed(0)}%` : "—", n: d.n };
    }),
  },
  {
    id: "keep_intact_restoring", label: "of restoring men say they would keep a future son intact — near-unanimous",
    fetch: () => getResponseDistribution("final_child_decision_reason", { pathway: "restoring" }).then(d => {
      const intact = d.distribution?.find(x => x.label?.includes("remains intact"));
      return { value: intact ? `${intact.pct.toFixed(1)}%` : "—", n: d.n };
    }),
  },
  {
    id: "keep_intact_circ", label: "of circumcised men would keep a future son intact",
    fetch: () => getResponseDistribution("final_child_decision_reason", { pathway: "circumcised" }).then(d => {
      const intact = d.distribution?.find(x => x.label?.includes("remains intact"));
      return { value: intact ? `${intact.pct.toFixed(1)}%` : "—", n: d.n };
    }),
  },
  {
    id: "lube_circ", label: "of circumcised men say lube is always or almost always needed",
    fetch: () => getResponseDistribution("exp_lubrication_need", { pathway: "circumcised" }).then(d => {
      const always = d.distribution?.find(x => x.label?.includes("always or almost always"));
      return { value: always ? `${always.pct.toFixed(0)}%` : "—", n: d.n };
    }),
  },
  {
    id: "lube_intact", label: "of intact men never find artificial lubrication necessary",
    fetch: () => getResponseDistribution("exp_lubrication_need", { pathway: "intact" }).then(d => {
      const never = d.distribution?.find(x => x.label?.includes("Never find it necessary"));
      return { value: never ? `${never.pct.toFixed(0)}%` : "—", n: d.n };
    }),
  },
  {
    id: "sensitivity_gap", label: "avg. light-touch sensitivity: Intact 4.2/5 vs Circumcised 2.3/5",
    fetch: () => Promise.all([
      getResponseDistribution("exp_sex_rating_sensitivity_light_touch", { pathway: "intact" }),
      getResponseDistribution("exp_sex_rating_sensitivity_light_touch", { pathway: "circumcised" }),
    ]).then(([intact, circ]) => {
      const avg = (d) => {
        if (!d.distribution || d.n === 0) return 0;
        let sum = 0, total = 0;
        d.distribution.forEach(x => { const v = parseFloat(x.label); if (!isNaN(v)) { sum += v * x.n; total += x.n; } });
        return total > 0 ? sum / total : 0;
      };
      const gap = avg(intact) - avg(circ);
      return { value: `${gap.toFixed(1)}`, suffix: "/5 gap", n: intact.n + circ.n };
    }),
  },
  {
    id: "aesthetic_circ", label: "of circumcised men prefer the intact aesthetic over their own",
    fetch: () => getResponseDistribution("final_aesthetic_preference", { pathway: "circumcised" }).then(d => {
      const strong = d.distribution?.find(x => x.label?.includes("strongly prefer the appearance of the intact"))?.n || 0;
      const slight = d.distribution?.find(x => x.label?.includes("slightly prefer the appearance of the intact"))?.n || 0;
      const pct = d.n > 0 ? ((strong + slight) / d.n * 100) : 0;
      return { value: `${pct.toFixed(0)}%`, n: d.n };
    }),
  },
  {
    id: "autonomy", label: "of all respondents prioritize the child's right to bodily autonomy over parental/medical discretion",
    fetch: () => getResponseDistribution("final_core_principle_choice").then(d => {
      const auto = d.distribution?.find(x => x.label?.includes("Bodily Autonomy"));
      return { value: auto ? `${auto.pct.toFixed(0)}%` : "—", n: d.n };
    }),
  },
  {
    id: "pride_intact", label: "of intact men feel very proud or satisfied with their status",
    fetch: () => getResponseDistribution("exp_pride_satisfaction_rating", { pathway: "intact" }).then(d => {
      const vp = d.distribution?.find(x => x.label?.includes("Very proud"))?.n || 0;
      const gp = d.distribution?.find(x => x.label?.includes("Generally proud"))?.n || 0;
      const pct = d.n > 0 ? ((vp + gp) / d.n * 100) : 0;
      return { value: `${pct.toFixed(0)}%`, n: d.n };
    }),
  },
  {
    id: "dissatisfied_circ", label: "of circumcised men feel somewhat or very dissatisfied with their status",
    fetch: () => getResponseDistribution("exp_pride_satisfaction_rating", { pathway: "circumcised" }).then(d => {
      const sd = d.distribution?.find(x => x.label?.includes("Somewhat dissatisfied"))?.n || 0;
      const vd = d.distribution?.find(x => x.label?.includes("Very dissatisfied"))?.n || 0;
      const pct = d.n > 0 ? ((sd + vd) / d.n * 100) : 0;
      return { value: `${pct.toFixed(0)}%`, n: d.n };
    }),
  },
];

function SnapshotWall() {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      SNAPSHOT_DEFINITIONS.map(def =>
        def.fetch()
          .then(result => ({ ...def, ...result }))
          .catch(() => ({ ...def, value: "—", note: "Error loading" }))
      )
    ).then(results => {
      setSnapshots(results);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section id="snapshots" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
        <SectionHeader number="The Data" title="At a Glance" subtitle="Key statistics from 504 respondents — the numbers that define the conversation." icon="★" />
        <div style={{ padding: "4rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
          Compiling snapshot statistics…
        </div>
      </section>
    );
  }

  const totalSnap = snapshots.find(s => s.id === "respondents");
  const statSnaps = snapshots.filter(s => s.id !== "respondents");

  return (
    <section id="snapshots" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
      <SectionHeader number="The Data" title="At a Glance" subtitle="Key statistics from the dataset — the numbers that define the conversation." icon="★" />

      {/* Hero stat: total respondents */}
      {totalSnap && (
        <div style={{
          background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
          padding: "2rem 2.5rem", marginBottom: "1.5rem", textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        }}>
          <div style={{
            fontFamily: FONT.mono, fontSize: "4.5rem", fontWeight: 800,
            color: resolveCssColor(C.goldBright), lineHeight: 1,
            textShadow: "0 0 30px rgba(212,160,48,0.25)",
          }}>
            {totalSnap.value}
          </div>
          <div style={{
            fontFamily: FONT.condensed, fontSize: "0.85rem", letterSpacing: "0.15em",
            textTransform: "uppercase", color: C.muted, marginTop: "0.5rem", fontWeight: 700,
          }}>
            {totalSnap.label}
          </div>
          {totalSnap.note && (
            <div style={{
              fontFamily: FONT.mono, fontSize: "0.68rem", color: C.dim, marginTop: "0.5rem",
            }}>
              {totalSnap.note}
            </div>
          )}
        </div>
      )}

      {/* Stat tiles */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "1rem",
      }}>
        {statSnaps.map(snap => (
          <div key={snap.id} style={{
            background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 10,
            padding: "1.2rem 1.4rem", display: "flex", flexDirection: "column",
            justifyContent: "space-between", minHeight: 110,
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = resolveCssColor(C.gold);
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(212,160,48,0.1)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = resolveCssColor(C.ghost);
            e.currentTarget.style.boxShadow = "none";
          }}
          >
            <div style={{
              fontFamily: FONT.mono, fontSize: "2.4rem", fontWeight: 800,
              color: resolveCssColor(C.textBright), lineHeight: 1,
            }}>
              {snap.value}
              {snap.suffix && <span style={{ fontSize: "0.9rem", color: resolveCssColor(C.muted), marginLeft: "0.3rem" }}>{snap.suffix}</span>}
            </div>
            <div style={{
              fontFamily: FONT.body, fontSize: "0.78rem", color: C.muted,
              lineHeight: 1.4, marginTop: "0.5rem", flex: 1,
            }}>
              {snap.label}
            </div>
            {snap.n && (
              <div style={{
                fontFamily: FONT.mono, fontSize: "0.55rem", color: C.dim,
                marginTop: "0.4rem",
              }}>
                n={snap.n}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: FACTOR FINDER — Bubble Cluster
// ═══════════════════════════════════════════════════════════════════════════

function FactorFinder({ tooltip }) {
  const [selectedDim, setSelectedDim] = useState(ANALYSIS_DIMENSIONS[0]);
  const [selectedMetric, setSelectedMetric] = useState(OUTCOME_METRICS[2]); // "keep intact"
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef(null);
  const [hoveredBubble, setHoveredBubble] = useState(null);

  useEffect(() => {
    setLoading(true);
    getAggregate(selectedMetric.qid, { by: selectedDim.column })
      .then(res => {
        setData(res.results || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedDim.column, selectedMetric.qid]);

  // Process data into bubble items
  const bubbles = useMemo(() => {
    if (!data) return [];
    return Object.entries(data)
      .filter(([key]) => key && key !== "null" && key !== "unknown" && key !== "" && key !== "observer")
      .map(([key, val]) => {
        const metric = extractMetric(selectedMetric.extractor, val.distribution, val.n);
        return {
          id: key,
          label: shorten(key),
          fullLabel: key,
          n: val.n || 0,
          metric: metric,
          distribution: val.distribution,
        };
      })
      .filter(b => b.n >= 3)
      .sort((a, b) => b.n - a.n);
  }, [data, selectedMetric.extractor]);

  // Layout bubbles in a packed circle arrangement
  const layoutBubbles = useMemo(() => {
    if (bubbles.length === 0) return [];
    const maxN = Math.max(...bubbles.map(b => b.n));
    const minR = 28, maxR = 72;

    const sized = bubbles.map(b => ({
      ...b,
      r: minR + (Math.sqrt(b.n / maxN)) * (maxR - minR),
    }));

    // Simple spiral packing
    const placed = [];
    const cx = 340, cy = 200;
    for (let i = 0; i < sized.length; i++) {
      const b = sized[i];
      if (i === 0) {
        placed.push({ ...b, x: cx, y: cy });
        continue;
      }
      // Spiral outward to find a non-overlapping position
      let angle = 0, radius = 0;
      let bestX = cx, bestY = cy;
      let found = false;
      for (let step = 0; step < 2000 && !found; step++) {
        angle = step * 0.3;
        radius = 4 + step * 1.2;
        const tx = cx + radius * Math.cos(angle);
        const ty = cy + radius * Math.sin(angle);
        let overlap = false;
        for (const p of placed) {
          const dist = Math.sqrt((tx - p.x) ** 2 + (ty - p.y) ** 2);
          if (dist < b.r + p.r + 3) { overlap = true; break; }
        }
        if (!overlap) { bestX = tx; bestY = ty; found = true; }
      }
      placed.push({ ...b, x: bestX, y: bestY });
    }
    return placed;
  }, [bubbles]);

  // Compute SVG viewbox from placed bubbles
  const viewBox = useMemo(() => {
    if (layoutBubbles.length === 0) return "0 0 680 400";
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const b of layoutBubbles) {
      minX = Math.min(minX, b.x - b.r);
      minY = Math.min(minY, b.y - b.r);
      maxX = Math.max(maxX, b.x + b.r);
      maxY = Math.max(maxY, b.y + b.r);
    }
    const pad = 20;
    return `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;
  }, [layoutBubbles]);

  // Color scale: map metric value to a gradient
  const getColor = useCallback((metric) => {
    if (metric === null) return resolveCssColor(C.dim);
    // Scale from 0→100%: deep blue (low) → gold (mid) → bright green (high)
    const t = Math.max(0, Math.min(1, metric / 100));
    if (t < 0.5) {
      const s = t * 2;
      return `hsl(${210 + s * 30}, ${50 + s * 20}%, ${25 + s * 20}%)`;
    } else {
      const s = (t - 0.5) * 2;
      return `hsl(${140 - s * 20}, ${55 + s * 20}%, ${35 + s * 20}%)`;
    }
  }, []);

  return (
    <section id="factor-finder" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
      <SectionHeader
        number="Part I"
        title="The Factor Finder"
        subtitle="Each bubble is a demographic group. Size = number of respondents. Color intensity = how strongly that group scores on the selected outcome. Which clusters light up?"
        icon="◉"
      />

      {/* Controls */}
      <div style={{
        display: "flex", gap: "1.5rem", marginBottom: "2rem",
        flexWrap: "wrap", alignItems: "flex-end",
      }}>
        <div>
          <label style={{
            fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.12em",
            textTransform: "uppercase", color: C.muted, display: "block", marginBottom: "0.3rem",
          }}>
            Demographic Dimension
          </label>
          <select
            value={selectedDim.id}
            onChange={e => setSelectedDim(ANALYSIS_DIMENSIONS.find(d => d.id === e.target.value))}
            style={{
              background: resolveCssColor(C.bgDeep), color: resolveCssColor(C.textBright),
              border: `1px solid ${resolveCssColor(C.ghost)}`, borderRadius: 6,
              padding: "0.45rem 0.8rem", fontFamily: FONT.condensed, fontSize: "0.85rem",
              textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", outline: "none",
            }}
          >
            {ANALYSIS_DIMENSIONS.map(d => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{
            fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.12em",
            textTransform: "uppercase", color: C.muted, display: "block", marginBottom: "0.3rem",
          }}>
            Color by Outcome
          </label>
          <select
            value={selectedMetric.id}
            onChange={e => setSelectedMetric(OUTCOME_METRICS.find(m => m.id === e.target.value))}
            style={{
              background: resolveCssColor(C.bgDeep), color: resolveCssColor(C.textBright),
              border: `1px solid ${resolveCssColor(C.ghost)}`, borderRadius: 6,
              padding: "0.45rem 0.8rem", fontFamily: FONT.condensed, fontSize: "0.85rem",
              textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", outline: "none",
            }}
          >
            {OUTCOME_METRICS.filter(m => m.id !== "pathway_intact").map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bubble Chart */}
      <div style={{
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
        padding: "1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.25)", position: "relative",
        minHeight: 400,
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "6rem", color: C.muted, fontStyle: "italic" }}>
            Clustering demographic factors…
          </div>
        ) : (
          <>
            <svg ref={svgRef} viewBox={viewBox} style={{ width: "100%", maxHeight: 450 }}>
              <defs>
                {layoutBubbles.map(b => (
                  <radialGradient key={`grad-${b.id}`} id={`grad-${b.id}`}>
                    <stop offset="0%" stopColor={getColor(b.metric)} stopOpacity="0.9" />
                    <stop offset="80%" stopColor={getColor(b.metric)} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={getColor(b.metric)} stopOpacity="0.3" />
                  </radialGradient>
                ))}
              </defs>

              {layoutBubbles.map((b, i) => {
                const isHovered = hoveredBubble === b.id;
                return (
                  <g key={b.id}
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                      transform: isHovered ? `scale(1.08)` : "scale(1)",
                      transformOrigin: `${b.x}px ${b.y}px`,
                    }}
                    onMouseEnter={(e) => {
                      setHoveredBubble(b.id);
                      tooltip.showTooltip(e, `${b.fullLabel}\nn = ${b.n}\n${selectedMetric.label}: ${b.metric !== null ? b.metric.toFixed(1) + "%" : "N/A"}`);
                    }}
                    onMouseMove={tooltip.moveTooltip}
                    onMouseLeave={() => { setHoveredBubble(null); tooltip.hideTooltip(); }}
                  >
                    <circle
                      cx={b.x} cy={b.y} r={b.r}
                      fill={`url(#grad-${b.id})`}
                      stroke={isHovered ? resolveCssColor(C.goldBright) : getColor(b.metric)}
                      strokeWidth={isHovered ? 2.5 : 1}
                      strokeOpacity={isHovered ? 1 : 0.4}
                    />
                    {b.r > 30 && (
                      <>
                        <text
                          x={b.x} y={b.y - 5}
                          textAnchor="middle"
                          style={{
                            fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                            fontSize: Math.min(b.r * 0.32, 12),
                            fill: "#fff",
                            fontWeight: 600,
                            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                            pointerEvents: "none",
                          }}
                        >
                          {b.label}
                        </text>
                        <text
                          x={b.x} y={b.y + Math.min(b.r * 0.32, 12) + 2}
                          textAnchor="middle"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: Math.min(b.r * 0.35, 14),
                            fill: "#fff",
                            fontWeight: 700,
                            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                            pointerEvents: "none",
                          }}
                        >
                          {b.metric !== null ? `${b.metric.toFixed(0)}%` : "—"}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div style={{
              display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1rem",
              fontFamily: FONT.mono, fontSize: "0.65rem", color: C.muted,
            }}>
              <span>◯ Size = n respondents</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: getColor(20) }} />
                Low
                <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: getColor(50) }} />
                Mid
                <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: getColor(85) }} />
                High
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: PERSONA BUILDER — "How Many Are Like Me?"
// ═══════════════════════════════════════════════════════════════════════════

const PERSONA_OUTCOMES = [
  { id: "keep_intact", label: "Would Keep Son Intact", qid: "final_child_decision_reason", extractor: "keep_intact", icon: "🛡" },
  { id: "resentment", label: "Strong Resentment/Grief", qid: "circ_regret_feeling", extractor: "strong_resentment", icon: "💔" },
  { id: "lube_always", label: "Lube Always Needed", qid: "exp_lubrication_need", extractor: "lube_always", icon: "💧" },
  { id: "intact_aesthetic", label: "Prefers Intact Look", qid: "final_aesthetic_preference", extractor: "intact_aesthetic", icon: "👁" },
  { id: "autonomy", label: "Prioritizes Autonomy", qid: "final_core_principle_choice", extractor: "autonomy", icon: "⚖" },
];

function extractPersonaMetric(extractor, distribution, n) {
  if (!distribution || !n || n === 0) return null;
  const find = (substr) => distribution.find(d => d.label && d.label.toLowerCase().includes(substr.toLowerCase()))?.n || 0;
  switch (extractor) {
    case "keep_intact": return (find("remains intact") / n) * 100;
    case "strong_resentment": return (find("strong and frequent") / n) * 100;
    case "lube_always": return (find("always or almost always necessary") / n) * 100;
    case "intact_aesthetic": {
      const s = find("strongly prefer the appearance of the intact");
      const sl = find("slightly prefer the appearance of the intact");
      return ((s + sl) / n) * 100;
    }
    case "autonomy": return (find("Bodily Autonomy") / n) * 100;
    default: return null;
  }
}

function PersonaBuilder() {
  const dims = DEMOGRAPHIC_DIMENSIONS.filter(d => d.id !== "pathway");
  const [selections, setSelections] = useState({});
  const [personaData, setPersonaData] = useState(null);
  const [baselineData, setBaselineData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch baseline (overall) on mount
  useEffect(() => {
    Promise.all(
      PERSONA_OUTCOMES.map(o =>
        getResponseDistribution(o.qid)
          .then(d => ({ id: o.id, dist: d }))
          .catch(() => ({ id: o.id, dist: null }))
      )
    ).then(results => {
      const map = {};
      results.forEach(r => { map[r.id] = r.dist; });
      setBaselineData(map);
    });
  }, []);

  // Fetch persona-specific data whenever selections change
  useEffect(() => {
    const activeSelections = Object.entries(selections).filter(([, v]) => v);
    if (activeSelections.length === 0) { setPersonaData(null); return; }

    setLoading(true);
    const cohort = {};
    activeSelections.forEach(([k, v]) => { cohort[k] = v; });

    Promise.all(
      PERSONA_OUTCOMES.map(o =>
        getResponseDistribution(o.qid, { cohort })
          .then(d => ({ id: o.id, dist: d }))
          .catch(() => ({ id: o.id, dist: null }))
      )
    ).then(results => {
      const map = {};
      results.forEach(r => { map[r.id] = r.dist; });
      setPersonaData(map);
      setLoading(false);
    });
  }, [JSON.stringify(selections)]);

  const activeCount = Object.values(selections).filter(Boolean).length;
  const personaN = personaData ? Object.values(personaData).find(d => d && d.n)?.n || 0 : 0;

  return (
    <section id="persona-builder" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
      <SectionHeader
        number="Part II"
        title="How Many Are Like Me?"
        subtitle="Build a demographic profile and see how many respondents match — and what their outcomes look like compared to the overall population."
        icon="◈"
      />

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "2rem",
      }}>
        {/* Left: Selectors */}
        <div style={{
          background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
          padding: "1.5rem",
        }}>
          <div style={{
            fontFamily: FONT.condensed, fontSize: "0.72rem", letterSpacing: "0.12em",
            textTransform: "uppercase", color: C.goldBright, fontWeight: 700,
            marginBottom: "1.2rem", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem",
          }}>
            Build Your Profile
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {dims.map(dim => {
              const options = dim.options.map(o => typeof o === "string" ? o : o.value);
              return (
                <div key={dim.id}>
                  <label style={{
                    fontFamily: FONT.condensed, fontSize: "0.62rem", letterSpacing: "0.1em",
                    textTransform: "uppercase", color: C.dim, display: "block", marginBottom: "0.2rem",
                  }}>
                    {dim.label}
                  </label>
                  <select
                    value={selections[dim.column] || ""}
                    onChange={e => {
                      const val = e.target.value;
                      setSelections(prev => {
                        const next = { ...prev };
                        if (val) next[dim.column] = val;
                        else delete next[dim.column];
                        return next;
                      });
                    }}
                    style={{
                      width: "100%", background: resolveCssColor(C.bgDeep),
                      color: selections[dim.column] ? resolveCssColor(C.textBright) : resolveCssColor(C.muted),
                      border: `1px solid ${selections[dim.column] ? resolveCssColor(C.gold) : resolveCssColor(C.ghost)}`,
                      borderRadius: 6, padding: "0.4rem 0.6rem",
                      fontFamily: FONT.body, fontSize: "0.78rem", cursor: "pointer", outline: "none",
                    }}
                  >
                    <option value="">— Any —</option>
                    {options.map(o => (
                      <option key={o} value={o}>{shorten(o)}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          {activeCount > 0 && (
            <button
              onClick={() => setSelections({})}
              style={{
                marginTop: "1rem", background: "transparent", border: "none",
                color: C.muted, fontFamily: FONT.condensed, fontSize: "0.65rem",
                letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Reset all selections
            </button>
          )}
        </div>

        {/* Right: Results */}
        <div>
          {/* Persona count badge */}
          <div style={{
            background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
            padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center",
          }}>
            {activeCount === 0 ? (
              <div style={{
                fontFamily: FONT.body, fontSize: "0.9rem", color: C.muted,
                fontStyle: "italic", padding: "1rem",
              }}>
                Select one or more dimensions to see how many respondents match your profile.
              </div>
            ) : loading ? (
              <div style={{ color: C.muted, fontStyle: "italic", padding: "1rem" }}>
                Searching…
              </div>
            ) : (
              <>
                <div style={{
                  fontFamily: FONT.mono, fontSize: "3.5rem", fontWeight: 800,
                  color: personaN >= 5 ? resolveCssColor(C.goldBright) : resolveCssColor(C.red),
                  lineHeight: 1,
                  textShadow: personaN >= 5 ? "0 0 20px rgba(212,160,48,0.3)" : "none",
                }}>
                  {personaN}
                </div>
                <div style={{
                  fontFamily: FONT.condensed, fontSize: "0.72rem", letterSpacing: "0.12em",
                  textTransform: "uppercase", color: C.muted, marginTop: "0.3rem",
                }}>
                  respondents match your profile
                </div>
                {personaN > 0 && personaN < 5 && (
                  <div style={{
                    marginTop: "0.8rem", padding: "0.5rem 0.8rem",
                    background: "rgba(217,79,79,0.08)", border: `1px solid rgba(217,79,79,0.25)`,
                    borderRadius: 6, fontFamily: FONT.body, fontSize: "0.72rem", color: C.red,
                  }}>
                    ⚠ Too few respondents for meaningful percentages. Try removing a filter.
                  </div>
                )}
              </>
            )}
          </div>

          {/* Outcome metrics with deltas */}
          {personaN >= 5 && baselineData && personaData && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {PERSONA_OUTCOMES.map(outcome => {
                const pDist = personaData[outcome.id];
                const bDist = baselineData[outcome.id];
                const pVal = pDist ? extractPersonaMetric(outcome.extractor, pDist.distribution, pDist.n) : null;
                const bVal = bDist ? extractPersonaMetric(outcome.extractor, bDist.distribution, bDist.n) : null;
                const delta = pVal !== null && bVal !== null ? pVal - bVal : null;

                return (
                  <div key={outcome.id} style={{
                    background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 8,
                    padding: "0.8rem 1rem", display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: "1rem",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "1.1rem" }}>{outcome.icon}</span>
                      <span style={{
                        fontFamily: FONT.body, fontSize: "0.8rem", color: C.textBright,
                        fontWeight: 500,
                      }}>
                        {outcome.label}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span style={{
                        fontFamily: FONT.mono, fontSize: "1.1rem", fontWeight: 700,
                        color: resolveCssColor(C.textBright),
                      }}>
                        {pVal !== null ? `${pVal.toFixed(1)}%` : "—"}
                      </span>

                      {delta !== null && Math.abs(delta) >= 1 && (
                        <span style={{
                          fontFamily: FONT.mono, fontSize: "0.72rem", fontWeight: 600,
                          color: delta > 0 ? resolveCssColor(C.green) : resolveCssColor(C.red),
                          background: delta > 0 ? "rgba(104,184,120,0.1)" : "rgba(217,79,79,0.1)",
                          border: `1px solid ${delta > 0 ? "rgba(104,184,120,0.25)" : "rgba(217,79,79,0.25)"}`,
                          padding: "0.15rem 0.5rem", borderRadius: 4,
                          whiteSpace: "nowrap",
                        }}>
                          {delta > 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}pp
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div style={{
                fontFamily: FONT.mono, fontSize: "0.6rem", color: C.dim, textAlign: "right",
                marginTop: "0.3rem",
              }}>
                Deltas shown vs. overall population (pp = percentage points)
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: TEST YOUR ASSUMPTIONS — Dynamic Quiz
// ═══════════════════════════════════════════════════════════════════════════

const QUIZ_QUESTIONS = [
  {
    id: "q1",
    question: "Which political group has the HIGHEST rate of saying they'd keep a future son intact?",
    dimension: "politics",
    qid: "final_child_decision_reason",
    extractor: "keep_intact",
    answerNote: "All political groups show remarkably similar rates — this issue transcends party lines.",
  },
  {
    id: "q2",
    question: "Which education level reports the HIGHEST rate of needing lubrication during sex?",
    dimension: "education",
    qid: "exp_lubrication_need",
    extractor: "lube_always",
    answerNote: "The relationship between education and functional outcomes challenges assumptions about who experiences these effects.",
  },
  {
    id: "q3",
    question: "Which generation reports the STRONGEST feelings of resentment about their circumcision?",
    dimension: "generation",
    qid: "circ_regret_feeling",
    extractor: "strong_resentment",
    answerNote: "Younger generations, raised with greater access to information about bodily autonomy, consistently report stronger feelings.",
  },
  {
    id: "q4",
    question: "Which religious tradition's respondents are MOST likely to prefer the intact aesthetic?",
    dimension: "primary_tradition",
    qid: "final_aesthetic_preference",
    extractor: "intact_aesthetic",
    answerNote: "Aesthetic preference follows personal experience more than theological doctrine.",
  },
  {
    id: "q5",
    question: "Which socioeconomic background has the HIGHEST rate of prioritizing bodily autonomy?",
    dimension: "socioeconomic",
    qid: "final_core_principle_choice",
    extractor: "autonomy",
    answerNote: "The autonomy principle resonates across class lines, though the framing of the debate may differ by community.",
  },
];

function QuizSection() {
  const [currentQ, setCurrentQ] = useState(0);
  const [guess, setGuess] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const q = QUIZ_QUESTIONS[currentQ];

  useEffect(() => {
    setLoading(true);
    setGuess(null);
    setRevealed(false);
    getAggregate(q.qid, { by: q.dimension })
      .then(res => {
        setQuizData(res.results || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentQ, q.qid, q.dimension]);

  // Process quiz data into ranked choices
  const choices = useMemo(() => {
    if (!quizData) return [];
    return Object.entries(quizData)
      .filter(([key]) => key && key !== "null" && key !== "unknown" && key !== "" && key !== "observer" && key !== "Prefer not to say" && key !== "Prefer not to say / Unsure" && key !== "Prefer not to say.")
      .map(([key, val]) => {
        const metric = extractPersonaMetric(q.extractor, val.distribution, val.n);
        return { id: key, label: shorten(key), fullLabel: key, n: val.n, metric };
      })
      .filter(c => c.n >= 5 && c.metric !== null)
      .sort((a, b) => b.metric - a.metric);
  }, [quizData, q.extractor]);

  const correctAnswer = choices[0]?.id;
  const isCorrect = guess === correctAnswer;

  const handleGuess = (choiceId) => {
    if (revealed) return;
    setGuess(choiceId);
  };

  const handleReveal = () => {
    if (!guess) return;
    setRevealed(true);
    setAnswered(a => a + 1);
    if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(c => c + 1);
    }
  };

  return (
    <section id="quiz" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
      <SectionHeader
        number="Part III"
        title="Test Your Assumptions"
        subtitle="Think you know which demographics predict which outcomes? Guess which group leads — then see if the data agrees."
        icon="◇"
      />

      <div style={{
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
        padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      }}>
        {/* Progress */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "1.5rem",
        }}>
          <div style={{
            fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.12em",
            textTransform: "uppercase", color: C.dim,
          }}>
            Question {currentQ + 1} of {QUIZ_QUESTIONS.length}
          </div>
          <div style={{
            fontFamily: FONT.mono, fontSize: "0.72rem", color: C.goldBright,
          }}>
            Score: {score}/{answered}
          </div>
        </div>

        {/* Question */}
        <h3 style={{
          fontFamily: FONT.display, fontSize: "1.35rem", fontWeight: 700,
          color: C.textBright, lineHeight: 1.35, marginBottom: "1.5rem",
          letterSpacing: "-0.01em",
        }}>
          {q.question}
        </h3>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
            Loading data…
          </div>
        ) : (
          <>
            {/* Answer options */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "0.6rem", marginBottom: "1.5rem",
            }}>
              {choices.map(choice => {
                const isGuessed = guess === choice.id;
                const isAnswer = revealed && choice.id === correctAnswer;
                const isWrong = revealed && isGuessed && !isCorrect;

                let bg = "rgba(255,255,255,0.03)";
                let border = C.ghost;
                let textColor = C.textBright;

                if (isGuessed && !revealed) { bg = "rgba(212,160,48,0.12)"; border = C.goldBright; }
                if (isAnswer) { bg = "rgba(104,184,120,0.12)"; border = "rgba(104,184,120,0.6)"; textColor = C.green; }
                if (isWrong) { bg = "rgba(217,79,79,0.12)"; border = "rgba(217,79,79,0.6)"; textColor = C.red; }

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleGuess(choice.id)}
                    disabled={revealed}
                    style={{
                      background: bg,
                      border: `1px solid ${typeof border === "string" && border.startsWith("var(") ? resolveCssColor(border) : border}`,
                      borderRadius: 8, padding: "0.7rem 0.9rem",
                      color: typeof textColor === "string" && textColor.startsWith("var(") ? resolveCssColor(textColor) : textColor,
                      fontFamily: FONT.body, fontSize: "0.82rem", fontWeight: 500,
                      cursor: revealed ? "default" : "pointer",
                      transition: "all 0.15s",
                      textAlign: "left",
                      opacity: revealed && !isAnswer && !isWrong ? 0.5 : 1,
                    }}
                  >
                    <div>{choice.label}</div>
                    {revealed && (
                      <div style={{
                        fontFamily: FONT.mono, fontSize: "0.68rem", marginTop: "0.3rem",
                        opacity: 0.8,
                      }}>
                        {choice.metric.toFixed(1)}% (n={choice.n})
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Reveal / Next buttons */}
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {!revealed ? (
                <button
                  onClick={handleReveal}
                  disabled={!guess}
                  style={{
                    background: guess ? resolveCssColor(C.goldBright) : resolveCssColor(C.ghost),
                    color: guess ? "#0a0a0c" : resolveCssColor(C.dim),
                    border: "none", borderRadius: 8, padding: "0.6rem 1.5rem",
                    fontFamily: FONT.condensed, fontSize: "0.85rem", fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    cursor: guess ? "pointer" : "not-allowed",
                    transition: "all 0.15s",
                  }}
                >
                  Reveal Answer
                </button>
              ) : (
                <>
                  <div style={{
                    flex: 1, fontFamily: FONT.body, fontSize: "0.85rem",
                    color: isCorrect ? resolveCssColor(C.green) : resolveCssColor(C.muted),
                    fontStyle: "italic", lineHeight: 1.4,
                  }}>
                    {isCorrect ? "✓ Correct! " : "✗ Not quite. "}
                    {q.answerNote}
                  </div>
                  {currentQ < QUIZ_QUESTIONS.length - 1 && (
                    <button
                      onClick={handleNext}
                      style={{
                        background: resolveCssColor(C.goldBright), color: "#0a0a0c",
                        border: "none", borderRadius: 8, padding: "0.6rem 1.5rem",
                        fontFamily: FONT.condensed, fontSize: "0.85rem", fontWeight: 700,
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        cursor: "pointer", flexShrink: 0,
                      }}
                    >
                      Next →
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Ranked bar chart (revealed) */}
            {revealed && (
              <div style={{ marginTop: "2rem", borderTop: `1px solid ${C.ghost}`, paddingTop: "1.5rem" }}>
                <div style={{
                  fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.12em",
                  textTransform: "uppercase", color: C.dim, marginBottom: "0.8rem",
                }}>
                  Full Ranking
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {choices.map((choice, i) => {
                    const maxMetric = choices[0]?.metric || 100;
                    const barWidth = (choice.metric / maxMetric) * 100;
                    const isTop = i === 0;
                    return (
                      <div key={choice.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{
                          fontFamily: FONT.body, fontSize: "0.72rem", color: C.text,
                          minWidth: 100, textAlign: "right",
                        }}>
                          {choice.label}
                        </span>
                        <div style={{
                          flex: 1, height: 18, background: "rgba(255,255,255,0.04)",
                          borderRadius: 4, overflow: "hidden",
                        }}>
                          <div style={{
                            width: `${barWidth}%`, height: "100%",
                            background: isTop ? resolveCssColor(C.goldBright) : resolveCssColor(C.dim),
                            borderRadius: 4, transition: "width 0.4s ease",
                            display: "flex", alignItems: "center", justifyContent: "flex-end",
                            paddingRight: "0.4rem",
                          }}>
                            <span style={{
                              fontFamily: FONT.mono, fontSize: "0.58rem",
                              color: isTop ? "#0a0a0c" : "#fff",
                              fontWeight: 600, whiteSpace: "nowrap",
                            }}>
                              {choice.metric.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <span style={{
                          fontFamily: FONT.mono, fontSize: "0.58rem", color: C.dim,
                          minWidth: 35, textAlign: "right",
                        }}>
                          n={choice.n}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: FACTOR GRID — Heatmap
// ═══════════════════════════════════════════════════════════════════════════

const GRID_OUTCOMES = [
  { id: "keep_intact", label: "Keep Son Intact", short: "Intact", qid: "final_child_decision_reason", extractor: "keep_intact" },
  { id: "resentment", label: "Strong Resentment", short: "Resentment", qid: "circ_regret_feeling", extractor: "strong_resentment" },
  { id: "lube", label: "Always Needs Lube", short: "Lube", qid: "exp_lubrication_need", extractor: "lube_always" },
  { id: "aesthetic", label: "Prefers Intact Look", short: "Aesthetic", qid: "final_aesthetic_preference", extractor: "intact_aesthetic" },
];

function FactorGrid() {
  const [gridData, setGridData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCell, setExpandedCell] = useState(null);

  useEffect(() => {
    // Fetch all dim × outcome combinations
    const tasks = [];
    for (const dim of ANALYSIS_DIMENSIONS) {
      for (const out of GRID_OUTCOMES) {
        tasks.push(
          getAggregate(out.qid, { by: dim.column })
            .then(res => ({ dimId: dim.id, outId: out.id, results: res.results || {} }))
            .catch(() => ({ dimId: dim.id, outId: out.id, results: {} }))
        );
      }
    }

    Promise.all(tasks).then(results => {
      const grid = {};
      for (const r of results) {
        if (!grid[r.dimId]) grid[r.dimId] = {};
        const outcome = GRID_OUTCOMES.find(o => o.id === r.outId);

        // Calculate metric for each category
        const categories = Object.entries(r.results)
          .filter(([k]) => k && k !== "null" && k !== "unknown" && k !== "" && k !== "observer" && k !== "Prefer not to say" && k !== "Prefer not to say / Unsure" && k !== "Prefer not to say.")
          .map(([k, v]) => ({
            label: shorten(k),
            fullLabel: k,
            n: v.n,
            metric: extractPersonaMetric(outcome.extractor, v.distribution, v.n),
          }))
          .filter(c => c.n >= 5 && c.metric !== null)
          .sort((a, b) => b.metric - a.metric);

        const metrics = categories.map(c => c.metric);
        const range = metrics.length > 1 ? Math.max(...metrics) - Math.min(...metrics) : 0;

        grid[r.dimId][r.outId] = {
          categories,
          min: metrics.length > 0 ? Math.min(...metrics) : 0,
          max: metrics.length > 0 ? Math.max(...metrics) : 0,
          range,
          avg: metrics.length > 0 ? metrics.reduce((s, m) => s + m, 0) / metrics.length : 0,
        };
      }
      setGridData(grid);
      setLoading(false);
    });
  }, []);

  // Find the most predictive dimension per outcome
  const mostPredictive = useMemo(() => {
    if (!gridData) return {};
    const mp = {};
    for (const out of GRID_OUTCOMES) {
      let maxRange = 0, maxDim = null;
      for (const dim of ANALYSIS_DIMENSIONS) {
        const cell = gridData[dim.id]?.[out.id];
        if (cell && cell.range > maxRange) { maxRange = cell.range; maxDim = dim.id; }
      }
      mp[out.id] = maxDim;
    }
    return mp;
  }, [gridData]);

  // Color for heatmap cell based on range
  const getCellColor = (range) => {
    const t = Math.min(1, range / 40); // 40pp spread = max intensity
    return `rgba(212, 160, 48, ${0.05 + t * 0.35})`;
  };

  return (
    <section id="factor-grid" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
      <SectionHeader
        number="Part IV"
        title="The Factor Grid"
        subtitle="Where does the data diverge most? Cells with the widest spread glow gold — these are the demographic dimensions that most strongly predict each outcome. Click any cell to expand the full ranking."
        icon="▦"
      />

      <div style={{
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
        padding: "1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        overflowX: "auto",
      }}>
        {loading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
            Computing factor grid across {ANALYSIS_DIMENSIONS.length * GRID_OUTCOMES.length} combinations…
          </div>
        ) : gridData && (
          <table style={{
            width: "100%", borderCollapse: "collapse",
            fontFamily: FONT.body, fontSize: "0.78rem",
          }}>
            <thead>
              <tr>
                <th style={{
                  textAlign: "left", padding: "0.6rem 0.8rem",
                  fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: C.dim, fontWeight: 700,
                  borderBottom: `2px solid ${C.ghost}`,
                }}>
                  Dimension
                </th>
                {GRID_OUTCOMES.map(out => (
                  <th key={out.id} style={{
                    textAlign: "center", padding: "0.6rem 0.5rem",
                    fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.1em",
                    textTransform: "uppercase", color: C.dim, fontWeight: 700,
                    borderBottom: `2px solid ${C.ghost}`, minWidth: 100,
                  }}>
                    {out.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ANALYSIS_DIMENSIONS.map(dim => (
                <>
                  <tr key={dim.id}>
                    <td style={{
                      padding: "0.6rem 0.8rem", fontWeight: 600, color: C.textBright,
                      borderBottom: `1px solid ${C.ghost}`,
                    }}>
                      {dim.label}
                    </td>
                    {GRID_OUTCOMES.map(out => {
                      const cell = gridData[dim.id]?.[out.id];
                      const isMostPredictive = mostPredictive[out.id] === dim.id;
                      const isExpanded = expandedCell === `${dim.id}-${out.id}`;

                      return (
                        <td
                          key={out.id}
                          onClick={() => setExpandedCell(isExpanded ? null : `${dim.id}-${out.id}`)}
                          style={{
                            padding: "0.5rem",
                            textAlign: "center",
                            borderBottom: `1px solid ${C.ghost}`,
                            background: cell ? getCellColor(cell.range) : "transparent",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            position: "relative",
                            boxShadow: isMostPredictive ? `inset 0 0 0 2px ${resolveCssColor(C.goldBright)}` : "none",
                          }}
                        >
                          {cell && cell.categories.length > 0 ? (
                            <>
                              <div style={{
                                fontFamily: FONT.mono, fontSize: "0.72rem",
                                color: isMostPredictive ? resolveCssColor(C.goldBright) : C.textBright,
                                fontWeight: isMostPredictive ? 700 : 400,
                              }}>
                                {cell.min.toFixed(0)}–{cell.max.toFixed(0)}%
                              </div>
                              <div style={{
                                fontFamily: FONT.mono, fontSize: "0.52rem", color: C.dim,
                                marginTop: "0.1rem",
                              }}>
                                Δ{cell.range.toFixed(0)}pp
                              </div>
                              {isMostPredictive && (
                                <div style={{
                                  position: "absolute", top: 2, right: 4,
                                  fontFamily: FONT.mono, fontSize: "0.5rem",
                                  color: resolveCssColor(C.goldBright),
                                }}>
                                  ★
                                </div>
                              )}
                            </>
                          ) : (
                            <span style={{ color: C.dim, fontSize: "0.65rem" }}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Expanded detail row */}
                  {GRID_OUTCOMES.map(out => {
                    if (expandedCell !== `${dim.id}-${out.id}`) return null;
                    const cell = gridData[dim.id]?.[out.id];
                    if (!cell || cell.categories.length === 0) return null;

                    return (
                      <tr key={`${dim.id}-${out.id}-detail`}>
                        <td colSpan={GRID_OUTCOMES.length + 1} style={{
                          padding: "1rem 1.5rem",
                          background: "rgba(212,160,48,0.03)",
                          borderBottom: `1px solid ${C.ghost}`,
                        }}>
                          <div style={{
                            fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.1em",
                            textTransform: "uppercase", color: C.goldBright, marginBottom: "0.8rem",
                            fontWeight: 700,
                          }}>
                            {dim.label} → {out.label} (sorted highest → lowest)
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                            {cell.categories.map((cat, i) => {
                              const barWidth = cell.max > 0 ? (cat.metric / cell.max) * 100 : 0;
                              return (
                                <div key={cat.fullLabel} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                  <span style={{
                                    fontFamily: FONT.body, fontSize: "0.7rem", color: C.text,
                                    minWidth: 110, textAlign: "right",
                                  }}>
                                    {cat.label}
                                  </span>
                                  <div style={{
                                    flex: 1, height: 16, background: "rgba(255,255,255,0.04)",
                                    borderRadius: 3, overflow: "hidden",
                                  }}>
                                    <div style={{
                                      width: `${barWidth}%`, height: "100%",
                                      background: i === 0 ? resolveCssColor(C.goldBright) : resolveCssColor(C.dim),
                                      borderRadius: 3,
                                      display: "flex", alignItems: "center", justifyContent: "flex-end",
                                      paddingRight: "0.3rem",
                                    }}>
                                      {barWidth > 15 && (
                                        <span style={{
                                          fontFamily: FONT.mono, fontSize: "0.55rem",
                                          color: i === 0 ? "#0a0a0c" : "#fff", fontWeight: 600,
                                        }}>
                                          {cat.metric.toFixed(1)}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {barWidth <= 15 && (
                                    <span style={{
                                      fontFamily: FONT.mono, fontSize: "0.55rem", color: C.dim,
                                    }}>
                                      {cat.metric.toFixed(1)}%
                                    </span>
                                  )}
                                  <span style={{
                                    fontFamily: FONT.mono, fontSize: "0.5rem", color: C.dim,
                                    minWidth: 30,
                                  }}>
                                    n={cat.n}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </>
              ))}
            </tbody>
          </table>
        )}

        {/* Legend */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1.2rem",
          fontFamily: FONT.mono, fontSize: "0.6rem", color: C.dim,
        }}>
          <span>★ = Most predictive dimension for that outcome</span>
          <span>Δpp = range in percentage points across categories</span>
          <span>Click any cell to expand</span>
        </div>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function ByTheNumbersPage({ routerState, navigate, updateState, setCustomMeta, setExhibitContext }) {
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  const [activeSection, setActiveSection] = useState("factor-finder");

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        exhibitName: "By The Numbers",
        exhibitDescription: "Interactive factor analysis: which demographics predict which outcomes?",
      });
    }
  }, [setExhibitContext]);

  useEffect(() => {
    if (setCustomMeta) {
      setCustomMeta({
        kicker: "Exhibit 12",
        title: "By the Numbers",
        desc: "Which factors matter? An interactive exploration of demographic predictors.",
        navTitle: "By the Numbers",
      });
    }
  }, [setCustomMeta]);

  const sections = [
    { id: "snapshots", label: "At a Glance", icon: "★" },
    { id: "factor-finder", label: "Factor Finder", icon: "◉" },
    { id: "persona-builder", label: "Persona Builder", icon: "◈" },
    { id: "quiz", label: "Test Your Assumptions", icon: "◇" },
    { id: "factor-grid", label: "Factor Grid", icon: "▦" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: FONT.body, paddingBottom: "8rem",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2rem 0" }}>
        <InlineBreadcrumb currentRoute="numbers" navigate={navigate} />
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2rem 4rem" }}>
        <ExhibitHero
          title="By the Numbers"
          color="var(--c-goldBright)"
          gradientColor="var(--c-gold)"
          BackgroundIcon={Icons.BarChart2}
          description="Which factors really matter? Explore how education, politics, religion, generation, and socioeconomic status predict real outcomes — from resentment to aesthetic preferences. Build your own demographic persona, test your assumptions against the data, and discover which dimensions create the widest divides."
        />

        <div style={{
          display: "grid", gridTemplateColumns: "240px 1fr", gap: "3rem",
          alignItems: "start", marginTop: "3rem",
        }}>
          {/* LEFT: Nav sidebar */}
          <aside style={{
            position: "sticky",
            top: "calc(var(--header-height, 56px) + 1.5rem)",
            maxHeight: "calc(100vh - var(--header-height, 56px) - 3rem)",
            overflowY: "auto",
            display: "flex", flexDirection: "column", gap: "0.5rem",
            zIndex: 100,
          }}>
            <h3 style={{
              fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem",
              color: C.goldBright, letterSpacing: "0.1em", textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}>
              Topics
            </h3>

            {sections.map(s => (
              <div
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                style={{
                  cursor: "pointer", fontFamily: FONT.body, fontSize: "0.85rem",
                  color: activeSection === s.id ? resolveCssColor(C.goldBright) : C.text,
                  padding: "0.45rem 0.75rem", borderRadius: 6,
                  background: activeSection === s.id ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${activeSection === s.id ? resolveCssColor(C.gold) : C.ghost}`,
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                }}
                onMouseEnter={e => {
                  if (activeSection !== s.id) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = resolveCssColor(C.gold);
                  }
                }}
                onMouseLeave={e => {
                  if (activeSection !== s.id) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.borderColor = resolveCssColor(C.ghost);
                  }
                }}
              >
                <span style={{ fontSize: "1.1em" }}>{s.icon}</span> {s.label}
              </div>
            ))}
          </aside>

          {/* RIGHT: Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0rem" }}>
            <SnapshotWall />
            <FactorFinder tooltip={{ showTooltip, moveTooltip, hideTooltip }} />
            <PersonaBuilder />
            <QuizSection />
            <FactorGrid />
          </div>
        </div>
      </div>

      <Tooltip {...tooltip} />
    </div>
  );
}
