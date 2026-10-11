// Curated seed observations — figures verified by hand against the source.
// Rule: if we could not confirm a number, it is NOT here. Gaps are left as gaps
// (and listed in SEED_TODO for editors) rather than filled with guesses.

export const SEED_SOURCES = [
  {
    id: 'jama-peds-2025-yang-tobian',
    citation: 'Yang P, Tobian AAR, et al. Trends in Circumcision Among Newborn Males in the US. JAMA Pediatrics. 2025;179(11):1236–1238.',
    url: 'https://doi.org/10.1001/jamapediatrics.2025.2464',
    kind: 'claims',
    bias_note: 'Kids\u2019 Inpatient Database: counts only procedures during the birth hospitalization. Outpatient, ritual and later procedures are excluded, so this is a floor, not the true rate.',
    weight: 1,
  },
];

const JAMA = 'jama-peds-2025-yang-tobian';
const INPATIENT = 'Male newborns, birth hospitalization only (Kids\u2019 Inpatient Database)';

export const SEED_OBSERVATIONS = [
  { id: 'jama25:usa:2012', geo: 'USA', geo_name: 'United States', level: 'country', parent: null, period: 2012, metric: 'newborn_inpatient', value: 54.1, population: INPATIENT, method: 'Hospital discharge database', source_id: JAMA },
  { id: 'jama25:usa:2022', geo: 'USA', geo_name: 'United States', level: 'country', parent: null, period: 2022, metric: 'newborn_inpatient', value: 49.3, population: INPATIENT, method: 'Hospital discharge database', source_id: JAMA },
  { id: 'jama25:usa-mw:2022', geo: 'USA:midwest', geo_name: 'Midwest', level: 'region', parent: 'USA', period: 2022, metric: 'newborn_inpatient', value: 68.5, population: INPATIENT, method: 'Hospital discharge database', source_id: JAMA },
  { id: 'jama25:usa-w:2022', geo: 'USA:west', geo_name: 'West', level: 'region', parent: 'USA', period: 2022, metric: 'newborn_inpatient', value: 19.7, population: INPATIENT, method: 'Hospital discharge database', source_id: JAMA },
].map(o => ({ tier: 'documented', status: 'approved', depth: o.level === 'region' ? 1 : 0, extracted_by: 'curator:seed', n: null, ci_low: null, ci_high: null, ...o }));

/** Figures editors should pull from full texts before they appear on the map. */
export const SEED_TODO = [
  { geo: 'USA:northeast', metric: 'newborn_inpatient', period: 2022, source_id: JAMA, note: 'Northeast value not in abstract; pull from full-text table.' },
  { geo: 'USA:south', metric: 'newborn_inpatient', period: 2022, source_id: JAMA, note: 'South value not in abstract; pull from full-text table.' },
  { geo: 'USA', metric: 'prevalence_adult', note: 'NHANES adult prevalence (Introcaso et al. 2013): verify figure and age range before adding.' },
];

/** US Census Bureau regions → state names (matches us-atlas `properties.name`). */
export const US_CENSUS_REGIONS = {
  northeast: { name: 'Northeast', states: ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'Rhode Island', 'Vermont', 'New Jersey', 'New York', 'Pennsylvania'] },
  midwest: { name: 'Midwest', states: ['Illinois', 'Indiana', 'Michigan', 'Ohio', 'Wisconsin', 'Iowa', 'Kansas', 'Minnesota', 'Missouri', 'Nebraska', 'North Dakota', 'South Dakota'] },
  south: { name: 'South', states: ['Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Maryland', 'North Carolina', 'South Carolina', 'Virginia', 'West Virginia', 'Alabama', 'Kentucky', 'Mississippi', 'Tennessee', 'Arkansas', 'Louisiana', 'Oklahoma', 'Texas'] },
  west: { name: 'West', states: ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming', 'Alaska', 'California', 'Hawaii', 'Oregon', 'Washington'] },
};

const STATE_TO_REGION = Object.fromEntries(
  Object.entries(US_CENSUS_REGIONS).flatMap(([key, r]) => r.states.map(s => [s, key]))
);

export function censusRegionForState(stateName) {
  return STATE_TO_REGION[stateName] || null;
}
