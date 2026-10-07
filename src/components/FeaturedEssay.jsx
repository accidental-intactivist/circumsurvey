import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, User } from 'lucide-react';
import { C, FONT } from '../styles/tokens';

export default function FeaturedEssay() {
  const [essay, setEssay] = useState(null);

  useEffect(() => {
    const fetchEssay = async () => {
      try {
        const res = await fetch('/api/cms');
        const data = await res.json();
        const docs = data.data || data;
        
        const essays = docs.filter(d => d.type === 'essay' && d.status === 'ingested');
        if (essays.length > 0) {
          // Sort by date, newest first
          essays.sort((a, b) => {
            const aDate = a.metadata_json ? (JSON.parse(a.metadata_json).date || '') : '';
            const bDate = b.metadata_json ? (JSON.parse(b.metadata_json).date || '') : '';
            return bDate.localeCompare(aDate);
          });
          setEssay(essays[0]);
        }
      } catch (e) {
        console.error("Failed to fetch featured essay", e);
      }
    };
    fetchEssay();
  }, []);

  if (!essay) return null;

  const meta = essay.metadata_json ? JSON.parse(essay.metadata_json) : {};

  return (
    <div className="lux-lens lux-glide-in" style={{
      display: 'flex',
      flexWrap: 'wrap',
      background: 'var(--c-bgDeep)',
      border: `1px solid ${C.ghost}`,
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '4rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
    }}>
      <div style={{
        flex: '1 1 300px',
        backgroundImage: meta.image_url ? `url(${meta.image_url})` : 'linear-gradient(45deg, rgba(20,20,30,1), rgba(59,130,246,0.3))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '350px'
      }} />
      <div style={{ 
        flex: '1 1 400px',
        padding: '3rem', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <BookOpen size={16} color={C.blueBright} />
          <span style={{ 
            fontFamily: FONT.condensed, fontWeight: 800, fontSize: '0.8rem', 
            color: C.blueBright, letterSpacing: '0.1em', textTransform: 'uppercase' 
          }}>
            Featured Personal Essay
          </span>
        </div>
        
        <h3 style={{ 
          fontFamily: FONT.display, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', 
          color: C.textBright, marginBottom: '1rem', lineHeight: 1.2 
        }}>
          {essay.title}
        </h3>
        
        {meta.author && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.muted, fontSize: '0.9rem', marginBottom: '1.25rem', fontFamily: FONT.body }}>
            <User size={14} /> <span>By {meta.author}</span>
          </div>
        )}
        
        <p style={{ color: C.text, fontSize: '1.05rem', lineHeight: 1.6, fontFamily: FONT.body, marginBottom: '2rem' }}>
          {meta.abstract || 'A deep and personal reflection on the ongoing cultural shift.'}
        </p>
        
        <a href={meta.url || '#'} target="_blank" rel="noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          color: C.goldBright, fontFamily: FONT.condensed, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none',
          transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = C.goldBright}
        >
          Read Full Essay <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}
