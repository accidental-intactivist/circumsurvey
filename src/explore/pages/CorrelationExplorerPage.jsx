import { useState, useEffect, useMemo } from "react";
import UniversalMatrix from "../../components/UniversalMatrix";
import DemographicFilterBar, { DEMOGRAPHIC_DIMENSIONS } from "../components/DemographicFilterBar";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import { getQuestions } from "../lib/api";
import { C, FONT, API_BASE } from "../styles/tokens";

// Build a short human-readable label for the current cohort filter
function describeCohort(cohort) {
  if (!cohort) return null;
  const parts = [];
  for (const [k, v] of Object.entries(cohort)) {
    let label = Array.isArray(v) ? v.join(", ") : String(v);
    label = label.replace(/\s*\([^)]*\)\s*$/, "");
    if (label.length > 30) label = label.slice(0, 27) + "…";
    parts.push(label);
  }
  return parts.join(" · ");
}

// Convert a Demographic or Question object into standard xOptions/yOptions for UniversalMatrix
function toMatrixOptions(axisConfig) {
  if (axisConfig.type === "demographic") {
    // Some demographic options are objects {label, value}, some are strings
    return axisConfig.source.options.map((opt, i) => {
      const val = typeof opt === "string" ? opt : opt.value;
      const lbl = typeof opt === "string" ? opt : opt.label;
      
      let color = C.blue;
      if (axisConfig.id === "pathway") {
        if (val === "intact") color = C.blue;
        else if (val === "circumcised") color = C.red;
        else if (val === "restoring") color = C.gold;
        else if (val === "observer") color = C.green;
        else if (val.startsWith("trans")) color = C.ltBlue;
        else color = C.muted;
      }
      
      return {
        key: val,
        match: val,
        label: lbl,
        short: lbl,
        color
      };
    });
  } else if (axisConfig.type === "question") {
    return (axisConfig.source.opts || []).map((opt, i) => ({
      key: opt,
      match: opt,
      label: opt,
      short: opt,
      color: axisConfig.source.colors?.[i] || C.gold
    }));
  }
  return [];
}

const CURATED_IDS = [
  // Family & Background
  "family_mother_education",
  "family_mother_profession",
  "family_father_education",
  "family_father_profession",
  "family_ses",
  "family_politics",
  "family_upbringing_status",
  "family_cultural_background",
  "family_father_status",
  
  // Demographics (Survey-based)
  "demo_generation",
  "demo_education_self",
  "demo_sexuality",
  "demo_gender_identity",
  "demo_sex_assigned_at_birth",
  
  // Religion
  "religion_is_significant",
  "religion_primary_tradition",
  "religion_christian_denomination",
  "religion_jewish_denomination",
  
  // Cultural Context
  "culture_community_expectation",
  "culture_primary_view_of_circ",
  "culture_social_pressure_role",
  "final_social_norm_perception",
  
  // Outcomes & Satisfaction
  "circ_regret_feeling",
  "intact_regret_feeling",
  "exp_appearance_feeling",
  "exp_pride_satisfaction_rating"
];

const SHORT_LABELS = {
  "family_mother_education": "Mother's Education Level",
  "family_mother_profession": "Mother's Profession",
  "family_father_education": "Father's Education Level",
  "family_father_profession": "Father's Profession",
  "family_ses": "Family Socioeconomic Status",
  "family_politics": "Family Political Alignment",
  "family_upbringing_status": "Family Upbringing Status",
  "family_cultural_background": "Family Cultural Background",
  "family_father_status": "Father's State",
  
  "demo_generation": "Respondent's Generation",
  "demo_education_self": "Respondent's Education",
  "demo_sexuality": "Respondent's Sexuality",
  "demo_gender_identity": "Respondent's Gender Identity",
  "demo_sex_assigned_at_birth": "Sex Assigned at Birth",
  
  "religion_is_significant": "Significance of Religion",
  "religion_primary_tradition": "Primary Religious Tradition",
  "religion_christian_denomination": "Christian Denomination",
  "religion_jewish_denomination": "Jewish Denomination",
  
  "culture_community_expectation": "Community Expectations",
  "culture_primary_view_of_circ": "Primary View of Circumcision",
  "culture_social_pressure_role": "Role of Social Pressure",
  "final_social_norm_perception": "Perception of Social Norms",
  
  "circ_regret_feeling": "Circumcised: Regret Feeling",
  "intact_regret_feeling": "Intact: Regret Feeling",
  "exp_appearance_feeling": "Feeling on Appearance",
  "exp_pride_satisfaction_rating": "Pride/Satisfaction Rating"
};

