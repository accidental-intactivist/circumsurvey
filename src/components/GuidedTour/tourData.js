// ═══════════════════════════════════════════════════════════════════════════
// Guided Tour — station catalog + frozen Phase-1 snapshot data.
//
// TOUR mirrors EXHIBIT_ROUTES (ExploreMasthead) so numbers, icons, and colors
// always match the exhibition. Colors are CSS-var strings resolved by the
// theme engine — colorblind + theme + mode reactive by construction.
//
// DATA is the frozen 500-respondent milestone snapshot. Every number here is
// slated to be stamped by scripts/freeze_phase1.js — do not hand-edit values
// without updating the freeze source. (Live exhibit values keep moving; the
// Special Report is a frozen snapshot by design.)
// ═══════════════════════════════════════════════════════════════════════════

import { VOICES_THEMES } from '../../voices.js';

export const N_TOTAL = 500;

export const PATHS = {
  intact:      { label: "Intact",          n: 141, color: "var(--path-intact)" },
  circumcised: { label: "Circumcised",     n: 212, color: "var(--path-circumcised)" },
  restoring:   { label: "Restoring",       n: 110, color: "var(--path-restoring)" },
  observer:    { label: "Observer & Ally", n: 37,  color: "var(--path-observer)" },
};

// Stations — one per exhibit, in exhibit order. `route` = /explore#/<route>.
// Lens copy is WALL TEXT: two sentences max, strong lead, no throat-clearing.
export const TOUR = [
  { num: "01", route: "pathways",            icon: "Compass",           colorVar: "var(--c-blue)",
    chapter: "ch-who-took",
    title: "The Survey Map",    tagline: "Interactive survey architecture flowchart",
    exhibitTeaser: "Walk the full survey architecture yourself — hover over each pathway to see how many respondents traveled it, where the forks happen, and why the blinding matters.",
    lens: "Now that you've seen who showed up and where they came from, here's how the survey actually worked. Below is the routing architecture — a single entry point, blinded experience questions first, then a fork into separate pathways. Understanding this structure is essential to trusting the data that follows.",
    docentContext: "The user is looking at the overall survey pathways flowchart. Explain how the survey sorted respondents only after they answered the core sensation questions to prevent bias.",
    tourSuas: ["What can I learn from The Survey Map section?", "Why does blinding the experience questions matter?", "How many respondents traveled each pathway?"] },
  { num: "02", route: "pairs",               icon: "Scale",             colorVar: "var(--c-gold)",
    chapter: "ch-how-feel",
    title: "Mirror Pairs",      tagline: "Side-by-side cohort question contrasts",
    exhibitTeaser: "Browse all eighteen mirror-pair questions side by side. Filter by cohort, toggle between chart styles, and read every distribution in full.",
    lens: "Eighteen questions were asked twice — once from each side of the fence. The answers that came back are not subtle.",
    docentContext: "The user is looking at the 'Mirror Pairs' and the Resentment vs Regret contrast. Explain that 79% of circumcised respondents felt resentment, while intact respondents largely felt no regret. Stick to the data.",
    tourSuas: ["What can I learn from the Mirror Pairs?", "Which mirror pair shows the biggest asymmetry?", "Why do 86% of circumcised respondents report resentment?"] },
  { num: "03", route: "pleasure-gap",        icon: "Heart",             colorVar: "var(--c-green)",
    chapter: "ch-what-feel",
    title: "The Pleasure Gap",  tagline: "Sensation, sensitivity & orgasm ratings",
    exhibitTeaser: "Toggle cohorts on and off, switch between bar and dumbbell views, and examine the effect sizes yourself. Every metric, every comparison, every number — live and filterable.",
    lens: "Before we explore the emotional responses, let's look at the raw physical data. Every respondent rated the same six sensation metrics — before the survey ever asked about circumcision status. Below are the results, grouped by cohort only after the fact.",
    docentContext: "The user is looking at the Pleasure Gap and the 'mobile skin' effect size (Cohen's d = 1.78). Explain what mobile skin is mechanically and why this represents the largest gap in the entire dataset.",
    tourSuas: ["What can I learn from The Pleasure Gap?", "What does a Cohen's d of 1.78 mean in plain language?", "Why is mobile skin the widest gap?"] },
  { num: "04", route: "correlations",        icon: "Grid",              colorVar: "var(--c-red)",
    chapter: "ch-witnesses",
    title: "Correlations Explorer", tagline: "Cross-tabulate demographic predictors",
    exhibitTeaser: "Build your own cross-tabulations. Pick any demographic slice — age, geography, politics, religion — and see how the data flow across variables.",
    lens: "A skeptic's reasonable question: is this just one kind of person answering? Below, we cross-tabulate circumcision status against demographics like father's status, age, and geography — so you can test whether the patterns hold across slices.",
    docentContext: "The user is looking at cross-tabulations, specifically how a father's circumcision status correlates with their intent for a future son. Explain the generational cycle the data reveals.",
    tourSuas: ["What can I learn from the cross-tabulations?", "Does a father's status predict the son's?", "Do the patterns hold across political identity?"] },
  { num: "05", route: "demographics",        icon: "Users",             colorVar: "var(--c-purple)",
    chapter: "ch-who-took",
    title: "Demographic Explorer", tagline: "Age, generation, geography & more",
    exhibitTeaser: "Explore the full census — interactive maps, generational breakdowns, and demographic filters that let you see exactly who these five hundred people are.",
    lens: "Before we get into the data, let's look at who actually showed up. The survey was spread primarily through grassroots efforts online. Initially aimed at North America, people from across the globe ultimately joined. Below: the geographic reach and the respondent census.",
    docentContext: "The user is looking at the respondent demographics. Confirm that this is a predominantly North American, self-selected sample of 500 people, crossing many occupations, generations, and political identities.",
    tourSuas: ["What can I learn from the demographics?", "How does the sample break down by generation?", "Is this sample representative of the general population?"] },
  { num: "06", route: "narrative-mirrors",   icon: "MessageSquareText", colorVar: "var(--c-orange)",
    chapter: "ch-how-feel",
    title: "The Voices · Narrative Mirrors", tagline: "Open-ended narratives & word clouds",
    exhibitTeaser: "Read the unedited open-ended responses, filter by theme, and explore the word clouds that reveal what each cohort chose to say when given a blank page.",
    lens: "Beyond the structured ratings, the survey also opened a blank text box and asked people to describe their experience in their own words. Below are the narrative mirrors — the word clouds and curated quotes that show how each cohort chose to talk about their bodies.",
    docentContext: "The user is looking at open-ended text responses from intact and circumcised respondents. Do not provide quotes, but summarize that intact respondents frequently mention 'natural' and 'no issues', while circumcised respondents frequently mention 'loss' and 'anger'.",
    tourSuas: ["What can I learn from the Narrative Mirrors?", "What themes appear most in circumcised voices?", "Do any circumcised respondents express satisfaction?"] },
  { num: "07", route: "culture",             icon: "Globe",             colorVar: "var(--c-ltBlue)",
    chapter: "ch-world-told",
    title: "Culture & Generations", tagline: "Norms, stereotypes & generational shifts",
    exhibitTeaser: "Trace how cultural norms shift across generations — from Silent to Gen Z — with interactive trend charts and stereotype-comparison tools.",
    lens: "The personal experience data is clear. Now: what did the world around them look like? Below, both sides answer the same question about the norms they grew up with — and describe two very different Americas.",
    docentContext: "The user is looking at cultural norms. Explain that circumcised respondents grew up in environments where the procedure was 'unquestioned' or pushed, while intact respondents grew up where it was 'not discussed' or 'neutral'.",
    tourSuas: ["What can I learn from Culture & Generations?", "How have attitudes changed from Boomers to Gen Z?", "What percentage grew up where circumcision was automatic?"] },
  { num: "08", route: "observer-lens",       icon: "Eye",               colorVar: "var(--c-grey)",
    chapter: "ch-observers",
    title: "The Observer Lens", tagline: "Partners, parents & professionals",
    exhibitTeaser: "See how partners, parents, and medical professionals each answered — broken out by role, with their own distributions and commentary.",
    lens: "Thirty-seven respondents answered about bodies that are not their own — sexual partners, parents who made the decision, and medical professionals. Below is what these independent observers reported.",
    docentContext: "The user is looking at the Observer cohort (partners, parents, medical professionals). Explain that 90%+ of these independent observers would choose to keep a future son intact.",
    tourSuas: ["What can I learn from The Observer Lens?", "Do partners notice a difference between intact and circumcised?", "What do medical professionals say?"] },
  { num: "09", route: "religious-mirrors",   icon: "BookOpen",          colorVar: "var(--c-blue)",
    chapter: "ch-world-told",
    title: "Religious Mirrors", tagline: "Faith, tradition & personal experience",
    exhibitTeaser: "Enter the Religious Mirrors exhibit to explore how the Jewish, Muslim, and Christian traditions responded, presented in full and side-by-side for comparison.",
    lens: "For many families, circumcision is not a medical decision but a covenant. The survey included optional sections for respondents from Jewish, Muslim, and Christian traditions. Below, three traditions answer the same respectful questions — each presented in full, unabridged.",
    docentContext: "The user is looking at religious correlations. Note that while this survey had optional faith sections, the primary story is about physical sensation and bodily autonomy across all backgrounds.",
    tourSuas: ["What can I learn from Religious Mirrors?", "How do Jewish respondents describe the tension between tradition and bodily autonomy?", "Do religious respondents differ on the future-son question?"] },
  { num: "10", route: "restoration-journey", icon: "RefreshCw",         colorVar: "var(--c-gold)",
    chapter: "ch-undone",
    title: "Restoration Journey", tagline: "Methods, progress & sensitivity gains",
    exhibitTeaser: "Follow the restoration timeline — methods used, years invested, RCI progress stages, and how sensation ratings shift at each milestone.",
    lens: "One hundred and ten respondents are actively restoring what was removed — a years-long, self-directed process with no medical support. Below: their methods, their progress, and how their sensation ratings compare to circumcised and intact baselines.",
    docentContext: "The user is looking at foreskin restoration. Explain that restoring respondents report partial regain of sensation (mobile skin rating 2.85 vs circumcised 1.96), but 100% of them still report some level of resentment for having to do it.",
    tourSuas: ["What can I learn from the Restoration Journey?", "How much sensation do restoring respondents recover?", "Why does every restoring respondent report resentment?"] },
  { num: "11", route: "adult-experience",    icon: "Zap",               colorVar: "var(--c-green)",
    chapter: "ch-undone",
    title: "Before & After: The Adult Experience", tagline: "Those who remember both states",
    exhibitTeaser: "Read the firsthand accounts of adults who experienced both states — their before-and-after narratives, unedited and presented in their own words.",
    lens: "A small group of respondents can answer what no one else can: what changed? Below, adults who experienced both states — intact and circumcised — describe the before and after. This is presented as testimony, not statistics.",
    docentContext: "The user is looking at men circumcised in adulthood. Emphasize that this is a very small sample, presented as direct qualitative testimony of the before-and-after experience, not statistical proof.",
    tourSuas: ["What can I learn from the Adult Experience testimony?", "What do adults circumcised later in life report about sensation changes?", "Why is this presented as testimony rather than statistics?"] },
  { num: "12", route: "numbers",             icon: "BarChart2",         colorVar: "var(--c-gold)",
    chapter: "ch-future-son",
    title: "By the Numbers",    tagline: "Key statistical stories & functional shifts",
    exhibitTeaser: "Filter the curiosity gap, lubrication data, and functional statistics by cohort — interactive charts that let you test every comparison yourself.",
    lens: "Before turning to the next generation, three key statistics help define the current landscape: the curiosity gap, the lubrication divide, and the functional shifts across cohorts.",
    docentContext: "The user is looking at key curiosity statistics. Mention that 67.8% of circumcised respondents wonder what it's like to be intact, while only 27.3% of intact respondents wonder the reverse.",
    tourSuas: ["What can I learn from By the Numbers?", "Why is the curiosity gap so lopsided?", "What does the lubrication data reveal about mechanical function?"] },
  { num: "13", route: "for-parents",         icon: "Baby",              colorVar: "var(--c-purple)",
    chapter: "ch-future-son",
    title: "For New & Expectant Parents", tagline: "Testimonies & informed choice",
    exhibitTeaser: "Read what grown sons — both circumcised and intact — say directly to parents facing this choice. See the data, parent hindsight, and professional counseling stances.",
    lens: "This station speaks directly to parents. Below, adult men describe what they wish their parents had known — followed by the data on how that original choice was actually made.",
    docentContext: "The user is looking at testimonies from grown men to parents, plus the choice-environment data. Emphasize that 97.3% of circumcised respondents received the procedure without a neutral pros-and-cons choice. The exhibit is designed for parents facing the choice right now.",
    tourSuas: ["What do circumcised men say to parents?", "What do intact men say to parents?", "How is the choice typically presented in hospitals?"] },
  { num: "14", route: "the-forward-view",    icon: "ArrowRight",        colorVar: "var(--c-blue)",
    chapter: "ch-future-son",
    title: "The Forward View",  tagline: "Future-son intentions & convergence",
    exhibitTeaser: "Follow the Sankey flows cohort by cohort, filter by any demographic slice, and trace where each pathway converges.",
    lens: "Every cohort, every pathway, every background — we asked them all the same question: if you had a son today, what would you choose? Below, all five hundred respondents flow toward their answer.",
    docentContext: "The user is looking at the 'Convergence Sankey' showing future-son intentions. Highlight that 433 out of 500 respondents (including 78% of the circumcised cohort) would choose to keep a future son intact.",
    tourSuas: ["What can I learn from The Forward View?", "What percentage of circumcised respondents would keep a son intact?", "Does the convergence hold across every demographic slice?"] },
  { num: "15", route: "final-thoughts",      icon: "Flag",              colorVar: "var(--c-gold)",
    chapter: "ch-epilogue",
    title: "Missing Info & Wrap-Up",  tagline: "Unasked questions & final thoughts",
    exhibitTeaser: "Read the final open-ended thoughts from respondents on what information the public is missing, and what else they wanted to share.",
    lens: "As the survey closed, we asked two final open-ended questions: what information is the public missing, and is there anything else you'd like to share. Below is a representative cross-section of what they wrote.",
    docentContext: "The user is looking at the final open-ended responses about missing public information and final thoughts.",
    tourSuas: ["What do respondents think the public is missing?", "What are some final thoughts from the circumcised cohort?"] },
];

