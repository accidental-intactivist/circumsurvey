// ═══════════════════════════════════════════════════════════════════════════
// ExplorePage.jsx — the /explore route in the unified findings app.
//
// This is a thin wrapper that mounts the v8.1 Explore shell (Master Index,
// Pathway Map, Question Detail) and adds a fixed-position "back to Narrative
// Report" link so users always have a way home.
//
// The shell uses hash routing internally, so deep URLs like
//   findings.circumsurvey.online/explore#/q/exp_appearance_feeling
// work correctly and are shareable.
// ═══════════════════════════════════════════════════════════════════════════

import ExploreShell from "../explore/ExploreShell";
import { ReportProvider } from "../explore/contexts/ReportContext";
import ReportBadge from "../explore/components/ReportBadge";

export default function ExplorePage() {
  return (
    <ReportProvider>
      <ExploreShell />
      <ReportBadge />
    </ReportProvider>
  );
}
