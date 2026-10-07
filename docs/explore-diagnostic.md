# Explore the Data — Holistic Review & Diagnostic

*Prepared for: Tone Pettit · CircumSurvey / findings.circumsurvey.online*
*Scope: the `/explore` side of the site (`src/explore/**`, served via `src/pages/ExplorePage.jsx`) and its live data layer (`worker/src/index.js`).*

---

## 1. Executive Summary

The Explore side is in good structural health and — importantly — it is **honest data**. Every distribution, count, and pathway breakdown is pulled live from the D1 database through the Worker API, not hardcoded or fabricated. I verified the live counts against the seed: **501 respondents** (142 intact, 213 circumcised, 109 restoring, 37 observer) and **355 questions** across the pathway architecture. Those numbers are real.

What it is *not yet* is a "science-museum-grade interpretive tool." Right now it reads as a clean, competent **data dashboard** — exactly the thing your own `CLAUDE.md` design language warns against ("Design Anti-Patterns: Generic dashboard"). The bones for something far more beautiful and engaging are present; they're just not switched on. Three things hold it back the most:

1. **The signature comparative power of the survey is barely exposed.** The API can already slice any question by generation, religion, and country of birth, and can stack cohort filters — but the UI only ever asks for one pathway breakdown and silently applies one demographic filter at a time. The single most unique thing about this dataset (cross-comparing populations) is the least developed part of Explore.
2. **The color system has a fundamental collision.** Pathway-identity colors and response-distribution colors are *the same six hex values*, used on the same screen for two different meanings — the exact thing your design spec calls a "critical rule" not to do.
3. **Two navigation destinations are broken** (Universal and Synthesis in the Pathway Map both silently fall back to showing the Intact pathway), and the qualitative human voice — central to the whole project — is absent from Explore.

None of these are deep architectural problems. They're a focused punch-list. The rest of this document is that list, ordered so you can triage.

---

## 2. What's There Now — Inventory

The Explore experience is three "exhibits" sharing one shell, one design-token file, and one API client.

### Exhibit A — The Master Index (`IndexPage.jsx`)
The front door. A two-panel layout: a sticky left rail (survey-map navigation + a "Filter by Cohort" demographic selector + a link to the Pathway Map) and a right-hand scrolling list of all 355 questions, grouped by survey phase → section. Each question renders as a `QuestionRow` with a tiny inline distribution "sparkline," an `n=` badge, a pathway tag, and a Tier-1 ("curated") badge. There is live search, a three-state relevance toggle (My Pathway / Relevant / All), and lazy-loading of distributions via IntersectionObserver as rows scroll into view. This is the strongest of the three exhibits.

### Exhibit B — The Pathway Map (`PathwayPage.jsx`)
A survey-architecture diagram: a left rail of "pathway cards" (Universal → the six branches → Synthesis) and a right panel that expands the selected pathway's sections into clickable question lists. The Observer pathway gets a dedicated sub-role breakdown (Partner, Parent, Expectant Parent, Healthcare Provider, Advocate, Woman, Curious/Researcher, Multi-hat), with lovely touches like "rare · precious" tags for the n=1 expectant parent. This is the most editorially distinctive exhibit — and the one with the two broken destinations (see §4).

### Exhibit C — The Question Detail (`QuestionPage.jsx`)
The deepest view. For a single question it shows: a stacked horizontal distribution bar, a per-option legend with counts and percentages, an optional **cohort overlay** (compare a demographic subgroup against the full sample), and a **"By pathway"** breakdown (one mini-bar per pathway). Open-text questions show a graceful "not available yet" placeholder. This is where the cross-comparison story should live, and where the most upside is.

### Shared infrastructure
- `styles/tokens.js` — the palette, fonts (Playfair / Barlow / Barlow Condensed / JetBrains Mono), the rainbow rule, and the global CSS. Faithful to the brand.
- `lib/pathways.js` — canonical pathway metadata, n-values, survey phases, observer sub-role classifiers. Solid single source of truth.
- `lib/api.js` + `worker/src/index.js` — the live data layer. Endpoints: `/count`, `/questions`, `/sections`, `/aggregate`, `/response-distribution`, `/geo`, `/health`. The Worker is well-built; **it already supports more than the front end uses.**

---

## 3. Data Fidelity — Verdict: PASS (with two caveats)

Exhibits draw from real responses. I cross-checked the seed database:

