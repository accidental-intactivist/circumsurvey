// ═══════════════════════════════════════════════════════════════════════════
// ExploreShell.jsx — top-level shell for the /explore route in the unified app
// Injects scoped CSS, parses hash routes (#/, #/pathways, #/q/:id),
// and mounts the appropriate sub-page (IndexPage / PathwayPage / QuestionPage).
//
// Architecture: ExplorePage wraps this shell. The outer React Router handles
// the path /explore; inside, hash routing handles sub-views so the URL stays
// shareable (e.g., findings.circumsurvey.online/explore#/q/exp_appearance_feeling).
//
// Performance: All exhibit pages except IndexPage are lazy-loaded via
// React.lazy() so the initial bundle only includes the shell + index.
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, lazy, Suspense } from "react";
import { useRouter } from "./lib/router";
import ExploreMasthead from "./components/ExploreMasthead";
import GlobalDocentDrawer from "./components/GlobalDocentDrawer";
import IndexPage from "./pages/IndexPage"; // Static — default landing page
import GlobalFooter from "./components/GlobalFooter";
import ErrorBoundary from "./ErrorBoundary";

// ── Lazy-loaded exhibit pages ──────────────────────────────────────────────
const PathwayPage = lazy(() => import("./pages/PathwayPage"));
const QuestionPage = lazy(() => import("./pages/QuestionPage"));
const CorrelationExplorerPage = lazy(() => import("./pages/CorrelationExplorerPage"));
const MirrorPairsPage = lazy(() => import("./pages/MirrorPairsPage"));
const DemographicsDashboardPage = lazy(() => import("./pages/DemographicsDashboardPage"));
const PleasureGapPage = lazy(() => import("./pages/PleasureGapPage"));
const ReligiousMirrorsPage = lazy(() => import("./pages/ReligiousMirrorsPage"));
const NarrativeMirrorsPage = lazy(() => import("./pages/NarrativeMirrorsPage"));
const ObserverLensPage = lazy(() => import("./pages/ObserverLensPage"));
const MethodologyPage = lazy(() => import("./pages/MethodologyPage"));
const ReportBuilderPage = lazy(() => import("./pages/ReportBuilderPage"));
const ByTheNumbersPage = lazy(() => import("./pages/ByTheNumbersPage"));
const RestorationJourneyPage = lazy(() => import("./pages/RestorationJourneyPage"));
const CultureGenerationsPage = lazy(() => import("./pages/CultureGenerationsPage"));
const TheDecisionPage = lazy(() => import("./pages/TheDecisionPage"));
const AdultExperiencePage = lazy(() => import("./pages/AdultExperiencePage"));
const TransIntersexPage = lazy(() => import("./pages/TransIntersexPage"));
const TheForwardViewPage = lazy(() => import("./pages/TheForwardViewPage"));
const ForParentsPage = lazy(() => import("./pages/ForParentsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const GetInvolvedPage = lazy(() => import("./pages/GetInvolvedPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const EditorialDashboardPage = lazy(() => import("./pages/EditorialDashboardPage"));

// ── Loading spinner for Suspense boundaries ────────────────────────────────
function ExhibitSpinner() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", flexDirection: "column", gap: "1rem",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "3px solid var(--c-ghost, #333)",
        borderTopColor: "var(--c-gold, #c8a959)",
        animation: "exhibit-spin 0.8s linear infinite",
      }} />
      <span style={{
        fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
        fontSize: "0.75rem", letterSpacing: "0.15em",
        textTransform: "uppercase", color: "var(--c-muted, #888)",
      }}>Loading exhibit…</span>
      <style>{`@keyframes exhibit-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ExploreShell() {
  const router = useRouter();
  const { route, params, state, navigate, updateState } = router;

  // The routerState prop is just the flat state object, so pages don't need
  // to know about the router's internals.
  const routerState = { ...state, params };

  const [customMeta, setCustomMeta] = useState(null);
  const [exhibitContext, setExhibitContext] = useState(null);
  const [isDocentOpen, setDocentOpen] = useState(false);
  const [visibleSection, setVisibleSection] = useState(null);
  const [docentTourSuas, setDocentTourSuas] = useState(null);

  // Listen for global open-docent events
  useEffect(() => {
    const handleOpenDocent = (e) => {
      if (e.detail?.context) {
        setExhibitContext(prev => ({ ...prev, overrideContext: e.detail.context }));
      }
      if (e.detail?.tourSuas) {
        setDocentTourSuas(e.detail.tourSuas);
      }
      if (e.detail?.query && updateState) {
        updateState({ ai_query: e.detail.query });
      }
      setDocentOpen(true);
    };
    window.addEventListener('open-docent', handleOpenDocent);
    return () => window.removeEventListener('open-docent', handleOpenDocent);
  }, [updateState]);

  // Reset custom page metadata and context whenever the route or active question ID changes
  useEffect(() => {
    setCustomMeta(null);
    setExhibitContext(null);
    setVisibleSection(null);
    setDocentTourSuas(null);
  }, [route, params.id]);

  // Set up scroll-spy for AI Docent context tracking
  useEffect(() => {
    let timeout;
    const observer = new IntersectionObserver((entries) => {
      // Find the element with the highest intersection ratio
      let maxRatio = 0;
      let mostVisible = null;
      
      entries.forEach(entry => {
        if (entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          mostVisible = entry.target.getAttribute("data-docent-context");
        }
      });
      
      if (mostVisible && maxRatio > 0) {
        // Debounce slightly to avoid jitter during fast scrolling
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setVisibleSection(mostVisible);
        }, 300);
      }
    }, {
      root: null,
      rootMargin: "-20% 0px -40% 0px", // Bias towards the upper-middle of the screen
      threshold: [0, 0.25, 0.5, 0.75, 1.0]
    });

    // We use a MutationObserver to re-bind the IntersectionObserver when the DOM changes (e.g., page loads)
    const domObserver = new MutationObserver(() => {
      const sections = document.querySelectorAll("[data-docent-context]");
      sections.forEach(s => observer.observe(s));
    });
    
    domObserver.observe(document.body, { childList: true, subtree: true });
    
    // Initial bind
    const sections = document.querySelectorAll("[data-docent-context]");
    sections.forEach(s => observer.observe(s));

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
      domObserver.disconnect();
    };
  }, []);

  let page;
  if (route === "pathways") {
    page = <PathwayPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "question") {
    page = <QuestionPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "correlations") {
    page = <CorrelationExplorerPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "pairs") {
    page = <MirrorPairsPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "demographics") {
    page = <DemographicsDashboardPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "pleasure-gap") {
    page = <PleasureGapPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "religious-mirrors") {
    page = <ReligiousMirrorsPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "narrative-mirrors") {
    page = <NarrativeMirrorsPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "generational-faultlines" || route === "culture") {
    page = <CultureGenerationsPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "observer-triad" || route === "observer-lens") {
    page = <ObserverLensPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "methodology") {
    page = <MethodologyPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "report") {
    page = <ReportBuilderPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "numbers") {
    page = <ByTheNumbersPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "restoration-journey") {
    page = <RestorationJourneyPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "the-decision") {
    page = <TheDecisionPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "adult-experience") {
    page = <AdultExperiencePage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "for-parents") {
    page = <ForParentsPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "trans-intersex") {
    page = <TransIntersexPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "the-forward-view") {
    page = <TheForwardViewPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "about") {
    page = <AboutPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "faq") {
    page = <FaqPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "get-involved") {
    page = <GetInvolvedPage />;
  } else if (route === "contact") {
    page = <ContactPage />;
  } else if (route === "resources") {
    page = <ResourcesPage />;
  } else if (route === "editorial") {
    page = <EditorialDashboardPage />;
  } else if (route === "not-found") {
    page = <NotFoundPage onOpenDocent={() => setDocentOpen(true)} />;
  } else {
    page = <IndexPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  }

  return (
    <>
      <style>{`
        .explore-page-container {
          transition: padding-right 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          padding-right: 0;
        }
        @media (min-width: 900px) {
          .docent-open-masthead {
            right: 480px !important;
          }
          .explore-page-container.docent-open {
            padding-right: 480px;
          }
        }
      `}</style>
      <ExploreMasthead 
        route={route || "index"} 
        navigate={navigate} 
        customMeta={customMeta} 
        isDocentOpen={isDocentOpen}
        setDocentOpen={setDocentOpen}
      />
      <main className={`explore-page-container ${isDocentOpen ? 'docent-open' : ''}`} style={{ minHeight: "80vh" }}>
        <ErrorBoundary>
          <Suspense fallback={<ExhibitSpinner />}>
            {page}
          </Suspense>
        </ErrorBoundary>
        <GlobalFooter currentRoute={route} navigate={navigate} />
      </main>
      <GlobalDocentDrawer 
        isOpen={isDocentOpen} 
        onClose={() => setDocentOpen(false)}
        routerState={routerState}
        updateState={updateState}
        exhibitContext={{ ...exhibitContext, visibleSection }}
        tourSuas={docentTourSuas}
      />
    </>
  );
}
