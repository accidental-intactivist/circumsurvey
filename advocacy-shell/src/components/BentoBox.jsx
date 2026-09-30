import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { C, FONT } from '../styles/tokens';
import { BookOpen, Users, Newspaper, ClipboardPen, Database, Map } from 'lucide-react';

export default function BentoBox() {
  const navigate = useNavigate();

  const BentoItem = ({ title, desc, icon: Icon, color, span, rowSpan, href, external, bgImg }) => {
    const isLarge = rowSpan > 1;
    
    const Wrapper = external ? 'a' : Link;
    const wrapperProps = external 
      ? { href, target: '_blank', rel: 'noreferrer' }
      : { to: href };

    return (
      <Wrapper
        {...wrapperProps}
        style={{
          gridColumn: `span ${span}`,
          gridRow: `span ${rowSpan}`,
          background: `linear-gradient(145deg, rgba(20,20,20,0.8), rgba(10,10,10,0.9))`,
          border: `1px solid rgba(255,255,255,0.05)`,
          borderRadius: 16,
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          textDecoration: 'none',
          color: 'white',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.5), 0 0 0 1px ${color}`;
          const iconEl = e.currentTarget.querySelector('.bento-icon');
          if (iconEl) iconEl.style.transform = 'scale(1.1) rotate(5deg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.border = `1px solid rgba(255,255,255,0.05)`;
          const iconEl = e.currentTarget.querySelector('.bento-icon');
          if (iconEl) iconEl.style.transform = 'scale(1) rotate(0deg)';
        }}
      >
        <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.1 }}>
          <Icon size={isLarge ? 120 : 60} color={color} />
        </div>
        
        <div className="bento-icon" style={{
          background: `rgba(255,255,255,0.05)`,
          width: 48, height: 48, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 'auto', transition: 'all 0.3s'
        }}>
          <Icon size={24} color={color} />
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
      gridAutoRows: '220px',
      gap: '1.25rem',
      marginBottom: '5rem',
      width: '100%'
    }}>
      <BentoItem 
        title="Interactive Atlas" 
        desc="Explore the raw dataset visually through geographic heatmaps and interactive demographic breakdowns." 
        icon={Map} 
        color="var(--c-blue)" 
        span={8} 
        rowSpan={2}
        href="/explore" 
      />
      <BentoItem 
        title="Digital Library" 
        desc="Searchable repository & AI Research Assistant." 
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
        desc="Download raw, anonymized datasets and research reports." 
        icon={Database} 
        color="var(--c-green, #4ade80)" 
        span={4} 
        rowSpan={1}
        href="/library" 
      />
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
        desc="Share your experience anonymously and add your voice to the record." 
        icon={ClipboardPen} 
        color="var(--c-orange)" 
        span={4} 
        rowSpan={1}
        href="https://forms.gle/FQ8o9g7j1yU3Cw7n7"
        external 
      />
    </div>
  );
}
