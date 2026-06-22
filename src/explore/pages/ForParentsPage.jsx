import { useState, useMemo, useEffect } from "react";
import { C, FONT, PATH_COLORS } from "../styles/tokens";
import { getQuestions } from "../lib/api";
import ExhibitHero from "../components/ExhibitHero";
import ExhibitSectionHeading from "../components/ExhibitSectionHeading";
import ExhibitDataLoader from "../components/ExhibitDataLoader";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import SankeyChart from "../components/SankeyChart";
import { MessageSquareText, BarChart2, Activity, Scale } from "../components/Icons";
import PleasureGapWidget from "../components/PleasureGapWidget";

// We curate a list of questions that directly speak to the "new/expectant parent" experience.
// The user noted: "What we want to basically get in front of parents' eyes are the testimonies 
// of what adults would say to their parents about whatever decision they made, and back it up 
// with the pleasure gap or whatever would be super compelling to a new parent."
const QUESTIONS = [
  "circ_message_to_parents", 
  "intact_message_to_others", 
  "final_healthier_hygienic_belief",
  "exp_sex_rating_sensitivity_light_touch",
  "exp_sex_rating_orgasm_intensity",
  "observe_parent_emotional_state",
  "observe_parent_intact_factors",
  "observe_parent_intact_regret_reconsider",
  "observe_healthcare_counseling_stance",
  "final_child_decision_reason",
  "aggregate_regret"
];

// Color mapping for consistent pathways
const COLOR_MAP = {
  intact: PATH_COLORS.intact,
  circumcised: PATH_COLORS.circumcised,
  restoring: PATH_COLORS.restoring,
};

