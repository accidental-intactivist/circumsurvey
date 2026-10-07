# CLAUDE.md — CircumSurvey Preliminary Results Site

## Project Overview

This is the interactive data explorer for **The Accidental Intactivist's Inquiry** — an anonymous survey of 500+ respondents documenting the lived experiences of intact, circumcised, and restoring individuals, along with partners, parents, and healthcare professionals.

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
- **Resentment (circumcised as infants combined):** 86% report some level, 63% strong & frequent, only 14% "no, never"
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

---

## 🛠 Agent Work Log & Active Conventions

> Multiple agents work on this repo. This section records recent cross-cutting
> work and the conventions you must keep. Full narrative: `docs/retros/`.

### 2026-07-09 — "THE UNDERLOOM" — scroll-choreographed background (Guided Tour)
NEW: `circumsurvey/src/components/GuidedTour/LoomChoreography.jsx` — the
UNDERLOOM (masthead has the Harmonic Loom; this is the loom beneath the
report): one fixed TRANSPARENT canvas behind the whole tour; 64 threads morph
between 7 named formations keyed to station anchors (#st01…#st14 +
prologue/epilogue). SHARES THE MASTHEAD'S DIALECT: the quiet ribbon runs the
red→gold→blue spectrum, and the Harmonic Loom's holographic GLISTEN pass now
rakes across EVERY formation (glint values IMPORTED from `LOOM_CONFIG` in
HarmonicCanvas.jsx — single source of truth; adjust there, not in CFG).
CASTING lives in the `REGIONS` array at the TOP of LoomChoreography.jsx
(station-anchor → formation-key). This is the SOLE source of truth for the
production tour; the prototype uses per-section data-f attributes instead, so
the two CAN desync — if a formation "never appears on the site but shows in
the prototype," check REGIONS first (2026-07-09: st07/st10 had drifted to
"flow", so the spirograph/pendulum was cast to ZERO stations and convergence
showed 4×, reading as "duplicate backgrounds"; restored st07+st10=pendulum,
st06=pulsar). Current casting: prologue=TARTAN (directly under the masthead,
the quiet ribbon read as a HarmonicCanvas duplicate — keep ribbon away from
the masthead's neighborhood), st05=tron, st01=CONVERGENCE, demo-band+st03=
canyon (flight continues through the Separation), st02=moire, st06=pulsar,
st07=PENDULUM, st09=moire, st08=quiet, st04=TARTAN (crossed bands = cross-
tabs), st10=PENDULUM, st11=moire, st13=quiet, st12=pulsar, st14=CONVERGENCE,
epilogue=quiet. The Demonstration
band's embedded HarmonicCanvas was REMOVED — that band yielded to the
Underloom (translucent bgDeep, `#demonstration-band` is a canyon anchor, the
flight starts as the lights go down). GuidedTour.jsx no longer imports
HarmonicCanvas; the masthead SquishHeader keeps its own.
Formations: quiet ribbon (HarmonicCanvas parent-curve DNA, 45% amp,
masthead spectrum), harlequin TARTAN
(crossing diagonal sett bands, 2-pt lines — replaced the full ribbon loom,
which Tone flagged as too similar to the masthead), beam racer (grid floor +
light-cycles), canyon flight (wireframe terrain flythrough),
moiré + saw-tooth blips, PENDULUM harmonograph — now a SPIROGRAPH SIMULATOR:
real gear semantics (gearRing/gearWheel teeth → petal advance = 2π·w/(R−w);
penHole → loop size) drive a Coral-Records / 70s-HB slinky-torus wreath whose
pen draws CONTINUOUSLY (newest loop inks, oldest dissolves as the pen returns;
draw=0 → complete static figure); 3 token families, counter-precessing.
GLINT SYNC: GLN.scatter default dropped to 0.12 (masthead-coherent rakes);
formations may override via F.scatter (convergence keeps 0.45 rain).
PULSAR STACK (Unknown Pleasures / CP 1919: the canyon's inverse — flat-on
stacked signal rows in --c-text, peaks waking in a center channel; now cast
at st12 By the Numbers, replacing the canyon repeat), spirograph THE TIN
(PEN.variety detunes each family's gears, spreads sizes, and swaps wheel
shapes — circle / rounded triangle / rounded square via cos(m·θ) radius
breathing — so the three figures differ like real Spirograph wheels; NOW
PER-FIGURE RIGS: PEN.figs[3] each own gearRing/gearWheel/penHole/size/ecc/
twist/shape/lobe, tuner has a Fig 1/2/3 radio that re-targets the sliders;
shared pen: draw/prec/sway/spreadX. 2026-07-09 LATER PASS: figures are now
TRUE HYPOTROCHOIDS — each of the 21 threads per figure carries one
consecutive arc of the actual pen trace (closes after wheel/gcd revs, points
= ring/gcd, exactly the SpirographicArt pattern-guide arithmetic); tuner has
Ring-105 PRESET chips (Sunflower-35 / 7-Star / 5-Star / Daisy-7 / Loops-15 /
Net-105) that stamp the selected figure; each figure wears ONE solid
strand-group color (red/gold/blue, per Tone). FIREWORKS MODE (PEN.mutate,
default ON): each figure inks in → holds (PEN.hold) → dissolves → rerolls
into a random Ring-105 pattern-guide figure at a random spot, staggered
thirds — they come and go like fireworks; figs[] (each now with px/py home
position — stack two for compound patterns) seed only the first volley.
Spirograph glints densified via per-formation glint override (F.glint =
{interval:6, width:0.55}, supported engine-wide in glisten()). GLACIER FLYOVER: built, then REVERTED same day — Tone judged it lost the
Separation's drama; the ORIGINAL canyon flight (CAN config, mono lbl→blu
ramp) is restored and is the keeper. SPIROGRAPH PACING MELLOWED (Tone:
"too hyperkinetic"): glints are now ONE cohesive sync wave — F.glint.sync
(engine-wide option) forces same direction + same clock for all threads, the
inking-order cascade alone carries a single luminous pulse through all three
figures (pendulum glint {interval:16, width:0.3, sync:true}, scatter 0.5);
prec 0.11→0.04, hold 0.6→1.0. THEN EVOLVED (video review): F.glint.crisscross
(engine-wide) = TWO counter-running waves per thread, second cascading from
the opposite end half a period behind — holographic trails that repeat and
CROSS on the figures as the pen draws (pendulum glint {interval:8, width:0.4,
speed:0.5, tint:0.12, crisscross:true}); vis-gate means trails only appear on
inked arcs; per-formation tint override supported (gi.tint). QUIET-RIBBON TREATMENT promoted
to house style via spec3(t) red→gold→blue ramp: canyon = spectrum across
depth (warm foreground→cool horizon), moiré = two half-spectrum gradients
interfering, tron lanes = spectrum across the floor, pendulum = full spectrum
along each figure's inking order (offset per figure); hue(i) follows the
ramps so glint families stay hue-true. pulsar stays mono (JD), flow keeps
--path-* (semantic), tartan keeps its sett. Also fixed: tourKit ShareTools
referenced missing Icons.Share2 → whole tour white-screened; themed Share2
added to Icons.jsx),
convergence + glisten (streaks brighten each thread's own token toward
--c-textBright — never off-palette). GLISTEN FAMILIES ARE HUE-BINNED like the
masthead: every formation exposes hue(i) — its threads' positions on the
red→gold→blue spectrum (masthead colorPos, discretized) — and glint families
bin on that axis, so warm threads glint together and cool threads answer from
the opposite direction; monochrome formations (canyon) fire only their own
lane, and streak hue is seeded from hue(i)*60. GLINT CHOREOGRAPHY 2.0: the
stagger is a STRUCTURED CASCADE, not random — formations declare order(i)
(canyon: depth, a pulse receding into the scene; spirograph: inking order,
glints chase the pen; convergence: height) and may override scatter; streak
alpha is coupled to the thread's own visibility (faint far rows carry faint
glints); perspective formations declare span(i) so streaks ride only the
VISIBLE part of a line (canyon near rows now carry foreground beam riders
instead of glinting off-screen).
DESIGN NORTH STAR (Tone, 2026-07-09): dense RULED-MESH OVERLAPS — sheets of
closely-spaced parallel rings/lines crossing to weave net-like moiré lattices
(see the Coral-sleeve details he circled). Prefer formations and glint
choreography that create sheet-through-sheet crossings (twisting ring stacks,
counter-moving glints on overlapping families) over isolated clean curves.
PALETTE POLICY (2026-07-09, after Tone noted vaporwave/evergreen backgrounds
looked identical): decorative formations use theme-REACTIVE --c-* data colors
so every theme repaints the Underloom; --path-* tokens are universal semantic
anchors by design and are reserved for the convergence streams only. Wired in `GuidedTour.jsx` (content div
raised to zIndex 1). MASTHEAD GATE: draws NOTHING (zero CPU) above the first
station anchor — the SquishHeader zone belongs to HarmonicCanvas exclusively;
fades in at the prologue. PERF: DPR capped 1.25 (1 low-power), per-line point
budgets via `pts(i)` (straight grid/moiré lines = 2 pts; detail only where
curvature lives), 30/24fps caps. WIDTHS: HarmonicCanvas-style depth-scaled
strokes (ribbon belly ~3.8px × sizeScale), all multiplied by ENG.lineWidth
(default 1.6, tuner-exposed) so the Underloom sits in the masthead's weight
class; glint widths ride the same multiplier.
PAUSE: the masthead's pause button rules ALL looms — SquishHeader's
toggleLoom dispatches `cs-loom-pause` (and persists `cs_loom_paused`); the
Underloom listens + reads the key on mount. PAUSED = FROZEN FRAME, not blank
(Tone's call, 2026-07-09, after a persisted pause read as a site outage):
HarmonicCanvas draws exactly ONE frame then holds it (pausedHeld flag — the
only non-sacred edit ever made to the masthead file: 3 lines in the pause
path + a resize reset; drawing pipeline untouched); the Underloom freezes T
and its glint clock but re-renders one static frame whenever scroll/viewport
changes, so a paused page still shows the correct formation at every station.
DEBUGGING NOTE: both looms "down" with zero console errors almost certainly
means `cs_loom_paused=true` in localStorage, NOT a code failure.
DISCIPLINE: morphs only in gutters between stations;
motion damps to 30% at scroll-rest; alpha budget ≤~0.35; prefers-reduced-motion
freezes drift; ALL colors via resolveCssColor tokens (no palette flips
mid-scroll — Tone's explicit direction: respect the theme's stated palette,
canvas paints no backgrounds). Tuning: constants live in CFG at top of the
component; the interactive tuner (sliders + hints + copy-config, harmonic-tuner
granularity) is `loom-choreography-v2.html` in the workspace root (standalone
draft with the same math + THEME ENGINE chips; v1 kept for lineage).

### 2026-07-02 — Special Report retooled as theme-native "Guided Tour"
NOW THE FRONT DOOR: `/` renders SpecialReportPage (old landing moved to
`/landing`, `/special-report` redirects to `/`). The tour intro opens with the
researcher's letter ("The 'Why' Behind This Inquiry"), Inquiry-Frame edited
with Tone: advocacy lines ("bring readers over to the side of…", "dictates
sexual dysfunction", "overwhelmingly dissatisfied") cut/moved off the data
floor; 86% resentment figure labeled circumcised as infants combined (circ-only is
79%). `/special-report` body replaced: ScrollyEngine (v1 acts) is no longer rendered
by the page. New `circumsurvey/src/components/GuidedTour/` (tourData.js,
tourKit.jsx, TourVisuals.jsx, GuidedTour.jsx) walks all 14 exhibits in catalog
order — ExhibitHero-consistent station cards (tint/border/topbar/kicker/
watermark via Icons.jsx), Accidental-Intactivist "lens" copy (report, never
argue), dotted-leader data cards, a projection-gated "Demonstration" band
(HarmonicCanvas laser + dumbbell separation), convergence sankey, and per-
station deep links to `/explore#/<route>`. Fully theme-engine native: C/FONT
tokens + `var(--path-*)` + color-mix tints — verified live in-browser across
paper/light, amber, and colorblind (Wong) toggles. SquishHeader kept as
masthead; its dummy nav buttons now anchor-link to stations (#st01…#st14).
Reuses real Explore chrome: `ExhibitCard` gemstone tiles (now exported from
ExhibitsDashboard with optional `href`/`onClick` overrides) render the tour
map grid (tiles jump to stations), and `GlobalFooter` (route="special-report",
navigate → `/explore#/<route>`) provides the Master Index directory + next-
exhibit block. FIXED: SquishHeader's `overflow:hidden` was clipping the
ThemeToggle Display Settings panel — overflow moved to a canvas-only clipping
wrapper, and the ThemeToggle + Explorer CTA moved out of the dock-gated nav so
Display Settings are always reachable. SquishHeader now collapses 1:1 with
scroll (all tweens duration:1 over `innerHeight*0.85 − 70`, scrub:true, like
ExploreMasthead) with theme-aware glass when scrolled. The tour opens with a
"Before you enter — The Inquiry & Its Method" intro (origin + 4-point
condensed methodology + links), and Station 01 embeds the REAL
`SurveyFlowchart` board (wrapped in `ReportProvider`; navigate crosses to
`/explore#/<route>`) — Tone wants the board-game flow aesthetic leaned into
going forward. SurveyFlowchart search fixed (affects /explore#/pathways too):
search now activates at 2+ chars via `effectiveQuery`, the `grouped` memo's
missing `searchQuery` dep was repaired (stale counts made EVERY node claim
matches, so one keystroke expanded the whole board), and a "Collapse All"
button beside the search bar clears query + nodes + sections + pins. Search
also "lights the route": matching fork ribbons glow at 0.95 opacity with an
animated dashed current (`sf-flow-anim`) down their spine + drop-shadow glow,
non-matching ribbons dim to 0.06 (`searchActive` prop on
UniversalForkConnector). CHARTS OVER TABLES (Tone's direction): the tour's
dotted-leader DataRows ledgers were replaced with `BarRows` (tourKit) animated
color bars everywhere, and Station 03's Demonstration now embeds the REAL
`PleasureGapWidget` (self-fetching, theme-native) instead of a custom
dumbbell + pooled table; the projection gate keeps a one-line pooled summary.
Prefer embedding real exhibit visuals over restating data as text.
DOCKED NAV: the flat station anchors were replaced with the ExploreMasthead
pattern — "Findings" wordmark + scrollspy `BreadcrumbDropdown` (reused from
Explore) showing the current station, full 14-station tour in the dropdown,
smooth-scroll onSelect. Scrollspy = last #stNN above y=140, rAF-throttled.
EDITORIAL PASS (scrollytelling practices): methodology card → `MethodPillars`
(icon + 3-word label + one line); 3 `PullStat` full-width display-number
interstitials as breathing moments (4.47 vs 1.96 / 2.7% / 433 of 500); all 14
station lens strings cut to wall-text length (≤2 sentences, ≤23 words).
Editorial rules for this page: one idea per viewport, numbers as display
type, dense→light rhythm, wall text under 40 words. NOTES: (a) tour
numbers are the frozen 500-milestone snapshot and drift from live API values
(e.g. mobile-skin 4.47/1.96 vs live 4.46/2.00) — `scripts/freeze_phase1.js`
(planned) is the single stamp; (b) SquishHeader's docked bar uses a hardcoded
dark glass rgba — slightly off in light modes, pre-existing; (c) design
lineage: `circumsurvey/docs/SPECIAL-REPORT-V2-BLUEPRINT.md` + standalone
prototypes `special-report-v2…v7*.html` in the workspace root (iteration
artifacts, not deployed).

### 2026-06-22 — Docent productionization + Explore consistency pass
Live code lives in the **nested `circumsurvey/`** project (Worker at
`circumsurvey/worker/`, Explore at `circumsurvey/src/explore/`).

Shipped this session:
- **AI Docent (Worker):** replaced the deprecated `@cf/meta/llama-3.1-8b-instruct`
  (sunset 2026-05-30); synthesis now runs on **Gemini 2.5 Flash** via env, with a
  Cloudflare fallback and cheap CF routing. Added a security layer, per-visitor
  rate limiting, an output-source labeling system, a unit-tested logic module,
  and an ACRUE evaluation framework + CI.
- **Explore UI:** catalog-driven title cards, "Sections" nav terminology,
  For-Parents fixes, emoji→React-icon conversion, narrative privacy hardening,
  clearer Docent chat (persistence + Clear + clean URLs).
- **Docs:** `docs/explore-diagnostic.md` and `docs/explore-exhibits-review.md`
  (holistic reviews of the Explore side).

### Active conventions — do not regress these
1. **Respondent attribution = pathway + generation ONLY.** Never show geography
   (state/province/country) for a quote — re-identification risk. Enforced in
   `components/NarrativeList.jsx` and `worker/src/copilotLib.js` (`formatSourceLabel`).
2. **`ExhibitHero` is catalog-driven.** Color, icon, and number derive from
   `EXHIBIT_ROUTES` (color/icon) + `ROUTE_META` (kicker) by route, resolved
   through the theme engine. To restyle an exhibit, edit the catalog in
   `components/ExploreMasthead.jsx` — don't hardcode hero color/icon per page.
3. **No emojis in the UI.** Use the React icon set in `components/Icons.jsx`.
   `ExhibitSectionHeading` takes `Icon={IconComponent}` (preferred over the
   legacy emoji `icon` prop).
4. **Exhibits vs "Sections" terminology is ACTIVELY MANAGED BY THE TEAM — do
   NOT change nav wording in automated/consistency passes.** It has been flipped
   back and forth; leave `InlineBreadcrumb`/masthead wording exactly as found
   unless Tone explicitly asks. (Current intent: breadcrumb crumb = "Exhibits".)
5. **Docent deterministic logic = `worker/src/copilotLib.js`** (intent/tool
   parsing, ID allowlist validation, SUA parsing, source labeling). It is the
   tested source of truth (`worker/test/copilot.test.js`); the Worker imports it.
   Don't fork this logic inline in `index.js`.
6. **Docent safety is layered, don't weaken it:** `DOCENT_SYSTEM` scope/refusal,
   retrieved content fenced as untrusted, Gemini `safetySettings` (keep
   SEXUALLY_EXPLICIT permissive so clinical discussion isn't blocked), input
   length cap, tool-ID allowlist, optional `AI_OUTPUT_GUARD`.
7. **Worker env:** `SYNTH_PROVIDER`, `GEMINI_MODEL`, `CF_SYNTH_MODEL`,
   `CF_ROUTER_MODEL`, `AI_OUTPUT_GUARD` (vars); `GEMINI_API_KEY` (secret).
   Worker changes require `npm run deploy` from `worker/`.
8. **ACRUE eval** (`worker/eval/`): ACRUE = answer QUALITY (Accurate, Complete,
   Relevant, Useful, Exceptional), 1–5. Safety is a SEPARATE hard gate. CI:
   `.github/workflows/docent-tests.yml` (unit, every push) and `docent-eval.yml`
   (live, weekly; needs `GEMINI_API_KEY` secret). Run locally: `node --test`
   and `node eval/run.js`.

### Known issues / not yet done
- **2026-06-22 update:** Explore headline counts are now LIVE via
  `src/explore/lib/useLiveCounts.js` (Methodology card, PathwayChips, Survey
  Map flowchart, Religious "Missing Congregation", masthead). Do NOT reintroduce
  hardcoded 501/355 on the Explore side — read from `/count` + `/questions`.
- OPEN (needs Tone's call): the *frozen* Special Report `src/data.js` is
  self-contradictory — the `demographics` block is 142/213/109/37 (=501) but the
  `pathways[]` block is 140/210/109/37 (=496). Pick one canonical snapshot and
  align both (and the "n=" labels in the narrative prose).
- `SmallSampleBadge` (n<5 suppress, n<20 warn) is not yet wired into every
  exhibit/chart — see `docs/explore-exhibits-review.md` §4.
- Sandbox caveat for agents: `node_modules` here is Windows-built, so native
  esbuild/vite/vitest won't run on Linux. Use `node --test` for the Worker
  (pure JS) and a CRLF-normalized `@babel/parser` for JSX syntax checks.
