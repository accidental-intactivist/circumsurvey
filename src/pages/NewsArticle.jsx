import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ExternalLink, ArrowLeft, ArrowRight, FilePlus, Copy, PlusSquare, Sparkles, Loader, Check } from 'lucide-react';
import CommentsWidget from '../components/CommentsWidget';
import { useReport } from '../contexts/ReportContext';
import { useMediaList } from '../contexts/MediaListContext';
import { useAssistant } from '../contexts/AssistantContext';
import AutoEntityLinker from '../components/AutoEntityLinker';
import { SourceLensPanel, ContextNotes, AlsoCoveredBy, DigestPulse } from '../components/SourceLensPanel';
import { CategoryChip, LeanPill, ContextBadge } from '../components/LensChips';
import { storyDate, flaggedClaimCount, getFaviconUrl, categoryMeta } from '../utils/newsLens';
import LoomChoreography from '../components/GuidedTour/LoomChoreography';
import CausticsBackground from '../components/CausticsBackground';
import ArchivalContextDossier from '../components/news/ArchivalContextDossier';

function NewsletterSubscribeForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(() => {
    try { return localStorage.getItem('cs_newsletter_subscribed') === 'true'; } catch { return false; }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
    try {
      localStorage.setItem('cs_newsletter_subscribed', 'true');
      localStorage.setItem('cs_newsletter_email', email);
    } catch {}
  };

  if (subscribed) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.75rem 1.25rem', borderRadius: '8px',
        background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981',
        color: '#10b981', fontWeight: 700, fontSize: '0.95rem'
      }}>
        <Check size={18} />
        <span>You're subscribed! The next morning dispatch will arrive in your inbox.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center'
    }}>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email address..."
        style={{
          flex: '1 1 280px',
          padding: '0.8rem 1.1rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: 'rgba(0, 0, 0, 0.6)',
          color: '#fff',
          fontSize: '0.95rem',
          outline: 'none',
          fontFamily: "var(--f-body, sans-serif)"
        }}
      />
      <button
        type="submit"
        className="lux-hover-bright"
        style={{
          padding: '0.8rem 1.6rem',
          borderRadius: '8px',
          border: 'none',
          background: 'var(--c-gold)',
          color: '#090f15',
          fontWeight: 800,
          fontSize: '0.95rem',
          fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem'
        }}
      >
        <span>Subscribe Free</span>
        <ArrowRight size={15} />
      </button>
    </form>
  );
}

