// DHS Program API collector (pure parsing; no I/O here so it can be unit-tested).
//
// Indicator HA_MCRC_M_MCC = "Men circumcised" (self-reported, men 15–49).
// API docs: https://api.dhsprogram.com/  — free, CORS-enabled (Access-Control-Allow-Origin: *).

export const DHS_INDICATOR = 'HA_MCRC_M_MCC';
export const DHS_API = 'https://api.dhsprogram.com/rest/dhs/data';

/** DHS two-letter country codes → [ISO3, name]. Pulled from /rest/dhs/countries (Oct 2026). */
export const DHS_COUNTRIES = {
  AF: ['AFG', 'Afghanistan'], AL: ['ALB', 'Albania'], AO: ['AGO', 'Angola'], AM: ['ARM', 'Armenia'],
  AZ: ['AZE', 'Azerbaijan'], BD: ['BGD', 'Bangladesh'], BJ: ['BEN', 'Benin'], BO: ['BOL', 'Bolivia'],
  BT: ['BWA', 'Botswana'], BR: ['BRA', 'Brazil'], BF: ['BFA', 'Burkina Faso'], BU: ['BDI', 'Burundi'],
  KH: ['KHM', 'Cambodia'], CM: ['CMR', 'Cameroon'], CV: ['CPV', 'Cape Verde'], CF: ['CAF', 'Central African Republic'],
  TD: ['TCD', 'Chad'], CO: ['COL', 'Colombia'], KM: ['COM', 'Comoros'], CG: ['COG', 'Congo'],
  CD: ['COD', 'DR Congo'], CI: ['CIV', "Côte d'Ivoire"], DR: ['DOM', 'Dominican Republic'], EC: ['ECU', 'Ecuador'],
  EG: ['EGY', 'Egypt'], ES: ['SLV', 'El Salvador'], EK: ['GNQ', 'Equatorial Guinea'], ER: ['ERI', 'Eritrea'],
  SZ: ['SWZ', 'Eswatini'], ET: ['ETH', 'Ethiopia'], GA: ['GAB', 'Gabon'], GM: ['GMB', 'Gambia'],
  GH: ['GHA', 'Ghana'], GU: ['GTM', 'Guatemala'], GN: ['GIN', 'Guinea'], GY: ['GUY', 'Guyana'],
  HT: ['HTI', 'Haiti'], HN: ['HND', 'Honduras'], IA: ['IND', 'India'], ID: ['IDN', 'Indonesia'],
  JO: ['JOR', 'Jordan'], KK: ['KAZ', 'Kazakhstan'], KE: ['KEN', 'Kenya'], KY: ['KGZ', 'Kyrgyz Republic'],
  LA: ['LAO', 'Laos'], LS: ['LSO', 'Lesotho'], LB: ['LBR', 'Liberia'], MD: ['MDG', 'Madagascar'],
  MW: ['MWI', 'Malawi'], MV: ['MDV', 'Maldives'], ML: ['MLI', 'Mali'], MR: ['MRT', 'Mauritania'],
  MX: ['MEX', 'Mexico'], MB: ['MDA', 'Moldova'], MA: ['MAR', 'Morocco'], MZ: ['MOZ', 'Mozambique'],
  MM: ['MMR', 'Myanmar'], NM: ['NAM', 'Namibia'], NP: ['NPL', 'Nepal'], NC: ['NIC', 'Nicaragua'],
  NI: ['NER', 'Niger'], NG: ['NGA', 'Nigeria'], PK: ['PAK', 'Pakistan'], PG: ['PNG', 'Papua New Guinea'],
  PY: ['PRY', 'Paraguay'], PE: ['PER', 'Peru'], PH: ['PHL', 'Philippines'], RW: ['RWA', 'Rwanda'],
  WS: ['WSM', 'Samoa'], ST: ['STP', 'São Tomé and Príncipe'], SN: ['SEN', 'Senegal'], SL: ['SLE', 'Sierra Leone'],
  ZA: ['ZAF', 'South Africa'], LK: ['LKA', 'Sri Lanka'], SD: ['SDN', 'Sudan'], TJ: ['TJK', 'Tajikistan'],
  TZ: ['TZA', 'Tanzania'], TH: ['THA', 'Thailand'], TL: ['TLS', 'Timor-Leste'], TG: ['TGO', 'Togo'],
  TT: ['TTO', 'Trinidad and Tobago'], TN: ['TUN', 'Tunisia'], TR: ['TUR', 'Turkey'], TM: ['TKM', 'Turkmenistan'],
  UG: ['UGA', 'Uganda'], UA: ['UKR', 'Ukraine'], UZ: ['UZB', 'Uzbekistan'], VN: ['VNM', 'Vietnam'],
  YE: ['YEM', 'Yemen'], ZM: ['ZMB', 'Zambia'], ZW: ['ZWE', 'Zimbabwe'],
};

export const ISO3_TO_DHS = Object.fromEntries(
  Object.entries(DHS_COUNTRIES).map(([dhs, [iso3]]) => [iso3, dhs])
);

