import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Layers, 
  Table as TableIcon, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Compass
} from 'lucide-react';
import { FONT } from '../../styles/tokens';
import { MANIFESTO_TABLES } from '../../data/manifesto_tables';

export const NEWCOMER_LENSES = [
  {
    id: 'all',
    label: 'All 11 Chapters',
    icon: '📚',
    description: 'Comprehensive 35,000-word treatise across all 11 analytical corridors.',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  },
  {
    id: 'parents',
    label: '👶 Expectant Parents',
    icon: '👶',
    description: 'What are the actual medical facts, hygiene realities, and informed consent standards?',
    chapters: [2, 3, 5],
    featuredTables: ['table-v-iii-i']
  },
  {
    id: 'anatomy',
    label: '🔬 Anatomy & Sensation',
    icon: '🔬',
    description: 'The specialized 5-layer gliding mechanism, 36% sensation drop, and nerve delta.',
    chapters: [2, 7],
    featuredTables: ['table-vii-ii']
  },
  {
    id: 'history',
    label: '📜 Victorian History & Profit',
    icon: '📜',
    description: 'How John Harvey Kellogg, Lewis Sayre, and hospital billing codes normalized infant surgery.',
    chapters: [4, 5],
    featuredTables: ['table-iv-iii-i', 'table-iv-ix-ii']
  },
  {
    id: 'human_rights',
    label: '⚖️ Human Rights & FGM Parallels',
    icon: '⚖️',
    description: 'The cognitive firewall, UNCRC treaties, and hauntingly mirrored rationales.',
    chapters: [1, 6, 9],
    featuredTables: ['table-vi-i']
  },
  {
    id: 'complications',
    label: '💔 Complications & Regret',
    icon: '💔',
    description: 'Physical alterations, meatal stenosis, scarring lottery, and disenfranchised grief.',
    chapters: [7],
    featuredTables: ['table-vii-i', 'table-vii-ii']
  },
  {
    id: 'action',
    label: '⚡ Reform & Direct Action',
    icon: '⚡',
    description: 'Medicaid decoupling, federal constitutional litigation, and the intactivist movement.',
    chapters: [8, 9, 10, 11]
  }
];

