// ═══════════════════════════════════════════════════════════════════════════
// ExploreMasthead.jsx — Shared squishing masthead for all Explore pages
//
// The page's title + description IS the hero content that squishes down
// into a compact glassmorphic nav bar. This eliminates the old pattern
// where each page rendered its own <header>/<h1> redundantly.
//
// Hero (expanded):  Page title + interpretive description + HarmonicCanvas
// Collapsed (nav):  Brand "Explore" + breadcrumb + ThemeToggle + Findings
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { C, FONT, RAINBOW } from "../styles/tokens";
import { useTheme } from "../contexts/ThemeContext";
import HarmonicCanvas from "../../components/HarmonicCanvas";
import ThemeToggle from "./ThemeToggle";
import { Sparkles } from "./Icons";
import { Play, Pause } from "lucide-react";

// ── Easy-to-adjust height constants ─────────────────────────────────────
const HERO_HEIGHT = 240;   // px – hero / expanded state (adjust to taste)
const NAV_HEIGHT = 56;     // px – collapsed / docked state
const SCROLL_THRESHOLD = 100; // px of scroll before collapse triggers

// ── Route metadata ──────────────────────────────────────────────────────
// These are the definitive page titles and descriptions. The individual
// pages no longer render their own headers — this is the single source.
export const ROUTE_META = {
  index: {
    kicker: "★ The Accidental Intactivist's Inquiry ★",
    title: "Explore the Data",
    desc: "501 voices across every pathway and 355 questions. Filter by cohort, search, compare, and let the AI Research Assistant guide your exploration.",
    navTitle: "Master Index",
  },
  pathways: {
    kicker: "Exhibit 01",
    title: "The Survey Map",
    desc: "Interactive flowchart of the complete survey architecture — from universal questions through the pathway fork and into each cohort's unique question sets.",
    navTitle: "Survey Map",
  },
  pairs: {
    kicker: "Exhibit 02",
    title: "Mirror Pairs & Cohort Contrasts",
    desc: "Explore parallel questions asked directly to intact and circumcised cohorts, as well as universal cultural and anatomical questions broken down side-by-side. This view highlights the striking divergence in cohort experience, expectation, and societal perception.",
    navTitle: "Mirror Pairs",
  },
  "pleasure-gap": {
    kicker: "Exhibit 03",
    title: "The Pleasure Gap",
    desc: "Clustered self-reported ratings comparing sensation, sensitivity, and orgasm across cohorts. What do the numbers reveal when people speak for themselves?",
    navTitle: "Pleasure Gap",
  },
  correlations: {
    kicker: "Exhibit 04",
    title: "CORRELATIONS EXPLORER",
    desc: "Cross-tabulate predictor variables against the respondent pathway to identify statistical correlations and predictive demographic factors.",
    navTitle: "Correlations",
  },
  demographics: {
    kicker: "Exhibit 05",
    title: "Demographic Explorer",
    desc: "Explore the demographic composition of each cohort — age, generation, sexuality, education, religion, and geographic distribution.",
    navTitle: "Demographics",
  },
  "narrative-mirrors": {
    kicker: "Exhibit 06",
    title: "Narrative Mirrors",
    desc: "Side-by-side word clouds and full-text search across open-ended narratives. Hear the language each cohort uses in their own words.",
    navTitle: "Narratives",
  },
  "observer-lens": {
    kicker: "Exhibit 08",
    title: "The Observer Lens",
    desc: "Expanded analysis of all Observer pathways including partners, parents, healthcare, researchers and advocates.",
    navTitle: "Observer Triad",
  },
  "religious-mirrors": {
    kicker: "Exhibit 09",
    title: "Religious Mirrors",
    desc: "Compare attitudes across Jewish, Christian, and Islamic respondents. Where does faith intersect with — or diverge from — personal experience?",
    navTitle: "Religious Mirrors",
  },
  "restoration-journey": {
    kicker: "Exhibit 10",
    title: "Restoration Journey",
    desc: "Track the methods, motivations, and physical/psychological progress (RCI scores, sensitivity gains, and orgasm quality) of the restoring cohort.",
    navTitle: "Restoring",
  },
  methodology: {
    kicker: "Reference",
    title: "Methodology",
    desc: "Survey design, sampling methodology, statistical approach, and limitations. Full transparency on how this data was collected and analyzed.",
    navTitle: "Methodology",
  },
  report: {
    kicker: "Tools",
    title: "Report Builder",
    desc: "Assemble your own curated selection of exhibits, charts, and findings into a shareable report.",
    navTitle: "Report Builder",
  },
  question: {
    kicker: "Deep Dive",
    title: "Question Detail",
    desc: "Full response distribution, cohort comparison, demographic breakdowns, and AI-powered analysis for a single survey question.",
    navTitle: "Question",
  },
  numbers: {
    kicker: "Exhibit 12",
    title: "By The Numbers",
    desc: "The core findings of the study summarized in key outcome metrics. Use cohort filters to examine specific subgroups.",
    navTitle: "By The Numbers",
  },
  culture: {
    kicker: "Exhibit 07",
    title: "Culture & Generations",
    desc: "Explore how cultural norms, stereotypes, and attitudes shift across cohorts and across generations — from the Silent Generation through Gen Z.",
    navTitle: "Culture & Generations",
  },
  "the-decision": {
    kicker: "Exhibit 13",
    title: "The Decision",
    desc: "A deep dive into the Parent Observer subgroup, tracing the timeline, tipping points, and reflections of parents making the circumcision decision.",
    navTitle: "The Decision",
  },
  "for-parents": {
    kicker: "Exhibit 13",
    title: "For New & Expectant Parents",
    desc: "A curated, shareable resource presenting what grown children, other parents, medical professionals, and faith communities say — so you can make the most informed decision.",
    navTitle: "For Parents",
  },
  "final-thoughts": {
    kicker: "Exhibit 15",
    title: "Missing Info & Wrap-Up",
    desc: "The final questions on missing public information, reasoning for future children, and what else respondents wanted to share.",
    navTitle: "Final Thoughts",
  },
  "the-forward-view": {
    kicker: "Exhibit 14",
    title: "The Forward View",
    desc: "How lived experience informs the choices we make for the next generation.",
    navTitle: "The Forward View",
  },
  "trans-intersex": {
    kicker: "Phase 2",
    title: "Trans & Intersex Experiences",
    desc: "A deep dive into transgender and intersex perspectives, which require distinct analytical lenses to be fully explored in Phase 2 of this project.",
    navTitle: "Trans & Intersex",
  },
  about: {
    kicker: "Project",
    title: "About the Project",
    desc: "Methodology, central hypothesis, and the ethical philosophy behind The Accidental Intactivist's Inquiry.",
    navTitle: "About",
  },
  faq: {
    kicker: "Questions",
    title: "Frequently Asked Questions",
    desc: "Your questions, our answers. Everything from the survey structure to engaging with pro-circumcision arguments.",
    navTitle: "FAQ",
  },
  "get-involved": {
    kicker: "Action",
    title: "Get Involved & Support",
    desc: "Help us expand our reach, volunteer your skills, or support this independent research project.",
    navTitle: "Get Involved",
  },
  resources: {
    kicker: "Library",
    title: "Resources & Downloads",
    desc: "Dive deeper into the research, download the Manifesto, and access shareable materials.",
    navTitle: "Resources",
  }
};

