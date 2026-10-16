import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { toPng } from 'html-to-image';
import { 
  Sparkles, 
  Download, 
  Share2, 
  Layers, 
  Database, 
  ShieldCheck, 
  Clock, 
  Eye, 
  Activity, 
  ExternalLink, 
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  Maximize2
} from 'lucide-react';
import { FONT, C } from '../../styles/tokens';
import AutoEntityLinker from '../AutoEntityLinker';
import { 
  SENSATION_POINTS, 
  SHIFTING_SANDS_TIMELINE, 
  GLOBAL_MEDICAL_CONSENSUS, 
  SURVEY_TELEMETRY_METRICS 
} from '../../data/manifesto_tables';

/**
 * 1. SENSATION RADAR & FINE-TOUCH ANATOMY INFOGRAPHIC
 */
export function SensationRadarInfographic({ onExport }) {
  const [selectedPointIndex, setSelectedPointIndex] = useState(0);
  const [viewState, setViewState] = useState('all'); // 'all' | 'intact' | 'circumcised'
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef(null);

  const activePoint = SENSATION_POINTS[selectedPointIndex];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 2.5 });
      const link = document.createElement('a');
      link.download = `circumsurvey-sensation-radar-${activePoint.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredPoints = SENSATION_POINTS.filter(p => {
    if (viewState === 'intact') return p.state === 'intact' || p.state === 'both';
    if (viewState === 'circumcised') return p.state === 'circumcised' || p.state === 'both';
    return true;
  });

  return (
    <div 
      ref={cardRef}
      className="manifesto-infographic-card"
      style={{
        borderRadius: '16px',
        background: 'linear-gradient(145deg, rgba(18, 18, 26, 0.96) 0%, rgba(10, 10, 15, 0.98) 100%)',
        border: '1px solid rgba(212, 160, 48, 0.35)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 24px rgba(212, 160, 48, 0.08)',
        padding: '2rem',
        margin: '2.5rem 0',
        fontFamily: FONT.body,
        color: '#fff'
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              background: 'rgba(212, 160, 48, 0.18)',
              border: '1px solid rgba(212, 160, 48, 0.4)',
              color: '#facc15',
              fontSize: '0.7rem',
              fontFamily: FONT.mono,
              fontWeight: 800,
              letterSpacing: '0.08em'
            }}>
              FIGURE II.ii // EMPIRICAL TELEMETRY
            </span>
            <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: FONT.mono }}>
              Sorrells et al. (2007) + CircumSurvey (1,200+ Men)
            </span>
          </div>
          <h3 style={{ fontFamily: FONT.display, fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', color: '#ffffff', margin: 0 }}>
            Fine-Touch Tactile Sensation & Nerve Anatomy Profile
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Anatomy State Filter */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '3px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => setViewState('all')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                background: viewState === 'all' ? '#d4a030' : 'transparent',
                color: viewState === 'all' ? '#000' : '#aaa',
                fontWeight: 700,
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              All Zones
            </button>
            <button
              onClick={() => setViewState('intact')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                background: viewState === 'intact' ? '#10b981' : 'transparent',
                color: viewState === 'intact' ? '#000' : '#aaa',
                fontWeight: 700,
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              Intact
            </button>
            <button
              onClick={() => setViewState('circumcised')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                background: viewState === 'circumcised' ? '#ef4444' : 'transparent',
                color: viewState === 'circumcised' ? '#fff' : '#aaa',
                fontWeight: 700,
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              Circumcised
            </button>
          </div>

          {/* Social Export Button */}
          <button
            onClick={handleDownload}
            disabled={isExporting}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#facc15',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Export high-resolution infographic card for social media"
          >
            <Download size={13} />
            <span>{isExporting ? 'Generating...' : 'Export PNG'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.75rem', alignItems: 'stretch' }}>
        
        {/* Left Column: Interactive Anatomy Points List */}
        <div>
          <div style={{ fontSize: '0.75rem', fontFamily: FONT.mono, color: '#aaa', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>
            Select Anatomical Zone to Inspect:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredPoints.map((pt, idx) => {
              const origIdx = SENSATION_POINTS.findIndex(p => p.name === pt.name);
              const isSelected = origIdx === selectedPointIndex;
              return (
                <div
                  key={pt.name}
                  onClick={() => setSelectedPointIndex(origIdx)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(212, 160, 48, 0.16)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1px solid rgba(212, 160, 48, 0.5)' : '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: pt.excisedInRic ? '#ef4444' : pt.state === 'circumcised' ? '#f97316' : '#10b981',
                      boxShadow: isSelected ? `0 0 10px ${pt.excisedInRic ? '#ef4444' : '#10b981'}` : 'none'
                    }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#fff' : '#ddd' }}>
                        {pt.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#888' }}>
                        {pt.excisedInRic ? 'Ablated in Neonatal RIC' : pt.state === 'circumcised' ? 'Altered / Keratinized' : 'Preserved in Intact Male'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', fontFamily: FONT.mono, fontWeight: 800, color: pt.threshold < 1 ? '#10b981' : '#facc15' }}>
                      {pt.threshold}g
                    </span>
                    <span style={{ fontSize: '0.65rem', display: 'block', color: '#777', textTransform: 'uppercase' }}>
                      Threshold
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Zone Deep-Dive Card */}
        <div style={{
          padding: '1.5rem',
          borderRadius: '12px',
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(212, 160, 48, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontFamily: FONT.mono,
                fontWeight: 800,
                background: activePoint.excisedInRic ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: activePoint.excisedInRic ? '#f87171' : '#34d399',
                border: `1px solid ${activePoint.excisedInRic ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
              }}>
                {activePoint.excisedInRic ? 'SURGICALLY AMPUTATED IN RIC' : 'RESIDUAL TISSUE'}
              </span>

              <span style={{ fontSize: '0.72rem', color: '#aaa', fontFamily: FONT.mono }}>
                Erogenous Rating: <strong style={{ color: '#facc15' }}>{activePoint.score} / 10</strong>
              </span>
            </div>

            <h4 style={{ fontFamily: FONT.display, fontSize: '1.4rem', color: '#ffffff', margin: '0 0 0.5rem 0' }}>
              {activePoint.name}
            </h4>

            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(240, 240, 245, 0.85)', margin: '0 0 1.25rem 0' }}>
              {activePoint.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: '#aaa' }}>Innervation Profile:</span>
                <span style={{ color: '#fff', fontWeight: 600, textAlign: 'right' }}>{activePoint.receptors}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: '#aaa' }}>Semmes-Weinstein Fine Touch:</span>
                <span style={{ color: '#facc15', fontFamily: FONT.mono, fontWeight: 700 }}>
                  {activePoint.threshold} grams pressure (lower = higher sensitivity)
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link
              to="/explore"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                color: '#facc15',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              <span>Explore Telemetry Matrix in Explorer</span>
              <ExternalLink size={12} />
            </Link>
            <span style={{ fontSize: '0.68rem', color: '#666', fontFamily: FONT.mono }}>
              36% Fine-Touch Deficit
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * 2. SHIFTING SANDS HISTORICAL TIME-SERIES INFOGRAPHIC
 */
