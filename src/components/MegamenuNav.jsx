import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { C, FONT } from '../styles/tokens';
import { Search, ChevronRight, ArrowRight, Clock, ExternalLink } from 'lucide-react';

export default function MegamenuNav() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    // Fetch latest news for the Media & Field Notes megamenu
    fetch('/api/cms?types=external_news,essay,recap,internal_news&limit=3')
      .then(res => res.json())
      .then(data => setLatestNews(data.data || data))
      .catch(console.error);
  }, []);

  const handleMouseEnter = (menu) => setActiveMenu(menu);
  const handleMouseLeave = () => setActiveMenu(null);

  const navItemStyle = {
    fontFamily: FONT.condensed,
    fontWeight: 700,
    fontSize: '0.9rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--c-dim)',
    textDecoration: 'none',
    cursor: 'pointer',
    padding: '0.5rem 0',
    transition: 'color 0.2s'
  };

  const activeNavItemStyle = {
    ...navItemStyle,
    color: 'var(--c-goldBright)'
  };

  const dropdownContainerStyle = {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100vw',
    maxWidth: '1200px',
    background: 'var(--c-bgDeep)',
    border: '1px solid var(--c-borderMuted)',
    borderTop: '2px solid var(--c-goldBright)',
    boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
    borderRadius: '0 0 12px 12px',
    padding: '2.5rem',
    display: activeMenu ? 'flex' : 'none',
    gap: '3rem',
    zIndex: 100,
    marginTop: '0.5rem'
  };

  return (
    <div style={{ position: 'relative' }} onMouseLeave={handleMouseLeave}>
      {/* Primary Horizontal Ticker */}
      <div style={{
        display: 'flex', gap: '4rem', padding: '1rem 0 0.5rem', 
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 101
      }}>
         <div 
           style={activeMenu === 'library' ? activeNavItemStyle : navItemStyle} 
           onMouseEnter={() => handleMouseEnter('library')}
         >
           <div style={{ fontSize: '1.2rem', color: activeMenu === 'library' ? C.goldBright : C.textBright, marginBottom: '0.2rem' }}>LIBRARY</div>
           <div style={{ fontSize: '0.65rem', color: C.dim, letterSpacing: '0.15em', fontWeight: 500 }}>THE TIM HAMMOND COLLECTION</div>
         </div>
         <div 
           style={activeMenu === 'guides' ? activeNavItemStyle : navItemStyle} 
           onMouseEnter={() => handleMouseEnter('guides')}
         >
           <div style={{ fontSize: '1.2rem', color: activeMenu === 'guides' ? C.goldBright : C.textBright, marginBottom: '0.2rem' }}>GUIDES</div>
           <div style={{ fontSize: '0.65rem', color: C.dim, letterSpacing: '0.15em', fontWeight: 500 }}>FIELD MANUALS</div>
         </div>
         <div 
           style={activeMenu === 'data' ? activeNavItemStyle : navItemStyle} 
           onMouseEnter={() => handleMouseEnter('data')}
         >
           <div style={{ fontSize: '1.2rem', color: activeMenu === 'data' ? C.goldBright : C.textBright, marginBottom: '0.2rem' }}>DATA</div>
           <div style={{ fontSize: '0.65rem', color: C.dim, letterSpacing: '0.15em', fontWeight: 500 }}>LIVE SURVEY</div>
         </div>
         <div 
           style={activeMenu === 'media' ? activeNavItemStyle : navItemStyle} 
           onMouseEnter={() => handleMouseEnter('media')}
         >
           <div style={{ fontSize: '1.2rem', color: activeMenu === 'media' ? C.goldBright : C.textBright, marginBottom: '0.2rem' }}>MEDIA</div>
           <div style={{ fontSize: '0.65rem', color: C.dim, letterSpacing: '0.15em', fontWeight: 500 }}>DAILY PULSE</div>
         </div>
         <Link to="/about" style={navItemStyle} onMouseEnter={() => handleMouseEnter(null)}>
           <div style={{ fontSize: '1.2rem', color: C.textBright, marginBottom: '0.2rem', transition: 'color 0.2s' }} className="manifesto-link">MANIFESTO</div>
           <div style={{ fontSize: '0.65rem', color: C.dim, letterSpacing: '0.15em', fontWeight: 500 }}>OUR MISSION</div>
           <style>{`.manifesto-link:hover { color: var(--c-goldBright) !important; }`}</style>
         </Link>
      </div>

      {/* ---------------- MEGAMENUS ---------------- */}

      {/* 1. Tim Hammond Library Megamenu */}
      {activeMenu === 'library' && (
        <div className="lux-lens" style={dropdownContainerStyle}>
           <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: FONT.display, color: C.textBright, fontSize: '1.4rem', marginBottom: '1rem', borderBottom: `1px solid ${C.ghost}`, paddingBottom: '0.5rem' }}>
                Core Collections
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <Link to="/library?topic=legislation" className="lux-hover-bright" style={{ color: C.dim, textDecoration: 'none' }}>Legislation Tracker</Link>
                <Link to="/library?topic=medical" className="lux-hover-bright" style={{ color: C.dim, textDecoration: 'none' }}>Medical Journals</Link>
                <Link to="/library?topic=policy" className="lux-hover-bright" style={{ color: C.dim, textDecoration: 'none' }}>Policy Guidelines</Link>
                <Link to="/entities" className="lux-hover-bright" style={{ color: C.dim, textDecoration: 'none' }}>Directory of Key Figures</Link>
              </div>
           </div>
           <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: FONT.display, color: C.goldBright, fontSize: '1.4rem', marginBottom: '1rem', borderBottom: `1px solid ${C.ghost}`, paddingBottom: '0.5rem' }}>
                Curated Exhibits
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link to="/to/hadachek_v_oregon" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', background: 'rgba(212,160,48,0.05)', padding: '0.8rem', borderRadius: '8px' }} className="lux-hover-lift">
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', background: 'var(--c-bgSoft)', borderRadius: '4px' }}></div>
                  <div>
                    <div style={{ color: C.textBright, fontWeight: 'bold', fontSize: '0.95rem' }}>Hadachek v. Oregon</div>
                    <div style={{ color: C.dim, fontSize: '0.8rem' }}>The fight for Equal Protection</div>
                  </div>
                </Link>
                <Link to="/library?topic=fgm-firewall" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', background: 'rgba(212,160,48,0.05)', padding: '0.8rem', borderRadius: '8px' }} className="lux-hover-lift">
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', background: 'var(--c-bgSoft)', borderRadius: '4px' }}></div>
                  <div>
                    <div style={{ color: C.textBright, fontWeight: 'bold', fontSize: '0.95rem' }}>The FGM Firewall</div>
                    <div style={{ color: C.dim, fontSize: '0.8rem' }}>Exposing the hypocrisy of double standards</div>
                  </div>
                </Link>
              </div>
           </div>
           <div style={{ flex: 1, background: 'rgba(59,130,246,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ color: C.blueBright, fontFamily: FONT.condensed, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                AI Research Assistant
              </div>
              <h3 style={{ fontFamily: FONT.display, color: C.textBright, fontSize: '1.4rem', marginBottom: '1rem', lineHeight: 1.2 }}>
                Ask Glenda
              </h3>
              <p style={{ color: C.muted, fontSize: '0.9rem', marginBottom: '1rem' }}>
                Search the world's largest indexed collection of genital autonomy documents using natural language.
              </p>
              <Link to="/library" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: C.blueBright, color: '#000', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                <Search size={14} /> Open the Vault
              </Link>
           </div>
        </div>
      )}

      {/* 2. Interactive Field Guides */}
      {activeMenu === 'guides' && (
        <div className="lux-lens" style={{...dropdownContainerStyle, gap: '2rem'}}>
           <div style={{ flex: 1, paddingRight: '2rem', borderRight: `1px solid ${C.ghost}` }}>
             <h2 style={{ fontFamily: FONT.display, color: C.textBright, fontSize: '2rem', marginBottom: '0.5rem', lineHeight: 1.1 }}>
               Knowledge into Action
             </h2>
             <p style={{ color: C.dim, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
               We transform static advice into stunning, interactive journeys. Navigate the hospital, process grief, or explore physical restoration.
             </p>
             <Link to="/guides" style={{ color: C.goldBright, textDecoration: 'none', fontFamily: FONT.condensed, fontWeight: 700, letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
               VIEW ALL GUIDES <ArrowRight size={16} />
             </Link>
           </div>
            <div style={{ flex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <Link to="/to/parents" className="lux-hover-lift" style={{ display: 'block', textDecoration: 'none', background: 'var(--c-bgSoft)', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ color: C.goldBright, fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>For Parents</div>
                <div style={{ color: C.muted, fontSize: '0.85rem', lineHeight: 1.5 }}>Navigating the hospital, defending the prepuce, and confronting family pressure.</div>
              </Link>
              <Link to="/to/restoration" className="lux-hover-lift" style={{ display: 'block', textDecoration: 'none', background: 'var(--c-bgSoft)', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ color: C.blueBright, fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Foreskin Restoration</div>
                <div style={{ color: C.muted, fontSize: '0.85rem', lineHeight: 1.5 }}>A step-by-step visual exploration of physical and psychological recovery.</div>
              </Link>
              <Link to="/to/grief" className="lux-hover-lift" style={{ display: 'block', textDecoration: 'none', background: 'var(--c-bgSoft)', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ color: C.red, fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Grief & Processing</div>
                <div style={{ color: C.muted, fontSize: '0.85rem', lineHeight: 1.5 }}>Support hubs for the psychological fallout and recognizing the harm.</div>
              </Link>
           </div>
        </div>
      )}

      {/* 3. The Data Hub */}
      {activeMenu === 'data' && (
        <div className="lux-lens" style={dropdownContainerStyle}>
           <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: C.red, boxShadow: `0 0 10px ${C.red}` }}></div>
                <h3 style={{ fontFamily: FONT.display, color: C.textBright, fontSize: '1.5rem', margin: 0 }}>
                  Live CircumSurvey Data
                </h3>
              </div>
              <p style={{ color: C.dim, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                The quantitative ammunition of the movement. We are documenting the pleasure gap and tracking the psychological fallout in real-time.
              </p>
              <a href="https://forms.gle/FQ8o9g7j1yU3Cw7n7" target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: C.goldBright, color: '#000', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontFamily: FONT.condensed, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Contribute Your Data
              </a>
           </div>
           <div style={{ flex: 1, borderLeft: `1px solid ${C.ghost}`, paddingLeft: '3rem' }}>
              <h4 style={{ color: C.goldBright, fontFamily: FONT.condensed, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', fontSize: '0.85rem' }}>
                Highlighted Exhibits
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link to="/explore?exhibit=pleasure-gap" className="lux-hover-bright" style={{ color: C.textBright, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${C.ghost}`, paddingBottom: '0.5rem' }}>
                  <span>The 36% Pleasure Gap</span>
                  <span style={{ color: C.red, fontWeight: 'bold' }}>-36%</span>
                </Link>
                <Link to="/explore?exhibit=psych-fallout" className="lux-hover-bright" style={{ color: C.textBright, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${C.ghost}`, paddingBottom: '0.5rem' }}>
                  <span>Psychological Fallout (Resentment)</span>
                  <span style={{ color: C.orange, fontWeight: 'bold' }}>60%+</span>
                </Link>
                <Link to="/explore?exhibit=function-loss" className="lux-hover-bright" style={{ color: C.textBright, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${C.ghost}`, paddingBottom: '0.5rem' }}>
                  <span>Mechanical Function Loss</span>
                  <span style={{ color: C.blueBright, fontWeight: 'bold' }}>Explore</span>
                </Link>
              </div>
           </div>
        </div>
      )}

      {/* 4. Media & Field Notes */}
      {activeMenu === 'media' && (
        <div className="lux-lens" style={dropdownContainerStyle}>
           <div style={{ flex: 1, paddingRight: '2rem', borderRight: `1px solid ${C.ghost}` }}>
             <h2 style={{ fontFamily: FONT.display, color: C.textBright, fontSize: '2rem', marginBottom: '0.5rem', lineHeight: 1.1 }}>
               The Daily Pulse
             </h2>
             <p style={{ color: C.dim, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
               Vibrant, alive, and constantly updating. Read the latest field notes, legal analysis, and press releases from our strategic partners.
             </p>
             <Link to="/news" style={{ color: C.goldBright, textDecoration: 'none', fontFamily: FONT.condensed, fontWeight: 700, letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
               GO TO MEDIA HUB <ArrowRight size={16} />
             </Link>
           </div>
           <div style={{ flex: 2 }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                {latestNews.length > 0 ? latestNews.map((item, idx) => {
                  let meta = {};
                  try { meta = JSON.parse(item.metadata_json); } catch(e){}
                  return (
                    <Link key={idx} to={`/news/${item.id}`} className="lux-hover-lift" style={{ display: 'block', textDecoration: 'none' }}>
                      <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--c-bgSoft)', borderRadius: '8px', marginBottom: '0.75rem', overflow: 'hidden' }}>
                        {(meta.image_url || meta.og_image) ? (
                          <img src={meta.image_url || meta.og_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim }}>No Image</div>
                        )}
                      </div>
                      <div style={{ color: C.goldBright, fontSize: '0.7rem', fontFamily: FONT.condensed, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
                        {meta.source_publication || 'Update'}
                      </div>
                      <div style={{ color: C.textBright, fontWeight: 'bold', fontSize: '0.9rem', lineHeight: 1.3 }}>
                        {item.title}
                      </div>
                    </Link>
                  );
                }) : (
                  <div style={{ color: C.dim, gridColumn: 'span 3', textAlign: 'center', padding: '2rem' }}>Loading latest dispatches...</div>
                )}
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
