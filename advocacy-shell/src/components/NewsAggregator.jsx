import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ExternalLink, ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { C, FONT } from '../styles/tokens';

export default function NewsAggregator() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/cms?limit=12');
        const data = await res.json();
        const docs = data.data || data;
        
        let filtered = docs.filter(d => d.type === 'external_news' && d.status === 'ingested');
        
        if (filtered.length === 0) {
          filtered = [
            {
              id: 'mock1', type: 'external_news', status: 'ingested', 
              title: 'Landmark Equal Protection Challenge Filed in Washington State',
              metadata_json: JSON.stringify({
                source_publication: 'Legal Times', date: '2026-09-29', 
                image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1200&auto=format&fit=crop',
                abstract: 'A new coalition files a landmark lawsuit claiming equal protection violations in neonatal procedures, marking the first major federal case of its kind.'
              })
            },
            {
              id: 'mock2', type: 'external_news', status: 'ingested', 
              title: 'Medical Association Reviews Informed Consent Guidelines',
              metadata_json: JSON.stringify({
                source_publication: 'Health Policy Weekly', date: '2026-09-28', 
                image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
                abstract: 'The national medical board begins a formal review of infant consent policies amid growing international pressure from human rights organizations.'
              })
            },
            {
              id: 'mock3', type: 'external_news', status: 'ingested', 
              title: 'Advocacy Groups Demand Transparency in Clinical Data',
              metadata_json: JSON.stringify({
                source_publication: 'Civil Rights Daily', date: '2026-09-25', 
                image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1200&auto=format&fit=crop',
                abstract: 'A coalition of advocacy groups rally for transparent clinical data following the release of a controversial long-term impact study.'
              })
            },
            {
              id: 'mock4', type: 'external_news', status: 'ingested',
              title: 'European Parliament Debates Resolution on Bodily Autonomy',
              metadata_json: JSON.stringify({
                source_publication: 'EU Observer', date: '2026-09-22',
                image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
                abstract: 'Members of the European Parliament introduce a non-binding resolution calling for the protection of children\'s rights to bodily integrity across all member states.'
              })
            },
            {
              id: 'mock5', type: 'external_news', status: 'ingested',
              title: 'New Study Links Early Trauma to Long-Term Psychological Outcomes',
              metadata_json: JSON.stringify({
                source_publication: 'Journal of Pediatric Psychology', date: '2026-09-18',
                image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1200&auto=format&fit=crop',
                abstract: 'A peer-reviewed longitudinal study involving over 10,000 participants finds significant correlations between neonatal procedures and adult psychological outcomes.'
              })
            }
          ];
        }
        setNews(filtered);
      } catch (e) {
        console.error("Failed to fetch news", e);
      }
      setLoading(false);
    };
    fetchNews();
  }, []);

  // Auto-advance
  useEffect(() => {
    if (news.length === 0 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [news, isPaused]);

  const goTo = useCallback((i) => {
    setCurrentIndex(i);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000); // Resume after 10s
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + news.length) % news.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  }, [news.length]);

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % news.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  }, [news.length]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: C.dim, fontFamily: FONT.condensed }}>
        Syncing latest global intelligence...
      </div>
    );
  }

  if (news.length === 0) return null;

  const topNews = news.slice(0, 5);

  return (
    <div style={{ marginBottom: '4rem' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Newspaper size={24} style={{ color: C.goldBright }} />
          <h2 style={{ margin: 0, fontFamily: FONT.display, fontSize: '1.8rem', color: C.textBright }}>
            Global Intelligence Desk
          </h2>
        </div>
        <Link to="/news" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: C.goldBright, textDecoration: 'none',
          fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.85rem',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }} className="lux-hover-lift">
          View All Coverage <ArrowRight size={14} />
        </Link>
      </div>
      
      <p style={{ color: C.muted, fontSize: '0.95rem', lineHeight: 1.6, fontFamily: FONT.body, marginBottom: '1.5rem', maxWidth: '800px' }}>
        Top headlines and legal developments surrounding genital autonomy, sourced by our continuous intelligence tracker.
      </p>

      {/* Full-Bleed Image Carousel */}
      <div 
        style={{ 
          position: 'relative', 
          height: '380px', 
          overflow: 'hidden', 
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,160,48,0.1)',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {topNews.map((item, i) => {
          const meta = item.metadata_json ? JSON.parse(item.metadata_json) : {};
          const isCurrent = i === currentIndex;
          const imageUrl = meta.image_url || meta.og_image || '';
          
          return (
            <a 
              key={item.id || i} 
              href={meta.url || item.url || '#'}
              target="_blank"
              rel="noreferrer"
              style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                display: 'block',
                transform: `translateX(${(i - currentIndex) * 100}%)`,
                transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: Math.abs(i - currentIndex) > 1 ? 0 : 1,
                zIndex: isCurrent ? 10 : 1,
                textDecoration: 'none',
              }}
            >
              {/* Background Image */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                backgroundColor: imageUrl ? 'transparent' : 'rgba(20, 20, 30, 0.9)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 8s ease',
                transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
              }} />

              {/* Gradient Overlay — strong on bottom for text readability */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: `
                  linear-gradient(
                    to bottom,
                    rgba(10, 10, 18, 0.15) 0%,
                    rgba(10, 10, 18, 0.3) 30%,
                    rgba(10, 10, 18, 0.7) 60%,
                    rgba(10, 10, 18, 0.92) 100%
                  )
                `,
              }} />

              {/* Content Overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                padding: '2rem 2.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}>
                {/* Source + Date Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 800,
                    fontFamily: FONT.condensed,
                    color: C.goldBright,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    background: 'rgba(212, 160, 48, 0.15)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(212, 160, 48, 0.25)',
                  }}>
                    {meta.publisher || meta.source_publication || 'External Source'}
                  </span>
                  <span style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)',
                    fontFamily: FONT.mono 
                  }}>
                    <Clock size={11} />
                    {meta.date || 'Recent'}
                  </span>
                </div>
                
                {/* Headline */}
                <h3 style={{ 
                  margin: 0, 
                  fontFamily: FONT.display, 
                  fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', 
                  color: '#fff',
                  lineHeight: 1.25,
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  maxWidth: '700px',
                }}>
                  {item.title}
                </h3>
                
                {/* Abstract */}
                {meta.abstract && (
                  <p style={{ 
                    margin: 0, 
                    color: 'rgba(255,255,255,0.7)', 
                    fontSize: '0.9rem', 
                    lineHeight: 1.5, 
                    fontFamily: FONT.body,
                    maxWidth: '650px',
                    textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  }}>
                    {meta.abstract.length > 180 ? meta.abstract.substring(0, 180) + '...' : meta.abstract}
                  </p>
                )}

                {/* Read More Link */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: C.goldBright,
                  fontSize: '0.8rem',
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginTop: '0.25rem',
                }}>
                  Read Full Story <ExternalLink size={13} />
                </span>
              </div>
            </a>
          );
        })}

        {/* Prev/Next Arrows */}
        {topNews.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.preventDefault(); goPrev(); }}
              style={{
                position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)',
                zIndex: 20, width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,160,48,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); goNext(); }}
              style={{
                position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)',
                zIndex: 20, width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,160,48,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Progress Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        {topNews.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === currentIndex ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: i === currentIndex ? C.goldBright : 'rgba(255,255,255,0.15)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: i === currentIndex ? `0 0 12px rgba(212, 160, 48, 0.4)` : 'none',
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
