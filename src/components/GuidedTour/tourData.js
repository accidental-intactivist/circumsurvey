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
    lens: "Five hundred people entered the same door and answered the same experience questions — before any mention of status. Then the survey forked.",
    docentContext: "The user is looking at the overall survey pathways flowchart. Explain how the survey sorted respondents only after they answered the core sensation questions to prevent bias." },
  { num: "02", route: "pairs",               icon: "Scale",             colorVar: "var(--c-gold)",
    chapter: "ch-how-feel",
    title: "Mirror Pairs",      tagline: "Side-by-side cohort question contrasts",
    lens: "Eighteen questions were asked twice, once from each side of the fence. The asymmetry needs no help from me.",
    docentContext: "The user is looking at the 'Mirror Pairs' and the Resentment vs Regret contrast. Explain that 79% of circumcised respondents felt resentment, while intact respondents largely felt no regret. Stick to the data." },
  { num: "03", route: "pleasure-gap",        icon: "Heart",             colorVar: "var(--c-green)",
    chapter: "ch-what-feel",
    title: "The Pleasure Gap",  tagline: "Sensation, sensitivity & orgasm ratings",
    lens: "These ratings were collected before the fork — one pool, no labels, no sides. Tell me what you expect it revealed.",
    docentContext: "The user is looking at the Pleasure Gap and the 'mobile skin' effect size (Cohen's d = 1.78). Explain what mobile skin is mechanically and why this represents the largest gap in the entire dataset." },
  { num: "04", route: "correlations",        icon: "Grid",              colorVar: "var(--c-red)",
    chapter: "ch-witnesses",
    title: "Correlations Explorer", tagline: "Cross-tabulate demographic predictors",
    lens: "The skeptic's question: is this just one kind of person answering? Slice it yourself.",
    docentContext: "The user is looking at cross-tabulations, specifically how a father's circumcision status correlates with their intent for a future son. Explain the generational cycle the data reveals." },
  { num: "05", route: "demographics",        icon: "Users",             colorVar: "var(--c-purple)",
    chapter: "ch-who-took",
    title: "Demographic Explorer", tagline: "Age, generation, geography & more",
    lens: "Who showed up? Heavily North Americans — which is itself the finding.",
    docentContext: "The user is looking at the respondent demographics. Confirm that this is a predominantly North American, self-selected sample of 500 people, crossing many occupations, generations, and political identities." },
  { num: "06", route: "narrative-mirrors",   icon: "MessageSquareText", colorVar: "var(--c-orange)",
    chapter: "ch-how-feel",
    title: "The Voices · Narrative Mirrors", tagline: "Open-ended narratives & word clouds",
    lens: "When the survey opened a blank text box, two different vocabularies came back.",
    docentContext: "The user is looking at open-ended text responses from intact and circumcised respondents. Do not provide quotes, but summarize that intact respondents frequently mention 'natural' and 'no issues', while circumcised respondents frequently mention 'loss' and 'anger'." },
  { num: "07", route: "culture",             icon: "Globe",             colorVar: "var(--c-ltBlue)",
    chapter: "ch-world-told",
    title: "Culture & Generations", tagline: "Norms, stereotypes & generational shifts",
    lens: "Both sides, the same question about the world they grew up in. Two very different weather reports.",
    docentContext: "The user is looking at cultural norms. Explain that circumcised respondents grew up in environments where the procedure was 'unquestioned' or pushed, while intact respondents grew up where it was 'not discussed' or 'neutral'." },
  { num: "08", route: "observer-lens",       icon: "Eye",               colorVar: "var(--c-grey)",
    chapter: "ch-witnesses",
    title: "The Observer Lens", tagline: "Partners, parents & professionals",
    lens: "Thirty-seven people answered about bodies not their own. Independent witnesses.",
    docentContext: "The user is looking at the Observer cohort (partners, parents, medical professionals). Explain that 90%+ of these independent witnesses would choose to keep a future son intact." },
  { num: "09", route: "religious-mirrors",   icon: "BookOpen",          colorVar: "var(--c-blue)",
    chapter: "ch-world-told",
    title: "Religious Mirrors", tagline: "Faith, tradition & personal experience",
    lens: "Three traditions, the same respectful questions. They deserve their full exhibit, unabridged.",
    docentContext: "The user is looking at religious correlations. Note that while this survey had optional faith sections, the primary story is about physical sensation and bodily autonomy across all backgrounds." },
  { num: "10", route: "restoration-journey", icon: "RefreshCw",         colorVar: "var(--c-gold)",
    chapter: "ch-undone",
    title: "Restoration Journey", tagline: "Methods, progress & sensitivity gains",
    lens: "One hundred and ten respondents are growing back what was removed. Their motivation column is the starkest in the study.",
    docentContext: "The user is looking at foreskin restoration. Explain that restoring respondents report partial regain of sensation (mobile skin rating 2.85 vs circumcised 1.96), but 100% of them still report some level of resentment for having to do it." },
  { num: "11", route: "adult-experience",    icon: "Zap",               colorVar: "var(--c-green)",
    chapter: "ch-undone",
    title: "Before & After: The Adult Experience", tagline: "Those who remember both states",
    lens: "A small group can answer what no one else can: what changed? Presented as testimony, not statistics.",
    docentContext: "The user is looking at men circumcised in adulthood. Emphasize that this is a very small sample, presented as direct qualitative testimony of the before-and-after experience, not statistical proof." },
  { num: "12", route: "numbers",             icon: "BarChart2",         colorVar: "var(--c-gold)",
    chapter: "ch-future-son",
    title: "By the Numbers",    tagline: "Key statistical stories & functional shifts",
    lens: "Three specific percentages that define the landscape. Filter them by cohort.",
    docentContext: "The user is looking at key curiosity statistics. Mention that 67.8% of circumcised respondents wonder what it's like to be intact, while only 27.3% of intact respondents wonder the reverse." },
  { num: "13", route: "for-parents",         icon: "Baby",              colorVar: "var(--c-purple)",
    chapter: "ch-future-son",
    title: "For Parents & Providers", tagline: "The decision environment",
    lens: "Only 2.7% of circumcised respondents were offered a neutral choice. This exists for the next 97.3%.",
    docentContext: "The user is looking at how the circumcision decision is presented to parents. Emphasize that 97.3% of circumcised respondents received the procedure as a default, a 'strong push,' or 'without discussion'—only 2.7% were offered a neutral pros-and-cons choice." },
  { num: "14", route: "the-forward-view",    icon: "ArrowRight",        colorVar: "var(--c-blue)",
    chapter: "ch-future-son",
    title: "The Forward View",  tagline: "Future-son intentions & convergence",
    lens: "Four hundred and thirty-three respondents flowing to the exact same conclusion.",
    docentContext: "The user is looking at the 'Convergence Sankey' showing future-son intentions. Highlight that 433 out of 500 respondents (including 78% of the circumcised cohort) would choose to keep a future son intact." },
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
export const RESENTMENT_MIRROR = {
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
};

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

// ── Exhibit 06: word mirrors (provisional weights pending frequency export) ──
export const WORDS_CIRC = [["missing",1],["wonder",.9],["resentment",.95],["numb",.8],["angry",.75],["never asked",.85],["dry",.65],["betrayed",.6],["curious",.8],["what if",.7],["scar",.55],["taken",.6],["fine with it",.7]];
export const WORDS_INTACT = [["never think about it",1],["grateful",.9],["normal",.9],["lucky",.8],["sensitive",.8],["natural",.75],["glad",.8],["whole",.7],["teased",.5],["simple",.6],["curious",.55],["no complaints",.7]];

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
