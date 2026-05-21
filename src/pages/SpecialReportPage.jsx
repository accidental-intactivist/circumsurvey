import React from 'react';
import SquishHeader from '../components/Scrollytelling/SquishHeader';
import ScrollyEngine from '../components/Scrollytelling/ScrollyEngine';
import HarmonicCanvas from '../components/HarmonicCanvas';

export default function SpecialReportPage() {
  return (
    <div style={{
      background: 'var(--c-bg)',
      minHeight: '100vh',
      color: 'var(--c-text)',
      fontFamily: "var(--f-body, 'Barlow', sans-serif)",
      transition: 'background 0.3s ease, color 0.3s ease',
      position: 'relative',
    }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <SquishHeader />
        <ScrollyEngine />
      </div>
    </div>
  );
}
