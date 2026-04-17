# CircumSurvey Technical Infrastructure Plan
## From Prototype to Production — A Budget-Conscious Roadmap

**For:** Tone Pettit
**Date:** April 2026
**Context:** You last hosted on Dreamhost with WordPress. The landscape has changed completely. This plan explains what you need, why, and how much it costs at each phase.

---

## The Big Picture: You Need Less Than You Think

The single most important thing to understand about modern web hosting in 2026 is this: **you don't need a traditional server for most of what you're building.**

The old model (Dreamhost, GoDaddy, Bluehost) was: rent a server, install WordPress, the server runs 24/7 whether anyone visits or not, and you pay monthly regardless. That model still exists but it's overkill for your use case.

The new model is: your site is a set of static files (HTML, CSS, JavaScript, JSON data) that get deployed to a global CDN (Content Delivery Network). There's no server "running" — the files just sit there, served from whichever edge location is closest to the visitor. The React app we've been building runs entirely in the visitor's browser. No server processing needed.

This means **Phase A and B of the site cost $0/month to host.** Seriously.

The only time you need a "server" (or more precisely, a serverless function) is when you want to:
1. Call the Anthropic API for the LLM query tool (Phase C)
2. Authenticate Substack subscribers (Phase C)
3. Serve a dynamic API for researchers (Phase D)

Everything else is static files on a CDN.

---

## Architecture by Phase

### Phase A & B: The Static Site (Summit → Post-Summit)
**Cost: $0–5/month**

```
                    ┌─────────────────────┐
                    │   circumsurvey.online │
                    │   (your domain)       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Cloudflare Pages    │
                    │   (free tier)         │
                    │   - Unlimited BW      │
                    │   - 500 builds/mo     │
                    │   - Global CDN        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   React App (static)  │
                    │   - Question Explorer │
                    │   - Mirror Pairs      │
                    │   - Demographics      │
                    │   - Embedded JSON data│
                    └───────────────────────┘
```

**What gets deployed:** A built React application (static HTML/CSS/JS files) plus a JSON data file containing all the pre-computed aggregates. No database. No backend. No server.

**How the data works:** Your Python scripts process the CSV and output a structured JSON file. This JSON file ships with the React app. All filtering, toggling, and searching happens in the visitor's browser using JavaScript. Nobody's hitting a server when they click between pathways — they're just re-rendering data that's already loaded.

**Hosting recommendation: Cloudflare Pages**

Why Cloudflare over Vercel or Netlify:
- **Unlimited bandwidth on the free tier.** If your site goes viral after the Summit or gets linked in a news article, you won't get a surprise bill. Vercel and Netlify both have bandwidth caps on free tiers.
- **300+ global edge locations.** Fastest CDN of the three.
- **$0/month** for everything you need in Phase A and B.
- **Custom domain support** on free tier. You'd point a subdomain like `findings.circumsurvey.online` to it.
- If you ever need serverless functions (Phase C), Cloudflare Workers are available at $5/month with extremely generous limits.

**How deployment works:**
1. You push code to a GitHub repository
2. Cloudflare Pages detects the push, runs the build command (`npm run build`)
3. The built files are deployed globally in ~30 seconds
4. Your custom domain serves the new version

You don't SSH into anything. You don't FTP files. You push to GitHub and the site updates. This is the modern equivalent of what Dreamhost used to do, but faster, free, and with a global CDN.

**Domain setup:**
Your domain (circumsurvey.online) is presumably already registered and hosted somewhere. You'd either:
- Add a CNAME record for `findings.circumsurvey.online` pointing to Cloudflare Pages, or
- If you want to migrate the whole domain to Cloudflare DNS (recommended — their free DNS is the fastest in the world), you'd transfer nameservers and then set up Pages for the subdomain.

---

### Phase C: The LLM Query Tool (Weeks 3–6)
**Cost: $5–25/month**

This is where you need actual compute — but only a tiny amount.

```
                    ┌─────────────────────┐
                    │   React Frontend      │
                    │   (still static)      │
                    └──────────┬──────────┘
                               │ API call
                    ┌──────────▼──────────┐
                    │   Cloudflare Worker   │
                    │   (serverless fn)     │
                    │   - Auth check        │
                    │   - Rate limiting     │
                    │   - Query routing     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Anthropic API       │
                    │   (Claude Haiku)      │
                    │   - RAG over findings │
                    │   - ~$0.001/query     │
                    └───────────────────────┘
```

