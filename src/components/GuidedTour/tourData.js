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
export const TOUR = [
  { num: "01", route: "pathways",            icon: "Compass",           colorVar: "var(--c-blue)",
    title: "The Survey Map",    tagline: "Interactive survey architecture flowchart",
    lens: "Before I could ask anything sensitive, I had to build an instrument people could trust. Five hundred respondents entered the same door and answered the same experience questions before any mention of status — then the survey forked, and every question after that was phrased for the life answering it." },
  { num: "02", route: "pairs",               icon: "Scale",             colorVar: "var(--c-gold)",
    title: "Mirror Pairs",      tagline: "Side-by-side cohort question contrasts",
    lens: "Eighteen questions were asked twice, once from each side of the fence. This is the pair the community shaped most carefully. I report both columns in full; the asymmetry needs no help from me." },
  { num: "03", route: "pleasure-gap",        icon: "Heart",             colorVar: "var(--c-green)",
    title: "The Pleasure Gap",  tagline: "Sensation, sensitivity & orgasm ratings",
    lens: "Remember the map: these ratings were collected before the fork. Here is everyone pooled together, exactly as the survey first saw them — then you tell me what you expect the fork revealed." },
  { num: "04", route: "correlations",        icon: "Grid",              colorVar: "var(--c-red)",
    title: "Correlations Explorer", tagline: "Cross-tabulate demographic predictors",
    lens: "My next question was the skeptic's question: is this just one kind of person answering? The correlations table lets you check me — slice the outcome variables by any demographic you like." },
  { num: "05", route: "demographics",        icon: "Users",             colorVar: "var(--c-purple)",
    title: "Demographic Explorer", tagline: "Age, generation, geography & more",
    lens: "Who actually showed up? Heavily North Americans — which is itself the finding, since that is where the practice is the norm. A self-selected sample, reported as exactly that." },
  { num: "06", route: "narrative-mirrors",   icon: "MessageSquareText", colorVar: "var(--c-orange)",
    title: "The Voices · Narrative Mirrors", tagline: "Open-ended narratives & word clouds",
    lens: "Numbers first, then language. When the survey opened a blank text box, two different vocabularies came back. The words below are sized by how often each side reaches for them." },
  { num: "07", route: "culture",             icon: "Globe",             colorVar: "var(--c-ltBlue)",
    title: "Culture & Generations", tagline: "Norms, stereotypes & generational shifts",
    lens: "I asked both sides the same question about the world they grew up in. Two fences, two different weather reports." },
  { num: "08", route: "observer-lens",       icon: "Eye",               colorVar: "var(--c-grey)",
    title: "The Observer Lens", tagline: "Partners, parents & professionals",
    lens: "Thirty-seven people took the survey about bodies that are not their own — partners, parents, healthcare workers. Independent witnesses, reporting from the outside." },
  { num: "09", route: "religious-mirrors",   icon: "BookOpen",          colorVar: "var(--c-blue)",
    title: "Religious Mirrors", tagline: "Faith, tradition & personal experience",
    lens: "The survey offered optional sections for Jewish, Christian, and Islamic respondents — the same respectful questions, framed for each tradition. I won't compress those answers into a headline; they deserve their full exhibit, side by side, in the respondents' own words." },
  { num: "10", route: "restoration-journey", icon: "RefreshCw",         colorVar: "var(--c-gold)",
    title: "Restoration Journey", tagline: "Methods, progress & sensitivity gains",
    lens: "One hundred and ten respondents are actively growing back what was removed — a years-long project of tension and patience. Their numbers sit between the two fences, and their motivation column is the starkest in the study." },
  { num: "11", route: "adult-experience",    icon: "Zap",               colorVar: "var(--c-green)",
    title: "Before & After: The Adult Experience", tagline: "Those who remember both states",
    lens: "A small group can answer the question no one else can: what changed? Their accounts are few — so the exhibit presents them carefully, under the small-sample rule, as testimony rather than statistics." },
  { num: "12", route: "numbers",             icon: "BarChart2",         colorVar: "var(--c-gold)",
    title: "By the Numbers",    tagline: "Key statistical stories & functional shifts",
    lens: "Three findings I did not expect when I built this. I report them exactly as answered." },
  { num: "13", route: "for-parents",         icon: "Shield",            colorVar: "var(--c-red)",
    title: "For New & Expectant Parents", tagline: "Curated data for informed decisions",
    lens: "If you are deciding for someone else right now, this exhibit is yours. I asked circumcised respondents how the decision was handled when it was them on the table." },
  { num: "14", route: "the-forward-view",    icon: "CheckCircle",       colorVar: "var(--c-purple)",
    title: "The Forward View",  tagline: "Decisions for the next generation",
    lens: "The last question looks forward: if you had a son today, what would you choose for him? Follow each pathway's ribbon. Whatever their past, watch where they flow." },
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
