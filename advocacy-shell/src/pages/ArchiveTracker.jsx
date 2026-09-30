import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminArchivePage.css'; 

export default function ArchiveTracker() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeries, setFilterSeries] = useState('All');
  const [visibleCount, setVisibleCount] = useState(50);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    setVisibleCount(50);
  }, [filterSeries]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
        setVisibleCount(prev => prev + 50);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms?type=physical_document');
      const data = await res.json();
      if (res.ok) {
        setItems(data || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const seriesList = ['All', ...new Set(items.map(i => i.source_collection).filter(Boolean))];
  const filteredItems = filterSeries === 'All' ? items : items.filter(i => i.source_collection === filterSeries);
  const visibleItems = filteredItems.slice(0, visibleCount);

  const pendingCount = items.filter(i => i.status === 'pending_digitization').length;
  const totalCount = items.length;
  const digitizedCount = totalCount - pendingCount;
  const progressPercent = totalCount > 0 ? Math.round((digitizedCount / totalCount) * 100) : 0;

  return (
    <div className="admin-archive-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--c-goldBright)', margin: '0 0 0.5rem 0' }}>Physical Archive Tracker</h1>
          <p style={{ color: 'var(--c-muted)', margin: 0 }}>Tim Hammond Genital Autonomy Advocacy Collection (UMass MS 1205)</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', color: 'var(--c-textBright)', fontWeight: 'bold' }}>{progressPercent}%</div>
          <div style={{ color: 'var(--c-muted)', fontSize: '0.9rem' }}>{digitizedCount} of {totalCount} items digitized</div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ color: 'var(--c-muted)' }}>Filter by Series:</span>
        <select 
          value={filterSeries} 
          onChange={e => setFilterSeries(e.target.value)}
          style={{ background: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '4px', maxWidth: '400px' }}
        >
          {seriesList.map(s => <option key={s} value={s}>{s.replace('UMass MS 1205: ', '')}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--c-muted)' }}>Loading inventory...</div>
      ) : (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1rem' }}>Title</th>
                <th style={{ padding: '1rem' }}>Location</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map(item => {
                const meta = item.metadata_json ? JSON.parse(item.metadata_json) : {};
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', color: 'var(--c-textBright)' }}>
                      {item.title}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--c-muted)', fontSize: '0.9rem' }}>
                      Box {meta.box || '-'}, Folder {meta.folder || '-'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--c-muted)', fontSize: '0.9rem' }}>
                      {meta.date || '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {item.status === 'pending_digitization' ? (
                        <span style={{ color: 'var(--c-muted)', fontSize: '0.9rem' }}>Pending</span>
                      ) : (
                        <span style={{ color: '#4ade80', fontSize: '0.9rem' }}>✓ Digitized</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Link to={`/library/${item.id}`} style={{ color: 'var(--c-goldBright)', textDecoration: 'none', fontSize: '0.9rem' }}>
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
