import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Sparkles, FilePlus2, X, AlertTriangle, Calculator, ExternalLink, Share2, Check } from 'lucide-react';
import { METRICS, STAT_TIERS, colorForValue, recencyBucket, RECENCY } from '../../../lib/atlas/metrics.js';
import { formatValue, seriesFor, latestRegionalSet, observationToMarkdown } from '../../../lib/atlas/series.js';
import { SEED_TODO, US_CENSUS_REGIONS } from '../../../lib/atlas/seed.js';
import AtlasShareModal from './AtlasShareModal';

function TierBadge({ tier = 'documented' }) {
  const t = STAT_TIERS[tier];
  return <span className={`at-tier at-tier--${tier}`} title={t.blurb}>{t.icon} {t.label}</span>;
}

function RegionBars({ rows, todo = [] }) {
  if (!rows.length && !todo.length) return null;
  return (
    <ul className="at-bars">
      {rows.map(r => (
        <li key={r.id} title={r.flags?.join('; ')}>
          <span className="at-bar-label">{r.geo_name}{r.flags?.length ? ' ⚑' : ''}</span>
          <span className="at-bar-track"><span className="at-bar-fill" style={{ width: `${r.value}%`, background: colorForValue(r.value) }} /></span>
          <span className="at-bar-val">{formatValue(r.value)}</span>
        </li>
      ))}
      {todo.map(t => (
        <li key={t.geo} className="at-bar--todo">
          <span className="at-bar-label">{US_CENSUS_REGIONS[t.geo.split(':')[1]]?.name || t.geo}</span>
          <span className="at-bar-track at-bar-track--todo" />
          <span className="at-bar-val" title={t.note}>verify</span>
        </li>
      ))}
    </ul>
  );
}

