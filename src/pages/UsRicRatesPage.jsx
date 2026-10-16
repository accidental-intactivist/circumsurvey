import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  MapPin, 
  TrendingDown, 
  ArrowLeft, 
  Share2, 
  Globe2, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { C, FONT } from '../styles/tokens';
import LoomChoreography from '../components/GuidedTour/LoomChoreography';
import { captureEvent } from '../lib/telemetry';
import './AdminArchivePage.css';

const REGIONAL_RATES_2022 = [
  {
    region: 'West',
    inpatientRate: '19.7%',
    status: 'Steepest Decline',
    color: '#4ade80',
    description: 'Western states dropped Medicaid reimbursement for non-therapeutic circumcision decades ago. In-hospital cutting has collapsed to under 20%.',
    states: 'California, Washington, Oregon, Arizona, Colorado, Nevada, Utah, Idaho, Montana, Wyoming, New Mexico, Alaska, Hawaii'
  },
  {
    region: 'Northeast',
    inpatientRate: '51.8%',
    status: 'Moderate Decline',
    color: '#5b93c7',
    description: 'Mixed coverage. Recent legislative battles in Maine restored Medicaid coverage, while New York and Massachusetts maintain substantial urban rates.',
    states: 'New York, Pennsylvania, Massachusetts, New Jersey, Connecticut, New Hampshire, Maine, Rhode Island, Vermont'
  },
  {
    region: 'South',
    inpatientRate: '55.4%',
    status: 'High Persistence',
    color: '#d4a030',
    description: 'Sustained by institutional maternity habits. States like South Carolina recently expanded Medicaid coverage up to 30 days post-birth.',
    states: 'Texas, Florida, Georgia, North Carolina, South Carolina, Virginia, Maryland, Tennessee, Alabama, Louisiana, Kentucky, Mississippi'
  },
  {
    region: 'Midwest',
    inpatientRate: '68.5%',
    status: 'Highest Persistence',
    color: '#e86868',
    description: 'The highest in-hospital rates in the nation. Strong cultural and institutional inertia in suburban and rural hospital birthing centers.',
    states: 'Illinois, Ohio, Michigan, Indiana, Wisconsin, Minnesota, Missouri, Iowa, Kansas, Nebraska, North Dakota, South Dakota'
  }
];

