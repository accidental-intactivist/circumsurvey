import { useState, useEffect, useMemo } from "react";
import UniversalMatrix, { aggregateToObserved } from "../../components/UniversalMatrix";
import DemographicFilterBar, { DEMOGRAPHIC_DIMENSIONS } from "../components/DemographicFilterBar";
import DemographicSankey from "../components/DemographicSankey";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import { useTooltip, Tooltip } from "../components/Tooltip";
import { getQuestions, getAggregate } from "../lib/api";
import { C, FONT, API_BASE } from "../styles/tokens";

// ── Mirror-pair aggregates ─────────────────────────────────────────────────
// When two pathway-specific questions cover the same concept on parallel
// option scales, an aggregate version unions them so cross-tabs can ask the
// question across the whole comparable population. Each respondent answered
// only one of the source questions (they're routed by pathway), so unioning
// has no double-count risk — every response shows up exactly once.
//
// Add new entries to this array as other mirror pairs are promoted; the rest
// of the page handles them generically via the AxisPicker optgroup and the
// aggregate fetch path further down.
const MIRROR_AGGREGATES = [
  {
    id: "aggregate_regret",
    label: "Regret / Resentment (all pathways)",
    short: "Regret / Resentment",
    sources: ["intact_regret_feeling", "circ_regret_feeling"],
    // Canonical buckets in display order (Strong → Never). The `match` array
    // holds case-insensitive substrings tested against the raw option text
    // returned by either source question; the first matching bucket wins.
    // Order matters: more specific patterns first.
    buckets: [
      { id: "STRONG",    label: "Strong & frequent", match: ["strong and frequent", "strong & frequent"] },
      { id: "SOMETIMES", label: "Sometimes",         match: ["some of these", "sometimes"] },
      { id: "RARELY",   label: "Rarely",            match: ["rarely"] },
      { id: "NEVER",    label: "Never",             match: ["never"] },
    ],
  },
];

function findAggregate(id) {
  return MIRROR_AGGREGATES.find(a => a.id === id) || null;
}

// Map a raw option label (from either source question) onto one of the
// canonical aggregate buckets. Returns null if no bucket matches — those
// responses get dropped from the aggregate (e.g. write-ins that don't fit
// any of the four buckets). Substring match keeps us tolerant to the comma-
// split parsing the source data has been through.
function normalizeToBucket(rawLabel, buckets) {
  const s = String(rawLabel || "").toLowerCase();
  for (const b of buckets) {
    for (const needle of b.match) {
      if (s.includes(needle)) return b;
    }
  }
  return null;
}

// Build a short human-readable label for the current cohort filter
function describeCohort(cohort) {
  if (!cohort) return null;
  const parts = [];
  for (const [k, v] of Object.entries(cohort)) {
    let label = Array.isArray(v) ? v.join(", ") : String(v);
    label = label.replace(/\s*\([^)]*\)\s*$/, "");
    if (label.length > 30) label = label.slice(0, 27) + "…";
    parts.push(label);
  }
  return parts.join(" · ");
}

// Convert a Demographic or Question object into standard xOptions/yOptions for UniversalMatrix
function toMatrixOptions(axisConfig) {
  if (axisConfig.type === "demographic") {
    // Some demographic options are objects {label, value}, some are strings
    return axisConfig.source.options.map((opt, i) => {
      const val = typeof opt === "string" ? opt : opt.value;
      const lbl = typeof opt === "string" ? opt : opt.label;
      
      let color = C.blue;
      if (axisConfig.id === "pathway") {
        if (val === "intact") color = C.blue;
        else if (val === "circumcised") color = C.red;
        else if (val === "restoring") color = C.gold;
        else if (val === "observer") color = C.green;
        else if (val.startsWith("trans")) color = C.ltBlue;
        else color = C.muted;
      }
      
      return {
        key: val,
        match: val,
        label: lbl,
        short: lbl,
        color
      };
    });
  } else if (axisConfig.type === "question") {
    return (axisConfig.source.opts || []).map((opt, i) => ({
      key: opt,
      match: opt,
      label: opt,
      short: opt,
      color: axisConfig.source.colors?.[i] || C.gold
    }));
  }
  return [];
}