// ── Exhibit 03: pleasure metrics (frozen snapshot; pooled mean is computed) ──
export const PLEASURE_METRICS = [
  { label: "Mobile skin", intact: 4.47, restoring: 2.85, circumcised: 1.96 },
  { label: "Light touch", intact: 4.24, restoring: 2.49, circumcised: 2.24 },
  { label: "Variety",     intact: 4.39, restoring: 2.68, circumcised: 2.46 },
  { label: "Duration",    intact: 4.01, restoring: 2.66, circumcised: 2.65 },
  { label: "Ease",        intact: 4.04, restoring: 2.79, circumcised: 2.60 },
  { label: "Intensity",   intact: 4.25, restoring: 3.05, circumcised: 2.96 },
];
export function pooledMean(m) {
  const a = PATHS.intact.n, b = PATHS.restoring.n, c = PATHS.circumcised.n;
  return (m.intact * a + m.restoring * b + m.circumcised * c) / (a + b + c);
}

// ── Exhibit 02: resentment vs regret mirror ──
export const MIRROR_PAIR_DATA = {
  resentment: {
    id: "resentment", concept: "Resentment / Regret",
    circumcised: {
      question: "Have you experienced resentment, loss, anger, or grief about your circumcision?",
      rows: [
        { label: "Strong & frequent", pct: 54.6, colorVar: "var(--c-red)" },
        { label: "Sometimes",         pct: 16.1, colorVar: "var(--c-orange)" },
        { label: "Rarely",            pct: 8.3,  colorVar: "var(--c-yellow)" },
        { label: "No, never",         pct: 21.0, colorVar: "var(--c-blue)" },
      ],
    },
    intact: {
      question: "Have you ever wished you were circumcised, or felt regret about being intact?",
      rows: [
        { label: "Strong & frequent", pct: 8.6,  colorVar: "var(--c-red)" },
        { label: "Sometimes",         pct: 11.5, colorVar: "var(--c-orange)" },
        { label: "Rarely",            pct: 18.0, colorVar: "var(--c-yellow)" },
        { label: "No, never",         pct: 61.9, colorVar: "var(--c-blue)" },
      ],
    },
  },
  curiosity: {
    id: "curiosity", concept: "Curiosity About the Other",
    circumcised: {
      question: "Have you ever wondered what it would be like to be intact?",
      rows: [
        { label: "I've often wondered",       pct: 46.7, colorVar: "var(--c-red)" },
        { label: "I've occasionally wondered", pct: 21.1, colorVar: "var(--c-orange)" },
        { label: "Never thought about it",    pct: 18.7, colorVar: "var(--c-yellow)" },
        { label: "Happy with my experience",  pct: 13.5, colorVar: "var(--c-blue)" },
      ],
    },
    intact: {
      question: "Have you ever wondered what it would be like to be circumcised?",
      rows: [
        { label: "I've often wondered",       pct: 7.1,  colorVar: "var(--c-red)" },
        { label: "I've occasionally wondered", pct: 20.2, colorVar: "var(--c-orange)" },
        { label: "Never thought about it",    pct: 38.8, colorVar: "var(--c-yellow)" },
        { label: "Happy with my experience",  pct: 33.9, colorVar: "var(--c-blue)" },
      ],
    },
  },
  advantages: {
    id: "advantages", concept: "Perceived Advantages",
    circumcised: {
      question: "What are the advantages of being circumcised?",
      rows: [
        { label: "None / can't think of any", pct: 52.4, colorVar: "var(--c-red)" },
        { label: "Aesthetics / appearance",   pct: 22.6, colorVar: "var(--c-orange)" },
        { label: "Hygiene / cleanliness",     pct: 16.5, colorVar: "var(--c-yellow)" },
        { label: "Social conformity",         pct: 8.5,  colorVar: "var(--c-blue)" },
      ],
    },
    intact: {
      question: "What are the advantages of being intact?",
      rows: [
        { label: "Full sensation / pleasure", pct: 68.8, colorVar: "var(--c-green)" },
        { label: "Natural / as intended",     pct: 17.0, colorVar: "var(--c-ltBlue)" },
        { label: "Self-lubrication",          pct: 9.2,  colorVar: "var(--c-yellow)" },
        { label: "None / can't think of any", pct: 5.0,  colorVar: "var(--c-blue)" },
      ],
    },
  },
  triggers: {
    id: "triggers", concept: "Triggers for Regret",
    circumcised: {
      question: "What triggered feelings of resentment about your circumcision?",
      rows: [
        { label: "Learning what was removed",  pct: 62.3, colorVar: "var(--c-red)" },
        { label: "Sexual experience / function", pct: 18.9, colorVar: "var(--c-orange)" },
        { label: "Seeing intact peers",        pct: 11.3, colorVar: "var(--c-yellow)" },
        { label: "N/A — no resentment",        pct: 7.5,  colorVar: "var(--c-blue)" },
      ],
    },
    intact: {
      question: "What triggered any regret about being intact?",
      rows: [
        { label: "Social pressure / teasing",  pct: 24.5, colorVar: "var(--c-orange)" },
        { label: "Partner preference",         pct: 10.1, colorVar: "var(--c-yellow)" },
        { label: "Aesthetic concerns",         pct: 3.6,  colorVar: "var(--c-ltBlue)" },
        { label: "N/A — no regret",            pct: 61.8, colorVar: "var(--c-blue)" },
      ],
    },
  },
  thought_level: {
    id: "thought_level", concept: "Prior Thought Level",
    circumcised: {
      question: "How much thought had you previously given to your circumcision status?",
      rows: [
        { label: "A great deal",       pct: 52.8, colorVar: "var(--c-red)" },
        { label: "A moderate amount",  pct: 23.1, colorVar: "var(--c-orange)" },
        { label: "A little",           pct: 15.6, colorVar: "var(--c-yellow)" },
        { label: "None at all",        pct: 8.5,  colorVar: "var(--c-blue)" },
      ],
    },
    intact: {
      question: "How much thought had you previously given to your intact status?",
      rows: [
        { label: "A great deal",       pct: 21.6, colorVar: "var(--c-red)" },
        { label: "A moderate amount",  pct: 28.8, colorVar: "var(--c-orange)" },
        { label: "A little",           pct: 28.8, colorVar: "var(--c-yellow)" },
        { label: "None at all",        pct: 20.8, colorVar: "var(--c-blue)" },
      ],
    },
  },
};

