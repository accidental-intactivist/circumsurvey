import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Sparkles } from 'lucide-react';
import NewsAggregator from '../components/NewsAggregator';
import { C, FONT } from '../styles/tokens';
import { resolveItemRoute } from '../utils/routing';
import { resolveCollectionName } from '../utils/collections';
import { NEWS_CATEGORIES, LEANS, parseMeta, storyDate, flaggedClaimCount, getFaviconUrl } from '../utils/newsLens';
import { CategoryChip, LeanPill, ContextBadge, CoverageCount, CoverageBalanceBar } from '../components/LensChips';
import UniversalSquishHeader from '../components/Scrollytelling/UniversalSquishHeader';
import ArchiveHamburgerMenu from '../components/ArchiveHamburgerMenu';
import AutoEntityLinker from '../components/AutoEntityLinker';
import { useTheme } from '../contexts/ThemeContext';

const NEWS_TYPES = ['external_news', 'recap', 'essay', 'article', 'internal_news', 'press_release', 'blog_post'];

export default function NewsFeed() {
  const { theme } = useTheme();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [leanFilter, setLeanFilter] = useState('All');

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch(`/api/cms?types=${NEWS_TYPES.join(',')}&hide_rejected=1&sort=published&limit=250`);
        if (res.ok) {
          const data = await res.json();
          const docs = data.data || data;
          setArticles(docs.filter(d => NEWS_TYPES.includes(d.type) && d.status !== 'rejected').map(d => ({ ...d, _meta: parseMeta(d) })));
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchNews();
  }, []);

  // Coverage balance for the last 7 days (external stories only)
  const weekBalance = useMemo(() => {
    const since = Date.now() - 7 * 86400000;
    const bal = Object.fromEntries(LEANS.map(l => [l.key, 0]));
    articles.forEach(a => {
      const lean = a._meta.lens?.coverage_lean;
      const t = Date.parse(a.published_at || a.created_at || '');
      if (a.type === 'external_news' && lean && t >= since) bal[lean] += 1;
    });
    return bal;
  }, [articles]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    articles.forEach(a => { if (a.category) counts[a.category] = (counts[a.category] || 0) + 1; });
    return counts;
  }, [articles]);

  const filteredArticles = articles.filter(article => {
    const meta = article._meta;
    const searchString = `${article.title || ''} ${meta.abstract || ''} ${meta.source_publication || ''} ${(meta.tags || []).join(' ')}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || article.category === categoryFilter;
    const matchesLean = leanFilter === 'All' || meta.lens?.coverage_lean === leanFilter;
    return matchesSearch && matchesCategory && matchesLean;
  });

  const activeCategories = NEWS_CATEGORIES.filter(c => categoryCounts[c.key]);
  const themeKey = `${theme}-dark-none`;

  return (
    <div style={{ background: 'var(--c-bg)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <UniversalSquishHeader
        themeKey={themeKey}
        startVh={45}
        title="Field Notes & Headlines"
        underloomFormation="pulsar"
        navLeftContent={
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ opacity: 0.6 }}>The Accidental Intactivist's Guide</span>
          </Link>
        }
        subtitle={
          <div style={{ maxWidth: '700px', margin: '1rem auto 0', color: 'var(--c-dim)', fontSize: '1.2rem', fontFamily: 'var(--f-body)', lineHeight: 1.6 }}>
            The pulse of the genital autonomy movement and the decline of routine infant circumcision, with every story
            labeled by topic and framing, and sourced context where claims need it.
          </div>
        }
        navRightContent={<ArchiveHamburgerMenu />}
      />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 2rem' }}>

        {/* Weekly coverage balance */}
      {LEANS.some(l => weekBalance[l.key]) && (
        <div className="lux-hover-lift" style={{ background: C.card, border: `1px solid ${C.borderMuted}`, borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontFamily: FONT.condensed, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.8rem', color: C.goldBright }}>
              This week&apos;s coverage framing
            </span>
            <span style={{ fontFamily: FONT.body, fontSize: '0.85rem', color: C.dim }}>How outlets framed infant circumcision in the past 7 days</span>
          </div>
          <CoverageBalanceBar balance={weekBalance} />
        </div>
      )}

      {/* Top 5 dynamic slider (needs an explicit height: its slides are absolutely positioned) */}
      <div style={{ height: '460px' }}>
        <NewsAggregator />
      </div>

      <hr style={{ border: 0, borderTop: `1px solid ${C.borderMuted}`, margin: '4rem 0 3rem' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '2rem', color: C.textBright, fontFamily: FONT.display }}>All Coverage</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.dim }} />
            <input
              id="news-search"
              type="text"
              placeholder="Search keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', borderRadius: '6px', border: `1px solid ${C.borderMuted}`, background: C.card, color: C.text, fontFamily: FONT.body, outline: 'none' }}
            />
          </div>
          <select
            id="news-lean-filter"
            value={leanFilter}
            onChange={(e) => setLeanFilter(e.target.value)}
            title="Filter by coverage framing"
            style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: `1px solid ${C.borderMuted}`, background: C.card, color: C.text, fontFamily: FONT.body, outline: 'none', cursor: 'pointer' }}
          >
            <option value="All">All framings</option>
            {LEANS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {/* Category chips */}
      {activeCategories.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
          <span
            id="news-category-all"
            onClick={() => setCategoryFilter('All')}
            style={{ padding: '0.22rem 0.7rem', borderRadius: 999, cursor: 'pointer', fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: categoryFilter === 'All' ? '#000' : C.text, background: categoryFilter === 'All' ? C.goldBright : 'transparent', border: `1px solid ${categoryFilter === 'All' ? C.goldBright : C.borderMuted}` }}
          >
            All · {articles.length}
          </span>
          {activeCategories.map(c => (
            <CategoryChip key={c.key} category={c.key} active={categoryFilter === c.key} onClick={() => setCategoryFilter(categoryFilter === c.key ? 'All' : c.key)} />
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ color: C.dim, textAlign: 'center', padding: '2rem' }}>Loading latest updates...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredArticles.length === 0 ? (
            <div style={{ color: C.dim, textAlign: 'center', padding: '2rem' }}>No articles found matching your criteria.</div>
          ) : (
            filteredArticles.map(article => {
              const meta = article._meta;
              const lens = meta.lens || {};
              const route = resolveItemRoute(article, meta);
              const isRecap = article.type === 'recap';
              const outlets = 1 + (meta.also_covered_by || []).length;

              return (
                <Link
                  key={article.id}
                  to={route.path}
                  className="lux-hover-lift"
                  style={{ display: 'block', textDecoration: 'none', background: isRecap ? 'linear-gradient(135deg, rgba(242,193,78,0.08), transparent 60%), var(--c-bgCard)' : C.card, border: `1px solid ${isRecap ? 'rgba(242,193,78,0.35)' : C.borderMuted}`, borderRadius: '14px', padding: '1.75rem 2rem', transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.goldBright}
                  onMouseLeave={e => e.currentTarget.style.borderColor = isRecap ? 'rgba(242,193,78,0.35)' : C.borderMuted}
                >
                  <div>
                    {(meta.image_url || meta.og_image) && (
                      <div style={{ float: 'left', width: '220px', marginRight: '1.5rem', marginBottom: '0.75rem', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.borderMuted}`, display: 'flex', flexDirection: 'column' }}>
                        <img src={meta.image_url || meta.og_image} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                        {meta.image_attribution && (
                          <span style={{ fontSize: '0.65rem', padding: '0.3rem 0.5rem', background: C.bgCard, color: C.dim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {meta.image_attribution}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ color: isRecap ? C.goldBright : C.blue, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: FONT.condensed, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {isRecap && <Sparkles size={14} />}
                        {article.type === 'external_news' && meta.url && (
                          <img src={getFaviconUrl(meta.url)} alt="" style={{ width: 14, height: 14, borderRadius: '2px' }} onError={(e) => e.target.style.display = 'none'} />
                        )}
                        {meta.source_publication || resolveCollectionName(article, 'External Source')}
                      </span>
                      <span style={{ color: C.dim, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: FONT.mono }}>
                        <Calendar size={14} /> {storyDate(article, meta) || 'Recent'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.9rem' }}>
                      {article.category && <CategoryChip category={article.category} />}
                      {lens.coverage_lean && <LeanPill lean={lens.coverage_lean} />}
                      <CoverageCount count={outlets} />
                      <ContextBadge count={flaggedClaimCount(meta)} />
                    </div>

                    <h3 style={{ fontSize: '1.45rem', color: C.textBright, lineHeight: 1.3, fontFamily: FONT.display, margin: '0 0 0.75rem 0' }}>
                      {isRecap ? article.title : (meta.academic_title || article.title)}
                    </h3>
                    
                    <div style={{ color: C.text, lineHeight: 1.6, margin: '0 0 0.75rem 0', fontFamily: FONT.body }}>
                      <AutoEntityLinker 
                        text={meta.abstract || meta.summary || 'No summary available.'} 
                        entities={[...(meta.key_people || []), ...(meta.organizations || [])]} 
                      />
                    </div>

                    {meta.why_it_matters && (
                      <p style={{ color: C.blue, fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 0.75rem 0', fontFamily: FONT.body }}>
                        {meta.why_it_matters}
                      </p>
                    )}
                    
                    <div style={{ clear: 'both' }}></div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
      </div>
    </div>
  );
}
