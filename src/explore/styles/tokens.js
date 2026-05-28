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
  display: "var(--f-display, 'Playfair Display', serif)",           // editorial headings
  body: "var(--f-body, 'Barlow', sans-serif)",                    // primary body
  condensed: "var(--f-condensed, 'Barlow Condensed', sans-serif)",     // eyebrows, badges, labels
  mono: "'JetBrains Mono', monospace",             // IDs, counts, data
};

export const API_BASE = "https://findings.circumsurvey.online/api";

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

    --path-intact: #5b93c7;
    --path-circumcised: #d94f4f;
    --path-restoring: #e8c868;
    --path-observer: #e8a44a;
    --path-trans-vag: #e85d50;
    --path-trans-phal: #c64639;
    --path-intersex: #b0a888;

    --chart-0: #5b93c7;
    --chart-1: #d94f4f;
    --chart-2: #e8c868;
    --chart-3: #68b878;
    --chart-4: #e8a44a;
    --chart-5: #8bb8d9;
    --chart-6: #b889ff;
    --chart-7: #ff8a3a;
    --chart-8: #3cb44b;
    --chart-9: #e6beff;

    --scanline-opacity: 0;
    --vignette-opacity: 0;
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
  }

  /* ── VAPORWAVE THEME ── */
  [data-theme="vaporwave"][data-mode="dark"] {
    --c-bg: #000000;
    --c-bgSoft: #0a0a0a;
    --c-bgCard: #111111;
    --c-bgDeep: #000000;
    --c-text: #01cdfe;
    --c-textBright: #ffffff;
    --c-muted: #ff71ce;
    --c-dim: #b967ff;
    --c-ghost: #333333;
    --c-gold: #fffb96;
    --c-goldBright: #ffffff;
    --c-red: #ff71ce;
    --c-orange: #b967ff;
    --c-yellow: #fffb96;
    --c-green: #05ffa1;
    --c-ltBlue: #75faff;
    --c-blue: #01cdfe;
    --c-grey: #444444;
    --c-purple: #d896ff;

    --path-intact: #01cdfe;
    --path-circumcised: #ff71ce;
    --path-restoring: #fffb96;
    --path-observer: #05ffa1;

    --chart-0: #01cdfe;
    --chart-1: #ff71ce;
    --chart-2: #fffb96;
    --chart-3: #05ffa1;
    --chart-4: #b967ff;
    --chart-5: #ff9fcd;
    --chart-6: #75faff;
    --chart-7: #d896ff;
    --chart-8: #60efff;
    --chart-9: #ffbeec;
  }
  
  [data-theme="vaporwave"][data-mode="light"] {
    --c-bg: #fdfcff;
    --c-bgSoft: #f0e6ff;
    --c-bgCard: #ffffff;
    --c-bgDeep: #e5d4ff;
    --c-text: #ff71ce;
    --c-textBright: #01cdfe;
    --c-muted: #b967ff;
    --c-dim: #9b4dd6;
    --c-ghost: #d4c4ff;
    --c-gold: #fffb96;
    --c-goldBright: #05ffa1;
    --c-red: #ff71ce;
    --c-orange: #b967ff;
    --c-yellow: #fffb96;
    --c-green: #05ffa1;
    --c-ltBlue: #75faff;
    --c-blue: #01cdfe;
    --c-grey: #cccccc;
    --c-purple: #d896ff;

    --path-intact: #01cdfe;
    --path-circumcised: #ff71ce;
    --path-restoring: #fffb96;
    --path-observer: #05ffa1;

    --chart-0: #01cdfe;
    --chart-1: #ff71ce;
    --chart-2: #fffb96;
    --chart-3: #05ffa1;
    --chart-4: #b967ff;
    --chart-5: #ff9fcd;
    --chart-6: #75faff;
    --chart-7: #d896ff;
    --chart-8: #60efff;
    --chart-9: #ffbeec;
  }

  /* ── EVERGREEN THEME ── */
  [data-theme="evergreen"][data-mode="dark"] {
    --c-bg: #0b1c14;
    --c-bgSoft: #122b1f;
    --c-bgCard: #173828;
    --c-bgDeep: #060f0b;
    --c-text: #e2f0e9;
    --c-textBright: #ffffff;
    --c-muted: #8fb39f;
    --c-dim: #5c7a6a;
    --c-ghost: #26523c;
    --c-gold: #d4a030;
    --c-goldBright: #f2c75c;
    --c-red: #c44a3a;
    --c-orange: #d4a030;
    --c-yellow: #f2c75c;
    --c-green: #26523c;
    --c-ltBlue: #8fb39f;
    --c-blue: #5c7a6a;
    --c-grey: #2d4538;
    --c-purple: #b580d0;

    --path-intact: #8fb39f;
    --path-circumcised: #c44a3a;
    --path-restoring: #f2c75c;
    --path-observer: #d4a030;

    --chart-0: #2d5a27;
    --chart-1: #8fb39f;
    --chart-2: #d4a030;
    --chart-3: #38705d;
    --chart-4: #a87e18;
    --chart-5: #5c7a6a;
    --chart-6: #b8cc86;
    --chart-7: #d2a679;
    --chart-8: #2a52be;
    --chart-9: #c0d1c7;
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

    --path-intact: #5c7a6a;
    --path-circumcised: #a83a2c;
    --path-restoring: #d4a030;
    --path-observer: #a87e18;

    --chart-0: #2d5a27;
    --chart-1: #8fb39f;
    --chart-2: #d4a030;
    --chart-3: #38705d;
    --chart-4: #a87e18;
    --chart-5: #5c7a6a;
    --chart-6: #b8cc86;
    --chart-7: #d2a679;
    --chart-8: #2a52be;
    --chart-9: #c0d1c7;
  }

  /* ── OCEAN THEME ── */
  [data-theme="ocean"][data-mode="dark"] {
    --c-bg: #08141b;
    --c-bgSoft: #0d222e;
    --c-bgCard: #112e3f;
    --c-bgDeep: #040a0e;
    --c-text: #e0f2fe;
    --c-textBright: #ffffff;
    --c-muted: #7dd3fc;
    --c-dim: #38bdf8;
    --c-ghost: #1e475e;
    --c-gold: #22d3ee;
    --c-goldBright: #67e8f9;
    --c-red: #f43f5e;
    --c-orange: #f59e0b;
    --c-yellow: #22d3ee;
    --c-green: #10b981;
    --c-ltBlue: #7dd3fc;
    --c-blue: #0284c7;
    --c-grey: #1f3c4d;
    --c-purple: #8b5cf6;

    --path-intact: #22d3ee;
    --path-circumcised: #f43f5e;
    --path-restoring: #f59e0b;
    --path-observer: #10b981;

    --chart-0: #0284c7;
    --chart-1: #f43f5e;
    --chart-2: #0ea5e9;
    --chart-3: #10b981;
    --chart-4: #f59e0b;
    --chart-5: #8b5cf6;
    --chart-6: #06b6d4;
    --chart-7: #6366f1;
    --chart-8: #ec4899;
    --chart-9: #14b8a6;
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

    --path-intact: #06b6d4;
    --path-circumcised: #e11d48;
    --path-restoring: #d97706;
    --path-observer: #059669;

    --chart-0: #0284c7;
    --chart-1: #f43f5e;
    --chart-2: #0ea5e9;
    --chart-3: #10b981;
    --chart-4: #f59e0b;
    --chart-5: #8b5cf6;
    --chart-6: #06b6d4;
    --chart-7: #6366f1;
    --chart-8: #ec4899;
    --chart-9: #14b8a6;
  }

  /* ── 1980s CRT & PBS MOCKUP THEMES ── */
  
  [data-theme="phosphor"] {
    --c-bg: #0a0e0a;
    --c-bgSoft: #111714;
    --c-bgCard: #111714;
    --c-bgDeep: #050705;
    --c-text: #6e9a68;
    --c-textBright: #c8f0c0;
    --c-muted: #5e8458;
    --c-dim: #4e6e48;
    --c-ghost: #2a3a28;
    --c-gold: #7fe07f;
    --c-goldBright: #7fe07f;
    --c-red: #ff3b8a;
    --c-orange: #ffb000;
    --c-yellow: #ffb000;
    --c-green: #7fe07f;
    --c-ltBlue: #5dd2ff;
    --c-blue: #5dd2ff;
    --c-grey: #6e9a68;
    --c-purple: #b889ff;

    --path-intact: #5dd2ff;
    --path-circumcised: #ff3b8a;
    --path-restoring: #b889ff;
    --path-observer: #ffb000;
    
    --chart-0: #7fe07f;
    --chart-1: #50b050;
    --chart-2: #a8f0a8;
    --chart-3: #308030;
    --chart-4: #c8f0c0;
    --chart-5: #1e501e;
    --chart-6: #6e9a68;
    --chart-7: #4e6e48;
    --chart-8: #88ff88;
    --chart-9: #2a3a28;

    --f-display: 'Space Grotesk', sans-serif;
    --f-body: 'Space Grotesk', sans-serif;
    --f-condensed: 'VT323', monospace;

    --scanline-opacity: 0.18;
    --vignette-opacity: 0.45;
  }

  [data-theme="amber"] {
    --c-bg: #14100a;
    --c-bgSoft: #1a160e;
    --c-bgCard: #1a160e;
    --c-bgDeep: #0a0805;
    --c-text: #a07c44;
    --c-textBright: #f0d8a0;
    --c-muted: #8c6a38;
    --c-dim: #6c522b;
    --c-ghost: #3a2e16;
    --c-gold: #ffb84d;
    --c-goldBright: #ffb84d;
    --c-red: #ff5e3a;
    --c-orange: #ffd86b;
    --c-yellow: #ffd86b;
    --c-green: #ffd86b;
    --c-ltBlue: #ffa040;
    --c-blue: #ffa040;
    --c-grey: #a07c44;
    --c-purple: #d8a0ff;

    --path-intact: #ffa040;
    --path-circumcised: #ff5e3a;
    --path-restoring: #ff8a3a;
    --path-observer: #ffd86b;

    --chart-0: #ffb84d;
    --chart-1: #cc8822;
    --chart-2: #ffd86b;
    --chart-3: #995500;
    --chart-4: #f0d8a0;
    --chart-5: #663300;
    --chart-6: #a07c44;
    --chart-7: #8c6a38;
    --chart-8: #ffa040;
    --chart-9: #3a2e16;

    --f-display: 'Space Grotesk', sans-serif;
    --f-body: 'Space Grotesk', sans-serif;
    --f-condensed: 'VT323', monospace;

    --scanline-opacity: 0.18;
    --vignette-opacity: 0.45;
  }

  [data-theme="pbs"] {
    --c-bg: #f3e9d2;
    --c-bgSoft: #ece1c4;
    --c-bgCard: #ffffff;
    --c-bgDeep: #dfd5b8;
    --c-text: #4a3a26;
    --c-textBright: #1a1410;
    --c-muted: #6b583e;
    --c-dim: #8b775c;
    --c-ghost: #c8b893;
    --c-gold: #c43a2e;
    --c-goldBright: #c43a2e;
    --c-red: #c43a2e;
    --c-orange: #ee9938;
    --c-yellow: #ee9938;
    --c-green: #2b8c5a;
    --c-ltBlue: #1652a8;
    --c-blue: #1652a8;
    --c-grey: #8a7c64;
    --c-purple: #6a3aa8;

    --path-intact: #1652a8;
    --path-circumcised: #c43a2e;
    --path-restoring: #6a3aa8;
    --path-observer: #ee9938;

    --chart-0: #1652a8;
    --chart-1: #c43a2e;
    --chart-2: #ee9938;
    --chart-3: #2b8c5a;
    --chart-4: #6a3aa8;
    --chart-5: #dfd5b8;
    --chart-6: #4a3a26;
    --chart-7: #8a7c64;
    --chart-8: #df738b;
    --chart-9: #5793a8;

    --f-display: 'Space Grotesk', sans-serif;
    --f-body: 'Space Grotesk', sans-serif;
    --f-condensed: 'VT323', monospace;

    --scanline-opacity: 0.05;
    --vignette-opacity: 0;
  }

  [data-theme="paper"] {
    --c-bg: #f6f4ee;
    --c-bgSoft: #ebe7dc;
    --c-bgCard: #ffffff;
    --c-bgDeep: #ded9ca;
    --c-text: #65604f;
    --c-textBright: #14110d;
    --c-muted: #7e7865;
    --c-dim: #99937f;
    --c-ghost: #d4ccb8;
    --c-gold: #14110d;
    --c-goldBright: #14110d;
    --c-red: #c43a2e;
    --c-orange: #c08a2e;
    --c-yellow: #c08a2e;
    --c-green: #2a5e8a;
    --c-ltBlue: #2a5e8a;
    --c-blue: #2a5e8a;
    --c-grey: #807a68;
    --c-purple: #5a3a8c;

    --path-intact: #2a5e8a;
    --path-circumcised: #c43a2e;
    --path-restoring: #5a3a8c;
    --path-observer: #c08a2e;

    --chart-0: #2a5e8a;
    --chart-1: #c43a2e;
    --chart-2: #c08a2e;
    --chart-3: #2b7a5a;
    --chart-4: #5a3a8c;
    --chart-5: #65604f;
    --chart-6: #9e7a5a;
    --chart-7: #807a68;
    --chart-8: #b3527a;
    --chart-9: #4a6873;

    --f-display: 'Space Grotesk', sans-serif;
    --f-body: 'Space Grotesk', sans-serif;
    --f-condensed: 'VT323', monospace;

    --scanline-opacity: 0;
    --vignette-opacity: 0;
  }

  [data-theme="mono"] {
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

    --path-intact: #ffffff;
    --path-circumcised: #ffffff;
    --path-restoring: #ffffff;
    --path-observer: #ffffff;

    --chart-0: #f4f4f4;
    --chart-1: #444444;
    --chart-2: #8a8a8a;
    --chart-3: #c0c0c0;
    --chart-4: #222222;
    --chart-5: #666666;
    --chart-6: #e0e0e0;
    --chart-7: #555555;
    --chart-8: #999999;
    --chart-9: #111111;

    --f-display: 'Space Grotesk', sans-serif;
    --f-body: 'Space Grotesk', sans-serif;
    --f-condensed: 'VT323', monospace;

    --scanline-opacity: 0.10;
    --vignette-opacity: 0.45;
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

    --chart-0: #56b4e9; /* Sky Blue */
    --chart-1: #d55e00; /* Vermillion */
    --chart-2: #f0e442; /* Yellow */
    --chart-3: #009e73; /* Bluish Green */
    --chart-4: #cc79a7; /* Reddish Purple */
    --chart-5: #0072b2; /* Blue */
    --chart-6: #e69f00; /* Orange */
    --chart-7: #999999; /* Grey */
    --chart-8: #359b52; /* Green */
    --chart-9: #e6beff; /* Lavender */
  }

  /* ── DYSLEXIC FONT OVERRIDE ── */
  [data-dyslexic="true"] {
    --f-display: 'Lexend', sans-serif;
    --f-body: 'Lexend', sans-serif;
    --f-condensed: 'Lexend', sans-serif;
  }
  
  /* ── FRODO THEME (Amiga/C64 Easter Egg) ── */
  [data-theme="frodo"] {
    --c-bg: #4040E0;
    --c-bgSoft: #4040E0;
    --c-bgCard: #4040E0;
    --c-bgDeep: #4040E0;
    --c-text: #A0A0FF;
    --c-textBright: #FFFFFF;
    --c-muted: #A0A0FF;
    --c-dim: #A0A0FF;
    --c-ghost: #A0A0FF;
    --c-gold: #FFFFFF;
    --c-goldBright: #FFFFFF;
    
    --chart-0: #FFFFFF;
    --chart-1: #A0A0FF;
    --chart-2: #000000;
    --chart-3: #5050C0;
    --chart-4: #FFFFFF;
    --chart-5: #A0A0FF;
    --chart-6: #000000;
    --chart-7: #5050C0;
    --chart-8: #FFFFFF;
    --chart-9: #A0A0FF;
    
    --f-display: 'JetBrains Mono', monospace !important;
    --f-body: 'JetBrains Mono', monospace !important;
    --f-condensed: 'JetBrains Mono', monospace !important;
  }

  [data-theme="frodo"] body {
    border: 4px solid #A0A0FF;
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
`;

export function resolveCssColor(varStr) {
  if (typeof window === "undefined") return "#888888";
  const match = String(varStr).match(/var\(([^)]+)\)/);
  if (match) {
    const varName = match[1];
    const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (val) return val;
  }
  if (typeof varStr === "string" && (varStr.startsWith("#") || varStr.startsWith("rgb") || varStr.startsWith("hsl"))) {
    return varStr;
  }
  return "#888888";
}

