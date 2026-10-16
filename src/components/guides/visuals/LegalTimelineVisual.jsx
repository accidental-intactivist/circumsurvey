import React, { useState } from 'react';
import { 
  Gavel, CheckCircle2, Clock, AlertTriangle, ArrowRight, 
  ChevronRight, Calendar, Shield, Scale, FileText, ExternalLink 
} from 'lucide-react';
import { FONT } from '../../../styles/tokens';

const DEFAULT_STAGES = [
  {
    id: 'filing',
    date: 'Early 2025',
    title: 'Constitutional Complaint Filed',
    court: 'Multnomah County Circuit Court',
    status: 'completed',
    statusLabel: 'Filed',
    summary: 'Plaintiffs Dane & Sierra Hadachek, represented by Eric Clopper (Intact Global), file suit challenging Oregon statutes ORS 163.207 and 431A.600 under the Oregon Equal Rights Amendment (Art. I, § 46) and Equal Protection Clause.',
    implication: 'First constitutional lawsuit in modern PNW history directly testing whether statutory child protection laws can selectively exclude male and intersex infants.'
  },
  {
    id: 'standing-hearing',
    date: 'Oct 23, 2025',
    title: 'Motion to Dismiss Hearing',
    court: 'Multnomah County Circuit Court',
    status: 'completed',
    statusLabel: 'Survived',
    summary: 'Judge Melvin Oden-Orr hears oral arguments on State’s Motion to Dismiss. Court permits key plaintiffs to proceed, rejecting initial attempts to summarily extinguish the constitutional challenge.',
    implication: 'Cleared the threshold procedural hurdle, confirming that non-therapeutic genital cutting claims warrant judicial inquiry.'
  },
  {
    id: 'summary-argument',
    date: 'Sept 14, 2026',
    title: 'Summary Judgment Oral Arguments',
    court: 'Multnomah County Circuit Court',
    status: 'completed',
    statusLabel: 'Argued',
    summary: 'High-stakes hearing in Portland where the State argued protection from non-consensual cutting is a "female privilege" and attempted to introduce an unnamed expert to claim anatomical differences.',
    implication: 'State put on the record that child protection laws in Oregon are structured by administrative birth assignment rather than equal human rights.'
  },
  {
    id: 'standing-dismissal',
    date: 'Sept 28, 2026',
    title: 'Order on Standing Entered',
    court: 'Multnomah County Circuit Court',
    status: 'active',
    statusLabel: 'Ruling on Standing',
    summary: 'Judge Oden-Orr grants State’s Motion for Summary Judgment strictly on standing criteria, ruling plaintiffs did not demonstrate personal injury redressable by trial-level statutory change.',
    implication: 'Court explicitly did not decide whether the statutory disparity violates the Oregon Constitution, nor did it find circumcision harmless.'
  },
  {
    id: 'court-of-appeals',
    date: 'Oct 2026 – Present',
    title: 'Oregon Court of Appeals Review',
    court: 'Oregon Court of Appeals',
    status: 'upcoming',
    statusLabel: 'Active Appeal',
    summary: 'Intact Global files Notice of Appeal. Coalition prepares comprehensive appellate briefs to test equal protection and strict scrutiny before binding statewide appellate judges.',
    implication: 'Impact litigation moves to the level where binding statutory precedent is forged. Appellate courts have the clear authority to declare underinclusive laws unconstitutional.'
  },
  {
    id: 'supreme-review',
    date: 'Future Trajectory',
    title: 'Oregon Supreme Court / Binding Precedent',
    court: 'Oregon Supreme Court',
    status: 'projected',
    statusLabel: 'Precedent Horizon',
    summary: 'Anticipated petition for review to the highest state court to settle the constitutional conflict between the Equal Rights Amendment and statutory male infant cutting exemptions.',
    implication: 'Potential to establish the first statewide ruling in the United States prohibiting governmental discrimination in child bodily integrity.'
  }
];