export default function ManifestoTableOfContents({
  chapters,
  currentChapterIndex,
  onSelectChapter,
  onOpenCompendium,
  isCompendiumOpen,
  onSelectTable,
  onSelectInfographic,
  activeViewMode, // 'walkthrough' | 'dossier' | 'tables' | 'infographics'
  setActiveViewMode
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLens, setSelectedLens] = useState('all');
  const [expandedChapters, setExpandedChapters] = useState({ [currentChapterIndex]: true });

  const activeLensObj = NEWCOMER_LENSES.find(l => l.id === selectedLens) || NEWCOMER_LENSES[0];

  const toggleExpand = (idx, e) => {
    e.stopPropagation();
    setExpandedChapters(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const filteredChapters = useMemo(() => {
    return chapters.filter((ch, idx) => {
      const chNum = idx + 1;
      const inLens = activeLensObj.chapters.includes(chNum);
      if (!inLens) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inTitle = ch.title.toLowerCase().includes(q);
      const inSubtitle = ch.subtitle.toLowerCase().includes(q);
      const inSections = ch.sections && ch.sections.some(s => s.heading.toLowerCase().includes(q));
      return inTitle || inSubtitle || inSections;
    });
  }, [chapters, activeLensObj, searchQuery]);

  const tablesList = Object.values(MANIFESTO_TABLES);

  return (
    <nav 
      className="manifesto-toc-root"
      aria-label="Manifesto Table of Contents"
      style={{
        width: '100%',
        fontFamily: FONT.body,
        color: '#fff'
      }}
    >
      {/* ── TOP SECTION: NEWCOMER "START WHERE YOU ARE" LENS SELECTOR ── */}
      <div style={{
        marginBottom: '1.5rem',
        padding: '1.25rem',
        borderRadius: '14px',
        background: 'rgba(20, 20, 28, 0.75)',
        border: '1px solid rgba(212, 160, 48, 0.25)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
          <Compass size={14} color="#facc15" />
          <span style={{
            fontSize: '0.72rem',
            fontFamily: FONT.mono,
            fontWeight: 800,
            color: '#facc15',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            NEWCOMER LENS // JUMP TO WHAT MATTERS TO YOU:
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.45rem',
          flexWrap: 'wrap',
          marginBottom: '0.75rem'
        }}>
          {NEWCOMER_LENSES.map(lens => {
            const isActive = lens.id === selectedLens;
            return (
              <button
                key={lens.id}
                onClick={() => setSelectedLens(lens.id)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isActive ? '1px solid #facc15' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isActive ? 'rgba(212, 160, 48, 0.22)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#facc15' : '#bbb',
                  transition: 'all 0.15s ease'
                }}
              >
                {lens.label}
              </button>
            );
          })}
        </div>

        {selectedLens !== 'all' && (
          <div style={{
            fontSize: '0.78rem',
            color: '#bbb',
            lineHeight: 1.4,
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            {activeLensObj.description}
          </div>
        )}
      </div>

      {/* ── TOC SEARCH BAR & VIEW MODE SWITCH ── */}
      <div style={{
        marginBottom: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Search size={14} color="#888" />
          <input
            type="text"
            placeholder="Search chapters, topics, or tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.82rem',
              width: '100%',
              fontFamily: FONT.body
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#888',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Global View Modes: Walkthrough | Tables | Infographics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => setActiveViewMode('walkthrough')}
            style={{
              padding: '0.4rem 0.2rem',
              borderRadius: '6px',
              border: 'none',
              background: activeViewMode === 'walkthrough' ? 'rgba(212, 160, 48, 0.25)' : 'transparent',
              color: activeViewMode === 'walkthrough' ? '#facc15' : '#888',
              fontWeight: 700,
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem'
            }}
          >
            <BookOpen size={12} />
            <span>Reader</span>
          </button>

          <button
            onClick={() => setActiveViewMode('tables')}
            style={{
              padding: '0.4rem 0.2rem',
              borderRadius: '6px',
              border: 'none',
              background: activeViewMode === 'tables' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              color: activeViewMode === 'tables' ? '#c084fc' : '#888',
              fontWeight: 700,
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem'
            }}
          >
            <TableIcon size={12} />
            <span>6 Tables</span>
          </button>

          <button
            onClick={() => setActiveViewMode('infographics')}
            style={{
              padding: '0.4rem 0.2rem',
              borderRadius: '6px',
              border: 'none',
              background: activeViewMode === 'infographics' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              color: activeViewMode === 'infographics' ? '#34d399' : '#888',
              fontWeight: 700,
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem'
            }}
          >
            <Sparkles size={12} />
            <span>Infographics</span>
          </button>
        </div>
      </div>

      {/* ── CHAPTER TREE ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          fontFamily: FONT.mono,
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '0 0.25rem'
        }}>
          <span>Table of Contents</span>
          <span>{filteredChapters.length} Chapters</span>
        </div>

        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {filteredChapters.map((ch) => {
            const originalIndex = chapters.findIndex(c => c.id === ch.id);
            const isCurrent = originalIndex === currentChapterIndex && !isCompendiumOpen && activeViewMode === 'walkthrough';
            const isExpanded = !!expandedChapters[originalIndex] || searchQuery.trim().length > 0;

            // Check if this chapter has featured Medium tables
            const chapterTables = tablesList.filter(t => t.chapterNumber === ch.number);

            return (
              <li 
                key={ch.id}
                style={{
                  borderRadius: '10px',
                  background: isCurrent ? 'rgba(212, 160, 48, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: isCurrent ? '1px solid rgba(212, 160, 48, 0.45)' : '1px solid rgba(255, 255, 255, 0.06)',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Chapter Row Header */}
                <div
                  onClick={() => {
                    setActiveViewMode('walkthrough');
                    onSelectChapter(originalIndex);
                  }}
                  style={{
                    padding: '0.75rem 0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <span style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontFamily: FONT.mono,
                      fontWeight: 800,
                      background: isCurrent ? '#facc15' : 'rgba(255, 255, 255, 0.08)',
                      color: isCurrent ? '#000' : '#ccc',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      CH {ch.roman}
                    </span>

                    <div>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: isCurrent ? 800 : 600,
                        color: isCurrent ? '#fff' : '#ddd',
                        lineHeight: 1.3
                      }}>
                        {ch.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '2px', lineHeight: 1.3 }}>
                        {ch.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.68rem', color: '#777', fontFamily: FONT.mono }}>
                      {ch.readingTime}
                    </span>
                    <button
                      onClick={(e) => toggleExpand(originalIndex, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Expand Subsections & Tables"
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  </div>
                </div>

                {/* Subsections & Tables Dropdown Drawer */}
                {isExpanded && (
                  <div style={{
                    padding: '0.5rem 0.85rem 0.85rem 2.2rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}>
                    {/* Chapter Tables Link Pills */}
                    {chapterTables.map(tbl => (
                      <div
                        key={tbl.id}
                        onClick={() => {
                          if (onSelectTable) {
                            onSelectTable(tbl.id);
                          } else {
                            setActiveViewMode('tables');
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          background: 'rgba(168, 85, 247, 0.12)',
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                          color: '#c084fc',
                          fontSize: '0.72rem',
                          fontFamily: FONT.mono,
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        <TableIcon size={11} />
                        <span>{tbl.number}: {tbl.title.split(':')[0]}</span>
                      </div>
                    ))}

                    {/* Subsections List */}
                    {ch.sections && ch.sections.map((sec, sIdx) => {
                      const headingText = sec.heading || `Subsection ${sIdx + 1}`;
                      return (
                        <div
                          key={sIdx}
                          onClick={() => {
                            setActiveViewMode('walkthrough');
                            onSelectChapter(originalIndex);
                          }}
                          style={{
                            fontSize: '0.75rem',
                            color: '#aaa',
                            cursor: 'pointer',
                            padding: '0.2rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'color 0.15s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#facc15'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#aaa'; }}
                        >
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)' }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {headingText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}

          {/* Section XI Compendium Button */}
          <li
            onClick={() => {
              setActiveViewMode('walkthrough');
              onOpenCompendium();
            }}
            style={{
              padding: '0.75rem 0.85rem',
              borderRadius: '10px',
              cursor: 'pointer',
              background: isCompendiumOpen ? 'rgba(250, 204, 21, 0.18)' : 'rgba(255, 255, 255, 0.02)',
              border: isCompendiumOpen ? '1px solid rgba(250, 204, 21, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              marginTop: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                fontSize: '0.65rem',
                fontFamily: FONT.mono,
                fontWeight: 800,
                background: '#facc15',
                color: '#000'
              }}>
                SEC XI
              </span>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#facc15' }}>
                  Archive Evidence Compendium
                </div>
                <div style={{ fontSize: '0.7rem', color: '#888' }}>
                  Tim Hammond Papers (UMass MS 1205) & Bioethics Dossiers
                </div>
              </div>
            </div>

            <Layers size={14} color="#facc15" />
          </li>
        </ol>
      </div>
    </nav>
  );
}
