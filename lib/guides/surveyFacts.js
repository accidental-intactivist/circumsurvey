/**
 * GUIDE BUILDER: INQUIRY SURVEY SNAPSHOT
 * --------------------------------------
 * A dated snapshot of The Accidental Intactivist's Inquiry counts (from
 * /api/survey-stats) so curated guides render offline. Phase 2 replaces this with
 * live, cross-tabulated slices from /api/guides/survey-slice.
 *
 * SMALL-SAMPLE RULE: any group with fewer than SMALL_N respondents is described
 * qualitatively ("fewer than 30"), never as a count-based statistic or percentage.
 */

export const SMALL_N = 30;

export const SURVEY_SNAPSHOT = Object.freeze({
  as_of: '2026-10',
  total: 516,
  pathways: { circumcised: 223, intact: 146, restoring: 109, observer: 38 },
  politics: {
    'Very Conservative': 54, Conservative: 122, Moderate: 116, Liberal: 113,
    'Very Liberal': 17, Libertarian: 8, Apolitical: 43, Unsure: 29,
  },
  religion: { Christian: 229, Jewish: 12, Islamic: 9 },
});

const POLITICS_GROUPS = {
  progressive: { label: 'liberal or very liberal', keys: ['Liberal', 'Very Liberal'] },
  liberal: { label: 'liberal or very liberal', keys: ['Liberal', 'Very Liberal'] },
  moderate: { label: 'moderate', keys: ['Moderate'] },
  conservative: { label: 'conservative or very conservative', keys: ['Conservative', 'Very Conservative'] },
  libertarian: { label: 'libertarian', keys: ['Libertarian'] },
  apolitical: { label: 'apolitical', keys: ['Apolitical'] },
};

const FAITH_GROUPS = {
  catholic: { label: 'Christian', keys: ['Christian'] },
  protestant: { label: 'Christian', keys: ['Christian'] },
  lds: { label: 'Christian', keys: ['Christian'] },
  jewish: { label: 'Jewish', keys: ['Jewish'] },
  muslim: { label: 'Muslim', keys: ['Islamic'] },
};

function sum(obj, keys) {
  return keys.reduce((acc, k) => acc + (obj[k] || 0), 0);
}

/** Describe a group's participation, applying the small-sample rule. */
export function describeGroup(label, n, total = SURVEY_SNAPSHOT.total) {
  if (n < SMALL_N) {
    return { label, n, small: true, text: `A small number of ${label} respondents (fewer than ${SMALL_N}) took part; their perspectives appear as voices, not statistics.` };
  }
  return { label, n, small: false, text: `${n} of the Inquiry's ${total} respondents identify as ${label}. People like you took part.` };
}

/**
 * "People like you" facts for a guide. Returns an array of group descriptions
 * plus a pathways line. Small groups never expose their count in `text`.
 */
export function surveyFactsFor(params, snapshot = SURVEY_SNAPSHOT) {
  const groups = [];
  const pol = POLITICS_GROUPS[params.politics];
  if (pol) groups.push(describeGroup(pol.label, sum(snapshot.politics, pol.keys), snapshot.total));
  const faith = FAITH_GROUPS[params.faith];
  if (faith) groups.push(describeGroup(faith.label, sum(snapshot.religion, faith.keys), snapshot.total));
  if (params.relationship === 'circumcised-man') {
    const n = snapshot.pathways.circumcised + snapshot.pathways.restoring;
    groups.push(describeGroup('circumcised (including restoring)', n, snapshot.total));
  }
  const p = snapshot.pathways;
  return {
    as_of: snapshot.as_of,
    total: snapshot.total,
    groups,
    pathwaysText: `Pathways represented: ${p.circumcised} circumcised, ${p.intact} intact, ${p.restoring} restoring, and ${p.observer} observers (partners, parents and allies).`,
  };
}
