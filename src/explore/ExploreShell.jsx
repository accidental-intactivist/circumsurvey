// ═══════════════════════════════════════════════════════════════════════════
// ExploreShell.jsx — top-level shell for the /explore route in the unified app
// Injects scoped CSS, parses hash routes (#/, #/pathways, #/q/:id),
// and mounts the appropriate sub-page (IndexPage / PathwayPage / QuestionPage).
//
// Architecture: ExplorePage wraps this shell. The outer React Router handles
// the path /explore; inside, hash routing handles sub-views so the URL stays
// shareable (e.g., findings.circumsurvey.online/explore#/q/exp_appearance_feeling).
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useRouter } from "./lib/router";
import ExploreMasthead from "./components/ExploreMasthead";
import GlobalDocentDrawer from "./components/GlobalDocentDrawer";
import IndexPage from "./pages/IndexPage";
import PathwayPage from "./pages/PathwayPage";
import QuestionPage from "./pages/QuestionPage";
import CorrelationExplorerPage from "./pages/CorrelationExplorerPage";
import MirrorPairsPage from "./pages/MirrorPairsPage";
import DemographicsDashboardPage from "./pages/DemographicsDashboardPage";
import PleasureGapPage from "./pages/PleasureGapPage";
import ReligiousMirrorsPage from "./pages/ReligiousMirrorsPage";
import NarrativeMirrorsPage from "./pages/NarrativeMirrorsPage";
import ObserverLensPage from "./pages/ObserverLensPage";
import MethodologyPage from "./pages/MethodologyPage";
import ReportBuilderPage from "./pages/ReportBuilderPage";
import ByTheNumbersPage from "./pages/ByTheNumbersPage";
import RestorationJourneyPage from "./pages/RestorationJourneyPage";
import CultureGenerationsPage from "./pages/CultureGenerationsPage";
import TheDecisionPage from "./pages/TheDecisionPage";
import AdultExperiencePage from "./pages/AdultExperiencePage"; // Trigger HMR
import FinalThoughtsPage from "./pages/FinalThoughtsPage";
import TransIntersexPage from "./pages/TransIntersexPage";
import TheForwardViewPage from "./pages/TheForwardViewPage";
import ForParentsPage from "./pages/ForParentsPage";

export default function ExploreShell() {
  const router = useRouter();
  const { route, params, state, navigate, updateState } = router;

  // The routerState prop is just the flat state object, so pages don't need
  // to know about the router's internals.
  const routerState = { ...state, params };

  const [customMeta, setCustomMeta] = useState(null);
  const [exhibitContext, setExhibitContext] = useState(null);
  const [isDocentOpen, setDocentOpen] = useState(false);

  // Reset custom page metadata and context whenever the route or active question ID changes
  useEffect(() => {
    setCustomMeta(null);
    setExhibitContext(null);
  }, [route, params.id]);

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
  } else if (route === "final-thoughts") {
    page = <FinalThoughtsPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "trans-intersex") {
    page = <TransIntersexPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else if (route === "the-forward-view") {
    page = <TheForwardViewPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  } else {
    page = <IndexPage routerState={routerState} navigate={navigate} updateState={updateState} setCustomMeta={setCustomMeta} setExhibitContext={setExhibitContext} />;
  }

  return (
    <>
      <ExploreMasthead 
        route={route || "index"} 
        navigate={navigate} 
        customMeta={customMeta} 
        isDocentOpen={isDocentOpen}
        setDocentOpen={setDocentOpen}
      />
      {page}
      <GlobalDocentDrawer 
        isOpen={isDocentOpen} 
        onClose={() => setDocentOpen(false)}
        routerState={routerState}
        updateState={updateState}
        exhibitContext={exhibitContext}
      />
    </>
  );
}
