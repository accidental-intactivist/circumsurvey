import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, Shield, ArrowLeft, ArrowRight, ExternalLink, Calendar, 
  MapPin, Users, AlertTriangle, FileText, CheckCircle2, Share2, 
  BookOpen, Sparkles, Quote, DollarSign, AlertCircle, Gavel, Award
} from 'lucide-react';
import { C, FONT } from '../styles/tokens';
import LoomChoreography from '../components/GuidedTour/LoomChoreography';
import { LegalTimelineVisual, StatutoryDisparityMatrix } from '../components/guides/visuals';
import './AdminArchivePage.css';

export default function HadachekExhibitPage() {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Exhibit link copied to clipboard!');
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #08080a 0%, #101015 50%, #08080a 100%)',
      color: 'var(--c-text, #eee)',
      fontFamily: FONT.body,
      paddingBottom: '5rem',
      position: 'relative'
    }}>
      {/* Background Underloom holographic canvas in Legal/Library Land (Crimson & Gold) */}
      <div className="no-print" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.32 }}>
        <LoomChoreography isInline={true} forceFormation="harmonic" opacity={1} themeColor="library" />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Top Header / Breadcrumb ── */}
      <header style={{
        borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
        background: 'rgba(10, 10, 14, 0.95)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '0.85rem 1.5rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link 
              to="/" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--c-dim, #888)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontFamily: FONT.condensed,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              className="lux-hover-bright"
            >
              <ArrowLeft size={16} /> Home
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <Link 
              to="/library" 
              style={{
                color: 'var(--c-red, #ef4444)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontFamily: FONT.condensed,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Library & Curated Exhibits
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: 'var(--c-textBright)', fontSize: '0.85rem', fontWeight: 600 }}>
              Hadachek v. Oregon
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={handleShare}
              className="lux-hover-lift"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--c-red, #ef4444)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Share2 size={14} /> Share Exhibit
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {/* Badge & Title */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              background: 'var(--c-red, #ef4444)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 800,
              fontFamily: FONT.condensed,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '0.3rem 0.75rem',
              borderRadius: '4px',
              boxShadow: '0 0 16px rgba(239, 68, 68, 0.4)'
            }}>
              Landmark Legal Exhibit • Case Dossier
            </span>
            <span style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--c-goldBright, #f59e0b)',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: FONT.condensed,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '0.3rem 0.75rem',
              borderRadius: '4px',
              border: '1px solid rgba(245, 158, 11, 0.35)'
            }}>
              ⚖️ Active On Appeal
            </span>
          </div>

          <h1 style={{
            fontFamily: FONT.display,
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            color: '#ffffff',
            fontWeight: 800,
            lineHeight: 1.15,
            margin: '0 0 0.8rem 0',
            letterSpacing: '-0.02em'
          }}>
            The Anatomy of a Courtroom Battle:<br />
            Hadachek v. Oregon
          </h1>
          <p style={{
            fontFamily: FONT.body,
            fontSize: 'clamp(1.05rem, 2vw, 1.3rem)',
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: 1.6,
            maxWidth: '950px',
            margin: 0
          }}>
            An inside report from the 2nd Hadachek trial in Portland challenging the state's systemic denial of equal protection and bodily autonomy for male and intersex children.
          </p>
        </div>

        {/* ── Authentic Courtroom Photo Hero ── */}
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          background: 'var(--c-bgDeep)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          marginBottom: '2.5rem'
        }}>
          <img
            src="/images/hadachek-hero.jpg"
            alt="Plaintiffs, legal counsel, and coalition allies outside the courtroom doors at the 2nd Hadachek v. Oregon trial in Portland"
            style={{
              width: '100%',
              maxHeight: '680px',
              objectFit: 'cover',
              objectPosition: 'center 20%',
              display: 'block'
            }}
          />
          <div style={{
            padding: '1.25rem 1.75rem',
            background: 'linear-gradient(180deg, rgba(15,15,20,0.92) 0%, rgba(10,10,14,0.98) 100%)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{
                fontFamily: FONT.condensed,
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--c-goldBright, #f59e0b)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.25rem'
              }}>
                Historic Coalition Gathering • Multnomah County Courthouse
              </div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                Legal counsel, plaintiffs, and genital autonomy coalition allies gathered outside the courtroom doors following proceedings in the landmark equal-protection lawsuit <em>Hadachek v. Oregon</em>.
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                color: 'var(--c-red, #ef4444)',
                fontWeight: 700,
                letterSpacing: '0.04em'
              }}>
                Photo Courtesy of Intact Global
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                color: 'var(--c-dim)',
                fontFamily: 'var(--f-mono, monospace)',
                whiteSpace: 'nowrap'
              }}>
                Portland, OR • 2026
              </div>
            </div>
          </div>
        </div>

        {/* ── Case Telemetry Dossier ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div className="lux-lens" style={{ padding: '1.4rem', borderRadius: '10px', borderLeft: '3px solid var(--c-red, #ef4444)' }}>
            <div style={{ color: 'var(--c-dim)', fontSize: '0.75rem', fontFamily: FONT.condensed, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              Jurisdiction & Forum
            </div>
            <div style={{ color: 'var(--c-textBright)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
              State of Oregon
            </div>
            <div style={{ color: 'var(--c-muted)', fontSize: '0.85rem' }}>
              Multnomah County Circuit Court → Oregon Court of Appeals
            </div>
          </div>

          <div className="lux-lens" style={{ padding: '1.4rem', borderRadius: '10px', borderLeft: '3px solid var(--c-goldBright, #f59e0b)' }}>
            <div style={{ color: 'var(--c-dim)', fontSize: '0.75rem', fontFamily: FONT.condensed, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              Core Legal Question
            </div>
            <div style={{ color: 'var(--c-textBright)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
              Equal Rights Amendment & Equal Protection
            </div>
            <div style={{ color: 'var(--c-muted)', fontSize: '0.85rem' }}>
              Prohibiting the State from denying equal bodily integrity rights based on sex assigned at birth
            </div>
          </div>

          <div className="lux-lens" style={{ padding: '1.4rem', borderRadius: '10px', borderLeft: '3px solid #38bdf8' }}>
            <div style={{ color: 'var(--c-dim)', fontSize: '0.75rem', fontFamily: FONT.condensed, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              Counsel & Sponsorship
            </div>
            <div style={{ color: 'var(--c-textBright)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
              Eric Clopper, Esq. • Intact Global
            </div>
            <div style={{ color: 'var(--c-muted)', fontSize: '0.85rem' }}>
              In coalition with GALDEF, Genital Autonomy League, and plaintiff families
            </div>
          </div>

          <div className="lux-lens" style={{ padding: '1.4rem', borderRadius: '10px', borderLeft: '3px solid #4ade80' }}>
            <div style={{ color: 'var(--c-dim)', fontSize: '0.75rem', fontFamily: FONT.condensed, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              Current Trajectory
            </div>
            <div style={{ color: 'var(--c-textBright)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
              Appealed to Oregon Court of Appeals
            </div>
            <div style={{ color: 'var(--c-muted)', fontSize: '0.85rem' }}>
              Summary judgment granted on standing (Sept 28, 2026); appealed immediately to test equal protection merits
            </div>
          </div>
        </div>

        {/* ── Case Update Bulletin: September 28, 2026 Ruling on Standing ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.14) 0%, rgba(20, 20, 28, 0.95) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '14px',
          padding: '1.5rem 1.75rem',
          marginBottom: '2.5rem',
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'flex-start'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            padding: '0.75rem',
            borderRadius: '10px',
            color: 'var(--c-red, #ef4444)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Gavel size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
              <span style={{
                fontFamily: FONT.condensed,
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--c-red, #ef4444)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>
                Special Procedural Update • September 28, 2026
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                color: 'var(--c-dim)'
              }}>
                Multnomah County Circuit Court • Hon. Melvin Oden-Orr
              </span>
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.28rem', color: '#fff', fontFamily: FONT.display }}>
              Trial Court Granted Summary Judgment on Standing — Appeal Process Started Immediately
            </h3>
            <p style={{ margin: '0 0 0.75rem 0', color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6 }}>
              On September 28, 2026, the Multnomah County Circuit Court granted the State of Oregon's motion for summary judgment specifically on the threshold procedural issue of <strong>standing</strong>, concluding that the individual plaintiffs had not met the formal criteria to challenge the criminal statutes in this procedural posture.
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '0.85rem 1.1rem',
              borderRadius: '8px',
              borderLeft: '3px solid var(--c-goldBright, #f59e0b)',
              marginBottom: '0.75rem',
              fontSize: '0.88rem',
              color: 'rgba(255,255,255,0.92)',
              lineHeight: 1.55
            }}>
              <strong>Crucial Distinction:</strong> The court <em>did not decide</em> whether Oregon's statutory scheme denying equal protection from non-therapeutic genital cutting to boys and intersex children violates the Oregon Constitution or the Equal Rights Amendment. Furthermore, the court <em>did not rule</em> that circumcision is harmless.
            </div>
            <p style={{ margin: 0, color: 'var(--c-muted)', fontSize: '0.86rem', lineHeight: 1.55 }}>
              Intact Global and legal coalition partners have already initiated the appellate process in the <strong>Oregon Court of Appeals</strong>. In constitutional impact litigation, trial courts routinely defer controversial statutory invalidations to the appellate level, where binding statewide and federal equal protection precedent is properly established.
            </p>
          </div>
        </div>

        {/* ── Interactive Litigation Trajectory Flowchart ── */}
        <LegalTimelineVisual />

        {/* ── Tone's Field Note: The Anatomy of a Courtroom Battle ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: '2.5rem',
          alignItems: 'flex-start'
        }}>
          
          {/* Main Narrative Column */}
          <article style={{
            background: 'rgba(20, 20, 26, 0.8)',
            padding: '2.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            lineHeight: 1.8
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--c-goldBright)',
              fontFamily: FONT.condensed,
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}>
              <FileText size={16} /> Field Note by Tone Pettit • The Accidental Intactivist
            </div>

            <h2 style={{
              fontFamily: FONT.display,
              fontSize: '1.8rem',
              color: 'var(--c-textBright)',
              marginBottom: '1.5rem',
              lineHeight: 1.3
            }}>
              Three Shocking Tactics the State Used to Defend Denial of Bodily Autonomy
            </h2>

            <p style={{ fontSize: '1.05rem', color: '#e2e8f0', marginBottom: '1.5rem' }}>
              In Portland, the State tried to legally downgrade bodily autonomy to a <em>"female privilege."</em> Comparing notes from the courtroom reveals three shocking tactics the State deployed to defend the systemic denial of bodily autonomy for boys and intersex children:
            </p>

            {/* Tactic 1 */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '1.5rem',
              borderRadius: '10px',
              borderLeft: '4px solid var(--c-red, #ef4444)',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.2rem',
                color: 'var(--c-textBright)',
                fontFamily: FONT.display
              }}>
                1. The Desperate "Unnamed Expert" Ploy
              </h3>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.96rem' }}>
                The State attempted to introduce an unnamed expert to invent a biological difference between the male and female prepuce, claiming that non-therapeutic cutting on boys has medical utility whereas identical tissue removal on girls does not. The court rightly struck this speculative attempt from the record, exposing the State's inability to produce peer-reviewed anatomical evidence distinguishing the innervation or function of the tissue.
              </p>
            </div>

            {/* Tactic 2 */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '1.5rem',
              borderRadius: '10px',
              borderLeft: '4px solid var(--c-goldBright, #f59e0b)',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.2rem',
                color: 'var(--c-textBright)',
                fontFamily: FONT.display
              }}>
                2. Intersex Erasure
              </h3>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.96rem' }}>
                The State argued that Female Genital Mutilation (FGM) statutes apply strictly and exclusively to females, completely erasing intersex children and relying on arbitrary administrative birth assignment rather than inherent human rights. By reducing human rights to binary gender assignments made at birth, the State admitted that child protection laws are not rooted in physiological harm, but in administrative convenience.
              </p>
            </div>

            {/* Tactic 3 */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '1.5rem',
              borderRadius: '10px',
              borderLeft: '4px solid #38bdf8',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.2rem',
                color: 'var(--c-textBright)',
                fontFamily: FONT.display
              }}>
                3. The "Female Privilege" Checkmate
              </h3>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.96rem' }}>
                In its most audacious defense, the State argued that protection from non-consensual genital alteration is not an inalienable human right, but a <em>"female privilege"</em> granted at the legislature's discretion. This argument lays bare the cognitive dissonance at the heart of state-sanctioned infant cutting: if protection is a privilege rather than a right, the State claims the terrifying power to carve up any citizen's body unless an explicit legislative exemption exists.
              </p>
            </div>

            {/* ── Statutory Double-Standard Visual Matrix ── */}
            <StatutoryDisparityMatrix />

            <h3 style={{
              fontFamily: FONT.display,
              fontSize: '1.35rem',
              color: 'var(--c-textBright)',
              marginTop: '2rem',
              marginBottom: '0.75rem'
            }}>
              The Adverse Ruling & The Battle on Appeal
            </h3>
            <p style={{ fontSize: '0.98rem', color: '#cbd5e1', marginBottom: '1rem' }}>
              While the trial court granted the State's motion to dismiss, constitutional trial litigations of this scale are almost always decided at the appellate level. Trial courts are notoriously reluctant to overturn century-old statutory blindspots on their own.
            </p>
            <p style={{ fontSize: '0.98rem', color: '#cbd5e1', margin: 0 }}>
              The notice of appeal has been filed in the Oregon Court of Appeals. The coalition is now preparing comprehensive appellate briefs that will test whether the Fourteenth Amendment's guarantee of Equal Protection can survive when applied to the most vulnerable members of society.
            </p>

            {/* ── Synthesis: The Collapse of the Medical Pretext & AAP Retraction ── */}
            <div style={{
              marginTop: '3.5rem',
              paddingTop: '2.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: 'var(--c-red, #ef4444)',
                fontFamily: FONT.condensed,
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem'
              }}>
                <Scale size={16} /> Investigative Synthesis • Peer-Reviewed Evidence
              </div>

              <h2 style={{
                fontFamily: FONT.display,
                fontSize: '1.85rem',
                color: 'var(--c-textBright)',
                marginBottom: '1rem',
                lineHeight: 1.3
              }}>
                The Collapse of the Medical Pretext: 2025 Admissions by AAP Task Force Authors
              </h2>

              <p style={{ fontSize: '1.02rem', color: '#e2e8f0', marginBottom: '1.75rem', lineHeight: 1.75 }}>
                In <em>Hadachek v. Oregon</em>, the State’s defense of excluding male and intersex infants from statutory bodily integrity protections rested fundamentally on one premise: that non-therapeutic male circumcision is an accepted medical practice with preventive health benefits recognized by the American Academy of Pediatrics (AAP). In 2025, that medical foundation collapsed from within.
              </p>

              {/* JME Investigation Context */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.78rem',
                  color: 'var(--c-goldBright)',
                  fontFamily: FONT.condensed,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.5rem'
                }}>
                  <BookOpen size={15} /> Journal of Medical Ethics (Late 2025)
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                  "As controversies mount, circumcision policies need a rethink"
                </div>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  In a landmark investigation published in the <em>Journal of Medical Ethics</em>, independent researcher Max Buckler conducted candid retrospective interviews with the primary architects and members of the AAP’s 2012 Circumcision Task Force. Their admissions reveal that the policy’s famous phrasing—that <em>"the health benefits outweigh the risks"</em>—was not driven by clinical data, but was a negotiated compromise constructed to preserve third-party medical billing and insurance reimbursement.
                </p>
              </div>

              {/* Quote 1: Dr. Andrew Freedman */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderLeft: '4px solid var(--c-red, #ef4444)',
                borderRadius: '12px',
                padding: '1.75rem',
                marginBottom: '1.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--c-red, #ef4444)' }}>
                  <Quote size={20} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: FONT.condensed }}>
                    Admission: Routine Circumcision Is Not A Medical Practice
                  </span>
                </div>
                <blockquote style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1.15rem',
                  fontStyle: 'italic',
                  color: '#fff',
                  lineHeight: 1.6,
                  fontFamily: FONT.display
                }}>
                  "Maybe the AAP should get out of the [circumcision] business, since it's not really a medical practice. It's only a 'medical procedure' in the sense that medical professionals are performing it."
                </blockquote>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--c-goldBright)' }}>
                    — Dr. Andrew L. Freedman, MD
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--c-dim)' }}>
                    Pediatric Urologist • Co-Author & Member, 2012 AAP Circumcision Task Force
                  </div>
                </div>
                <p style={{ margin: '0.85rem 0 0 0', fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.55 }}>
                  Dr. Freedman conceded that routine infant circumcision is at the lowest, weakest tier of preventive medicine, acknowledging that conflating a cultural ritual performed by doctors with an evidence-based medical therapy was a conceptual error the Academy should abandon.
                </p>
              </div>

              {/* Quote 2: Dr. Douglas Diekema */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderLeft: '4px solid var(--c-goldBright, #f59e0b)',
                borderRadius: '12px',
                padding: '1.75rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--c-goldBright)' }}>
                  <Quote size={20} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: FONT.condensed }}>
                    Admission: The Benefits Do Not Outweigh The Risks
                  </span>
                </div>
                <blockquote style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1.15rem',
                  fontStyle: 'italic',
                  color: '#fff',
                  lineHeight: 1.6,
                  fontFamily: FONT.display
                }}>
                  "When you look at all the data, I don't think you can honestly say in a recommendation that the benefits outweigh the risks."
                </blockquote>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--c-goldBright)' }}>
                    — Dr. Douglas S. Diekema, MD, MPH
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--c-dim)' }}>
                    Lead Bioethicist • Member, 2012 AAP Circumcision Task Force
                  </div>
                </div>
                <p style={{ margin: '0.85rem 0 0 0', fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.55 }}>
                  Dr. Diekema, who served as the primary ethical authority on the task force, acknowledged that looking back at the empirical literature, pediatricians cannot truthfully claim clinical superiority over intact anatomy, and should not be recommending the procedure to undecided parents.
                </p>
              </div>

              {/* The Billing & Reimbursement Engine */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(20, 24, 33, 0.95) 0%, rgba(12, 14, 20, 0.98) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '12px',
                padding: '1.75rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', marginBottom: '0.5rem' }}>
                  <DollarSign size={18} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: FONT.condensed }}>
                    The Financial Mechanism: Framing Health Benefits To Safeguard Insurance Billing
                  </span>
                </div>
                <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem', color: '#fff', fontFamily: FONT.display }}>
                  Why Was The Statement Written That Way?
                </h3>
                <p style={{ fontSize: '0.94rem', color: '#cbd5e1', lineHeight: 1.65, marginBottom: '1rem' }}>
                  The 2012 AAP policy statement contained a pivotal sentence that governed billions of dollars in medical revenue:
                </p>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  borderLeft: '3px solid #38bdf8',
                  fontSize: '0.92rem',
                  fontStyle: 'italic',
                  color: 'rgba(255, 255, 255, 0.95)',
                  marginBottom: '1rem',
                  lineHeight: 1.55
                }}>
                  "...the procedure's benefits justify access to this procedure for families who choose it and <strong>warrant third-party payment [insurance reimbursement] for circumcision of male newborns</strong>."
                  <div style={{ fontStyle: 'normal', fontSize: '0.78rem', color: 'var(--c-dim)', marginTop: '0.4rem' }}>
                    — AAP Policy Statement on Male Circumcision, Pediatrics 130(3), 2012
                  </div>
                </div>
                <p style={{ fontSize: '0.94rem', color: '#cbd5e1', lineHeight: 1.65, margin: 0 }}>
                  Prior to 2012, multiple state Medicaid programs (including California, Washington, and Oregon) had defunded routine infant circumcision after medical reviews established no therapeutic necessity. By crafting the policy to claim that "benefits outweigh risks," the AAP preserved the third-party billing codes that allowed hospitals and obstetricians to bill routine infant circumcisions as medically indicated services.
                </p>
              </div>

              {/* Legal Ramifications for Hadachek & Equal Protection */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h3 style={{ margin: '0 0 0.6rem 0', fontSize: '1.2rem', color: '#fff', fontFamily: FONT.display }}>
                  Constitutional Impact on Hadachek v. Oregon
                </h3>
                <p style={{ fontSize: '0.93rem', color: '#cbd5e1', lineHeight: 1.65, marginBottom: '0.75rem' }}>
                  Under Oregon’s Equal Rights Amendment (Art. I, § 46) and the 14th Amendment’s Equal Protection Clause, statutory sex-based classifications are subject to strict or heightened scrutiny. The State cannot justify protecting the genital integrity of one sex while leaving another vulnerable without proving an <em>exceedingly persuasive justification</em>.
                </p>
                <p style={{ fontSize: '0.93rem', color: '#cbd5e1', lineHeight: 1.65, margin: 0 }}>
                  With the AAP’s own authors admitting that routine infant circumcision is <em>"not really a medical practice"</em> and that <em>"benefits do not outweigh risks,"</em> the State's rationalization dissolves. Male infant circumcision is revealed as a subsidized cultural ritual—rendering the State's differential protection between male and female minors unconstitutional on its face.
                </p>
              </div>
            </div>
          </article>

          {/* Sidebar: Key Figures & Next Actions */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Key Legal Parties & Actors */}
            <div className="lux-lens" style={{ padding: '1.5rem', borderRadius: '14px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: FONT.condensed,
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--c-goldBright)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '1rem'
              }}>
                <Users size={16} /> Key Parties & Legal Actors
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>Eric Clopper, Esq.</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--c-dim)' }}>Plaintiffs' Lead Counsel • Founder, Intact Global</div>
                </div>

                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>Dane & Sierra Hadachek</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--c-dim)' }}>Named Plaintiffs • Challenging Underinclusive Statutes</div>
                </div>

                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>Intact Global</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--c-dim)' }}>Litigation Sponsor & Human Rights Advocacy</div>
                </div>

                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>State of Oregon / Oregon DOJ</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--c-dim)' }}>Defendants • Defending Statutory Gender Disparity</div>
                </div>

                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>John Geisheker, JD & Tim Hammond</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--c-dim)' }}>GALDEF • Legal Research & Amicus Support</div>
                </div>

                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>Hon. Melvin Oden-Orr</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--c-dim)' }}>Presiding Judge • Multnomah County Circuit Court</div>
                </div>
              </div>
            </div>

            {/* Related Exhibits & Primary Sources */}
            <div className="lux-lens" style={{ padding: '1.5rem', borderRadius: '14px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: FONT.condensed,
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--c-red, #ef4444)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '1rem'
              }}>
                <BookOpen size={16} /> Related In the Archive
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a
                  href="https://www.intactglobal.org/lawsuits/hadachek-v-oregon"
                  target="_blank"
                  rel="noreferrer"
                  className="lux-hover-lift"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#fff',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--c-red, #ef4444)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>CASE HUB</div>
                    <div>Intact Global: Hadachek Docket</div>
                  </div>
                  <ExternalLink size={14} style={{ color: 'var(--c-dim)', flexShrink: 0 }} />
                </a>

                <a
                  href="https://doi.org/10.1136/jme-2024-110287"
                  target="_blank"
                  rel="noreferrer"
                  className="lux-hover-lift"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#fff',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}
                >
                  <div>
                    <div style={{ color: '#38bdf8', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>BIOETHICS EXPOSÉ</div>
                    <div>Journal of Medical Ethics (Buckler 2025)</div>
                  </div>
                  <ExternalLink size={14} style={{ color: 'var(--c-dim)', flexShrink: 0 }} />
                </a>

                <Link
                  to="/library?topic=legislation"
                  className="lux-hover-lift"
                  style={{
                    display: 'block',
                    padding: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#fff',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}
                >
                  <div style={{ color: 'var(--c-goldBright)', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>LEGAL DOSSIER</div>
                  <div>The FGM Firewall: Exposing Double Standards</div>
                </Link>

                <a
                  href="https://www.galdef.org/2026/10/05/special-update-hadachek-v-oregon/"
                  target="_blank"
                  rel="noreferrer"
                  className="lux-hover-lift"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#fff',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}
                >
                  <span>GALDEF Legal Update</span>
                  <ExternalLink size={14} style={{ color: 'var(--c-dim)' }} />
                </a>
              </div>
            </div>

          </aside>
        </div>
      </main>
      </div>
    </div>
  );
}
