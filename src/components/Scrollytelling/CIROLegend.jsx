import React, { useMemo } from 'react';

/**
 * CIROLegend — Animated cohort legend showing Phase 1 respondent counts.
 * 
 * Displays the four primary cohorts (Circumcised, Intact, Restoring, Observer)
 * with color-coded dots and static Phase 1 counts. Designed to appear in Act 2
 * and optionally persist as a compact floating reference through subsequent acts.
 * 
 * Fully theme-aware — all colors use CSS custom properties.
 */

const COHORTS = [
  { id: 'circumcised', label: 'Circumcised', emoji: '🔵', n: 213, cssVar: '--path-circumcised', fallback: '#d94f4f' },
  { id: 'intact',      label: 'Intact',      emoji: '🟢', n: 142, cssVar: '--path-intact',      fallback: '#5b93c7' },
  { id: 'restoring',   label: 'Restoring',   emoji: '🟣', n: 109, cssVar: '--path-restoring',   fallback: '#e8c868' },
  { id: 'observer',    label: 'Observer',     emoji: '🟠', n: 37,  cssVar: '--path-observer',    fallback: '#e8a44a' },
];

const TOTAL = COHORTS.reduce((sum, c) => sum + c.n, 0);

export default function CIROLegend({ compact = false, style = {} }) {
  const cohortItems = useMemo(() => COHORTS.map(c => ({
    ...c,
    pct: ((c.n / TOTAL) * 100).toFixed(0),
  })), []);

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.4rem 0.8rem',
        background: 'var(--c-bgSoft)',
        border: '1px solid var(--c-ghost)',
        borderRadius: 8,
        fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        ...style,
      }}>
        {cohortItems.map(c => (
          <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: `var(${c.cssVar}, ${c.fallback})`,
              display: 'inline-block',
              flexShrink: 0,
            }} />
            <span style={{ color: 'var(--c-muted)' }}>{c.n}</span>
          </span>
        ))}
        <span style={{
          color: 'var(--c-dim)',
          fontFamily: "var(--f-body, 'Barlow', sans-serif)",
          fontWeight: 400,
          fontSize: '0.68rem',
          fontStyle: 'italic',
          marginLeft: '0.2rem',
        }}>
          n={TOTAL}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '0.75rem',
      maxWidth: 640,
      margin: '0 auto',
      ...style,
    }}>
      {cohortItems.map(c => (
        <div key={c.id} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.6rem 0.8rem',
          background: 'var(--c-bgSoft)',
          border: '1px solid var(--c-ghost)',
          borderRadius: 8,
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}>
          {/* Color dot */}
          <div style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: `var(${c.cssVar}, ${c.fallback})`,
            flexShrink: 0,
            boxShadow: `0 0 8px color-mix(in srgb, var(${c.cssVar}, ${c.fallback}) 40%, transparent)`,
          }} />
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: `var(${c.cssVar}, ${c.fallback})`,
              lineHeight: 1.2,
            }}>
              {c.label}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.68rem',
              color: 'var(--c-muted)',
              lineHeight: 1.3,
            }}>
              n={c.n} · {c.pct}%
            </div>
          </div>
        </div>
      ))}

      {/* Total bar */}
      <div style={{
        gridColumn: '1 / -1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.45rem 0.8rem',
        borderTop: '1px solid var(--c-ghost)',
        marginTop: '0.25rem',
      }}>
        <span style={{
          fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
          fontWeight: 700,
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--c-gold)',
        }}>
          Phase 1 Total
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--c-textBright)',
          background: 'var(--c-bgSoft)',
          padding: '0.15rem 0.5rem',
          borderRadius: 999,
          border: '1px solid var(--c-ghost)',
        }}>
          n = {TOTAL}
        </span>
      </div>
    </div>
  );
}
