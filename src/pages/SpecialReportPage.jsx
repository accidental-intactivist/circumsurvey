import React, { useState, useEffect } from 'react';
import SquishHeader from '../components/Scrollytelling/SquishHeader';
import GuidedTour from '../components/GuidedTour/GuidedTour';
import GlobalFooter from '../explore/components/GlobalFooter';
import GlobalDocentDrawer from '../explore/components/GlobalDocentDrawer';
import { ReportProvider } from '../explore/contexts/ReportContext';

// The Special Report — a guided tour through all fourteen exhibits of the
// exhibition, in the Accidental Intactivist's reporting voice. Fully
// theme-engine native (same tokens/typeface/mode/colorblind as /explore).
// GlobalFooter provides the exhibition's Master Index directory; navigation
// from here crosses into the Explore app.
export default function SpecialReportPage() {
  const [isDocentOpen, setDocentOpen] = useState(false);
  const [docentContext, setDocentContext] = useState(null);

  useEffect(() => {
    const handleOpenDocent = (e) => {
      if (e.detail?.context) setDocentContext(e.detail.context);
      setDocentOpen(true);
    };
    window.addEventListener('open-docent', handleOpenDocent);
    return () => window.removeEventListener('open-docent', handleOpenDocent);
  }, []);

  const navigateToExplore = (route) => {
    window.location.href = route === 'index' ? '/explore' : `/explore#/${route}`;
  };
  return (
    <ReportProvider>
      <div style={{
        background: 'var(--c-bg)',
        minHeight: '100vh',
        color: 'var(--c-text)',
        fontFamily: "var(--f-body, 'Barlow', sans-serif)",
        transition: 'background 0.3s ease, color 0.3s ease',
        position: 'relative',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }} className={isDocentOpen ? 'docent-open' : ''}>
          <SquishHeader />
          <GuidedTour />
          <GlobalFooter route="special-report" navigate={navigateToExplore} />
        </div>
        <GlobalDocentDrawer 
          isOpen={isDocentOpen} 
          onClose={() => setDocentOpen(false)}
          exhibitContext={docentContext}
        />
      </div>
    </ReportProvider>
  );
}
