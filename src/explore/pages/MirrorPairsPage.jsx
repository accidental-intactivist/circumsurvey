import { useState, useEffect, useRef, useMemo } from "react";
import { hashLink } from "../lib/router";
import { C, FONT, PATH_COLORS } from "../styles/tokens";
import { getQuestions, getResponseDistribution, getAggregate, getNarratives } from "../lib/api";
import DistributionChart from "../components/DistributionChart";
import { PATHWAYS, PATHWAY_IDS } from "../lib/pathways";
import { useTooltip, Tooltip } from "../components/Tooltip";
import { colorForLabel } from "../components/MiniSparkline";
import { sortDistribution } from "../lib/formatters";

const MIRROR_PAIRS = [
  { id: "advantages", concept: "Perceived Advantages", intact: "intact_advantages_desc", circ: "circ_advantages_desc" },
  { id: "drawbacks", concept: "Perceived Drawbacks", intact: "intact_drawbacks_desc", circ: "circ_drawbacks_desc" },
  { id: "awareness_age", concept: "Age of Awareness", intact: "intact_circ_awareness_age", circ: "circ_awareness_age" },
  { id: "parents_reason", concept: "Parents' Stated Reason", intact: "intact_parents_reason", circ: "circ_parents_reason" },
  { id: "primary_driver", concept: "Primary Driver", intact: "intact_parents_driver", circ: "circ_parents_driver" },
  { id: "resentment", concept: "Resentment / Regret", intact: "intact_regret_feeling", circ: "circ_regret_feeling" },
  { id: "triggers", concept: "Triggers for Regret", intact: "intact_regret_triggers", circ: "circ_regret_triggers" },
  { id: "convo", concept: "Conversations with Parents", intact: "intact_parents_convo", circ: "circ_parents_convo" },
  { id: "why_not", concept: "Why Not Asked?", intact: "intact_parents_convo_why_not", circ: "circ_parents_convo_why_not" },
  { id: "medical", concept: "Medical Interventions", intact: "intact_medical_intervention", circ: "circ_medical_intervention" },
  { id: "notice_same", concept: "Noticing Cohort States", intact: "intact_notice_same_status", circ: "circ_notice_same_status" },
  { id: "curiosity", concept: "Curiosity About the Other", intact: "intact_curiosity_about_circ", circ: "circ_curiosity_about_intact" },
  { id: "curiosity_aspects", concept: "Curiosity (Specifics)", intact: "intact_curiosity_about_circ_aspects", circ: "circ_curiosity_about_intact_aspects" },
  { id: "thought_level", concept: "Prior Thought Level", intact: "intact_prior_thought_level", circ: "circ_prior_thought_level" },
  { id: "ppp_awareness", concept: "PPP Awareness", intact: "intact_ppp_awareness", circ: "circ_ppp_awareness" },
  { id: "ppp_impact", concept: "PPP Impact", intact: "intact_ppp_impact", circ: "circ_ppp_impact" },
  
  // Perceptions of Society's Thoughts & Norms (Universal Questions)
  { id: "social_norm_perception", concept: "Social Norm Perception", universal: "final_social_norm_perception" },
  { id: "social_pressure_locker_rooms", concept: "Social Pressures & Locker Rooms", universal: "culture_social_pressure_role" },
  { id: "media_penile_ideal", concept: "Media Shaping the Penile Ideal", universal: "final_ethical_consideration_belief" },
  { id: "partner_preference", concept: "Partner Preference", universal: "final_partner_preference_belief" },
  
  // Attitudes on Intact vs. Circumcised Differences (Universal Questions)
  { id: "medically_healthier", concept: "Medically Healthier / More Hygienic?", universal: "final_healthier_hygienic_belief" },
  { id: "pleasure_potential", concept: "Pleasure & Sensation Potential", universal: "final_pleasure_potential_belief" },
  { id: "average_pleasure_fulfillment", concept: "Average Pleasure & Orgasm", universal: "final_avg_pleasure_belief" },
  { id: "aesthetic_appeal", concept: "Aesthetic Appeal (Visual)", universal: "final_aesthetic_preference" },
  { id: "future_child_decision", concept: "Decision for AMAB Child Today", universal: "final_child_decision_reason" }
];

