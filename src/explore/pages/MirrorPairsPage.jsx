import { useState, useEffect, useRef, useMemo } from "react";
import { hashLink } from "../lib/router";
import { C, FONT, PATH_COLORS } from "../styles/tokens";
import { getQuestions, getResponseDistribution, getAggregate } from "../lib/api";
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

function MirrorSideBureau({ question, distribution, cohortDistribution }) {
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  const sortedDist = useMemo(() => {
    if (!distribution?.distribution) return [];
    let d = [...distribution.distribution];
    return sortDistribution(d, question);
  }, [distribution, question]);

  const total = useMemo(() => {
    return sortedDist.reduce((s, d) => s + d.n, 0);
  }, [sortedDist]);

  const cohortMap = useMemo(() => {
    if (!cohortDistribution?.distribution) return null;
    const map = {};
    cohortDistribution.distribution.forEach(d => {
      map[d.label] = d.n;
    });
    return map;
  }, [cohortDistribution]);

  const cohortTotal = useMemo(() => {
    if (!cohortDistribution?.distribution) return 0;
    return cohortDistribution.distribution.reduce((s, d) => s + d.n, 0);
  }, [cohortDistribution]);

  const colorMap = useMemo(() => {
    const map = {};
    sortedDist.forEach((item, index) => {
      map[item.label] = colorForLabel(item.label, index);
    });
    return map;
  }, [sortedDist]);

  if (!distribution) {
    return <div style={{ color: C.dim, fontSize: "0.85rem", fontStyle: "italic" }}>Loading...</div>;
  }

  if (question.type === "open_text") {
    return (
      <div style={{ padding: "1rem", background: C.bgDeep, borderRadius: 6, color: C.dim, fontSize: "0.85rem", fontStyle: "italic" }}>
        Open text responses are available in the individual question view or Narrative Mirrors.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
        <span style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.muted }}>
          {cohortTotal > 0 ? `n = ${cohortTotal} (filtered) / ${total} (total)` : `n = ${total}`}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {sortedDist.map((d, i) => {
          const overallPct = total > 0 ? (d.n / total) * 100 : 0;
          
          let cohortPct = null;
          if (cohortMap !== null) {
            const cohortN = cohortMap[d.label] || 0;
            cohortPct = cohortTotal > 0 ? (cohortN / cohortTotal) * 100 : 0;
          }

          const activePct = cohortPct !== null ? cohortPct : overallPct;
          const barColor = colorMap[d.label] || colorForLabel(d.label, i);

          return (
            <div 
              key={i} 
              onMouseEnter={(e) => {
                const tooltipText = cohortPct !== null
                  ? `${d.label}: ${cohortPct.toFixed(1)}% (n=${cohortMap[d.label] || 0}) vs overall ${overallPct.toFixed(1)}% (n=${d.n})`
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
      } catch (err) {
        console.error("Failed to fetch distributions for pair", pair.id, err);
      }
    }
    fetchDist();
  }, [inView, pair, intactQ, circQ, universalQ, cohort, isUniversal]);

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
                <div style={{ padding: "1rem", background: C.bgDeep, borderRadius: 6, color: C.dim, fontSize: "0.85rem", fontStyle: "italic" }}>
                  Open text responses are available in the individual question view or Narrative Mirrors.
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
            {intactDist ? (
              <MirrorSideBureau 
                question={intactQ}
                distribution={intactDist} 
                cohortDistribution={intactCohortDist} 
              />
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
            {circDist ? (
              <MirrorSideBureau 
                question={circQ}
                distribution={circDist} 
                cohortDistribution={circCohortDist} 
              />
            ) : (
              <div style={{ color: C.dim }}>Loading...</div>
            )}
          </div>
        </div>
      </div>
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
