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

  // Map cartography
  mapOcean: "var(--map-ocean)",
  mapLand: "var(--map-land)",
  mapBorder: "var(--map-border)",
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
  display: "var(--f-display, 'Playfair Display', serif)",           // editorial headings
  body: "var(--f-body, 'Barlow', sans-serif)",                    // primary body
  condensed: "var(--f-condensed, 'Barlow Condensed', sans-serif)",     // eyebrows, badges, labels
  mono: "'JetBrains Mono', monospace",             // IDs, counts, data
};

export const API_BASE = "https://circumsurvey-api.c4charkey.workers.dev/api";

// To develop the worker locally, comment the line above:
// export const API_BASE = (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') || (typeof import.meta !== 'undefined' && import.meta.env?.PROD) ? "https://findings.circumsurvey.online/api" : "http://localhost:8787/api";

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,400&family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@500;600;700&family=JetBrains+Mono:wght@400;600&family=Lexend:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=VT323&display=swap');
  
  :root {
    /* BASE FALLBACK: Standard Deep Space (Dark Theme) */
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
    --c-purple: #7868b8;

    /* Map cartography tokens — Cerulean & Gold (default dark) */
    --map-ocean: #003049;
    --map-land: #D4AF37;
    --map-border: rgba(255, 215, 0, 0.2);

    /* Universal CIRO pathway colors (Evergreen-derived) */
    --path-intact: #34d399;
    --path-circumcised: #ef4444;
    --path-restoring: #fcd34d;
    --path-observer: #f97316;
    --path-trans-vag: #e85d50;
    --path-trans-phal: #c64639;
    --path-intersex: #b0a888;

    /* Categorical palette (Tableau 10 — industry standard for max distinction) */
    --chart-0: #4e79a7;
    --chart-1: #f28e2b;
    --chart-2: #e15759;
    --chart-3: #76b7b2;
    --chart-4: #59a14f;
    --chart-5: #edc948;
    --chart-6: #b07aa1;
    --chart-7: #ff9da7;
    --chart-8: #9c755f;
    --chart-9: #bab0ac;

    /* Sequential palette for heatmaps & ordered data (Viridis) */
    --seq-0: #440154;
    --seq-1: #482878;
    --seq-2: #3e4a89;
    --seq-3: #31688e;
    --seq-4: #26828e;
    --seq-5: #1f9e89;
    --seq-6: #35b779;
    --seq-7: #6ece58;
    --seq-8: #b5de2b;
    --seq-9: #fde725;

    --scanline-opacity: 0;
    --vignette-opacity: 0;
    --sankey-text-shadow: 0px 2px 4px rgba(0,0,0,0.8), 0px 0px 2px rgba(0,0,0,1);
  }

  [data-mode="light"] {
    --sankey-text-shadow: 0px 1px 2px rgba(255,255,255,0.9), 0px 0px 3px rgba(255,255,255,1), 0px 0px 5px rgba(255,255,255,1);
  }

  /* ── STANDARD THEME ── */
  [data-theme="standard"][data-mode="light"] {
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
    /* Map: Pearl White & Gold */
    --map-ocean: #E8E2D8;
    --map-land: #FFFFFF;
    --map-border: rgba(168, 126, 24, 0.25);
  }

  /* ── VAPORWAVE THEME ── */
  [data-theme="vaporwave"][data-mode="dark"] {
    --c-bg: #0d0221;
    --c-bgSoft: #180436;
    --c-bgCard: #23074d;
    --c-bgDeep: #050012;
    --c-text: #00f0ff;
    --c-textBright: #ffffff;
    --c-muted: #ff00a0;
    --c-dim: #9d00ff;
    --c-ghost: #3c126d;
    --c-gold: #fcee09;
    --c-goldBright: #ffffff;
    --c-red: #ff003c;
    --c-orange: #ff5e00;
    --c-yellow: #fcee09;
    --c-green: #00ff41;
    --c-ltBlue: #00f0ff;
    --c-blue: #1a53ff;
    --c-grey: #5a3982;
    --c-purple: #9d00ff;
    /* Map: Neon Purple & Hot Pink */
    --map-ocean: #0d0221;
    --map-land: #ff2d95;
    --map-border: rgba(0, 240, 255, 0.3);
    /* Categorical: Hot Pink → Purple → Cyan */
    --chart-0: #ff2d95; --chart-1: #b026ff; --chart-2: #00f0ff; --chart-3: #ff6ec7; --chart-4: #7b68ee;
    --chart-5: #01cdfe; --chart-6: #ff3860; --chart-7: #9d4edd; --chart-8: #39e5a7; --chart-9: #fcee09;
  }
  
  [data-theme="vaporwave"][data-mode="light"] {
    --c-bg: #f5efff;
    --c-bgSoft: #e9d9ff;
    --c-bgCard: #ffffff;
    --c-bgDeep: #dbc2ff;
    --c-text: #4a148c;
    --c-textBright: #1a0033;
    --c-muted: #00bcd4;
    --c-dim: #00838f;
    --c-ghost: #ce93d8;
    --c-gold: #ffca28;
    --c-goldBright: #ff8f00;
    --c-red: #ff4081;
    --c-orange: #ff6e40;
    --c-yellow: #ffeb3b;
    --c-green: #1de9b6;
    --c-ltBlue: #84ffff;
    --c-blue: #00e5ff;
    --c-grey: #b39ddb;
    --c-purple: #d500f9;
    /* Map: Lavender & Violet */
    --map-ocean: #E9D9FF;
    --map-land: #FFFFFF;
    --map-border: rgba(206, 147, 216, 0.4);
    /* Categorical: Deep Pink → Violet → Teal */
    --chart-0: #d81b60; --chart-1: #8e24aa; --chart-2: #00838f; --chart-3: #c2185b; --chart-4: #5e35b1;
    --chart-5: #00695c; --chart-6: #ad1457; --chart-7: #7b1fa2; --chart-8: #00897b; --chart-9: #f9a825;
  }

  /* ── EVERGREEN THEME ── */
  [data-theme="evergreen"][data-mode="dark"] {
    --c-bg: #06120e;
    --c-bgSoft: #0d221a;
    --c-bgCard: #132f24;
    --c-bgDeep: #030a08;
    --c-text: #e2f0e9;
    --c-textBright: #ffffff;
    --c-muted: #84bfa0;
    --c-dim: #4e8f6e;
    --c-ghost: #1c4535;
    --c-gold: #f59e0b;
    --c-goldBright: #fbbf24;
    --c-red: #ef4444;
    --c-orange: #f97316;
    --c-yellow: #fcd34d;
    --c-green: #10b981;
    --c-ltBlue: #6ee7b7;
    --c-blue: #0ea5e9;
    --c-grey: #1e3b2d;
    --c-purple: #8b5cf6;
    /* Map: Emerald & Gold */
    --map-ocean: #043927;
    --map-land: #D4AF37;
    --map-border: rgba(251, 191, 36, 0.2);

    /* Categorical: Nature */
    --chart-0: #10b981;
    --chart-1: #f59e0b;
    --chart-2: #3b82f6;
    --chart-3: #ef4444;
    --chart-4: #8b5cf6;
    --chart-5: #14b8a6;
    --chart-6: #f43f5e;
    --chart-7: #84cc16;
    --chart-8: #06b6d4;
    --chart-9: #d946ef;
  }

  [data-theme="evergreen"][data-mode="light"] {
    --c-bg: #f0f5f2;
    --c-bgSoft: #e2ece6;
    --c-bgCard: #ffffff;
    --c-bgDeep: #d4e3d9;
    --c-text: #1a3324;
    --c-textBright: #0b1c14;
    --c-muted: #5c7a6a;
    --c-dim: #8fb39f;
    --c-ghost: #c0d1c7;
    --c-gold: #a87e18;
    --c-goldBright: #d4a030;
    --c-red: #a83a2c;
    --c-orange: #a87e18;
    --c-yellow: #d4a030;
    --c-green: #5c7a6a;
    --c-ltBlue: #c0d1c7;
    --c-blue: #8fb39f;
    --c-grey: #d4e3d9;
    --c-purple: #8e50b8;
    /* Map: Sage & Pearl */
    --map-ocean: #D4E3D9;
    --map-land: #FFFFFF;
    --map-border: rgba(92, 122, 106, 0.25);

    /* Categorical: Nature (light) */
    --chart-0: #047857;
    --chart-1: #b45309;
    --chart-2: #1d4ed8;
    --chart-3: #b91c1c;
    --chart-4: #6d28d9;
    --chart-5: #0d9488;
    --chart-6: #be123c;
    --chart-7: #4d7c0f;
    --chart-8: #0e7490;
    --chart-9: #a21caf;
  }

  /* ── OCEAN THEME (Acadia Inspired) ── */
  [data-theme="ocean"][data-mode="dark"] {
    --c-bg: #011627;
    --c-bgSoft: #0b2942;
    --c-bgCard: #133856;
    --c-bgDeep: #000a14;
    --c-text: #8ab4f8;
    --c-textBright: #e2f1ff;
    --c-muted: #fed789;
    --c-dim: #72874e;
    --c-ghost: #476f84;
    --c-gold: #fed789;
    --c-goldBright: #ffebbc;
    --c-red: #ef476f;
    --c-orange: #f7b267;
    --c-yellow: #fed789;
    --c-green: #72874e;
    --c-ltBlue: #a4bed5;
    --c-blue: #476f84;
    --c-grey: #453947;
    --c-purple: #9b72aa;
    /* Map: Deep Cerulean & Pearl */
    --map-ocean: #004B73;
    --map-land: #E2F1FF;
    --map-border: rgba(254, 215, 137, 0.2);

    /* Categorical: Coastal */
    --chart-0: #0ea5e9;
    --chart-1: #f97316;
    --chart-2: #ef476f;
    --chart-3: #06d6a0;
    --chart-4: #8b5cf6;
    --chart-5: #ffd166;
    --chart-6: #118ab2;
    --chart-7: #e76f51;
    --chart-8: #2a9d8f;
    --chart-9: #e9c46a;
  }

  [data-theme="ocean"][data-mode="light"] {
    --c-bg: #f0f9ff;
    --c-bgSoft: #e0f2fe;
    --c-bgCard: #ffffff;
    --c-bgDeep: #bae6fd;
    --c-text: #0c4a6e;
    --c-textBright: #082f49;
    --c-muted: #0369a1;
    --c-dim: #0284c7;
    --c-ghost: #7dd3fc;
    --c-gold: #0284c7;
    --c-goldBright: #0ea5e9;
    --c-red: #e11d48;
    --c-orange: #d97706;
    --c-yellow: #06b6d4;
    --c-green: #059669;
    --c-ltBlue: #bae6fd;
    --c-blue: #0284c7;
    --c-grey: #e0f2fe;
    --c-purple: #7c3aed;
    /* Map: Sky Blue & White */
    --map-ocean: #BAE6FD;
    --map-land: #FFFFFF;
    --map-border: rgba(3, 105, 161, 0.2);

    /* Categorical: Coastal (light) */
    --chart-0: #0369a1;
    --chart-1: #c2410c;
    --chart-2: #be123c;
    --chart-3: #047857;
    --chart-4: #6d28d9;
    --chart-5: #b45309;
    --chart-6: #0e7490;
    --chart-7: #9a3412;
    --chart-8: #115e59;
    --chart-9: #854d0e;
  }

  /* ── AMBER THEME ── */
  [data-theme="amber"][data-mode="dark"] {
    --c-bg: #211612;
    --c-bgSoft: #2f211c;
    --c-bgCard: #3c2a23;
    --c-bgDeep: #170e0b;
    --c-text: #ceb175;
    --c-textBright: #f5eedf;
    --c-muted: #c18748;
    --c-dim: #8b5b2c;
    --c-ghost: #4a3227;
    --c-gold: #ceb175;
    --c-goldBright: #e5cc98;
    --c-red: #e54e21;
    --c-orange: #c18748;
    --c-yellow: #ceb175;
    --c-green: #6c8645;
    --c-ltBlue: #5bc4c2;
    --c-blue: #0a9f9d;
    --c-grey: #8d7a64;
    --c-purple: #9c6c84;
    /* Map: Antiqued Bronze & Gold */
    --map-ocean: #2B1202;
    --map-land: #CEB175;
    --map-border: rgba(229, 204, 152, 0.2);

    /* Categorical: Warm Earth */
    --chart-0: #ceb175; --chart-1: #e54e21; --chart-2: #0a9f9d; --chart-3: #6c8645; --chart-4: #c18748;
    --chart-5: #9c6c84; --chart-6: #e5cc98; --chart-7: #5bc4c2; --chart-8: #8d7a64; --chart-9: #d4956b;
  }
  [data-theme="amber"][data-mode="light"] {
    --c-bg: #fdf8f0;
    --c-bgSoft: #f4ecd8;
    --c-bgCard: #ffffff;
    --c-bgDeep: #e8dcc4;
    --c-text: #4a3227;
    --c-textBright: #211612;
    --c-muted: #c18748;
    --c-dim: #8b5b2c;
    --c-ghost: #ceb175;
    --c-gold: #c18748;
    --c-goldBright: #e54e21;
    --c-red: #e54e21;
    --c-orange: #c18748;
    --c-yellow: #ceb175;
    --c-green: #6c8645;
    --c-ltBlue: #5bc4c2;
    --c-blue: #0a9f9d;
    --c-grey: #e8dcc4;
    --c-purple: #9c6c84;
    /* Map: Antique Parchment & Amber */
    --map-ocean: #E8DCC4;
    --map-land: #FFFFFF;
    --map-border: rgba(193, 135, 72, 0.25);

    /* Categorical: Warm Earth (light) */
    --chart-0: #0a9f9d; --chart-1: #e54e21; --chart-2: #6c8645; --chart-3: #c18748; --chart-4: #9c6c84;
    --chart-5: #4a3227; --chart-6: #5bc4c2; --chart-7: #8d7a64; --chart-8: #8b5b2c; --chart-9: #d4956b;
  }

  /* ── PAPER THEME ── */
  [data-theme="paper"][data-mode="dark"] {
    --c-bg: #1e1b18;
    --c-bgSoft: #2a2522;
    --c-bgCard: #36302d;
    --c-bgDeep: #141210;
    --c-text: #dccbc1;
    --c-textBright: #fdfbf7;
    --c-muted: #c38961;
    --c-dim: #9f5630;
    --c-ghost: #79716c;
    --c-gold: #c38961;
    --c-goldBright: #e04b28;
    --c-red: #950404;
    --c-orange: #e04b28;
    --c-yellow: #c38961;
    --c-green: #388f30;
    --c-ltBlue: #00c1c8;
    --c-blue: #007d82;
    --c-grey: #4a3b32;
    --c-purple: #004042;
    /* Map: Sepia & Parchment */
    --map-ocean: #1E1B18;
    --map-land: #DCCBC1;
    --map-border: rgba(195, 137, 97, 0.2);

    /* Categorical: Earthy Muted */
    --chart-0: #00c1c8; --chart-1: #e04b28; --chart-2: #c38961; --chart-3: #388f30; --chart-4: #950404;
    --chart-5: #007d82; --chart-6: #9f5630; --chart-7: #dccbc1; --chart-8: #79716c; --chart-9: #004042;
  }
  [data-theme="paper"][data-mode="light"] {
    --c-bg: #fdfbf7;
    --c-bgSoft: #f2efe9;
    --c-bgCard: #ffffff;
    --c-bgDeep: #e5dfd5;
    --c-text: #4a3b32;
    --c-textBright: #2d1f18;
    --c-muted: #c38961;
    --c-dim: #9f5630;
    --c-ghost: #dccbc1;
    --c-gold: #c38961;
    --c-goldBright: #e04b28;
    --c-red: #950404;
    --c-orange: #e04b28;
    --c-yellow: #c38961;
    --c-green: #388f30;
    --c-ltBlue: #00c1c8;
    --c-blue: #007d82;
    --c-grey: #79716c;
    --c-purple: #004042;
    /* Map: Warm Cream & Ivory */
    --map-ocean: #E5DFD5;
    --map-land: #FFFFFF;
    --map-border: rgba(195, 137, 97, 0.2);

    /* Categorical: Earthy Muted (light) */
    --chart-0: #007d82; --chart-1: #950404; --chart-2: #e04b28; --chart-3: #388f30; --chart-4: #9f5630;
    --chart-5: #004042; --chart-6: #0f542f; --chart-7: #c38961; --chart-8: #79716c; --chart-9: #2d1f18;
  }

  /* ── PUEBLO THEME ── */
  [data-theme="pueblo"][data-mode="dark"] {
    --c-bg: #3d1a04;
    --c-bgSoft: #592606;
    --c-bgCard: #4a220a;
    --c-bgDeep: #2b1202;
    --c-text: #ffb380;
    --c-textBright: #ffe3c2;
    --c-muted: #e64a19;
    --c-dim: #bf360c;
    --c-ghost: #8d4019;
    --c-gold: #ff8c00;
    --c-goldBright: #ffb347;
    --c-red: #e64a19;
    --c-orange: #ff5722;
    --c-yellow: #ffb300;
    --c-green: #00897b;
    --c-ltBlue: #4db6ac;
    --c-blue: #00695c;
    --c-grey: #8d6e63;
    --c-purple: #6d4c41;
    /* Map: Terracotta & Turquoise */
    --map-ocean: #3D1A04;
    --map-land: #4DB6AC;
    --map-border: rgba(255, 179, 71, 0.2);

    /* Categorical: Desert */
    --chart-0: #4db6ac; --chart-1: #e64a19; --chart-2: #ff8c00; --chart-3: #00897b; --chart-4: #8d6e63;
    --chart-5: #ff5722; --chart-6: #ffb347; --chart-7: #6d4c41; --chart-8: #00695c; --chart-9: #8d4019;
  }
  [data-theme="pueblo"][data-mode="light"] {
    --c-bg: #ffe3c2;
    --c-bgSoft: #ffcc99;
    --c-bgCard: #ffffff;
    --c-bgDeep: #ffb380;
    --c-text: #4a220a;
    --c-textBright: #2b1202;
    --c-muted: #ff5722;
    --c-dim: #e64a19;
    --c-ghost: #ffb380;
    --c-gold: #ff8c00;
    --c-goldBright: #ff5722;
    --c-red: #e64a19;
    --c-orange: #ff5722;
    --c-yellow: #ffb300;
    --c-green: #00897b;
    --c-ltBlue: #4db6ac;
    --c-blue: #00695c;
    --c-grey: #8d6e63;
    --c-purple: #6d4c41;
    /* Map: Sandy & Coral */
    --map-ocean: #FFB380;
    --map-land: #FFFFFF;
    --map-border: rgba(230, 74, 25, 0.2);

    /* Categorical: Desert (light) */
    --chart-0: #00695c; --chart-1: #e64a19; --chart-2: #ff5722; --chart-3: #00897b; --chart-4: #6d4c41;
    --chart-5: #ff8c00; --chart-6: #bf360c; --chart-7: #8d6e63; --chart-8: #4db6ac; --chart-9: #4a220a;
  }

  /* ── BRICK THEME ── */
  [data-theme="brick"][data-mode="dark"] {
    --c-bg: #1f0505;
    --c-bgSoft: #3b0b0b;
    --c-bgCard: #2e0808;
    --c-bgDeep: #120202;
    --c-text: #ff9999;
    --c-textBright: #ffc2c2;
    --c-muted: #b71c1c;
    --c-dim: #880e4f;
    --c-ghost: #5c1c1c;
    --c-gold: #d32f2f;
    --c-goldBright: #ff5252;
    --c-red: #b71c1c;
    --c-orange: #e53935;
    --c-yellow: #ef5350;
    --c-green: #455a64;
    --c-ltBlue: #78909c;
    --c-blue: #263238;
    --c-grey: #546e7a;
    --c-purple: #880e4f;
    /* Map: Obsidian & Silver */
    --map-ocean: #0A0A0A;
    --map-land: #C0C0C0;
    --map-border: rgba(120, 144, 156, 0.25);

    /* Categorical: Industrial */
    --chart-0: #78909c; --chart-1: #b71c1c; --chart-2: #d32f2f; --chart-3: #455a64; --chart-4: #e53935;
    --chart-5: #880e4f; --chart-6: #ff5252; --chart-7: #546e7a; --chart-8: #263238; --chart-9: #5c1c1c;
  }
  [data-theme="brick"][data-mode="light"] {
    --c-bg: #ffebeb;
    --c-bgSoft: #ffc2c2;
    --c-bgCard: #ffffff;
    --c-bgDeep: #ff9999;
    --c-text: #3b0b0b;
    --c-textBright: #120202;
    --c-muted: #e53935;
    --c-dim: #b71c1c;
    --c-ghost: #ff9999;
    --c-gold: #d32f2f;
    --c-goldBright: #b71c1c;
    --c-red: #b71c1c;
    --c-orange: #e53935;
    --c-yellow: #ef5350;
    --c-green: #455a64;
    --c-ltBlue: #78909c;
    --c-blue: #263238;
    --c-grey: #546e7a;
    --c-purple: #880e4f;
    /* Map: Rose & Slate */
    --map-ocean: #FF9999;
    --map-land: #FFFFFF;
    --map-border: rgba(183, 28, 28, 0.2);

    /* Categorical: Industrial (light) */
    --chart-0: #263238; --chart-1: #b71c1c; --chart-2: #e53935; --chart-3: #455a64; --chart-4: #880e4f;
    --chart-5: #d32f2f; --chart-6: #546e7a; --chart-7: #78909c; --chart-8: #5c1c1c; --chart-9: #3b0b0b;
  }

  /* ── MONO THEME ── */
  [data-theme="mono"][data-mode="dark"] {
    --c-bg: #000000;
    --c-bgSoft: #0a0a0a;
    --c-bgCard: #121212;
    --c-bgDeep: #000000;
    --c-text: #8a8a8a;
    --c-textBright: #f4f4f4;
    --c-muted: #666666;
    --c-dim: #444444;
    --c-ghost: #2a2a2a;
    --c-gold: #ffffff;
    --c-goldBright: #ffffff;
    --c-red: #ffffff;
    --c-orange: #ffffff;
    --c-yellow: #ffffff;
    --c-green: #ffffff;
    --c-ltBlue: #ffffff;
    --c-blue: #ffffff;
    --c-grey: #8a8a8a;
    --c-purple: #8a8a8a;
    /* Map: Jet Black & Silver */
    --map-ocean: #000000;
    --map-land: #E0E0E0;
    --map-border: rgba(255, 255, 255, 0.1);
    --path-intact: #ffffff;
    --path-circumcised: #ffffff;
    --path-restoring: #ffffff;
    --path-observer: #ffffff;
    --chart-0: #f4f4f4; --chart-1: #444444; --chart-2: #8a8a8a; --chart-3: #c0c0c0; --chart-4: #222222;
    --chart-5: #666666; --chart-6: #e0e0e0; --chart-7: #555555; --chart-8: #999999; --chart-9: #111111;
  }
  [data-theme="mono"][data-mode="light"] {
    --c-bg: #f4f4f4;
    --c-bgSoft: #e0e0e0;
    --c-bgCard: #ffffff;
    --c-bgDeep: #d4d4d4;
    --c-text: #444444;
    --c-textBright: #111111;
    --c-muted: #8a8a8a;
    --c-dim: #999999;
    --c-ghost: #c0c0c0;
    --c-gold: #111111;
    --c-goldBright: #111111;
    --c-red: #111111;
    --c-orange: #111111;
    --c-yellow: #111111;
    --c-green: #111111;
    --c-ltBlue: #111111;
    --c-blue: #111111;
    --c-grey: #666666;
    --c-purple: #111111;
    /* Map: Pearl White & Graphite */
    --map-ocean: #D4D4D4;
    --map-land: #FFFFFF;
    --map-border: rgba(17, 17, 17, 0.15);
    --path-intact: #111111;
    --path-circumcised: #111111;
    --path-restoring: #111111;
    --path-observer: #111111;
    --chart-0: #111111; --chart-1: #999999; --chart-2: #555555; --chart-3: #c0c0c0; --chart-4: #e0e0e0;
    --chart-5: #666666; --chart-6: #222222; --chart-7: #8a8a8a; --chart-8: #444444; --chart-9: #f4f4f4;
  }
  /* ── TOMORROW TYPEFACE ── */
  [data-typeface="tomorrow"] {
    --f-display: 'Josefin Sans', sans-serif;
    --f-body: 'Outfit', sans-serif;
    --f-condensed: 'Outfit', sans-serif;
  }

  /* ── COLORBLIND OVERRIDE ── */
  [data-colorblind="true"],
  [data-theme][data-colorblind="true"],
  [data-theme][data-mode][data-colorblind="true"] {
    /* High-contrast accessible palette (Wong) */
    --c-red: #d95f02;
    --c-green: #1b9e77;
    --c-yellow: #e6ab02;
    --c-purple: #7570b3;
    --path-intact: #7570b3;
    --path-circumcised: #d95f02;
    --path-restoring: #e6ab02;
    --path-observer: #1b9e77;

    /* Categorical: Wong palette (designed for categorical + colorblind-safe) */
    --chart-0: #56b4e9;
    --chart-1: #d55e00;
    --chart-2: #f0e442;
    --chart-3: #009e73;
    --chart-4: #cc79a7;
    --chart-5: #0072b2;
    --chart-6: #e69f00;
    --chart-7: #999999;
    --chart-8: #359b52;
    --chart-9: #e6beff;
  }

  /* ── DYSLEXIC FONT OVERRIDE ── */
  [data-dyslexic="true"] {
    --f-display: 'Lexend', sans-serif;
    --f-body: 'Lexend', sans-serif;
    --f-condensed: 'Lexend', sans-serif;
  }
  
  /* ── FRODO THEME (Amiga/C64 Easter Egg) ── */
  [data-theme="frodo"] {
    --c-bg: #352879;
    --c-bgSoft: #352879;
    --c-bgCard: #352879;
    --c-bgDeep: #000000;
    --c-text: #6C5EB5;
    --c-textBright: #FFFFFF;
    --c-muted: #6C5EB5;
    --c-dim: #6C5EB5;
    --c-ghost: #6C5EB5;
    --c-gold: #B8C76F;
    --c-goldBright: #B8C76F;
    /* Map: C64 Purple & PETSCII Green */
    --map-ocean: #352879;
    --map-land: #6C5EB5;
    --map-border: rgba(184, 199, 111, 0.3);
    
    --c-red: #9A6759;
    --c-orange: #6F4F25;
    --c-yellow: #B8C76F;
    --c-green: #588D43;
    --c-ltBlue: #70A4B2;
    --c-blue: #352879;
    --c-grey: #6C6C6C;
    --c-purple: #6F3D86;

    --path-intact: #9AD284;
    --path-circumcised: #9A6759;
    --path-restoring: #6C5EB5;
    --path-observer: #B8C76F;
    
    --chart-0: #FFFFFF;
    --chart-1: #6C5EB5;
    --chart-2: #B8C76F;
    --chart-3: #70A4B2;
    --chart-4: #588D43;
    --chart-5: #9A6759;
    --chart-6: #6F3D86;
    --chart-7: #6F4F25;
    --chart-8: #959595;
    --chart-9: #444444;
    
    --f-display: 'JetBrains Mono', monospace !important;
    --f-body: 'JetBrains Mono', monospace !important;
    --f-condensed: 'JetBrains Mono', monospace !important;
  }

  [data-theme="frodo"] body {
    border: 4px solid #6C5EB5;
    padding: 2px;
  }
  
  [data-theme="frodo"] * {
    border-radius: 0 !important;
  }

  html, body { 
    background: var(--c-bg); 
    color: var(--c-text); 
    font-family: ${FONT.body}; 
    transition: background 0.3s ease, color 0.3s ease;
  }
  
  /* Scanline and vignette overlays */
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9000;
    background-image: repeating-linear-gradient(
      to bottom,
      rgba(0,0,0, var(--scanline-opacity, 0)) 0px,
      rgba(0,0,0, var(--scanline-opacity, 0)) 1px,
      transparent 1px,
      transparent 3px
    );
    mix-blend-mode: multiply;
  }
  
  body::after {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9001;
    background-image: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0, var(--vignette-opacity, 0)) 100%);
  }

  /* Overlay toggle constraints */
  [data-theme="paper"] body::before,
  [data-theme="paper"] body::after,
  [data-theme="pbs"] body::after,
  [data-theme="frodo"] body::before,
  [data-theme="frodo"] body::after {
    display: none !important;
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

  /* ── MOCKUP TYPOGRAPHY & CHROME UTILITY CLASSES ── */
  .mono { font-family: 'VT323', 'DM Mono', monospace !important; letter-spacing: 0.02em; }
  .dmm  { font-family: 'DM Mono', monospace !important; }
  .serif{ font-family: 'Instrument Serif', Georgia, serif !important; }
  .disp { font-family: 'Space Grotesk', sans-serif !important; font-weight: 500; letter-spacing: -0.02em; }

  .tag {
    font-family: 'VT323', monospace !important;
    font-size: 18px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--c-gold);
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .tag::before {
    content: ""; width: 10px; height: 10px;
    background: var(--c-gold); display: inline-block;
  }
  .tag.warm { color: var(--c-orange); }
  .tag.warm::before { background: var(--c-orange); }
  .tag.hot { color: var(--c-red); }
  .tag.hot::before { background: var(--c-red); }
  .tag.cool { color: var(--c-blue); }
  .tag.cool::before { background: var(--c-blue); }

  .kicker {
    font-family: 'VT323', monospace !important;
    font-size: 22px;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: var(--c-muted);
  }

  .h-rule {
    height: 1px;
    background: var(--c-ghost);
    width: 100%;
  }
  .h-rule.dashed {
    background: none;
    border-top: 1px dashed var(--c-ghost);
    height: 0;
  }
  .dotted-rule {
    background: radial-gradient(circle, var(--c-gold) 1px, transparent 1.5px) 0 0 / 8px 1px repeat-x;
    height: 1px;
    width: 100%;
  }

  .crt-frame {
    border: 1px solid var(--c-ghost);
    padding: 1.5rem 1.75rem;
    background: var(--c-bgSoft);
    position: relative;
  }
  .crt-frame .corner {
    position: absolute;
    width: 14px; height: 14px;
    border-color: var(--c-gold);
  }
  .crt-frame .corner.tl { top: -1px; left: -1px;  border-top: 1px solid; border-left: 1px solid; }
  .crt-frame .corner.tr { top: -1px; right: -1px; border-top: 1px solid; border-right: 1px solid; }
  .crt-frame .corner.bl { bottom: -1px; left: -1px; border-bottom: 1px solid; border-left: 1px solid; }
  .crt-frame .corner.br { bottom: -1px; right: -1px; border-bottom: 1px solid; border-right: 1px solid; }

  .title-xxl {
    font-size: clamp(48px, 9.5vw, 156px);
    line-height: 0.92;
    letter-spacing: -0.035em;
    font-weight: 500;
  }
  .title-xl {
    font-size: clamp(40px, 6.5vw, 96px);
    line-height: 0.98;
    letter-spacing: -0.03em;
  }
  .title-l {
    font-size: clamp(32px, 4.4vw, 64px);
    line-height: 1.05;
    letter-spacing: -0.025em;
  }
  .title-m {
    font-size: clamp(22px, 2.6vw, 36px);
    line-height: 1.15;
    letter-spacing: -0.01em;
    font-weight: 500;
  }

  .pull-serif {
    font-family: 'Instrument Serif', Georgia, serif !important;
    font-style: italic;
    font-size: clamp(28px, 3.2vw, 44px);
    line-height: 1.2;
    color: var(--c-textBright);
    font-weight: 400;
    letter-spacing: 0.005em;
    text-wrap: balance;
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
  @media print {
    .no-print, .no-capture {
      display: none !important;
    }
  }
`;

const staticFallbacks = {
  "--c-bg": "#0a0a0c",
  "--c-bgSoft": "#131316",
  "--c-bgCard": "#18181c",
  "--c-bgDeep": "#050506",
  "--c-text": "#eee",
  "--c-textBright": "#fff",
  "--c-muted": "#999",
  "--c-dim": "#555",
  "--c-ghost": "#2a2a30",
  "--c-gold": "#d4a030",
  "--c-goldBright": "#e8b840",
  "--c-red": "#d94f4f",
  "--c-orange": "#e8a44a",
  "--c-yellow": "#e8c868",
  "--c-green": "#68b878",
  "--c-ltBlue": "#8bb8d9",
  "--c-blue": "#5b93c7",
  "--c-grey": "#a0a0a0",
  "--c-purple": "#7868b8",
  "--path-intact": "#34d399",
  "--path-circumcised": "#ef4444",
  "--path-restoring": "#fcd34d",
  "--path-observer": "#f97316",
  "--path-trans-vag": "#e85d50",
  "--path-trans-phal": "#c64639",
  "--path-intersex": "#b0a888",
  "--map-ocean": "#003049",
  "--map-land": "#D4AF37",
  "--map-border": "rgba(255, 215, 0, 0.2)"
};

const lightModeFallbacks = {
  "--c-bg": "#faf6f0",
  "--c-bgSoft": "#f4ede0",
  "--c-bgCard": "#ffffff",
  "--c-bgDeep": "#e8e2d8",
  "--c-text": "#2a2622",
  "--c-textBright": "#1a1815",
  "--c-muted": "#5a5450",
  "--c-dim": "#8a8680",
  "--c-ghost": "#d4cfc4",
  "--c-gold": "#a87e18",
  "--c-goldBright": "#d4a030",
  "--c-red": "#d94f4f",
  "--c-orange": "#e8a44a",
  "--c-yellow": "#e8c868",
  "--c-green": "#68b878",
  "--c-ltBlue": "#8bb8d9",
  "--c-blue": "#5b93c7",
  "--c-grey": "#a0a0a0",
  "--c-purple": "#7868b8",
  "--path-intact": "#34d399",
  "--path-circumcised": "#ef4444",
  "--path-restoring": "#fcd34d",
  "--path-observer": "#f97316",
  "--path-trans-vag": "#e85d50",
  "--path-trans-phal": "#c64639",
  "--path-intersex": "#b0a888",
  "--map-ocean": "#E8E2D8",
  "--map-land": "#FFFFFF",
  "--map-border": "rgba(168, 126, 24, 0.25)"
};

export function resolveCssColor(varStr) {
  const match = String(varStr).match(/var\(([^)]+)\)/);
  if (match) {
    const varName = match[1];
    if (typeof window !== "undefined") {
      const hasTheme = document.documentElement.hasAttribute("data-theme");
      if (hasTheme) {
        const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        if (val) return val;
      }
      
      // Fallback if styling/theme attributes are not fully ready
      try {
        const mode = localStorage.getItem("cs_theme_mode") || "dark";
        if (mode === "light" && lightModeFallbacks[varName]) {
          return lightModeFallbacks[varName];
        }
      } catch (e) {}
      if (staticFallbacks[varName]) return staticFallbacks[varName];
    } else {
      if (staticFallbacks[varName]) return staticFallbacks[varName];
    }
  }
  if (typeof varStr === "string" && (varStr.startsWith("#") || varStr.startsWith("rgb") || varStr.startsWith("hsl"))) {
    return varStr;
  }
  return "#888888";
}