| Metric | Live DB | Explore UI shows | Verdict |
|---|---|---|---|
| Total respondents | 501 | 501 | ✓ |
| Intact | 142 | 142 | ✓ |
| Circumcised | 213 | 213 | ✓ |
| Restoring | 109 | 109 | ✓ |
| Observer | 37 (stored as NULL pathway) | 37 | ✓ count, ⚠ see below |
| Questions | 355 | 355 | ✓ |

**Caveat 1 — Observer respondents have `pathway = NULL` in the database, not `"observer"`.** The count works because the Worker's `/count` maps NULL → a bucket, but it has a real downstream effect: the **"By pathway" breakdown on Question Detail groups by `resp.pathway`, so Observer answers to universal/synthesis questions are bucketed as "unknown" and never appear as the Observer row.** Observers silently vanish from exactly the cross-pathway comparisons where their outside perspective is most interesting. (Fix: set `pathway='observer'` on those 37 rows, or `COALESCE(pathway,'observer')` in the Worker queries.)

**Caveat 2 — Cross-site number drift.** Explore (live, 501/142/213) is *newer* than the narrative "Special Report" side, which still hardcodes the older 500+/140/210/319 figures (`src/data.js`, `LandingPage.jsx`). The Explore numbers are the correct ones; the narrative side is stale. A visitor who reads "140 intact" in the report and then sees "142 intact" in Explore will notice. Recommend reconciling the narrative side to the live figures (and ideally driving its headline numbers from `/count` too). `CLAUDE.md`'s own key-findings block (n=496, 140, 210) is also stale and should be refreshed.

---

## 4. Correctness Bugs (fix before launch)

**B1 — Pathway Map: Universal and Synthesis cards are unreachable.**
In `PathwayPage.jsx`, `selectedKey = pathway || "intact"`. The Universal card's click handler sets `pathway: null` (→ resolves back to `"intact"`), and the Synthesis card sets `pathway: "synthesis-view"` (→ no matching key → falls back to `PATHWAY_CARDS.intact`). Net effect: **clicking either card shows the Intact pathway and never highlights as selected.** Two of the eight architecture destinations are dead. Fix: use sentinel keys that actually resolve (e.g. `pathway: "universal"` / `"synthesis"`) and let `selectedKey` honor them.

**B2 — Observer never appears in "By pathway."** See §3 Caveat 1.

**B3 — `colorForLabel` mis-colors categorical questions.** The distribution color heuristic (`MiniSparkline.jsx`) is a regex that maps response *text* onto a red→blue "negative→positive" spectrum. That's perfect for Likert/ordinal questions and meaningless-to-misleading for categorical ones. "Canada," "Hindu," "Libertarian" all fall through to grey; "Conservative / traditional" → grey; partial matches collide ("depends" → orange/negative, "somewhat" → neutral). On any demographic or nominal question the sparkline and stacked bar are either all-grey or arbitrarily tinted, **implying a value judgment that isn't there.** Recommend: gate spectrum coloring to ordinal questions only, and use a neutral categorical ramp (or pathway/qualitative palette) for nominal questions. This is both a correctness and an elegance issue.

**B4 — The multi-dimensional cohort filter only applies one dimension.** `DemographicFilterBar` lets the user set Generation *and* Country *and* Politics *and* Religion, and the helper text implies stacking ("add more to stack"). But `cohortToFilterParam` (`api.js`) deliberately takes only `entries[0]` — "Worker currently supports one filter at a time." So a user who builds "Gen Z + USA + liberal" silently gets just "Gen Z." The UI is writing a check the API doesn't cash. Either (a) constrain the UI to one dimension until the Worker supports multi-filter, or (b) upgrade the Worker to accept multiple `filter=` params (the SQL change is small — chain the JOINs/WHEREs). Given cross-comparison is your priority, (b) is the better investment.

---

## 5. Label & Color Inconsistencies

### 5.1 The core color collision (highest priority)
`CLAUDE.md` states a "critical rule": pathway-identity colors must not collide with the response-distribution spectrum, "because [they] use the same colors for different purposes." In `tokens.js` they are **literally identical**:

| Color | Pathway meaning | Spectrum meaning |
|---|---|---|
| `#5b93c7` blue | Intact | "Most positive" |
| `#d94f4f` red | Circumcised | "Most negative" |
| `#e8c868` yellow | Restoring | "Neutral" |
| `#e8a44a` orange | **Observer** | "Negative" |
| `#a0a0a0` grey | *(spec wants Observer here)* | N/A / opt-out |