export default function LegalTimelineVisual({ 
  stages = DEFAULT_STAGES, 
  title = "Litigation Trajectory & Precedent Flow",
  subtitle = "The chronological roadmap of Hadachek v. Oregon from trial court standing challenge to appellate constitutional review."
}) {
  const [activeStageId, setActiveStageId] = useState('standing-dismissal');
  const activeStage = stages.find(s => s.id === activeStageId) || stages[3];

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(20, 20, 28, 0.95) 0%, rgba(12, 12, 18, 0.98) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '1.75rem',
      margin: '2rem 0 2.5rem 0',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative ambient glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.18) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '1.25rem'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: FONT.condensed,
            fontSize: '0.78rem',
            fontWeight: 800,
            color: 'var(--c-goldBright, #f59e0b)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.35rem'
          }}>
            <Scale size={15} /> Interactive Case Telemetry
          </div>
          <h3 style={{
            margin: '0 0 0.35rem 0',
            fontSize: '1.35rem',
            color: '#fff',
            fontFamily: FONT.display
          }}>
            {title}
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--c-muted, #94a3b8)', maxWidth: '640px' }}>
            {subtitle}
          </p>
        </div>

        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '0.45rem 0.85rem',
          fontSize: '0.78rem',
          color: 'var(--c-red, #ef4444)',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <Clock size={14} /> Stage {stages.findIndex(s => s.id === activeStageId) + 1} of {stages.length}
        </div>
      </div>

      {/* Horizontal Steps Track */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stages.length}, minmax(130px, 1fr))`,
        gap: '0.75rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        {stages.map((st, idx) => {
          const isSelected = st.id === activeStageId;
          const isCompleted = st.status === 'completed';
          const isActive = st.status === 'active';
          
          let borderColor = 'rgba(255, 255, 255, 0.1)';
          let statusColor = 'var(--c-dim)';
          let badgeBg = 'rgba(255, 255, 255, 0.05)';

          if (isActive) {
            borderColor = 'var(--c-red, #ef4444)';
            statusColor = 'var(--c-red, #ef4444)';
            badgeBg = 'rgba(239, 68, 68, 0.15)';
          } else if (isCompleted) {
            borderColor = 'rgba(245, 158, 11, 0.4)';
            statusColor = 'var(--c-goldBright, #f59e0b)';
            badgeBg = 'rgba(245, 158, 11, 0.12)';
          } else if (isSelected) {
            borderColor = '#38bdf8';
            statusColor = '#38bdf8';
            badgeBg = 'rgba(56, 189, 248, 0.15)';
          }

          return (
            <button
              key={st.id}
              onClick={() => setActiveStageId(st.id)}
              style={{
                background: isSelected 
                  ? 'linear-gradient(180deg, rgba(30, 30, 42, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)' 
                  : 'rgba(0, 0, 0, 0.35)',
                border: `1px solid ${isSelected ? (isActive ? '#ef4444' : '#f59e0b') : borderColor}`,
                borderRadius: '10px',
                padding: '0.85rem 0.75rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                minWidth: '130px'
              }}
            >
              {/* Step indicator dot */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--f-mono, monospace)',
                  color: isSelected ? '#fff' : 'var(--c-dim)'
                }}>
                  0{idx + 1}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  background: badgeBg,
                  color: statusColor,
                  letterSpacing: '0.04em'
                }}>
                  {st.statusLabel}
                </span>
              </div>

              <div style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: isSelected ? '#fff' : 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.3
              }}>
                {st.title}
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--c-dim)', marginTop: 'auto' }}>
                {st.date}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Showcase Card for Active Node */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '1.4rem 1.6rem',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)',
        gap: '1.5rem',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--c-goldBright, #f59e0b)',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              {activeStage.court}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--c-dim)' }}>
              • {activeStage.date}
            </span>
          </div>

          <h4 style={{
            margin: '0 0 0.6rem 0',
            fontSize: '1.25rem',
            color: '#fff',
            fontFamily: FONT.display
          }}>
            {activeStage.title}
          </h4>

          <p style={{ margin: 0, fontSize: '0.94rem', color: '#e2e8f0', lineHeight: 1.65 }}>
            {activeStage.summary}
          </p>
        </div>

        <div style={{
          background: 'rgba(239, 68, 68, 0.06)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '10px',
          padding: '1.1rem',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{
            fontFamily: FONT.condensed,
            fontSize: '0.74rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--c-red, #ef4444)',
            marginBottom: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Shield size={14} /> Constitutional Impact
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.55 }}>
            {activeStage.implication}
          </p>
        </div>
      </div>
    </div>
  );
}
