// ═══════════════════════════════════════════════════════════════════════════
// CulturalAlignmentPage — explore.circumsurvey.online interactive page
//
// Mounted at #/tools/cultural-alignment. Fetches live from the aggregate API
// and re-fetches whenever the cohort filter changes. Stories auto-generate
// from the top |z| cells — so filtering by (say) "Jewish" shows you which
// cells become most notable for that cohort specifically.
//
// This file is a DROP-IN page for the explore v8.1 router:
//   1. Copy this file to C:\work\circumsurvey-explore\src\pages\CulturalAlignmentPage.jsx
//   2. Copy CulturalAlignmentMatrix.jsx alongside it (in same pages/ folder,
//      or wherever you like — update the import path accordingly)
//   3. In src/lib/router.js, add route handling: if path[0] === "tools" &&
//      path[1] === "cultural-alignment", set route = "cultural-alignment"
//   4. In src/App.jsx, add to the route switch:
//      else if (route === "cultural-alignment") page = <CulturalAlignmentPage ... />
//   5. In src/pages/IndexPage.jsx, add a "Tools" section to the sidebar linking
//      to #/tools/cultural-alignment
// ═══════════════════════════════════════════════════════════════════════════

import { useMemo } from "react";
import CulturalAlignmentMatrix, { NORM_COLUMNS, PATHWAY_ROWS } from "../../components/CulturalAlignmentMatrix";
import DemographicFilterBar from "../components/DemographicFilterBar";
import { C, FONT, RAINBOW, API_BASE } from "../styles/tokens";

// Build a short human-readable label for the current cohort filter
function describeCohort(cohort) {
  if (!cohort) return null;
  const parts = [];
  for (const [k, v] of Object.entries(cohort)) {
    let label = v;
    // Trim parenthetical era from generation labels
    label = label.replace(/\s*\([^)]*\)\s*$/, "");
    if (label.length > 30) label = label.slice(0, 27) + "…";
    parts.push(label);
  }
  return parts.join(" · ");
}

// Serialize cohort to /api/aggregate filter param
function buildFetchUrl(cohort) {
  const base = `${API_BASE}/aggregate?q=final_social_norm_perception&by=pathway`;
  if (!cohort) return base;
  const entries = Object.entries(cohort).filter(([, v]) => v);
  if (entries.length === 0) return base;
  const [col, val] = entries[0];
  const demoCols = ["country_born", "country_now", "us_state_born", "us_state_now",
    "race_ethnicity", "age_bracket", "generation", "education",
    "family_upbringing", "socioeconomic", "politics", "sexuality", "gender", "sex_assigned"];
  const religionCols = ["upbringing_significance", "primary_tradition", "cultural_background",
    "christian_denomination", "jewish_denomination", "islamic_madhhab"];
  const table = religionCols.includes(col) ? "religion" : demoCols.includes(col) ? "demographics" : null;
  if (!table) return base;
  return `${base}&filter=${table}.${col}=${encodeURIComponent(val)}`;
}

export default function CulturalAlignmentPage({ routerState, navigate, updateState }) {
  const { cohort } = routerState;

  const fetchUrl = useMemo(() => buildFetchUrl(cohort), [JSON.stringify(cohort)]);
  const cohortLabel = useMemo(() => describeCohort(cohort), [JSON.stringify(cohort)]);

  // When a cell is clicked, we could navigate to a per-cell drilldown.
  // For v1, we navigate to the underlying question detail page with a hint.
  const handleCellClick = (pathway, column, cell) => {
    // Future: show a modal with the list of respondents matching this cell
    // For now, just log and let future work build the drilldown
    // eslint-disable-next-line no-console
    console.log("Cell clicked:", pathway.label, column.short, cell);
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

        {/* Breadcrumb */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          marginBottom: "1.2rem",
          flexWrap: "wrap",
        }}>
          <a href="#/" style={{
            fontFamily: FONT.condensed,
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: C.muted,
          }}>← Master Index</a>
          <span style={{ color: C.dim }}>/</span>
          <span style={{
            fontFamily: FONT.condensed,
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: C.gold,
          }}>Tools</span>
        </div>

        <div style={{ height: 2, background: RAINBOW, borderRadius: 2, opacity: 0.5, marginBottom: "1.5rem" }} />

        {/* Two-panel layout: cohort filter left, matrix right */}
        <div
          className="explore-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "1.2rem",
            alignItems: "start",
          }}
        >
          {/* LEFT: cohort filter */}
          <aside className="explore-nav" style={{ position: "sticky", top: "1rem", maxHeight: "calc(100vh - 2rem)", overflowY: "auto", paddingRight: "0.3rem" }}>
            <DemographicFilterBar
              cohort={cohort}
              onChange={(c) => updateState({ cohort: c })}
            />

            <div style={{
              marginTop: "1.25rem",
              padding: "0.75rem 0.85rem",
              background: C.bgCard,
              border: `1px solid ${C.ghost}`,
              borderRadius: 7,
              fontFamily: FONT.body,
              fontSize: "0.78rem",
              color: C.muted,
              lineHeight: 1.55,
            }}>
              <div style={{
                fontFamily: FONT.condensed,
                fontSize: "0.65rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: C.goldBright,
                marginBottom: "0.4rem",
                fontWeight: 700,
              }}>★ How this works</div>
              Apply a demographic filter and watch the matrix reshape — the story cards below auto-generate from the cells that stand out <em>within your cohort</em>.
            </div>
          </aside>

          {/* RIGHT: the matrix */}
          <main>
            <CulturalAlignmentMatrix
              fetchUrl={fetchUrl}
              cohortLabel={cohortLabel}
              autoStories={true}
              eyebrow="Pathway × Cultural Norm"
              title="Cultural alignment &amp; defiance"
              subtitle="Each respondent's body arrived in a specific cultural context — a set of expectations about what is normal. This matrix asks: did their pathway match the culture, or contradict it? Apply a demographic filter to see how the shape shifts for different cohorts."
              onCellClick={handleCellClick}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
