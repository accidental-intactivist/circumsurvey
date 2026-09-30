import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useReport } from '../contexts/ReportContext';
import { useMediaList } from '../contexts/MediaListContext';
import { useAssistant } from '../contexts/AssistantContext';
import { FilePlus, PlusSquare, Sparkles, Loader, Globe, Copy, Check, ZoomIn, ZoomOut, Maximize, Minimize, RefreshCw, RotateCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CustomPDFViewer from '../components/CustomPDFViewer';
import ThinkingSpirograph from '../components/ThinkingSpirograph';
import CommentsWidget from '../components/CommentsWidget';
import { generateFriendlySlug, parseFriendlySlug } from '../utils/slugs';
import './AdminArchivePage.css';

const EntityPopover = ({ name, type }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEntity = async () => {
    setLoading(true);
    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocal ? '/api_entities_mock.json' : '/api/entities';
      const res = await fetch(apiUrl);
      const all = await res.json();
      const match = all.find(e => e.name.toLowerCase() === name.toLowerCase());
      if (match) setData(match);
      else setData({ name, description: 'No detailed information available in the database.' });
    } catch (e) {
      setData({ name, description: 'Failed to load info.' });
    }
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    if (!data && !loading) fetchEntity();
  };

  return (
    <span style={{ position: 'relative' }}>
      <button 
        onClick={handleOpen}
        className="lux-hover-lift"
        style={{ background: 'var(--c-bgDeep)', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--c-text)', border: '1px solid var(--c-ghost)', cursor: 'pointer' }}
      >
        {name}
      </button>
      
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
          <div className="lux-glide-in" style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '10px', width: '300px', background: 'var(--c-bgCard)', border: '1px solid var(--c-ghost)', padding: '1rem', borderRadius: '8px', zIndex: 999, boxShadow: '0 10px 30px rgba(0,0,0,0.8)', textAlign: 'left' }}>
            {loading ? (
              <span style={{ color: 'var(--c-dim)' }}>Loading...</span>
            ) : data ? (
              <>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--c-goldBright)' }}>{data.name}</h4>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--c-text)', lineHeight: 1.5 }}>{data.description}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <Link to={`/to/${data.id || encodeURIComponent(data.name)}`} style={{ color: 'var(--c-gold)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 'bold' }}>View Archive Profile</Link>
                  {data.url && (
                    <a href={data.url} target="_blank" rel="noreferrer" style={{ color: 'var(--c-blue)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 'bold' }}>External Reference &rarr;</a>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </>
      )}
    </span>
  );
};

export default function DocumentView() {
  const { id: routeId } = useParams();
  const id = parseFriendlySlug(routeId);
  const navigate = useNavigate();
  const { addToReport } = useReport();
  const { mediaLists, createList, addToList } = useMediaList();
  const { openAssistant } = useAssistant();
  
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageIndex, setImageIndex] = useState(0);

  // Highlighter State
  const [selection, setSelection] = useState({ text: '', x: 0, y: 0, visible: false });
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  
  const [citationStyle, setCitationStyle] = useState(localStorage.getItem('citationStyle') || 'APA');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedGlobal, setCopiedGlobal] = useState(false);

  // Translation State
  const [availableTranslations, setAvailableTranslations] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [translatedText, setTranslatedText] = useState(null);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [requestStatus, setRequestStatus] = useState('');

  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pageCount, setPageCount] = useState(null);
  const mediaContainerRef = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (mediaContainerRef.current?.requestFullscreen) {
        mediaContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleStyleChange = (e) => {
    const s = e.target.value;
    setCitationStyle(s);
    localStorage.setItem('citationStyle', s);
  };

  const generateCitationText = (metadata, title) => {
    const d = metadata?.date || 'n.d.';
    const a = metadata?.author || 'Unknown Author';
    const t = title || 'Untitled Document';
    const u = window.location.href;
    
    if (citationStyle === 'MLA') {
      return `${a}. "${t}." ${d}, ${u}.`;
    } else if (citationStyle === 'Chicago') {
      return `${a}. "${t}." ${d}. ${u}.`;
    }
    return `${a}. (${d}). ${t}. ${u}`;
  };

  const handleCopySnippetWithCitation = (snippet, citationTitle, metadata) => {
    const citation = generateCitationText(metadata, citationTitle);
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

  const handleCopyGlobalCitation = (citationTitle, metadata) => {
    const citation = generateCitationText(metadata, citationTitle);
    navigator.clipboard.writeText(citation);
    setCopiedGlobal(true);
    setTimeout(() => setCopiedGlobal(false), 2000);
  };

  useEffect(() => {
    setImageIndex(0);
    setViewMode('pdf');
    setTextContent('');
    setTranslatedText(null);
    setCurrentLanguage('English');
    fetchDoc();
    fetchTranslations();
  }, [id]);

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
        setSuggestions([]); // reset suggestions on new selection
      } else {
        if (!showListModal) {
          setSelection(s => ({ ...s, visible: false }));
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [showListModal]);

  const [prevDoc, setPrevDoc] = useState(null);
  const [nextDoc, setNextDoc] = useState(null);

  const fetchDoc = async () => {
    setLoading(true);
    try {
      const apiUrl = `/api/cms/${id}`;
      const res = await fetch(apiUrl);
      
      if (!res.ok) throw new Error("Failed to fetch document");
      const data = await res.json();
      
      let foundDoc = data.data && Array.isArray(data.data) ? null : data;
      
      // Attempt to merge rich metadata from api_mock.json by matching titles or slug
      try {
        const mockRes = await fetch('/api_mock.json');
        if (mockRes.ok) {
          const mockData = await mockRes.json();
          
          // If we didn't get a valid doc from the backend (e.g. mock server), find it here by id
          if (!foundDoc) {
             foundDoc = mockData.find(m => {
               if (m.id === id) return true;
               const mMeta = JSON.parse(m.metadata_json || '{}');
               return generateFriendlySlug(m, mMeta) === id;
             });
             if (!foundDoc) foundDoc = data.data ? data.data[0] : {}; // fallback
          }

          const liveTitle = foundDoc.title || '';
          const liveMeta = foundDoc.metadata_json ? JSON.parse(foundDoc.metadata_json) : {};
          const geminiTitle = liveMeta.gemini_extracted_metadata?.title || '';
          
          const match = mockData.find(m => {
            if (m.id === foundDoc.id) return true;
            const mMeta = JSON.parse(m.metadata_json || '{}');
            const mTitle = m.title || mMeta.title || '';
            if (!mTitle) return false;
            
            // Fuzzy match logic: check if one contains the other
            const t1 = liveTitle.toLowerCase();
            const t2 = mTitle.toLowerCase();
            const t3 = geminiTitle.toLowerCase();
            
            return (t1 && (t1.includes(t2) || t2.includes(t1))) || 
                   (t3 && (t3.includes(t2) || t2.includes(t3)));
          });
          
          if (match) {
            const mMeta = JSON.parse(match.metadata_json || '{}');
            // Merge the two metadata objects, prioritizing the mock (richer) metadata,
            // but keeping gemini_extracted_metadata and extracted_text_url
            foundDoc.metadata_json = JSON.stringify({
              ...mMeta,
              ...liveMeta,
              gemini_extracted_metadata: liveMeta.gemini_extracted_metadata || mMeta.gemini_extracted_metadata
            });
            // Merge series/collection info
            if (match.series && !foundDoc.series) foundDoc.series = match.series;
            if (match.source_collection !== 'Bulk Ingest') foundDoc.source_collection = match.source_collection;
          }
        }
      } catch (e) {
        console.warn("Failed to merge mock metadata", e);
      }
      
      setDoc(foundDoc);

      // Fetch collection sequence for timeline/arrow navigation
      if (foundDoc) {
        const listUrl = '/api/cms';
        const listRes = await fetch(listUrl);
        if (listRes.ok) {
          const allDocs = await listRes.json();
          const docList = allDocs.data || allDocs;
          
          if (docList && Array.isArray(docList)) {
            // Sort by date then title to match timeline
            const sorted = [...docList].sort((a, b) => {
              const dateA = a.metadata_json ? (JSON.parse(a.metadata_json).date || '9999') : '9999';
              const dateB = b.metadata_json ? (JSON.parse(b.metadata_json).date || '9999') : '9999';
              if (dateA !== dateB) return dateA.localeCompare(dateB);
              return (a.title || '').localeCompare(b.title || '');
            });
            const idx = sorted.findIndex(d => d.id === id);
            if (idx > 0) setPrevDoc(sorted[idx - 1]);
            else setPrevDoc(null);
            
            if (idx !== -1 && idx < sorted.length - 1) setNextDoc(sorted[idx + 1]);
            else setNextDoc(null);
          }
        }
      }

    } catch (e) {
      console.error(e);
      setError('Failed to load document');
    }
    setLoading(false);
  };

  const fetchTranslations = async () => {
    try {
      const res = await fetch(`/api/translations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableTranslations(data.translations || []);
      }
    } catch (e) {
      console.error("Failed to fetch translations", e);
    }
  };

  useEffect(() => {
    if (doc) {
      const meta = doc.metadata_json ? JSON.parse(doc.metadata_json) : {};
      const title = getCleanTitle(doc, meta);
      document.title = `${title} — Intactivism Archive`;
    }
    return () => { document.title = 'The Accidental Intactivist\'s Guide'; };
  }, [doc]);

  const getCleanTitle = (d, m) => {
    if (m && m.academic_title) return m.academic_title;
    if (m && m.gemini_extracted_metadata && m.gemini_extracted_metadata.title) return m.gemini_extracted_metadata.title;
    if (m && m.title) return m.title;
    let t = d.title || '';
    if (t.toLowerCase().match(/\.(pdf|mov|mp4|webm|ogg)$/i)) {
      t = t.replace(/\.(pdf|mov|mp4|webm|ogg)$/i, '')
           .replace(/\[.*?\]/g, '')
           .replace(/_/g, ' ')
           .replace(/page (\d+)/i, '- Page $1');
    }
    // Remove leading year like "2007 "
    const yearMatch = t.match(/^(?:19|20)\d{2}\s*/);
    if (yearMatch) {
      t = t.replace(yearMatch[0], '');
    }
    return t.trim() || 'Untitled Document';
  };

  const getDisplayDate = (d, m) => {
    if (m && m.date) return m.date;
    const t = d.title || '';
    const titleMatch = t.match(/(?:19|20)\d{2}/);
    if (titleMatch) {
      return `[${titleMatch[0]}]`;
    }
    return 'Unknown';
  };

  const handleAskAssistant = async () => {
    if (!selection.text) return;
    setLoadingSuggestions(true);
    try {
      const res = await fetch('/api/suggest-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selection.text })
      });
      const data = await res.json();
      setSelection({ ...selection, visible: false });
      if (data.questions) {
        openAssistant(selection.text, data.questions);
      } else {
        openAssistant(selection.text, null);
      }
    } catch (e) {
      console.error(e);
      setSelection({ ...selection, visible: false });
      openAssistant(selection.text, null);
    }
    setLoadingSuggestions(false);
  };

  const handleSendToReport = (snippet, citation) => {
    addToReport(`"${snippet}"`, [citation]);
    setSelection({ ...selection, visible: false });
    navigate('/assistant');
  };

  const handleSaveToList = (listId) => {
    if (listId === 'new') {
      if (!newListName) return;
      const list = createList(newListName);
      addToList(list.id, doc.id); // Add current document to list
      setNewListName('');
    } else {
      addToList(listId, doc.id);
    }
    setShowListModal(false);
    setSelection({ ...selection, visible: false });
  };

  // Toggle between PDF and Text View
  const [viewMode, setViewMode] = useState('pdf');
  const [textContent, setTextContent] = useState('');
  const [loadingText, setLoadingText] = useState(false);

  const handleToggleView = async (mode) => {
    setViewMode(mode);
    if (mode === 'text' && !textContent && doc.url && doc.url.toLowerCase().endsWith('.pdf')) {
      setLoadingText(true);
      try {
        const meta = JSON.parse(doc.metadata_json || '{}');
        const textUrl = meta.extracted_text_url || doc.url.replace(/\.pdf$/i, '.txt');
        const res = await fetch(textUrl);
        if (res.ok) {
          const text = await res.text();
          setTextContent(text);
        } else {
          // If .md failed, try fallback .txt for legacy docs
          if (textUrl.endsWith('.md')) {
            const fallbackRes = await fetch(doc.url.replace(/\.pdf$/i, '.txt'));
            if (fallbackRes.ok) {
              setTextContent(await fallbackRes.text());
              return;
            }
          }
          setTextContent("No extracted text is available for this document.");
        }
      } catch (err) {
        setTextContent("Failed to load extracted text.");
      }
      setLoadingText(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--c-bg)' }}>
        <div style={{ height: '150px', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <ThinkingSpirograph />
        </div>
      </div>
    );
  }

  if (error) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--c-dim)', fontFamily: 'var(--f-body)' }}>
      <h2 style={{ color: 'var(--c-textBright)', fontFamily: 'var(--f-display)', marginBottom: '1rem' }}>Document Not Found</h2>
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>This document doesn't exist in the archive, or may have been removed.</p>
      <Link to="/library" style={{ color: 'var(--c-goldBright)', textDecoration: 'none', fontSize: '1rem' }}>&larr; Return to Library</Link>
    </div>
  );

  if (!doc) return <div style={{ padding: '4rem', color: 'var(--c-dim)', fontFamily: 'var(--f-display)', fontSize: '1.2rem', textAlign: 'center' }}>Loading document...</div>;

  const metadata = doc.metadata_json ? JSON.parse(doc.metadata_json) : {};
  const mediaUrls = doc.media_urls ? JSON.parse(doc.media_urls) : [];
  
  const rawFiles = metadata.raw_files || [];
  const hasRawFile = rawFiles.length > 0;
  
  const currentRawFile = rawFiles[imageIndex] || rawFiles[0];
  const displayUrl = doc.url || (currentRawFile ? `/api/assets/${encodeURIComponent(currentRawFile.path.split('/').pop())}` : null);

  const coverImage = mediaUrls.find(url => url.match(/\.(jpeg|jpg|gif|png)$/i)) || 
                    (displayUrl && displayUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? displayUrl : null);
                    
  const isPending = doc.status === 'pending_digitization' && !doc.url && !hasRawFile;
  const citationTitle = getCleanTitle(doc, metadata);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', position: 'relative' }}>
      
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
          onMouseDown={(e) => e.stopPropagation()} // Prevent selection clear when clicking toolbar
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              onClick={() => handleSendToReport(selection.text, citationTitle)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', background: 'var(--c-bgSoft)', border: '1px solid var(--c-ghost)', borderRadius: '6px', color: 'var(--c-textBright)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              <FilePlus size={14} /> Send to Report
            </button>
            <button 
              onClick={() => handleCopySnippetWithCitation(selection.text, citationTitle, metadata)}
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
              {loadingSuggestions ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />} 
              Ask Assistant
            </button>
          </div>
        </div>
      )}

      {/* Media List Modal */}
      {showListModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseDown={(e) => e.stopPropagation()}>
          <div className="lux-glide-in" style={{ background: 'var(--c-bgCard)', padding: '2rem', borderRadius: '12px', width: '400px', border: '1px solid var(--c-ghost)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--c-textBright)' }}>Add Document to Media List</h3>
            
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

      {/* Cinematic Blurred Background */}
      {coverImage && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: '40vh',
          backgroundImage: `url(${coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(60px) brightness(0.4)',
          opacity: 0.6,
          zIndex: 0,
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: '-webkit-linear-gradient(top, black 50%, transparent 100%)'
        }} />
      )}

      {/* Main Content Area */}
      <div className="lux-glide-in" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '2rem 2rem' }}>
        
        {/* Hero Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div>
            <div className="analog-band-cool" style={{ height: '4px', width: '60px', marginBottom: '1.5rem', borderRadius: '2px' }} />
            <div style={{ color: 'var(--c-goldBright)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {(() => {
                let subject = doc.source_collection || 'Uncategorized';
                
                // Route generic bulk strings through our heuristic
                if (subject === 'Bulk Ingest' || subject.toLowerCase().includes('wetransfer') || subject.toLowerCase().includes('downloads')) {
                  try {
                    const meta = JSON.parse(doc.metadata_json || '{}');
                    const orgs = meta.gemini_extracted_metadata?.organizations || [];
                    const title = meta.gemini_extracted_metadata?.title || doc.title || '';
                    const orgStr = orgs.join(' ').toLowerCase();
                    const titleStr = title.toLowerCase();
                    if (orgStr.includes('michigan state') || orgStr.includes('changing men') || titleStr.includes('clipping') || titleStr.includes('newspaper')) {
                      subject = 'MSU Clippings (Changing Men Collection)';
                    } else if (orgStr.match(/nocirc|noharmm|doc|arc|genital autonomy|attorney|lawyer|human rights|nurses for the rights/i) || titleStr.match(/nocirc|noharmm|doc|arc|newsletter|proceedings/i)) {
                      subject = 'UMass MS 1205: Genital Autonomy Advocacy Archive';
                    } else {
                      subject = 'Tim Hammond Collection';
                    }
                  } catch (e) {
                    subject = 'Tim Hammond Collection';
                  }
                } else if (subject.includes(': ')) {
                  subject = subject.split(': ')[1];
                }
                return subject;
              })()}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {prevDoc && (
                <Link to={`/library/${generateFriendlySlug(prevDoc, prevDoc.metadata_json ? JSON.parse(prevDoc.metadata_json) : {})}`} className="lux-hover-lift" style={{ color: 'var(--c-textBright)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.5rem 1rem', border: '1px solid var(--c-ghost)', borderRadius: '20px' }}>
                  <span style={{ fontSize: '1.2rem' }}>&larr;</span> Prev Document
                </Link>
              )}
              {nextDoc && (
                <Link to={`/library/${generateFriendlySlug(nextDoc, nextDoc.metadata_json ? JSON.parse(nextDoc.metadata_json) : {})}`} className="lux-hover-lift" style={{ color: 'var(--c-textBright)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.5rem 1rem', border: '1px solid var(--c-ghost)', borderRadius: '20px' }}>
                  Next Document <span style={{ fontSize: '1.2rem' }}>&rarr;</span>
                </Link>
              )}
            </div>
            <Link to="/library" style={{ color: 'var(--c-textBright)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.5rem 1rem', border: '1px solid var(--c-ghost)', borderRadius: '20px' }} className="lux-hover-lift">
              Return to Index
            </Link>
          </div>
          
          <h1 style={{ margin: '0 0 1rem 0', fontSize: '2.5rem', fontFamily: 'var(--f-display)', letterSpacing: '-0.02em', lineHeight: '1.1', color: 'var(--c-textBright)' }}>
            {citationTitle}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {(metadata.author || metadata.gemini_extracted_metadata?.authors?.join(', ')) && (
              <div style={{ color: 'var(--c-text)', fontSize: '1.1rem', fontStyle: 'italic' }}>
                by {metadata.author || metadata.gemini_extracted_metadata?.authors?.join(', ')}
              </div>
            )}
            {pageCount && (
              <div style={{ color: 'var(--c-dim)', fontSize: '0.9rem', padding: '0.2rem 0.6rem', background: 'var(--c-bgDeep)', borderRadius: '4px', border: '1px solid var(--c-ghost)' }}>
                {pageCount} Pages
              </div>
            )}
          </div>

        </div>

        {/* Main Layout Container */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>
          
          {/* Left Column: Metadata */}
          <div style={{ flex: '1 1 300px', maxWidth: '400px', marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--c-ghost)' }}>
                  <td style={{ padding: '0.75rem 0', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', width: '110px', fontWeight: 'bold' }}>Type</td>
                  <td style={{ padding: '0.75rem 0', color: 'var(--c-textBright)' }}>
                    {(displayUrl && displayUrl.match(/\.(mp4|mov|webm|ogg)$/i) ? 'video' : (doc.type || 'document')).replace(/_/g, ' ').replace(/newspaper clipping/i, 'news article').replace(/other/i, 'document').replace(/^pdf$/i, 'document').toUpperCase()}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--c-ghost)' }}>
                  <td style={{ padding: '0.75rem 0', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Date</td>
                  <td style={{ padding: '0.75rem 0', color: 'var(--c-textBright)' }}>{getDisplayDate(doc, metadata)}</td>
                </tr>
                {metadata.original_location && (
                  <tr style={{ borderBottom: '1px solid var(--c-ghost)' }}>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Location</td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-textBright)', fontFamily: 'var(--f-mono)', fontSize: '0.85rem' }}>{metadata.original_location}</td>
                  </tr>
                )}
                {(metadata.gemini_extracted_metadata?.authors?.length > 0 || (metadata.key_people && metadata.key_people.length > 0)) && (
                  <tr style={{ borderBottom: '1px solid var(--c-ghost)' }}>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Key People</td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-textBright)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {(metadata.gemini_extracted_metadata?.authors || metadata.key_people).map(p => (
                          <EntityPopover key={p} name={p} type="person" />
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                {metadata.source_publication && (
                  <tr style={{ borderBottom: '1px solid var(--c-ghost)' }}>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Publication</td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-textBright)' }}>{metadata.source_publication}</td>
                  </tr>
                )}
                {metadata.gemini_extracted_metadata?.publisher && (
                  <tr style={{ borderBottom: '1px solid var(--c-ghost)' }}>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Publisher</td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-textBright)' }}>{metadata.gemini_extracted_metadata.publisher}</td>
                  </tr>
                )}
                {metadata.category && (
                  <tr style={{ borderBottom: '1px solid var(--c-ghost)' }}>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Category</td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-textBright)' }}>{metadata.category}</td>
                  </tr>
                )}
                {metadata.subject && (
                  <tr style={{ borderBottom: '1px solid var(--c-ghost)' }}>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Subject</td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-textBright)' }}>{metadata.subject}</td>
                  </tr>
                )}
                {doc.series && (
                  <tr style={{ borderBottom: '1px solid var(--c-ghost)' }}>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Series</td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-textBright)', fontSize: '0.85rem' }}>{doc.series}</td>
                  </tr>
                )}
                {(metadata.tags?.length > 0 || metadata.keywords?.length > 0) && (
                  <tr style={{ borderBottom: '1px solid var(--c-ghost)' }}>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold', verticalAlign: 'top' }}>Keywords</td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-textBright)', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {(metadata.keywords || metadata.tags).map(t => (
                          <Link key={t} to={`/library?tag=${encodeURIComponent(t)}`} className="lux-hover-lift" style={{ color: 'var(--c-blue)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.5rem', border: '1px solid var(--c-ghost)', borderRadius: '4px' }}>{t}</Link>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                {metadata.physical_provenance && (
                  <tr style={{ borderBottom: '1px solid var(--c-ghost)' }}>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Provenance</td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--c-textBright)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                      {metadata.physical_provenance.original_collection && <div><span style={{ color: 'var(--c-dim)' }}>Collection:</span> {metadata.physical_provenance.original_collection}</div>}
                      {metadata.physical_provenance.holding_institution && <div><span style={{ color: 'var(--c-dim)' }}>Institution:</span> {metadata.physical_provenance.holding_institution}</div>}
                      {metadata.physical_provenance.folder_number && <div><span style={{ color: 'var(--c-dim)' }}>Folder:</span> {metadata.physical_provenance.folder_number}</div>}
                    </td>
                  </tr>
                )}
                <tr style={{ borderBottom: '1px solid var(--c-ghost)' }}>
                  <td style={{ padding: '0.75rem 0', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Translation</td>
                  <td style={{ padding: '0.75rem 0', color: 'var(--c-textBright)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {availableTranslations.length > 0 && (
                      <select 
                        value={currentLanguage} 
                        onChange={(e) => {
                          const lang = e.target.value;
                          setCurrentLanguage(lang);
                          if (lang === 'English') setTranslatedText(null);
                          else {
                            const found = availableTranslations.find(t => t.language === lang);
                            if (found) setTranslatedText(found.translated_text);
                          }
                        }}
                        style={{ background: 'var(--c-bgDeep)', color: 'var(--c-goldBright)', border: '1px solid var(--c-gold)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}
                      >
                        <option value="English">English</option>
                        {availableTranslations.map(t => (
                          <option key={t.language} value={t.language}>{t.language}</option>
                        ))}
                      </select>
                    )}
                    <button 
                      onClick={() => setShowTranslationModal(true)}
                      className="lux-hover-lift"
                      style={{ background: 'transparent', color: 'var(--c-gold)', border: '1px dashed var(--c-gold)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Request Translation
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right Column: Viewer Section */}
          {displayUrl && (
            <div style={{ flex: '2 1 600px', minWidth: 0, marginBottom: '4rem' }}>
              <div className="lux-lens" style={{ overflow: 'hidden', height: '80vh', display: 'flex', flexDirection: 'column', borderRadius: '12px', border: '1px solid var(--c-ghost)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
              {isPending ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '1rem' }}>??</div>
                  <h2 style={{ color: 'var(--c-goldBright)', margin: '0 0 1rem 0' }}>Physical Document</h2>
                  <p style={{ color: 'var(--c-text)', maxWidth: '500px', margin: '0 0 1rem 0', lineHeight: 1.8 }}>
                    This item is cataloged in the physical Tim Hammond Archive (UMass MS 1205) but has not yet been digitized.
                  </p>
                  <p style={{ color: 'var(--c-dim)', maxWidth: '500px', margin: '0 0 2rem 0', lineHeight: 1.6, fontSize: '0.9rem' }}>
                    If you have a copy of this document, please help us complete the archive!
                  </p>
                  <Link
                    to="/contact?subject=Document%20Upload"
                    className="lux-hover-lift"
                    style={{ background: 'var(--c-goldBright)', color: '#000', padding: '0.8rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
                  >
                    Submit Document for Archiving
                  </Link>
                </div>
              ) : doc.type === 'external_news' ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', textAlign: 'center' }}>
                  <Globe size={64} color="var(--c-goldBright)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                  <h2 style={{ color: 'var(--c-textBright)', margin: '0 0 1rem 0' }}>External News Source</h2>
                  <p style={{ color: 'var(--c-text)', maxWidth: '600px', margin: '0 0 2rem 0', lineHeight: 1.8 }}>
                    We do not store the full text of this external article to preserve storage and respect publisher rights. 
                    An AI-generated abstract is available below.
                  </p>
                  <a
                    href={displayUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="lux-hover-lift"
                    style={{ background: 'var(--c-blue)', color: '#fff', padding: '1rem 2.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Read Full Article on Publisher Site &rarr;
                  </a>
                </div>
              ) : doc.type === 'dataset' ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '1rem' }}>??</div>
                  <h2 style={{ color: 'var(--c-textBright)', margin: '0 0 1rem 0' }}>Interactive SQL Dataset</h2>
                  <p style={{ color: 'var(--c-text)', maxWidth: '500px', margin: '0 0 2rem 0', lineHeight: 1.8 }}>
                    This is a structured qualitative dataset rather than a traditional document.
                  </p>
                  <Link
                    to={displayUrl}
                    className="lux-hover-lift"
                    style={{ background: 'var(--c-goldBright)', color: '#000', padding: '1rem 2.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
                  >
                    Launch Interactive Explorer
                  </Link>
                </div>
              ) : (displayUrl && displayUrl.toLowerCase().endsWith('.pdf')) ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--c-ghost)', background: 'var(--c-bgDeep)' }}>
                    <button 
                      onClick={() => handleToggleView('pdf')}
                      style={{ flex: 1, padding: '1rem', background: viewMode === 'pdf' ? 'var(--c-bg)' : 'transparent', border: 'none', color: viewMode === 'pdf' ? 'var(--c-textBright)' : 'var(--c-muted)', fontWeight: 'bold', cursor: 'pointer', borderBottom: viewMode === 'pdf' ? '2px solid var(--c-goldBright)' : '2px solid transparent', fontFamily: 'var(--f-condensed)', letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'all 0.2s' }}
                    >
                      Original PDF
                    </button>
                    <button 
                      onClick={() => handleToggleView('text')}
                      style={{ flex: 1, padding: '1rem', background: viewMode === 'text' ? 'var(--c-bg)' : 'transparent', border: 'none', color: viewMode === 'text' ? 'var(--c-textBright)' : 'var(--c-muted)', fontWeight: 'bold', cursor: 'pointer', borderBottom: viewMode === 'text' ? '2px solid var(--c-goldBright)' : '2px solid transparent', fontFamily: 'var(--f-condensed)', letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'all 0.2s' }}
                    >
                      Extracted Text
                    </button>
                  </div>
                  <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    {viewMode === 'pdf' ? (
                      <CustomPDFViewer url={displayUrl} onPageCount={setPageCount} />
                    ) : (
                      <div style={{ height: '100%', overflowY: 'auto', padding: '2rem 3rem', background: 'var(--c-bg)', color: 'var(--c-textBright)', fontFamily: 'var(--f-body)', lineHeight: 1.8, fontSize: '1rem' }}>
                        {loadingText ? (
                          <div style={{ opacity: 0.5, textAlign: 'center', marginTop: '2rem' }}>Extracting text...</div>
                        ) : translatedText ? (
                          <div className="markdown-body" style={{ color: 'var(--c-textBright)', fontSize: '0.95rem' }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedText}</ReactMarkdown>
                          </div>
                        ) : textContent ? (
                          <div className="markdown-body" style={{ color: 'var(--c-textBright)', fontSize: '0.95rem' }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{textContent}</ReactMarkdown>
                          </div>
                        ) : (
                          <div style={{ opacity: 0.5, textAlign: 'center', marginTop: '2rem' }}>No extracted text available for this document.</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (displayUrl && displayUrl.match(/\.(mp3|wav|m4a|aac|flac)$/i)) ? (
                <div style={{ flex: 1, background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '2rem' }}>🎵</div>
                  <h2 style={{ color: 'var(--c-textBright)', margin: '0 0 2rem 0' }}>Audio Playback</h2>
                  <audio 
                    src={displayUrl} 
                    controls 
                    style={{ width: '100%', maxWidth: '500px' }} 
                  >
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              ) : (displayUrl && displayUrl.match(/\.(mp4|mov|webm|ogg)$/i)) ? (
                <div style={{ flex: 1, background: '#000', display: 'flex', flexDirection: 'column' }}>
                  <video 
                    src={displayUrl} 
                    controls 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : mediaUrls.length > 0 || (displayUrl && displayUrl.match(/\.(jpeg|jpg|gif|png)$/i)) ? (
                <div ref={mediaContainerRef} style={{ flex: 1, background: '#000', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ flex: 1, overflow: zoomLevel > 1 ? 'auto' : 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={mediaUrls[imageIndex] || displayUrl} 
                      alt={doc.title} 
                      style={{ 
                        width: zoomLevel > 1 ? `${zoomLevel * 100}%` : '100%', 
                        height: zoomLevel > 1 ? `${zoomLevel * 100}%` : '100%', 
                        objectFit: zoomLevel > 1 ? 'contain' : 'contain',
                        transformOrigin: 'center center',
                        transform: `rotate(${rotation}deg)`,
                        transition: 'width 0.2s, height 0.2s, transform 0.2s'
                      }} 
                    />
                  </div>
                  
                  {/* Zoom and Fullscreen Controls */}
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.6)', padding: '0.4rem', borderRadius: '8px', zIndex: 10 }}>
                    <button aria-label="Zoom In" onClick={() => setZoomLevel(z => z + 0.5)} style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.2rem' }} title="Zoom In">
                      <ZoomIn size={18} />
                    </button>
                    <button aria-label="Zoom Out" onClick={() => setZoomLevel(z => Math.max(1, z - 0.5))} style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.2rem' }} title="Zoom Out">
                      <ZoomOut size={18} />
                    </button>
                    {zoomLevel > 1 && (
                      <button aria-label="Reset Zoom" onClick={() => setZoomLevel(1)} style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.2rem' }} title="Reset Zoom">
                        <RefreshCw size={18} />
                      </button>
                    )}
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 0.2rem' }} />
                    <button aria-label="Rotate 90 degrees" onClick={() => setRotation(r => (r + 90) % 360)} style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.2rem' }} title="Rotate 90 degrees">
                      <RotateCw size={18} />
                    </button>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 0.2rem' }} />
                    <button aria-label="Toggle Fullscreen" onClick={toggleFullscreen} style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.2rem' }} title="Toggle Fullscreen">
                      <Maximize size={18} />
                    </button>
                  </div>

                  {(mediaUrls.length > 1 || rawFiles.length > 1) && (
                    <>
                      <button 
                        aria-label="Previous image"
                        onClick={() => { setImageIndex(i => Math.max(0, i - 1)); setZoomLevel(1); }}
                        disabled={imageIndex === 0}
                        style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', padding: '1rem', cursor: imageIndex === 0 ? 'not-allowed' : 'pointer', borderRadius: '50%', opacity: imageIndex === 0 ? 0.3 : 1, zIndex: 10 }}
                      >
                        &larr;
                      </button>
                      <button 
                        aria-label="Next image"
                        onClick={() => { setImageIndex(i => Math.min((mediaUrls.length || rawFiles.length) - 1, i + 1)); setZoomLevel(1); }}
                        disabled={imageIndex === (mediaUrls.length || rawFiles.length) - 1}
                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', padding: '1rem', cursor: imageIndex === (mediaUrls.length || rawFiles.length) - 1 ? 'not-allowed' : 'pointer', borderRadius: '50%', opacity: imageIndex === (mediaUrls.length || rawFiles.length) - 1 ? 0.3 : 1, zIndex: 10 }}
                      >
                        &rarr;
                      </button>
                      <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', zIndex: 10 }}>
                        Page {imageIndex + 1} of {mediaUrls.length || rawFiles.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '1rem' }}>??</div>
                  <h2 style={{ color: 'var(--c-textBright)', margin: '0 0 1rem 0' }}>External Source or Unsupported Format</h2>
                  <p style={{ color: 'var(--c-text)', maxWidth: '400px', margin: '0 0 2rem 0', lineHeight: 1.6 }}>
                    Inline viewing for this file format is not supported.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {hasRawFile ? rawFiles.map((file, idx) => (
                      <a
                        key={idx}
                        href={`/api/assets/${encodeURIComponent(file.path.split('/').pop())}`}
                        target="_blank"
                        rel="noreferrer"
                        className="lux-hover-lift"
                        style={{ background: 'var(--c-gold)', color: '#000', padding: '0.8rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
                      >
                        Download {rawFiles.length > 1 ? `Page ${idx + 1}` : 'File'}
                      </a>
                    )) : (
                      <a
                        href={displayUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="lux-hover-lift"
                        style={{ background: 'var(--c-gold)', color: '#000', padding: '1rem 2.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
                      >
                        Download / Open File
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {doc.url && doc.type !== 'dataset' && (
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select 
                    value={citationStyle}
                    onChange={handleStyleChange}
                    style={{ background: 'var(--c-bgDeep)', color: 'var(--c-text)', border: '1px solid var(--c-ghost)', padding: '0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}
                  >
                    <option value="APA">APA</option>
                    <option value="MLA">MLA</option>
                    <option value="Chicago">Chicago</option>
                  </select>
                  <button 
                    onClick={() => handleCopyGlobalCitation(citationTitle, metadata)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid var(--c-ghost)', color: 'var(--c-text)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    {copiedGlobal ? <Check size={14} color="var(--c-green)" /> : <Copy size={14} />}
                    {copiedGlobal ? "Copied!" : "Copy Citation"}
                  </button>
                </div>
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    color: 'var(--c-gold)',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  DOWNLOAD SOURCE FILE &rarr;
                </a>
              </div>
            )}
          </div>
        )}

        </div> {/* End Main Layout Container */}

        {/* Abstract & Metadata */}
        <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 500px' }}>
            <div className="lux-lens" style={{ padding: '2.5rem', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--c-textBright)', fontSize: '1.4rem', letterSpacing: '0.05em' }}>Abstract & Description</h3>
              <div style={{ color: 'var(--c-text)', lineHeight: '1.8', fontSize: '1.1rem', cursor: 'text' }}>
                {(metadata.abstract || metadata.description || "No abstract or description is available for this document in the archive.").split('\n').map((paragraph, idx) => (
                  <p key={idx} style={{ margin: '0 0 1rem 0' }}>
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {/* Entities and Tags */}
              {(metadata.gemini_extracted_metadata?.organizations?.length > 0 || (metadata.organizations && metadata.organizations.length > 0)) && (
                <div style={{ marginTop: '2rem' }}>
                  <h4 style={{ color: 'var(--c-dim)', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>Organizations Mentioned</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(metadata.gemini_extracted_metadata?.organizations || metadata.organizations).map(o => (
                      <EntityPopover key={o} name={o} type="organization" />
                    ))}
                  </div>
                </div>
              )}

              {/* Removed Key People, Tags, and Physical Provenance to top metadata table */}
            </div>
          </div>

          {/* Optional Sidebar for Cover Image if it exists */}
          {coverImage && (
            <div style={{ flex: '0 0 350px' }} className="mobile-only-full-width">
              <div style={{
                width: '100%',
                aspectRatio: '3/4',
                borderRadius: '8px',
                backgroundImage: `url(${coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)'
              }} />
            </div>
          )}
        </div>

        <CommentsWidget docId={doc.id} title={citationTitle} />

      </div>
      {/* Translation Request Modal */}
      {showTranslationModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseDown={(e) => e.stopPropagation()}>
          <div className="lux-glide-in" style={{ background: 'var(--c-bgCard)', padding: '2rem', borderRadius: '12px', width: '400px', border: '1px solid var(--c-ghost)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--c-textBright)' }}>Request Translation</h3>
            <p style={{ color: 'var(--c-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Select up to 3 languages. Once approved by an archivist, the AI-translated document will be available for everyone.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {['Spanish', 'French', 'German', 'Hebrew', 'Arabic', 'Mandarin', 'Japanese', 'Russian', 'Portuguese', 'Hindi', 'Italian', 'Korean'].map(lang => (
                <label key={lang} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-text)', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedLanguages.includes(lang)}
                    disabled={!selectedLanguages.includes(lang) && selectedLanguages.length >= 3}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedLanguages([...selectedLanguages, lang]);
                      else setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                    }}
                  />
                  {lang}
                </label>
              ))}
            </div>

            {requestStatus && <div style={{ color: 'var(--c-gold)', fontSize: '0.9rem', marginBottom: '1rem' }}>{requestStatus}</div>}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => { setShowTranslationModal(false); setRequestStatus(''); setSelectedLanguages([]); }} 
                style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--c-ghost)', borderRadius: '6px', color: 'var(--c-dim)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                disabled={selectedLanguages.length === 0}
                onClick={async () => {
                  setRequestStatus('Submitting request...');
                  try {
                    const res = await fetch('/api/translations/request', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ document_id: id, target_languages: selectedLanguages })
                    });
                    if (res.ok) {
                      setRequestStatus('Request submitted successfully!');
                      setTimeout(() => { setShowTranslationModal(false); setRequestStatus(''); setSelectedLanguages([]); }, 2000);
                    } else {
                      setRequestStatus('Failed to submit request.');
                    }
                  } catch (e) {
                    setRequestStatus('Error submitting request.');
                  }
                }} 
                style={{ flex: 1, padding: '0.75rem', background: 'var(--c-goldBright)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: selectedLanguages.length === 0 ? 'not-allowed' : 'pointer', opacity: selectedLanguages.length === 0 ? 0.5 : 1 }}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
