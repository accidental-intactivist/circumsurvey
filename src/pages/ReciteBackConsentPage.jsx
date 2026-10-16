import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck2, 
  Printer, 
  ArrowLeft, 
  Share2, 
  ShieldAlert, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Scale, 
  Info,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { C, FONT } from '../styles/tokens';
import LoomChoreography from '../components/GuidedTour/LoomChoreography';
import { captureEvent } from '../lib/telemetry';
import './AdminArchivePage.css';

const CLAUSES = [
  {
    id: 'clause-1',
    num: '01',
    title: 'Permanent Excision of Erogenous Mechanoreceptors',
    text: 'I understand that I am authorizing the permanent surgical amputation of approximately 12 to 15 square inches of adult tissue, including the preputial lamina, frenular delta, and an estimated 10,000 to 20,000 specialized fine-touch Meissner corpuscles, which constitute the primary erogenous nerve networks and mobile glide mechanism of my child\'s penis.',
    citation: 'Cold & McGrath, BJU Int (1999); Taylor et al., Br J Urol (1996); Sorrells et al., Int J Urol (2007).',
    implication: 'Removes 30–50% of penile cutaneous surface area and primary fine-touch tactile sensitivity.'
  },
  {
    id: 'clause-2',
    num: '02',
    title: 'Intentional Physiological Diminution of Sensation',
    text: 'I acknowledge that historically and physiologically, the reduction of erogenous sensitivity and dampening of sexual excitation is the primary mechanical effect and original 19th-century medical rationale for introducing routine infant circumcision into American medicine (Sayre 1870, Kellogg 1888). I understand that removing this tissue will permanently alter the mechanics of intercourse from natural rolling glide to abrasive friction for both my child and his future partners.',
    citation: 'Maimonides, Guide for the Perplexed 3:49; Sayre, Trans Am Med Assoc (1870); Kellogg, Plain Facts (1888).',
    implication: 'Converts low-friction internal glide into friction-dependent stroke, increasing lifetime lubrication dependency.'
  },
  {
    id: 'clause-3',
    num: '03',
    title: 'Tripled 5-Year Pediatric Complication Risk',
    text: 'I acknowledge that according to the largest pediatric claims study ever conducted on 1.7 million boys (Fendereski et al., Journal of Pediatric Surgery, November 2024), circumcised boys are nearly three times (2.9x) more likely to suffer documented penile complications—including meatal stenosis, urethral stricture, adhesions, and surgical revisions—within their first 5 years of life compared to boys left intact (1.7% vs. 0.5%). I understand this elective procedure statistically increases, rather than decreases, his 5-year risk of requiring penile medical intervention.',
    citation: 'Fendereski et al., Journal of Pediatric Surgery 59(11), 2024. DOI: 10.1016/j.jpedsurg.2024.07.017.',
    implication: '99.5% of intact boys require zero medical interventions for penile problems in early childhood.'
  },
  {
    id: 'clause-4',
    num: '04',
    title: 'Absence of Active Medical Association Recommendation',
    text: 'I acknowledge that no national pediatric association in the developed world recommends this surgery. I specifically acknowledge that the American Academy of Pediatrics\' 2012 policy statement officially expired in August 2017 without renewal, and that its lead author, Dr. Andrew Freedman, stated on the record in 2025 that circumcision is "not really a medical practice" and suggested the AAP exit the business.',
    citation: 'AAP 5-Year Policy Sunset (Aug 2017); Buckler, Journal of Medical Ethics (2025); KNMG Viewpoint (2010).',
    implication: 'The procedure is purely elective and non-therapeutic, with no active medical consensus supporting routine application.'
  },
  {
    id: 'clause-5',
    num: '05',
    title: 'Right to Deferred Personal Adult Autonomy',
    text: 'I understand that my child\'s genitalia are currently healthy, functional, and complete. I acknowledge that if he desires this elective cosmetic modification when he reaches the age of majority (18 years), he can make that decision for himself with full personal informed consent, without my proxy intervention.',
    citation: 'Universal Declaration of Human Rights (Art. 3, 5); UN Convention on the Rights of the Child (Art. 16, 24).',
    implication: 'Leaving him intact preserves all future choices; surgical excision permanently extinguishes them.'
  }
];

