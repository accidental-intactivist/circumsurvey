import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import SpecialReportPage from './pages/SpecialReportPage';
import { ThemeProvider } from './explore/contexts/ThemeContext';
import { GLOBAL_CSS } from './explore/styles/tokens';
import { initTelemetry, useTelemetry } from './explore/lib/telemetry';

/** Track pageviews on every route change so PostHog captures UTM params */
function PageviewTracker() {
  const location = useLocation();
  const { trackPageview } = useTelemetry();

  useEffect(() => {
    trackPageview(window.location.href);
  }, [location.pathname, location.search]);

  return null;
}

export default function App() {
  // Initialize PostHog once on mount
  useEffect(() => { initTelemetry(); }, []);

  return (
    <ThemeProvider>
      <style>{GLOBAL_CSS}</style>
      <BrowserRouter>
        <PageviewTracker />
        <Routes>
          {/* The Special Report (guided tour) is the front door of the
              findings site. The former landing page remains at /landing. */}
          <Route path="/" element={<SpecialReportPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/explore/*" element={<ExplorePage />} />
          <Route path="/special-report" element={<Navigate to="/" replace />} />
          <Route path="/*" element={<ExplorePage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
