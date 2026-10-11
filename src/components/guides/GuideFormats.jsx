import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, Check, AlertTriangle, ShieldAlert } from 'lucide-react';
import { cardClaims } from '../../../lib/guides/compose.js';
import { Claim, ClaimTag, CounterEvidenceCard, InlineText, LedgerLegend, ResourceList, SurveyFacts, VoiceQuote } from './GuideParts';

const SERIES = 'The Accidental Intactivist\u2019s Guide';

function Masthead({ guide }) {
  return (
    <header className="gd-masthead">
      <div className="gd-series">{SERIES}</div>
      <h1 className="gd-title">{guide.title}</h1>
      {guide.subtitle && <p className="gd-subtitle">{guide.subtitle}</p>}
      {guide.audience && <p className="gd-audience">{guide.audience}</p>}
    </header>
  );
}

function Warnings({ guide }) {
  if (!guide.warnings?.length) return null;
  return <div className="gd-warning"><AlertTriangle size={16} />{guide.warnings.join(' ')}</div>;
}

/** Advocate-facing notes: what they may believe + language do/don't. Hidden in print. */
function AdvocateNotes({ guide }) {
  return (
    <aside className="gd-advocate no-print">
      <h3>Advocate's notes <span className="gd-muted">(not printed)</span></h3>
      {guide.believes?.length > 0 && (<><h4>They may believe</h4><ul>{guide.believes.map(b => <li key={b}>{b}</li>)}</ul></>)}
      {guide.values?.length > 0 && (<><h4>Lead with</h4><div className="gd-chips">{guide.values.map(v => <span key={v} className="gd-chip">{v}</span>)}</div></>)}
      {guide.language && (
        <>
          <h4>Language</h4>
          <p><b>Use:</b> {guide.language.use.join(', ') || '(any)'}</p>
          <p><b>Avoid:</b> {guide.language.avoid.join(', ')}</p>
        </>
      )}
    </aside>
  );
}

function EditorialBlock({ guide }) {
  return (
    <section className={`gd-editorial gd-editorial--${guide.editorialPlacement}`}>
      <h2>Our position</h2>
      {guide.editorialPlacement === 'sidebar' && <p className="gd-muted">Clearly marked as editorial, so you can weigh the evidence separately.</p>}
      {guide.editorial.map((c, i) => <Claim key={i} claim={c} />)}
    </section>
  );
}

