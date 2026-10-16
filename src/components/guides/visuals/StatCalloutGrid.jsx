import React from 'react';
import { Sparkles, Activity, ShieldCheck, Globe2 } from 'lucide-react';
import { FONT } from '../../../styles/tokens';

const STATS = [
  {
    value: '20,000+',
    unit: 'Nerve Endings',
    label: 'Specialized Erogenous Receptors',
    detail: 'Taylor et al. (1996) demonstrated the ridged band contains the highest density of Meissner’s tactile corpuscles on the male body.',
    citation: 'Taylor et al., Br J Urol',
    color: '#1a5c3a'
  },
  {
    value: '15 sq. in.',
    unit: 'Mucosal Surface Area',
    label: 'Functional Adult Tissue',
    detail: 'Between 30% and 50% of total penile shaft skin is excised during neonatal circumcision, eliminating the dual-layered glide mechanism.',
    citation: 'Werker et al., Plast Reconstr Surg',
    color: '#d4a030'
  },
  {
    value: '1 : 1,228',
    unit: 'Number Needed to Treat',
    label: 'To Prevent 1 Infant UTI',
    detail: 'According to the AAP’s own 2012 technical data, 1,228 healthy infant boys must undergo irreversible surgery to prevent a single treatable UTI.',
    citation: 'AAP Technical Report (2012)',
    color: '#d94f4f'
  },
  {
    value: '78%',
    unit: 'Global Intact Norm',
    label: 'Worldwide Non-Cutting Majority',
    detail: 'Over three-quarters of men globally remain intact. Across Western Europe, Britain, Scandinavia, and Australasia, non-therapeutic cutting is rejected.',
    citation: 'WHO Global Prevalence Data',
    color: '#5b93c7'
  }
];

export default function StatCalloutGrid({ customStats }) {
  const items = customStats || STATS;

  return (
    <div style={{
      margin: '2rem 0 2.5rem 0',
      width: '100%'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        alignItems: 'stretch'
      }}>
        {items.map((stat, idx) => (
          <div
            key={idx}
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #fbf9f5 100%)',
              border: '1px solid #e5dfd3',
              borderTop: `4px solid ${stat.color}`,
              borderRadius: '12px',
              padding: '1.25rem 1.15rem',
              boxShadow: '0 4px 16px rgba(31, 37, 35, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            {/* Value & Unit */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: FONT.display,
                fontSize: '1.85rem',
                fontWeight: 800,
                color: stat.color,
                lineHeight: 1.1
              }}>
                {stat.value}
              </span>
              {stat.unit && (
                <span style={{
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  color: '#666',
                  letterSpacing: '0.04em'
                }}>
                  {stat.unit}
                </span>
              )}
            </div>

            {/* Label */}
            <div style={{
              fontFamily: FONT.condensed,
              fontWeight: 800,
              fontSize: '0.85rem',
              color: '#222',
              marginTop: '0.35rem',
              marginBottom: '0.5rem',
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}>
              {stat.label}
            </div>

            {/* Detail copy */}
            <p style={{
              fontFamily: FONT.body,
              fontSize: '0.85rem',
              color: '#555',
              lineHeight: 1.45,
              margin: '0 0 0.85rem 0',
              flex: 1
            }}>
              {stat.detail}
            </p>

            {/* Sourced Citation Footnote */}
            {stat.citation && (
              <div style={{
                borderTop: '1px solid #eee',
                paddingTop: '0.45rem',
                fontSize: '0.72rem',
                fontFamily: FONT.mono,
                color: '#888',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <span style={{ color: stat.color }}>●</span>
                <span>{stat.citation}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