export default function ForParentsPage({ routerState, navigate, setExhibitContext }) {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        exhibitName: "For New & Expectant Parents",
        exhibitDescription: "A curated resource for parents: adult testimonies, the sexual-experience data, parent hindsight, and professional counseling stances.",
      });
    }
  }, [setExhibitContext]);

  useEffect(() => {
    let cancelled = false;
    getQuestions()
      .then((data) => {
        if (!cancelled) {
          setQuestions(data.questions || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || String(err));
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const questionsMap = useMemo(() => {
    if (!questions) return {};
    return questions.reduce((acc, q) => {
      acc[q.id] = q;
      return acc;
    }, {});
  }, [questions]);

  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: C.dim }}>Loading exhibit...</div>;
  if (error) return <div style={{ padding: "4rem", textAlign: "center", color: C.red }}>Error: {error}</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.1rem 6rem", fontFamily: FONT.body, color: C.text }}>

      <InlineBreadcrumb currentRoute="for-parents" navigate={navigate} />

      <ExhibitHero
        title="For New & Expectant Parents"
        description="A curated, shareable resource presenting what grown children, other parents, medical professionals, and advocates actually say — the transparency and lived-experience data often missing from standard counseling, offered so you can make the fully informed decision that is yours to make."
      />

      {/* ── SECTION 1: Messages to Parents ────────────────────────────── */}
      <ExhibitSectionHeading
        Icon={MessageSquareText}
        title="Testimonies: What Grown Sons Wish Their Parents Knew"
        description="Adult men—both circumcised and intact—were asked what they would say to parents making this decision today."
        color="var(--c-red)"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", marginBottom: "4rem" }}>
        {/* Circumcised Men's Message */}
        <div style={{ background: C.bgCard, borderRadius: 8, padding: "1.5rem", border: `1px solid ${C.ghost}`, borderTop: `4px solid ${COLOR_MAP.circumcised}` }}>
          <h3 style={{ fontFamily: FONT.display, fontSize: "1.1rem", color: COLOR_MAP.circumcised, marginBottom: "0.5rem" }}>
            From Circumcised Men
          </h3>
          <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.textBright, marginBottom: "1.5rem", fontStyle: "italic" }}>
            "If you could speak directly to parents who are currently deciding whether to circumcise their son, what would you say?"
          </p>
          <div style={{ height: 400 }}>
            {questionsMap["circ_message_to_parents"] ? (
              <ExhibitDataLoader question={questionsMap["circ_message_to_parents"]} bare />
            ) : <span style={{ color: C.dim }}>Loading...</span>}
          </div>
        </div>

        {/* Intact Men's Message */}
        <div style={{ background: C.bgCard, borderRadius: 8, padding: "1.5rem", border: `1px solid ${C.ghost}`, borderTop: `4px solid ${COLOR_MAP.intact}` }}>
          <h3 style={{ fontFamily: FONT.display, fontSize: "1.1rem", color: COLOR_MAP.intact, marginBottom: "0.5rem" }}>
            From Intact Men
          </h3>
          <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.textBright, marginBottom: "1.5rem", fontStyle: "italic" }}>
            "What message would you give to parents deciding whether to circumcise their son, or to men considering it for themselves?"
          </p>
          <div style={{ height: 400 }}>
            {questionsMap["intact_message_to_others"] ? (
              <ExhibitDataLoader question={questionsMap["intact_message_to_others"]} bare />
            ) : <span style={{ color: C.dim }}>Loading...</span>}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: The Data Behind The Decision ────────────────────────────── */}
      <ExhibitSectionHeading
        Icon={BarChart2}
        title="The Reality of the Procedure"
        description="Self-reported data on the adult sexual experience, set against the long-held assumptions of standard medical advice."
        color="var(--c-blue)"
      />

      <div style={{ marginBottom: "2rem" }}>
        <PleasureGapWidget />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", marginBottom: "4rem" }}>
        <div style={{ background: C.bgSoft, borderRadius: 8, padding: "1.5rem", border: `1px solid ${C.ghost}` }}>
          <h4 style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.textBright, marginBottom: "1rem", lineHeight: 1.4 }}>
            {questionsMap["final_healthier_hygienic_belief"]?.prompt || "Beliefs on hygiene and health"}
          </h4>
          {questionsMap["final_healthier_hygienic_belief"] ? (
            <ExhibitDataLoader question={questionsMap["final_healthier_hygienic_belief"]} />
          ) : null}
        </div>
      </div>

      {/* ── SECTION 3: Current Parents & Professionals ────────────────────────────── */}
      <ExhibitSectionHeading
        Icon={Activity}
        title="Hindsight & Professional Stances"
        description="Perspectives from parents who have already made their choices, and the medical professionals providing counseling."
        color="var(--c-gold)"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", marginBottom: "4rem" }}>
        
        <div style={{ background: C.bgSoft, borderRadius: 8, padding: "1.5rem", border: `1px solid ${C.ghost}` }}>
          <h4 style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.textBright, marginBottom: "1rem", lineHeight: 1.4 }}>
            {questionsMap["observe_parent_emotional_state"]?.prompt || "Parents' emotional state regarding their decision"}
          </h4>
          <div style={{ minHeight: 300, display: "flex", flexDirection: "column" }}>
            {questionsMap["observe_parent_emotional_state"] ? (
              <ExhibitDataLoader question={questionsMap["observe_parent_emotional_state"]} />
            ) : null}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          <div style={{ background: C.bgCard, borderRadius: 8, padding: "1.5rem", border: `1px solid ${C.ghost}` }}>
            <h4 style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.textBright, marginBottom: "1rem", lineHeight: 1.4 }}>
              {questionsMap["observe_parent_intact_factors"]?.prompt || "Factors influencing parents to leave intact"}
            </h4>
            <div style={{ minHeight: 350, display: "flex", flexDirection: "column" }}>
              {questionsMap["observe_parent_intact_factors"] ? (
                <ExhibitDataLoader question={questionsMap["observe_parent_intact_factors"]} />
              ) : null}
            </div>
          </div>

          <div style={{ background: C.bgCard, borderRadius: 8, padding: "1.5rem", border: `1px solid ${C.ghost}` }}>
            <h4 style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.textBright, marginBottom: "1rem", lineHeight: 1.4 }}>
              {questionsMap["observe_parent_intact_regret_reconsider"]?.prompt || "Do parents of intact children regret it?"}
            </h4>
            <div style={{ minHeight: 350, display: "flex", flexDirection: "column" }}>
              {questionsMap["observe_parent_intact_regret_reconsider"] ? (
                <ExhibitDataLoader question={questionsMap["observe_parent_intact_regret_reconsider"]} />
              ) : null}
            </div>
          </div>
        </div>

        <div style={{ background: C.bgSoft, borderRadius: 8, padding: "1.5rem", border: `1px solid ${C.ghost}` }}>
          <h4 style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.textBright, marginBottom: "1rem", lineHeight: 1.4 }}>
            {questionsMap["observe_healthcare_counseling_stance"]?.prompt || "Medical Professional Counseling Stance"}
          </h4>
          {questionsMap["observe_healthcare_counseling_stance"] ? (
            <ExhibitDataLoader question={questionsMap["observe_healthcare_counseling_stance"]} />
          ) : null}
        </div>

      </div>

      {/* ── SECTION 4: Regret & Resentment Sankey ────────────────────────────── */}
      <ExhibitSectionHeading
        Icon={Scale}
        title="Regret & Resentment: The Outcome"
        description="A flow mapping of how an individual's pathway corresponds with eventual feelings of regret or resentment regarding their circumcision status."
        color="var(--c-purple)"
      />
      
      <div style={{ background: C.bgCard, borderRadius: 8, padding: "1.5rem", border: `1px solid ${C.ghost}`, marginBottom: "4rem" }}>
        {questionsMap["aggregate_regret"] ? (
          <SankeyChart
            beforeQuestion={{ id: "pathway", prompt: "Current Pathway" }}
            afterQuestion={questionsMap["aggregate_regret"]}
            height={550}
          />
        ) : <span style={{ color: C.dim }}>Loading...</span>}
      </div>

    </div>
  );
}
// Trigger HMR
