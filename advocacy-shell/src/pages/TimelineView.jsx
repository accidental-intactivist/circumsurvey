import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { generateFriendlySlug } from '../utils/slugs';
import ThinkingSpirograph from '../components/ThinkingSpirograph';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function LazyDocumentThumbnail({ url, fallbackImage }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (fallbackImage) {
    return <div ref={containerRef} style={{ aspectRatio: '8.5 / 11', width: '100%', backgroundImage: `url(${fallbackImage})`, backgroundSize: 'cover', backgroundPosition: 'top', borderBottom: '1px solid var(--c-ghost)' }} />;
  }

  const isPdf = url && url.toLowerCase().endsWith('.pdf');
  
  return (
    <div ref={containerRef} style={{ aspectRatio: '8.5 / 11', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-bgDeep)', borderBottom: '1px solid var(--c-ghost)', color: 'var(--c-dim)', overflow: 'hidden' }}>
      {isVisible && isPdf ? (
        <React.Suspense fallback={<BookOpen size={48} opacity={0.1} />}>
          <Document file={url} loading={<BookOpen size={48} opacity={0.1} />} error={<BookOpen size={48} opacity={0.1} />}>
            <Page pageNumber={1} width={300} renderTextLayer={false} renderAnnotationLayer={false} />
          </Document>
        </React.Suspense>
      ) : isVisible && url && url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
        <img src={url} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <BookOpen size={48} opacity={0.2} />
      )}
    </div>
  );
}