export const EXHIBIT_ROUTES = [
  { route: "pathways", num: "Exhibit 01", label: "The Survey Map", tagline: "Interactive survey architecture flowchart", icon: "Compass", colorVar: "var(--c-blue)" },
  { route: "pairs", num: "Exhibit 02", label: "Mirror Pairs", tagline: "Side-by-side cohort question contrasts", icon: "Scale", colorVar: "var(--c-gold)" },
  { route: "pleasure-gap", num: "Exhibit 03", label: "The Pleasure Gap", tagline: "Sensation, sensitivity & orgasm ratings", icon: "Heart", colorVar: "var(--c-green)" },
  { route: "correlations", num: "Exhibit 04", label: "Correlations Explorer", tagline: "Cross-tabulate demographic predictors", icon: "Grid", colorVar: "var(--c-red)" },
  { route: "demographics", num: "Exhibit 05", label: "Demographic Explorer", tagline: "Age, generation, geography & more", icon: "Users", colorVar: "var(--c-purple)" },
  { route: "narrative-mirrors", num: "Exhibit 06", label: "The Voices", tagline: "Open-ended narratives & word clouds", icon: "MessageSquareText", colorVar: "var(--c-orange)" },
  { route: "culture", num: "Exhibit 07", label: "Culture & Generations", tagline: "Norms, stereotypes & generational shifts", icon: "Globe", colorVar: "var(--c-ltBlue)" },
  { route: "observer-lens", num: "Exhibit 08", label: "The Observer Lens", tagline: "Partners, parents & professionals", icon: "Eye", colorVar: "var(--c-grey)" },
  { route: "religious-mirrors", num: "Exhibit 09", label: "Religious Mirrors", tagline: "Faith, tradition & personal experience", icon: "BookOpen", colorVar: "var(--c-blue)" },
  { route: "restoration-journey", num: "Exhibit 10", label: "Restoration Journey", tagline: "Methods, progress & sensitivity gains", icon: "RefreshCw", colorVar: "var(--c-gold)" },
  { route: "adult-experience", num: "Exhibit 11", label: "Before & After: The Adult Experience", tagline: "Those who remember both states", icon: "Zap", colorVar: "var(--c-green)" },
  { route: "numbers", num: "Exhibit 12", label: "By the Numbers", tagline: "Key statistical stories & functional shifts", icon: "BarChart2", colorVar: "var(--c-gold)" },
  // "the-decision" (was Exhibit 13) — hidden from discovery until Phase 2 content exists. Page stub + route remain.
  { route: "for-parents", num: "Exhibit 13", label: "For New & Expectant Parents", tagline: "Curated data for informed decisions", icon: "Shield", colorVar: "var(--c-red)" },
  // "final-thoughts" (was Exhibit 15) — hidden from discovery until Phase 2 content exists. Page stub + route remain.
  { route: "the-forward-view", num: "Exhibit 14", label: "The Forward View", tagline: "Decisions for the next generation", icon: "FastForward", colorVar: "var(--c-purple)" },
];

