import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAssistant } from '../contexts/AssistantContext';
import ArchiveHamburgerMenu from './ArchiveHamburgerMenu';
import './TopNav.css';

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const { openAssistant } = useAssistant();
  const location = useLocation();

  const isLandingPage = location.pathname === '/';

  // The Squish effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getActivityTitle = (path) => {
    if (path === '/') return 'Home';
    if (path.startsWith('/admin/archive')) return 'Archive Administration';
    if (path.startsWith('/admin/cms')) return 'CMS Wrangler';
    if (path.startsWith('/admin/inventory')) return 'Archive Tracker';
    if (path.startsWith('/admin/entities')) return 'Entity Manager';
    if (path.startsWith('/to/')) return 'Profile';
    if (path.startsWith('/graph')) return 'Global Graph';
    if (path.startsWith('/library/')) return 'Document View';
    if (path.startsWith('/library')) return 'Digital Library';
    if (path.startsWith('/timeline')) return 'Timeline';
    if (path.startsWith('/assistant')) return 'Report Builder';
    if (path.startsWith('/contact')) return 'Contact';
    if (path.startsWith('/policies')) return 'Policies';
    if (path.startsWith('/collections/')) return 'Collection';
    if (path.startsWith('/collections')) return 'Collections';
    return 'Guide';
  };

  const currentActivity = getActivityTitle(location.pathname);
  const isCollectionPage = location.pathname.startsWith('/collections/');
  const isNewsPage = location.pathname === '/news';
  const hideTopNav = isLandingPage || isCollectionPage || isNewsPage;

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
        <div className="brand">
          <Link to="/" className="brand-link">
            <span className="brand-supertitle">The Accidental Intactivist's Guide</span>
            <span className="brand-title">{currentActivity}</span>
          </Link>
        </div>
        
        <div className="nav-controls">
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
