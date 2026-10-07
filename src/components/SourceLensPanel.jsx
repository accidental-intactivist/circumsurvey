import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Microscope, BookOpen, Newspaper, TrendingDown } from 'lucide-react';
import { FONT } from '../styles/tokens';
import { ASSESSMENTS, OUTLET_TYPES, GENERALIZES, leanMeta, categoryMeta, getFaviconUrl } from '../utils/newsLens';
import { CategoryChip, LeanPill, CoverageBalanceBar } from './LensChips';
import { generateFriendlySlug } from '../utils/slugs';

const panel = {
  background: 'var(--c-bgSoft)', borderRadius: '12px', padding: '1.75rem 2rem',
  border: '1px solid var(--c-borderMuted, rgba(255,255,255,0.08))', marginTop: '2rem',
};
const eyebrow = {
  fontFamily: FONT.condensed, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
  fontSize: '0.78rem', color: 'var(--c-goldBright)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem',
};
const label = { fontFamily: FONT.condensed, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--c-dim)' };
const value = { color: 'var(--c-textBright)', fontFamily: FONT.body, fontSize: '1rem', marginTop: '0.2rem' };

/** Outlet profile + study population/generalizability */
export function SourceLensPanel({ meta, category }) {
  const lens = meta?.lens;
  if (!lens) return null;
  const study = lens.study;
  const gen = study ? GENERALIZES[study.generalizes_to_us_newborns] || GENERALIZES.unclear : null;
  const lean = leanMeta(lens.coverage_lean);

  return (
    <section style={panel} aria-label="Source Lens">
      <h3 style={eyebrow}><Newspaper size={15} /> Source Lens</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
        <div>
          <div style={label}>Topic</div>
          <div style={{ marginTop: '0.4rem' }}><CategoryChip category={category || lens.category} /></div>
        </div>
        <div>
          <div style={label}>Coverage framing</div>
          <div style={{ marginTop: '0.4rem' }}><LeanPill lean={lens.coverage_lean} /></div>
          <div style={{ ...value, fontSize: '0.85rem', color: 'var(--c-dim)' }}>{lean.hint}</div>
        </div>
        <div>
          <div style={label}>Outlet type</div>
          <div style={value}>{OUTLET_TYPES[lens.outlet_type] || 'Other'}</div>
        </div>
        <div>
          <div style={label}>Relevance</div>
          <div style={value}>{lens.relevance}/10</div>
        </div>
      </div>

      {study && (
        <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 style={{ ...eyebrow, color: 'var(--c-blue)' }}><Microscope size={15} /> The study behind the story</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem' }}>
            {study.population && <div><div style={label}>Population</div><div style={value}>{study.population}</div></div>}
            {study.setting && <div><div style={label}>Setting</div><div style={value}>{study.setting}</div></div>}
            {study.design && <div><div style={label}>Design</div><div style={value}>{study.design}</div></div>}
            <div><div style={label}>Funding / conflicts</div><div style={value}>{study.funding_or_coi || 'Not stated'}</div></div>
          </div>
          {gen && (
            <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', borderRadius: '8px', background: `${gen.color}14`, borderLeft: `4px solid ${gen.color}` }}>
              <div style={{ fontFamily: FONT.condensed, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.85rem', color: gen.color }}>{gen.label}</div>
              {study.why && <p style={{ margin: '0.4rem 0 0', color: 'var(--c-text)', lineHeight: 1.6 }}>{study.why}</p>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SourceLink({ src }) {
  if (src.kind === 'archive') {
    return (
      <Link to={`/library/${generateFriendlySlug({ id: src.id, title: src.label }, {})}`} style={{ color: 'var(--c-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        <BookOpen size={13} /> {src.label}
      </Link>
    );
  }
  if (src.kind === 'brief' && src.url) {
    return (
      <a href={src.url} target="_blank" rel="noreferrer" style={{ color: 'var(--c-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        <ExternalLink size={13} /> {src.label}
      </a>
    );
  }
  return <span style={{ color: 'var(--c-text)' }}>{src.label}</span>;
}

/** Claim-by-claim context notes, each with its grounding sources */
export function ContextNotes({ meta }) {
  const claims = meta?.lens?.claims || [];
  if (!claims.length) return null;
  return (
    <section style={panel} aria-label="Context Notes">
      <h3 style={eyebrow}>◐ Context Notes</h3>
      <p style={{ margin: '-0.4rem 0 1.25rem', color: 'var(--c-dim)', fontSize: '0.9rem', lineHeight: 1.5 }}>
        Key claims in this story, checked against our archive and an editor-reviewed evidence brief.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {claims.map((c, i) => {
          const a = ASSESSMENTS[c.assessment] || ASSESSMENTS.needs_review;
          return (
            <div key={i} style={{ padding: '1.1rem 1.25rem', borderRadius: '10px', background: 'var(--c-bgCard)', borderLeft: `4px solid ${a.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ color: 'var(--c-textBright)', fontFamily: FONT.body, fontWeight: 600, lineHeight: 1.5, flex: '1 1 300px' }}>&ldquo;{c.claim}&rdquo;</div>
                <span style={{ fontFamily: FONT.condensed, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.78rem', color: a.color, whiteSpace: 'nowrap' }}>
                  {a.icon} {a.label}
                </span>
              </div>
              {c.context_note && <p style={{ margin: '0.6rem 0 0', color: 'var(--c-text)', lineHeight: 1.65 }}>{c.context_note}</p>}
              {c.sources?.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
                  <span style={label}>Sources</span>
                  {c.sources.map(s => <SourceLink key={s.id} src={s} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Other outlets covering the same story */
export function AlsoCoveredBy({ meta, url }) {
  const also = meta?.also_covered_by || [];
  if (!also.length) return null;
  const all = [{ source: meta.source_publication, url, title: meta.academic_title }, ...also];
  return (
    <section style={panel} aria-label="Coverage">
      <h3 style={eyebrow}><Newspaper size={15} /> {all.length} outlets covered this story</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {all.map((c, i) => {
          const fav = getFaviconUrl(c.url);
          return (
            <a key={i} href={c.url} target="_blank" rel="noreferrer" className="lux-hover-bright" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', textDecoration: 'none', color: 'var(--c-text)', padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'var(--c-bgCard)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {fav ? <img src={fav} alt="" style={{ width: 16, height: 16, borderRadius: '2px', opacity: 0.8 }} /> : <Newspaper size={14} style={{ opacity: 0.5 }} />}
                <span><strong style={{ color: 'var(--c-textBright)' }}>{c.source || 'Outlet'}</strong>{c.title ? ` · ${c.title}` : ''}</span>
              </span>
              <ExternalLink size={14} style={{ flexShrink: 0, marginTop: 3 }} />
            </a>
          );
        })}
      </div>
    </section>
  );
}

/** Digest-only: coverage balance, categorized sections, decline tracker */
export function DigestPulse({ meta }) {
  if (!meta?.sections && !meta?.coverage_balance) return null;
  return (
    <div>
      {meta.coverage_balance && (
        <section style={panel} aria-label="Coverage balance">
          <h3 style={eyebrow}>Coverage framing · {meta.story_count || 0} stories · last {meta.window_days || 7} days</h3>
          <CoverageBalanceBar balance={meta.coverage_balance} height={12} />
        </section>
      )}

      {meta.decline_note && (
        <section style={{ ...panel, borderLeft: '4px solid var(--c-goldBright)' }} aria-label="Decline tracker">
          <h3 style={eyebrow}><TrendingDown size={15} /> Decline Tracker</h3>
          <p style={{ margin: 0, color: 'var(--c-textBright)', lineHeight: 1.7, fontSize: '1.05rem' }}>{meta.decline_note}</p>
          {meta.rate_datapoints?.length > 0 && (
            <ul style={{ margin: '1rem 0 0', paddingLeft: '1.2rem', color: 'var(--c-text)', lineHeight: 1.7 }}>
              {meta.rate_datapoints.map((d, i) => (
                <li key={i}>
                  <strong>{d.rate_percent}%</strong> · {d.population} ({d.year}){d.source ? `, ${d.source}` : ''}
                  {d.doc_id && <> · <Link to={`/news/${d.doc_id}`} style={{ color: 'var(--c-blue)' }}>story</Link></>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {meta.sections?.length > 0 && (
        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {meta.sections.map((s, idx) => {
            const cat = categoryMeta(s.category);
            return (
              <article key={idx} className="lux-hover-lift" style={{ background: 'linear-gradient(145deg, var(--c-card), var(--c-bgSoft))', padding: '2rem 2.25rem', borderRadius: '16px', border: '1px solid var(--c-borderMuted)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: cat.color }} />
                <CategoryChip category={s.category} />
                <h4 style={{ color: 'var(--c-textBright)', margin: '0.9rem 0 0.9rem', fontSize: '1.45rem', fontFamily: FONT.display, lineHeight: 1.3 }}>{s.headline}</h4>
                <p style={{ color: 'var(--c-text)', lineHeight: 1.8, fontSize: '1.05rem', margin: 0 }}>{s.body}</p>
                {s.items?.length > 0 && (
                  <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {s.items.map(it => (
                      <Link key={it.id} to={`/news/${it.id}`} className="lux-hover-bright" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', textDecoration: 'none', color: 'var(--c-text)', padding: '0.55rem 0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                        <LeanPill lean={it.lean} />
                        <span style={{ color: 'var(--c-textBright)' }}>{it.title}</span>
                        <span style={{ color: 'var(--c-dim)', fontSize: '0.85rem' }}>· {it.outlet}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
