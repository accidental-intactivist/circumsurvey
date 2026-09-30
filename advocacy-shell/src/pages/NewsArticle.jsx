import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ExternalLink, ArrowLeft } from 'lucide-react';
import CommentsWidget from '../components/CommentsWidget';
import { useReport } from '../contexts/ReportContext';
import AutoEntityLinker from '../components/AutoEntityLinker';

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
          <span style={{ color: 'var(--c-goldBright)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
            {meta.source_publication || article.source_collection}
          </span>
          {meta.date && (
            <span style={{ color: 'var(--c-dim)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} /> {new Date(meta.date).toLocaleDateString()}
            </span>
          )}
        </div>
        
        <h1 style={{ fontSize: '2.5rem', color: 'var(--c-textBright)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          {meta.academic_title || article.title}
        </h1>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <a 
            href={article.url} 
            target="_blank" 
            rel="noreferrer" 
            className="lux-hover-lift"
            style={{ background: 'var(--c-blue)', color: '#000', padding: '0.8rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
          >
            Read Full Source Article <ExternalLink size={18} />
          </a>
          <button 
            onClick={handleShare}
            className="lux-hover-bright"
            style={{ background: 'transparent', border: '1px solid var(--c-ghost)', color: 'var(--c-text)', padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
          >
            Copy Share Link
          </button>
        </div>

        <div style={{ background: 'var(--c-bgSoft)', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid var(--c-blue)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--c-textBright)' }}>Summary & Abstract</h3>
          <p style={{ color: 'var(--c-text)', lineHeight: 1.8, fontSize: '1.1rem', margin: 0 }}>
            <AutoEntityLinker 
               text={meta.abstract || meta.summary || "No summary available."} 
               entities={[...(meta.key_people || []), ...(meta.organizations || [])]} 
            />
          </p>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--c-textBright)', marginBottom: '1rem', borderBottom: '1px solid var(--c-ghost)', paddingBottom: '1rem' }}>Discussion</h2>
        <CommentsWidget docId={article.id} title={meta.academic_title || article.title} />
      </div>
    </div>
  );
}
