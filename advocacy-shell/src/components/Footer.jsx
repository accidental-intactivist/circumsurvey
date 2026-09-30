import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, BookOpen, FileText, AlertTriangle, Mail, ArrowRight, BarChart2 } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  const isExplore = location.pathname.startsWith('/explore');

  const LinkStyle = {
    color: 'var(--c-dim)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'color 0.2s',
    fontSize: '0.9rem'
  };

  return (
    <footer style={{ 
      background: 'var(--c-bgDeep)', 
      borderTop: '1px solid var(--c-ghost)', 
      padding: '4rem 2rem 6rem 2rem',
      position: 'relative',
      zIndex: 10,
      color: 'var(--c-dim)'
    }}>
      {/* Signature Top Gradient Rule (if in explore mode) */}
      {isExplore && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #c8a959, #ef4444, #3b82f6, #00ff80)",
        }} />
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem' }}>
        
        {/* Brand / About */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--f-display)', color: 'var(--c-textBright)', fontSize: '1.5rem', margin: '0' }}>
            INTACTIVISM ARCHIVE
          </h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
            A digital repository preserving historical documents, medical journals, and personal accounts concerning genital autonomy and circumcision.
          </p>
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid #ef4444', borderRadius: '0 8px 8px 0', marginTop: '0.5rem' }}>
            <strong style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
              <AlertTriangle size={14} /> NOT MEDICAL ADVICE
            </strong>
            <span style={{ fontSize: '0.8rem', lineHeight: 1.4, display: 'block' }}>
              Content is for educational and sociological research only. It is not a substitute for professional medical advice.
            </span>
          </div>
        </div>

        {/* The Archive */}
        <div>
          <h4 style={{ color: 'var(--c-textBright)', marginBottom: '1.5rem', letterSpacing: '0.05em', fontFamily: 'var(--f-condensed)' }}>THE ARCHIVE</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>
              <Link to="/library" style={LinkStyle} className="lux-hover-bright">
                <FileText size={16} /> Digital Library (Index)
              </Link>
            </li>
            <li>
              <Link to="/collections" style={LinkStyle} className="lux-hover-bright">
                <BookOpen size={16} /> Curated Collections
              </Link>
            </li>
            <li>
              <Link to="/assistant" style={LinkStyle} className="lux-hover-bright">
                <Shield size={16} /> AI Report Builder
              </Link>
            </li>
          </ul>
        </div>

        {/* The Inquiry (Survey) */}
        <div>
          <h4 style={{ color: 'var(--c-textBright)', marginBottom: '1.5rem', letterSpacing: '0.05em', fontFamily: 'var(--f-condensed)' }}>THE INQUIRY (SURVEY)</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>
              <Link to="/explore#/" style={LinkStyle} className="lux-hover-bright">
                Master Index & Exhibits
              </Link>
            </li>
            <li>
              <Link to="/explore#/report" style={LinkStyle} className="lux-hover-bright">
                <BarChart2 size={16} /> Survey Paste-Up Desk
              </Link>
            </li>
            <li>
              <Link to="/explore#/demographics" style={LinkStyle} className="lux-hover-bright">
                Demographic Profile
              </Link>
            </li>
            <li>
              <Link to="/explore#/methodology" style={LinkStyle} className="lux-hover-bright">
                Survey Methodology
              </Link>
            </li>
            <li>
              <Link to="/explore#/about" style={LinkStyle} className="lux-hover-bright">
                About the Project
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Support */}
        <div>
          <h4 style={{ color: 'var(--c-textBright)', marginBottom: '1.5rem', letterSpacing: '0.05em', fontFamily: 'var(--f-condensed)' }}>SUPPORT & LEGAL</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>
              <Link to="/contact" style={{ ...LinkStyle, color: 'var(--c-gold)' }} className="lux-hover-bright">
                <Mail size={16} /> Contact / Submissions
              </Link>
            </li>
            <li>
              <Link to="/explore#/faq" style={LinkStyle} className="lux-hover-bright">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/explore#/resources" style={LinkStyle} className="lux-hover-bright">
                Downloads & External
              </Link>
            </li>
            <li style={{ marginTop: '1rem' }}>
              <Link to="/policies" style={{ ...LinkStyle, fontSize: '0.8rem' }} className="lux-hover-bright">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/policies" style={{ ...LinkStyle, fontSize: '0.8rem' }} className="lux-hover-bright">
                Privacy & DMCA Policy
              </Link>
            </li>
          </ul>
        </div>

      </div>

      <div style={{ maxWidth: '1200px', margin: '4rem auto 0 auto', paddingTop: '1.5rem', borderTop: '1px solid var(--c-ghost)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
        <span>© {new Date().getFullYear()} The Accidental Intactivist Archive. All rights reserved.</span>
        <span>Operated strictly under Fair Use (17 U.S.C. § 107) for educational and research purposes.</span>
      </div>
    </footer>
  );
}