On the Question Detail page a stacked bar (spectrum colors) sits inches from pathway labels (pathway colors) drawn from the same five hex values. A yellow segment means "neutral" in the bar but "Restoring" in a label; a red segment means "most negative" but also "Circumcised." This is the spec's exact forbidden case. **Recommendation:** give the pathways a distinct identity ramp (or desaturate/outline-only treatment) so identity and sentiment never share a swatch on the same screen.

### 5.2 Observer color contradicts the spec
`CLAUDE.md` assigns Observer **grey `#a0a0a0`**; `tokens.js` (and every component) uses **orange `#e8a44a`** — which is also the spectrum's "negative." So the neutral Observer/Ally pathway is painted in the "negative" color throughout. Pick one and propagate it (the spec's grey also resolves part of 5.1).

### 5.3 Emoji ↔ color mismatch (clarity)
Pathway emojis and pathway colors disagree by design: 🟢 Intact is colored blue, 🔵 Circumcised is colored red, 🟣 Restoring is colored yellow, 🟠 Observer is colored orange. This is inherited from `CLAUDE.md` itself, so it's "as specified," but in a museum context where a visitor reads a green dot next to a blue chart it genuinely confuses. Worth a deliberate decision: either align emoji to color, or add a one-line legend that defuses it.

### 5.4 Hardcoded counts that will silently go stale
The live `/count` endpoint exists but isn't used to populate display strings. These are hand-typed and several are already drifting:
- Masthead: **"501 Voices · 8 Pathways · 355 Questions"** — *"8 Pathways" is wrong.* There are six pathways (or seven counting Born-Circumcised combined). Likely a leftover. Recommend "6 Pathways" or drive it from data.
- `PathwayChips`: "All · 501" (hardcoded).
- `RelevanceToggle`: "All 355"; `IndexPage` LoadingNotice "Loading 355 questions"; EmptyNotice "Show all 355 questions."
- `pathways.js` n-values (142/213/109/37) — correct today, but a second hand-maintained copy of numbers the DB already knows.

As soon as the dataset grows (which the survey is actively collecting), all of these go wrong at once. Recommend sourcing them from `/count` + `/questions?counts=1`.

### 5.5 Terminology
`CLAUDE.md` language rule: "**Pathways not cohorts.**" Explore uses "Cohort" prominently for the demographic filter ("Filter by Cohort," "Cohort size," "this cohort's responses"). Here "cohort" means a demographic subgroup, which is a *different* concept from a pathway — so it's defensible — but the collision of vocabulary is worth a conscious call. Consider "Filter by Group / Population / Segment" to keep "pathway" as the only membership word, or explicitly define "cohort" once in a tooltip.

---

## 6. Cross-Comparison — The Biggest Opportunity

This is the part you flagged as the survey's signature, and it's where Explore is furthest below its potential. The capability is *already in the Worker* — the front end just doesn't reach for it.

**What the API can already do but the UI never asks for:**
- `GET /aggregate?q=…&by=generation` — any question sliced by generation
- `…&by=religion` — by religious tradition
- `…&by=country_born` — by country
- `…&by=pathway` *with* `&filter=…` — a pathway breakdown *within* a demographic cohort (e.g., "future-son intentions, by pathway, among USA-born Millennials")
- Per-pathway **means** (`avg`) for Likert questions — returned by `/aggregate` and currently thrown away

**What the UI does today:** one `by=pathway` call, one single-dimension cohort overlay (full sample vs one subgroup), distributions only (means ignored).

**Recommendations, in rough priority:**

1. **A "Compare by" pivot on Question Detail.** A small control — Pathway · Generation · Religion · Country — that re-runs the existing `/aggregate` with a different `by`. This is the highest-leverage change in the whole document: ~one new control, zero new backend, and it turns every one of 355 questions into a multi-axis comparison instrument.

