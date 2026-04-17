# CircumSurvey Preliminary Results Site
## Website Design Plan — v1.0

**Project:** The Accidental Intactivist's Inquiry — Phase 1 Data Explorer
**Author:** Tone Pettit, with architectural consultation from Claude (Anthropic)
**Date:** April 2026
**Status:** Pre-Summit Draft — Intact Global Summit, Los Angeles

---

## 1. Vision & Design Philosophy

### 1.1 The Aspiration

This site will be the gold standard for comparative survey data dissemination — a platform where 496 voices (and growing) are presented with the rigor of academic research, the accessibility of modern data journalism, and the emotional resonance of the stories that numbers alone can't tell.

No other survey project in the intactivist space — or in the broader landscape of bodily autonomy research — has attempted this level of interactive, explorable, ethically transparent data exposure. We are not building a static report. We are building a living instrument.

### 1.2 Core Design Principles

**Data-first, interpretation-optional.** Every visualization leads with what was asked and what was answered. Editorial context is always available but never imposed. The data speaks for itself — and when it does, it speaks volumes.

**Pathway-native architecture.** The survey has six distinct pathways (🟢 Intact, 🔵 Circumcised, 🟣 Restoring, 🟠 Observer/Partner/Ally, 🔴 Trans, ⚪ Intersex). The site's entire vocabulary, navigation, and data structure mirrors this. Users don't "filter by cohort" — they "follow a pathway."

**Radical transparency.** The methodology, limitations, ethical framework, and the author's perspective are always one click away. We acknowledge bias in perspective while demonstrating rigor in methodology. The FAQ's framing — "We are not telling people how to feel. We are creating a platform for them to anonymously share how they actually feel" — is the site's thesis statement.

**Ethical data stewardship.** Anonymity is sacred. Qualitative responses are curated, never bulk-exposed. Quantitative data is explorable at aggregate level. The line between "empowering voices" and "exposing individuals" is drawn with care and explained to visitors.

**Enrolling, not alienating.** The site must be as welcoming to a satisfied circumcised man considering taking the survey as it is to an intactivist preparing legal arguments. Design choices, language, and visual tone all serve this dual mandate.

### 1.3 Brand Identity

The site operates within circumsurvey.online's established visual language:

- **Editorial sections:** Warm cream (#faf8f4), deep teal headings (#1a5c3a), warm amber/gold accents (#d4a030)
- **Data sections:** Black backgrounds (#0f0f0f) with the colorblind-friendly data palette
- **Data palette:** Red (#d94f4f) for Circumcised, Yellow (#e8c868) for Restoring, Blue (#5b93c7) for Intact, Grey (#a0a0a0) for Observer — validated for colorblind accessibility after community feedback
- **Typography:** Playfair Display (headings), Barlow/Barlow Condensed (body), JetBrains Mono (data/stats)
- **Logo:** Red circle with gold star + "CIRCUM SURVEY. ONLINE"

---

## 2. Site Architecture

### 2.1 Navigation Structure

```
┌─────────────────────────────────────────────────────┐
│  ☰ Navigate  │  Logo/Title  │  Tabs  │  📋 │ Survey │
└─────────────────────────────────────────────────────┘
     │                           │
     │                           ├─ Curated Findings
     │                           ├─ All Questions
     │                           ├─ Mirror Pairs
     │                           ├─ The Witnesses
     │                           └─ Demographics
     │
     └─ SIDEBAR DRAWER
         ├─ Search bar (filters all questions)
         ├─ Curated Findings
         │   ├─ The Pleasure Gap
         │   ├─ The Lubrication Deficit
         │   ├─ Resentment & Regret
         │   ├─ The Generational Break
         │   ├─ Bodily Autonomy Consensus
         │   ├─ The Systemic Failure
         │   └─ Cross-Pathway Perception
         ├─ Mirror Pairs (18 identified pairs)
         ├─ Observer Pathway
         ├─ Full Question Index
         │   ├─ Body Image (2 questions)
         │   ├─ Sexual Experience (12 questions)
         │   ├─ Autonomy & Ethics (2 questions)
         │   ├─ Decision & Consent (6 questions)
         │   ├─ Beliefs & Perceptions (8 questions)
         │   ├─ Psychological Impact (4 questions)
         │   ├─ Family Context (4 questions)
         │   ├─ Social Awareness (6 questions)
         │   └─ Cultural Context (8 questions)
         └─ Demographics Dashboard
```

### 2.2 View Modes

**Mode 1: Curated Findings**
The editorial narrative path. Seven themed sections, each containing 2-5 question cards and mirror pairs arranged to tell a story. This is the Summit presentation path and the experience for first-time visitors who want to be walked through the findings.

**Mode 2: All Questions**
The full question index organized by category. Every quantitative question from the survey (~94 identified columns) rendered as an interactive card. Pure browse, no editorial framing. The researcher's tool.

**Mode 3: Mirror Pairs**
The 18 identified parallel question pairs between pathways, presented in a split-screen format. The survey's most unique analytical contribution — no other instrument asks the same conceptual question from opposite anatomical perspectives.

**Mode 4: The Witnesses (Observer Pathway)**
A dedicated section for the n=37 Observer, Partner & Ally Pathway respondents. Their data on cross-cutting attitudinal questions (bodily autonomy, future-son intentions, aesthetic preferences, medical superiority beliefs) is presented with context about who these respondents are and why their independent witness perspective matters.

**Mode 5: Demographics Dashboard**
Interactive cross-tabulation tool. Filter by age, country, socioeconomic status, political orientation, religiosity, sexuality, father's circumcision status, and community norm — then see how these demographics correlate with key outcome variables (future-son intention, satisfaction, resentment, bodily autonomy stance). The key finding this surfaces: the "keep intact" intention holds across every demographic slice.

---

## 3. Question Card Architecture

### 3.1 Standard Question Card Layout

```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│   ┌───────────┐    CATEGORY LABEL                        │
│   │           │    Question text as asked in survey    ↗  │
│   │  DONUT    │    Subtitle / pathway note                │
│   │  PIE      │                                           │
│   │  CHART    │    ● Option A ·················· 48.2%    │
│   │           │    ● Option B ·················· 23.6%    │
│   └───────────┘    ● Option C ··················  5.5%    │
│   [🔵🟣 Born] [🟢] [🔵] [🟣] [🟠]     ● Option D ·················· 16.1%    │
│    Pathway toggles              ● Option E ··················  6.5%    │
│                                                           │
│   ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│   VOICES FROM THE SURVEY                                  │
│   ┌─ 🔵 ──────────────┐  ┌─ 🟢 ──────────────┐          │
│   │ "Quote from circ   │  │ "Quote from intact │          │
│   │  respondent..."    │  │  respondent..."    │          │
│   │ — Context note     │  │ — Context note     │          │
│   └────────────────────┘  └────────────────────┘          │
│   Anonymous quotes, all identifying details removed.      │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Pathway Toggle Behavior

- **Default for anatomy-specific questions:** "🔵🟣 Born Circumcised" combined view (weighted average of Circumcised + Restoring pathways, n=319)
- **Toggle to isolate:** Click any individual pathway emoji to see that pathway's distribution alone
- **Observer pathway visible** on cross-cutting questions where Observer respondents have data
- **Restoring highlight within combined view:** When showing Born Circumcised combined data, the Restoring portion is visually distinguishable (hatched pattern or outlined segment) so the viewer can see how awareness changes perception within the same population

### 3.3 Chart Types by Question Type

- **Multiple choice (3-6 options):** Donut pie chart with hover-highlight synced to legend
- **1-5 scale ratings:** Grouped mini bar chart showing all pathways side by side (the gradient IS the story)
- **Binary choice:** Single horizontal bar with opposing colors (blue/red)
- **Mirror pairs:** Split-panel with horizontal bar distributions, same color scale applied to parallel options

### 3.4 Share This Finding

Every card includes a "↗ Share" button that reveals:
- A direct URL anchor to this question (`circumsurvey.online/findings#mobile_skin`)
- Citation text: "From The Accidental Intactivist's Inquiry, Phase 1, n=496"
- Future: a "Generate Image" button that creates a clean, branded PNG of just this chart for social media

---

## 4. Mirror Pair Architecture

### 4.1 Identified Parallel Pairs (18 total)

These are questions where the same conceptual topic is asked from opposite pathway perspectives. The meta tags confirm the parallel structure:

| Concept | Intact Pathway | Circumcised Pathway |
|---------|---------------|---------------------|
| Advantages | intact_advantages_desc | circ_advantages_desc |
| Drawbacks | intact_drawbacks_desc | circ_drawbacks_desc |
| Age of awareness | intact_circ_awareness_age | circ_awareness_age |
| Parents' reason | intact_parents_reason | circ_parents_reason |
| Primary driver | intact_parents_driver | circ_parents_driver |
| Resentment / Regret | intact_regret_feeling | circ_regret_feeling |
| Regret triggers | intact_regret_triggers | circ_regret_triggers |
| Parents conversation | intact_parents_convo | circ_parents_convo |
| Why not asked parents | intact_parents_convo_why_not | circ_parents_convo_why_not |
| Medical interventions | intact_medical_intervention | circ_medical_intervention |
| Community social norm | intact_parents_social_norm | circ_parents_social_norm |
| Notice same status | intact_notice_same_status | circ_notice_same_status |
| Notice different status | intact_notice_diff_status | circ_notice_diff_status |
| Notice significance | intact_notice_significance | circ_notice_significance |
| Curiosity about other | intact_curiosity_about_circ | circ_curiosity_about_intact |
| Prior thought level | intact_prior_thought_level | circ_prior_thought_level |
| PPP awareness | intact_ppp_awareness | circ_ppp_awareness |
| PPP impact | intact_ppp_impact | circ_ppp_impact |

### 4.2 Mirror Card Layout

The mirror format shows two pathways side-by-side answering the same conceptual question. A language-sensitivity callout box appears when the question involves asymmetric framing (e.g., "resentment" vs "regret") — explaining why different words are used for different pathways and honoring the community feedback that "regret implies agency in a decision the person didn't make."

### 4.3 Circumcised-Only and Intact-Only Questions

Some questions exist only on one pathway — scar perception, physical symptoms, message to parents (circumcised only) or foreskin role in sex, frenulum role, pressure to circumcise (intact only). These are surfaced as single-pathway cards with a note explaining that only this pathway was asked this question, and why.

---

## 5. Exposing the Data: Tiered Access Model

### 5.1 Tier 1 — Interactive Aggregate Explorer (Public, Free)

**What it is:** The question card explorer described above. All quantitative data is presented at the aggregate level — response distributions by pathway, averages, cross-tabulations. No individual responses are identifiable.

**How data is exposed:** A JSON data blob embedded in the client-side application containing pre-computed aggregates for every question × pathway combination. No raw CSV is transmitted to the browser. Filtering happens client-side against these aggregates.

**What visitors can do:**
- Browse any question and see pathway distributions
- Toggle between pathways
- Search across all questions
- Compare mirror pairs side by side
- Filter demographics and see cross-tabulations
- Share individual findings via URL anchors

### 5.2 Tier 2 — LLM-Powered Query Interface (Gated, Substack Paid Subscribers)

**What it is:** An "Ask the Data" natural language query tool that allows visitors to ask questions like "What do circumcised men over 45 who grew up religious say about resentment?" and get synthesized answers with supporting visualizations.

**Architecture:**

```
User query → RAG retrieval over pre-computed findings vector store
           → Claude Haiku API synthesizes answer
           → Response rendered with supporting chart
```

**Critical design decisions:**
- The LLM never sees individual responses. It queries against a vector store of pre-computed aggregate findings ("Among circumcised men aged 46-55, 62% report strong resentment...").
- This protects anonymity at the architectural level — there is no prompt injection or query that could surface an individual's responses.
- Cost model: Claude Haiku at ~$0.001-0.005/query. Even 1,000 queries/day costs under $5.
- Rate limiting: 10 queries/session for free visitors, unlimited for Substack paid subscribers.

**Vector store content (pre-computed):**
- Cross-tabulations for every quantitative question × demographic variable
- Aggregate statistics (means, medians, distributions) for every question × pathway
- Key finding summaries authored by Tone
- Methodology and survey design context

### 5.3 Tier 3 — Open Research Dataset (By Request, Allied Researchers)

**What it is:** The fully anonymized quantitative dataset (multiple-choice and scale responses with demographics) available as a downloadable CSV for allied researchers and data scientists.

**What's included:**
- All quantitative columns (multiple-choice, scales, binary)
- Demographic variables (age range, country, education level, SES, political orientation, religiosity, sexuality, father's status)
- Pathway assignments
- No free-text responses (these remain private to protect the nuance of individual anonymity)

**What's excluded:**
- All open-ended text responses
- Timestamps (could be used to correlate with external data)
- Any geographic data more specific than country
- Any combination of demographic fields that could identify an individual in small populations

**Access model:** Application-based. Researchers submit a brief data-use proposal. Priority given to bodily autonomy research, legal advocacy, and medical education.

---

## 6. The Demographics Playground

### 6.1 Concept

An interactive sandbox where visitors can add and remove demographic filters to see how attitudes and outcomes shift across populations. The core insight this tool surfaces: the "keep intact" majority holds across every demographic slice — age, politics, income, religion, sexuality, and father's status. There is no demographic safe harbor for the pro-circumcision position in this data.

### 6.2 Interface Design

```
┌──────────────────────────────────────────────────────┐
│  DEMOGRAPHICS PLAYGROUND                              │
│                                                       │
│  Active Filters:                                      │
│  [Age: 26-35 ×] [Politics: Conservative ×] [+ Add]   │
│                                                       │
│  ┌─ Showing: Circumcised Pathway, n=24 ────────────┐ │
│  │                                                   │ │
│  │  Future Son Intention:                            │ │
│  │  ████████████████████████████░░░░  85% intact     │ │
│  │  ████░░░░░░░░░░░░░░░░░░░░░░░░░░  10% circumcise │ │
│  │                                                   │ │
│  │  Resentment:                                      │ │
│  │  ████████████████████░░░░░░░░░░░  58% strong     │ │
│  │  ████████░░░░░░░░░░░░░░░░░░░░░░  18% sometimes  │ │
│  │                                                   │ │
│  │  Satisfaction:                                    │ │
│  │  ████████████████░░░░░░░░░░░░░░  49% dissatisfied│ │
│  └───────────────────────────────────────────────────┘ │
│                                                       │
│  Available filters:                                   │
│  [Age ▾] [Country ▾] [SES ▾] [Politics ▾]           │
│  [Religion ▾] [Sexuality ▾] [Father Status ▾]        │
│                                                       │
│  ⚠️ Sample size warning: n < 20. Interpret with      │
│     caution. Percentages may not be representative.   │
└──────────────────────────────────────────────────────┘
```

### 6.3 Filter Variables

| Filter | Values | Pathway |
|--------|--------|---------|
| Age | <18, 18-25, 26-35, 36-45, 46-55, 56-65, 66+ | All |
| Country | US, Canada, UK, Australia, Germany, Other | All |
| Socioeconomic | Lower, Working, Middle, Upper-middle, Upper | All |
| Political | Very Conservative → Very Liberal + Libertarian + Apolitical | All |
| Religiosity | Very significant, Somewhat, Cultural only, Not significant | All |
| Sexuality | Straight, Gay, Bisexual, Other | All |
| Father's status | Intact, Circumcised, Unknown | All |
| Community norm | Unquestioned, Common, 50/50, Uncommon | All |

### 6.4 Outcome Variables

The demographics playground shows how the selected demographic slice correlates with:
- Future-son intention (keep intact vs circumcise)
- Resentment level (strong/sometimes/rarely/never)
- Overall satisfaction (proud vs dissatisfied)
- Bodily autonomy stance
- Orgasm confidence ("something is missing" %)

### 6.5 Small Sample Warning

When the filtered population drops below n=20, a prominent warning appears: "⚠️ Sample size below 20. These percentages may not be representative of the broader population with these characteristics. Use for directional insight only."

---

## 7. Narrative Response Galleries

### 7.1 Ethical Framework

Free-text responses are the soul of this dataset. They transform statistics into lived experience. But they carry ethical weight that quantitative data does not — even anonymized, a detailed personal story could theoretically be identified by someone who knows the respondent.

**Principles for quote selection:**

1. **No identifying details.** Remove or generalize any references to specific locations, workplaces, family configurations, or other details that could narrow identification.
2. **Representative, not sensational.** Select quotes that represent common themes, not extreme outliers — unless the outlier illustrates a pattern visible in the quantitative data.
3. **Pathway-balanced.** Always show voices from multiple pathways in the same gallery. The Intact Pathway's candid acknowledgment of occasional regret or social pressure is as important as the Circumcised Pathway's expressions of resentment.
4. **Context provided.** Each quote includes the question it was answering and the pathway of the respondent — nothing more.
5. **Curated by the researcher.** Tone personally reviews and selects every quote that appears on the site. No automated selection.

### 7.2 Qualitative Columns Available

| Column | Description | Substantive Responses |
|--------|-------------|----------------------|
| 67 | 🟢 Drawbacks of being intact | 90 |
| 71 | 🟢 How circumcision was handled by parents | 92 |
| 73 | 🟢 Regret triggers (when/what prompted feelings) | 47 |
| 92 | 🔵 Drawbacks of being circumcised | 239 |
| 95 | 🔵 How medical establishment presented circumcision | 228 |
| 102 | 🔵 Medical interventions after circumcision | 49 |
| 211 | 🔵 Quality of information parents received | 132 |
| 230 | 🔵 Specific reasons/motivations for circumcision | 112 |
| 134 | 🟠 Partner observations | 6 |
| 138 | 🟠 Parent emotional state around decision | 9 |

### 7.3 Presentation Format

Quotes appear contextually below relevant question cards in collapsible "Voices from the Survey" panels. Each quote is rendered in a card with the pathway's accent color as a left border, the quote in italic, and a one-line attribution: "— Circumcised Pathway · On drawbacks of circumcision."

A global "Voices" page could also present themed quote collections organized by topic rather than by question — e.g., "On Loss," "On Discovery," "On What Parents Were Told," "On What It Feels Like."

---

## 8. LLM-Augmented Analysis Layer

### 8.1 Vision

Every question card has a toggleable "🤖 Analysis" panel that provides LLM-generated contextual interpretation of the data. This is the "interpretation-optional" layer — it's never shown by default, but a single click reveals a thoughtful, data-grounded commentary.

### 8.2 Architecture

**Pre-computation, not real-time inference.** For each question, a Claude analysis is generated once during the build process, reviewed by Tone for accuracy and tone, and then embedded as static content. This eliminates per-request API costs for the public site.

The analysis for each question would include:
- What the data shows (neutral description of the distribution)
- The cross-pathway comparison (what's similar and different)
- How the restoring pathway's position between intact and circumcised does or doesn't confirm partial recovery
- Any relevant context from the survey design (e.g., why the question was asked in a particular way)
- Connections to other questions in the dataset ("see also: lubrication need, which shows a similar pattern")

### 8.3 Real-Time LLM Queries (Tier 2, Gated)

For the "Ask the Data" tool, the architecture is:

1. **Pre-computed finding cards** — ~500-1000 text snippets like: "Among circumcised men aged 26-35, 74% would keep their sons intact. Among the same age group who identify as conservative, the rate is 85%."
2. **Vector embeddings** — Each finding card is embedded using a lightweight model and stored in a vector database (could be as simple as a JSON file with pre-computed embeddings for small scale).
3. **Query pipeline** — User's question → embed query → retrieve top-k relevant finding cards → inject into Claude Haiku prompt → synthesize answer → render with supporting data.
4. **Cost control** — Haiku at ~$0.001/query. Rate limit at 10/session for free, unlimited for paid subscribers. Cache common queries.

---

## 9. Pathway Visualization

### 9.1 Survey Flow Visualization

An interactive diagram showing the survey's branching logic — how a respondent enters through consent, walks through demographics, reaches the pathway branching point, and then follows their specific pathway through its unique questions. This visualization:

- Shows the six pathways as distinct colored rivers flowing from a common source
- Indicates where pathways share common questions (the cross-cutting sections)
- Highlights the mirror question pairs with connecting lines between pathways
- Allows clicking on any question node to see its data card

### 9.2 Implementation

A force-directed or Sankey-style D3 visualization. Each pathway is a vertical swim lane. Questions are nodes within the lane. Shared questions span multiple lanes. Mirror pairs are connected by arching lines across lanes.

---

## 10. Technical Implementation

### 10.1 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend Framework | React (JSX) | Already prototyped; component architecture matches question card pattern |
| Charting | Custom SVG + Recharts | Custom SVG for hero visuals, Recharts for interactive explorer |
| Styling | Tailwind utility classes + CSS variables | Theming consistency, responsive design |
| Hosting | Static site (Vercel/Netlify) or subdomain of circumsurvey.online | Zero-cost hosting, fast CDN |
| Data Layer | Embedded JSON (Tier 1), Vector store (Tier 2) | No backend needed for public site |
| LLM API | Claude Haiku via Anthropic API | Cost-efficient, high-quality synthesis |
| Authentication | Substack OAuth or simple token (Tier 2 only) | Minimal friction for paid subscribers |

### 10.2 Data Pipeline

```
Google Forms (survey)
    ↓
CSV export (raw data)
    ↓
Python aggregation scripts
    ↓
JSON data blob (aggregates by question × pathway × demographics)
    ↓
React app (client-side rendering)
    ↓
Static deployment
```

### 10.3 Performance Targets

- Initial load: < 2 seconds on 3G
- Time to interactive: < 3 seconds
- Largest contentful paint: < 1.5 seconds
- All charts render without external API calls (embedded data)
- Mobile-responsive at 320px minimum width

---

## 11. Content Strategy: Site vs Substack vs Social

### 11.1 The Ecosystem

| Platform | Role | Content Type |
|----------|------|-------------|
| **circumsurvey.online/findings** | The instrument. The data itself. | Interactive explorer, methodology, raw findings |
| **Substack** (The Accidental Intactivist) | The analysis. The narrative. The interpretation. | Deep-dive articles, themed analyses, curated quote collections, the "Ask the Data" tool |
| **Facebook / Instagram** | The hook. The shareable moment. | Social cards, key statistics, survey CTA |
| **Reddit** (r/FriendsOfTheFrenulum) | The community. The discussion. | Detailed breakdowns, community Q&A, methodology debate |
| **Discord** | The real-time. The mobilization. | Campaign coordination, response count updates |

### 11.2 Content Flow

Social media creates awareness → circumsurvey.online/findings provides the credible, explorable data → Substack provides the deep analysis and interpretation → Reddit provides the community discussion → all channels point back to the survey CTA for new respondents.

The findings site never goes "all in" on advocacy framing. That's what Substack is for. The site is the neutral, credible, explorable instrument. The Substack is where Tone — as the Accidental Intactivist — provides the interpretation, the context, the historical analysis, and the call to action.

---

## 12. Implementation Roadmap

### Phase A: Summit-Ready (Saturday)
- [x] Curated Findings view with 7 themed sections
- [x] Question cards with pie charts and pathway toggles
- [x] Born-circumcised combined default
- [x] Mirror pairs (3-4 key pairs with data)
- [x] Observer Pathway section
- [x] Curated quote galleries on key questions
- [x] Methodology modal
- [x] Share-this-finding capability
- [x] Sidebar question index
- [ ] Deploy to live URL

### Phase B: Post-Summit (Weeks 1-2)
- [ ] Expand All Questions view to full ~94 quantitative columns
- [ ] Wire remaining 14+ mirror pairs with data from CSV
- [ ] Demographics Dashboard with all filter variables
- [ ] Pathway flow visualization (D3)
- [ ] Mobile-responsive refinements
- [ ] Generate static LLM analysis for each question (pre-computed)
- [ ] Additional curated quote galleries (reviewed and selected by Tone)
- [ ] SEO optimization and Open Graph social cards

### Phase C: Platform Build (Weeks 3-6)
- [ ] LLM-powered "Ask the Data" query tool
- [ ] Substack subscriber authentication for Tier 2
- [ ] Vector store of pre-computed findings
- [ ] "Generate Image" share feature (branded PNG export)
- [ ] Comparison anchor feature (pin one question while viewing another)
- [ ] Tier 3 research dataset access application system

### Phase D: Growth (Ongoing)
- [ ] Phase 2 survey expansion and new data integration
- [ ] Longitudinal analysis (tracking changes as n grows)
- [ ] Translation support (Spanish, French, German)
- [ ] API for allied researchers (programmatic access to aggregates)
- [ ] Collaborative annotation system for allied researchers
- [ ] Integration with GALDEF legal case materials

---

## 13. Accessibility & Ethics Checklist

- [ ] All charts have text alternatives (screen reader accessible)
- [ ] Color palette validated for deuteranopia, protanopia, and tritanopia
- [ ] All interactive elements keyboard-navigable
- [ ] Content warnings on questions involving trauma, loss, or graphic descriptions
- [ ] Clear labeling of self-reported data limitations
- [ ] No individual response identifiable from any combination of filters
- [ ] Minimum n-threshold for displaying filtered results (n ≥ 5 for any displayed percentage)
- [ ] Quote galleries reviewed by Tone before publication
- [ ] Methodology and limitations always one click away
- [ ] "Take the Survey" CTA never obscures data content

---

## 14. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Summit reception | Positive feedback, collaboration offers | Qualitative |
| Survey responses post-launch | +50 within 2 weeks | Google Forms count |
| Site engagement | >3 min average session, >5 questions explored | Analytics |
| Substack subscriber conversion | 10% of site visitors click Substack link | UTM tracking |
| Research collaboration inquiries | 3+ within first month | Email/form |
| Social media shares of individual findings | 50+ shares of "Share this finding" links | URL tracking |
| Media or organizational citation | 1+ citation in the first 3 months | Manual tracking |

---

## Appendix A: Identified Qualitative Response Themes (for Quote Gallery Curation)

Based on preliminary review of 239 circumcised-pathway and 90 intact-pathway open-ended responses:

**Circumcised Pathway — Common Themes:**
- Physical pain, tearing, discomfort during erection
- Inability to reach orgasm or diminished orgasm quality
- Need for lubrication as lifelong dependency
- Scar tissue complications
- Psychological: loss, grief, betrayal, violation of trust
- Impact on intimate relationships
- Discovery of what was lost through partner comparison or research
- Desire for restoration

**Intact Pathway — Common Themes:**
- Childhood/adolescent social pressure ("looking different")
- Pop culture and pornography normalizing circumcised appearance
- Discovering their "minority" status and eventual pride
- Ease of hygiene (refuting the cleanliness myth)
- Partner reactions (positive, curious, occasionally negative)
- Gratitude toward parents, especially in a culture that defaulted to circumcision

**Observer Pathway — Common Themes:**
- Partner observations of sensitivity differences
- Parental regret or parental pride in the decision
- Healthcare professional awareness of the procedure's impact

---

*This document is a living plan. It will be updated as the dataset grows, community feedback is incorporated, and the platform evolves.*

*"We are not telling people how to feel. We are creating a platform for them to anonymously share how they actually feel and what they actually experience."*

— Tone Pettit, The Accidental Intactivist
circumsurvey.online