const CURATED_IDS = [
  // Family & Background
  "family_mother_education",
  "family_mother_profession",
  "family_father_education",
  "family_father_profession",
  "family_ses",
  "family_politics",
  "family_upbringing_status",
  "family_cultural_background",
  "family_father_status",
  
  // Demographics (Survey-based)
  "demo_generation",
  "demo_education_self",
  "demo_sexuality",
  "demo_gender_identity",
  "demo_sex_assigned_at_birth",
  
  // Religion
  "religion_is_significant",
  "religion_primary_tradition",
  "religion_christian_denomination",
  "religion_jewish_denomination",
  
  // Cultural Context
  "culture_community_expectation",
  "culture_primary_view_of_circ",
  "culture_social_pressure_role",
  "final_social_norm_perception",
  
  // Outcomes & Satisfaction
  "circ_regret_feeling",
  "intact_regret_feeling",
  "exp_appearance_feeling",
  "exp_pride_satisfaction_rating",
  "final_aesthetic_preference",
  "final_child_decision_reason",
  "final_core_principle_choice",
  "final_pleasure_potential_belief",
  "final_avg_pleasure_belief",
  "final_healthier_hygienic_belief",
  "exp_lubrication_need",
  "exp_sex_rating_orgasm_intensity",
  "exp_sex_rating_sensitivity_light_touch",
  "exp_sex_rating_pleasure_mobile_skin"
];

const SHORT_LABELS = {
  "family_mother_education": "Mother's Education Level",
  "family_mother_profession": "Mother's Profession",
  "family_father_education": "Father's Education Level",
  "family_father_profession": "Father's Profession",
  "family_ses": "Family Socioeconomic Status",
  "family_politics": "Family Political Alignment",
  "family_upbringing_status": "Family Upbringing Status",
  "family_cultural_background": "Family Cultural Background",
  "family_father_status": "Father's State",
  
  "demo_generation": "Respondent's Generation",
  "demo_education_self": "Respondent's Education",
  "demo_sexuality": "Respondent's Sexuality",
  "demo_gender_identity": "Respondent's Gender Identity",
  "demo_sex_assigned_at_birth": "Sex Assigned at Birth",
  
  "religion_is_significant": "Significance of Religion",
  "religion_primary_tradition": "Primary Religious Tradition",
  "religion_christian_denomination": "Christian Denomination",
  "religion_jewish_denomination": "Jewish Denomination",
  
  "culture_community_expectation": "Community Expectations",
  "culture_primary_view_of_circ": "Primary View of Circumcision",
  "culture_social_pressure_role": "Role of Social Pressure",
  "final_social_norm_perception": "Perception of Social Norms",
  
  "circ_regret_feeling": "Circumcised: Resentment / Regret",
  "intact_regret_feeling": "Intact: Regret",
  "exp_appearance_feeling": "Feeling on Appearance",
  "exp_pride_satisfaction_rating": "Pride / Satisfaction Rating",
  "final_aesthetic_preference": "Aesthetic Preference",
  "final_child_decision_reason": "Decision for Future AMAB Child",
  "final_core_principle_choice": "Core Ethical Principle",
  "final_pleasure_potential_belief": "Belief: Pleasure Potential",
  "final_avg_pleasure_belief": "Belief: Average Pleasure",
  "final_healthier_hygienic_belief": "Belief: Healthier / Hygienic",
  "exp_lubrication_need": "Lubrication Need",
  "exp_sex_rating_orgasm_intensity": "Orgasm Intensity (1–5)",
  "exp_sex_rating_sensitivity_light_touch": "Light Touch Sensitivity (1–5)",
  "exp_sex_rating_pleasure_mobile_skin": "Pleasure from Mobile Skin (1–5)"
};