export default function ExploreMasthead({ route, navigate, customMeta, isDocentOpen, setDocentOpen }) {
  const { theme, mode, colorblind, typeface } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const headerRef = useRef(null);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [loomPaused, setLoomPaused] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cs_loom_paused") === "true";
    }
    return false;
  });

  const toggleLoom = () => {
    setLoomPaused(prev => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("cs_loom_paused", String(next));
      }
      return next;
    });
  };

  useEffect(() => {
    const onToggleLoom = (e) => {
      setLoomPaused(prev => {
        let next = !prev;
        if (e.detail && typeof e.detail.enabled === 'boolean') {
          next = !e.detail.enabled;
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("cs_loom_paused", String(next));
        }
        return next;
      });
    };
    window.addEventListener('toggle-loom', onToggleLoom);
    return () => window.removeEventListener('toggle-loom', onToggleLoom);
  }, []);

  // Close breadcrumb dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // ── Scroll listener & Custom Property ──────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const meta = customMeta || ROUTE_META[route] || ROUTE_META.index;
  const isIndex = route === "index" || !route;

  const currentHeight = Math.max(NAV_HEIGHT, HERO_HEIGHT - scrollY);
  const scrolled = scrollY > SCROLL_THRESHOLD;

  useEffect(() => {
    document.documentElement.style.setProperty("--header-height", `${currentHeight}px`);
    return () => {
      document.documentElement.style.removeProperty("--header-height");
    };
  }, [currentHeight]);

  // Calculate smooth 1:1 scroll progress for the title scaling and movement
  // Completion point is when the header is fully collapsed (184px scroll)
  const progress = Math.min(1, Math.max(0, scrollY / (HERO_HEIGHT - NAV_HEIGHT)));
  const translateY = -108 * progress; // Moves center from 136px to 28px (vertical center of 56px navbar)
  const scale = 1 - 0.6 * progress; // squishes down to 40% of its expanded size

  // Josefin Sans (Tomorrow font) has high ascenders, making uppercase text sit visually low.
  // We apply a vertical offset (-4.5px when expanded, -2.5px when collapsed) to center it.
  const isTomorrow = typeface === "tomorrow";
  const tomorrowOffset = isTomorrow ? -4.5 + 2 * progress : 0;

  return (
    <>
      <style>
        {`
          .mobile-only { display: none; }
          @media (max-width: 768px) {
            .mobile-hide { display: none !important; }
            .mobile-only { display: inline-block !important; }
            .masthead-title {
              white-space: normal !important;
              width: 100%;
              padding: 0 1rem;
              text-align: center;
              line-height: 1.0 !important;
            }
            .masthead-title.scrolled {
              opacity: 0 !important;
              pointer-events: none !important;
            }
            .mobile-docent-text { display: none !important; }
            .mobile-findings-text { display: none !important; }
            .desktop-kicker { display: none !important; }
            .breadcrumb-explore { display: none !important; }
          }
        `}
      </style>
      {/* Spacer: reserves space so content doesn't jump under sticky header */}
      <div style={{ height: HERO_HEIGHT }} />

      <header
        ref={headerRef}
        id="explore-masthead"
        className={isDocentOpen ? "docent-open-masthead" : ""}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0, // Fallback, will be overridden by CSS
          height: currentHeight,
          zIndex: 1000,
          overflow: "visible", // Allowed to be visible so dropdowns/popovers don't get truncated
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "stretch",
          background: scrolled
            ? "color-mix(in srgb, var(--c-bg) 88%, transparent)"
            : "radial-gradient(ellipse at center, var(--c-bgSoft) 0%, var(--c-bg) 50%, var(--c-bgDeep) 100%)",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: `1px solid ${scrolled ? "var(--c-ghost)" : "transparent"}`,
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.3)" : "none",
          transition: "right 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.3s ease, backdrop-filter 0.3s ease, border-bottom 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* ── Clipped background container ───────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: HERO_HEIGHT,
              transform: "translateY(-50%)",
              opacity: scrolled ? 0.32 : 0.45,
              transition: "opacity 0.5s ease",
            }}
          >
            <HarmonicCanvas
              themeKey={`${theme}-${mode}-${colorblind}`}
              opacity={1}
              paused={loomPaused}
            />
          </div>
        </div>

        {/* ── Rainbow accent line ────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: scrolled ? 2 : 3,
            background: RAINBOW,
            zIndex: 50,
            transition: "height 0.35s ease",
          }}
        />

        {/* ── Header nav bar (always visible and interactive at top) ─────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1.25rem",
            zIndex: 100,
            height: NAV_HEIGHT,
            flexShrink: 0,
          }}
        >
          {/* Left: Brand / Breadcrumbs */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }} ref={dropdownRef}>
            {scrolled && (
              <div className="desktop-kicker" style={{
                fontFamily: FONT.condensed,
                fontSize: "0.55rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--c-dim)",
                lineHeight: 1,
                marginBottom: "0.1rem",
                marginTop: "-0.2rem",
                animation: "fadeIn 0.2s ease-out forwards",
              }}>
                The Accidental Intactivist's Inquiry
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", minWidth: 0 }}>
              <button
              className={!isIndex ? "breadcrumb-explore" : ""}
              onClick={() => {
                setDropdownOpen(false);
                navigate("index");
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: "1.15rem",
                color: isIndex ? "var(--c-textBright)" : "var(--c-muted)",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => { if (!isIndex) e.currentTarget.style.color = "var(--c-textBright)"; }}
              onMouseLeave={(e) => { if (!isIndex) e.currentTarget.style.color = "var(--c-muted)"; }}
            >
              Explore
            </button>
            {!isIndex && (
              <>
                <span className="breadcrumb-explore" style={{ color: "var(--c-dim)", fontSize: "0.85rem", margin: "0 0.25rem", fontFamily: FONT.body, fontWeight: 300 }}>/</span>
                
                {(() => {
                  const activeExhibit = EXHIBIT_ROUTES.find(e => e.route === route);
                  if (activeExhibit) {
                    return (
                      <div style={{ position: "relative" }}>
                        <button
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "0.2rem 0.45rem",
                            borderRadius: 4,
                            fontFamily: FONT.condensed, 
                            fontSize: "0.75rem", 
                            fontWeight: 700,
                            textTransform: "uppercase", 
                            letterSpacing: "0.12em",
                            color: "var(--c-goldBright)",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{activeExhibit.label}</span>
                          <span style={{ fontSize: "0.55rem", color: "var(--c-dim)", transform: `rotate(${dropdownOpen ? 180 : 0}deg)`, transition: "transform 0.2s", flexShrink: 0 }}>▼</span>
                        </button>
                        
                        {dropdownOpen && (
                          <div style={{
                            position: "absolute",
                            top: "calc(100% + 0.4rem)",
                            left: 0,
                            width: "260px",
                            background: "var(--c-bgCard)",
                            border: "1px solid var(--c-ghost)",
                            borderRadius: 8,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.55)",
                            overflow: "hidden",
                            zIndex: 200,
                            padding: "0.4rem 0",
                          }}>
                            {EXHIBIT_ROUTES.map((ex) => {
                              const isCurrent = ex.route === route;
                              return (
                                <button
                                  key={ex.route}
                                  onClick={() => {
                                    setDropdownOpen(false);
                                    navigate(ex.route);
                                  }}
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                    padding: "0.45rem 1rem",
                                    background: isCurrent ? "rgba(212, 160, 48, 0.08)" : "transparent",
                                    border: "none",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    transition: "background 0.15s",
                                  }}
                                  onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                                  onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = "transparent"; }}
                                >
                                  <span style={{
                                    fontFamily: FONT.condensed,
                                    fontSize: "0.55rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    color: isCurrent ? "var(--c-goldBright)" : "var(--c-dim)",
                                    marginBottom: "0.1rem",
                                  }}>
                                    {ex.num}
                                  </span>
                                  <span style={{
                                    fontFamily: FONT.body,
                                    fontSize: "0.8rem",
                                    fontWeight: isCurrent ? 600 : 400,
                                    color: isCurrent ? "var(--c-textBright)" : "var(--c-muted)",
                                  }}>
                                    {ex.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  return (
                    <span style={{ 
                      fontFamily: FONT.condensed, 
                      fontSize: "0.75rem", 
                      fontWeight: 700,
                      textTransform: "uppercase", 
                      letterSpacing: "0.12em",
                      color: "var(--c-goldBright)",
                      whiteSpace: "nowrap"
                    }}>
                      {meta.navTitle}
                    </span>
                  );
                })()}
              </>
            )}
            </div>
          </div>

          {/* Right: ThemeToggle + Findings link */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
            <a href="#/about" className="mobile-hide" style={{
              fontFamily: FONT.condensed,
              fontWeight: 700,
              fontSize: "0.7rem",
              color: "var(--c-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              textDecoration: "none",
              transition: "color 0.2s"
            }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--c-textBright)"}
               onMouseLeave={(e) => e.currentTarget.style.color = "var(--c-muted)"}>
              About
            </a>
            <a href="#/faq" className="mobile-hide" style={{
              fontFamily: FONT.condensed,
              fontWeight: 700,
              fontSize: "0.7rem",
              color: "var(--c-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              textDecoration: "none",
              transition: "color 0.2s"
            }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--c-textBright)"}
               onMouseLeave={(e) => e.currentTarget.style.color = "var(--c-muted)"}>
              FAQ
            </a>
            <div className="mobile-hide" style={{ width: 1, height: 18, background: "var(--c-ghost)", opacity: 0.5, margin: "0 0.25rem" }} />
            <ThemeToggle />
            <div className="mobile-hide" style={{ width: 1, height: 18, background: "var(--c-ghost)", opacity: 0.5 }} />
            <a
              href="/"
              style={{
                fontFamily: FONT.condensed,
                fontWeight: 700,
                fontSize: "0.7rem",
                color: "var(--c-goldBright)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textDecoration: "none",
                padding: "0.25rem 0.65rem",
                border: "1px solid rgba(212,160,48,0.35)",
                borderRadius: 100,
                background: "rgba(212,160,48,0.08)",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(212,160,48,0.18)";
                e.currentTarget.style.borderColor = "rgba(212,160,48,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(212,160,48,0.08)";
                e.currentTarget.style.borderColor = "rgba(212,160,48,0.35)";
              }}
            >
              <span className="mobile-findings-text">← Findings</span>
              <span className="mobile-only">←</span>
            </a>
            
            <button
              onClick={() => setDocentOpen(!isDocentOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontFamily: FONT.condensed,
                fontWeight: 700,
                fontSize: "0.7rem",
                color: isDocentOpen ? "var(--c-bg)" : "var(--c-goldBright)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "0.25rem 0.65rem",
                border: "1px solid rgba(212,160,48,0.35)",
                borderRadius: 100,
                background: isDocentOpen ? "var(--c-goldBright)" : "rgba(212,160,48,0.08)",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isDocentOpen) {
                  e.currentTarget.style.background = "rgba(212,160,48,0.18)";
                  e.currentTarget.style.borderColor = "rgba(212,160,48,0.6)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isDocentOpen) {
                  e.currentTarget.style.background = "rgba(212,160,48,0.08)";
                  e.currentTarget.style.borderColor = "rgba(212,160,48,0.35)";
                }
              }}
            >
              <Sparkles size={12} color="currentColor" />
              <span className="mobile-docent-text">Research Assistant</span>
            </button>
          </div>
        </div>

        {/* ── Collapsing Exhibit Title ────────────────────────────────────── */}
        <h1
          className={`masthead-title ${scrolled ? 'scrolled' : ''}`}
          style={{
            position: "absolute",
            left: "50%",
            top: 136, // Center of the hero area (56px + 184px/2) shifted up slightly
            transform: `translate(-50%, calc(-50% + ${translateY + tomorrowOffset}px)) scale(${scale})`,
            transformOrigin: "center",
            transition: "transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.35s ease, font-size 0.35s ease, opacity 0.25s ease",
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: isIndex
              ? "clamp(2.5rem, 4.5vw, 3.5rem)"
              : "clamp(2.2rem, 4vw, 3.2rem)",
            color: "var(--c-textBright)",
            lineHeight: 1.1,
            letterSpacing: isIndex ? "0.02em" : "0.05em",
            textTransform: "uppercase",
            margin: 0,
            whiteSpace: "nowrap",
            zIndex: 15,
            pointerEvents: scrolled ? "none" : "auto",
          }}
        >
          {meta.title}
        </h1>

        {/* ── Clipped description container ──────────────────────────────── */}
        <div
          style={{
            position: "relative",
            zIndex: 5,
            height: Math.max(0, currentHeight - NAV_HEIGHT),
            overflow: "hidden",
            opacity: scrolled ? 0 : 1,
            pointerEvents: scrolled ? "none" : "auto",
            transition: "opacity 0.25s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "center",
              padding: "1.2rem 1.5rem 1.5rem",
              height: HERO_HEIGHT - NAV_HEIGHT,
              flexShrink: 0,
              transform: scrolled ? "translateY(-10px)" : "translateY(0)",
              transition: "transform 0.35s ease",
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            {/* Kicker / Exhibit Number */}
            <div
              style={{
                fontFamily: FONT.condensed,
                fontWeight: 700,
                fontSize: "0.68rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--c-gold)",
              }}
            >
              {meta.kicker}
            </div>

            {/* Interpretive description (Hidden per user request) */}
            {/*
            <p
              style={{
                fontFamily: FONT.body,
                fontSize: "clamp(0.78rem, 1vw, 0.88rem)",
                color: "var(--c-muted)",
                lineHeight: 1.6,
                maxWidth: 700,
                margin: 0,
              }}
            >
              {meta.desc}
            </p>
            */}
          </div>
        </div>

        {/* ── Pause Button for Harmonic Loom ── */}
        <button
          onClick={toggleLoom}
          title={loomPaused ? "Play background animation" : "Pause background animation"}
          style={{
            position: "absolute",
            bottom: "1.2rem",
            right: "1.5rem",
            zIndex: 20,
            background: "rgba(0,0,0,0.4)",
            border: `1px solid ${loomPaused ? "var(--c-goldBright)" : "var(--c-ghost)"}`,
            color: loomPaused ? "var(--c-goldBright)" : "var(--c-dim)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            opacity: scrolled ? 0 : 0.6,
            pointerEvents: scrolled ? "none" : "auto",
            backdropFilter: "blur(4px)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = 1;
            e.currentTarget.style.color = "var(--c-goldBright)";
            e.currentTarget.style.borderColor = "var(--c-goldBright)";
            e.currentTarget.style.background = "rgba(0,0,0,0.6)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = scrolled ? 0 : 0.6;
            if (!loomPaused) {
              e.currentTarget.style.color = "var(--c-dim)";
              e.currentTarget.style.borderColor = "var(--c-ghost)";
              e.currentTarget.style.background = "rgba(0,0,0,0.4)";
            }
          }}
        >
          {loomPaused ? <Play size={14} style={{ marginLeft: "2px", fill: "currentColor" }} /> : <Pause size={14} style={{ fill: "currentColor" }} />}
        </button>
      </header>
    </>
  );
}