export default function ReciteBackConsentPage() {
  const [initials, setInitials] = useState({});
  const [parentName, setParentName] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  React.useEffect(() => {
    captureEvent('consent_page_viewed', { form: 'Form 104-RIC' });
  }, []);

  const toggleInitial = (id) => {
    const isNowAcknowledged = !initials[id];
    setInitials(prev => ({
      ...prev,
      [id]: isNowAcknowledged ? (parentName.slice(0, 3).toUpperCase() || 'YES') : null
    }));
    captureEvent('consent_clause_toggled', { 
      clauseId: id, 
      acknowledged: isNowAcknowledged 
    });
  };

  const allInitialed = CLAUSES.every(c => initials[c.id]);

  const handlePrint = () => {
    captureEvent('consent_form_printed', { 
      allInitialed,
      clausesAcknowledgedCount: Object.values(initials).filter(Boolean).length 
    });
    window.print();
  };

  const handleShare = () => {
    captureEvent('consent_form_shared');
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #09090d 0%, #111117 50%, #09090d 100%)',
      color: 'var(--c-text, #eee)',
      fontFamily: FONT.body,
      paddingBottom: '5rem',
      position: 'relative'
    }}>


      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Top Header / Breadcrumb ── */}
        <header className="no-print" style={{
          borderBottom: '1px solid rgba(212, 160, 48, 0.25)',
          background: 'rgba(10, 10, 14, 0.95)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0.85rem 1.5rem'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link 
                to="/to/expectant-parents" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--c-dim, #888)',
                  textDecoration: 'none',
                  fontSize: '0.88rem'
                }}
              >
                <ArrowLeft size={16} /> Parent Guide
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
              <span style={{ fontSize: '0.88rem', color: '#d4a030', fontWeight: 600 }}>
                Form 104-RIC: Recite-Back Consent
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={handlePrint}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <Printer size={14} /> Print Clean Form
              </button>
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
                <Share2 size={14} /> {copiedLink ? 'Link Copied!' : 'Share Form'}
              </button>
            </div>
          </div>
        </header>

        {/* ── Main Form Container ── */}
        <main style={{ maxWidth: '900px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
          
          {/* Institutional Form Card */}
          <div style={{
            background: 'rgba(16, 16, 22, 0.95)',
            border: '2px solid rgba(212, 160, 48, 0.35)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            padding: '2.5rem'
          }}>
            
            {/* Clinical Governance Header */}
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              margin: '-2.5rem -2.5rem 2rem -2.5rem',
              padding: '2.5rem 2.5rem 1.5rem',
              borderBottom: '2px solid rgba(212, 160, 48, 0.3)',
              background: 'radial-gradient(ellipse at 50% 0%, rgba(212, 160, 48, 0.12) 0%, rgba(10, 10, 14, 0.6) 100%)'
            }}>
              <div className="no-print" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.3 }}>
                <LoomChoreography isInline={true} forceFormation="harmonic" opacity={1} themeColor="gold" />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#d4a030', fontWeight: 800 }}>
                      CLINICAL BIOETHICS & RISK MANAGEMENT DISCLOSURE
                    </div>
                    <h1 style={{ fontFamily: FONT.serif, fontSize: '1.75rem', color: '#fff', margin: '0.4rem 0 0.2rem' }}>
                      Elective Neonatal Preputial Excision
                    </h1>
                    <div style={{ fontSize: '0.88rem', color: '#aaa' }}>
                      Document Standard: Joint Commission & AMA Code of Medical Ethics (Truth in Informed Consent)
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(212, 160, 48, 0.1)',
                    border: '1px solid rgba(212, 160, 48, 0.3)',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    textAlign: 'right'
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase' }}>Form Designation</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#d4a030' }}>FORM 104-RIC</div>
                  </div>
                </div>

                {/* Patient & Case Meta Box */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginTop: '1.5rem',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <span style={{ color: '#888' }}>PATIENT:</span> <strong style={{ color: '#eee' }}>Infant Male (~48h Postpartum)</strong>
                  </div>
                  <div>
                    <span style={{ color: '#888' }}>CLINICAL INDICATION:</span> <strong style={{ color: '#4ade80' }}>None (Healthy Anatomy)</strong>
                  </div>
                  <div>
                    <span style={{ color: '#888' }}>AUTHORITY:</span> <strong style={{ color: '#eee' }}>Parent / Legal Proxy</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Recite-Back Mandatory Directive Notice */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              borderLeft: '4px solid #ef4444',
              padding: '1rem 1.25rem',
              borderRadius: '0 8px 8px 0',
              marginBottom: '2rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}>
              <ShieldAlert size={22} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.88rem', lineHeight: 1.55, color: '#fca5a5' }}>
                <strong>MANDATORY RECITE-BACK DIRECTIVE:</strong> To satisfy genuine informed consent, standard hospital forms cannot rely on passive signing. The authorizing guardian must review each biological and clinical disclosure below aloud and verify understanding prior to surgical authorization.
              </div>
            </div>

            {/* Interactive Parent Name Input */}
            <div className="no-print" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#ccc', marginBottom: '0.5rem', fontWeight: 600 }}>
                Test this form: Enter Parent / Guardian Name (to generate initials):
              </label>
              <input
                type="text"
                placeholder="e.g. Jane Doe"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '0.65rem 1rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(212, 160, 48, 0.4)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            {/* ── The 5 Clauses ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {CLAUSES.map((clause) => {
                const isInitialed = !!initials[clause.id];
                return (
                  <div 
                    key={clause.id}
                    style={{
                      background: isInitialed ? 'rgba(212, 160, 48, 0.05)' : 'rgba(255,255,255,0.02)',
                      border: isInitialed ? '1px solid rgba(212, 160, 48, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '1.5rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{
                          background: 'rgba(212, 160, 48, 0.15)',
                          color: '#d4a030',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          CLAUSE {clause.num}
                        </span>
                        <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: 0, fontWeight: 600 }}>
                          {clause.title}
                        </h3>
                      </div>

                      {/* Initial Box */}
                      <button
                        onClick={() => toggleInitial(clause.id)}
                        style={{
                          flexShrink: 0,
                          minWidth: '85px',
                          padding: '0.45rem 0.75rem',
                          background: isInitialed ? '#d4a030' : 'rgba(0,0,0,0.5)',
                          border: isInitialed ? '1px solid #d4a030' : '1px solid rgba(255,255,255,0.2)',
                          color: isInitialed ? '#000' : '#888',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        {isInitialed ? (
                          <>
                            <Check size={14} /> {initials[clause.id]}
                          </>
                        ) : (
                          'Initial Here'
                        )}
                      </button>
                    </div>

                    <p style={{ color: '#ddd', fontSize: '0.98rem', lineHeight: 1.65, margin: '0 0 0.85rem' }}>
                      "{clause.text}"
                    </p>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.78rem',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      paddingTop: '0.65rem'
                    }}>
                      <div style={{ color: '#aaa' }}>
                        <strong style={{ color: '#888' }}>Clinical Authority:</strong> {clause.citation}
                      </div>
                      <div style={{ color: '#d4a030', fontStyle: 'italic' }}>
                        {clause.implication}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Attestation & Signature Block ── */}
            <div style={{
              marginTop: '3rem',
              borderTop: '2px solid rgba(255,255,255,0.15)',
              paddingTop: '2rem'
            }}>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.75rem' }}>
                Final Proxy Attestation & Surgical Directive
              </h3>
              <p style={{ color: '#bbb', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                "I affirm that I have reviewed the disclosures above. With full awareness that this surgery is non-therapeutic, irreversible, permanently removes specialized erogenous mechanoreceptive tissue, increases early childhood risk of penile complications (2.9x), and has no active AAP policy recommendation, I nevertheless waive my child's natural bodily integrity and direct the physician to excise this tissue from his body without his consent."
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
                <div style={{ borderBottom: '1px solid #666', paddingBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Parent / Legal Guardian Signature</div>
                  <div style={{ minHeight: '32px', color: '#d4a030', fontWeight: 600, paddingTop: '0.25rem' }}>
                    {parentName ? `${parentName} (Proxy)` : ''}
                  </div>
                </div>

                <div style={{ borderBottom: '1px solid #666', paddingBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Attending Physician / Witness</div>
                  <div style={{ minHeight: '32px', color: '#aaa', paddingTop: '0.25rem' }}>
                    MD / DO / R.N.
                  </div>
                </div>

                <div style={{ borderBottom: '1px solid #666', paddingBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Date & Hospital Location</div>
                  <div style={{ minHeight: '32px', color: '#aaa', paddingTop: '0.25rem' }}>
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Reality Check Callout ── */}
            <div className="no-print" style={{
              marginTop: '3.5rem',
              background: 'rgba(212, 160, 48, 0.08)',
              border: '1px solid rgba(212, 160, 48, 0.35)',
              borderRadius: '12px',
              padding: '1.75rem',
              textAlign: 'center'
            }}>
              <h4 style={{ fontFamily: FONT.serif, fontSize: '1.35rem', color: '#d4a030', margin: '0 0 0.5rem' }}>
                "Would you actually sign this?"
              </h4>
              <p style={{ color: '#ccc', fontSize: '0.98rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto 1.5rem' }}>
                If reading these anatomical and clinical facts makes you hesitate, ask yourself why standard hospital paperwork leaves them all out. 
                When the truth is spelled out, <strong>keeping him whole is the only choice that makes sense.</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  to="/to/expectant-parents"
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: '#d4a030',
                    color: '#000',
                    fontWeight: 700,
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  Return to Expectant Parents Guide
                </Link>
                <Link
                  to="/to/disease-of-the-decade"
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#eee',
                    fontWeight: 600,
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
                >
                  See 150 Years of Medical Retcons →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
