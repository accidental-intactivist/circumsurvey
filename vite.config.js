/* ═══════════════════════════════════════════
   Tomorrow's Bureau — Global Design System
   CircumSurvey Findings Site
   ═══════════════════════════════════════════ */

:root {
  /* Editorial palette (cream sections) */
  --cream: #faf6f0;
  --cream-dark: #f0ece4;
  --cream-border: #e8e2d8;
  --cream-rule: #d4cfc4;
  --text-dark: #2a2622;
  --text-body: #5a5a52;
  --text-muted: #999;

  /* Bureau palette (dark sections) */
  --bureau-bg: #0e0e10;
  --bureau-card: #18181c;
  --bureau-border: #222228;
  --bureau-text: #eeeef0;
  --bureau-text-sec: #8a8a96;

  /* Accent colors */
  --star-red: #e85d50;
  --warm-orange: #f09860;
  --sunny-yellow: #f0c840;
  --fresh-green: #68b878;
  --calm-blue: #5888c0;
  --gold: #d4a030;

  /* Pathway colors (data visualizations only) */
  --pathway-intact: #5888c0;
  --pathway-circumcised: #e85d50;
  --pathway-restoring: #f0c840;
  --pathway-observer: #a0a0a0;
  --pathway-born-circ: #cc6855;

  /* Rainbow gradient */
  --rainbow: linear-gradient(90deg, var(--star-red), var(--warm-orange), var(--sunny-yellow), var(--fresh-green), var(--calm-blue));

  /* Typography */
  --font-display: 'Josefin Sans', sans-serif;
  --font-body: 'Outfit', sans-serif;
  --font-data: 'JetBrains Mono', monospace;
  --font-label: 'Barlow Condensed', sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  font-weight: 300;
  background: var(--cream);
  color: var(--text-dark);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar styling for dark sections */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
