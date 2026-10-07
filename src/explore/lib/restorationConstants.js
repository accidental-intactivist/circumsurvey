// Shared constants for the Restoration Journey exhibit.
// Extracted from RestorationJourneyPage so that TourVisuals (and other
// non-exhibit consumers) can import them without pulling in the entire
// page component — which would defeat React.lazy() code-splitting.

export const RATING_QUESTIONS = [
  { id: "restore_impact_rating_sensation", label: "Sensation & Pleasure" },
  { id: "restore_impact_rating_orgasm", label: "Orgasm Quality & Intensity" },
  { id: "restore_impact_rating_glide", label: "Skin Mobility / Glide" },
  { id: "restore_impact_rating_appearance", label: "Cosmetic Appearance" },
  { id: "restore_impact_rating_psychological", label: "Emotional / Psychological Healing" }
];

export const RESTORATION_COLOR_MAP = {
  // Outcomes
  "Significantly Improved": "#10b981",
  "Somewhat Improved": "#34d399",
  "No Noticeable Change": "#94a3b8",
  "Somewhat Diminished": "#f87171",
  "Significantly Diminished": "#dc2626",
  "Not a primary goal / N/A": "#475569",
  "Not a primary goal": "#475569",
  
  "Signif. Improved": "#10b981",
  "Smwt. Improved": "#34d399",
  "Smwt. Diminished": "#f87171",
  "Signif. Diminished": "#dc2626",
  "Unknown": "#334155",

  // RCI Start
  "RCI-0 (Super tight cut, very little, if any, skin mobility hard or soft)": "#7f1d1d",
  "RCI-1 (Tight cut, no slack when soft)": "#b91c1c",
  "RCI-2 (Medium cut, can pull skin to corona (head) when soft)": "#c2410c",
  "RCI-3 (Loose cut, skin bunches at corona, may roll over a bit when cold)": "#d97706",
  "RCI-4 (Intermittent rollover / \"The Hump\")": "#ca8a04",
  "RCI-5 (Partial Flaccid Coverage)": "#65a30d",
  "RCI-6 (Full Flaccid Coverage)": "#16a34a",
  "RCI-7 (Large-size penis flaccid coverage, retracts only with full erection)": "#0d9488",
  "RCI-8 (Partial Erect Coverage)": "#0891b2",
  "RCI-9 (Full Erect Coverage)": "#0284c7",
  "RCI-10 (Full Erect Coverage with overhang)": "#2563eb",
  "I'm not familiar with the RCI score / I can't estimate my starting score": "#334155",
  "I'm not familiar with the RCI score / I can't estimate my current score": "#334155",
  
  "CI-0": "#7f1d1d",
  "CI-1": "#b91c1c",
  "CI-2": "#c2410c",
  "CI-3": "#d97706",
  "CI-4": "#ca8a04",
  "CI-5": "#65a30d",
  "CI-6": "#16a34a",
  "CI-7": "#0d9488",
  "CI-8": "#0891b2",
  "CI-9": "#0284c7",
  "CI-10": "#2563eb",
  
  "RCI-0": "#7f1d1d",
  "RCI-1": "#b91c1c",
  "RCI-2": "#c2410c",
  "RCI-3": "#d97706",
  "RCI-4": "#ca8a04",
  "RCI-5": "#65a30d",
  "RCI-6": "#16a34a",
  "RCI-7": "#0d9488",
  "RCI-8": "#0891b2",
  "RCI-9": "#0284c7",
  "RCI-10": "#2563eb",

  // Duration
  "Less than 6 months": "#fdf4ff",
  "6 months - 1 year": "#f5d0fe",
  "6 months to 1 year": "#f5d0fe",
  "1-2 years": "#e879f9",
  "2-3 years": "#d946ef",
  "3-5 years": "#c026d3",
  "5-7 years": "#a21caf",
  "7-10 years": "#86198f",
  "More than 10 years": "#701a75",
  "10+ years": "#701a75",
  "I consider myself 'complete' or have achieved my goals and stopped active tugging": "#d946ef",
  "Complete": "#d946ef",

  // Age
  "Teens": "#f8fafc",
  "20s": "#e2e8f0",
  "30s": "#cbd5e1",
  "40s": "#94a3b8",
  "50s": "#64748b",
  "60s": "#475569",
  "70+": "#1e293b",
};

export const RCI_DEFINITIONS = [
  { index: 0, label: 'CI-0', desc: 'Super tight cut, very little, if any, skin mobility hard or soft' },
  { index: 1, label: 'CI-1', desc: 'Tight cut, no slack when soft' },
  { index: 2, label: 'CI-2', desc: 'Medium cut, can pull skin to corona (head) when soft' },
  { index: 3, label: 'CI-3', desc: 'Loose cut, skin bunches at corona, may roll over a bit when cold' },
  { index: 4, label: 'CI-4', desc: 'Intermittent rollover / "The Hump"' },
  { index: 5, label: 'CI-5', desc: 'Partial Flaccid Coverage' },
  { index: 6, label: 'CI-6', desc: 'Full Flaccid Coverage' },
  { index: 7, label: 'CI-7', desc: 'Large-size penis flaccid coverage, retracts only with full erection' },
  { index: 8, label: 'CI-8', desc: 'Partial Erect Coverage' },
  { index: 9, label: 'CI-9', desc: 'Full Erect Coverage' },
  { index: 10, label: 'CI-10', desc: 'Full Erect Coverage with overhang' }
];
