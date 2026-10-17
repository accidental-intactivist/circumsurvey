import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignupForm from '../components/SignupForm';
import { useTheme } from '../contexts/ThemeContext';
import { Database, ShieldAlert, Sparkles, ExternalLink, ArrowRight, ClipboardPen, Play, Pause, HeartHandshake, Scale, Mail, Coffee, BookOpen, Building2, Archive, BarChart2, Users, Newspaper, ChevronRight } from 'lucide-react';
import { C, FONT } from '../styles/tokens';
import UniversalSquishHeader from '../components/Scrollytelling/UniversalSquishHeader';
import ArchiveHamburgerMenu from '../components/ArchiveHamburgerMenu';
import NewsAggregator from '../components/NewsAggregator';
import SiloGateways from '../components/SiloGateways';
import BentoBox from '../components/BentoBox';
import MegamenuNav from '../components/MegamenuNav';

const RAINBOW = "linear-gradient(90deg, var(--c-red), var(--c-orange, #e8a44a), var(--c-yellow, #e8c868), var(--c-green, #68b878), var(--c-blue))";

// Strategic Partner data matching the exact proportions & verbatim copy from original Google Sites
const STRATEGIC_PARTNERS = [
  {
    name: 'DOCTORS OPPOSING CIRCUMCISION (DOC)',
    acronym: 'DOC',
    logo: '/partners/doc.png',
    url: 'https://doctorsopposingcircumcision.org',
    body: (
      <>
        We are proud to be in direct collaboration with <strong>DOC</strong>, a foundational, Seattle-based organization of medical professionals who have been advocating for genital autonomy since 1995.
      </>
    )
  },
  {
    name: 'INTACT GLOBAL',
    acronym: 'Intact Global',
    logo: '/partners/intact-global.png',
    url: 'https://intactglobal.org',
    body: (
      <>
        We are honored to be working as a strategic partner with <strong>Intact Global</strong> and its president, attorney <strong>Eric Clopper</strong>. Our survey project is now an active tool in their crucial effort to prepare a landmark Equal Protection lawsuit in Washington State, aiming to secure the same legal right to bodily integrity for boys that is already afforded to girls.
      </>
    )
  },
  {
    name: 'GENITAL AUTONOMY LEGAL DEFENSE & EDUCATION FUND (GALDEF)',
    acronym: 'GALDEF',
    logo: '/partners/galdef.png',
    url: 'https://galdef.org',
    body: (
      <>
        We are also grateful for the strategic advice and support from foundational researcher <strong>Tim Hammond (NOHARMM/GALDEF)</strong> and attorney <strong>Eric Clopper (Intact Global)</strong>, which has opened a path toward potential academic review of our findings with researchers at <strong>Quinnipiac University</strong>.
      </>
    )
  },
  {
    name: 'WASHINGTON INITIATIVE FOR BOYS AND MEN (WIBM)',
    acronym: 'WIBM',
    logo: '/partners/wibm.png',
    url: 'https://wibm.org',
    body: (
      <>
        We are actively working with <strong>WIBM</strong>, the leading political advocacy group for men's and boys' issues in Washington State, to provide them with WA-specific data to support their legislative efforts.
      </>
    )
  }
];

