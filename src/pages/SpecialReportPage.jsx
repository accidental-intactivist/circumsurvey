import React from 'react';
import SquishHeader from '../components/Scrollytelling/SquishHeader';
import ScrollyEngine from '../components/Scrollytelling/ScrollyEngine';

export default function SpecialReportPage() {
  return (
    <div className="special-report-page bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] font-sans antialiased">
      <SquishHeader />
      <ScrollyEngine />
    </div>
  );
}
