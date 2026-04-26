// ═══════════════════════════════════════════════════════════════════════════
// ExploreShell.jsx — top-level shell for the /explore route in the unified app
// Injects scoped CSS, parses hash routes (#/, #/pathways, #/q/:id),
// and mounts the appropriate sub-page (IndexPage / PathwayPage / QuestionPage).
//
// Architecture: ExplorePage wraps this shell. The outer React Router handles
// the path /explore; inside, hash routing handles sub-views so the URL stays
// shareable (e.g., findings.circumsurvey.online/explore#/q/exp_appearance_feeling).
// ═══════════════════════════════════════════════════════════════════════════

import { GLOBAL_CSS } from "./styles/tokens";
import { useRouter } from "./lib/router";
import IndexPage from "./pages/IndexPage";
import PathwayPage from "./pages/PathwayPage";
import QuestionPage from "./pages/QuestionPage";
import CulturalAlignmentPage from "./pages/CulturalAlignmentPage";
import MirrorPairsPage from "./pages/MirrorPairsPage";
import DemographicsDashboardPage from "./pages/DemographicsDashboardPage";
import ReligiousMirrorsPage from "./pages/ReligiousMirrorsPage";
import NarrativeMirrorsPage from "./pages/NarrativeMirrorsPage";
import GenerationalFaultlinesPage from "./pages/GenerationalFaultlinesPage";
import ObserverTriadPage from "./pages/ObserverTriadPage";

export default function ExploreShell() {
  const router = useRouter();
  const { route, params, state, navigate, updateState } = router;

  // The routerState prop is just the flat state object, so pages don't need
  // to know about the router's internals.
  const routerState = { ...state, params };

  let page;
  if (route === "pathways") {
    page = <PathwayPage routerState={routerState} navigate={navigate} updateState={updateState} />;
  } else if (route === "question") {
    page = <QuestionPage routerState={routerState} navigate={navigate} updateState={updateState} />;
  } else if (route === "cultural-alignment") {
    page = <CulturalAlignmentPage routerState={routerState} navigate={navigate} updateState={updateState} />;
  } else if (route === "pairs") {
    page = <MirrorPairsPage routerState={routerState} navigate={navigate} updateState={updateState} />;
  } else if (route === "demographics") {
    page = <DemographicsDashboardPage routerState={routerState} navigate={navigate} updateState={updateState} />;
  } else if (route === "religious-mirrors") {
    page = <ReligiousMirrorsPage routerState={routerState} navigate={navigate} updateState={updateState} />;
  } else if (route === "narrative-mirrors") {
    page = <NarrativeMirrorsPage routerState={routerState} navigate={navigate} updateState={updateState} />;
  } else if (route === "generational-faultlines") {
    page = <GenerationalFaultlinesPage routerState={routerState} navigate={navigate} updateState={updateState} />;
  } else if (route === "observer-triad") {
    page = <ObserverTriadPage routerState={routerState} navigate={navigate} updateState={updateState} />;
  } else {
    page = <IndexPage routerState={routerState} navigate={navigate} updateState={updateState} />;
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {page}
    </>
  );
}