function normalizeMirrorLabel(label) {
  if (!label) return "";
  let clean = String(label).trim();
  
  // 1. Age of awareness normalization
  if (clean.toLowerCase().includes("always just known") || clean.toLowerCase().includes("always known")) {
    return "I've always just known";
  }
  if (clean.toLowerCase().includes("early childhood")) {
    return "Early childhood";
  }
  if (clean.toLowerCase().includes("pre-teen")) {
    return "Pre-teen years";
  }
  if (clean.toLowerCase().includes("teenage")) {
    return "Teenage years";
  }
  if (clean.toLowerCase().includes("adulthood")) {
    return "Adulthood";
  }
  if (clean.toLowerCase().includes("not applicable - grew up intact") || clean.toLowerCase().includes("not entirely sure what was done") || clean.toLowerCase().includes("not applicable") || clean.toLowerCase().includes("not sure what was done")) {
    return "Not applicable / Unsure";
  }

  // 2. Conversations with parents
  if (clean.toLowerCase().includes("detailed conversation")) {
    return "Detailed conversation";
  }
  if (clean.toLowerCase().includes("discussed it briefly") || clean.toLowerCase().includes("discussed briefly")) {
    return "Discussed briefly";
  }
  if (clean.toLowerCase().includes("tried to bring it up") || clean.toLowerCase().includes("tried to bring up")) {
    return "Tried to ask / brief discussion";
  }
  if (clean.toLowerCase().includes("never asked") || clean.toLowerCase().includes("never discussed")) {
    return "Never asked / discussed";
  }
  if (clean.toLowerCase().includes("parents are deceased")) {
    return "Not applicable";
  }

  // 3. Resentment / Regret
  if (clean.toLowerCase().includes("strong and frequent") || clean.toLowerCase().includes("frequent resentment")) {
    return "Strong and frequent";
  }
  if (clean.toLowerCase().includes("experience some of these") || clean.toLowerCase().includes("sometimes")) {
    return "Sometimes";
  }
  if (clean.toLowerCase().includes("rarely")) {
    return "Rarely";
  }
  if (clean.toLowerCase().includes("never")) {
    return "Never";
  }

  return clean;
}

const alignAndSortPair = (intactDist, circDist, intactCohortDist, circCohortDist, intactQ, circQ) => {
  if (!intactDist?.distribution || !circDist?.distribution) return null;

  const processSide = (dist, cohortDist) => {
    const rawItems = dist.distribution || [];
    const cohortMap = new Map();
    if (cohortDist?.distribution) {
      cohortDist.distribution.forEach(d => {
        cohortMap.set(normalizeMirrorLabel(d.label), d.n);
      });
    }

    const aggregated = new Map();
    rawItems.forEach(item => {
      const normLabel = normalizeMirrorLabel(item.label);
      if (!normLabel) return;
      const existing = aggregated.get(normLabel) || { label: normLabel, n: 0, cohortN: null };
      existing.n += item.n;
      if (cohortDist?.distribution) {
        existing.cohortN = (existing.cohortN || 0) + (cohortMap.get(normLabel) || 0);
      }
      aggregated.set(normLabel, existing);
    });

    return aggregated;
  };

  const intactMap = processSide(intactDist, intactCohortDist);
  const circMap = processSide(circDist, circCohortDist);

  const allLabels = Array.from(new Set([
    ...intactMap.keys(),
    ...circMap.keys()
  ]));

  let unionObjects = allLabels.map(label => {
    const intactN = intactMap.get(label)?.n || 0;
    const circN = circMap.get(label)?.n || 0;
    return { label, n: intactN + circN };
  });

  let sortedUnion = [];
  if (circQ) {
    sortedUnion = sortDistribution(unionObjects, circQ);
  } else if (intactQ) {
    sortedUnion = sortDistribution(unionObjects, intactQ);
  } else {
    sortedUnion = [...unionObjects].sort((a, b) => b.n - a.n);
  }

  const intactResult = [];
  const circResult = [];

  const intactTotal = Array.from(intactMap.values()).reduce((sum, item) => sum + item.n, 0);
  const circTotal = Array.from(circMap.values()).reduce((sum, item) => sum + item.n, 0);

  const intactCohortTotal = intactCohortDist?.distribution
    ? Array.from(intactMap.values()).reduce((sum, item) => sum + (item.cohortN || 0), 0)
    : 0;
  const circCohortTotal = circCohortDist?.distribution
    ? Array.from(circMap.values()).reduce((sum, item) => sum + (item.cohortN || 0), 0)
    : 0;

  sortedUnion.forEach(u => {
    const label = u.label;
    
    const intactItem = intactMap.get(label) || { label, n: 0, cohortN: null };
    intactResult.push({
      label,
      n: intactItem.n,
      cohortN: intactItem.cohortN
    });

    const circItem = circMap.get(label) || { label, n: 0, cohortN: null };
    circResult.push({
      label,
      n: circItem.n,
      cohortN: circItem.cohortN
    });
  });

  return {
    intactList: intactResult,
    circList: circResult,
    intactTotal,
    circTotal,
    intactCohortTotal,
    circCohortTotal
  };
};