export function SourcesList({ citations }) {
  if (!citations?.length) return null;
  return (
    <section className="gd-sources-list">
      <h2>Sources</h2>
      <ol>
        {citations.map(e => (
          <li key={e.id} id={`src-${e.id}`}>
            {e.url ? <a href={e.url} target="_blank" rel="noopener noreferrer">{e.label}</a> : e.label}
            {e.as_of && <span className="gd-muted"> (status as of {e.as_of})</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Format 1: the magazine-style Special Report (also the print/PDF layout). */
export function SpecialReport({ guide, showAdvocateNotes = true }) {
  return (
    <div className="gd-report">
      <Masthead guide={guide} />
      <Warnings guide={guide} />
      <LedgerLegend />
      <div className="gd-report-body">
        <div className="gd-report-main">
          <section>
            <h2>Where we agree</h2>
            {guide.commonGround.map((c, i) => <Claim key={i} claim={c} as="p" />)}
          </section>
          <section>
            <h2>What's at stake</h2>
            {guide.coreTruths.map((c, i) => <Claim key={i} claim={c} />)}
            {guide.points.map((c, i) => <Claim key={`p${i}`} claim={c} />)}
          </section>
          <section>
            <h2>Answering the common reasons</h2>
            <div className="gd-cards">{guide.cards.map(card => <CounterEvidenceCard key={card.id} card={card} />)}</div>
          </section>
          <section>
            <h2>People like you</h2>
            <SurveyFacts survey={guide.survey} />
            {guide.voices.map(v => <VoiceQuote key={v.quote} voice={v} />)}
          </section>
          {guide.editorialPlacement === 'main' && <EditorialBlock guide={guide} />}
          {guide.questions.length > 0 && (
            <section>
              <h2>Questions to ask together</h2>
              <ol className="gd-questions">{guide.questions.map(q => <li key={q}>{q}</li>)}</ol>
            </section>
          )}
          <ResourceList resources={guide.resources} />
          <SourcesList citations={guide.citations} />
        </div>
        <div className="gd-report-side">
          {guide.editorialPlacement === 'sidebar' && <EditorialBlock guide={guide} />}
          {showAdvocateNotes && <AdvocateNotes guide={guide} />}
        </div>
      </div>
    </div>
  );
}

/** Format 2: one-page pocket card (front + back). */
export function PocketCard({ guide }) {
  const facts = [guide.coreTruths[0], ...guide.cards.slice(0, 2).map(c => c.evidence[0])].filter(Boolean);
  return (
    <div className="gd-pocket">
      <div className="gd-pocket-face">
        <div className="gd-series">{SERIES}</div>
        <h2>{guide.title}</h2>
        {guide.commonGround.slice(0, 2).map((c, i) => <p key={i} className="gd-pocket-opener"><InlineText text={c.text} /></p>)}
        <h3>Three things to know</h3>
        <ol>{facts.map((c, i) => <li key={i}><ClaimTag tier={c.tier} compact /> <InlineText text={c.text} /></li>)}</ol>
      </div>
      <div className="gd-pocket-face">
        <h3>If you hear…</h3>
        <ul className="gd-pocket-asks">
          {guide.cards.slice(0, 4).map(c => <li key={c.id}><b>{c.claim}</b><br />Ask: <i>{c.askBack}</i></li>)}
        </ul>
        {guide.questions.length > 0 && (<><h3>Questions to ask together</h3><ul>{guide.questions.slice(0, 3).map(q => <li key={q}>{q}</li>)}</ul></>)}
        <p className="gd-pocket-foot">📄 Documented · 🧭 Editorial · 🗣️ Testimony. Full sources in the online guide.</p>
      </div>
    </div>
  );
}

/** Format 3: conversation guide. "If they say… you might say…" */
export function ConversationGuide({ guide }) {
  return (
    <div className="gd-convo">
      <Masthead guide={guide} />
      <Warnings guide={guide} />
      <section>
        <h2>Open with common ground</h2>
        {guide.commonGround.map((c, i) => <Claim key={i} claim={c} />)}
      </section>
      <section>
        <h2>If they say… you might say…</h2>
        {guide.cards.map(card => (
          <div key={card.id} className="gd-convo-row">
            <div className="gd-convo-they"><span className="gd-card-kicker">They say</span>{card.claim}</div>
            <div className="gd-convo-you">
              <span className="gd-card-kicker">Acknowledge</span>
              <p><InlineText text={card.whatsTrue.text} /></p>
              <span className="gd-card-kicker">Then</span>
              <Claim claim={card.evidence[0]} />
              <span className="gd-card-kicker">Ask</span>
              <p className="gd-convo-ask">{card.askBack}</p>
            </div>
          </div>
        ))}
      </section>
      {guide.questions.length > 0 && <section><h2>Questions to explore together</h2><ul>{guide.questions.map(q => <li key={q}>{q}</li>)}</ul></section>}
      <AdvocateNotes guide={guide} />
    </div>
  );
}

function buildSlides(guide) {
  const slides = [{ kind: 'title' }];
  slides.push({ kind: 'claims', title: 'Where we agree', claims: guide.commonGround });
  slides.push({ kind: 'claims', title: 'What\u2019s at stake', claims: guide.coreTruths });
  guide.cards.forEach(card => slides.push({ kind: 'card', card }));
  if (guide.voices.length) slides.push({ kind: 'voices', title: 'In their words', voices: guide.voices.slice(0, 2) });
  slides.push({ kind: 'claims', title: 'Our position', claims: guide.editorial });
  if (guide.questions.length) slides.push({ kind: 'list', title: 'Questions to ask together', items: guide.questions });
  return slides;
}

/** Format 4: slide deck, navigable with arrow keys. */
export function SlideDeck({ guide }) {
  const slides = useMemo(() => buildSlides(guide), [guide]);
  const [i, setI] = useState(0);
  const go = useCallback(d => setI(x => Math.min(slides.length - 1, Math.max(0, x + d))), [slides.length]);
  useEffect(() => {
    const onKey = e => {
      if (e.target.closest?.('input, textarea, select')) return;
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(1); }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);
  useEffect(() => setI(0), [guide]);
  const s = slides[i];
  return (
    <div className="gd-deck">
      <div className="gd-slide" key={i}>
        {s.kind === 'title' && (<><div className="gd-series">{SERIES}</div><h1>{guide.title}</h1><p className="gd-subtitle">{guide.subtitle}</p></>)}
        {s.kind === 'claims' && (<><h2>{s.title}</h2>{s.claims.map((c, k) => <Claim key={k} claim={c} compact />)}</>)}
        {s.kind === 'card' && (<><h2>{s.card.claim}</h2>{cardClaims(s.card).map((c, k) => <Claim key={k} claim={c} compact />)}<p className="gd-slide-ask">{s.card.askBack}</p></>)}
        {s.kind === 'voices' && (<><h2>{s.title}</h2>{s.voices.map(v => <VoiceQuote key={v.quote} voice={v} />)}</>)}
        {s.kind === 'list' && (<><h2>{s.title}</h2><ol>{s.items.map(q => <li key={q}>{q}</li>)}</ol></>)}
      </div>
      <div className="gd-deck-nav no-print">
        <button type="button" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous slide"><ChevronLeft /></button>
        <span>{i + 1} / {slides.length}</span>
        <button type="button" onClick={() => go(1)} disabled={i === slides.length - 1} aria-label="Next slide"><ChevronRight /></button>
      </div>
    </div>
  );
}

function letterText(guide) {
  const pts = guide.cards.slice(0, 3).map(c => `• ${c.claim.replace(/"/g, '')}: ${c.evidence[0].text.replace(/\*/g, '')}`).join('\n');
  const srcs = guide.citations.slice(0, 8).map((e, n) => `[${n + 1}] ${e.label}${e.url ? ` ${e.url}` : ''}`).join('\n');
  return `Dear [Representative / Senator Name],

I am a constituent writing to ask you to support equal protection for every child against medically unnecessary genital surgery, and to end public funding of non-therapeutic infant circumcision.

Federal law already protects girls from any non-therapeutic genital cutting. Boys and intersex children deserve the same protection. No major medical body recommends routine newborn circumcision; even the American Academy of Pediatrics has said the benefits are not great enough to recommend it routinely.

${pts}

Any benefit claimed for infant circumcision can be obtained later, by the individual himself, or by less invasive means. I respectfully ask that you:
1. Support ending Medicaid and state funding for non-therapeutic infant circumcision.
2. Support equal protection for all children under our genital-cutting statutes.
3. Support stronger informed-consent requirements, including disclosure of non-surgical alternatives.

Thank you for your time and service.

Sincerely,
[Your name]
[Address / district]

Sources:
${srcs}`;
}

/** Format 5: editable letter to a legislator. */
export function LegislatorLetter({ guide }) {
  const [text, setText] = useState(() => letterText(guide));
  const [copied, setCopied] = useState(false);
  useEffect(() => setText(letterText(guide)), [guide]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
  };
  return (
    <div className="gd-letter">
      <div className="gd-series">{SERIES}</div>
      <h1 className="gd-title">Letter to a legislator</h1>
      <p className="gd-muted no-print">Edit freely and add your own story; personal letters carry the most weight. Find your representatives on your state legislature's website.</p>
      <textarea id="legislator-letter" value={text} onChange={e => setText(e.target.value)} rows={28} />
      <pre className="gd-letter-print print-only">{text}</pre>
      <button type="button" className="gd-btn no-print" onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy letter'}</button>
    </div>
  );
}

/** Playbook mode (trolls / circumfetishists). */
export function Playbook({ guide }) {
  const pb = guide.playbook;
  const Section = ({ title, items, className }) => (
    <section className={className}><h2>{title}</h2><ul>{items.map(x => <li key={x}>{x}</li>)}</ul></section>
  );
  return (
    <div className="gd-report gd-playbook">
      <Masthead guide={guide} />
      <div className="gd-warning"><ShieldAlert size={16} />Never share images or identifying details of any child. If something suggests a child may be at risk, report it.</div>
      <Section title="Recognize bad faith" items={pb.recognize} />
      <Section title="Principles" items={pb.principles} />
      <section><h2>Copy-ready replies</h2>{pb.scripts.map(s => <blockquote key={s} className="gd-script">{s}</blockquote>)}</section>
      <Section title="Safety & reporting" items={pb.safety} className="gd-safety" />
      {guide.cards.length > 0 && (
        <section><h2>Cards worth linking</h2><div className="gd-cards">{guide.cards.map(c => <CounterEvidenceCard key={c.id} card={c} showRisk={false} compact />)}</div></section>
      )}
      <ResourceList resources={guide.resources} title="Support for you" />
    </div>
  );
}

export function GuideRenderer({ guide, format, showAdvocateNotes }) {
  if (guide.mode === 'playbook') return <Playbook guide={guide} />;
  switch (format) {
    case 'card': return <PocketCard guide={guide} />;
    case 'conversation': return <ConversationGuide guide={guide} />;
    case 'slides': return <SlideDeck guide={guide} />;
    case 'letter': return <LegislatorLetter guide={guide} />;
    default: return <SpecialReport guide={guide} showAdvocateNotes={showAdvocateNotes} />;
  }
}
