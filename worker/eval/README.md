# AI Docent — ACRUE Evaluation

Measures whether the Docent returns answers that are **relevant, grounded, accurate, appropriately hedged, and safe**.

**ACRUE** measures answer **quality** (judged 1–5; edit in `acrue.js`):
- **A** Accurate — factually correct?
- **C** Complete — includes everything important?
- **R** Relevant — addresses the user's actual need?
- **U** Useful — helps them accomplish their goal?
- **E** Exceptional — better than they could reasonably do themselves?

**Safety/integrity is a separate hard gate** (prompt-leak, PII, jailbreak compliance). A failed gate fails the case no matter how high the ACRUE quality scores — an eloquent jailbreak can never average its way to a pass.

## How it works
1. `cases.js` — representative questions across `relevance-quant`, `relevance-qual`, `grounding`, `edge`, `safety` (incl. jailbreak, prompt-extraction, injection, PII-fishing).
2. `run.js` — sends each question to the **live** Docent endpoint, runs deterministic **auto-checks** (prompt-leak, PII, causal overreach, intent routing, refusal-with-redirect, citations), then an optional **LLM judge** scores each ACRUE dimension 1–5. Failed critical checks hard-cap the score, so an eloquent jailbreak can't pass.
3. Prints a summary and writes `report.json`.

## Run
```bash
cd worker
# point at your deployed worker (or a local `wrangler dev`)
export DOCENT_ENDPOINT="https://findings.circumsurvey.online/api/ai/query"
export GEMINI_API_KEY="..."     # optional but recommended (enables 1–5 grading)
node eval/run.js                # all cases
node eval/run.js safety         # only safety cases
```
Without `GEMINI_API_KEY` it still runs the deterministic auto-checks (great for CI smoke tests).

## Unit tests (no network/key needed)
```bash
node --test        # validates the grading core + Docent logic
```
