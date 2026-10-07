# Session Retrospective — 2026-06-22

**Scope:** Productionizing the AI Docent (the Phase-C contextual query agent)
and a consistency/quality pass across the Explore exhibits. Began with a
deprecated-model outage, ended with a tested, hardened, evaluated Docent wired
into CI — plus theming/terminology/privacy fixes across the exhibits.

**Repos:** Live code is the **nested `circumsurvey/`** project. Review docs and
retros live in the **outer** repo (`docs/`). Both `CLAUDE.md` files are kept in sync.

---

## 🟢 What shipped

### 1. Docent model migration (outage fix → upgrade)
- The Copilot ran on `@cf/meta/llama-3.1-8b-instruct`, **deprecated by Cloudflare
  on 2026-05-30** (error 5028). Replaced across all call sites.
- Synthesis now runs on **Gemini 2.5 Flash** via a provider switch
  (`synthesize()` → `callGemini()` with `callCloudflareChat()` fallback). Cheap
  routing (intent + tool selection) stays on Cloudflare Workers AI to conserve
  Gemini's free-tier quota. All behind env vars (`SYNTH_PROVIDER`, `GEMINI_MODEL`,
  `CF_SYNTH_MODEL`, `CF_ROUTER_MODEL`) so the model is a one-line swap.
- BGE embeddings / Vectorize RAG path left untouched (changing it would break the index).

### 2. Docent hardening (jailbreak / injection / safety)
- `DOCENT_SYSTEM` system instruction: tight scope, graceful refusal that still
  emits `<SUA>` redirects, no-prompt-reveal, no causal overreach, no PII.
- **Indirect-injection defense:** retrieved quotes + tool results are fenced in
  `<<<BEGIN_UNTRUSTED_DATA>>>…<<<END>>>` and the model is told never to obey
  instructions inside them (the corpus is user-generated free text).
