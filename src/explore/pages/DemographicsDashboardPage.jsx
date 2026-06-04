// ═══════════════════════════════════════════════════════════════════════════
// DemographicsDashboardPage.jsx — "Cohort X-Ray"
// An opinionated, visually striking demographics exhibit that leverages
// the survey's comparative nature. Answers: "Who are these people, and
// how do their demographics shape their experience?"
//
// Sections:
//   1. Population Mosaic  — Waffle chart showing proportional breakdown
//   2. Pathway DNA Strip  — Side-by-side stacked bars per demographic
//   3. Divergence Radar   — Spider chart comparing any two cohorts
//   4. Geographic Origins — World/US map reusing GeographicHeatmap
//   5. Correlation Matrix — Retained from v1
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { C, FONT, PATH_COLORS, API_BASE, resolveCssColor } from "../styles/tokens";

gsap.registerPlugin(ScrollTrigger);
import { getResponseDistribution, getAggregate, getCount } from "../lib/api";
import DemographicFilterBar, { DEMOGRAPHIC_DIMENSIONS } from "../components/DemographicFilterBar";
import CorrelationMatrix from "../components/CorrelationMatrix";

import AddToReportButton from "../components/AddToReportButton";
import SharePopover from "../components/SharePopover";
import { useTooltip, Tooltip } from "../components/Tooltip";
import GeographicHeatmap from "../components/GeographicHeatmap";
import DemographicSankey from "../components/DemographicSankey";
import InlineBreadcrumb from "../components/InlineBreadcrumb";


// ── Constants ──────────────────────────────────────────────────────────────

const PATHWAYS = [
  { id: "circumcised", label: "Circumcised", color: PATH_COLORS.circumcised },
  { id: "intact", label: "Intact", color: PATH_COLORS.intact },
  { id: "restoring", label: "Restoring", color: PATH_COLORS.restoring },
  { id: "observer", label: "Observer", color: PATH_COLORS.observer },
];

// Demographic dimensions to show in the DNA strip 
const DNA_DIMENSIONS = [
  { id: "generation", label: "Generation", by: "generation" },
  { id: "country_born", label: "Country of Birth", by: "country_born" },
  { id: "primary_tradition", label: "Religion", by: "religion" },
];

// A universal question that every pathway answers — used to get demographic breakdowns
const UNIVERSAL_Q = "final_social_norm_perception";

// Radar axes: key outcome metrics to compare across cohorts
const RADAR_AXES = [
  { id: "exp_pride_satisfaction_rating", label: "Pride & Satisfaction", short: "Pride" },
  { id: "exp_sex_rating_orgasm_intensity", label: "Orgasm Intensity", short: "Orgasm" },
  { id: "exp_sex_rating_sensitivity_light_touch", label: "Light Touch Sensitivity", short: "Sensitivity" },
  { id: "exp_sex_rating_ease_of_orgasm", label: "Ease of Orgasm", short: "Ease" },
  { id: "exp_sex_rating_variety_of_sensation", label: "Variety of Sensation", short: "Variety" },
  { id: "exp_sex_rating_pleasure_mobile_skin", label: "Mobile Skin Pleasure", short: "Mobile Skin" },
];

// Waffle dimension options
const WAFFLE_DIMENSIONS = [
  { id: "pathway", label: "Pathway" },
  { id: "generation", label: "Generation" },
  { id: "country_born", label: "Country" },
  { id: "primary_tradition", label: "Religion" },
];

// Cohort options for radar selectors
const RADAR_COHORTS = [
  { id: "circumcised", label: "Circumcised", pathway: "circumcised" },
  { id: "intact", label: "Intact", pathway: "intact" },
  { id: "restoring", label: "Restoring", pathway: "restoring" },
  { id: "observer", label: "Observer", pathway: "observer" },
];

// ── Color palette for non-pathway dimensions ───────────────────────────────
const CHART_COLORS = [
  "var(--chart-0)", "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
  "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)",
  "var(--chart-8)", "var(--chart-9)",
];

