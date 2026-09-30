import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ReportProvider } from './contexts/ReportContext';
import { MediaListProvider } from './contexts/MediaListContext';
import { AssistantProvider, useAssistant } from './contexts/AssistantContext';
import AIAssistantFlyout from './components/AIAssistantFlyout';
import TopNav from './components/TopNav';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
// Lazy-loaded pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const AdminArchivePage = React.lazy(() => import('./pages/AdminArchivePage'));
const ReportBuilder = React.lazy(() => import('./pages/ReportBuilder'));
const CMSWrangler = React.lazy(() => import('./pages/CMSWrangler'));
const DigitalLibrary = React.lazy(() => import('./pages/DigitalLibrary'));
const DocumentView = React.lazy(() => import('./pages/DocumentView'));
const TimelineView = React.lazy(() => import('./pages/TimelineView'));
const ArchiveTracker = React.lazy(() => import('./pages/ArchiveTracker'));
const EntityManager = React.lazy(() => import('./pages/EntityManager'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const EntityDirectory = React.lazy(() => import('./pages/EntityDirectory'));
const GlobalGraphPage = React.lazy(() => import('./pages/GlobalGraphPage'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Policies = React.lazy(() => import('./pages/Policies'));
const CollectionPage = React.lazy(() => import('./pages/CollectionPage'));
const CollectionsIndex = React.lazy(() => import('./pages/CollectionsIndex'));
const SpecialReportPage = React.lazy(() => import('./pages/SpecialReportPage'));
const ExplorePage = React.lazy(() => import('./pages/ExplorePage'));
const NewsFeed = React.lazy(() => import('./pages/NewsFeed'));
const NewsArticle = React.lazy(() => import('./pages/NewsArticle'));
const SurveyStatsDashboard = React.lazy(() => import('./pages/SurveyStatsDashboard'));

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppLayout() {
  const { isOpen } = useAssistant();
  const location = useLocation();
  
  return (
    <div className={`app-container ${isOpen ? 'assistant-open' : ''}`}>
      <ScrollToTop />
      <TopNav />
      <main style={{ paddingTop: (location.pathname === '/' || location.pathname === '/report' || location.pathname.startsWith('/collections/')) ? '0px' : '80px', minHeight: '100dvh' }}>
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--c-dim)' }}>Loading...</div>}>
          <Routes>
            <Route path="/admin/archive" element={<ProtectedRoute requireCurator={true}><AdminArchivePage /></ProtectedRoute>} />
            <Route path="/admin/cms" element={<ProtectedRoute requireCurator={true}><CMSWrangler /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute requireCurator={true}><ArchiveTracker /></ProtectedRoute>} />
            <Route path="/admin/entities" element={<ProtectedRoute requireCurator={true}><EntityManager /></ProtectedRoute>} />
            <Route path="/to/:id" element={<ProfilePage />} />
            <Route path="/entities" element={<EntityDirectory />} />
            <Route path="/graph" element={<GlobalGraphPage />} />
            <Route path="/library" element={<DigitalLibrary />} />
            <Route path="/news" element={<NewsFeed />} />
            <Route path="/news/:id" element={<NewsArticle />} />
            <Route path="/survey-stats" element={<SurveyStatsDashboard />} />
            <Route path="/library/:id" element={<DocumentView />} />
            <Route path="/timeline" element={<TimelineView />} />
            <Route path="/assistant" element={<ReportBuilder />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/collections" element={<CollectionsIndex />} />
            <Route path="/collections/:slug" element={<CollectionPage />} />
            <Route path="/report" element={<SpecialReportPage />} />
            <Route path="/explore/*" element={<ExplorePage />} />
            <Route path="/sign-in/*" element={<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><SignIn routing="path" path="/sign-in" /></div>} />
            <Route path="/sign-up/*" element={<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><SignUp routing="path" path="/sign-up" /></div>} />
            <Route path="/*" element={<LandingPage />} />
          </Routes>
        </Suspense>
      </main>
      <AIAssistantFlyout />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ReportProvider>
        <MediaListProvider>
          <AssistantProvider>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </AssistantProvider>
        </MediaListProvider>
      </ReportProvider>
    </ThemeProvider>
  );
}

export default App;
