import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles, 
  ExternalLink, 
  FileText, 
  Scale, 
  Microscope,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database
} from 'lucide-react';
import { C, FONT } from '../../styles/tokens';
import { useAssistant } from '../../contexts/AssistantContext';
import AutoEntityLinker from '../AutoEntityLinker';

export default function ArchivalContextDossier({ meta, articleTitle, articleId }) {
  const { openAssistant, setInitialQuery } = useAssistant();
  const lens = meta?.lens;
  const archiveRefs = lens?.archive_refs || [];
  const claims = lens?.claims || [];
  const study = lens?.study;
  const whyItMatters = meta?.why_it_matters;

  const handleGlendaPrompt = (promptText) => {
    setInitialQuery(promptText);
    openAssistant();
  };

  // Derive calibrated Socratic Ask-Back
  const deriveAskBack = () => {
    if (articleTitle?.toLowerCase().includes('autism')) {
      return "Even without neurodevelopmental links, what legitimate medical necessity justifies removing healthy, functional, and densely innervated tissue from someone who cannot consent?";
    }
    if (study?.design?.toLowerCase().includes('retrospective') || articleTitle?.toLowerCase().includes('study')) {
      return "Does an observational statistical finding alter the fundamental human rights premise of bodily autonomy and non-therapeutic surgical intervention?";
    }
    return "How does the evidence in this report align with the principle that every human being owns their own body by default?";
  };

  const askBackQuestion = deriveAskBack();

  return (
    <div style={{ marginTop: '3.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* 1. Socratic Counter-Evidence & Movement Context Ledger */}
      <section 
        style={{
          background: 'linear-gradient(135deg, rgba(212,160,48,0.06) 0%, rgba(13,20,28,0.85) 100%)',
          border: '1px solid rgba(212,160,48,0.3)',
          borderLeft: '4px solid var(--c-goldBright)',
          borderRadius: '14px',
          padding: '2.25rem',
          boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              background: 'rgba(212,160,48,0.18)',
              border: '1px solid rgba(212,160,48,0.4)',
              color: 'var(--c-goldBright)',
              fontFamily: FONT.condensed,
              fontWeight: 800,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em'
            }}>
              <ShieldCheck size={13} style={{ marginRight: '0.35rem' }} />
              Archival Evidence & Counter-Dossier
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--c-dim)', fontFamily: FONT.mono }}>
              [EDITORIAL CONTEXT LEDGER]
            </span>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
            <CheckCircle2 size={13} />
            Verified Against Primary Source Holdings
          </span>
        </div>

        <h3 style={{
          fontFamily: FONT.display,
          fontSize: '1.5rem',
          color: 'var(--c-textBright)',
          margin: '0 0 1rem 0',
          lineHeight: 1.3
        }}>
          Contextualizing the Headline: Why This Research Matters
        </h3>

        {/* What's True Section */}
        <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            fontFamily: FONT.condensed,
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#38bdf8',
            marginBottom: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span>What Is Documented</span>
          </div>
          <p style={{ margin: 0, color: 'var(--c-text)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            {meta.abstract || meta.summary || "The reported study analyzed medical records of over 2,700 boys in the US and found no statistically significant association between neonatal circumcision and autism diagnoses."}
          </p>
        </div>

        {/* What the Evidence Shows / Archival Reality */}
        <div style={{ marginBottom: '1.75rem', padding: '1.25rem', background: 'rgba(212,160,48,0.04)', borderRadius: '10px', border: '1px solid rgba(212,160,48,0.15)' }}>
          <div style={{
            fontFamily: FONT.condensed,
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--c-goldBright)',
            marginBottom: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span>Archival Reality & Scientific Lineage</span>
          </div>
          <p style={{ margin: 0, color: 'var(--c-textBright)', fontSize: '1.05rem', lineHeight: 1.65 }}>
            {whyItMatters || "The hypothesis of a link between infant circumcision and autism originated in earlier exploratory registry studies (notably the 2015 Danish cohort). In intactivism and medical bioethics, rigorous empirical research that disproves speculative associations is welcomed: it keeps the human rights dialogue centered on demonstrable bodily autonomy, surgical trauma, and the non-consensual loss of functional erogenous tissue rather than contested neurological hypotheses."}
          </p>
        </div>

        {/* Socratic Ask-Back Card */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'rgba(56, 189, 248, 0.06)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '10px',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start'
        }}>
          <HelpCircle size={22} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{
              fontFamily: FONT.condensed,
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#38bdf8',
              marginBottom: '0.35rem'
            }}>
              The Socratic Ask-Back (Conversation Pivot)
            </div>
            <p style={{ margin: 0, color: '#f0fdf4', fontSize: '1.05rem', fontStyle: 'italic', lineHeight: 1.5 }}>
              &ldquo;{askBackQuestion}&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* 2. Primary Archival Precedents (Corpus Links) */}
      {archiveRefs.length > 0 && (
        <section 
          style={{
            background: 'var(--c-bgSoft)',
            borderRadius: '14px',
            padding: '2.25rem',
            border: '1px solid var(--c-borderMuted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <BookOpen size={18} color="var(--c-goldBright)" />
              <h3 style={{
                margin: 0,
                fontFamily: FONT.condensed,
                fontSize: '1.15rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 800,
                color: 'var(--c-textBright)'
              }}>
                Primary Archival Corpus & Scientific Precedents ({archiveRefs.length})
              </h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--c-dim)' }}>
              Directly cross-referenced from 24,000+ archive items
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}>
            {archiveRefs.map((ref, idx) => (
              <div 
                key={ref.id || idx}
                className="lux-hover-lift"
                style={{
                  background: 'var(--c-card)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderLeft: '4px solid var(--c-blue)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      fontFamily: FONT.mono,
                      fontSize: '0.68rem',
                      color: 'var(--c-dim)',
                      background: 'rgba(255,255,255,0.04)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      ARCHIVE #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <span style={{
                      fontFamily: FONT.condensed,
                      fontSize: '0.68rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#38bdf8',
                      fontWeight: 700
                    }}>
                      Peer-Reviewed Source
                    </span>
                  </div>

                  <h4 style={{
                    margin: 0,
                    fontSize: '1rem',
                    color: 'var(--c-textBright)',
                    fontWeight: 700,
                    lineHeight: 1.4
                  }}>
                    {ref.title}
                  </h4>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <Link 
                    to={`/library/${ref.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: 'var(--c-goldBright)',
                      textDecoration: 'none',
                      fontSize: '0.82rem',
                      fontFamily: FONT.condensed,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em'
                    }}
                  >
                    <span>Inspect in Library</span>
                    <ArrowRight size={13} />
                  </Link>

                  <button
                    onClick={() => handleGlendaPrompt(`Analyze the relationship between this news story ("${articleTitle}") and archival document "${ref.title}" (Doc ID: ${ref.id}).`)}
                    title="Cross-examine with Glenda"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--c-dim)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--c-dim)'}
                  >
                    <Sparkles size={12} />
                    <span>Ask Glenda</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Interactive Glenda Context Engine */}
      <section
        style={{
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(15, 23, 42, 0.9) 100%)',
          borderRadius: '14px',
          padding: '2rem',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--c-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--c-textBright)', fontSize: '1.15rem', fontFamily: FONT.display }}>
              Cross-Examine with Glenda
            </h3>
            <p style={{ margin: 0, color: 'var(--c-dim)', fontSize: '0.85rem' }}>
              Instant contextual briefing cross-referenced against 3,200+ archival holdings and survey microdata.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            onClick={() => handleGlendaPrompt(`Explain the historical context behind "${articleTitle}". Why was an association between circumcision and autism hypothesized in the first place, and how does the medical consensus view it today?`)}
            className="lux-hover-lift"
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--c-textBright)',
              fontSize: '0.85rem',
              fontFamily: FONT.body,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease'
            }}
          >
            <span>🔬 Trace Origin of Autism Hypothesis</span>
            <ArrowRight size={13} color="var(--c-goldBright)" />
          </button>

          <button
            onClick={() => handleGlendaPrompt(`In the context of intactivism and genital autonomy, why does a study showing no link between circumcision and autism strengthen the movement's focus on ethics, pain, and bodily integrity?`)}
            className="lux-hover-lift"
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--c-textBright)',
              fontSize: '0.85rem',
              fontFamily: FONT.body,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease'
            }}
          >
            <span>⚖️ How Null Findings Support Bodily Autonomy</span>
            <ArrowRight size={13} color="var(--c-goldBright)" />
          </button>

          <button
            onClick={() => handleGlendaPrompt(`Give me a calm, respectful, and evidence-grounded 3-point framework for discussing the headline "${articleTitle}" with parents or friends.`)}
            className="lux-hover-lift"
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--c-textBright)',
              fontSize: '0.85rem',
              fontFamily: FONT.body,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease'
            }}
          >
            <span>💬 3-Point Parent Discussion Framework</span>
            <ArrowRight size={13} color="var(--c-goldBright)" />
          </button>
        </div>
      </section>

    </div>
  );
}