**What's new:** A single Cloudflare Worker (serverless function) that:
1. Receives the user's natural language query
2. Checks if they're authenticated (Substack subscriber) or under the free rate limit
3. Retrieves relevant pre-computed findings from an embedded vector store
4. Sends the findings + query to Claude Haiku via the Anthropic API
5. Returns the synthesized answer to the frontend

**Cost breakdown:**
- Cloudflare Workers Paid: **$5/month** (includes 10 million requests/month — you'll use a tiny fraction)
- Anthropic API (Claude Haiku): **~$0.001–0.005 per query**
  - 100 queries/day = ~$0.30/day = ~$9/month
  - 1,000 queries/day = ~$3/day = ~$90/month (this would mean massive traction)
  - Realistically, budget **$10–20/month** for API costs in the early months

**The vector store:** For a dataset of ~500–1,000 pre-computed finding snippets, you don't need a hosted vector database. You can:
- Pre-compute embeddings using a lightweight model
- Store them as a JSON file (a few MB)
- Do cosine similarity search in the Worker function itself
- This costs $0 and adds ~50ms of latency

If you later need a proper vector database (10,000+ findings, sub-10ms retrieval), Cloudflare Vectorize is available at $0.01/1M queries.

**Authentication for Substack subscribers:**
The simplest approach is a shared secret or token system. Substack doesn't have OAuth, but you can:
- Generate unique access tokens for paid subscribers
- Distribute them via a Substack-exclusive post
- The Worker validates the token before allowing unlimited queries
- Free visitors get 10 queries/session (tracked via a session cookie)

---

### Phase D: Research API & Growth (Ongoing)
**Cost: $5–50/month depending on usage**

```
                    ┌─────────────────────┐
                    │   Public Site         │
                    │   (Cloudflare Pages)  │
                    └───────────────────────┘

                    ┌─────────────────────┐
                    │   Research API        │
                    │   (Cloudflare Worker) │
                    │   - Token auth        │
                    │   - Rate limited      │
                    │   - Aggregate queries │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Cloudflare D1       │
                    │   (SQLite database)   │
                    │   - Aggregate data    │
                    │   - Query logs        │
                    │   - Usage analytics   │
                    └───────────────────────┘
```

**What's new:** A lightweight SQLite database (Cloudflare D1) that stores:
- Pre-computed aggregate data in queryable form
- API usage logs and analytics
- Researcher access tokens and permissions

This is only needed if you want to offer programmatic access to the aggregate data for allied researchers. For most purposes, a downloadable CSV with a data-use agreement is simpler and sufficient.

**Cloudflare D1 pricing:** Free tier includes 5 million rows read and 100K rows written per day. More than enough for years.

---

## Cost Summary

| Phase | Monthly Cost | What You Get |
|-------|-------------|-------------|
| A & B (Summit + Post-Summit) | **$0** | Full interactive site, unlimited traffic, global CDN, custom domain |
| C (LLM Tool) | **$15–25** | Cloudflare Workers ($5) + Anthropic API (~$10–20) |
| D (Research API) | **$5–50** | Database + API + analytics |
| Domain renewal | **~$12/year** | circumsurvey.online |

**Total realistic budget for the first 6 months: $100–200.** That's it. No $30/month Dreamhost plan. No database hosting. No server maintenance.

---

## What You'd Need to Learn (and What You Already Know)

Given your background in software engineering and data science, here's what maps to skills you have and what's new:

**Things you already know how to do:**
- Write Python scripts to process CSV data → JSON aggregates
- Build React components (you've been building them in our sessions)
- Use Git and GitHub for version control
- Think about data structures and API design

**Things that are new but straightforward:**
- **Cloudflare Pages setup:** ~30 minutes to connect GitHub repo and configure build. Their dashboard is intuitive.
- **Cloudflare Workers:** Writing serverless functions in JavaScript. If you can write a Node.js Express route handler, you can write a Worker — the syntax is nearly identical.
- **Anthropic API calls:** You've seen the pattern in our React prototypes. It's a fetch() call with your API key.

**Things you can defer or skip:**
- Docker, Kubernetes, containerization — not needed
- Database administration — not needed until Phase D, and D1 is zero-config
- SSL certificates — Cloudflare handles this automatically
- Server security, patching, updates — there's no server to maintain

---

## Recommended Setup Steps

### Right Now (Pre-Summit)

1. **Create a Cloudflare account** (free) at cloudflare.com
2. **Create a GitHub repository** for the findings site code
3. **Connect the repo to Cloudflare Pages** — takes 5 minutes
4. **Configure your build:**
   - Framework: React (Vite or Create React App)
   - Build command: `npm run build`
   - Output directory: `dist` or `build`
5. **Add a custom domain:** `findings.circumsurvey.online` (CNAME record)
6. **Push the v4 prototype code** — the site goes live globally

### After the Summit

7. **Set up the data pipeline:**
   - Python script: CSV → JSON aggregates
   - Include in the build process so data updates are automatic
8. **Get an Anthropic API key** for Phase C development
9. **Prototype the Cloudflare Worker** for the LLM query endpoint
10. **Set up Substack subscriber authentication** (token-based)

---

## Migration Path from circumsurvey.online

Your current circumsurvey.online site (home, about, FAQ, resources) presumably runs on some existing hosting. You have two options:

**Option A: Keep existing hosting for the main site, add Cloudflare for findings.**
- Main site stays where it is (Google Sites? Squarespace? WordPress?)
- findings.circumsurvey.online is a separate Cloudflare Pages deployment
- Easiest, no disruption to existing site

**Option B: Migrate everything to Cloudflare.**
- Transfer DNS to Cloudflare (free, fastest DNS in the world)
- Rebuild main site as static pages on Cloudflare Pages
- findings.circumsurvey.online as a separate Pages project
- More work upfront but cleaner long-term architecture
- Would require rebuilding the main site, which may not be worth it now

**Recommendation: Start with Option A.** Get the findings site live on a subdomain. Migrate the main site later if/when it makes sense. Don't let infrastructure work delay the Summit launch.

---

## Tools & Accounts You'll Need

| Tool | Purpose | Cost | Priority |
|------|---------|------|----------|
| **Cloudflare** account | Hosting, CDN, DNS, Workers | Free (Pages), $5/mo (Workers) | Now |
| **GitHub** account | Code repository, version control | Free | Now |
| **Node.js** (local) | Build tooling for React app | Free | Now |
| **Anthropic API** key | Claude Haiku for LLM queries | Pay-per-use (~$0.001/query) | Phase C |
| **VS Code** or similar | Code editor | Free | Now |
| **Python 3** (local) | Data processing scripts | Free | Now |

---

## A Note on Security

Since you're handling survey data, even anonymized:

- **The raw CSV never ships to the browser.** Only pre-computed aggregates in JSON form.
- **The Anthropic API key lives in a Cloudflare Worker environment variable**, never in client-side code. Visitors can't see or steal it.
- **Rate limiting** on the LLM endpoint prevents abuse (both cost and content).
- **No personally identifiable information** exists in the dataset by design (no emails, IPs, or names were collected).
- **Cloudflare provides DDoS protection** automatically on all plans, including free.

You don't need to think about server hardening, firewall rules, or SSH access because there is no server. The attack surface is essentially zero.

---

## Comparison: Old World vs New World

| | Dreamhost (2010s) | Cloudflare Pages (2026) |
|---|---|---|
| Server | Shared Linux box in a data center | No server — files on a global CDN |
| Deployment | FTP files to the server | Push to GitHub, auto-deploys in 30 sec |
| Database | MySQL on the same server | None needed (or D1 at edge for pennies) |
| SSL | Buy a certificate, install it manually | Automatic, free, always on |
| Scaling | Your server gets slow when traffic spikes | CDN handles any traffic level |
| Security | You manage updates, firewall, patching | Cloudflare handles everything |
| Cost | $10–30/month whether anyone visits or not | $0/month for unlimited traffic |
| CMS | WordPress (PHP, plugins, updates) | React app (no CMS needed) |
| Uptime | 99.5% if you're lucky | 99.99% (Cloudflare's SLA) |
| Backups | You set up cron jobs | Git history IS your backup |

---

*The bottom line: you can host a world-class interactive data exploration site for $0/month, add an AI-powered query tool for $15–25/month, and never think about server maintenance, security patches, or scaling. The infrastructure is the easy part. The hard part — the survey, the data, the ethical framework, the community — you've already done.*
