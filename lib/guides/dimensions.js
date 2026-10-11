/**
 * GUIDE BUILDER: AUDIENCE DIMENSIONS
 * ----------------------------------
 * The parameters a reader picks to build a bespoke Accidental Intactivist's Guide.
 * Pure data + helpers (no React) so the composer and tests can share them.
 *
 * `status: 'draft'` options are hidden from the public builder until reviewed
 * (e.g. Jewish and Muslim modules await community-insider review).
 */

export const DIMENSIONS = [
  {
    id: 'relationship',
    label: 'Who are you talking to?',
    required: true,
    options: [
      { id: 'expectant-parent', label: 'Expectant parent' },
      { id: 'partner', label: 'Partner of an expectant parent' },
      { id: 'grandparent', label: 'Grandparent' },
      { id: 'friend', label: 'Friend or peer' },
      { id: 'clinician', label: 'Pediatrician / family doctor' },
      { id: 'birth-worker', label: 'OB-GYN / midwife / L&D nurse' },
      { id: 'lawmaker', label: 'Lawmaker / policy staff' },
      { id: 'journalist', label: 'Journalist' },
      { id: 'clergy', label: 'Clergy / faith leader' },
      { id: 'circumcised-man', label: 'Circumcised man processing his experience' },
      { id: 'troll', label: 'Troll / circumfetishist (field playbook)' },
    ],
  },
  {
    id: 'stance',
    label: 'Where are they now?',
    options: [
      { id: 'curious', label: 'Curious' },
      { id: 'on-the-fence', label: 'On the fence' },
      { id: 'skeptical', label: 'Skeptical' },
      { id: 'planning', label: 'Planning to circumcise' },
      { id: 'already', label: 'Already circumcised a son' },
    ],
  },
  {
    id: 'faith',
    label: 'Faith or worldview',
    options: [
      { id: 'secular', label: 'Secular / humanist' },
      { id: 'catholic', label: 'Catholic' },
      { id: 'protestant', label: 'Evangelical / Protestant' },
      { id: 'lds', label: 'Latter-day Saint' },
      { id: 'jewish', label: 'Jewish', status: 'draft' },
      { id: 'muslim', label: 'Muslim', status: 'draft' },
      { id: 'spiritual', label: 'Spiritual, not religious' },
    ],
  },
  {
    id: 'politics',
    label: 'Political outlook',
    options: [
      { id: 'progressive', label: 'Progressive' },
      { id: 'liberal', label: 'Liberal' },
      { id: 'moderate', label: 'Moderate' },
      { id: 'conservative', label: 'Conservative' },
      { id: 'libertarian', label: 'Libertarian' },
      { id: 'apolitical', label: 'Apolitical' },
    ],
  },
  {
    id: 'concerns',
    label: 'Their top concerns',
    multi: true,
    options: [
      { id: 'hygiene', label: 'Hygiene' },
      { id: 'look-like-dad', label: '"Look like dad"' },
      { id: 'hiv-sti', label: 'HIV / STI claims' },
      { id: 'uti', label: 'UTI claims' },
      { id: 'penile-cancer', label: 'Penile cancer' },
      { id: 'religious-obligation', label: 'Religious obligation' },
      { id: 'wont-remember', label: '"He won\'t remember"' },
      { id: 'partner-preference', label: 'Partner preference' },
      { id: 'phimosis', label: 'Phimosis later' },
      { id: 'parental-rights', label: 'Parental rights / "my choice"' },
      { id: 'cost-insurance', label: 'Cost & insurance' },
      { id: 'doctors-recommend', label: '"Doctors recommend it"' },
      { id: 'safer-as-baby', label: '"Safer as a baby than later"' },
      { id: 'complications-rare', label: '"Complications are rare"' },
      { id: 'restoration-no-big-deal', label: '"Restoration proves it\'s no big deal"' },
      { id: 'fgm-different', label: '"It\'s nothing like FGM"' },
      // Support & Healing topics
      { id: 'grief-anger', label: 'Processing grief, trauma, or anger' },
      { id: 'restoration-guidance', label: 'Restoration methods & guidance' },
      { id: 'genetic-engineering', label: 'Genetic engineering & regeneration' },
      { id: 'intimacy-relationships', label: 'Navigating intimacy and relationships' },
    ],
  },
  {
    id: 'tone',
    label: 'Tone',
    default: 'gentle',
    options: [
      { id: 'gentle', label: 'Gentle' },
      { id: 'direct', label: 'Direct' },
      { id: 'clinical', label: 'Clinical' },
    ],
  },
  {
    id: 'language',
    label: 'Language',
    default: 'integrity',
    options: [
      { id: 'integrity', label: '"Circumcision" / "genital integrity"' },
      { id: 'cutting', label: '"Genital cutting"' },
    ],
  },
];

export const DIMENSION_BY_ID = Object.fromEntries(DIMENSIONS.map(d => [d.id, d]));

/** Look up an option's label, or '' if unknown. */
export function optionLabel(dimensionId, optionId) {
  const opt = DIMENSION_BY_ID[dimensionId]?.options.find(o => o.id === optionId);
  return opt ? opt.label : '';
}

/** True if the option exists and is publishable (or drafts are allowed). */
export function isOptionAvailable(dimensionId, optionId, { includeDrafts = false } = {}) {
  const opt = DIMENSION_BY_ID[dimensionId]?.options.find(o => o.id === optionId);
  if (!opt) return false;
  return includeDrafts || opt.status !== 'draft';
}

export const DEFAULT_PARAMS = Object.freeze({
  relationship: 'expectant-parent',
  stance: null,
  faith: null,
  politics: null,
  concerns: [],
  tone: 'gentle',
  language: 'integrity',
});

/**
 * Validate and fill in raw params (e.g. from a URL). Unknown or unavailable
 * values are dropped rather than throwing, so old share links keep working.
 */
export function normalizeParams(raw = {}, { includeDrafts = false } = {}) {
  const out = { ...DEFAULT_PARAMS, concerns: [] };
  for (const dim of DIMENSIONS) {
    const value = raw[dim.id];
    if (dim.multi) {
      const list = Array.isArray(value) ? value : typeof value === 'string' && value ? value.split(',') : [];
      const seen = new Set();
      out[dim.id] = list
        .map(v => String(v).trim())
        .filter(v => v && !seen.has(v) && seen.add(v) && isOptionAvailable(dim.id, v, { includeDrafts }));
    } else if (value && isOptionAvailable(dim.id, value, { includeDrafts })) {
      out[dim.id] = value;
    } else if (dim.default) {
      out[dim.id] = dim.default;
    } else if (!dim.required) {
      out[dim.id] = null;
    }
  }
  return out;
}

/** Serialize params to a compact, shareable query string (no leading '?'). */
export function paramsToQuery(params, extra = {}) {
  const qs = new URLSearchParams();
  for (const dim of DIMENSIONS) {
    const v = params[dim.id];
    if (dim.multi) {
      if (v && v.length) qs.set(dim.id, v.join(','));
    } else if (v && v !== dim.default) {
      qs.set(dim.id, v);
    }
  }
  for (const [k, v] of Object.entries(extra)) if (v != null && v !== '') qs.set(k, v);
  return qs.toString();
}

/** Parse a query string or URLSearchParams back into normalized params. */
export function queryToParams(search, opts) {
  const qs = search instanceof URLSearchParams ? search : new URLSearchParams(search || '');
  const raw = {};
  for (const dim of DIMENSIONS) {
    const v = qs.get(dim.id);
    if (v != null) raw[dim.id] = v;
  }
  return normalizeParams(raw, opts);
}
