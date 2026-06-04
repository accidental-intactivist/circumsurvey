import { useState, useEffect } from "react";
import { C, FONT, PATH_COLORS } from "../styles/tokens";
import { getQuestions, getNarratives } from "../lib/api";
import NarrativeList from "../components/NarrativeList";
import WordCloud from "../components/WordCloud";
import InlineBreadcrumb from "../components/InlineBreadcrumb";

const NARRATIVE_CONCEPTS = [
  {
    id: "final_message",
    label: "The Final Message / Advice",
    desc: "What respondents wish they could convey to parents, others, or those beginning their journey.",
    intact: { qid: "intact_message_to_others", label: "Intact Voice", emoji: "🟢" },
    circ: { qid: "circ_message_to_parents", label: "Circumcised Voice", emoji: "🔵" },
    restoring: { qid: "restore_advice_to_others", label: "Restoring Voice", emoji: "🟣" }
  },
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
    id: "transparent_monster_resonances",
    label: "The 'Transparent Monster' Metaphor (Universal)",
    desc: "A universal question: Why does (or doesn't) the 'transparent monster' metaphor feel accurate to you?",
    intact: { qid: "final_transparent_monster_reason", pathway: "intact", label: "Intact Alignment", emoji: "🟢" },
    circ: { qid: "final_transparent_monster_reason", pathway: "circumcised", label: "Circumcised Alignment", emoji: "🔵" },
    restoring: { qid: "final_transparent_monster_reason", pathway: "restoring", label: "Restoring Alignment", emoji: "🟣" }
  }
];

export default function NarrativeMirrorsPage({ navigate }) {
  const [questionsMap, setQuestionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedConceptId, setSelectedConceptId] = useState(NARRATIVE_CONCEPTS[0].id);

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
        {/* Concept Selector */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <select
            value={selectedConceptId}
            onChange={(e) => setSelectedConceptId(e.target.value)}
            style={{
              background: C.bgSoft,
              border: `1px solid ${C.gold}`,
              color: C.textBright,
              fontFamily: FONT.condensed,
              fontWeight: 700,
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "0.6rem 1.2rem",
              borderRadius: 8,
              outline: "none",
              cursor: "pointer",
            }}
          >
            {NARRATIVE_CONCEPTS.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>


        {/* Concept Metadata */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontFamily: FONT.display, fontSize: "2rem", color: C.textBright, marginBottom: "0.5rem" }}>
            {activeConcept.label}
          </h2>
          <p style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.muted, maxWidth: 800, margin: "0 auto" }}>
            {activeConcept.desc}
          </p>
        </div>

        {/* Cohort Columns Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: activeCols.length === 3 ? "1fr 1fr 1fr" : "1fr 1fr", 
          gap: "1.5rem",
          alignItems: "start",
          width: "100%",
          "@media (max-width: 900px)": {
            gridTemplateColumns: "1fr"
          }
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
                    <span>{conf.emoji}</span>
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
  );
}

// ── COHORT NARRATIVE LOADER ────────────────────────────────────────────────
function NarrativeLoader({ qid, pathway, selectedWord, setSelectedWord }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    
    getNarratives(qid, { pathway })
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
  }, [qid, pathway]);

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
