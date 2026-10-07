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

import { Link } from "react-router-dom";
import ExploreShell from "../explore/ExploreShell";

export default function ExplorePage() {
  return (
    <>
      <ExploreShell />
      {/* Floating back-to-findings link, fixed top-right so it persists across all sub-views */}
      <Link
        to="/"
        style={{
          position: "fixed",
          top: 14,
          right: 16,
          padding: "6px 12px",
          background: "rgba(10, 10, 12, 0.85)",
          backdropFilter: "blur(8px)",
          border: "1px solid #2a2a30",
          borderRadius: 4,
          color: "#d4a030",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textDecoration: "none",
          zIndex: 1000,
        }}
      >
        ← Narrative Report
      </Link>
    </>
  );
}
