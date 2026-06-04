import { useState, useEffect } from "react";
import { C, FONT, API_BASE } from "../styles/tokens";
import { getQuestions } from "../lib/api";
import GenerationalTrendChart from "../components/GenerationalTrendChart";
import AddToReportButton from "../components/AddToReportButton";
import SharePopover from "../components/SharePopover";
import InlineBreadcrumb from "../components/InlineBreadcrumb";

const FAULTLINE_QUESTIONS = [
  { id: "exp_pride_satisfaction_rating", concept: "Pride & Satisfaction" },
  { id: "circ_regret_feeling", concept: "Regret (Circumcised Pathway)" },
  { id: "intact_regret_feeling", concept: "Regret (Intact Pathway)" },
  { id: "final_social_norm_perception", concept: "Perception of Shifting Norms" },
  { id: "observe_all_social_climate_discussion", concept: "Social Climate for Discussion" }
];

const ASSOC_QUESTIONS = [
  { id: 'culture_assoc_more_aesthetic', label: 'More Aesthetically Pleasing / "Better" Looking' },
  { id: 'culture_assoc_medically_healthier', label: 'Medically Healthier' },
  { id: 'culture_assoc_more_hygienic', label: 'More Hygienic / Cleaner' },
  { id: 'culture_assoc_more_natural', label: "More 'Natural' Looking" },
  { id: 'culture_assoc_more_sensitive', label: 'More Sensitive / Greater Pleasure Potential' },
  { id: 'culture_assoc_easier_care', label: 'Easier to Care For' },
  { id: 'culture_assoc_more_masculine', label: "More 'Manly' or 'Masculine'" },
  { id: 'culture_assoc_more_modern', label: 'More Modern / Progressive' },
  { id: 'culture_assoc_more_traditional', label: 'More Traditional / Old-Fashioned' },
  { id: 'culture_assoc_more_socially_acceptable', label: 'More Socially Acceptable' },
  { id: 'culture_assoc_partner_preference', label: 'Preferred by Sexual Partners' },
  { id: 'culture_assoc_higher_education', label: 'Higher Intelligence / Education' },
  { id: 'culture_assoc_higher_ses', label: 'Higher Socioeconomic Status' },
  { id: 'culture_assoc_liberal_values', label: 'Liberal / Progressive Values' },
  { id: 'culture_assoc_conservative_values', label: 'Conservative / Traditional Values' }
];

