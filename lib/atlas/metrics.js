// Global Circumcision Atlas — metric definitions.
//
// The Atlas never mixes metrics. "Prevalence" (share of adult men who are
// circumcised) is the result of decades of practice; "newborn incidence" is
// the current trend; "aftercare burden" is the downstream cost. Comparing one
// to another is the most common way circumcision statistics get misused.

export const METRICS = {
  prevalence_adult: {
    id: 'prevalence_adult',
    label: 'Adult prevalence',
    short: 'Men circumcised',
    unit: '%',
    population: 'Men (typically aged 15–49), self-reported in household surveys',
    blurb: 'Share of adult men who report being circumcised. Reflects decades of practice, not current newborn trends.',
    coverageGaps: [
      'Self-report: some men are unsure of their own status',
      'Usually ages 15–49 only',
      'Traditional and medical procedures are not always separated',
    ],
  },
  newborn_inpatient: {
    id: 'newborn_inpatient',
    label: 'Newborn (inpatient only)',
    short: 'Newborns circumcised in hospital',
    unit: '%',
    population: 'Male newborns, procedure recorded during the birth hospitalization',
    blurb: 'Share of newborn boys circumcised before leaving the birth hospital. This is what headline figures like "49%" measure, and it undercounts the true rate.',
    coverageGaps: [
      'Outpatient neonatal procedures in the weeks after discharge (pediatrician office, clinic)',
      'Ritual and community procedures (brit milah, community khitan)',
      'Later childhood procedures and revisions (e.g. "phimosis" diagnoses)',
      'The aftercare burden: adhesions, meatal stenosis and revisions that intact boys largely avoid',
    ],
  },
};

export const METRIC_IDS = Object.keys(METRICS);

/** Claim tiers specific to statistics. Documented = a source reported it; Modeled = our estimate. */
export const STAT_TIERS = {
  documented: { label: 'Documented', icon: '📄', blurb: 'Reported directly by the cited source.' },
  modeled: { label: 'Modeled', icon: '🧮', blurb: 'Estimated by the Atlas from documented inputs; see the method and uncertainty range.' },
};

/** Sequential teal ramp (cream → deep teal) for 0–100% values. */
export const PREVALENCE_BINS = [
  { max: 10, color: '#eef3ec' },
  { max: 25, color: '#cfe3d4' },
  { max: 50, color: '#93c3a3' },
  { max: 75, color: '#4f9670' },
  { max: 90, color: '#2a7350' },
  { max: 100.0001, color: '#134a2e' },
];

export const NO_DATA_COLOR = '#e8e4dc';

export function colorForValue(value) {
  if (value == null || Number.isNaN(Number(value))) return NO_DATA_COLOR;
  const v = Math.max(0, Math.min(100, Number(value)));
  return (PREVALENCE_BINS.find(b => v < b.max) || PREVALENCE_BINS[PREVALENCE_BINS.length - 1]).color;
}

export function binLabel(i) {
  const lo = i === 0 ? 0 : PREVALENCE_BINS[i - 1].max;
  const hi = Math.round(PREVALENCE_BINS[i].max);
  return `${lo}–${hi}%`;
}

/** Recency buckets — national surveys run every ~5 years, so >10 years is stale. */
export function recencyBucket(year, nowYear = new Date().getFullYear()) {
  if (year == null) return 'none';
  const age = nowYear - Number(year);
  if (age <= 5) return 'current';
  if (age <= 10) return 'aging';
  return 'stale';
}

export const RECENCY = {
  current: { label: '≤ 5 years old', color: '#1a5c3a' },
  aging: { label: '6–10 years old', color: '#d4a030' },
  stale: { label: '> 10 years old', color: '#b5563c' },
  none: { label: 'No data in ledger', color: NO_DATA_COLOR },
};
