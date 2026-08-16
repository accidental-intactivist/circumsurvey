import { useState, useEffect, useMemo, useRef } from "react";
import { Hourglass } from "lucide-react";
import { C, FONT, API_BASE, PATH_COLORS } from "../styles/tokens";
import { getQuestions, getAggregate } from "../lib/api";
import ExhibitHero from "../components/ExhibitHero";
import ExhibitSectionHeading from "../components/ExhibitSectionHeading";
import DistributionChart from "../components/DistributionChart";
import SankeyChart from "../components/SankeyChart";
import MultiSankeyChart from "../components/MultiSankeyChart";
import NarrativeList from "../components/NarrativeList";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import IconifyEmoji from "../components/IconifyEmoji";
import HarmonicCanvas from "../../components/HarmonicCanvas";
import SmallSampleBadge from "../components/SmallSampleBadge";
import DataLoader from "../components/ExhibitDataLoader";
import { flattenMultiSelect } from "../lib/formatters";
import ExhibitSidebarNav from "../components/ExhibitSidebarNav";

const SECTIONS = [
  { id: "section-a-motivations", label: "A: Starting Points" },
  { id: "section-b-timelines", label: "B: Timelines & Methods" },
  { id: "section-c-sensation", label: "C: Sensation & Sensitivity" },
  { id: "section-d-pathway", label: "D: Holistic Pathway" },
];

const SECTION_A_QUESTIONS = [
  { id: "restore_feelings_before", label: "Feelings Before Restoring", width: "1fr" },
  { id: "restore_motivations", label: "Primary Motivations", width: "1fr" },
];

const RCI_QUESTIONS = [
  { id: "restore_rci_start", label: "Starting Coverage (RCI Score)" },
  { id: "restore_rci_current", label: "Current Coverage (RCI Score)" },
];

const TIMELINE_QUESTIONS = [
  { id: "restore_age_started", label: "Age Started Restoring" },
  { id: "restore_duration", label: "Restoration Journey Duration" },
];

const TIMELINE_QUAL = [
  { id: "restore_methods", label: "Methods & Techniques Used" },
  { id: "restore_challenge_reward", label: "Challenges & Rewards Encountered" },
];

const SENSATION_QUESTIONS = [
  { id: "restore_lubrication_change", label: "Impact on Lubrication Needs" },
];

const SENSATION_QUAL = [
  { id: "restore_sensitivity_change_desc", label: "Penile Sensitivity Changes" },
  { id: "restore_orgasm_change_desc", label: "Orgasm Quality & Sensation Shifts" },
];

export const RATING_QUESTIONS = [
  { id: "restore_impact_rating_sensation", label: "Sensation & Pleasure" },
  { id: "restore_impact_rating_orgasm", label: "Orgasm Quality & Intensity" },
  { id: "restore_impact_rating_glide", label: "Skin Mobility / Glide" },
  { id: "restore_impact_rating_appearance", label: "Cosmetic Appearance" },
  { id: "restore_impact_rating_psychological", label: "Emotional / Psychological Healing" }
];

