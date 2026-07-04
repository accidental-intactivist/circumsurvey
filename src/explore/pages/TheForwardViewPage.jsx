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
  label: "Respondent Cohort",
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

        {/* SECTION B: THE MISSING INFORMATION */}
        <ForwardNarrativeSection 
          qid="final_missing_info_opinion"
          title="The Missing Information"
          prompt="What do you think is the single most important piece of information that people (especially expectant parents or young men) are MISSING when it comes to understanding male genital anatomy, intactness, and the lifelong impacts of circumcision?"
          highlightedPrompt={
            <>
              What do you think is the <span style={{ color: C.goldBright }}>single most important piece of information</span> that people (especially expectant parents or young men) are <span style={{ color: C.goldBright }}>MISSING</span> when it comes to understanding male genital anatomy, intactness, and the lifelong impacts of circumcision?
            </>
          }
          cohort={cohort}
          color={C.goldBright}
        />

        {/* SECTION C: FINAL THOUGHTS */}
        <ForwardNarrativeSection 
          qid="final_anything_else"
          title="Final Thoughts"
          prompt="Is there anything else you'd like to share about your experiences, observations, feelings about this topic, or anything this survey didn't cover that you feel is important?"
          highlightedPrompt={
            <>
              Is there <span style={{ color: C.blueBright }}>anything else you'd like to share</span> about your experiences, observations, feelings about this topic, or anything this survey didn't cover that you feel is important?
            </>
          }
          cohort={cohort}
          color={C.blueBright}
        />

        {/* SECTION D: RESOURCES */}
        <div style={{ marginBottom: "5rem", padding: "2.5rem", background: "rgba(212,160,48,0.06)", border: `1px solid rgba(212,160,48,0.2)`, borderRadius: 12 }}>
          <h2 style={{ fontFamily: FONT.display, fontSize: "1.75rem", color: C.goldBright, marginBottom: "1rem" }}>
            Moving Forward
          </h2>
          <p style={{ color: C.textBright, fontFamily: FONT.body, fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            The data presented throughout this inquiry paints a stark picture of the lived consequences of non-therapeutic circumcision. While we strive to maintain an objective presentation of the findings, the ultimate goal of The Accidental Intactivist's Inquiry is to question the normalcy of a practice that permanently alters the bodies of millions of infants globally. 
          </p>
          <p style={{ color: C.textBright, fontFamily: FONT.body, fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            If you or someone you know is struggling with the physical or emotional impact of circumcision, or if you simply want to learn more, you are not alone. There is a robust and growing community dedicated to bodily autonomy, healing, and foreskin restoration.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <a href="https://15square.org.uk/" target="_blank" rel="noreferrer" style={{ color: C.goldBright, textDecoration: "none", fontSize: "1.1rem", fontFamily: FONT.condensed, letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>↗</span> 15 Square — Charity for Education, Support, and Medical Information
            </a>
            <a href="https://www.reddit.com/r/foreskin_restoration/" target="_blank" rel="noreferrer" style={{ color: C.goldBright, textDecoration: "none", fontSize: "1.1rem", fontFamily: FONT.condensed, letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>↗</span> r/foreskin_restoration — Community & Peer Support for Restoration
            </a>
            <a href="https://www.reddit.com/r/CircumcisionGrief/" target="_blank" rel="noreferrer" style={{ color: C.goldBright, textDecoration: "none", fontSize: "1.1rem", fontFamily: FONT.condensed, letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>↗</span> r/CircumcisionGrief — Emotional Support Space
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── NARRATIVE COMPONENT ──────────────────────────────────────────────────
function ForwardNarrativeSection({ qid, title, prompt, highlightedPrompt, cohort, color }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  const [localPathway, setLocalPathway] = useState(() => {
    if (typeof cohort === "string") return cohort;
    return cohort?.pathway || null;
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);

    let fetchCohort = null;
    if (typeof cohort === "object" && cohort !== null) {
      fetchCohort = { ...cohort };
    } else if (typeof cohort === "string") {
      // Ignore string cohort here, as it's just pathway
      fetchCohort = {};
    } else {
      fetchCohort = {};
    }

    if (localPathway) {
      fetchCohort.pathway = localPathway;
    } else {
      delete fetchCohort.pathway;
    }

    getNarratives(qid, { cohort: Object.keys(fetchCohort).length > 0 ? fetchCohort : null })
      .then(d => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [qid, cohort, localPathway]);

  return (
    <div style={{ marginBottom: "5rem" }}>
      <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: color, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem", textShadow: "1px 1px 0 rgba(0,0,0,0.8)" }}>
        {title}
      </h2>
      <p style={{ fontFamily: FONT.display, fontSize: "1.35rem", color: C.textBright, fontStyle: "normal", maxWidth: 900, marginBottom: "2.5rem", lineHeight: 1.4 }}>
        "{highlightedPrompt || prompt}"
      </p>

      {/* Local Pathway Filter */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "flex-start" }}>
        <PathwayChips 
          selected={localPathway} 
          onSelect={setLocalPathway} 
          compact={true} 
        />
      </div>

      {loading && <div style={{ color: C.dim, padding: "2rem", fontStyle: "italic", textAlign: "center" }}>Loading responses...</div>}
      {!loading && data && data.narratives && (
        <div style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          <WordCloud 
            narratives={data.narratives} 
            selectedWord={selectedWord} 
            onWordClick={(w) => setSelectedWord(w === selectedWord ? null : w)} 
          />
          <div style={{ marginTop: "1.5rem" }}>
            <NarrativeList 
              distribution={data.narratives} 
              highlightWord={selectedWord} 
              hideChart={true} 
              question={{ id: qid, prompt }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
