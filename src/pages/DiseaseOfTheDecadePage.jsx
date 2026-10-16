import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  ArrowLeft, 
  ExternalLink, 
  Share2, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  FileText, 
  HelpCircle,
  Activity,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Quote
} from 'lucide-react';
import { C, FONT } from '../styles/tokens';
import LoomChoreography from '../components/GuidedTour/LoomChoreography';
import { captureEvent } from '../lib/telemetry';
import './AdminArchivePage.css';

const DECADES = [
  {
    period: '1870s',
    title: 'The Paralysis & Epilepsy Era',
    targetDisease: 'Childhood paralysis, epilepsy, hip joint disease, and "reflex neurosis"',
    keyProponents: 'Dr. Lewis Sayre (Orthopedic pioneer, founder/president of the AMA)',
    theClaim: 'Dr. Sayre claimed that an intact foreskin pinched sensitive nerves, triggering an uncontrollable cascade of "reflex neurosis" that arrested normal physical development, caused childhood paralysis, curved the spine, and led to hip joint contractures. His prescribed surgical intervention: universal infant circumcision.',
    theDebunking: 'Modern neurology, virology, and pediatrics proved that infantile paralysis and joint disease are caused by viral infections (such as poliovirus), cerebral palsy, or congenital orthopedic disorders. Normal preputial anatomy has zero neurological relationship to spinal or joint paralysis.',
    didTheyStop: 'No. When the reflex neurosis hypothesis collapsed under scientific scrutiny, surgeons did not abandon the procedure. They simply migrated to a new malady.',
    citation: 'Sayre LA. Partial Paralysis from Reflex Irritation, Caused by Phimosis and Adherent Prepuce. Trans Am Med Assoc. 1870;21:205–211.',
    tag: 'Reflex Neurosis'
  },
  {
    period: '1890s',
    title: 'The Moral Sanitarium & "Self-Abuse" Era',
    targetDisease: '"Self-Abuse" (masturbation), lunacy, idiocy, and moral degeneration',
    keyProponents: 'Dr. John Harvey Kellogg (Battle Creek Sanitarium), Sylvester Graham',
    theClaim: 'Victorian medicine viewed sexual arousal outside of procreation as the root cause of systemic disease. Kellogg and his peers claimed masturbation caused insanity, blindness, pulmonary tuberculosis, dwarfish bodies, and decay. Circumcision without anesthesia was advocated so the boy would permanently associate sexual arousal with physical pain.',
    theDebunking: 'The sexual revolution and modern sexology (Kinsey, Masters & Johnson) established that self-pleasure is a natural, harmless, and universal aspect of human physiology. Masturbation causes none of the diseases claimed by Victorian moralists.',
    didTheyStop: 'No. Rather than acknowledging that the surgical deterrent was founded on puritanical superstition, medicine pivoted to infectious bacterial plagues.',
    citation: 'Kellogg JH. Plain Facts for Old and Young: Embracing the Natural History and Hygiene of Organic Life. 1888.',
    tag: 'Moral Hygiene'
  },
  {
    period: '1910s',
    title: 'The Syphilis & Venereal Plague Era',
    targetDisease: 'Syphilis, gonorrhea, and military venereal infections',
    keyProponents: 'Sir Jonathan Hutchinson (British surgeon), U.S. Army Medical Corps',
    theClaim: 'During World War I and the pre-antibiotic era, physicians claimed circumcision created an impenetrable barrier against syphilis and gonorrhea, arguing that the mucosal prepuce acted as a sponge for venereal poisons.',
    theDebunking: 'In 1928, Alexander Fleming discovered penicillin, and the introduction of antibiotics in the 1940s cured bacterial venereal infections overnight. Epidemiological data demonstrated that circumcised and intact soldiers contracted syphilis at virtually identical rates when exposed.',
    didTheyStop: 'No. When antibiotics conquered syphilis, medicine did not retire the knife. Instead, they invented domestic and pediatric indications.',
    citation: 'Hutchinson J. On the Influence of Circumcision in Preventing Syphilis. Medical Times and Gazette. 1855;2:583–585.',
    tag: 'Venereal Disease'
  },
  {
    period: '1930s',
    title: 'The Enuresis & Childhood Nervousness Era',
    targetDisease: 'Nocturnal enuresis (bedwetting), childhood asthma, and nervousness',
    keyProponents: 'Hospital maternity wards, general practitioners',
    theClaim: 'Physicians argued that an intact foreskin caused bladder irritability, chronic bedwetting, nocturnal unrest, childhood asthma, and behavioral delinquency. Circumcision was promoted as standard prophylactic maintenance.',
    theDebunking: 'Pediatric urology demonstrated that enuresis is a developmental delay in antidiuretic hormone secretion or nocturnal bladder capacity, completely unrelated to foreskin presence.',
    didTheyStop: 'No. Hospitals had realized newborn circumcision was a reliable, assembly-line maternity revenue stream. They needed a new adult terror to motivate parents.',
    citation: 'Wollbarst AL. Circumcision and Its Relation to General Health. Am Med. 1926;21:23–32.',
    tag: 'Pediatric Nervousness'
  },
  {
    period: '1950s',
    title: 'The "Carcinogenic Smegma" & Cervical Cancer Era',
    targetDisease: 'Cervical cancer in wives and female sexual partners',
    keyProponents: 'Dr. Abraham Ravich (Urologist, Brooklyn)',
    theClaim: 'Dr. Ravich published wildly popular claims that Jewish women had lower rates of cervical cancer because their husbands were circumcised. He asserted that natural male smegma was a lethal, carcinogenic toxin transmitted during intercourse.',
    theDebunking: 'In the 1970s and 1980s, Nobel laureate Harald zur Hausen proved that cervical cancer is caused by Human Papillomavirus (HPV), not smegma. Smegma is harmless natural sebum and beneficial commensal flora. European women whose partners are intact have among the lowest cervical cancer rates in the world.',
    didTheyStop: 'No. When smegma was exonerated and Pap smears and HPV vaccines took over, advocates pivoted to cultural conformity and infant hygiene.',
    citation: 'Ravich A. The Prophylaxis of Cancer of the Cervix by Circumcision. Cancer Cytology. 1971;11(2):33–38.',
    tag: 'Cervical Cancer'
  },
  {
    period: '1970s',
    title: 'The "Locker Room" & Phimosis Misdiagnosis Era',
    targetDisease: 'Locker-room shame, peer rejection, and "congenital phimosis"',
    keyProponents: 'Post-war suburban pediatricians, popular media',
    theClaim: 'With disease claims falling apart, advocates pivoted to social conformity: "He needs to match his father and his peers in the gym shower, or he\'ll be psychologically scarred." Simultaneously, doctors routinely misdiagnosed normal infant developmental non-retraction as "phimosis," claiming surgery was mandatory.',
    theDebunking: 'Dr. Douglas Gairdner had already established in 1949 that infant foreskin is naturally fused to the glans and does not retract until childhood or puberty. The "locker room" panic was a self-fulfilling American cultural myth; the 80% of the world left intact experienced zero social distress in communal showers.',
    didTheyStop: 'No. When insurance companies began threatening to stop reimbursing cosmetic circumcision, advocates found an acute infant medical target: UTIs.',
    citation: 'Gairdner D. The Fate of the Foreskin: A Study of Circumcision. BMJ. 1949;2(4642):1433–1437.',
    tag: 'Conformity & Phimosis'
  },
  {
    period: '1990s',
    title: 'The Infant Urinary Tract Infection (UTI) Era',
    targetDisease: 'Neonatal urinary tract infections (UTIs) and renal scarring',
    keyProponents: 'Dr. Thomas Wiswell, American Academy of Pediatrics Task Forces',
    theClaim: 'Dr. Wiswell claimed that circumcising newborn boys was vital to prevent urinary tract infections and subsequent renal damage, publishing relative risk figures that alarmed expectant mothers.',
    theDebunking: 'Girls experience UTIs at 10 to 50 times the rate of boys, yet no medical body proposes prophylactic surgical amputation of female genital tissue. A systematic Cochrane review showed it requires approximately 111 circumcisions to prevent a single treatable UTI. Infant UTIs are easily diagnosed and cured with standard oral antibiotics without surgery.',
    didTheyStop: 'No. When the AAP in 1999 concluded the data was insufficient to recommend routine circumcision, proponents turned to global infectious diseases: HIV.',
    citation: 'Singh-Grewal D, Macdessi J, Craig J. Circumcision for the prevention of urinary tract infection in boys: a systematic review of randomised trials and observational studies. Arch Dis Child. 2005;90(8):853–858.',
    tag: 'Infant UTIs'
  },
  {
    period: '2010s',
    title: 'The Heterosexual HIV Prophylaxis Era',
    targetDisease: 'HIV / AIDS transmission in the United States',
    keyProponents: 'AAP 2012 Circumcision Task Force, CDC Draft Guidelines',
    theClaim: 'Advocates leveraged three adult voluntary male circumcision trials conducted in rural Sub-Saharan Africa to argue that newborn circumcision in the United States was a cost-effective "surgical vaccine" against HIV.',
    theDebunking: 'The African trials evaluated adult heterosexual transmission in high-prevalence generalized epidemics, halted early, and lacked blinding. French virologists and Pasteur Institute epidemiologists emphasized that tissue excision provides 0% physical barrier protection upon viral exposure. Real prevention requires condoms (99% barrier) and PrEP. The United States has the highest infant circumcision rate in the developed world alongside the highest HIV rates, whereas intact Western Europe maintains the lowest.',
    didTheyStop: 'The policy collapsed. The 2012 AAP Policy Statement officially expired in August 2017 without renewal.',
    citation: 'Frisch M, et al. Cultural Bias in the AAP’s 2012 Technical Report and Policy Statement on Male Circumcision. Pediatrics. 2013;131(4):796–800.',
    tag: 'HIV / VMMC'
  },
  {
    period: '2020s–Present',
    title: 'The Admissions & Retraction Era',
    targetDisease: 'None remaining. The collapse of the clinical pretext.',
    keyProponents: 'The architects of the 2012 AAP statement',
    theClaim: 'With every medical pretext systematically debunked and the 2012 AAP policy officially expired since 2017, the lead authors broke their silence.',
    theDebunking: 'In 2024, Fendereski et al. (Journal of Pediatric Surgery) analyzed 1.7 million boys and proved circumcised boys suffer nearly 3x MORE penile problems (1.7% vs 0.5%) than intact boys. In 2025 (Journal of Medical Ethics), task force chair Dr. Andrew Freedman admitted circumcision is "not really a medical practice" and urged the AAP to exit the business, while bioethicist Dr. Douglas Diekema conceded that benefits do not outweigh risks.',
    didTheyStop: 'The tide has turned. U.S. inpatient circumcision has dropped below 50%, and the biological reality is returning.',
    citation: 'Buckler J. As controversies mount, circumcision policies need a rethink. J Med Ethics. 2025; Fendereski et al. J Pediatr Surg. 2024.',
    tag: 'The Retraction Era'
  }
];

