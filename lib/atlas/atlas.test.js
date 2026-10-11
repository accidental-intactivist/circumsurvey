import { describe, it, expect } from 'vitest';
import { METRICS, colorForValue, PREVALENCE_BINS, NO_DATA_COLOR, recencyBucket, binLabel } from './metrics.js';
import { DHS_COUNTRIES, ISO3_TO_DHS, buildDhsUrl, cleanRegionLabel, dhsRecordToObservation, parseDhsPayload } from './dhs.js';
import { SEED_OBSERVATIONS, SEED_SOURCES, US_CENSUS_REGIONS, censusRegionForState } from './seed.js';
import {
  mergeObservations, latestByGeo, seriesFor, yearsAvailable, latestRegionalSet,
  validateObservation, observationToMarkdown, formatValue, summarizeCoverage, mergeSources,
} from './series.js';

// Shaped exactly like live https://api.dhsprogram.com/rest/dhs/data records (Oct 2026).
const rec = over => ({
  DataId: 1, Indicator: 'Men circumcised', Value: 92.6, Precision: 1,
  DHS_CountryCode: 'KE', CountryName: 'Kenya', SurveyYear: 2014, SurveyId: 'KE2014DHS',
  IndicatorId: 'HA_MCRC_M_MCC', CharacteristicId: 10000, CharacteristicCategory: 'Total 15-49',
  CharacteristicLabel: 'Total 15-49', IsTotal: 1, IsPreferred: 1, RegionId: '',
  SurveyYearLabel: '2014', SurveyType: 'DHS', DenominatorWeighted: 12819, DenominatorUnweighted: 12819,
  CILow: '', CIHigh: '', ...over,
});

describe('metrics', () => {
  it('defines the two Phase A metrics with populations and gaps', () => {
    expect(Object.keys(METRICS)).toEqual(expect.arrayContaining(['prevalence_adult', 'newborn_inpatient']));
    expect(METRICS.newborn_inpatient.coverageGaps.length).toBeGreaterThanOrEqual(3);
  });
  it('colors values into ascending bins and handles missing data', () => {
    expect(colorForValue(null)).toBe(NO_DATA_COLOR);
    expect(colorForValue('x')).toBe(NO_DATA_COLOR);
    expect(colorForValue(0)).toBe(PREVALENCE_BINS[0].color);
    expect(colorForValue(100)).toBe(PREVALENCE_BINS.at(-1).color);
    expect(colorForValue(49.3)).toBe(PREVALENCE_BINS[2].color);
    expect(colorForValue(150)).toBe(PREVALENCE_BINS.at(-1).color);
    expect(binLabel(0)).toBe('0–10%');
  });
  it('buckets data recency', () => {
    expect(recencyBucket(2024, 2026)).toBe('current');
    expect(recencyBucket(2018, 2026)).toBe('aging');
    expect(recencyBucket(2003, 2026)).toBe('stale');
    expect(recencyBucket(null, 2026)).toBe('none');
  });
});

