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

// ── Easy-to-adjust height constants ─────────────────────────────────────
const HERO_HEIGHT = 240;   // px – hero / expanded state (adjust to taste)
const NAV_HEIGHT = 56;     // px – collapsed / docked state
const SCROLL_THRESHOLD = 100; // px of scroll before collapse triggers

// ── Route metadata ──────────────────────────────────────────────────────
// These are the definitive page titles and descriptions. The individual
// pages no longer render their own headers — this is the single source.
const ROUTE_META = {
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
  "generational-faultlines": {
    kicker: "Exhibit 07",
    title: "Generational Faultlines",
    desc: "Track the chronological shift in attitudes from the Silent Generation down to Gen Z. This dashboard traces the most striking generational divides across our flagship questions.",
    navTitle: "Generations",
  },
  "observer-triad": {
    kicker: "Exhibit 08",
    title: "The Observer Triad",
    desc: "Analyze the perspectives of partners, parents, and medical professionals — those who observe the consequences without having experienced them directly.",
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
    navTitle: "Report",
  },
  question: {
    kicker: "Deep Dive",
    title: "Question Detail",
    desc: "Full response distribution, cohort comparison, demographic breakdowns, and AI-powered analysis for a single survey question.",
    navTitle: "Question",
  },
  numbers: {
    kicker: "Exhibit 11",
    title: "By The Numbers",
    desc: "The core findings of the study summarized in key outcome metrics. Use cohort filters to examine specific subgroups.",
    navTitle: "By The Numbers",
  },
  culture: {
    kicker: "Exhibit 12",
    title: "Culture & Attitudes",
    desc: "Explore cultural norms, stereotypes, associations, and attitudes regarding circumcision across cohorts.",
    navTitle: "Culture",
  },
};

export const EXHIBIT_ROUTES = [
  { route: "pathways", num: "Exhibit 01", label: "The Survey Map" },
  { route: "pairs", num: "Exhibit 02", label: "Mirror Pairs" },
  { route: "pleasure-gap", num: "Exhibit 03", label: "The Pleasure Gap" },
  { route: "correlations", num: "Exhibit 04", label: "Correlations Explorer" },
  { route: "demographics", num: "Exhibit 05", label: "Demographic Explorer" },
  { route: "narrative-mirrors", num: "Exhibit 06", label: "Narrative Mirrors" },
  { route: "generational-faultlines", num: "Exhibit 07", label: "Generational Faultlines" },
  { route: "observer-triad", num: "Exhibit 08", label: "The Observer Triad" },
  { route: "religious-mirrors", num: "Exhibit 09", label: "Religious Mirrors" },
  { route: "restoration-journey", num: "Exhibit 10", label: "Restoration Journey" },
  { route: "numbers", num: "Exhibit 11", label: "By The Numbers" },
  { route: "culture", num: "Exhibit 12", label: "Culture & Attitudes" },
];

export default function ExploreMasthead({ route, navigate, customMeta, isDocentOpen, setDocentOpen }) {
  const { theme, mode, colorblind, typeface } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const headerRef = useRef(null);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
  const scale = 1 - 0.42 * progress;

  // Josefin Sans (Tomorrow font) has high ascenders, making uppercase text sit visually low.
  // We apply a vertical offset (-4.5px when expanded, -2.5px when collapsed) to center it.
  const isTomorrow = typeface === "tomorrow";
  const tomorrowOffset = isTomorrow ? -4.5 + 2 * progress : 0;

  return (
    <>
      {/* Spacer: reserves space so content doesn't jump under sticky header */}
      <div style={{ height: HERO_HEIGHT }} />

      <header
        ref={headerRef}
        id="explore-masthead"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
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
          transition: "background 0.3s ease, backdrop-filter 0.3s ease, border-bottom 0.3s ease, box-shadow 0.3s ease",
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", position: "relative" }} ref={dropdownRef}>
            <button
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
                <span style={{ color: "var(--c-dim)", fontSize: "0.85rem", margin: "0 0.25rem", fontFamily: FONT.body, fontWeight: 300 }}>/</span>
                
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
                          {activeExhibit.label}
                          <span style={{ fontSize: "0.55rem", color: "var(--c-dim)", transform: `rotate(${dropdownOpen ? 180 : 0}deg)`, transition: "transform 0.2s" }}>▼</span>
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

          {/* Right: ThemeToggle + Findings link */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <ThemeToggle />
            <div style={{ width: 1, height: 18, background: "var(--c-ghost)", opacity: 0.5 }} />
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
              ← Findings
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
              Ask A Docent
            </button>
          </div>
        </div>

        {/* ── Collapsing Exhibit Title ────────────────────────────────────── */}
        <h1
          style={{
            position: "absolute",
            left: "50%",
            top: 136, // Center of the hero area (56px + 184px/2) shifted up slightly
            transform: `translate(-50%, calc(-50% + ${translateY + tomorrowOffset}px)) scale(${scale})`,
            transformOrigin: "center",
            transition: "transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.35s ease, font-size 0.35s ease",
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: isIndex
              ? "clamp(1.7rem, 3.5vw, 2.4rem)"
              : "clamp(1.5rem, 3.2vw, 2.2rem)",
            color: "var(--c-textBright)",
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
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

            {/* Interpretive description */}
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
          </div>
        </div>
      </header>
    </>
  );
}