export default function NewsArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToReport } = useReport();
  const { mediaLists, createList, addToList } = useMediaList();
  const { openAssistant, setInitialQuery } = useAssistant();

  // Highlight & Cite State
  const [selection, setSelection] = useState({ text: '', x: 0, y: 0, visible: false });
  const [showListModal, setShowListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const handleMouseUp = () => {
      const activeSelection = window.getSelection();
      const text = activeSelection.toString().trim();

      if (text.length > 10) {
        const range = activeSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelection({
          text,
          x: rect.left + (rect.width / 2),
          y: rect.top + window.scrollY - 10,
          visible: true
        });
      } else {
        if (!showListModal) {
          setSelection(s => ({ ...s, visible: false }));
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [showListModal]);

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

  const handleSendToReport = (snippet, citationTitle) => {
    addToReport(`"${snippet}"`, [citationTitle]);
    setSelection({ ...selection, visible: false });
  };

  const handleCopySnippetWithCitation = (snippet, citationTitle) => {
    const citation = `${citationTitle}. ${window.location.href}`;
    const textToCopy = `"${snippet}"\n\nCitation:\n${citation}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
    setSelection({ ...selection, visible: false });
  };

  const handleCopyRaw = (snippet) => {
    navigator.clipboard.writeText(snippet);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
    setSelection({ ...selection, visible: false });
  };

  const handleSaveToList = (listId) => {
    if (listId === 'new') {
      if (!newListName) return;
      const list = createList(newListName);
      addToList(list.id, article.id);
      setNewListName('');
    } else {
      addToList(listId, article.id);
    }
    setShowListModal(false);
    setSelection({ ...selection, visible: false });
  };

  const handleAskAssistant = () => {
    setInitialQuery(`Analyze this excerpt:\n\n"${selection.text}"`);
    openAssistant();
    setSelection({ ...selection, visible: false });
  };

  const citationTitle = article.type === 'recap' ? article.title : (meta.academic_title || article.title);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem', position: 'relative' }}>
      {/* Background Underloom in Radiant Amber */}
      <div className="no-print" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.12, overflow: 'hidden' }}>
        <LoomChoreography isInline={true} forceFormation="harmonic" opacity={1} themeColor="media" />
      </div>

      {/* Floating Toolbar */}
      {selection.visible && (
        <div 
          className="lux-glide-in"
          style={{
            position: 'absolute',
            left: selection.x,
            top: selection.y - 10,
            transform: 'translate(-50%, -100%)',
            background: 'var(--c-bgCard)',
            border: '1px solid var(--c-ghost)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            zIndex: 1000,
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            width: '200px'
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              onClick={() => handleSendToReport(selection.text, citationTitle)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', background: 'var(--c-bgSoft)', border: '1px solid var(--c-ghost)', borderRadius: '6px', color: 'var(--c-textBright)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              <FilePlus size={14} /> Send to Report
            </button>
            <button 
              onClick={() => handleCopySnippetWithCitation(selection.text, citationTitle)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', background: 'var(--c-bgSoft)', border: '1px solid var(--c-ghost)', borderRadius: '6px', color: 'var(--c-textBright)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              {copiedSnippet ? <Check size={14} color="var(--c-green)" /> : <Copy size={14} />} 
              {copiedSnippet ? "Copied!" : "Copy with Citation"}
            </button>
            <button 
              onClick={() => handleCopyRaw(selection.text)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', background: 'var(--c-bgSoft)', border: '1px solid var(--c-ghost)', borderRadius: '6px', color: 'var(--c-textBright)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              {copiedRaw ? <Check size={14} color="var(--c-green)" /> : <Copy size={14} />} 
              {copiedRaw ? "Copied!" : "Copy Text Only"}
            </button>
            <button 
              onClick={() => setShowListModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', background: 'var(--c-bgSoft)', border: '1px solid var(--c-ghost)', borderRadius: '6px', color: 'var(--c-textBright)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              <PlusSquare size={14} /> Save to List
            </button>
            <button 
              onClick={handleAskAssistant}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', background: 'var(--c-blue)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              <Sparkles size={14} /> Ask Assistant
            </button>
          </div>
        </div>
      )}

      {/* Media List Modal */}
      {showListModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseDown={(e) => e.stopPropagation()}>
          <div className="lux-glide-in" style={{ background: 'var(--c-bgCard)', padding: '2rem', borderRadius: '12px', width: '400px', border: '1px solid var(--c-ghost)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--c-textBright)' }}>Add to Media List</h3>
            
            {mediaLists.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--c-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Existing Lists</div>
                {mediaLists.map(list => (
                  <button key={list.id} onClick={() => handleSaveToList(list.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem', background: 'var(--c-bgSoft)', border: '1px solid var(--c-ghost)', borderRadius: '6px', color: 'var(--c-textBright)', marginBottom: '0.5rem', cursor: 'pointer' }}>
                    {list.name} <span style={{ color: 'var(--c-dim)', fontSize: '0.8rem' }}>({list.items.length} items)</span>
                  </button>
                ))}
              </div>
            )}
            
            <div style={{ fontSize: '0.85rem', color: 'var(--c-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Create New List</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" value={newListName} onChange={e => setNewListName(e.target.value)} placeholder="e.g. My Research" style={{ flex: 1, padding: '0.75rem', background: 'var(--c-bg)', border: '1px solid var(--c-ghost)', borderRadius: '6px', color: 'var(--c-textBright)' }} />
              <button onClick={() => handleSaveToList('new')} style={{ padding: '0.75rem 1rem', background: 'var(--c-gold)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Create</button>
            </div>
            
            <button onClick={() => { setShowListModal(false); setSelection({ ...selection, visible: false }) }} style={{ display: 'block', width: '100%', padding: '0.75rem', marginTop: '1.5rem', background: 'transparent', border: 'none', color: 'var(--c-dim)', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <Link to="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-blue)', textDecoration: 'none', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Field Notes & Headlines
      </Link>

      <div style={{ background: 'var(--c-bgDeep)', border: '1px solid var(--c-borderMuted)', borderRadius: '12px', padding: '2.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <span style={{ color: 'var(--c-goldBright)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {article.type === 'external_news' && article.url && article.url !== '#' && (
              <img src={getFaviconUrl(article.url)} alt="" style={{ width: 16, height: 16, borderRadius: '2px' }} onError={(e) => e.target.style.display = 'none'} />
            )}
            {article.type === 'recap' ? 'Field Notes & Headlines' : (meta.source_publication || article.source_collection)}
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
        
        {meta.image_url || meta.og_image ? (
          <div style={{ marginBottom: '2rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--c-borderMuted)', display: 'flex', flexDirection: 'column' }}>
            <img src={meta.image_url || meta.og_image} alt="" style={{ width: '100%', maxHeight: '450px', objectFit: 'cover' }} />
            {meta.image_attribution && (
              <div style={{ padding: '0.75rem 1.5rem', background: 'var(--c-bgSoft)', color: 'var(--c-dim)', fontSize: '0.85rem', textAlign: 'right' }}>
                Photo/Image Attribution: {meta.image_attribution}
              </div>
            )}
          </div>
        ) : article.type === 'recap' ? (
          <div style={{ position: 'relative', height: '350px', marginBottom: '2rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--c-borderMuted)' }}>
            <CausticsBackground textSeed={meta.academic_title || article.title} />
          </div>
        ) : null}
        
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

        {/* Executive Briefing / Summary Block */}
        <div style={{ 
          background: article.type === 'recap' ? 'linear-gradient(135deg, rgba(242,193,78,0.06), transparent 60%), var(--c-bgSoft)' : 'var(--c-bgSoft)', 
          padding: '2rem 2.25rem', 
          borderRadius: '12px', 
          border: '1px solid var(--c-borderMuted)',
          borderLeft: article.type === 'recap' ? '4px solid var(--c-goldBright)' : '4px solid var(--c-blue)',
          boxShadow: article.type === 'recap' ? '0 12px 32px rgba(0,0,0,0.15)' : 'none'
        }}>
          {article.type === 'recap' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={18} style={{ color: 'var(--c-goldBright)' }} />
                <h3 style={{ margin: 0, fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)", textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '1.05rem', fontWeight: 800, color: 'var(--c-goldBright)' }}>
                  Field Notes & Editorial Synthesis
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--f-mono, monospace)', color: 'var(--c-dim)', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                {meta.story_count ? `${meta.story_count} Analyzed Stories` : 'Editorial Synthesis'}
              </span>
            </div>
          ) : (
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--c-textBright)' }}>Summary</h3>
          )}

          <p style={{ color: 'var(--c-text)', lineHeight: 1.8, fontSize: '1.1rem', margin: 0 }}>
            <AutoEntityLinker 
               text={(article.type !== 'recap' && meta.summary) || meta.abstract || meta.summary || "No summary available."} 
               entities={[...(meta.key_people || []), ...(meta.organizations || [])]} 
            />
          </p>

          {/* Color-Coded Topic Jump Links for Daily Digest */}
          {article.type === 'recap' && meta.sections && meta.sections.length > 0 && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{
                fontSize: '0.72rem',
                fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--c-dim)',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span>Today's Headlines & Key Topics</span>
                  <span style={{ color: 'var(--c-goldBright)', opacity: 0.85 }}>({meta.sections.length} Chapters)</span>
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--c-muted)', textTransform: 'none', letterSpacing: 'normal', fontFamily: "var(--f-body, sans-serif)" }}>
                  Click to jump directly to chapter
                </span>
              </div>

              {/* Connected string of topics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '0.75rem',
              }}>
                {meta.sections.map((section, idx) => {
                  const cat = categoryMeta(section.category);
                  return (
                    <a
                      key={idx}
                      href={`#digest-topic-${idx}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(`digest-topic-${idx}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          el.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
                          el.style.borderColor = cat.color;
                          el.style.boxShadow = `0 0 28px ${cat.color}55`;
                          setTimeout(() => {
                            el.style.boxShadow = '';
                            el.style.borderColor = '';
                          }, 1800);
                        }
                      }}
                      className="lux-hover-lift"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                        border: `1px solid ${cat.color}44`,
                        borderLeft: `4px solid ${cat.color}`,
                        textDecoration: 'none',
                        color: 'var(--c-textBright)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = `${cat.color}15`;
                        e.currentTarget.style.borderColor = cat.color;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))';
                        e.currentTarget.style.borderColor = `${cat.color}44`;
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: cat.color,
                            color: '#000',
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            fontFamily: 'var(--f-mono, monospace)',
                            flexShrink: 0
                          }}>
                            {idx + 1}
                          </span>
                          <span style={{
                            fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: cat.color
                          }}>
                            {cat.short || section.category}
                          </span>
                        </div>
                        <span style={{ color: cat.color, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontFamily: "var(--f-condensed)", fontWeight: 700 }}>
                          Jump <ArrowRight size={12} />
                        </span>
                      </div>

                      <div style={{
                        fontWeight: 600,
                        fontSize: '0.92rem',
                        lineHeight: 1.35,
                        color: 'var(--c-textBright)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {section.headline}
                      </div>

                      {section.items?.length > 0 && (
                        <div style={{
                          fontSize: '0.72rem',
                          color: 'var(--c-dim)',
                          fontFamily: 'var(--f-mono, monospace)',
                          marginTop: 'auto',
                          paddingTop: '0.2rem'
                        }}>
                          {section.items.length} source {section.items.length === 1 ? 'doc' : 'docs'}
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <SourceLensPanel meta={meta} category={article.category} />
        <ContextNotes meta={meta} />
        <ArchivalContextDossier 
          meta={meta} 
          articleTitle={article.type === 'recap' ? article.title : (meta.academic_title || article.title)} 
          articleId={article.id} 
        />
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

        {/* Editorial Synopsis & Source Access Card when full_text is unavailable */}
        {!meta.full_text && !meta.digest_items && article.type !== 'recap' && (
          <div style={{
            marginTop: '3rem',
            padding: '2rem 2.25rem',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--c-borderMuted)',
            color: 'var(--c-text)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.6rem'
            }}>
              <span style={{
                fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--c-goldBright)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <FilePlus size={14} />
                <span>Primary Reporting & Source Access</span>
              </span>
              {article.url && article.url !== '#' && (
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    color: '#38bdf8',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span>Read unpaywalled source on {meta.source_publication || 'Publisher'}</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
            <p style={{ lineHeight: 1.8, fontSize: '1.05rem', margin: '0 0 1rem 0' }}>
              <AutoEntityLinker 
                text={meta.summary || meta.abstract || "This study was recorded by our global media intake feed. Our editorial review cross-references this report directly against primary clinical literature and archival records."}
                entities={[...(meta.key_people || []), ...(meta.organizations || [])]} 
              />
            </p>
            {meta.scrape_blocked && (
              <p style={{ fontSize: '0.8rem', color: 'var(--c-dim)', margin: 0, fontStyle: 'italic' }}>
                Note: Direct inline article syndication is restricted by the publisher's paywall or feed protection. The full original story is available at the publisher link above. Our Source Lens appraisal, claims cross-examination, and archival citations are independently compiled.
              </p>
            )}
          </div>
        )}

        {/* Newsletter Subscription Card with Movement Voice */}
        <div className="lux-lens" style={{
          marginTop: '3.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(212,160,48,0.12) 0%, rgba(9,15,21,0.96) 60%, rgba(212,160,48,0.06) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(212, 160, 48, 0.4)',
          padding: '2.5rem',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 24px rgba(212, 160, 48, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '250px', height: '250px',
            background: 'radial-gradient(circle, rgba(212,160,48,0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.25rem 0.65rem', borderRadius: '4px',
              background: 'rgba(212, 160, 48, 0.2)', border: '1px solid rgba(212, 160, 48, 0.4)',
              color: 'var(--c-goldBright)', fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
              fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
              marginBottom: '0.85rem'
            }}>
              <Sparkles size={13} />
              <span>The Movement Dispatch</span>
            </div>

            <h3 style={{
              fontFamily: "var(--f-display, 'Playfair Display', serif)",
              fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              margin: '0 0 0.75rem 0'
            }}>
              Never miss a morning pulse.
            </h3>

            <p style={{
              fontFamily: "var(--f-body, sans-serif)",
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.85)',
              margin: '0 0 1.5rem 0'
            }}>
              No medical gaslighting, no procedural fluff. Get our daily synthesis of court filings, hospital circumcision decline rates, and uncensored primary sources delivered straight to your inbox.
            </p>

            <NewsletterSubscribeForm />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '4rem', marginBottom: '3rem', background: 'rgba(30, 41, 59, 0.5)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--c-borderMuted)', backdropFilter: 'blur(10px)' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--c-goldBright)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Smart Next Steps</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <Link to="/atlas" className="lux-hover-lift" style={{ display: 'block', textDecoration: 'none', background: 'var(--c-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--c-border)', transition: 'all 0.3s ease' }}>
            <h4 style={{ color: 'var(--c-textBright)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>🌍 Explore the Atlas</h4>
            <p style={{ color: 'var(--c-dim)', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>See how these entities and events map out globally.</p>
          </Link>
          <Link to="/library" className="lux-hover-lift" style={{ display: 'block', textDecoration: 'none', background: 'var(--c-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--c-border)', transition: 'all 0.3s ease' }}>
            <h4 style={{ color: 'var(--c-textBright)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>📚 Dive into the Library</h4>
            <p style={{ color: 'var(--c-dim)', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>Search the primary sources to uncover more evidence.</p>
          </Link>
          <Link to="/graph" className="lux-hover-lift" style={{ display: 'block', textDecoration: 'none', background: 'var(--c-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--c-border)', transition: 'all 0.3s ease' }}>
            <h4 style={{ color: 'var(--c-textBright)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>🕸️ Global Graph</h4>
            <p style={{ color: 'var(--c-dim)', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>Investigate the hidden network of champions and critics.</p>
          </Link>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--c-textBright)', marginBottom: '1rem', borderBottom: '1px solid var(--c-ghost)', paddingBottom: '1rem' }}>Discussion</h2>
        <CommentsWidget docId={article.id} title={meta.academic_title || article.title} />
      </div>
    </div>
  );
}
