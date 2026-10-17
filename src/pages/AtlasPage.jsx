import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Globe2, Clock, Calculator, ArrowLeft, Database, ShieldCheck, Layers, Share2 } from 'lucide-react';
import AtlasMap from '../components/atlas/AtlasMap';
import CountryPanel from '../components/atlas/CountryPanel';
import AtlasShareModal from '../components/atlas/AtlasShareModal';
import { useNationalData, useRegionData, loadWorldGeo, loadUsStatesGeo } from '../components/atlas/useAtlasData';
import { METRICS, PREVALENCE_BINS, binLabel, RECENCY, NO_DATA_COLOR } from '../../lib/atlas/metrics.js';
import { latestByGeo, yearsAvailable, summarizeCoverage, formatValue } from '../../lib/atlas/series.js';
import { useReport } from '../contexts/ReportContext';
import { useAssistant } from '../contexts/AssistantContext';
import { captureEvent } from '../lib/telemetry';
import './Guides.css';
import './Atlas.css';

const NOW_YEAR = new Date().getFullYear();

function Legend({ layer }) {
  if (layer === 'recency') {
    return (
      <div className="at-legend" aria-label="Legend: data recency">
        {Object.entries(RECENCY).map(([k, r]) => <span key={k}><i style={{ background: r.color }} />{r.label}</span>)}
      </div>
    );
  }
  return (
    <div className="at-legend" aria-label="Legend: reported percentage">
      {PREVALENCE_BINS.map((b, i) => <span key={b.color}><i style={{ background: b.color }} />{binLabel(i)}</span>)}
      <span><i style={{ background: NO_DATA_COLOR, outline: '1px dashed #b9b2a3' }} />No data in ledger</span>
    </div>
  );
}

function Overview({ latest, coverage, metric, onSpotlight, onPick }) {
  const ranked = [...latest.values()].sort((a, b) => b.value - a.value);
  const m = METRICS[metric];
  return (
    <aside className="at-panel at-panel--overview">
      <div className="gd-series">World overview · {m.label}</div>
      <h2 className="at-panel-title">{coverage.countries} {coverage.countries === 1 ? 'country' : 'countries'} with sourced data</h2>
      <p className="gd-muted">{m.blurb}</p>
      {coverage.newest && <p className="at-pop">Latest data per country, ranging from {coverage.oldest} to {coverage.newest}. Click any country for its profile, trend and regions.</p>}

      <button type="button" className="at-spotlight" onClick={onSpotlight} id="atlas-spotlight-us">
        <span className="gd-series">Spotlight</span>
        <strong>The US “49%”: what the headline misses</strong>
        <span>It counts newborns circumcised in hospital only. See what's left out →</span>
      </button>

      {ranked.length > 4 && (
        <div className="at-rank">
          <div>
            <h3>Highest</h3>
            <ol>{ranked.slice(0, 5).map(o => <li key={o.geo}><button type="button" onClick={() => onPick(o.geo)}>{o.geo_name}</button> <span>{formatValue(o.value)}</span></li>)}</ol>
          </div>
          <div>
            <h3>Lowest</h3>
            <ol>{ranked.slice(-5).reverse().map(o => <li key={o.geo}><button type="button" onClick={() => onPick(o.geo)}>{o.geo_name}</button> <span>{formatValue(o.value)}</span></li>)}</ol>
          </div>
        </div>
      )}
    </aside>
  );
}