export function buildDhsUrl({ breakdown = 'national', countryIds, perpage = 5000 } = {}) {
  const p = new URLSearchParams({ indicatorIds: DHS_INDICATOR, breakdown, f: 'json', perpage: String(perpage) });
  if (countryIds) p.set('countryIds', Array.isArray(countryIds) ? countryIds.join(',') : countryIds);
  return `${DHS_API}?${p.toString()}`;
}

const num = v => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v));
const slug = s => String(s).toLowerCase().normalize('NFKD').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');

/** "..Nairobi" → { label: 'Nairobi', depth: 2 }. DHS prefixes nested sub-regions with dots. */
export function cleanRegionLabel(label = '') {
  const m = String(label).match(/^(\.*)(.*)$/);
  return { label: m[2].trim(), depth: m[1].length };
}

export function dhsSourceFor(rec) {
  return {
    id: `dhs-${rec.SurveyId}`,
    citation: `${DHS_COUNTRIES[rec.DHS_CountryCode]?.[1] || rec.CountryName} ${rec.SurveyType || 'DHS'} ${rec.SurveyYearLabel || rec.SurveyYear}`,
    // Reproducible: the exact API query that yields this survey's numbers.
    url: `${DHS_API}?indicatorIds=${DHS_INDICATOR}&surveyIds=${rec.SurveyId}&breakdown=all&f=html`,
    kind: 'survey',
    bias_note: null,
    weight: 1,
  };
}

/**
 * Convert one DHS API record into an Atlas observation, or null if unusable.
 * National rows become geo=ISO3; subnational rows become geo=ISO3:<region-slug>.
 */
export function dhsRecordToObservation(rec) {
  if (!rec || rec.IndicatorId !== DHS_INDICATOR) return null;
  const country = DHS_COUNTRIES[rec.DHS_CountryCode];
  if (!country || !country[0]) return null;
  const value = num(rec.Value);
  if (value == null || value < 0 || value > 100) return null;
  const [iso3, name] = country;
  const isNational = rec.IsTotal === 1 || rec.CharacteristicCategory?.startsWith('Total');
  const isRegion = rec.CharacteristicCategory === 'Region' || (!!rec.RegionId && !isNational);
  if (!isNational && !isRegion) return null;

  const { label, depth } = cleanRegionLabel(rec.CharacteristicLabel);
  const geo = isNational ? iso3 : `${iso3}:${slug(label)}`;
  const ageMatch = String(rec.CharacteristicLabel || '').match(/(\d{2})-(\d{2})/);

  return {
    id: `dhs:${rec.SurveyId}:${isNational ? 'national' : slug(label)}${isNational && ageMatch ? `:${ageMatch[0]}` : ''}`,
    geo,
    geo_name: isNational ? name : label,
    level: isNational ? 'country' : 'region',
    depth: isNational ? 0 : Math.max(1, depth + 1),
    parent: isNational ? null : iso3,
    period: Number(rec.SurveyYear),
    metric: 'prevalence_adult',
    value,
    ci_low: num(rec.CILow),
    ci_high: num(rec.CIHigh),
    n: num(rec.DenominatorUnweighted) ?? num(rec.DenominatorWeighted),
    population: ageMatch ? `Men aged ${ageMatch[1]}–${ageMatch[2]}, self-reported` : 'Men aged 15–49, self-reported',
    method: `Household survey (${rec.SurveyType || 'DHS'})`,
    source_id: `dhs-${rec.SurveyId}`,
    tier: 'documented',
    status: 'approved',
    preferred: rec.IsPreferred === 1,
    extracted_by: 'collector:dhs',
  };
}

/**
 * Parse a DHS API payload ({ Data: [...] } or an array) into observations + sources.
 * For national rows, keeps one row per survey — preferring the 15–49 total.
 */
export function parseDhsPayload(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.Data || [];
  const sources = new Map();
  const bySurveyNational = new Map();
  const regional = [];

  for (const rec of rows) {
    const obs = dhsRecordToObservation(rec);
    if (!obs) continue;
    if (!sources.has(obs.source_id)) sources.set(obs.source_id, dhsSourceFor(rec));
    if (obs.level === 'country') {
      const prev = bySurveyNational.get(rec.SurveyId);
      const score = o => (o.population.includes('15–49') ? 2 : 0) + (o.preferred ? 1 : 0);
      if (!prev || score(obs) > score(prev)) bySurveyNational.set(rec.SurveyId, obs);
    } else {
      regional.push(obs);
    }
  }

  // Normalize national ids (drop age suffix) now that we've chosen one per survey.
  const national = [...bySurveyNational.values()].map(o => ({ ...o, id: o.id.replace(/:national:.*$/, ':national') }));
  const seen = new Set();
  const observations = [...national, ...regional].filter(o => (seen.has(o.id) ? false : (seen.add(o.id), true)));
  return { observations, sources: [...sources.values()] };
}