function getChartColor(idx) {
  return CHART_COLORS[idx % CHART_COLORS.length];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function optionToValue(opt) {
  if (!opt) return null;
  
  // Standard 1-5 numerical prefixes
  const match = opt.match(/^([1-5])/);
  if (match) return parseInt(match[1], 10);
  
  // Specific mappings for Pride & Satisfaction
  if (opt === "Very proud and satisfied") return 5;
  if (opt === "Generally proud and satisfied") return 4;
  if (opt === "Neutral or ambivalent") return 3;
  if (opt === "Somewhat dissatisfied") return 2;
  if (opt === "Very dissatisfied") return 1;
  
  return null;
}

function calculateWeightedAvg(distribution) {
  if (!distribution || distribution.length === 0) return 0;
  let sumProduct = 0, totalN = 0;
  distribution.forEach(d => {
    const val = optionToValue(d.label);
    if (val !== null) {
      sumProduct += val * d.n;
      totalN += d.n;
    }
  });
  return totalN > 0 ? sumProduct / totalN : 0;
}

// Shorten long labels for charts
function shortenLabel(label) {
  if (!label) return "";
  let s = label;
  // Shorten generation labels
  s = s.replace(/\s*\([^)]*\)\s*$/, "");
  s = s.replace("Millennial/Gen Y", "Millennial");
  s = s.replace("Xennial/Oregon Trail", "Xennial");
  s = s.replace("United States of America (USA)", "USA");
  s = s.replace("United States of America", "USA");
  s = s.replace("United Kingdom", "UK");
  s = s.replace("Secular / Atheist / Agnostic", "Secular/Atheist");
  s = s.replace("Spiritual but not religious", "Spiritual");
  s = s.replace("Pagan / Indigenous / Earth-based", "Pagan/Indigenous");
  if (s.length > 20) s = s.slice(0, 18) + "…";
  return s;
}

