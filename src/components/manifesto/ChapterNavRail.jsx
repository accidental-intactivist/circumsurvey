import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  List, 
  Sparkles, 
  Layers, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  X,
  ArrowLeft
} from 'lucide-react';
import { FONT } from '../../styles/tokens';

export default function ChapterNavRail({
  chapters,
  currentChapterIndex,
  onSelectChapter,
  readingMode,
  setReadingMode,
  scrollProgress,
  onOpenCompendium,
  isCompendiumOpen,
  onBackToPortal
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const currentChapter = chapters[currentChapterIndex] || chapters[0];
  const canGoPrev = currentChapterIndex > 0;
  const canGoNext = currentChapterIndex < chapters.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      onSelectChapter(currentChapterIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onSelectChapter(currentChapterIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Sticky Progress & Navigation Bar */}
      <header className="manifesto-nav-rail">
        {/* Horizontal Scroll Reading Progress Bar */}
        <div 
          className="manifesto-progress-bar"
          style={{ width: `${Math.min(100, Math.max(0, scrollProgress))}%` }}
        />

        <div className="manifesto-nav-inner">
          
          {/* Left: Overview Button, Chapter Index Drawer Button & Breadcrumb */}
          <div className="manifesto-nav-left">
            {onBackToPortal && (
              <button
                onClick={onBackToPortal}
                className="manifesto-drawer-btn"
                title="Return to Manifesto Overview & Subjects"
                style={{
                  background: 'rgba(212, 160, 48, 0.12)',
                  borderColor: 'rgba(212, 160, 48, 0.35)',
                  color: '#facc15'
                }}
              >
                <ArrowLeft size={14} />
                <span className="hidden-mobile">Overview</span>
              </button>
            )}

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="manifesto-drawer-btn"
              title="Open Table of Contents"
            >
              <List size={15} color="#facc15" />
              <span>Chapters & Exhibits</span>
            </button>

            <div className="manifesto-nav-title-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', lineHeight: 1.1, marginBottom: '2px' }}>
                <span className="manifesto-nav-chapter-badge">
                  {isCompendiumOpen ? 'SECTION XI' : `CH. ${currentChapter.roman}`}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>•</span>
                <span style={{ fontSize: '0.7rem', color: '#888', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                  {isCompendiumOpen ? 'Compendium' : currentChapter.historicalEra}
                </span>
              </div>
              <h3 
                className="manifesto-nav-chapter-title"
                style={{ fontFamily: FONT.display }}
              >
                {isCompendiumOpen ? 'Resources for Action & Defense' : currentChapter.title}
              </h3>
            </div>
          </div>

          {/* Right: Reading Mode Toggle, Prev/Next, and Compendium */}
          <div className="manifesto-nav-right">
            
            {/* Reading Mode Switcher */}
            <div className="manifesto-mode-switch">
              <button
                onClick={() => setReadingMode('walkthrough')}
                className={`manifesto-mode-btn ${readingMode === 'walkthrough' ? 'active' : ''}`}
                title="Narrative Walkthrough with In-Line Exhibits & Tables"
              >
                <BookOpen size={13} />
                <span>Walkthrough</span>
              </button>
              <button
                onClick={() => setReadingMode('tables')}
                className={`manifesto-mode-btn ${readingMode === 'tables' ? 'active' : ''}`}
                title="Inspect All 6 Medium Manifesto Tables"
              >
                <Sparkles size={13} />
                <span>6 Tables</span>
              </button>
              <button
                onClick={() => setReadingMode('infographics')}
                className={`manifesto-mode-btn ${readingMode === 'infographics' ? 'active' : ''}`}
                title="Interactive Visual Evidence Lab"
              >
                <Sparkles size={13} />
                <span>Infographics</span>
              </button>
              <button
                onClick={() => setReadingMode('dossier')}
                className={`manifesto-mode-btn ${readingMode === 'dossier' ? 'active' : ''}`}
                title="Curated Primary Citations & Exhibits Only"
              >
                <ShieldCheck size={13} />
                <span className="hidden-mobile">Dossier</span>
              </button>
            </div>

            {/* Jump to Compendium */}
            <button
              onClick={onOpenCompendium}
              className="manifesto-drawer-btn"
              style={{
                background: isCompendiumOpen ? 'rgba(212, 160, 48, 0.2)' : 'rgba(255,255,255,0.05)',
                color: isCompendiumOpen ? '#facc15' : '#ccc',
                borderColor: isCompendiumOpen ? 'rgba(212, 160, 48, 0.4)' : 'rgba(255,255,255,0.1)'
              }}
            >
              <Layers size={13} color="#facc15" />
              <span className="hidden-mobile">Compendium</span>
            </button>

            {/* Prev / Next Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                className="manifesto-nav-arrow-btn"
                title="Previous Chapter"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className="manifesto-nav-arrow-btn"
                title="Next Chapter"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chapter Selection Drawer / Slide-Over */}
      {isDrawerOpen && (
        <div className="manifesto-drawer-overlay">
          {/* Backdrop click */}
          <div 
            style={{ position: 'absolute', inset: 0 }}
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Content Panel */}
          <div className="manifesto-drawer-panel" style={{ position: 'relative', zIndex: 10 }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#0a0a0f'
            }}>
              <div>
                <span style={{
                  fontSize: '0.68rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#facc15',
                  fontWeight: 700
                }}>
                  THE ACCIDENTAL INTACTIVIST'S MANIFESTO
                </span>
                <h2 style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0.2rem 0 0 0',
                  fontFamily: FONT.display
                }}>
                  11 Sections & Archival Corridors
                </h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  padding: '0.45rem',
                  color: '#999',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Chapter List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              {chapters.map((ch, idx) => {
                const isActive = idx === currentChapterIndex && !isCompendiumOpen;
                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      onSelectChapter(idx);
                      setIsDrawerOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: isActive ? '1px solid rgba(212, 160, 48, 0.45)' : '1px solid rgba(255, 255, 255, 0.06)',
                      background: isActive ? 'rgba(212, 160, 48, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 700,
                          background: isActive ? 'rgba(212, 160, 48, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                          color: isActive ? '#facc15' : '#ccc'
                        }}>
                          CHAPTER {ch.roman}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={11} color="#facc15" /> {ch.readingTime}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.7rem', color: '#facc15', fontFamily: 'JetBrains Mono, monospace' }}>
                        {ch.primaryCitations?.length || 0} Citations
                      </span>
                    </div>

                    <h4 style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: isActive ? '#facc15' : '#fff',
                      margin: '0 0 0.25rem 0',
                      lineHeight: 1.3
                    }}>
                      {ch.title}
                    </h4>

                    <p style={{
                      fontSize: '0.75rem',
                      color: '#999',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {ch.subtitle}
                    </p>

                    <div style={{
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.7rem',
                      color: '#666'
                    }}>
                      <span>Era: {ch.historicalEra}</span>
                      <span style={{ color: '#d4a030', fontFamily: 'JetBrains Mono, monospace' }}>
                        {ch.sections?.length || 0} sections
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Section XI Compendium Entry in Drawer */}
              <div
                onClick={() => {
                  onOpenCompendium();
                  setIsDrawerOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: isCompendiumOpen ? '1px solid rgba(212, 160, 48, 0.45)' : '1px solid rgba(255, 255, 255, 0.06)',
                  background: isCompendiumOpen ? 'rgba(212, 160, 48, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    background: 'rgba(212, 160, 48, 0.25)',
                    color: '#facc15'
                  }}>
                    SECTION XI
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#facc15', fontFamily: 'JetBrains Mono, monospace' }}>
                    Archive Compendium
                  </span>
                </div>
                <h4 style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: isCompendiumOpen ? '#facc15' : '#fff',
                  margin: '0 0 0.25rem 0'
                }}>
                  Resources, Literature & Action Hub
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#999', margin: 0 }}>
                  Historical organizations, academic research papers, PBS documentaries & legal filings.
                </p>
              </div>
            </div>

            {/* Drawer Footer with Medium Publication Attribution */}
            <div style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: '#08080c',
              fontSize: '0.75rem'
            }}>
              <a
                href="https://medium.com/@ambp/the-accidental-intactivist-manifesto-exposing-the-monster-we-agree-not-to-see-e96e86490bc0"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#aaa',
                  textDecoration: 'none'
                }}
              >
                <span>Read Original Essay on Medium / Substack</span>
                <ExternalLink size={13} color="#facc15" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
