import { useState, useEffect } from "react";
import { C, FONT, API_BASE } from "../styles/tokens";
import GenerationalTrendChart from "../components/GenerationalTrendChart";

const FAULTLINE_QUESTIONS = [
  { id: "meta_consent", concept: "Bodily Autonomy & Consent" },
  { id: "exp_pride_satisfaction_rating", concept: "Pride & Satisfaction" },
  { id: "circ_regret_feeling", concept: "Regret (Circumcised Pathway)" },
  { id: "intact_regret_feeling", concept: "Regret (Intact Pathway)" },
  { id: "final_social_norm_perception", concept: "Perception of Shifting Norms" },
  { id: "observe_all_social_climate_discussion", concept: "Social Climate for Discussion" },
  { id: "culture_assoc_more_aesthetic", concept: "Aesthetic Association" },
  { id: "circ_adult_after_change_v2", concept: "Impact on Sexual Experience" }
];

export default function GenerationalFaultlinesPage() {
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

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textBright, fontFamily: FONT.body, paddingBottom: "6rem" }}>
      <header style={{ padding: "4rem 2rem 3rem", textAlign: "center", borderBottom: `1px solid ${C.ghost}`, background: C.bgCard }}>
        <h1 style={{ fontFamily: FONT.display, fontSize: "2.8rem", color: C.goldBright, marginBottom: "0.5rem" }}>
          Generational Faultlines
        </h1>
        <p style={{ fontFamily: FONT.body, fontSize: "1.1rem", color: C.muted, maxWidth: 800, margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
          Track the chronological shift in attitudes from the Silent Generation down to Gen Z. 
          This dashboard traces the most striking generational divides across our flagship questions.
        </p>
      </header>

      <div style={{ padding: "4rem 2rem", maxWidth: 900, margin: "0 auto" }}>
        {FAULTLINE_QUESTIONS.map(item => {
          const q = questionsMap[item.id];
          return (
            <div key={item.id} style={{ marginBottom: "5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <h2 style={{ fontFamily: FONT.display, fontSize: "1.8rem", color: C.textBright, marginBottom: "0.4rem" }}>
                  {item.concept}
                </h2>
                <p style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.muted, fontStyle: "italic" }}>
                  {q ? `"${q.prompt}"` : "Loading prompt..."}
                </p>
              </div>
              
              <div style={{
                background: C.bgCard,
                borderRadius: 8,
                overflow: "hidden",
                border: `1px solid ${C.ghost}`
              }}>
                {/* The GenerationalTrendChart renders "By generation" internally, but we can wrap it */}
                <GenerationalTrendChart questionId={item.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