export default function LandingPage() {
  const { theme, mode } = useTheme();
  const navigate = useNavigate();
  const themeKey = `${theme}-${mode}`;

  const [scrolled, setScrolled] = useState(false);
  const [loomPaused, setLoomPaused] = useState(() => {
    try { return localStorage.getItem('cs_loom_paused') === 'true'; } catch { return false; }
  });

  const toggleLoom = useCallback(() => {
    const next = !loomPaused;
    setLoomPaused(next);
    try { localStorage.setItem('cs_loom_paused', String(next)); } catch {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cs-loom-pause', { detail: { paused: next } }));
    }
  }, [loomPaused]);

  // Dynamic Hero Story State: Supports Hadachek flagship or latest fresh dispatch
  const [heroMode, setHeroMode] = useState('hadachek'); // 'hadachek' | 'fresh'
  const [freshStory, setFreshStory] = useState(null);

  useEffect(() => {
    async function fetchLatestHero() {
      try {
        const res = await fetch('/api/cms?types=recap,article,essay,external_news&hide_rejected=1&sort=published&limit=5');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.data || []);
          if (list.length > 0) {
            const top = list[0];
            let meta = {};
            try { meta = JSON.parse(top.metadata_json || '{}'); } catch(e){}
            setFreshStory({
              id: top.id,
              type: top.type,
              title: top.title,
              category: top.category || (top.type === 'recap' ? 'Pulse of the Movement' : 'Field Note'),
              snippet: meta.abstract || meta.summary || (meta.sections?.[0]?.body) || 'Latest dispatch from the genital autonomy archive.',
              imageUrl: meta.image_url || (meta.media_urls?.[0]) || null,
              link: top.type === 'recap' ? `/news/${top.id}` : (top.url ? `/news/${top.id}` : `/to/${top.id}`)
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch fresh hero:', err);
      }
    }
    fetchLatestHero();
  }, []);

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        setScrolled(window.scrollY > 80);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div style={{
      minHeight: '100dvh',
      background: `linear-gradient(135deg, var(--c-bgDeep) 0%, var(--c-bg) 100%)`,
      color: C.text,
      fontFamily: FONT.body,
      position: 'relative',
      zIndex: 1,
      paddingBottom: '4rem',
      overflow: 'hidden'
    }}>
      {/* Background glowing orb for dynamic modern feel */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '1200px', height: '600px',
        background: 'radial-gradient(ellipse at top, rgba(212,160,48,0.15) 0%, transparent 70%)',
        zIndex: -1, pointerEvents: 'none'
      }} />

      <UniversalSquishHeader
        themeKey={themeKey}
        loomPaused={loomPaused}
        toggleLoom={toggleLoom}
        startVh={30}
        title={<>The Accidental<br />Intactivist's Guide</>}
        navRightContent={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <Link to="/report" className="mobile-hide" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.85rem',
              color: C.goldBright, textDecoration: 'none',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              padding: '0.35rem 0.8rem', border: `1px solid ${C.border}`,
              borderRadius: 4, transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,160,48,0.1)'; e.currentTarget.style.borderColor = C.goldBright; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; }}
            >
              <span>Phase 1 Report</span>
              <ExternalLink size={14} />
            </Link>

            <a href="https://forms.gle/FQ8o9g7j1yU3Cw7n7" target="_blank" rel="noreferrer" className="mobile-hide" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.85rem',
              color: 'var(--c-bgDeep)', textDecoration: 'none',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              padding: '0.35rem 0.8rem', background: 'var(--c-gold)',
              borderRadius: 4, transition: 'all 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <ClipboardPen size={14} />
              <span>Take the Survey</span>
            </a>
            
            <ArchiveHamburgerMenu />
          </div>
        }
        heroContent={null}
      />

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem 2rem 1.5rem', width: '100%' }}>
        <MegamenuNav />
        
        {/* ════════════════════════════════════════════════════════════════════
            MEDIA HUB LAYOUT: Flexbox responsive (Hero + Sidebar)
            ════════════════════════════════════════════════════════════════════ */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2.5rem',
          marginBottom: '4rem',
          alignItems: 'flex-start'
        }}>
          
          {/* HERO ARTICLE COLUMN */}
          <div style={{ flex: '1 1 65%', minWidth: '300px' }}>
            {/* Optional Switcher between Landmark Case & Fresh Daily Dispatch */}
            {freshStory && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button
                  onClick={() => setHeroMode('hadachek')}
                  style={{
                    background: heroMode === 'hadachek' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    border: `1px solid ${heroMode === 'hadachek' ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                    color: heroMode === 'hadachek' ? '#ef4444' : C.dim,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontFamily: FONT.condensed,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ⚖️ Landmark Case: Hadachek
                </button>
                <button
                  onClick={() => setHeroMode('fresh')}
                  style={{
                    background: heroMode === 'fresh' ? 'rgba(242, 193, 78, 0.15)' : 'transparent',
                    border: `1px solid ${heroMode === 'fresh' ? 'var(--c-goldBright)' : 'rgba(255,255,255,0.1)'}`,
                    color: heroMode === 'fresh' ? 'var(--c-goldBright)' : C.dim,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontFamily: FONT.condensed,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ⚡ Latest Movement Pulse
                </button>
              </div>
            )}

            {(() => {
              const isHadachek = heroMode === 'hadachek' || !freshStory;
              const link = isHadachek ? '/to/hadachek_v_oregon' : freshStory.link;
              const badge = isHadachek ? 'Field Note • Landmark Legal Analysis' : freshStory.category;
              const badgeColor = isHadachek ? 'var(--c-red)' : 'var(--c-gold)';
              const title = isHadachek ? 'The Anatomy of a Courtroom Battle: Hadachek v. Oregon' : freshStory.title;
              const snippet = isHadachek
                ? 'Inside the landmark Hadachek v. Oregon equal protection proceedings in Portland. While the trial court granted summary judgment on standing, Intact Global and coalition allies have immediately appealed.'
                : freshStory.snippet;
              const bgImg = isHadachek ? '/images/hadachek-hero.jpg' : freshStory.imageUrl;

              return (
                <Link to={link} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} className="lux-hover-lift">
                  <div className="lux-lens" style={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    aspectRatio: '16/9',
                    maxHeight: '620px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '2.5rem',
                    border: '1px solid rgba(212, 160, 48, 0.4)',
                    background: bgImg
                      ? `linear-gradient(to top, rgba(12,12,16,0.97) 0%, rgba(12,12,16,0.72) 42%, rgba(12,12,16,0.22) 75%, rgba(12,12,16,0.1) 100%), url("${bgImg}") center 20%/cover no-repeat var(--c-bgDeep)`
                      : `radial-gradient(ellipse at 85% 20%, rgba(239, 68, 68, 0.16) 0%, transparent 60%), linear-gradient(145deg, rgba(26, 26, 34, 0.98) 0%, rgba(12, 12, 16, 1) 100%)`
                  }}>
                    {isHadachek && (
                      <div style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        zIndex: 3,
                        background: 'rgba(0, 0, 0, 0.65)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        borderRadius: '20px',
                        padding: '0.35rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        color: 'rgba(255, 255, 255, 0.88)',
                        fontSize: '0.72rem',
                        fontFamily: FONT.condensed,
                        fontWeight: 600,
                        letterSpacing: '0.04em'
                      }}>
                        <span>Portland Courthouse • 2nd Trial (On Appeal)</span>
                      </div>
                    )}
                    <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px' }}>
                      <div style={{
                        display: 'inline-block', padding: '0.4rem 1rem', background: badgeColor,
                        color: '#fff', fontFamily: FONT.condensed, fontWeight: 800, fontSize: '0.8rem',
                        letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '4px', marginBottom: '1rem',
                        boxShadow: `0 0 16px ${badgeColor}60`
                      }}>
                        {badge}
                      </div>
                      <h1 style={{
                        fontFamily: FONT.display, fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', 
                        color: '#ffffff', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem',
                        letterSpacing: '-0.02em', textShadow: '0 4px 12px rgba(0,0,0,0.8)'
                      }}>
                        {title}
                      </h1>
                      <p style={{
                        fontFamily: FONT.body, fontSize: 'clamp(0.95rem, 1.8vw, 1.2rem)',
                        color: 'rgba(255,255,255,0.92)', lineHeight: 1.5, marginBottom: '1.5rem',
                        maxWidth: '90%'
                      }}>
                        {snippet}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: C.goldBright, fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                        <span>READ THE FULL NOTE</span>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}

            {/* FEATURED EDITORIAL SPOTLIGHTS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginTop: '1.5rem'
            }}>
              {/* Spotlight 1: Curated Legal Dossier */}
              <div className="lux-lens lux-hover-lift" style={{ borderRadius: '12px', padding: '1.5rem', borderTop: '4px solid var(--c-red, #d94f4f)' }}>
                <div style={{ fontFamily: FONT.condensed, color: 'var(--c-red, #d94f4f)', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                  FEATURED CONSTITUTIONAL DOSSIER
                </div>
                <h3 style={{ fontFamily: FONT.display, fontSize: '1.4rem', color: C.textBright, lineHeight: 1.2, marginBottom: '0.65rem' }}>
                  The FGM Firewall
                </h3>
                <p style={{ fontFamily: FONT.body, fontSize: '0.88rem', color: C.muted, lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Exposing the statutory double standard: why federal and state laws strictly criminalize any non-therapeutic alteration of female minors while leaving male infants legally unprotected.
                </p>
                <Link to="/library?topic=fgm-firewall" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-red, #d94f4f)', textDecoration: 'none', fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.04em' }}>
                  READ LEGAL DOSSIER <ChevronRight size={14} />
                </Link>
              </div>

              {/* Spotlight 2: Clinical Rebuttal Matrix */}
              <div className="lux-lens lux-hover-lift" style={{ borderRadius: '12px', padding: '1.5rem', borderTop: '4px solid var(--c-green, #68b878)' }}>
                <div style={{ fontFamily: FONT.condensed, color: 'var(--c-green, #68b878)', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                  PRACTICAL CLINICAL DEFENSE
                </div>
                <h3 style={{ fontFamily: FONT.display, fontSize: '1.4rem', color: C.textBright, lineHeight: 1.2, marginBottom: '0.65rem' }}>
                  Counter-Evidence Builder
                </h3>
                <p style={{ fontFamily: FONT.body, fontSize: '0.88rem', color: C.muted, lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Equip yourself with peer-reviewed medical literature, anatomical innervation studies, and point-by-point rebuttals to address outdated pediatric cutting justifications with calm confidence.
                </p>
                <Link to="/guides/rebuttals" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-green, #68b878)', textDecoration: 'none', fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.04em' }}>
                  BUILD CLINICAL REBUTTALS <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* SIDEBAR: DAILY DIGEST */}
          <aside style={{ flex: '1 1 30%', minWidth: '300px' }}>
            <div className="lux-lens" style={{
              borderRadius: '16px',
              padding: '1.5rem',
              border: `1px solid ${C.ghost}`,
              position: 'sticky',
              top: '100px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: `1px solid ${C.ghost}`, paddingBottom: '1rem' }}>
                <Newspaper size={20} style={{ color: C.goldBright }} />
                <h2 style={{ fontFamily: FONT.display, fontSize: '1.4rem', color: C.textBright, margin: 0 }}>
                  Field Notes & Headlines
                </h2>
              </div>
              
              {/* Injecting the NewsAggregator directly into the sidebar */}
              <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <NewsAggregator compact={true} />
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: `1px solid ${C.ghost}`, textAlign: 'center' }}>
                <Link to="/news" style={{
                  color: C.goldBright, fontFamily: FONT.condensed, fontWeight: 700,
                  fontSize: '0.85rem', letterSpacing: '0.05em', textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                }}>
                  VIEW FULL ARCHIVE <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </aside>
        </div>


        <SiloGateways />

        {/* ════════════════════════════════════════════════════════════════════
            ONE-CLICK ADVOCACY KITS
            ════════════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={20} style={{ color: C.goldBright }} />
              <span style={{
                fontFamily: FONT.condensed, fontWeight: 800,
                fontSize: '0.85rem', color: C.goldBright,
                letterSpacing: '0.12em', textTransform: 'uppercase'
              }}>
                Curated Parent Kits
              </span>
            </div>
            <h2 style={{ fontFamily: FONT.display, fontSize: '2.2rem', color: C.textBright, marginBottom: '0.75rem' }}>
              "One-Click" Advocacy Briefs
            </h2>
            <p style={{ color: C.muted, fontSize: '1rem', maxWidth: '680px', margin: '0 auto', fontFamily: FONT.body, lineHeight: 1.6 }}>
              Overwhelmed by the data? We have pre-compiled the most undeniable primary sources into beautiful, ready-to-print discussion guides.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            alignItems: 'stretch'
          }}>
            {/* Kit 1 */}
            <Link to="/assistant?kit=expectant" className="lux-lens lux-hover-lift" style={{ borderRadius: '12px', padding: '2rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', border: '1px solid var(--c-ghost)' }}>
              <div style={{ background: 'rgba(212, 160, 48, 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <BookOpen size={24} color={C.goldBright} />
              </div>
              <h3 style={{ fontFamily: FONT.display, fontSize: '1.4rem', color: C.textBright, marginBottom: '0.5rem' }}>The Expectant Parent's Guide</h3>
              <p style={{ fontFamily: FONT.body, color: C.muted, fontSize: '0.9rem', lineHeight: 1.5, flex: 1, marginBottom: '1.5rem' }}>
                A foundational packet of objective physiological facts. Gives you the exact anatomical language needed to make the default choice with confidence.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.goldBright, fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                GENERATE BRIEF <ArrowRight size={14} />
              </div>
            </Link>

            {/* Kit 2 */}
            <Link to="/assistant?kit=pediatrician" className="lux-lens lux-hover-lift" style={{ borderRadius: '12px', padding: '2rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', border: '1px solid var(--c-ghost)' }}>
              <div style={{ background: 'rgba(91, 147, 199, 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <ShieldAlert size={24} color="var(--c-blue)" />
              </div>
              <h3 style={{ fontFamily: FONT.display, fontSize: '1.4rem', color: C.textBright, marginBottom: '0.5rem' }}>The Pediatrician Discussion Kit</h3>
              <p style={{ fontFamily: FONT.body, color: C.muted, fontSize: '0.9rem', lineHeight: 1.5, flex: 1, marginBottom: '1.5rem' }}>
                A highly-cited medical dossier designed to be handed to a hesitant or uninformed doctor to establish a firm boundary regarding intact care.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-blue)', fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                GENERATE BRIEF <ArrowRight size={14} />
              </div>
            </Link>

            {/* Kit 3 */}
            <Link to="/assistant?kit=partner" className="lux-lens lux-hover-lift" style={{ borderRadius: '12px', padding: '2rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', border: '1px solid var(--c-ghost)' }}>
              <div style={{ background: 'rgba(232, 164, 74, 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Users size={24} color="var(--c-orange)" />
              </div>
              <h3 style={{ fontFamily: FONT.display, fontSize: '1.4rem', color: C.textBright, marginBottom: '0.5rem' }}>The Partner Alignment Guide</h3>
              <p style={{ fontFamily: FONT.body, color: C.muted, fontSize: '0.9rem', lineHeight: 1.5, flex: 1, marginBottom: '1.5rem' }}>
                Key resources for couples trying to reach a consensus. Answers the most common cultural questions (like "what if he looks different?") with empathy and data.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-orange)', fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                GENERATE BRIEF <ArrowRight size={14} />
              </div>
            </Link>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            PUBLIC ARCHIVES (Re-exposing Bento Box)
            ════════════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Archive size={20} style={{ color: C.goldBright }} />
              <span style={{
                fontFamily: FONT.condensed, fontWeight: 800,
                fontSize: '0.85rem', color: C.goldBright,
                letterSpacing: '0.12em', textTransform: 'uppercase'
              }}>
                Explore The Public Archives
              </span>
            </div>
            <h2 style={{ fontFamily: FONT.display, fontSize: '2.2rem', color: C.textBright, marginBottom: '0.75rem' }}>
              Deep Dives & Research Tools
            </h2>
            <p style={{ color: C.muted, fontSize: '1rem', maxWidth: '680px', margin: '0 auto', fontFamily: FONT.body, lineHeight: 1.6 }}>
              Access the foundational knowledge graph, specific topic guides, and full interactive datasets from our ongoing inquiries.
            </p>
          </div>
          <BentoBox />
        </div>
        
        {/* ════════════════════════════════════════════════════════════════════
            STRATEGIC PARTNERS & ALLIED COALITIONS
            ════════════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Building2 size={20} style={{ color: C.goldBright }} />
              <span style={{
                fontFamily: FONT.condensed, fontWeight: 800,
                fontSize: '0.85rem', color: C.goldBright,
                letterSpacing: '0.12em', textTransform: 'uppercase'
              }}>
                Strategic Partners & Allied Coalitions
              </span>
            </div>
            <h2 style={{ fontFamily: FONT.display, fontSize: '2.2rem', color: C.textBright, marginBottom: '0.75rem' }}>
              Standing Together for Children's Rights
            </h2>
            <p style={{ color: C.muted, fontSize: '1rem', maxWidth: '680px', margin: '0 auto', fontFamily: FONT.body, lineHeight: 1.6 }}>
              We are proud to collaborate with leading legal defense funds, clinical research groups, and political advocacy organizations.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '2.2rem',
            alignItems: 'start'
          }}>
            {STRATEGIC_PARTNERS.map(partner => (
              <div key={partner.acronym} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'left' }}>
                <a href={partner.url} target="_blank" rel="noreferrer" style={{
                  width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.75rem', padding: '0.75rem', background: '#ffffff', borderRadius: '10px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transition: 'transform 0.25s, box-shadow 0.25s', textDecoration: 'none'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(212,160,48,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}
                >
                  <img src={partner.logo} alt={partner.name} style={{ maxHeight: '110px', maxWidth: '90%', objectFit: 'contain' }} />
                </a>

                <h4 style={{
                  fontFamily: FONT.condensed, fontWeight: 800, fontSize: '1.05rem', color: C.textBright,
                  marginBottom: '1.1rem', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.35,
                  textAlign: 'center', width: '100%'
                }}>
                  <a href={partner.url} target="_blank" rel="noreferrer" style={{ color: C.textBright, textDecoration: 'underline', textUnderlineOffset: '4px', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = C.goldBright} onMouseLeave={e => e.currentTarget.style.color = C.textBright}>
                    {partner.name}
                  </a>
                </h4>
                <p style={{ fontSize: '0.9rem', color: C.text, lineHeight: 1.6, fontFamily: FONT.body, margin: 0, textAlign: 'left' }}>
                  {partner.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Rainbow divider ── */}
        <div style={{ height: 2, background: RAINBOW, borderRadius: 2, opacity: 0.4, marginBottom: '4rem' }} />

        {/* ════════════════════════════════════════════════════════════════════
            URGENT CALL TO ACTION: REGRET PARENTS & LEGAL ADVOCACY
            ════════════════════════════════════════════════════════════════════ */}
        <div className="lux-lens lux-glide-in" style={{
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          background: 'rgba(232, 164, 74, 0.05)',
          border: `1px solid rgba(232, 164, 74, 0.2)`,
          borderRadius: '16px',
          marginBottom: '4rem',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Scale size={22} style={{ color: 'var(--c-orange, #e8a44a)' }} />
            <span style={{
              fontFamily: FONT.condensed, fontWeight: 800,
              fontSize: '0.85rem', color: 'var(--c-orange, #e8a44a)',
              letterSpacing: '0.12em', textTransform: 'uppercase'
            }}>
              ★ Urgent Call to Action: Regret Parents Search ★
            </span>
          </div>

          <h3 style={{ fontFamily: FONT.display, fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', color: C.textBright, marginBottom: '1rem', lineHeight: 1.3 }}>
            Supporting Landmark Equal Protection Legal Initiatives
          </h3>

          <p style={{ color: C.text, fontSize: '0.98rem', lineHeight: 1.65, fontFamily: FONT.body, marginBottom: '1.25rem' }}>
            Our project actively supports legal advocacy efforts alongside leaders from <strong>Intact Global</strong>, <strong>Doctors Opposing Circumcision (DOC)</strong>, <strong>GALDEF</strong>, and the <strong>Washington Initiative for Boys and Men (WIBM)</strong> preparing a historic Equal Protection challenge. To move forward, this legal initiative requires a courageous plaintiff.
          </p>

          <div style={{
            background: 'var(--c-bgDeep)',
            padding: '1.25rem 1.5rem',
            borderRadius: '8px',
            borderLeft: `4px solid var(--c-orange, #e8a44a)`,
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ fontFamily: FONT.condensed, color: C.textBright, margin: '0 0 0.75rem 0', fontSize: '1rem', letterSpacing: '0.05em' }}>
              We are seeking a "regret parent" who meets the following criteria:
            </h4>
            <ul style={{ paddingLeft: '1.25rem', margin: 0, color: C.muted, fontSize: '0.92rem', lineHeight: 1.6, fontFamily: FONT.body }}>
              <li style={{ marginBottom: '0.4rem' }}>You are a parent (or parents) who now regrets the decision to have your son circumcised.</li>
              <li style={{ marginBottom: '0.4rem' }}>Your son was born AND circumcised in <strong>Washington State</strong>.</li>
              <li>The procedure occurred <strong>on or after March 1, 2023</strong>.</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="mailto:tone@circumsurvey.online?subject=Confidential%20Inquiry%20-%20Equal%20Protection" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--c-orange, #e8a44a)', color: 'var(--c-bgDeep)',
                fontFamily: FONT.condensed, fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                padding: '0.65rem 1.4rem', borderRadius: '6px', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                boxShadow: '0 4px 15px rgba(232, 164, 74, 0.3)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(232, 164, 74, 0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(232, 164, 74, 0.3)'; }}
            >
              <Mail size={16} />
              <span>Reach Out Confidentially</span>
            </a>
          </div>
        </div>

        {/* ── Rainbow divider ── */}
        <div style={{ height: 2, background: RAINBOW, borderRadius: 2, opacity: 0.4, marginBottom: '4rem' }} />

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <SignupForm />
        </div>

        {/* ── Rainbow divider ── */}
        <div style={{ height: 2, background: RAINBOW, borderRadius: 2, opacity: 0.4, margin: '5rem 0 4rem' }} />

        {/* ════════════════════════════════════════════════════════════════════
            GRASSROOTS RESEARCH FUNDRAISER & PLEDGE MATCH
            ════════════════════════════════════════════════════════════════════ */}
        <div className="lux-lens lux-glide-in" style={{
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: `1px solid rgba(255, 255, 255, 0.05)`,
          borderRadius: '16px',
          marginBottom: '4rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <HeartHandshake size={22} style={{ color: C.goldBright }} />
            <span style={{
              fontFamily: FONT.condensed, fontWeight: 800,
              fontSize: '0.85rem', color: C.goldBright,
              letterSpacing: '0.12em', textTransform: 'uppercase'
            }}>
              100% Grassroots & Independent Research
            </span>
          </div>
          <h3 style={{ fontFamily: FONT.display, fontSize: '1.5rem', color: C.textBright, marginBottom: '0.75rem' }}>
            Fundraiser & Pledge Match
          </h3>
          <p style={{ color: C.text, fontSize: '0.95rem', lineHeight: 1.65, fontFamily: FONT.body, marginBottom: '1.5rem' }}>
            This inquiry is conducted completely independently without institutional funding. One-time contributions and paid Substack memberships directly match operational costs for our living data pipeline, survey hosting, and Phase 2 AI research tools. Special thanks to founding supporters like David Montane for sustaining this work.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="https://coff.ee/accidental.intactivist" target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: C.goldBright, color: C.bgDeep,
                fontFamily: FONT.condensed, fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                padding: '0.65rem 1.3rem', borderRadius: '6px', textDecoration: 'none', transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Coffee size={16} />
              <span>One-Time Contribution</span>
            </a>
            <a href="https://theaccidentalintactivist.substack.com/subscribe" target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: C.textBright, border: `1px solid ${C.border}`,
                fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                padding: '0.65rem 1.3rem', borderRadius: '6px', textDecoration: 'none', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,160,48,0.1)'; e.currentTarget.style.borderColor = C.goldBright; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; }}
            >
              <BookOpen size={16} />
              <span>Substack Membership</span>
            </a>
          </div>
        </div>
      </main>

      <div style={{ height: 2, background: RAINBOW, marginTop: '4rem' }} />

      <footer style={{
        padding: '2rem', textAlign: 'center', color: C.muted,
        fontSize: '0.85rem', fontFamily: FONT.condensed, letterSpacing: '0.05em'
      }}>
        © {new Date().getFullYear()} THE ACCIDENTAL INTACTIVIST'S INQUIRY // ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
