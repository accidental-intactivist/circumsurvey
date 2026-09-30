import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ExternalLink, ArrowRight, Clock } from 'lucide-react';
import { C, FONT } from '../styles/tokens';
import { generateFriendlySlug } from '../utils/slugs';

export default function NewsAggregator() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/cms?limit=5');
        const data = await res.json();
        const docs = data.data || data;
        
        let filtered = docs.filter(d => d.type === 'external_news' && d.status === 'ingested');
        
        if (filtered.length === 0) {
          filtered = [
            {
              id: 'mock1', type: 'external_news', status: 'ingested', title: 'Landmark Equal Protection Challenge Filed',
              metadata_json: JSON.stringify({
                source_publication: 'Legal Times', date: '2026-09-29', image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop',
                abstract: 'A new coalition files a landmark lawsuit claiming equal protection violations in neonatal procedures.'
              })
            },
            {
              id: 'mock2', type: 'external_news', status: 'ingested', title: 'Medical Association Reviews Consent Guidelines',
              metadata_json: JSON.stringify({
                source_publication: 'Health Policy Weekly', date: '2026-09-28', image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop',
                abstract: 'The national medical board begins a formal review of infant consent policies amid growing international pressure.'
              })
            },
            {
              id: 'mock3', type: 'external_news', status: 'ingested', title: 'Advocacy Groups Demand Data Transparency',
              metadata_json: JSON.stringify({
                source_publication: 'Civil Rights Daily', date: '2026-09-25', image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=600&auto=format&fit=crop',
                abstract: 'Groups rally for transparent clinical data following the release of a controversial long-term impact study.'
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

  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(news.length, 5));
    }, 6000);
    return () => clearInterval(interval);
  }, [news]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: C.dim, fontFamily: FONT.condensed }}>
        Syncing latest global intelligence...
      </div>
    );
  }

  if (news.length === 0) {
    return null; // Don't show the section if no news yet
  }

  const topNews = news.slice(0, 5);

  return (
    <div style={{ marginBottom: '5rem' }}>
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
      
      <p style={{ color: C.muted, fontSize: '0.95rem', lineHeight: 1.6, fontFamily: FONT.body, marginBottom: '2rem', maxWidth: '800px' }}>
        Top headlines and legal developments surrounding genital autonomy, sourced by our continuous intelligence tracker.
      </p>

      {/* Sliding Carousel */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden', borderRadius: '8px' }}>
        {topNews.map((item, i) => {
          const meta = item.metadata_json ? JSON.parse(item.metadata_json) : {};
          const isCurrent = i === currentIndex;
          
          return (
            <a 
              key={item.id || i} 
              href={meta.url || item.url || '#'}
              target="_blank"
              rel="noreferrer"
              style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                display: 'block', padding: '1.5rem', background: C.card,
                border: `1px solid ${isCurrent ? C.goldBright : C.borderMuted}`, 
                borderRadius: '8px', boxSizing: 'border-box',
                textDecoration: 'none', 
                transform: `translateX(${(i - currentIndex) * 100}%)`,
                transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.6s ease',
                opacity: Math.abs(i - currentIndex) > 1 ? 0 : 1, // Only render adjacent for perf
                zIndex: isCurrent ? 10 : 1
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,160,48,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.card; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: FONT.condensed, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {meta.publisher || meta.source_publication || 'External Source'}
                    </span>
                    <span style={{ color: C.ghost }}>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: C.dim, fontFamily: FONT.mono }}>
                      <Clock size={12} />
                      {meta.date || meta.published_at?.split('T')[0] || item.created_at?.split('T')[0] || 'Recent'}
                    </span>
                  </div>
                  
                  <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: FONT.display, fontSize: '1.35rem', color: C.textBright, lineHeight: 1.3 }}>
                    {item.title}
                  </h3>
                  
                  {meta.abstract && (
                    <p style={{ margin: 0, color: C.text, fontSize: '0.9rem', lineHeight: 1.5, fontFamily: FONT.body, opacity: 0.8 }}>
                      {meta.abstract.length > 150 ? meta.abstract.substring(0, 150) + '...' : meta.abstract}
                    </p>
                  )}
                </div>
                
                {meta.image_url ? (
                  <div style={{
                    width: 160, height: '100%', minHeight: 120, flexShrink: 0, 
                    borderRadius: '6px', overflow: 'hidden', 
                    position: 'relative'
                  }}>
                    <img src={meta.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <ExternalLink size={16} />
                    </div>
                  </div>
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(212, 160, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: C.goldBright }}>
                    <ExternalLink size={18} />
                  </div>
                )}
              </div>
            </a>
          );
        })}
      </div>
      
      {/* Dots Indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        {topNews.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            style={{
              width: i === currentIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === currentIndex ? C.goldBright : C.ghost,
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
