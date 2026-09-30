import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useMediaList } from '../contexts/MediaListContext';
import { useReport } from '../contexts/ReportContext';
import { Newspaper, BookOpen, Scale, Video, Headphones, Image as ImageIcon, FileText, ChevronUp, ChevronDown, CheckSquare, PlusSquare, FilePlus, Globe, Sparkles, Archive, Search } from 'lucide-react';
import PDFThumbnail from '../components/PDFThumbnail';
import EntityLink from '../components/EntityLink';
import ThinkingSpirograph from '../components/ThinkingSpirograph';
import AutoEntityLinker from '../components/AutoEntityLinker';
import { generateFriendlySlug } from '../utils/slugs';
import './AdminArchivePage.css';

export default function DigitalLibrary() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { mediaLists, createList, addToList, addMultipleToList, removeFromList, getDefaultList } = useMediaList();
  const { addToReport } = useReport();
  const [searchParams, setSearchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag');

  const handleAskAssistant = (doc) => {
    const meta = doc.metadata_json ? JSON.parse(doc.metadata_json) : {};
    const title = getCleanTitle(doc, meta);
    const content = meta.abstract || meta.description || "No abstract available.";
    addToReport(`Reviewing ${title}:\n"${content}"\n\nQuery: `);
    navigate('/assistant');
  };

  const handleToggleReadingList = (doc) => {
    let list = getDefaultList();
    if (!list) list = createList('Default Reading List');
    
    if (list.items.includes(doc.id)) {
      removeFromList(list.id, doc.id);
    } else {
      addToList(list.id, doc.id);
    }
  };

  const inReadingList = (doc) => {
    const list = getDefaultList();
    if (!list) return false;
    return list.items.includes(doc.id);
  };

  const handleAddToReportDoc = (doc) => {
    const meta = doc.metadata_json ? JSON.parse(doc.metadata_json) : {};
    const title = getCleanTitle(doc, meta);
    addToReport(`Reference: ${title}`, [doc.url || "Archive Copy"]);
  };
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Facet & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedPublication, setSelectedPublication] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  const [semanticResults, setSemanticResults] = useState(null);
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false);

  useEffect(() => {
    // If the query is less than 3 words (or very short), we just use standard filter.
    if (!searchQuery || searchQuery.trim().split(/\\s+/).length < 2 || searchQuery.length < 10) {
      setSemanticResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSemantic(true);
      try {
        const res = await fetch('/api/semantic-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.matches) {
            setSemanticResults(data.matches);
          } else {
            setSemanticResults(null);
          }
        } else {
            setSemanticResults(null);
        }
      } catch(e) {
        setSemanticResults(null);
      } finally {
        setIsSearchingSemantic(false);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [selectedDoc, setSelectedDoc] = useState(null); // For preview pane
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showListModal, setShowListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  
  const [showUnscanned, setShowUnscanned] = useState(false);

  const cleanPublicationName = (name) => {
    if (!name) return null;
    const lower = name.toLowerCase();
    if (lower.includes('nocirc newsletter')) return 'NOCIRC Newsletter';
    if (lower.includes('national organization of circumcision information resource centers')) return 'NOCIRC';
    if (lower.includes('noharmm news release')) return 'NOHARMM News Release';
    if (lower.includes('no harmm') || lower.includes('noharmm')) return 'NOHARMM';
    if (lower.includes('recap')) return 'RECAP';
    if (lower.includes('shop talk')) return 'Shop Talk';
    if (lower.includes('convention xxii proceedings')) return 'Convention XXII Proceedings';
    return name; // fallback
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const apiUrl = '/api/cms?limit=1000';
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to fetch documents");
      const resData = await res.json();
      let rawData = resData.data || resData;

      // Deduplicate extracted text files if the original PDF exists in the list
      const pdfBases = new Set(
        rawData.filter(d => d.url && d.url.toLowerCase().endsWith('.pdf'))
               .map(d => d.url.toLowerCase().replace(/\.pdf$/, ''))
      );
      let data = rawData.filter(d => {
        if (d.url && d.url.toLowerCase().endsWith('.txt')) {
          const base = d.url.toLowerCase().replace(/\.txt$/, '');
          if (pdfBases.has(base)) return false;
        }
        return true;
      });

      try {
        const mockRes = await fetch('/api_mock.json');
        if (mockRes.ok) {
          const mockData = await mockRes.json();
          data = data.map(doc => {
            const liveTitle = doc.title || '';
            const liveMeta = JSON.parse(doc.metadata_json || '{}');
            const geminiTitle = liveMeta.gemini_extracted_metadata?.title || '';
            const match = mockData.find(m => {
              const mMeta = JSON.parse(m.metadata_json || '{}');
              const mTitle = m.title || mMeta.title || '';
              if (!mTitle) return false;
              const t1 = liveTitle.toLowerCase();
              const t2 = mTitle.toLowerCase();
              const t3 = geminiTitle.toLowerCase();
              return (t1 && (t1.includes(t2) || t2.includes(t1))) || (t3 && (t3.includes(t2) || t2.includes(t3)));
            });
            if (match) {
              const mMeta = JSON.parse(match.metadata_json || '{}');
              doc.metadata_json = JSON.stringify({
                ...mMeta,
                ...liveMeta,
                gemini_extracted_metadata: liveMeta.gemini_extracted_metadata || mMeta.gemini_extracted_metadata
              });
            }
            return doc;
          });
        }
      } catch (e) {
        console.warn("Failed to merge mock data", e);
      }
      if (res.ok) {
        const enriched = (data || []).map(d => {
          let subject = d.source_collection || 'Uncategorized';
          if (subject === 'Bulk Ingest') {
            try {
              const meta = JSON.parse(d.metadata_json || '{}');
              const orgs = meta.gemini_extracted_metadata?.organizations || [];
              const title = meta.gemini_extracted_metadata?.title || d.title || '';
              const orgStr = orgs.join(' ').toLowerCase();
              const titleStr = title.toLowerCase();
              
              if (orgStr.includes('michigan state') || orgStr.includes('changing men') || titleStr.includes('clipping') || titleStr.includes('newspaper')) {
                subject = 'MSU Clippings';
              } else if (orgStr.match(/nocirc|noharmm|doc|arc|genital autonomy|attorney|lawyer|human rights|nurses for the rights/i) || titleStr.match(/nocirc|noharmm|doc|arc|newsletter|proceedings/i)) {
                subject = 'UMass MS 1205';
              } else {
                subject = 'Tim Hammond Collection';
              }
            } catch (e) {
              subject = 'Tim Hammond Collection';
            }
          } else if (subject.includes(': ')) {
            subject = subject.split(': ')[1];
          } else if (subject.toLowerCase() === 'msu clippings') {
            subject = 'Clippings';
          }
          if (d.metadata_json) {
            try {
              const meta = JSON.parse(d.metadata_json);
              if (meta.source_publication) {
                meta.source_publication = cleanPublicationName(meta.source_publication);
                d.metadata_json = JSON.stringify(meta);
              }
            } catch (e) {}
          }
          return { ...d, subject };
        });
        setDocuments(enriched);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getYear = (doc) => {
    const meta = doc.metadata_json ? JSON.parse(doc.metadata_json) : {};
    return meta.date || (doc.created_at ? doc.created_at.substring(0, 4) : null) || 'Unknown';
  };

  const years = [...new Set(documents.map(d => {
     const y = getYear(d);
     if (!y || y === 'Unknown') return null;
     const parsed = parseInt(y, 10);
     if (isNaN(parsed)) return null;
     return parsed.toString();
  }).filter(Boolean))].sort((a,b)=>b.localeCompare(a));

  const subjects = [...new Set(documents.map(d => d.subject).filter(Boolean))].sort();
  const formats = [...new Set(documents.map(d => d.type))].filter(Boolean);
  const publications = [...new Set(documents.map(d => {
    const meta = d.metadata_json ? JSON.parse(d.metadata_json) : {};
    return meta.source_publication;
  }).filter(Boolean))].sort();

  const filteredDocs = documents.filter(doc => {
    const meta = doc.metadata_json ? JSON.parse(doc.metadata_json) : {};
    const hasRawFiles = meta.raw_files && meta.raw_files.length > 0;
    const isDigitized = doc.url || doc.status === 'ingested' || hasRawFiles;
    if (!showUnscanned && !isDigitized) return false;
    
    
    // Keyword match
    let matchesKeyword = false;
    if (!searchQuery) {
        matchesKeyword = true;
    } else {
        matchesKeyword = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Date range match
        const rangeMatch = searchQuery.match(/^(\d{4})\s*-\s*(\d{4})$/);
        if (rangeMatch) {
            const start = parseInt(rangeMatch[1]);
            const end = parseInt(rangeMatch[2]);
            const y = parseInt(getYear(doc));
            if (!isNaN(y) && y >= start && y <= end) {
                matchesKeyword = true;
            }
        }
    }

    // Semantic match
    let matchesSemantic = false;
    if (semanticResults && semanticResults.some(m => m.doc_id === doc.id)) {
        matchesSemantic = true;
    }

    if (searchQuery && !matchesKeyword && !matchesSemantic) return false;

    if (selectedSubject && doc.subject !== selectedSubject) return false;
    if (selectedFormat && doc.type !== selectedFormat) return false;
    if (selectedPublication && meta.source_publication !== selectedPublication) return false;
    
    if (selectedYear) {
      const y = getYear(doc);
      if (!y || !y.includes(selectedYear)) return false;
    }
    if (tagFilter) {
      const tf = tagFilter.toLowerCase();
      const allTags = [
        ...(meta.tags || []),
        ...(meta.keywords || []),
        ...(meta.gemini_extracted_metadata?.keywords || [])
      ].map(t => typeof t === 'string' ? t.toLowerCase() : '');
      
      let hasMatch = false;
      if (allTags.some(t => t.includes(tf))) hasMatch = true;
      if (doc.title && doc.title.toLowerCase().includes(tf)) hasMatch = true;
      if (doc.subject && doc.subject.toLowerCase().includes(tf)) hasMatch = true;
      if (meta.author && String(meta.author).toLowerCase().includes(tf)) hasMatch = true;
      
      if (!hasMatch) return false;
    }
    return true;
  });

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    let valA, valB;
    if (sortConfig.key === 'title') { valA = a.title.toLowerCase(); valB = b.title.toLowerCase(); }
    else if (sortConfig.key === 'subject') { valA = (a.subject || '').toLowerCase(); valB = (b.subject || '').toLowerCase(); }
    else if (sortConfig.key === 'type') { valA = a.type; valB = b.type; }
    else if (sortConfig.key === 'publication') {
      const mA = a.metadata_json ? JSON.parse(a.metadata_json) : {};
      const mB = b.metadata_json ? JSON.parse(b.metadata_json) : {};
      valA = (mA.source_publication || '').toLowerCase();
      valB = (mB.source_publication || '').toLowerCase();
    }
    else if (sortConfig.key === 'date') {
      const metaA = a.metadata_json ? JSON.parse(a.metadata_json) : {};
      const metaB = b.metadata_json ? JSON.parse(b.metadata_json) : {};
      valA = metaA.date || '';
      valB = metaB.date || '';
    }
    
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sortedDocs.length / itemsPerPage);
  const paginatedDocs = sortedDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getCleanTitle = (d, m) => {
    if (m && m.academic_title) return m.academic_title;
    if (m && m.gemini_extracted_metadata && m.gemini_extracted_metadata.title) return m.gemini_extracted_metadata.title;
    if (m && m.title) return m.title;
    let t = d.title || '';
    if (t.toLowerCase().endsWith('.pdf')) {
      t = t.replace(/\.pdf$/i, '')
           .replace(/\[.*?\]/g, '')
           .replace(/_/g, ' ')
           .replace(/page (\d+)/i, '- Page $1')
           .trim();
    }
    return t || 'Untitled Document';
  };

  const toggleRow = (e, id) => {
    e.stopPropagation();
    const newSet = new Set(selectedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRows(newSet);
  };

  const toggleAll = (e) => {
    e.stopPropagation();
    if (selectedRows.size === sortedDocs.length && sortedDocs.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedDocs.map(d => d.id)));
    }
  };

  const handleRowClick = (doc) => {
    setSelectedDoc(doc);
    if (window.innerWidth < 1024) {
      setIsMobilePreviewOpen(true);
    }
  };

  const handleAddToReport = () => {
    const docs = documents.filter(d => selectedRows.has(d.id));
    const citations = docs.map(d => getCleanTitle(d, d.metadata_json ? JSON.parse(d.metadata_json) : {}));
    addToReport("Added references from Digital Library:", citations);
    setSelectedRows(new Set());
    navigate('/assistant');
  };

  const handleSaveToList = (listId) => {
    if (listId === 'new') {
      if (!newListName) return;
      const list = createList(newListName);
      addMultipleToList(list.id, Array.from(selectedRows));
      setNewListName('');
    } else {
      addMultipleToList(listId, Array.from(selectedRows));
    }
    setShowListModal(false);
    setSelectedRows(new Set());
  };

  const getAnalogBandClass = () => {
    if (['vaporwave', 'woz'].includes(theme)) return 'analog-band-neon';
    if (['ocean', 'agnes'].includes(theme)) return 'analog-band-eighties-cool';
    if (['pueblo', 'amber'].includes(theme)) return 'analog-band-pueblo';
    return 'analog-band-seventies';
  };

  const getDocumentIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'newspaper_clipping': return <Newspaper size={18} />;
      case 'medical_journal': return <BookOpen size={18} />;
      case 'legal_document': return <Scale size={18} />;
      case 'multimedia':
      case 'video': return <Video size={18} />;
      case 'audio': return <Headphones size={18} />;
      case 'image': return <ImageIcon size={18} />;
      case 'letter': return <FileText size={18} />;
      case 'external_news': return <Globe size={18} />;
      default: return <FileText size={18} />;
    }
  };

  const getTaxonomyColorClass = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'newspaper_clipping': return 'brunswick-tangerine';
      case 'medical_journal': return 'brunswick-blue';
      case 'legal_document':
      case 'policy_guideline': return 'brunswick-green';
      case 'multimedia':
      case 'video':
      case 'audio':
      case 'image': return 'brunswick-coral';
      case 'letter': return 'brunswick-gold';
      default: return 'brunswick-white';
    }
  };

  const CuratedChips = () => {
    const filters = [
      { label: "Latest Additions", filter: () => { setSelectedCollection(''); setSelectedFormat(''); setSelectedPublication(''); setSearchQuery(''); setSortConfig({ key: 'date', direction: 'desc' }); } },
      { label: "Legal Records", filter: () => { setSelectedCollection(''); setSelectedFormat('legal_document'); setSelectedPublication(''); setSearchQuery(''); setSortConfig({ key: 'title', direction: 'asc' }); } },
      { label: "Multimedia", filter: () => { setSelectedCollection(''); setSelectedFormat('video'); setSelectedPublication(''); setSearchQuery(''); } }
    ];
    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button 
            key={f.label} 
            onClick={f.filter}
            className="lux-hover-lift"
            style={{ padding: '0.4rem 1rem', background: 'var(--c-bgDeep)', border: '1px solid var(--c-ghost)', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--c-text)', cursor: 'pointer', fontFamily: 'var(--f-body)', fontWeight: '500' }}
          >
            {f.label}
          </button>
        ))}
      </div>
    );
  };

  const clearTagFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tag');
    setSearchParams(newParams);
  };

  const FilterHeader = ({ label, sortKey, style, filterType, filterValue, setFilter, options }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <th style={{ ...style, verticalAlign: 'top' }}>
        <div 
          onClick={() => {
            if (isActive) {
              setSortConfig({ key: sortKey, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
            } else {
              setSortConfig({ key: sortKey, direction: 'asc' });
            }
          }}
          style={{ cursor: 'pointer', userSelect: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem', color: isActive ? 'var(--c-goldBright)' : 'inherit', marginBottom: '0.75rem' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--c-textBright)'}
          onMouseLeave={(e) => e.currentTarget.style.color = isActive ? 'var(--c-goldBright)' : 'var(--c-dim)'}
        >
          {label}
          <div style={{ display: 'flex', flexDirection: 'column', opacity: isActive ? 1 : 0.2, transition: 'opacity 0.2s' }}>
            {(!isActive || sortConfig.direction === 'asc') && <ChevronUp size={12} style={{ marginBottom: '-4px' }} />}
            {(!isActive || sortConfig.direction === 'desc') && <ChevronDown size={12} />}
          </div>
        </div>
        {filterType === 'select' ? (
          <select 
            value={filterValue}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: '100%', padding: '0.4rem', background: 'var(--c-bgCard)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '4px', fontSize: '0.8rem', outline: 'none', fontWeight: 'normal' }}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">All</option>
            {options.map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
          </select>
        ) : filterType === 'text' ? (
          <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder="Filter by column..."
                value={filterValue}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: '100%', padding: '0.4rem', paddingRight: '24px', background: 'var(--c-bgCard)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '4px', fontSize: '0.8rem', outline: 'none', fontWeight: 'normal' }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
          </div>
        ) : null}
      </th>
    );
  };

  const renderPreviewLens = () => {
    if (!selectedDoc) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--c-dim)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', opacity: 0.3 }}>◱</div>
          <h3 style={{ margin: 0, fontFamily: 'var(--f-display)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Select a Record</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontFamily: 'var(--f-body)' }}>Select an item from the index to view its details.</p>
        </div>
      );
    }

    const meta = selectedDoc.metadata_json ? JSON.parse(selectedDoc.metadata_json) : {};
    const hasRawFiles = meta.raw_files && meta.raw_files.length > 0;
    const isPending = selectedDoc.status === 'pending_digitization' && !hasRawFiles;
    const mediaUrls = selectedDoc.media_urls ? JSON.parse(selectedDoc.media_urls) : [];
    const coverImage = mediaUrls.length > 0 ? mediaUrls[0] : null;

    const currentIndex = sortedDocs.findIndex(d => d.id === selectedDoc.id);
    const hasNext = currentIndex < sortedDocs.length - 1;
    const hasPrev = currentIndex > 0;

    return (
      <div className="lux-glide-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2.5rem' }}>
        <div className={getAnalogBandClass()} style={{ height: '6px', width: '100%', marginBottom: '2.5rem', borderRadius: '3px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <div style={{ color: 'var(--c-goldBright)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '700', marginBottom: '0.5rem' }}>
              {selectedDoc.source_collection || "Uncategorized"}
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--f-display)', letterSpacing: '-0.02em', lineHeight: '1.2', color: 'var(--c-textBright)' }}>
              {getCleanTitle(selectedDoc, meta)}
            </h2>
            {(meta.gemini_extracted_metadata?.authors?.length > 0 || meta.author) && (
              <div style={{ color: 'var(--c-muted)', fontStyle: 'italic', fontSize: '0.95rem', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                By 
                {meta.gemini_extracted_metadata?.authors?.length > 0 ? (
                  meta.gemini_extracted_metadata.authors.map((author, idx) => (
                    <React.Fragment key={idx}>
                      <EntityLink entityName={author} />
                      {idx < meta.gemini_extracted_metadata.authors.length - 1 && <span>, </span>}
                    </React.Fragment>
                  ))
                ) : (
                  <EntityLink entityName={meta.author} />
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              disabled={!hasPrev}
              onClick={() => setSelectedDoc(sortedDocs[currentIndex - 1])}
              style={{ background: 'var(--c-bgSoft)', color: hasPrev ? 'var(--c-textBright)' : 'var(--c-dim)', border: '1px solid var(--c-ghost)', borderRadius: '6px', padding: '0.4rem', cursor: hasPrev ? 'pointer' : 'default', opacity: hasPrev ? 1 : 0.5 }}
            >
              <ChevronUp size={20} />
            </button>
            <button 
              disabled={!hasNext}
              onClick={() => setSelectedDoc(sortedDocs[currentIndex + 1])}
              style={{ background: 'var(--c-bgSoft)', color: hasNext ? 'var(--c-textBright)' : 'var(--c-dim)', border: '1px solid var(--c-ghost)', borderRadius: '6px', padding: '0.4rem', cursor: hasNext ? 'pointer' : 'default', opacity: hasNext ? 1 : 0.5 }}
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>

        {coverImage ? (
          <div style={{ 
            width: '100%', height: '280px', 
            backgroundImage: `url(${coverImage})`, 
            backgroundSize: 'cover', backgroundPosition: 'center',
            borderRadius: '12px', marginBottom: '2rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.08)'
          }} />
        ) : selectedDoc.url && selectedDoc.url.toLowerCase().endsWith('.pdf') ? (
          <div style={{ 
            width: '100%', height: '280px', 
            borderRadius: '12px', marginBottom: '2rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden'
          }}>
            <PDFThumbnail url={selectedDoc.url} />
          </div>
        ) : (
          <div style={{ 
            width: '100%', height: '140px', 
            background: 'var(--c-bgSoft)', 
            borderRadius: '12px', marginBottom: '2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--c-ghost)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)',
            fontSize: '3rem', opacity: 0.3
          }}>
            {isPending ? <FileText size={32} /> : <div style={{ transform: 'scale(2.5)' }}>{getDocumentIcon(selectedDoc.type)}</div>}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem', color: 'var(--c-text)', fontSize: '1rem', lineHeight: 1.7, fontFamily: 'var(--f-body)' }}>
          <div>
            {(meta.description || meta.abstract || (isPending ? "This item is currently pending digitization. Abstract unavailable." : "No abstract provided for this record.")).split('\n').map((paragraph, idx) => (
              <p key={idx} style={{ margin: '0 0 1.5rem 0' }}>
                <AutoEntityLinker 
                  text={paragraph} 
                  entities={[...(meta.key_people || []), ...(meta.organizations || [])]} 
                />
              </p>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
             <span className={getTaxonomyColorClass(selectedDoc.type)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                {getDocumentIcon(selectedDoc.type)} {selectedDoc.type.replace('_', ' ').replace(/newspaper clipping/i, 'news article').replace(/other/i, 'document').replace(/^pdf$/i, 'document')}
             </span>
             {meta.source_publication && (
               <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', background: 'var(--c-bgDeep)', border: '1px solid var(--c-ghost)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--c-dim)', fontWeight: '600' }}>
                 <Newspaper size={14} /> {meta.source_publication}
               </span>
             )}
             {meta.category && (
               <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', background: 'var(--c-bgDeep)', border: '1px solid var(--c-ghost)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--c-dim)', fontWeight: '600' }}>
                 <BookOpen size={14} /> {meta.category}
               </span>
             )}
          </div>
          
          {(meta.keywords || meta.media_types) && (
            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--c-ghost)', paddingTop: '1.5rem' }}>
              {meta.media_types && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Media Formats</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {meta.media_types.map(m => <span key={m} style={{ fontSize: '0.85rem', color: 'var(--c-textBright)' }}>{m}</span>)}
                  </div>
                </div>
              )}
              {meta.keywords && (
                <div>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Keywords</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {meta.keywords.map(k => <span key={k} style={{ padding: '0.2rem 0.6rem', background: 'var(--c-bgDeep)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--c-dim)' }}>#{k}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--c-ghost)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => navigate(`/library/${generateFriendlySlug(selectedDoc, selectedDoc.metadata_json ? JSON.parse(selectedDoc.metadata_json) : {})}`)}
              className="lux-hover-lift"
              style={{ 
                flex: 1, padding: '1.2rem', background: 'var(--c-textBright)', color: 'var(--c-bg)', 
                border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--f-body)'
              }}
            >
              Retrieve Full Record
            </button>
            {window.innerWidth < 1024 && (
              <button 
                 onClick={() => setIsMobilePreviewOpen(false)}
                 style={{ padding: '1.2rem', background: 'transparent', color: 'var(--c-text)', border: '1px solid var(--c-dim)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Close
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => handleAskAssistant(selectedDoc)}
              className="lux-hover-lift"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.8rem', background: 'var(--c-blue)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              <Sparkles size={16} /> Ask Assistant
            </button>
            <button 
              onClick={() => handleToggleReadingList(selectedDoc)}
              className="lux-hover-lift"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.8rem', background: 'var(--c-bgSoft)', border: '1px solid var(--c-ghost)', borderRadius: '8px', color: 'var(--c-textBright)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              <CheckSquare size={16} /> {inReadingList(selectedDoc) ? 'Remove from List' : 'Add to List'}
            </button>
            <button 
              onClick={() => handleAddToReportDoc(selectedDoc)}
              className="lux-hover-lift"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.8rem', background: 'var(--c-bgSoft)', border: '1px solid var(--c-ghost)', borderRadius: '8px', color: 'var(--c-textBright)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              <FilePlus size={16} /> Add to Report
            </button>
          </div>
        </div>
      </div>
    );
  };

  const isEntranceView = !searchQuery && !selectedSubject && !selectedFormat && !selectedPublication && !selectedYear && !tagFilter && !semanticResults;

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'row', background: 'var(--c-bg)' }}>
      
      {/* Left Column: Control Deck & Table */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Bar / Control Deck */}
        <div style={{ background: 'var(--c-bgSoft)', zIndex: 10, borderBottom: '1px solid var(--c-ghost)', display: 'flex', flexDirection: 'column' }}>
          {/* Featured Collection Banner */}
          <Link to="/to/tim-hammond" className="lux-hover-lift" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: 'linear-gradient(90deg, rgba(212, 160, 48, 0.1), transparent)', borderBottom: '1px solid var(--c-ghost)', textDecoration: 'none', color: 'var(--c-textBright)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.5rem', background: 'var(--c-gold)', borderRadius: '6px', color: 'var(--c-bgDeep)' }}>
                <Archive size={18} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-goldBright)', fontWeight: 'bold', marginBottom: '0.1rem' }}>Featured Collection</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 'bold', fontFamily: 'var(--f-display)' }}>The Tim Hammond Genital Autonomy Archive</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--c-goldBright)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Explore <span style={{ opacity: 0.5 }}>&rarr;</span>
            </div>
          </Link>

          <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--c-textBright)', letterSpacing: '-0.02em' }}>Archive Index</h1>
                <Link to="/timeline" className="lux-hover-lift" style={{ textDecoration: 'none', background: 'var(--c-bgDeep)', border: '1px solid var(--c-gold)', color: 'var(--c-goldBright)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Timeline &rarr;
                </Link>
              </div>
              {!loading && (
                <div style={{ fontSize: '0.8rem', color: 'var(--c-muted)', fontFamily: 'var(--f-condensed)', letterSpacing: '0.05em', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span><strong style={{ color: 'var(--c-textBright)' }}>{filteredDocs.length.toLocaleString()}</strong> documents found</span>
                  <span><strong style={{ color: 'var(--c-textBright)' }}>{filteredDocs.filter(d => {
                      const meta = d.metadata_json ? JSON.parse(d.metadata_json) : {};
                      return d.url || d.status === 'ingested' || (meta.raw_files && meta.raw_files.length > 0);
                  }).length.toLocaleString()}</strong> digitized</span>
                  <span><strong style={{ color: 'var(--c-textBright)' }}>{filteredDocs.filter(d => d.status === 'ingested' && d.chunks_vectorized > 0).length.toLocaleString()}</strong> with full text</span>
                </div>
              )}
              
              {/* Global Search Bar */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '600px', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <input 
                  type="text"
                  placeholder="Search the archive or ask AI..."
                  title="You can search for content by keyword, or ask natural language questions (e.g. 'Show me articles pertaining to ethics')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem', paddingRight: '40px', background: 'var(--c-bg)', color: 'var(--c-textBright)', border: '1px solid var(--c-gold)', borderRadius: '8px', fontSize: '1rem', outline: 'none', fontWeight: '500', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                {isSearchingSemantic ? (
                  <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-goldBright)' }}>
                    <Sparkles size={20} style={{ animation: 'spin 2s linear infinite' }} />
                  </div>
                ) : (
                  <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-goldBright)', opacity: semanticResults ? 1 : 0.4 }} title={semanticResults ? "AI Search Active" : "Semantic Search Enabled"}>
                    <Sparkles size={20} />
                  </div>
                )}
                
                {/* Suggested Prompts */}
                {!searchQuery && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Try:</div>
                    <div 
                      onClick={() => setSearchQuery("AAP policies in the 1990s")}
                      style={{ fontSize: '0.75rem', color: 'var(--c-blue)', cursor: 'pointer', transition: 'color 0.2s' }}
                    >
                      "AAP policies in the 1990s"
                    </div>
                    <div 
                      onClick={() => setSearchQuery("international human rights")}
                      style={{ fontSize: '0.75rem', color: 'var(--c-blue)', cursor: 'pointer', transition: 'color 0.2s' }}
                    >
                      "international human rights"
                    </div>
                  </div>
                )}
              </div>
              <CuratedChips />
              {tagFilter && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Filtered By Keyword:</span>
                  <button 
                    onClick={clearTagFilter}
                    style={{ background: 'var(--c-blue)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.3rem 0.8rem', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                  >
                    {tagFilter} &times;
                  </button>
                </div>
              )}
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="show-unscanned" 
                  checked={showUnscanned} 
                  onChange={(e) => setShowUnscanned(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="show-unscanned" style={{ fontSize: '0.85rem', color: 'var(--c-muted)', cursor: 'pointer', fontFamily: 'var(--f-body)' }}>
                  Include unscanned physical documents
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Left Pane: Index Table or Stacks */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--c-ghost)', overflowY: 'auto' }}>
          {(() => {
            
            if (loading) {
              return (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--c-dim)', fontFamily: 'var(--f-display)', fontSize: '1.2rem', letterSpacing: '0.05em', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ height: '150px', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <ThinkingSpirograph text={null} />
                  </div>
                </div>
              );
            }

            if (isEntranceView) {
              const categories = [
                { id: 'published_articles', title: 'Curated Published Articles', desc: "Decades of published medical, legal, and academic articles curated by Tim Hammond.", filter: () => navigate('/collections/published-articles'), icon: <BookOpen size={24} />, color: 'var(--c-goldBright)' },
                { id: 'umass_hammond', title: 'Tim Hammond Advocacy Archive', desc: 'The defining genital autonomy archive, established at UMass Amherst (MS 1205).', filter: () => navigate('/collections/tim-hammond-archive'), icon: <Archive size={24} />, color: 'var(--c-blue)' },
                { id: 'msu_clippings', title: 'Changing Men Collection', desc: 'Early movement documentation and news clippings compiled by Michigan State University.', filter: () => navigate('/collections/msu-clippings'), icon: <Newspaper size={24} />, color: 'var(--c-text)' },
                { id: 'legal', title: 'Legal & Policy Records', desc: 'Court cases, legislation, and medical policy guidelines.', filter: () => setSelectedFormat('legal_document'), icon: <Scale size={24} />, color: 'var(--c-green)' },
                { id: 'media', title: 'Multimedia & Video', desc: 'Documentaries, news clips, and interviews.', filter: () => setSelectedFormat('video'), icon: <Video size={24} />, color: 'var(--c-coral)' },
                { id: 'news', title: 'Global News Monitoring', desc: 'Contemporary and historical news tracking.', filter: () => setSelectedFormat('external_news'), icon: <Globe size={24} />, color: '#ff9933' },
              ];

              return (
                <div className="lux-glide-in" style={{ padding: '4rem 3rem', maxWidth: '1200px', margin: '0 auto' }}>
                  <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '2.5rem', color: 'var(--c-textBright)', marginBottom: '1rem', fontWeight: 'normal', letterSpacing: '0.02em' }}>The Digital Stacks</h2>
                    <p style={{ color: 'var(--c-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                      Browse the archive by primary collection or specific material type. Select a stack to begin your research.
                    </p>
                    
                    <div style={{ marginTop: '2rem', maxWidth: '600px', margin: '2rem auto 0', position: 'relative' }}>
                      <Search size={20} color="var(--c-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                        type="text" 
                        placeholder="Search 195,120+ documents, media, and records..." 
                        style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', fontSize: '1.1rem', background: 'var(--c-bgCard)', border: '1px solid var(--c-ghost)', borderRadius: '8px', color: 'var(--c-textBright)', outline: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {categories.map(c => (
                      <div 
                        key={c.id} 
                        onClick={c.filter}
                        className="lux-hover-lift"
                        style={{ background: 'var(--c-bgCard)', border: '1px solid var(--c-ghost)', borderRadius: '12px', padding: '2rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                      >
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--c-bgSoft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, border: `1px solid ${c.color}40`, boxShadow: `inset 0 0 10px ${c.color}20` }}>
                          {c.icon}
                        </div>
                        <h3 style={{ margin: 0, color: 'var(--c-textBright)', fontSize: '1.4rem', fontFamily: 'var(--f-display)', fontWeight: 'bold' }}>{c.title}</h3>
                        <p style={{ margin: 0, color: 'var(--c-dim)', fontSize: '1rem', lineHeight: 1.6 }}>{c.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--f-body)' }}>
              <thead style={{ position: 'sticky', top: '0', background: 'var(--c-bgSoft)', zIndex: 5, backdropFilter: 'blur(10px)', borderBottom: '2px solid var(--c-ghost)' }}>
                <tr>
                  <th style={{ padding: '1.2rem 1rem', width: '40px', verticalAlign: 'top' }}>
                    <div onClick={toggleAll} style={{ cursor: 'pointer', color: 'var(--c-dim)' }}>
                      {selectedRows.size > 0 && selectedRows.size === sortedDocs.length ? <CheckSquare size={18} color="var(--c-goldBright)" /> : <div style={{width: 18, height: 18, border: '2px solid var(--c-dim)', borderRadius: 3}} />}
                    </div>
                  </th>
                  {FilterHeader({ label: "Document Title", sortKey: "title", style: { padding: '1.2rem 1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' } })}
                  {FilterHeader({ label: "Publication", sortKey: "publication", style: { padding: '1.2rem 1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }, filterType: "select", filterValue: selectedPublication, setFilter: setSelectedPublication, options: publications })}
                  {FilterHeader({ label: "Subject", sortKey: "subject", style: { padding: '1.2rem 1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }, filterType: "select", filterValue: selectedSubject, setFilter: setSelectedSubject, options: subjects })}
                  {FilterHeader({ label: "Published", sortKey: "date", style: { padding: '1.2rem 1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }, filterType: "select", filterValue: selectedYear, setFilter: setSelectedYear, options: years })}
                  {FilterHeader({ label: "Format", sortKey: "type", style: { padding: '1.2rem 1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }, filterType: "select", filterValue: selectedFormat, setFilter: setSelectedFormat, options: formats })}
                </tr>
              </thead>
              <tbody>
                {paginatedDocs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--c-dim)' }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--c-textBright)' }}>No digitized documents found</div>
                      {!showUnscanned ? (
                        <p style={{ margin: 0 }}>Try checking <strong>"Include unscanned physical documents"</strong> to view the physical inventory for this subject, or adjust your filters.</p>
                      ) : (
                        <p style={{ margin: 0 }}>No documents match your current filters.</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedDocs.map(doc => {
                    const meta = doc.metadata_json ? JSON.parse(doc.metadata_json) : {};
                    const isSelected = selectedDoc?.id === doc.id;
                    const isChecked = selectedRows.has(doc.id);
                    
                    return (
                      <tr 
                        key={doc.id}
                        onClick={() => handleRowClick(doc)}
                        style={{ 
                          cursor: 'pointer', 
                          background: isSelected ? 'var(--c-bgCard)' : isChecked ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                          borderBottom: '1px solid var(--c-ghost)',
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => { if(!isSelected && !isChecked) e.currentTarget.style.background = 'var(--c-bgSoft)' }}
                        onMouseLeave={(e) => { if(!isSelected && !isChecked) e.currentTarget.style.background = 'transparent' }}
                      >
                        <td style={{ padding: '1.2rem 1rem' }} onClick={(e) => toggleRow(e, doc.id)}>
                          {isChecked ? <CheckSquare size={18} color="var(--c-blue)" /> : <div style={{width: 18, height: 18, border: '2px solid var(--c-dim)', borderRadius: 3}} />}
                        </td>
                        <td style={{ padding: '1.2rem 1rem', color: isSelected ? 'var(--c-textBright)' : 'var(--c-text)', fontWeight: isSelected ? '600' : '400', fontSize: '0.95rem' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {getCleanTitle(doc, meta)}
                          </span>
                        </td>
                        <td style={{ padding: '1.2rem 1rem', color: 'var(--c-text)', fontSize: '0.9rem' }}>
                          {meta.source_publication || '--'}
                        </td>
                        <td style={{ padding: '1.2rem 1rem', color: 'var(--c-muted)', fontSize: '0.9rem', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <div style={{ color: 'var(--c-textBright)', fontWeight: '500' }}>{doc.subject}</div>
                          {doc.source_collection && doc.source_collection !== doc.subject && (
                            <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', opacity: 0.7 }}>
                              {doc.source_collection.split(': ')[0]}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1.2rem 1rem', color: 'var(--c-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                          {meta.date || '--'}
                        </td>
                        <td style={{ padding: '1.2rem 1rem' }}>
                           <span className={getTaxonomyColorClass(doc.type)} title={doc.type.replace('_', ' ')} style={{ display: 'inline-flex', padding: '0.3rem', borderRadius: '4px' }}>
                             {getDocumentIcon(doc.type)}
                           </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            );
          })()}
          {/* Pagination Controls */}
          {!isEntranceView && !loading && sortedDocs.length > 0 && (
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--c-ghost)', background: 'var(--c-bgSoft)', position: 'sticky', bottom: 0, zIndex: 10 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-muted)' }}>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedDocs.length)} of {sortedDocs.length} entries
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  style={{ background: 'var(--c-bg)', color: 'var(--c-text)', border: '1px solid var(--c-dim)', borderRadius: '4px', padding: '0.3rem', fontSize: '0.85rem' }}
                >
                  <option value={20}>Show 20</option>
                  <option value={50}>Show 50</option>
                  <option value={100}>Show 100</option>
                  <option value={200}>Show 200</option>
                  <option value={10000}>Show All</option>
                </select>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    style={{ background: 'var(--c-bgCard)', color: currentPage === 1 ? 'var(--c-dim)' : 'var(--c-textBright)', border: '1px solid var(--c-dim)', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Prev
                  </button>
                  <span style={{ padding: '0.3rem 0.6rem', fontSize: '0.9rem', color: 'var(--c-text)' }}>Page {currentPage} of {totalPages}</span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    style={{ background: 'var(--c-bgCard)', color: currentPage === totalPages ? 'var(--c-dim)' : 'var(--c-textBright)', border: '1px solid var(--c-dim)', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Preview Pane */}
      <div style={{ flex: '0 0 450px', background: 'var(--c-bgCard)', borderLeft: '1px solid var(--c-ghost)', overflowY: 'auto', boxShadow: '-10px 0 30px rgba(0,0,0,0.05)' }} className="desktop-only">
         <div style={{ display: 'block', height: '100%' }}>
           {renderPreviewLens()}
         </div>
      </div>

      {/* Action Bar (when rows are selected) */}
      {selectedRows.size > 0 && (
        <div className="lux-glide-in" style={{
          position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--c-bgCard)', border: '1px solid var(--c-ghost)', borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 50, padding: '1rem 2rem',
          display: 'flex', alignItems: 'center', gap: '2rem'
        }}>
          <div style={{ color: 'var(--c-textBright)', fontWeight: 'bold' }}>
            {selectedRows.size} {selectedRows.size === 1 ? 'item' : 'items'} selected
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowListModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--c-bgSoft)', border: '1px solid var(--c-ghost)', borderRadius: '6px', color: 'var(--c-textBright)', cursor: 'pointer' }}>
              <PlusSquare size={16} /> Add to Media List
            </button>
            <button onClick={handleAddToReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--c-blue)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
              <FilePlus size={16} /> Add to Report
            </button>
          </div>
        </div>
      )}

      {/* Media List Modal */}
      {showListModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            
            <button onClick={() => setShowListModal(false)} style={{ display: 'block', width: '100%', padding: '0.75rem', marginTop: '1.5rem', background: 'transparent', border: 'none', color: 'var(--c-dim)', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}
