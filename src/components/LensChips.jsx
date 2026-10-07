import React from 'react';
import { FONT } from '../styles/tokens';
import { categoryMeta, leanMeta, LEANS } from '../utils/newsLens';

const chipBase = {
  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
  padding: '0.22rem 0.6rem', borderRadius: '999px',
  fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.75rem',
  letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap',
};

export function CategoryChip({ category, onClick, active }) {
  const c = categoryMeta(category);
  return (
    <span
      onClick={onClick}
      title={c.key}
      style={{
        ...chipBase,
        color: c.color,
        background: active ? `${c.color}33` : `${c.color}1a`,
        border: `1px solid ${c.color}${active ? 'aa' : '55'}`,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
      {c.short}
    </span>
  );
}

export function LeanPill({ lean }) {
  if (!lean) return null;
  const l = leanMeta(lean);
  const idx = LEANS.findIndex(x => x.key === l.key);
  return (
    <span title={`Coverage framing: ${l.label}. ${l.hint}`} style={{ ...chipBase, color: l.color, background: 'transparent', border: `1px solid ${l.color}55` }}>
      <span style={{ display: 'inline-flex', gap: 2 }}>
        {LEANS.map((x, i) => (
          <span key={x.key} style={{ width: 8, height: 8, borderRadius: 2, background: i === idx ? x.color : 'rgba(255,255,255,0.12)' }} />
        ))}
      </span>
      {l.label}
    </span>
  );
}

export function ContextBadge({ count }) {
  if (!count) return null;
  return (
    <span title="Our analysis added sourced context to claims in this story" style={{ ...chipBase, color: '#e0a845', background: 'rgba(224,168,69,0.1)', border: '1px solid rgba(224,168,69,0.4)' }}>
      ◐ Context added · {count}
    </span>
  );
}

export function CoverageCount({ count }) {
  if (!count || count < 2) return null;
  return (
    <span title="Number of outlets that covered this story" style={{ ...chipBase, color: 'var(--c-text)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}>
      {count} outlets
    </span>
  );
}

/** Horizontal stacked bar of coverage framing counts, e.g. { pro_ric: 2, neutral: 5, ... } */
export function CoverageBalanceBar({ balance, height = 10, showLegend = true }) {
  const total = LEANS.reduce((s, l) => s + (balance?.[l.key] || 0), 0);
  if (!total) return null;
  return (
    <div>
      <div style={{ display: 'flex', height, borderRadius: height, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
        {LEANS.map(l => {
          const n = balance?.[l.key] || 0;
          if (!n) return null;
          return <div key={l.key} title={`${l.label}: ${n}`} style={{ width: `${(n / total) * 100}%`, background: l.color, transition: 'width 0.6s ease' }} />;
        })}
      </div>
      {showLegend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.6rem', fontFamily: FONT.condensed, fontSize: '0.8rem', letterSpacing: '0.05em', color: 'var(--c-dim)' }}>
          {LEANS.map(l => (
            <span key={l.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
              {l.label} <strong style={{ color: 'var(--c-textBright)' }}>{balance?.[l.key] || 0}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