export default function CorrelationExplorerPage({ routerState, navigate, updateState }) {
  const { cohort } = routerState;

  const [questions, setQuestions] = useState([]);
  // Both axes are now state. Row axis = the variable whose options become rows.
  // Column axis = the variable whose options become columns. Either can be a
  // demographic dimension or a curated outcome question.
  // (We keep the historical activeX/activeY names internally — activeX feeds
  //  rows, activeY feeds columns — since UniversalMatrix still expects that.)
  const [activeX, setActiveX] = useState(null);
  const [activeY, setActiveY] = useState({
    type: "demographic",
    id: "pathway",
    source: DEMOGRAPHIC_DIMENSIONS.find(d => d.column === "pathway"),
  });
  // Third dimension — only used in flow mode. Defaults to Religion so the
  // out-of-the-box flow view is something meaningfully different from the
  // pairwise default (Family SES → Generation → Pathway is a useful default
  // pipe to skim before the user starts swapping pieces).
  const [activeZ, setActiveZ] = useState({
    type: "demographic",
    id: "primary_tradition",
    source: DEMOGRAPHIC_DIMENSIONS.find(d => d.id === "primary_tradition" || d.column === "primary_tradition"),
  });
  // View mode: "pairwise" renders the 2D matrix (existing behavior).
  // "flow" renders a 3-stage Sankey using activeX → activeY → activeZ.
  const [mode, setMode] = useState("pairwise");
  const sankeyTooltip = useTooltip();

  // Guard: in Flow mode, Source and Middle MUST be demographic columns
  // (the Sankey chains filters between stages and the cohort serializer can't
  // filter by question-id). If the user enters Flow mode with a question on
  // either of those slots — typical if they were exploring sexuality × regret
  // in Pairwise — snap to a sensible demographic fallback rather than silently
  // produce miscounted data.
  //
  // Also: enforce that the three Flow stages are all distinct. d3-sankey
  // throws on self-loop links, so if two stages share the same dim (e.g.
  // Socioeconomic → Socioeconomic → Pathway), the Sankey would crash. The
  // dropdowns mark colliding options as disabled, but we still need to handle
  // the moment of switching INTO Flow mode, when activeZ's default may
  // collide with whatever Pairwise had on activeX or activeY.
  useEffect(() => {
    if (mode !== "flow") return;
    const generation = DEMOGRAPHIC_DIMENSIONS.find(d => d.id === "generation" || d.column === "generation");
    const pathway = DEMOGRAPHIC_DIMENSIONS.find(d => d.column === "pathway");

    let nextX = activeX;
    let nextY = activeY;
    let nextZ = activeZ;

    if (nextX && nextX.type !== "demographic" && generation) {
      nextX = { type: "demographic", id: generation.column || generation.id, source: generation };
    }
    if (nextY && nextY.type !== "demographic" && pathway) {
      nextY = { type: "demographic", id: pathway.column || pathway.id, source: pathway };
    }

    // Resolve collisions: ensure all three axis ids are distinct. If activeY
    // matches activeX (or activeZ matches either), pick the first demographic
    // that isn't already in use.
    const takenIds = new Set();
    const pickReplacement = () => {
      return DEMOGRAPHIC_DIMENSIONS.find(d => !takenIds.has(d.column || d.id));
    };
    takenIds.add(nextX?.id);
    if (nextY && takenIds.has(nextY.id)) {
      const rep = pickReplacement();
      if (rep) nextY = { type: "demographic", id: rep.column || rep.id, source: rep };
    }
    takenIds.add(nextY?.id);
    if (nextZ && takenIds.has(nextZ.id)) {
      const rep = pickReplacement();
      if (rep) nextZ = { type: "demographic", id: rep.column || rep.id, source: rep };
    }

    if (nextX !== activeX) setActiveX(nextX);
    if (nextY !== activeY) setActiveY(nextY);
    if (nextZ !== activeZ) setActiveZ(nextZ);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getQuestions({ counts: false }).then(data => {
      // Filter to restrict to our curated list.
      // We no longer require q.opts because the dynamicY matrix engine automatically discovers the options from the data!
      const qs = (data.questions || []).filter(q => CURATED_IDS.includes(q.id));

      // Sort questions by their order in CURATED_IDS
      qs.sort((a, b) => CURATED_IDS.indexOf(a.id) - CURATED_IDS.indexOf(b.id));

      setQuestions(qs);

      // Default Setup: Family SES (rows) × Pathway (cols) — the CIRO route.
      // (Don't reset activeY; the user may have already chosen something.)
      if (!activeX) {
        const defaultFactor = qs.find(q => q.id === "family_ses") || qs[0];
        if (defaultFactor) {
          setActiveX({
            type: "question",
            id: defaultFactor.id,
            source: defaultFactor,
          });
        }
      }
    });
  }, [cohort]);

  // Serialize API endpoint
  const fetchUrl = useMemo(() => {
    if (!activeX || !activeY) return null;
    let url = `${API_BASE}/aggregate?q=${activeX.id}&by=${activeY.id}`;

    if (cohort) {
      const entries = Object.entries(cohort).filter(([, v]) => v);
      if (entries.length > 0) {
        const [col, val] = entries[0];
        const demoCols = ["country_born", "country_now", "us_state_born", "us_state_now",
          "can_province_born", "can_province_now",
          "race_ethnicity", "age_bracket", "generation", "education",
          "family_upbringing", "socioeconomic", "politics", "sexuality", "gender", "sex_assigned"];
        const religionCols = ["upbringing_significance", "primary_tradition", "cultural_background",
          "christian_denomination", "jewish_denomination", "islamic_madhhab"];
        const table = religionCols.includes(col) ? "religion" : demoCols.includes(col) ? "demographics" : null;
        if (table) {
          url += `&filter=${table}.${col}=${encodeURIComponent(val)}`;
        }
      }
    }
    return url;
  }, [activeX, activeY, JSON.stringify(cohort)]);

  const cohortLabel = useMemo(() => describeCohort(cohort), [JSON.stringify(cohort)]);

  // Helper for aggregate axes — turn the aggregate's buckets into the same
  // {key, match, label, short, color} shape that toMatrixOptions produces for
  // demographics and questions, so UniversalMatrix can consume either path.
  const aggregateAxisOptions = (axis) => {
    if (!axis || axis.type !== "aggregate") return [];
    return axis.source.buckets.map((b) => ({
      key: b.label,
      match: b.label,
      label: b.label,
      short: b.label,
      color: C.gold,
    }));
  };

  const xOptions = useMemo(() => {
    if (!activeY) return [];
    if (activeY.type === "aggregate") return aggregateAxisOptions(activeY);
    return toMatrixOptions(activeY);
  }, [activeY]); // Columns

  const yOptions = useMemo(() => {
    if (!activeX) return [];
    if (activeX.type === "aggregate") return aggregateAxisOptions(activeX);
    return toMatrixOptions(activeX);
  }, [activeX]); // Rows

  // True when either axis is a mirror-pair aggregate. Disqualifies the
  // ordinary fetchUrl path (which assumes a single q × by query) and routes
  // through buildAggregateObserved instead.
  const isAggregateMode = activeX?.type === "aggregate" || activeY?.type === "aggregate";
  const bothAggregates = activeX?.type === "aggregate" && activeY?.type === "aggregate";

  // ── Aggregate fetch+merge ────────────────────────────────────────────────
  // When one axis is a mirror-pair aggregate, we fetch each underlying source
  // question (cross-tabbed against the other axis), normalize the option
  // labels onto the canonical bucket set, union the counts, and synthesize a
  // results object in the same shape that UniversalMatrix's fetched path
  // would have produced. Then aggregateToObserved gives us the matrix.
  const [aggregateObserved, setAggregateObserved] = useState(null);
  const [aggregateLoading, setAggregateLoading] = useState(false);
  const [aggregateError, setAggregateError] = useState(null);

  useEffect(() => {
    if (!isAggregateMode || bothAggregates) {
      setAggregateObserved(null);
      setAggregateError(null);
      return;
    }
    let cancelled = false;
    setAggregateLoading(true);
    setAggregateError(null);

    // Figure out which axis is the aggregate and which is the "other" axis
    // (the one we cross-tab against). Either can be the aggregate.
    const aggAxis = activeX?.type === "aggregate" ? activeX : activeY;
    const otherAxis = activeX?.type === "aggregate" ? activeY : activeX;
    const agg = aggAxis.source;

    // Fire one aggregate query per source question, sharing the cohort filter
    // and the other-axis grouping. We catch individual failures so a single
    // bad query doesn't black-hole the merge.
    const fetches = agg.sources.map((qid) =>
      getAggregate(qid, { by: otherAxis.id, cohort })
        .catch((err) => {
          console.error(`Aggregate source failed: ${qid}`, err);
          return { results: {} };
        })
    );

    Promise.all(fetches).then((allRes) => {
      if (cancelled) return;

      // Step 1: collapse responses into a single map keyed by [otherAxisValue][bucketLabel].
      const merged = {};
      for (const res of allRes) {
        for (const [otherVal, data] of Object.entries(res.results || {})) {
          if (!merged[otherVal]) merged[otherVal] = {};
          for (const item of data.distribution || []) {
            const bucket = normalizeToBucket(item.label, agg.buckets);
            if (!bucket) continue; // un-mappable response: discard
            merged[otherVal][bucket.label] = (merged[otherVal][bucket.label] || 0) + item.n;
          }
        }
      }

      // Step 2: reshape to the { [outerKey]: { distribution: [{label,n}] } }
      // shape that aggregateToObserved expects. aggregateToObserved is smart
      // enough to figure out which side maps to which option set, so we don't
      // need to invert based on whether the aggregate is on rows or cols.
      const synthResults = {};
      for (const [otherVal, bucketCounts] of Object.entries(merged)) {
        synthResults[otherVal] = {
          distribution: Object.entries(bucketCounts).map(([label, n]) => ({ label, n })),
        };
      }

      const observed = aggregateToObserved(synthResults, xOptions, yOptions);
      setAggregateObserved(observed);
      setAggregateLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      setAggregateError(err.message || String(err));
      setAggregateLoading(false);
    });

    return () => { cancelled = true; };
    // Dep list: re-fetch whenever any axis changes or the cohort changes.
    // xOptions/yOptions are derived from activeX/activeY so we don't list
    // them separately; they're stable within a render cycle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeX, activeY, JSON.stringify(cohort), isAggregateMode, bothAggregates]);

  // Helpers that turn a dropdown selection string back into the {type, id, source}
  // shape that the rest of the page expects. The string is one of:
  //   "demo:<dimId>"    — a demographic dimension
  //   "q:<questionId>"  — a single curated survey question
  //   "agg:<aggId>"     — a mirror-pair aggregate (union of two questions)
  const buildAxisFromSelection = (valueStr) => {
    if (!valueStr) return null;
    if (valueStr.startsWith("demo:")) {
      const dimId = valueStr.slice("demo:".length);
      const dim = DEMOGRAPHIC_DIMENSIONS.find(d => d.id === dimId);
      if (!dim) return null;
      return { type: "demographic", id: dim.column || dim.id, source: dim };
    }
    if (valueStr.startsWith("q:")) {
      const qid = valueStr.slice("q:".length);
      const q = questions.find(q => q.id === qid);
      if (!q) return null;
      return { type: "question", id: q.id, source: q };
    }
    if (valueStr.startsWith("agg:")) {
      const aggId = valueStr.slice("agg:".length);
      const agg = findAggregate(aggId);
      if (!agg) return null;
      return { type: "aggregate", id: aggId, source: agg };
    }
    return null;
  };

  const axisToSelectionString = (axis) => {
    if (!axis) return "";
    if (axis.type === "demographic") return `demo:${axis.source?.id || axis.id}`;
    if (axis.type === "question") return `q:${axis.id}`;
    if (axis.type === "aggregate") return `agg:${axis.id}`;
    return "";
  };

  const handleRowSelect = (valueStr) => {
    const next = buildAxisFromSelection(valueStr);
    if (next) setActiveX(next);
  };

  const handleColSelect = (valueStr) => {
    const next = buildAxisFromSelection(valueStr);
    if (next) setActiveY(next);
  };

  const handleThirdSelect = (valueStr) => {
    const next = buildAxisFromSelection(valueStr);
    if (next) setActiveZ(next);
  };

  const swapAxes = () => {
    setActiveX(activeY);
    setActiveY(activeX);
  };

  // Build the dimensions array the Sankey expects. It only reads `.id`, but
  // we pass `.label` too so any future Sankey rev that wants nicer chrome can
  // pick it up without touching the call site.
  const sankeyDimensions = useMemo(() => {
    return [activeX, activeY, activeZ]
      .filter(Boolean)
      .map((a) => ({ id: a.id, label: axisDisplayName(a) }));
  }, [activeX, activeY, activeZ]);

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      padding: "1.5rem 1.1rem 3rem",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <InlineBreadcrumb currentRoute="correlations" navigate={navigate} />
        
        
        {/* Layout Grid */}
        <div className="explore-grid" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem", alignItems: "start" }}>
                
          {/* LEFT: Cohort filter */}
          <aside className="explore-nav" style={{
            position: "sticky",
            top: "calc(var(--header-height, 56px) + 1rem)",
            maxHeight: "calc(100vh - var(--header-height, 56px) - 2rem)",
            overflowY: "auto",
            paddingRight: "0.3rem",
            zIndex: 100,
          }}>
            <DemographicFilterBar cohort={cohort} onChange={(c) => updateState({ cohort: c })} />
            <div style={{ marginTop: "1.25rem", padding: "0.75rem 0.85rem", background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 7, fontFamily: FONT.body, fontSize: "0.78rem", color: C.muted, lineHeight: 1.55 }}>
              <div style={{ fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: C.goldBright, marginBottom: "0.4rem", fontWeight: 700 }}>How this works</div>
              Pick any two variables to cross-tabulate. Either dropdown can be a demographic dimension or a survey outcome. Cells brighten when the observed count exceeds what chance alone would predict.
            </div>
          </aside>

          {/* RIGHT: Main Matrix Engine */}
          <main>
            {/* Mode Toggle */}
            <ModeToggle mode={mode} setMode={setMode} />

            {/* Control Panel — axes (2 in pairwise mode, 3 in flow mode) */}
            <div style={{
              background: C.bgSoft,
              border: `1px solid ${C.ghost}`,
              borderRadius: 12,
              padding: "1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}>
              {mode === "pairwise" ? (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  gap: "1rem",
                  alignItems: "end",
                }}>
                  <AxisPicker
                    label="Rows (vertical axis)"
                    value={axisToSelectionString(activeX)}
                    onChange={handleRowSelect}
                    questions={questions}
                    excludeIds={new Set([axisToSelectionString(activeY)].filter(Boolean))}
                  />
                  <button
                    type="button"
                    onClick={swapAxes}
                    aria-label="Swap row and column axes"
                    title="Swap axes"
                    style={{
                      background: C.bgCard,
                      border: `1px solid ${C.ghost}`,
                      color: C.muted,
                      fontFamily: FONT.condensed,
                      fontSize: "0.7rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "0.5rem 0.7rem",
                      borderRadius: 6,
                      cursor: "pointer",
                      height: "fit-content",
                      marginBottom: "0.05rem",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = C.goldBright; e.currentTarget.style.borderColor = C.gold; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.ghost; }}
                  >
                    ⇄ Swap
                  </button>
                  <AxisPicker
                    label="Columns (horizontal axis)"
                    value={axisToSelectionString(activeY)}
                    onChange={handleColSelect}
                    questions={questions}
                    excludeIds={new Set([axisToSelectionString(activeX)].filter(Boolean))}
                  />
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr auto 1fr",
                  gap: "0.8rem",
                  alignItems: "end",
                }}>
                  <AxisPicker
                    label="Source"
                    value={axisToSelectionString(activeX)}
                    onChange={handleRowSelect}
                    questions={questions}
                    demographicsOnly={true}
                    excludeIds={new Set([axisToSelectionString(activeY), axisToSelectionString(activeZ)].filter(Boolean))}
                  />
                  <FlowArrow />
                  <AxisPicker
                    label="Middle"
                    value={axisToSelectionString(activeY)}
                    onChange={handleColSelect}
                    questions={questions}
                    demographicsOnly={true}
                    excludeIds={new Set([axisToSelectionString(activeX), axisToSelectionString(activeZ)].filter(Boolean))}
                  />
                  <FlowArrow />
                  <AxisPicker
                    label="Target"
                    value={axisToSelectionString(activeZ)}
                    onChange={handleThirdSelect}
                    questions={questions}
                    hideAggregates={true}
                    excludeIds={new Set([axisToSelectionString(activeX), axisToSelectionString(activeY)].filter(Boolean))}
                  />
                </div>
              )}

              {/* Full question text for any axis that's a survey question, or
                  an explanation of the source questions for an aggregate axis. */}
              {(
                activeX?.type === "question" || activeX?.type === "aggregate" ||
                activeY?.type === "question" || activeY?.type === "aggregate" ||
                (mode === "flow" && activeZ?.type === "question")
              ) && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {activeX?.type === "question" && (
                    <QuestionContextPanel role={mode === "pairwise" ? "Rows" : "Source"} axis={activeX} />
                  )}
                  {activeX?.type === "aggregate" && (
                    <AggregateContextPanel role={mode === "pairwise" ? "Rows" : "Source"} axis={activeX} questionsMap={questions} />
                  )}
                  {activeY?.type === "question" && (
                    <QuestionContextPanel role={mode === "pairwise" ? "Columns" : "Middle"} axis={activeY} />
                  )}
                  {activeY?.type === "aggregate" && (
                    <AggregateContextPanel role={mode === "pairwise" ? "Columns" : "Middle"} axis={activeY} questionsMap={questions} />
                  )}
                  {mode === "flow" && activeZ?.type === "question" && (
                    <QuestionContextPanel role="Target" axis={activeZ} />
                  )}
                </div>
              )}
            </div>

            {/* Visualization */}
            <div style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "2rem" }}>
              {mode === "pairwise" && activeX && activeY && bothAggregates && (
                <div style={{
                  padding: "2.5rem 1.5rem",
                  textAlign: "center",
                  color: C.muted,
                  fontFamily: FONT.body,
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                }}>
                  Cross-tabbing two mirror-pair aggregates against each other isn't supported yet — each aggregate is built from two pathway-specific source questions, and a 4-way join needs server-side support.
                  <br />
                  <span style={{ color: C.dim, fontSize: "0.85rem" }}>
                    Pick one aggregate and one demographic or question on the other axis.
                  </span>
                </div>
              )}
              {mode === "pairwise" && activeX && activeY && !bothAggregates && isAggregateMode && (
                aggregateError ? (
                  <div style={{ padding: "2rem", color: C.red, fontFamily: FONT.mono, fontSize: "0.85rem", textAlign: "center" }}>
                    Failed to build aggregate: {aggregateError}
                  </div>
                ) : aggregateLoading || !aggregateObserved ? (
                  <div style={{ padding: "3rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
                    Unioning mirror-pair responses…
                  </div>
                ) : xOptions.length > 0 && yOptions.length > 0 && (
                  <UniversalMatrix
                    xOptions={xOptions}
                    yOptions={yOptions}
                    observed={aggregateObserved}
                    autoStories={false}
                    activeXId={activeX?.id}
                    cohortLabel={cohortLabel}
                    title=""
                    subtitle=""
                    eyebrow={`${axisDisplayName(activeX)} × ${axisDisplayName(activeY)}`}
                    leftLabel={axisDisplayName(activeX)}
                    rightLabel={axisDisplayName(activeY)}
                  />
                )
              )}
              {mode === "pairwise" && activeX && activeY && !isAggregateMode && xOptions.length > 0 && (
                <UniversalMatrix
                  xOptions={xOptions}
                  yOptions={yOptions}
                  dynamicY={true}
                  activeXId={activeX?.id}
                  fetchUrl={fetchUrl}
                  cohortLabel={cohortLabel}
                  title=""
                  subtitle=""
                  eyebrow={`${axisDisplayName(activeX)} × ${axisDisplayName(activeY)}`}
                  leftLabel={axisDisplayName(activeX)}
                  rightLabel={axisDisplayName(activeY)}
                />
              )}
              {mode === "flow" && activeX && activeY && activeZ && (
                <div>
                  <div style={{
                    fontFamily: FONT.condensed,
                    fontSize: "0.65rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: C.gold,
                    fontWeight: 700,
                    marginBottom: "0.4rem",
                  }}>
                    {axisDisplayName(activeX)} → {axisDisplayName(activeY)} → {axisDisplayName(activeZ)}
                  </div>
                  <div style={{
                    fontFamily: FONT.body,
                    fontSize: "0.82rem",
                    color: C.muted,
                    marginBottom: "1.25rem",
                    lineHeight: 1.4,
                  }}>
                    Flow widths are proportional to respondent counts. Top 4 source values · top 3 intermediate branches per source · top 4 targets (all pathways when Target = Pathway).
                    {cohortLabel && <> Filtered to: <strong style={{ color: C.text }}>{cohortLabel}</strong>.</>}
                  </div>
                  <DemographicSankey
                    cohort={cohort}
                    dimensions={sankeyDimensions}
                    tooltip={sankeyTooltip}
                  />
                  <Tooltip {...sankeyTooltip.tooltip} />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ── ModeToggle — segmented control: Pairwise (matrix) | Flow (3-way Sankey) ─
function ModeToggle({ mode, setMode }) {
  const opts = [
    { id: "pairwise", label: "Pairwise" },
    { id: "flow", label: "Flow" },
  ];
  return (
    <div style={{
      display: "inline-flex",
      background: C.bgSoft,
      border: `1px solid ${C.ghost}`,
      borderRadius: 999,
      padding: "0.2rem",
      marginBottom: "1rem",
      gap: "0.1rem",
    }}>
      {opts.map((o) => {
        const isActive = mode === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => setMode(o.id)}
            style={{
              background: isActive ? C.bgCard : "transparent",
              border: "none",
              color: isActive ? C.textBright : C.muted,
              fontFamily: FONT.condensed,
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "0.4rem 1rem",
              borderRadius: 999,
              cursor: "pointer",
              fontWeight: isActive ? 700 : 500,
              transition: "all 0.15s",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── FlowArrow — small "→" glyph used between the three Flow-mode axis pickers
function FlowArrow() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: C.dim,
      fontSize: "1.2rem",
      marginBottom: "0.4rem",
      userSelect: "none",
    }}>
      →
    </div>
  );
}

// ── Helper: render a label for an axis selection ───────────────────────────
function axisDisplayName(axis) {
  if (!axis) return "Variable";
  if (axis.type === "demographic") {
    return axis.source?.label || axis.id;
  }
  if (axis.type === "question") {
    return SHORT_LABELS[axis.id] || axis.source?.label || axis.source?.section || axis.id;
  }
  return "Variable";
}

// ── AxisPicker — single dropdown offering demographics + curated outcomes ──
// The selection string format is "demo:<dimId>" or "q:<questionId>" so the
// parent can rehydrate the {type, id, source} shape via buildAxisFromSelection.
//
// `demographicsOnly` hides the survey-question optgroup. Used for Source and
// Middle in Flow mode, because the Sankey chains filters between stages and
// the cohort serializer only knows how to filter on demographic columns —
// passing a question id as a filter would silently no-op and give the visitor
// wrong counts.
//
// `excludeIds` is a Set of selection strings (e.g., new Set(["demo:pathway"]))
// that should render as disabled. Used to prevent the user picking the same
// variable for two axes simultaneously — in Flow mode that creates self-loop
// links in the Sankey which crashes d3-sankey.
function AxisPicker({ label, value, onChange, questions, demographicsOnly = false, hideAggregates = false, excludeIds = null }) {
  const isExcluded = (key) => excludeIds && excludeIds.has(key);
  return (
    <div>
      <div style={{
        fontFamily: FONT.condensed,
        fontSize: "0.7rem",
        color: C.goldBright,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        marginBottom: "0.4rem",
        fontWeight: 700,
      }}>
        {label}
      </div>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "0.55rem",
          background: C.bgDeep,
          border: `1px solid ${C.ghost}`,
          color: C.text,
          borderRadius: 6,
          fontFamily: FONT.body,
          fontSize: "0.85rem",
          cursor: "pointer",
        }}
      >
        <optgroup label="Demographics">
          {DEMOGRAPHIC_DIMENSIONS.map((d) => {
            const key = `demo:${d.id}`;
            return (
              <option key={key} value={key} disabled={isExcluded(key)}>
                {d.label}{isExcluded(key) ? " (in use)" : ""}
              </option>
            );
          })}
        </optgroup>
        {!demographicsOnly && !hideAggregates && MIRROR_AGGREGATES.length > 0 && (
          <optgroup label="Mirror-Pair Aggregates">
            {MIRROR_AGGREGATES.map((a) => {
              const key = `agg:${a.id}`;
              return (
                <option key={key} value={key} disabled={isExcluded(key)}>
                  {a.label}{isExcluded(key) ? " (in use)" : ""}
                </option>
              );
            })}
          </optgroup>
        )}
        {!demographicsOnly && (
          <optgroup label="Survey Questions (Predictors & Outcomes)">
            {questions.map((q) => {
              const shortText = SHORT_LABELS[q.id] || q.prompt;
              const key = `q:${q.id}`;
              return (
                <option key={key} value={key} disabled={isExcluded(key)}>
                  {q.section ? `[${q.section}] ` : ""}{shortText}{isExcluded(key) ? " (in use)" : ""}
                </option>
              );
            })}
          </optgroup>
        )}
      </select>
    </div>
  );
}

// ── AggregateContextPanel — shows what an aggregate axis is built from.
// Visitors deserve to see the two source questions and the bucket scheme so
// they understand why each respondent ends up in exactly one row.
function AggregateContextPanel({ role, axis, questionsMap }) {
  if (!axis?.source) return null;
  const agg = axis.source;
  // questionsMap may be an array (from `questions` state) or a true map; handle both
  const lookupPrompt = (qid) => {
    if (Array.isArray(questionsMap)) {
      return questionsMap.find(q => q.id === qid)?.prompt || qid;
    }
    return questionsMap?.[qid]?.prompt || qid;
  };
  return (
    <div style={{
      padding: "0.75rem 1rem",
      background: "rgba(0,0,0,0.18)",
      borderRadius: 6,
      borderLeft: `3px solid ${C.gold}`,
    }}>
      <div style={{
        fontFamily: FONT.condensed,
        fontSize: "0.6rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: "0.4rem",
        fontWeight: 700,
      }}>
        {role} — Mirror-Pair Aggregate
      </div>
      <div style={{
        fontFamily: FONT.body,
        fontSize: "0.78rem",
        color: C.muted,
        lineHeight: 1.45,
        marginBottom: "0.5rem",
      }}>
        Unions responses from two pathway-specific questions onto a shared 4-bucket scale
        ({agg.buckets.map(b => b.label).join(" / ")}). Each respondent answered only one of the
        two sources, so this is a union, not a sum.
      </div>
      <ul style={{ margin: 0, paddingLeft: "1rem", listStyle: "disc", color: C.text, fontFamily: FONT.body, fontSize: "0.8rem", lineHeight: 1.45 }}>
        {agg.sources.map((qid) => (
          <li key={qid} style={{ marginBottom: "0.25rem" }}>
            <span style={{ fontFamily: FONT.mono, fontSize: "0.7rem", color: C.dim, marginRight: "0.4rem" }}>{qid}</span>
            <span style={{ fontStyle: "italic" }}>"{lookupPrompt(qid)}"</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── QuestionContextPanel — shows the full question prompt for axes that
// resolve to survey questions. Helps disambiguate when a SHORT_LABELS string
// could mean several things (e.g. "Family Cultural Background").
function QuestionContextPanel({ role, axis }) {
  if (!axis?.source?.prompt) return null;
  return (
    <div style={{
      padding: "0.75rem 1rem",
      background: "rgba(0,0,0,0.18)",
      borderRadius: 6,
      borderLeft: `3px solid ${C.dim}`,
    }}>
      <div style={{
        fontFamily: FONT.condensed,
        fontSize: "0.6rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: C.dim,
        marginBottom: "0.25rem",
        fontWeight: 700,
      }}>
        {role} — Survey Question
      </div>
      <div style={{
        fontFamily: FONT.body,
        fontSize: "0.88rem",
        color: C.textBright,
        lineHeight: 1.45,
        fontStyle: "italic",
      }}>
        "{axis.source.prompt}"
      </div>
    </div>
  );
}
