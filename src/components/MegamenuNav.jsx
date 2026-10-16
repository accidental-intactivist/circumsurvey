import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { C, FONT } from '../styles/tokens';
import { Search, ArrowRight, BookOpen, Shield, ChevronRight, Archive } from 'lucide-react';
import { resolveItemRoute } from '../utils/routing';
import LoomChoreography from './GuidedTour/LoomChoreography';

function SankeyConnector({ activeMenu, columns, tabRef, containerRef, hoveredCol, setHoveredCol }) {
  const [coords, setCoords] = useState(null);
  const svgH = 60;

  useEffect(() => {
    const compute = () => {
      if (!tabRef?.current || !containerRef?.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const tabRect = tabRef.current.getBoundingClientRect();
      
      const tabL = tabRect.left - containerRect.left;
      const tabW = tabRect.width;
      const containerW = containerRect.width;
      
      const colCoords = columns.map(col => {
        const el = document.getElementById(`megamenu-col-${col.id}`);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          left: rect.left - containerRect.left,
          right: rect.right - containerRect.left,
          width: rect.width
        };
      });
      
      setCoords({
        containerW,
        tabL,
        tabW,
        columns: colCoords
      });
    };

    compute();
    const timer = setTimeout(compute, 40);
    window.addEventListener('resize', compute);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', compute);
    };
  }, [activeMenu, columns, tabRef, containerRef]);

  if (!coords) return null;

  const N = columns.length;
  const cp1Y = svgH * 0.42;
  const cp2Y = svgH * 0.58;

  return (
    <div style={{ 
      width: '100%', 
      height: `${svgH}px`, 
      position: 'relative', 
      overflow: 'visible', 
      pointerEvents: 'none',
      background: 'linear-gradient(180deg, rgba(9, 15, 21, 0.98) 0%, #090f15 100%)',
      backdropFilter: 'blur(20px)'
    }}>
      <svg 
        viewBox={`0 0 ${coords.containerW} ${svgH}`} 
        preserveAspectRatio="none"
        style={{ width: '100%', height: `${svgH}px`, overflow: 'visible', display: 'block' }}
      >
        <defs>
          {columns.map(col => (
            <linearGradient id={`sankey-grad-${col.id}`} x1="0" y1="0" x2="0" y2="1" key={col.id}>
              <stop offset="0%" stopColor={col.gradient[0]} stopOpacity="0.85" />
              <stop offset="55%" stopColor={col.gradient[1]} stopOpacity="0.6" />
              <stop offset="100%" stopColor={col.gradient[1]} stopOpacity="0.9" />
            </linearGradient>
          ))}
          <filter id="sankey-ribbon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {columns.map((col, i) => {
          const colCoord = coords.columns[i];
          if (!colCoord) return null;

          const topSliceW = coords.tabW / N;
          const topL = coords.tabL + i * topSliceW;
          const topR = coords.tabL + (i + 1) * topSliceW;
          const botL = colCoord.left;
          const botR = colCoord.right;

          const d = `
            M ${topL} 0
            C ${topL} ${cp1Y}, ${botL} ${cp2Y}, ${botL} ${svgH}
            L ${botR} ${svgH}
            C ${botR} ${cp2Y}, ${topR} ${cp1Y}, ${topR} 0
            Z
          `;

          const isHovered = hoveredCol === i;
          const opacity = hoveredCol === null ? 0.75 : (isHovered ? 0.95 : 0.25);

          return (
            <g 
              key={col.id} 
              style={{ transition: 'opacity 0.2s ease', pointerEvents: 'auto', cursor: 'pointer' }}
              onMouseEnter={() => setHoveredCol(i)}
              onMouseLeave={() => setHoveredCol(null)}
            >
              <path
                d={d}
                fill={`url(#sankey-grad-${col.id})`}
                opacity={opacity}
                stroke={col.color}
                strokeWidth={isHovered ? 1.5 : 0.75}
                strokeOpacity={isHovered ? 0.95 : 0.4}
                filter={isHovered ? 'url(#sankey-ribbon-glow)' : 'none'}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function MegamenuNav({ isCompact = false, activeLand = null }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoveredCol, setHoveredCol] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  
  const navWrapperRef = useRef(null);
  const dropdownContainerRef = useRef(null);
  
  const tabRefs = {
    library: useRef(null),
    guides: useRef(null),
    data: useRef(null),
    media: useRef(null),
    manifesto: useRef(null)
  };

  useEffect(() => {
    fetch('/api/cms?types=external_news,essay,recap,internal_news&limit=3')
      .then(res => res.json())
      .then(data => setLatestNews(data.data || data))
      .catch(console.error);
  }, []);

  const handleMouseEnter = (menu) => {
    setActiveMenu(menu);
    setHoveredCol(null);
  };
  const handleMouseLeave = () => {
    setActiveMenu(null);
    setHoveredCol(null);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // DISTINCT COLOR-CODED LANDS:
  // 1. Library   → RED / CRIMSON (#ef4444)
  // 2. Guides    → EMERALD / FOREST GREEN (#10b981)
  // 3. Data      → ELECTRIC CYAN / SAPPHIRE BLUE (#38bdf8)
  // 4. Media     → RADIANT AMBER / GOLD (#f59e0b)
  // 5. Manifesto → IMPERIAL PURPLE / AMETHYST (#a855f7)
  // ══════════════════════════════════════════════════════════════════════════
  const MENU_CONFIG = {
    library: {
      label: 'LIBRARY',
      sublabel: 'THE TIM HAMMOND COLLECTION',
      link: '/library',
      color: '#ef4444', // Red / Crimson
      columns: [
        {
          id: 'collections',
          title: 'Core Collections',
          badge: 'Archive Index',
          color: '#ef4444',
          gradient: ['#ef4444', '#f87171'],
          flex: 1,
          render: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <Link to="/collections" onClick={handleMouseLeave} className="lux-hover-bright" style={{ color: 'var(--c-goldBright)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                Special Collections Index <ArrowRight size={13} />
              </Link>
              <Link to="/library?topic=legislation" onClick={handleMouseLeave} className="lux-hover-bright" style={{ color: C.dim, textDecoration: 'none' }}>Legislation Tracker</Link>
              <Link to="/library?topic=medical" onClick={handleMouseLeave} className="lux-hover-bright" style={{ color: C.dim, textDecoration: 'none' }}>Medical Journals</Link>
              <Link to="/library?topic=policy" onClick={handleMouseLeave} className="lux-hover-bright" style={{ color: C.dim, textDecoration: 'none' }}>Policy Guidelines</Link>
              <Link to="/entities" onClick={handleMouseLeave} className="lux-hover-bright" style={{ color: C.dim, textDecoration: 'none' }}>Directory of Key Figures</Link>
            </div>
          )
        },
        {
          id: 'exhibits',
          title: 'Curated Exhibits',
          badge: 'Featured',
          color: '#dc2626',
          gradient: ['#ef4444', '#dc2626'],
          flex: 1.15,
          render: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/collections/tim-hammond-archive" onClick={handleMouseLeave} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none', background: 'rgba(212, 160, 48, 0.1)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(212, 160, 48, 0.35)', boxShadow: '0 4px 15px rgba(212, 160, 48, 0.12)' }} className="lux-hover-lift">
                <div style={{ flexShrink: 0, width: '36px', height: '36px', background: 'rgba(212, 160, 48, 0.15)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-goldBright)' }}>
                  <Archive size={18} />
                </div>
                <div>
                  <div style={{ color: 'var(--c-goldBright)', fontWeight: 'bold', fontSize: '0.92rem' }}>Tim Hammond Archive</div>
                  <div style={{ color: C.dim, fontSize: '0.76rem' }}>UMass MS 1205 • 195,000+ Records</div>
                </div>
              </Link>
              <Link to="/to/hadachek_v_oregon" onClick={handleMouseLeave} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none', background: 'rgba(239, 68, 68, 0.06)', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.22)' }} className="lux-hover-lift">
                <div style={{ flexShrink: 0, width: '36px', height: '36px', background: 'var(--c-bgSoft)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <BookOpen size={18} />
                </div>
                <div>
                  <div style={{ color: C.textBright, fontWeight: 'bold', fontSize: '0.9rem' }}>Hadachek v. Oregon</div>
                  <div style={{ color: C.dim, fontSize: '0.76rem' }}>Equal Protection Civil Rights</div>
                </div>
              </Link>
              <Link to="/library?topic=fgm-firewall" onClick={handleMouseLeave} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none', background: 'rgba(239, 68, 68, 0.06)', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.22)' }} className="lux-hover-lift">
                <div style={{ flexShrink: 0, width: '36px', height: '36px', background: 'var(--c-bgSoft)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                  <Shield size={18} />
                </div>
                <div>
                  <div style={{ color: C.textBright, fontWeight: 'bold', fontSize: '0.9rem' }}>The FGM Firewall</div>
                  <div style={{ color: C.dim, fontSize: '0.76rem' }}>Exposing the double standards</div>
                </div>
              </Link>
            </div>
          )
        },
        {
          id: 'assistant',
          title: 'AI Research Vault',
          badge: 'Ask Assistant',
          color: '#f43f5e',
          gradient: ['#ef4444', '#f43f5e'],
          flex: 1.1,
          render: (
            <div style={{ background: 'rgba(239, 68, 68, 0.07)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.25)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: C.textBright, fontSize: '0.92rem', margin: '0 0 0.5rem 0', lineHeight: 1.45, fontWeight: 600 }}>
                  Search the world's largest indexed collection of genital autonomy documents using natural language.
                </p>
                <p style={{ color: C.dim, fontSize: '0.8rem', margin: 0, lineHeight: 1.4 }}>
                  Synthesizes evidence from litigation, medical studies, and historical records.
                </p>
              </div>
              <Link to="/library" onClick={handleMouseLeave} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem', marginTop: '1rem', alignSelf: 'flex-start' }} className="lux-hover-lift">
                <Search size={14} /> Open the Vault
              </Link>
            </div>
          )
        }
      ]
    },
    guides: {
      label: 'GUIDES',
      sublabel: 'FIELD MANUALS',
      link: '/guides',
      color: '#10b981', // Emerald Green
      columns: [
        {
          id: 'knowledge',
          title: 'Action Manuals',
          badge: 'Overview',
          color: '#10b981',
          gradient: ['#10b981', '#34d399'],
          flex: 1,
          render: (
            <div style={{ paddingRight: '0.5rem' }}>
              <p style={{ color: C.dim, fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.2rem' }}>
                We transform static advice into interactive journeys. Navigate the hospital, process grief, or explore physical restoration.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <Link to="/guides" onClick={handleMouseLeave} style={{ color: '#10b981', textDecoration: 'none', fontFamily: FONT.condensed, fontWeight: 700, letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  VIEW ALL GUIDES <ArrowRight size={15} />
                </Link>
                <Link to="/guides/rebuttals" onClick={handleMouseLeave} style={{ color: '#34d399', textDecoration: 'none', fontFamily: FONT.condensed, fontWeight: 700, letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  COUNTER-EVIDENCE BUILDER <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )
        },
        {
          id: 'parents',
          title: 'For Parents',
          badge: 'Hospital Defense',
          color: '#059669',
          gradient: ['#10b981', '#059669'],
          flex: 0.9,
          render: (
            <Link to="/to/parents" onClick={handleMouseLeave} className="lux-hover-lift" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textDecoration: 'none', background: 'rgba(16, 185, 129, 0.07)', border: '1px solid rgba(16, 185, 129, 0.22)', padding: '1.15rem', borderRadius: '12px', height: '100%' }}>
              <div style={{ color: C.dim, fontSize: '0.85rem', lineHeight: 1.5 }}>
                Navigating the hospital, defending the prepuce, and confronting family pressure.
              </div>
              <div style={{ color: '#10b981', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.85rem' }}>
                Explore Guide <ChevronRight size={14} />
              </div>
            </Link>
          )
        },
        {
          id: 'restoration',
          title: 'Foreskin Restoration',
          badge: 'Physical Recovery',
          color: '#14b8a6',
          gradient: ['#10b981', '#14b8a6'],
          flex: 0.9,
          render: (
            <Link to="/to/restoration" onClick={handleMouseLeave} className="lux-hover-lift" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textDecoration: 'none', background: 'rgba(20, 184, 166, 0.07)', border: '1px solid rgba(20, 184, 166, 0.22)', padding: '1.15rem', borderRadius: '12px', height: '100%' }}>
              <div style={{ color: C.dim, fontSize: '0.85rem', lineHeight: 1.5 }}>
                A step-by-step visual exploration of physical and psychological recovery.
              </div>
              <div style={{ color: '#14b8a6', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.85rem' }}>
                Explore Guide <ChevronRight size={14} />
              </div>
            </Link>
          )
        },
        {
          id: 'grief',
          title: 'Grief & Processing',
          badge: 'Psych Support',
          color: '#047857',
          gradient: ['#10b981', '#047857'],
          flex: 0.9,
          render: (
            <Link to="/to/grief" onClick={handleMouseLeave} className="lux-hover-lift" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textDecoration: 'none', background: 'rgba(4, 120, 87, 0.07)', border: '1px solid rgba(4, 120, 87, 0.22)', padding: '1.15rem', borderRadius: '12px', height: '100%' }}>
              <div style={{ color: C.dim, fontSize: '0.85rem', lineHeight: 1.5 }}>
                Support hubs for the psychological fallout and recognizing the harm.
              </div>
              <div style={{ color: '#34d399', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.85rem' }}>
                Explore Guide <ChevronRight size={14} />
              </div>
            </Link>
          )
        }
      ]
    },
    data: {
      label: 'DATA',
      sublabel: 'LIVE SURVEY',
      link: '/explore',
      color: '#38bdf8', // Electric Cyan / Blue
      columns: [
        {
          id: 'live-survey',
          title: 'Survey Architecture',
          badge: '501+ Live',
          color: '#38bdf8',
          gradient: ['#38bdf8', '#0ea5e9'],
          flex: 1,
          render: (
            <div>
              <p style={{ color: C.dim, fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                The quantitative ammunition of the movement. Documenting the pleasure gap and tracking psychological fallout in real-time across 6 cohorts.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/explore" onClick={handleMouseLeave} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#04131f', padding: '0.55rem 1.1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontFamily: FONT.condensed, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.82rem' }} className="lux-hover-lift">
                  Interactive Survey Map <ArrowRight size={14} />
                </Link>
                <a href="https://forms.gle/FQ8o9g7j1yU3Cw7n7" target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', color: C.textBright, padding: '0.55rem 1.1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontFamily: FONT.condensed, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.82rem' }} className="lux-hover-lift">
                  Contribute Data
                </a>
              </div>
            </div>
          )
        },
        {
          id: 'exhibits',
          title: 'Highlighted Exhibits',
          badge: 'Key Findings',
          color: '#60a5fa',
          gradient: ['#38bdf8', '#60a5fa'],
          flex: 1.2,
          render: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link to="/explore/pleasure-gap" onClick={handleMouseLeave} className="lux-hover-bright" style={{ color: C.textBright, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(56, 189, 248, 0.04)', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>The 36% Pleasure Gap</div>
                  <div style={{ color: C.dim, fontSize: '0.75rem' }}>Intact vs. circumcised mirror comparison</div>
                </div>
                <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.05rem' }}>-36%</span>
              </Link>
              <Link to="/explore/q/circ_regret_feeling" onClick={handleMouseLeave} className="lux-hover-bright" style={{ color: C.textBright, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(56, 189, 248, 0.04)', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Psychological Fallout (Resentment)</div>
                  <div style={{ color: C.dim, fontSize: '0.75rem' }}>Feelings toward parents & providers</div>
                </div>
                <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '1.05rem' }}>60%+</span>
              </Link>
              <Link to="/explore/restoration-journey" onClick={handleMouseLeave} className="lux-hover-bright" style={{ color: C.textBright, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(56, 189, 248, 0.04)', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Mechanical Function Loss</div>
                  <div style={{ color: C.dim, fontSize: '0.75rem' }}>Gliding action and specialized mucosa</div>
                </div>
                <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>Explore <ChevronRight size={13} /></span>
              </Link>
            </div>
          )
        }
      ]
    },
    media: {
      label: 'MEDIA',
      sublabel: 'DAILY PULSE',
      link: '/news',
      color: '#f59e0b', // Radiant Amber / Gold
      columns: [
        {
          id: 'pulse-overview',
          title: 'Daily Pulse Synthesis',
          badge: 'Editorial',
          color: '#f59e0b',
          gradient: ['#f59e0b', '#fbbf24'],
          flex: 1,
          render: (
            <div style={{ paddingRight: '0.5rem' }}>
              <p style={{ color: C.dim, fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.2rem' }}>
                Vibrant, alive, and constantly updating. Read daily field notes, legal analysis, and press releases synthesized directly from movement receipts.
              </p>
              <Link to="/news" onClick={handleMouseLeave} style={{ color: '#f59e0b', textDecoration: 'none', fontFamily: FONT.condensed, fontWeight: 700, letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                FIELD NOTES & HEADLINES <ArrowRight size={14} />
              </Link>
            </div>
          )
        },
        {
          id: 'dispatches',
          title: 'Latest Dispatches',
          badge: 'Live Receipts',
          color: '#d4a030',
          gradient: ['#f59e0b', '#d4a030'],
          flex: 2,
          render: (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              {latestNews.length > 0 ? latestNews.slice(0, 3).map((item, idx) => {
                let meta = {};
                try { meta = typeof item.metadata_json === 'string' ? JSON.parse(item.metadata_json) : (item.metadata_json || {}); } catch {}
                const route = resolveItemRoute(item, meta);
                return (
                  <Link key={idx} to={route.path} onClick={handleMouseLeave} className="lux-hover-lift" style={{ display: 'block', textDecoration: 'none', background: 'rgba(245, 158, 11, 0.04)', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                    <div style={{ width: '100%', height: '72px', background: 'var(--c-bgSoft)', borderRadius: '6px', marginBottom: '0.4rem', overflow: 'hidden' }}>
                      {(meta.image_url || meta.og_image) ? (
                        <img src={meta.image_url || meta.og_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim, fontSize: '0.72rem' }}>Archive Receipt</div>
                      )}
                    </div>
                    <div style={{ color: '#f59e0b', fontSize: '0.65rem', fontFamily: FONT.condensed, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.15rem' }}>
                      {meta.source_publication || (item.source_type === 'recap' ? 'Daily Digest' : 'Dispatch')}
                    </div>
                    <div style={{ color: C.textBright, fontWeight: 'bold', fontSize: '0.82rem', lineHeight: 1.25, display: '-webkit-box', WebKitLineClamp: 2, WebKitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.title}
                    </div>
                  </Link>
                );
              }) : (
                <div style={{ color: C.dim, padding: '1rem', fontSize: '0.85rem' }}>Loading latest dispatches...</div>
              )}
            </div>
          )
        }
      ]
    }
  };

  const activeConfig = activeMenu ? MENU_CONFIG[activeMenu] : null;

  return (
    <div 
      ref={navWrapperRef}
      style={{ position: 'relative', width: '100%' }} 
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Primary Horizontal Ticker ── */}
      <nav 
        aria-label="Main Navigation"
        style={{
          display: 'flex', 
          gap: isCompact ? '1.8rem' : '3.8rem', 
          padding: isCompact ? '0' : '1rem 0 0.5rem', 
          borderBottom: isCompact ? 'none' : '1px solid rgba(255,255,255,0.06)',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 101
        }}
      >
        {Object.entries(MENU_CONFIG).map(([key, config]) => {
          const isHovered = activeMenu === key;
          const isCurrentLand = !activeMenu && activeLand === key;
          const isHighlighted = isHovered || isCurrentLand;
          return (
            <div
              key={key}
              id={`nav-tab-${key}`}
              ref={tabRefs[key]}
              onMouseEnter={() => handleMouseEnter(key)}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                position: 'relative',
                padding: isCompact ? '0.4rem 0.6rem' : '0.5rem 0',
                transition: 'all 0.2s ease'
              }}
            >
              <Link 
                to={config.link}
                style={{
                  textDecoration: 'none',
                  display: 'block'
                }}
              >
                <div style={{ 
                  fontFamily: FONT.condensed,
                  fontWeight: 800,
                  fontSize: isCompact ? '0.85rem' : '1.25rem', 
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: isHighlighted ? config.color : C.textBright, 
                  marginBottom: isCompact ? '0' : '0.2rem',
                  textShadow: isHighlighted ? `0 0 16px ${config.color}` : 'none',
                  transition: 'color 0.2s ease, text-shadow 0.2s ease'
                }}>
                  {config.label}
                </div>
                {!isCompact && (
                  <div style={{ fontSize: '0.62rem', color: isHighlighted ? config.color : C.dim, letterSpacing: '0.14em', fontWeight: 600, opacity: isHighlighted ? 1 : 0.8 }}>
                    {config.sublabel}
                  </div>
                )}
              </Link>

              {/* Active Tab Sankey Origin Bar — matching full Sankey pipe width */}
              {isHighlighted && (
                <div style={{
                  position: 'absolute',
                  bottom: isCompact ? '-4px' : '-6px',
                  left: 0,
                  right: 0,
                  height: '3px',
                  borderRadius: '2px',
                  background: config.color,
                  boxShadow: `0 0 16px ${config.color}, 0 0 6px ${config.color}`,
                  zIndex: 2,
                  transition: 'all 0.2s ease'
                }} />
              )}
            </div>
          );
        })}

        {/* ── Manifesto Tab (Purple / Amethyst) ── */}
        {(() => {
          const isManifestoLand = activeLand === 'manifesto';
          const purpleColor = '#a855f7';
          return (
            <div 
              id="nav-tab-manifesto"
              ref={tabRefs.manifesto}
              onMouseEnter={() => handleMouseEnter(null)}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                position: 'relative',
                padding: isCompact ? '0.4rem 0.6rem' : '0.5rem 0'
              }}
            >
              <Link 
                to="/manifesto" 
                style={{ textDecoration: 'none', display: 'block' }}
                className="manifesto-nav-tab"
              >
                <div style={{ 
                  fontFamily: FONT.condensed,
                  fontWeight: 800,
                  fontSize: isCompact ? '0.85rem' : '1.25rem', 
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: isManifestoLand ? purpleColor : C.textBright, 
                  marginBottom: isCompact ? '0' : '0.2rem',
                  textShadow: isManifestoLand ? `0 0 16px ${purpleColor}` : 'none',
                  transition: 'color 0.2s ease, text-shadow 0.2s ease'
                }}>
                  MANIFESTO
                </div>
                {!isCompact && (
                  <div style={{ fontSize: '0.62rem', color: isManifestoLand ? purpleColor : C.dim, letterSpacing: '0.14em', fontWeight: 600 }}>
                    OUR MISSION
                  </div>
                )}
                <style>{`.manifesto-nav-tab:hover div { color: #a855f7 !important; text-shadow: 0 0 16px #a855f7 !important; }`}</style>
              </Link>
              {isManifestoLand && (
                <div style={{
                  position: 'absolute',
                  bottom: isCompact ? '-4px' : '-6px',
                  left: 0,
                  right: 0,
                  height: '3px',
                  borderRadius: '2px',
                  background: purpleColor,
                  boxShadow: `0 0 16px ${purpleColor}, 0 0 6px ${purpleColor}`,
                  zIndex: 2,
                  transition: 'all 0.2s ease'
                }} />
              )}
            </div>
          );
        })()}
      </nav>

      {/* ── Active Megamenu with Fluid Sankey Funnel ── */}
      {activeConfig && (
        <div 
          ref={dropdownContainerRef}
          className="megamenu-dropdown-anchor"
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100vw',
            maxWidth: '1200px',
            zIndex: 1100,
            marginTop: '0px',
            pointerEvents: 'auto'
          }}
          onMouseEnter={() => setActiveMenu(activeMenu)}
        >
          {/* Sankey Stream Connector Ribbons */}
          <SankeyConnector 
            activeMenu={activeMenu}
            columns={activeConfig.columns}
            tabRef={tabRefs[activeMenu]}
            containerRef={dropdownContainerRef}
            hoveredCol={hoveredCol}
            setHoveredCol={setHoveredCol}
          />

          {/* Megamenu Card with Columns */}
          <div 
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: '#090f15',
              border: `1px solid rgba(255, 255, 255, 0.12)`,
              borderTop: 'none',
              boxShadow: `0 28px 60px rgba(0, 0, 0, 0.95), 0 0 40px ${activeConfig.color}25`,
              borderRadius: '0 0 16px 16px',
              padding: '0 2.5rem 2.25rem 2.5rem',
              display: 'flex',
              gap: '2.5rem',
              marginTop: '-1px'
            }}
          >
            {/* Ambient Underloom in the Land's Signature Color */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.18, zIndex: 0 }}>
              <LoomChoreography isInline={true} forceFormation="harmonic" opacity={1} themeColor={activeMenu} />
            </div>

            {/* Subtle baseline along top edge */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'rgba(255, 255, 255, 0.08)', zIndex: 0 }} />

            {activeConfig.columns.map((col, idx) => {
              const isColHovered = hoveredCol === idx;
              return (
                <div 
                  key={col.id} 
                  id={`megamenu-col-${col.id}`}
                  style={{ 
                    flex: col.flex || 1, 
                    position: 'relative',
                    paddingTop: '1.75rem',
                    zIndex: 1
                  }}
                  onMouseEnter={() => setHoveredCol(idx)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  {/* Column Receiving Accent Bar — sits flush directly at the landing edge of the Sankey swoop */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: isColHovered ? '4px' : '3px',
                    background: col.color,
                    opacity: isColHovered ? 1 : 0.85,
                    boxShadow: isColHovered 
                      ? `0 0 20px ${col.color}, 0 2px 10px ${col.color}` 
                      : `0 0 10px ${col.color}50`,
                    transition: 'all 0.2s ease',
                    borderRadius: '2px 2px 0 0'
                  }} />

                  {/* Title block illuminated in Sankey Color (matches Survey Map aesthetic) */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    marginBottom: '1rem',
                    borderBottom: isColHovered ? `1px solid ${col.color}70` : `1px solid rgba(255, 255, 255, 0.08)`,
                    paddingBottom: '0.6rem',
                    boxShadow: isColHovered ? `0 1px 12px ${col.color}30` : 'none',
                    transition: 'all 0.25s ease'
                  }}>
                    {/* Glowing colored pip indicator */}
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: col.color,
                      boxShadow: isColHovered 
                        ? `0 0 14px ${col.color}, 0 0 6px ${col.color}` 
                        : `0 0 8px ${col.color}70`,
                      flexShrink: 0,
                      transition: 'all 0.25s ease'
                    }} />

                    <h3 style={{
                      fontFamily: FONT.display,
                      color: isColHovered ? col.color : C.textBright,
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      margin: 0,
                      letterSpacing: '0.02em',
                      textShadow: isColHovered 
                        ? `0 0 16px ${col.color}, 0 0 28px ${col.color}80` 
                        : `0 0 10px ${col.color}40`,
                      transition: 'all 0.25s ease'
                    }}>
                      {col.title}
                    </h3>

                    {col.badge && (
                      <span style={{
                        fontFamily: FONT.mono,
                        fontSize: '0.62rem',
                        fontWeight: 600,
                        color: isColHovered ? '#ffffff' : col.color,
                        background: isColHovered ? `${col.color}35` : `${col.color}15`,
                        border: `1px solid ${col.color}${isColHovered ? '70' : '35'}`,
                        padding: '0.12rem 0.45rem',
                        borderRadius: '999px',
                        marginLeft: 'auto',
                        letterSpacing: '0.04em',
                        transition: 'all 0.25s ease'
                      }}>
                        {col.badge}
                      </span>
                    )}
                  </div>

                  {col.render}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
