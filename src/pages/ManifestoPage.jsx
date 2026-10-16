import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  FileText, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Share2, 
  Search, 
  Layers, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import LoomChoreography from '../components/GuidedTour/LoomChoreography';
import { FONT } from '../styles/tokens';
import manifestoData from '../data/manifesto_chapters.json';
import ArchiveEvidenceCard from '../components/manifesto/ArchiveEvidenceCard';
import ChapterNavRail from '../components/manifesto/ChapterNavRail';
import ManifestoPortal from '../components/manifesto/ManifestoPortal';
import AutoEntityLinker from '../components/AutoEntityLinker';
import { MANIFESTO_TABLES } from '../data/manifesto_tables';
import { ManifestoTable, default as ManifestoTablesGallery } from '../components/manifesto/ManifestoTables';
import ManifestoInfographicsLab, { 
  SensationRadarInfographic, 
  ShiftingSandsTimelineInfographic, 
  GlobalMedicalConsensusInfographic, 
  ComplicationsTelemetryInfographic 
} from '../components/manifesto/ManifestoInfographics';
import ManifestoTableOfContents from '../components/manifesto/ManifestoTableOfContents';
import HistologicalMicrographViewer from '../components/manifesto/HistologicalMicrographViewer';
import './ManifestoPage.css';

