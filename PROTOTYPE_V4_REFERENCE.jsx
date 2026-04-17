<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CircumSurvey — Motif Hybrid: Tomorrow's Bureau</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Outfit:wght@200;300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700;800&family=Barlow+Condensed:wght@400;500;600;700;800&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: #0a0a0c;
  color: #eee;
  font-family: 'Outfit', sans-serif;
}

/* ═══ HEADER ═══ */
.page-header {
  text-align: center;
  padding: 3.5rem 2rem;
  border-bottom: 1px solid #222;
}
.page-header .rainbow {
  height: 5px;
  background: linear-gradient(90deg, #e85d50, #f09860, #f0c840, #68b878, #5888c0);
  width: 200px;
  margin: 0 auto 1.5rem;
  border-radius: 3px;
}
.page-header h1 {
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 700;
  font-size: 2.2rem;
  color: #f09860;
  letter-spacing: 0.04em;
  margin-bottom: 0.25rem;
}
.page-header .sub {
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 300;
  font-style: italic;
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 0.75rem;
}
.page-header .desc {
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  font-size: 0.78rem;
  color: #555;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ═══ CONTAINER ═══ */
.showcase {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.section-label {
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 600;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #f09860;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, #f09860 0%, transparent 100%);
}

/* ═══════════════════════════════════════════
   THE HYBRID CARD
   Tomorrow's Bureau
   ═══════════════════════════════════════════ */
.bureau-card {
  background: #faf6f0;
  border: 2.5px solid #2a2622;
  border-radius: 3px;
  position: relative;
  overflow: visible;
  margin-bottom: 2.5rem;
  box-shadow: 0 3px 15px rgba(0,0,0,0.2);
}

/* Rainbow top bar */
.bureau-card .rainbow-bar {
  height: 5px;
  background: linear-gradient(90deg, #e85d50, #f09860, #f0c840, #68b878, #5888c0);
}

/* Corner star */
.bureau-card .corner-star {
  position: absolute;
  top: -11px;
  left: 24px;
  font-size: 1.1rem;
  color: #e85d50;
  background: #0a0a0c;
  padding: 0 0.35rem;
  line-height: 1;
}

/* Black header bar */
.bureau-card .header-bar {
  background: #2a2622;
  color: #faf6f0;
  padding: 0.55rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bureau-card .header-bar .bar-title {
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 700;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.bureau-card .header-bar .bar-title .star {
  color: #e85d50;
  font-size: 0.85rem;
}

.bureau-card .header-bar .bar-ref {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.5rem;
  color: #888;
  letter-spacing: 0.05em;
}

/* Card body */
.bureau-card .card-body {
  padding: 1.75rem 1.5rem;
}

/* Form field */
.form-field {
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed #d4cfc4;
}

.form-field:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.field-label {
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 600;
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #f09860;
  margin-bottom: 0.3rem;
}

.field-question {
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 500;
  font-size: 1.05rem;
  color: #2a2622;
  line-height: 1.35;
  margin-bottom: 0.4rem;
}

.field-body {
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  font-size: 0.78rem;
  color: #5a5a52;
  line-height: 1.6;
  text-align: justify;
  text-justify: inter-word;
}

/* Ruled data rows */
.data-table {
  margin-top: 0.5rem;
}

.data-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.45rem 0;
  border-bottom: 1px solid #e8e2d8;
}

.data-row:last-child {
  border-bottom: none;
}

.data-row .pathway-label {
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 600;
  font-size: 0.72rem;
  color: #2a2622;
  width: 140px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.data-row .dotted-fill {
  flex: 1;
  border-bottom: 2px dotted #ccc4b8;
  margin-bottom: 3px;
  min-width: 20px;
}

.data-row .data-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.data-row.total-row {
  border-top: 2px solid #2a2622;
  border-bottom: 2px solid #2a2622;
  margin-top: 0.25rem;
  padding-top: 0.5rem;
}

.data-row.total-row .pathway-label {
  font-weight: 700;
}

.data-row.total-row .data-value {
  font-size: 1.05rem;
}

/* Arrow notes */
.arrow-note {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.58rem;
  color: #999;
  margin-top: 0.75rem;
  line-height: 1.6;
}

.arrow-note .arrow {
  color: #f09860;
  font-weight: 700;
}

/* Stamp */
.bureau-card .stamp {
  position: absolute;
  bottom: 14px;
  right: 18px;
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 700;
  font-size: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #e85d50;
  border: 2px solid #e85d50;
  padding: 0.2rem 0.45rem;
  transform: rotate(-4deg);
  opacity: 0.6;
  border-radius: 2px;
}

/* ═══ PIE + CONTENT LAYOUT ═══ */
.card-layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.card-chart {
  width: 155px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.card-content-right {
  flex: 1;
  min-width: 220px;
}

/* Pathway chips */
.pathway-chips {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.pathway-chip {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 0.55rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.02em;
}

.pathway-chip.active {
  transform: scale(1.05);
}

/* Fun stat callout */
.stat-callout {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #f0ece4;
  border-radius: 10px;
  border-left: 4px solid;
}

.stat-callout .big-num {
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 700;
  font-size: 2rem;
  line-height: 1;
}

.stat-callout .stat-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  font-size: 0.72rem;
  color: #5a5a52;
  line-height: 1.4;
}

/* ═══ QUOTE GALLERY ═══ */
.voices-section {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px dashed #d4cfc4;
}

.voices-label {
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 600;
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #f09860;
  margin-bottom: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.voices-label .star { color: #e85d50; }

.quote-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.6rem;
}

.quote-card {
  padding: 0.65rem 0.85rem;
  border-radius: 6px;
  border-left: 3px solid;
}

.quote-card .quote-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  font-style: italic;
  font-size: 0.72rem;
  line-height: 1.5;
  color: #3a3a35;
  margin-bottom: 0.35rem;
}

.quote-card .quote-attrib {
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 600;
  font-size: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.voices-disclaimer {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.5rem;
  color: #aaa;
  margin-top: 0.5rem;
}

/* ═══ MIRROR CARD ═══ */
.mirror-inner {
  display: flex;
  gap: 0;
  flex-wrap: wrap;
}

.mirror-side {
  flex: 1;
  min-width: 240px;
  padding: 1.5rem;
}

.mirror-side:first-child {
  border-right: 1px dashed #d4cfc4;
}

.mirror-side .side-pathway {
  font-family: 'Josefin Sans', sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  margin-bottom: 0.15rem;
}

.mirror-side .side-question {
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  font-size: 0.72rem;
  color: #7a7a72;
  font-style: italic;
  margin-bottom: 0.6rem;
  line-height: 1.4;
}

.mirror-bar-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.3rem;
}

.mirror-bar-row .bar-container {
  flex: 1;
  height: 14px;
  background: #eae4da;
  border-radius: 3px;
  overflow: hidden;
}

.mirror-bar-row .bar-fill {
  height: 100%;
  border-radius: 3px;
  display: flex;
  align-items: center;
  padding-left: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.48rem;
  font-weight: 700;
  color: rgba(255,255,255,0.8);
  transition: width 0.5s;
}

.mirror-bar-row .bar-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.6rem;
  color: #7a7a72;
  width: 85px;
  flex-shrink: 0;
}

.mirror-bar-row .bar-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  font-weight: 700;
  color: #2a2622;
  width: 32px;
  text-align: right;
  flex-shrink: 0;
}

/* ═══ CALLOUT BOX ═══ */
.language-note {
  margin: 0 1.5rem 0 1.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(240,152,96,0.08);
  border-left: 3px solid #f09860;
  border-radius: 0 4px 4px 0;
  font-family: 'Outfit', sans-serif;
  font-size: 0.65rem;
  font-style: italic;
  color: #8a7a62;
  line-height: 1.5;
}

.language-note strong {
  color: #f09860;
  font-weight: 600;
  font-style: normal;
}

</style>
</head>
<body>

<!-- ═══ PAGE HEADER ═══ -->
<div class="page-header">
  <div class="rainbow"></div>
  <h1>Tomorrow's Bureau</h1>
  <div class="sub">The hybrid you asked for — Hello Tomorrow meets The Bureau</div>
  <div class="desc">Mid-century optimistic geometry with ruled-form structure. Josefin Sans headlines, dotted leader fills, red stars, rainbow accents, and the warmth of a future that believes in documenting the truth.</div>
</div>

<div class="showcase">

<!-- ═══ SAMPLE 1: STANDARD QUESTION CARD ═══ -->
<div class="section-label">Standard Question Card — Pie Chart + Ruled Data</div>

<div class="bureau-card">
  <div class="rainbow-bar"></div>
  <div class="corner-star">★</div>
  <div class="header-bar">
    <div class="bar-title"><span class="star">★</span> Sexual Experience Assessment</div>
    <div class="bar-ref">FORM CS-057 · PHASE 1 · N = 496</div>
  </div>
  <div class="card-body">
    <div class="card-layout">
      <div class="card-chart">
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="65" fill="#e8e2d8"/>
          <path d="M75,75 L75,10 A65,65 0 0,1 137,97Z" fill="#e85d50"/>
          <path d="M75,75 L137,97 A65,65 0 0,1 42,133Z" fill="#f0c840"/>
          <path d="M75,75 L42,133 A65,65 0 0,1 75,10Z" fill="#5888c0"/>
          <circle cx="75" cy="75" r="28" fill="#faf6f0"/>
          <text x="75" y="72" text-anchor="middle" font-family="Josefin Sans" font-size="9" font-weight="600" fill="#2a2622">SHOWING</text>
          <text x="75" y="84" text-anchor="middle" font-family="Josefin Sans" font-size="7" font-weight="400" fill="#999">🔵 Circumcised</text>
        </svg>
        <div class="pathway-chips">
          <span class="pathway-chip active" style="background:rgba(232,93,80,0.15); color:#e85d50; border:1.5px solid #e85d50;">🔵 Circ</span>
          <span class="pathway-chip" style="background:transparent; color:#999; border:1px solid #ddd;">🟢 Intact</span>
          <span class="pathway-chip" style="background:transparent; color:#999; border:1px solid #ddd;">🟣 Restoring</span>
        </div>
      </div>
      <div class="card-content-right">
        <div class="form-field">
          <div class="field-label">Question Designation</div>
          <div class="field-question">How confident are you that your orgasms are as good as they could be?</div>
        </div>

        <div class="form-field">
          <div class="field-label">Response Distribution — 🔵 The Circumcised Pathway (n = 210)</div>
          <div class="data-table">
            <div class="data-row">
              <span class="pathway-label">Not at all — missing</span>
              <span class="dotted-fill"></span>
              <span class="data-value" style="color:#e85d50">48.2%</span>
            </div>
            <div class="data-row">
              <span class="pathway-label">Moderately</span>
              <span class="dotted-fill"></span>
              <span class="data-value" style="color:#2a2622">23.6%</span>
            </div>
            <div class="data-row">
              <span class="pathway-label">Depends on situation</span>
              <span class="dotted-fill"></span>
              <span class="data-value" style="color:#2a2622">5.5%</span>
            </div>
            <div class="data-row">
              <span class="pathway-label">Confident</span>
              <span class="dotted-fill"></span>
              <span class="data-value" style="color:#2a2622">16.1%</span>
            </div>
            <div class="data-row">
              <span class="pathway-label">Extremely confident</span>
              <span class="dotted-fill"></span>
              <span class="data-value" style="color:#2a2622">6.5%</span>
            </div>
          </div>
        </div>

        <div class="arrow-note">
          <span class="arrow">→</span> Compare: Intact Pathway reports only 4.5% "something is missing"<br>
          <span class="arrow">→</span> Restoration Pathway: 59.6% — awareness increases through restoration<br>
          <span class="arrow">→</span> Toggle pathways to see each distribution
        </div>
      </div>
    </div>
  </div>
  <div class="stamp">Preliminary</div>
</div>

<!-- ═══ SAMPLE 2: THE SYSTEMIC FAILURE ═══ -->
<div class="section-label">Data-Only Card — Ruled Form Style</div>

<div class="bureau-card">
  <div class="rainbow-bar"></div>
  <div class="corner-star">★</div>
  <div class="header-bar">
    <div class="bar-title"><span class="star">★</span> Decision & Consent Assessment</div>
    <div class="bar-ref">FORM CS-095 · 🔵 CIRCUMCISED PATHWAY ONLY</div>
  </div>
  <div class="card-body">
    <div class="form-field">
      <div class="field-label">Question Designation</div>
      <div class="field-question">How was circumcision handled around the time of your birth?</div>
      <div class="field-body">Respondents were asked to characterize how the procedure was presented by the medical establishment to their parents.</div>
    </div>

    <div class="form-field">
      <div class="field-label">Response Distribution — 🔵 The Circumcised Pathway (n = 185)</div>
      <div class="data-table">
        <div class="data-row">
          <span class="pathway-label">Routine / automatic</span>
          <span class="dotted-fill"></span>
          <span class="data-value" style="color:#e85d50">47.6%</span>
        </div>
        <div class="data-row">
          <span class="pathway-label">No idea</span>
          <span class="dotted-fill"></span>
          <span class="data-value" style="color:#999">23.2%</span>
        </div>
        <div class="data-row">
          <span class="pathway-label">Strong medical rec.</span>
          <span class="dotted-fill"></span>
          <span class="data-value" style="color:#f09860">18.9%</span>
        </div>
        <div class="data-row">
          <span class="pathway-label">Not brought up</span>
          <span class="dotted-fill"></span>
          <span class="data-value" style="color:#2a2622">7.6%</span>
        </div>
        <div class="data-row">
          <span class="pathway-label">Neutral pros & cons</span>
          <span class="dotted-fill"></span>
          <span class="data-value" style="color:#5888c0">2.7%</span>
        </div>
      </div>
    </div>

    <div class="stat-callout" style="border-left-color:#e85d50">
      <div class="big-num" style="color:#e85d50">2.7%</div>
      <div class="stat-text">of circumcised respondents report that the procedure was presented as a neutral choice with pros and cons. The remaining 97.3% describe a spectrum from automatic default to uninformed acceptance.</div>
    </div>

    <div class="arrow-note">
      <span class="arrow">→</span> Combined "routine" + "no idea" = 70.8% — seven in ten had no meaningful decision process<br>
      <span class="arrow">→</span> This is the systemic failure: not parental ignorance, but institutional default
    </div>
  </div>
  <div class="stamp">Phase 1</div>
</div>

<!-- ═══ SAMPLE 3: MIRROR CARD ═══ -->
<div class="section-label">Mirror Comparison Card — Side by Side</div>

<div class="bureau-card">
  <div class="rainbow-bar"></div>
  <div class="corner-star">★</div>
  <div class="header-bar">
    <div class="bar-title"><span class="star">★</span> Mirror Comparison · Resentment vs Regret</div>
    <div class="bar-ref">PARALLEL QUESTION PAIR</div>
  </div>

  <div class="language-note">
    <strong>★ Language note:</strong> We use "resentment" for the Circumcised Pathway because the procedure was performed without their agency. We use "regret" for the Intact Pathway because that is the word that could meaningfully apply to a state they grew into. This distinction was shaped by community feedback.
  </div>

  <div class="mirror-inner">
    <div class="mirror-side" style="background:rgba(232,93,80,0.03)">
      <div class="side-pathway" style="color:#e85d50">🔵 The Circumcised Pathway</div>
      <div class="side-question">Have you experienced resentment, loss, anger, or grief about your circumcision?</div>

      <div class="mirror-bar-row">
        <div class="bar-container"><div class="bar-fill" style="width:54.6%; background:#e85d50">55%</div></div>
        <div class="bar-label">Strong & frequent</div>
        <div class="bar-value">54.6%</div>
      </div>
      <div class="mirror-bar-row">
        <div class="bar-container"><div class="bar-fill" style="width:16.1%; background:#f09860"></div></div>
        <div class="bar-label">Sometimes</div>
        <div class="bar-value">16.1%</div>
      </div>
      <div class="mirror-bar-row">
        <div class="bar-container"><div class="bar-fill" style="width:8.3%; background:#f0c840"></div></div>
        <div class="bar-label">Rarely</div>
        <div class="bar-value">8.3%</div>
      </div>
      <div class="mirror-bar-row">
        <div class="bar-container"><div class="bar-fill" style="width:21%; background:#5888c0"></div></div>
        <div class="bar-label">No, never</div>
        <div class="bar-value">21.0%</div>
      </div>
    </div>

    <div class="mirror-side" style="background:rgba(88,136,192,0.03)">
      <div class="side-pathway" style="color:#5888c0">🟢 The Intact Pathway</div>
      <div class="side-question">Have you ever wished you were circumcised, or felt regret about being intact?</div>

      <div class="mirror-bar-row">
        <div class="bar-container"><div class="bar-fill" style="width:8.6%; background:#e85d50"></div></div>
        <div class="bar-label">Strong & frequent</div>
        <div class="bar-value">8.6%</div>
      </div>
      <div class="mirror-bar-row">
        <div class="bar-container"><div class="bar-fill" style="width:11.5%; background:#f09860"></div></div>
        <div class="bar-label">Sometimes</div>
        <div class="bar-value">11.5%</div>
      </div>
      <div class="mirror-bar-row">
        <div class="bar-container"><div class="bar-fill" style="width:18%; background:#f0c840"></div></div>
        <div class="bar-label">Rarely</div>
        <div class="bar-value">18.0%</div>
      </div>
      <div class="mirror-bar-row">
        <div class="bar-container"><div class="bar-fill" style="width:61.9%; background:#5888c0">62%</div></div>
        <div class="bar-label">No, never</div>
        <div class="bar-value">61.9%</div>
      </div>
    </div>
  </div>

  <!-- Quotes below mirror -->
  <div class="card-body">
    <div class="voices-section" style="border-top:none; padding-top:0;">
      <div class="voices-label"><span class="star">★</span> Voices from the Survey</div>
      <div class="quote-grid">
        <div class="quote-card" style="background:rgba(232,93,80,0.06); border-left-color:#e85d50;">
          <div class="quote-text">"Pain. Loss of pleasure. Loss of confidence. Loss of trust. Self hatred. Depression."</div>
          <div class="quote-attrib" style="color:#e85d50">— Circumcised Pathway · On drawbacks</div>
        </div>
        <div class="quote-card" style="background:rgba(232,93,80,0.06); border-left-color:#e85d50;">
          <div class="quote-text">"I, at 57 years old, have never had a normal intimate relationship... the mutilation is always there."</div>
          <div class="quote-attrib" style="color:#e85d50">— Circumcised Pathway · On lifelong impact</div>
        </div>
        <div class="quote-card" style="background:rgba(88,136,192,0.06); border-left-color:#5888c0;">
          <div class="quote-text">"In childhood and through college I was self conscious because all my friends were cut and I only knew one other kid who was uncut."</div>
          <div class="quote-attrib" style="color:#5888c0">— Intact Pathway · On adolescent pressure</div>
        </div>
        <div class="quote-card" style="background:rgba(88,136,192,0.06); border-left-color:#5888c0;">
          <div class="quote-text">"Only as a teen/young adult due to stigma arising from movies, pop culture, etc."</div>
          <div class="quote-attrib" style="color:#5888c0">— Intact Pathway · On the source of regret</div>
        </div>
      </div>
      <div class="voices-disclaimer">★ Anonymous quotes selected from open-ended responses. All identifying details removed.</div>
    </div>
  </div>
  <div class="stamp">Mirror</div>
</div>

<!-- ═══ SAMPLE 4: HERO / INTRO SECTION ═══ -->
<div class="section-label">Hero Section — Site Entry Point</div>

<div class="bureau-card" style="border-width:3px">
  <div class="rainbow-bar" style="height:6px"></div>
  <div class="corner-star" style="font-size:1.3rem; top:-13px;">★</div>
  <div class="header-bar" style="padding:0.7rem 1.5rem;">
    <div class="bar-title" style="font-size:0.75rem;"><span class="star" style="font-size:1rem;">★</span> The Accidental Intactivist's Inquiry</div>
    <div class="bar-ref" style="font-size:0.55rem;">PHASE 1 · PRELIMINARY FINDINGS · circumsurvey.online</div>
  </div>
  <div class="card-body" style="text-align:center; padding:2.5rem 2rem;">
    <div style="font-family:'Josefin Sans',sans-serif; font-weight:700; font-size:clamp(1.6rem,4vw,2.4rem); color:#2a2622; letter-spacing:0.03em; margin-bottom:0.3rem;">
      Six Pathways. 496 Voices.
    </div>
    <div style="font-family:'Josefin Sans',sans-serif; font-weight:300; font-style:italic; font-size:1rem; color:#888; margin-bottom:1.25rem;">
      What if someone actually asked how you felt?
    </div>
    <div style="font-family:'Outfit',sans-serif; font-weight:300; font-size:0.82rem; color:#5a5a52; line-height:1.6; max-width:480px; margin:0 auto 1.5rem; text-align:justify;">
      This is the interactive data explorer for the largest comparative survey of intact, circumcised, and restoring populations ever assembled from lived experience. Browse the findings. Toggle between pathways. See mirror questions side by side. Read voices from the survey itself. The data speaks for itself.
    </div>

    <div style="display:flex; justify-content:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.5rem;">
      <span class="pathway-chip active" style="background:rgba(88,136,192,0.12); color:#5888c0; border:1.5px solid rgba(88,136,192,0.4); font-size:0.6rem; padding:0.25rem 0.7rem;">🟢 Intact n=140</span>
      <span class="pathway-chip active" style="background:rgba(232,93,80,0.12); color:#e85d50; border:1.5px solid rgba(232,93,80,0.4); font-size:0.6rem; padding:0.25rem 0.7rem;">🔵 Circumcised n=210</span>
      <span class="pathway-chip active" style="background:rgba(240,200,64,0.12); color:#c8a020; border:1.5px solid rgba(240,200,64,0.4); font-size:0.6rem; padding:0.25rem 0.7rem;">🟣 Restoring n=109</span>
      <span class="pathway-chip active" style="background:rgba(150,150,150,0.12); color:#888; border:1.5px solid rgba(150,150,150,0.4); font-size:0.6rem; padding:0.25rem 0.7rem;">🟠 Observer n=37</span>
    </div>

    <div style="font-family:'Outfit',sans-serif; font-weight:300; font-style:italic; font-size:0.72rem; color:#f09860; max-width:420px; margin:0 auto;">
      "This inquiry began with a simple observation: as someone who grew up intact in the United States, I realized I had never heard anyone discuss how they actually felt about their circumcision status as adults. So I asked."
    </div>
  </div>
</div>

</div>

<!-- FOOTER -->
<div style="text-align:center; padding:2.5rem 2rem; border-top:1px solid #222;">
  <div style="height:4px; background:linear-gradient(90deg, #e85d50, #f09860, #f0c840, #68b878, #5888c0); width:120px; margin:0 auto 1rem; border-radius:2px;"></div>
  <p style="font-family:'Josefin Sans',sans-serif; font-weight:600; font-size:0.85rem; color:#f09860; margin-bottom:0.3rem">Tomorrow's Bureau</p>
  <p style="font-family:'Outfit',sans-serif; font-weight:300; font-size:0.72rem; color:#555; max-width:400px; margin:0 auto; line-height:1.55;">
    Hello Tomorrow's optimistic geometry and warm palette, structured through The Bureau's ruled forms, dotted leaders, red stars, and classified-document authority.
  </p>
</div>

</body>
</html>
