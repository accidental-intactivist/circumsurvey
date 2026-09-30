import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Newspaper, BookOpen, Scale, Video, Headphones, Image as ImageIcon, FileText, Globe, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import UniversalSquishHeader from '../../../circumsurvey/src/components/Scrollytelling/UniversalSquishHeader';
import ArchiveHamburgerMenu from '../components/ArchiveHamburgerMenu';
import MicrofilmTimeline from '../../../circumsurvey/src/components/MicrofilmTimeline';

export default function CollectionPage() {
  const { slug } = useParams();
  const { theme } = useTheme();
  
  const [collection, setCollection] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

  useEffect(() => {
    fetchCollection();
  }, [slug]);

  const fetchCollection = async () => {
    setLoading(true);
    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocal ? `/api_collections_${slug}_mock.json` : `/api/collections/${slug}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Collection not found");
      const data = await res.json();
      setCollection(data.collection);
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-dim)' }}>
        Loading collection...
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-red)' }}>
        {error || "Failed to load collection."}
      </div>
    );
  }

  const extractSection = (str) => {
    if (!str) return 'Uncategorized';
    const parts = str.split(': ');
    return parts.length > 1 ? parts[1].trim() : 'Uncategorized';
  };

  const sections = Array.from(new Set(documents.map(d => extractSection(d.source_collection)))).sort();
  const filteredDocs = selectedSeries ? documents.filter(d => extractSection(d.source_collection) === selectedSeries) : documents;

  const getCleanTitle = (d) => {
    let m;
    try { m = JSON.parse(d.metadata_json); } catch(e) { m = {}; }
    if (m && m.academic_title) return m.academic_title;
    let t = d.title || '';
    if (t.toLowerCase().match(/\.(pdf|mov|mp4|webm|ogg)$/i)) {
      t = t.replace(/\.(pdf|mov|mp4|webm|ogg)$/i, '')
           .replace(/\[.*?\]/g, '')
           .replace(/_/g, ' ')
           .replace(/page (\d+)/i, '- Page $1');
    }
    const yearMatch = t.match(/^(?:19|20)\d{2}\s*/);
    if (yearMatch) {
      t = t.replace(yearMatch[0], '');
    }
    return t.trim() || 'Untitled Document';
  };

  const getMetadataField = (doc, field) => {
    try {
      const m = JSON.parse(doc.metadata_json);
      return m[field] || '';
    } catch(e) { return ''; }
  };

  const getDisplayDate = (doc) => {
    const rawDate = getMetadataField(doc, 'date');
    if (rawDate) return rawDate;
    
    const title = getCleanTitle(doc);
    const titleMatch = title.match(/(?:19|20)\d{2}/);
    if (titleMatch) {
      return `[${titleMatch[0]}]`;
    }
    
    return 'Undated';
  };

  const getYear = (doc) => {
    const displayDate = getDisplayDate(doc);
    if (displayDate === 'Undated') return 9999;
    const match = displayDate.match(/(?:19|20)\d{2}/);
    return match ? parseInt(match[0], 10) : 9999;
  };
  
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const ya = getYear(a), yb = getYear(b);
      if (ya !== yb) return sortConfig.direction === 'asc' ? ya - yb : yb - ya;
      return 0;
    }
    if (sortConfig.key === 'title') {
      const ta = getCleanTitle(a).toLowerCase();
      const tb = getCleanTitle(b).toLowerCase();
      if (ta < tb) return sortConfig.direction === 'asc' ? -1 : 1;
      if (ta > tb) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    }
    if (sortConfig.key === 'location') {
      const la = (getMetadataField(a, 'original_location') || 'Unknown').toLowerCase();
      const lb = (getMetadataField(b, 'original_location') || 'Unknown').toLowerCase();
      if (la < lb) return sortConfig.direction === 'asc' ? -1 : 1;
      if (la > lb) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    }
    if (sortConfig.key === 'format') {
      const fa = (a.type || 'Document').toLowerCase();
      const fb = (b.type || 'Document').toLowerCase();
      if (fa < fb) return sortConfig.direction === 'asc' ? -1 : 1;
      if (fa > fb) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedDocs.length / itemsPerPage);
  const paginatedDocs = sortedDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const hasSections = sections.length > 1 || (sections.length === 1 && sections[0] !== 'Uncategorized');
  const showItems = !hasSections || selectedSeries;

  const getDocumentIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'newspaper_clipping': return <Newspaper size={16} />;
      case 'medical_journal': return <BookOpen size={16} />;
      case 'legal_document': return <Scale size={16} />;
      case 'video': return <Video size={16} />;
      case 'audio': return <Headphones size={16} />;
      case 'image': return <ImageIcon size={16} />;
      case 'external_news': return <Globe size={16} />;
      default: return <FileText size={16} />;
    }
  };



  const navLeft = null;
  const navRight = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <ArchiveHamburgerMenu />
    </div>
  );

  // Use a distinct underloom mode for UMass MS 1205
  let themeKey = `${theme}-dark-none`;
  if (slug === 'tim-hammond-archive') {
    themeKey = `${theme}-agnes`;
  }

  return (
    <div style={{ background: 'var(--c-bg)', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      <UniversalSquishHeader
        themeKey={themeKey}
        eyebrow="Special Collection"
        title={collection.title}
        subtitle={
          <span style={{ fontSize: '1.25rem', color: 'var(--c-gold)', fontFamily: 'var(--f-body)', fontWeight: 300, letterSpacing: '0.02em' }}>
            {collection.subtitle}
          </span>
        }
        navLeftContent={navLeft}
        navRightContent={navRight}
        startVh={50}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>
        
        {/* Left Column: Metadata */}
        <div style={{ flex: '0 0 300px', position: 'sticky', top: '100px' }}>
          <div style={{ padding: '2rem', background: 'var(--c-bgCard)', border: '1px solid var(--c-ghost)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', margin: 0 }}>Institution</h3>
            <p style={{ color: 'var(--c-textBright)', fontWeight: 'bold', marginBottom: '1.5rem', marginTop: '0.25rem' }}>
              {collection.institution}
            </p>
            
            {slug === 'tim-hammond-archive' && (
              <>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', margin: 0 }}>Location</h3>
                <p style={{ color: 'var(--c-textBright)', fontWeight: 'bold', marginBottom: '1.5rem', marginTop: '0.25rem' }}>
                  Robert S. Cox Special Collections and University Archives Research Center
                </p>
              </>
            )}
            
            <h3 style={{ fontSize: '0.85rem', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', margin: 0 }}>Curator</h3>
            <p style={{ color: 'var(--c-textBright)', fontWeight: 'bold', marginBottom: '1.5rem', marginTop: '0.25rem' }}>
              {slug === 'tim-hammond-archive' ? (
                <Link to="/to/tim-hammond" style={{ color: 'var(--c-blue)', textDecoration: 'none' }}>Tim Hammond</Link>
              ) : (
                collection.curator
              )}
            </p>
            
            <h3 style={{ fontSize: '0.85rem', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', margin: 0 }}>Total Items</h3>
            <p style={{ color: 'var(--c-textBright)', fontWeight: 'bold', marginBottom: '0', marginTop: '0.25rem' }}>{documents.length.toLocaleString()} items</p>
          </div>
        </div>

        {/* Right Column: Content & Items */}
        <div style={{ flex: 1, paddingTop: '1rem', minWidth: 0 }}>
          <div style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--c-text)', marginBottom: '3rem', fontFamily: 'var(--f-body)', opacity: 0.9 }}>
            {slug === 'tim-hammond-archive' ? (
              <p>
                This archive documents the life and work of Tim Hammond, a grassroots human rights activist known for his pioneering contributions to the genital autonomy movement. It includes materials from 1971 to 2023, spanning five boxes and eight linear feet. The collection contains records related to Hammond's involvement in various initiatives, including co-founding the National Organization of Restoring Men (NOHARMM), producing the documentary <em>Whose Body, Whose Rights?</em>, conducting large-scale circumcision harm documentation surveys, and his work with the Children’s Health & Human Rights Partnership and the Genital Autonomy Legal Defense and Education Fund.
              </p>
            ) : (
              collection.description
            )}
          </div>

          {showItems ? (
            <>
              {hasSections && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid var(--c-ghost)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                  <div>
                    <button 
                      onClick={() => { setSelectedSeries(null); setCurrentPage(1); }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--c-gold)', fontSize: '0.9rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                      <ArrowLeft size={14} /> All Sections
                    </button>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--c-textBright)', fontFamily: 'var(--f-display)' }}>
                      {selectedSeries}
                    </h3>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <select 
                      value={itemsPerPage} 
                      onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      style={{ background: 'var(--c-bgCard)', color: 'var(--c-textBright)', border: '1px solid var(--c-dim)', borderRadius: '4px', padding: '0.4rem', fontSize: '0.85rem' }}
                    >
                      <option value={20}>Show 20</option>
                      <option value={50}>Show 50</option>
                      <option value={100}>Show 100</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Timeline Horizontal Carousel */}
              <MicrofilmTimeline 
                documents={filteredDocs} 
                getYear={getYear} 
                getCleanTitle={getCleanTitle} 
                getDocumentIcon={getDocumentIcon} 
              />

              {/* Finding Aid Data Table */}
              <div style={{ overflowX: 'auto', background: 'var(--c-bgCard)', border: '1px solid var(--c-ghost)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--c-bgSoft)', borderBottom: '2px solid var(--c-ghost)' }}>
                      <th onClick={() => handleSort('date')} style={{ padding: '1rem', color: 'var(--c-dim)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', cursor: 'pointer' }}>Date {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                      <th onClick={() => handleSort('title')} style={{ padding: '1rem', color: 'var(--c-dim)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', cursor: 'pointer' }}>Title {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                      <th onClick={() => handleSort('location')} style={{ padding: '1rem', color: 'var(--c-dim)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', cursor: 'pointer' }}>Box / Folder {sortConfig.key === 'location' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                      <th onClick={() => handleSort('format')} style={{ padding: '1rem', color: 'var(--c-dim)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', cursor: 'pointer' }}>Format {sortConfig.key === 'format' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDocs.map((doc, idx) => {
                      const date = getDisplayDate(doc);
                      const location = getMetadataField(doc, 'original_location') || 'Unknown';
                      return (
                        <tr key={doc.id} style={{ borderBottom: '1px solid var(--c-ghost)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--c-text)', whiteSpace: 'nowrap' }}>{date}</td>
                          <td style={{ padding: '1rem', fontSize: '0.95rem', fontWeight: 'bold' }}>
                            <Link to={`/library/${doc.id}`} style={{ color: 'var(--c-textBright)', textDecoration: 'none' }}>
                              {getCleanTitle(doc)}
                            </Link>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--c-muted)', fontFamily: 'var(--f-mono)' }}>{location}</td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--c-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {getDocumentIcon(doc.type)} <span style={{ textTransform: 'capitalize' }}>{(doc.type || 'Document').replace('_', ' ')}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--c-ghost)' }}>
                   <div style={{ fontSize: '0.85rem', color: 'var(--c-muted)' }}>
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDocs.length)} of {filteredDocs.length} entries
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        style={{ background: 'var(--c-bgCard)', color: currentPage === 1 ? 'var(--c-dim)' : 'var(--c-textBright)', border: '1px solid var(--c-dim)', borderRadius: '4px', padding: '0.4rem 1rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                      >
                        Prev
                      </button>
                      <span style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', color: 'var(--c-text)' }}>Page {currentPage} of {totalPages}</span>
                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        style={{ background: 'var(--c-bgCard)', color: currentPage === totalPages ? 'var(--c-dim)' : 'var(--c-textBright)', border: '1px solid var(--c-dim)', borderRadius: '4px', padding: '0.4rem 1rem', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                      >
                        Next
                      </button>
                    </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ borderBottom: '2px solid var(--c-ghost)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--c-textBright)', fontFamily: 'var(--f-display)' }}>Browse by Section</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {sections.map(sec => {
                  const count = documents.filter(d => extractSection(d.source_collection) === sec).length;
                  return (
                    <button
                      key={sec}
                      onClick={() => { setSelectedSeries(sec); setCurrentPage(1); }}
                      className="lux-hover-lift"
                      style={{
                        background: 'var(--c-bgCard)',
                        border: '1px solid var(--c-ghost)',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--c-textBright)', lineHeight: 1.3 }}>
                        {sec}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--c-gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {count.toLocaleString()} Items
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