export function ShiftingSandsTimelineInfographic() {
  const [activeEpochIndex, setActiveEpochIndex] = useState(0);
  const activeEpoch = SHIFTING_SANDS_TIMELINE[activeEpochIndex];

  return (
    <div 
      className="manifesto-infographic-card"
      style={{
        borderRadius: '16px',
        background: 'linear-gradient(145deg, rgba(20, 18, 28, 0.96) 0%, rgba(12, 10, 18, 0.98) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.35)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 24px rgba(168, 85, 247, 0.08)',
        padding: '2rem',
        margin: '2.5rem 0',
        fontFamily: FONT.body,
        color: '#fff'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              background: 'rgba(168, 85, 247, 0.18)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              color: '#c084fc',
              fontSize: '0.7rem',
              fontFamily: FONT.mono,
              fontWeight: 800,
              letterSpacing: '0.08em'
            }}>
              FIGURE IV.i // UMass MS 1205 HISTORICAL DOSSIER
            </span>
            <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: FONT.mono }}>
              The 150-Year Shifting Sands Timeline (1870 – 2026)
            </span>
          </div>
          <h3 style={{ fontFamily: FONT.display, fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', color: '#ffffff', margin: 0 }}>
            "Disease of the Decade": How Justifications Mutate While the Cutting Continues
          </h3>
        </div>

        <Link
          to="/collections/tim-hammond-archive"
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            color: '#c084fc',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          <Database size={13} />
          <span>Visit Tim Hammond Papers</span>
        </Link>
      </div>

      {/* Horizontal Epoch Pills Scroller */}
      <div style={{
        display: 'flex',
        gap: '0.65rem',
        overflowX: 'auto',
        paddingBottom: '1rem',
        marginBottom: '1.5rem',
        WebkitOverflowScrolling: 'touch'
      }}>
        {SHIFTING_SANDS_TIMELINE.map((epoch, idx) => {
          const isActive = idx === activeEpochIndex;
          return (
            <button
              key={epoch.era}
              onClick={() => setActiveEpochIndex(idx)}
              style={{
                flexShrink: 0,
                padding: '0.6rem 0.95rem',
                borderRadius: '10px',
                background: isActive ? `${epoch.color}25` : 'rgba(255, 255, 255, 0.03)',
                border: isActive ? `1px solid ${epoch.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                color: isActive ? '#fff' : '#aaa',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '0.68rem', fontFamily: FONT.mono, color: epoch.color, fontWeight: 800 }}>
                {epoch.era}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {epoch.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Historical Dossier View */}
      <div style={{
        padding: '1.75rem',
        borderRadius: '12px',
        background: 'rgba(0, 0, 0, 0.45)',
        border: `1px solid ${activeEpoch.color}50`,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: '0.7rem',
              fontFamily: FONT.mono,
              fontWeight: 800,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              background: `${activeEpoch.color}20`,
              color: activeEpoch.color,
              border: `1px solid ${activeEpoch.color}50`
            }}>
              {activeEpoch.status}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#888', fontFamily: FONT.mono }}>
              ERA: {activeEpoch.era}
            </span>
          </div>

          <h4 style={{ fontFamily: FONT.display, fontSize: '1.45rem', color: '#fff', margin: '0.2rem 0 0.5rem 0' }}>
            {activeEpoch.label}
          </h4>

          <div style={{ fontSize: '0.82rem', color: '#bbb', marginBottom: '0.75rem' }}>
            Prominent Champion / Architect: <strong style={{ color: '#fff' }}>{activeEpoch.champion}</strong>
          </div>

          <blockquote style={{
            fontSize: '0.95rem',
            fontStyle: 'italic',
            color: 'rgba(255, 255, 255, 0.9)',
            borderLeft: `3px solid ${activeEpoch.color}`,
            paddingLeft: '0.85rem',
            margin: '1rem 0'
          }}>
            {activeEpoch.quote}
          </blockquote>
        </div>

        <div style={{
          padding: '1.25rem',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ fontSize: '0.72rem', fontFamily: FONT.mono, color: '#facc15', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.08em' }}>
            ARCHIVAL PRIMARY SOURCE PROVENANCE:
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            {activeEpoch.archiveDossier}
          </div>
          <p style={{ fontSize: '0.78rem', color: '#aaa', lineHeight: 1.5, margin: 0 }}>
            Every rationale championed during this era was subsequently rejected or overturned by international medical science—yet the procedural inertia remained intact in American maternity wards.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. GLOBAL MEDICAL CONSENSUS INFOGRAPHIC
 */
export function GlobalMedicalConsensusInfographic() {
  const [activeCountry, setActiveCountry] = useState(0);
  const current = GLOBAL_MEDICAL_CONSENSUS[activeCountry];

  return (
    <div 
      className="manifesto-infographic-card"
      style={{
        borderRadius: '16px',
        background: 'linear-gradient(145deg, rgba(16, 22, 28, 0.96) 0%, rgba(8, 12, 16, 0.98) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 24px rgba(16, 185, 129, 0.08)',
        padding: '2rem',
        margin: '2.5rem 0',
        fontFamily: FONT.body,
        color: '#fff'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              background: 'rgba(16, 185, 129, 0.18)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '0.7rem',
              fontFamily: FONT.mono,
              fontWeight: 800,
              letterSpacing: '0.08em'
            }}>
              FIGURE III.v // INTERNATIONAL BIOETHICS AUDIT
            </span>
            <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: FONT.mono }}>
              Peer-Reviewed Declarations Across 7 Western Health Systems
            </span>
          </div>
          <h3 style={{ fontFamily: FONT.display, fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', color: '#ffffff', margin: 0 }}>
            The Global Medical Consensus vs. The American Anomaly
          </h3>
        </div>

        <Link
          to="/atlas"
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          <span>Open World Atlas</span>
          <ChevronRight size={13} />
        </Link>
      </div>

      {/* Country Selection Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {GLOBAL_MEDICAL_CONSENSUS.map((item, idx) => {
          const isActive = idx === activeCountry;
          const isUS = item.country === 'United States';
          return (
            <button
              key={item.country}
              onClick={() => setActiveCountry(idx)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                background: isActive ? (isUS ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)') : 'rgba(255, 255, 255, 0.03)',
                border: isActive ? `1px solid ${isUS ? '#ef4444' : '#10b981'}` : '1px solid rgba(255, 255, 255, 0.08)',
                color: isActive ? '#fff' : '#aaa',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isUS ? '#ef4444' : '#10b981'
              }} />
              <span>{item.country}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Policy Card */}
      <div style={{
        padding: '1.75rem',
        borderRadius: '12px',
        background: 'rgba(0, 0, 0, 0.5)',
        border: `1px solid ${current.color}40`,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{
              fontSize: '0.7rem',
              fontFamily: FONT.mono,
              fontWeight: 800,
              color: current.color,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              background: `${current.color}20`,
              border: `1px solid ${current.color}50`
            }}>
              {current.stance}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: FONT.mono }}>
              ADOPTED {current.year}
            </span>
          </div>

          <h4 style={{ fontFamily: FONT.display, fontSize: '1.35rem', color: '#fff', margin: '0.2rem 0 0.4rem 0' }}>
            {current.organization}
          </h4>

          <div style={{ fontSize: '0.85rem', color: '#ccc', fontWeight: 600, marginBottom: '0.75rem' }}>
            Policy Formulation: <span style={{ color: current.color }}>{current.policy}</span>
          </div>

          <p style={{ fontSize: '0.92rem', color: 'rgba(240, 240, 245, 0.9)', lineHeight: 1.6, margin: 0 }}>
            {current.verdict}
          </p>
        </div>

        <div style={{
          padding: '1.25rem',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontFamily: FONT.mono, color: '#aaa', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              International Standard:
            </div>
            <div style={{ fontSize: '0.88rem', color: '#ddd', lineHeight: 1.5 }}>
              {current.country === 'United States' 
                ? 'The US stands alone among high-income democracies in continuing routine infant circumcision outside of religious mandates.'
                : 'Across Europe and Australasia, pediatric associations explicitly advise against routine circumcision, citing medical ethics and bodily autonomy.'}
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: FONT.mono }}>
              Sourced from Evidence Brief: Frisch et al. (2013) & KNMG (2010)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 4. COMPLICATIONS & SURVEY TELEMETRY INFOGRAPHIC (Recharts)
 */
export function ComplicationsTelemetryInfographic() {
  const [selectedMetric, setSelectedMetric] = useState(SURVEY_TELEMETRY_METRICS[0]);

  return (
    <div 
      className="manifesto-infographic-card"
      style={{
        borderRadius: '16px',
        background: 'linear-gradient(145deg, rgba(22, 16, 16, 0.96) 0%, rgba(14, 10, 10, 0.98) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 24px rgba(239, 68, 68, 0.08)',
        padding: '2rem',
        margin: '2.5rem 0',
        fontFamily: FONT.body,
        color: '#fff'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              background: 'rgba(239, 68, 68, 0.18)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              fontSize: '0.7rem',
              fontFamily: FONT.mono,
              fontWeight: 800,
              letterSpacing: '0.08em'
            }}>
              FIGURE VII.i // EMPIRICAL TELEMETRY
            </span>
            <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: FONT.mono }}>
              CircumSurvey Empirical Base (1,200+ Circumcised Respondents)
            </span>
          </div>
          <h3 style={{ fontFamily: FONT.display, fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', color: '#ffffff', margin: 0 }}>
            Reported Physical Alterations & Complications Breakdown
          </h3>
        </div>

        <Link
          to="/explore"
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          <Activity size={13} />
          <span>Inspect In Explorer</span>
        </Link>
      </div>

      {/* Main Bar Chart + Metric Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center' }}>
        
        {/* Recharts Bar Display */}
        <div style={{ height: '280px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={SURVEY_TELEMETRY_METRICS}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 100]} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} unit="%" />
              <YAxis 
                type="category" 
                dataKey="label" 
                stroke="#666" 
                tick={{ fill: '#ccc', fontSize: 11 }} 
                width={120}
              />
              <RechartsTooltip
                contentStyle={{
                  background: '#121218',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.8rem'
                }}
                formatter={(val) => [`${val}% of respondents`, 'Prevalence']}
              />
              <Bar 
                dataKey="percentage" 
                radius={[0, 6, 6, 0]}
                onClick={(entry) => setSelectedMetric(entry)}
                cursor="pointer"
              >
                {SURVEY_TELEMETRY_METRICS.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.id === selectedMetric.id ? '#facc15' : entry.color} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Metric Deep Dive */}
        <div style={{
          padding: '1.5rem',
          borderRadius: '12px',
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontFamily: FONT.mono, color: '#f87171', fontWeight: 800 }}>
                SURVEY FINDING
              </span>
              <span style={{ fontSize: '1.5rem', fontFamily: FONT.mono, fontWeight: 900, color: '#facc15' }}>
                {selectedMetric.percentage}%
              </span>
            </div>

            <h4 style={{ fontFamily: FONT.display, fontSize: '1.3rem', color: '#fff', margin: '0 0 0.5rem 0' }}>
              {selectedMetric.label}
            </h4>

            <p style={{ fontSize: '0.92rem', color: 'rgba(240, 240, 245, 0.85)', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
              {selectedMetric.details}
            </p>
          </div>

          <div style={{
            padding: '0.75rem',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.75rem',
            color: '#888'
          }}>
            Click any bar in the chart to inspect its empirical telemetry and anatomical causation.
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * 5. MASTER INFOGRAPHIC GALLERY & VISUAL EVIDENCE LAB
 */
export default function ManifestoInfographicsLab() {
  const [activeTab, setActiveTab] = useState('sensation'); // 'sensation' | 'shifting_sands' | 'consensus' | 'complications'

  return (
    <div style={{ fontFamily: FONT.body, color: C.text }}>
      {/* Tab Switcher */}
      <div style={{
        marginBottom: '2rem',
        padding: '1rem',
        borderRadius: '12px',
        background: 'rgba(20, 20, 28, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color="#facc15" />
          <h4 style={{ fontFamily: FONT.display, fontSize: '1.1rem', margin: 0, color: '#fff' }}>
            Interactive Visual Evidence Lab (4 Infographic Modules)
          </h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('sensation')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontFamily: FONT.mono,
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'sensation' ? '1px solid #facc15' : '1px solid rgba(255, 255, 255, 0.1)',
              background: activeTab === 'sensation' ? 'rgba(212, 160, 48, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: activeTab === 'sensation' ? '#facc15' : '#aaa'
            }}
          >
            Sensation Radar
          </button>
          <button
            onClick={() => setActiveTab('shifting_sands')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontFamily: FONT.mono,
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'shifting_sands' ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
              background: activeTab === 'shifting_sands' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: activeTab === 'shifting_sands' ? '#c084fc' : '#aaa'
            }}
          >
            Historical Timeline
          </button>
          <button
            onClick={() => setActiveTab('consensus')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontFamily: FONT.mono,
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'consensus' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
              background: activeTab === 'consensus' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: activeTab === 'consensus' ? '#34d399' : '#aaa'
            }}
          >
            Global Consensus
          </button>
          <button
            onClick={() => setActiveTab('complications')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontFamily: FONT.mono,
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'complications' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
              background: activeTab === 'complications' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: activeTab === 'complications' ? '#f87171' : '#aaa'
            }}
          >
            Survey Telemetry
          </button>
        </div>
      </div>

      {/* Render Selected Infographic */}
      {activeTab === 'sensation' && <SensationRadarInfographic />}
      {activeTab === 'shifting_sands' && <ShiftingSandsTimelineInfographic />}
      {activeTab === 'consensus' && <GlobalMedicalConsensusInfographic />}
      {activeTab === 'complications' && <ComplicationsTelemetryInfographic />}
    </div>
  );
}
