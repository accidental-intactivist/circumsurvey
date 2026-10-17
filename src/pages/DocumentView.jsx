import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useReport } from '../contexts/ReportContext';
import { useMediaList } from '../contexts/MediaListContext';
import { useAssistant } from '../contexts/AssistantContext';
import { 
  FilePlus, PlusSquare, Sparkles, Loader, Globe, Copy, Check, ZoomIn, ZoomOut, 
  Maximize, Minimize, RefreshCw, RotateCw, Lock, Video, Headphones, Newspaper, 
  Image as ImageIcon, FileText, Calendar, MapPin, Building2, Folder, Tag, 
  Bookmark, Download, ExternalLink, Share2, Scale, Film, Database, Info, 
  ArrowLeft, ArrowRight, Clock, FileCode, User
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CustomPDFViewer from '../components/CustomPDFViewer';
import ThinkingSpirograph from '../components/ThinkingSpirograph';
import CommentsWidget from '../components/CommentsWidget';
import EntityLink from '../components/EntityLink';
import { generateFriendlySlug, parseFriendlySlug } from '../utils/slugs';
import { resolveCollectionName } from '../utils/collections';
import { 
  formatPlainTextToMarkdown, 
  formatExecutiveSummary, 
  parseRtfToText, 
  parseCsvToMarkdownTable, 
  normalizeDocumentText 
} from '../utils/formatMarkdown';
import { safeParseJson } from '../utils/json';
import { SourceLensPanel, ContextNotes, AlsoCoveredBy, DigestPulse } from '../components/SourceLensPanel';
import AutoEntityLinker from '../components/AutoEntityLinker';
import LoomChoreography from '../components/GuidedTour/LoomChoreography';
import MediaEmbed, { parseMediaUrl } from '../components/MediaEmbed';
import './AdminArchivePage.css';

export const isVideoFile = (url, title, rawFiles = []) => {
  const check = (str) => Boolean(str && (String(str).match(/\.(mp4|mov|webm|ogg|mkv|avi|m4v|wmv|flv)$/i) || String(str).match(/(youtube\.com|youtu\.be|vimeo\.com)/i)));
  if (check(url) || check(title)) return true;
  if (Array.isArray(rawFiles) && rawFiles.some(f => check(f?.path) || check(f?.name))) return true;
  return false;
};

export const isAudioFile = (url, title, rawFiles = []) => {
  const check = (str) => Boolean(str && String(str).match(/\.(mp3|wav|m4a|aac|flac|oga|opus)$/i));
  if (check(url) || check(title)) return true;
  if (Array.isArray(rawFiles) && rawFiles.some(f => check(f?.path) || check(f?.name))) return true;
  return false;
};

export const isPdfFile = (url, title, rawFiles = []) => {
  const check = (str) => Boolean(str && String(str).toLowerCase().endsWith('.pdf'));
  if (check(url) || check(title)) return true;
  if (Array.isArray(rawFiles) && rawFiles.some(f => check(f?.path) || check(f?.name))) return true;
  return false;
};

export const isImageFile = (url, title, rawFiles = []) => {
  const check = (str) => Boolean(str && String(str).match(/\.(jpeg|jpg|gif|png|webp|svg|bmp|tiff?)$/i));
  if (check(url) || check(title)) return true;
  if (Array.isArray(rawFiles) && rawFiles.some(f => check(f?.path) || check(f?.name))) return true;
  return false;
};

export const isWordDocFile = (url, title, rawFiles = []) => {
  const check = (str) => Boolean(str && String(str).match(/\.(docx?|odt|pages)$/i));
  if (check(url) || check(title)) return true;
  if (Array.isArray(rawFiles) && rawFiles.some(f => check(f?.path) || check(f?.name))) return true;
  return false;
};

export const isRtfFile = (url, title, rawFiles = []) => {
  const check = (str) => Boolean(str && String(str).match(/\.rtf$/i));
  if (check(url) || check(title)) return true;
  if (Array.isArray(rawFiles) && rawFiles.some(f => check(f?.path) || check(f?.name))) return true;
  return false;
};

export const isTabularFile = (url, title, rawFiles = []) => {
  const check = (str) => Boolean(str && String(str).match(/\.(csv|tsv)$/i));
  if (check(url) || check(title)) return true;
  if (Array.isArray(rawFiles) && rawFiles.some(f => check(f?.path) || check(f?.name))) return true;
  return false;
};

export const isCodeOrStructuredFile = (url, title, rawFiles = []) => {
  const check = (str) => Boolean(str && String(str).match(/\.(json|xml|html?|js|py|sh|sql)$/i));
  if (check(url) || check(title)) return true;
  if (Array.isArray(rawFiles) && rawFiles.some(f => check(f?.path) || check(f?.name))) return true;
  return false;
};

export const isTextDocument = (url, title, rawFiles = [], doc = null) => {
  const check = (str) => Boolean(str && String(str).match(/\.(txt|text|log|md|markdown|rtf|docx?|odt|csv|tsv|json|xml|html?)$/i));
  if (check(url) || check(title)) return true;
  if (Array.isArray(rawFiles) && rawFiles.some(f => check(f?.path) || check(f?.name))) return true;
  const meta = safeParseJson(doc?.metadata_json);
  if (meta?.extracted_text_url) return true;
  if (doc?.content && doc.content.trim().length > 0) return true;
  if (doc?.type === 'text' || doc?.type === 'transcript') return true;
  return false;
};

export const getFormatMeta = (doc, displayUrl, rawFiles = []) => {
  if (isVideoFile(displayUrl, doc?.title, rawFiles) || doc?.type === 'video') {
    return {
      type: 'video',
      filterKey: 'video',
      label: 'Video Archive',
      icon: <Video size={13} />,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.15)',
      border: 'rgba(6, 182, 212, 0.4)'
    };
  }
  if (isAudioFile(displayUrl, doc?.title, rawFiles) || doc?.type === 'audio') {
    return {
      type: 'audio',
      filterKey: 'audio',
      label: 'Audio Recording',
      icon: <Headphones size={13} />,
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.15)',
      border: 'rgba(168, 85, 247, 0.4)'
    };
  }
  if (doc?.type === 'dataset') {
    return {
      type: 'dataset',
      filterKey: 'dataset',
      label: 'Interactive Dataset',
      icon: <Database size={13} />,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)'
    };
  }
  if (doc?.type === 'external_news') {
    return {
      type: 'news article',
      filterKey: 'external_news',
      label: 'News Clipping',
      icon: <Newspaper size={13} />,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)'
    };
  }
  if (isImageFile(displayUrl, doc?.title, rawFiles) || doc?.type === 'image') {
    return {
      type: 'image',
      filterKey: 'image',
      label: 'Archival Photograph',
      icon: <ImageIcon size={13} />,
      color: '#fb923c',
      bg: 'rgba(251, 146, 60, 0.15)',
      border: 'rgba(251, 146, 60, 0.4)'
    };
  }
  if (isWordDocFile(displayUrl, doc?.title, rawFiles)) {
    return {
      type: 'word',
      filterKey: 'document',
      label: 'Word Document (.docx)',
      icon: <FileText size={13} />,
      color: '#60a5fa',
      bg: 'rgba(96, 165, 250, 0.15)',
      border: 'rgba(96, 165, 250, 0.4)'
    };
  }
  if (isRtfFile(displayUrl, doc?.title, rawFiles)) {
    return {
      type: 'rtf',
      filterKey: 'document',
      label: 'Rich Text Format (.rtf)',
      icon: <FileText size={13} />,
      color: '#fb7185',
      bg: 'rgba(251, 113, 133, 0.15)',
      border: 'rgba(251, 113, 133, 0.4)'
    };
  }
  if (isTabularFile(displayUrl, doc?.title, rawFiles)) {
    return {
      type: 'tabular',
      filterKey: 'dataset',
      label: 'Tabular Dataset (.csv)',
      icon: <Database size={13} />,
      color: '#34d399',
      bg: 'rgba(52, 211, 153, 0.15)',
      border: 'rgba(52, 211, 153, 0.4)'
    };
  }
  if (displayUrl && displayUrl.toLowerCase().endsWith('.txt')) {
    return {
      type: 'text',
      filterKey: 'document',
      label: 'Plain Text (.txt)',
      icon: <FileText size={13} />,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.15)',
      border: 'rgba(56, 189, 248, 0.4)'
    };
  }
  if (displayUrl && displayUrl.toLowerCase().endsWith('.md')) {
    return {
      type: 'markdown',
      filterKey: 'document',
      label: 'Markdown Archive (.md)',
      icon: <FileCode size={13} />,
      color: '#a78bfa',
      bg: 'rgba(167, 139, 250, 0.15)',
      border: 'rgba(167, 139, 250, 0.4)'
    };
  }
  if (displayUrl && displayUrl.toLowerCase().endsWith('.pdf')) {
    return {
      type: 'pdf',
      filterKey: 'document',
      label: 'PDF Document (.pdf)',
      icon: <FileText size={13} />,
      color: '#facc15',
      bg: 'rgba(250, 204, 21, 0.15)',
      border: 'rgba(250, 204, 21, 0.4)'
    };
  }
  return {
    type: 'document',
    filterKey: 'document',
    label: 'Manuscript / Document',
    icon: <FileText size={13} />,
    color: '#facc15',
    bg: 'rgba(250, 204, 21, 0.15)',
    border: 'rgba(250, 204, 21, 0.4)'
  };
};

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
  const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);

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
    const handleMouseUp = (e) => {
      if (e?.target?.closest && (e.target.closest('[data-docview-toolbar="true"]') || e.target.closest('[data-docview-modal="true"]'))) {
        return;
      }

      const activeSelection = window.getSelection();
      const text = activeSelection ? activeSelection.toString().trim() : '';

      if (text.length > 10 && activeSelection.rangeCount > 0) {
        const range = activeSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const placeBelow = rect.top < 230;
        setSelection({
          text,
          x: Math.max(110, Math.min(window.innerWidth - 110, rect.left + (rect.width / 2))),
          y: placeBelow ? (rect.bottom + 10) : (rect.top - 10),
          placeBelow,
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
      const targetId = parseFriendlySlug(id);
      let foundDoc = null;
      try {
        const apiUrl = `/api/cms/${targetId}`;
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          foundDoc = data.data && Array.isArray(data.data) ? null : data;
        }
      } catch (err) {
        console.warn("Primary fetch failed, falling back to mock", err);
      }
      
      // Attempt to merge rich metadata from api_mock.json by matching titles or slug
      try {
        const mockRes = await fetch('/api_mock.json');
        if (mockRes.ok) {
          const mockData = await mockRes.json();
          
          // If we didn't get a valid doc from the backend (e.g. mock server), find it here by id or url hash
          if (!foundDoc) {
             foundDoc = mockData.find(m => {
               if (m.id === id || m.id === targetId) return true;
               if (id === '1994-awakenings-full-report' && m.id === 'umass-ms1205-raw-4f594152') return true;
               if (id === 'awakenings-preliminary-poll-of-circumcised-men' && m.id === 'umass-ms1205-raw-4f594152') return true;
               const mMeta = safeParseJson(m.metadata_json);
               const fullSlug = generateFriendlySlug(m, mMeta);
               if (fullSlug === id || fullSlug.split('--')[0] === id) return true;
               return (m.url && (m.url.includes(id) || m.url.includes(targetId)));
             });
             if (!foundDoc) foundDoc = null;
          }

          if (foundDoc) {
            const liveTitle = foundDoc.title || '';
            const liveMeta = safeParseJson(foundDoc.metadata_json);
            const geminiTitle = liveMeta.gemini_extracted_metadata?.title || '';
            
            const match = mockData.find(m => {
              if (m.id === foundDoc.id) return true;
              const mMeta = safeParseJson(m.metadata_json);
              const mTitle = m.title || mMeta.title || '';
              if (!mTitle) return false;
              
              const t1 = liveTitle.trim().toLowerCase();
              const t2 = mTitle.trim().toLowerCase();
              const t3 = geminiTitle.trim().toLowerCase();
              
              // Strict title matching to prevent generic single-word false matches (e.g. matching "Circumcision" to any title)
              if (t1 && t2 && t1 === t2) return true;
              if (t3 && t2 && t3 === t2) return true;
              if (t1.length > 25 && t2.length > 25 && (t1.includes(t2) || t2.includes(t1)) && Math.abs(t1.length - t2.length) < 15) return true;
              return false;
            });
            
            if (match) {
              const mMeta = safeParseJson(match.metadata_json);
              // Merge the two metadata objects, prioritizing the mock (richer) metadata,
              // but keeping gemini_extracted_metadata and extracted_text_url
              foundDoc.metadata_json = JSON.stringify({
                ...mMeta,
                ...liveMeta,
                extracted_text_url: liveMeta.extracted_text_url || mMeta.extracted_text_url,
                gemini_extracted_metadata: liveMeta.gemini_extracted_metadata || mMeta.gemini_extracted_metadata
              });
            // Merge series/collection info
            if (match.series && !foundDoc.series) foundDoc.series = match.series;
            if (match.source_collection) {
              foundDoc.source_collection = resolveCollectionName(match, foundDoc.source_collection);
            }
          }
        }
      }
      } catch (e) {
        console.warn("Failed to merge mock metadata", e);
      }

      if (foundDoc) {
        foundDoc.source_collection = resolveCollectionName(foundDoc, 'The Tim Hammond Genital Autonomy Archive');
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
              const dateA = safeParseJson(a.metadata_json).date || '9999';
              const dateB = safeParseJson(b.metadata_json).date || '9999';
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
      const meta = safeParseJson(doc.metadata_json);
      const title = getCleanTitle(doc, meta);
      document.title = `${title} — Intactivism Archive`;

      // Broadcast title to TopNav and window state
      window.__currentDocumentTitle = title;
      window.dispatchEvent(new CustomEvent('document-title-change', { detail: title }));

      // If visited via raw ID (e.g. /library/ec2f1b89), retitle the URL in place using friendly slug!
      const friendlySlug = generateFriendlySlug(doc, meta || {});
      if (friendlySlug && routeId && !routeId.includes('--')) {
        window.history.replaceState(null, '', `/library/${friendlySlug}`);
      }
    }
    return () => { 
      document.title = 'The Accidental Intactivist\'s Guide'; 
      window.__currentDocumentTitle = null;
      window.dispatchEvent(new CustomEvent('document-title-change', { detail: null }));
    };
  }, [doc, routeId]);

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
        openAssistant(selection.text, data.questions, doc);
      } else {
        openAssistant(selection.text, null, doc);
      }
    } catch (e) {
      console.error(e);
      setSelection({ ...selection, visible: false });
      openAssistant(selection.text, null, doc);
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

  // View mode and reader state
  const [viewMode, setViewMode] = useState('pdf');
  const [textContent, setTextContent] = useState('');
  const [rawLoadedText, setRawLoadedText] = useState('');
  const [loadingText, setLoadingText] = useState(false);
  const [textReadingMode, setTextReadingMode] = useState('rendered'); // 'rendered' | 'raw'
  const [textFontSize, setTextFontSize] = useState('standard'); // 'compact' | 'standard' | 'large'
  const [copiedFullText, setCopiedFullText] = useState(false);

  const loadTextContent = async (targetDoc = doc) => {
    if (!targetDoc) return;
    setLoadingText(true);
    let loadedText = null;
    let loadedFromUrl = '';

    const meta = safeParseJson(targetDoc?.metadata_json);

    // Collect candidate URLs for rich Markdown (.md), raw text (.txt), etc.
    // Strictly prioritize text formats; NEVER treat binary .pdf, .tif, or images as text
    const candidateUrls = [];
    if (meta.extracted_text_url) {
      candidateUrls.push(meta.extracted_text_url);
    }
    if (targetDoc?.url) {
      if (targetDoc.url.toLowerCase().endsWith('.pdf')) {
        candidateUrls.push(targetDoc.url.replace(/\.pdf$/i, '.md'));
        candidateUrls.push(targetDoc.url.replace(/\.pdf$/i, '.txt'));
      } else if (targetDoc.url.match(/\.(docx?|odt|rtf|txt|md|html?|csv|tsv|json)$/i)) {
        candidateUrls.push(targetDoc.url);
        candidateUrls.push(targetDoc.url.replace(/\.(docx?|odt|rtf|txt)$/i, '.md'));
        candidateUrls.push(targetDoc.url.replace(/\.(docx?|odt|rtf|txt)$/i, '.txt'));
      }
    }
    if (Array.isArray(meta.raw_files)) {
      meta.raw_files.forEach(f => {
        if (f?.path && f.path.match(/\.(txt|md|rtf|csv|tsv|json|xml|html?)$/i)) {
          candidateUrls.push(`/api/assets/${encodeURIComponent(f.path.split('/').pop())}`);
        }
      });
    }
    if (targetDoc?.id) {
      candidateUrls.push(`/api/assets/documents/${targetDoc.id}.md`);
      candidateUrls.push(`/api/assets/documents/${targetDoc.id}.txt`);
      candidateUrls.push(`/api/assets/${targetDoc.id}.md`);
      candidateUrls.push(`/api/assets/${targetDoc.id}.txt`);
    }

    const uniqueCandidates = [...new Set(candidateUrls.filter(Boolean))];

    for (const url of uniqueCandidates) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const txt = await res.text();
          const isBinaryOrHtml =
            txt.startsWith('%PDF') ||
            txt.includes('\x00') ||
            txt.includes('<!DOCTYPE html>') ||
            txt.includes('<!doctype html>');
          if (txt && txt.trim().length > 0 && !isBinaryOrHtml) {
            loadedText = txt;
            loadedFromUrl = url;
            break;
          }
        }
      } catch (_e) {
        // try next candidate
      }
    }

    // Fallback to doc.content if available
    if (!loadedText && targetDoc?.content && targetDoc.content.trim().length > 0) {
      loadedText = targetDoc.content;
      loadedFromUrl = 'inline_db';
    }

    if (loadedText) {
      // Gracefully handle placeholder strings
      if (loadedText.trim() === 'Text Temporarily Not Available') {
        const title = targetDoc.title || 'Document';
        loadedText = `# ${title}\n\n> **Archival Notice: OCR Digitization in Progress**\n>\n> An automated machine-readable transcript is currently being digitized for this historical scan. You can view the original archival document in high fidelity using the **High-Res Scan** or **PDF Reader** tab above.`;
      }
      const normalized = normalizeDocumentText(loadedText, loadedFromUrl || targetDoc?.url || '');
      setRawLoadedText(loadedText);
      setTextContent(normalized);
    } else {
      setTextContent("No extracted text or transcript is currently available for this document.");
    }
    setLoadingText(false);
  };

  const handleToggleView = async (mode) => {
    setViewMode(mode);
    if (mode === 'text' && !textContent && !loadingText) {
      await loadTextContent(doc);
    }
  };

  // Word count and reading time metrics
  const textWordCount = useMemo(() => {
    const textToCount = translatedText || textContent || '';
    if (!textToCount) return 0;
    const clean = textToCount.replace(/[#*`_~>[\]()|\\]/g, ' ');
    const words = clean.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [translatedText, textContent]);

  const readingTimeMinutes = useMemo(() => {
    return Math.max(1, Math.ceil(textWordCount / 225));
  }, [textWordCount]);

  const handleCopyFullText = async () => {
    const textToCopy = textReadingMode === 'raw' && rawLoadedText ? rawLoadedText : (translatedText || textContent);
    if (!textToCopy) return;
    const meta = safeParseJson(doc?.metadata_json);
    const citation = generateCitationText(meta, doc?.title);
    const payload = `${textToCopy}\n\n---\nSource: ${citation}`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopiedFullText(true);
      setTimeout(() => setCopiedFullText(false), 2500);
    } catch (_e) {
      // fallback
    }
  };

  // Pre-load text in background on mount so switching to Extracted Text is instantaneous (0ms delay)
  useEffect(() => {
    if (doc) {
      const meta = safeParseJson(doc.metadata_json);
      const curRaw = (meta.raw_files && meta.raw_files[0]) ? meta.raw_files[0] : null;
      const dUrl = doc.url || (curRaw ? `/api/assets/${encodeURIComponent(curRaw.path?.split('/').pop())}` : null);
      const isPdf = isPdfFile(dUrl, doc.title, meta.raw_files);
      const isMedia = isAudioFile(dUrl, doc.title, meta.raw_files) || isVideoFile(dUrl, doc.title, meta.raw_files) || isImageFile(dUrl, doc.title, meta.raw_files);
      
      if (!isPdf && !isMedia && (isTextDocument(dUrl, doc.title, meta.raw_files, doc) || meta?.extracted_text_url)) {
        setViewMode('text');
      }

      // Always pre-load text content in the background
      if (!textContent && !loadingText) {
        loadTextContent(doc);
      }
    }
  }, [doc?.id]);

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

  const metadata = safeParseJson(doc.metadata_json);
  const mediaUrls = safeParseJson(doc.media_urls, []);
  
  const rawFiles = metadata.raw_files || [];
  const hasRawFile = rawFiles.length > 0;
  
  const currentRawFile = rawFiles[imageIndex] || rawFiles[0];
  const displayUrl = doc.url || (currentRawFile ? `/api/assets/${encodeURIComponent(currentRawFile.path.split('/').pop())}` : null);

  const coverImage = mediaUrls.find(url => isImageFile(url)) || 
                    (displayUrl && isImageFile(displayUrl) ? displayUrl : null);
                    
  const isPending = doc.status === 'pending_digitization' && !doc.url && !hasRawFile;
  const citationTitle = getCleanTitle(doc, metadata);
  const formatMeta = getFormatMeta(doc, displayUrl, rawFiles);
  const displayDate = getDisplayDate(doc, metadata);
  const dateYear = displayDate ? (displayDate.match(/\b(19\d{2}|20\d{2})\b/)?.[1] || null) : null;

  const keyPeopleList = [
    ...(metadata.gemini_extracted_metadata?.authors || []),
    ...(metadata.key_people || []),
    ...(metadata.author ? [metadata.author] : [])
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  const keywordList = [
    ...(metadata.keywords || []),
    ...(metadata.tags || []),
    ...(metadata.gemini_extracted_metadata?.keywords || [])
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  const orgList = [
    ...(metadata.gemini_extracted_metadata?.organizations || []),
    ...(metadata.organizations || [])
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  const rawAbstract = metadata.abstract || metadata.description || "";
  const formattedAbstract = formatExecutiveSummary(rawAbstract);
  const allLinkedEntities = [
    ...orgList,
    ...keyPeopleList
  ];

  const renderTextDocumentReader = () => {
    const isWord = isWordDocFile(displayUrl, doc?.title, rawFiles);
    const isRtf = isRtfFile(displayUrl, doc?.title, rawFiles);
    const isCsv = isTabularFile(displayUrl, doc?.title, rawFiles);
    const isPlain = displayUrl && displayUrl.toLowerCase().endsWith('.txt');
    const isMd = displayUrl && displayUrl.toLowerCase().endsWith('.md');
    const isPdf = isPdfFile(displayUrl, doc?.title, rawFiles);

    const formatBadge = isWord
      ? { label: 'Word Document (.docx)', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' }
      : isRtf
      ? { label: 'Rich Text Format (.rtf)', color: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)' }
      : isCsv
      ? { label: 'Tabular Data (.csv)', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' }
      : isPlain
      ? { label: 'Plain Text (.txt)', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' }
      : isMd
      ? { label: 'Markdown Archive (.md)', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' }
      : isPdf
      ? { label: 'Extracted OCR Transcript', color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)' }
      : { label: 'Archival Document', color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)' };

    const currentFontSizeRem = textFontSize === 'compact' ? '0.92rem' : textFontSize === 'large' ? '1.18rem' : '1.02rem';
    const currentLineHeight = textFontSize === 'compact' ? 1.72 : textFontSize === 'large' ? 1.95 : 1.82;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg)' }}>
        {/* Top Reading Controls Bar */}
        <div style={{
          padding: '0.65rem 1.25rem',
          background: 'var(--c-bgDeep)',
          borderBottom: '1px solid var(--c-ghost)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.82rem'
        }}>
          {/* Format Badge & Metrics */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              padding: '0.22rem 0.6rem',
              background: formatBadge.bg,
              color: formatBadge.color,
              borderRadius: '4px',
              fontWeight: '700',
              fontSize: '0.72rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              {formatBadge.label}
            </span>

            {textWordCount > 0 && (
              <span style={{ color: 'var(--c-dim)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                <Clock size={12} />
                <span>{textWordCount.toLocaleString()} words</span>
                <span>&bull;</span>
                <span>~{readingTimeMinutes} min read</span>
              </span>
            )}

            {translatedText && (
              <span style={{
                padding: '0.15rem 0.5rem',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: '600'
              }}>
                Translated: {currentLanguage}
              </span>
            )}
          </div>

          {/* Reader Controls: Rendered/Raw Toggle, Font Size, Copy, Translate, Download */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* View Mode Toggle */}
            <div style={{
              display: 'inline-flex',
              background: 'var(--c-bgCard)',
              padding: '2px',
              borderRadius: '6px',
              border: '1px solid var(--c-ghost)'
            }}>
              <button
                onClick={() => setTextReadingMode('rendered')}
                style={{
                  padding: '0.22rem 0.6rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: textReadingMode === 'rendered' ? 'var(--c-bg)' : 'transparent',
                  color: textReadingMode === 'rendered' ? 'var(--c-goldBright)' : 'var(--c-dim)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                Rendered
              </button>
              <button
                onClick={() => setTextReadingMode('raw')}
                style={{
                  padding: '0.22rem 0.6rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: textReadingMode === 'raw' ? 'var(--c-bg)' : 'transparent',
                  color: textReadingMode === 'raw' ? 'var(--c-goldBright)' : 'var(--c-dim)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                Raw Source
              </button>
            </div>

            {/* Font Size Selector */}
            <div style={{
              display: 'inline-flex',
              background: 'var(--c-bgCard)',
              padding: '2px',
              borderRadius: '6px',
              border: '1px solid var(--c-ghost)'
            }}>
              {[
                { key: 'compact', label: 'A-' },
                { key: 'standard', label: 'A' },
                { key: 'large', label: 'A+' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTextFontSize(key)}
                  title={`Font size: ${key}`}
                  style={{
                    padding: '0.22rem 0.45rem',
                    border: 'none',
                    borderRadius: '4px',
                    background: textFontSize === key ? 'var(--c-bg)' : 'transparent',
                    color: textFontSize === key ? 'var(--c-textBright)' : 'var(--c-dim)',
                    fontSize: key === 'compact' ? '0.68rem' : key === 'large' ? '0.85rem' : '0.75rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Translate Button */}
            <button
              onClick={() => setShowTranslationModal(true)}
              className="lux-hover-lift"
              title="Translate Document"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.6rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--c-ghost)',
                borderRadius: '4px',
                color: 'var(--c-textBright)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}
            >
              <Globe size={12} /> Translate
            </button>

            {/* Copy Full Text */}
            <button
              onClick={handleCopyFullText}
              className="lux-hover-lift"
              title="Copy Full Document with Citation"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.65rem',
                background: copiedFullText ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${copiedFullText ? '#10b981' : 'var(--c-ghost)'}`,
                borderRadius: '4px',
                color: copiedFullText ? '#10b981' : 'var(--c-textBright)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}
            >
              {copiedFullText ? <Check size={12} /> : <Copy size={12} />}
              {copiedFullText ? 'Copied' : 'Copy'}
            </button>

            {/* Download Original File */}
            {displayUrl && (
              <a
                href={displayUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="lux-hover-lift"
                title="Download original file"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  background: 'rgba(234, 179, 8, 0.12)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '4px',
                  color: 'var(--c-goldBright)',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}
              >
                <Download size={12} /> Download
              </a>
            )}
          </div>
        </div>

        {/* Word Document Banner if applicable */}
        {isWord && (
          <div style={{
            padding: '0.65rem 1.25rem',
            background: 'rgba(59, 130, 246, 0.08)',
            borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#93c5fd'
          }}>
            <span>
              <strong>Word Document:</strong> Displaying extracted text transcript. Original styling, pagination, and tables are preserved in the original file.
            </span>
            <a
              href={displayUrl}
              download
              style={{
                color: '#bfdbfe',
                textDecoration: 'underline',
                fontWeight: '700',
                whiteSpace: 'nowrap'
              }}
            >
              Download Original (.docx) &rarr;
            </a>
          </div>
        )}

        {/* Reader Document Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2.5rem 3.5rem',
          background: 'var(--c-bg)',
          color: 'var(--c-textBright)',
          fontFamily: textReadingMode === 'raw' ? 'var(--f-mono, monospace)' : 'var(--f-body, sans-serif)',
          lineHeight: currentLineHeight,
          fontSize: currentFontSizeRem
        }}>
          {loadingText ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '280px',
              color: 'var(--c-dim)'
            }}>
              <div style={{ height: '90px', display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <ThinkingSpirograph />
              </div>
              <p style={{ fontFamily: 'var(--f-condensed)', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                Loading document text...
              </p>
            </div>
          ) : textReadingMode === 'raw' ? (
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'Consolas, Monaco, "JetBrains Mono", monospace',
              fontSize: currentFontSizeRem,
              lineHeight: 1.6,
              color: 'var(--c-textBright)',
              background: 'rgba(0,0,0,0.3)',
              padding: '1.75rem',
              borderRadius: '8px',
              border: '1px solid var(--c-ghost)',
              margin: 0
            }}>
              {rawLoadedText || translatedText || textContent || 'No text available.'}
            </pre>
          ) : (
            <div className="markdown-body" style={{ color: 'var(--c-textBright)', fontSize: currentFontSizeRem, maxWidth: '880px', margin: '0 auto' }}>
              {translatedText ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedText}</ReactMarkdown>
              ) : textContent ? (
                <AutoEntityLinker
                  text={textContent}
                  entities={allLinkedEntities}
                />
              ) : (
                <div style={{ opacity: 0.6, textAlign: 'center', marginTop: '3rem' }}>
                  <p style={{ marginBottom: '1rem' }}>No extracted text currently available for this document.</p>
                  <button
                    onClick={() => loadTextContent(doc)}
                    style={{
                      background: 'var(--c-goldBright)',
                      color: '#000',
                      border: 'none',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Retry Loading Text
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (

    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', position: 'relative' }}>
      


      {/* Floating Toolbar */}
      {selection.visible && (
        <div 
          data-docview-toolbar="true"
          className="lux-glide-in"
          style={{
            position: 'fixed',
            left: selection.x,
            top: selection.y,
            transform: selection.placeBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
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
        <div data-docview-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseDown={(e) => e.stopPropagation()}>
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
      <div className="lux-glide-in" style={{ position: 'relative', zIndex: 1, padding: '0rem 4rem 2rem 4rem' }}>
        
        {/* Hero Section */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
          padding: '2rem 2.5rem 1.5rem',
          marginBottom: '2rem',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(212, 160, 48, 0.08) 0%, rgba(15, 17, 26, 0.7) 100%)',
          border: '1px solid var(--c-ghost)'
        }}>
          <div className="no-print" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.2 }}>
            <LoomChoreography isInline={true} forceFormation="quiet" opacity={1} themeColor="library" />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {prevDoc && (
                  <Link to={`/library/${generateFriendlySlug(prevDoc, safeParseJson(prevDoc.metadata_json))}`} className="lux-hover-lift" style={{ color: 'var(--c-textBright)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.5rem 1rem', border: '1px solid var(--c-ghost)', borderRadius: '20px' }}>
                    <span style={{ fontSize: '1.2rem' }}>&larr;</span> Prev Document
                  </Link>
                )}
                {nextDoc && (
                  <Link to={`/library/${generateFriendlySlug(nextDoc, safeParseJson(nextDoc.metadata_json))}`} className="lux-hover-lift" style={{ color: 'var(--c-textBright)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.5rem 1rem', border: '1px solid var(--c-ghost)', borderRadius: '20px' }}>
                    Next Document <span style={{ fontSize: '1.2rem' }}>&rarr;</span>
                  </Link>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => openAssistant('', null, doc)} style={{ color: 'var(--c-goldBright)', background: 'transparent', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.5rem 1rem', border: '1px solid var(--c-gold)', borderRadius: '20px', cursor: 'pointer' }} className="lux-hover-lift">
                  <Sparkles size={14} /> Ask Assistant
                </button>
                <Link to="/library" style={{ color: 'var(--c-textBright)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.5rem 1rem', border: '1px solid var(--c-ghost)', borderRadius: '20px' }} className="lux-hover-lift">
                  Return to Index
                </Link>
              </div>
            </div>
            
            <h1 style={{ margin: '0 0 1rem 0', fontSize: '2.5rem', fontFamily: 'var(--f-display)', letterSpacing: '-0.02em', lineHeight: '1.1', color: 'var(--c-textBright)' }}>
              {citationTitle}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
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
        </div>

        {/* Main Layout Container */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>
          
          {/* Left Column: Metadata Glow-Up Card */}
          <div style={{ flex: '1 1 340px', maxWidth: '420px', marginBottom: '2rem' }}>
            <div className="docview-metadata-card">
              {/* Card Header */}
              <div className="docview-meta-header">
                <div className="docview-meta-title-row">
                  <div className="docview-meta-title">
                    <Database size={15} color="var(--c-goldBright)" /> Record Dossier
                  </div>
                  <Link 
                    to={`/library?format=${formatMeta.filterKey}`}
                    className="docview-format-badge"
                    style={{
                      background: formatMeta.bg,
                      border: `1px solid ${formatMeta.border}`,
                      color: formatMeta.color
                    }}
                    title={`Filter Library by ${formatMeta.label}`}
                  >
                    {formatMeta.icon} {formatMeta.label}
                  </Link>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--c-dim)', fontFamily: 'var(--f-mono)' }}>
                  Catalog ID: {doc.id}
                </div>
              </div>

              <div className="nutrition-bar-thick" />

              {/* Metadata Fields Section */}
              <div className="docview-meta-section">
                
                {/* Date */}
                <div className="docview-meta-item">
                  <span className="docview-meta-label">
                    <Calendar size={13} color="var(--c-gold)" /> Chronology
                  </span>
                  <div className="docview-meta-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '700', color: 'var(--c-goldBright)', fontSize: '0.95rem' }}>
                      {displayDate}
                    </span>
                    {dateYear && (
                      <Link 
                        to={`/library?year=${dateYear}`}
                        className="lux-hover-lift"
                        style={{ fontSize: '0.72rem', color: 'var(--c-dim)', textDecoration: 'none', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.45rem', borderRadius: '3px' }}
                      >
                        Browse {dateYear} receipts &rarr;
                      </Link>
                    )}
                  </div>
                </div>

                {/* Movement Category */}
                {metadata.category && (
                  <div className="docview-meta-item">
                    <span className="docview-meta-label">
                      <Folder size={13} color="#38bdf8" /> Category Domain
                    </span>
                    <div className="docview-meta-value">
                      <Link 
                        to={`/library?category=${encodeURIComponent(metadata.category)}`}
                        className="docview-interactive-chip"
                      >
                        <Folder size={12} color="#38bdf8" />
                        <span>{metadata.category}</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Quick Abstract & Integrated Tags */}
                {rawAbstract && (
                  <div className="docview-meta-item">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="docview-meta-label" style={{ color: 'var(--c-goldBright)', fontWeight: '800' }}>
                        <FileText size={13} color="var(--c-goldBright)" /> Quick Abstract
                      </span>
                      <span style={{ fontSize: '0.66rem', color: 'var(--c-dim)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Executive Summary
                      </span>
                    </div>

                    <div className="docview-quick-abstract-box">
                      <div className={`docview-abstract-text ${isAbstractExpanded ? 'expanded' : 'collapsed'}`}>
                        <AutoEntityLinker text={formattedAbstract} entities={allLinkedEntities} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
                        <button
                          type="button"
                          onClick={() => setIsAbstractExpanded(!isAbstractExpanded)}
                          className="lux-hover-bright"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--c-goldBright)',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            letterSpacing: '0.04em',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          {isAbstractExpanded ? 'Show Less ▴' : 'Read Full Abstract ▾'}
                        </button>
                        
                        <a 
                          href="#deep-context-abstract"
                          style={{
                            color: 'var(--c-dim)',
                            fontSize: '0.7rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          className="lux-hover-bright"
                          title="Jump to comprehensive deep context section below"
                        >
                          Deep Context &darr;
                        </a>
                      </div>

                      {/* Integrated Organizations & Focus Tags */}
                      {(orgList.length > 0 || keywordList.length > 0) && (
                        <div style={{ marginTop: '0.4rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {orgList.length > 0 && (
                            <div>
                              <div style={{ fontSize: '0.66rem', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Building2 size={11} color="#38bdf8" /> Key Organizations
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                {orgList.slice(0, 4).map(org => (
                                  <EntityPopover key={org} name={org} type="organization" />
                                ))}
                                {orgList.length > 4 && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--c-dim)', alignSelf: 'center' }}>
                                    +{orgList.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {keywordList.length > 0 && (
                            <div>
                              <div style={{ fontSize: '0.66rem', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Tag size={11} color="var(--c-gold)" /> Focus Tags
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                {keywordList.slice(0, 5).map(kw => (
                                  <Link 
                                    key={kw} 
                                    to={`/library?tag=${encodeURIComponent(kw)}`}
                                    className="docview-interactive-chip"
                                    style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}
                                  >
                                    #{kw}
                                  </Link>
                                ))}
                                {keywordList.length > 5 && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--c-dim)', alignSelf: 'center' }}>
                                    +{keywordList.length - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Subject & Series */}
                {(metadata.subject || doc.series) && (
                  <div className="docview-meta-item">
                    <span className="docview-meta-label">
                      <Tag size={13} color="#a855f7" /> Subject & Series
                    </span>
                    <div className="docview-meta-value" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {metadata.subject && (
                        <Link 
                          to={`/library?q=${encodeURIComponent(metadata.subject)}`}
                          className="docview-interactive-chip"
                        >
                          <span>{metadata.subject}</span>
                        </Link>
                      )}
                      {doc.series && doc.series !== metadata.subject && (
                        <Link 
                          to={`/library?q=${encodeURIComponent(doc.series)}`}
                          className="docview-interactive-chip"
                        >
                          <span>{doc.series}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Archive Provenance */}
                <div className="docview-provenance-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--c-goldBright)' }}>
                    <Building2 size={13} /> Provenance & Repository
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--c-textBright)', fontWeight: '600', lineHeight: 1.4 }}>
                    {resolveCollectionName(doc, 'The Tim Hammond Genital Autonomy Archive')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--c-dim)' }}>
                    University of Massachusetts Amherst Special Collections (MS 1205)
                  </div>
                  {metadata.original_location && (
                    <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--c-dim)', textTransform: 'uppercase' }}>Physical Box / Folder:</span>
                      <Link
                        to={`/library?q=${encodeURIComponent(metadata.original_location.split('/').pop().trim())}`}
                        className="lux-hover-lift"
                        style={{ fontSize: '0.72rem', color: 'var(--c-muted)', fontFamily: 'var(--f-mono)', background: 'rgba(0,0,0,0.3)', padding: '0.25rem 0.45rem', borderRadius: '4px', wordBreak: 'break-all', textDecoration: 'none' }}
                        title="Click to search for related items in this archive folder"
                      >
                        {metadata.original_location}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Key People */}
                {keyPeopleList.length > 0 && (
                  <div className="docview-meta-item">
                    <span className="docview-meta-label">
                      <User size={13} color="#facc15" /> Key Historical Figures
                    </span>
                    <div className="docview-meta-value" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {keyPeopleList.map(p => (
                        <EntityLink key={p} name={p} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {keywordList.length > 0 && (
                  <div className="docview-meta-item">
                    <span className="docview-meta-label">
                      <Tag size={13} color="var(--c-dim)" /> Index Keywords
                    </span>
                    <div className="docview-meta-value" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {keywordList.map(kw => (
                        <Link 
                          key={kw} 
                          to={`/library?tag=${encodeURIComponent(kw)}`}
                          className="docview-interactive-chip"
                          style={{ fontSize: '0.76rem', padding: '0.2rem 0.5rem' }}
                        >
                          #{kw}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw File & Digital Asset Specs */}
                {currentRawFile && (
                  <div className="docview-meta-item">
                    <span className="docview-meta-label">
                      <FileCode size={13} color="#06b6d4" /> Digital Asset Receipts
                    </span>
                    <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--c-ghost)', borderRadius: '6px', padding: '0.65rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                      <div style={{ color: 'var(--c-textBright)', fontWeight: '600', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        {isVideoFile(displayUrl, doc.title, rawFiles) ? <Video size={13} color="#06b6d4" /> : <FileText size={13} color="#facc15" />} 
                        {currentRawFile.path ? currentRawFile.path.split('/').pop() : 'Archival File'}
                      </div>
                      {currentRawFile.source && (
                        <div style={{ color: 'var(--c-dim)', fontSize: '0.72rem', fontFamily: 'var(--f-mono)' }}>
                          Archive Zip: {currentRawFile.source}
                        </div>
                      )}
                      {displayUrl && (
                        <div style={{ marginTop: '0.2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <a 
                            href={displayUrl} 
                            download 
                            target="_blank" 
                            rel="noreferrer"
                            className="lux-hover-lift"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              color: 'var(--c-goldBright)',
                              textDecoration: 'none',
                              fontWeight: '700',
                              fontSize: '0.72rem'
                            }}
                          >
                            <Download size={12} /> Download Original
                          </a>
                          <a 
                            href={displayUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="lux-hover-lift"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              color: 'var(--c-dim)',
                              textDecoration: 'none',
                              fontSize: '0.72rem'
                            }}
                          >
                            <ExternalLink size={12} /> Direct Stream URL
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Citation Box */}
                <div className="docview-citation-box">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--c-dim)' }}>
                      Cite this Record
                    </span>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {['APA', 'MLA', 'Chicago'].map(style => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setCitationStyle(style)}
                          style={{
                            background: citationStyle === style ? 'var(--c-goldBright)' : 'rgba(255,255,255,0.06)',
                            color: citationStyle === style ? '#000' : 'var(--c-textBright)',
                            border: 'none',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '3px',
                            fontSize: '0.68rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--c-text)', fontStyle: 'italic', lineHeight: 1.45, wordBreak: 'break-word', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '4px' }}>
                    {generateCitationText(metadata, citationTitle)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyGlobalCitation(citationTitle, metadata)}
                    className="lux-hover-lift"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem',
                      borderRadius: '4px',
                      background: copiedGlobal ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      border: copiedGlobal ? '1px solid #10b981' : '1px solid var(--c-ghost)',
                      color: copiedGlobal ? '#10b981' : 'var(--c-textBright)',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {copiedGlobal ? <><Check size={13} /> Citation Copied to Clipboard</> : <><Copy size={13} /> Copy {citationStyle} Citation</>}
                  </button>
                </div>

                {/* Translations */}
                <div className="docview-meta-item">
                  <span className="docview-meta-label">
                    <Globe size={13} color="var(--c-blue)" /> Translations & Multi-Language
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
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
                        style={{ background: 'var(--c-bgDeep)', color: 'var(--c-goldBright)', border: '1px solid var(--c-gold)', padding: '0.35rem 0.7rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 'bold' }}
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
                      style={{ background: 'transparent', color: 'var(--c-gold)', border: '1px dashed var(--c-gold)', padding: '0.35rem 0.7rem', borderRadius: '4px', fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Request Translation
                    </button>
                  </div>
                </div>

              </div>
            </div>
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
                  {displayUrl?.startsWith('http://') || displayUrl?.startsWith('https://') ? (
                    <a
                      href={displayUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="lux-hover-lift"
                      style={{ background: 'var(--c-goldBright)', color: '#000', padding: '1rem 2.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                      Launch Interactive Explorer &rarr;
                    </a>
                  ) : (
                    <Link
                      to={displayUrl || '/explore'}
                      className="lux-hover-lift"
                      style={{ background: 'var(--c-goldBright)', color: '#000', padding: '1rem 2.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                      Launch Interactive Explorer
                    </Link>
                  )}
                </div>
              ) : (displayUrl && isPdfFile(displayUrl, doc?.title, rawFiles)) ? (
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
                      Extracted Text {textWordCount > 0 ? `(${textWordCount.toLocaleString()} words)` : ''}
                    </button>
                  </div>
                  <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    {viewMode === 'pdf' ? (
                      <CustomPDFViewer url={displayUrl} onPageCount={setPageCount} />
                    ) : (
                      renderTextDocumentReader()
                    )}
                  </div>
                </div>
              ) : (displayUrl && isAudioFile(displayUrl, doc.title, rawFiles)) ? (
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
              ) : (displayUrl && isVideoFile(displayUrl, doc.title, rawFiles)) ? (
                <div style={{ flex: 1, background: '#05070c', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '420px', background: '#000' }}>
                    <MediaEmbed 
                      url={displayUrl} 
                      title={doc.title}
                      host={doc.creator || doc.collection_name}
                      year={doc.date}
                      autoplay={true}
                      style={{ width: '100%', height: '100%', maxHeight: '72vh', borderRadius: 0, border: 'none' }}
                    />
                  </div>

                  {/* Video Provenance & Playback Toolbar */}
                  <div style={{
                    padding: '0.85rem 1.25rem',
                    background: 'rgba(10, 15, 26, 0.95)',
                    borderTop: '1px solid var(--c-ghost)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ padding: '0.2rem 0.55rem', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', borderRadius: '4px', fontWeight: '800', fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {displayUrl && displayUrl.match(/\.mkv$/i) ? 'Matroska (.mkv) Video' : 'Video Stream'}
                      </div>
                      <span style={{ color: 'var(--c-dim)', fontSize: '0.8rem' }}>
                        {displayUrl && displayUrl.match(/\.mkv$/i)
                          ? 'Plays natively in Chromium & Firefox. If video or audio codec is unsupported by browser, download to view in VLC or MPV.'
                          : 'Archival video stream'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <a 
                        href={displayUrl} 
                        download 
                        target="_blank" 
                        rel="noreferrer"
                        className="lux-hover-lift"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          color: 'var(--c-goldBright)',
                          textDecoration: 'none',
                          fontWeight: '700',
                          background: 'rgba(234, 179, 8, 0.12)',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '4px',
                          border: '1px solid rgba(234, 179, 8, 0.3)',
                          fontSize: '0.78rem'
                        }}
                      >
                        <Download size={13} /> Download Video
                      </a>
                      <a 
                        href={displayUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="lux-hover-lift"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          color: 'var(--c-textBright)',
                          textDecoration: 'none',
                          fontWeight: '600',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '4px',
                          border: '1px solid var(--c-ghost)',
                          fontSize: '0.78rem'
                        }}
                      >
                        <ExternalLink size={13} /> Open Stream
                      </a>
                    </div>
                  </div>
                </div>
              ) : mediaUrls.length > 0 || (displayUrl && isImageFile(displayUrl, doc.title, rawFiles)) ? (
                <div ref={mediaContainerRef} style={{ flex: 1, background: '#000', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ flex: 1, overflow: zoomLevel > 1 ? 'auto' : 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SignedIn>
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
                    </SignedIn>
                    <SignedOut>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', color: '#fff' }}>
                        <Lock size={48} style={{ color: 'var(--c-goldBright)', marginBottom: '1rem' }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--f-display)', fontSize: '1.5rem' }}>Image Restricted</h3>
                        <p style={{ maxWidth: '400px', fontSize: '0.9rem', color: 'var(--c-dim)', marginBottom: '1.5rem' }}>
                          This archive image requires authentication to view. Please sign in to access sensitive materials.
                        </p>
                        <SignInButton mode="modal">
                          <button className="lux-hover-lift" style={{
                            background: 'var(--c-goldBright)', color: '#000', border: 'none',
                            padding: '0.75rem 1.5rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer',
                            fontSize: '0.95rem'
                          }}>
                            Sign In to View
                          </button>
                        </SignInButton>
                      </div>
                    </SignedOut>
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
              ) : (isTextDocument(displayUrl, doc?.title, rawFiles, doc) || Boolean(metadata?.extracted_text_url) || Boolean(doc?.content)) ? (
                renderTextDocumentReader()
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
              <h3 id="deep-context-abstract" style={{ margin: '0 0 1.5rem 0', color: 'var(--c-textBright)', fontSize: '1.4rem', letterSpacing: '0.05em', scrollMarginTop: '100px' }}>Full Abstract & Deep Context</h3>
              <div style={{ color: 'var(--c-text)', lineHeight: '1.8', fontSize: '1.1rem', cursor: 'text' }}>
                <AutoEntityLinker 
                  text={formattedAbstract || "No abstract or description is available for this document in the archive."} 
                  entities={allLinkedEntities} 
                />
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
              
              <div style={{ marginTop: '3rem' }}>
                <SourceLensPanel meta={metadata} category={metadata.category} />
                <ContextNotes meta={metadata} />
                <AlsoCoveredBy meta={metadata} url={doc.url} />
                <DigestPulse meta={metadata} />
              </div>

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

        <div style={{ marginTop: '4rem', marginBottom: '3rem', background: 'rgba(30, 41, 59, 0.5)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--c-borderMuted)', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--c-goldBright)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Smart Next Steps</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <Link to="/atlas" className="lux-hover-lift" style={{ display: 'block', textDecoration: 'none', background: 'var(--c-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--c-border)', transition: 'all 0.3s ease' }}>
              <h4 style={{ color: 'var(--c-textBright)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>🌍 Explore the Atlas</h4>
              <p style={{ color: 'var(--c-dim)', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>See how these entities and events map out globally.</p>
            </Link>
            <Link to="/graph" className="lux-hover-lift" style={{ display: 'block', textDecoration: 'none', background: 'var(--c-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--c-border)', transition: 'all 0.3s ease' }}>
              <h4 style={{ color: 'var(--c-textBright)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>🕸️ Global Graph</h4>
              <p style={{ color: 'var(--c-dim)', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>Investigate the hidden network of champions and critics.</p>
            </Link>
            <Link to="/news" className="lux-hover-lift" style={{ display: 'block', textDecoration: 'none', background: 'var(--c-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--c-border)', transition: 'all 0.3s ease' }}>
              <h4 style={{ color: 'var(--c-textBright)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>📰 Read the News</h4>
              <p style={{ color: 'var(--c-dim)', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>See how recent events connect to these historical documents.</p>
            </Link>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--c-textBright)', marginBottom: '1rem', borderBottom: '1px solid var(--c-ghost)', paddingBottom: '1rem' }}>Discussion</h2>
          <CommentsWidget docId={doc.id} title={citationTitle} />
        </div>

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
