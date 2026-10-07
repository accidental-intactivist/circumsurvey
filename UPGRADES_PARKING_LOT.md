# Potential Future Upgrades (Parking Lot)

This document tracks architectural ideas, optimizations, and potential upgrades to consider as the "empire" (Circumsurvey / Advocacy Shell) scales.

## 1. System One Decision Models (e.g., Jev, Laya, Kev)

**Context:** We currently rely on generative "System Two" LLMs (like Cloudflare's `llama-3.1-8b-instruct-fp8` or Anthropic's Claude) for UI-blocking logic and structured data output. This often requires complex prompt engineering, regex to strip markdown (e.g., ````json`), and fallback logic when the LLM hallucinates malformed JSON.

**The Upgrade:** Introduce a "System One" decision model (like TypeSafe AI's Jev, or self-hosted open-source alternatives like Laya or CLM). These models do not generate text; they strictly output typed data (Enums, booleans, classification scores).

**High-Value Targets:**
*   **Zero-Latency UI Interactions (`suggest-actions.js`):** Instead of asking Llama 3 to generate 3 novel questions and formatting as JSON, use a decision model to instantly classify the user's highlighted text (e.g., `MEDICAL_POLICY`, `HISTORICAL`). Map that Enum to expertly pre-written questions on the frontend. This cuts latency from seconds to milliseconds and guarantees 100% reliability.
*   **The Anti-Vaxxer Firewall:** Use a decision model as a strict gatekeeper in front of the Phase C LLM. If the intent classifier detects `VACCINE_CONFLATION`, it deterministically intercepts the request and returns the static firewall text. This guarantees the LLM never goes off-script.
*   **Phase C Intent Routing:** Triage incoming natural language queries to decide whether to hit the embeddings search, return static methodology text, or reject the prompt.
*   **CMS Data Wrangling:** Classify qualitative survey data into the strict 50-category `taxonomy.sql` schema without worrying about the model hallucinating new categories or messing up the output schema.

**Cost/Viability Notes:**
*   Jev is a proprietary API, but very cheap (~$0.042 / 1M input tokens, free outputs). 
*   If we want to maintain a strict "free-tier friendly" infrastructure, we can look into self-hosting open-source decision models (like Laya or Kev) when the time comes.