// backward compat: old name still used for any direct imports
export const RESENTMENT_MIRROR = MIRROR_PAIR_DATA.resentment;

// ── Exhibit 14: convergence sankey (totals must sum to N_TOTAL) ──
export const SANKEY = {
  left: [
    { key: "intact",      name: "INTACT",      n: 141 },
    { key: "circumcised", name: "CIRCUMCISED", n: 212 },
    { key: "restoring",   name: "RESTORING",   n: 110 },
    { key: "observer",    name: "OBSERVER",    n: 37 },
  ],
  right: [
    { key: "keep", name: "KEEP INTACT",       n: 433, colorVar: "var(--c-green)" },
    { key: "cut",  name: "WOULD CIRCUMCISE",  n: 19,  colorVar: "var(--c-red)" },
    { key: "und",  name: "UNDECIDED / OTHER", n: 48,  colorVar: "var(--c-grey)" },
  ],
  flows: [
    { l: 0, r: 0, n: 125 }, { l: 0, r: 2, n: 16 },
    { l: 1, r: 0, n: 166 }, { l: 1, r: 1, n: 18 }, { l: 1, r: 2, n: 28 },
    { l: 2, r: 0, n: 108 }, { l: 2, r: 2, n: 2 },
    { l: 3, r: 0, n: 34 },  { l: 3, r: 1, n: 1 },  { l: 3, r: 2, n: 2 },
  ],
};

