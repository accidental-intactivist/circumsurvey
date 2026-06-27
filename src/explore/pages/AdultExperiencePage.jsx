import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { C, FONT, API_BASE } from "../styles/tokens";
import ExhibitSectionHeading from "../components/ExhibitSectionHeading";
import ExhibitHero from "../components/ExhibitHero";
import DistributionChart from "../components/DistributionChart";
import SankeyChart from "../components/SankeyChart";
import NarrativeList from "../components/NarrativeList";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import IconifyEmoji from "../components/IconifyEmoji";
import SmallSampleBadge from "../components/SmallSampleBadge";
import ExhibitDataLoader from "../components/ExhibitDataLoader";
import HarveyBall from "../components/HarveyBall";
import { flattenMultiSelect } from "../lib/formatters";
import ExhibitSidebarNav from "../components/ExhibitSidebarNav";

const SECTIONS = [
  { id: "section-1-context", label: "1: Context & Consent" },
  { id: "section-2-ratings", label: "2: Before & After" },
  { id: "section-3-narratives", label: "3: The New Normal" },
];

const CONTEXT_QUESTIONS = [
  { id: "circ_adult_context", label: "Context of the Procedure", width: "1fr" },
  { id: "circ_adult_decision_role", label: "Role in Decision Making", width: "1fr" },
  { id: "circ_adult_info_quality", label: "Quality of Information Provided", width: "1fr" },
];

const MOTIVATION_QUESTIONS = [
  { id: "circ_adult_motivation_details", label: "Motivations & Details", width: "1fr" }
];

const BEFORE_RATINGS = [
  { id: "circ_adult_before_rating_appearance", label: "Before: Appearance" },
  { id: "circ_adult_before_rating_function", label: "Before: Mechanical Function" },
  { id: "circ_adult_before_rating_orgasm_intensity", label: "Before: Orgasm Intensity" },
  { id: "circ_adult_before_rating_ease_of_orgasm", label: "Before: Ease of Orgasm" },
  { id: "circ_adult_before_rating_sensitivity", label: "Before: Sensitivity" },
  { id: "circ_adult_before_rating_hygiene", label: "Before: Hygiene" },
];

const AFTER_RATINGS = [
  { id: "circ_adult_after_change_appearance", label: "Change: Appearance" },
  { id: "circ_adult_after_change_function", label: "Change: Mechanical Function" },
  { id: "circ_adult_after_change_orgasm_intensity", label: "Change: Orgasm Intensity" },
  { id: "circ_adult_after_change_ease_of_orgasm", label: "Change: Ease of Orgasm" },
  { id: "circ_adult_after_change_sensitivity", label: "Change: Sensitivity" },
  { id: "circ_adult_after_change_hygiene", label: "Change: Hygiene" },
];

const NEW_NORMAL_QUESTIONS = [
  { id: "circ_adult_new_normal_desc", label: "Adjusting to the New Normal" }
];

const SECTION_1_COLOR_MAP = {
  // Context
  "Elective/Non-Therapeutic: It was performed for non-medical reasons (e.g., aesthetic preference, partner preference, religious or cultural reasons).": C.blue,
  "A combination of both medical and elective reasons.": C.purple,
  "Therapeutic/Medical: It was performed to treat a specific, diagnosed medical condition (e.g., phimosis, balanitis).": C.red,
  "I'm not sure how to categorize it.": C.grey,

  // Role
  "Fully Consensual: It was entirely my own informed decision as an adult.": C.green,
  "Consensual (Adolescent): It was my decision, made with the guidance/consent of my parents.": C.ltBlue,
  "Parental/Guardian-Led: It was primarily my parents'/guardians' decision, which I agreed to or went along with at the time.": C.orange,
  "Non-Consensual: It was performed without my consent or against my will.": C.red,

  // Information
  "Very well-informed; I felt I had a complete picture.": C.green,
  "Somewhat informed; I had the basics but some aspects were a surprise.": C.yellow,
  "Poorly informed; I was not made aware of significant outcomes or alternatives.": C.red,
};

const LOOKING_BACK_QUESTIONS = [
  { id: "circ_adult_retrospective_feeling", label: "Retrospective Feeling" }
];