export const RESTORATION_COLOR_MAP = {
  // Outcomes
  "Significantly Improved": "#10b981",
  "Somewhat Improved": "#34d399",
  "No Noticeable Change": "#94a3b8",
  "Somewhat Diminished": "#f87171",
  "Significantly Diminished": "#dc2626",
  "Not a primary goal / N/A": "#475569",
  "Not a primary goal": "#475569",
  
  "Signif. Improved": "#10b981",
  "Smwt. Improved": "#34d399",
  "Smwt. Diminished": "#f87171",
  "Signif. Diminished": "#dc2626",
  "Unknown": "#334155",

  // RCI Start
  "RCI-0 (Super tight cut, very little, if any, skin mobility hard or soft)": "#7f1d1d",
  "RCI-1 (Tight cut, no slack when soft)": "#b91c1c",
  "RCI-2 (Medium cut, can pull skin to corona (head) when soft)": "#c2410c",
  "RCI-3 (Loose cut, skin bunches at corona, may roll over a bit when cold)": "#d97706",
  "RCI-4 (Intermittent rollover / \"The Hump\")": "#ca8a04",
  "RCI-5 (Partial Flaccid Coverage)": "#65a30d",
  "RCI-6 (Full Flaccid Coverage)": "#16a34a",
  "RCI-7 (Large-size penis flaccid coverage, retracts only with full erection)": "#0d9488",
  "RCI-8 (Partial Erect Coverage)": "#0891b2",
  "RCI-9 (Full Erect Coverage)": "#0284c7",
  "RCI-10 (Full Erect Coverage with overhang)": "#2563eb",
  "I'm not familiar with the RCI score / I can't estimate my starting score": "#334155",
  "I'm not familiar with the RCI score / I can't estimate my current score": "#334155",
  
  "CI-0": "#7f1d1d",
  "CI-1": "#b91c1c",
  "CI-2": "#c2410c",
  "CI-3": "#d97706",
  "CI-4": "#ca8a04",
  "CI-5": "#65a30d",
  "CI-6": "#16a34a",
  "CI-7": "#0d9488",
  "CI-8": "#0891b2",
  "CI-9": "#0284c7",
  "CI-10": "#2563eb",
  
  "RCI-0": "#7f1d1d",
  "RCI-1": "#b91c1c",
  "RCI-2": "#c2410c",
  "RCI-3": "#d97706",
  "RCI-4": "#ca8a04",
  "RCI-5": "#65a30d",
  "RCI-6": "#16a34a",
  "RCI-7": "#0d9488",
  "RCI-8": "#0891b2",
  "RCI-9": "#0284c7",
  "RCI-10": "#2563eb",

  // Duration
  "Less than 6 months": "#fdf4ff",
  "6 months - 1 year": "#f5d0fe",
  "6 months to 1 year": "#f5d0fe",
  "1-2 years": "#e879f9",
  "2-3 years": "#d946ef",
  "3-5 years": "#c026d3",
  "5-7 years": "#a21caf",
  "7-10 years": "#86198f",
  "More than 10 years": "#701a75",
  "10+ years": "#701a75",
  "I consider myself 'complete' or have achieved my goals and stopped active tugging": "#d946ef",
  "Complete": "#d946ef",

  // Age
  "Teens": "#f8fafc",
  "20s": "#e2e8f0",
  "30s": "#cbd5e1",
  "40s": "#94a3b8",
  "50s": "#64748b",
  "60s": "#475569",
  "70+": "#1e293b",
};

export const RCI_DEFINITIONS = [
  { index: 0, label: 'CI-0', desc: 'Super tight cut, very little, if any, skin mobility hard or soft' },
  { index: 1, label: 'CI-1', desc: 'Tight cut, no slack when soft' },
  { index: 2, label: 'CI-2', desc: 'Medium cut, can pull skin to corona (head) when soft' },
  { index: 3, label: 'CI-3', desc: 'Loose cut, skin bunches at corona, may roll over a bit when cold' },
  { index: 4, label: 'CI-4', desc: 'Intermittent rollover / "The Hump"' },
  { index: 5, label: 'CI-5', desc: 'Partial Flaccid Coverage' },
  { index: 6, label: 'CI-6', desc: 'Full Flaccid Coverage' },
  { index: 7, label: 'CI-7', desc: 'Large-size penis flaccid coverage, retracts only with full erection' },
  { index: 8, label: 'CI-8', desc: 'Partial Erect Coverage' },
  { index: 9, label: 'CI-9', desc: 'Full Erect Coverage' },
  { index: 10, label: 'CI-10', desc: 'Full Erect Coverage with overhang' }
];

