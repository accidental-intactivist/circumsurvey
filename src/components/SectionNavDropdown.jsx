import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { C, FONT } from '../styles/tokens';
import { ChevronDown, BookOpen, Compass, GitBranch, Newspaper, Sparkles, Home } from 'lucide-react';

const MAIN_SECTIONS = [
  {
    id: 'home',
    label: 'Home & Overview',
    path: '/',
    color: C.gold,
    icon: Home,
    sublabel: 'The Movement Hub'
  },
  {
    id: 'library',
    label: 'Library',
    path: '/library',
    color: '#ef4444',
    icon: BookOpen,
    sublabel: 'The Tim Hammond Collection'
  },
  {
    id: 'guides',
    label: 'Guides',
    path: '/guides',
    color: '#10b981',
    icon: Compass,
    sublabel: 'Field Manuals & Defense'
  },
  {
    id: 'data',
    label: 'Data',
    path: '/explore',
    color: '#38bdf8',
    icon: GitBranch,
    sublabel: 'Live Survey & Findings'
  },
  {
    id: 'media',
    label: 'Media',
    path: '/news',
    color: '#e8a44a',
    icon: Newspaper,
    sublabel: 'Field Notes & Headlines'
  },
  {
    id: 'manifesto',
    label: 'Manifesto',
    path: '/manifesto',
    color: '#d4a030',
    icon: Sparkles,
    sublabel: 'Our Core Mission'
  }
];

function getActiveSection(pathname) {
  if (pathname === '/') return MAIN_SECTIONS[0];
  if (pathname.startsWith('/to/hadachek') || pathname.startsWith('/exhibits/')) return MAIN_SECTIONS[1];
  if (pathname.startsWith('/library') || pathname.startsWith('/collections') || pathname.startsWith('/timeline')) return MAIN_SECTIONS[1];
  if (pathname.startsWith('/guides') || pathname.startsWith('/to/parents') || pathname.startsWith('/to/restoration') || pathname.startsWith('/to/grief')) return MAIN_SECTIONS[2];
  if (pathname.startsWith('/to/')) return MAIN_SECTIONS[1];
  if (pathname.startsWith('/explore') || pathname.startsWith('/survey-stats') || pathname.startsWith('/graph') || pathname.startsWith('/citations') || pathname.startsWith('/atlas')) return MAIN_SECTIONS[3];
  if (pathname.startsWith('/news')) return MAIN_SECTIONS[4];
  if (pathname.startsWith('/manifesto')) return MAIN_SECTIONS[5];
  return {
    id: 'custom',
    label: 'Main Section',
    path: '#',
    color: C.gold,
    icon: Compass,
    sublabel: 'Navigation'
  };
}

export default function SectionNavDropdown({ activeSectionOverride = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  const currentSection = activeSectionOverride || getActiveSection(location.pathname);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Supertitle Brand */}
      <Link 
        to="/" 
        style={{ 
          textDecoration: 'none',
          display: 'block'
        }}
      >
        <span style={{
          fontFamily: FONT.condensed,
          fontWeight: 700,
          fontSize: '0.58rem',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: C.dim,
          lineHeight: 1,
          display: 'block',
          marginBottom: '0.15rem',
          transition: 'color 0.2s ease'
        }}>
          The Accidental Intactivist's Guide
        </span>
      </Link>

      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0.1rem 0.2rem',
          margin: 0,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          textAlign: 'left'
        }}
        title="Switch section"
        aria-expanded={isOpen}
      >
        {/* Glowing Pip in Section Color */}
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: currentSection.color,
          boxShadow: `0 0 10px ${currentSection.color}, 0 0 4px ${currentSection.color}`,
          flexShrink: 0
        }} />

        <span style={{
          fontFamily: FONT.condensed,
          fontWeight: 800,
          fontSize: '1rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: C.textBright,
          lineHeight: 1
        }}>
          {currentSection.label}
        </span>

        <ChevronDown 
          size={13} 
          color={C.dim} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.2s ease',
            opacity: 0.8
          }} 
        />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          zIndex: 2000,
          minWidth: '260px',
          background: '#090f15',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          padding: '0.45rem',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.95), 0 0 24px rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{
            fontSize: '0.62rem',
            fontFamily: FONT.condensed,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: C.dim,
            padding: '0.35rem 0.65rem 0.5rem 0.65rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '0.35rem'
          }}>
            Main Sections
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {MAIN_SECTIONS.map((sec) => {
              const isSelected = sec.id === currentSection.id;
              const SecIcon = sec.icon;
              return (
                <Link
                  key={sec.id}
                  to={sec.path}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.55rem 0.65rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    background: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                    border: isSelected ? `1px solid ${sec.color}40` : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isSelected ? 'rgba(255, 255, 255, 0.06)' : 'transparent';
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: `${sec.color}18`,
                    border: `1px solid ${sec.color}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: sec.color,
                    flexShrink: 0
                  }}>
                    <SecIcon size={15} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: FONT.condensed,
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: isSelected ? sec.color : C.textBright,
                      lineHeight: 1.1
                    }}>
                      {sec.label}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: C.dim,
                      lineHeight: 1.2,
                      marginTop: '0.15rem'
                    }}>
                      {sec.sublabel}
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: sec.color,
                      boxShadow: `0 0 8px ${sec.color}`
                    }} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