export default function DiseaseOfTheDecadePage() {
  const [activeDecadeIndex, setActiveDecadeIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  React.useEffect(() => {
    captureEvent('retcon_timeline_viewed');
  }, []);

  const selectDecade = (idx) => {
    setActiveDecadeIndex(idx);
    captureEvent('retcon_decade_selected', {
      decade: DECADES[idx].period,
      title: DECADES[idx].title,
      targetDisease: DECADES[idx].targetDisease
    });
  };

  const active = DECADES[activeDecadeIndex];

  const handleShare = () => {
    captureEvent('retcon_timeline_shared', { currentDecade: active.period });
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #09090d 0%, #121218 50%, #09090d 100%)',
      color: 'var(--c-text, #eee)',
      fontFamily: FONT.body,
      paddingBottom: '5rem',
      position: 'relative'
    }}>
      {/* Background Holographic Choreography */}
      <div className="no-print" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.28 }}>
        <LoomChoreography isInline={true} forceFormation="harmonic" opacity={1} themeColor="gold" />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Top Header ── */}
        <header style={{
          borderBottom: '1px solid rgba(212, 160, 48, 0.2)',
          background: 'rgba(10, 10, 14, 0.92)',
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
                Disease of the Decade
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={handleShare}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(212, 160, 48, 0.12)',
                  border: '1px solid rgba(212, 160, 48, 0.3)',
                  color: '#d4a030',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <Share2 size={14} />
                {copiedLink ? 'Link Copied!' : 'Share Dossier'}
              </button>
            </div>
          </div>
        </header>

        {/* ── Hero Banner ── */}
        <section style={{
          maxWidth: '1200px',
          margin: '2rem auto 2.5rem',
          padding: '0 1.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            background: 'rgba(212, 160, 48, 0.1)',
            border: '1px solid rgba(212, 160, 48, 0.25)',
            borderRadius: '999px',
            color: '#d4a030',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '1rem'
          }}>
            <History size={14} /> The 150-Year Medical Retcon
          </div>

          <h1 style={{
            fontFamily: FONT.serif,
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            color: '#fff',
            marginBottom: '1rem',
            maxWidth: '900px',
            margin: '0 auto 1rem'
          }}>
            The "Disease of the Decade"
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--c-dim, #aaa)',
            maxWidth: '780px',
            margin: '0 auto 1.5rem',
            lineHeight: 1.6
          }}>
            A historical examination of how the justification for routine infant circumcision changes every fifteen years, 
            while the physical target—the body’s most sensitive erogenous tissue—mysteriously remains the exact same.
          </p>

          {/* The Pharmaceutical Parable Callout */}
          <div style={{
            maxWidth: '850px',
            margin: '2rem auto 0',
            background: 'rgba(20, 20, 28, 0.85)',
            border: '1px solid rgba(212, 160, 48, 0.35)',
            borderRadius: '12px',
            padding: '1.5rem 2rem',
            textAlign: 'left',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d4a030', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.92rem' }}>
              <Quote size={18} /> THE PERMANENT PRODUCT ANALOGY
            </div>
            <p style={{ fontStyle: 'italic', color: '#ddd', fontSize: '1.02rem', lineHeight: 1.6, margin: 0 }}>
              "Imagine a pharmaceutical company invented a pill in 1870 to prevent childhood paralysis. When paralysis was disproven, they claimed it cured masturbation. When Kinsey debunked that, they claimed it prevented syphilis. When penicillin cured syphilis, they claimed it stopped cervical cancer. When HPV was discovered, they claimed it prevented infant UTIs. When antibiotics handled UTIs, they claimed it prevented HIV.<br /><br />
              For 150 years, the target disease changed every decade. But the pill never changed, and its primary physiological side effect was always dampening sexual sensation.<br /><br />
              <strong>Would you call that evidence-based medicine? Or would you recognize a permanent product constantly inventing a temporary excuse?</strong>"
            </p>
          </div>
        </section>

        {/* ── Interactive Decade Selector ── */}
        <section style={{ maxWidth: '1200px', margin: '0 auto 2.5rem', padding: '0 1.5rem' }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            scrollbarWidth: 'thin'
          }}>
            {DECADES.map((d, idx) => {
              const isSelected = idx === activeDecadeIndex;
              return (
                <button
                  key={d.period}
                  onClick={() => selectDecade(idx)}
                  style={{
                    flex: '0 0 auto',
                    padding: '0.65rem 1.1rem',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #d4a030' : '1px solid rgba(255,255,255,0.08)',
                    background: isSelected ? 'rgba(212, 160, 48, 0.18)' : 'rgba(20, 20, 26, 0.6)',
                    color: isSelected ? '#d4a030' : '#888',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: isSelected ? 700 : 500,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <span>{d.period}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{d.tag}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Active Decade Dossier Card ── */}
        <section style={{ maxWidth: '1000px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
          <div style={{
            background: 'rgba(16, 16, 22, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)'
          }}>
            {/* Card Header */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(212, 160, 48, 0.15) 0%, rgba(20, 20, 28, 0.8) 100%)',
              borderBottom: '1px solid rgba(212, 160, 48, 0.25)',
              padding: '1.5rem 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#d4a030', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ERA {active.period} · {active.tag}
                </span>
                <h2 style={{ fontFamily: FONT.serif, fontSize: '1.65rem', margin: '0.25rem 0 0', color: '#fff' }}>
                  {active.title}
                </h2>
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: '#aaa'
              }}>
                Era {activeDecadeIndex + 1} of {DECADES.length}
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* Row 1: Target & Proponents */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.1rem', borderRadius: '8px', borderLeft: '3px solid #e86868' }}>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#e86868', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Target Malady of the Day
                  </div>
                  <div style={{ color: '#eee', fontSize: '0.98rem', fontWeight: 600 }}>
                    {active.targetDisease}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.1rem', borderRadius: '8px', borderLeft: '3px solid #5b93c7' }}>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#5b93c7', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Primary Historical Advocates
                  </div>
                  <div style={{ color: '#eee', fontSize: '0.98rem', fontWeight: 600 }}>
                    {active.keyProponents}
                  </div>
                </div>
              </div>

              {/* Row 2: The Medical Claim */}
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#d4a030', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Activity size={18} /> The Medicalized Claim
                </h3>
                <p style={{ color: '#ccc', lineHeight: 1.65, fontSize: '0.98rem', margin: 0 }}>
                  {active.theClaim}
                </p>
              </div>

              {/* Row 3: The Scientific Debunking */}
              <div style={{ background: 'rgba(16, 28, 20, 0.6)', border: '1px solid rgba(74, 222, 128, 0.25)', borderRadius: '10px', padding: '1.25rem 1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem' }}>
                  <ShieldCheck size={18} /> The Scientific Reality & Debunking
                </h3>
                <p style={{ color: '#d1fae5', lineHeight: 1.65, fontSize: '0.98rem', margin: 0 }}>
                  {active.theDebunking}
                </p>
              </div>

              {/* Row 4: Did They Stop Circumcising? */}
              <div style={{ background: 'rgba(30, 20, 20, 0.6)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '1.25rem 1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem' }}>
                  <AlertTriangle size={18} /> Did They Stop Performing the Surgery?
                </h3>
                <p style={{ color: '#fee2e2', lineHeight: 1.65, fontSize: '0.98rem', margin: 0 }}>
                  {active.didTheyStop}
                </p>
              </div>

              {/* Row 5: Citation & Shelfmark */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.84rem', color: '#888' }}>
                  <strong style={{ color: '#aaa' }}>Primary Historical Record:</strong> {active.citation}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {activeDecadeIndex > 0 && (
                    <button
                      onClick={() => selectDecade(activeDecadeIndex - 1)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ccc',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.84rem'
                      }}
                    >
                      ← Previous Era
                    </button>
                  )}
                  {activeDecadeIndex < DECADES.length - 1 && (
                    <button
                      onClick={() => selectDecade(activeDecadeIndex + 1)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        background: 'rgba(212, 160, 48, 0.2)',
                        border: '1px solid rgba(212, 160, 48, 0.4)',
                        color: '#d4a030',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        fontWeight: 600
                      }}
                    >
                      Next Era ({DECADES[activeDecadeIndex + 1].period}) →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Summary & Next Steps ── */}
        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <div style={{
            background: 'rgba(15, 15, 20, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2.5rem 2rem'
          }}>
            <h2 style={{ fontFamily: FONT.serif, fontSize: '1.8rem', color: '#fff', marginBottom: '1rem' }}>
              "Why isn't this weird to more of us?"
            </h2>
            <p style={{ color: '#aaa', fontSize: '1.05rem', lineHeight: 1.65, maxWidth: '720px', margin: '0 auto 2rem' }}>
              When you look across 150 years of medical history, the conclusion is inescapable: routine circumcision is not an evidence-based surgery born of pathology. It is an American cultural ritual that has survived by endlessly jumping from one expiring excuse to the next.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/manifesto"
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
                <BookOpen size={18} /> Read the Full Manifesto
              </Link>
              <Link
                to="/to/expectant-parents"
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
