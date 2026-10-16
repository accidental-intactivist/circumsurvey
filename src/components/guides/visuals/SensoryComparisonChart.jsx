import React, { useState } from 'react';
import { Activity, Sparkles, HelpCircle, Layers } from 'lucide-react';
import { FONT } from '../../../styles/tokens';

const METRICS = [
  {
    id: 'mobile-skin',
    label: 'Pleasure from Mobile Skin & Gliding Action',
    sublabel: 'Mechanoreceptors + dual-layered bearing mechanism',
    intactScore: 4.7,
    circumcisedScore: 1.7,
    gap: '-3.0',
    effectSize: 'Cohen’s d = 1.78 (Massive Effect)',
    description: 'The single widest sensory gap in the dataset. Circumcision physically excises the gliding mechanism, converting a low-friction internal roll into friction requiring artificial lubricants.'
  },
  {
    id: 'fine-touch',
    label: 'Fine-Touch Tactile Sensation & Erogenous Range',
    sublabel: 'Light touch thresholds and specialized nerve endings',
    intactScore: 4.5,
    circumcisedScore: 3.1,
    gap: '-1.4',
    effectSize: 'Cohen’s d = 0.94 (Large Effect)',
    description: 'The ridged band of the prepuce contains thousands of Meissner’s tactile corpuscles. Post-cutting, the exposed glans undergoes keratinization (thickening), blunting subtle tactile sensation.'
  },
  {
    id: 'natural-lube',
    label: 'Natural Lubrication Self-Sufficiency',
    sublabel: 'Independence from synthetic lubricants during intimacy',
    intactScore: 4.6,
    circumcisedScore: 2.1,
    gap: '-2.5',
    effectSize: 'Cohen’s d = 1.42 (Very Large Effect)',
    description: 'Over 85% of intact men report never requiring artificial lubrication, relying entirely on the natural mucosal lining, compared to frequent artificial lube reliance among circumcised men.'
  }
];

export default function SensoryComparisonChart() {
  const [activeMetricId, setActiveMetricId] = useState('mobile-skin');
  const activeMetric = METRICS.find(m => m.id === activeMetricId) || METRICS[0];

  return (
    <div style={{
      background: 'linear-gradient(180deg, #ffffff 0%, #fbf9f6 100%)',
      border: '1px solid #e2dccf',
      borderRadius: '16px',
      padding: '1.75rem',
      margin: '2rem 0 2.5rem 0',
      boxShadow: '0 6px 24px rgba(31, 37, 35, 0.06)'
    }}>
      {/* Top Heading */}
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
            <Activity size={14} /> Empirical Survey Finding • Blinded Sensation Data
          </div>
          <h3 style={{
            fontFamily: FONT.display,
            fontSize: '1.35rem',
            color: '#1f2523',
            margin: 0
          }}>
            The Sensory Impact Comparison
          </h3>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.78rem',
          fontFamily: FONT.condensed,
          fontWeight: 700
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2a9d8f' }} />
            <span style={{ color: '#2a9d8f' }}>INTACT (n=146)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e76f51' }} />
            <span style={{ color: '#e76f51' }}>CIRCUMCISED (n=223)</span>
          </div>
        </div>
      </div>

      {/* Comparison Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {METRICS.map((m) => {
          const isSelected = m.id === activeMetricId;
          const maxScore = 5.0;
          const intactWidth = (m.intactScore / maxScore) * 100;
          const circumcisedWidth = (m.circumcisedScore / maxScore) * 100;

          return (
            <div
              key={m.id}
              onClick={() => setActiveMetricId(m.id)}
              style={{
                cursor: 'pointer',
                padding: '0.9rem',
                borderRadius: '10px',
                background: isSelected ? 'rgba(26, 92, 58, 0.05)' : 'transparent',
                border: `1px solid ${isSelected ? '#1a5c3a' : 'transparent'}`,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: '0.98rem', color: '#1f2523' }}>
                  {m.label}
                </span>
                <span style={{ fontFamily: FONT.mono, fontSize: '0.74rem', color: '#d94f4f', fontWeight: 700 }}>
                  Gap: {m.gap} pts
                </span>
              </div>

              {/* Bar 1: Intact */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <span style={{ width: '85px', fontSize: '0.72rem', fontFamily: FONT.condensed, fontWeight: 700, color: '#2a9d8f', textTransform: 'uppercase' }}>
                  Intact ({m.intactScore})
                </span>
                <div style={{ flex: 1, height: '14px', background: '#e8e2d5', borderRadius: '7px', overflow: 'hidden' }}>
                  <div style={{ width: `${intactWidth}%`, height: '100%', background: '#2a9d8f', borderRadius: '7px', transition: 'width 0.4s ease' }} />
                </div>
              </div>

              {/* Bar 2: Circumcised */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: '85px', fontSize: '0.72rem', fontFamily: FONT.condensed, fontWeight: 700, color: '#e76f51', textTransform: 'uppercase' }}>
                  Cut ({m.circumcisedScore})
                </span>
                <div style={{ flex: 1, height: '14px', background: '#e8e2d5', borderRadius: '7px', overflow: 'hidden' }}>
                  <div style={{ width: `${circumcisedWidth}%`, height: '100%', background: '#e76f51', borderRadius: '7px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Metric Deep Dive Box */}
      <div style={{
        marginTop: '1.25rem',
        padding: '1rem 1.15rem',
        background: '#f5f0e6',
        borderRadius: '10px',
        border: '1px solid #e6ded0',
        fontSize: '0.86rem',
        lineHeight: 1.5,
        color: '#444'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
          <strong style={{ color: '#1f2523' }}>{activeMetric.label}</strong>
          <span style={{ fontFamily: FONT.mono, fontSize: '0.75rem', color: '#1a5c3a', fontWeight: 600 }}>
            {activeMetric.effectSize}
          </span>
        </div>
        <p style={{ margin: 0, color: '#555' }}>
          {activeMetric.description}
        </p>
      </div>

      <div style={{
        marginTop: '0.75rem',
        fontSize: '0.72rem',
        fontFamily: FONT.mono,
        color: '#8b928f',
        textAlign: 'right'
      }}>
        Blinded Survey Inquiry Dataset (n=516) • Cohen's d calculated from Likert scale 1–5
      </div>
    </div>
  );
}