// ── Intersection Observer hook for lazy-loading sections ───────────────────
function useInView(options = {}) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.05, rootMargin: "200px", ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  
  return [ref, inView];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DemographicsDashboardPage({ routerState, navigate, updateState }) {
  const cohort = routerState?.cohort;
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  // Section refs for scroll navigation
  const sectionIds = ["mosaic", "dna", "radar", "geo", "corr"];
  const scrollTo = useCallback((id) => {
    document.getElementById(`xray-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const [activeSection, setActiveSection] = useState("geo");
  
  const [sankeyDims, setSankeyDims] = useState([
    DEMOGRAPHIC_DIMENSIONS.find(d => d.id === "country_born"),
    DEMOGRAPHIC_DIMENSIONS.find(d => d.id === "politics"),
    DEMOGRAPHIC_DIMENSIONS.find(d => d.id === "pathway")
  ]);

  const container = useRef(null);

  useGSAP(() => {
    // Scrollspy
    sectionIds.forEach(id => {
      ScrollTrigger.create({
        trigger: `#xray-${id}`,
        start: "top center",
        end: "bottom center",
        onToggle: self => {
          if (self.isActive) setActiveSection(id);
        }
      });
    });

    // Entrance Animations
    gsap.utils.toArray('.xray-section').forEach(section => {
      gsap.fromTo(section, 
        { opacity: 0, y: 50 },
        {
          opacity: 1, 
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
          }
        }
      );
    });
  }, { scope: container });

  return (
    <div ref={container} style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      paddingBottom: "6rem",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 2rem 0" }}>
        <InlineBreadcrumb currentRoute="demographics" navigate={navigate} />
      </div>

      <div style={{ padding: "4rem 2rem", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "260px 1fr", gap: "3rem", alignItems: "start" }}>
        
        {/* Left Column: Topic Navigator */}
        <aside style={{
          position: "sticky",
          top: "calc(var(--header-height, 56px) + 1.5rem)",
          maxHeight: "calc(100vh - var(--header-height, 56px) - 3rem)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          zIndex: 100,
        }}>
          <h3 style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", color: C.goldBright, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Exhibits
          </h3>
          {[
            { id: "geo", label: "Geographic Origins", icon: "◈" },
            { id: "mosaic", label: "Demographic Flow", icon: "〰" },
            { id: "dna", label: "Pathway DNA", icon: "≡" },
            { id: "radar", label: "Divergence Radar", icon: "◎" },
            { id: "corr", label: "Correlation Matrix", icon: "▥" },
          ].map(s => (
            <div
              key={s.id}
              onClick={() => scrollTo(s.id)}
              style={{
                cursor: "pointer",
                fontFamily: FONT.body,
                fontSize: "0.9rem",
                color: activeSection === s.id ? resolveCssColor(C.goldBright) : C.text,
                padding: "0.45rem 0.75rem",
                borderRadius: 6,
                background: activeSection === s.id ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${activeSection === s.id ? resolveCssColor(C.gold) : C.ghost}`,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
              onMouseEnter={e => { 
                if (activeSection !== s.id) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)"; 
                  e.currentTarget.style.borderColor = C.gold; 
                }
              }}
              onMouseLeave={e => { 
                if (activeSection !== s.id) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)"; 
                  e.currentTarget.style.borderColor = C.ghost; 
                }
              }}
            >
              <span style={{ fontSize: "1.1em" }}>{s.icon}</span> {s.label}
            </div>
          ))}
        </aside>

        {/* Right Column: Exhibits */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0rem" }}>
          {/* ═══ SECTION 1: GEOGRAPHIC ORIGINS ═══ */}
          <SectionAnchor id="geo" />
        <GeographicOrigins cohort={cohort} />
        
        {/* ═══ SECTION 2: DEMOGRAPHIC FLOW (SANKEY) ═══ */}
        <SectionAnchor id="mosaic" />
        <section className="xray-section" id="xray-mosaic" style={{ marginBottom: "4rem", minHeight: "600px" }}>
          <SectionHeader 
            title="Demographic Flow Explorer"
            subtitle="Build your own intersectional flow chart by selecting the three demographic dimensions you want to trace."
            icon="〰"
          />
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", justifyContent: "center", alignItems: "center" }}>
            {[0, 1, 2].map((idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <select
                  value={sankeyDims[idx].id}
                  onChange={(e) => {
                    const newDims = [...sankeyDims];
                    newDims[idx] = DEMOGRAPHIC_DIMENSIONS.find(d => d.id === e.target.value);
                    setSankeyDims(newDims);
                  }}
                  style={{
                    background: C.bgDeep,
                    color: C.goldBright,
                    border: `1px solid ${C.ghost}`,
                    borderRadius: 6,
                    padding: "0.4rem 0.8rem",
                    fontFamily: FONT.condensed,
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    outline: "none"
                  }}
                >
                  {DEMOGRAPHIC_DIMENSIONS.map(d => {
                    const isSelectedElsewhere = sankeyDims.some((selectedDim, i) => i !== idx && selectedDim.id === d.id);
                    return (
                      <option key={d.id} value={d.id} disabled={isSelectedElsewhere}>
                        {d.label === "Pathway" ? "Experiential Pathway" : d.label}
                      </option>
                    );
                  })}
                </select>
                {idx < 2 && <span style={{ color: C.dim }}>→</span>}
              </div>
            ))}
          </div>
          <div style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "2rem" }}>
            <DemographicSankey cohort={cohort} dimensions={sankeyDims} tooltip={{ showTooltip, moveTooltip, hideTooltip }} />
          </div>
        </section>

        {/* ═══ SECTION 3: PATHWAY DNA STRIP ═══ */}
        <SectionAnchor id="dna" />
        <PathwayDNAStrip cohort={cohort} tooltip={{ showTooltip, moveTooltip, hideTooltip }} />

        {/* ═══ SECTION 4: DIVERGENCE RADAR ═══ */}
        <SectionAnchor id="radar" />
        <DivergenceRadar cohort={cohort} tooltip={{ showTooltip, moveTooltip, hideTooltip }} />

        {/* ═══ SECTION 5: CORRELATION MATRIX ═══ */}
        <SectionAnchor id="corr" />
        <CorrelationSection cohort={cohort} />
        </div>
      </div>

      <Tooltip {...tooltip} />
    </div>
  );
}

function SectionAnchor({ id }) {
  return <div id={`xray-${id}`} style={{ scrollMarginTop: "2rem", height: 1 }} />;
}



// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: PATHWAY DNA STRIP (Side-by-side stacked bars)
// ═══════════════════════════════════════════════════════════════════════════

function PathwayDNAStrip({ cohort, tooltip }) {
  const [ref, inView] = useInView();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inView) return;
    setLoading(true);

    // For each DNA dimension, fetch aggregate data grouped by that dimension for each pathway
    Promise.all(
      DNA_DIMENSIONS.map(dim =>
        getAggregate(UNIVERSAL_Q, { by: dim.by, cohort })
          .then(res => ({ dim, results: res.results || {} }))
          .catch(() => ({ dim, results: {} }))
      )
    ).then(allResults => {
      const mapped = {};
      allResults.forEach(({ dim, results }) => {
        mapped[dim.id] = results;
      });
      setData(mapped);
      setLoading(false);
    });
  }, [inView, JSON.stringify(cohort)]);

  return (
    <section ref={ref} className="xray-section" style={{ marginBottom: "4rem", minHeight: "600px" }}>
      <SectionHeader 
        title="Pathway DNA Strip"
        subtitle="How does each pathway's demographic profile differ? Each row compares the full population breakdown across a dimension."
        icon="≡"
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: C.muted, fontStyle: "italic" }}>
          Sequencing pathway DNA…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {DNA_DIMENSIONS.map(dim => (
            <DNADimensionRow
              key={dim.id}
              dimension={dim}
              aggregateData={data[dim.id] || {}}
              tooltip={tooltip}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function DNADimensionRow({ dimension, aggregateData, tooltip }) {
  // aggregateData is keyed by the demographic value (e.g., "Gen Z", "USA")
  // Each value has { n, distribution: [{ label (pathway answer), n }] }
  // But we grouped by demographic dimension, so we need to restructure:
  // For each pathway, compute what % of its respondents fall into each demographic bucket.
  
  // First, get all unique demographic categories
  const categories = Object.keys(aggregateData)
    .filter(k => k && k !== "null" && k !== "unknown" && k !== "")
    .sort((a, b) => (aggregateData[b]?.n || 0) - (aggregateData[a]?.n || 0));

  // Assign colors to categories
  const categoryColors = {};
  categories.forEach((cat, idx) => {
    categoryColors[cat] = getChartColor(idx);
  });

  // The aggregate is grouped by the demographic dimension. 
  // aggregateData[genZ] = { n: total, distribution: [{ label: "agree", n }] }
  // But that's grouped by the ANSWER to the question, not by pathway.
  // Since we used `by: "generation"` (or similar), the top-level keys ARE the demographic values.
  // Each one's `n` tells us how many respondents from that demographic value answered the question.
  
  // To show per-pathway breakdown, we actually need the aggregate endpoint with by=pathway,
  // filtered per demographic dimension. That would be a lot of calls.
  // Instead, let's show the OVERALL demographic breakdown as a single beautiful stacked bar,
  // showing how the survey population is distributed across this dimension.
  
  const totalN = categories.reduce((s, cat) => s + (aggregateData[cat]?.n || 0), 0);

  if (totalN === 0) return null;

  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
      padding: "1.5rem 2rem", 
    }}>
      <div style={{
        fontFamily: FONT.condensed, fontSize: "0.78rem", letterSpacing: "0.08em",
        textTransform: "uppercase", color: C.goldBright, fontWeight: 700,
        marginBottom: "1rem",
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
      }}>
        <span>{dimension.label}</span>
        <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.dim, fontWeight: 400 }}>
          n = {totalN.toLocaleString()}
        </span>
      </div>

      {/* Stacked bar */}
      <div style={{
        display: "flex", height: 36, borderRadius: 6, overflow: "hidden",
        background: C.bgDeep, marginBottom: "0.75rem",
      }}>
        {categories.map((cat, idx) => {
          const n = aggregateData[cat]?.n || 0;
          const pct = (n / totalN) * 100;
          if (pct < 0.5) return null;
          const resolvedColor = resolveCssColor(categoryColors[cat]);
          return (
            <div
              key={cat}
              style={{
                width: `${pct}%`,
                background: resolvedColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", cursor: "pointer",
                transition: "filter 0.2s, opacity 0.2s",
                borderRight: idx < categories.length - 1 ? `1px solid ${resolveCssColor(C.bgCard)}` : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.3)";
                tooltip.showTooltip(e, `${cat}: ${pct.toFixed(1)}% (n=${n})`);
              }}
              onMouseMove={tooltip.moveTooltip}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
                tooltip.hideTooltip();
              }}
            >
              {pct > 6 && (
                <span style={{
                  fontFamily: FONT.condensed, fontSize: "0.58rem", color: "#fff",
                  textShadow: "0 1px 3px rgba(0,0,0,0.6)", whiteSpace: "nowrap",
                  letterSpacing: "0.03em", fontWeight: 600,
                }}>
                  {shortenLabel(cat)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 0.8rem" }}>
        {categories.slice(0, 10).map((cat, idx) => {
          const n = aggregateData[cat]?.n || 0;
          const pct = (n / totalN) * 100;
          return (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <div style={{
                width: 8, height: 8, borderRadius: 2,
                background: resolveCssColor(categoryColors[cat]),
              }} />
              <span style={{ fontFamily: FONT.body, fontSize: "0.68rem", color: C.muted }}>
                {shortenLabel(cat)} ({pct.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: DIVERGENCE RADAR (Spider Chart)
// ═══════════════════════════════════════════════════════════════════════════

function DivergenceRadar({ cohort, tooltip }) {
  const [ref, inView] = useInView();
  const [cohortA, setCohortA] = useState("circumcised");
  const [cohortB, setCohortB] = useState("intact");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inView) return;
    setLoading(true);

    // Fetch each radar axis's aggregate, grouped by pathway
    Promise.all(
      RADAR_AXES.map(axis =>
        getAggregate(axis.id, { by: "pathway", cohort })
          .then(res => ({ axis, results: res.results || {} }))
          .catch(() => ({ axis, results: {} }))
      )
    ).then(allResults => {
      const mapped = {};
      allResults.forEach(({ axis, results }) => {
        mapped[axis.id] = {};
        // For each pathway, calculate the weighted average
        Object.entries(results).forEach(([pathwayId, pathData]) => {
          mapped[axis.id][pathwayId] = calculateWeightedAvg(pathData.distribution);
        });
      });
      setData(mapped);
      setLoading(false);
    });
  }, [inView, JSON.stringify(cohort)]);

  // Build polygon points for a given cohort
  const buildPolygon = useCallback((cohortId, data) => {
    if (!data) return { points: "", values: [] };
    const n = RADAR_AXES.length;
    const cx = 150, cy = 150, maxR = 110;
    const values = [];
    
    RADAR_AXES.forEach((axis, i) => {
      const val = data[axis.id]?.[cohortId] || 0;
      // Scale: 1-5 → 0-1
      const normalized = Math.max(0, (val - 1) / 4);
      values.push({ axis, val, normalized });
    });

    const points = values.map((v, i) => {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      const r = v.normalized * maxR;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(" ");

    return { points, values };
  }, []);

  const polyA = useMemo(() => buildPolygon(cohortA, data), [data, cohortA, buildPolygon]);
  const polyB = useMemo(() => buildPolygon(cohortB, data), [data, cohortB, buildPolygon]);

  const cohortAInfo = RADAR_COHORTS.find(c => c.id === cohortA);
  const cohortBInfo = RADAR_COHORTS.find(c => c.id === cohortB);
  const colorA = resolveCssColor(PATH_COLORS[cohortA] || C.gold);
  const colorB = resolveCssColor(PATH_COLORS[cohortB] || C.blue);

  return (
    <section ref={ref} className="xray-section" style={{ marginBottom: "4rem", minHeight: "600px" }}>
      <SectionHeader 
        title="Demographic Divergence Radar"
        subtitle="Select two cohorts to compare their average scores across key experience metrics. Where do they diverge?"
        icon="◎"
      />

      {/* Cohort selectors */}
      <div style={{
        display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap",
        alignItems: "center",
      }}>
        <CohortSelector label="Cohort A" value={cohortA} onChange={setCohortA} color={colorA} />
        <span style={{ fontFamily: FONT.condensed, fontSize: "0.8rem", color: C.dim, textTransform: "uppercase" }}>
          vs
        </span>
        <CohortSelector label="Cohort B" value={cohortB} onChange={setCohortB} color={colorB} />
      </div>

      <div style={{
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
        padding: "2rem", display: "flex", gap: "2rem", flexWrap: "wrap",
        justifyContent: "center", alignItems: "center",
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: C.muted, fontStyle: "italic", width: "100%" }}>
            Scanning divergence patterns…
          </div>
        ) : (
          <>
            {/* SVG Radar */}
            <div style={{ flex: "1 1 320px", maxWidth: 400, minWidth: 280 }}>
              <svg viewBox="0 0 300 300" style={{ width: "100%" }}>
                {/* Grid rings */}
                {[0.25, 0.5, 0.75, 1].map(pct => (
                  <circle
                    key={pct}
                    cx={150} cy={150} r={pct * 110}
                    fill="none" stroke={resolveCssColor(C.ghost)} strokeWidth={0.5}
                    strokeDasharray="3,3"
                  />
                ))}

                {/* Axis lines + labels */}
                {RADAR_AXES.map((axis, i) => {
                  const n = RADAR_AXES.length;
                  const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                  const x2 = 150 + 110 * Math.cos(angle);
                  const y2 = 150 + 110 * Math.sin(angle);
                  const labelX = 150 + 130 * Math.cos(angle);
                  const labelY = 150 + 130 * Math.sin(angle);
                  return (
                    <g key={axis.id}>
                      <line
                        x1={150} y1={150} x2={x2} y2={y2}
                        stroke={resolveCssColor(C.ghost)} strokeWidth={0.5}
                      />
                      <text
                        x={labelX} y={labelY}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fill={resolveCssColor(C.muted)}
                        style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", fontWeight: 600 }}
                      >
                        {axis.short}
                      </text>
                    </g>
                  );
                })}

                {/* Cohort B polygon (under) */}
                <polygon
                  points={polyB.points}
                  fill={colorB}
                  fillOpacity={0.15}
                  stroke={colorB}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />

                {/* Cohort A polygon (on top) */}
                <polygon
                  points={polyA.points}
                  fill={colorA}
                  fillOpacity={0.15}
                  stroke={colorA}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />

                {/* Data points for A */}
                {polyA.values.map((v, i) => {
                  const n = RADAR_AXES.length;
                  const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                  const r = v.normalized * 110;
                  const cx = 150 + r * Math.cos(angle);
                  const cy = 150 + r * Math.sin(angle);
                  return (
                    <circle
                      key={`a-${i}`}
                      cx={cx} cy={cy} r={4}
                      fill={colorA} stroke="#fff" strokeWidth={1}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={(e) => tooltip.showTooltip(e, `${cohortAInfo?.label}: ${v.axis.label} = ${v.val.toFixed(2)}/5`)}
                      onMouseMove={tooltip.moveTooltip}
                      onMouseLeave={tooltip.hideTooltip}
                    />
                  );
                })}

                {/* Data points for B */}
                {polyB.values.map((v, i) => {
                  const n = RADAR_AXES.length;
                  const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                  const r = v.normalized * 110;
                  const cx = 150 + r * Math.cos(angle);
                  const cy = 150 + r * Math.sin(angle);
                  return (
                    <circle
                      key={`b-${i}`}
                      cx={cx} cy={cy} r={4}
                      fill={colorB} stroke="#fff" strokeWidth={1}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={(e) => tooltip.showTooltip(e, `${cohortBInfo?.label}: ${v.axis.label} = ${v.val.toFixed(2)}/5`)}
                      onMouseMove={tooltip.moveTooltip}
                      onMouseLeave={tooltip.hideTooltip}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Axis-by-axis comparison table */}
            <div style={{ flex: "1 1 300px", minWidth: 260 }}>
              <div style={{
                fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.14em",
                textTransform: "uppercase", color: C.gold, marginBottom: "0.8rem", fontWeight: 700,
              }}>
                Axis-by-Axis Comparison
              </div>
              
              {RADAR_AXES.map((axis, i) => {
                const valA = polyA.values[i]?.val || 0;
                const valB = polyB.values[i]?.val || 0;
                const delta = valA - valB;
                return (
                  <div key={axis.id} style={{
                    display: "grid", gridTemplateColumns: "1fr auto auto auto",
                    gap: "0.6rem", padding: "0.45rem 0",
                    borderBottom: i < RADAR_AXES.length - 1 ? `1px solid ${C.ghost}` : "none",
                    alignItems: "center",
                  }}>
                    <span style={{ fontFamily: FONT.body, fontSize: "0.78rem", color: C.text }}>
                      {axis.label}
                    </span>
                    <span style={{ fontFamily: FONT.mono, fontSize: "0.75rem", color: colorA, fontWeight: 600 }}>
                      {valA.toFixed(2)}
                    </span>
                    <span style={{ fontFamily: FONT.mono, fontSize: "0.75rem", color: colorB, fontWeight: 600 }}>
                      {valB.toFixed(2)}
                    </span>
                    <span style={{
                      fontFamily: FONT.mono, fontSize: "0.7rem", fontWeight: 700,
                      color: delta > 0 ? resolveCssColor(C.green) : delta < 0 ? resolveCssColor(C.red) : resolveCssColor(C.dim),
                    }}>
                      {delta > 0 ? "+" : ""}{delta.toFixed(2)}
                    </span>
                  </div>
                );
              })}

              {/* Legend */}
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.8rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: colorA }} />
                  <span style={{ fontFamily: FONT.condensed, fontSize: "0.7rem", color: C.muted }}>
                    {cohortAInfo?.label}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: colorB }} />
                  <span style={{ fontFamily: FONT.condensed, fontSize: "0.7rem", color: C.muted }}>
                    {cohortBInfo?.label}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function CohortSelector({ label, value, onChange, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <div style={{
        width: 12, height: 12, borderRadius: "50%",
        background: color, boxShadow: `0 0 8px ${color}40`,
      }} />
      <label style={{
        fontFamily: FONT.condensed, fontSize: "0.68rem", letterSpacing: "0.08em",
        textTransform: "uppercase", color: C.muted, fontWeight: 600,
      }}>
        {label}:
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: "0.35rem 0.6rem", background: resolveCssColor(C.bgDeep),
          color: resolveCssColor(C.textBright), border: `1px solid ${color}`,
          borderRadius: 6, fontFamily: FONT.body, fontSize: "0.82rem",
          cursor: "pointer",
        }}
      >
        {RADAR_COHORTS.map(c => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </select>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: GEOGRAPHIC ORIGINS
// ═══════════════════════════════════════════════════════════════════════════

function GeographicOrigins({ cohort }) {
  const [ref, inView] = useInView();
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inView) return;
    setLoading(true);

    fetch(`${API_BASE}/geo?level=country&by=pathway`)
      .then(r => r.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [inView]);

  return (
    <section ref={ref} className="xray-section" style={{ marginBottom: "4rem", minHeight: "600px" }}>
      <SectionHeader 
        title="Geographic Origins"
        subtitle="Where do survey respondents come from? Top countries by total participation, broken down by pathway."
        icon="◈"
      />

      <div style={{
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
        padding: "2rem",
      }}>
        {loading || !geoData ? (
          <div style={{ textAlign: "center", padding: "3rem", color: C.muted, fontStyle: "italic" }}>
            Mapping origins…
          </div>
        ) : (
          <GeographicHeatmap 
            questionId="country"
            title="World Map of Respondents"
            distribution={{
              distribution: geoData.locations.map(loc => ({ label: loc.location, n: loc.n }))
            }}
            byPathway={{
              results: PATHWAYS.reduce((acc, p) => {
                acc[p.id] = {
                  distribution: geoData.locations.map(loc => ({
                    label: loc.location,
                    n: loc.by_pathway?.[p.id] || 0
                  })).filter(d => d.n > 0)
                };
                return acc;
              }, {})
            }}
          />
        )}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: CORRELATION MATRIX (Retained from v1)
// ═══════════════════════════════════════════════════════════════════════════

const OUTCOME_QUESTIONS = [
  { id: "circ_regret_feeling", text: "Circumcised: Resentment or Regret" },
  { id: "intact_regret_feeling", text: "Intact: Resentment or Regret" },
  { id: "circ_awareness_age", text: "Circumcised: Age of Awareness" },
  { id: "intact_circ_awareness_age", text: "Intact: Age of Awareness" },
  { id: "exp_pride_satisfaction_rating", text: "Pride & Satisfaction Rating" },
  { id: "final_social_norm_perception", text: "Social Norm Perception" },
];

function CorrelationSection({ cohort }) {
  const [ref, inView] = useInView();
  const [activeDemographic, setActiveDemographic] = useState(DEMOGRAPHIC_DIMENSIONS[0]);
  const [activeOutcome, setActiveOutcome] = useState(OUTCOME_QUESTIONS[0]);
  const [crossTabData, setCrossTabData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inView) return;
    setLoading(true);

    const cleanCohort = { ...(cohort || {}) };
    delete cleanCohort[activeDemographic.column];

    const baseDist = getResponseDistribution(activeOutcome.id, { cohort: cleanCohort });
    const cohortPromises = activeDemographic.options.map(async (opt) => {
      const optValue = typeof opt === "string" ? opt : opt.value;
      const optLabel = typeof opt === "string" ? opt : opt.label;
      const optionCohort = { ...cleanCohort, [activeDemographic.column]: optValue };
      const dist = await getResponseDistribution(activeOutcome.id, { cohort: optionCohort });
      return { option: optLabel, distribution: dist.distribution || [], n: dist.n || 0 };
    });

    Promise.all([baseDist, Promise.all(cohortPromises)]).then(([base, results]) => {
      const maxN = Math.max(...results.map(r => r.n), base?.n || 0);
      setCrossTabData({
        baseline: {
          option: Object.keys(cleanCohort).length > 0 ? "All Cohort Respondents" : "All Respondents",
          distribution: base?.distribution || [], n: base?.n || 0,
        },
        cohorts: results,
        maxN,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [inView, activeDemographic, activeOutcome, JSON.stringify(cohort)]);

  return (
    <section ref={ref} className="xray-section" style={{ marginBottom: "4rem", minHeight: "800px" }}>
      <SectionHeader 
        title="Correlation Matrix"
        subtitle="Cross-tabulate demographic dimensions against outcome variables to spot patterns."
        icon="▥"
      />

      {/* Control Panel */}
      <div style={{
        background: C.bgSoft, border: `1px solid ${C.ghost}`, borderRadius: 12,
        padding: "1.25rem", marginBottom: "1.5rem",
        display: "flex", flexWrap: "wrap", gap: "1.25rem",
      }}>
        <div style={{ flex: "1 1 240px" }}>
          <label style={{
            display: "block", fontFamily: FONT.condensed, fontSize: "0.72rem",
            color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: "0.4rem", fontWeight: 700,
          }}>
            Demographic (X-Axis)
          </label>
          <select
            value={activeDemographic.id}
            onChange={e => setActiveDemographic(DEMOGRAPHIC_DIMENSIONS.find(d => d.id === e.target.value))}
            style={{
              width: "100%", padding: "0.55rem", background: resolveCssColor(C.bgDeep),
              color: resolveCssColor(C.text), border: `1px solid ${resolveCssColor(C.ghost)}`,
              borderRadius: 6, fontFamily: FONT.body, fontSize: "0.85rem",
            }}
          >
            {DEMOGRAPHIC_DIMENSIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>

        <div style={{ flex: "1 1 320px" }}>
          <label style={{
            display: "block", fontFamily: FONT.condensed, fontSize: "0.72rem",
            color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: "0.4rem", fontWeight: 700,
          }}>
            Outcome (Y-Axis)
          </label>
          <select
            value={activeOutcome.id}
            onChange={e => setActiveOutcome(OUTCOME_QUESTIONS.find(d => d.id === e.target.value))}
            style={{
              width: "100%", padding: "0.55rem", background: resolveCssColor(C.bgDeep),
              color: resolveCssColor(C.text), border: `1px solid ${resolveCssColor(C.ghost)}`,
              borderRadius: 6, fontFamily: FONT.body, fontSize: "0.85rem",
            }}
          >
            {OUTCOME_QUESTIONS.map(q => <option key={q.id} value={q.id}>{q.text}</option>)}
          </select>
        </div>
      </div>

      {/* Matrix Visualization */}
      <div style={{
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
        padding: "2rem",
      }}>
        {loading || !crossTabData ? (
          <div style={{ textAlign: "center", padding: "3rem", color: C.muted, fontStyle: "italic" }}>
            Building correlation matrix…
          </div>
        ) : (
          <CorrelationMatrix
            rowQuestion={{ prompt: activeOutcome.text }}
            colQuestion={{ prompt: activeDemographic.label }}
            crossTabData={crossTabData}
          />
        )}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function SectionHeader({ title, subtitle, icon }) {
  return (
    <div style={{ marginBottom: "1.5rem", marginTop: "1rem" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem",
      }}>
        <span style={{
          fontFamily: FONT.mono, fontSize: "1.2rem", color: C.goldBright,
          opacity: 0.6,
        }}>
          {icon}
        </span>
        <h2 style={{
          fontFamily: FONT.display, fontSize: "1.8rem", color: C.textBright,
          fontWeight: 800, margin: 0, letterSpacing: "-0.01em",
        }}>
          {title}
        </h2>
      </div>
      <p style={{
        fontFamily: FONT.body, fontSize: "0.9rem", color: C.muted,
        lineHeight: 1.5, margin: 0, maxWidth: 700,
      }}>
        {subtitle}
      </p>
      <div style={{ height: 1, background: `linear-gradient(90deg, ${C.gold}, transparent)`, marginTop: "0.8rem", opacity: 0.3 }} />
    </div>
  );
}
