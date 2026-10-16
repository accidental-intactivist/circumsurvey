import React, { useState, useMemo } from 'react';
import { 
  Table as TableIcon, 
  Search, 
  ArrowUpDown, 
  ShieldCheck
} from 'lucide-react';
import { FONT, C } from '../../styles/tokens';
import AutoEntityLinker from '../AutoEntityLinker';
import { MANIFESTO_TABLES } from '../../data/manifesto_tables';

/**
 * Single Responsive Manifesto Data Table Component
 */
export function ManifestoTable({ tableData, compact = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const rows = tableData?.rows || [];

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredRows = useMemo(() => {
    let result = [...rows];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(q)
        )
      );
    }
    if (sortKey) {
      result.sort((a, b) => {
        const valA = String(a[sortKey] || '').toLowerCase();
        const valB = String(b[sortKey] || '').toLowerCase();
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [rows, searchTerm, sortKey, sortDir]);

  if (!tableData) return null;

  const { id, number, title, subtitle, provenance, columns } = tableData;

  return (
    <div 
      id={id} 
      className="manifesto-table-container"
      style={{
        margin: compact ? '1.5rem 0' : '2.5rem 0',
        borderRadius: '16px',
        background: 'linear-gradient(145deg, rgba(20, 20, 28, 0.95) 0%, rgba(12, 12, 18, 0.98) 100%)',
        border: '1px solid rgba(212, 160, 48, 0.3)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55), 0 0 20px rgba(168, 85, 247, 0.08)',
        overflow: 'hidden'
      }}
    >
      {/* Header Bar */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(212, 160, 48, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              background: 'rgba(212, 160, 48, 0.15)',
              border: '1px solid rgba(212, 160, 48, 0.35)',
              color: '#facc15',
              fontSize: '0.72rem',
              fontFamily: FONT.mono,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              <TableIcon size={12} />
              {number}
            </span>
            <span style={{
              fontSize: '0.72rem',
              color: '#aaa',
              fontFamily: FONT.mono
            }}>
              MEDIUM MANIFESTO ARCHIVE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Search within Table */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Search size={13} color="#888" />
              <input 
                type="text"
                placeholder="Filter table rows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontFamily: FONT.body,
                  width: '120px'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: '0.7rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: FONT.mono }}>
              {filteredRows.length} / {rows.length} rows
            </span>
          </div>
        </div>

        <h3 style={{
          fontFamily: FONT.display,
          fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)',
          fontWeight: 700,
          color: '#ffffff',
          margin: 0,
          lineHeight: 1.3
        }}>
          {title}
        </h3>

        {subtitle && (
          <p style={{
            fontSize: '0.88rem',
            color: 'rgba(240, 240, 245, 0.78)',
            margin: 0,
            lineHeight: 1.5,
            fontFamily: FONT.body
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Desktop / Tablet Table View */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table 
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontFamily: FONT.body,
            fontSize: '0.88rem'
          }}
          aria-label={title}
        >
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{
                    width: col.width,
                    padding: '0.85rem 1.25rem',
                    color: '#facc15',
                    fontFamily: FONT.mono,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => handleSort(col.key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{col.label}</span>
                    <ArrowUpDown size={11} color={sortKey === col.key ? '#facc15' : '#666'} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row, rIdx) => {
                const isEven = rIdx % 2 === 0;
                return (
                  <tr 
                    key={rIdx}
                    style={{
                      background: isEven ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 0, 0, 0.25)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212, 160, 48, 0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isEven ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 0, 0, 0.25)'; }}
                  >
                    {columns.map((col, cIdx) => {
                      const isFirst = cIdx === 0;
                      return (
                        <td 
                          key={col.key}
                          style={{
                            padding: '1rem 1.25rem',
                            color: isFirst ? '#ffffff' : 'rgba(240, 240, 245, 0.85)',
                            fontWeight: isFirst ? 700 : 400,
                            lineHeight: 1.6,
                            verticalAlign: 'top',
                            borderRight: cIdx < columns.length - 1 ? '1px solid rgba(255, 255, 255, 0.03)' : 'none'
                          }}
                        >
                          <AutoEntityLinker text={String(row[col.key] || '')} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ padding: '2.5rem', textAlign: 'center', color: '#888' }}>
                  No table rows matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Provenance Note */}
      <div style={{
        padding: '0.75rem 1.25rem',
        background: 'rgba(0, 0, 0, 0.4)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.75rem',
        color: '#777'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ShieldCheck size={13} color="#facc15" />
          <span>Provenance: <strong style={{ color: '#bbb' }}>{provenance}</strong></span>
        </div>
        <span style={{ fontFamily: FONT.mono, color: '#555' }}>
          CIRCUMSURVEY ARCHIVAL EDITION
        </span>
      </div>
    </div>
  );
}

/**
 * Gallery / Suite of all 6 Manifesto Tables
 */
export default function ManifestoTablesGallery({ activeTableId = null }) {
  const [selectedTable, setSelectedTable] = useState(activeTableId || 'all');
  const [searchFilter, setSearchFilter] = useState('');

  const tableList = Object.values(MANIFESTO_TABLES);

  const displayedTables = useMemo(() => {
    let list = tableList;
    if (selectedTable !== 'all') {
      list = list.filter(t => t.id === selectedTable);
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) ||
        t.number.toLowerCase().includes(q) ||
        t.rows.some(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)))
      );
    }
    return list;
  }, [tableList, selectedTable, searchFilter]);

  return (
    <div style={{ fontFamily: FONT.body, color: C.text }}>
      {/* Gallery Selector Filter Bar */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.25rem',
        borderRadius: '12px',
        background: 'rgba(20, 20, 28, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TableIcon size={16} color="#facc15" />
            <h4 style={{ fontFamily: FONT.display, fontSize: '1.1rem', margin: 0, color: '#fff' }}>
              Medium Manifesto Analytical Tables (6 Core Exhibits)
            </h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.25rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Search size={14} color="#888" />
            <input 
              type="text"
              placeholder="Search across all 6 tables..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.8rem',
                width: '180px'
              }}
            />
          </div>
        </div>

        {/* Filter Pills for individual tables */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedTable('all')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontFamily: FONT.mono,
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedTable === 'all' ? '1px solid #facc15' : '1px solid rgba(255, 255, 255, 0.1)',
              background: selectedTable === 'all' ? 'rgba(212, 160, 48, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: selectedTable === 'all' ? '#facc15' : '#aaa'
            }}
          >
            All 6 Tables
          </button>

          {tableList.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTable(t.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontFamily: FONT.mono,
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedTable === t.id ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
                background: selectedTable === t.id ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedTable === t.id ? '#c084fc' : '#aaa'
              }}
            >
              {t.number}
            </button>
          ))}
        </div>
      </div>

      {/* Render Table Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {displayedTables.map(t => (
          <ManifestoTable key={t.id} tableData={t} />
        ))}
      </div>
    </div>
  );
}
