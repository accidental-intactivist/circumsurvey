import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { C, FONT, PATH_COLORS } from "../styles/tokens";
import { getQuestions, getNarratives } from "../lib/api";
import NarrativeList from "../components/NarrativeList";
import WordCloud from "../components/WordCloud";
import ExhibitHero from "../components/ExhibitHero";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import IconifyEmoji from "../components/IconifyEmoji";
import { DEMOGRAPHIC_DIMENSIONS } from "../components/DemographicFilterBar";

const NARRATIVE_CONCEPTS = [
  {
    id: "advantages",
    label: "Perceived Advantages / Motivations",
    desc: "How intact/circumcised cohorts explain the advantages of their anatomy, and restoring cohorts explain their motivations.",
    intact: { qid: "intact_advantages_desc", label: "Intact Advantages", emoji: "🟢" },
    circ: { qid: "circ_advantages_desc", label: "Circumcised Advantages", emoji: "🔵" },
    restoring: { qid: "restore_motivations", label: "Restoring Motivations", emoji: "🟣" }
  },
  {
    id: "drawbacks",
    label: "Perceived Drawbacks / Challenges",
    desc: "Drawbacks, challenges, or difficulties experienced in relation to penile anatomy.",
    intact: { qid: "intact_drawbacks_desc", label: "Intact Drawbacks", emoji: "🟢" },
    circ: { qid: "circ_drawbacks_desc", label: "Circumcised Drawbacks", emoji: "🔵" },
    restoring: { qid: "restore_challenge_reward", label: "Restoration Challenges", emoji: "🟣" }
  },
  {
    id: "parents_stated_reasons",
    label: "Parents' Stated Reasons",
    desc: "Reflections on what was given as the primary driver/reason behind their state.",
    intact: { qid: "intact_parents_reason", label: "Reasons Intact", emoji: "🟢" },
    circ: { qid: "circ_parents_reason", label: "Reasons Circumcised", emoji: "🔵" }
  },
  {
    id: "triggers_for_regret",
    label: "Triggers for Regret / Resentment",
    desc: "Contexts and situations that trigger feelings of regret, resentment, or bodily image issues.",
    intact: { qid: "intact_regret_triggers", label: "Intact Regrets", emoji: "🟢" },
    circ: { qid: "circ_regret_triggers", label: "Circumcised Regrets", emoji: "🔵" }
  },
  {
    id: "curiosity_aspects",
    label: "Curiosity about the Counterpart State",
    desc: "What aspects are you most curious about regarding the opposite status?",
    intact: { qid: "intact_curiosity_about_circ_aspects", label: "Intact Curiosity", emoji: "🟢" },
    circ: { qid: "circ_curiosity_about_intact_aspects", label: "Circumcised Curiosity", emoji: "🔵" }
  },
  {
    id: "partner_preference_reasons",
    label: "Shaping Partner Preferences (Universal)",
    desc: "A universal question: What do you believe has most shaped partner preferences regarding penile circumcision state?",
    intact: { qid: "final_partner_preference_reason", pathway: "intact", label: "Intact Perception", emoji: "🟢" },
    circ: { qid: "final_partner_preference_reason", pathway: "circumcised", label: "Circumcised Perception", emoji: "🔵" },
    restoring: { qid: "final_partner_preference_reason", pathway: "restoring", label: "Restoring Perception", emoji: "🟣" }
  },
  {
    id: "final_message",
    label: "The Final Message / Advice",
    desc: "What respondents wish they could convey to parents, others, or those beginning their journey.",
    intact: { qid: "intact_message_to_others", label: "Intact Voice", emoji: "🟢" },
    circ: { qid: "circ_message_to_parents", label: "Circumcised Voice", emoji: "🔵" },
    restoring: { qid: "restore_advice_to_others", label: "Restoring Voice", emoji: "🟣" }
  }
];

