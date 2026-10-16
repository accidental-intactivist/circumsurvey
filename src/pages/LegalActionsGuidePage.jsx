import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  Shield, 
  ArrowLeft, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  Share2, 
  Sparkles, 
  Gavel, 
  Award, 
  Layers, 
  Download, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  BookOpen,
  Landmark
} from 'lucide-react';
import { C, FONT } from '../styles/tokens';
import LoomChoreography from '../components/GuidedTour/LoomChoreography';
import { StatutoryDisparityMatrix } from '../components/guides/visuals';

export default function LegalActionsGuidePage() {
  const [activeTab, setActiveTab] = useState('huff'); // 'huff' | 'hadachek' | 'playbook' | 'docket'
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const docketItems = [
    {
      date: 'August 31, 2026',
      title: 'Court Order Granting Admission of Counsel Eric Clopper Pro Hac Vice (Conformed)',
      type: 'Court Order',
      court: 'Denver District Court (Case 2026CV32110)',
      url: 'https://cdn.prod.website-files.com/66119b8c4d0c10f195159122/6a9b3d7814b45eacb14deed3_2026CV32110_16_2026-08-31_Order__Out_of_State_Counsel_s_Verified_Motion_Requesting_Pro_Hac_Vice_Admission_for_Eric_Clopper_12554847611016907808.pdf'
    },
    {
      date: 'August 31, 2026',
      title: "Court Order Granting Defendant's Unopposed Motion for Extension of Time (Conformed)",
      type: 'Court Order',
      court: 'Denver District Court (Case 2026CV32110)',
      url: 'https://cdn.prod.website-files.com/66119b8c4d0c10f195159122/6a9b3d7a2711ecffcd5cb16d_2026CV32110_16_2026-08-31_Order__Unopposed_Motion_for_Extension_of_Time_8424911785330876167.pdf'
    },
    {
      date: 'August 28, 2026',
      title: "Defendant's Unopposed Motion for Extension of Time",
      type: 'Motion',
      court: 'Denver District Court (Case 2026CV32110)',
      url: 'https://cdn.prod.website-files.com/66119b8c4d0c10f195159122/6a9b3d7a2711ecffcd5cb171_2026CV32110_16_2026-08-28_Unopposed_Motion_for_Extension_of_Time_4798932256657421516.pdf'
    },
    {
      date: 'June 9, 2026',
      title: 'Huff v. Colorado - Colorado Equal Protection Complaint (Conformed) - For Press',
      type: 'Conformed Complaint',
      court: 'Denver District Court (Case 2026CV32110)',
      url: 'https://cdn.prod.website-files.com/66119b8c4d0c10f195159122/6a3185315bbad632a188ed5f_2026-06-09---Huff-v.-Colorado-Complaint---Equal-Protection-Challenge-(Conformed)---For-Press.pdf'
    }
  ];

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #08080a 0%, #101015 50%, #08080a 100%)',
      color: 'var(--c-textBright, #eee)',
      fontFamily: FONT.body,
      paddingBottom: '5rem',
      position: 'relative'
    }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top Header / Breadcrumb */}
        <header style={{
          borderBottom: '1px solid rgba(212, 160, 48, 0.25)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
              >
                <ArrowLeft size={16} /> Home
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
              <Link 
                to="/library" 
                style={{
                  color: '#d4a030',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Library & Legal Exhibits
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
              <span style={{ color: 'var(--c-textBright)', fontSize: '0.85rem', fontWeight: 600 }}>
                Legislative & Legal Actions Guide
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <a
                href="https://www.intactglobal.org/lawsuits/huff-v-colorado"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(212, 160, 48, 0.12)',
                  color: '#facc15',
                  border: '1px solid rgba(212, 160, 48, 0.35)',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>Intact Global Docket</span>
                <ExternalLink size={13} />
              </a>

              <button
                onClick={handleShare}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: copiedLink ? '#34d399' : '#ddd',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
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
                {copiedLink ? <CheckCircle2 size={14} color="#34d399" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Copied' : 'Share Guide'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          
          {/* Top Title Banner with Confined Header Underloom */}
          <div style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '2.5rem 2rem',
            borderRadius: '16px',
            background: 'radial-gradient(ellipse at 80% 20%, rgba(212, 160, 48, 0.1), transparent 70%), rgba(20, 20, 28, 0.65)',
            border: '1px solid rgba(212, 160, 48, 0.25)',
            marginBottom: '2.5rem',
            boxShadow: '0 12px 36px rgba(0,0,0,0.4)'
          }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.35 }}>
              <LoomChoreography isInline={true} forceFormation="harmonic" opacity={1} themeColor="library" />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <span style={{
                fontFamily: FONT.condensed,
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                background: 'rgba(212, 160, 48, 0.15)',
                color: '#facc15',
                border: '1px solid rgba(212, 160, 48, 0.3)',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <Gavel size={13} />
                LITIGATION ARCHIVE & LEGISLATIVE PLAYBOOK
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.78rem',
                color: '#888'
              }}>
                STATE ERA • EQUAL PROTECTION • MEDICAID DECOUPLING
              </span>
            </div>

            <h1 style={{
              fontFamily: FONT.display,
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              margin: '0 0 1rem 0',
              color: '#fff',
              letterSpacing: '-0.02em'
            }}>
              Legislative & Legal Actions: <br />
              <span style={{ color: '#facc15' }}>Huff v. Colorado</span> & Equal Rights Jurisprudence
            </h1>

            <p style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.6,
              maxWidth: '920px',
              margin: 0
            }}>
              An exhaustive legal guide tracking the constitutional challenges dismantling the dual legal standard in the United States—focusing on <em>Huff v. Colorado</em> in Denver District Court and the broader legislative strategies for equal bodily protection.
            </p>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '2.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem'
          }}>
            {[
              { id: 'huff', label: 'Huff v. Colorado (Denver District Court)', icon: <Scale size={16} /> },
              { id: 'hadachek', label: 'Hadachek v. Oregon (Federal 14th Am.)', icon: <Landmark size={16} /> },
              { id: 'playbook', label: 'Legislative Reform Playbook', icon: <BookOpen size={16} /> },
              { id: 'docket', label: 'Court Docket Receipts (4 Filings)', icon: <FileText size={16} /> }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.15rem',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    background: isActive ? 'rgba(212, 160, 48, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? '#facc15' : '#aaa',
                    border: isActive ? '1px solid rgba(212, 160, 48, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: HUFF V. COLORADO DEEP DIVE */}
          {activeTab === 'huff' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              {/* Case Summary Card */}
              <div style={{
                padding: '2.25rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(22, 22, 28, 0.95) 0%, rgba(12, 12, 16, 0.98) 100%)',
                border: '1px solid rgba(212, 160, 48, 0.3)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      background: 'rgba(212, 160, 48, 0.2)',
                      color: '#facc15',
                      fontWeight: 700,
                      display: 'inline-block',
                      marginBottom: '0.5rem'
                    }}>
                      DENVER DISTRICT COURT • CASE NO. 2026CV32110
                    </span>
                    <h2 style={{ fontFamily: FONT.display, fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                      Tristan Huff and Adam Schwartz v. State of Colorado
                    </h2>
                  </div>

                  <a
                    href="https://cdn.prod.website-files.com/66119b8c4d0c10f195159122/6a3185315bbad632a188ed5f_2026-06-09---Huff-v.-Colorado-Complaint---Equal-Protection-Challenge-(Conformed)---For-Press.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      background: '#facc15',
                      color: '#000',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 15px rgba(250, 204, 21, 0.25)'
                    }}
                  >
                    <Download size={15} />
                    <span>Download Conformed Complaint (PDF)</span>
                  </a>
                </div>

                {/* Core Thesis Box */}
                <div style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '12px',
                  background: 'rgba(212, 160, 48, 0.06)',
                  borderLeft: '4px solid #facc15',
                  marginBottom: '2rem'
                }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#facc15', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    THE CORE CONSTITUTIONAL CHALLENGE
                  </div>
                  <p style={{ fontSize: '1.05rem', fontStyle: 'italic', lineHeight: 1.6, color: '#eee', margin: 0, fontFamily: FONT.display }}>
                    &ldquo;Plaintiffs seek a judicial declaration that Colorado&rsquo;s anti-female genital mutilation statute, CRS § 18-6-401(1)(b), denies male children equal protection of the law and unjustifiably treats male and female children disparately in direct violation of Colorado&rsquo;s Equal Rights Amendment, Colo. Const. art. II § 29.&rdquo;
                  </p>
                </div>

                {/* Metadata Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1.25rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Plaintiffs</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: '0.2rem 0 0 0' }}>Tristan Huff & Adam Schwartz</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Litigation Counsel</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: '0.2rem 0 0 0' }}>Intact Global Legal Team & Eric Clopper (Pro Hac Vice)</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Target Statute</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#facc15', margin: '0.2rem 0 0 0' }}>CRS § 18-6-401(1)(b) (Anti-FGC Law)</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Constitutional Basis</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: '0.2rem 0 0 0' }}>Colo. Const. art. II, § 29 (State ERA)</p>
                  </div>
                </div>
              </div>

              {/* Three Strategic Legal Pillars */}
              <div>
                <h3 style={{ fontFamily: FONT.display, fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
                  The Three Constitutional Pillars of Huff v. Colorado
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  
                  {/* Pillar 1 */}
                  <div style={{
                    padding: '1.75rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Scale size={20} color="#facc15" />
                      <h4 style={{ fontFamily: FONT.display, fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                        1. Strict Scrutiny Under State ERA
                      </h4>
                    </div>
                    <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: '#ccc', margin: 0 }}>
                      Unlike the federal constitution where sex classifications receive intermediate scrutiny under <em>Craig v. Boren</em>, Article II, Section 29 of the Colorado Constitution establishes that sex is an inherently suspect classification demanding <strong>strict judicial scrutiny</strong>. The State must prove a compelling governmental interest advanced by the least restrictive means to justify protecting girls from non-therapeutic genital cutting while leaving boys unprotected.
                    </p>
                  </div>

                  {/* Pillar 2 */}
                  <div style={{
                    padding: '1.75rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <AlertTriangle size={20} color="#ef4444" />
                      <h4 style={{ fontFamily: FONT.display, fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                        2. The Anatomical Inversion Fallacy
                      </h4>
                    </div>
                    <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: '#ccc', margin: 0 }}>
                      CRS § 18-6-401(1)(b) makes even a minor prick, scrape, or incision on a female minor a Class 3 felony, even if completely harmless, while the complete amputation of the prepuce—containing 30,000–50,000 nerve endings and up to 50% of mobile penile skin—is actively performed in hospital wards. The complaint demonstrates that this disparate statutory threshold has zero physiological or clinical justification.
                    </p>
                  </div>

                  {/* Pillar 3 */}
                  <div style={{
                    padding: '1.75rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Shield size={20} color="#34d399" />
                      <h4 style={{ fontFamily: FONT.display, fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                        3. The Remedy: Universal Child Protection
                      </h4>
                    </div>
                    <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: '#ccc', margin: 0 }}>
                      Rather than striking down female genital protection, Plaintiffs argue that the judicial doctrine of statutory extension requires courts to read the statute as <strong>sex-neutral</strong>. By interpreting the law to forbid all non-therapeutic genital cutting on children of any sex, the court can harmonize criminal law with constitutional equal protection.
                    </p>
                  </div>

                </div>
              </div>

              {/* Statutory Disparity Comparison Matrix */}
              <div style={{
                padding: '2rem',
                borderRadius: '16px',
                background: 'rgba(20, 20, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h3 style={{ fontFamily: FONT.display, fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>
                  Statutory Disparity: Colorado Criminal Code (CRS § 18-6-401)
                </h3>
                <StatutoryDisparityMatrix />
              </div>

            </div>
          )}

          {/* TAB 2: HADACHEK V. OREGON COMPARISON */}
          {activeTab === 'hadachek' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{
                padding: '2.25rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(22, 22, 28, 0.95) 0%, rgba(12, 12, 16, 0.98) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
              }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  fontWeight: 700,
                  display: 'inline-block',
                  marginBottom: '0.5rem'
                }}>
                  U.S. DISTRICT COURT FOR DISTRICT OF OREGON • CASE 3:25-CV-00142
                </span>
                <h2 style={{ fontFamily: FONT.display, fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '0 0 1rem 0' }}>
                  Hadachek v. State of Oregon & Oregon Health Authority
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#ccc', lineHeight: 1.7, margin: '0 0 1.5rem 0' }}>
                  While <em>Huff v. Colorado</em> attacks the criminal code under state ERA jurisprudence, <em>Hadachek v. Oregon</em> targets the financial engine of circumcision: <strong>state Medicaid reimbursements for non-therapeutic cutting on wards of the state</strong> under the 14th Amendment’s Equal Protection and Due Process clauses.
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link
                    to="/to/hadachek_v_oregon"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      background: '#ef4444',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textDecoration: 'none'
                    }}
                  >
                    <span>View Dedicated Hadachek Courtroom Exhibit</span>
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </div>

              {/* Comparative Legal Strategy Table */}
              <div style={{
                padding: '2rem',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h3 style={{ fontFamily: FONT.display, fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>
                  Litigation Comparison: Huff v. Colorado vs. Hadachek v. Oregon
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#facc15' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Dimension</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Huff v. Colorado (2026)</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Hadachek v. Oregon (2025)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#fff' }}>Court & Venue</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#ccc' }}>Denver District Court (Colorado State Court)</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#ccc' }}>U.S. District Court for District of Oregon (Federal)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#fff' }}>Constitutional Basis</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#ccc' }}>Colorado Equal Rights Amendment (Strict Scrutiny)</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#ccc' }}>14th Amendment Equal Protection & Substantive Due Process</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#fff' }}>Target Mechanism</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#facc15' }}>Criminal FGM statute exclusion (CRS § 18-6-401)</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#ef4444' }}>Medicaid third-party billing & state ward consent</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#fff' }}>Sponsoring Litigators</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#ccc' }}>Intact Global Litigation Team (Eric Clopper)</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#ccc' }}>GALDEF & Children's Health & Human Rights Partnership</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: LEGISLATIVE REFORM PLAYBOOK */}
          {activeTab === 'playbook' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{
                padding: '2rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(20, 20, 26, 0.9) 0%, rgba(10, 10, 14, 0.95) 100%)',
                border: '1px solid rgba(212, 160, 48, 0.25)'
              }}>
                <h3 style={{ fontFamily: FONT.display, fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
                  The 4-Pronged Legislative & Policy Reform Playbook
                </h3>
                <p style={{ color: '#ccc', lineHeight: 1.7, fontSize: '1.05rem', margin: '0 0 2rem 0' }}>
                  Litigation alone is only one wing of the genital autonomy revolution. Below is the blueprint for systemic legislative reform currently being mobilized across state and federal arenas.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Step 1 */}
                  <div style={{ padding: '1.25rem 1.5rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', borderLeft: '4px solid #facc15' }}>
                    <h4 style={{ color: '#facc15', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                      1. Medicaid Decoupling & Elimination of State Subsidies
                    </h4>
                    <p style={{ color: '#bbb', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                      When states eliminate Medicaid reimbursement codes for non-therapeutic circumcision, hospital rates drop precipitously. Over 18 states (including California, Washington, Oregon, and Florida) have successfully eliminated taxpayer funding for infant circumcision, reducing regional rates by 25–40%.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div style={{ padding: '1.25rem 1.5rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', borderLeft: '4px solid #34d399' }}>
                    <h4 style={{ color: '#34d399', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                      2. Universal Harmonization of Child Protection Codes
                    </h4>
                    <p style={{ color: '#bbb', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                      Amend state criminal statutes to remove gendered terminology (replacing "female genital mutilation" with "child genital mutilation"). By protecting all children equally, statutes survive constitutional scrutiny and eliminate the double standard.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div style={{ padding: '1.25rem 1.5rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', borderLeft: '4px solid #60a5fa' }}>
                    <h4 style={{ color: '#60a5fa', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                      3. Statutory Extension of the Statute of Limitations
                    </h4>
                    <p style={{ color: '#bbb', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                      Enact "Bodily Autonomy Discovery Acts" allowing survivors of infant genital cutting to bring civil claims against medical facilities and practitioners upon reaching the age of majority (age 18 + 5 to 10 years).
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div style={{ padding: '1.25rem 1.5rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', borderLeft: '4px solid #f472b6' }}>
                    <h4 style={{ color: '#f472b6', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                      4. Hospital Informed Consent Audits & 2025 Retractions
                    </h4>
                    <p style={{ color: '#bbb', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                      Mandate that hospital obstetrics wards disclose the 2024–2025 admissions from the authors of the AAP 2012 policy—confirming that the AAP statement expired in 2017 and that lead authors now admit the practice is non-therapeutic and motivated by billing.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COURT DOCKET RECEIPTS */}
          {activeTab === 'docket' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ fontFamily: FONT.display, fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Official Docket Filings & Orders (Denver District Court)
                  </h3>
                  <p style={{ color: '#888', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                    Authentic conformed filings and judicial orders in <em>Huff v. Colorado</em>, Case No. 2026CV32110.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {docketItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1.25rem 1.5rem',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 700,
                          background: 'rgba(212, 160, 48, 0.2)',
                          color: '#facc15'
                        }}>
                          {item.type}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: 'JetBrains Mono, monospace' }}>
                          {item.date}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem 0' }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#888', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
                        {item.court}
                      </p>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        background: 'rgba(212, 160, 48, 0.15)',
                        border: '1px solid rgba(212, 160, 48, 0.35)',
                        color: '#facc15',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                    >
                      <Download size={13} />
                      <span>Download Filing</span>
                    </a>
                  </div>
                ))}
              </div>

              {/* Attribution Footer */}
              <div style={{
                padding: '1.25rem',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.75rem',
                color: '#777',
                textAlign: 'center'
              }}>
                Docket records mirrored from <a href="https://www.intactglobal.org/lawsuits/huff-v-colorado" target="_blank" rel="noopener noreferrer" style={{ color: '#facc15', textDecoration: 'underline' }}>Intact Global Litigation Bureau</a>. All documents are public records filed in Denver District Court, Colorado.
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
