import { useState, useEffect, useMemo } from "react";
import ExhibitSectionHeading from "../components/ExhibitSectionHeading";
import ExhibitHero from "../components/ExhibitHero";
import ExhibitDataLoader from "../components/ExhibitDataLoader";
import { C, FONT, API_BASE } from "../styles/tokens";
import NarrativeList from "../components/NarrativeList";
import DistributionChart from "../components/DistributionChart";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import SmallSampleBadge from "../components/SmallSampleBadge";
import { OBSERVER_SUBROLES } from "../lib/pathways";
import { Users, Heart, Smile, Clock, Activity, AlertTriangle, Eye, BookOpen, HelpCircle } from "lucide-react";

const ICON_MAP = {
  Users, Heart, Smile, Clock, Activity, AlertTriangle, Eye, BookOpen, HelpCircle
};

export default function ObserverLensPage({ navigate, setExhibitContext }) {
  const [questionsMap, setQuestionsMap] = useState({});
  const [roleQuestions, setRoleQuestions] = useState({});
  
  // Exclude 'universal', 'multi', and rare ones if we don't have enough data
  const validRoles = useMemo(() => {
    return OBSERVER_SUBROLES.filter(r => !r.multi && r.id !== "universal" && !r.rare);
  }, []);
  
  const [activeTab, setActiveTab] = useState(validRoles[0]?.id || "partner");

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        page_description: "The user is viewing the 'Observer Lens' exhibit, which explores observations and feedback from the various Observer pathways (partners, parents, healthcare providers, researchers, advocates) through tabbed views of their unique question streams.",
        exhibitName: "The Observer Lens",
        exhibitDescription: "An expanded analysis mapping out specific feedback and observations from various Observer pathways: Partners, Parents, Healthcare Providers, Researchers, and more.",
        perspectives: validRoles.map(r => r.label.replace("As a ", "").replace("As an ", ""))
      });
    }
  }, [setExhibitContext, validRoles]);

  useEffect(() => {
    fetch(`${API_BASE}/questions`)
      .then(r => r.json())
      .then(d => {
        const map = {};
        d.questions.forEach(q => map[q.id] = q);
        
        const obsQuestions = d.questions.filter(q => q.pathway === "observer" || q.id.startsWith("observe_"));
        
        const rQ = {};
        validRoles.forEach(r => {
          rQ[r.id] = obsQuestions.filter(q => r.match(q)).sort((a, b) => a.col_idx - b.col_idx);
        });
        
        setQuestionsMap(map);
        setRoleQuestions(rQ);
      });
  }, [validRoles]);

  const activeRole = validRoles.find(r => r.id === activeTab);
  const questionsToRender = roleQuestions[activeTab] || [];
  const ActiveIcon = ICON_MAP[activeRole?.icon] || Users;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textBright, fontFamily: FONT.body, paddingBottom: "6rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1.5rem 2rem 0" }}>
        <InlineBreadcrumb currentRoute="observer-lens" navigate={navigate} />
        
        {/* Editorial introduction block */}
        <div style={{ marginTop: "2.5rem", marginBottom: "1rem" }}>
          <div style={{
            fontFamily: FONT.condensed,
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: C.gold,
            marginBottom: "0.4rem",
          }}>★ Special Perspective ★</div>
          <h1 style={{
            fontFamily: FONT.display,
            fontSize: "2.2rem",
            fontWeight: 800,
            color: C.textBright,
            margin: 0,
            lineHeight: 1.2,
          }}>The Observer Lens</h1>
          <p style={{
            fontFamily: FONT.body,
            fontSize: "1.05rem",
            color: C.muted,
            lineHeight: 1.6,
            marginTop: "0.6rem",
            marginBottom: 0
          }}>
            Not all respondents were writing about their own bodies. The Observer pathway captures testimonies from partners, parents, healthcare professionals, researchers, and advocates—those who observe its physical, emotional, and social dimensions from the outside.
          </p>
        </div>

        <div style={{
          background: "rgba(212,160,48,0.06)",
          border: `1px solid ${C.gold}`,
          borderRadius: 8,
          padding: "1.2rem 1.8rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "3rem"
        }}>
          <div>
            <h4 style={{ fontFamily: FONT.condensed, color: C.goldBright, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 0.3rem 0" }}>
              Underrepresented Voices
            </h4>
            <p style={{ fontFamily: FONT.body, color: C.textBright, fontSize: "0.9rem", margin: 0, lineHeight: 1.4, maxWidth: 600 }}>
              Are you an observer? Your perspective is crucial to understanding the full picture, but we have limited data.
            </p>
          </div>
          <a href="https://circumsurvey.online" target="_blank" rel="noopener noreferrer" style={{
            background: C.goldBright,
            color: C.bgDeep,
            fontFamily: FONT.condensed,
            fontWeight: 700,
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0.7rem 1.4rem",
            borderRadius: 4,
            textDecoration: "none",
            whiteSpace: "nowrap"
          }}>Take the Survey →</a>
        </div>

        {/* Tabbed Navigation */}
        <div style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          paddingBottom: "1rem",
          marginBottom: "2rem",
        }}>
          {validRoles.map(role => {
            const isActive = activeTab === role.id;
            const Icon = ICON_MAP[role.icon] || Users;
            return (
              <button
                key={role.id}
                onClick={() => setActiveTab(role.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.6rem 1.2rem",
                  background: isActive ? C.bgCard : "transparent",
                  color: isActive ? C.textBright : C.muted,
                  border: `1px solid ${isActive ? C.ghost : "transparent"}`,
                  borderRadius: 20,
                  fontFamily: FONT.condensed,
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                  boxShadow: isActive ? "0 2px 0 rgba(0,0,0,0.15)" : "none"
                }}
              >
                <Icon size={16} />
                {role.label.replace("As a ", "").replace("As an ", "")}
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <div style={{ paddingBottom: "4rem" }}>
          {activeRole && (
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <ActiveIcon size={28} color={C.gold} />
                <h2 style={{ fontFamily: FONT.display, fontSize: "2rem", color: C.textBright, margin: 0 }}>
                  {activeRole.label}
                </h2>
              </div>
              <p style={{ fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.85rem", color: C.dim, margin: 0 }}>
                {activeRole.desc}
              </p>
            </div>
          )}

          {/* Questions Stream */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
            {questionsToRender.length === 0 ? (
              <div style={{ color: C.dim, fontStyle: "italic", textAlign: "center", padding: "2rem" }}>
                Loading questions...
              </div>
            ) : (
              questionsToRender.map(q => (
                <QuestionWidget key={q.id} question={q} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── UNIVERSAL QUESTION WIDGET ──────────────────────────────────────────────
function QuestionWidget({ question }) {
  return (
    <div style={{ background: C.bgSoft, borderRadius: 8, padding: "1.5rem", border: `1px solid ${C.ghost}` }}>
      <h3 style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.textBright, marginBottom: "1.5rem", lineHeight: 1.4 }}>
        {question.prompt}
      </h3>
      <ExhibitDataLoader question={question} />
    </div>
  );
}
