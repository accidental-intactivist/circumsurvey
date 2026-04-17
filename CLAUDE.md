# CLAUDE.md — CircumSurvey Preliminary Results Site

## Project Overview

This is the interactive data explorer for **The Accidental Intactivist's Inquiry** — an anonymous survey of 496+ respondents documenting the lived experiences of intact, circumcised, and restoring individuals, along with partners, parents, and healthcare professionals.

**Author:** Tone Pettit (tone@circumsurvey.online), Seattle-based independent researcher
**Sites:** circumsurvey.online (home), findings.circumsurvey.online (this project)
**Survey:** https://forms.gle/FQ8o9g7j1yU3Cw7n7
**Substack:** https://theaccidentalintactivist.substack.com
**Reddit:** r/FriendsOfTheFrenulum

## Critical Context for All Claude Sessions

### The Origin Story (How Tone Talks About the Survey)

When introducing the survey to anyone — potential respondents, group admins, journalists, skeptics — this is the authentic framing:

> "I grew up intact in a culture where almost everyone else was not. I've always been perfectly happy with my equipment, but it occurred to me that I never heard anyone discussing how they actually felt as adults about their circumcision state. I realized I could just ask them directly, respectfully and anonymously, to collect a comparative database filled with actual answers from people's lived experiences. While I do have opinions about the practice, I wanted to create a space for people to share their thoughts in a safe, private space."

This is the **Inquiry Frame** — the project's core rhetorical posture. It works because it leads with curiosity rather than accusation, acknowledges perspective without hiding behind false neutrality, and centers the respondents' voices rather than the researcher's conclusions. Any outreach copy, agent responses, or site framing should echo this energy.

The condensed version for the site itself: *"This inquiry began with a simple observation: as someone who grew up intact in the United States, I realized I had never heard anyone discuss how they actually felt about their circumcision status as adults. So I asked."*

### Voice & Framing

> "We are not telling people how to feel. We are creating a platform for them to anonymously share how they actually feel and what they actually experience."

This is the project's thesis statement. The site is a **data instrument**, not an advocacy document. Editorial interpretation belongs on Substack, not on the findings site. The data speaks for itself — and when arranged properly (especially in the mirror pairs), it speaks volumes without editorial commentary.

### Language Rules

- **"Pathways" not "cohorts."** The survey has six pathways; the site mirrors this language.
- **"Respondents" not "men."** The dataset includes women, trans, non-binary, and intersex individuals.
- **"Resentment" not "regret"** for circumcised respondents — regret implies agency in a decision they didn't make. The community pushed back on "regret" and this distinction matters.
- **"Born circumcised"** when referring to the combined Circumcised + Restoring population (n=319).
- **"100% of restoring respondents who expressed a preference"** — not "97.9%." The non-intact responses were "N/A / no plans for children," not choosing circumcision.
- Never use "MGM" or "genital mutilation" on the findings site. That language is for advocacy contexts, not data presentation.

### The Six Pathways

| Emoji | Pathway | n | Color | Description |
|-------|---------|---|-------|-------------|
| 🟢 | The Intact Pathway | 140 | #5b93c7 | Never circumcised |
| 🔵 | The Circumcised Pathway | 210 | #d94f4f | Currently circumcised |
| 🟣 | The Restoration Pathway | 109 | #e8c868 | Actively restoring or considers themselves restored |
| 🟠 | The Observer, Partner & Ally Pathway | 37 | #a0a0a0 | Partners, parents, HCPs, allies |
| 🔴 | The Trans Pathway | small n | — | Trans respondents with pathway-specific questions |
| ⚪ | The Intersex Pathway | small n | — | Intersex respondents with pathway-specific questions |
| 🔵🟣 | Born Circumcised (Combined) | 319 | #cc6855 | Weighted combination of Circumcised + Restoring |

### Color System (Colorblind-Friendly, Community-Validated)

