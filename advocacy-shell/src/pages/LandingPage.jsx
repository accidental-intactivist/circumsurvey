import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SignupForm from '../components/SignupForm';
import HarmonicCanvas from '../components/HarmonicCanvas';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { Database, ShieldAlert, Binary, Sparkles, ExternalLink, ArrowRight, ClipboardPen, Play, Pause, HeartHandshake, Scale, Mail, Coffee, BookOpen, Building2 } from 'lucide-react';
import { C, FONT } from '../styles/tokens';

const RAINBOW = "linear-gradient(90deg, var(--c-red), var(--c-orange, #e8a44a), var(--c-yellow, #e8c868), var(--c-green, #68b878), var(--c-blue))";
const PHASE1_TOTAL = 500;

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
  const themeKey = `${theme}-${mode}`;

  // Detect domain lens dynamically
  const lensInfo = useMemo(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    if (host.includes('info')) {
      return {
        badge: 'MEDICAL & LEGAL RESEARCH LENS',
        tagline: 'Clinical Evidence & International Consensus',
        accent: C.goldBright,
      };
    } else if (host.includes('you')) {
      return {
        badge: 'PERSONAL DISCOVERY & DISCOVERY LENS',
        tagline: 'Anatomy, Autonomy & Individual History',
        accent: C.blue,
      };
    }
    return {
      badge: 'EXPECTANT PARENTS & ADVOCACY GUIDE',
      tagline: 'Navigating Medical Pressure & Protecting Children',
      accent: C.goldBright,
    };
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const [loomPaused, setLoomPaused] = useState(() => {
    try { return localStorage.getItem('cs_loom_paused') === 'true'; } catch { return false; }
  });

  const toggleLoom = useCallback(() => {
    const next = !loomPaused;
    setLoomPaused(next);
    try { localStorage.setItem('cs_loom_paused', String(next)); } catch {}
  }, [loomPaused]);

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
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      position: 'relative',
      zIndex: 1,
      paddingBottom: '4rem'
    }}>

      {/* ════════════════════════════════════════════════════════════════════
          SQUISH MASTHEAD / HERO CONTAINER
          - Height squishes from 580px (full hero) to 64px (sticky navbar) on scroll.
          - Harmonic Loom background fills the header area.
          - Rainbow Line is positioned at the exact bottom edge of the header,
            acting as the border between the Loom/Hero and the 3 boxes below.
          ════════════════════════════════════════════════════════════════════ */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: scrolled ? '64px' : '580px',
        maxHeight: scrolled ? '64px' : '85vh',
        transition: 'height 0.45s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease, backdrop-filter 0.3s ease',
        background: scrolled
          ? 'color-mix(in srgb, var(--c-bg) 92%, transparent)'
          : 'color-mix(in srgb, var(--c-bg) 75%, transparent)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
      }}>

        {/* Clipper wrapper for Harmonic Loom so canvas crops cleanly with header height */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: scrolled ? 0.12 : 0.35,
            transition: 'opacity 0.45s ease',
          }}>
            <HarmonicCanvas position="absolute" opacity={1} themeKey={themeKey} paused={loomPaused} />
          </div>

          {/* Vignette / gradient overlay for readability */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: scrolled
              ? 'transparent'
              : `linear-gradient(180deg, color-mix(in srgb, var(--c-bg) 30%, transparent) 0%, color-mix(in srgb, var(--c-bg) 70%, transparent) 75%, var(--c-bg) 100%)`,
            transition: 'background 0.45s ease',
          }} />
        </div>

        {/* ── Rainbow Line at the EXACT bottom edge of the Harmonic Loom masthead ── */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: RAINBOW,
          zIndex: 50,
        }} />

        {/* ── Top Navigation Bar (Fixed 64px height at top of header) ── */}
        <nav style={{
          position: 'relative', zIndex: 200,
          height: '64px',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{
            maxWidth: '1100px', width: '100%', margin: '0 auto',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            {/* Brand Logo / Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: C.goldBright,
                boxShadow: `0 0 10px ${C.goldBright}`,
                flexShrink: 0
              }} />
              <span style={{
                fontFamily: FONT.condensed, fontWeight: 800,
                fontSize: scrolled ? '0.9rem' : '1rem',
                color: C.textBright, letterSpacing: '0.08em', textTransform: 'uppercase',
                whiteSpace: 'nowrap', transition: 'font-size 0.3s ease'
              }}>
                The Accidental Intactivist <span style={{ color: C.goldBright }}>// Phase 2</span>
              </span>
            </div>

            {/* Right Nav Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <a href="https://intactivist.report" style={{
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
              </a>

              <a href="https://forms.gle/FQ8o9g7j1yU3Cw7n7" target="_blank" rel="noreferrer" style={{
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

              {/* Loom pause/play button */}
              <button onClick={toggleLoom} style={{
                background: 'transparent', border: `1px solid ${C.ghost}`,
                borderRadius: '50%', width: 34, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: C.muted, transition: 'all 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.goldBright}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.ghost}
                aria-label={loomPaused ? 'Play animation' : 'Pause animation'}
              >
                {loomPaused ? <Play size={14} /> : <Pause size={14} />}
              </button>

              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* ── Hero Center Content (inside the squishing masthead) ── */}
        <div style={{
          position: 'relative', zIndex: 10,
          opacity: scrolled ? 0 : 1,
          transform: scrolled ? 'translateY(-30px)' : 'translateY(0)',
          transition: 'opacity 0.35s ease, transform 0.4s ease',
          pointerEvents: scrolled ? 'none' : 'auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          padding: '1.5rem 2rem 2rem',
          height: 'calc(100% - 64px)',
        }}>
          <div style={{ maxWidth: '1000px', width: '100%' }}>
            {/* Domain Lens Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 1.2rem',
              background: 'rgba(212, 160, 48, 0.08)',
              border: `1px solid ${C.border}`, borderRadius: '100px',
              fontSize: '0.75rem', fontFamily: FONT.condensed,
              fontWeight: 800, color: C.goldBright,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
              <Sparkles size={14} style={{ color: C.goldBright }} />
              <span>{lensInfo.badge}</span>
            </div>

            <h1 style={{
              fontFamily: FONT.display,
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 700, color: C.textBright,
              lineHeight: 1.15, letterSpacing: '-0.01em',
              marginBottom: '1.2rem'
            }}>
              The Data is Unassailable.<br />
              <span style={{ color: C.goldBright, fontStyle: 'italic', fontWeight: 400 }}>
                Now Comes the Action.
              </span>
            </h1>

            <p style={{
              fontSize: '1.1rem', color: C.text, fontFamily: FONT.body,
              lineHeight: 1.6, maxWidth: '720px', margin: '0 auto 1.5rem', fontWeight: 300
            }}>
              Building upon the empirical findings of <strong style={{ color: C.textBright }}>The Accidental Intactivist's Inquiry</strong>, Phase 2 turns static evidence into a dynamic, chat-based AI research assistant.
            </p>

            {/* Respondent count & trust indicators */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              fontFamily: FONT.mono, fontSize: '0.82rem', color: C.dim,
              letterSpacing: '0.06em', marginBottom: '1.2rem',
              flexWrap: 'wrap', justifyContent: 'center'
            }}>
              <span style={{
                display: 'inline-block', width: 6, height: 6,
                borderRadius: '50%', background: C.green || '#68b878',
                animation: 'pulse 2s infinite'
              }} />
              <span>{PHASE1_TOTAL}+ RESPONDENTS</span>
              <span style={{ color: C.ghost }}>·</span>
              <span>100+ INTERACTIVE CHARTS</span>
              <span style={{ color: C.ghost }}>·</span>
              <span>PEER-REVIEWED METHODOLOGY</span>
            </div>

            {/* Lens context box — sits right above the bottom Rainbow Line */}
            <div>
              <div style={{
                display: 'inline-block', padding: '0.45rem 1rem',
                borderLeft: `3px solid ${C.goldBright}`,
                background: 'rgba(255,255,255,0.02)',
                textAlign: 'left', maxWidth: '650px',
                fontSize: '0.9rem', color: C.muted,
                fontFamily: FONT.condensed, letterSpacing: '0.04em'
              }}>
                LENS CONTEXT: <span style={{ color: C.textBright }}>{lensInfo.tagline}</span>
              </div>
            </div>
          </div>
        </div>

      </header>

      {/* ════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA (Starts immediately below the Squish Masthead)
          ════════════════════════════════════════════════════════════════════ */}
      <main style={{ maxWidth: '1140px', margin: '0 auto', padding: '3.5rem 2rem 2rem' }}>
        {/* 3 Core Pillar Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.75rem',
          marginBottom: '5rem'
        }}>
          
          {/* Card 1: Living Data Pipeline */}
          <div style={{
            padding: '2.2rem',
            background: C.card,
            border: `1px solid ${C.borderMuted}`,
            borderRadius: '12px',
            transition: 'transform 0.25s, border-color 0.25s',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = C.border;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = C.borderMuted;
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 8,
              background: 'rgba(212, 160, 48, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <Database size={24} style={{ color: C.goldBright }} />
            </div>
            <h3 style={{ fontFamily: FONT.display, fontSize: '1.35rem', color: C.textBright, marginBottom: '0.75rem' }}>
              Living Data Pipeline
            </h3>
            <p style={{ color: C.muted, fontSize: '0.92rem', lineHeight: 1.6, fontFamily: FONT.body }}>
              The survey remains active to continuously aggregate voices from parents, partners, and medical professionals—feeding updated quantitative findings directly into the empirical consensus.
            </p>
          </div>

          {/* Card 2: AI Research Assistant */}
          <Link to="/archive" style={{
            padding: '2.2rem',
            background: C.card,
            border: `1px solid ${C.borderMuted}`,
            borderRadius: '12px',
            textDecoration: 'none',
            display: 'block',
            transition: 'transform 0.25s, border-color 0.25s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = C.border;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = C.borderMuted;
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 8,
              background: 'rgba(66, 165, 245, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <Binary size={24} style={{ color: C.blue }} />
            </div>
            <h3 style={{ fontFamily: FONT.display, fontSize: '1.35rem', color: C.textBright, marginBottom: '0.75rem' }}>
              AI Research Assistant
            </h3>
            <p style={{ color: C.muted, fontSize: '0.92rem', lineHeight: 1.6, fontFamily: FONT.body }}>
              A chat-based AI assistant trained specifically to retrieve international medical consensus (KNMG, Swedish Pediatric Society), statutory case law, and empirical survey cross-tabs.
            </p>
          </Link>

          {/* Card 3: Universal Autonomy & Legal Parity */}
          <div style={{
            padding: '2.2rem',
            background: C.card,
            border: `1px solid ${C.borderMuted}`,
            borderRadius: '12px',
            transition: 'transform 0.25s, border-color 0.25s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = C.border;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = C.borderMuted;
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 8,
              background: 'rgba(229, 57, 53, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <ShieldAlert size={24} style={{ color: C.red }} />
            </div>
            <h3 style={{ fontFamily: FONT.display, fontSize: '1.35rem', color: C.textBright, marginBottom: '0.75rem' }}>
              Universal Autonomy & Legal Parity
            </h3>
            <p style={{ color: C.muted, fontSize: '0.92rem', lineHeight: 1.6, fontFamily: FONT.body }}>
              Exposing medical double standards by applying international bioethical frameworks and child protection standards equally to all children regardless of gender.
            </p>
          </div>

        </div>

        {/* ── Rainbow divider ── */}
        <div style={{ height: 2, background: RAINBOW, borderRadius: 2, opacity: 0.4, marginBottom: '4rem' }} />

        {/* ════════════════════════════════════════════════════════════════════
            STRATEGIC PARTNERS & ALLIED COALITIONS
            Matching exact Google Sites proportions, headlines & verbatim text
            ════════════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: '5rem' }}>
          
          {/* Section Header */}
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

          {/* 4-Column Partner Grid matching exact proportions from screenshot */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '2.2rem',
            alignItems: 'start'
          }}>
            {STRATEGIC_PARTNERS.map(partner => (
              <div
                key={partner.acronym}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'left'
                }}
              >
                {/* Large Proportional Logo Container */}
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: '100%',
                    height: '140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.75rem',
                    padding: '0.75rem',
                    background: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    transition: 'transform 0.25s, box-shadow 0.25s',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(212,160,48,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                  }}
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    style={{
                      maxHeight: '110px',
                      maxWidth: '90%',
                      objectFit: 'contain'
                    }}
                  />
                </a>

                {/* Bold Underlined Headline matching original Google Sites style */}
                <h4 style={{
                  fontFamily: FONT.condensed,
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: C.textBright,
                  marginBottom: '1.1rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  lineHeight: 1.35,
                  textAlign: 'center',
                  width: '100%'
                }}>
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: C.textBright,
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = C.goldBright}
                    onMouseLeave={e => e.currentTarget.style.color = C.textBright}
                  >
                    {partner.name}
                  </a>
                </h4>

                {/* Specific Verbatim Paragraph Body */}
                <p style={{
                  fontSize: '0.9rem',
                  color: C.text,
                  lineHeight: 1.6,
                  fontFamily: FONT.body,
                  margin: 0,
                  textAlign: 'left'
                }}>
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
        <div style={{
          padding: '2.5rem',
          background: 'rgba(232, 164, 74, 0.05)',
          border: `1px solid rgba(232, 164, 74, 0.3)`,
          borderRadius: '12px',
          marginBottom: '4rem',
          position: 'relative'
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

          <h3 style={{ fontFamily: FONT.display, fontSize: '1.6rem', color: C.textBright, marginBottom: '1rem', lineHeight: 1.3 }}>
            Supporting Landmark Equal Protection Legal Initiatives
          </h3>

          <p style={{ color: C.text, fontSize: '0.98rem', lineHeight: 1.65, fontFamily: FONT.body, marginBottom: '1.25rem' }}>
            Our project actively supports legal advocacy efforts alongside leaders from <strong>Intact Global</strong>, <strong>Doctors Opposing Circumcision (DOC)</strong>, <strong>GALDEF</strong>, and the <strong>Washington Initiative for Boys and Men (WIBM)</strong> preparing a historic Equal Protection challenge. To move forward, this legal initiative requires a courageous plaintiff.
          </p>

          {/* Partner logo row in CTA */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
            padding: '1rem 1.25rem',
            background: 'var(--c-bgDeep)',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: `1px solid ${C.ghost}`
          }}>
            <span style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.75rem', color: C.dim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Coalition Partners:
            </span>
            {STRATEGIC_PARTNERS.map(p => (
              <a key={p.acronym} href={p.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', background: '#fff', padding: '3px 8px', borderRadius: '4px' }}>
                <img
                  src={p.logo}
                  alt={p.name}
                  title={p.name}
                  style={{ height: '26px', maxWidth: '100px', objectFit: 'contain' }}
                />
              </a>
            ))}
          </div>

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
            <a
              href="mailto:tone@circumsurvey.online?subject=Confidential%20Inquiry%20-%20Equal%20Protection"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--c-orange, #e8a44a)', color: 'var(--c-bgDeep)',
                fontFamily: FONT.condensed, fontWeight: 800,
                fontSize: '0.95rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                padding: '0.65rem 1.4rem', borderRadius: '6px', textDecoration: 'none',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Mail size={16} />
              <span>Reach Out Confidentially</span>
            </a>

            <a
              href="https://forms.gle/FQ8o9g7j1yU3Cw7n7"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'transparent', color: C.textBright,
                border: `1px solid ${C.border}`,
                fontFamily: FONT.condensed, fontWeight: 700,
                fontSize: '0.95rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                padding: '0.65rem 1.4rem', borderRadius: '6px', textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = C.goldBright; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; }}
            >
              <ClipboardPen size={16} />
              <span>Share Experience in Anonymous Survey</span>
            </a>
          </div>
        </div>

        {/* ── Rainbow divider ── */}
        <div style={{ height: 2, background: RAINBOW, borderRadius: 2, opacity: 0.4, marginBottom: '4rem' }} />

        {/* Waitlist Section */}
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <SignupForm />
        </div>

        {/* ── Rainbow divider ── */}
        <div style={{ height: 2, background: RAINBOW, borderRadius: 2, opacity: 0.4, margin: '5rem 0 4rem' }} />

        {/* ════════════════════════════════════════════════════════════════════
            GRASSROOTS RESEARCH FUNDRAISER & PLEDGE MATCH
            ════════════════════════════════════════════════════════════════════ */}
        <div style={{
          padding: '2.5rem',
          background: C.card,
          border: `1px solid ${C.borderMuted}`,
          borderRadius: '12px',
          marginBottom: '4rem',
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
            <a
              href="https://coff.ee/accidental.intactivist"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: C.goldBright, color: C.bgDeep,
                fontFamily: FONT.condensed, fontWeight: 800,
                fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                padding: '0.65rem 1.3rem', borderRadius: '6px', textDecoration: 'none',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Coffee size={16} />
              <span>One-Time Contribution</span>
            </a>

            <a
              href="https://theaccidentalintactivist.substack.com/subscribe"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'transparent', color: C.textBright,
                border: `1px solid ${C.border}`,
                fontFamily: FONT.condensed, fontWeight: 700,
                fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                padding: '0.65rem 1.3rem', borderRadius: '6px', textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,160,48,0.1)'; e.currentTarget.style.borderColor = C.goldBright; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; }}
            >
              <BookOpen size={16} />
              <span>Substack Membership</span>
            </a>
          </div>
        </div>

        {/* ── Rainbow divider ── */}
        <div style={{ height: 2, background: RAINBOW, borderRadius: 2, opacity: 0.4, marginBottom: '4rem' }} />

        {/* Phase 1 Cross-Link Footer CTA */}
        <div style={{
          padding: '2.5rem',
          background: 'rgba(212, 160, 48, 0.04)',
          border: `1px solid ${C.border}`,
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontFamily: FONT.display, fontSize: '1.6rem', color: C.goldBright, marginBottom: '0.75rem' }}>
            Haven't Explored the Data Yet?
          </h3>
          <p style={{ color: C.text, fontSize: '1rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 1.5rem', fontFamily: FONT.body }}>
            Phase 1 is live with 100+ interactive charts, participant narratives, and international medical policy comparisons.
          </p>
          <a
            href="https://intactivist.report"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              background: C.goldBright, color: C.bg,
              fontFamily: FONT.condensed, fontWeight: 800,
              fontSize: '1.1rem', letterSpacing: '0.05em', textTransform: 'uppercase',
              padding: '0.8rem 2rem', borderRadius: '6px', textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(212,160,48,0.25)', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span>Launch Special Report Data Explorer</span>
            <ArrowRight size={18} />
          </a>
        </div>

      </main>

      {/* ── Rainbow rule above footer ── */}
      <div style={{ height: 2, background: RAINBOW, marginTop: '4rem' }} />

      <footer style={{
        padding: '2rem',
        textAlign: 'center', color: C.muted,
        fontSize: '0.85rem', fontFamily: FONT.condensed,
        letterSpacing: '0.05em'
      }}>
        © {new Date().getFullYear()} THE ACCIDENTAL INTACTIVIST'S INQUIRY // ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
