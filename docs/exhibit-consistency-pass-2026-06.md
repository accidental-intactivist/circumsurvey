# Exhibit Consistency & Polish Audit — June 2026

A pass across all visitor-facing Explore exhibits, following the Mirror Pairs
polish work (pill-color alignment + emoji→icon). Goal: the same level of
professionalism everywhere — consistent, memorable, beautiful, insightful,
intuitive.

**Method:** read the exhibit catalog (`ExploreMasthead.jsx` → `ROUTE_META` /
`EXHIBIT_ROUTES`) and the shared chrome (`ExhibitHero`, `InlineBreadcrumb`,
`ExhibitSectionHeading`, `IconifyEmoji`, `tokens.js`), then swept every page in
`src/explore/pages/` for: raw emoji in the UI, typography-token misuse, toggle/
pill divergence, geography-in-attribution privacy regressions, and hero/
breadcrumb consistency.

**Headline finding:** the suite is in good shape. The shared components
(`ExhibitHero` is catalog-driven; `IconifyEmoji` maps emoji→Lucide icons;
design tokens are centralized) already enforce most consistency. Mirror Pairs
was an outlier, not the norm. The remaining gaps are small and mostly cosmetic.

---

## Fixed this pass (clear wins)

| # | File | Change |
|---|------|--------|
| 1 | `MirrorPairsPage.jsx` | Shuffle control glyph `↺` → `RefreshCw` icon (finishes the no-raw-emoji pass on this page). |
| 2 | `QuestionPage.jsx` | Both docent affordances `🤖` → `Sparkles` icon, matching the masthead's "Ask A Docent" iconography. |

(Plus the prior session: Mirror Pairs sort pills recolored to the Pleasure-Gap
Green/Yellow/Red, and 🟢🔵✨ → `IconifyEmoji`/`Sparkles`.)

All edits are element-for-element JSX swaps; nesting preserved. Verified via the
authoritative file view.

---

## Recommendations — flagged for Tone's call

### P1 — Naming inconsistency: "Docent" vs "Copilot"
The contextual AI assistant is called three different things:
- `CLAUDE.md` canonical: **Docent**
- Masthead button: **"Ask A Docent"** (`ExploreMasthead.jsx`)
- Question detail: **"AI Copilot"** (`QuestionPage.jsx:310, 558`)

Recommend standardizing on **Docent** site-wide. This is a copy decision (not a
mechanical fix), so left untouched. Low effort, high polish payoff.

### P2 — Raw emoji glyphs in chrome (not routed through `IconifyEmoji`)
These render as literal emoji rather than themed icons, against the
"no emojis in the UI" convention. `IconifyEmoji` already maps most of them, so
the fix is usually just wrapping them (or using `Icons.jsx`):

- `ReportBuilderPage.jsx:215–230` — export buttons `📊 📝 📸 🖨️`. Most visible
  case. Suggest `BarChart2 / FileText / Camera / Printer` (Camera/Printer need a
  direct Lucide import; the others exist in `Icons.jsx`).
- `IndexPage.jsx:390` — `💡` hint span; `:642–644` — religious sub-labels
  embed `🌐 ✡️ ✝️ ☪️` as raw text inside template strings (needs minor
  restructuring to drop in `IconifyEmoji`).
- `QuestionPage.jsx:513–517` — suggestion-list strings prefixed with `💬 📊`.

Deferred because they touch tool/index chrome and a couple need new icon
imports — worth doing, but each is a small judgment call.

### P3 — Functional glyphs (acceptable, listed for completeness)
`ByTheNumbersPage.jsx` uses `✓ ✗ ↑ ↓ ⚠ ⇄` in the quiz/delta UI. These read as
UI symbols, not "emoji slop." Optional: quiz `✓/✗` → `CheckCircle2/AlertCircle`
for crispness. Low priority.

### P4 — `ExhibitSectionHeading` legacy `icon` prop
`AdultExperiencePage.jsx` and `RestorationJourneyPage.jsx` pass emoji to the
legacy `icon=` prop (e.g. `icon="📙"`, `icon="🟣"`). These **render correctly**
as icons via `IconifyEmoji`, so it's not a visual bug — but the convention
prefers `Icon={Component}`. Cosmetic/code-hygiene only.

### Toggle/pill idioms — reviewed, NOT recommending forced unification
Exhibits use a few distinct control idioms, and they mostly map to control
*purpose*, so this is defensible variety rather than inconsistency:
- **Outlined pill** (radius 20, `bgCard` active): Narrative Mirrors, Observer
  Lens role tabs.
- **Inset segmented control** (radius 8 wrapper / radius 6 buttons): Pleasure
  Gap, Correlations, Question detail.
- **Gold-outline card** (radius 8, gold border): Culture & Generations lens.
- **Color-coded pathway pill** (pathway-color fill/border): Pleasure Gap cohort
  toggles, Mirror Pairs sort (now aligned).

If you want a single canonical control style, that's a deliberate design
decision worth its own pass — flagging rather than silently rewriting.

---

## Not issues (verified)
- **Phase-2 stubs.** `TheDecisionPage`, `FinalThoughtsPage`, `TransIntersexPage`
  are 25-line "Coming Soon (Phase 2)" placeholders — intentionally bare, so the
  missing hero/breadcrumb there is by design, not a gap.
- **Geography.** Used only in aggregate (Demographic Explorer). Quote
  attribution stays pathway+generation only (enforced in shared components per
  convention #1). No regressions found.
- **`ExhibitHero`.** Catalog-driven; explicit `color`/`BackgroundIcon` props on
  pages are harmless fallbacks (catalog wins). Consistent across built exhibits.
- **`FONT.mono`.** ~53 uses, virtually all correct (stat numbers / IDs / data).

---

## Environment note for future agents
The Linux shell mount (`/sessions/.../mnt/`) lagged behind the authoritative
Windows filesystem during this session — it intermittently served stale,
truncated snapshots and once showed phantom trailing NUL bytes. The Read/Edit
tools (Windows paths) are the source of truth. **Verify file integrity and JSX
via the Read tool, not bash `cat`/`wc`/parser on the mount**, and avoid writing
files back through bash (risk of writing a stale view over a good file).
