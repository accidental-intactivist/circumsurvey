import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, SkipBack, SkipForward, Play, Pause, 
  Layers, LayoutGrid, ArrowRight, FileText, ShieldAlert, 
  Film, Disc, BookOpen, Search, Calendar, Folder
} from 'lucide-react';
import PDFThumbnail from './PDFThumbnail';
import { safeParseJson } from '../utils/json';
import './CoverFlowTimeline.css';

/**
 * iPod Cover Flow Timeline Component
 * High-fidelity 3D album/folio cover carousel with reflections,
 * tactile iPod timeline scrubber, year milestones, and folio sleeves.
 */
export default function CoverFlowTimeline({ 
  documents = [], 
  getYear = (_d) => 9999, 
  getCleanTitle = (d) => d.title || 'Untitled', 
  getDocumentIcon = () => <FileText size={16} />,
  selectedSeries = null,
  _collection = null
}) {
  const navigate = useNavigate();
  const stageRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState('coverflow'); // 'coverflow' | 'grid'
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Filter and prepare documents
  const preparedDocs = useMemo(() => {
    let docs = documents.map(d => ({
      ...d,
      computedYear: getYear(d),
      cleanTitle: getCleanTitle(d)
    }));

    // Sort chronologically by year, then by title
    docs.sort((a, b) => {
      if (a.computedYear !== b.computedYear) {
        return a.computedYear - b.computedYear;
      }
      return a.cleanTitle.localeCompare(b.cleanTitle);
    });

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      docs = docs.filter(d => 
        d.cleanTitle.toLowerCase().includes(q) ||
        (d.computedYear !== 9999 && String(d.computedYear).includes(q)) ||
        (d.source_collection && d.source_collection.toLowerCase().includes(q))
      );
    }

    return docs;
  }, [documents, getYear, getCleanTitle, searchFilter]);

  // Keep active index within bounds
  useEffect(() => {
    if (activeIndex >= preparedDocs.length) {
      setActiveIndex(Math.max(0, preparedDocs.length - 1));
    }
  }, [preparedDocs.length, activeIndex]);

  // Extract year index map for instant scrubbing by year
  const { yearList, yearIndexMap } = useMemo(() => {
    const list = [];
    const indexMap = {};
    preparedDocs.forEach((doc, idx) => {
      const y = doc.computedYear;
      if (y !== 9999) {
        if (indexMap[y] === undefined) {
          indexMap[y] = idx;
          list.push(y);
        }
      }
    });
    return { yearList: list, yearIndexMap: indexMap };
  }, [preparedDocs]);

  // Auto-tour playback
  useEffect(() => {
    let timer;
    if (isPlaying && preparedDocs.length > 1) {
      timer = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % preparedDocs.length);
      }, 2200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, preparedDocs.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only react if stage or document is active and not typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveIndex(prev => Math.min(preparedDocs.length - 1, prev + 1));
      } else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActiveIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setActiveIndex(preparedDocs.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [preparedDocs.length]);

  // Mouse wheel horizontal scrubbing
  const wheelTimeout = useRef(null);
  const handleWheel = useCallback((e) => {
    if (viewMode !== 'coverflow') return;
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 15) return;

    if (!wheelTimeout.current) {
      if (delta > 0) {
        setActiveIndex(prev => Math.min(preparedDocs.length - 1, prev + 1));
      } else {
        setActiveIndex(prev => Math.max(0, prev - 1));
      }
      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = null;
      }, 100);
    }
  }, [preparedDocs.length, viewMode]);

  // Touch and mouse drag scrub
  const dragStartX = useRef(null);
  const handleTouchStart = (e) => {
    dragStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleTouchEnd = (e) => {
    if (dragStartX.current === null) return;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStartX.current - endX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActiveIndex(prev => Math.min(preparedDocs.length - 1, prev + 1));
      } else {
        setActiveIndex(prev => Math.max(0, prev - 1));
      }
    }
    dragStartX.current = null;
  };

  const handleCardClick = (index, doc) => {
    if (index === activeIndex) {
      // Click on centered card opens the reader
      navigate(`/library/${doc.id}`);
    } else {
      setActiveIndex(index);
    }
  };

  const activeDoc = preparedDocs[activeIndex] || null;

  return (
    <div className="ipod-coverflow-container">
      {/* Top Header Bar */}
      <div className="ipod-coverflow-header">
        <div className="ipod-coverflow-brand">
          <Layers size={16} />
          <span>Timeline Folio Cover Flow</span>
          {selectedSeries && (
            <span style={{ color: 'var(--c-dim)', fontWeight: 'normal', textTransform: 'none' }}>
              &bull; {selectedSeries}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Quick Search */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={13} style={{ position: 'absolute', left: '0.55rem', color: 'var(--c-dim)' }} />
            <input 
              type="text" 
              placeholder="Filter covers..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--c-ghost)',
                borderRadius: '4px',
                padding: '0.28rem 0.6rem 0.28rem 1.8rem',
                color: 'var(--c-textBright)',
                fontSize: '0.75rem',
                outline: 'none',
                width: '130px',
                fontFamily: 'var(--f-body, sans-serif)'
              }}
            />
          </div>

          {/* Mode Switcher: Cover Flow vs Grid */}
          <div className="ipod-coverflow-mode-switch">
            <button 
              className={`ipod-coverflow-mode-btn ${viewMode === 'coverflow' ? 'active' : ''}`}
              onClick={() => setViewMode('coverflow')}
              title="iPod Cover Flow View"
            >
              <Layers size={13} /> Cover Flow
            </button>
            <button 
              className={`ipod-coverflow-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Thumbnail Folio Grid View"
            >
              <LayoutGrid size={13} /> Folio Grid
            </button>
          </div>
        </div>
      </div>

      {preparedDocs.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--c-dim)' }}>
          No documents found matching the filter.
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Mode View */
        <div className="ipod-grid-view">
          {preparedDocs.map((doc, idx) => (
            <div 
              key={`${doc.id || 'doc'}-${idx}`} 
              className="ipod-grid-item"
              onClick={() => navigate(`/library/${doc.id}`)}
            >
              <FolioThumbnailCard 
                doc={doc} 
                getDocumentIcon={getDocumentIcon}
                selectedSeries={selectedSeries}
              />
            </div>
          ))}
        </div>
      ) : (
        /* 3D Cover Flow Stage */
        <>
          <div 
            ref={stageRef}
            className="ipod-coverflow-stage"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
          >
            {/* Ambient floor */}
            <div className="ipod-coverflow-floor" />

            {/* Left Chevron */}
            <button 
              className="ipod-nav-btn prev"
              onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
              disabled={activeIndex === 0}
              aria-label="Previous Cover"
            >
              <ChevronLeft size={26} />
            </button>

            {/* Right Chevron */}
            <button 
              className="ipod-nav-btn next"
              onClick={() => setActiveIndex(prev => Math.min(preparedDocs.length - 1, prev + 1))}
              disabled={activeIndex === preparedDocs.length - 1}
              aria-label="Next Cover"
            >
              <ChevronRight size={26} />
            </button>

            {/* 3D Perspective Track */}
            <div className="ipod-coverflow-track">
              {preparedDocs.map((doc, idx) => {
                const offset = idx - activeIndex;

                // Render window: only render cards within ±8 distance for 60fps physics
                if (Math.abs(offset) > 8) return null;

                let transform = '';
                let zIndex = 50;
                let opacity = 1;
                let filter = 'brightness(1)';

                if (offset === 0) {
                  transform = 'translateX(0px) translateZ(0px) rotateY(0deg) scale(1.06)';
                  zIndex = 100;
                  opacity = 1;
                  filter = 'brightness(1)';
                } else if (offset < 0) {
                  const x = offset * 66 - 130;
                  const z = Math.max(-420, offset * 50);
                  transform = `translateX(${x}px) translateZ(${z}px) rotateY(55deg) scale(0.85)`;
                  zIndex = 50 + offset;
                  opacity = Math.max(0.15, 1 + offset * 0.12);
                  filter = `brightness(${Math.max(0.4, 1 + offset * 0.08)})`;
                } else {
                  const x = offset * 66 + 130;
                  const z = -offset * 50;
                  transform = `translateX(${x}px) translateZ(${z}px) rotateY(-55deg) scale(0.85)`;
                  zIndex = 50 - offset;
                  opacity = Math.max(0.15, 1 - offset * 0.12);
                  filter = `brightness(${Math.max(0.4, 1 - offset * 0.08)})`;
                }

                return (
                  <div
                    key={`${doc.id || 'doc'}-${idx}`}
                    className={`ipod-coverflow-card ${offset === 0 ? 'active' : ''}`}
                    style={{
                      transform,
                      zIndex,
                      opacity,
                      filter
                    }}
                    onClick={() => handleCardClick(idx, doc)}
                    title={`${doc.cleanTitle} (${doc.computedYear !== 9999 ? doc.computedYear : 'Undated'})`}
                  >
                    <FolioThumbnailCard 
                      doc={doc} 
                      getDocumentIcon={getDocumentIcon}
                      selectedSeries={selectedSeries}
                    />

                    {/* Secondary Reflection for Browsers lacking -webkit-box-reflect */}
                    <div className="ipod-cover-reflection">
                      <FolioThumbnailCard 
                        doc={doc} 
                        getDocumentIcon={getDocumentIcon}
                        selectedSeries={selectedSeries}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* iPod Scrubber Track & Year Milestones */}
          <div className="ipod-scrubber-bar">
            <div className="ipod-range-wrapper">
              <input 
                type="range"
                min={0}
                max={preparedDocs.length - 1}
                value={activeIndex}
                onChange={(e) => setActiveIndex(Number(e.target.value))}
                className="ipod-range-slider"
                aria-label="Document Scrubber Slider"
              />

              {/* Year Milestones along the timeline */}
              {yearList.length > 0 && (
                <div className="ipod-years-track">
                  {yearList.map(year => {
                    const firstIdx = yearIndexMap[year];
                    const isActive = activeDoc && activeDoc.computedYear === year;
                    return (
                      <button
                        key={year}
                        className={`ipod-year-chip ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveIndex(firstIdx)}
                        title={`Jump to year ${year}`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Transport Controls Row */}
            <div className="ipod-transport-row">
              <button 
                className="ipod-ctrl-btn" 
                onClick={() => setActiveIndex(prev => Math.max(0, prev - 5))}
                title="Skip back 5 documents"
              >
                <SkipBack size={15} />
              </button>

              <button 
                className="ipod-ctrl-btn" 
                onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                title="Previous Document (Left Arrow)"
              >
                <ChevronLeft size={18} />
              </button>

              <button 
                className="ipod-ctrl-btn play-btn" 
                onClick={() => setIsPlaying(p => !p)}
                title={isPlaying ? "Pause Auto-Tour" : "Start Auto-Tour Mode"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
              </button>

              <button 
                className="ipod-ctrl-btn" 
                onClick={() => setActiveIndex(prev => Math.min(preparedDocs.length - 1, prev + 1))}
                title="Next Document (Right Arrow)"
              >
                <ChevronRight size={18} />
              </button>

              <button 
                className="ipod-ctrl-btn" 
                onClick={() => setActiveIndex(prev => Math.min(preparedDocs.length - 1, prev + 5))}
                title="Skip forward 5 documents"
              >
                <SkipForward size={15} />
              </button>
            </div>
          </div>

          {/* Active Item Showcase Panel */}
          {activeDoc && (
            <div className="ipod-showcase-panel">
              <div className="ipod-showcase-info">
                <div className="ipod-showcase-meta">
                  <span className="ipod-showcase-counter">
                    {activeIndex + 1} / {preparedDocs.length}
                  </span>
                  <span style={{ color: 'var(--c-goldBright)', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                    <Calendar size={13} />
                    {activeDoc.computedYear !== 9999 ? activeDoc.computedYear : 'Undated'}
                  </span>
                  {activeDoc.metadata_json && (
                    <span className="ipod-showcase-location">
                      <Folder size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                      {safeParseJson(activeDoc.metadata_json)?.original_location || 'Archive Collection'}
                    </span>
                  )}
                </div>

                <h4 className="ipod-showcase-title">
                  {activeDoc.cleanTitle}
                </h4>
              </div>

              <div className="ipod-showcase-actions">
                <Link 
                  to={`/library/${activeDoc.id}`}
                  className="ipod-open-doc-btn"
                >
                  <span>Open in Reader</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * High-Fidelity Folio Cover Art Thumbnail
 * Formats realistic archival sleeves tailored to the genre of the document.
 */
function FolioThumbnailCard({ doc, getDocumentIcon, selectedSeries }) {
  const meta = safeParseJson(doc.metadata_json) || {};
  const isPdf = doc.url && doc.url.toLowerCase().endsWith('.pdf');
  const isImage = doc.url && doc.url.match(/\.(jpe?g|png|webp|gif)$/i);

  // Genre classification
  const fullContext = `${selectedSeries || ''} ${doc.source_collection || ''} ${doc.cleanTitle} ${meta.category || ''} ${meta.subject || ''}`.toLowerCase();

  let genre = 'archival';
  let badgeLabel = 'Archival Folio';
  let badgeIcon = <FileText size={11} />;

  if (fullContext.includes('mkultra') || fullContext.includes('foia') || fullContext.includes('cia') || fullContext.includes('classified')) {
    genre = 'foia';
    badgeLabel = 'FOIA Record';
    badgeIcon = <ShieldAlert size={11} />;
  } else if (fullContext.includes('pediatrics') || fullContext.includes('aap') || fullContext.includes('medical') || fullContext.includes('journal') || fullContext.includes('morbidity')) {
    genre = 'medical';
    badgeLabel = 'Medical Policy';
    badgeIcon = <BookOpen size={11} />;
  } else if (fullContext.includes('video') || fullContext.includes('audio') || fullContext.includes('song') || fullContext.includes('broadcast') || fullContext.includes('opera') || fullContext.includes('mp3') || fullContext.includes('mp4')) {
    genre = 'media';
    badgeLabel = 'Media Archive';
    badgeIcon = fullContext.includes('video') ? <Film size={11} /> : <Disc size={11} />;
  } else if (fullContext.includes('noharmm') || fullContext.includes('whose body') || fullContext.includes('galdef') || fullContext.includes('survey') || fullContext.includes('harm')) {
    genre = 'activism';
    badgeLabel = 'Human Rights';
    badgeIcon = <BookOpen size={11} />;
  }

  const yearDisplay = doc.computedYear !== 9999 ? doc.computedYear : (meta.date || 'Record');
  const boxLocation = meta.original_location ? meta.original_location.split('/')[0].trim() : 'MS 1205';

  return (
    <div className={`folio-cover folio-theme-${genre}`}>
      {/* If PDF preview is available, render it cleanly with watermark overlay */}
      {isPdf ? (
        <div className="folio-pdf-preview">
          <PDFThumbnail url={doc.url} />
        </div>
      ) : isImage ? (
        <div className="folio-pdf-preview" style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={doc.url} alt={doc.cleanTitle} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
        </div>
      ) : null}

      {/* Folio Header */}
      <div className="folio-header" style={{ position: 'relative', zIndex: 7 }}>
        <div className="folio-badge">
          {badgeIcon}
          <span>{badgeLabel}</span>
        </div>
        <div className="folio-year-stamp">
          {yearDisplay}
        </div>
      </div>

      {/* Folio Center Stamp / Graphic */}
      <div className="folio-body" style={{ position: 'relative', zIndex: 7 }}>
        {genre === 'foia' && (
          <div className="folio-rubber-stamp">
            DECLASSIFIED
          </div>
        )}

        <div className="folio-watermark">
          {getDocumentIcon(doc.type)}
        </div>

        <div className="folio-title" title={doc.cleanTitle}>
          {doc.cleanTitle}
        </div>
      </div>

      {/* Folio Footer Bar */}
      <div className="folio-footer" style={{ position: 'relative', zIndex: 7 }}>
        <span>{boxLocation}</span>
        <span style={{ textTransform: 'capitalize' }}>
          {(doc.type || 'Document').replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}