const LOOKING_BACK_NARRATIVES = [
  { id: "circ_adult_advice_to_others", label: "Advice to Others Considering It" },
  { id: "circ_adult_final_thoughts", label: "Final Thoughts on the Experience" }
];

export default function AdultExperiencePage({ routerState, navigate, updateState, setExhibitContext }) {
  const { cohort } = routerState;
  const [questionsMap, setQuestionsMap] = useState({});

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        page_description: "The user is viewing the 'Before & After: The Adult Experience' exhibit. This explores the unique perspectives of respondents who were circumcised as adults and can compare both states. It covers their context & consent for the procedure, quantitative before/after ratings on function and sensation, and qualitative narratives on their adjustment and retrospective feelings.",
        exhibitName: "Beyond Infancy: The Youth & Adult Experience",
        exhibitDescription: "Analysis of the unique perspectives of individuals who were circumcised as youths or adults and can compare both states.",
        cohort
      });
    }
  }, [cohort, setExhibitContext]);

  useEffect(() => {
    fetch(`${API_BASE}/questions`)
      .then(r => r.json())
      .then(d => {
        const map = {};
        d.questions.forEach(q => map[q.id] = q);
        setQuestionsMap(map);
      });
  }, []);

  const glassStyle = {
    background: C.bgCard,
    border: `1px solid ${C.ghost}`,
    borderRadius: 12,
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  };

  const RATING_COLOR_MAP = {
    // After Change labels (Increased/Decreased format)
    "Significantly Decreased": C.red,
    "Somewhat Decreased": C.orange,
    "No Change": C.yellow,
    "Somewhat Increased": C.green,
    "Significantly Increased": C.blue,
    // After Change labels (Improved/Diminished format)
    "Significantly Diminished": C.red,
    "Somewhat Diminished": C.orange,
    "No Noticeable Change": C.yellow,
    "Somewhat Improved": C.green,
    "Significantly Improved": C.blue,
    // Before labels
    "Very Dissatisfied / Poor": C.red,
    "Somewhat Dissatisfied / Below Average": C.orange,
    "Neutral / Average": C.yellow,
    "Somewhat Satisfied / Above Average": C.green,
    "Very Satisfied / Excellent": C.blue
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textBright, fontFamily: FONT.body, paddingBottom: "6rem", position: "relative", overflowX: "hidden" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2rem 4rem", position: "relative", zIndex: 10 }}>
        <InlineBreadcrumb currentRoute="adult-experience" navigate={navigate} />

        {/* Header Callout */}
        <ExhibitHero
          title="Before & After: The Adult Experience"
          color="#f97316"
          gradientColor="#d4a030"
          BackgroundIcon={Zap}
          description={
            <>
              This exhibit isolates one of the most forensically valuable datasets in the survey: the experiences of respondents who were circumcised as youths, teenagers, or adults.
              <br /><br />
              Unlike those altered in infancy, these individuals possess a <strong style={{ color: C.gold }}>first-person comparative baseline</strong>. They are uniquely positioned to articulate how the procedure changed their anatomy, mechanics, and sensation.
            </>
          }
        />

        <div className="explore-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "3rem", alignItems: "start", marginTop: "3rem" }}>
          
          {/* LEFT: Nav sidebar */}
          <ExhibitSidebarNav sections={SECTIONS} />

          {/* RIGHT: Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0rem" }}>

        {/* SECTION 1: CONTEXT */}
        <ExhibitSectionHeading
          id="section-1-context"
          title="Section 1: Context & Consent"
          icon="📙"
          color={C.textBright}
          hideDivider={true}
          description="Understanding the circumstances surrounding an adult circumcision—whether medically indicated, socially driven, or cosmetic—provides crucial context for their subsequent satisfaction levels."
        >

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {CONTEXT_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={glassStyle}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.45rem", color: C.textBright, marginBottom: "0.5rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.dim, fontStyle: "italic", marginBottom: "1.5rem", lineHeight: 1.4 }}>"{promptText}"</p>}
                  {q ? <ExhibitDataLoader question={q} cohort={cohort} customColorMap={SECTION_1_COLOR_MAP} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>

          {MOTIVATION_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={{...glassStyle, display: "flex", flexDirection: "column"}}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.45rem", color: C.textBright, marginBottom: "0.5rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.dim, fontStyle: "italic", marginBottom: "1.5rem", lineHeight: 1.4 }}>"{promptText}"</p>}
                  {q ? <ExhibitDataLoader question={q} cohort={cohort} customColorMap={SECTION_1_COLOR_MAP} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
          })}
        </ExhibitSectionHeading>

        {/* SECTION 2: RATINGS */}
        <ExhibitSectionHeading
          id="section-2-ratings"
          title="Section 2: Before & After Ratings"
          icon="⚖️"
          color={C.textBright}
          description="Respondents were asked to rate six distinct dimensions of their genital experience before the procedure, and then assess how those dimensions changed post-healing."
        >

          {/* Unified Legend */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            padding: "1.5rem",
            background: C.bgCard,
            border: `1px solid ${C.ghost}`,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            marginBottom: "3rem",
            maxWidth: 600,
            margin: "0 auto 3rem auto"
          }}>
            <div style={{ fontFamily: FONT.condensed, color: C.textBright, letterSpacing: "0.05em", textTransform: "uppercase" }}>Rating Color Scale</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", width: "100%" }}>
              {[
                { color: C.red, label: "Poor / Significantly Decreased or Diminished" },
                { color: C.orange, label: "Below Avg / Somewhat Decreased or Diminished" },
                { color: C.yellow, label: "Neutral / No Noticeable Change" },
                { color: C.green, label: "Above Avg / Somewhat Increased or Improved" },
                { color: C.blue, label: "Excellent / Significantly Increased or Improved" }
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                  <HarveyBall score={idx + 1} color={item.color} size={16} />
                  <span style={{ fontSize: "0.9rem", color: C.text, fontFamily: FONT.body, fontWeight: 500 }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "2rem" }}>
             {/* Render Pairs in single cards */}
             {[0,1,2,3,4,5].map(i => {
                const qBefore = questionsMap[BEFORE_RATINGS[i].id];
                const qAfter = questionsMap[AFTER_RATINGS[i].id];
                if (!qBefore || !qAfter) return null;
                const dimensionLabel = BEFORE_RATINGS[i].label.replace("Before: ", "");
                return (
                  <SankeyChart
                    key={i}
                    title={dimensionLabel}
                    beforeQuestion={qBefore}
                    afterQuestion={qAfter}
                    filter=""
                    customColorMap={RATING_COLOR_MAP}
                    height={420}
                  />
                );
             })}
            </div>
          </div>
        </ExhibitSectionHeading>

        {/* SECTION 3 & 4: NARRATIVES */}
        <ExhibitSectionHeading
          id="section-3-narratives"
          title="Section 3: The New Normal & Looking Back"
          icon="💬"
          color={C.textBright}
          description="In their own words: how respondents adjusted to the changes, their retrospective feelings, and the advice they would give to an adult considering circumcision today."
        >

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {NEW_NORMAL_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={{ ...glassStyle, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.45rem", color: C.textBright, marginBottom: "0.5rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.dim, fontStyle: "italic", marginBottom: "1.5rem", lineHeight: 1.4 }}>"{promptText}"</p>}
                  <div style={{ flex: 1, position: "relative", minHeight: 350 }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                      {q ? <ExhibitDataLoader question={q} cohort={cohort} /> : <div style={{ color: C.dim }}>Loading...</div>}
                    </div>
                  </div>
                </div>
              );
            })}
            {LOOKING_BACK_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={glassStyle}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.45rem", color: C.textBright, marginBottom: "0.5rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.dim, fontStyle: "italic", marginBottom: "1.5rem", lineHeight: 1.4 }}>"{promptText}"</p>}
                  {q ? <ExhibitDataLoader question={q} cohort={cohort} hideLegend={false} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "1.5rem" }}>
            {LOOKING_BACK_NARRATIVES.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={{ ...glassStyle, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.45rem", color: C.textBright, marginBottom: "0.5rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.dim, fontStyle: "italic", marginBottom: "1.5rem", lineHeight: 1.4 }}>"{promptText}"</p>}
                  <div style={{ flex: 1, position: "relative", minHeight: 350 }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                      {q ? <ExhibitDataLoader question={q} cohort={cohort} /> : <div style={{ color: C.dim }}>Loading...</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ExhibitSectionHeading>
        </div> {/* End right column */}
        </div> {/* End grid */}
      </div>
    </div>
  );
}

