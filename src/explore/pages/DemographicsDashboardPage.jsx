// ═══════════════════════════════════════════════════════════════════════════
// DemographicsDashboardPage.jsx — "Cohort X-Ray"
// An opinionated, visually striking demographics exhibit that leverages
// the survey's comparative nature. Answers: "Who are these people, and
// how do their demographics shape their experience?"
//
// Sections:
//   1. Geographic Origins — World/US map + linked region-comparison radar
//   2. Geographic Flow    — Sankey with Source locked to geography
//   3. Pathway DNA Strip  — Side-by-side stacked bars per demographic
//   4. Divergence Radar   — Spider chart comparing any two cohorts
//
// (The standalone Correlations Explorer at #/correlations is the
//  Swiss-army-knife surface for any X×Y matrix or any 3-way flow that
//  isn't anchored to geography.)
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { C, FONT, PATH_COLORS, API_BASE, resolveCssColor } from "../styles/tokens";

gsap.registerPlugin(ScrollTrigger);
import { getResponseDistribution, getAggregate, getCount } from "../lib/api";
import DemographicFilterBar, { DEMOGRAPHIC_DIMENSIONS } from "../components/DemographicFilterBar";
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
  { id: "sexuality", label: "Sexuality", by: "sexuality" },
  { id: "education", label: "Education", by: "education" },
  { id: "socioeconomic", label: "Socioeconomic Status", by: "socioeconomic" },
  { id: "family_upbringing", label: "Family Upbringing", by: "family_upbringing" },
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
  { id: "sexuality", label: "Sexuality" },
  { id: "education", label: "Education" },
  { id: "socioeconomic", label: "Socioeconomic" },
  { id: "family_upbringing", label: "Upbringing" },
];