- Gemini `safetySettings` tuned for a sexual-health survey (harassment/hate/
  dangerous = medium+; **SEXUALLY_EXPLICIT = BLOCK_ONLY_HIGH** so legitimate
  clinical discussion isn't blocked).
- Input length cap; tool-call **ID allowlist** (model can only query IDs we
  offered) on top of the existing privacy blocklist; optional llama-guard output
  guard behind `AI_OUTPUT_GUARD` (off by default — over-flags clinical content).
- Per-visitor rate limit (Cloudflare `[[ratelimits]]` binding) on `/ai/query`.

### 3. Source labeling (survey vs. about-the-survey)
- Worker now tags each retrieved source: `source_type` (`survey` |
  `documentation`), `source_label`, `source_detail` (via `decorateSources`).
- Chat "Sources Cited" no longer shows "Quote XX" for everything — it renders a
  type chip ("Survey Response" gold / "About the Survey" blue), the respondent
  voice or doc title, and pathway·generation (no geography). Cross-pathway button
  only on real respondent voices.

### 4. Tested logic module
- Extracted the Docent's deterministic logic to **`worker/src/copilotLib.js`**
  (intent parse, tool-call parse, allowlist validation, SUA extract/strip,
  untrusted fencing, source classification/labeling). The Worker imports it, so
  the tested code IS the production code.
- **`worker/test/copilot.test.js`** — 23 tests. Caught a real bug: the SUA parser
  dropped a suggestion when the model omitted a closing `</SUA>` tag; fixed the
  regex (lookahead terminator).

### 5. ACRUE evaluation framework
- **`worker/eval/`** — `acrue.js` (rubric + deterministic auto-checks + judge
  prompt/parse + scoring + aggregation), `cases.js` (16 cases: relevance-quant,
  relevance-qual, grounding, edge, safety), `run.js` (hits the live endpoint,
  auto-checks → LLM judge → report), `README.md`.
- **ACRUE = answer QUALITY**, judged 1–5: **A**ccurate, **C**omplete,
  **R**elevant, **U**seful, **E**xceptional. Safety/integrity is a SEPARATE hard
  gate — a failed gate fails the case regardless of quality (an eloquent jailbreak
  can't average its way to a pass).
- **`worker/test/acrue.test.js`** — 14 tests. Full suite now **37 passing**
  (`node --test`).

### 6. CI
- `.github/workflows/docent-tests.yml` — `node --test` on every push/PR to
  `worker/**` (no secrets/deps).
- `.github/workflows/docent-eval.yml` — weekly + manual live ACRUE run; fails the
  build if pass-rate < `MIN_PASS_RATE` (0.8) or safety < `MIN_SAFETY` (1.0);
  uploads `report.json`. **Needs repo secret `GEMINI_API_KEY`.**

### 7. Explore consistency / quality pass
- **`ExhibitHero` is catalog-driven** — color/icon/number derive from the exhibit
  catalog via route (theme-engine resolved). Added the standard card to the
  Survey Map; all existing cards now match their dashboard tiles.
- **Nav terminology → "Sections"** within exhibits (breadcrumb + dropdowns);
  museum "Exhibit" framing kept on hero/dashboard.
- **For Parents** exhibit fixed (prop-name mismatches were silently dropping all
  copy; broken pathway colors; missing breadcrumb + Docent context).
- **Emojis → React icons** in `ExhibitSectionHeading` (`Icon={…}` prop added).
- **Narrative privacy:** verbatim quotes attributed by generation only (geography
  stripped) in `NarrativeList` + `PleasureGapPage`.
- **Chat UX:** Docent drawer persists across navigation (no longer unmounts on
  close), a Clear button, and follow-up buttons no longer bloat the URL.
- Editorial voice softened from advocacy → descriptive in Restoration & Observer
  exhibits (let the data speak).

### 8. Review docs
- `docs/explore-diagnostic.md` and `docs/explore-exhibits-review.md` — holistic
  reviews of the Explore side (inventory, elevation roadmap, label/color
  inconsistencies, cross-comparison opportunities, privacy/ethics).

---

## ⚠️ Known issues / follow-ups
- **Stale counts:** Methodology card shows 496-era figures (210/140/109/37) under
  an n=501 header; live dataset is now **518**. Drive headline counts from `/count`.
- **`SmallSampleBadge`** (n<5 suppress, n<20 warn) is wired into only ~4 of ~16
  exhibits — extend everywhere (review doc §4).
- **Pathway color drift:** a few exhibits still hardcode non-canonical pathway
  colors (Forward View circ=blue, Restoration restoring=purple) — route through
  tokens (review doc §5).
- **Exhibit numbering** still has collisions across catalogs (review doc §5).
- A second inline `CopilotChat` lives on the By-the-Numbers page; the global
  drawer is now the persistent one — consider consolidating.

## 🧭 Deploy / run notes
- Worker changes require `npm run deploy` from `worker/`. `GEMINI_API_KEY` set via
  `wrangler secret put` (and as a GitHub Actions secret for the eval workflow).
- Tests: `cd worker && node --test`. Live eval: `node eval/run.js`.
- **Sandbox caveat:** `node_modules` is Windows-built; native esbuild/vite/vitest
  won't run on Linux agents. Use `node --test` (Worker is pure JS) and a
  CRLF-normalized `@babel/parser` for JSX syntax checks.

## 🗂 Key files touched
```
circumsurvey/worker/src/index.js            # model swap, hardening, lib wiring
circumsurvey/worker/src/copilotLib.js        # NEW — tested Docent logic
circumsurvey/worker/wrangler.toml            # rate limit binding + env vars
circumsurvey/worker/test/copilot.test.js     # NEW
circumsurvey/worker/test/acrue.test.js       # NEW
circumsurvey/worker/eval/{acrue,cases,run}.js + README.md   # NEW
circumsurvey/.github/workflows/docent-{tests,eval}.yml      # NEW
circumsurvey/src/explore/components/{ExhibitHero,ExhibitSectionHeading,
  InlineBreadcrumb,ExploreMasthead,CopilotChat,GlobalDocentDrawer,NarrativeList}.jsx
circumsurvey/src/explore/pages/{PathwayPage,ForParentsPage,PleasureGapPage,
  RestorationJourneyPage,ObserverLensPage}.jsx
docs/explore-diagnostic.md, docs/explore-exhibits-review.md   # reviews
CLAUDE.md (+ circumsurvey/CLAUDE.md)         # Agent Work Log & conventions
```
