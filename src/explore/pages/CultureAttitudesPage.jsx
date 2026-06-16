import { useState, useEffect } from "react";
import { C, FONT, API_BASE } from "../styles/tokens";
import DistributionChart from "../components/DistributionChart";
import NarrativeList from "../components/NarrativeList";
import DemographicSankey from "../components/DemographicSankey";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import SmallSampleBadge from "../components/SmallSampleBadge";
import { flattenMultiSelect } from "../lib/formatters";
import { DEMOGRAPHIC_DIMENSIONS } from "../components/DemographicFilterBar";

const SANKEY_TARGETS = [
  { id: "final_avg_pleasure_belief", label: "Sexual Pleasure Belief" },
  { id: "final_healthier_hygienic_belief", label: "Health & Hygiene Belief" },
  { id: "final_partner_preference_belief", label: "Partner Preference Belief" },
  { id: "final_social_norm_perception", label: "Social Normality Perception" },
  { id: "culture_primary_view_of_circ", label: "Primary View of Circ" },
];

const QUANT_QUESTIONS = [
  { id: "culture_assoc_medically_healthier", concept: "Medically Healthier" },
  { id: "culture_assoc_more_hygienic", concept: "More Hygienic / Cleaner" },
  { id: "culture_assoc_more_natural", concept: "More 'Natural' Looking" },
  { id: "culture_assoc_more_aesthetic", concept: "More Aesthetically Pleasing" },
  { id: "culture_assoc_more_sensitive", concept: "More Sensitive / Pleasure Potential" },
  { id: "culture_assoc_easier_care", concept: "Easier to Care For" },
  { id: "culture_assoc_more_masculine", concept: "More 'Manly' or 'Masculine'" },
  { id: "culture_assoc_more_modern", concept: "More Modern / Progressive" },
  { id: "culture_assoc_more_traditional", concept: "More Traditional / Old-Fashioned" },
  { id: "culture_assoc_more_socially_acceptable", concept: "More Socially Acceptable" },
  { id: "culture_assoc_partner_preference", concept: "Preferred by Sexual Partners" },
  { id: "culture_assoc_higher_education", concept: "Associated with Higher Education" },
  { id: "culture_assoc_higher_ses", concept: "Associated with Higher SES" },
  { id: "culture_assoc_liberal_values", concept: "Associated with Liberal Values" },
  { id: "culture_assoc_conservative_values", concept: "Associated with Conservative Values" }
];

const QUAL_QUESTIONS = [
  { id: "culture_stereotype_intact", concept: "Common Stereotypes: Intact" },
  { id: "culture_stereotype_circ", concept: "Common Stereotypes: Circumcised" },
  { id: "culture_additional_comments", concept: "Additional Thoughts & Comments" }
];

