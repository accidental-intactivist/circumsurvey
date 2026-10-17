import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
const GuideOrProfile = React.lazy(() => import('./pages/GuideOrProfile'));
const HadachekExhibitPage = React.lazy(() => import('./pages/HadachekExhibitPage'));
const LegalActionsGuidePage = React.lazy(() => import('./pages/LegalActionsGuidePage'));
const EntityDirectory = React.lazy(() => import('./pages/EntityDirectory'));
const GlobalGraphPage = React.lazy(() => import('./pages/GlobalGraphPage'));
const CitationWebPage = React.lazy(() => import('./pages/CitationWebPage'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Policies = React.lazy(() => import('./pages/Policies'));
const CollectionPage = React.lazy(() => import('./pages/CollectionPage'));
const CollectionsIndex = React.lazy(() => import('./pages/CollectionsIndex'));
const SpecialReportPage = React.lazy(() => import('./pages/SpecialReportPage'));
const ExplorePage = React.lazy(() => import('./pages/ExplorePage'));
const NewsFeed = React.lazy(() => import('./pages/NewsFeed'));
const NewsArticle = React.lazy(() => import('./pages/NewsArticle'));
const SurveyStatsDashboard = React.lazy(() => import('./pages/SurveyStatsDashboard'));
const GuideBuilderPage = React.lazy(() => import('./pages/GuideBuilderPage'));
const GuideView = React.lazy(() => import('./pages/GuideView'));
const CounterEvidencePage = React.lazy(() => import('./pages/CounterEvidencePage'));
const AtlasPage = React.lazy(() => import('./pages/AtlasPage'));
const InfographicGenerator = React.lazy(() => import('./pages/InfographicGenerator'));
const ManifestoPage = React.lazy(() => import('./pages/ManifestoPage'));
const DiseaseOfTheDecadePage = React.lazy(() => import('./pages/DiseaseOfTheDecadePage'));
const ReciteBackConsentPage = React.lazy(() => import('./pages/ReciteBackConsentPage'));
const UsRicRatesPage = React.lazy(() => import('./pages/UsRicRatesPage'));
const DataHubPage = React.lazy(() => import('./pages/DataHubPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function AppLayout() {
  const { isOpen } = useAssistant();
  const location = useLocation();
  
  return (
    <div className={`app-container ${isOpen ? 'assistant-open' : ''}`}>
      <ScrollToTop />
      <TopNav />
      <main style={{ paddingTop: (location.pathname === '/' || location.pathname === '/report' || location.pathname === '/manifesto' || location.pathname.startsWith('/collections/') || location.pathname === '/news' || location.pathname.startsWith('/explore')) ? '0px' : '80px', minHeight: '100dvh' }}>
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--c-dim)' }}>Loading...</div>}>
          <Routes>
            <Route path="/admin/archive" element={<ProtectedRoute requireCurator={true}><AdminArchivePage /></ProtectedRoute>} />
            <Route path="/admin/cms" element={<ProtectedRoute requireCurator={true}><CMSWrangler /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute requireCurator={true}><ArchiveTracker /></ProtectedRoute>} />
            <Route path="/admin/entities" element={<ProtectedRoute requireCurator={true}><EntityManager /></ProtectedRoute>} />
            <Route path="/to/*" element={<GuideOrProfile />} />
            <Route path="/disease-of-the-decade" element={<DiseaseOfTheDecadePage />} />
            <Route path="/retcons" element={<DiseaseOfTheDecadePage />} />
            <Route path="/exhibits/disease-of-the-decade" element={<DiseaseOfTheDecadePage />} />
            <Route path="/consent" element={<ReciteBackConsentPage />} />
            <Route path="/honest-consent" element={<ReciteBackConsentPage />} />
            <Route path="/exhibits/consent" element={<ReciteBackConsentPage />} />
            <Route path="/rates" element={<UsRicRatesPage />} />
            <Route path="/us-ric-rates" element={<UsRicRatesPage />} />
            <Route path="/exhibits/rates" element={<UsRicRatesPage />} />
            <Route path="/exhibits/hadachek" element={<HadachekExhibitPage />} />
            <Route path="/hadachek" element={<HadachekExhibitPage />} />
            <Route path="/exhibits/huff" element={<LegalActionsGuidePage />} />
            <Route path="/huff" element={<LegalActionsGuidePage />} />
            <Route path="/legal" element={<LegalActionsGuidePage />} />
            <Route path="/litigation" element={<LegalActionsGuidePage />} />
            <Route path="/entities" element={<EntityDirectory />} />
            <Route path="/graph" element={<GlobalGraphPage />} />
            <Route path="/citations" element={<CitationWebPage />} />
            <Route path="/guides" element={<GuideBuilderPage />} />
            <Route path="/guides/view" element={<GuideView />} />
            <Route path="/guides/rebuttals" element={<CounterEvidencePage />} />
            <Route path="/atlas" element={<AtlasPage />} />
            <Route path="/data" element={<DataHubPage />} />
            <Route path="/media" element={<Navigate to="/news" replace />} />
            <Route path="/share" element={<InfographicGenerator />} />
            <Route path="/library" element={<DigitalLibrary />} />
            <Route path="/news" element={<NewsFeed />} />
            <Route path="/news/:id" element={<NewsArticle />} />
            <Route path="/survey-stats" element={<SurveyStatsDashboard />} />
            <Route path="/library/:id" element={<DocumentView />} />
            <Route path="/timeline" element={<TimelineView />} />
            <Route path="/assistant" element={<ReportBuilder />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/collections" element={<Navigate to="/collections/tim-hammond-archive" replace />} />
            <Route path="/collections/:slug" element={<CollectionPage />} />
            <Route path="/report" element={<SpecialReportPage />} />
            <Route path="/manifesto" element={<ManifestoPage />} />
            <Route path="/explore/*" element={<ExplorePage />} />
            {/* Direct aliases for Explore exhibits and standalone shortcuts */}
            <Route path="/demographics" element={<Navigate to="/explore/demographics" replace />} />
            <Route path="/pairs" element={<Navigate to="/explore/pairs" replace />} />
            <Route path="/pleasure-gap" element={<Navigate to="/explore/pleasure-gap" replace />} />
            <Route path="/culture" element={<Navigate to="/explore/culture" replace />} />
            <Route path="/narrative-mirrors" element={<Navigate to="/explore/narrative-mirrors" replace />} />
            <Route path="/numbers" element={<Navigate to="/explore/numbers" replace />} />
            <Route path="/correlations" element={<Navigate to="/explore/correlations" replace />} />
            <Route path="/restoration-journey" element={<Navigate to="/explore/restoration-journey" replace />} />
            <Route path="/tools/cultural-alignment" element={<Navigate to="/explore/tools/cultural-alignment" replace />} />
            <Route path="/foregen" element={<Navigate to="/to/foregen" replace />} />
            <Route path="/tim-hammond-archive" element={<Navigate to="/collections/tim-hammond-archive" replace />} />
            <Route path="/archive" element={<Navigate to="/collections/tim-hammond-archive" replace />} />
            <Route path="/archives" element={<Navigate to="/collections/tim-hammond-archive" replace />} />
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