- **Data palette (on black backgrounds):** Red (#d94f4f), Orange (#e8a44a), Yellow (#e8c868), Light Blue (#8bb8d9), Blue (#5b93c7), Grey (#a0a0a0)
- **Editorial palette (on cream backgrounds):** Cream bg (#faf8f4), Deep teal headings (#1a5c3a), Warm amber accents (#d4a030), Red accent (#cc2a2a)
- **Typography:** Playfair Display (headings), Barlow/Barlow Condensed (body), JetBrains Mono (data/stats)

---

## Design Language: "The Special Report"

### Design Philosophy

The site should feel like opening a **high-end editorial magazine's special investigative report** — authoritative, considered, and memorable. Not a tech dashboard. Not a clinical paper. Not a WordPress blog. A *publication* with a point of view, typographic craft, and the confidence to let data and human voices carry the narrative.

**Three reference models inform the aesthetic:**

1. **Scrollytelling data journalism** (The Pudding, NYT Interactives, Bloomberg Visual Data) — scroll-driven narrative where charts animate into view, text wraps around visualizations, the experience of encountering the data is inseparable from understanding it.

2. **Interactive database explorers** (Our World in Data, FT Interactive, ProPublica Databases) — clean, typographically rigorous, treating the data itself as the visual hero. Functional beauty. No decoration for decoration's sake.

3. **Magazine special reports** (The Economist deep dives, Bloomberg Businessweek packages, The California Sunday Magazine) — a distinctive cover identity, consistent typographic system, sidebar callouts, pull quotes, and the sense that this is *considered work* that took time and care.

The site should earn a spot in the **Information is Beautiful Awards** or **Sigma Awards** shortlist. That's the quality bar.

### Typography System

Typography is the single most important differentiator between "AI-generated website" and "designed publication." Every font choice must be intentional.

```
HIERARCHY:
──────────────────────────────────────────────
Display / Hero Titles:     Playfair Display, 800 weight
                           Large sizes (clamp 2.2rem–3.6rem)
                           Used sparingly — section openers only
                           Color: cream text on dark, teal on light

Section Headings:          Playfair Display, 700 weight
                           1.2–1.6rem
                           The "magazine headline" voice

Category Labels / Eyebrows: Barlow Condensed, 700 weight
                           0.6–0.7rem, uppercase, wide letter-spacing
                           Gold (#d4a030) — signals structural navigation

Body Text:                 Barlow, 400–500 weight
                           0.82–0.92rem, line-height 1.6
                           The readable, neutral carrier

Data Labels / Stats:       JetBrains Mono, 600–800 weight
                           Varies by context
                           Conveys precision and credibility

Pull Quotes:               Playfair Display Italic, 600 weight
                           1.1–1.4rem, generous whitespace
                           The human voice breaking through the data

UI Controls / Toggles:     Barlow Condensed, 600 weight
                           0.62–0.72rem, uppercase
                           Functional, never decorative
```

**Font loading:** Import via Google Fonts. Playfair Display (400, 400i, 700, 800), Barlow (400, 500, 600, 700), Barlow Condensed (400, 500, 600, 700), JetBrains Mono (400, 600, 700, 800).

**Anti-patterns:** Never use Inter, Roboto, Arial, or system fonts. Never use more than these four families. Never use Barlow where Barlow Condensed belongs (condensed is for labels and UI, regular is for body).

### Color Architecture

The site uses two distinct palettes that alternate to create visual rhythm — like turning between editorial and data pages in a print magazine.

```
EDITORIAL PALETTE (cream sections — context, methodology, quotes):
──────────────────────────────────────────────
Background:        #faf8f4  (warm cream/parchment)
Heading text:      #1a5c3a  (deep forest teal)
Body text:         #2a2a2a  (near-black, warm)
Secondary text:    #5a5a5a  (warm grey)
Accent:            #d4a030  (warm amber/gold)
Border/divider:    #e0dcd4  (cream edge)
CTA background:    #1a5c3a  (teal bar)
Alert/brand:       #cc2a2a  (CS red)

DATA PALETTE (black sections — charts, comparisons, mirror pairs):
──────────────────────────────────────────────
Background:        #0e0e10  (near-black, cool)
Panel/card:        #18181c  (elevated surface)
Border:            #222228  (subtle edge)
Text primary:      #eeeef0  (cream-white)
Text secondary:    #8a8a96  (cool grey)
Text muted:        #55555f  (ghost)
Gold accent:       #d4a030  (consistent across both palettes)

PATHWAY DATA COLORS (on black backgrounds ONLY):
──────────────────────────────────────────────
🟢 Intact:         #5b93c7  (clear blue)
🔵 Circumcised:    #d94f4f  (clear red)
🟣 Restoring:      #e8c868  (clear yellow)
🟠 Observer:       #a0a0a0  (neutral grey)
🔵🟣 Born Circ:    #cc6855  (warm red-orange blend)

DISTRIBUTION SPECTRUM (for ordered response options):
──────────────────────────────────────────────
Most negative:     #d94f4f  (red)
Negative:          #e8a44a  (orange)
Neutral:           #e8c868  (yellow)
Positive:          #8bb8d9  (light blue)
Most positive:     #5b93c7  (blue)
N/A / Other:       #a0a0a0  (grey)
```

**Critical rule:** The pathway colors (red/yellow/blue for the three main pathways) are ONLY used on dark backgrounds. On cream editorial sections, pathways are referenced by emoji and label text, not by colored blocks. This prevents visual confusion between the pathway identity system and the response distribution spectrum, which use the same colors for different purposes.

### Texture & Atmosphere

The site should feel *tactile* — not flat, not glossy, not generic.

```
EDITORIAL SECTIONS:
- Subtle paper grain texture overlay on cream backgrounds
  (CSS: noise SVG filter at 2-3% opacity)
- Thin teal top-border on section entries
- Gold horizontal rules as section dividers (40–60px wide, 2px)
- Cards with subtle warm shadows, not hard borders
- Generous whitespace — let content breathe like a magazine spread

DATA SECTIONS:
- Subtle noise texture on black backgrounds (3% opacity)
  Prevents the "dead screen" feel of pure #000
- Cards with 1px border at #222228, subtle surface elevation
- No drop shadows on dark — use border + background shift instead
- Charts have no gridlines by default — data labels directly on elements
- Hover states are immediate (no delay) and use opacity shifts, not color changes

TRANSITIONS BETWEEN SECTIONS:
- No hard cut from cream to black
- Use a gradient fade zone (60–80px) or a full-width gold divider line
- The rhythm of cream → black → cream → black creates the "turning pages" sensation
```

### Animation Philosophy

**Principle: Every animation serves comprehension. Nothing decorates.**

```
SCROLL-TRIGGERED:
- Charts draw/grow when they enter the viewport (IntersectionObserver)
- Stat counters animate from 0 to their value on first appearance
- Quote galleries fade in with a staggered delay (100ms between quotes)
- Section headings slide up slightly (12px) and fade in

PIE CHART INTERACTIONS:
- Pathway toggle: pie segments morph smoothly between distributions
  (interpolate arc angles, not hard-swap)
- Hover: hovered segment scales to 1.04x, others dim to 35% opacity
- Transition duration: 200ms for hover, 400ms for pathway toggle

BAR CHART INTERACTIONS:
- Bars grow from left on first render (width transition 600ms ease-out)
- Hover: bar brightens, exact value appears in tooltip

MIRROR PAIR ANIMATIONS:
- On first render, the two sides slide in from their respective edges
  and meet in the center (left panel from left, right from right)
- Horizontal bars grow simultaneously on both sides

WHAT NEVER ANIMATES:
- Text content (no typewriter effects, no letter-by-letter reveals)
- Navigation elements
- The sidebar drawer (uses CSS transform, not JS animation)
- Anything on repeat/loop — animations fire once on entry, then stop
```

### Component Design Standards

```
QUESTION CARD:
──────────────────────────────────────────────
- Background: #18181c (dark) or #ffffff (light sections)
- Border: 1px solid #222228 (dark) or #e0dcd4 (light)
- Border-radius: 12px
- Padding: 1.25rem
- Layout: pie chart left (160px fixed), content right (flex)
- Category eyebrow: gold, uppercase, 0.55rem, Barlow Condensed
- Question text: 0.85rem, Barlow, weight 600
- Option list: 0.7rem, each row has color swatch + label + percentage
- Hover sync: pie segment ↔ option row (opacity-based, 200ms)

MIRROR CARD:
──────────────────────────────────────────────
- Full-width card with center-aligned title
- Two panels side by side (flex, wrap on mobile)
- Each panel: pathway emoji + label + italic question text + horizontal bars
- Language callout: gold background, gold left border, italic, 0.62rem
- Bars use the distribution spectrum colors consistently

QUOTE GALLERY:
──────────────────────────────────────────────
- Appears below chart in collapsible panel
- Grid layout: auto-fit, minmax(240px, 1fr)
- Each quote card: pathway color as left border (3px)
- Quote text: Playfair Display Italic, 0.78rem, cream-white
- Attribution: Barlow Condensed, uppercase, 0.55rem, pathway color
- Footer: "Anonymous quotes, all identifying details removed" in muted text

STAT CARD (for hero numbers):
──────────────────────────────────────────────
- Background: rgba(255,255,255,0.03)
- Top border: 3px solid pathway color
- Number: JetBrains Mono, 2.4–2.8rem, weight 700, pathway color
- Label: Barlow, 0.85rem, weight 600
- Detail: Barlow, 0.72rem, muted

PATHWAY TOGGLE:
──────────────────────────────────────────────
- Horizontal pill buttons, gap 0.25rem
- Active: 1.5px solid pathway-color, pathway bg at 10%, pathway color text
- Inactive: 1px solid border color, transparent bg, muted text
- Font: Barlow Condensed, 0.62rem, weight 600, uppercase
- Transition: all 0.15s ease

SIDEBAR DRAWER:
──────────────────────────────────────────────
- Width: 310px, fixed position, slides from left
- Background: #131316
- Overlay behind: rgba(0,0,0,0.5) with click-to-close
- Search input at top with subtle border
- Section headers: Barlow Condensed, 0.7rem, uppercase, color-coded
- Question items: Barlow, 0.65rem, indent 1.25rem
- Active item: gold left border (2px), gold dim background, gold text
- Total count in footer
```

### Responsive Design

```
DESKTOP (960px+):
- Max content width: 840–960px, centered
- Sidebar: overlay drawer (not persistent — content area is king)
- Question cards: pie left + content right (side by side)
- Mirror cards: two panels side by side
- Demographics dashboard: full filter bar + chart area

TABLET (600–959px):
- Question cards: pie stacks above content (column layout)
- Mirror cards: panels stack vertically
- Sidebar: full-screen overlay
- Nav: pills wrap to second line if needed

MOBILE (< 600px):
- Single column throughout
- Pie charts: centered, 140px
- Pathway toggles: wrap naturally
- Sidebar: bottom sheet or full-screen drawer
- Nav: hamburger + logo + survey CTA only
- Font sizes reduce ~10% across the board
```

### The "Money Shot" Visualizations

These are the 6–8 hero charts that will be screenshotted, shared on social media, embedded in presentations, and cited by journalists. They must be **custom SVG compositions** — not library-generated charts — with pixel-perfect typography, pathway colors, and the CS brand identity baked in.

Each money shot should be exportable as a standalone PNG (1080×1080 for social, 1920×1080 for presentations) with attribution text and the circumsurvey.online URL built into the image.

```
1. THE PLEASURE GAP
   Grouped horizontal bars, all 6 sexual experience metrics
   Three pathway colors, gap percentages annotated
   The single most impactful visualization in the dataset

2. THE RESENTMENT ASYMMETRY
   Mirror-format: circumcised resentment (86%) vs intact regret (38%)
   The visual weight of the asymmetry is the story

3. THE LUBRICATION DIVIDE
   Paired donut pies: intact (55.5% never) vs circumcised (39% always)
   The 10:1 ratio visualized

4. THE GENERATIONAL BREAK
   Stacked bars showing future-son intentions across all pathways
   The convergence on "keep intact" across every pathway

5. THE SYSTEMIC FAILURE
   Donut pie: how circumcision was handled (47.6% routine/automatic)
   The 2.7% "neutral pros & cons" slice is barely visible — that IS the story

6. THE CONFIDENCE GAP
   Three donut pies side by side: 4.5% vs 48.2% vs 59.6% "something is missing"
   The restoring number being HIGHER than circumcised tells its own story

7. THE CURIOSITY MIRROR
   Side-by-side bars: 67.8% of circumcised often wonder vs 27.3% of intact
   The asymmetric curiosity visualized

8. THE BODILY AUTONOMY CONSENSUS
   Three large percentage circles: 96.4% / 81.3% / 100%
   The convergence across pathways
```

### Design Anti-Patterns (What This Site Must NEVER Look Like)

- **Generic dashboard:** No Tailwind UI default cards, no shadcn/ui out-of-the-box components without heavy customization
- **Academic paper:** No Times New Roman, no double-spaced paragraphs, no "Figure 3.2a" labels
- **Advocacy pamphlet:** No ALL CAPS headlines, no exclamation points, no "EXPOSED!" language
- **AI-generated slop:** No purple gradients, no hero images of diverse people pointing at screens, no "powered by AI" badges
- **WordPress template:** No sidebar widgets, no "Recent Posts," no cookie consent banners dominating the viewport
- **Clinical study readout:** No forest plots, no p-value tables, no CONSORT flow diagrams
- **Infographic poster:** No icons-as-metaphors (no scissors, no bandages, no crying babies), no "did you know?" bubbles

The site should look like nothing else in the intactivist space — or in the survey dissemination space broadly. It should look like the best data journalism publications in the world decided to cover this topic with the seriousness it deserves.

## Data Architecture

### Source Data

The raw CSV is at `data/raw/responses.csv` (NEVER commit this to the repo). It contains ~368 columns per row with branching logic (most cells are empty for any given respondent due to pathway-specific questions).

### Data Pipeline

```
data/raw/responses.csv (LOCAL ONLY, never committed)
    ↓ scripts/aggregate.py
data/aggregates.json (committed, deployed)
    ↓ imported by React app
src/data/questions.ts (question metadata + aggregate data)
```

### Security Rules

1. **The raw CSV never leaves your local machine.** Never commit it. Never deploy it. Never reference it in client-side code.
2. **Only pre-computed aggregates ship to the browser.** Response distributions by pathway, means, cross-tabulations.
3. **Qualitative quotes are individually curated** by Tone, reviewed for identifying details, and hardcoded as static strings. Never dynamically pulled from the CSV.
4. **The Anthropic API key** lives in a Cloudflare Worker environment variable, never in client-side code. Add it to `.env` locally and to Cloudflare dashboard for production.
5. **The .gitignore must include:** `data/raw/`, `*.csv`, `.env`, any file containing API keys.

### Key Column Mappings

These are the CSV column indices for the most important questions:

| Col | Question | Type | Pathways |
|-----|----------|------|----------|
| 47 | Appearance feelings | 5-option | 🟢🔵🟣 |
| 48-53 | Sexual experience ratings (intensity, duration, ease, light touch, mobile skin, variety) | 1-5 scale | 🟢🔵🟣 |
| 54 | Sensitivity description | Free text | 🟢🔵🟣 |
| 55 | Orgasm description | Free text | 🟢🔵🟣 |
| 56 | Orgasm duration | 5-option | 🟢🔵🟣 |
| 57 | Orgasm confidence | 5-option | 🟢🔵🟣 |
| 58 | Lubrication need | 5-option | 🟢🔵🟣 |
| 62 | Pre-ejaculate | 5-option | 🟢🔵🟣 |
| 64 | Pride/satisfaction | 6-option | 🟢🔵🟣 |
| 65 | Circumcision state (PATHWAY ASSIGNMENT) | 3-option | All |
| 72 | Wished circumcised (intact regret) | 4-option | 🟢 only |
| 81 | Wondered about circumcised experience | 5-option | 🟢 only |
| 93 | Primary driver of circumcision decision | 6-option | 🔵 only |
| 95 | How circumcision was handled at birth | 5-option | 🔵 only |
| 99 | Wondered about intact experience | 6-option | 🔵 only |
| 103 | Resentment/loss/anger | 4-option | 🔵🟣 |
| 110 | Considered restoration | 5-option | 🔵 only |
| 112 | Father's circumcision status | 3-option | 🔵🟣 |
| 149 | Body/medical intervention philosophy | 4-option | All |
| 150 | Community norm growing up | 5-option | All |
| 170 | Medical superiority belief | 5-option | All |
| 171 | Sexual pleasure superiority belief | 5-option | All |
| 174 | Aesthetic preference | 5-option | All |
| 177 | Future son intention | 5-option | All |
| 178 | Bodily autonomy vs parental discretion | 2-option | All |

### Mirror Pair Mappings (18 identified)

Mirror pairs are questions where the same concept is asked from opposite pathway perspectives. The meta tags confirm the parallel structure:

| Concept | 🟢 Intact Tag | 🔵 Circumcised Tag | Cols |
|---------|--------------|-------------------|------|
| Advantages | intact_advantages_desc | circ_advantages_desc | 66/100 |
| Drawbacks | intact_drawbacks_desc | circ_drawbacks_desc | 67/101 |
| Awareness age | intact_circ_awareness_age | circ_awareness_age | 68/99 |
| Parents' reason | intact_parents_reason | circ_parents_reason | 69/104 |
| Primary driver | intact_parents_driver | circ_parents_driver | 70/103 |
| Resentment/Regret | intact_regret_feeling | circ_regret_feeling | 72/103* |
| Regret triggers | intact_regret_triggers | circ_regret_triggers | 73/136 |
| Parents conversation | intact_parents_convo | circ_parents_convo | 75/111 |
| Why not asked | intact_parents_convo_why_not | circ_parents_convo_why_not | 76/113 |
| Medical intervention | intact_medical_intervention | circ_medical_intervention | 81/133 |
| Community norm | intact_parents_social_norm | circ_parents_social_norm | 77/109 |
| Notice same status | intact_notice_same_status | circ_notice_same_status | 90/130 |
| Notice different | intact_notice_diff_status | circ_notice_diff_status | 91/131 |
| Notice significance | intact_notice_significance | circ_notice_significance | 92/132 |
| Curiosity about other | intact_curiosity_about_circ | circ_curiosity_about_intact | 88/126 |
| Prior thought level | intact_prior_thought_level | circ_prior_thought_level | 96/140 |
| PPP awareness | intact_ppp_awareness | circ_ppp_awareness | 86/128 |
| PPP impact | intact_ppp_impact | circ_ppp_impact | 87/129 |

*Note: Column 103 is used for both resentment (circ) and is the regret_feeling meta tag. Verify exact mapping against the Questions PDF.

## Site Architecture

### View Modes

1. **Curated Findings** — Editorial narrative path with 7 themed sections
2. **All Questions** — Full question index by category (~94 quantitative columns)
3. **Mirror Pairs** — 18 parallel question pairs in split-screen format
4. **The Witnesses** — Observer Pathway dedicated section (n=37)
5. **Demographics Dashboard** — Interactive cross-tabulation playground

### Question Card Component

Every question renders as a card with:
- **Left:** Donut pie chart (distribution questions) or grouped mini bars (1-5 scale)
- **Right:** Question text, pathway label, response option list with percentages
- **Pathway toggle:** Defaults to "Born Circumcised" combined for anatomy-specific questions
- **Hover interaction:** Pie segments highlight ↔ legend rows sync
- **Share button:** Reveals URL anchor + citation text
- **Quote gallery** (if available): Curated anonymous quotes below the chart

### Mirror Card Component

Split-panel layout showing two pathways' responses to parallel questions side by side. Includes:
- Language-sensitivity callout when asymmetric framing is used (e.g., resentment vs regret)
- Horizontal bar distributions with the same color scale
- Pathway attribution with emoji and full pathway name

### Navigation

- **Sticky top nav:** ☰ Navigate button (opens sidebar), logo, view mode pills, Methodology button, Take Survey CTA
- **Left sidebar drawer:** Collapsible, contains search + Curated Findings + Mirror Pairs + Observer + Full Question Index by category
- **Methodology modal:** One-click access to ethical framework, survey design, limitations

## Ethical Guidelines

### Qualitative Response Handling

1. Tone personally reviews and selects every quote that appears on the site
2. Remove or generalize any references to specific locations, workplaces, family configurations
3. Select quotes that represent common themes, not extreme outliers
4. Always show voices from multiple pathways in the same gallery
5. Each quote includes only: the question it was answering and the pathway — nothing more
6. Footer disclaimer: "Anonymous quotes selected from open-ended responses. All identifying details removed."

### Data Presentation Ethics

1. Never present data in a way that shames individual parents — critique the system, not individuals
2. The 47.6% "routine/automatic" finding is framed as evidence of systemic failure, not parental ignorance
3. Satisfied circumcised respondents' data is always visible and not minimized
4. Small sample warnings when filtered populations drop below n=20
5. Minimum n=5 for any displayed percentage
6. Limitations are always one click away via the Methodology modal

### The Anti-Vaxxer Firewall

The intactivist position is the global scientific consensus — the US is the outlier. This is the OPPOSITE of anti-science movements. The site never conflates bodily autonomy advocacy with vaccine skepticism. If this topic comes up in the agent's responses, it must be addressed directly and clearly.

## Deployment

### Infrastructure

- **Hosting:** Cloudflare Pages (free tier, unlimited bandwidth)
- **Domain:** findings.circumsurvey.online (CNAME to Cloudflare Pages)
- **Build:** React (Vite), `npm run build`, output to `dist/`
- **CI/CD:** Push to `main` branch → auto-deploy in ~30 seconds
- **LLM API (Phase C):** Cloudflare Worker + Anthropic API (Claude Haiku)

### Build Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Regenerate aggregates from latest CSV
python scripts/aggregate.py data/raw/responses.csv > src/data/aggregates.json

# Full rebuild and deploy
python scripts/aggregate.py data/raw/responses.csv > src/data/aggregates.json
npm run build
# Push to GitHub — Cloudflare auto-deploys
```

## Strategic Partners

- **Intact Global** (Eric Clopper) — Summit host, movement leadership
- **GALDEF** (Tim Hammond) — Legal strategy, equal protection litigation
- **Doctors Opposing Circumcision (DOC)** — Medical professional alliance
- **WIBM** — Advocacy partner
- **Bloodstained Men** — Public awareness, protest actions
- **Intact America** — Major advocacy organization

## Key Findings (for Agent Context)

These are the headline numbers from the n=496 dataset. Update these when the dataset grows:

- **Pleasure from Mobile Skin gap:** Intact 4.47 vs Circumcised 1.96 (Δ 2.52, 56% drop) — largest single finding
- **Light Touch Sensitivity gap:** Intact 4.24 vs Circumcised 2.24 (Δ 2.00, 47% drop)
- **Resentment (born-circumcised combined):** 86% report some level, 63% strong & frequent, only 14% "no, never"
- **Resentment (restoring only):** 0% said "no, never" — every single restoring respondent reports negative feelings
- **Orgasm confidence "something is missing":** Intact 4.5%, Circumcised 48.2%, Restoring 59.6%
- **Lubrication never needed:** Intact 55.5%, Circumcised 5.5% (10:1 ratio)
- **Future sons - keep intact:** Intact 88.8%, Circumcised 78.1%, Restoring 98.1%, Observer 90.9%
- **Future sons - circumcise:** Intact 0%, Restoring 0%, Observer 3.0%, Circumcised 8.5%
- **Bodily autonomy priority:** Intact 96.4%, Circumcised 81.3%, Restoring 100%, Observer 97.0%
- **How circumcision was handled:** 47.6% routine/automatic, 23.2% no idea, only 2.7% neutral pros/cons
- **Curiosity about other anatomy:** 67.8% of circumcised often wonder about intact vs 27.3% of intact often wonder about circumcised
- **Father-son cycle:** 67.1% of circumcised have circumcised fathers; 48.9% of intact have intact fathers
- **Aesthetic preference:** 52% of circumcised men prefer the intact appearance
- **Demographics cross-tabs:** "Keep intact" majority holds across ALL age groups, political orientations, income levels, and religiosity levels

## Agent Persona (Phase C)

When building the contextual query agent, its system prompt should embody:

1. **The Inquiry Frame** — curious, open, evidence-based, never preachy
2. **Data literacy** — always caveats self-reported data, sample size, self-selection bias
3. **Ethical sensitivity** — never shames parents, acknowledges complexity, respects all experiences
4. **The Accidental Intactivist's perspective** — an intact person who grew up as an anatomical outlier in the US, bringing comparative observation to a topic most people never examine
5. **First principles** — "There is no therapeutic benefit to routine infant circumcision that outweighs the ethical violation of permanently altering a healthy child's body without their consent"

The agent should always:
- Cite specific data points with pathway labels and n-counts
- Acknowledge when a question falls outside the dataset's scope
- Suggest related questions the visitor might want to explore
- End with an invitation to take the survey if the visitor hasn't already
- Never reproduce individual qualitative responses — only reference curated quotes that appear on the site