export default function TimelineView() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handleNativeWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, [loading]);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const url = '/api/cms?limit=1000';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          let rawData = data.data || data;

          const pdfBases = new Set(
            rawData.filter(d => d.url && d.url.toLowerCase().endsWith('.pdf'))
                   .map(d => d.url.toLowerCase().replace(/\.pdf$/, ''))
          );
          
          const groupedRaw = new Map();
          const validDocs = [];

          rawData.forEach(d => {
            // "the AAP, CDC, CIA is not really usefull in timeline mde the way we have it now"
            if (d.source_collection && d.source_collection.includes('AAP, CDC, CIA')) {
               return;
            }
            if (d.subject && d.subject.includes('AAP, CDC, CIA')) {
               return;
            }

            if (!d.url) {
               validDocs.push(d);
               return;
            }

            const url = d.url.toLowerCase();
            if (url.endsWith('.tif') || url.endsWith('.tiff') || url.endsWith('.txt') || url.endsWith('.dat')) {
               // Find base name by stripping page numbers like _001 or -001
               const match = d.url.match(/^(.*?)[\-_]?\d+\.(?:tif|tiff|txt|dat)$/i);
               const base = match ? match[1] : d.url.replace(/\.[^/.]+$/, "");
               
               if (!groupedRaw.has(base)) {
                 groupedRaw.set(base, []);
               }
               groupedRaw.get(base).push(d);
            } else {
               validDocs.push(d);
            }
          });

          groupedRaw.forEach((rawFiles, base) => {
             if (pdfBases.has(base.toLowerCase())) {
                // We have a PDF, these are just redundant raw files. Get rid of them!
                return;
             }
             // Ghost files! No PDF matches them. Zip them back together!
             if (rawFiles.length > 0) {
                // Sort to ensure page 1 is first
                rawFiles.sort((a,b) => (a.url||'').localeCompare(b.url||''));
                const first = rawFiles[0];
                const meta = first.metadata_json ? JSON.parse(first.metadata_json) : {};
                
                // Try to infer a nice title from the base
                let cleanBaseTitle = first.title ? first.title.replace(/[\-_]?\d+\.(tif|tiff|txt|dat)$/i, '') : 'Compiled Scans';
                
                validDocs.push({
                   ...first,
                   id: `virtual-compiled-${first.id}`,
                   title: cleanBaseTitle + ` (Compiled: ${rawFiles.length} pages)`,
                   url: first.url, 
                   metadata_json: JSON.stringify({
                      ...meta,
                      page_count: rawFiles.length,
                      raw_files: rawFiles.map(r => r.url)
                   })
                });
             }
          });

          let docList = validDocs;

          try {
            const mockRes = await fetch('/api_mock.json');
            if (mockRes.ok) {
              const mockData = await mockRes.json();
              docList = docList.map(doc => {
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

          if (docList && Array.isArray(docList)) {
            const enriched = docList.map(d => {
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
              return { ...d, subject };
            });
            // Sort chronologically
            const sorted = enriched.filter(d => d.url).sort((a, b) => {
              const dateA = a.metadata_json ? (JSON.parse(a.metadata_json).date || '9999') : '9999';
              const dateB = b.metadata_json ? (JSON.parse(b.metadata_json).date || '9999') : '9999';
              if (dateA !== dateB) return dateA.localeCompare(dateB);
              return (a.title || '').localeCompare(b.title || '');
            });
            setDocs(sorted);
          }
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchDocs();
  }, []);

  const getCleanTitle = (d) => {
    const m = d.metadata_json ? JSON.parse(d.metadata_json) : {};
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
    const yearMatch = t.match(/^(?:19|20)\d{2}\s*/);
    if (yearMatch) t = t.replace(yearMatch[0], '');
    return t.trim() || 'Untitled Document';
  };

  const getYear = (d) => {
    const m = d.metadata_json ? JSON.parse(d.metadata_json) : {};
    if (m && m.date && m.date !== 'Unknown') {
      return m.date.substring(0, 4);
    }
    const t = d.title || '';
    const titleMatch = t.match(/(?:19|20)\d{2}/);
    if (titleMatch) return titleMatch[0];
    return 'Unknown Date';
  };

  const decades = [...new Set(docs.map(d => {
    const year = parseInt(getYear(d), 10);
    if (isNaN(year)) return null;
    return Math.floor(year / 10) * 10;
  }).filter(Boolean))].sort();

  const subjects = [...new Set(docs.map(d => d.subject).filter(Boolean))].sort();

  const filteredDocs = docs.filter(doc => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const meta = doc.metadata_json ? JSON.parse(doc.metadata_json) : {};
      const allTags = [
        ...(meta.tags || []),
        ...(meta.keywords || []),
        ...(meta.gemini_extracted_metadata?.keywords || [])
      ].map(t => typeof t === 'string' ? t.toLowerCase() : '');
      const keywordsString = allTags.join(' ');
      const title = getCleanTitle(doc).toLowerCase();
      if (!title.includes(q) && !keywordsString.includes(q) && !(doc.subject||'').toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedSubject && doc.subject !== selectedSubject) return false;
    if (selectedDecade) {
      const year = parseInt(getYear(doc), 10);
      if (isNaN(year) || Math.floor(year / 10) * 10 !== parseInt(selectedDecade, 10)) {
        return false;
      }
    }
    return true;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--c-dim)' }}>
        <div style={{ height: '150px', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <ThinkingSpirograph />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '2rem 0', color: 'var(--c-textBright)', overflow: 'hidden' }}>
      <div style={{ padding: '0 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, paddingRight: '2rem' }}>
          <div className="analog-band-cool" style={{ height: '4px', width: '60px', marginBottom: '1rem', borderRadius: '2px' }} />
          <h1 style={{ margin: 0, fontFamily: 'var(--f-display)', fontSize: '2.5rem', color: '#fff' }}>Chronological Archive</h1>
          <p style={{ color: 'var(--c-muted)', margin: '0.5rem 0 1rem 0' }}>Scroll horizontally to browse the digitized archive chronologically.</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search by keyword..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '0.5rem 1rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '20px', outline: 'none', fontFamily: 'var(--f-body)', fontSize: '0.85rem' }}
            />
            <select 
              value={selectedSubject} 
              onChange={e => setSelectedSubject(e.target.value)}
              style={{ padding: '0.5rem 1rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '20px', outline: 'none', fontFamily: 'var(--f-body)', fontSize: '0.85rem' }}
            >
              <option value="">All Topics</option>
              {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
              <button 
                onClick={() => setSelectedDecade('')}
                style={{ padding: '0.4rem 0.8rem', background: selectedDecade === '' ? 'var(--c-gold)' : 'var(--c-bgDeep)', color: selectedDecade === '' ? 'var(--c-bg)' : 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 'bold' }}
              >
                All Time
              </button>
              {decades.map(dec => (
                <button 
                  key={dec}
                  onClick={() => setSelectedDecade(dec.toString())}
                  style={{ padding: '0.4rem 0.8rem', background: selectedDecade === dec.toString() ? 'var(--c-gold)' : 'var(--c-bgDeep)', color: selectedDecade === dec.toString() ? 'var(--c-bg)' : 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 'bold' }}
                >
                  {dec}s
                </button>
              ))}
            </div>
          </div>
        </div>
        <Link to="/library" className="lux-hover-lift" style={{ color: 'var(--c-textBright)', textDecoration: 'none', border: '1px solid var(--c-ghost)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
          Back to Index
        </Link>
      </div>

      <div 
        ref={scrollContainerRef}
        style={{
        display: 'flex',
        gap: '2rem',
        padding: '2rem',
        overflowX: 'auto',
        overscrollBehaviorX: 'contain',
        alignItems: 'center',
        minHeight: '60vh',
        WebkitOverflowScrolling: 'touch',
        scrollSnapType: 'x mandatory'
      }}>
        {filteredDocs.length === 0 && (
          <div style={{ padding: '4rem', color: 'var(--c-dim)', width: '100%', textAlign: 'center', fontSize: '1.2rem' }}>
            No documents match your filters.
          </div>
        )}
        {filteredDocs.map((doc, idx) => {
          const year = getYear(doc);
          const showYearLabel = idx === 0 || getYear(filteredDocs[idx - 1]) !== year;
          const mediaUrls = doc.media_urls ? JSON.parse(doc.media_urls) : [];
          const thumb = mediaUrls.find(u => u.match(/\.(jpeg|jpg|gif|png)$/i));

          return (
            <div key={doc.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', scrollSnapAlign: 'center', position: 'relative' }}>
              {showYearLabel && (
                <div style={{ position: 'absolute', top: '-3rem', left: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--c-goldBright)', opacity: 0.3, fontFamily: 'var(--f-display)' }}>
                  {year}
                </div>
              )}
              
              <Link 
                to={`/library/${generateFriendlySlug(doc, doc.metadata_json ? JSON.parse(doc.metadata_json) : {})}`}
                className="lux-hover-lift"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '300px',
                  background: 'var(--c-bgCard)',
                  border: '1px solid var(--c-ghost)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  position: 'relative',
                  flexShrink: 0,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
              >
                <LazyDocumentThumbnail url={doc.url} fallbackImage={thumb} />
                <div style={{ padding: '1rem' }}>
                  <div style={{ color: 'var(--c-gold)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                    {year} &bull; {doc.type.replace('_', ' ')}
                  </div>
                  <div style={{ color: 'var(--c-textBright)', fontSize: '1rem', fontWeight: 'bold', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.5rem' }}>
                    {getCleanTitle(doc)}
                  </div>
                  {(() => {
                    const m = doc.metadata_json ? JSON.parse(doc.metadata_json) : {};
                    const pages = m.page_count || m.pages || null;
                    const authors = m.gemini_extracted_metadata?.authors?.length > 0 
                      ? m.gemini_extracted_metadata.authors.join(', ')
                      : m.author;
                    if (!pages && !authors) return null;
                    return (
                      <div style={{ color: 'var(--c-dim)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                        {authors && <div style={{ fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>By {authors}</div>}
                        {pages && <div>{pages} page{pages !== 1 && pages !== '1' ? 's' : ''}</div>}
                      </div>
                    );
                  })()}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
