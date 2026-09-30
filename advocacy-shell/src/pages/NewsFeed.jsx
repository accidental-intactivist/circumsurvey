import React, { useState, useEffect } from 'react';
import { ExternalLink, Calendar, Search, Filter } from 'lucide-react';
import NewsAggregator from '../components/NewsAggregator';
import { C, FONT } from '../styles/tokens';

export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [publisherFilter, setPublisherFilter] = useState('All');

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/cms?limit=50');
        if (res.ok) {
          const data = await res.json();
          const docs = data.data || data;
          const filtered = docs.filter(d => d.type === 'external_news');
          setArticles(filtered);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchNews();
  }, []);

  // Compute unique publishers for the filter dropdown
  const publishers = ['All', ...new Set(articles.map(a => {
    try {
      const meta = JSON.parse(a.metadata_json);
      return meta.publisher || meta.source_publication || 'Unknown';
    } catch { return 'Unknown'; }
  }).filter(p => p !== 'Unknown'))];

  const filteredArticles = articles.filter(article => {
    let meta = {};
    try { meta = JSON.parse(article.metadata_json); } catch(e){}
    
    const searchString = `${article.title || ''} ${meta.abstract || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    
    const publisher = meta.publisher || meta.source_publication || 'Unknown';
    const matchesPublisher = publisherFilter === 'All' || publisher === publisherFilter;

    return matchesSearch && matchesPublisher;
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '3rem', color: C.textBright, marginBottom: '1rem', fontFamily: FONT.display }}>Field Notes</h1>
      <p style={{ color: C.muted, fontSize: '1.2rem', marginBottom: '3rem', fontFamily: FONT.body, lineHeight: 1.6 }}>
        Curated updates on genital autonomy ethics, international medical consensus, and the worldwide advocacy movement.
      </p>

      {/* Top 5 dynamic slider */}
      <NewsAggregator />

      <hr style={{ border: 0, borderTop: `1px solid ${C.borderMuted}`, margin: '4rem 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '2rem', color: C.textBright, fontFamily: FONT.display }}>All Coverage</h2>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.dim }} />
            <input 
              type="text" 
              placeholder="Search keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', borderRadius: '4px', border: `1px solid ${C.borderMuted}`, background: C.card, color: C.text, fontFamily: FONT.body, outline: 'none' }}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.dim }} />
            <select 
              value={publisherFilter}
              onChange={(e) => setPublisherFilter(e.target.value)}
              style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', borderRadius: '4px', border: `1px solid ${C.borderMuted}`, background: C.card, color: C.text, fontFamily: FONT.body, outline: 'none', appearance: 'none', cursor: 'pointer' }}
            >
              {publishers.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: C.dim, textAlign: 'center', padding: '2rem' }}>Loading latest updates...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {filteredArticles.length === 0 ? (
            <div style={{ color: C.dim, textAlign: 'center', padding: '2rem' }}>No articles found matching your criteria.</div>
          ) : (
            filteredArticles.map(article => {
              let meta = {};
              try { meta = JSON.parse(article.metadata_json); } catch(e){}
              
              return (
                <div key={article.id} style={{ background: C.card, border: `1px solid ${C.borderMuted}`, borderRadius: '12px', padding: '2rem', transition: 'border-color 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.borderColor = C.goldBright}
                     onMouseLeave={e => e.currentTarget.style.borderColor = C.borderMuted}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ color: C.blue, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: FONT.condensed, fontWeight: 800 }}>
                      {meta.publisher || meta.source_publication || article.source_collection || 'External Source'}
                    </span>
                    <span style={{ color: C.dim, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: FONT.mono }}>
                      <Calendar size={14} /> {meta.date || meta.published_at?.split('T')[0] || article.created_at?.split('T')[0] || 'Recent'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: C.textBright, marginBottom: '1rem', lineHeight: 1.3, fontFamily: FONT.display, margin: '0 0 1rem 0' }}>
                    {meta.title || article.title}
                  </h3>
                  <p style={{ color: C.text, lineHeight: 1.6, marginBottom: '1.5rem', fontFamily: FONT.body }}>
                    {meta.abstract || meta.summary || "No summary available."}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <a 
                      href={meta.url || article.url || '#'} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="lux-hover-lift"
                      style={{ background: 'rgba(212, 160, 48, 0.1)', color: C.goldBright, padding: '0.6rem 1.2rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontFamily: FONT.condensed, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                    >
                      Read Full Article <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
