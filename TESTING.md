# Testing Harness Guide

This repository contains a multi-layered testing harness designed to ensure both application stability and AI response quality before publication.

## 1. Unit Testing (Vitest)
Unit tests cover discrete functions, components, and data transformations.

- **Run all unit tests:**
  ```bash
  npm run test -- --run
  ```
- **Run in watch mode (for development):**
  ```bash
  npm run test:watch
  ```

## 2. Integration & Stress Testing (Playwright)
Playwright tests verify the critical paths and perform stress testing (like rage-scrolling) on the actual browser layout.

- **Run Playwright tests:**
  ```bash
  npx playwright test
  ```
- **Important:** Playwright is configured to automatically start the Vite dev server (`npm run dev`) before running tests. Make sure your `.env.local` contains the `VITE_CLERK_PUBLISHABLE_KEY` if testing locally. In CI, this is provided automatically.

## 3. AI Quality Evaluation (ACRUE)
The ACRUE (Accurate, Complete, Relevant, Useful, Exceptional) Evaluation Suite hits the live production endpoint to assess the AI Docent's response quality and safety.

- **Run the evaluation suite:**
  ```bash
  node worker/eval/run.js
  ```
- **Requirements:** 
  - To enable full 1-5 grading, you must set the `GEMINI_API_KEY` environment variable.
  - If `GEMINI_API_KEY` is not set, the suite runs in "Auto-check Only" mode. In this mode, qualitative grading is bypassed, and the suite only enforces hard safety gates (e.g., rejecting prompt injections, blocking off-topic requests). The CI pipeline is configured to tolerate a 0% pass rate as long as the safety checks pass.
- **Reports:** The results are saved to `worker/eval/report.json`.

## GitHub Actions CI
All three test suites run automatically in GitHub Actions:
- **Docent Eval (`docent-eval.yml`)**: Runs the ACRUE suite against the live production endpoint.
- **Weekend Soak Test (`weekend-soak-test.yml`)**: Runs both Vitest and Playwright suites to continuously monitor build stability.