describe('DHS collector', () => {
  it('maps every DHS code to a unique ISO3', () => {
    const iso = Object.values(DHS_COUNTRIES).map(([i]) => i);
    expect(iso.every(i => /^[A-Z]{3}$/.test(i))).toBe(true);
    expect(new Set(iso).size).toBe(iso.length);
    expect(ISO3_TO_DHS.KEN).toBe('KE');
  });
  it('builds API urls', () => {
    const u = buildDhsUrl({ breakdown: 'subnational', countryIds: ['KE', 'UG'] });
    expect(u).toContain('indicatorIds=HA_MCRC_M_MCC');
    expect(u).toContain('breakdown=subnational');
    expect(u).toContain('countryIds=KE%2CUG');
  });
  it('cleans nested region labels', () => {
    expect(cleanRegionLabel('..Nairobi')).toEqual({ label: 'Nairobi', depth: 2 });
    expect(cleanRegionLabel('Coast')).toEqual({ label: 'Coast', depth: 0 });
  });
  it('converts a national record', () => {
    const o = dhsRecordToObservation(rec());
    expect(o).toMatchObject({ geo: 'KEN', level: 'country', period: 2014, value: 92.6, n: 12819, metric: 'prevalence_adult', source_id: 'dhs-KE2014DHS' });
    expect(o.population).toContain('15–49');
    expect(validateObservation(o, { nowYear: 2026 }).ok).toBe(true);
  });
  it('converts a subnational record', () => {
    const o = dhsRecordToObservation(rec({ CharacteristicCategory: 'Region', CharacteristicLabel: 'Nyanza', IsTotal: 0, Value: 66.8, RegionId: 'KEDHS2014416007' }));
    expect(o).toMatchObject({ geo: 'KEN:nyanza', level: 'region', parent: 'KEN', geo_name: 'Nyanza', value: 66.8 });
  });
  it('rejects unusable records', () => {
    expect(dhsRecordToObservation(rec({ Value: '' }))).toBeNull();
    expect(dhsRecordToObservation(rec({ Value: 140 }))).toBeNull();
    expect(dhsRecordToObservation(rec({ DHS_CountryCode: 'OS' }))).toBeNull(); // Ondo State has no ISO3
    expect(dhsRecordToObservation(rec({ IndicatorId: 'OTHER' }))).toBeNull();
    expect(dhsRecordToObservation(rec({ CharacteristicCategory: 'Wealth quintile', IsTotal: 0 }))).toBeNull();
  });
  it('keeps one national row per survey, preferring 15–49', () => {
    const { observations, sources } = parseDhsPayload({
      Data: [
        rec({ CharacteristicLabel: 'Total 15-54', CharacteristicCategory: 'Total 15-54', Value: 93.0, IsPreferred: 0 }),
        rec(),
        rec({ CharacteristicCategory: 'Region', CharacteristicLabel: 'Coast', IsTotal: 0, Value: 96.1 }),
        rec({ CharacteristicCategory: 'Region', CharacteristicLabel: 'Coast', IsTotal: 0, Value: 96.1 }), // duplicate
      ],
    });
    const nat = observations.filter(o => o.level === 'country');
    expect(nat).toHaveLength(1);
    expect(nat[0].value).toBe(92.6);
    expect(nat[0].id).toBe('dhs:KE2014DHS:national');
    expect(observations.filter(o => o.level === 'region')).toHaveLength(1);
    expect(sources).toHaveLength(1);
    expect(sources[0].url).toContain('surveyIds=KE2014DHS');
  });
  it('accepts a bare array payload', () => {
    expect(parseDhsPayload([rec()]).observations).toHaveLength(1);
    expect(parseDhsPayload(null).observations).toHaveLength(0);
  });
});

describe('seed data', () => {
  it('every seed observation validates and has a known source', () => {
    const ids = new Set(SEED_SOURCES.map(s => s.id));
    for (const o of SEED_OBSERVATIONS) {
      const v = validateObservation(o, { nowYear: 2026 });
      expect(v.errors, o.id).toEqual([]);
      expect(ids.has(o.source_id), o.id).toBe(true);
    }
  });
  it('records the JAMA Peds 2025 inpatient figures exactly', () => {
    const us = seriesFor(SEED_OBSERVATIONS, 'USA', 'newborn_inpatient');
    expect(us.map(o => [o.period, o.value])).toEqual([[2012, 54.1], [2022, 49.3]]);
  });
  it('flags the inpatient-only limitation on the source', () => {
    expect(SEED_SOURCES[0].bias_note).toMatch(/birth hospitalization/);
  });
  it('maps all 50 states + DC to exactly one census region', () => {
    const all = Object.values(US_CENSUS_REGIONS).flatMap(r => r.states);
    expect(all).toHaveLength(51);
    expect(new Set(all).size).toBe(51);
    expect(censusRegionForState('Ohio')).toBe('midwest');
    expect(censusRegionForState('Oregon')).toBe('west');
    expect(censusRegionForState('Atlantis')).toBeNull();
  });
});