2. **Cohort A vs Cohort B (not just cohort vs whole).** Today you compare one subgroup against the full sample. Let the visitor pin two cohorts and see them side by side (the Worker already filters; you'd just issue two filtered calls and render two bars). "Liberal vs conservative on bodily autonomy," "USA-born vs UK-born on future sons" — these are the screenshots that travel.

3. **Surface Likert means and the gaps.** Your headline findings (the 2.52-point "mobile skin" pleasure gap, the light-touch gap) are *means*, and the API returns them per pathway — but Question Detail only draws categorical distributions. Add a numeric-mean comparison strip for 1–5 scale questions, with the inter-pathway delta annotated. This is where the "Money Shot" charts from your design spec (`The Pleasure Gap`, `The Confidence Gap`) belong as live, filterable exhibits rather than static images.

4. **Multi-dimensional cohorts (fix B4 properly).** Upgrade the Worker to chain filters so "Gen Z + USA + secular" actually works, then the cohort builder becomes the cross-comparison playground the Demographics Dashboard was envisioned to be in `CLAUDE.md`'s site architecture.

5. **A dedicated side-by-side "Mirror" exhibit in Explore.** The narrative side has 18 mirror pairs (intact-perspective vs circumcised-perspective on the same concept). None of that split-screen comparison exists in Explore. Even a lightweight version — pick a question, pick two populations, render two charts meeting in the middle — would give Explore its own signature comparative view.

6. **Small-sample guardrails (ethics + credibility).** `CLAUDE.md` ethics require a small-sample warning below n=20 and suppression below n=5. Explore currently renders any cohort distribution regardless of size, so a narrow filter (e.g., one country × one religion) can show a chart built on n=3 with no caveat. As you add cross-comparison, add the n<20 warning badge and n<5 suppression. This protects the project's scientific credibility, which is the whole brand.

---

## 7. Elevating to "Science-Museum-Grade"

Your design language (`CLAUDE.md`) describes scroll-triggered chart draw-ins, counters animating from zero, pie segments that morph between distributions, hover-sync between a chart segment and its legend row, and custom "Money Shot" SVGs. **Almost none of that interpretive motion is in Explore yet** — the only IntersectionObserver use is for lazy data loading, not animation. Closing that gap is what turns the dashboard into an exhibit.

- **Bring the human voice in.** The single biggest engagement gap: open-text questions show "contact the research team," and `voices.js` (the curated quotes, ~2,000 lines) is **not wired into Explore at all**. A museum exhibit pairs the chart with the testimony. Surface curated quote galleries beneath quantitative questions (you already have the Tier-1 curation flag to gate which questions get them), with the existing "all identifying details removed" disclaimer. This is the change visitors will *feel* the most.
- **Make charts interpretive, not just present.** Add the spec's hover-sync (segment ↔ legend), the 400–600ms draw-in on entry, and counters that count up. Consider donut/pie for nominal distributions per the component spec, reserving stacked bars for ordinal.
- **Add the interpretive "so what."** Tier-1 questions could carry a one-sentence curated takeaway (the Inquiry-Frame voice), turning a chart into a wall label. This is the difference between "here is the data" and "here is what the data shows."
- **Methodology & limitations one click away.** `CLAUDE.md` requires limitations always reachable; Explore has no methodology affordance. Add the modal the spec describes.
- **Resolve the dashboard feel.** The two-panel grid is efficient but generic. The masthead's rainbow rule and Playfair display are doing the brand work alone. Lean into the "Special Report" rhythm — section dividers, pull quotes, a touch of the cream/black alternation — so Explore reads as part of the publication, not a separate admin tool.

---

## 8. Prioritized Punch-List

**Must-fix before calling it complete**
1. B1 — repair Universal & Synthesis cards in the Pathway Map.
2. B2 — give Observer rows a real pathway value so they appear in comparisons.
3. 5.1 / 5.2 — resolve the pathway-vs-spectrum color collision; set Observer to its spec color.
4. 5.4 — fix "8 Pathways," and drive headline counts from `/count`.
5. B4 — stop the cohort filter from silently dropping dimensions (constrain UI or upgrade Worker).

**High-value elevation (the reason to do this project)**
6. "Compare by" pivot (pathway / generation / religion / country) on Question Detail.
7. Wire `voices.js` curated quotes into Explore.
8. Surface Likert means + inter-pathway deltas (the live "Money Shot" charts).
9. Cohort A vs Cohort B comparison.
10. Small-sample warnings (n<20) and suppression (n<5).

**Polish**
11. B3 — categorical vs ordinal color logic.
12. Chart interpretive motion (draw-in, hover-sync, counters).
13. Methodology/limitations modal.
14. Terminology pass on "cohort."
15. Reconcile narrative-side numbers (and `CLAUDE.md` key findings) with the live 501 dataset.

---

*The foundation here is genuinely strong: real data, a clean component model, and a Worker that's already ahead of the UI. The work ahead is less "rebuild" and more "switch on what you've already built" — especially the comparison engine that makes this survey unlike anything else in the space.*
