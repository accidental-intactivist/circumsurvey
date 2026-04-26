// ═══════════════════════════════════════════════════════════════════════════
// CircumSurvey · Explore v8.1 — Design Tokens
// Mirrors findings.circumsurvey.online exactly: same palette, type, spacing.
// ═══════════════════════════════════════════════════════════════════════════

export const C = {
  // Backgrounds (dark editorial)
  bg: "#0a0a0c",
  bgSoft: "#131316",
  bgCard: "#18181c",
  bgDeep: "#050506",

  // Text
  text: "#eee",
  textBright: "#fff",
  muted: "#999",
  dim: "#555",
  ghost: "#2a2a30",

  // Brand accents
  gold: "#d4a030",
  goldBright: "#e8b840",

  // Semantic data colors (red=negative/shocking, blue=positive/good, grey=N/A)
  red: "#d94f4f",
  orange: "#e8a44a",
  yellow: "#e8c868",
  green: "#68b878",
  ltBlue: "#8bb8d9",
  blue: "#5b93c7",
  grey: "#a0a0a0",
};

// Pathway-specific colors (semantic anchors for charts + navigation)
export const PATH_COLORS = {
  intact: "#5b93c7",
  circumcised: "#d94f4f",
  restoring: "#e8c868",
  observer: "#e8a44a",
  trans_vaginoplasty: "#e85d50",
  trans_phalloplasty: "#c64639",
  intersex: "#b0a888",
  all: "#d4a030",
};

// Signature rainbow divider rule (used in findings masthead/footer)
export const RAINBOW = "linear-gradient(90deg, #d94f4f, #e8a44a, #e8c868, #68b878, #5b93c7)";

// Fonts
export const FONT = {
  display: "'Playfair Display', serif",           // editorial headings
  body: "'Barlow', sans-serif",                    // primary body
  condensed: "'Barlow Condensed', sans-serif",     // eyebrows, badges, labels
  mono: "'JetBrains Mono', monospace",             // IDs, counts, data
};

// Stable API base — points at the Worker mounted on findings subdomain
export const API_BASE = "https://findings.circumsurvey.online/api";

// Global stylesheet injection — call once from App.jsx
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,400&family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: ${C.bg}; color: ${C.text}; font-family: ${FONT.body}; }
  a { color: inherit; text-decoration: none; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.ghost}; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: ${C.dim}; }

  /* Mobile: collapse two-panel layout into stacked single column */
  @media (max-width: 880px) {
    .explore-grid { grid-template-columns: 1fr !important; }
    .explore-nav { position: static !important; max-height: none !important; }
  }
`;
