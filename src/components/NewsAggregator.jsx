import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ExternalLink, ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { C, FONT } from '../styles/tokens';
import ThinkingSpirograph from './ThinkingSpirograph';
import { getFaviconUrl } from '../utils/newsLens';
import CausticsBackground from './CausticsBackground';
import { resolveItemRoute } from '../utils/routing';

export default function NewsAggregator({ compact = false }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      let newsData = [];
      try {
        const newsTypeList = ['external_news', 'essay', 'recap', 'article', 'internal_news'];
        const archiveTypeList = ['newspaper_clipping', 'medical_journal', 'policy_guideline', 'legal_document', 'pdf'];
        const okStatus = (d) => ['ingested', 'indexed', 'published'].includes(d.status);

        const res = await fetch(`/api/cms?types=${newsTypeList.join(',')}&hide_rejected=1&sort=published&limit=100`);
        const data = await res.json();
        let filtered = (data.data || data).filter(d => newsTypeList.includes(d.type) && okStatus(d));

        // No news yet? Fall back to the most recent archive documents so the slider isn't empty.
        if (filtered.length === 0) {
          const res2 = await fetch(`/api/cms?types=${archiveTypeList.join(',')}&limit=25`);
          const data2 = await res2.json();
          filtered = (data2.data || data2).filter(d => archiveTypeList.includes(d.type) && okStatus(d));
        }
        
        filtered.sort((a, b) => {
          const isInternal = (item) => ['essay', 'recap', 'article', 'internal_news'].includes(item.type) ? 1 : 0;
          if (isInternal(a) !== isInternal(b)) {
            return isInternal(b) - isInternal(a);
          }
          let aDate = a.published_at || '';
          let bDate = b.published_at || '';
          try { if (!aDate) aDate = a.metadata_json ? (JSON.parse(a.metadata_json).date || '') : ''; } catch(e){}
          try { if (!bDate) bDate = b.metadata_json ? (JSON.parse(b.metadata_json).date || '') : ''; } catch(e){}
          return bDate.localeCompare(aDate);
        });

        newsData = filtered;
      } catch (e) {
        console.error("Failed to fetch news", e);
      }

      if (newsData.length === 0) {
        newsData = [
          {
            id: 'mock0', type: 'recap', status: 'ingested', 
            title: 'Recap: Hadacheck v. Oregon - A Turning Point for Equal Protection',
            metadata_json: JSON.stringify({
              source_publication: 'Intactivist Legal Desk', date: '2026-09-30', 
              image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1200&auto=format&fit=crop',
              abstract: 'Our detailed breakdown of the oral arguments in the Hadacheck case, focusing on the equal protection clause and implications for future litigation.'
            })
          },
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
          }
        ];
      }
      setNews(newsData);
      setLoading(false);
    };
    fetchNews();
  }, []);

  // Auto-advance
  useEffect(() => {
    if (news.length === 0 || isPaused || compact) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [news, isPaused, compact]);

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
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center', color: C.dim, fontFamily: FONT.condensed }}>
        <ThinkingSpirograph size={60} text={null} />
        <div>Syncing latest global intelligence...</div>
      </div>
    );
  }

  if (news.length === 0) return null;

  const topNews = news.slice(0, compact ? 10 : 5);

  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {topNews.map((item, i) => {
          let meta = {};
          try { meta = item.metadata_json ? JSON.parse(item.metadata_json) : {}; } catch(e){}
          const isInternal = ['essay', 'recap', 'article', 'internal_news'].includes(item.type) || !(meta.url || item.url);
          const route = resolveItemRoute(item, meta);
          const externalUrl = !isInternal ? (meta.url || item.url) : null;
          const CardElement = externalUrl ? 'a' : Link;
          const linkProps = externalUrl 
            ? { href: externalUrl, target: '_blank', rel: 'noreferrer' } 
            : { to: route.path };
          
          return (
            <CardElement 
              key={item.id || i} 
              {...linkProps}
              style={{
                display: 'block',
                textDecoration: 'none',
                paddingBottom: '1.2rem',
                borderBottom: i === topNews.length - 1 ? 'none' : `1px solid ${C.ghost}`,
              }}
              className="lux-hover-lift"
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {(meta.image_url || meta.og_image) && (
                  <div style={{ flexShrink: 0, width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.ghost}` }}>
                    <img src={meta.image_url || meta.og_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 800, fontFamily: FONT.condensed, textTransform: 'uppercase', letterSpacing: '0.12em',
                      color: isInternal ? C.blueBright : C.goldBright,
                      background: isInternal ? 'rgba(59, 130, 246, 0.1)' : 'rgba(212, 160, 48, 0.1)',
                      padding: '0.15rem 0.4rem', borderRadius: '4px',
                    }}>
                      {meta.publisher || meta.source_publication || (isInternal ? (item.type === 'recap' ? 'Internal Archives' : 'Original') : 'External')}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: C.dim, fontFamily: FONT.mono, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={10} /> {meta.date || 'Recent'}
                    </span>
                  </div>
                  <h4 style={{ 
                    margin: '0 0 0.4rem 0', fontFamily: FONT.display, fontSize: '1.05rem', 
                    color: C.textBright, lineHeight: 1.3
                  }}>
                    {item.title}
                  </h4>
                  <span style={{
                    color: C.goldBright, fontSize: '0.75rem', fontFamily: FONT.condensed, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.3rem'
                  }}>
                    {item.type === 'recap' ? 'Read Digest' : isInternal ? 'Read Article' : 'Read'} {externalUrl ? <ExternalLink size={11} /> : <ArrowRight size={11} />}
                  </span>
                </div>
              </div>
            </CardElement>
          );
        })}
      </div>
    );
  }

  return (
    <div 
      style={{ 
        position: 'relative', 
        height: '100%', 
        width: '100%',
        overflow: 'hidden', 
        borderRadius: '24px',
        gridColumn: 'span 8',
        gridRow: 'span 2',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,160,48,0.1)',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
        {topNews.map((item, i) => {
          let meta = {};
          try { meta = item.metadata_json ? JSON.parse(item.metadata_json) : {}; } catch(e){}
          const isCurrent = i === currentIndex;
          const imageUrl = meta.image_url || meta.og_image || '';
          const isInternal = ['essay', 'recap', 'article', 'internal_news'].includes(item.type) || !(meta.url || item.url);
          const route = resolveItemRoute(item, meta);
          const externalUrl = !isInternal ? (meta.url || item.url) : null;
          const SlideElement = externalUrl ? 'a' : Link;
          const slideProps = externalUrl 
            ? { href: externalUrl, target: '_blank', rel: 'noreferrer' } 
            : { to: route.path };
          
          return (
            <SlideElement 
              key={item.id || i} 
              {...slideProps}
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
                backgroundColor: imageUrl ? 'transparent' : '#0A0A12',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 8s ease',
                transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
              }}>
                {!imageUrl && <CausticsBackground textSeed={item.title || item.id} themeColor={isInternal ? "rgba(59, 130, 246, 0.4)" : "rgba(212, 160, 48, 0.4)"} />}
              </div>

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
                  {isInternal ? (
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 800,
                      fontFamily: FONT.condensed,
                      color: C.blueBright,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      background: 'rgba(59, 130, 246, 0.15)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                    }}>
                      {meta.publisher || meta.source_publication || 'Advocacy Shell Original'}
                    </span>
                  ) : (
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
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}>
                      {(meta.url || item.url) && (
                        <img src={getFaviconUrl(meta.url || item.url)} alt="" style={{ width: 12, height: 12, borderRadius: '2px', opacity: 0.8 }} onError={(e) => e.target.style.display = 'none'} />
                      )}
                      {meta.publisher || meta.source_publication || 'External Source'}
                    </span>
                  )}
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
                    {meta.abstract.replace(/¶/g, ' ').length > 180 
                      ? meta.abstract.replace(/¶/g, ' ').substring(0, 180) + '...' 
                      : meta.abstract.replace(/¶/g, ' ')}
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
                  {item.type === 'recap' ? 'Read Movement Digest' : isInternal ? 'Read Full Article' : 'Read Full Story'} {externalUrl ? <ExternalLink size={13} /> : <ArrowRight size={13} />}
                </span>
              </div>
            </SlideElement>
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
        {/* Progress Dots inside the absolute overlay */}
        <div style={{ position: 'absolute', top: '1.5rem', right: '2rem', display: 'flex', gap: '0.5rem', zIndex: 30 }}>
          {topNews.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(i); }}
              style={{
                width: i === currentIndex ? 28 : 8,
                height: 8,
                borderRadius: 4,
                background: i === currentIndex ? C.goldBright : 'rgba(255,255,255,0.3)',
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
