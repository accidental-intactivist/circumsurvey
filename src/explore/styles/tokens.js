// ═══════════════════════════════════════════════════════════════════════════
// CircumSurvey · Explore v8.1 — Design Tokens
// Mirrors findings.circumsurvey.online exactly: same palette, type, spacing.
// ═══════════════════════════════════════════════════════════════════════════

export const C = {
  // Backgrounds
  bg: "var(--c-bg)",
  bgSoft: "var(--c-bgSoft)",
  bgCard: "var(--c-bgCard)",
  bgDeep: "var(--c-bgDeep)",

  // Text
  text: "var(--c-text)",
  textBright: "var(--c-textBright)",
  muted: "var(--c-muted)",
  dim: "var(--c-dim)",
  ghost: "var(--c-ghost)",

  // Brand accents
  gold: "var(--c-gold)",
  goldBright: "var(--c-goldBright)",

  // Semantic data colors
  red: "var(--c-red)",
  orange: "var(--c-orange)",
  yellow: "var(--c-yellow)",
  green: "var(--c-green)",
  ltBlue: "var(--c-ltBlue)",
  blue: "var(--c-blue)",
  grey: "var(--c-grey)",
};

// Pathway-specific colors (semantic anchors for charts + navigation)
export const PATH_COLORS = {
  intact: "var(--path-intact)",
  circumcised: "var(--path-circumcised)",
  restoring: "var(--path-restoring)",
  observer: "var(--path-observer)",
  trans_vaginoplasty: "var(--path-trans-vag)",
  trans_phalloplasty: "var(--path-trans-phal)",
  intersex: "var(--path-intersex)",
  all: "var(--c-gold)",
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

// Global stylesheet injection
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,400&family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  
  :root {
    /* DEFAULT: Deep Space (Dark Theme) */
    --c-bg: #0a0a0c;
    --c-bgSoft: #131316;
    --c-bgCard: #18181c;
    --c-bgDeep: #050506;
    --c-text: #eee;
    --c-textBright: #fff;
    --c-muted: #999;
    --c-dim: #555;
    --c-ghost: #2a2a30;
    --c-gold: #d4a030;
    --c-goldBright: #e8b840;
    --c-red: #d94f4f;
    --c-orange: #e8a44a;
    --c-yellow: #e8c868;
    --c-green: #68b878;
    --c-ltBlue: #8bb8d9;
    --c-blue: #5b93c7;
    --c-grey: #a0a0a0;

    --path-intact: #5b93c7;
    --path-circumcised: #d94f4f;
    --path-restoring: #e8c868;
    --path-observer: #e8a44a;
    --path-trans-vag: #e85d50;
    --path-trans-phal: #c64639;
    --path-intersex: #b0a888;
  }

  [data-theme="light"] {
    /* Tomorrow's Bureau (Light Theme) */
    --c-bg: #faf6f0;
    --c-bgSoft: #f4ede0;
    --c-bgCard: #ffffff;
    --c-bgDeep: #e8e2d8;
    --c-text: #2a2622;
    --c-textBright: #1a1815;
    --c-muted: #5a5450;
    --c-dim: #8a8680;
    --c-ghost: #d4cfc4;
    --c-gold: #a87e18;
    --c-goldBright: #d4a030;
  }

  [data-palette="colorblind"] {
    /* High-contrast accessible palette (Wong) */
    --c-red: #d95f02;
    --c-green: #1b9e77;
    --c-yellow: #e6ab02;
    --path-intact: #7570b3;
    --path-circumcised: #d95f02;
    --path-restoring: #e6ab02;
  }

  [data-palette="vaporwave"] {
    /* Tone's Easter Egg */
    --c-bg: #120b29;
    --c-bgSoft: #1f1147;
    --c-bgCard: #2a1660;
    --c-text: #ff71ce;
    --c-textBright: #01cdfe;
    --c-muted: #b967ff;
    --c-ghost: #4a2d8a;
    --path-intact: #01cdfe;
    --path-circumcised: #ff71ce;
    --path-restoring: #fffb96;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  html, body { 
    background: var(--c-bg); 
    color: var(--c-text); 
    font-family: ${FONT.body}; 
    transition: background 0.3s ease, color 0.3s ease;
  }
  
  a { color: inherit; text-decoration: none; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--c-ghost); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--c-dim); }

  @media (max-width: 880px) {
    .explore-grid { grid-template-columns: 1fr !important; }
    .explore-nav { position: static !important; max-height: none !important; }
  }
`;
