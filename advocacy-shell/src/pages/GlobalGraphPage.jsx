import React from 'react';
import EntityNetworkGraph from '../components/EntityNetworkGraph';
import './AdminArchivePage.css';

export default function GlobalGraphPage() {
  return (
    <div style={{ height: 'calc(100vh - 80px)', width: '100vw', padding: '2rem', boxSizing: 'border-box' }} className="lux-glide-in">
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ color: 'var(--c-goldBright)', margin: '0 0 0.5rem 0', fontFamily: 'var(--f-display)', fontSize: '2rem' }}>Knowledge Graph</h1>
        <p style={{ color: 'var(--c-muted)', margin: 0, fontSize: '0.9rem' }}>A visual map of all entities and the documents that connect them.</p>
      </div>
      <div style={{ height: 'calc(100% - 4rem)' }}>
        <EntityNetworkGraph />
      </div>
    </div>
  );
}
