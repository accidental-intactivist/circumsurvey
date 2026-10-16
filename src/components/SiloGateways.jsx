import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Compass, Globe, Newspaper, Sparkles, ArrowRight, 
  Scale, Shield, FileText, ChevronRight 
} from 'lucide-react';
import { C, FONT } from '../styles/tokens';

const SILOS = [
  {
    id: 'library',
    kicker: '195,000+ PRIMARY SOURCES',
    title: 'Digital Archive & Exhibits',
    tagline: 'The Definitive Research Vault',
    desc: 'Explore historical literature, constitutional briefs, anatomical studies, and landmark curated exhibits like the Tim Hammond Archive (UMass MS 1205).',
    link: '/library',
    actionText: 'Enter Archive',
    color: 'var(--c-red, #d94f4f)',
    accentBg: 'rgba(217, 79, 79, 0.12)',
    borderHover: 'rgba(217, 79, 79, 0.45)',
    icon: BookOpen,
    quickLinks: [
      { label: 'Tim Hammond Archive (MS 1205)', path: '/collections/tim-hammond-archive' },
      { label: 'Hadachek v. Oregon', path: '/to/hadachek_v_oregon' },
      { label: 'Special Collections Index', path: '/collections' }
    ]
  },
  {
    id: 'guides',
    kicker: 'DECISION & DEFENSE MANUALS',
    title: 'Interactive Field Guides',
    tagline: 'Actionable Guidance Toolkits',
    desc: 'Personalized, evidence-based toolkits for expectant parents, men navigating restoration, and addressing circumcision grief.',
    link: '/guides',
    actionText: 'Explore Guides',
    color: 'var(--c-green, #68b878)',
    accentBg: 'rgba(104, 184, 120, 0.12)',
    borderHover: 'rgba(104, 184, 120, 0.45)',
    icon: Compass,
    quickLinks: [
      { label: 'Expectant Parents Guide', path: '/to/parents' },
      { label: 'Restoration Roadmap', path: '/to/restoration' },
      { label: 'Counter-Evidence Matrix', path: '/guides/rebuttals' }
    ]
  },
  {
    id: 'atlas',
    kicker: 'GLOBAL SURVEILLANCE & DATA',
    title: 'Global Atlas & Evidence Web',
    tagline: 'Worldwide Legal & Clinical Data',
    desc: 'Interactive world map tracking national cutting prevalence, statutory bans, and academic citation networks exposing medical misinformation.',
    link: '/atlas',
    actionText: 'Open Atlas',
    color: 'var(--c-blue, #5b93c7)',
    accentBg: 'rgba(91, 147, 199, 0.12)',
    borderHover: 'rgba(91, 147, 199, 0.45)',
    icon: Globe,
    quickLinks: [
      { label: 'Interactive World Map', path: '/atlas' },
      { label: 'Citation Web', path: '/citations' },
      { label: 'Global Knowledge Graph', path: '/graph' }
    ]
  },
  {
    id: 'media',
    kicker: 'REAL-TIME MOVEMENT PULSE',
    title: 'Dispatches & Headlines',
    tagline: 'Investigative Frontline Coverage',
    desc: 'Daily investigative journalism, podcast field notes, courtroom reporting, and real-time news aggregation from around the world.',
    link: '/news',
    actionText: 'Read Dispatches',
    color: 'var(--c-orange, #e8a44a)',
    accentBg: 'rgba(232, 164, 74, 0.12)',
    borderHover: 'rgba(232, 164, 74, 0.45)',
    icon: Newspaper,
    quickLinks: [
      { label: 'Latest Field Notes', path: '/news' },
      { label: 'Courtroom Briefs', path: '/to/hadachek_v_oregon' },
      { label: 'Media Intelligence', path: '/news' }
    ]
  },
  {
    id: 'manifesto',
    kicker: 'ETHICAL FOUNDATION',
    title: "The Accidental Intactivist's Manifesto",
    tagline: 'Exposing the Monster We Agree Not to See',
    desc: 'The landmark philosophical declaration establishing unconditional bodily integrity as an inalienable right, curated with 11 analytical corridors and 3,200+ primary citations.',
    link: '/manifesto',
    actionText: 'Enter Manifesto Portal',
    color: 'var(--c-gold, #d4a030)',
    accentBg: 'rgba(212, 160, 48, 0.12)',
    borderHover: 'rgba(212, 160, 48, 0.45)',
    icon: Sparkles,
    quickLinks: [
      { label: 'Exhibition Portal', path: '/manifesto' },
      { label: 'Figure I.i: Transparent Monster', path: '/manifesto?chapter=1' },
      { label: 'Archival Compendium (Sec. XI)', path: '/manifesto?chapter=compendium' }
    ]
  }
];

