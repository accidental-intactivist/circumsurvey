// ═══════════════════════════════════════════════════════════════════════════
// CultureGenerationsPage.jsx — "Culture & Generations"
// Merged exhibit combining Culture & Attitudes + Generational Faultlines.
// Two viewing modes toggled by the user:
//   • "By Cohort" — distribution charts showing how each cohort responds
//   • "By Generation" — streamgraph trends from Silent → Gen Z
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { C, FONT, API_BASE } from "../styles/tokens";
import { getQuestions } from "../lib/api";
import ExhibitHero from "../components/ExhibitHero";
import DistributionChart from "../components/DistributionChart";
import GenerationalTrendChart from "../components/GenerationalTrendChart";
import NarrativeList from "../components/NarrativeList";
import DemographicSankey from "../components/DemographicSankey";
import AddToReportButton from "../components/AddToReportButton";
import SharePopover from "../components/SharePopover";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import SmallSampleBadge from "../components/SmallSampleBadge";
import { flattenMultiSelect } from "../lib/formatters";
import DemographicFilterBar, { DEMOGRAPHIC_DIMENSIONS } from "../components/DemographicFilterBar";
import * as Icons from "../components/Icons";

// ── Question lists ─────────────────────────────────────────────────────────

const SANKEY_TARGETS = [
  { id: "final_avg_pleasure_belief", label: "Sexual Pleasure Belief" },
  { id: "final_healthier_hygienic_belief", label: "Health & Hygiene Belief" },
  { id: "final_partner_preference_belief", label: "Partner Preference Belief" },
  { id: "final_social_norm_perception", label: "Social Normality Perception" },
  { id: "culture_primary_view_of_circ", label: "Primary View of Circ" },
];

const ASSOC_QUESTIONS = [
  { id: "culture_assoc_more_aesthetic", label: "More Aesthetically Pleasing / \"Better\" Looking" },
  { id: "culture_assoc_medically_healthier", label: "Medically Healthier" },
  { id: "culture_assoc_more_hygienic", label: "More Hygienic / Cleaner" },
  { id: "culture_assoc_more_natural", label: "More 'Natural' Looking" },
  { id: "culture_assoc_more_sensitive", label: "More Sensitive / Greater Pleasure Potential" },
  { id: "culture_assoc_easier_care", label: "Easier to Care For" },
  { id: "culture_assoc_more_masculine", label: "More 'Manly' or 'Masculine'" },
  { id: "culture_assoc_more_modern", label: "More Modern / Progressive" },
  { id: "culture_assoc_more_traditional", label: "More Traditional / Old-Fashioned" },
  { id: "culture_assoc_more_socially_acceptable", label: "More Socially Acceptable" },
  { id: "culture_assoc_partner_preference", label: "Preferred by Sexual Partners" },
  { id: "culture_assoc_higher_education", label: "Higher Intelligence / Education" },
  { id: "culture_assoc_higher_ses", label: "Higher Socioeconomic Status" },
  { id: "culture_assoc_liberal_values", label: "Liberal / Progressive Values" },
  { id: "culture_assoc_conservative_values", label: "Conservative / Traditional Values" },
];

const FAULTLINE_QUESTIONS = [
  { id: "exp_pride_satisfaction_rating", concept: "Pride & Satisfaction" },
  { id: "circ_regret_feeling", concept: "Regret (Circumcised Pathway)" },
  { id: "intact_regret_feeling", concept: "Regret (Intact Pathway)" },
  { id: "final_social_norm_perception", concept: "Perception of Shifting Norms" },
  { id: "observe_all_social_climate_discussion", concept: "Social Climate for Discussion" },
];

const QUAL_QUESTIONS = [
  { id: "culture_stereotype_intact", concept: "Common Stereotypes: Intact" },
  { id: "culture_stereotype_circ", concept: "Common Stereotypes: Circumcised" },
  { id: "culture_additional_comments", concept: "Additional Thoughts & Comments" },
];

// ── Lens Switcher component ──────────────────────────────────────────────────

