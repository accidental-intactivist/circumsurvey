import { useState, useEffect, useMemo } from "react";
import { C, FONT, API_BASE } from "../styles/tokens";
import DistributionChart from "../components/DistributionChart";
import NarrativeList from "../components/NarrativeList";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import IconifyEmoji from "../components/IconifyEmoji";
import HarmonicCanvas from "../../components/HarmonicCanvas";
import { flattenMultiSelect } from "../lib/formatters";

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

const RATING_QUESTIONS = [
  { id: "restore_impact_rating_sensation", label: "Sensation & Pleasure" },
  { id: "restore_impact_rating_orgasm", label: "Orgasm Quality & Intensity" },
  { id: "restore_impact_rating_function", label: "Mechanical Function (gliding, lubrication)" },
  { id: "restore_impact_rating_comfort", label: "Physical Comfort (glans protection)" },
  { id: "restore_impact_rating_aesthetics", label: "Aesthetics & Appearance" },
  { id: "restore_impact_rating_psychology", label: "Psychological & Emotional Well-being" },
];

export default function RestorationJourneyPage({ navigate }) {
  const [questionsMap, setQuestionsMap] = useState({});

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
    background: "rgba(24, 24, 28, 0.7)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
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
        <div style={{
          background: `linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(212,160,48,0.05) 100%)`,
          backdropFilter: "blur(16px)",
          border: `1px solid rgba(168,85,247,0.3)`,
          borderRadius: 12,
          padding: "2rem",
          marginBottom: "4rem",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 8px 32px rgba(0,0,0,0.3)`
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, #d4a030, #a855f7)` }} />
          <div style={{
            fontFamily: FONT.condensed,
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#a855f7",
            marginBottom: "0.6rem"
          }}>
            <IconifyEmoji symbol="sparkles" /> Interactive Exhibit 10 <IconifyEmoji symbol="sparkles" />
          </div>
          <h1 style={{
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: "2.5rem",
            color: C.textBright,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            marginBottom: "1rem"
          }}>
            Restoration Journey &amp; Outcomes
          </h1>
          <p style={{
            fontFamily: FONT.body,
            fontSize: "1.05rem",
            color: C.text,
            lineHeight: 1.6,
            maxWidth: 900,
            margin: 0
          }}>
            Foreskin restoration represents an active, self-directed physical process undertaken by circumcised individuals to reclaim gliding mechanics and protective coverage.
            <br /><br />
            This exhibit details the experiences of <strong>109 restoring respondents</strong>. Explore starting motivations and Real Coverage Index (RCI) changes, track methods and timelines, read firsthand reports of sensitivity gains, and review final outcome ratings. <strong style={{ color: C.gold }}>The data speaks for itself: restoration is achievable to those who are willing to put in the time.</strong>
          </p>
        </div>

        {/* SECTION A: MOTIVATIONS & RCI */}
        <div style={{ marginBottom: "5rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IconifyEmoji symbol="purple-circle" /> Section A: Starting Points &amp; Motivations
          </h2>
          <p style={{ color: C.muted, fontSize: "1rem", maxWidth: 800, marginBottom: "2rem", lineHeight: 1.6 }}>
            Restoration is rarely a casual decision. It often begins from a place of profound physical or emotional deficit. Yet, it culminates in taking proactive control of one's body.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {SECTION_A_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={glassStyle}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
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
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "0 0 5rem" }} />

        {/* SECTION B: METHODS & TIMELINE */}
        <div style={{ marginBottom: "5rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IconifyEmoji symbol="stopwatch" /> Section B: Timelines &amp; Methods
          </h2>
          <p style={{ color: C.muted, fontSize: "1rem", maxWidth: 800, marginBottom: "2rem", lineHeight: 1.6 }}>
            The process demands immense dedication. It is an investment measured in years, utilizing a combination of devices, manual stretching, and deeply ingrained routines.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {TIMELINE_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={glassStyle}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
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
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                  <div style={{ flex: 1 }}>
                    {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "0 0 5rem" }} />

        {/* SECTION C: SENSATION & SENSITIVITY */}
        <div style={{ marginBottom: "5rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IconifyEmoji symbol="zap" /> Section C: Sensation &amp; Sensitivity Shifts
          </h2>
          <p style={{ color: C.muted, fontSize: "1rem", maxWidth: 800, marginBottom: "2rem", lineHeight: 1.6 }}>
            Reclaiming gliding mechanics and mucosal glans protection fundamentally alters the experience of intimacy. The data clearly demonstrates the tangible, physical rewards of this commitment.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {SENSATION_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={glassStyle}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "1.5rem" }}>
            {SENSATION_QUAL.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={{ ...glassStyle, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                  <div style={{ flex: 1 }}>
                    {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "0 0 5rem" }} />

        {/* SECTION D: OUTCOME RATINGS */}
        <div>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IconifyEmoji symbol="glowing-star" /> Section D: Physical &amp; Psychological Outcome Ratings
          </h2>
          <p style={{ color: C.muted, fontSize: "1rem", maxWidth: 800, marginBottom: "2rem", lineHeight: 1.6 }}>
            The ultimate question: is it worth it? These final ratings summarize the holistic impact on both body and mind, offering a beacon of hope for those considering the journey.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "2rem", alignItems: "start" }}>
            {/* Unified Outcomes Legend as a Sidebar Column */}
            <div style={{
              position: "sticky",
              top: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
              padding: "2rem 1.5rem",
              background: "rgba(24, 24, 28, 0.4)",
              backdropFilter: "blur(16px)",
              border: `1px solid ${C.ghost}`,
              borderRadius: 12,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
            }}>
              <h4 style={{ fontFamily: FONT.condensed, color: C.textBright, margin: "0 0 0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Rating Key</h4>
              {[
                { color: "#3cb44b", label: "Significantly Improved" },
                { color: "#4363d8", label: "Somewhat Improved" },
                { color: "#ffe119", label: "No Noticeable Change" },
                { color: "#f58231", label: "Somewhat Diminished" },
                { color: "#e6194b", label: "Significantly Diminished" },
                { color: "#808080", label: "Not a primary goal / N/A" }
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.9rem", color: C.text, fontFamily: FONT.body, fontWeight: 500, lineHeight: 1.2 }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {RATING_QUESTIONS.map(qDef => {
                const q = questionsMap[qDef.id];
                const promptText = q?.prompt?.replace("Overall, how would you rate the impact of your restoration journey on the following aspects of your experience?", "").trim();
                return (
                  <div key={qDef.id} style={glassStyle}>
                    <h3 style={{ fontFamily: FONT.display, fontSize: "1.15rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                      {qDef.label}
                    </h3>
                    {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.78rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                    {q ? <DataLoader question={q} hideLegend={true} /> : <div style={{ color: C.dim }}>Loading...</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── DATA LOADER HELPER ─────────────────────────────────────────────────────
function DataLoader({ question, filter, shortenLabels, hideLegend }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!question) return;
    setLoading(true);
    const endpoint = question.type === "open_text" ? "narratives" : "response-distribution";
    let url = `${API_BASE}/${endpoint}?q=${question.id}`;
    if (filter) url += `&filter=${filter}`;

    fetch(url)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [question, filter]);

  if (loading) return <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.82rem" }}>Loading data...</div>;
  if (!data) return <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.82rem" }}>No data.</div>;

  const dist = question.type === "open_text" ? data.narratives : data.distribution;
  if (!dist || dist.length === 0) {
    return <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.82rem", padding: "0.5rem" }}>No responses.</div>;
  }

  const isMulti = question.type === "multi_select" || ["demo_ethnicity", "demo_race_ethnicity", "demo_gender_identity", "demo_sexuality"].includes(question.id);
  const chartData = isMulti && question.type !== "open_text" ? {
    ...data,
    distribution: flattenMultiSelect(data.distribution, question)
  } : data;

  return question.type === "open_text" ? (
    <div style={{ maxHeight: "350px", overflowY: "auto", paddingRight: "0.25rem", marginTop: "-0.5rem" }}>
      <NarrativeList distribution={dist} hideChart={true} />
    </div>
  ) : (
    <DistributionChart 
      title="" 
      distribution={chartData} 
      cohortDistribution={null} 
      question={question}
      hideHeader 
      hideLegend={hideLegend}
      shortenLabels={shortenLabels}
    />
  );
}