describe('series helpers', () => {
  const obs = [
    { id: 'a', geo: 'KEN', level: 'country', metric: 'prevalence_adult', period: 2003, value: 83.9, status: 'approved' },
    { id: 'b', geo: 'KEN', level: 'country', metric: 'prevalence_adult', period: 2014, value: 92.6, status: 'approved' },
    { id: 'c', geo: 'UGA', level: 'country', metric: 'prevalence_adult', period: 2011, value: 26.8, status: 'approved' },
    { id: 'd', geo: 'UGA', level: 'country', metric: 'prevalence_adult', period: 2016, value: 99, status: 'pending' },
    { id: 'r1', geo: 'KEN:coast', parent: 'KEN', depth: 1, level: 'region', metric: 'prevalence_adult', period: 2014, value: 96.1 },
    { id: 'r2', geo: 'KEN:nyanza', parent: 'KEN', depth: 1, level: 'region', metric: 'prevalence_adult', period: 2014, value: 66.8 },
    { id: 'r0', geo: 'KEN:coast', parent: 'KEN', depth: 1, level: 'region', metric: 'prevalence_adult', period: 2003, value: 90 },
  ];
  it('merges with later lists winning', () => {
    const m = mergeObservations([{ id: 'x', value: 1 }], [{ id: 'x', value: 2 }, { id: 'y' }]);
    expect(m).toHaveLength(2);
    expect(m.find(o => o.id === 'x').value).toBe(2);
    expect(mergeSources([{ id: 's' }]).has('s')).toBe(true);
  });
  it('picks the latest approved value, respecting the year slider', () => {
    const latest = latestByGeo(obs, { metric: 'prevalence_adult' });
    expect(latest.get('KEN').value).toBe(92.6);
    expect(latest.get('UGA').value).toBe(26.8); // pending row ignored
    expect(latestByGeo(obs, { metric: 'prevalence_adult', maxYear: 2010 }).get('KEN').value).toBe(83.9);
    expect(latestByGeo(obs, { metric: 'prevalence_adult', maxYear: 2000 }).size).toBe(0);
  });
  it('builds sorted series and year lists', () => {
    expect(seriesFor(obs, 'KEN', 'prevalence_adult').map(o => o.period)).toEqual([2003, 2014]);
    expect(yearsAvailable(obs, 'prevalence_adult')).toEqual([2003, 2011, 2014]);
  });
  it('returns only the latest survey\u2019s regions, sorted high→low', () => {
    const { period, rows } = latestRegionalSet(obs, 'KEN', 'prevalence_adult');
    expect(period).toBe(2014);
    expect(rows.map(r => r.geo)).toEqual(['KEN:coast', 'KEN:nyanza']);
    expect(latestRegionalSet(obs, 'UGA', 'prevalence_adult').rows).toEqual([]);
  });
  it('summarizes coverage', () => {
    expect(summarizeCoverage(obs, 'prevalence_adult')).toEqual({ countries: 2, newest: 2014, oldest: 2011 });
  });
});

describe('validator', () => {
  const good = { id: 'v', geo: 'KEN', metric: 'prevalence_adult', value: 50, period: 2020, source_id: 's', population: 'Men', level: 'country' };
  it('passes a clean observation', () => {
    expect(validateObservation(good, { nowYear: 2026 })).toEqual({ ok: true, errors: [], flags: [] });
  });
  it('blocks structural errors', () => {
    const v = validateObservation({ ...good, metric: 'nope', value: 120, period: 2099, source_id: '' }, { nowYear: 2026 });
    expect(v.ok).toBe(false);
    expect(v.errors).toEqual(expect.arrayContaining(['unknown metric "nope"', 'value outside 0–100%', 'implausible period', 'missing source_id']));
    expect(validateObservation({ ...good, ci_low: 60, ci_high: 70 }).errors).toContain('value outside its own CI');
    expect(validateObservation({ ...good, level: 'region' }).errors).toContain('region without parent');
    expect(validateObservation(null).ok).toBe(false);
  });
  it('flags small samples and implausible jumps for curator review', () => {
    const v = validateObservation({ ...good, n: 40 }, { nowYear: 2026, history: [{ id: 'h', geo: 'KEN', metric: 'prevalence_adult', period: 2017, value: 85 }] });
    expect(v.ok).toBe(true);
    expect(v.flags.some(f => f.includes('small denominator'))).toBe(true);
    expect(v.flags.some(f => f.startsWith('jump of 35.0'))).toBe(true);
  });
});

describe('presentation', () => {
  it('formats values', () => {
    expect(formatValue(49.3)).toBe('49.3%');
    expect(formatValue(68)).toBe('68%');
    expect(formatValue(null)).toBe('—');
  });
  it('renders report markdown with the undercount caveats for newborn data', () => {
    const o = SEED_OBSERVATIONS.find(x => x.id === 'jama25:usa:2022');
    const md = observationToMarkdown(o, SEED_SOURCES[0]);
    expect(md).toContain('49.3%');
    expect(md).toContain('doi.org/10.1001/jamapediatrics.2025.2464');
    expect(md).toContain('Not counted in this figure');
    expect(md).toMatch(/Ritual and community/);
  });
});