export default function GenerationalFaultlinesPage({ navigate }) {
  const [questionsMap, setQuestionsMap] = useState({});
  const [activeAssoc, setActiveAssoc] = useState(ASSOC_QUESTIONS[0].id);

  useEffect(() => {
    getQuestions({ counts: true })
      .then(d => {
        const map = {};
        d.questions.forEach(q => map[q.id] = q);
        setQuestionsMap(map);
      });
  }, []);

  const activeAssocPrompt = ASSOC_QUESTIONS.find(q => q.id === activeAssoc)?.label || "";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textBright, fontFamily: FONT.body, paddingBottom: "6rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 2rem 0" }}>
        <InlineBreadcrumb currentRoute="generational-faultlines" navigate={navigate} />
      </div>

      <div style={{ padding: "4rem 2rem", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "260px 1fr", gap: "3rem", alignItems: "start" }}>
        
        {/* Left Column: Topic Navigator & Instructions */}
        <aside style={{
          position: "sticky",
          top: "calc(var(--header-height, 56px) + 1.5rem)",
          maxHeight: "calc(100vh - var(--header-height, 56px) - 3rem)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          zIndex: 100,
        }}>
          <h3 style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", color: C.goldBright, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Topics
          </h3>
          {/* Special Nav Link for the Associations block (moved to top) */}
          <div 
            onClick={() => {
              const el = document.getElementById("cultural_associations");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              cursor: "pointer",
              fontFamily: FONT.body,
              fontSize: "0.9rem",
              color: C.text,
              padding: "0.45rem 0.75rem",
              borderRadius: 6,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${C.ghost}`,
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = C.gold; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = C.ghost; }}
          >
            Cultural Associations (Interactive)
          </div>

          {FAULTLINE_QUESTIONS.map(item => (
            <div 
              key={`nav-${item.id}`}
              onClick={() => {
                const el = document.getElementById(item.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              style={{
                cursor: "pointer",
                fontFamily: FONT.body,
                fontSize: "0.9rem",
                color: C.text,
                padding: "0.45rem 0.75rem",
                borderRadius: 6,
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${C.ghost}`,
                transition: "all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = C.gold; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = C.ghost; }}
            >
              {item.concept}
            </div>
          ))}

          {/* Interpretive Text / How to Read */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px dashed ${C.ghost}`,
            borderRadius: 8,
            padding: "1rem",
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ fontSize: "1.1rem" }}>💡</div>
              <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: C.goldBright }}>
                How to read these charts
              </div>
            </div>
            <div style={{ fontFamily: FONT.body, fontSize: "0.8rem", color: C.dim, lineHeight: 1.5 }}>
              These <strong>Streamgraphs</strong> trace shifting cultural attitudes across time. The timeline moves chronologically from the Silent Generation on the left, to Gen Z on the right. 
              <br/><br/>
              Each colored "ribbon" represents a specific answer choice. The <strong>vertical thickness</strong> of the ribbon represents the percentage of that generation who chose that answer. Watch how ribbons expand or squeeze into nothingness as generations evolve.
            </div>
          </div>
        </aside>

        {/* Right Column: Exhibits */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6rem" }}>
          
          {/* Interactive Associations Section */}
          <div id="cultural_associations" style={{ scrollMarginTop: "2rem" }}>
            <div style={{
              background: C.bgCard,
              borderRadius: 12,
              overflow: "hidden",
              border: `1px solid ${C.ghost}`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              position: "relative"
            }}>
              {/* Theme-coded top ruled line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${C.orange}, ${C.goldBright})`, zIndex: 10 }} />

              {/* Integrated Header */}
              <div style={{
                padding: "2rem",
                borderBottom: `1px solid ${C.ghost}`,
                background: C.bgSoft,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "2rem",
                flexWrap: "wrap"
              }}>
                <div style={{ flex: "1 1 400px" }}>
                  <h2 style={{ fontFamily: FONT.display, fontSize: "2rem", color: C.textBright, marginBottom: "0.5rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
                    Cultural Associations
                  </h2>
                  <p style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.muted, fontStyle: "italic", lineHeight: 1.5, margin: 0 }}>
                    "Please indicate which state (Intact or Circumcised) you believe is MORE LIKELY to be associated with..."
                  </p>
                  
                  <div style={{ marginTop: "1.5rem" }}>
                    <select 
                      value={activeAssoc}
                      onChange={(e) => setActiveAssoc(e.target.value)}
                      style={{
                        background: C.bg,
                        color: C.textBright,
                        border: `1px solid ${C.ghost}`,
                        padding: "0.6rem 1.2rem",
                        borderRadius: 8,
                        fontFamily: FONT.condensed,
                        fontSize: "0.95rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        outline: "none",
                        cursor: "pointer",
                        minWidth: "280px"
                      }}
                    >
                      {ASSOC_QUESTIONS.map(q => (
                        <option key={q.id} value={q.id}>[{q.label}]</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, alignItems: "center" }}>
                  <AddToReportButton questionId={activeAssoc} />
                  <SharePopover 
                    url={`${window.location.origin}${window.location.pathname}#/q/${activeAssoc}`} 
                    questionId={activeAssoc} 
                    questionPrompt={activeAssocPrompt} 
                  />
                </div>
              </div>

              {/* Chart Body */}
              <div style={{ padding: "2rem", background: "transparent" }}>
                <GenerationalTrendChart questionId={activeAssoc} />
              </div>
            </div>
          </div>

          {FAULTLINE_QUESTIONS.map(item => {
            const q = questionsMap[item.id];
            return (
              <div id={item.id} key={item.id} style={{ scrollMarginTop: "2rem" }}>
                <div style={{
                  background: C.bgCard,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `1px solid ${C.ghost}`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  position: "relative"
                }}>
                  {/* Theme-coded top ruled line */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${C.orange}, ${C.goldBright})`, zIndex: 10 }} />
                  
                  {/* Integrated Header */}
                  <div style={{
                    padding: "2rem",
                    borderBottom: `1px solid ${C.ghost}`,
                    background: C.bgSoft,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "2rem"
                  }}>
                    <div>
                      <h2 style={{ fontFamily: FONT.display, fontSize: "2rem", color: C.textBright, marginBottom: "0.5rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
                        {item.concept}
                      </h2>
                      <p style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.muted, fontStyle: "italic", lineHeight: 1.5, margin: 0 }}>
                        {q ? `"${q.prompt}"` : "Loading prompt..."}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, alignItems: "center" }}>
                      <AddToReportButton questionId={item.id} />
                      <SharePopover 
                        url={`${window.location.origin}${window.location.pathname}#/q/${item.id}`} 
                        questionId={item.id} 
                        questionPrompt={q?.prompt} 
                      />
                    </div>
                  </div>
                  
                  {/* Chart Container */}
                  <div style={{ padding: "2rem", background: "transparent" }}>
                    <GenerationalTrendChart questionId={item.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
