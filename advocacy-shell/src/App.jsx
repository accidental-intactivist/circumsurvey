import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import AdminArchivePage from './pages/AdminArchivePage';
import ArchiveExplorer from './pages/ArchiveExplorer';
import ReportBuilder from './pages/ReportBuilder';
import CMSWrangler from './pages/CMSWrangler';
import DigitalLibrary from './pages/DigitalLibrary';
import DocumentView from './pages/DocumentView';
import ArchiveTracker from './pages/ArchiveTracker';
import EntityManager from './pages/EntityManager';
import TopNav from './components/TopNav';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <TopNav />
        <main style={{ paddingTop: '80px', minHeight: '100dvh' }}>
          <Routes>
          <Route path="/admin/archive" element={<AdminArchivePage />} />
          <Route path="/admin/cms" element={<CMSWrangler />} />
          <Route path="/admin/inventory" element={<ArchiveTracker />} />
          <Route path="/admin/entities" element={<EntityManager />} />
          <Route path="/archive" element={<ArchiveExplorer />} />
          <Route path="/library" element={<DigitalLibrary />} />
          <Route path="/library/:id" element={<DocumentView />} />
          <Route path="/assistant" element={<ReportBuilder />} />
            <Route path="/*" element={<LandingPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