export default function AtlasPage() {
  const [params, setParams] = useSearchParams();
  const metric = METRICS[params.get('metric')] ? params.get('metric') : 'prevalence_adult';
  const layer = params.get('layer') === 'recency' ? 'recency' : 'reported';
  const rawGeo = params.get('geo') || null;

  const { loading, error, observations, sources, via } = useNationalData();
  const [worldGeo, setWorldGeo] = useState(null);
  const [usGeo, setUsGeo] = useState(null);

  const selected = useMemo(() => {
    if (!rawGeo) return null;
    const clean = rawGeo.trim();
    if (clean.length === 3 && clean === clean.toUpperCase()) return clean;
    const lower = clean.toLowerCase();
    if (lower.includes('united states') || lower === 'us' || lower === 'usa') return 'USA';
    if (lower.includes('denmark')) return 'DNK';
    if (lower.includes('germany')) return 'DEU';
    if (lower.includes('united kingdom') || lower === 'uk' || lower.includes('britain')) return 'GBR';
    if (lower.includes('canada')) return 'CAN';
    if (lower.includes('australia')) return 'AUS';
    if (lower.includes('south africa')) return 'ZAF';
    if (lower.includes('kenya')) return 'KEN';
    if (lower.includes('israel')) return 'ISR';
    if (lower.includes('philippines')) return 'PHL';
    if (lower.includes('south korea') || lower === 'korea') return 'KOR';

    const foundObs = (observations || []).find(x => x.geo_name && x.geo_name.toLowerCase() === lower);
    if (foundObs) return foundObs.geo;

    const foundFeature = worldGeo?.features?.find(x => x.properties?.name?.toLowerCase() === lower);
    if (foundFeature) return foundFeature.id;

    return clean.toUpperCase();
  }, [rawGeo, observations, worldGeo]);

  const region = useRegionData(selected);
  const [year, setYear] = useState(null);
  const { addToReport } = useReport();
  const { openAssistant } = useAssistant();

  const [showGlobalShare, setShowGlobalShare] = useState(false);

  useEffect(() => { document.title = 'Global Genital Integrity Atlas · The Accidental Intactivist'; }, []);
  useEffect(() => { loadWorldGeo().then(setWorldGeo).catch(() => setWorldGeo(null)); }, []);

  const usDrill = selected === 'USA' && metric === 'newborn_inpatient';
  useEffect(() => { if (usDrill && !usGeo) loadUsStatesGeo().then(setUsGeo).catch(() => {}); }, [usDrill, usGeo]);

  const years = useMemo(() => yearsAvailable(observations, metric), [observations, metric]);
  const maxYear = year && years.includes(year) ? year : years.at(-1) ?? NOW_YEAR;
  useEffect(() => { setYear(null); }, [metric]);

  const latest = useMemo(() => latestByGeo(observations, { metric, maxYear }), [observations, metric, maxYear]);
  const coverage = useMemo(() => summarizeCoverage(observations, metric), [observations, metric]);
  const regionValues = useMemo(
    () => latestByGeo(region.observations, { metric, level: 'region', parent: 'USA', maxYear }),
    [region.observations, metric, maxYear]
  );
  const allSources = useMemo(() => new Map([...sources, ...region.sources]), [sources, region.sources]);

  const update = patch => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v == null ? next.delete(k) : next.set(k, v)));
    setParams(next, { replace: true });
  };

  const select = geo => {
    update({ geo });
    if (geo) captureEvent('atlas_select', { geo, metric });
  };

  const selectedName = useMemo(() => {
    if (!selected) return null;
    const o = observations.find(x => x.geo === selected);
    if (o) return o.geo_name;
    const f = worldGeo?.features?.find(x => x.id === selected);
    return f?.properties?.name || selected;
  }, [selected, observations, worldGeo]);

  const ask = (name, obs) => {
    const fig = obs ? ` The Atlas shows ${formatValue(obs.value)} (${METRICS[obs.metric].label}, ${obs.period}).` : '';
    openAssistant(
      `Tell me about circumcision in ${name}.${fig} What drives the rate there, what's missing from the official numbers, and what does the archive hold about it?`,
      [`How has the rate in ${name} changed, and why?`, `Is there VMMC or HIV-prevention promotion in ${name}?`, `What cultural or religious factors matter in ${name}?`]
    );
  };

  return (
    <div className="gd-page at-page">
      <header className="at-hero">
        <div className="gd-series"><Globe2 size={13} /> The Living Manifesto · Evidence Base</div>
        <h1 className="at-title">The Global Genital Integrity Atlas</h1>
        <p className="at-lede">
          What is <em>reported</em>, where, and how recently. Every figure links to its source, its population and its limits.
          Where official numbers undercount, we say so, and in Phase B we'll show a 🧮 modeled estimate next to them, never instead of them.
        </p>
        <div className="at-status">
          <span><Database size={13} /> {loading ? 'Loading data…' : via === 'ledger' ? 'From the Atlas ledger' : via === 'dhs-live' ? 'Live from the DHS Program API' : 'Curated figures only'}</span>
          {!loading && <span>{observations.length.toLocaleString('en-US')} national observations · {coverage.countries} {coverage.countries === 1 ? 'country' : 'countries'} with {METRICS[metric].label.toLowerCase()} data</span>}
          {error && <span className="at-err">DHS API unreachable: showing curated figures only</span>}
        </div>
      </header>

      <div className="at-controls" role="toolbar" aria-label="Atlas controls">
        <div className="at-seg" role="radiogroup" aria-label="Metric">
          {Object.values(METRICS).map(m => (
            <button key={m.id} type="button" role="radio" aria-checked={metric === m.id} className={metric === m.id ? 'is-on' : ''} onClick={() => update({ metric: m.id })} id={`atlas-metric-${m.id}`} title={m.blurb}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="at-seg" role="radiogroup" aria-label="Layer">
          <button type="button" role="radio" aria-checked={layer === 'reported'} className={layer === 'reported' ? 'is-on' : ''} onClick={() => update({ layer: null })} id="atlas-layer-reported"><Layers size={13} /> Reported</button>
          <button type="button" role="radio" aria-checked={layer === 'recency'} className={layer === 'recency' ? 'is-on' : ''} onClick={() => update({ layer: 'recency' })} id="atlas-layer-recency"><Clock size={13} /> Data age</button>
          <button type="button" disabled title="Modeled all-settings estimates arrive in Phase B" id="atlas-layer-estimated"><Calculator size={13} /> Estimated <small>soon</small></button>
        </div>
        {years.length > 1 && !usDrill && (
          <label className="at-year">
            <span>Data up to <strong>{maxYear}</strong></span>
            <input type="range" min={0} max={years.length - 1} step={1} value={years.indexOf(maxYear)} onChange={e => setYear(years[Number(e.target.value)])} id="atlas-year-slider" aria-label="Show data up to year" />
          </label>
        )}
        <button
          type="button"
          className="gd-btn"
          onClick={() => setShowGlobalShare(true)}
          id="atlas-share-global"
          style={{ marginLeft: 'auto', padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
        >
          <Share2 size={13} /> Share View
        </button>
      </div>

      <div className="at-grid">
        <section className="at-map-wrap" aria-label="Map">
          {usDrill && (
            <button type="button" className="at-back" onClick={() => select(null)} id="atlas-back-world"><ArrowLeft size={14} /> World</button>
          )}
          <AtlasMap
            mode={usDrill ? 'us' : 'world'}
            geo={usDrill ? usGeo : worldGeo}
            values={usDrill ? regionValues : latest}
            layer={layer}
            selected={selected}
            onSelect={select}
            nowYear={NOW_YEAR}
          />
          <Legend layer={layer} />
          {usDrill && <p className="at-map-note">States are shaded by their U.S. Census region. The source reports regions, not states.</p>}
        </section>

        {selected ? (
          <CountryPanel
            geo={selected}
            name={selectedName}
            metric={metric}
            observations={observations}
            regionObs={region.observations}
            regionsLoading={region.loading}
            sources={allSources}
            nowYear={NOW_YEAR}
            onClose={() => select(null)}
            onMetric={m => update({ metric: m })}
            onAsk={ask}
            onAddToReport={(md, src) => { addToReport(md, src ? [src.citation] : []); captureEvent('atlas_add_report', { geo: selected, metric }); }}
          />
        ) : (
          <Overview latest={latest} coverage={coverage} metric={metric} onPick={select} onSpotlight={() => update({ metric: 'newborn_inpatient', geo: 'USA' })} />
        )}
      </div>

      <section className="at-method" aria-label="How the Atlas works">
        <article>
          <h2>Three metrics, never mixed</h2>
          <p><strong>Prevalence</strong> is how many adult men are circumcised: the result of decades of practice. <strong>Newborn incidence</strong> is how many boys born this year are circumcised: the current trend. <strong>Aftercare burden</strong> (coming) counts the extra care those procedures create. Most misleading statistics come from comparing one of these with another.</p>
        </article>
        <article>
          <h2>Reported ≠ true</h2>
          <p>Official figures count what their systems can see. The US “49%” (JAMA Pediatrics, 2025) counts only procedures during the birth hospitalization. Outpatient, ritual and later-childhood procedures are not in it. We show the reported number, label its limits, and (Phase B) add a 🧮 modeled range with every assumption on display.</p>
        </article>
        <article>
          <h2><ShieldCheck size={18} /> AI Research Desk</h2>
          <p>Behind the research desk is a team of separate tools: <em>collectors</em> pull official survey data, a rule-based <em>validator</em> checks every number (range, denominators, sudden jumps), and curators review anything flagged. The assistant cites the ledger; it never invents a statistic. <Link to="/guides">Guides</Link> and the living Manifesto draw on the same numbers.</p>
        </article>
      </section>

      <AtlasShareModal
        isOpen={showGlobalShare}
        onClose={() => setShowGlobalShare(false)}
        title="The Global Genital Integrity Atlas"
        geoName={selectedName || 'World Overview'}
        metricLabel={METRICS[metric].label}
        statSummary={selected && latest.get(selected) ? `${formatValue(latest.get(selected).value)} (${latest.get(selected).period})` : `${coverage.countries} countries with documented data`}
      />
    </div>
  );
}
