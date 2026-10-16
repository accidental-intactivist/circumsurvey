import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Joyride, STATUS } from 'react-joyride';
import EntityNetworkGraph from '../components/EntityNetworkGraph';
import './AdminArchivePage.css';

export default function GlobalGraphPage() {
  const [searchParams] = useSearchParams();
  const hasTarget = Boolean(searchParams.get('focus') || searchParams.get('center'));
  const [runTour, setRunTour] = useState(!hasTarget);

  const steps = [
    {
      target: '.eg-root',
      content: 'Welcome to the Knowledge Graph! This tool reveals connections between people and organizations based on our source documents.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#graph-mode-ring',
      content: 'Start with the Ring view to see all connections at once. Entities are grouped by their stances.',
    },
    {
      target: '#graph-mode-degrees',
      content: 'Switch to Six Degrees to map out how any entity is connected to a central hub.',
    },
    {
      target: '.eg-search',
      content: 'Looking for someone specific? Search for their name here to instantly locate them on the graph.',
    },
    {
      target: '#graph-color-stance',
      content: 'You can color the nodes by their stance (Champion, Critic) or by their type (Individual, Organization).',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 80px)', width: '100vw', padding: '2rem', boxSizing: 'border-box' }} className="lux-glide-in">
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: 'var(--c-goldBright)',
            backgroundColor: 'var(--c-bgCard)',
            textColor: 'var(--c-textBright)',
            arrowColor: 'var(--c-bgCard)',
            overlayColor: 'rgba(0, 0, 0, 0.7)'
          }
        }}
      />
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: 'var(--c-goldBright)', margin: '0 0 0.5rem 0', fontFamily: 'var(--f-display)', fontSize: '2rem' }}>Knowledge Graph</h1>
          <p style={{ color: 'var(--c-muted)', margin: 0, fontSize: '0.9rem' }}>Who is connected to whom, and the documents that prove it. Two names are linked when the same source document names them both.</p>
        </div>
        <button 
          onClick={() => setRunTour(true)}
          className="lux-hover-bright"
          style={{ 
            background: 'none', 
            border: '1px solid var(--c-goldDark)', 
            color: 'var(--c-gold)', 
            padding: '4px 12px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '0.8rem',
            transition: 'all 0.2s'
          }}
        >
          Restart Tour
        </button>
      </div>
      <div style={{ height: 'calc(100% - 4rem)' }}>
        <EntityNetworkGraph />
      </div>
    </div>
  );
}
