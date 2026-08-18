import React, { useState, useEffect } from "react";
import { FastForward } from "lucide-react";
import { C, FONT, PATH_COLORS } from "../styles/tokens";
import SankeyChart from "../components/SankeyChart";
import ExhibitHero from "../components/ExhibitHero";
import SmallSampleBadge from "../components/SmallSampleBadge";
import NarrativeList from "../components/NarrativeList";
import WordCloud from "../components/WordCloud";
import PathwayChips from "../components/PathwayChips";
import { getCount, getNarratives } from "../lib/api";
import ForwardNarrativeSection from "../components/ForwardNarrativeSection";
import ResourcesCTA from "../../components/ResourcesCTA";

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
  prompt: "Based on everything you know and have experienced, if you were to have a child assigned male at birth today, what would your decision regarding circumcision be?",
  type: "single_select"
};

const COHORT_QUESTION = {
  id: "pathway",
  label: "Respondent Pathway",
  type: "single_select"
};

export default function TheForwardViewPage({ routerState, navigate, setExhibitContext }) {
  const { cohort } = routerState;
  const [totalN, setTotalN] = useState(0);

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        page_description: "The user is viewing 'The Forward View' exhibit. This exhibit answers the ultimate question across all respondent pathways: 'If you were to have a male child today, what decision would you make regarding circumcision?'. It contains a single large Sankey diagram mapping the current respondent pathway to their future hypothetical child decision.",
        exhibitName: "The Forward View",
        exhibitDescription: "How lived experience informs decisions regarding the next generation.",
        cohort
      });
    }
  }, [cohort, setExhibitContext]);

  useEffect(() => {
    getCount().then(data => {
      let pathwayFilter = null;
      if (typeof cohort === "string") pathwayFilter = cohort;
      else if (cohort && cohort.pathway) pathwayFilter = cohort.pathway;
      
      if (pathwayFilter && pathwayFilter !== "all" && data.by_pathway) {
        const pFilter = Array.isArray(pathwayFilter) ? pathwayFilter[0] : pathwayFilter;
        setTotalN(data.by_pathway[pFilter] || data.total || 0);
      } else {
        setTotalN(data.total || 0); 
      }
    });
  }, [cohort]);

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
          BackgroundIcon={FastForward}
          description="How does lived experience inform the choices we make for the next generation? This exhibit asks respondents across all pathways the ultimate question: if they were to have a male child today, what decision would they make? The data reveals a massive, nearly universal convergence."
        />

        {/* SECTION A: THE SANKEY */}
        <div style={{ marginBottom: "5rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: PATH_COLORS.intact, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem", textShadow: "1px 1px 0 rgba(0,0,0,0.8)" }}>
            The Verdict
          </h2>
          <p style={{ fontFamily: FONT.display, fontSize: "1.45rem", color: C.textBright, fontStyle: "normal", maxWidth: 900, marginBottom: "2.5rem", lineHeight: 1.4 }}>
            "Based on everything you know and have experienced, if you were to have a <span style={{ color: C.goldBright }}>child assigned male at birth today</span>, what would your <span style={{ color: C.goldBright }}>decision regarding circumcision</span> be?"
          </p>

          <SmallSampleBadge n={totalN} label="the dataset">
            <div className="mobile-scroll-hint" style={{ overflowX: "auto", width: "100%" }}>
              <div style={{ ...glassStyle, minWidth: 600 }}>
                <SankeyChart
                  beforeQuestion={COHORT_QUESTION}
                  afterQuestion={FINAL_DECISION_QUESTION}
                  filter={cohort}
                  customColorMap={VERDICT_COLOR_MAP}
                  height={500}
                />
              </div>
            </div>
          </SmallSampleBadge>
        </div>

        {/* SECTION B: 20-30 YEAR PREDICTION */}
        <ForwardNarrativeSection 
          qid="final_prediction_future_of_ric"
          title="The 20-30 Year Prediction"
          prompt="Looking forward 20-30 years, where do you predict the practice of routine infant circumcision will be in your primary country/culture?"
          highlightedPrompt={
            <>
              Looking forward 20-30 years, <span style={{ color: C.purpleBright }}>where do you predict the practice</span> of routine infant circumcision will be in your primary country/culture?
            </>
          }
          color={C.purpleBright}
        />

        {/* SECTION C: THE MISSING INFORMATION */}
        <ForwardNarrativeSection 
          qid="final_missing_info_opinion"
          title="The Missing Information"
          prompt="What do you think is the single most important piece of information that people (especially expectant parents or young men) are MISSING when it comes to understanding male genital anatomy, intactness, and the lifelong impacts of circumcision?"
          highlightedPrompt={
            <>
              What do you think is the <span style={{ color: C.goldBright }}>single most important piece of information</span> that people (especially expectant parents or young men) are <span style={{ color: C.goldBright }}>MISSING</span> when it comes to understanding male genital anatomy, intactness, and the lifelong impacts of circumcision?
            </>
          }
          color={C.goldBright}
        />

        {/* SECTION D: FINAL THOUGHTS */}
        <ForwardNarrativeSection 
          qid="final_anything_else"
          title="Final Thoughts"
          prompt="Is there anything else you'd like to share about your experiences, observations, feelings about this topic, or anything this survey didn't cover that you feel is important?"
          highlightedPrompt={
            <>
              Is there <span style={{ color: C.blueBright }}>anything else you'd like to share</span> about your experiences, observations, feelings about this topic, or anything this survey didn't cover that you feel is important?
            </>
          }
          color={C.blueBright}
        />



      </div>
    </div>
  );
}

