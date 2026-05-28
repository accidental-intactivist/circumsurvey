import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import AboutPage from './pages/AboutPage';
import FaqPage from './pages/FaqPage';
import SpecialReportPage from './pages/SpecialReportPage';
import { ThemeProvider } from './explore/contexts/ThemeContext';
import { GLOBAL_CSS } from './explore/styles/tokens';

export default function App() {
  return (
    <ThemeProvider>
      <style>{GLOBAL_CSS}</style>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore/*" element={<ExplorePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/special-report" element={<SpecialReportPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
