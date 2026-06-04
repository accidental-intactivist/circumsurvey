// ═══════════════════════════════════════════════════════════════════════════
// PathwayPage — "Survey Map"
// Full-page interactive flowchart showing the complete survey architecture.
// Replaced the old two-panel sidebar layout with SurveyFlowchart.
// ═══════════════════════════════════════════════════════════════════════════

import { C, FONT } from "../styles/tokens";
import SurveyFlowchart from "../components/SurveyFlowchart";
import InlineBreadcrumb from "../components/InlineBreadcrumb";

export default function PathwayPage({ routerState, navigate, updateState }) {
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

        {/* Flowchart */}
        <SurveyFlowchart navigate={navigate} />

      </div>
    </div>
  );
}