export default function ManifestoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const chapterParam = searchParams.get('chapter');
  const readParam = searchParams.get('read');
  const viewParam = searchParams.get('view');
  const tableParam = searchParams.get('table');

  const chapters = manifestoData.chapters || [];
  const compendium = manifestoData.resourcesCompendium;

  // Determine initial viewMode and chapter from URL
  const initialChapterIndex = (() => {
    if (!chapterParam) return 0;
    const num = parseInt(chapterParam, 10);
    if (!isNaN(num) && num >= 1 && num <= 10) return num - 1;
    const foundIdx = chapters.findIndex(c => c.id === chapterParam || c.roman.toLowerCase() === chapterParam.toLowerCase());
    return foundIdx >= 0 ? foundIdx : 0;
  })();

  const initialCompendium = chapterParam === '11' || chapterParam === 'compendium' || chapterParam === 'xi';
  const initialViewMode = viewParam === 'portal' ? 'portal' : 'reader';
  const initialReadingMode = tableParam ? 'tables' : (searchParams.get('tab') || 'walkthrough');

  const [viewMode, setViewMode] = useState(initialViewMode); // 'portal' | 'reader'
  const [currentChapterIndex, setCurrentChapterIndex] = useState(initialChapterIndex);
  const [readingMode, setReadingMode] = useState(initialReadingMode); // 'walkthrough' | 'dossier' | 'tables' | 'infographics'
  const [selectedTableId, setSelectedTableId] = useState(tableParam || null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCompendiumOpen, setIsCompendiumOpen] = useState(initialCompendium);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const containerRef = useRef(null);

  const currentChapter = chapters[currentChapterIndex] || chapters[0];

  useEffect(() => {
    document.title = "The Accidental Intactivist's Manifesto";
  }, []);

  // Sync state if searchParams change externally
  useEffect(() => {
    if (chapterParam) {
      if (chapterParam === '11' || chapterParam === 'compendium' || chapterParam === 'xi') {
        setIsCompendiumOpen(true);
        setViewMode('reader');
      } else {
        const num = parseInt(chapterParam, 10);
        if (!isNaN(num) && num >= 1 && num <= 10) {
          setCurrentChapterIndex(num - 1);
          setIsCompendiumOpen(false);
          setViewMode('reader');
        }
      }
    }
  }, [chapterParam]);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectChapter = (index) => {
    setIsCompendiumOpen(false);
    setCurrentChapterIndex(index);
    setViewMode('reader');
    setSearchParams({ chapter: (index + 1).toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCompendium = () => {
    setIsCompendiumOpen(true);
    setViewMode('reader');
    setSearchParams({ chapter: 'compendium' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPortal = () => {
    setViewMode('portal');
    setIsCompendiumOpen(false);
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Filter sections by search query if active
  const filteredSections = currentChapter.sections.filter(sec => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const inHeading = sec.heading.toLowerCase().includes(q);
    const inParas = sec.paragraphs.some(p => p.toLowerCase().includes(q));
    return inHeading || inParas;
  });

  return (
    <div 
      ref={containerRef}
      className="manifesto-root"
      style={{ fontFamily: FONT.body }}
    >
      {/* Background Underloom Visualization */}
      <div 
        className="no-print"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.16,
          overflow: 'hidden'
        }}
      >
        <LoomChoreography 
          isInline={true} 
          forceFormation="orbital" 
          opacity={1} 
          themeColor="manifesto" 
        />
      </div>

      {viewMode === 'portal' ? (
        <ManifestoPortal 
          onSelectChapter={handleSelectChapter}
          onOpenCompendium={handleOpenCompendium}
          onStartReading={() => handleSelectChapter(0)}
        />
      ) : (
        <>
          {/* Sticky Navigation Rail */}
          <ChapterNavRail 
            chapters={chapters}
            currentChapterIndex={currentChapterIndex}
            onSelectChapter={handleSelectChapter}
            readingMode={readingMode}
            setReadingMode={setReadingMode}
            scrollProgress={scrollProgress}
            onOpenCompendium={handleOpenCompendium}
            isCompendiumOpen={isCompendiumOpen}
            onBackToPortal={handleBackToPortal}
          />

          {/* Main Content Body: Two-Column Responsive Layout */}
          <div className="manifesto-guide-layout">
            
            {/* Sticky Table of Contents & Newcomer Lens Drawer on Left */}
            <aside className="manifesto-toc-sidebar">
              <ManifestoTableOfContents 
                chapters={chapters}
                currentChapterIndex={currentChapterIndex}
                onSelectChapter={handleSelectChapter}
                onOpenCompendium={handleOpenCompendium}
                isCompendiumOpen={isCompendiumOpen}
                onSelectTable={(tblId) => {
                  setSelectedTableId(tblId);
                  setReadingMode('tables');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectInfographic={(infoId) => {
                  setReadingMode('infographics');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                activeViewMode={readingMode}
                setActiveViewMode={setReadingMode}
              />
            </aside>

            {/* Main Content Stage on Right */}
            <main className="manifesto-main-stage">
              {readingMode === 'tables' ? (
                <ManifestoTablesGallery activeTableId={selectedTableId} />
              ) : readingMode === 'infographics' ? (
                <ManifestoInfographicsLab />
              ) : isCompendiumOpen ? (
            <div>
              {/* Compendium Hero Header */}
              <header className="manifesto-hero-card">
                <div 
                  className="manifesto-hero-ambient-glow"
                  style={{ background: '#d4a030' }}
                />

                <div className="manifesto-hero-meta-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="manifesto-badge-pill">
                      <Layers size={13} />
                      SECTION XI // ARCHIVE COMPENDIUM
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#facc15' }}>
                    3,200+ Archival Dossiers
                  </span>
                </div>

                <h1 className="manifesto-hero-title" style={{ fontFamily: FONT.display }}>
                  {compendium.title}
                </h1>

                <h2 className="manifesto-hero-subtitle">
                  {compendium.subtitle}
                </h2>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.78rem',
                  color: '#aaa',
                  fontFamily: 'JetBrains Mono, monospace',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ color: '#facc15' }}>Tim Hammond Papers (UMass MS 1205)</span>
                  <span>•</span>
                  <span>International Bioethics Codes</span>
                  <span>•</span>
                  <span>Federal Courtroom Exhibits</span>
                </div>
              </header>

              {/* Compendium Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {compendium.sections.map((sec, sIdx) => (
                  <section 
                    key={sIdx}
                    style={{
                      padding: '2rem',
                      borderRadius: '16px',
                      background: 'rgba(20, 20, 26, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
                    }}
                  >
                    <h2 
                      style={{
                        fontFamily: FONT.display,
                        fontSize: '1.45rem',
                        fontWeight: 700,
                        color: '#facc15',
                        marginBottom: '1.25rem',
                        paddingBottom: '0.75rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem'
                      }}
                    >
                      <BookOpen size={20} color="#facc15" />
                      <span>{sec.heading}</span>
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {sec.paragraphs.map((p, pIdx) => {
                        const isBullet = p.startsWith('•') || p.startsWith('-') || p.startsWith('*');
                        return (
                          <div 
                            key={pIdx} 
                            style={{
                              fontSize: '1.02rem',
                              lineHeight: 1.75,
                              color: isBullet ? '#eee' : 'rgba(240, 240, 245, 0.85)',
                              margin: 0,
                              paddingLeft: isBullet ? '1.25rem' : 0,
                              borderLeft: isBullet ? '2px solid rgba(212, 160, 48, 0.5)' : 'none'
                            }}
                          >
                            <AutoEntityLinker text={p} />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              {/* Return to Chapter Walkthrough Button */}
              <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
                <button
                  onClick={() => handleSelectChapter(0)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.85rem 1.85rem',
                    borderRadius: '12px',
                    background: '#facc15',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(250, 204, 21, 0.3)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>Return to Chapter I: The Price of Admission</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* ================= CHAPTER WALKTHROUGH & DOSSIER VIEW ================= */
            <div>
              
              {/* CHAPTER HERO BANNER */}
              <header className="manifesto-hero-card">
                <div 
                  className="manifesto-hero-ambient-glow"
                  style={{ background: currentChapter.themeColor || '#d4a030' }}
                />

                {/* Top Meta Badges */}
                <div className="manifesto-hero-meta-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span className="manifesto-badge-pill">
                      CHAPTER {currentChapter.roman}
                    </span>
                    
                    <span style={{
                      fontSize: '0.72rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ddd',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <Clock size={12} color="#facc15" />
                      {currentChapter.readingTime} read
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#999',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      Era: <strong style={{ color: '#fff' }}>{currentChapter.historicalEra}</strong>
                    </span>
                    
                    <button
                      onClick={handleShare}
                      style={{
                        padding: '0.35rem 0.55rem',
                        borderRadius: '6px',
                        color: copiedLink ? '#34d399' : '#aaa',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer'
                      }}
                      title="Copy chapter link"
                    >
                      {copiedLink ? <CheckCircle2 size={14} color="#34d399" /> : <Share2 size={14} />}
                    </button>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h1 className="manifesto-hero-title" style={{ fontFamily: FONT.display }}>
                  {currentChapter.title}
                </h1>
                
                <h2 className="manifesto-hero-subtitle">
                  {currentChapter.subtitle}
                </h2>

                {/* Synopsis Inscription Box */}
                {currentChapter.synopsis && (
                  <div className="manifesto-thesis-card">
                    <div className="manifesto-thesis-label">
                      <Sparkles size={12} />
                      ARCHIVAL CHAPTER THESIS
                    </div>
                    <p className="manifesto-thesis-text">
                      &ldquo;{currentChapter.synopsis}&rdquo;
                    </p>
                  </div>
                )}

                {/* Quick Info Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginTop: '1.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.75rem',
                  color: '#888'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span>Sections: <strong style={{ color: '#fff' }}>{currentChapter.sections?.length || 0}</strong></span>
                    <span>•</span>
                    <span>Primary Citations: <strong style={{ color: '#facc15' }}>{currentChapter.primaryCitations?.length || 0}</strong></span>
                  </div>

                  <div>
                    <a
                      href="https://medium.com/@ambp/the-accidental-intactivist-manifesto-exposing-the-monster-we-agree-not-to-see-e96e86490bc0"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: '#bbb',
                        textDecoration: 'none'
                      }}
                    >
                      <span>Original Publication on Medium</span>
                      <ExternalLink size={12} color="#facc15" />
                    </a>
                  </div>
                </div>
              </header>

              {/* SEARCH / KEYWORD IN-CHAPTER FILTER */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'rgba(20, 20, 26, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '2.5rem',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '400px' }}>
                  <Search size={15} color="#888" />
                  <input
                    type="text"
                    placeholder={`Search in Chapter ${currentChapter.roman}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#fff',
                      fontSize: '0.85rem',
                      width: '100%'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: '#ccc',
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', color: '#777' }}>
                  Showing {filteredSections.length} of {currentChapter.sections.length} sections
                </div>
              </div>

              {/* READING MODE: WALKTHROUGH PROSE + ARCHIVAL EXHIBITS */}
              {readingMode === 'walkthrough' ? (
                <article className="manifesto-content-body">
                  {filteredSections.map((section, sIdx) => {
                    // Determine if an exhibit should be injected after this section
                    const exhibitToInject = currentChapter.evidenceExhibits && currentChapter.evidenceExhibits[sIdx % currentChapter.evidenceExhibits.length];
                    const shouldInjectExhibit = (sIdx === 1 || sIdx === 3 || sIdx === 5) && exhibitToInject;

                    return (
                      <section 
                        key={sIdx}
                        className="manifesto-section-block"
                      >
                        {/* Section Heading */}
                        {section.heading && (
                          <h3 
                            className="manifesto-section-heading"
                            style={{ fontFamily: FONT.display }}
                          >
                            {section.heading}
                          </h3>
                        )}

                        {/* Paragraphs */}
                        <div>
                          {section.paragraphs.map((para, pIdx) => {
                            const isHeadingLike = para.length < 85 && (para.endsWith(':') || para.startsWith('I.') || para.startsWith('II.') || para.startsWith('III.'));
                            
                            if (isHeadingLike) {
                              return (
                                <h4 
                                  key={pIdx} 
                                  className="manifesto-subheading-lead"
                                  style={{ fontFamily: FONT.display }}
                                >
                                  {para}
                                </h4>
                              );
                            }

                            return (
                              <div 
                                key={pIdx}
                                className="manifesto-paragraph"
                                style={{ fontFamily: FONT.body }}
                              >
                                <AutoEntityLinker text={para} />
                              </div>
                            );
                          })}
                        </div>

                        {/* ARCHIVAL EVIDENCE EXHIBIT (Replacing old AI illustrations) */}
                        {shouldInjectExhibit && (
                          <ArchiveEvidenceCard 
                            exhibit={exhibitToInject}
                            index={sIdx === 1 ? 0 : 1}
                            chapterRoman={currentChapter.roman}
                          />
                        )}

                        {/* In-Line Medium Tables & Interactive Infographics Injections */}
                        {currentChapter.number === 2 && (sIdx === 1 || section.heading?.includes('II.iii')) && (
                          <SensationRadarInfographic />
                        )}

                        {currentChapter.number === 2 && (sIdx === 2 || section.heading?.includes('II.iv')) && (
                          <HistologicalMicrographViewer />
                        )}

                        {currentChapter.number === 3 && (sIdx === 3 || section.heading?.includes('III.v')) && (
                          <GlobalMedicalConsensusInfographic />
                        )}

                        {currentChapter.number === 4 && (sIdx === 1 || section.heading?.includes('IV.iii')) && (
                          <ManifestoTable tableData={MANIFESTO_TABLES.table_iv_iii_i} />
                        )}

                        {currentChapter.number === 4 && (sIdx === 2 || section.heading?.includes('IV.iv')) && (
                          <ShiftingSandsTimelineInfographic />
                        )}

                        {currentChapter.number === 4 && (sIdx === 4 || section.heading?.includes('IV.vi')) && (
                          <ManifestoTable tableData={MANIFESTO_TABLES.table_iv_ix_ii} />
                        )}

                        {currentChapter.number === 5 && (sIdx === 1 || section.heading?.includes('V.iii')) && (
                          <ManifestoTable tableData={MANIFESTO_TABLES.table_v_iii_i} />
                        )}

                        {currentChapter.number === 6 && (sIdx === 0 || section.heading?.includes('VI.i')) && (
                          <ManifestoTable tableData={MANIFESTO_TABLES.table_vi_i} />
                        )}

                        {currentChapter.number === 7 && (sIdx === 0 || section.heading?.includes('VII.i')) && (
                          <ManifestoTable tableData={MANIFESTO_TABLES.table_vii_i} />
                        )}

                        {currentChapter.number === 7 && (sIdx === 1 || section.heading?.includes('VII.ii')) && (
                          <ManifestoTable tableData={MANIFESTO_TABLES.table_vii_ii} />
                        )}

                        {currentChapter.number === 7 && (sIdx === 2 || section.heading?.includes('VII.iii')) && (
                          <ComplicationsTelemetryInfographic />
                        )}

                        {/* Canonical Guide Companion Banners at End of Relevant Chapters */}
                        {currentChapter.number === 2 && sIdx === filteredSections.length - 1 && (
                          <div style={{
                            margin: '2.5rem 0 1rem',
                            padding: '1.35rem 1.75rem',
                            borderRadius: '12px',
                            background: 'rgba(212, 160, 48, 0.08)',
                            border: '1px solid rgba(212, 160, 48, 0.35)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#d4a030', fontWeight: 800, letterSpacing: '0.08em' }}>
                                FIELD GUIDE COMPANION
                              </div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: '0.2rem 0' }}>
                                The Histology of Sensation & Mechanoreception
                              </div>
                              <div style={{ fontSize: '0.88rem', color: '#aaa' }}>
                                Deep dive into Meissner corpuscles, the ridged band, and spinal reflex vs. somatic orgasm.
                              </div>
                            </div>
                            <Link to="/to/anatomy" style={{
                              padding: '0.55rem 1.15rem',
                              background: '#d4a030',
                              color: '#000',
                              fontWeight: 700,
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '0.88rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}>
                              Explore Anatomy Guide <ArrowRight size={14} />
                            </Link>
                          </div>
                        )}

                        {currentChapter.number === 3 && sIdx === filteredSections.length - 1 && (
                          <div style={{
                            margin: '2.5rem 0 1rem',
                            padding: '1.35rem 1.75rem',
                            borderRadius: '12px',
                            background: 'rgba(212, 160, 48, 0.08)',
                            border: '1px solid rgba(212, 160, 48, 0.35)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#d4a030', fontWeight: 800, letterSpacing: '0.08em' }}>
                                INTERACTIVE EXHIBIT COMPANION
                              </div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: '0.2rem 0' }}>
                                The "Disease of the Decade" (150-Year Retcon)
                              </div>
                              <div style={{ fontSize: '0.88rem', color: '#aaa' }}>
                                Interactive decade-by-decade examination of how medicine invented new maladies to fit the same knife.
                              </div>
                            </div>
                            <Link to="/to/disease-of-the-decade" style={{
                              padding: '0.55rem 1.15rem',
                              background: '#d4a030',
                              color: '#000',
                              fontWeight: 700,
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '0.88rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}>
                              Launch 150-Year Timeline <ArrowRight size={14} />
                            </Link>
                          </div>
                        )}

                        {currentChapter.number === 4 && sIdx === filteredSections.length - 1 && (
                          <div style={{
                            margin: '2.5rem 0 1rem',
                            padding: '1.35rem 1.75rem',
                            borderRadius: '12px',
                            background: 'rgba(74, 222, 128, 0.08)',
                            border: '1px solid rgba(74, 222, 128, 0.35)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#4ade80', fontWeight: 800, letterSpacing: '0.08em' }}>
                                CLINICAL DOSSIER
                              </div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: '0.2rem 0' }}>
                                Fendereski (2024): 1.7 Million Boy Complications Study
                              </div>
                              <div style={{ fontSize: '0.88rem', color: '#aaa' }}>
                                How circumcised infants suffer a 2.9x higher rate of early childhood penile complications.
                              </div>
                            </div>
                            <Link to="/to/complications" style={{
                              padding: '0.55rem 1.15rem',
                              background: '#4ade80',
                              color: '#000',
                              fontWeight: 700,
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '0.88rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}>
                              Read Complications Dossier <ArrowRight size={14} />
                            </Link>
                          </div>
                        )}

                        {currentChapter.number === 7 && sIdx === filteredSections.length - 1 && (
                          <div style={{
                            margin: '2.5rem 0 1rem',
                            padding: '1.35rem 1.75rem',
                            borderRadius: '12px',
                            background: 'rgba(91, 147, 199, 0.08)',
                            border: '1px solid rgba(91, 147, 199, 0.35)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#5b93c7', fontWeight: 800, letterSpacing: '0.08em' }}>
                                EPIDEMIOLOGY DOSSIER
                              </div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: '0.2rem 0' }}>
                                The U.S. Circumcision Rate Reality (JAMA 2025)
                              </div>
                              <div style={{ fontSize: '0.88rem', color: '#aaa' }}>
                                Analysis of the 49.3% in-hospital floor, the 19.7% West vs. 68.5% Midwest divide, and the outpatient shift.
                              </div>
                            </div>
                            <Link to="/to/us-ric-rates" style={{
                              padding: '0.55rem 1.15rem',
                              background: '#5b93c7',
                              color: '#000',
                              fontWeight: 700,
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '0.88rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}>
                              Open Rates Dossier <ArrowRight size={14} />
                            </Link>
                          </div>
                        )}

                        {currentChapter.number === 10 && sIdx === filteredSections.length - 1 && (
                          <div style={{
                            margin: '2.5rem 0 1rem',
                            padding: '1.35rem 1.75rem',
                            borderRadius: '12px',
                            background: 'rgba(212, 160, 48, 0.1)',
                            border: '1px solid rgba(212, 160, 48, 0.4)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#d4a030', fontWeight: 800, letterSpacing: '0.08em' }}>
                                CLINICAL GOVERNANCE FORM
                              </div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: '0.2rem 0' }}>
                                Form 104-RIC: The Recite-Back Informed Consent Tool
                              </div>
                              <div style={{ fontSize: '0.88rem', color: '#aaa' }}>
                                Printable disclosure requiring literal anatomical acknowledgment before surgical authorization.
                              </div>
                            </div>
                            <Link to="/to/consent" style={{
                              padding: '0.55rem 1.15rem',
                              background: '#d4a030',
                              color: '#000',
                              fontWeight: 700,
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '0.88rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}>
                              Launch Form 104-RIC <ArrowRight size={14} />
                            </Link>
                          </div>
                        )}
                      </section>
                    );
                  })}
                </article>
              ) : (
                /* READING MODE: EVIDENCE & PRIMARY CITATIONS DOSSIER */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{
                    padding: '1.25rem 1.5rem',
                    borderRadius: '12px',
                    background: 'rgba(212, 160, 48, 0.08)',
                    border: '1px solid rgba(212, 160, 48, 0.3)',
                    color: '#eee',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem'
                  }}>
                    <ShieldCheck size={22} color="#facc15" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#facc15', display: 'block', marginBottom: '0.25rem' }}>
                        Curated Primary Evidence Dossier (Chapter {currentChapter.roman})
                      </strong>
                      Below are the verified historical citations, medical journal peer-reviewed evidence, and courtroom filings supporting this chapter, directly connected to the 3,200+ document archive corpus.
                    </div>
                  </div>

                  {currentChapter.number === 2 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <HistologicalMicrographViewer />
                    </div>
                  )}

                  {/* Exhibits in Dossier */}
                  <div>
                    <h3 style={{
                      fontFamily: FONT.display,
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Database size={18} color="#facc15" />
                      <span>Archival Evidence Exhibits</span>
                    </h3>
                    
                    {currentChapter.evidenceExhibits?.map((exhibit, eIdx) => (
                      <ArchiveEvidenceCard
                        key={eIdx}
                        exhibit={exhibit}
                        index={eIdx}
                        chapterRoman={currentChapter.roman}
                      />
                    ))}
                  </div>

                  {/* Primary Citations in Dossier */}
                  <div style={{ paddingTop: '1.5rem' }}>
                    <h3 style={{
                      fontFamily: FONT.display,
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FileText size={18} color="#facc15" />
                      <span>Academic & Archival Citations</span>
                    </h3>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                      gap: '1rem'
                    }}>
                      {currentChapter.primaryCitations?.map((cit, cIdx) => (
                        <div 
                          key={cIdx}
                          style={{
                            padding: '1.25rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontWeight: 700,
                                background: 'rgba(212, 160, 48, 0.2)',
                                color: '#facc15'
                              }}>
                                {cit.badge}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#777', fontFamily: 'JetBrains Mono, monospace' }}>
                                {cit.year}
                              </span>
                            </div>
                            <h4 style={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: '#fff',
                              margin: '0 0 0.4rem 0',
                              fontFamily: FONT.display
                            }}>
                              {cit.title}
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: '#888', fontFamily: 'JetBrains Mono, monospace', margin: '0 0 0.75rem 0' }}>
                              {cit.authors} • {cit.provenance}
                            </p>
                            <blockquote style={{
                              fontSize: '0.85rem',
                              fontStyle: 'italic',
                              color: '#ccc',
                              borderLeft: '2px solid rgba(212, 160, 48, 0.4)',
                              paddingLeft: '0.65rem',
                              margin: '0 0 1rem 0'
                            }}>
                              &ldquo;{cit.quote}&rdquo;
                            </blockquote>
                          </div>

                          <Link
                            to={cit.link}
                            className="manifesto-evidence-action-btn"
                            style={{ justifyContent: 'center', marginTop: 'auto' }}
                          >
                            <span>Open in Library / Archive</span>
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* END-OF-CHAPTER PRIMARY CITATIONS TRAY (Walkthrough Mode) */}
              {readingMode === 'walkthrough' && currentChapter.primaryCitations?.length > 0 && (
                <div style={{
                  marginTop: '3.5rem',
                  padding: '2rem',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(20, 20, 26, 0.95) 0%, rgba(12, 12, 16, 0.98) 100%)',
                  border: '1px solid rgba(212, 160, 48, 0.25)',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <FileText size={18} color="#facc15" />
                      <h3 style={{ fontFamily: FONT.display, fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                        Primary Citations for Chapter {currentChapter.roman}
                      </h3>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', color: '#facc15' }}>
                      {currentChapter.primaryCitations.length} Archival Sources
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1rem'
                  }}>
                    {currentChapter.primaryCitations.map((cit, cIdx) => (
                      <div 
                        key={cIdx}
                        style={{
                          padding: '1.15rem',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{
                              fontSize: '0.65rem',
                              fontFamily: 'JetBrains Mono, monospace',
                              fontWeight: 700,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: 'rgba(212, 160, 48, 0.15)',
                              color: '#facc15'
                            }}>
                              {cit.badge}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#777', fontFamily: 'JetBrains Mono, monospace' }}>
                              {cit.year}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', margin: '0 0 0.35rem 0' }}>
                            {cit.title}
                          </h4>
                          <p style={{ fontSize: '0.72rem', color: '#888', fontFamily: 'JetBrains Mono, monospace', margin: '0 0 0.5rem 0' }}>
                            {cit.provenance}
                          </p>
                          <p style={{ fontSize: '0.8rem', color: '#ccc', fontStyle: 'italic', margin: '0 0 0.85rem 0' }}>
                            &ldquo;{cit.quote}&rdquo;
                          </p>
                        </div>

                        <Link
                          to={cit.link}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.75rem',
                            color: '#facc15',
                            textDecoration: 'none',
                            fontWeight: 600,
                            marginTop: 'auto'
                          }}
                        >
                          <span>Access Document</span>
                          <ChevronRight size={13} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHAPTER PAGINATION & BOTTOM CONTROLS */}
              <div style={{
                paddingTop: '2.5rem',
                marginTop: '3.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                {currentChapterIndex > 0 ? (
                  <button
                    onClick={() => handleSelectChapter(currentChapterIndex - 1)}
                    className="manifesto-nav-arrow-btn"
                    style={{
                      padding: '0.75rem 1.25rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      borderRadius: '10px'
                    }}
                  >
                    <ChevronLeft size={16} />
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '0.65rem', display: 'block', textTransform: 'uppercase', color: '#777', fontFamily: 'JetBrains Mono, monospace' }}>
                        Previous
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        Chapter {chapters[currentChapterIndex - 1].roman}: {chapters[currentChapterIndex - 1].title}
                      </span>
                    </div>
                  </button>
                ) : (
                  <div />
                )}

                {currentChapterIndex < chapters.length - 1 ? (
                  <button
                    onClick={() => handleSelectChapter(currentChapterIndex + 1)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.75rem 1.45rem',
                      borderRadius: '10px',
                      background: '#facc15',
                      color: '#000',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(250, 204, 21, 0.25)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.65rem', display: 'block', textTransform: 'uppercase', color: 'rgba(0,0,0,0.6)', fontFamily: 'JetBrains Mono, monospace' }}>
                        Next Chapter
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        Chapter {chapters[currentChapterIndex + 1].roman}: {chapters[currentChapterIndex + 1].title}
                      </span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleOpenCompendium}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.85rem 1.5rem',
                      borderRadius: '10px',
                      background: '#facc15',
                      color: '#000',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(250, 204, 21, 0.25)'
                    }}
                  >
                    <Layers size={16} />
                    <span>Explore Section XI: Archive Compendium</span>
                  </button>
                )}
              </div>

              {/* PERSISTENT FOOTER WITH MEDIUM ATTRIBUTION & ARCHIVE STATS */}
              <footer style={{
                marginTop: '4rem',
                paddingTop: '2rem',
                paddingBottom: '3rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                textAlign: 'center',
                fontSize: '0.75rem',
                color: '#777',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', fontFamily: 'JetBrains Mono, monospace' }}>
                  <span>The Accidental Intactivist's Manifesto (2025)</span>
                  <span>•</span>
                  <span>Authored by Tone Pettit</span>
                  <span>•</span>
                  <span>Interactive Archival Edition</span>
                </div>

                <p style={{ maxWidth: '640px', margin: '0 auto', lineHeight: 1.6, color: '#666', fontSize: '0.72rem' }}>
                  Cross-referenced with the Tim Hammond Archive (UMass MS 1205, 3,200+ dossiers), the 2024 CircumSurvey empirical telemetry, and federal civil rights dockets. Speculative AI illustrations have been fully superseded by authentic primary source records.
                </p>

                <div>
                  <a
                    href="https://medium.com/@ambp/the-accidental-intactivist-manifesto-exposing-the-monster-we-agree-not-to-see-e96e86490bc0"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: '#facc15',
                      textDecoration: 'none',
                      fontWeight: 600
                    }}
                  >
                    <span>Read Tone Pettit's Original Publication on Medium</span>
                    <ExternalLink size={12} color="#facc15" />
                  </a>
                </div>
              </footer>

            </div>
          )}

        </main>
      </div>
    </>
  )}
</div>
  );
}