export default function CorrelationExplorerPage({ routerState, navigate, updateState }) {
  const { cohort } = routerState;
  
  const [questions, setQuestions] = useState([]);
  const [activeX, setActiveX] = useState(null);
  
  const activeY = useMemo(() => ({
    type: "demographic",
    id: "pathway",
    source: DEMOGRAPHIC_DIMENSIONS.find(d => d.column === "pathway")
  }), []);

  useEffect(() => {
    getQuestions({ counts: false }).then(data => {
      // Filter to restrict to our curated list.
      // We no longer require q.opts because the dynamicY matrix engine automatically discovers the options from the data!
      const qs = (data.questions || []).filter(q => CURATED_IDS.includes(q.id));
      
      // Sort questions by their order in CURATED_IDS
      qs.sort((a, b) => CURATED_IDS.indexOf(a.id) - CURATED_IDS.indexOf(b.id));
      
      setQuestions(qs);

      // Default Setup: Family SES vs Pathway (CIRO Route)
      const defaultFactor = qs.find(q => q.id === "family_ses") || qs[0];
      const defX = {
        type: "question",
        id: defaultFactor?.id,
        source: defaultFactor
      };

      setActiveX(defX);
    });
  }, [cohort]);

  // Serialize API endpoint
  const fetchUrl = useMemo(() => {
    if (!activeX || !activeY) return null;
    let url = `${API_BASE}/aggregate?q=${activeX.id}&by=${activeY.id}`;
    
    if (cohort) {
      const entries = Object.entries(cohort).filter(([, v]) => v);
      if (entries.length > 0) {
        const [col, val] = entries[0];
        const demoCols = ["country_born", "country_now", "us_state_born", "us_state_now",
          "race_ethnicity", "age_bracket", "generation", "education",
          "family_upbringing", "socioeconomic", "politics", "sexuality", "gender", "sex_assigned"];
        const religionCols = ["upbringing_significance", "primary_tradition", "cultural_background",
          "christian_denomination", "jewish_denomination", "islamic_madhhab"];
        const table = religionCols.includes(col) ? "religion" : demoCols.includes(col) ? "demographics" : null;
        if (table) {
          url += `&filter=${table}.${col}=${encodeURIComponent(val)}`;
        }
      }
    }
    return url;
  }, [activeX, activeY, JSON.stringify(cohort)]);

  const cohortLabel = useMemo(() => describeCohort(cohort), [JSON.stringify(cohort)]);
  const xOptions = useMemo(() => activeY ? toMatrixOptions(activeY) : [], [activeY]); // Dependent (Columns)
  const yOptions = useMemo(() => activeX ? toMatrixOptions(activeX) : [], [activeX]); // Independent (Rows / by parameter)

  const handleFactorSelect = (valueStr) => {
    const id = valueStr;
    const config = { type: "question", id, source: questions.find(q => q.id === id) };
    setActiveX(config);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      padding: "1.5rem 1.1rem 3rem",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <InlineBreadcrumb currentRoute="correlations" navigate={navigate} />
        
        
        {/* Layout Grid */}
        <div className="explore-grid" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem", alignItems: "start" }}>
                
          {/* LEFT: Cohort filter */}
          <aside className="explore-nav" style={{
            position: "sticky",
            top: "calc(var(--header-height, 56px) + 1rem)",
            maxHeight: "calc(100vh - var(--header-height, 56px) - 2rem)",
            overflowY: "auto",
            paddingRight: "0.3rem",
            zIndex: 100,
          }}>
            <DemographicFilterBar cohort={cohort} onChange={(c) => updateState({ cohort: c })} />
            <div style={{ marginTop: "1.25rem", padding: "0.75rem 0.85rem", background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 7, fontFamily: FONT.body, fontSize: "0.78rem", color: C.muted, lineHeight: 1.55 }}>
              <div style={{ fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: C.goldBright, marginBottom: "0.4rem", fontWeight: 700 }}>★ How this works</div>
              Select a Predictor Variable from the dropdown to cross-tabulate it against the Respondent Pathway. Follow the flow chart from left to right to identify statistical correlations and demographic patterns.
            </div>
          </aside>

          {/* RIGHT: Main Matrix Engine */}
          <main>
            {/* Control Panel */}
            <div style={{
              background: C.bgSoft,
              border: `1px solid ${C.ghost}`,
              borderRadius: 12,
              padding: "1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem"
            }}>
              <div className="axis-control">
                <div className="axis-label" style={{ fontFamily: FONT.condensed, fontSize: "0.75rem", color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem", fontWeight: 700 }}>Filter by Predictor Variable</div>
                <select 
                  value={activeX?.type === "demographic" ? `demo_${activeX.id}` : activeX?.id}
                  onChange={(e) => handleFactorSelect(e.target.value)}
                  style={{
                    width: "100%",
                    maxWidth: 400,
                    padding: "0.55rem",
                    background: C.bgDeep,
                    border: `1px solid ${C.ghost}`,
                    color: C.text,
                    borderRadius: 6,
                    fontFamily: FONT.body,
                    fontSize: "0.85rem"
                  }}
                >
                  <optgroup label="Curated Factors & Outcomes">
                    {questions.map(q => {
                      const shortText = SHORT_LABELS[q.id] || q.prompt;
                      return (
                        <option key={q.id} value={q.id}>
                          {q.section ? `[${q.section}] ` : ""}{shortText}
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
              </div>

              {/* Full Question Text */}
              {activeX && (
                <div style={{ padding: "1rem 1.25rem", background: "rgba(0,0,0,0.15)", borderRadius: 8, borderLeft: `3px solid ${C.dim}` }}>
                  <div style={{ fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.dim, marginBottom: "0.4rem", fontWeight: 700 }}>
                    Full Survey Question
                  </div>
                  <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.textBright, lineHeight: 1.5, fontStyle: "italic" }}>
                    "{activeX.source.prompt}"
                  </div>
                </div>
              )}
            </div>

            {/* Matrix Component */}
            <div style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "2rem" }}>
              {activeX && activeY && xOptions.length > 0 && (
                <UniversalMatrix
                  xOptions={xOptions}
                  yOptions={yOptions}
                  dynamicY={true}
                  activeXId={activeX?.id}
                  fetchUrl={fetchUrl}
                  cohortLabel={cohortLabel}
                  title=""
                  subtitle=""
                  eyebrow={`${activeX.source.label || activeX.source.section || "Variable"} × Pathway`}
                  leftLabel={SHORT_LABELS[activeX.id] || activeX.source.label || activeX.source.section || "Predictor Variable"}
                  rightLabel="Respondent Pathway"
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