export default function CountryPanel({ geo, name, metric, observations, regionObs, regionsLoading, sources, nowYear, onClose, onAsk, onAddToReport, onMetric }) {
  const [addedToReport, setAddedToReport] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const m = METRICS[metric];
  const series = seriesFor(observations, geo, metric);
  const latest = series.at(-1);
  const otherMetric = Object.keys(METRICS).find(k => k !== metric && seriesFor(observations, geo, k).length);
  const { period: regionPeriod, rows: regionRows } = latestRegionalSet(regionObs, geo, metric);
  const todo = SEED_TODO.filter(t => t.geo.startsWith(`${geo}:`) && t.metric === metric);
  const usedSourceIds = [...new Set([...series, ...regionRows].map(o => o.source_id))];
  const recency = latest ? recencyBucket(latest.period, nowYear) : 'none';

  const handleAddToReportClick = () => {
    if (!latest) return;
    const src = sources.get(latest.source_id);
    onAddToReport(observationToMarkdown(latest, src), src);
    setAddedToReport(true);
    setTimeout(() => setAddedToReport(false), 3500);
  };

  const statSummary = latest ? `${formatValue(latest.value)} (${latest.period})` : null;
  const primaryCitation = latest && sources.get(latest.source_id)?.citation;

  return (
    <aside className="at-panel" aria-label={`${name} profile`}>
      <header className="at-panel-head">
        <div>
          <div className="gd-series">{m.label}</div>
          <h2 className="at-panel-title">{name}</h2>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <button type="button" className="at-icon-btn" onClick={() => setShowShare(true)} aria-label="Share profile" title="Share profile" id="atlas-panel-share-icon">
            <Share2 size={17} />
          </button>
          <button type="button" className="at-icon-btn" onClick={onClose} aria-label="Close profile" id="atlas-panel-close">
            <X size={18} />
          </button>
        </div>
      </header>

      {latest ? (
        <>
          <div className="at-figure">
            <div className="at-figure-num" style={{ color: colorForValue(Math.max(latest.value, 60)) }}>{formatValue(latest.value)}</div>
            <div className="at-figure-meta">
              <TierBadge tier={latest.tier} />
              <span>{latest.period}{latest.n ? ` · n = ${latest.n.toLocaleString('en-US')}` : ''}</span>
              <span className="at-recency" style={{ '--rc': RECENCY[recency].color }}>● data {RECENCY[recency].label}</span>
            </div>
            <p className="at-pop">{latest.population || m.population}</p>
            {latest.flags?.length > 0 && <p className="at-flag"><AlertTriangle size={14} /> Validator note: {latest.flags.join('; ')}</p>}
          </div>

          {metric === 'newborn_inpatient' && (
            <div className="at-floor">
              <h3>This figure is a floor, not the true rate</h3>
              <p>It counts only procedures done before the baby leaves the birth hospital. Not counted:</p>
              <ul>{m.coverageGaps.map(g => <li key={g}>{g}</li>)}</ul>
              <p className="at-modeled"><Calculator size={14} /> <TierBadge tier="modeled" /> <strong>Estimated rate, all settings:</strong> the model is being built (Phase B). It will show a range with every assumption listed, so the number can be checked and challenged.</p>
            </div>
          )}

          {series.length > 1 && (
            <div className="at-chart">
              <h3>Trend</h3>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={series.map(o => ({ year: o.period, value: o.value }))} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#e2dccf" strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#4a524f' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#4a524f' }} />
                  <Tooltip formatter={v => formatValue(v)} contentStyle={{ fontFamily: 'Barlow', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="value" stroke="#1a5c3a" strokeWidth={2.5} dot={{ r: 4, fill: '#d4a030', stroke: '#1a5c3a' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : (
        <div className="at-empty">
          <p><strong>No {m.short.toLowerCase()} figure in the ledger yet.</strong></p>
          <p className="gd-muted">We only map numbers we can source. {otherMetric ? '' : 'This country has no household-survey data in the DHS program, and no other source has been verified yet.'}</p>
        </div>
      )}

      {otherMetric && (
        <button type="button" className="at-switch" onClick={() => onMetric(otherMetric)} id="atlas-switch-metric">
          Also available: <strong>{METRICS[otherMetric].label}</strong> →
        </button>
      )}

      {(regionRows.length > 0 || todo.length > 0 || regionsLoading) && (
        <div className="at-regions">
          <h3>By region {regionPeriod ? <span className="gd-muted">({regionPeriod})</span> : null}</h3>
          {regionsLoading ? <p className="gd-muted">Loading regional data…</p> : <RegionBars rows={regionRows} todo={todo} />}
        </div>
      )}

      {usedSourceIds.length > 0 && (
        <div className="at-sources">
          <h3>Sources</h3>
          <ul>
            {usedSourceIds.map(id => {
              const s = sources.get(id);
              if (!s) return <li key={id}>{id}</li>;
              return (
                <li key={id}>
                  {s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.citation} <ExternalLink size={11} /></a> : s.citation}
                  {s.bias_note && <div className="at-bias">⚠ {s.bias_note}</div>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="at-actions">
        <button type="button" className="gd-btn gd-btn--primary" onClick={() => onAsk(name, latest)} id="atlas-ask-assistant">
          <Sparkles size={15} /> Ask Assistant
        </button>
        {latest && (
          <button
            type="button"
            className={`gd-btn ${addedToReport ? 'gd-btn--success' : ''}`}
            onClick={handleAddToReportClick}
            id="atlas-add-report"
          >
            {addedToReport ? (
              <><Check size={15} style={{ color: '#10b981' }} /> Added to Report</>
            ) : (
              <><FilePlus2 size={15} /> Add to Report</>
            )}
          </button>
        )}
        <button
          type="button"
          className="gd-btn"
          onClick={() => setShowShare(true)}
          id="atlas-share-btn"
        >
          <Share2 size={15} /> Share
        </button>
      </div>

      {addedToReport && (
        <div className="at-report-alert">
          <span><Check size={14} style={{ color: '#10b981' }} /> Added {name} profile to Evidence Report</span>
          <Link to="/assistant" className="at-report-link" id="atlas-open-report-link">Open Report &rarr;</Link>
        </div>
      )}

      <AtlasShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        title={`${name} · ${m.label}`}
        statSummary={statSummary}
        citation={primaryCitation}
        geoName={name}
        metricLabel={m.label}
      />
    </aside>
  );
}
