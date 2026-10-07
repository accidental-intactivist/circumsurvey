import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, FileText, Globe, ArrowLeft, Network, Sparkles, Edit3, Save, Image as ImageIcon, Search } from 'lucide-react';
import EntityNetworkGraph from '../components/EntityNetworkGraph';
import ThinkingSpirograph from '../components/ThinkingSpirograph';
import { generateFriendlySlug } from '../utils/slugs';
import './AdminArchivePage.css';

let globalCachedDocs = null;

export default function ProfilePage() {
  const params = useParams();
  const id = params['*'] || params.id;
  const [entity, setEntity] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editRole, setEditRole] = useState('notable');
  const [editTagline, setEditTagline] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [mentionSearch, setMentionSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    setCurrentPage(1);
  }, [mentionSearch, typeFilter, sortOption]);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [wikiImageResult, setWikiImageResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageError, setImageError] = useState(false);
  const graphRef = useRef(null);
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!graphRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsGraphVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    observer.observe(graphRef.current);
    return () => observer.disconnect();
  }, []);

  // Admin authentication via Clerk
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Allow if they are explicitly marked as curator/admin in Clerk OR if their email is apettit or tim
      const isCurator = user.publicMetadata?.role === 'admin' || user.publicMetadata?.role === 'curator' || user.emailAddresses.some(e => e.emailAddress.includes('apettit') || e.emailAddress.includes('tim'));
      setIsAdmin(isCurator || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    } else {
      setIsAdmin(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    }
  }, [isLoaded, isSignedIn, user]);

  const handleSearchWikipediaImage = async (queryToSearch) => {
    setIsSearchingImage(true);
    setWikiImageResult(null);
    try {
      const q = encodeURIComponent(queryToSearch);
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrlimit=1&prop=pageimages&format=json&pithumbsize=500&origin=*`);
      const data = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        const page = Object.values(pages)[0];
        if (page && page.thumbnail) {
          setWikiImageResult({
            url: page.thumbnail.source,
            title: page.title
          });
        } else {
          setWikiImageResult({ error: 'No image found on Wikipedia.' });
        }
      } else {
        setWikiImageResult({ error: 'No Wikipedia page found.' });
      }
    } catch (e) {
      console.error(e);
      setWikiImageResult({ error: 'Search failed.' });
    }
    setIsSearchingImage(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Entity Details
      const entRes = await fetch('/api/entities');
      if (entRes.ok) {
        const allEntities = await entRes.json();
        const decodedId = decodeURIComponent(id);
        
        const generateSlug = (name) => {
          if (!name) return '';
          const cleanName = name.replace(/,\s*[a-zA-Z\.]+$/, '');
          const parts = cleanName.trim().split(/\s+/);
          if (parts.length >= 2 && parts.length <= 4) {
            const last = parts.pop();
            return `${last}_${parts.join('_')}`;
          }
          return cleanName.replace(/\s+/g, '_');
        };

        let found = allEntities.find(e => {
          if (!e.name) return false;
          return e.id === decodedId || 
                 e.name.toLowerCase() === decodedId.toLowerCase() ||
                 generateSlug(e.name).toLowerCase() === decodedId.toLowerCase();
        });
        
        if (!found) {
          // Auto-generate a stub entity so the page still loads archive mentions
          found = {
            id: decodedId,
            name: decodedId,
            type: 'person', // default guess
            description: 'This profile has not yet been written. You can use the AI Assistant to generate a biography based on their archive footprint.',
            image_url: ''
          };
        }
        setEntity(found);
        setEditDesc(found.description || '');
        setEditImageUrl(found.image_url || '');
        setEditRole(found.role || 'notable');
        setEditTagline(found.tagline || '');
        setEditUrl(found.url || '');
        setEditLocation(found.location || '');
        setEditContact(found.contact_info || '');
        setEditStatus(found.status || 'active');
        setImageError(false);
      }

      // 2. Fetch Documents mentioning this entity
      if (globalCachedDocs) {
        setDocuments(globalCachedDocs);
      } else {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiUrl = isLocal ? '/api_mock.json' : '/api/cms';
        const docRes = await fetch(apiUrl);
        
        if (docRes.ok) {
          const allDocs = await docRes.json();
          if (allDocs.data) {
            globalCachedDocs = allDocs.data;
            setDocuments(allDocs.data);
          } else if (Array.isArray(allDocs)) {
            globalCachedDocs = allDocs;
            setDocuments(allDocs);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleGenerateBio = async () => {
    setIsGenerating(true);
    try {
      const token = await getToken();
      const fallbackToken = localStorage.getItem('adminToken');
      const authHeader = token ? `Bearer ${token}` : fallbackToken ? `Bearer ${fallbackToken}` : '';
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(authHeader ? { 'Authorization': authHeader } : {})
        },
        body: JSON.stringify({ 
          query: `Write a short, professional, and encyclopedic biography about ${entity.name}. Focus ONLY on their background and their contributions/mentions within the archive context. Do not add outside information unless it's strictly biographical facts.`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.response) {
          setEditDesc(data.response);
          if (!isEditing) setIsEditing(true);
        }
      }
    } catch (e) {
      console.error("Failed to generate bio", e);
    }
    setIsGenerating(false);
  };

  const handleSaveBio = async () => {
    try {
      const token = await getToken();
      const fallbackToken = localStorage.getItem('adminToken');
      const authHeader = token ? `Bearer ${token}` : fallbackToken ? `Bearer ${fallbackToken}` : '';
      
      const res = await fetch('/api/entities', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(authHeader ? { 'Authorization': authHeader } : {})
        },
        body: JSON.stringify({ 
          id: entity.id, 
          description: editDesc, 
          image_url: editImageUrl, 
          role: editRole, 
          tagline: editTagline,
          url: editUrl,
          location: editLocation,
          contact_info: editContact,
          status: editStatus
        })
      });
      if (res.ok) {
        setEntity({ 
          ...entity, 
          description: editDesc, 
          image_url: editImageUrl, 
          role: editRole, 
          tagline: editTagline,
          url: editUrl,
          location: editLocation,
          contact_info: editContact,
          status: editStatus
        });
        setIsEditing(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to save: ${res.statusText} ${errData.error || ''}`);
      }
    } catch(e) {
      console.error("Failed to save bio", e);
    }
  };

  // Filter documents based on the entity name
  const filteredDocs = documents.filter(doc => {
    if (!entity) return false;
    if (!doc.metadata_json) return false;
    try {
      const meta = JSON.parse(doc.metadata_json);
      const name = entity.name.toLowerCase();
      
      const orgs = Array.isArray(meta.organizations) ? meta.organizations : (typeof meta.organizations === 'string' ? [meta.organizations] : []);
      const people = Array.isArray(meta.key_people) ? meta.key_people : (typeof meta.key_people === 'string' ? [meta.key_people] : []);
      const authors = Array.isArray(meta.gemini_extracted_metadata?.authors) ? meta.gemini_extracted_metadata.authors : [];
      const geminiOrgs = Array.isArray(meta.gemini_extracted_metadata?.organizations) ? meta.gemini_extracted_metadata.organizations : [];
      const tags = Array.isArray(meta.tags) ? meta.tags : (typeof meta.tags === 'string' ? [meta.tags] : []);
      
      const allPeople = [...people, ...authors];
      const allOrgs = [...orgs, ...geminiOrgs];

      const inOrgs = allOrgs.some(o => typeof o === 'string' && o.toLowerCase() === name);
      const inPeople = allPeople.some(p => typeof p === 'string' && p.toLowerCase() === name);
      const inPub = typeof meta.source_publication === 'string' && meta.source_publication.toLowerCase() === name;
      const inTags = tags.some(t => typeof t === 'string' && t.toLowerCase() === name);
      
      return inOrgs || inPeople || inPub || inTags;
    } catch(e) { return false; }
  });

  const availableTypes = ['All', ...new Set(filteredDocs.map(d => (d.type || 'document').replace('_', ' ')))].sort();

  const getCleanTitle = (d, m) => {
    if (m && m.academic_title) return m.academic_title;
    if (m && m.gemini_extracted_metadata && m.gemini_extracted_metadata.title) return m.gemini_extracted_metadata.title;
    if (m && m.title) return m.title;
    let t = d.title || '';
    if (t.toLowerCase().endsWith('.pdf')) {
      t = t.replace(/\.pdf$/i, '').replace(/\[.*?\]/g, '').replace(/_/g, ' ').replace(/page (\d+)/i, '- Page $1').trim();
    }
    return t || 'Untitled Document';
  };

  const getTopics = () => {
    const topicsMap = {};
    filteredDocs.forEach(doc => {
      let meta = {};
      try { meta = JSON.parse(doc.metadata_json); } catch(e){}
      
      const words = [];
      if (meta.tags) words.push(...meta.tags);
      if (doc.subject) words.push(doc.subject);
      
      words.forEach(w => {
        if (!w) return;
        let clean = w.toLowerCase().trim();
        // Fuzzy dedup: map "circumcision harm" and "circumcision" to a single tag
        if (clean === 'circumcision harm' || clean === 'routine infant circumcision') clean = 'circumcision';
        if (clean === 'genital autonomy' || clean === 'genital integrity') clean = 'genital autonomy';
        if (clean.length > 3) {
          topicsMap[clean] = (topicsMap[clean] || 0) + 1;
        }
      });
    });
    
    return Object.entries(topicsMap)
      .filter(([topic, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25);
  };
  const topTopics = getTopics();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ThinkingSpirograph text="Consulting the archive..." />
      </div>
    );
  }

  if (!entity) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--c-dim)' }}>
        <h2 style={{ color: 'var(--c-textBright)' }}>Entity Not Found</h2>
        <p>This entity does not exist in the graph yet.</p>
        <Link to="/library" style={{ color: 'var(--c-goldBright)' }}>&larr; Return to Library</Link>
      </div>
    );
  }

  const getDocDate = (doc) => {
    try {
      const meta = JSON.parse(doc.metadata_json);
      return new Date(meta.date || '1900-01-01').getTime();
    } catch { return new Date('1900-01-01').getTime(); }
  };

  const authoredDocsList = [];
  const generalDocsList = [];

  filteredDocs.forEach(doc => {
    try {
      const meta = JSON.parse(doc.metadata_json);
      const name = entity?.name?.toLowerCase();
      let isAuthor = false;
      const authors = Array.isArray(meta.gemini_extracted_metadata?.authors) ? meta.gemini_extracted_metadata.authors : [];
      if (authors.some(a => typeof a === 'string' && a.toLowerCase() === name)) isAuthor = true;
      if (meta.author && typeof meta.author === 'string' && meta.author.toLowerCase().includes(name)) isAuthor = true;
      if (Array.isArray(meta.author) && meta.author.some(a => typeof a === 'string' && a.toLowerCase().includes(name))) isAuthor = true;
      
      if (isAuthor) authoredDocsList.push(doc);
      else generalDocsList.push(doc);
    } catch {
      generalDocsList.push(doc);
    }
  });

  // Calculate type tallies for general references
  const typeCounts = { All: generalDocsList.length };
  generalDocsList.forEach(doc => {
    const t = (doc.type || 'document').replace('_', ' ');
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  // Apply filters
  const searchedMentions = generalDocsList.filter(doc => {
    if (typeFilter !== 'All' && (doc.type || 'document').replace('_', ' ') !== typeFilter) return false;
    if (!mentionSearch) return true;
    return doc.title.toLowerCase().includes(mentionSearch.toLowerCase());
  });

  // Sort
  const sortedMentions = [...searchedMentions].sort((a, b) => {
    if (sortOption === 'newest') {
      return getDocDate(b) - getDocDate(a);
    } else if (sortOption === 'oldest') {
      return getDocDate(a) - getDocDate(b);
    } else if (sortOption === 'alpha') {
      const titleA = getCleanTitle(a, a.metadata_json ? JSON.parse(a.metadata_json) : {});
      const titleB = getCleanTitle(b, b.metadata_json ? JSON.parse(b.metadata_json) : {});
      return titleA.localeCompare(titleB);
    } else if (sortOption === 'type') {
      const tA = (a.type || 'document').replace('_', ' ');
      const tB = (b.type || 'document').replace('_', ' ');
      if (tA === tB) return getDocDate(b) - getDocDate(a);
      return tA.localeCompare(tB);
    }
    return 0;
  });

  // Apply search/sort for Authored works too
  const sortedAuthored = [...authoredDocsList]
    .filter(doc => !mentionSearch || doc.title.toLowerCase().includes(mentionSearch.toLowerCase()))
    .sort((a, b) => getDocDate(b) - getDocDate(a));

  const totalPages = Math.ceil(sortedMentions.length / itemsPerPage);
  const paginatedMentions = sortedMentions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate font sizes for word cloud
  const maxTopicCount = Math.max(...topTopics.map(t => t[1]), 1);

  return (
    <div style={{ background: 'var(--c-bg)', minHeight: '100vh', color: 'var(--c-textBright)', display: 'flex', flexDirection: 'column' }} className="lux-glide-in">
      
      <div style={{ padding: '2rem 3rem' }}>
        <Link to="/library" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-dim)', textDecoration: 'none', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }} className="lux-hover-lift">
          <ArrowLeft size={16} /> Back to Library
        </Link>
      </div>

      {/* Hero Banner Area */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '3rem 0 5rem 0', background: 'var(--c-bgSoft)', borderBottom: '1px solid var(--c-ghost)' }}>
        {/* Decorative Background Blur */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px', background: 'var(--c-gold)', filter: 'blur(120px)', opacity: 0.15, zIndex: 0 }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1, display: 'flex', gap: '4rem', flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* Left Column: Photo */}
          <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              width: '100%', 
              aspectRatio: '1', 
              borderRadius: entity.type === 'person' ? '4px' : '4px',
              background: 'var(--c-bgSoft)',
              border: '1px solid var(--c-ghost)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {(entity.image_url && !imageError) ? (
                <img src={entity.image_url} alt={entity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImageError(true)} />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: entity.role === 'champion' ? 'linear-gradient(135deg, var(--c-bgDeep), rgba(212, 160, 48, 0.2))' : 
                              entity.role === 'critic' ? 'linear-gradient(135deg, var(--c-bgDeep), rgba(180, 50, 50, 0.2))' : 
                              'linear-gradient(135deg, var(--c-bgDeep), rgba(60, 120, 200, 0.2))',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '4rem', color: 'var(--c-textBright)', fontFamily: 'var(--f-display)', opacity: 0.8, fontWeight: 'bold' }}>
                    {entity.name.split(' ').slice(0, 2).map(n => n.charAt(0)).join('').toUpperCase()}
                  </div>
                  <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', opacity: 0.2 }}>
                    {entity.type === 'organization' ? <Network size={48} /> : <Sparkles size={48} />}
                  </div>
                </div>
              )}
            </div>

            {!isEditing && entity.type === 'organization' && (
              <div style={{ marginTop: '1.5rem', background: 'var(--c-bgDeep)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--c-ghost)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    background: entity.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : entity.status === 'defunct' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                    color: entity.status === 'active' ? '#10b981' : entity.status === 'defunct' ? '#ef4444' : '#9ca3af',
                    border: `1px solid ${entity.status === 'active' ? '#10b981' : entity.status === 'defunct' ? '#ef4444' : '#9ca3af'}`
                  }}>
                    {entity.status || 'unknown'}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {entity.location && (
                    <div>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--c-dim)', marginBottom: '0.2rem', letterSpacing: '0.05em' }}>Location</div>
                      <div style={{ color: 'var(--c-textBright)', fontSize: '0.9rem' }}>{entity.location}</div>
                    </div>
                  )}
                  {entity.url && (
                    <div>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--c-dim)', marginBottom: '0.2rem', letterSpacing: '0.05em' }}>Website</div>
                      <a href={entity.url} target="_blank" rel="noreferrer" style={{ color: 'var(--c-blue)', fontSize: '0.9rem', textDecoration: 'none' }}>{entity.url}</a>
                    </div>
                  )}
                  {entity.contact_info && (
                    <div>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--c-dim)', marginBottom: '0.2rem', letterSpacing: '0.05em' }}>Contact</div>
                      <div style={{ color: 'var(--c-textBright)', fontSize: '0.9rem' }}>{entity.contact_info}</div>
                    </div>
                  )}
                  {!entity.location && !entity.url && !entity.contact_info && (
                    <div style={{ color: 'var(--c-dim)', fontSize: '0.85rem', fontStyle: 'italic' }}>No directory information available.</div>
                  )}
                </div>
              </div>
            )}
            
            {isEditing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input 
                  type="text"
                  placeholder="Image URL..."
                  value={editImageUrl}
                  onChange={e => setEditImageUrl(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-gold)', borderRadius: '6px' }}
                />
                
                <div style={{ fontSize: '0.8rem', color: 'var(--c-dim)', marginTop: '0.5rem' }}>Or search Wikipedia:</div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                  <input
                    type="text"
                    value={searchQuery || (entity ? `${entity.name} ${topTopics.slice(0,2).map(t=>t[0]).join(' ')}`.trim() : '')}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search keywords..."
                    style={{ flex: 1, padding: '0.5rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '4px', fontSize: '0.85rem' }}
                  />
                  <button
                    onClick={() => handleSearchWikipediaImage(searchQuery || (entity ? `${entity.name} ${topTopics.slice(0,2).map(t=>t[0]).join(' ')}`.trim() : ''))}
                    disabled={isSearchingImage}
                    className="lux-hover-lift"
                    style={{ background: 'var(--c-bgSoft)', border: '1px solid var(--c-ghost)', color: 'var(--c-textBright)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Search size={14} /> {isSearchingImage ? 'Searching...' : 'Search'}
                  </button>
                </div>
                
                {wikiImageResult && !wikiImageResult.error && (
                  <div className="lux-glide-in" style={{ background: 'var(--c-bgDeep)', border: '1px solid var(--c-blue)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--c-dim)', marginBottom: '0.5rem' }}>Found image for "{wikiImageResult.title}"</div>
                    <img src={wikiImageResult.url} alt="Preview" style={{ width: '100%', borderRadius: '4px', marginBottom: '0.5rem', maxHeight: '150px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '0.8rem', color: 'var(--c-textBright)', marginBottom: '0.5rem' }}>Is this the correct person/org?</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setEditImageUrl(wikiImageResult.url); setWikiImageResult(null); }} className="lux-hover-lift" style={{ flex: 1, background: 'var(--c-blue)', color: 'var(--c-bg)', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Yes</button>
                      <button onClick={() => setWikiImageResult(null)} className="lux-hover-lift" style={{ flex: 1, background: 'var(--c-bgSoft)', color: 'var(--c-text)', border: '1px solid var(--c-ghost)', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>No</button>
                    </div>
                  </div>
                )}
                {wikiImageResult && wikiImageResult.error && (
                  <div style={{ color: 'var(--c-dim)', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>
                    {wikiImageResult.error}
                  </div>
                )}

                {entity?.type === 'organization' && (
                  <>
                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--c-ghost)', paddingTop: '1rem' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Organization Status:</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '6px' }}
                      >
                        <option value="active">Active</option>
                        <option value="defunct">Defunct / Inactive</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>

                    <input 
                      type="text"
                      placeholder="Location (e.g. San Francisco, CA)..."
                      value={editLocation}
                      onChange={e => setEditLocation(e.target.value)}
                      style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '6px' }}
                    />

                    <input 
                      type="text"
                      placeholder="Website URL..."
                      value={editUrl}
                      onChange={e => setEditUrl(e.target.value)}
                      style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '6px' }}
                    />

                    <input 
                      type="text"
                      placeholder="Contact Info (Email/Phone)..."
                      value={editContact}
                      onChange={e => setEditContact(e.target.value)}
                      style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '6px' }}
                    />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Info */}
          <div style={{ flex: '1 1 500px' }}>
            <div className="analog-band-cool" style={{ height: '4px', width: '60px', marginBottom: '1.5rem', borderRadius: '2px' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div style={{ color: 'var(--c-goldBright)', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {entity.type === 'person' ? 'Key Figure' : 'Organization'}
              </div>
              {(entity.role && entity.role !== 'notable') && (
                <span className={`alignment-banner alignment-banner-${entity.role || 'notable'}`}>
                  {entity.role === 'champion' ? '✦' : entity.role === 'critic' ? '⚡' : '◆'} {entity.role === 'champion' ? 'Champion' : entity.role === 'critic' ? 'Critic' : 'Notable'}
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 style={{ margin: 0, fontSize: '3.5rem', fontFamily: 'var(--f-display)', letterSpacing: '-0.02em', color: 'var(--c-textBright)', lineHeight: 1.1 }}>
                {entity.name}
              </h1>
              
              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button 
                    onClick={handleGenerateBio} 
                    disabled={isGenerating}
                    className="lux-hover-lift"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--c-blue)', color: 'var(--c-bg)', border: 'none', padding: '0.6rem 1rem', borderRadius: '4px', cursor: isGenerating ? 'wait' : 'pointer', fontWeight: 'bold', fontSize: '0.9rem', opacity: isGenerating ? 0.7 : 1 }}
                  >
                    <Sparkles size={16} className={isGenerating ? "spin-slow" : ""} /> {isGenerating ? 'Synthesizing...' : 'Generate with AI'}
                  </button>
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="lux-hover-lift"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--c-bgSoft)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', padding: '0.6rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                    >
                      <Edit3 size={16} /> Edit
                    </button>
                  ) : (
                    <button 
                      onClick={handleSaveBio} 
                      className="lux-hover-lift"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--c-gold)', color: 'var(--c-bgDeep)', border: 'none', padding: '0.6rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                    >
                      <Save size={16} /> Save
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Tagline */}
            {!isEditing && entity.tagline && (
              <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: 'var(--c-muted)', fontStyle: 'italic', margin: '0 0 1.5rem 0' }}>
                {entity.tagline}
              </p>
            )}

            {/* Quick Stats Ribbon */}
            <div style={{ display: 'flex', gap: '2rem', padding: '1.5rem 0', borderTop: '1px solid var(--c-ghost)', borderBottom: '1px solid var(--c-ghost)', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-dim)', marginBottom: '0.25rem' }}>Archive Mentions</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--c-textBright)', fontFamily: 'var(--f-display)' }}>{filteredDocs.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-dim)', marginBottom: '0.25rem' }}>Network Nodes</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--c-textBright)', fontFamily: 'var(--f-display)' }}>
                  {entity.see_also_json ? (() => { try { return JSON.parse(entity.see_also_json).length; } catch { return 0; }})() : 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-dim)', marginBottom: '0.25rem' }}>Entity Class</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--c-textBright)', fontFamily: 'var(--f-display)', textTransform: 'capitalize' }}>
                  {entity.type}
                </div>
              </div>
            </div>

            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {/* Role selector */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Alignment:</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    style={{ padding: '0.5rem 1rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '6px', fontSize: '0.9rem' }}
                  >
                    <option value="champion">✦ Champion</option>
                    <option value="critic">⚡ Critic</option>
                    <option value="notable">◆ Notable</option>
                  </select>
                </div>
                {/* Tagline input */}
                <input
                  type="text"
                  placeholder="Short tagline (e.g., 'Founder of NOCIRC')..."
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--c-gold)', borderRadius: '6px', color: 'var(--c-textBright)', fontSize: '1rem', fontStyle: 'italic' }}
                />
                {/* Bio textarea */}
                <textarea 
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{ width: '100%', height: '200px', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--c-goldBright)', borderRadius: '8px', color: 'var(--c-textBright)', fontSize: '1.1rem', lineHeight: '1.8', fontFamily: 'var(--f-body)', resize: 'vertical' }}
                />
              </div>
            ) : (
              entity.description ? (
                <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--c-textBright)', marginBottom: '2rem', textWrap: 'pretty', columns: '1', columnGap: '2rem' }} className="profile-markdown">
                  <ReactMarkdown
                    components={{
                      a: ({node, ...props}) => <Link to={props.href} style={{ color: 'var(--c-blue)', textDecoration: 'underline', textUnderlineOffset: '2px' }} className="lux-hover-lift" {...props} />,
                      p: ({node, ...props}) => <p style={{ margin: '0 0 1rem 0' }} {...props} />
                    }}
                  >
                    {entity.description}
                  </ReactMarkdown>
                </div>
              ) : (
                <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--c-dim)', marginBottom: '2rem', fontStyle: 'italic' }}>
                  No biography provided yet.
                </p>
              )
            )}

            {entity.url && (
              <a href={entity.url} target="_blank" rel="noreferrer" className="lux-hover-lift" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--c-blue)', padding: '0 0', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Globe size={16} /> Reference &rarr;
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area (Constrained) */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', width: '100%' }}>
      
        {/* Key Expertise / Topics */}
        {topTopics.length > 0 && (
          <div style={{ marginBottom: '4rem' }}>
            <h3 style={{ color: 'var(--c-textBright)', margin: '0 0 1.5rem 0', letterSpacing: '0.05em', fontSize: '1.4rem', fontFamily: 'var(--f-display)', borderBottom: '1px solid var(--c-ghost)', paddingBottom: '0.75rem' }}>
            Domain Expertise
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {topTopics.map(([topic, count]) => {
              const weight = count / maxTopicCount;
              return (
                <button 
                  key={topic} 
                  onClick={() => {
                    setMentionSearch(topic);
                    window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' });
                  }}
                  className="lux-hover-lift"
                  style={{ 
                    background: weight > 0.5 ? 'var(--c-blue)' : 'var(--c-bgSoft)',
                    color: weight > 0.5 ? 'var(--c-bg)' : 'var(--c-textBright)',
                    border: `1px solid ${weight > 0.5 ? 'var(--c-blue)' : 'var(--c-ghost)'}`,
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: weight > 0.5 ? 'bold' : 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  {topic}
                  <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* See Also — PMI-ranked co-occurring entities */}
      {entity.see_also_json && (() => {
        try {
          const seeAlso = JSON.parse(entity.see_also_json);
          if (!seeAlso || seeAlso.length === 0) return null;

          const generateSlugLocal = (name) => {
            if (!name) return '';
            const cleanName = name.replace(/,\s*[a-zA-Z\.]+$/, '');
            const parts = cleanName.trim().split(/\s+/);
            if (parts.length >= 2 && parts.length <= 4) {
              const last = parts.pop();
              return `${last}_${parts.join('_')}`;
            }
            return cleanName.replace(/\s+/g, '_');
          };

          return (
            <div style={{ marginBottom: '4rem' }}>
              <h3 style={{ color: 'var(--c-textBright)', margin: '0 0 1.5rem 0', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem', fontFamily: 'var(--f-display)' }}>
                <Network size={20} /> See Also
              </h3>
              <p style={{ color: 'var(--c-dim)', margin: '-0.5rem 0 1.5rem', fontSize: '0.9rem' }}>
                Entities that frequently appear alongside {entity.name} in the archive
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {seeAlso.map((sa, idx) => (
                  <Link
                    key={sa.name}
                    to={`/to/${generateSlugLocal(sa.name)}`}
                    className="lux-hover-lift lux-lens"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      animationDelay: `${idx * 0.08}s`,
                    }}
                  >
                    <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: 'var(--c-textBright)', fontFamily: 'var(--f-body)', fontWeight: 'bold' }}>
                      {sa.name}
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--c-dim)', marginTop: 'auto', borderTop: '1px solid var(--c-ghost)', paddingTop: '0.75rem' }}>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shared Docs: {sa.shared_docs}</span>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>PMI: {sa.score}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        } catch { return null; }
      })()}

      {/* Authored Works Section */}
      {authoredDocsList.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ color: 'var(--c-textBright)', margin: '0 0 1.5rem 0', letterSpacing: '0.05em', fontSize: '1.5rem', fontFamily: 'var(--f-display)', borderBottom: '1px solid var(--c-ghost)', paddingBottom: '0.5rem' }}>
            Authored Works
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {[...authoredDocsList].sort((a, b) => getDocDate(b) - getDocDate(a)).map(doc => {
              const meta = doc.metadata_json ? JSON.parse(doc.metadata_json) : {};
              const title = getCleanTitle(doc, meta);
              const date = meta.date || 'n.d.';
              const pub = meta.source_publication ? `${meta.source_publication} — ` : '';
              
              return (
                <Link
                  to={`/library/${generateFriendlySlug(doc, meta)}`}
                  key={`authored-${doc.id}`}
                  className="lux-hover-lift"
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '1rem',
                    background: 'var(--c-bgSoft)',
                    borderLeft: '3px solid var(--c-gold)',
                    padding: '1rem 1.5rem',
                    borderRadius: '0 8px 8px 0',
                    textDecoration: 'none',
                    color: 'var(--c-textBright)'
                  }}
                >
                  <span style={{ color: 'var(--c-dim)', fontFamily: 'var(--f-mono)', fontSize: '0.85rem', width: '80px', flexShrink: 0 }}>{date}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontStyle: pub ? 'italic' : 'normal', opacity: pub ? 0.8 : 1 }}>{pub}</span>
                    <strong style={{ fontFamily: 'var(--f-body)', fontSize: '1.05rem' }}>{title}</strong>
                  </div>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--c-blue)', letterSpacing: '0.1em', fontWeight: 'bold' }}>
                    {doc.type ? doc.type.replace('_', ' ') : 'Document'}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* General Archive References */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ color: 'var(--c-textBright)', margin: '0 0 0.5rem 0', letterSpacing: '0.05em', fontSize: '1.8rem', fontFamily: 'var(--f-display)' }}>
            Archive References
          </h3>
          <p style={{ margin: 0, color: 'var(--c-dim)' }}>{generalDocsList.length} documents connected to {entity.name}</p>
        </div>
      </div>
      
      {/* Document Type Summary Bar */}
      {generalDocsList.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {Object.entries(typeCounts).sort((a,b) => b[1] - a[1]).map(([type, count]) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className="lux-hover-lift"
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                border: `1px solid ${typeFilter === type ? 'var(--c-blue)' : 'var(--c-ghost)'}`,
                background: typeFilter === type ? 'var(--c-blue)' : 'var(--c-bgDeep)',
                color: typeFilter === type ? 'var(--c-bg)' : 'var(--c-textBright)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span style={{ textTransform: 'capitalize', fontWeight: typeFilter === type ? 'bold' : 'normal' }}>{type}</span>
              <span style={{ opacity: 0.6 }}>{count}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Sticky Full-Width Search & Sort Bar */}
      <div style={{ 
        position: 'sticky', 
        top: '80px', 
        zIndex: 10, 
        background: 'rgba(10, 10, 10, 0.85)', 
        backdropFilter: 'blur(10px)', 
        padding: '1rem 0', 
        marginBottom: '2rem',
        borderBottom: '1px solid var(--c-ghost)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text"
            placeholder="Search within documents..."
            value={mentionSearch}
            onChange={(e) => setMentionSearch(e.target.value)}
            style={{ width: '100%', padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid var(--c-ghost)', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', fontSize: '1rem' }}
          />
          {mentionSearch && <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-dim)', fontSize: '0.8rem' }}>Showing {searchedMentions.length} matches</div>}
        </div>
        <select 
          value={sortOption} 
          onChange={(e) => setSortOption(e.target.value)}
          style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--c-ghost)', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', fontSize: '0.9rem', cursor: 'pointer' }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="alpha">Alphabetical</option>
          <option value="type">By Type</option>
        </select>
      </div>

      <div style={{ marginBottom: '4rem' }}>
        {searchedMentions.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--c-dim)', background: 'var(--c-bgSoft)', borderRadius: '12px', border: '1px dashed var(--c-ghost)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ transform: 'scale(0.6)', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ThinkingSpirograph /></div>
            <p style={{ maxWidth: '400px', lineHeight: '1.6', fontSize: '1.1rem', margin: 0 }}>
              We're still indexing the archive. Check back soon — or help by tagging documents that mention this person.
            </p>
            <Link to="/library" className="lux-hover-lift" style={{ marginTop: '1rem', display: 'inline-block', background: 'var(--c-gold)', color: 'var(--c-bgDeep)', padding: '0.8rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
              Explore the Digital Library
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {paginatedMentions.map(doc => {
                const meta = doc.metadata_json ? JSON.parse(doc.metadata_json) : {};
                const title = getCleanTitle(doc, meta);
                const date = meta.date || 'n.d.';
                
                return (
                  <Link 
                    to={`/library/${generateFriendlySlug(doc, meta)}`} 
                    key={doc.id}
                    className="lux-hover-lift"
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      background: 'var(--c-bgCard)', 
                      border: '1px solid var(--c-ghost)', 
                      borderRadius: '12px', 
                      padding: '1.5rem', 
                      textDecoration: 'none',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ color: 'var(--c-blue)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 'bold', marginBottom: '1rem' }}>
                      {doc.type ? doc.type.replace('_', ' ') : 'Document'}
                    </div>
                    
                    <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: 'var(--c-textBright)', lineHeight: 1.4, fontFamily: 'var(--f-body)', fontWeight: 'bold' }}>
                      {title}
                    </h4>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--c-ghost)', paddingTop: '1rem' }}>
                      <span style={{ color: 'var(--c-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{date}</span>
                      <span style={{ color: 'var(--c-dim)' }}>
                        <ArrowLeft size={14} style={{ transform: 'rotate(135deg)' }} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="lux-hover-lift"
                  style={{ background: 'var(--c-bgDeep)', color: currentPage === 1 ? 'var(--c-dim)' : 'var(--c-textBright)', border: '1px solid var(--c-ghost)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: currentPage === 1 ? 'default' : 'pointer' }}
                >
                  &larr; Prev
                </button>
                <div style={{ color: 'var(--c-dim)', fontSize: '0.9rem', fontFamily: 'var(--f-condensed)' }}>
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="lux-hover-lift"
                  style={{ background: 'var(--c-bgDeep)', color: currentPage === totalPages ? 'var(--c-dim)' : 'var(--c-textBright)', border: '1px solid var(--c-ghost)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: currentPage === totalPages ? 'default' : 'pointer' }}
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Influence Network at bottom */}
      <div ref={graphRef} style={{ marginBottom: '4rem', background: 'var(--c-bgDeep)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--c-ghost)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
        <h3 style={{ color: 'var(--c-textBright)', margin: '0 0 1.5rem 0', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--f-display)' }}>
          <Network size={20} color="var(--c-goldBright)" /> Relational Graph
        </h3>
        <div style={{ height: '500px', width: '100%', background: 'var(--c-bgDeep)', borderRadius: '8px', border: '1px solid var(--c-ghost)', overflow: 'hidden' }}>
          {isGraphVisible ? (
            <EntityNetworkGraph focusEntityId={entity.id} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--c-dim)' }}>
              Loading graph...
            </div>
          )}
        </div>
      </div>
      
      </div>
      
      {/* Scroll to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="lux-hover-lift"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'var(--c-bgDeep)',
          color: 'var(--c-textBright)',
          border: '1px solid var(--c-ghost)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          opacity: showTopBtn ? 1 : 0,
          pointerEvents: showTopBtn ? 'auto' : 'none',
          transition: 'opacity 0.3s ease, transform 0.2s ease'
        }}
        aria-label="Scroll to top"
      >
        <ArrowLeft size={24} style={{ transform: 'rotate(90deg)' }} />
      </button>
    </div>
  );
}