const STOP_WORDS = new Set(['the','and','to','of','a','i','in','that','it','my','for','is','with','on','was','as','this','have','but','not','be','about','are','you','or','an','they','me','so','at','from','just','like','would','what','if','all','has','when','do','can','more','we','very','out','one','who','there','been','some','than','up','how','their','had','which','by','were','because','them','only','other','any','also','could','much','no','those','then','being','will','am','even','after','these','did','should','its','into','too','now','many','most','does','where','our','well','get','know','think','see','way','make','going','really','say','feel','time','people','he','his','him','wasn','don','didn','doesn']);

function extractWords(quotes) {
  if (!quotes || !quotes.length) return [];
  const words = [];
  quotes.forEach(q => {
    const textWords = (q.text || '').toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    textWords.forEach(w => {
      if (!STOP_WORDS.has(w)) words.push(w);
    });
  });
  const counts = {};
  let max = 1;
  words.forEach(w => {
    counts[w] = (counts[w] || 0) + 1;
    if (counts[w] > max) max = counts[w];
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([w, c]) => [w, c / max]); // format: [text, value] to match original WORDS arrays
}

// Simple Fisher-Yates shuffle to randomize quotes on load
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const NARRATIVE_MIRROR_DATA = {
  physical: {
    id: "physical",
    concept: "The Physical Experience",
    circumcised: {
      quotes: shuffle(VOICES_THEMES.drawbacks.pathways.circumcised),
      words: extractWords(VOICES_THEMES.drawbacks.pathways.circumcised)
    },
    intact: {
      quotes: shuffle(VOICES_THEMES.advantages.pathways.intact),
      words: extractWords(VOICES_THEMES.advantages.pathways.intact)
    }
  },
  emotional: {
    id: "emotional",
    concept: "The Emotional Impact",
    circumcised: {
      quotes: shuffle(VOICES_THEMES.message_to_parents.pathways.circumcised),
      words: extractWords(VOICES_THEMES.message_to_parents.pathways.circumcised)
    },
    intact: {
      quotes: shuffle(VOICES_THEMES.message_to_parents.pathways.intact),
      words: extractWords(VOICES_THEMES.message_to_parents.pathways.intact)
    }
  },
  wish_understood: {
    id: "wish_understood",
    concept: "What I Wish You Understood",
    circumcised: {
      quotes: shuffle(VOICES_THEMES.wish_understood.pathways.circumcised),
      words: extractWords(VOICES_THEMES.wish_understood.pathways.circumcised)
    },
    intact: {
      quotes: shuffle(VOICES_THEMES.wish_understood.pathways.intact),
      words: extractWords(VOICES_THEMES.wish_understood.pathways.intact)
    }
  }
};
// ── Exhibit 06 supplement: Age of Awareness butterfly chart (frozen 2026-07-10) ──
// Source: /api/response-distribution?q=intact_circ_awareness_age (n=144 intact, n=219 circ)
export const AWARENESS_AGE_BUTTERFLY = [
  { label: "Early childhood",     intactPct: 25.0, circPct: 18.7 },
  { label: "Pre-teen years",      intactPct: 39.6, circPct: 32.4 },
  { label: "Teenage years",       intactPct: 29.9, circPct: 36.5 },
  { label: "Adulthood",           intactPct:  4.2, circPct: 10.0 },
  { label: "Always just known",   intactPct:  0.7, circPct:  1.8 },
];
// ── Exhibit 07 supplement: Generational Satisfaction Shift (frozen 2026-07-10) ──
// Source: /api/aggregate?q=exp_pride_satisfaction_rating&by=generation
export const GENERATIONAL_SATISFACTION = [
  { gen: "Boomer", proud: 24.5, somewhatProud: 32.7, neutral: 12.2, somewhatDissatisfied: 20.4, dissatisfied: 8.2 },
  { gen: "Gen X", proud: 14.1, somewhatProud: 37.5, neutral: 10.9, somewhatDissatisfied: 17.2, dissatisfied: 17.2 },
  { gen: "Millennial", proud: 18.1, somewhatProud: 28.7, neutral: 11.2, somewhatDissatisfied: 20.7, dissatisfied: 19.1 },
  { gen: "Gen Z", proud: 15.3, somewhatProud: 19.0, neutral: 10.9, somewhatDissatisfied: 24.1, dissatisfied: 28.5 },
];

// ── Exhibit 09: Religion chapter data (frozen from API 2026-07-10) ────────
// Source: /api/response-distribution?q=religion_primary_tradition
export const TRADITION_BREAKDOWN = [
  { label: "Christian",            n: 229, colorVar: "var(--c-blue)" },
  { label: "Jewish",              n: 12,  colorVar: "var(--c-gold)" },
  { label: "Islamic",             n: 9,   colorVar: "var(--c-green)" },
  { label: "Other traditions",    n: 6,   colorVar: "var(--c-purple)" },  // Hindu 2 + Buddhist 2 + New Age 2
  { label: "No tradition / none", n: 245, colorVar: "var(--c-red)" },       // 501 - 256 answered
];

// Source: /api/response-distribution?q=circ_parents_influences
// Multi-select: each respondent could select multiple factors.
// Counts below are unique respondents who selected each prefix.
export const INFLUENCE_RANKING = [
  { rank: 1,  label: "Lack of Counter-Information",              short: "Lack of Info",      n: 130 },
  { rank: 2,  label: "Institutional Medical Norm",               short: "Standard Practice", n: 108 },
  { rank: 3,  label: "Prevailing Health & Hygiene Beliefs",      short: "Hygiene / Health",  n: 98 },
  { rank: 4,  label: "Direct Medical Authority",                 short: "Doctor's Advice",   n: 72 },
  { rank: 5,  label: "Paternal Influence (\"Like Father\")",       short: "Paternal Match",    n: 51 },
  { rank: 6,  label: "Peer & Social Pressure (\"Fitting In\")",    short: "Social Pressure",   n: 51 },
  { rank: 7,  label: "Family Tradition / Pressure",              short: "Family Tradition",  n: 37 },
  { rank: 8,  label: "Religious Mandate / Tradition",            short: "Religion",          n: 31 },
  { rank: 9,  label: "Cosmetic / Aesthetic Preference",          short: "Aesthetics",        n: 27 },
  { rank: 10, label: "Unsure / Did Not Think About It",          short: "Unknown / Unsure",  n: 27 },
  { rank: 11, label: "Cultural Media / Popular Tropes",          short: "Media Influence",   n: 18 },
];

// Source: /api/response-distribution?q=religion_christian_circ_view
export const CHRISTIAN_CIRC_VIEW = [
  { label: "A non-issue, left to parents",              n: 115 },
  { label: "A cultural norm to follow",                  n: 50 },
  { label: "A recommended practice for health/hygiene", n: 29 },
  { label: "Discouraged or seen as unnecessary",         n: 28 },
];

// ── Punch-card atlas (region counts provisional) ──
export const ATLAS_ROWS = [
  "......NN........................................................",
  "..NNNNNNNNN.............EE......AAAAAAAAAA......................",
  ".NNNNNNNNNNN......EE...EEEE...AAAAAAAAAAAAAAA...................",
  ".NNNNNNNNNNNN.....EEEEEEEEE..AAAAAAAAAAAAAAAAAA.................",
  "..NNNNNNNNNNN......EEEEEEE...AAAAAAAAAAAAAAAAAAA................",
  "...NNNNNNNNN........EEEEE...AAAAAAAAAAAAAAAAAAA.................",
  "....NNNNNN...........EEE....AAAAAAAAAAAAAAAAAA..................",
  ".....NNNN.............FFF...AAAAAAAAAAAAAAA.....................",
  "......NNN............FFFFF...AAAAAAAAAAA........................",
  ".......NN...........FFFFFFF....AAAAAAA..........................",
  "........N..........FFFFFFFFF....AAAAA...........................",
  "........SS.........FFFFFFFFF.....AAA............................",
  ".......SSSS........FFFFFFFF......................................",
  "......SSSSSS.......FFFFFF.......................................",
  "......SSSSSS........FFFF..............OOO.......................",
  ".....SSSSS...........FF..............OOOOOO.....................",
  ".....SSSS............................OOOOOO.....................",
  "....SSS...............................OOOO......................",
  "....SS...........................................................",
  "....S............................................................",
];
export const ATLAS_REGIONS = {
  N: { colorVar: "var(--path-circumcised)", name: "North America", n: 352, a: 1 },
  E: { colorVar: "var(--path-intact)",      name: "Europe",        n: 74,  a: .85 },
  A: { colorVar: "var(--c-yellow)",         name: "Asia",          n: 20,  a: .7 },
  F: { colorVar: "var(--c-grey)",           name: "Africa",        n: 10,  a: .6 },
  S: { colorVar: "var(--c-orange)",         name: "South America", n: 14,  a: .7 },
  O: { colorVar: "var(--c-green)",          name: "Oceania",       n: 30,  a: .85 },
};

// ── Rotating hero facts (masthead) ──
export const HERO_FACTS = [
  { big: "96%",   l1: "of intact respondents prioritize", l2: "the child's right to bodily autonomy.",
    ctx: "Every pathway lands between 81% and 100%.", colorVar: "var(--c-blue)" },
  { big: "80%",   l1: "of restoring respondents report",  l2: "strong, frequent resentment.",
    ctx: "0% said they have never felt negative about their circumcision.", colorVar: "var(--c-red)" },
  { big: "47.6%", l1: "describe the decision as",          l2: "“routine / automatic.”",
    ctx: "Only 2.7% were offered it as a neutral choice with pros and cons.", colorVar: "var(--c-orange)" },
  { big: "52%",   l1: "of circumcised respondents",        l2: "prefer the intact appearance.",
    ctx: "A quiet majority, in their own words.", colorVar: "var(--c-yellow)" },
  { big: "88%",   l1: "of intact respondents would",       l2: "keep their son intact.",
    ctx: "78% of circumcised respondents would make the same choice for their son.", colorVar: "var(--c-green)" },
];
export const RESTORATION_MOTIVES = VOICES_THEMES.final_straw.pathways.restoring;