import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import CommentsWidget from '../components/CommentsWidget';
import { useReport } from '../contexts/ReportContext';
import AutoEntityLinker from '../components/AutoEntityLinker';
import { SourceLensPanel, ContextNotes, AlsoCoveredBy, DigestPulse } from '../components/SourceLensPanel';
import { CategoryChip, LeanPill, ContextBadge } from '../components/LensChips';
import { storyDate, flaggedClaimCount, getFaviconUrl } from '../utils/newsLens';

export default function NewsArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToReport } = useReport();

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/cms/${id}`);
        if (res.ok) {
          const data = await res.json();
          setArticle(data);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem', color: 'var(--c-dim)' }}>
        Loading article details...
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem', color: 'var(--c-textBright)' }}>
        <h2>Article not found</h2>
        <Link to="/news" style={{ color: 'var(--c-blue)' }}>Return to News Feed</Link>
      </div>
    );
  }

  let meta = {};
  try { meta = JSON.parse(article.metadata_json); } catch(e){}

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
      <Link to="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-blue)', textDecoration: 'none', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to News Feed
      </Link>

      <div style={{ background: 'var(--c-bgDeep)', border: '1px solid var(--c-borderMuted)', borderRadius: '12px', padding: '2.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <span style={{ color: 'var(--c-goldBright)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {article.type === 'external_news' && article.url && article.url !== '#' && (
              <img src={getFaviconUrl(article.url)} alt="" style={{ width: 16, height: 16, borderRadius: '2px' }} onError={(e) => e.target.style.display = 'none'} />
            )}
            {meta.source_publication || article.source_collection}
          </span>
          {(article.published_at || meta.date) && (
            <span style={{ color: 'var(--c-dim)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} /> {storyDate(article, meta)}
            </span>
          )}
        </div>

        {(article.category || meta.lens) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {article.category && <CategoryChip category={article.category} />}
            {meta.lens?.coverage_lean && <LeanPill lean={meta.lens.coverage_lean} />}
            <ContextBadge count={flaggedClaimCount(meta)} />
          </div>
        )}
        
        <h1 style={{ fontSize: '2.5rem', color: 'var(--c-textBright)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          {article.type === 'recap' ? article.title : (meta.academic_title || article.title)}
        </h1>

        {meta.why_it_matters && (
          <p style={{ color: 'var(--c-goldBright)', fontStyle: 'italic', fontSize: '1.15rem', lineHeight: 1.6, margin: '-0.5rem 0 1.75rem' }}>
            {meta.why_it_matters}
          </p>
        )}
        
        {(meta.image_url || meta.og_image) && (
          <div style={{ marginBottom: '2rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--c-borderMuted)', display: 'flex', flexDirection: 'column' }}>
            <img src={meta.image_url || meta.og_image} alt="" style={{ width: '100%', maxHeight: '450px', objectFit: 'cover' }} />
            {meta.image_attribution && (
              <div style={{ padding: '0.75rem 1.5rem', background: 'var(--c-bgSoft)', color: 'var(--c-dim)', fontSize: '0.85rem', textAlign: 'right' }}>
                Photo/Image Attribution: {meta.image_attribution}
              </div>
            )}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {article.url && article.url !== '#' && article.type !== 'recap' && (
            <a 
              href={article.url} 
              target="_blank" 
              rel="noreferrer" 
              className="lux-hover-lift"
              style={{ background: 'var(--c-blue)', color: '#000', padding: '0.8rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
            >
              Read Full Source Article <ExternalLink size={18} />
            </a>
          )}
          <button 
            onClick={handleShare}
            className="lux-hover-bright"
            style={{ background: 'transparent', border: '1px solid var(--c-ghost)', color: 'var(--c-text)', padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
          >
            Copy Share Link
          </button>
        </div>

        <div style={{ background: 'var(--c-bgSoft)', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid var(--c-blue)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--c-textBright)' }}>{article.type === 'recap' ? 'Overview' : 'Summary'}</h3>
          <p style={{ color: 'var(--c-text)', lineHeight: 1.8, fontSize: '1.1rem', margin: 0 }}>
            <AutoEntityLinker 
               text={(article.type !== 'recap' && meta.summary) || meta.abstract || meta.summary || "No summary available."} 
               entities={[...(meta.key_people || []), ...(meta.organizations || [])]} 
            />
          </p>
        </div>

        <SourceLensPanel meta={meta} category={article.category} />
        <ContextNotes meta={meta} />
        <AlsoCoveredBy meta={meta} url={article.url} />
        <DigestPulse meta={meta} />

        {meta.community_zeitgeist && (
          <div style={{ marginTop: '2.5rem', background: 'linear-gradient(to right, rgba(235, 171, 52, 0.1), transparent)', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid var(--c-goldBright)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--c-goldBright)' }}>Community Zeitgeist</h3>
            <p style={{ color: 'var(--c-textBright)', lineHeight: 1.8, fontSize: '1.1rem', margin: 0, fontStyle: 'italic' }}>
              <AutoEntityLinker 
                 text={meta.community_zeitgeist} 
                 entities={[...(meta.key_people || []), ...(meta.organizations || [])]} 
              />
            </p>
          </div>
        )}

        {/* Rich Digest Rendering */}
        {meta.digest_items && meta.digest_items.length > 0 && !meta.sections && (
          <div style={{ marginTop: '4rem' }}>
            <h3 style={{ color: 'var(--c-textBright)', borderBottom: '2px solid var(--c-goldBright)', paddingBottom: '0.8rem', marginBottom: '2.5rem', fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Featured in this Digest</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {meta.digest_items.map((item, idx) => (
                <div key={idx} className="lux-hover-lift" style={{ 
                  background: 'linear-gradient(145deg, var(--c-card), var(--c-bgSoft))', 
                  padding: '2.5rem', 
                  borderRadius: '16px', 
                  border: '1px solid var(--c-borderMuted)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--c-goldBright), var(--c-blue))' }} />
                  <h4 style={{ color: 'var(--c-blue)', margin: '0 0 1.2rem 0', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.3 }}>{item.title}</h4>
                  <p style={{ color: 'var(--c-text)', lineHeight: 1.8, fontSize: '1.1rem', margin: '0 0 1.5rem 0' }}>
                    <AutoEntityLinker 
                       text={item.body} 
                       entities={[...(meta.key_people || []), ...(meta.organizations || [])]} 
                    />
                  </p>
                  {item.item_id && (
                    <Link to={`/news/${item.item_id}`} className="lux-hover-bright" style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
                      background: 'var(--c-blue)', color: '#000', 
                      padding: '0.7rem 1.5rem', borderRadius: '8px', 
                      textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem',
                      transition: 'background 0.2s'
                    }}>
                      View & Discuss <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback Full Text Rendering */}
        {meta.full_text && !meta.digest_items && (
          <div style={{ marginTop: '3rem', color: 'var(--c-text)', lineHeight: 1.8, fontSize: '1.1rem' }}>
            {meta.full_text.split('\\n').map((paragraph, i) => (
              <p key={i} style={{ marginBottom: '1.5rem' }}>
                <AutoEntityLinker 
                   text={paragraph} 
                   entities={[...(meta.key_people || []), ...(meta.organizations || [])]} 
                />
              </p>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--c-textBright)', marginBottom: '1rem', borderBottom: '1px solid var(--c-ghost)', paddingBottom: '1rem' }}>Discussion</h2>
        <CommentsWidget docId={article.id} title={meta.academic_title || article.title} />
      </div>
    </div>
  );
}
