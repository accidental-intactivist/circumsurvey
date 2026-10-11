// Data access for the Atlas. Prefers the D1 ledger (/api/stats/observations); if the ledger
// isn't deployed/migrated yet, falls back to the DHS API directly (CORS-enabled) + the
// curated seed — parsed by the exact same tested functions the collector uses.
import { useEffect, useState } from 'react';
import { buildDhsUrl, parseDhsPayload, ISO3_TO_DHS } from '../../../lib/atlas/dhs.js';
import { SEED_OBSERVATIONS, SEED_SOURCES } from '../../../lib/atlas/seed.js';
import { mergeObservations, mergeSources, validateObservation } from '../../../lib/atlas/series.js';

const cache = new Map();

async function fromLedger(query) {
  try {
    const res = await fetch(`/api/stats/observations?${new URLSearchParams(query)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.ledger !== 'd1') return null; // seed-only / empty → use the live fallback
    return data;
  } catch {
    return null; // SPA HTML (endpoint not deployed) or network error
  }
}

async function fromDhs(opts) {
  const res = await fetch(buildDhsUrl(opts));
  if (!res.ok) throw new Error(`DHS API ${res.status}`);
  return parseDhsPayload(await res.json());
}

/** Attach validator flags client-side (the ledger stores them; the fallback computes them). */
function withFlags(observations) {
  return observations.map(o => {
    if (o.flags) return { ...o, flags: typeof o.flags === 'string' ? JSON.parse(o.flags) : o.flags };
    const { flags } = validateObservation(o, { history: observations });
    return flags.length ? { ...o, flags } : o;
  });
}

function load(key, fn) {
  if (!cache.has(key)) cache.set(key, fn().catch(e => { cache.delete(key); throw e; }));
  return cache.get(key);
}

export function loadNational() {
  return load('national', async () => {
    const ledger = await fromLedger({ level: 'country' });
    if (ledger) {
      return { via: 'ledger', observations: withFlags(mergeObservations(ledger.observations, SEED_OBSERVATIONS)), sources: mergeSources(ledger.sources, SEED_SOURCES) };
    }
    const dhs = await fromDhs({ breakdown: 'national' });
    return {
      via: 'dhs-live',
      observations: withFlags(mergeObservations(dhs.observations, SEED_OBSERVATIONS.filter(o => o.level === 'country'))),
      sources: mergeSources(dhs.sources, SEED_SOURCES),
    };
  });
}

export function loadRegions(iso3) {
  return load(`regions:${iso3}`, async () => {
    const seed = SEED_OBSERVATIONS.filter(o => o.parent === iso3);
    const ledger = await fromLedger({ parent: iso3 });
    if (ledger) return { observations: withFlags(mergeObservations(ledger.observations, seed)), sources: mergeSources(ledger.sources, SEED_SOURCES) };
    const dhsCode = ISO3_TO_DHS[iso3];
    const dhs = dhsCode ? await fromDhs({ breakdown: 'subnational', countryIds: dhsCode }) : { observations: [], sources: [] };
    return { observations: withFlags(mergeObservations(dhs.observations, seed)), sources: mergeSources(dhs.sources, SEED_SOURCES) };
  });
}

export function useNationalData() {
  const [state, setState] = useState({ loading: true, error: null, observations: [], sources: new Map(), via: null });
  useEffect(() => {
    let live = true;
    loadNational()
      .then(d => live && setState({ loading: false, error: null, ...d }))
      .catch(e => live && setState(s => ({ ...s, loading: false, error: e.message, observations: SEED_OBSERVATIONS, sources: mergeSources(SEED_SOURCES), via: 'seed' })));
    return () => { live = false; };
  }, []);
  return state;
}

export function useRegionData(iso3) {
  const [state, setState] = useState({ loading: false, observations: [], sources: new Map() });
  useEffect(() => {
    if (!iso3) { setState({ loading: false, observations: [], sources: new Map() }); return undefined; }
    let live = true;
    setState(s => ({ ...s, loading: true }));
    loadRegions(iso3)
      .then(d => live && setState({ loading: false, ...d }))
      .catch(() => live && setState({ loading: false, observations: SEED_OBSERVATIONS.filter(o => o.parent === iso3), sources: mergeSources(SEED_SOURCES) }));
    return () => { live = false; };
  }, [iso3]);
  return state;
}

// Boundaries (same public sources the survey explorer uses).
const WORLD_GEO_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
const US_TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

export function loadWorldGeo() {
  return load('geo:world', () => fetch(WORLD_GEO_URL).then(r => r.json()));
}

export function loadUsStatesGeo() {
  return load('geo:us', async () => {
    const [topo, topojson] = await Promise.all([fetch(US_TOPO_URL).then(r => r.json()), import('topojson-client')]);
    return topojson.feature(topo, topo.objects.states);
  });
}
