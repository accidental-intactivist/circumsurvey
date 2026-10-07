import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Search, Star, BookOpen, ChevronDown, LayoutGrid, List, Filter, X } from 'lucide-react';
import './AdminArchivePage.css';

const ROLE_CONFIG = {
  champion: {
    label: 'Champion',
    icon: '✦',
    cardClass: 'entity-card-champion',
    badgeClass: 'alignment-badge alignment-badge-champion',
    accentColor: 'var(--c-goldBright)',
  },
  critic: {
    label: 'Critic',
    icon: '⚡',
    cardClass: 'entity-card-critic',
    badgeClass: 'alignment-badge alignment-badge-critic',
    accentColor: 'var(--c-ltBlue)',
  },
  notable: {
    label: 'Notable',
    icon: '◆',
    cardClass: 'entity-card-notable',
    badgeClass: 'alignment-badge alignment-badge-notable',
    accentColor: 'var(--c-muted)',
  },
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function EntityDirectory() {
  const [entities, setEntities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [activeLetter, setActiveLetter] = useState(null);
  const sectionRefs = useRef({});
  const searchInputRef = useRef(null);

// Global cache so it only ever fetches once per browser session
let _cachedEntitiesPromise = null;
let _cachedDocsPromise = null;

  useEffect(() => {
    // 1. Fetch Entities Fast (Unblocks UI immediately)
    if (!_cachedEntitiesPromise) {
      _cachedEntitiesPromise = fetch('/api/entities?fields=slim').then(r => r.ok ? r.json() : []);
    }
    
    _cachedEntitiesPromise.then(ents => {
      setEntities(ents);
      setLoading(false); // Unblock UI!
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });

    // 2. Fetch Documents Slowly (Updates mention counts asynchronously)
    if (!_cachedDocsPromise) {
      _cachedDocsPromise = fetch(
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? '/api_mock.json'
          : '/api/cms'
      ).then(r => {
        if (!r.ok) return [];
        return r.json().then(d => d.data ? d.data : Array.isArray(d) ? d : []);
      });
    }

    _cachedDocsPromise.then(docs => setDocuments(docs)).catch(console.error);
  }, []);

  // Count archive mentions per entity (Optimized O(D + E) lookup)
  const mentionCounts = useMemo(() => {
    const counts = {};
    if (!documents.length || !entities.length) return counts;

    // 1. Build a frequency map of all mentioned names across all documents
    const frequencyMap = {};
    
    documents.forEach(doc => {
      if (!doc.metadata_json) return;
      try {
        const meta = JSON.parse(doc.metadata_json);
        
        // Use a Set to avoid double-counting the same entity in a single document
        const docNames = new Set();
        
        const addNames = (arr) => {
          if (!Array.isArray(arr)) return;
          arr.forEach(name => {
            if (name) docNames.add(name.toLowerCase());
          });
        };

        addNames(meta.organizations);
        addNames(meta.gemini_extracted_metadata?.organizations);
        addNames(meta.key_people);
        addNames(meta.gemini_extracted_metadata?.authors);
        
        docNames.forEach(lower => {
          frequencyMap[lower] = (frequencyMap[lower] || 0) + 1;
        });
        
      } catch (err) { /* skip malformed metadata */ }
    });

    // 2. Map entity names to their frequencies
    entities.forEach(e => {
      if (!e.name) {
        counts[e.id] = 0;
        return;
      }
      const lower = e.name.toLowerCase();
      counts[e.id] = frequencyMap[lower] || 0;
    });

    return counts;
  }, [entities, documents]);

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

  // Filter entities
  const getNormalizedRole = (role) => {
    if (!role || String(role).toUpperCase() === 'NULL' || String(role) === 'None') return 'notable';
    return role;
  };

  const filteredEntities = entities.filter(e => {
    if (search) {
      const q = search.toLowerCase();
      if (!e.name?.toLowerCase().includes(q) &&
          !e.description?.toLowerCase().includes(q) &&
          !e.tagline?.toLowerCase().includes(q)) return false;
    }
    const role = getNormalizedRole(e.role);
    if (roleFilter !== 'all' && role !== roleFilter) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    return true;
  });

  // Featured entities
  const featured = entities.filter(e => e.featured);

  // Group filtered entities alphabetically
  const groupedEntities = useMemo(() => {
    const sorted = [...filteredEntities].sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      return aName.localeCompare(bName);
    });
    const groups = {};
    sorted.forEach(e => {
      const firstChar = (e.name || '?')[0].toUpperCase();
      const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(e);
    });
    return groups;
  }, [filteredEntities]);

  // Which letters have entries
  const availableLetters = useMemo(() => {
    const set = new Set(Object.keys(groupedEntities));
    return set;
  }, [groupedEntities]);

  // Stats
  const stats = useMemo(() => {
    const champions = entities.filter(e => getNormalizedRole(e.role) === 'champion').length;
    const critics = entities.filter(e => getNormalizedRole(e.role) === 'critic').length;
    return {
      total: entities.length,
      champions,
      critics,
      notable: entities.length - champions - critics,
      people: entities.filter(e => e.type === 'person').length,
      orgs: entities.filter(e => e.type === 'organization').length,
    };
  }, [entities]);

  const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.notable;

  const scrollToLetter = useCallback((letter) => {
    setActiveLetter(letter);
    // Clear search to show all
    if (search) setSearch('');
    if (roleFilter !== 'all') setRoleFilter('all');
    if (typeFilter !== 'all') setTypeFilter('all');

    // Give time for state to settle, then scroll
    requestAnimationFrame(() => {
      const el = sectionRefs.current[letter];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, [search, roleFilter, typeFilter]);

  // Keyboard shortcut: focus search on /
  useEffect(() => {
    const onKeydown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, []);

  const hasActiveFilters = search || roleFilter !== 'all' || typeFilter !== 'all';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: 'var(--c-goldBright)', marginBottom: '1rem', fontFamily: 'var(--f-display)' }}>
            Assembling the Record...
          </div>
          <div style={{ color: 'var(--c-dim)', fontSize: '0.9rem' }}>Loading entities from the archive</div>
        </div>
      </div>
    );
  }

  return (
    <div className="lux-glide-in" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>

      {/* ── Cinematic Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(232, 184, 64, 0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--c-goldBright)', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 700, marginBottom: '1.5rem' }}>
            The Intactivism Archive
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontFamily: 'var(--f-display)', letterSpacing: '-0.03em', color: 'var(--c-textBright)', margin: '0 0 1.5rem 0', lineHeight: 1.1 }}>
            Key Figures {'&'} Organizations
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--c-dim)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.7, textWrap: 'pretty' }}>
            An encyclopedic directory of the individuals and organizations shaping the discourse around bodily autonomy — harvested from the living archive.
          </p>
        </div>
      </div>

      {/* ── Statistics Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem', padding: '1.25rem', background: 'var(--c-bgSoft)', borderRadius: '12px', border: '1px solid var(--c-ghost)' }}>
        {[
          { label: 'Total Entities', value: stats.total, color: 'var(--c-textBright)' },
          { label: 'Champions', value: stats.champions, color: 'var(--c-goldBright)' },
          { label: 'Critics', value: stats.critics, color: 'var(--c-ltBlue)' },
          { label: 'Notable', value: stats.notable, color: 'var(--c-muted)' },
          { label: 'People', value: stats.people, color: 'var(--c-text)' },
          { label: 'Organizations', value: stats.orgs, color: 'var(--c-text)' },
        ].map((s, i) => (
          <div key={s.label} className="stat-counter" style={{ textAlign: 'center', animationDelay: `${i * 0.1}s`, minWidth: '80px' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, fontFamily: 'var(--f-display)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.35rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          A-Z JUMPLIST — Sticky alphabet bar (academic directory style)
          ══════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--c-bg)', 
        borderBottom: '1px solid var(--c-ghost)',
        padding: '0.6rem 0',
        marginBottom: '1.5rem',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.15rem',
          justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {ALPHABET.map(letter => {
            const hasEntries = availableLetters.has(letter);
            const isActive = activeLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => hasEntries && scrollToLetter(letter)}
                disabled={!hasEntries}
                style={{
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 800 : 600,
                  fontFamily: 'var(--f-condensed, var(--f-body))',
                  letterSpacing: '0.02em',
                  cursor: hasEntries ? 'pointer' : 'default',
                  color: isActive ? 'var(--c-bgDeep)' : hasEntries ? 'var(--c-textBright)' : 'var(--c-ghost)',
                  background: isActive ? 'var(--c-goldBright)' : 'transparent',
                  transition: 'all 0.2s ease',
                  opacity: hasEntries ? 1 : 0.35,
                }}
                onMouseEnter={e => {
                  if (hasEntries && !isActive) {
                    e.currentTarget.style.background = 'rgba(212,160,48,0.15)';
                    e.currentTarget.style.color = 'var(--c-goldBright)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = hasEntries ? 'var(--c-textBright)' : 'var(--c-ghost)';
                  }
                }}
                aria-label={`Jump to letter ${letter}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Control Bar: Search + Filters + View Toggle ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-dim)' }} />
          <input
            ref={searchInputRef}
            id="entity-search"
            type="text"
            placeholder="Search directory... ( / )"
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveLetter(null); }}
            style={{
              width: '100%', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)',
              border: '1px solid var(--c-ghost)', padding: '0.7rem 1rem 0.7rem 2.5rem',
              borderRadius: '8px', fontSize: '0.95rem',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--c-goldBright)'}
            onBlur={e => e.target.style.borderColor = 'var(--c-ghost)'}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-dim)', padding: '2px' }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Role Filter */}
        <div style={{ position: 'relative', flex: '0 0 auto' }}>
          <select
            id="entity-role-filter"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ appearance: 'none', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', padding: '0.7rem 2.2rem 0.7rem 1rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            <option value="all">All Alignments</option>
            <option value="champion">✦ Champions</option>
            <option value="critic">⚡ Critics</option>
            <option value="notable">◆ Notable</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-dim)', pointerEvents: 'none' }} />
        </div>

        {/* Type Filter */}
        <div style={{ position: 'relative', flex: '0 0 auto' }}>
          <select
            id="entity-type-filter"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ appearance: 'none', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', padding: '0.7rem 2.2rem 0.7rem 1rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            <option value="all">All Types</option>
            <option value="person">👤 Key Figures</option>
            <option value="organization">🏛 Organizations</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-dim)', pointerEvents: 'none' }} />
        </div>

        {/* View Toggle */}
        <div style={{
          display: 'flex', background: 'var(--c-bgDeep)', border: '1px solid var(--c-ghost)',
          borderRadius: '8px', overflow: 'hidden', flexShrink: 0,
        }}>
          <button
            onClick={() => setViewMode('list')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 38, height: 38, border: 'none', cursor: 'pointer',
              background: viewMode === 'list' ? 'var(--c-goldBright)' : 'transparent',
              color: viewMode === 'list' ? 'var(--c-bgDeep)' : 'var(--c-dim)',
              transition: 'all 0.2s',
            }}
            aria-label="List view"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 38, height: 38, border: 'none', cursor: 'pointer',
              background: viewMode === 'grid' ? 'var(--c-goldBright)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--c-bgDeep)' : 'var(--c-dim)',
              transition: 'all 0.2s',
            }}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={() => { setSearch(''); setRoleFilter('all'); setTypeFilter('all'); setActiveLetter(null); }}
            style={{
              background: 'transparent', border: '1px solid var(--c-ghost)',
              color: 'var(--c-dim)', padding: '0.5rem 0.9rem', borderRadius: '8px',
              fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-goldBright)'; e.currentTarget.style.color = 'var(--c-goldBright)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-ghost)'; e.currentTarget.style.color = 'var(--c-dim)'; }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* ── Results Summary ── */}
      <div style={{ fontSize: '0.8rem', color: 'var(--c-dim)', marginBottom: '1.5rem', fontFamily: 'var(--f-condensed, var(--f-body))', letterSpacing: '0.05em' }}>
        {filteredEntities.length === entities.length
          ? `Showing all ${entities.length} entities`
          : `${filteredEntities.length} of ${entities.length} entities`
        }
        {search && <span> matching "<strong style={{ color: 'var(--c-goldBright)' }}>{search}</strong>"</span>}
      </div>

      {/* ── Featured Spotlight (only when no filters active) ── */}
      {!hasActiveFilters && featured.length > 0 && (
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Star size={18} style={{ color: 'var(--c-goldBright)' }} />
            <h2 style={{ margin: 0, fontSize: '1rem', color: 'var(--c-goldBright)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--f-condensed, var(--f-body))' }}>
              Featured Profiles
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`, gap: '1.25rem' }}>
            {featured.map((e) => {
              const rc = getRoleConfig(e.role);
              return (
                <Link
                  key={e.id}
                  to={`/to/${generateSlug(e.name)}`}
                  className="spotlight-card"
                  style={{
                    backgroundImage: e.image_url ? `url(${e.image_url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: e.image_url ? undefined : 'var(--c-bgDeep)',
                    border: `1px solid ${rc.accentColor}`,
                  }}
                >
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <span className={rc.badgeClass} style={{ marginBottom: '0.75rem' }}>
                      {rc.icon} {rc.label}
                    </span>
                    <h3 style={{ margin: '0.75rem 0 0.25rem', fontSize: '1.6rem', fontFamily: 'var(--f-display)', color: '#fff', lineHeight: 1.2 }}>
                      {e.name}
                    </h3>
                    {e.tagline && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {e.tagline}
                      </p>
                    )}
                    {mentionCounts[e.id] > 0 && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                        <BookOpen size={12} /> {mentionCounts[e.id]} archive references
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          DIRECTORY BODY — Grouped by Letter
          ══════════════════════════════════════════════════════════ */}
      {filteredEntities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--c-dim)', background: 'var(--c-bgSoft)', borderRadius: '12px', border: '1px dashed var(--c-ghost)' }}>
          {search ? `No entities match "${search}"` : 'No entities found.'}
        </div>
      ) : (
        <div>
          {Object.entries(groupedEntities).sort(([a], [b]) => a.localeCompare(b)).map(([letter, entries]) => (
            <div
              key={letter}
              ref={el => { sectionRefs.current[letter] = el; }}
              style={{ marginBottom: '2.5rem', scrollMarginTop: '72px' }}
            >
              {/* Letter header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                marginBottom: '1rem', paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--c-ghost)',
              }}>
                <span style={{
                  fontSize: '2rem', fontWeight: 800,
                  fontFamily: 'var(--f-display)',
                  color: 'var(--c-goldBright)',
                  lineHeight: 1,
                  minWidth: '2.5rem',
                }}>
                  {letter}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--f-condensed, var(--f-body))' }}>
                  {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              {/* Entries — List or Grid */}
              {viewMode === 'list' ? (
                /* ── COMPACT LIST VIEW (Stanford Profiles style) ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  {entries.map((e, i) => {
                    const rc = getRoleConfig(e.role);
                    const mentions = mentionCounts[e.id] || 0;
                    return (
                      <Link
                        key={e.id}
                        to={`/to/${generateSlug(e.name)}`}
                        className="entity-stagger-in"
                        style={{
                          animationDelay: `${Math.min(i, 20) * 0.03}s`,
                          display: 'flex', alignItems: 'center', gap: '1rem',
                          padding: '0.85rem 1rem',
                          background: 'var(--c-bgCard, var(--c-bgSoft))',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          borderLeft: `3px solid ${rc.accentColor}`,
                        }}
                        onMouseEnter={ev => {
                          ev.currentTarget.style.background = 'rgba(212,160,48,0.04)';
                          ev.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={ev => {
                          ev.currentTarget.style.background = 'var(--c-bgCard, var(--c-bgSoft))';
                          ev.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: 40, height: 40, flexShrink: 0,
                          borderRadius: e.type === 'person' ? '50%' : '8px',
                          background: 'var(--c-bgDeep)',
                          border: `1.5px solid ${rc.accentColor}`,
                          overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {e.image_url ? (
                            <img src={e.image_url} alt={e.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '1rem', color: rc.accentColor, fontFamily: 'var(--f-display)', opacity: 0.6 }}>
                              {e.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Name & Tagline */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--c-textBright)', fontFamily: 'var(--f-display)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {e.name}
                            </span>
                            {e.featured && <Star size={12} fill="var(--c-goldBright)" style={{ color: 'var(--c-goldBright)', flexShrink: 0 }} />}
                          </div>
                          {e.tagline && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--c-dim)', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {e.tagline}
                            </div>
                          )}
                        </div>

                        {/* Badges */}
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0, flexWrap: 'nowrap' }}>
                          <span className={rc.badgeClass} style={{ fontSize: '0.6rem', padding: '0.15rem 0.5rem' }}>
                            {rc.icon} {rc.label}
                          </span>
                          <span style={{
                            fontSize: '0.6rem', color: 'var(--c-dim)', padding: '0.15rem 0.4rem',
                            borderRadius: '30px', border: '1px solid var(--c-ghost)',
                            textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
                            lineHeight: 1, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap',
                          }}>
                            {e.type === 'person' ? <><Users size={9} /> Figure</> : <><Building2 size={9} /> Org</>}
                          </span>
                        </div>

                        {/* Mention count */}
                        {mentions > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--c-dim)', flexShrink: 0, minWidth: '60px', justifyContent: 'flex-end' }}>
                            <BookOpen size={11} /> {mentions}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                /* ── GRID VIEW (Original card layout) ── */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {entries.map((e, i) => {
                    const rc = getRoleConfig(e.role);
                    const mentions = mentionCounts[e.id] || 0;
                    return (
                      <Link
                        key={e.id}
                        to={`/to/${generateSlug(e.name)}`}
                        className={`lux-hover-lift entity-stagger-in ${rc.cardClass}`}
                        style={{
                          animationDelay: `${Math.min(i, 20) * 0.04}s`,
                          display: 'flex', gap: '1rem', padding: '1.5rem',
                          borderRadius: '12px', textDecoration: 'none',
                          alignItems: 'flex-start', position: 'relative', overflow: 'hidden',
                        }}
                      >
                        {e.featured && <Star size={14} fill="var(--c-goldBright)" style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--c-goldBright)' }} />}
                        <div style={{
                          width: 64, height: 64, flexShrink: 0,
                          borderRadius: e.type === 'person' ? '50%' : '10px',
                          background: 'var(--c-bgDeep)',
                          border: `2px solid ${rc.accentColor}`,
                          overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {e.image_url ? (
                            <img src={e.image_url} alt={e.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '1.5rem', color: rc.accentColor, fontFamily: 'var(--f-display)', opacity: 0.6 }}>
                              {e.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--c-textBright)', lineHeight: 1.3, fontFamily: 'var(--f-display)' }}>
                              {e.name}
                            </h3>
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            <span className={rc.badgeClass}>{rc.icon} {rc.label}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--c-dim)', padding: '0.2rem 0.5rem', borderRadius: '30px', border: '1px solid var(--c-ghost)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, lineHeight: 1, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              {e.type === 'person' ? <><Users size={10} /> Figure</> : <><Building2 size={10} /> Org</>}
                            </span>
                          </div>
                          {e.tagline ? (
                            <p style={{ margin: '0 0 0.5rem', color: 'var(--c-text)', fontSize: '0.88rem', fontStyle: 'italic', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {e.tagline}
                            </p>
                          ) : e.description ? (
                            <p style={{ margin: '0 0 0.5rem', color: 'var(--c-dim)', fontSize: '0.85rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {e.description}
                            </p>
                          ) : null}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--c-dim)', flexWrap: 'wrap' }}>
                            {mentions > 0 && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <BookOpen size={12} /> {mentions} document{mentions !== 1 ? 's' : ''}
                              </span>
                            )}
                            {e.see_also_json && (() => {
                              try {
                                const sa = JSON.parse(e.see_also_json);
                                if (sa && sa.length > 0) return (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: 0.7 }}>
                                    ↔ linked to {sa.length} other{sa.length !== 1 ? 's' : ''}
                                  </span>
                                );
                              } catch { /* skip */ }
                              return null;
                            })()}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Back to top ── */}
      <div style={{ textAlign: 'center', margin: '3rem 0 1rem' }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: 'transparent', border: '1px solid var(--c-ghost)',
            color: 'var(--c-dim)', padding: '0.5rem 1.5rem', borderRadius: '8px',
            fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--f-condensed, var(--f-body))',
            letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-goldBright)'; e.currentTarget.style.color = 'var(--c-goldBright)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-ghost)'; e.currentTarget.style.color = 'var(--c-dim)'; }}
        >
          ↑ Back to Top
        </button>
      </div>
    </div>
  );
}
