import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { C, FONT, PATH_COLORS } from "../styles/tokens";
import SankeyChart from "../components/SankeyChart";
import ExhibitHero from "../components/ExhibitHero";
import SmallSampleBadge from "../components/SmallSampleBadge";
import { getCount } from "../lib/api";

const VERDICT_COLOR_MAP = {
  // Cohorts
  "intact": PATH_COLORS.intact,
  "circumcised": PATH_COLORS.circumcised,
  "restoring": PATH_COLORS.restoring,
  "observer": PATH_COLORS.observer,
  
  // Decisions
  "I would ensure my child remains intact.": PATH_COLORS.intact,
  "I would choose to have my child circumcised.": PATH_COLORS.circumcised,
  "This decision would primarily be up to my partner.": C.purple,
  "I would be undecided and need more information": C.orange,
  "Not applicable / I do not plan to have children.": C.grey,
};

const FINAL_DECISION_QUESTION = {
  id: "final_child_decision_reason",
  label: "Decision Regarding Future Children",
  prompt: "Based on everything you know and have experienced, if you were to have a child assigned male at birth today, what would your decision regarding circumcision be, and what is the single most important reason for that choice?",
  type: "single_select"
};

const COHORT_QUESTION = {
  id: "pathway",
  label: "Respondent Cohort",
  type: "single_select"
};

export default function TheForwardViewPage({ routerState, navigate, setExhibitContext }) {
  const { cohort } = routerState;
  const [totalN, setTotalN] = useState(0);

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        exhibitName: "The Forward View",
        exhibitDescription: "How lived experience informs decisions regarding the next generation.",
        cohort
      });
    }
  }, [cohort, setExhibitContext]);

  useEffect(() => {
    getCount().then(data => {
      // Ideally we'd get the cohort-specific count, but using overall for now as Sankey handles its own cohort filtering inside.
      // Wait, getAggregate of the final decision question is what the Sankey uses. 
      // We'll let Sankey load, but we can pass a dummy N=100 for now to avoid blocking, 
      // since this page is a full-population exhibit mostly. 
      setTotalN(data.total || 0); 
    });
  }, []);

  const glassStyle = {
    background: C.bgCard,
    border: `1px solid ${C.ghost}`,
    borderRadius: 12,
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, padding: "2rem", overflowX: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Header Callout */}
        <ExhibitHero
          title="The Forward View"
          color="#14b8a6"
          gradientColor="#2dd4bf"
          BackgroundIcon={CheckCircle}
          description="How does lived experience inform the choices we make for the next generation? This exhibit asks respondents across all pathways the ultimate question: if they were to have a male child today, what decision would they make? The data reveals a massive, nearly universal convergence."
        />

        {/* SECTION A: THE SANKEY */}
        <div style={{ marginBottom: "5rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: C.blue, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem", textShadow: "1px 1px 0 rgba(0,0,0,0.8)" }}>
            The Verdict
          </h2>
          <p style={{ color: C.muted, fontSize: "1rem", maxWidth: 800, marginBottom: "2rem", lineHeight: 1.6 }}>
            "{FINAL_DECISION_QUESTION.prompt}"
          </p>

          <SmallSampleBadge n={totalN} label="the dataset">
            <div style={glassStyle}>
              <SankeyChart
                beforeQuestion={COHORT_QUESTION}
                afterQuestion={FINAL_DECISION_QUESTION}
                filter={cohort}
                customColorMap={VERDICT_COLOR_MAP}
                height={500}
              />
            </div>
          </SmallSampleBadge>
        </div>

      </div>
    </div>
  );
}
