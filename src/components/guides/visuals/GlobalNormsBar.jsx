import React from 'react';
import { Globe, Check, AlertCircle } from 'lucide-react';
import { FONT } from '../../../styles/tokens';

const REGIONS = [
  { region: 'Western & Northern Europe', pct: 98, status: 'Overwhelming Intact Norm', note: 'Medical councils in UK, Sweden, Germany, Netherlands, Denmark oppose routine cutting.' },
  { region: 'Latin America', pct: 99, status: 'Overwhelming Intact Norm', note: 'Almost entirely intact across Brazil, Argentina, Colombia, Mexico, and Chile.' },
  { region: 'Australia & New Zealand', pct: 82, status: 'Strong Intact Majority', note: 'Fell from 80% cut in 1950s to under 15% today following RACP policy statements.' },
  { region: 'Global Average (Worldwide)', pct: 78, status: 'Global Majority', note: 'Over three-quarters of all men alive today are intact.' },
  { region: 'United States', pct: 45, status: 'Steep Generational Decline', note: 'Dropping steadily from peak 1970s rates; majority of boys in the Western US now remain intact.' }
];

export default function GlobalNormsBar() {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #ffffff 0%, #faf8f5 100%)',
      border: '1px solid #e2dccf',
      borderRadius: '16px',
      padding: '1.75rem',
      margin: '2rem 0 2.5rem 0',
      boxShadow: '0 6px 24px rgba(31, 37, 35, 0.06)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid #e8e2d5',
        paddingBottom: '1rem'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontFamily: FONT.condensed,
            fontWeight: 800,
            fontSize: '0.74rem',
            color: '#1a5c3a',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '0.25rem'
          }}>
            <Globe size={14} /> Global Cartography • International Medical Policies
          </div>
          <h3 style={{
            fontFamily: FONT.display,
            fontSize: '1.35rem',
            color: '#1f2523',
            margin: 0
          }}>
            Intactness is the Global Standard
          </h3>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#666', fontFamily: FONT.condensed }}>
          Percentage of men remaining intact
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {REGIONS.map((r, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
              <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: '0.92rem', color: '#1f2523' }}>
                {r.region}
              </span>
              <span style={{ fontFamily: FONT.mono, fontSize: '0.82rem', fontWeight: 800, color: r.pct >= 75 ? '#1a5c3a' : '#d4a030' }}>
                {r.pct}% Intact
              </span>
            </div>

            <div style={{ width: '100%', height: '12px', background: '#ece6d8', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.35rem' }}>
              <div style={{
                width: `${r.pct}%`,
                height: '100%',
                background: r.pct >= 75 ? 'linear-gradient(90deg, #2a9d8f, #68b878)' : 'linear-gradient(90deg, #e8a44a, #d4a030)',
                borderRadius: '6px',
                transition: 'width 0.4s ease'
              }} />
            </div>

            <p style={{ fontFamily: FONT.body, fontSize: '0.78rem', color: '#666', margin: 0, lineHeight: 1.35 }}>
              {r.note}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '1.25rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid #e8e2d5',
        fontSize: '0.72rem',
        fontFamily: FONT.mono,
        color: '#8b928f',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Sources: WHO, NHS (UK), KNMG (Netherlands), RACP (Australia), US CDC</span>
        <span>The global norm is non-intervention</span>
      </div>
    </div>
  );
}
