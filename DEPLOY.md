# Deploy Guide — CircumSurvey Auto-Deploy Pipeline

## What This Gives You

Once wired up, your deployment pipeline works like this:

```
New survey responses in Google Sheets
        ↓ (daily at 6am UTC, or manual trigger)
GitHub Actions workflow
        ↓ fetches CSV, runs aggregate.py
Commit to src/data.js
        ↓ push to main
Cloudflare Pages auto-deploys
        ↓ (~30 seconds)
findings.circumsurvey.online updates with new n= count
```

You never have to touch anything. The site always shows current data.

---

## One-Time Setup Steps

### Step 1. Push all files to GitHub

Clone the repo, drop all files from this zip into it, commit, push.

```bash
git clone https://github.com/accidental-intactivist/circumsurvey
cd circumsurvey
# Copy everything from the zip into this directory (keeping the structure)
git add -A
git commit -m "Wire up Vite build + CI/CD pipeline"
git push
```

Cloudflare Pages should detect the push and build the site within ~30 seconds. Visit https://circumsurvey.pages.dev to confirm.

### Step 2. Create a Google Sheets API key

1. Go to https://console.cloud.google.com/apis/credentials
2. If you don't have a project yet, create one called "CircumSurvey"
3. Click **+ CREATE CREDENTIALS → API key**
4. Copy the key that appears
5. Click **RESTRICT KEY** (important for security)
6. Under "API restrictions", select "Restrict key" and check only **Google Sheets API**
7. Under "Application restrictions", leave as "None" (or restrict to IP if you're paranoid)
8. Click **SAVE**

### Step 3. Make sure the Google Sheet is readable

The Google Sheet must be accessible to anyone with the link (read-only is fine).

1. Open https://docs.google.com/spreadsheets/d/1o3oBEhZURuakY0Agz2oF46M3uceVvs92betP17rzfU4
2. Click **Share** in the top right
3. Under "General access", set to "Anyone with the link" → "Viewer"
4. Click **Done**

(The API key approach still needs the sheet to be readable. If you want it fully private, you'd need a service account instead — happy to set that up if preferred.)

### Step 4. Add GitHub Secrets

1. Go to https://github.com/accidental-intactivist/circumsurvey/settings/secrets/actions
2. Click **New repository secret**
3. Add two secrets:
   - Name: `SHEETS_ID`
     Value: `1o3oBEhZURuakY0Agz2oF46M3uceVvs92betP17rzfU4`
   - Name: `GOOGLE_API_KEY`
     Value: (paste the API key from step 2)

### Step 5. Test the workflow manually

1. Go to https://github.com/accidental-intactivist/circumsurvey/actions
2. Click on "Refresh Survey Data" in the left sidebar
3. Click **Run workflow** → **Run workflow** (green button)
4. Watch it run — should take ~30 seconds
5. If successful, you'll see either:
   - A new commit in your repo from `circumsurvey-bot` updating `src/data.js`
   - OR "No changes detected" (meaning the aggregated data matches what's already committed)

---

## What Runs When

| Trigger | What happens |
|---------|-------------|
| **Daily at 6am UTC** | Auto-refresh from Sheets → commit if changed → deploy |
| **Manual trigger** | Same, but you click a button |
| **Push to `aggregate.py`** | Re-runs aggregation (useful when you tweak the script) |
| **Push to `main`** | Cloudflare rebuilds the site (the aggregation doesn't re-run; last data.js is used) |

---

## Troubleshooting

**Workflow fails with "Bad Request"** — Most likely the Google Sheet isn't publicly readable, or the API key isn't restricted to Sheets API correctly.

**"No changes detected" but you added responses** — The data *was* fetched and re-aggregated, but the percentage distributions didn't change meaningfully (can happen if you only added 1-2 responses to a pathway with n=200+). Add a few more responses and it should pick up.

**Cloudflare Pages didn't deploy** — Check the Cloudflare dashboard. The build needs `package.json` + `vite.config.js` at the repo root — if either is missing, the build will fail.

**Workflow runs but commit fails** — The `GITHUB_TOKEN` default permissions need write access. Check Settings → Actions → General → "Workflow permissions" → must be set to "Read and write permissions".

---

## How to manually rebuild data locally

If you ever want to test aggregation without triggering the workflow:

```bash
# Export the sheet manually, save as data/raw/responses.csv
python3 scripts/aggregate.py data/raw/responses.csv src/data.js
npm run dev  # preview locally at localhost:5173
```

The raw CSV is gitignored and never ships — only `src/data.js` is committed.

---

## Extending the pipeline

When you're ready for **Phase C** (the LLM query tool), this same pattern extends naturally:
- Workflow fetches data + computes embeddings
- Writes to a static `src/embeddings.json`
- A Cloudflare Worker serves queries against it

All infrastructure stays free-tier friendly.
