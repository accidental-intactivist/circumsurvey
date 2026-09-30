// ═══════════════════════════════════════════════════════════════════════════
// PathwayPage — "Survey Map"
// Full-page interactive flowchart showing the complete survey architecture.
// Replaced the old two-panel sidebar layout with SurveyFlowchart.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { C, FONT } from "../styles/tokens";
import SurveyFlowchart from "../components/SurveyFlowchart";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import ExhibitHero from "../components/ExhibitHero";

export default function PathwayPage({ routerState, navigate, updateState, setExhibitContext }) {
  const pathwayId = routerState.params.id;

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        page_description: "The user is viewing the 'Survey Map' exhibit. This page displays a full interactive flowchart showing the architectural map of the survey. The survey begins with universal questions, splits into unique pathways (Intact, Circumcised, Restoring, Observer, Trans/Intersex) based on respondent demographics, and then converges again for final universal questions.",
        exhibitName: "Pathway Hub",
        pathway: pathwayId
      });
    }
  }, [pathwayId, setExhibitContext]);

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      padding: "1.75rem 1.1rem 3rem",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <InlineBreadcrumb currentRoute="pathways" navigate={navigate} />

        <ExhibitHero title="The Survey Map" description="An interactive flowchart of the complete survey architecture, from the universal questions every respondent answered, through the pathway fork, into each cohort's unique question set, and back together at synthesis." />

        {/* Flowchart */}
        <SurveyFlowchart navigate={navigate} pathwayId={pathwayId} />

      </div>
    </div>
  );
}
