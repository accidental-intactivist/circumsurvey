import { useState, useEffect, useRef } from "react";
import { hashLink } from "../lib/router";
import { C, FONT, PATH_COLORS } from "../styles/tokens";
import { getQuestions, getResponseDistribution } from "../lib/api";
import DistributionChart from "../components/DistributionChart";

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
  { id: "notice_same", concept: "Noticing Same Status", intact: "intact_notice_same_status", circ: "circ_notice_same_status" },
  { id: "curiosity", concept: "Curiosity About the Other", intact: "intact_curiosity_about_circ", circ: "circ_curiosity_about_intact" },
  { id: "curiosity_aspects", concept: "Curiosity (Specifics)", intact: "intact_curiosity_about_circ_aspects", circ: "circ_curiosity_about_intact_aspects" },
  { id: "thought_level", concept: "Prior Thought Level", intact: "intact_prior_thought_level", circ: "circ_prior_thought_level" },
  { id: "ppp_awareness", concept: "PPP Awareness", intact: "intact_ppp_awareness", circ: "circ_ppp_awareness" },
  { id: "ppp_impact", concept: "PPP Impact", intact: "intact_ppp_impact", circ: "circ_ppp_impact" },
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
          Mirror Pairs
        </h1>
        <p style={{ fontFamily: FONT.body, color: C.muted, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
          18 conceptual questions asked in parallel to both Intact and Circumcised respondents. 
          This split-screen view highlights the divergence in experience, expectation, and perception.
        </p>
      </header>

      <div style={{ display: "flex", gap: "3rem", alignItems: "flex-start" }}>
        
        {/* Sticky Sidebar Navigation */}
        <aside style={{
          position: "sticky",
          top: "2rem",
          flex: "0 0 250px",
          background: C.bgCard,
          border: `1px solid ${C.ghost}`,
          borderRadius: 12,
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem"
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

function MirrorPairBlock({ pair, questionsMap, cohort }) {
  const intactQ = questionsMap[pair.intact];
  const circQ = questionsMap[pair.circ];

  const [intactDist, setIntactDist] = useState(null);
  const [circDist, setCircDist] = useState(null);
  const [intactCohortDist, setIntactCohortDist] = useState(null);
  const [circCohortDist, setCircCohortDist] = useState(null);
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
        if (intactQ && !intactDist) {
          const d = await getResponseDistribution(pair.intact);
          setIntactDist(d);
          if (cohort) {
            const cd = await getResponseDistribution(pair.intact, { cohort });
            setIntactCohortDist(cd);
          } else {
            setIntactCohortDist(null);
          }
        }
        if (circQ && !circDist) {
          const d = await getResponseDistribution(pair.circ);
          setCircDist(d);
          if (cohort) {
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
  }, [inView, pair, intactQ, circQ, cohort]);

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
        <div style={{ flex: 1, padding: "1.5rem" }}>
          <div style={{ flex: 1 }}>
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
              intactQ.type === "open_text" ? (
                <div style={{ padding: "1rem", background: C.bgDeep, borderRadius: 6, color: C.dim, fontSize: "0.85rem", fontStyle: "italic" }}>
                  Open text responses are available in the individual question view.
                </div>
              ) : (
                <DistributionChart 
                  title="Response Distribution"
                  distribution={intactDist} 
                  cohortDistribution={intactCohortDist} 
                  question={intactQ}
                />
              )
            ) : (
              <div style={{ color: C.dim }}>Loading...</div>
            )}
          </div>
        </div>
          
        <div style={{ width: 1, background: C.ghost }} />

        <div style={{ flex: 1, padding: "1.5rem" }}>
          <div style={{ flex: 1 }}>
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
              circQ.type === "open_text" ? (
                <div style={{ padding: "1rem", background: C.bgDeep, borderRadius: 6, color: C.dim, fontSize: "0.85rem", fontStyle: "italic" }}>
                  Open text responses are available in the individual question view.
                </div>
              ) : (
                <DistributionChart 
                  title="Response Distribution"
                  distribution={circDist} 
                  cohortDistribution={circCohortDist} 
                  question={circQ}
                />
              )
            ) : (
              <div style={{ color: C.dim }}>Loading...</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