export default function UsRicRatesPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [inspectedRegion, setInspectedRegion] = useState(null);

  useEffect(() => {
    captureEvent('rates_dossier_viewed');
  }, []);

  const handleShare = () => {
    captureEvent('rates_dossier_shared');
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleInspectRegion = (regionName, rate) => {
    const isTogglingOff = inspectedRegion === regionName;
    setInspectedRegion(isTogglingOff ? null : regionName);
    if (!isTogglingOff) {
      captureEvent('rate_region_inspected', { region: regionName, inpatientRate: rate });
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #09090d 0%, #111118 50%, #09090d 100%)',
      color: 'var(--c-text, #eee)',
      fontFamily: FONT.body,
      paddingBottom: '5rem',
      position: 'relative'
    }}>
      {/* Background Holographic Canvas */}
      <div className="no-print" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.28 }}>
        <LoomChoreography isInline={true} forceFormation="harmonic" opacity={1} themeColor="gold" />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Top Header / Breadcrumb ── */}
        <header style={{
          borderBottom: '1px solid rgba(212, 160, 48, 0.2)',
          background: 'rgba(10, 10, 14, 0.95)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0.85rem 1.5rem'
        }}>
          <div style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link 
                to="/guides" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--c-dim, #888)',
                  textDecoration: 'none',
                  fontSize: '0.88rem'
                }}
              >
                <ArrowLeft size={16} /> Guides Canon
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
              <span style={{ fontSize: '0.88rem', color: '#d4a030', fontWeight: 600 }}>
                US RIC Rates Dossier
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/atlas?geo=USA"
                onClick={() => captureEvent('rates_atlas_navigated', { source: 'header_button' })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <Globe2 size={14} /> Open Live Atlas
              </Link>
              <button
                onClick={handleShare}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(212, 160, 48, 0.15)',
                  border: '1px solid rgba(212, 160, 48, 0.35)',
                  color: '#d4a030',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <Share2 size={14} /> {copiedLink ? 'Link Copied!' : 'Share Dossier'}
              </button>
            </div>
          </div>
        </header>

        {/* ── Hero Section ── */}
        <section style={{ maxWidth: '1100px', margin: '2.5rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.25)',
            borderRadius: '999px',
            color: '#4ade80',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '1rem'
          }}>
            <TrendingDown size={14} /> In-Hospital Birth Rate Sub-50%
          </div>

          <h1 style={{
            fontFamily: FONT.serif,
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            color: '#fff',
            marginBottom: '1rem',
            lineHeight: 1.15
          }}>
            The U.S. Circumcision Rate Reality
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--c-dim, #aaa)',
            maxWidth: '820px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}>
            National birth hospitalization rates have dropped below 50% for the first time in modern history (49.3%, <em>JAMA Pediatrics</em> 2025). But the true story lies in the profound regional split and the migration to outpatient billing.
          </p>

          {/* Key Stat Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            maxWidth: '1000px',
            margin: '0 auto 3rem'
          }}>
            <div style={{
              background: 'rgba(18, 18, 24, 0.85)',
              border: '1px solid rgba(212, 160, 48, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#d4a030', fontWeight: 700, textTransform: 'uppercase' }}>National Inpatient Floor</div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0' }}>49.3%</div>
              <div style={{ fontSize: '0.82rem', color: '#888' }}>Kids' Inpatient Database (2022 data, pub. 2025)</div>
            </div>

            <div style={{
              background: 'rgba(18, 18, 24, 0.85)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase' }}>Western States</div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#4ade80', margin: '0.2rem 0' }}>19.7%</div>
              <div style={{ fontSize: '0.82rem', color: '#888' }}>Over 80% of newborn boys left intact</div>
            </div>

            <div style={{
              background: 'rgba(18, 18, 24, 0.85)',
              border: '1px solid rgba(232, 104, 104, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#e86868', fontWeight: 700, textTransform: 'uppercase' }}>Midwestern States</div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#e86868', margin: '0.2rem 0' }}>68.5%</div>
              <div style={{ fontSize: '0.82rem', color: '#888' }}>Persistent cultural inertia & Medicaid funding</div>
            </div>

            <div style={{
              background: 'rgba(18, 18, 24, 0.85)',
              border: '1px solid rgba(91, 147, 199, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#5b93c7', fontWeight: 700, textTransform: 'uppercase' }}>Historical Peak</div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#aaa', margin: '0.2rem 0' }}>~85–90%</div>
              <div style={{ fontSize: '0.82rem', color: '#888' }}>U.S. hospital peak (1960–1975)</div>
            </div>
          </div>
        </section>

        {/* ── Regional Breakdown Section ── */}
        <section style={{ maxWidth: '1000px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
          <h2 style={{ fontFamily: FONT.serif, fontSize: '1.75rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MapPin size={22} style={{ color: '#d4a030' }} /> Regional Census Breakdown (JAMA Pediatrics 2025)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {REGIONAL_RATES_2022.map((r) => {
              const isSelected = inspectedRegion === r.region;
              return (
                <div 
                  key={r.region}
                  onClick={() => handleInspectRegion(r.region, r.inpatientRate)}
                  style={{
                    background: isSelected ? 'rgba(25, 25, 36, 0.98)' : 'rgba(16, 16, 22, 0.95)',
                    border: isSelected ? `1px solid ${r.color}` : `1px solid rgba(255,255,255,0.08)`,
                    borderLeft: `5px solid ${r.color}`,
                    borderRadius: '10px',
                    padding: '1.5rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.25rem',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: isSelected ? `0 6px 24px rgba(0,0,0,0.5), 0 0 16px ${r.color}22` : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>{r.region}</h3>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: r.color,
                        background: 'rgba(255,255,255,0.05)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {r.status}
                      </span>
                    </div>
                  <div style={{ color: '#ccc', fontSize: '0.92rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    {r.description}
                  </div>
                  <div style={{ color: '#777', fontSize: '0.78rem', marginTop: '0.4rem' }}>
                    Includes: {r.states}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>In-Hospital Birth Rate</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: r.color, lineHeight: 1.1 }}>
                    {r.inpatientRate}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>Yang, Tobian et al. (2025)</div>
                </div>
              </div>
            );
          })}
          </div>
        </section>

        {/* ── The Outpatient Shell Game (Critical Analysis) ── */}
        <section style={{ maxWidth: '1000px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
          <div style={{
            background: 'rgba(20, 20, 28, 0.95)',
            border: '1px solid rgba(212, 160, 48, 0.35)',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#d4a030', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              <AlertTriangle size={20} /> The Outpatient Shell Game: What 49.3% Leaves Out
            </div>

            <h2 style={{ fontFamily: FONT.serif, fontSize: '1.8rem', color: '#fff', margin: '0 0 1rem' }}>
              Why 49.3% Is a Floor, Not the Ceiling
            </h2>

            <p style={{ color: '#ccc', fontSize: '1.02rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              The 49.3% figure published in <em>JAMA Pediatrics</em> tracks exclusively <strong>inpatient birth hospitalizations</strong> recorded in the Kids’ Inpatient Database (KID). While this reflects a historic, massive collapse in standard delivery-room circumcision, it conceals an institutional adaptation:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#5b93c7', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <Building2 size={18} /> Outpatient Pediatric Shift
                </div>
                <div style={{ color: '#bbb', fontSize: '0.9rem', lineHeight: 1.55 }}>
                  Because hospital maternity fees are heavily scrutinized, many pediatricians now perform circumcisions in their private offices at 2 to 4 weeks of life. These procedures escape birth hospital databases entirely.
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d4a030', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <DollarSign size={18} /> Medicaid Policy Maneuvers
                </div>
                <div style={{ color: '#bbb', fontSize: '0.9rem', lineHeight: 1.55 }}>
                  States like South Carolina, North Carolina, and Maine have witnessed administrative moves to expand coverage up to 30 days postpartum or use special Z-codes, creating financial incentives for outpatient surgeons.
                </div>
              </div>
            </div>

            <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              <strong>The Takeaway:</strong> We are winning the cultural debate in maternity wards, but vigilance is required in post-discharge pediatric appointments, where parents face renewed pressure before the first month of life concludes.
            </p>
          </div>
        </section>

        {/* ── Call to Action ── */}
        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <div style={{
            background: 'rgba(15, 15, 20, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2.5rem 2rem'
          }}>
            <h3 style={{ fontFamily: FONT.serif, fontSize: '1.6rem', color: '#fff', marginBottom: '0.75rem' }}>
              Explore the Data Interactively
            </h3>
            <p style={{ color: '#aaa', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Compare rates across all 50 states, examine adult prevalence vs. newborn rates, and track global statistics in our interactive atlas.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/atlas?geo=USA"
                onClick={() => captureEvent('rates_atlas_navigated', { source: 'bottom_cta' })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#d4a030',
                  color: '#000',
                  fontWeight: 700,
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.95rem'
                }}
              >
                <Globe2 size={18} /> Launch Global & US Atlas
              </Link>
              <Link
                to="/to/expectant-parents"
                onClick={() => captureEvent('rates_guide_navigated', { target: 'expectant-parents' })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#eee',
                  fontWeight: 600,
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}
              >
                Expectant Parents Guide →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