// Removed RADAR_COHORTS

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
  s = s.replace("Atheist / Agnostic / Secular", "Secular/Atheist");
  s = s.replace("No significant religious/spiritual/cultural tradition influencing this topic.", "Secular/Atheist");
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
  const sectionIds = ["geo", "mosaic", "dna", "radar"];
  const scrollTo = useCallback((id) => {
    document.getElementById(`xray-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const [activeSection, setActiveSection] = useState("geo");
  
  const [sankeyDims, setSankeyDims] = useState([
    DEMOGRAPHIC_DIMENSIONS.find(d => d.id === "country_born"),
    DEMOGRAPHIC_DIMENSIONS.find(d => d.id === "generation"),
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
            { id: "mosaic", label: "Geographic Flow", icon: "〰" },
            { id: "dna", label: "Pathway DNA", icon: "≡" },
            { id: "radar", label: "Divergence Radar", icon: "◎" },
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
          <SectionAnchor id="geo">
            <GeographicOrigins cohort={cohort} tooltip={{ showTooltip, moveTooltip, hideTooltip }} />
          </SectionAnchor>
        
        {/* ═══ SECTION 2: GEOGRAPHIC FLOW (SANKEY, GEO-ANCHORED) ═══ */}
        <SectionAnchor id="mosaic">
          <section className="xray-section" style={{ marginBottom: "4rem", minHeight: "600px" }}>
            <SectionHeader
              title="Geographic Flow"
              subtitle="Trace how respondents from a region flow through identity and outcome. The Source is locked to geography; pick what you want to trace it through."
              icon="〰"
            />
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
              {[0, 1, 2].map((idx) => {
                const stageLabel = idx === 0 ? "From" : idx === 1 ? "Through" : "To";
                // Source dim is locked to geographic dimensions; the other two are unrestricted.
                const optionPool = idx === 0
                  ? DEMOGRAPHIC_DIMENSIONS.filter(d => /^(country|us_state|can_province)/.test(d.column || d.id))
                  : DEMOGRAPHIC_DIMENSIONS;
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span style={{ fontFamily: FONT.condensed, fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: C.dim, fontWeight: 700 }}>
                        {stageLabel}
                      </span>
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
                        {optionPool.map(d => {
                          const isSelectedElsewhere = sankeyDims.some((selectedDim, i) => i !== idx && selectedDim.id === d.id);
                          return (
                            <option key={d.id} value={d.id} disabled={isSelectedElsewhere}>
                              {d.label === "Pathway" ? "Experiential Pathway" : d.label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    {idx < 2 && <span style={{ color: C.dim, alignSelf: "flex-end", marginBottom: "0.4rem" }}>→</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "2rem" }}>
              <DemographicSankey cohort={cohort} dimensions={sankeyDims} tooltip={{ showTooltip, moveTooltip, hideTooltip }} />
            </div>
            <div style={{
              marginTop: "1rem",
              fontFamily: FONT.body,
              fontSize: "0.78rem",
              color: C.muted,
              lineHeight: 1.45,
            }}>
              For free-form flows across any three dimensions (or any X × Y matrix), use the <a href="#/correlations" style={{ color: C.goldBright, borderBottom: `1px solid ${C.goldBright}40`, paddingBottom: "0.1rem" }}>Correlations Explorer</a>.
            </div>
          </section>
        </SectionAnchor>

        {/* ═══ SECTION 3: PATHWAY DNA STRIP ═══ */}
        <SectionAnchor id="dna">
          <PathwayDNAStrip cohort={cohort} tooltip={{ showTooltip, moveTooltip, hideTooltip }} />
        </SectionAnchor>

        {/* ═══ SECTION 4: DIVERGENCE RADAR ═══ */}
        <SectionAnchor id="radar">
          <DivergenceRadar cohort={cohort} tooltip={{ showTooltip, moveTooltip, hideTooltip }} />
        </SectionAnchor>

        {/*
          Section 5 (Correlation Matrix) intentionally removed.
          Its job — pick X × Y from any combination of demographics or outcome
          questions — has been promoted to the standalone Correlations Explorer
          at #/correlations, which now also offers a 3-way Flow (Sankey) mode.
          Keeping the section here would create the redundancy this consolidation
          was meant to eliminate.
        */}
        </div>
      </div>

      <Tooltip {...tooltip} />
    </div>
  );
}

function SectionAnchor({ id, children }) {
  return (
    <div id={`xray-${id}`} style={{ scrollMarginTop: "2rem" }}>
      {children}
    </div>
  );
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
  // Default to pathway
  const [activeDimensionId, setActiveDimensionId] = useState("pathway");
  const [activeCohorts, setActiveCohorts] = useState(["intact", "restoring"]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // The full dimension object
  const activeDimension = useMemo(() => 
    DEMOGRAPHIC_DIMENSIONS.find(d => d.id === activeDimensionId), 
  [activeDimensionId]);

  // All possible cohorts for this dimension
  const dimensionCohorts = useMemo(() => {
    let options = activeDimension?.options.map(opt => 
      typeof opt === "string" ? { value: opt, label: shortenLabel(opt) } : opt
    ) || [];
    
    // Omit 'observer' and 'unclassified' from radar charts when examining pathways
    if (activeDimensionId === "pathway") {
      options = options.filter(o => o.value !== "observer" && o.value !== "unclassified");
    }
    
    return options;
  }, [activeDimension, activeDimensionId]);

  useEffect(() => {
    if (!inView) return;
    setLoading(true);

    // Fetch each radar axis's aggregate, grouped by activeDimension.column
    Promise.all(
      RADAR_AXES.map(axis =>
        getAggregate(axis.id, { by: activeDimension.column, cohort })
          .then(res => ({ axis, results: res.results || {} }))
          .catch(() => ({ axis, results: {} }))
      )
    ).then(allResults => {
      const mapped = {};
      allResults.forEach(({ axis, results }) => {
        mapped[axis.id] = {};
        // For each cohort in the results, calculate the weighted average
        Object.entries(results).forEach(([cohortId, pathData]) => {
          mapped[axis.id][cohortId] = calculateWeightedAvg(pathData.distribution);
        });
      });
      setData(mapped);
      setLoading(false);
    });
  }, [inView, activeDimension.column, JSON.stringify(cohort)]);

  // Handle changing the dimension
  const handleDimensionChange = (e) => {
    const newDimId = e.target.value;
    setActiveDimensionId(newDimId);
    
    // Pick the first 2 cohorts as the default active ones for the new dimension
    const newDim = DEMOGRAPHIC_DIMENSIONS.find(d => d.id === newDimId);
    const newCohorts = newDim?.options.slice(0, 2).map(opt => 
      typeof opt === "string" ? opt : opt.value
    ) || [];
    setActiveCohorts(newCohorts);
  };

  const toggleCohort = (cohortId) => {
    setActiveCohorts(prev => 
      prev.includes(cohortId) 
        ? prev.filter(c => c !== cohortId) 
        : [...prev, cohortId]
    );
  };

  // Helper to get color for a cohort
  const getCohortColor = useCallback((cohortId, index) => {
    if (activeDimensionId === "pathway") {
      return resolveCssColor(PATH_COLORS[cohortId] || getChartColor(index));
    }
    return resolveCssColor(getChartColor(index));
  }, [activeDimensionId]);

  // Build polygon points for a given cohort
  const buildPolygon = useCallback((cohortId) => {
    if (!data) return { points: "", values: [] };
    const n = RADAR_AXES.length;
    const cx = 150, cy = 150, maxR = 110;
    const values = [];
    
    RADAR_AXES.forEach((axis) => {
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
  }, [data]);

  // Pre-calculate all polygons for active cohorts
  const polygons = useMemo(() => {
    return activeCohorts.map((cohortId) => {
      const cohortIndex = dimensionCohorts.findIndex(c => c.value === cohortId);
      return {
        id: cohortId,
        label: dimensionCohorts.find(c => c.value === cohortId)?.label || cohortId,
        color: getCohortColor(cohortId, cohortIndex !== -1 ? cohortIndex : 0),
        ...buildPolygon(cohortId)
      };
    });
  }, [activeCohorts, dimensionCohorts, getCohortColor, buildPolygon]);

  return (
    <section ref={ref} className="xray-section" style={{ marginBottom: "4rem", minHeight: "600px" }}>
      <SectionHeader 
        title="Demographic Divergence Radar"
        subtitle="Explore how experience metrics diverge across different demographic dimensions."
        icon="◎"
      />

      {/* Dimension & Cohort selectors */}
      <div style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        {/* Dimension Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <label style={{
            fontFamily: FONT.condensed, fontSize: "0.68rem", letterSpacing: "0.08em",
            textTransform: "uppercase", color: C.muted, fontWeight: 600,
          }}>
            Compare Across:
          </label>
          <select
            value={activeDimensionId}
            onChange={handleDimensionChange}
            style={{
              padding: "0.35rem 0.6rem", background: resolveCssColor(C.bgDeep),
              color: resolveCssColor(C.textBright), border: `1px solid ${resolveCssColor(C.gold)}`,
              borderRadius: 6, fontFamily: FONT.body, fontSize: "0.82rem",
              cursor: "pointer", outline: "none",
            }}
          >
            {DEMOGRAPHIC_DIMENSIONS.map(dim => (
              <option key={dim.id} value={dim.id}>{dim.label}</option>
            ))}
          </select>
        </div>

        {/* Cohort Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {dimensionCohorts.map((cohortOpt, idx) => {
            const isActive = activeCohorts.includes(cohortOpt.value);
            const color = getCohortColor(cohortOpt.value, idx);
            
            return (
              <button
                key={cohortOpt.value}
                onClick={() => toggleCohort(cohortOpt.value)}
                style={{
                  background: isActive ? `${color}20` : "transparent",
                  border: `1px solid ${isActive ? color : resolveCssColor(C.ghost)}`,
                  color: isActive ? resolveCssColor(C.textBright) : resolveCssColor(C.dim),
                  padding: "0.25rem 0.6rem", borderRadius: 16, cursor: "pointer",
                  fontFamily: FONT.condensed, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? color : resolveCssColor(C.ghost) }} />
                {cohortOpt.label}
              </button>
            );
          })}
        </div>
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
              <svg viewBox="0 0 300 300" style={{ width: "100%", overflow: "visible" }}>
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

                {/* Polygons */}
                {polygons.map((poly) => (
                  <g key={poly.id}>
                    <polygon
                      points={poly.points}
                      fill={poly.color}
                      fillOpacity={0.15}
                      stroke={poly.color}
                      strokeWidth={2}
                      strokeLinejoin="round"
                      style={{ transition: "all 0.3s" }}
                    />
                    
                    {/* Data points */}
                    {poly.values.map((v, i) => {
                      const n = RADAR_AXES.length;
                      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                      const r = v.normalized * 110;
                      const cx = 150 + r * Math.cos(angle);
                      const cy = 150 + r * Math.sin(angle);
                      return (
                        <circle
                          key={`${poly.id}-${i}`}
                          cx={cx} cy={cy} r={4}
                          fill={poly.color} stroke="#fff" strokeWidth={1}
                          style={{ cursor: "pointer", transition: "all 0.3s" }}
                          onMouseEnter={(e) => tooltip.showTooltip(e, `${poly.label}: ${v.axis.label} = ${v.val.toFixed(2)}/5`)}
                          onMouseMove={tooltip.moveTooltip}
                          onMouseLeave={tooltip.hideTooltip}
                        />
                      );
                    })}
                  </g>
                ))}
              </svg>
            </div>

            {/* Axis-by-axis comparison table */}
            <div style={{ flex: "1 1 300px", minWidth: 260, overflowX: "auto" }}>
              <div style={{
                fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.14em",
                textTransform: "uppercase", color: C.gold, marginBottom: "0.8rem", fontWeight: 700,
              }}>
                Axis-by-Axis Comparison
              </div>
              
              {/* Header row for cohorts */}
              <div style={{
                display: "grid", gridTemplateColumns: `1fr repeat(${polygons.length}, minmax(40px, auto))`,
                gap: "0.6rem", paddingBottom: "0.45rem", borderBottom: `1px solid ${resolveCssColor(C.ghost)}`
              }}>
                <span />
                {polygons.map((poly) => (
                  <span key={`header-${poly.id}`} style={{ 
                    fontFamily: FONT.condensed, fontSize: "0.65rem", color: poly.color, 
                    fontWeight: 600, textAlign: "right", whiteSpace: "nowrap"
                  }}>
                    {shortenLabel(poly.label)}
                  </span>
                ))}
              </div>

              {/* Data rows */}
              {RADAR_AXES.map((axis, i) => {
                return (
                  <div key={axis.id} style={{
                    display: "grid", gridTemplateColumns: `1fr repeat(${polygons.length}, minmax(40px, auto))`,
                    gap: "0.6rem", padding: "0.45rem 0",
                    borderBottom: i < RADAR_AXES.length - 1 ? `1px solid ${resolveCssColor(C.ghost)}` : "none",
                    alignItems: "center",
                  }}>
                    <span style={{ fontFamily: FONT.body, fontSize: "0.78rem", color: resolveCssColor(C.text) }}>
                      {axis.label}
                    </span>
                    {polygons.map((poly) => {
                      const val = poly.values[i]?.val || 0;
                      return (
                        <span key={`${poly.id}-${axis.id}`} style={{ 
                          fontFamily: FONT.mono, fontSize: "0.75rem", color: poly.color, 
                          fontWeight: 600, textAlign: "right"
                        }}>
                          {val > 0 ? val.toFixed(2) : "—"}
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: GEOGRAPHIC ORIGINS
// ═══════════════════════════════════════════════════════════════════════════

function GeographicOrigins({ cohort, tooltip }) {
  const [ref, inView] = useInView();
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLevel, setMapLevel] = useState("us_state");
  const [splitBy, setSplitBy] = useState("pathway");
  const [locationTime, setLocationTime] = useState("born");
  // Selected regions for the linked radar. Up to 3, each shape: { name, level }.
  // We clear this whenever the map's region level or location-time changes, since
  // the previously-selected region IDs aren't comparable across map projections.
  const [selectedRegions, setSelectedRegions] = useState([]);

  // Clear selection when the user changes which map is showing or whether we're
  // looking at birth vs current location — the underlying filter column changes,
  // so old selections wouldn't be meaningful any more.
  useEffect(() => {
    setSelectedRegions([]);
  }, [mapLevel, locationTime]);

  const handleRegionClick = useCallback((regionName, regionLevel) => {
    setSelectedRegions((prev) => {
      // Toggle: if this exact name is already selected, remove it.
      const existingIdx = prev.findIndex(
        (r) => r.name === regionName && r.level === regionLevel
      );
      if (existingIdx !== -1) {
        return prev.filter((_, i) => i !== existingIdx);
      }
      // Cap at 3 — adding a 4th drops the oldest.
      const next = [...prev, { name: regionName, level: regionLevel }];
      return next.length > 3 ? next.slice(next.length - 3) : next;
    });
  }, []);

  useEffect(() => {
    if (!inView) return;
    setLoading(true);

    if (mapLevel === "us_state") {
      Promise.all([
        fetch(`${API_BASE}/geo?level=us_state&by=${splitBy}&when=${locationTime}`).then(r => r.json()),
        fetch(`${API_BASE}/geo?level=canada_province&by=${splitBy}&when=${locationTime}`).then(r => r.json())
      ])
        .then(([usRes, caRes]) => {
          const mergedLocations = [
            ...(usRes.locations || []),
            ...(caRes.locations || [])
          ];
          setGeoData({
            ...usRes,
            locations: mergedLocations
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      fetch(`${API_BASE}/geo?level=${mapLevel}&by=${splitBy}&when=${locationTime}`)
        .then(r => r.json())
        .then(data => {
          setGeoData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [inView, mapLevel, splitBy, locationTime]);

  const cohortData = useMemo(() => {
    if (!geoData || !geoData.locations) return { results: {} };
    const splitKey = `by_${splitBy}`;
    const cohortKeys = new Set();
    geoData.locations.forEach(loc => {
      if (loc[splitKey]) Object.keys(loc[splitKey]).forEach(k => cohortKeys.add(k));
    });
    const results = {};
    for (const key of cohortKeys) {
      results[key] = {
        distribution: geoData.locations.map(loc => ({
          label: loc.location,
          n: loc[splitKey]?.[key] || 0
        })).filter(d => d.n > 0)
      };
    }
    return { results };
  }, [geoData, splitBy]);

  return (
    <section ref={ref} className="xray-section" style={{ marginBottom: "4rem", minHeight: "600px" }}>
      <SectionHeader 
        title="Geographic Origins"
        subtitle="Where do survey respondents come from? View mapped participation by region."
        icon="◈"
      />

      <div style={{
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
        padding: "2rem",
      }}>
        {/* Controls */}
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: C.muted, marginBottom: "0.4rem", fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.05em" }}>Region Level</label>
            <select 
              value={mapLevel} 
              onChange={e => setMapLevel(e.target.value)}
              style={{
                background: C.bg, color: C.textBright, border: `1px solid ${C.ghost}`,
                padding: "0.5rem 1rem", borderRadius: 6, fontFamily: FONT.body, cursor: "pointer", minWidth: 150
              }}
            >
              <option value="country">World</option>
              <option value="us_state">North America</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: C.muted, marginBottom: "0.4rem", fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.05em" }}>Location Type</label>
            <select 
              value={locationTime} 
              onChange={e => setLocationTime(e.target.value)}
              style={{
                background: C.bg, color: C.textBright, border: `1px solid ${C.ghost}`,
                padding: "0.5rem 1rem", borderRadius: 6, fontFamily: FONT.body, cursor: "pointer", minWidth: 150
              }}
            >
              <option value="born">Location of Birth</option>
              <option value="now">Current Location</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: C.muted, marginBottom: "0.4rem", fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.05em" }}>Split By</label>
            <select 
              value={splitBy} 
              onChange={e => setSplitBy(e.target.value)}
              style={{
                background: C.bg, color: C.textBright, border: `1px solid ${C.ghost}`,
                padding: "0.5rem 1rem", borderRadius: 6, fontFamily: FONT.body, cursor: "pointer", minWidth: 180
              }}
            >
              {DEMOGRAPHIC_DIMENSIONS.map(d => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading || !geoData ? (
          <div style={{ textAlign: "center", padding: "3rem", color: C.muted, fontStyle: "italic" }}>
            Mapping origins…
          </div>
        ) : (
          <>
            <GeographicHeatmap
              questionId={mapLevel === "country" ? "country" : "us_state"}
              title={mapLevel === "country" ? "World Map of Respondents" : "United States & Canada Respondents"}
              distribution={{
                distribution: geoData.locations.map(loc => ({ label: loc.location, n: loc.n }))
              }}
              byCohort={cohortData}
              splitBy={splitBy}
              onRegionClick={handleRegionClick}
              selectedRegions={selectedRegions}
            />
            <LinkedRegionRadar
              selectedRegions={selectedRegions}
              locationTime={locationTime}
              onRemoveRegion={handleRegionClick}
              onClearAll={() => setSelectedRegions([])}
              tooltip={tooltip}
            />
          </>
        )}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LINKED REGION RADAR — sits beneath the choropleth in Geographic Origins.
// Picks up to 3 regions selected on the map and compares them on the same
// 6 experience axes as the Divergence Radar. Each region becomes one polygon.
// Region color is taken from the chart-N palette (intentionally not the
// pathway palette — these aren't pathways, and re-using pathway colors here
// would confuse readers who've internalized red=Circumcised etc).
// ═══════════════════════════════════════════════════════════════════════════

const REGION_LEVEL_LABEL = {
  country: "Country",
  us_state: "U.S. State",
  can_province: "Canadian Province",
};

function regionFilterColumn(level, locationTime) {
  // Returns the demographics column name that getResponseDistribution will accept.
  // locationTime is "born" or "now".
  if (level === "country") return `country_${locationTime}`;
  if (level === "us_state") return `us_state_${locationTime}`;
  if (level === "can_province") return `can_province_${locationTime}`;
  return null;
}

function LinkedRegionRadar({ selectedRegions, locationTime, onRemoveRegion, onClearAll, tooltip }) {
  const [data, setData] = useState({});      // { "regionKey": { axisId: { avg, n } } }
  const [loading, setLoading] = useState(false);

  // A stable identifier per region so we can key fetches and color slots
  const regionKey = useCallback((r) => `${r.level}:${r.name}`, []);

  useEffect(() => {
    if (selectedRegions.length === 0) {
      setData({});
      return;
    }
    let cancelled = false;
    setLoading(true);

    const fetches = selectedRegions.flatMap((r) => {
      const col = regionFilterColumn(r.level, locationTime);
      if (!col) return [];
      return RADAR_AXES.map((axis) =>
        getResponseDistribution(axis.id, { cohort: { [col]: r.name } })
          .then((res) => ({
            key: regionKey(r),
            axisId: axis.id,
            avg: calculateWeightedAvg(res.distribution || []),
            n: (res.distribution || []).reduce((s, d) => s + d.n, 0),
          }))
          .catch(() => ({ key: regionKey(r), axisId: axis.id, avg: 0, n: 0 }))
      );
    });

    Promise.all(fetches).then((results) => {
      if (cancelled) return;
      const next = {};
      for (const r of results) {
        if (!next[r.key]) next[r.key] = {};
        next[r.key][r.axisId] = { avg: r.avg, n: r.n };
      }
      setData(next);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [JSON.stringify(selectedRegions), locationTime, regionKey]);

  // Compute one polygon per selected region. Skip regions with n<5 per axis to
  // respect the brief's minimum-sample rule.
  const polygons = useMemo(() => {
    return selectedRegions.map((r, idx) => {
      const key = regionKey(r);
      const regionData = data[key] || {};
      const color = resolveCssColor(getChartColor(idx));
      // Use the largest n across axes as the headline sample size for the chip.
      const maxN = Math.max(0, ...RADAR_AXES.map((a) => regionData[a.id]?.n || 0));

      const n = 6;
      const cx = 150, cy = 150, maxR = 110;
      const values = RADAR_AXES.map((axis, i) => {
        const point = regionData[axis.id] || { avg: 0, n: 0 };
        // Suppress points where this axis has fewer than 5 responses
        const useable = point.n >= 5;
        const normalized = useable ? Math.max(0, (point.avg - 1) / 4) : 0;
        return { axis, avg: point.avg, n: point.n, useable, normalized };
      });

      const points = values.map((v, i) => {
        const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
        const r = v.normalized * maxR;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      }).join(" ");

      return {
        key,
        name: r.name,
        level: r.level,
        color,
        n: maxN,
        smallSample: maxN > 0 && maxN < 20,
        zeroSample: maxN < 5,
        points,
        values,
      };
    });
  }, [selectedRegions, data, regionKey]);

  // Empty state — show a hint card with what the visitor can do, but don't shout.
  if (selectedRegions.length === 0) {
    return (
      <div style={{
        marginTop: "1.5rem",
        padding: "1.25rem 1.5rem",
        background: "rgba(255,255,255,0.02)",
        border: `1px dashed ${C.ghost}`,
        borderRadius: 8,
        fontFamily: FONT.body,
        fontSize: "0.85rem",
        color: C.muted,
        lineHeight: 1.5,
      }}>
        <span style={{ color: C.goldBright, fontWeight: 600 }}>Click a region on the map</span>
        {" "}to compare how its respondents rated the six experience metrics. Pick up to three regions to overlay them.
      </div>
    );
  }

  return (
    <div style={{
      marginTop: "1.5rem",
      background: C.bgCard,
      border: `1px solid ${C.ghost}`,
      borderRadius: 12,
      padding: "1.5rem 2rem",
    }}>
      {/* Header + chip strip + clear */}
      <div style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.8rem",
        marginBottom: "1rem",
      }}>
        <div>
          <div style={{
            fontFamily: FONT.condensed,
            fontSize: "0.65rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: C.gold,
            fontWeight: 700,
          }}>
            Cross-Region Comparison
          </div>
          <div style={{
            fontFamily: FONT.body,
            fontSize: "0.82rem",
            color: C.muted,
            marginTop: "0.2rem",
          }}>
            Six experience metrics, averaged across all pathways within each selected region.
          </div>
        </div>
        <button
          onClick={onClearAll}
          style={{
            background: "transparent",
            border: `1px solid ${C.ghost}`,
            color: C.muted,
            fontFamily: FONT.condensed,
            fontSize: "0.62rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            padding: "0.3rem 0.7rem",
            borderRadius: 4,
          }}
        >
          Clear all
        </button>
      </div>

      {/* Region chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem" }}>
        {polygons.map((p) => (
          <div
            key={p.key}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.25rem 0.55rem 0.25rem 0.7rem",
              borderRadius: 999,
              border: `1px solid ${p.color}`,
              background: `color-mix(in srgb, ${p.color} 12%, transparent)`,
              fontFamily: FONT.body,
              fontSize: "0.78rem",
              color: C.textBright,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
            <span>{p.name}</span>
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.65rem",
              color: p.smallSample ? C.orange : C.muted,
            }}>
              {p.zeroSample
                ? "n<5"
                : p.smallSample
                  ? `n=${p.n} · small sample`
                  : `n=${p.n}`}
            </span>
            <button
              onClick={() => onRemoveRegion(p.name, p.level)}
              aria-label={`Remove ${p.name}`}
              style={{
                background: "transparent",
                border: "none",
                color: C.muted,
                fontSize: "0.9rem",
                lineHeight: 1,
                cursor: "pointer",
                padding: "0 0.1rem",
              }}
            >×</button>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2.5rem", color: C.muted, fontStyle: "italic" }}>
          Aligning the regions…
        </div>
      ) : (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          alignItems: "center",
        }}>
          {/* SVG radar */}
          <div style={{ flex: "1 1 320px", maxWidth: 400, minWidth: 280 }}>
            <svg viewBox="0 0 300 300" style={{ width: "100%", overflow: "visible" }}>
              {/* Grid rings */}
              {[0.25, 0.5, 0.75, 1].map((pct) => (
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

              {/* Polygons — skip regions with no data at all */}
              {polygons.filter((p) => !p.zeroSample).map((poly) => (
                <g key={poly.key}>
                  <polygon
                    points={poly.points}
                    fill={poly.color}
                    fillOpacity={0.15}
                    stroke={poly.color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />
                  {poly.values.map((v, i) => {
                    if (!v.useable) return null;
                    const n = RADAR_AXES.length;
                    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                    const r = v.normalized * 110;
                    const px = 150 + r * Math.cos(angle);
                    const py = 150 + r * Math.sin(angle);
                    return (
                      <circle
                        key={`${poly.key}-${i}`}
                        cx={px} cy={py} r={4}
                        fill={poly.color} stroke="#fff" strokeWidth={1}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={(e) => tooltip?.showTooltip(e, `${poly.name}: ${v.axis.label} = ${v.avg.toFixed(2)} / 5 (n=${v.n})`)}
                        onMouseMove={tooltip?.moveTooltip}
                        onMouseLeave={tooltip?.hideTooltip}
                      />
                    );
                  })}
                </g>
              ))}
            </svg>
          </div>

          {/* Axis-by-axis comparison table */}
          <div style={{ flex: "1 1 320px", minWidth: 280, overflowX: "auto" }}>
            <div style={{
              fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.14em",
              textTransform: "uppercase", color: C.gold, marginBottom: "0.8rem", fontWeight: 700,
            }}>
              Axis-by-Axis Comparison
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: `1fr repeat(${polygons.length}, minmax(48px, auto))`,
              gap: "0.6rem",
              paddingBottom: "0.4rem",
              borderBottom: `1px solid ${resolveCssColor(C.ghost)}`,
            }}>
              <span />
              {polygons.map((p) => (
                <span key={`hdr-${p.key}`} style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.62rem",
                  color: p.color,
                  fontWeight: 700,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {p.name.length > 14 ? p.name.slice(0, 13) + "…" : p.name}
                </span>
              ))}
            </div>

            {RADAR_AXES.map((axis, i) => (
              <div key={axis.id} style={{
                display: "grid",
                gridTemplateColumns: `1fr repeat(${polygons.length}, minmax(48px, auto))`,
                gap: "0.6rem",
                padding: "0.45rem 0",
                borderBottom: i < RADAR_AXES.length - 1 ? `1px solid ${resolveCssColor(C.ghost)}` : "none",
                alignItems: "center",
              }}>
                <span style={{ fontFamily: FONT.body, fontSize: "0.78rem", color: resolveCssColor(C.text) }}>
                  {axis.label}
                </span>
                {polygons.map((p) => {
                  const pt = p.values[i];
                  return (
                    <span key={`${p.key}-${axis.id}`} style={{
                      fontFamily: FONT.mono,
                      fontSize: "0.75rem",
                      color: pt.useable ? p.color : C.dim,
                      fontWeight: 600,
                      textAlign: "right",
                    }}>
                      {pt.useable ? pt.avg.toFixed(2) : "—"}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
