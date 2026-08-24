# CircumSurvey — Preliminary Results Explorer

**The Accidental Intactivist's Inquiry** — Phase 1 Interactive Data Explorer

An independent, anonymous survey of 496+ respondents documenting the lived experiences of intact, circumcised, and restoring individuals, along with partners, parents, and healthcare professionals.

## 🔗 Links

- **Survey site:** [circumsurvey.online](https://circumsurvey.online)
- **Take the survey:** [Google Forms](https://forms.gle/FQ8o9g7j1yU3Cw7n7)
- **Substack:** [The Accidental Intactivist](https://theaccidentalintactivist.substack.com)
- **Reddit:** [r/FriendsOfTheFrenulum](https://reddit.com/r/FriendsOfTheFrenulum)

## 📊 About This Project

This repository contains the interactive data explorer for Phase 1 preliminary findings. The site presents comparative response data across six survey pathways:

- 🟢 The Intact Pathway (n=140)
- 🔵 The Circumcised Pathway (n=210)
- 🟣 The Restoration Pathway (n=109)
- 🟠 The Observer, Partner & Ally Pathway (n=37)
- 🔴 The Trans Pathway
- ⚪ The Intersex Pathway

## 🏗️ Project Structure

```
circumsurvey/
├── CLAUDE.md              ← Project context for AI-assisted development
├── docs/
│   ├── DESIGN_PLAN.md     ← Comprehensive website design plan
│   └── TECHNICAL_REQUIREMENTS.md ← Infrastructure & hosting plan
├── data/
│   └── raw/               ← Raw CSV (LOCAL ONLY, never committed)
├── scripts/               ← Python data aggregation scripts
├── src/                   ← React Frontend (Cloudflare Pages)
│   ├── components/        ← React components
│   └── styles/            ← CSS / design system
├── worker/                ← Backend API (Cloudflare Workers + D1)
│   ├── src/               ← API routes, AI Docent logic, Sankey queries
│   └── eval/              ← ACRUE AI Safety & Quality Evaluation Suite
├── public/                ← Static assets
└── reference/             ← Design motif references
```

## 🔐 Architecture & Data Security

This project utilizes a modern serverless edge architecture:
- **Frontend**: React application hosted on Cloudflare Pages.
- **Backend**: Cloudflare Worker API providing dynamic query aggregations.
- **Database**: Cloudflare D1 SQL database serving distributions and cohorts.
- **AI Copilot**: Cloudflare Workers AI + Vectorize powering the "Docent" research assistant.
- **Safety Guards**: Automated ACRUE evaluation suite guards against PII leakage, prompt injection, and causal overreach.

- Raw survey CSV is **never committed** to this repository
- Qualitative quotes are individually curated and reviewed
- No personally identifiable information exists in the dataset by design

## 🎨 Design: "Tomorrow's Bureau"

The site uses a hybrid design language combining mid-century modern optimistic geometry (Josefin Sans, rainbow accents, warm cream palette) with ruled-form documentary structure (dotted leaders, red stars, black header bars, justified text blocks).

See `docs/DESIGN_PLAN.md` for the full design specification and `reference/` for visual motif samples.

## 👤 Author

**Tone Pettit** — Independent researcher, Seattle, WA
- tone@circumsurvey.online
- [circumsurvey.online](https://circumsurvey.online)

## 🤝 Strategic Partners

Intact Global · GALDEF · Doctors Opposing Circumcision · WIBM
