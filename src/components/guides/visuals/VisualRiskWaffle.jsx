import React, { useState } from 'react';
import { AlertCircle, HelpCircle, CheckCircle2, Info } from 'lucide-react';
import { FONT } from '../../../styles/tokens';

const CONDITIONS = {
  uti: {
    label: 'Infant Urinary Tract Infection (UTI)',
    headlineRelative: '90% Relative Risk Reduction',
    absoluteText: '1 in ~100 to 1 in 1,000 boys',
    affectedPerThousand: 10,
    nnt: 111,
    treatment: 'Easily treated with standard oral antibiotics without surgery.',
    consensus: 'European, UK, and Canadian pediatric associations reject circumcision for UTI prevention due to low absolute incidence.',
    source: 'AAP 2012 Technical Report / Frisch et al. (Pediatrics 2013)'
  },
  cancer: {
    label: 'Penile Cancer Lifetime Risk',
    headlineRelative: '60% Relative Risk Reduction',
    absoluteText: '1 in ~100,000 men per year',
    affectedPerThousand: 1, // Actually 0.1 per 1000 lifetime
    nnt: 90000,
    treatment: 'Extremely rare disease primarily linked to HPV and smoking, preventable via standard HPV vaccination.',
    consensus: 'Over 90,000 infant boys would need to be cut to prevent a single case occurring in an elderly man in his 70s.',
    source: 'American Cancer Society / Danish Medical Association (2016)'
  },
  hiv: {
    label: 'Heterosexual HIV Transmission',
    headlineRelative: '60% Relative Risk in Sub-Saharan Africa RCTs',
    absoluteText: '1.3% Absolute Reduction in high-endemic zones',
    affectedPerThousand: 13,
    nnt: 77,
    treatment: 'Condoms offer >98% protection against transmission for both partners. Circumcision offers 0% protection for female partners.',
    consensus: 'No RCT has ever shown protective benefit in low-prevalence developed nations where primary transmission is via other routes.',
    source: 'Cochrane Systematic Review / Royal Dutch Medical Assoc. (KNMG)'
  }
};

export default function VisualRiskWaffle() {
  const [selectedKey, setSelectedKey] = useState('uti');
  const cond = CONDITIONS[selectedKey];

  // 1,000 cells (20 columns x 50 rows, or 100 cells for dense layout)
  // Let's use 100 cells for clean responsive layout, where each cell = 10 boys (1,000 total)
  // or 100 cells = 1% each.
  const totalCells = 100;
  const affectedCells = selectedKey === 'uti' ? 1 : selectedKey === 'cancer' ? 1 : 1;

  return (
    <div style={{
      background: 'linear-gradient(180deg, #ffffff 0%, #faf8f5 100%)',
      border: '1px solid #e2dccf',
      borderRadius: '16px',
      padding: '1.75rem',
      margin: '2rem 0 2.5rem 0',
      boxShadow: '0 6px 24px rgba(31, 37, 35, 0.06)'
    }}>
      {/* Header & Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
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
            <Info size={14} /> Risk Reality Visualizer
          </div>
          <h3 style={{
            fontFamily: FONT.display,
            fontSize: '1.35rem',
            color: '#1f2523',
            margin: 0
          }}>
            Relative Risk vs. Physical Reality
          </h3>
        </div>

        {/* Condition Picker Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {Object.entries(CONDITIONS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setSelectedKey(key)}
              style={{
                background: selectedKey === key ? '#1a5c3a' : 'transparent',
                color: selectedKey === key ? '#ffffff' : '#4a524f',
                border: `1px solid ${selectedKey === key ? '#1a5c3a' : '#d8d0c0'}`,
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontFamily: FONT.condensed,
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {key === 'uti' ? 'UTI Prevention' : key === 'cancer' ? 'Penile Cancer' : 'HIV Transmission'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Comparison Layout: Left is The Waffle Graphic, Right is The Sourced Context */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        alignItems: 'center'
      }}>
        {/* Left: The 100-cell Waffle Grid */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.6rem',
            fontSize: '0.8rem',
            fontFamily: FONT.condensed,
            fontWeight: 700,
            color: '#4a524f'
          }}>
            <span>POPULATION OF 1,000 INFANT BOYS</span>
            <span style={{ color: '#d94f4f' }}>■ 1 Affected</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(20, 1fr)',
            gap: '3px',
            background: '#f2ede3',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid #e0d8ca'
          }}>
            {Array.from({ length: 100 }).map((_, idx) => {
              const isAffected = idx === 0;
              return (
                <div
                  key={idx}
                  title={isAffected ? 'The 1 case prevented' : 'Unaffected boy'}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '2px',
                    background: isAffected ? '#d94f4f' : '#68b878',
                    opacity: isAffected ? 1 : 0.45,
                    transition: 'transform 0.15s ease'
                  }}
                />
              );
            })}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#777',
            marginTop: '0.5rem',
            fontFamily: FONT.body
          }}>
            <span>Green = 999 boys with no surgical benefit</span>
            <span style={{ fontWeight: 700, color: '#222' }}>100% of boys subjected to surgery</span>
          </div>
        </div>

        {/* Right: The Statistical Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Relative Headline vs Absolute Reality */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            background: '#f5f0e6',
            padding: '0.9rem',
            borderRadius: '10px',
            border: '1px solid #e6ded0'
          }}>
            <div>
              <span style={{
                display: 'block',
                fontSize: '0.7rem',
                fontFamily: FONT.condensed,
                fontWeight: 800,
                color: '#8b928f',
                textTransform: 'uppercase'
              }}>
                The Headline Statistic
              </span>
              <span style={{
                fontFamily: FONT.display,
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#d4a030'
              }}>
                {cond.headlineRelative}
              </span>
            </div>

            <div>
              <span style={{
                display: 'block',
                fontSize: '0.7rem',
                fontFamily: FONT.condensed,
                fontWeight: 800,
                color: '#8b928f',
                textTransform: 'uppercase'
              }}>
                Absolute Physical Incidence
              </span>
              <span style={{
                fontFamily: FONT.display,
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#1a5c3a'
              }}>
                {cond.absoluteText}
              </span>
            </div>
          </div>

          <p style={{
            fontFamily: FONT.body,
            fontSize: '0.88rem',
            color: '#333',
            lineHeight: 1.5,
            margin: 0
          }}>
            <strong>Why it matters:</strong> {cond.treatment}
          </p>

          <p style={{
            fontFamily: FONT.body,
            fontSize: '0.84rem',
            color: '#555',
            lineHeight: 1.45,
            margin: 0
          }}>
            <strong>International consensus:</strong> {cond.consensus}
          </p>

          <div style={{
            fontSize: '0.72rem',
            fontFamily: FONT.mono,
            color: '#888',
            borderTop: '1px solid #e8e2d5',
            paddingTop: '0.5rem'
          }}>
            Source: {cond.source}
          </div>
        </div>
      </div>
    </div>
  );
}