function LensSwitcher({ mode, setMode }) {
  const options = [
    { id: "generation", title: "Generational Timeline", icon: "Clock" },
    { id: "cohort", title: "Cohort Distribution", icon: "Users" },
  ];
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      marginBottom: "2rem",
    }}>
      <h3 style={{
        fontFamily: FONT.condensed,
        fontWeight: 700,
        fontSize: "0.85rem",
        color: C.goldBright,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: "0.2rem",
      }}>
        Viewing Lens
      </h3>
      {options.map(opt => {
        const isActive = mode === opt.id;
        const IconComp = Icons[opt.icon];
        return (
          <button
            key={opt.id}
            onClick={() => setMode(opt.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              background: isActive ? "rgba(212,160,48,0.05)" : "transparent",
              border: `1px solid ${isActive ? C.goldBright : C.ghost}`,
              borderRadius: 8,
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
              opacity: isActive ? 1 : 0.6,
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.opacity = 0.9;
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.opacity = 0.6;
            }}
          >
            <div style={{ 
              color: isActive ? C.goldBright : C.muted,
              flexShrink: 0,
            }}>
              {IconComp && <IconComp size={18} />}
            </div>
            <div>
              <div style={{
                fontFamily: FONT.condensed,
                fontSize: "0.9rem",
                fontWeight: 700,
                color: isActive ? C.goldBright : C.textBright,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                {opt.title}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Data loader for cohort-mode charts ──────────────────────────────────────

function DataLoader({ question, cohort }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOpenText = question?.type === "open_text" || question?.type === "qualitative";

  useEffect(() => {
    if (!question) return;
    setLoading(true);
    const endpoint = isOpenText ? "narratives" : "response-distribution";
    
    // Construct the API call manually to handle cohort filters gracefully,
    // mimicking api.js without a full refactor
    const params = new URLSearchParams();
    params.set("q", question.id);
    
    if (cohort) {
      import("../lib/api").then(({ cohortToFilterParams }) => {
        const filters = cohortToFilterParams(cohort);
        for (const f of filters) params.append("filter", f);
        
        // If pathway is specified in cohort, append it too
        if (cohort.pathway) {
          const pathways = Array.isArray(cohort.pathway) ? cohort.pathway : [cohort.pathway];
          for (const p of pathways) params.append("pathway", p);
        }
        
        fetchData(params);
      });
    } else {
      fetchData(params);
    }

    function fetchData(p) {
      fetch(`${API_BASE}/${endpoint}?${p.toString()}`)
        .then(r => r.json())
        .then(d => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [question, isOpenText, cohort]);

  if (loading) return <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.82rem" }}>Loading data...</div>;
  if (!data) return <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.82rem" }}>No data.</div>;

  const dist = isOpenText ? data.narratives : data.distribution;
  if (!dist || dist.length === 0) {
    return <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.82rem", padding: "0.5rem" }}>No responses.</div>;
  }

  const isMulti = question.type === "multi_select";
  const chartData = isMulti && !isOpenText ? {
    ...data,
    distribution: flattenMultiSelect(data.distribution, question),
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
        cohortDistribution={chartData.cohortDistribution || null}
        question={question}
        hideHeader
      />
    </SmallSampleBadge>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function CultureGenerationsPage({ navigate, setExhibitContext }) {
  const [mode, setMode] = useState("generation");
  const [cohortFilter, setCohortFilter] = useState(null);
  const [questionsMap, setQuestionsMap] = useState({});
  const [activeAssoc, setActiveAssoc] = useState(ASSOC_QUESTIONS[0].id);
  const [activeSankeyTarget, setActiveSankeyTarget] = useState(SANKEY_TARGETS[0].id);

  useEffect(() => {
    getQuestions({ counts: true })
      .then(d => {
        const map = {};
        d.questions.forEach(q => map[q.id] = q);
        setQuestionsMap(map);
      });
  }, []);

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        page_description: `The user is viewing the 'Culture & Generations' exhibit. Current viewing lens: ${mode === 'generation' ? 'Generational Timeline (Streamgraph)' : 'Cohort Distribution'}. This exhibit shows trends in societal views, stereotypes, and attitudes toward circumcision across demographic cohorts.`,
        exhibitName: "Culture & Generations",
        exhibitDescription: "Explore cultural norms, stereotypes, and attitudes regarding circumcision — viewed by cohort or by generational shift.",
        mode,
        activeAssoc,
        activeSankeyTarget
      });
    }
  }, [mode, activeAssoc, activeSankeyTarget, setExhibitContext]);

  const activeAssocPrompt = ASSOC_QUESTIONS.find(q => q.id === activeAssoc)?.label || "";
  const sankeyDims = useMemo(() => {
    return [
      { id: "country_born", label: "Country Born" },
      { id: "pathway", label: "Pathway" },
      { id: activeSankeyTarget, label: SANKEY_TARGETS.find(t => t.id === activeSankeyTarget)?.label || "Belief", type: "question" },
    ];
  }, [activeSankeyTarget]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textBright, fontFamily: FONT.body, paddingBottom: "6rem" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2rem 0" }}>
        <InlineBreadcrumb currentRoute="culture" navigate={navigate} />
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2rem 4rem" }}>
        {/* ── HEADER ─────────────────────────────────────────────── */}
        <ExhibitHero
          title="Culture & Generations"
          color="var(--c-ltBlue)"
          gradientColor="var(--c-blue)"
          BackgroundIcon={Icons.Globe}
          description="How do societal norms, stereotypes, and media influence our understanding of the male body? Explore how attitudes shift across cohorts and across generations — from the Silent Generation through Gen Z."
        />
        
        <div className="explore-grid" style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: "3rem",
          alignItems: "start",
          marginTop: "3rem",
        }}>
          {/* ── LEFT: Topic Navigator ─────────────────────────────── */}
          <aside className="explore-nav" style={{
            position: "sticky",
            top: "calc(var(--header-height, 56px) + 1.5rem)",
            maxHeight: "calc(100vh - var(--header-height, 56px) - 3rem)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            zIndex: 100,
          }}>
            <LensSwitcher mode={mode} setMode={setMode} />

            <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
              <DemographicFilterBar cohort={cohortFilter} onChange={setCohortFilter} />
            </div>

            <div style={{
              fontFamily: FONT.condensed,
              fontWeight: 700,
              fontSize: "0.8rem",
              color: C.text,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}>
              Sections
            </div>

            {/* Cultural Associations nav link */}
            <NavLink label="Cultural Associations" target="cultural_associations" />

            {/* Belief Pathways (Sankey) — cohort mode only */}
            {mode === "cohort" && (
              <NavLink label="Belief Pathways (Sankey)" target="belief_pathways" />
            )}

            {/* Flagship questions */}
            {FAULTLINE_QUESTIONS.map(item => (
              <NavLink key={item.id} label={item.concept} target={item.id} />
            ))}

            <div style={{
              fontFamily: FONT.condensed,
              fontWeight: 700,
              fontSize: "0.7rem",
              color: C.dim,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginTop: "1rem",
              marginBottom: "0.2rem",
            }}>
              In Their Own Words
            </div>
            {QUAL_QUESTIONS.map(item => (
              <NavLink key={item.id} label={item.concept} target={item.id} />
            ))}

            <div style={{ marginTop: "2rem" }}>
              <DemographicFilterBar cohort={cohortFilter} onChange={setCohortFilter} />
            </div>

            {/* How to read (generation mode only) */}
            {mode === "generation" && (
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px dashed ${C.ghost}`,
                borderRadius: 8,
                padding: "1rem",
                marginTop: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Icons.Info size={14} color={C.goldBright} />
                  <div style={{
                    fontFamily: FONT.condensed,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: C.goldBright,
                  }}>
                    How to read these charts
                  </div>
                </div>
                <div style={{ fontFamily: FONT.body, fontSize: "0.8rem", color: C.dim, lineHeight: 1.5 }}>
                  These <strong>Streamgraphs</strong> trace shifting cultural attitudes across time. The timeline moves chronologically from the Silent Generation on the left, to Gen Z on the right.
                  <br /><br />
                  Each colored "ribbon" represents a specific answer choice. The <strong>vertical thickness</strong> of the ribbon represents the percentage of that generation who chose that answer. Watch how ribbons expand or squeeze into nothingness as generations evolve.
                  
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${C.ghost}` }}>
                    <strong style={{ color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: FONT.condensed, fontSize: "0.75rem" }}>Generational Definitions</strong>
                    <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.2rem", color: C.muted }}>
                      <li><strong>Silent Gen:</strong> Born 1928–1945</li>
                      <li><strong>Baby Boomers:</strong> Born 1946–1964</li>
                      <li><strong>Gen X:</strong> Born 1965–1980</li>
                      <li><strong>Millennials:</strong> Born 1981–1996</li>
                      <li><strong>Gen Z:</strong> Born 1997–2012</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* ── RIGHT: Main content ────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>

            {/* ── Section: Cultural Associations ──────────────────── */}
            <section id="cultural_associations" style={{ scrollMarginTop: "2rem" }}>
              <div style={{
                background: C.bgCard,
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${C.ghost}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                position: "relative",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, #14b8a6, ${C.goldBright})`, zIndex: 10 }} />

                <div style={{
                  padding: "2rem",
                  borderBottom: `1px solid ${C.ghost}`,
                  background: C.bgSoft,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  gap: "2rem",
                  flexWrap: "wrap",
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
                          minWidth: "280px",
                        }}
                      >
                        {ASSOC_QUESTIONS.map(q => (
                          <option key={q.id} value={q.id}>[{q.label}]</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, alignItems: "center" }}>
                    <AddToReportButton questionId={activeAssoc} />
                    <SharePopover
                      url={`${window.location.origin}${window.location.pathname}#/q/${activeAssoc}`}
                      questionId={activeAssoc}
                      questionPrompt={activeAssocPrompt}
                    />
                  </div>
                </div>

                <div style={{ padding: "2rem" }}>
                  {mode === "generation" ? (
                    <GenerationalTrendChart questionId={activeAssoc} />
                  ) : !cohortFilter ? (
                    <div style={{ padding: "4rem 2rem", textAlign: "center", border: `1px dashed ${C.ghost}`, borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
                      <Icons.Filter size={48} color={C.dim} style={{ opacity: 0.5, marginBottom: "1rem" }} />
                      <h3 style={{ fontFamily: FONT.display, fontSize: "1.3rem", color: C.textBright, margin: "0 0 0.5rem" }}>Select a Cohort</h3>
                      <p style={{ color: C.muted, fontFamily: FONT.body, maxWidth: 450, margin: "0 auto", lineHeight: 1.5 }}>
                        To view cohort distributions, please add a Demographic Filter from the sidebar. You can compare any sub-population (e.g., Millennials, USA, or Circumcised) against the overall sample.
                      </p>
                    </div>
                  ) : (
                    <CohortAssocCard questionId={activeAssoc} questionsMap={questionsMap} cohort={cohortFilter} />
                  )}
                </div>
              </div>
            </section>

            {/* ── Section: Belief Pathways (Sankey) */}
            <section id="belief_pathways" style={{ scrollMarginTop: "2rem" }}>
              <h2 style={{
                fontFamily: FONT.condensed,
                fontSize: "1.5rem",
                color: C.goldBright,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                borderBottom: `1px solid ${C.ghost}`,
                paddingBottom: "0.5rem",
                marginBottom: "1rem",
              }}>
                Belief Pathways
              </h2>
              <p style={{ color: C.muted, fontFamily: FONT.body, lineHeight: 1.6, marginBottom: "2rem", maxWidth: "800px" }}>
                This diagram illustrates the flow of respondents based on their demographic background through their chosen circumcision pathway, and finally to their current beliefs or perceptions. By following the colored bands, you can see how different origins and experiences contribute to shaping these cultural attitudes.
              </p>
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
                    outline: "none",
                  }}
                >
                  {SANKEY_TARGETS.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "2rem" }}>
                <DemographicSankey cohort={cohortFilter} dimensions={sankeyDims} targetQuestion={activeSankeyTarget} />
              </div>
            </section>

            {/* ── Section: Flagship Questions ────────────────────── */}
            {FAULTLINE_QUESTIONS.map(item => {
              const q = questionsMap[item.id];
              return (
                <section id={item.id} key={item.id} style={{ scrollMarginTop: "2rem" }}>
                  <div style={{
                    background: C.bgCard,
                    borderRadius: 12,
                    overflow: "hidden",
                    border: `1px solid ${C.ghost}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    position: "relative",
                  }}>
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: 4,
                      background: mode === "generation"
                        ? `linear-gradient(90deg, ${C.orange}, ${C.goldBright})`
                        : `linear-gradient(90deg, #14b8a6, #0d9488)`,
                      zIndex: 10,
                    }} />

                    <div style={{
                      padding: "2rem",
                      borderBottom: `1px solid ${C.ghost}`,
                      background: C.bgSoft,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      gap: "2rem",
                    }}>
                      <div>
                        <h2 style={{ fontFamily: FONT.display, fontSize: "2rem", color: C.textBright, marginBottom: "0.5rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
                          {item.concept}
                        </h2>
                        <p style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.muted, fontStyle: "italic", lineHeight: 1.5, margin: 0 }}>
                          {q ? `"${q.prompt}"` : "Loading prompt..."}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, alignItems: "center" }}>
                        <AddToReportButton questionId={item.id} />
                        <SharePopover
                          url={`${window.location.origin}${window.location.pathname}#/q/${item.id}`}
                          questionId={item.id}
                          questionPrompt={q?.prompt}
                        />
                      </div>
                    </div>

                    <div style={{ padding: "2rem" }}>
                      {mode === "generation" ? (
                        <GenerationalTrendChart questionId={item.id} />
                      ) : !cohortFilter ? (
                        <div style={{ padding: "3rem 2rem", textAlign: "center", border: `1px dashed ${C.ghost}`, borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
                          <Icons.Filter size={32} color={C.dim} style={{ opacity: 0.5, marginBottom: "1rem" }} />
                          <h3 style={{ fontFamily: FONT.display, fontSize: "1.1rem", color: C.textBright, margin: "0 0 0.5rem" }}>Select a Cohort</h3>
                          <p style={{ color: C.muted, fontFamily: FONT.body, maxWidth: 400, margin: "0 auto", lineHeight: 1.5, fontSize: "0.9rem" }}>
                            Add a Demographic Filter from the sidebar to compare responses.
                          </p>
                        </div>
                      ) : (
                        <CohortAssocCard questionId={item.id} questionsMap={questionsMap} cohort={cohortFilter} />
                      )}
                    </div>
                  </div>
                </section>
              );
            })}

            {/* ── Section: Qualitative Narratives */}
            <section>
              <h2 style={{
                fontFamily: FONT.condensed,
                fontSize: "1.5rem",
                color: C.goldBright,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                borderBottom: `1px solid ${C.ghost}`,
                paddingBottom: "0.5rem",
                marginBottom: "1.5rem",
              }}>
                In Their Own Words
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                {QUAL_QUESTIONS.map(item => {
                  const q = questionsMap[item.id];
                  return (
                    <div key={item.id} id={item.id} style={{
                      background: C.bgCard,
                      border: `1px solid ${C.ghost}`,
                      borderRadius: 12,
                      padding: "1.5rem",
                      scrollMarginTop: "2rem",
                    }}>
                      <div style={{
                        fontFamily: FONT.condensed,
                        color: C.gold,
                        fontSize: "0.72rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontWeight: 700,
                        marginBottom: "0.5rem",
                      }}>
                        QUALITATIVE RESPONSES
                      </div>
                      <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.textBright, fontStyle: "italic", margin: "0 0 1.5rem" }}>
                        "{q?.prompt || 'Loading question...'}"
                      </p>
                      {q ? <DataLoader question={q} cohort={cohortFilter} /> : <div style={{ color: C.dim }}>Loading...</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cohort distribution card (used in "By Cohort" mode) ────────────────────

function CohortAssocCard({ questionId, questionsMap, cohort }) {
  const q = questionsMap[questionId];
  if (!q) return <div style={{ color: C.dim, fontStyle: "italic" }}>Loading chart data...</div>;
  return <DataLoader question={q} cohort={cohort} />;
}

// ── Navigation link helper ─────────────────────────────────────────────────

function NavLink({ label, target }) {
  return (
    <div
      onClick={() => {
        const el = document.getElementById(target);
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
        transition: "all 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = C.gold; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = C.ghost; }}
    >
      {label}
    </div>
  );
}
