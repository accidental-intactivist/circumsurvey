/**
 * RISK REALITY: relative vs. absolute risk, and number needed to treat (NNT)
 * ------------------------------------------------------------------------
 * Pure math for the Risk Reality widget on counter-evidence cards.
 *
 * Scenarios marked `status: 'illustrative'` use round, editable inputs and must
 * say so on screen; only `status: 'documented'` scenarios may be presented as
 * sourced figures (their `cites` point to Evidence Brief entries).
 */

/**
 * @param {{ baselineRisk: number, relativeReduction: number }} input
 *   baselineRisk: probability of the outcome without the intervention (0–1)
 *   relativeReduction: proportional reduction claimed (0–1), e.g. 0.6 for "60%"
 */
export function riskStats({ baselineRisk, relativeReduction }) {
  const base = clamp01(Number(baselineRisk));
  const rrr = clamp01(Number(relativeReduction));
  const treatedRisk = base * (1 - rrr);
  const arr = base - treatedRisk;
  const nnt = arr > 0 ? Math.ceil(1 / arr) : Infinity;
  return { baselineRisk: base, treatedRisk, rrr, arr, nnt };
}

function clamp01(x) {
  if (!Number.isFinite(x)) return 0;
  return Math.min(1, Math.max(0, x));
}

/** Format a probability as a friendly percentage string (e.g. 0.0042 → "0.42%"). */
export function formatPct(p) {
  if (!Number.isFinite(p)) return '—';
  const pct = p * 100;
  if (pct === 0) return '0%';
  if (pct < 0.01) return '<0.01%';
  if (pct < 1) return `${pct.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}%`;
  return `${pct.toFixed(1).replace(/\.0$/, '')}%`;
}

/** Format an NNT as "1 in N" with thousands separators. */
export function formatNNT(nnt) {
  if (!Number.isFinite(nnt)) return 'no measurable benefit';
  return `${nnt.toLocaleString('en-US')}`;
}

export const RISK_SCENARIOS = {
  uti: {
    id: 'uti',
    label: 'Infant urinary tract infection',
    outcome: 'a UTI in infancy',
    baselineRisk: 0.0104,
    relativeReduction: 0.87,
    status: 'documented',
    cites: ['singh-grewal-2005'],
    note: 'Inputs chosen to reproduce the meta-analysis estimate of ~111 boys per UTI prevented. UTIs are usually treated with antibiotics.',
  },
  'penile-cancer': {
    id: 'penile-cancer',
    label: 'Penile cancer (lifetime)',
    outcome: 'penile cancer in his lifetime',
    baselineRisk: 0.001,
    relativeReduction: 0.67,
    status: 'illustrative',
    cites: ['penile-cancer-rarity'],
    note: 'Illustrative round numbers; adjust the inputs. Penile cancer is rare (~1 per 100,000 US men per year) and HPV vaccination addresses a leading cause.',
  },
  'hiv-us': {
    id: 'hiv-us',
    label: 'HIV (US heterosexual men, lifetime)',
    outcome: 'HIV in his lifetime',
    baselineRisk: 0.002,
    relativeReduction: 0.6,
    status: 'illustrative',
    cites: ['african-rcts', 'frisch-2022'],
    note: 'Illustrative only. The ~60% figure comes from adult African trials and may not transfer to US infants at all; a Danish cohort found no protective effect.',
  },
};
