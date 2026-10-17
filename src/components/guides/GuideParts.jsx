import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, HelpCircle, BookOpen } from 'lucide-react';
import { EVIDENCE_BRIEF } from '../../../lib/news/evidence_brief.js';
import { TIERS } from '../../../lib/guides/compose.js';
import { riskStats, formatPct, formatNNT, RISK_SCENARIOS } from '../../../lib/guides/risk.js';

const BRIEF_BY_ID = Object.fromEntries(EVIDENCE_BRIEF.map(e => [e.id, e]));

/** Render minimal inline markdown: *emphasis* only (content is curated, not user input). */
export function InlineText({ text }) {
  const parts = String(text || '').split(/(\*[^*]+\*)/g);
  return parts.map((p, i) => (p.startsWith('*') && p.endsWith('*') && p.length > 2
    ? <em key={i}>{p.slice(1, -1)}</em>
    : <React.Fragment key={i}>{p}</React.Fragment>));
}

/** The claim-ledger badge: 📄 Documented · 🧭 Editorial position · 🗣️ Testimony */
export function ClaimTag({ tier, compact = false }) {
  const t = TIERS[tier];
  if (!t) return null;
  return (
    <span className={`gd-tag gd-tag--${tier}`} title={`${t.label}: ${t.blurb}`}>
      <span aria-hidden="true">{t.icon}</span>{!compact && <span className="gd-tag-label">{t.label}</span>}
    </span>
  );
}