export default function RestorationJourneyPage({ routerState, navigate, updateState, setExhibitContext }) {
  const { cohort } = routerState;
  const [questionsMap, setQuestionsMap] = useState({});
  const [finalOutcomeId, setFinalOutcomeId] = useState("restore_impact_rating_sensation");

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        page_description: "The user is viewing the 'Restoration Journey & Outcomes' exhibit, which details the demographics, methods, RCI (Real Coverage Index) progress, and both qualitative and quantitative outcomes (sensation, psychology, function) of respondents who are actively restoring or have completed foreskin restoration.",
        exhibitName: "The Restoration Journey",
        exhibitDescription: "Analysis of the motivations, experiences, and outcomes of men undergoing foreskin restoration.",
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
    padding: "1.5rem"
  };


  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textBright, fontFamily: FONT.body, paddingBottom: "6rem", position: "relative" }}>
      {/* Immersive Harmonic Canvas Background (Reserved for future use)
      <div style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.6, pointerEvents: "none" }}>
        <HarmonicCanvas themeKey="restoration" opacity={0.8} position="absolute" />
      </div>
      */}

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2rem 4rem", position: "relative", zIndex: 10 }}>
        <InlineBreadcrumb currentRoute="restoration-journey" navigate={navigate} />

        {/* Header Callout */}
        <ExhibitHero
          title="Restoration Journey & Outcomes"
          color={PATH_COLORS.restoring}
          gradientColor="#d4a030"
          BackgroundIcon={Hourglass}
          description={
            <>
              Foreskin restoration represents an active, self-directed physical process undertaken by circumcised individuals to reclaim gliding mechanics and protective coverage.
              <br /><br />
              This exhibit details the experiences of <strong>109 restoring respondents</strong>. Explore starting motivations and Real Coverage Index (RCI) changes, track methods and timelines, read firsthand reports of sensitivity changes, and review final outcome ratings. <strong style={{ color: C.gold }}>Every figure below is self-reported by those respondents — explore the distributions and draw your own conclusions.</strong>
            </>
          }
        />

        <div className="explore-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "3rem", alignItems: "start", marginTop: "3rem" }}>
          
          {/* LEFT: Nav sidebar */}
          <ExhibitSidebarNav sections={SECTIONS} />

          {/* RIGHT: Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0rem" }}>

        {/* SECTION A: MOTIVATIONS & RCI */}

        <ExhibitSectionHeading
          id="section-a-motivations"
          title="Section A: Starting Points & Motivations"
          icon="🟣"
          color="#a855f7"
          hideDivider={true}
          description="Respondents began restoring for a range of reasons and from a range of starting feelings. The distributions below show what they reported."
        >

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {SECTION_A_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={glassStyle}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.4rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {RCI_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={glassStyle}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.4rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>
        </ExhibitSectionHeading>

        {/* SECTION B: METHODS & TIMELINE */}
        <ExhibitSectionHeading
          id="section-b-timelines"
          title="Section B: Timelines & Methods"
          icon="⏱️"
          color="#a855f7"
          description="Restoration is typically a multi-year process using a combination of devices, manual stretching, and daily routines. The timelines and methods respondents reported are shown below."
        >

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {TIMELINE_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={glassStyle}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.4rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "1.5rem" }}>
            {TIMELINE_QUAL.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={{ ...glassStyle, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.4rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                  <div style={{ flex: 1, position: "relative", minHeight: 350 }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                      {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ExhibitSectionHeading>

        {/* SECTION C: SENSATION & SENSITIVITY */}
        <ExhibitSectionHeading
          id="section-c-sensation"
          title="Section C: Sensation & Sensitivity Shifts"
          icon="⚡"
          color="#a855f7"
          description="Restoration aims to reclaim gliding mechanics and mucosal glans protection. The ratings below show how respondents assessed changes across each dimension of sensation and function."
        >

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {/* SENSATION_QUESTIONS (Left Column) */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {SENSATION_QUESTIONS.map(qDef => {
                const q = questionsMap[qDef.id];
                const promptText = q?.prompt?.trim();
                return (
                  <div key={qDef.id} style={{ ...glassStyle, flex: 1 }}>
                    <h3 style={{ fontFamily: FONT.display, fontSize: "1.4rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                      {qDef.label}
                    </h3>
                    {promptText && <p style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                    {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                  </div>
                );
              })}
            </div>

            {/* SENSATION_QUAL (Right Column - Penile Sensitivity) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {SENSATION_QUAL.slice(0, 1).map(qDef => {
                const q = questionsMap[qDef.id];
                const promptText = q?.prompt?.trim();
                return (
                  <div key={qDef.id} style={{ ...glassStyle, display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3 style={{ fontFamily: FONT.display, fontSize: "1.4rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                      {qDef.label}
                    </h3>
                    {promptText && <p style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                    <div style={{ flex: 1, position: "relative", minHeight: 350 }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                        {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Orgasm Quality Full Width Row */}
          {SENSATION_QUAL.slice(1).map(qDef => {
            const q = questionsMap[qDef.id];
            const promptText = q?.prompt?.trim();
            return (
              <div key={qDef.id} style={{ ...glassStyle, display: "flex", flexDirection: "column", marginBottom: "1.5rem" }}>
                <h3 style={{ fontFamily: FONT.display, fontSize: "1.4rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                  {qDef.label}
                </h3>
                {promptText && <p style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                <div style={{ flex: 1, position: "relative", minHeight: 350 }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                    {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </ExhibitSectionHeading>

        {/* SECTION D: OUTCOME RATINGS */}
        <ExhibitSectionHeading
          id="section-d-pathway"
          title="Section D: The Holistic 4-Stage Pathway"
          icon="🌟"
          color="#a855f7"
          description="This 4-stage diagram tracks the chronological flow of each respondent's journey — from their starting coverage, through their reported timeframe, to their current coverage, ending at an outcome rating of your choice."
        >

          <div className="mobile-scroll-hint" style={{ width: "100%", overflowX: "auto" }}>
            <div style={{ minWidth: 800 }}>
              {questionsMap["restore_rci_start"] && questionsMap["restore_duration"] && questionsMap["restore_rci_current"] && questionsMap[finalOutcomeId] && (
                <MultiSankeyChart
                  title="Restoration Pathway"
                  pathQuestions={[
                    questionsMap["restore_rci_start"],
                    questionsMap["restore_rci_current"],
                    questionsMap[finalOutcomeId],
                    questionsMap["restore_duration"]
                  ]}
                  headers={[
                    "Starting CI", 
                    "Current RCI", 
                    <div key="dropdown" style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                      <span style={{ fontFamily: FONT.condensed, color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em" }}>Outcome:</span>
                      <select
                        value={finalOutcomeId}
                        onChange={(e) => setFinalOutcomeId(e.target.value)}
                        style={{
                          padding: "0.3rem 0.6rem",
                          borderRadius: 6,
                          border: `1px solid #a855f7`,
                          background: C.bgDeep,
                          color: C.textBright,
                          fontFamily: FONT.body,
                          fontWeight: 600,
                          fontSize: "12px",
                          cursor: "pointer",
                          outline: "none"
                        }}
                      >
                        {RATING_QUESTIONS.map(rq => (
                          <option key={rq.id} value={rq.id}>{rq.label}</option>
                        ))}
                      </select>
                    </div>,
                    "Years Restoring"
                  ]}
                  filter={cohort}
                  customColorMap={RESTORATION_COLOR_MAP}
                  height={600}
                />
              )}
            </div>
          </div>
          
          {/* RCI Legend */}
          <div style={{ marginTop: "2rem", ...glassStyle, padding: "1.5rem", maxWidth: 800, margin: "2rem auto 0" }}>
            <h3 style={{ fontFamily: FONT.condensed, color: C.textBright, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.2rem", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem" }}>
              <IconifyEmoji emoji="🟣" /> Coverage Index Reference
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {RCI_DEFINITIONS.map(def => (
                <div key={def.index} style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start", breakInside: "avoid", marginBottom: "1rem" }}>
                  <div style={{ 
                    background: RESTORATION_COLOR_MAP[def.label], 
                    color: "#ffffff", 
                    fontWeight: 700, 
                    fontSize: "0.8rem",
                    padding: "0.2rem 0.6rem", 
                    borderRadius: 4,
                    minWidth: 45,
                    textAlign: "center"
                  }}>
                    {def.label}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: C.text, lineHeight: 1.4, flex: 1 }}>
                    {def.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </ExhibitSectionHeading>
        </div> {/* End right content column */}
      </div> {/* End explore-grid */}
      </div>
    </div>
  );
}


