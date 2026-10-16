import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Scale, AlertOctagon, DollarSign, Award, ChevronRight } from 'lucide-react';
import { FONT } from '../../../styles/tokens';

const COMPARISON_ROWS = [
  {
    id: 'statute',
    dimension: 'Governing Oregon Statute',
    femaleProtected: 'ORS 163.207 & ORS 431A.600',
    femaleStatus: 'Universal Protection',
    maleStatus: 'Completely Excluded',
    maleStatute: 'Zero statutory bodily protection; explicit exemptions',
    legalAnalysis: 'Oregon explicitly criminalizes non-therapeutic genital cutting on female minors while maintaining silence and administrative tolerance for analogous cutting on males and intersex infants.'
  },
  {
    id: 'consent',
    dimension: 'Consent & Age of Majority',
    femaleProtected: 'Strictly prohibited prior to age 18',
    femaleStatus: 'Individual Consent Only',
    maleStatus: 'Parental Proxy Consent',
    maleStatute: 'Performed on non-consenting infants (0–14 days old)',
    legalAnalysis: 'For girls, parental consent is statutorily void and cannot authorize cutting. For boys, parents are granted absolute legal power to excise healthy, functioning genital tissue without the child’s consent.'
  },
  {
    id: 'criminal',
    dimension: 'Criminal Classification & Penalty',
    femaleProtected: 'Class B Felony (up to 10 years imprisonment)',
    femaleStatus: 'Felony Criminal Sanction',
    maleStatus: 'Zero Criminal Liability',
    maleStatute: 'Legally authorized & shielded from criminal battery',
    legalAnalysis: 'A practitioner performing identical anatomical tissue excision faces a decade in state prison if the child is female, but receives legal immunity if the child is male.'
  },
  {
    id: 'cultural',
    dimension: 'Cultural & Religious Exemption',
    femaleProtected: 'Explicitly Barred: "No defense that custom or ritual requires it"',
    femaleStatus: 'Customs Rejected as Defense',
    maleStatus: 'Custom Deferral',
    maleStatute: 'Tradition & parental preference legally supersede bodily integrity',
    legalAnalysis: 'Oregon courts recognize that cultural or religious traditions cannot justify bodily modification of female children, yet cite parental culture as the sole justification for boys.'
  },
  {
    id: 'billing',
    dimension: 'Healthcare Billing & Reimbursement',
    femaleProtected: 'Illegal: No insurance or Medicaid reimbursement permitted',
    femaleStatus: 'Unbillable / Prohibited',
    maleStatus: 'State Subsidized',
    maleStatute: 'Active CPT billing codes & Medicaid reimbursement',
    legalAnalysis: 'The State of Oregon directly subsidizes the non-therapeutic excision of boys’ prepuces via tax-funded Medicaid billing, creating a financial pipeline for hospital obstetrics.'
  }
];

export default function StatutoryDisparityMatrix() {
  const [activeRowId, setActiveRowId] = useState('statute');
  const activeRow = COMPARISON_ROWS.find(r => r.id === activeRowId) || COMPARISON_ROWS[0];

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(22, 22, 30, 0.95) 0%, rgba(14, 14, 20, 0.98) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '1.75rem',
      margin: '2rem 0 2.5rem 0',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Title */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '1rem'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: FONT.condensed,
            fontSize: '0.78rem',
            fontWeight: 800,
            color: 'var(--c-red, #ef4444)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.35rem'
          }}>
            <Scale size={15} /> Constitutional Asymmetry Visualizer
          </div>
          <h3 style={{
            margin: '0 0 0.35rem 0',
            fontSize: '1.35rem',
            color: '#fff',
            fontFamily: FONT.display
          }}>
            The Statutory Double Standard: Oregon FGM Law vs. Infant Circumcision
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--c-muted, #94a3b8)', maxWidth: '680px' }}>
            A direct legal comparison exposing why the State’s defense in <em>Hadachek</em> violates Article I, Section 46 of the Oregon Constitution (Equal Rights Amendment).
          </p>
        </div>

        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '8px',
          padding: '0.45rem 0.85rem',
          fontSize: '0.78rem',
          color: 'var(--c-red, #ef4444)',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          Equal Rights Challenge
        </div>
      </div>

      {/* Side-by-side header cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <ShieldCheck size={22} style={{ color: '#10b981', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', fontFamily: FONT.condensed, letterSpacing: '0.06em' }}>
              Female Minors Protected
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              ORS 163.207 (FGM Shield)
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <ShieldAlert size={22} style={{ color: '#ef4444', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', fontFamily: FONT.condensed, letterSpacing: '0.06em' }}>
              Male & Intersex Minors Excluded
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              Statutory Vacuum / Zero Protection
            </div>
          </div>
        </div>
      </div>

      {/* Selectable Dimension Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
        {COMPARISON_ROWS.map((row) => {
          const isSelected = row.id === activeRowId;
          return (
            <div
              key={row.id}
              onClick={() => setActiveRowId(row.id)}
              style={{
                background: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${isSelected ? 'var(--c-goldBright, #f59e0b)' : 'rgba(255, 255, 255, 0.06)'}`,
                borderRadius: '10px',
                padding: '0.85rem 1.2rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'grid',
                gridTemplateColumns: 'minmax(160px, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)',
                gap: '1rem',
                alignItems: 'center'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isSelected ? 'var(--c-goldBright)' : '#fff' }}>
                {row.dimension}
              </div>
              <div style={{ fontSize: '0.84rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                {row.femaleStatus}
              </div>
              <div style={{ fontSize: '0.84rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                {row.maleStatus}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Analysis Drawer */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1.4rem 1.6rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: FONT.condensed,
          fontSize: '0.76rem',
          fontWeight: 800,
          color: 'var(--c-goldBright, #f59e0b)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '0.4rem'
        }}>
          Constitutional Analysis • {activeRow.dimension}
        </div>
        <p style={{ margin: 0, fontSize: '0.94rem', color: '#e2e8f0', lineHeight: 1.65 }}>
          {activeRow.legalAnalysis}
        </p>
      </div>
    </div>
  );
}