/** Citation chips for a claim: brief entries (with hover summary) and free-text refs. */
export function Sources({ cites = [], refText }) {
  if (!cites.length && !refText) return null;
  return (
    <span className="gd-sources">
      {cites.map(id => {
        const e = BRIEF_BY_ID[id];
        if (!e) return null;
        const label = e.label.split(/[,:(]/)[0].trim();
        const readerUrl = e.readerUrl || (e.docId ? `/library/${e.docId}` : null);
        const titleText = `${e.label}\n\n${e.summary}\n\nScope: ${e.applies_to}${readerUrl ? '\n\n📖 Click to view full digitized document in Archive Library' : ''}`;
        
        if (readerUrl) {
          return (
            <Link key={id} to={readerUrl} className="gd-cite-link gd-cite-link--library" title={titleText} style={{ textDecoration: 'none' }}>
              <span className="gd-cite">
                <BookOpen size={11} style={{ marginRight: 4, verticalAlign: '-1px', display: 'inline-block' }} />
                {label}{e.as_of ? ` · as of ${e.as_of}` : ''}
              </span>
            </Link>
          );
        }
        
        const chip = <span className="gd-cite" title={titleText}>{label}{e.as_of ? ` · as of ${e.as_of}` : ''}</span>;
        return e.url
          ? <a key={id} href={e.url} target="_blank" rel="noopener noreferrer" className="gd-cite-link">{chip}<ExternalLink size={10} /></a>
          : <React.Fragment key={id}>{chip}</React.Fragment>;
      })}
      {refText && <span className="gd-cite gd-cite--ref">{refText}</span>}
    </span>
  );
}

/** A single ledger-tagged claim. */
export function Claim({ claim, compact = false, as: Tag = 'p' }) {
  if (!claim) return null;
  return (
    <Tag className={`gd-claim gd-claim--${claim.tier}`}>
      <ClaimTag tier={claim.tier} compact={compact} />
      <span className="gd-claim-text"><InlineText text={claim.text} /></span>
      {!compact && <Sources cites={claim.cites} refText={claim.ref} />}
    </Tag>
  );
}

/** Relative vs absolute risk widget with editable inputs. */
export function RiskWidget({ scenarioId }) {
  const scenario = RISK_SCENARIOS[scenarioId];
  const [base, setBase] = useState(scenario?.baselineRisk ?? 0);
  const [rrr, setRrr] = useState(scenario?.relativeReduction ?? 0);
  const stats = useMemo(() => riskStats({ baselineRisk: base, relativeReduction: rrr }), [base, rrr]);
  if (!scenario) return null;
  const perThousand = Math.round(stats.arr * 1000 * 100) / 100;
  return (
    <div className="gd-risk">
      <div className="gd-risk-head">
        <strong>Risk Reality: {scenario.label}</strong>
        <span className={`gd-risk-status gd-risk-status--${scenario.status}`}>{scenario.status === 'documented' ? 'Sourced inputs' : 'Illustrative: adjust inputs'}</span>
      </div>
      <div className="gd-risk-grid">
        <div><span className="gd-risk-num">{Math.round(stats.rrr * 100)}%</span><span className="gd-risk-lbl">"relative reduction" (the headline)</span></div>
        <div><span className="gd-risk-num">{formatPct(stats.arr)}</span><span className="gd-risk-lbl">absolute reduction ({perThousand} per 1,000 boys)</span></div>
        <div><span className="gd-risk-num">{formatNNT(stats.nnt)}</span><span className="gd-risk-lbl">boys circumcised to prevent one case of {scenario.outcome}</span></div>
      </div>
      <details className="gd-risk-inputs">
        <summary>Adjust inputs</summary>
        <label>Baseline risk without surgery: <b>{formatPct(base)}</b>
          <input type="range" min="0.0001" max="0.05" step="0.0001" value={base} onChange={e => setBase(Number(e.target.value))} />
        </label>
        <label>Claimed relative reduction: <b>{Math.round(rrr * 100)}%</b>
          <input type="range" min="0" max="0.95" step="0.01" value={rrr} onChange={e => setRrr(Number(e.target.value))} />
        </label>
      </details>
      <p className="gd-risk-note">{scenario.note}</p>
      <Sources cites={scenario.cites} />
    </div>
  );
}

/** The counter-evidence card. */
export function CounterEvidenceCard({ card, showRisk = true, compact = false }) {
  return (
    <article className="gd-card" id={`card-${card.id}`}>
      <h3 className="gd-card-claim">{card.claim}</h3>
      <div className="gd-card-section">
        <span className="gd-card-kicker">What's true</span>
        <Claim claim={card.whatsTrue} compact={compact} />
      </div>
      <div className="gd-card-section">
        <span className="gd-card-kicker">What the evidence shows</span>
        {card.evidence.map((c, i) => <Claim key={i} claim={c} compact={compact} />)}
      </div>
      {showRisk && card.risk && <RiskWidget scenarioId={card.risk} />}
      <div className="gd-card-ask">
        <HelpCircle size={16} />
        <span><span className="gd-card-kicker">Ask back</span> {card.askBack}</span>
      </div>
    </article>
  );
}

export function VoiceQuote({ voice }) {
  return (
    <figure className="gd-voice">
      <blockquote>“{voice.quote}”</blockquote>
      <figcaption><ClaimTag tier="testimony" compact /> {voice.who} <span className="gd-voice-ref">· {voice.ref}</span></figcaption>
    </figure>
  );
}

export function SurveyFacts({ survey }) {
  if (!survey) return null;
  return (
    <div className="gd-survey">
      {survey.groups.map((g, i) => <p key={i} className={g.small ? 'gd-survey-small' : ''}><ClaimTag tier="testimony" compact /> {g.text}</p>)}
      <p className="gd-survey-path">{survey.pathwaysText} <span className="gd-muted">(Inquiry snapshot, {survey.as_of})</span></p>
    </div>
  );
}

export function ResourceList({ resources, title = 'Where to go next' }) {
  if (!resources?.length) return null;
  return (
    <section className="gd-resources">
      <h2>{title}</h2>
      <ul>
        {resources.map(r => (
          <li key={r.id}>
            {r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer">{r.name} <ExternalLink size={12} /></a> : <strong>{r.name}</strong>}
            <span> · {r.blurb}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Legend explaining the claim ledger. */
export function LedgerLegend() {
  return (
    <div className="gd-legend" aria-label="Claim ledger legend">
      {Object.keys(TIERS).map(k => <span key={k}><ClaimTag tier={k} /> <span className="gd-muted">{TIERS[k].blurb}</span></span>)}
    </div>
  );
}