export default function MirrorPairsPage({ routerState }) {
  const [questionsMap, setQuestionsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { questions } = await getQuestions();
        const map = {};
        for (const q of (questions || [])) map[q.id] = q;
        setQuestionsMap(map);
      } catch (err) {
        console.error("Failed to load questions", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div style={{ padding: "4rem", textAlign: "center", color: C.muted }}>Loading pairs...</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <header style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 style={{ fontFamily: FONT.display, fontSize: "2.5rem", color: C.textBright, marginBottom: "0.5rem" }}>
          Mirror Pairs & Cohort Contrasts
        </h1>
        <p style={{ fontFamily: FONT.body, color: C.muted, maxWidth: 800, margin: "0 auto", lineHeight: 1.6 }}>
          Explore parallel questions asked directly to Intact and Circumcised cohorts, as well as universal cultural/anatomical questions broken down side-by-side.
          This view highlights the striking divergence in cohort experience, expectation, and societal perception.
        </p>
      </header>

      <div style={{ display: "flex", gap: "3rem", alignItems: "flex-start" }}>
        
        {/* Sticky Sidebar Navigation */}
        <aside style={{
          position: "sticky",
          top: "2rem",
          flex: "0 0 260px",
          background: C.bgCard,
          border: `1px solid ${C.ghost}`,
          borderRadius: 12,
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          maxHeight: "calc(100vh - 4rem)",
          overflowY: "auto"
        }}>
          <h3 style={{ fontFamily: FONT.condensed, fontSize: "0.85rem", color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            Jump to Concept
          </h3>
          {MIRROR_PAIRS.map(pair => (
            <a key={pair.id} href={`#pair-${pair.id}`} style={{
              fontFamily: FONT.body,
              fontSize: "0.9rem",
              color: C.text,
              textDecoration: "none",
              padding: "0.4rem 0.6rem",
              borderRadius: 6,
              transition: "background 0.2s"
            }}
            onMouseOver={e => e.target.style.background = C.bgSoft}
            onMouseOut={e => e.target.style.background = "transparent"}>
              {pair.concept}
            </a>
          ))}
        </aside>

        {/* Content Column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4rem" }}>
          {MIRROR_PAIRS.map(pair => (
            <MirrorPairBlock key={pair.id} pair={pair} questionsMap={questionsMap} cohort={routerState.cohort} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MirrorSideBureau({ question, list, total, cohortTotal, hasCohort }) {
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  const sortedDist = list || [];

  const colorMap = useMemo(() => {
    const map = {};
    sortedDist.forEach((item, index) => {
      map[item.label] = colorForLabel(item.label, index);
    });
    return map;
  }, [sortedDist]);

  if (question.type === "open_text") {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
        <span style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.muted }}>
          {hasCohort && cohortTotal > 0 ? `n = ${cohortTotal} (filtered) / ${total} (total)` : `n = ${total}`}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {sortedDist.map((d, i) => {
          const overallPct = total > 0 ? (d.n / total) * 100 : 0;
          
          let cohortPct = null;
          if (hasCohort) {
            const cohortN = d.cohortN || 0;
            cohortPct = cohortTotal > 0 ? (cohortN / cohortTotal) * 100 : 0;
          }

          const activePct = cohortPct !== null ? cohortPct : overallPct;
          const barColor = colorMap[d.label] || colorForLabel(d.label, i);

          return (
            <div 
              key={i} 
              onMouseEnter={(e) => {
                const tooltipText = cohortPct !== null
                  ? `${d.label}: ${cohortPct.toFixed(1)}% (n=${d.cohortN || 0}) vs overall ${overallPct.toFixed(1)}% (n=${d.n})`
                  : `${d.label}: ${overallPct.toFixed(1)}% (n=${d.n})`;
                showTooltip(e, tooltipText);
              }}
              onMouseMove={moveTooltip}
              onMouseLeave={hideTooltip}
              style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              {/* Progress bar on left */}
              <div style={{ flex: 1, height: 14, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", 
                  width: `${activePct}%`, 
                  background: barColor, 
                  borderRadius: 3,
                  transition: "width 0.6s ease-out"
                }} />
              </div>

              {/* Label in middle */}
              <span 
                style={{ 
                  fontFamily: FONT.body, 
                  fontSize: "0.78rem", 
                  color: C.text, 
                  width: 140, 
                  flexShrink: 0, 
                  textOverflow: "ellipsis", 
                  overflow: "hidden", 
                  whiteSpace: "nowrap" 
                }} 
                title={d.label}
              >
                {d.label}
              </span>

              {/* Percentage on right */}
              <span 
                style={{ 
                  fontFamily: FONT.mono, 
                  fontSize: "0.76rem", 
                  fontWeight: 700, 
                  color: C.textBright, 
                  width: 100, 
                  textAlign: "right", 
                  flexShrink: 0 
                }}
              >
                {cohortPct !== null ? (
                  <>
                    <span>{cohortPct.toFixed(1)}%</span>
                    <span style={{ fontSize: "0.65rem", color: C.muted, marginLeft: "0.3rem" }}>({overallPct.toFixed(1)}%)</span>
                  </>
                ) : (
                  <span>{overallPct.toFixed(1)}%</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
      <Tooltip {...tooltip} />
    </div>
  );
}

function MirrorPairBlock({ pair, questionsMap, cohort }) {
  const isUniversal = !!pair.universal;
  const intactQ = isUniversal ? null : questionsMap[pair.intact];
  const circQ = isUniversal ? null : questionsMap[pair.circ];
  const universalQ = isUniversal ? questionsMap[pair.universal] : null;

  const isNarrative = useMemo(() => {
    return (intactQ && intactQ.type === "open_text") || (circQ && circQ.type === "open_text");
  }, [intactQ, circQ]);

  const [intactDist, setIntactDist] = useState(null);
  const [circDist, setCircDist] = useState(null);
  const [intactCohortDist, setIntactCohortDist] = useState(null);
  const [circCohortDist, setCircCohortDist] = useState(null);

  // Universal state
  const [universalDist, setUniversalDist] = useState(null);
  const [universalCohortDist, setUniversalCohortDist] = useState(null);
  const [byPathway, setByPathway] = useState(null);

  const [inView, setInView] = useState(false);
  const blockRef = useRef(null);

  const aligned = useMemo(() => {
    if (isUniversal || isNarrative) return null;
    return alignAndSortPair(intactDist, circDist, intactCohortDist, circCohortDist, intactQ, circQ);
  }, [intactDist, circDist, intactCohortDist, circCohortDist, intactQ, circQ, isUniversal, isNarrative]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { rootMargin: "200px" }
    );
    if (blockRef.current) observer.observe(blockRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    
    async function fetchDist() {
      try {
        if (isUniversal) {
          if (universalQ && !universalDist) {
            const d = await getResponseDistribution(pair.universal);
            setUniversalDist(d);
            
            // Get pathway breakdown
            const pathAgg = await getAggregate(pair.universal, { by: "pathway" }).catch(() => null);
            setByPathway(pathAgg);
          }
          if (universalQ && cohort) {
            const cd = await getResponseDistribution(pair.universal, { cohort });
            setUniversalCohortDist(cd);
          } else {
            setUniversalCohortDist(null);
          }
        } else {
          if (isNarrative) {
            if (intactQ && !intactDist) {
              const d = await getNarratives(pair.intact);
              setIntactDist(d);
            }
            if (intactQ && cohort) {
              const cd = await getNarratives(pair.intact, { cohort });
              setIntactCohortDist(cd);
            } else {
              setIntactCohortDist(null);
            }

            if (circQ && !circDist) {
              const d = await getNarratives(pair.circ);
              setCircDist(d);
            }
            if (circQ && cohort) {
              const cd = await getNarratives(pair.circ, { cohort });
              setCircCohortDist(cd);
            } else {
              setCircCohortDist(null);
            }
          } else {
            if (intactQ && !intactDist) {
              const d = await getResponseDistribution(pair.intact);
              setIntactDist(d);
            }
            if (intactQ && cohort) {
              const cd = await getResponseDistribution(pair.intact, { cohort });
              setIntactCohortDist(cd);
            } else {
              setIntactCohortDist(null);
            }

            if (circQ && !circDist) {
              const d = await getResponseDistribution(pair.circ);
              setCircDist(d);
            }
            if (circQ && cohort) {
              const cd = await getResponseDistribution(pair.circ, { cohort });
              setCircCohortDist(cd);
            } else {
              setCircCohortDist(null);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch distributions for pair", pair.id, err);
      }
    }
    fetchDist();
  }, [inView, pair, intactQ, circQ, universalQ, cohort, isUniversal, isNarrative]);

  if (isUniversal) {
    return (
      <section id={`pair-${pair.id}`} ref={blockRef} style={{
        background: C.bgSoft,
        border: `1px solid ${C.ghost}`,
        borderRadius: 12,
        overflow: "hidden"
      }}>
        <div style={{
          padding: "1rem 1.5rem",
          borderBottom: `1px solid ${C.ghost}`,
          background: C.bgCard,
          textAlign: "center"
        }}>
          <h2 style={{
            fontFamily: FONT.condensed,
            fontSize: "1.2rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.goldBright,
            margin: 0
          }}>{pair.concept}</h2>
        </div>

        <div style={{ padding: "1.5rem" }}>
          <div>
            <h3 style={{ fontFamily: FONT.condensed, color: C.gold, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
              Universal Question (All Cohorts)
            </h3>
            <p style={{ fontFamily: FONT.body, fontSize: "1rem", lineHeight: 1.4, color: C.textBright, marginBottom: universalQ?.subtitle ? "0.5rem" : "1.5rem" }}>
              {universalQ ? universalQ.prompt : "No matching question."}
            </p>
            {universalQ?.subtitle && (
              <p style={{ fontFamily: FONT.body, fontSize: "0.9rem", lineHeight: 1.4, color: C.muted, marginBottom: "1.5rem", fontStyle: "italic" }}>
                {universalQ.subtitle}
              </p>
            )}

            {universalDist ? (
              universalQ.type === "open_text" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ padding: "1rem", background: C.bgDeep, borderRadius: 6, color: C.dim, fontSize: "0.85rem", fontStyle: "italic" }}>
                    Open text responses are available in the individual question view or Narrative Mirrors.
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <a 
                      href={hashLink("question", { id: universalQ.id })}
                      style={{
                        fontFamily: FONT.condensed,
                        fontSize: "0.74rem",
                        color: C.goldBright,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        borderBottom: `1px solid ${C.goldBright}40`,
                        paddingBottom: "0.1rem",
                        transition: "border-color 0.2s"
                      }}
                      onMouseOver={e => e.target.style.borderBottomColor = C.goldBright}
                      onMouseOut={e => e.target.style.borderBottomColor = `${C.goldBright}40`}
                    >
                      See all answers →
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  <DistributionChart 
                    title="Overall Distribution"
                    distribution={universalDist} 
                    cohortDistribution={universalCohortDist} 
                    question={universalQ}
                  />
                  {byPathway && Object.keys(byPathway.results || {}).length > 0 && (
                    <PathwayBreakdown byPathway={byPathway} overallDist={universalDist?.distribution || []} />
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <a 
                      href={hashLink("question", { id: universalQ.id })}
                      style={{
                        fontFamily: FONT.condensed,
                        fontSize: "0.74rem",
                        color: C.goldBright,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        borderBottom: `1px solid ${C.goldBright}40`,
                        paddingBottom: "0.1rem",
                        transition: "border-color 0.2s"
                      }}
                      onMouseOver={e => e.target.style.borderBottomColor = C.goldBright}
                      onMouseOut={e => e.target.style.borderBottomColor = `${C.goldBright}40`}
                    >
                      See all answers & full breakdown →
                    </a>
                  </div>
                </div>
              )
            ) : (
              <div style={{ color: C.dim }}>Loading...</div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Normal Side-by-side Mirror Pair
  return (
    <section id={`pair-${pair.id}`} ref={blockRef} style={{
      background: C.bgSoft,
      border: `1px solid ${C.ghost}`,
      borderRadius: 12,
      overflow: "hidden"
    }}>
      <div style={{
        padding: "1rem 1.5rem",
        borderBottom: `1px solid ${C.ghost}`,
        background: C.bgCard,
        textAlign: "center"
      }}>
        <h2 style={{
          fontFamily: FONT.condensed,
          fontSize: "1.2rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: C.goldBright,
          margin: 0
        }}>{pair.concept}</h2>
      </div>
      
      {isNarrative ? (
        <MirrorNarrativeBlock 
          intactQ={intactQ}
          circQ={circQ}
          intactDist={intactDist}
          circDist={circDist}
          intactCohortDist={intactCohortDist}
          circCohortDist={circCohortDist}
          hasCohort={!!cohort}
        />
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <div style={{ flex: 1, padding: "1.5rem", minWidth: "280px" }}>
            <div>
              <h3 style={{ fontFamily: FONT.condensed, color: PATH_COLORS.intact, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                Intact Pathway
              </h3>
              <p style={{ fontFamily: FONT.body, fontSize: "1rem", lineHeight: 1.4, color: C.textBright, marginBottom: intactQ?.subtitle ? "0.5rem" : "1.5rem" }}>
                {intactQ ? intactQ.prompt : "No matching question."}
              </p>
              {intactQ?.subtitle && (
                <p style={{ fontFamily: FONT.body, fontSize: "0.9rem", lineHeight: 1.4, color: C.muted, marginBottom: "1.5rem", fontStyle: "italic" }}>
                  {intactQ.subtitle}
                </p>
              )}
              {aligned ? (
                <>
                  <MirrorSideBureau 
                    question={intactQ}
                    list={aligned.intactList}
                    total={aligned.intactTotal}
                    cohortTotal={aligned.intactCohortTotal}
                    hasCohort={!!cohort}
                  />
                  <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
                    <a 
                      href={hashLink("question", { id: intactQ.id })}
                      style={{
                        fontFamily: FONT.condensed,
                        fontSize: "0.74rem",
                        color: PATH_COLORS.intact,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        borderBottom: `1px solid ${PATH_COLORS.intact}40`,
                        paddingBottom: "0.1rem",
                        transition: "border-color 0.2s"
                      }}
                      onMouseOver={e => e.target.style.borderBottomColor = PATH_COLORS.intact}
                      onMouseOut={e => e.target.style.borderBottomColor = `${PATH_COLORS.intact}40`}
                    >
                      See all answers →
                    </a>
                  </div>
                </>
              ) : (
                <div style={{ color: C.dim }}>Loading...</div>
              )}
            </div>
          </div>
            
          <div style={{ width: 1, background: C.ghost }} />

          <div style={{ flex: 1, padding: "1.5rem", minWidth: "280px" }}>
            <div>
              <h3 style={{ fontFamily: FONT.condensed, color: PATH_COLORS.circumcised, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                Circumcised Pathway
              </h3>
              <p style={{ fontFamily: FONT.body, fontSize: "1rem", lineHeight: 1.4, color: C.textBright, marginBottom: circQ?.subtitle ? "0.5rem" : "1.5rem" }}>
                {circQ ? circQ.prompt : "No matching question."}
              </p>
              {circQ?.subtitle && (
                <p style={{ fontFamily: FONT.body, fontSize: "0.9rem", lineHeight: 1.4, color: C.muted, marginBottom: "1.5rem", fontStyle: "italic" }}>
                  {circQ.subtitle}
                </p>
              )}
              {aligned ? (
                <>
                  <MirrorSideBureau 
                    question={circQ}
                    list={aligned.circList}
                    total={aligned.circTotal}
                    cohortTotal={aligned.circCohortTotal}
                    hasCohort={!!cohort}
                  />
                  <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
                    <a 
                      href={hashLink("question", { id: circQ.id })}
                      style={{
                        fontFamily: FONT.condensed,
                        fontSize: "0.74rem",
                        color: PATH_COLORS.circumcised,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        borderBottom: `1px solid ${PATH_COLORS.circumcised}40`,
                        paddingBottom: "0.1rem",
                        transition: "border-color 0.2s"
                      }}
                      onMouseOver={e => e.target.style.borderBottomColor = PATH_COLORS.circumcised}
                      onMouseOut={e => e.target.style.borderBottomColor = `${PATH_COLORS.circumcised}40`}
                    >
                      See all answers →
                    </a>
                  </div>
                </>
              ) : (
                <div style={{ color: C.dim }}>Loading...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function PathwayBreakdown({ byPathway, overallDist = [] }) {
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  const results = byPathway.results || {};
  const pathwaysWithData = PATHWAY_IDS
    .filter((id) => results[id] && results[id].n > 0)
    .map((id) => ({ id, ...results[id] }));

  const colorMap = useMemo(() => {
    const map = {};
    if (overallDist) {
      overallDist.forEach((item, index) => {
        map[item.label] = colorForLabel(item.label, index);
      });
    }
    return map;
  }, [overallDist]);

  if (pathwaysWithData.length === 0) return null;

  return (
    <div style={{
      background: C.bgDeep,
      border: `1px solid ${C.ghost}`,
      borderRadius: 8,
      padding: "1.2rem",
      marginTop: "1.5rem"
    }}>
      <h3 style={{
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: "1.1rem",
        color: C.textBright,
        marginBottom: "0.9rem",
        letterSpacing: "-0.01em",
      }}>Response Breakdown by Pathway</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
        {pathwaysWithData.map((p) => {
          const path = PATHWAYS[p.id];
          const total = p.distribution.reduce((s, d) => s + d.n, 0);

          const sortedDist = overallDist ? [...p.distribution].sort((a, b) => {
            const labelOrder = overallDist.map(item => item.label);
            let idxA = labelOrder.indexOf(a.label);
            let idxB = labelOrder.indexOf(b.label);
            if (idxA === -1) idxA = 999;
            if (idxB === -1) idxB = 999;
            return idxA - idxB;
          }) : p.distribution;

          let xCursor = 0;
          return (
            <div key={p.id}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                <span style={{ fontSize: "0.85rem" }}>{path.emoji}</span>
                <span style={{
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.74rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: path.color,
                }}>{path.label}</span>
                <span style={{
                  fontFamily: FONT.mono,
                  fontSize: "0.66rem",
                  color: C.muted,
                }}>n = {total}</span>
              </div>
              <svg width="100%" height={12} style={{ display: "block", borderRadius: 2, overflow: "hidden" }}>
                <rect x={0} y={0} width="100%" height={12} fill={C.ghost} />
                {sortedDist.map((d, i) => {
                  const pct = (d.n / total) * 100;
                  const x = xCursor;
                  xCursor += pct;
                  
                  let canonicalIndex = overallDist.findIndex(od => od.label === d.label);
                  if (canonicalIndex === -1) canonicalIndex = i;

                  return (
                    <rect 
                      key={i} x={`${x}%`} y={0} width={`${pct}%`} height={12} fill={colorMap[d.label] || colorForLabel(d.label, canonicalIndex)}
                      onMouseEnter={(e) => showTooltip(e, `${d.label}: ${d.n} (${pct.toFixed(1)}%)`)}
                      onMouseMove={moveTooltip}
                      onMouseLeave={hideTooltip}
                    />
                  );
                })}
              </svg>
            </div>
          );
        })}
      </div>
      <Tooltip {...tooltip} />
    </div>
  );
}

function MirrorNarrativeBlock({ intactQ, circQ, intactDist, circDist, intactCohortDist, circCohortDist, hasCohort }) {
  const [shuffleTrigger, setShuffleTrigger] = useState(0);

  const getActiveNarratives = (fullDist, cohortDist) => {
    if (hasCohort) {
      return cohortDist?.narratives || [];
    }
    return fullDist?.narratives || [];
  };

  const intactNarratives = getActiveNarratives(intactDist, intactCohortDist);
  const circNarratives = getActiveNarratives(circDist, circCohortDist);

  const cleanFilter = (items) => {
    const fillers = [
      "n/a", "na", "no", "none", "nothing", "nil", "not applicable", 
      "no comment", "unsure", "unknown", "n.a", "n.a.", "none at all", 
      "no.", "no response", "don't know", "dont know", "no one", "not sure",
      "n a", "n / a", "none.", "no comments", "no comment.", "no one."
    ];
    return items.filter(item => {
      const text = item.text || item.label || "";
      const clean = text.trim().toLowerCase().replace(/^[.\s\-_,]+|[.\s\-_,]+$/g, "");
      return clean && !fillers.includes(clean);
    });
  };

  const cleanIntact = useMemo(() => cleanFilter(intactNarratives), [intactNarratives]);
  const cleanCirc = useMemo(() => cleanFilter(circNarratives), [circNarratives]);

  const randomIntact = useMemo(() => {
    if (cleanIntact.length === 0) return [];
    const shuffled = [...cleanIntact].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [cleanIntact, shuffleTrigger]);

  const randomCirc = useMemo(() => {
    if (cleanCirc.length === 0) return [];
    const shuffled = [...cleanCirc].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [cleanCirc, shuffleTrigger]);

  const renderQuoteCard = (item, idx, pathwayColor) => {
    let genStr = item.generation || "";
    if (genStr.includes("(born")) {
      genStr = genStr.split("(born")[0].trim();
    }
    if (genStr === "Boomer") genStr = "Baby Boomer";
    
    let locStr = "";
    let region = item.us_state_now || item.canada_province_now;
    if (region && typeof region === 'string' && region.includes(" - ")) {
      region = region.split(" - ").pop().trim();
    }
    let country = item.country_now;
    if (country === "United States of America (USA)") country = "USA";
    else if (country === "United Kingdom of Great Britain and Northern Ireland (UK)") country = "UK";

    if (region && country) locStr = `${region}, ${country}`;
    else if (country) locStr = country;

    return (
      <div key={idx} style={{
        background: "var(--c-bgSoft)",
        border: `1px solid var(--c-ghost)`,
        borderLeft: `3px solid ${pathwayColor}`,
        borderRadius: 8,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        padding: "1.2rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        transition: "transform 0.2s, box-shadow 0.2s"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
      }}>
        <div style={{
          color: "var(--c-muted)",
          fontSize: "0.65rem",
          fontFamily: FONT.condensed,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          display: "flex",
          justifyContent: "space-between",
        }}>
          <span>{genStr || "Unknown Gen"}</span>
          <span>{locStr}</span>
        </div>
        <p style={{
          margin: 0,
          fontFamily: FONT.display,
          fontStyle: "italic",
          fontSize: "0.95rem",
          lineHeight: 1.5,
          color: "var(--c-textBright)"
        }}>
          "{item.text || item.label}"
        </p>
      </div>
    );
  };

  const hasResponses = cleanIntact.length > 0 || cleanCirc.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1.5rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        
        {/* Left Column: Intact */}
        <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem" }}>
            <h3 style={{ fontFamily: FONT.condensed, color: PATH_COLORS.intact, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
              Intact Pathway
            </h3>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              <span style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.muted }}>
                Pool: {cleanIntact.length}
              </span>
              <span style={{ color: C.dim, fontSize: "0.7rem" }}>·</span>
              <a 
                href={hashLink("question", { id: intactQ.id })}
                style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.72rem",
                  color: PATH_COLORS.intact,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textDecoration: "none",
                  borderBottom: `1px solid ${PATH_COLORS.intact}40`,
                  paddingBottom: "0.1rem",
                  transition: "border-color 0.2s"
                }}
                onMouseOver={e => e.target.style.borderBottomColor = PATH_COLORS.intact}
                onMouseOut={e => e.target.style.borderBottomColor = `${PATH_COLORS.intact}40`}
              >
                See all →
              </a>
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {randomIntact.map((item, idx) => renderQuoteCard(item, idx, PATH_COLORS.intact))}
            {cleanIntact.length === 0 && (
              <div style={{ color: C.dim, fontStyle: "italic", padding: "1.5rem 0", fontSize: "0.85rem" }}>
                No matching narrative responses.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Circumcised */}
        <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem" }}>
            <h3 style={{ fontFamily: FONT.condensed, color: PATH_COLORS.circumcised, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
              Circumcised Pathway
            </h3>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              <span style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.muted }}>
                Pool: {cleanCirc.length}
              </span>
              <span style={{ color: C.dim, fontSize: "0.7rem" }}>·</span>
              <a 
                href={hashLink("question", { id: circQ.id })}
                style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.72rem",
                  color: PATH_COLORS.circumcised,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textDecoration: "none",
                  borderBottom: `1px solid ${PATH_COLORS.circumcised}40`,
                  paddingBottom: "0.1rem",
                  transition: "border-color 0.2s"
                }}
                onMouseOver={e => e.target.style.borderBottomColor = PATH_COLORS.circumcised}
                onMouseOut={e => e.target.style.borderBottomColor = `${PATH_COLORS.circumcised}40`}
              >
                See all →
              </a>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {randomCirc.map((item, idx) => renderQuoteCard(item, idx, PATH_COLORS.circumcised))}
            {cleanCirc.length === 0 && (
              <div style={{ color: C.dim, fontStyle: "italic", padding: "1.5rem 0", fontSize: "0.85rem" }}>
                No matching narrative responses.
              </div>
            )}
          </div>
        </div>

      </div>

      {hasResponses && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
          <button
            onClick={() => setShuffleTrigger(s => s + 1)}
            style={{
              padding: "0.5rem 1.2rem",
              background: "transparent",
              border: `1px solid ${C.ghost}`,
              color: C.goldBright,
              borderRadius: 6,
              fontFamily: FONT.condensed,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = C.ghost;
              e.currentTarget.style.borderColor = C.gold;
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = C.ghost;
            }}
          >
            <span>Shuffle Responses</span>
            <span>↺</span>
          </button>
        </div>
      )}
    </div>
  );
}