export default function CultureAttitudesPage({ navigate, setExhibitContext }) {
  const [questionsMap, setQuestionsMap] = useState({});
  const [activeSankeyTarget, setActiveSankeyTarget] = useState(SANKEY_TARGETS[0].id);

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        exhibitName: "Culture & Attitudes",
        exhibitDescription: "Explore cultural norms, stereotypes, associations, and attitudes regarding circumcision across cohorts.",
      });
    }
  }, [setExhibitContext]);

  // Fetch questions metadata
  useEffect(() => {
    fetch(`${API_BASE}/questions`)
      .then(res => res.json())
      .then(data => {
        const qMap = {};
        data.questions.forEach(q => {
          qMap[q.id] = q;
        });
        setQuestionsMap(qMap);
      });
  }, []);

  const sankeyDims = [
    DEMOGRAPHIC_DIMENSIONS.find(d => d.id === "country_born"),
    DEMOGRAPHIC_DIMENSIONS.find(d => d.id === "pathway"),
    { id: activeSankeyTarget, label: SANKEY_TARGETS.find(t => t.id === activeSankeyTarget)?.label || "Belief" }
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textBright, fontFamily: FONT.body, paddingBottom: "6rem" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2rem 4rem" }}>
        <InlineBreadcrumb currentRoute="culture" navigate={navigate} />

        {/* ── HEADER ──────────────────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(20, 184, 166, 0.01) 100%)`,
          border: `1px solid rgba(20, 184, 166, 0.22)`,
          borderRadius: 12,
          padding: "2rem",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 8px 32px rgba(0,0,0,0.3)`
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, #14b8a6, #0d9488)` }} />
          <h1 style={{ fontFamily: FONT.condensed, fontSize: "2rem", letterSpacing: "0.02em", color: "#14b8a6", margin: "0 0 0.5rem" }}>
            Culture & Attitudes
          </h1>
          <p style={{ margin: 0, fontSize: "1.05rem", lineHeight: 1.5, color: C.textBright, maxWidth: 800 }}>
            How do societal norms, stereotypes, and media influence our understanding of the male body? This exhibit explores how different cohorts perceive the relationship between circumcision and hygiene, aesthetics, sexual pleasure, and social acceptability.
          </p>
        </div>

        {/* ── SECTION 1: Sankey Explorer ────────────────────────────── */}
        <section style={{ marginBottom: "5rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
            Belief Pathways
          </h2>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: FONT.condensed, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted }}>
              Map flow for:
            </span>
            <select
              value={activeSankeyTarget}
              onChange={(e) => setActiveSankeyTarget(e.target.value)}
              style={{
                background: C.bgDeep,
                color: C.textBright,
                border: `1px solid ${C.ghost}`,
                borderRadius: 6,
                padding: "0.4rem 0.8rem",
                fontFamily: FONT.condensed,
                fontSize: "0.95rem",
                cursor: "pointer",
                outline: "none"
              }}
            >
              {SANKEY_TARGETS.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          
          <div style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "2rem" }}>
            <DemographicSankey cohort={{}} dimensions={sankeyDims} targetQuestion={activeSankeyTarget} />
          </div>
        </section>

        {/* ── SECTION 2: Cultural Associations Grid ─────────────────── */}
        <section style={{ marginBottom: "5rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
            Cultural Associations
          </h2>
          <p style={{ color: C.muted, marginBottom: "2rem", maxWidth: 800 }}>
            "Please indicate which state (Intact or Circumcised) you believe is MORE LIKELY to be associated with the following attributes."
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {QUANT_QUESTIONS.map(item => {
              const q = questionsMap[item.id];
              return (
                <div key={item.id} style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: FONT.condensed, color: C.gold, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "0.5rem" }}>
                    ATTRIBUTE
                  </div>
                  <h3 style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.textBright, margin: "0 0 1rem", fontWeight: 600 }}>
                    {item.concept}
                  </h3>
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 3: Qualitative Narratives ─────────────────────── */}
        <section>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
            In Their Own Words
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
            {QUAL_QUESTIONS.map(item => {
              const q = questionsMap[item.id];
              return (
                <div key={item.id} style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem" }}>
                  <div style={{ fontFamily: FONT.condensed, color: C.gold, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "0.5rem" }}>
                    QUALITATIVE RESPONSES
                  </div>
                  <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.textBright, fontStyle: "italic", margin: "0 0 1.5rem" }}>
                    "{q?.prompt || 'Loading question...'}"
                  </p>
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}

// Data fetching wrapper
function DataLoader({ question, filter }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine if we should query the open-text endpoint
  const isOpenText = question?.type === "open_text" || question?.type === "qualitative";

  useEffect(() => {
    if (!question) return;
    setLoading(true);
    const endpoint = isOpenText ? "narratives" : "response-distribution";
    let url = `${API_BASE}/${endpoint}?q=${question.id}`;
    if (filter) url += `&filter=${filter}`;

    fetch(url)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [question, filter, isOpenText]);

  if (loading) return <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.82rem" }}>Loading data...</div>;
  if (!data) return <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.82rem" }}>No data.</div>;

  const dist = isOpenText ? data.narratives : data.distribution;
  if (!dist || dist.length === 0) {
    return <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.82rem", padding: "0.5rem" }}>No responses.</div>;
  }

  const isMulti = question.type === "multi_select";
  const chartData = isMulti && !isOpenText ? {
    ...data,
    distribution: flattenMultiSelect(data.distribution, question)
  } : data;

  return isOpenText ? (
    <div style={{ marginTop: "-0.5rem" }}>
      <NarrativeList distribution={dist} hideChart={true} viewMode="side-by-side" />
    </div>
  ) : (
    <SmallSampleBadge n={chartData?.n} label="this group" inline>
      <DistributionChart
        title=""
        distribution={chartData}
        cohortDistribution={null}
        question={question}
        hideHeader
      />
    </SmallSampleBadge>
  );
}