export default function NarrativeMirrorsPage({ navigate, setExhibitContext }) {
  const [questionsMap, setQuestionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedConceptId, setSelectedConceptId] = useState(NARRATIVE_CONCEPTS[0].id);
  const [cohort, setCohort] = useState(null);

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        page_description: "The user is viewing the 'Narrative Mirrors' exhibit, which directly compares qualitative, open-text responses between different pathways (Intact, Circumcised, and sometimes Restoring) across the same thematic question.",
        exhibitName: "Narrative Mirrors",
        exhibitDescription: "Compare qualitative open-text narratives between intact and circumcised pathways.",
        activeMirrorTopic: NARRATIVE_CONCEPTS.find(c => c.id === selectedConceptId)?.label
      });
    }
  }, [selectedConceptId, setExhibitContext]);

  const [selectedWord, setSelectedWord] = useState(null);

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

  useEffect(() => {
    setSelectedWord(null);
  }, [selectedConceptId]);

  const activeConcept = NARRATIVE_CONCEPTS.find(c => c.id === selectedConceptId);

  if (loading) {
    return <div style={{ padding: "4rem", textAlign: "center", color: C.muted }}>Loading narrative configuration...</div>;
  }

  // Determine active columns
  const activeCols = [];
  if (activeConcept.intact) activeCols.push({ key: "intact", conf: activeConcept.intact, color: PATH_COLORS.intact });
  if (activeConcept.circ) activeCols.push({ key: "circ", conf: activeConcept.circ, color: PATH_COLORS.circumcised });
  if (activeConcept.restoring) activeCols.push({ key: "restoring", conf: activeConcept.restoring, color: PATH_COLORS.restoring });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textBright, fontFamily: FONT.body, paddingBottom: "6rem" }}>

      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}>
        <InlineBreadcrumb currentRoute="narrative-mirrors" navigate={navigate} />

        <ExhibitHero
          title="Narrative Mirrors"
          color={C.goldBright}
          gradientColor={C.gold}
          BackgroundIcon={MessageCircle}
          description="Compare qualitative open-text narratives between intact and circumcised pathways."
        />

        {/* Concept Selector */}
        <div style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "1.5rem"
        }}>
          {NARRATIVE_CONCEPTS.map(c => {
            const isActive = selectedConceptId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedConceptId(c.id)}
                style={{
                  padding: "0.5rem 1rem",
                  background: isActive ? `linear-gradient(135deg, ${C.goldBright} 0%, ${C.orange} 100%)` : "rgba(255,255,255,0.03)",
                  color: isActive ? C.bgDeep : C.textBright,
                  border: `1px solid ${isActive ? "transparent" : C.ghost}`,
                  borderRadius: 20,
                  fontFamily: FONT.condensed,
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 700 : 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isActive ? "0 4px 12px rgba(212, 160, 48, 0.3)" : "none",
                  transform: isActive ? "scale(1.02)" : "scale(1)"
                }}
                onMouseOver={e => {
                  if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseOut={e => {
                  if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Global Filter */}
        <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontFamily: FONT.condensed, color: C.gold, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Filter by Generation:</span>
          <select 
            aria-label="Filter by generation"
            value={cohort?.generation?.[0] || ""} 
            onChange={e => {
              const val = e.target.value;
              if (val) setCohort({ generation: [val] });
              else setCohort(null);
            }}
            style={{
              background: "rgba(0,0,0,0.4)",
              border: `1px solid ${C.ghost}`,
              color: C.textBright,
              fontFamily: FONT.body,
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: 8,
              outline: "none",
              cursor: "pointer",
              minWidth: "250px"
            }}
          >
            <option value="">All Generations</option>
            {DEMOGRAPHIC_DIMENSIONS.find(d => d.id === "generation")?.options.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Concept Metadata */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontFamily: FONT.display, fontSize: "2rem", color: C.textBright, marginBottom: "0.5rem" }}>
            {activeConcept.label}
          </h2>
          <p style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.muted, maxWidth: 900, margin: "0 auto", lineHeight: 1.4 }}>
            {activeConcept.desc}
          </p>
        </div>

        {/* Cohort Columns Grid */}
        <div className="mobile-scroll-hint" style={{ overflowX: "auto" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: activeCols.length === 3 ? "1fr 1fr 1fr" : "1fr 1fr", 
            gap: "1.5rem",
            alignItems: "start",
            minWidth: activeCols.length === 3 ? "900px" : "600px"
          }}>
          {activeCols.map(({ key, conf, color }) => {
            const question = questionsMap[conf.qid];
            return (
              <div key={key} style={{ 
                background: C.bgCard,
                border: `1px solid ${C.ghost}`,
                borderRadius: 12,
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                minWidth: 0,
                position: "relative"
              }}>
                <div style={{ borderBottom: `2px solid ${color}`, paddingBottom: "0.8rem", marginBottom: "0.5rem" }}>
                  <h3 style={{ 
                    fontFamily: FONT.condensed, 
                    color: color, 
                    fontSize: "1.1rem", 
                    textTransform: "uppercase", 
                    letterSpacing: "0.1em", 
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem"
                  }}>
                    <IconifyEmoji emoji={conf.emoji} style={{ color }} />
                    <span>{conf.label}</span>
                  </h3>
                  <p style={{ fontFamily: FONT.body, fontSize: "0.9rem", color: C.muted, marginTop: "0.5rem", fontStyle: "italic", lineHeight: 1.4 }}>
                    {question ? `"${question.prompt}"` : "Loading prompt..."}
                  </p>
                </div>

                {question ? (
                  <NarrativeLoader 
                    qid={conf.qid} 
                    pathway={conf.pathway} 
                    cohort={cohort}
                    selectedWord={selectedWord}
                    setSelectedWord={setSelectedWord}
                  />
                ) : (
                  <div style={{ color: C.dim, padding: "2rem" }}>Loading...</div>
                )}
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}

// ── COHORT NARRATIVE LOADER ────────────────────────────────────────────────
function NarrativeLoader({ qid, pathway, cohort, selectedWord, setSelectedWord }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    
    getNarratives(qid, { pathway, cohort })
      .then(d => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load narratives", err);
        if (!cancelled) setLoading(false);
      });
      
    return () => { cancelled = true; };
  }, [qid, pathway, cohort]);

  if (loading) return <div style={{ color: C.dim, padding: "2rem", fontStyle: "italic", textAlign: "center" }}>Loading responses...</div>;
  if (!data) return null;
  if (data.n === 0 || !data.narratives || data.narratives.length === 0) {
    return <div style={{ color: C.dim, fontStyle: "italic", padding: "2rem", textAlign: "center" }}>No narrative responses available.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <WordCloud 
        narratives={data.narratives} 
        selectedWord={selectedWord} 
        onWordClick={(w) => setSelectedWord(w === selectedWord ? null : w)} 
      />
      <div style={{ marginTop: "0.5rem" }}>
        <NarrativeList 
          distribution={data.narratives} 
          highlightWord={selectedWord} 
          hideChart={true} 
        />
      </div>
    </div>
  );
}
