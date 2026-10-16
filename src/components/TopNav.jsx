import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { C, FONT } from '../styles/tokens';
import { useAssistant } from '../contexts/AssistantContext';
import ArchiveHamburgerMenu from './ArchiveHamburgerMenu';
import SectionNavDropdown from './SectionNavDropdown';
import './TopNav.css';

export default function TopNav() {
  const { openAssistant } = useAssistant();
  const location = useLocation();

  const isLandingPage = location.pathname === '/';

  const getActivityTitle = (path) => {
    if (path === '/') return 'Home';
    if (path.startsWith('/manifesto')) return "The Accidental Intactivist's Manifesto";
    if (path.startsWith('/admin/archive')) return 'Archive Administration';
    if (path.startsWith('/admin/cms')) return 'CMS Wrangler';
    if (path.startsWith('/admin/inventory')) return 'Archive Tracker';
    if (path.startsWith('/to/hadachek') || path.startsWith('/hadachek') || path === '/exhibits/hadachek') return 'Hadachek v. Oregon';
    if (path.startsWith('/to/huff') || path.startsWith('/huff') || path === '/exhibits/huff' || path === '/legal' || path === '/litigation') return 'Huff v. Colorado';
    if (path.startsWith('/to/foregen') || path === '/foregen') return 'Foregen';
    if (path.startsWith('/exhibits/')) return 'Curated Exhibit';
    if (path.startsWith('/to/parents') || path.startsWith('/to/restoration') || path.startsWith('/to/grief')) return 'Interactive Guide';
    if (path.startsWith('/to/')) return 'Entity Profile';
    if (path.startsWith('/graph')) return 'Global Graph';
    if (path.startsWith('/citations')) return 'Citation Web';
    if (path.startsWith('/atlas')) return 'Global Circumcision Atlas';
    if (path.startsWith('/guides/rebuttals')) return 'Counter-Evidence';
    if (path.startsWith('/guides')) return 'Guide Series';
    if (path.startsWith('/library/')) return 'Document View';
    if (path.startsWith('/library')) return 'Digital Library';
    if (path.startsWith('/timeline')) return 'Timeline';
    if (path.startsWith('/assistant') || path.startsWith('/report')) return 'Discussion Guides';
    if (path.startsWith('/contact')) return 'Contact';
    if (path.startsWith('/policies')) return 'Policies';
    if (path.startsWith('/collections/')) return 'Collection';
    if (path.startsWith('/collections')) return 'Collections';
    if (path.startsWith('/news')) return 'Field Notes & Headlines';
    return 'Guide';
  };

  const currentActivity = getActivityTitle(location.pathname);
  const isCollectionPage = location.pathname.startsWith('/collections/');
  const isNewsPage = location.pathname === '/news';
  const isExplorePage = location.pathname.startsWith('/explore');
  const hideTopNav = isLandingPage || isCollectionPage || isNewsPage || isExplorePage;

  if (hideTopNav) return null;

  const isSquished = true;

  return (
    <header 
      className={`top-nav ${isSquished ? 'squished' : ''}`}
      style={{
        opacity: hideTopNav ? 0 : 1,
        pointerEvents: hideTopNav ? 'none' : 'auto',
        transform: hideTopNav ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #d94f4f, #e8a44a, #e8c868, #68b878, #5b93c7)', zIndex: 50, opacity: isSquished ? 1 : 0, transition: 'opacity 0.3s ease' }} />
      <div className="nav-container">
        {/* Left: Brand + Section Selector Dropdown */}
        <div className="brand" style={{ zIndex: 10 }}>
          <SectionNavDropdown />
        </div>
        
        {/* Center: Reverted Centered Page Title */}
        <div className="topnav-center-title" style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          textAlign: 'center',
          maxWidth: '52%'
        }}>
          <h1 style={{
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 'clamp(0.95rem, 1.8vw, 1.25rem)',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            color: C.textBright,
            margin: 0,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentActivity}
          </h1>
        </div>
        
        {/* Right: Controls */}
        <div className="nav-controls" style={{ zIndex: 10 }}>
          <button 
            onClick={() => openAssistant()}
            className="lux-hover-lift ask-assistant-btn"
          >
            <Sparkles size={14} /> <span className="ask-assistant-text">Ask Assistant</span>
          </button>
          <ArchiveHamburgerMenu />
        </div>
      </div>
    </header>
  );
}
