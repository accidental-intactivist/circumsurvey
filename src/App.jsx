import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import SpecialReportPage from './pages/SpecialReportPage';
import { ThemeProvider } from './explore/contexts/ThemeContext';
import { GLOBAL_CSS } from './explore/styles/tokens';

export default function App() {
  return (
    <ThemeProvider>
      <style>{GLOBAL_CSS}</style>
      <BrowserRouter>
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
