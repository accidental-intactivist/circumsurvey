import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { C, FONT } from '../styles/tokens';
import { BookOpen, Users, Newspaper, ClipboardPen, Database, Map, Sparkles } from 'lucide-react';
import NewsAggregator from './NewsAggregator';

export default function BentoBox() {
  const navigate = useNavigate();

  const BentoItem = ({ title, desc, icon: Icon, color, span, rowSpan, href, external, bgImg }) => {
    const isLarge = rowSpan > 1;
    
    const Wrapper = href ? (external ? 'a' : Link) : 'div';
    const wrapperProps = href 
      ? (external ? { href, target: '_blank', rel: 'noreferrer' } : { to: href })
      : {};

    return (
      <Wrapper
        {...wrapperProps}
        style={{
          gridColumn: `span ${span}`,
          gridRow: `span ${rowSpan}`,
          background: `radial-gradient(circle at top right, color-mix(in srgb, ${color} 15%, transparent), rgba(20,20,20,0.4) 80%)`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 24,
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          textDecoration: 'none',
          color: 'white',
          transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
          cursor: href ? 'pointer' : 'default',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}
        onMouseEnter={(e) => {
          if (!href) return;
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px color-mix(in srgb, ${color} 40%, transparent)`;
          e.currentTarget.style.background = `radial-gradient(circle at top right, color-mix(in srgb, ${color} 25%, transparent), rgba(20,20,20,0.6) 80%)`;
          const iconEl = e.currentTarget.querySelector('.bento-icon');
          if (iconEl) {
             iconEl.style.transform = 'scale(1.15) rotate(5deg)';
             iconEl.style.background = `color-mix(in srgb, ${color} 20%, transparent)`;
          }
        }}
        onMouseLeave={(e) => {
          if (!href) return;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
          e.currentTarget.style.border = `1px solid rgba(255,255,255,0.08)`;
          e.currentTarget.style.background = `radial-gradient(circle at top right, color-mix(in srgb, ${color} 15%, transparent), rgba(20,20,20,0.4) 80%)`;
          const iconEl = e.currentTarget.querySelector('.bento-icon');
          if (iconEl) {
             iconEl.style.transform = 'scale(1) rotate(0deg)';
             iconEl.style.background = `rgba(255,255,255,0.05)`;
          }
        }}
      >
        {/* Abstract giant background icon */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.08, transform: 'rotate(-10deg)', pointerEvents: 'none', transition: 'all 0.5s ease' }}>
          <Icon size={isLarge ? 220 : 140} color={color} />
        </div>
        
        <div className="bento-icon" style={{
          background: `rgba(255,255,255,0.05)`,
          width: 56, height: 56, borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 'auto', transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
          zIndex: 1
        }}>
          <Icon size={28} color={color} />
        </div>

        <div style={{ zIndex: 1, marginTop: '2rem' }}>
          <h3 style={{ 
            fontFamily: FONT.display, 
            fontSize: isLarge ? '1.75rem' : '1.25rem',
            margin: '0 0 0.5rem 0',
            color: '#fff',
            letterSpacing: '-0.02em'
          }}>
            {title}
          </h3>
          <p style={{ 
            fontFamily: FONT.body, 
            fontSize: '0.95rem',
            margin: 0,
            color: C.muted,
            lineHeight: 1.5
          }}>
            {desc}
          </p>
        </div>
      </Wrapper>
    );
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gridAutoRows: '240px',
      gap: '1.25rem',
      marginBottom: '5rem',
      width: '100%'
    }}>
      {/* Hero Spot: Global Intelligence Desk Newsfeed */}
      <NewsAggregator />

      {/* Row 1 Right */}
      <BentoItem 
        title="About the Guide" 
        desc="Your central hub for global genital autonomy research, living datasets, and historical archives." 
        icon={Sparkles} 
        color="var(--c-goldBright)" 
        span={4} 
        rowSpan={1}
      />
      
      {/* Row 2 Right */}
      <BentoItem 
        title="Interactive Atlas" 
        desc="Explore the raw dataset visually through geographic heatmaps." 
        icon={Map} 
        color="var(--c-blue)" 
        span={4} 
        rowSpan={1}
        href="/explore" 
      />
      
      {/* Row 3 */}
      <BentoItem 
        title="Digital Library" 
        desc="Searchable repository & AI Assistant." 
        icon={BookOpen} 
        color="var(--c-purple)" 
        span={4} 
        rowSpan={1}
        href="/library" 
      />
      <BentoItem 
        title="Key Figures" 
        desc="Encyclopedic directory of the movement's people and institutions." 
        icon={Users} 
        color="var(--c-red)" 
        span={4} 
        rowSpan={1}
        href="/entities" 
      />
      <BentoItem 
        title="Data Exports" 
        desc="Download raw datasets and research reports." 
        icon={Database} 
        color="var(--c-green, #4ade80)" 
        span={4} 
        rowSpan={1}
        href="/library" 
      />

      {/* Row 4 */}
      <BentoItem 
        title="Field Notes" 
        desc="Updates, analysis, and dispatches from the frontlines." 
        icon={Newspaper} 
        color="var(--c-teal, #20c997)" 
        span={4} 
        rowSpan={1}
        href="/news" 
      />
      <BentoItem 
        title="Take the Survey" 
        desc="Share your experience anonymously and add your voice to the record. Your participation directly fuels our research." 
        icon={ClipboardPen} 
        color="var(--c-orange)" 
        span={8} 
        rowSpan={1}
        href="https://forms.gle/FQ8o9g7j1yU3Cw7n7"
        external 
      />
    </div>
  );
}