export default function SiloGateways() {
  return (
    <section 
      id="movement-silos-section"
      style={{
        marginTop: '1rem',
        marginBottom: '4.5rem',
        width: '100%'
      }}
    >
      {/* ── Section Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.6rem', 
          marginBottom: '0.6rem',
          padding: '0.3rem 0.85rem',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Five color dots representing the core silos */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {SILOS.map(s => (
              <span 
                key={s.id} 
                style={{ 
                  width: '7px', 
                  height: '7px', 
                  borderRadius: '50%', 
                  background: s.color 
                }} 
              />
            ))}
          </div>
          <span style={{
            fontFamily: FONT.condensed,
            fontWeight: 800,
            fontSize: '0.8rem',
            color: 'var(--c-textBright, #fff)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}>
            Five Core Gateways
          </span>
        </div>

        <h2 style={{
          fontFamily: FONT.display,
          fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)',
          color: C.textBright,
          letterSpacing: '-0.02em',
          margin: '0 0 0.6rem 0'
        }}>
          The Pillars of the Movement
        </h2>
        <p style={{
          color: C.muted,
          fontSize: '0.95rem',
          maxWidth: '680px',
          margin: '0 auto',
          fontFamily: FONT.body,
          lineHeight: 1.5
        }}>
          Explore our foundational primary archives, interactive decision guides, global legal atlas, investigative dispatches, and ethical philosophy.
        </p>
      </div>

      {/* ── Responsive Styling ── */}
      <style>{`
        @media (min-width: 1100px) {
          .silo-gateways-grid {
            grid-template-columns: repeat(5, 1fr) !important;
          }
        }
        @media (max-width: 1099px) and (min-width: 768px) {
          .silo-gateways-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 767px) {
          .silo-gateways-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ── 5-Silo Responsive Grid ── */}
      <div 
        className="silo-gateways-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.1rem',
          alignItems: 'stretch'
        }}
      >
        {SILOS.map((silo) => {
          const Icon = silo.icon;
          return (
            <div
              key={silo.id}
              className="lux-lens lux-hover-lift"
              style={{
                borderRadius: '12px',
                padding: '1.35rem 1.15rem',
                border: '1px solid var(--c-ghost, rgba(255, 255, 255, 0.08))',
                borderTop: `4px solid ${silo.color}`,
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(180deg, rgba(22, 22, 28, 0.75) 0%, rgba(14, 14, 18, 0.9) 100%)',
                backdropFilter: 'blur(12px)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = silo.borderHover;
                e.currentTarget.style.boxShadow = `0 14px 32px rgba(0, 0, 0, 0.35), 0 0 20px ${silo.accentBg}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--c-ghost, rgba(255, 255, 255, 0.08))';
                e.currentTarget.style.borderTopColor = silo.color;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Top Row: Icon + Kicker */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: silo.accentBg,
                  border: `1px solid ${silo.color}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: silo.color
                }}>
                  <Icon size={18} />
                </div>
                <span style={{
                  fontFamily: FONT.condensed,
                  fontWeight: 800,
                  fontSize: '0.64rem',
                  letterSpacing: '0.08em',
                  color: silo.color,
                  textTransform: 'uppercase'
                }}>
                  {silo.kicker}
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 style={{
                fontFamily: FONT.display,
                fontSize: '1.18rem',
                color: C.textBright,
                margin: '0 0 0.2rem 0',
                lineHeight: 1.25
              }}>
                {silo.title}
              </h3>
              <div style={{
                fontSize: '0.72rem',
                color: silo.color,
                fontWeight: 600,
                fontFamily: FONT.condensed,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem'
              }}>
                {silo.tagline}
              </div>

              {/* Description */}
              <p style={{
                fontFamily: FONT.body,
                fontSize: '0.84rem',
                color: C.muted,
                lineHeight: 1.45,
                margin: '0 0 1.1rem 0',
                flex: 1
              }}>
                {silo.desc}
              </p>

              {/* Quick Jump Shortcuts */}
              <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                paddingTop: '0.65rem',
                marginBottom: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>
                {silo.quickLinks.map((ql, idx) => (
                  <Link
                    key={idx}
                    to={ql.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.74rem',
                      color: 'var(--c-dim, #888)',
                      textDecoration: 'none',
                      fontFamily: FONT.body,
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = silo.color}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-dim, #888)'}
                  >
                    <ChevronRight size={11} style={{ color: silo.color, flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ql.label}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Primary Call to Action Link */}
              <Link
                to={silo.link}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.4rem',
                  textDecoration: 'none',
                  background: silo.accentBg,
                  border: `1px solid ${silo.color}44`,
                  color: silo.color,
                  padding: '0.5rem 0.8rem',
                  borderRadius: '6px',
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease',
                  marginTop: 'auto'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = silo.color;
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = silo.accentBg;
                  e.currentTarget.style.color = silo.color;
                }}
              >
                <span>{silo.actionText}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
