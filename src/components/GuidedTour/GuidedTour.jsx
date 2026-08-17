// ═══════════════════════════════════════════════════════════════════════════
// GuidedTour — the Special Report as a guided walk through all 14 exhibits.
// Fully theme-engine native: tokens, PATH_COLORS, HarmonicCanvas, Icons.
// Voice: the Accidental Intactivist lens — summarize and report, never argue.
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SnapshotWall from "../../explore/components/SnapshotWall";
import { C, FONT, RAINBOW } from "../../explore/styles/tokens";
import LoomChoreography from "./LoomChoreography";
import { useTheme } from "../../explore/contexts/ThemeContext";
import { ExhibitCard } from "../../explore/components/ExhibitsDashboard";
import { EXHIBIT_ROUTES, ROUTE_META } from "../../explore/components/ExploreMasthead";
import ResourcesCTA from "../ResourcesCTA";
import RotatingVoiceCards from "../RotatingVoiceCards";

import ExhibitSurveyFlowchart from "../../explore/components/SurveyFlowchart";
import { ArrowRight } from "lucide-react";
import { getGeo } from "../../explore/lib/api";
import { normalizeName } from "../../explore/lib/formatters";
import { TOUR, PATHS, N_TOTAL, PLEASURE_METRICS, pooledMean, NARRATIVE_MIRROR_DATA, TRADITION_BREAKDOWN, INFLUENCE_RANKING, CHRISTIAN_CIRC_VIEW, AWARENESS_AGE_BUTTERFLY, GENERATIONAL_SATISFACTION, RESTORATION_MOTIVES } from "./tourData";
import { useLegibleColor } from "../../explore/lib/colorUtils";

const WORLD_GEO_URL = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";
const US_TOPO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const CANADA_GEO_URL = "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/canada.geojson";

const GEO_URLS = {
  country: WORLD_GEO_URL,
  usa: US_TOPO_URL,
  canada: CANADA_GEO_URL
};
import {
  Reveal, Lens, TourCard, BarRows, ArrowNote, StatCallout,
  ChapterDivider, ResearcherFootnote, AskDocentCard,
  ActMarker, PullQuote, TwoColumnAnalysis,
  PullStat, MethodPillars, EXPLORE_BASE,
  EffectSizeRow, EffectBenchmarkChart, EffectSizeBadge,
} from "./tourKit";
import * as Icons from "../../explore/components/Icons";
import TableOfContents from './TableOfContents';
import ScrollTracker from './ScrollTracker';
import {
  PunchCardAtlas, ConvergenceSankey,
  WordMirrors, ResentmentMirror, MirrorPairToggle, ProjectionGate,
  TourButterflyChart, GenerationalShiftChart, TourObserverBreakdown, CuratedInsightsToggle,
  TourRestorationPathway, TestimonyRotator, ParentInsightCharts,
  AsymmetryOfChoice, ExitInterview, LubeTaxCalculator, PartnersEcho,
  HistoricalIntentReveal, RestorationGradient
} from "./TourVisuals";
import { DemographicGrids } from "./DemographicGrids";
import PleasureGapWidget from "../../explore/components/PleasureGapWidget";
import GeographicHeatmap from "../../explore/components/GeographicHeatmap";
import DemographicSankey from "../../explore/components/DemographicSankey";
import WireframeGlobe from "../../explore/components/WireframeGlobe";
import GenerationalTrendChart from "../../explore/components/GenerationalTrendChart";
import { PLEASURE_GAP_STATS, EFFECT_BENCHMARKS, dMagnitude, sigLabel } from "./tourStats";


// ── Demographic Maps Block ──────────────────────────────────────────────────
function DemographicMapsBlock() {
  const [geoLevel, setGeoLevel] = useState('country');
  const [worldDist, setWorldDist] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);

  React.useEffect(() => {
    async function load() {
      try {
        if (geoLevel === 'north_america') {
          const [usGeo, caGeo] = await Promise.all([
            getGeo('us_state'),
            getGeo('canada_province')
          ]);
          const combined = [...(usGeo.locations || []), ...(caGeo.locations || [])];
          setWorldDist({ distribution: combined.map(loc => ({ label: loc.location, n: loc.n })) });
        } else {
          const geo = await getGeo('country');
          setWorldDist({ distribution: (geo.locations || []).map(loc => ({ label: loc.location, n: loc.n })) });
        }
      } catch (e) {
        console.error("Failed to load map data", e);
      }
    }
    load();
  }, [geoLevel]);

  return (
    <div style={{ width: '100%', margin: '0.5rem 0', boxSizing: 'border-box' }}>
      {worldDist && (
        <>
          <div style={{ display: 'flex', gap: '1.6rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
            {/* ── Globe — padded to prevent corner clipping ── */}
            <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem' }}>
              <WireframeGlobe 
                distribution={worldDist} 
                initialRotation={geoLevel === 'north_america' ? [105, -48, 0] : [20, -15, 0]} 
                scale={geoLevel === 'north_america' ? 1.8 : 1.1}
                width={340}
                height={340}
                geoUrl={geoLevel === 'north_america' ? [GEO_URLS.country, GEO_URLS.usa, GEO_URLS.canada] : GEO_URLS.country}
                targetCountry={hoveredCountry}
                centerOnHover={geoLevel === 'country'}
                autoRotate={geoLevel === 'country'}
                onHover={(label) => setHoveredCountry(label)}
              />
            </div>

            {/* ── Table panel ── */}
            <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', maxHeight: 360 }}>
              {/* ── Header: kicker + toggle pills ── */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingBottom: '0.5rem', marginBottom: '0.5rem',
                borderBottom: `1px solid ${C.ghost}`,
              }}>
                <span style={{
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  color: C.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  {geoLevel === 'country' ? 'Top Countries' : 'Top States & Provinces'}
                </span>

                {/* Toggle pills */}
                <div style={{
                  display: 'flex',
                  border: `1px solid ${C.ghost}`,
                  borderRadius: 999,
                  overflow: 'hidden',
                }}>
                  {['country', 'north_america'].map(lvl => (
                    <button key={lvl} onClick={() => setGeoLevel(lvl)} style={{
                      background: geoLevel === lvl ? C.gold : 'transparent',
                      color: geoLevel === lvl ? '#fff' : C.muted,
                      border: 'none',
                      borderRight: lvl === 'country' ? `1px solid ${C.ghost}` : 'none',
                      padding: '0.2rem 0.55rem',
                      cursor: 'pointer',
                      fontFamily: FONT.condensed,
                      fontWeight: 700,
                      fontSize: '0.6rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      transition: 'all 0.2s',
                    }}>
                      {lvl === 'country' ? 'World' : 'North America'}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Ranked list — matching stat card rows ── */}
              <div style={{
                overflowY: 'auto',
                flex: 1,
                paddingRight: '1rem', // Prevent scrollbar from overlapping text
              }}>{[...worldDist.distribution].sort((a,b) => b.n - a.n).slice(0, 20).map((d, i) => (
                  <div 
                    key={i} 
                    onMouseEnter={() => setHoveredCountry(d.label)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    style={{
                      display: "flex", alignItems: "baseline", gap: "0.5rem", padding: "0.5rem 0",
                      borderBottom: i < 19 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      background: hoveredCountry === d.label ? "rgba(255,255,255,0.08)" : "transparent",
                      cursor: "default"
                    }}
                  >
                    <span style={{
                      fontFamily: FONT.display, fontWeight: 600, fontSize: "0.76rem", color: C.text,
                      width: 170, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }} title={d.label}>
                      {d.label}
                    </span>
                    <span style={{ flex: 1, borderBottom: `2px dotted ${C.ghost}`, marginBottom: 3, minWidth: 20 }} />
                    <span style={{
                      fontFamily: FONT.mono, fontWeight: 800, fontSize: "0.92rem", color: C.gold, flexShrink: 0
                    }}>
                      {d.n}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const st = (num) => TOUR.find((t) => t.num === num);

function VoiceCard({ colorVar, label, children }) {
  return (
    <div style={{
      padding: "0.7rem 0.9rem", borderRadius: 6, borderLeft: `3px solid ${colorVar}`,
      background: "rgba(255,255,255,0.03)",
    }}>
      <div style={{ fontFamily: FONT.body, fontWeight: 300, fontStyle: "italic", fontSize: "0.75rem", lineHeight: 1.55, color: C.text, marginBottom: "0.4rem" }}>
        {children}
      </div>
      <div style={{ fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.1em", color: colorVar }}>
        {label}
      </div>
    </div>
  );
}

function RotatingTestimonials({ motives, intervalMs = 12000 }) {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!motives || motives.length === 0) return;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex(prev => (prev + 4) % motives.length);
        setFading(false);
      }, 400);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [motives, intervalMs]);

  if (!motives || motives.length === 0) return null;

  const currentBatch = [];
  for (let i = 0; i < 4; i++) {
    currentBatch.push(motives[(index + i) % motives.length]);
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem",
      opacity: fading ? 0 : 1, transition: "opacity 0.4s ease-in-out"
    }}>
      {currentBatch.map((v, i) => (
        <VoiceCard key={`${index}-${i}`} colorVar={PATHS.restoring.color} label={`— ${v.generation || "Respondent"} · Restoring`}>
          "{v.text}"
        </VoiceCard>
      ))}
    </div>
  );
}

function Station({ num, children }) {
  const s = st(num);
  return (
    <div id={`st${s.num}`} style={{ scrollMarginTop: 90 }}>
      <Lens>{s.lens}</Lens>
      {children}
      <AskDocentCard context={s.docentContext} suas={s.tourSuas} />
    </div>
  );
}

function NarrativeMirrorToggle() {
  const [active, setActive] = useState("physical");
  const [page, setPage] = useState(0);
  const data = NARRATIVE_MIRROR_DATA[active];
  const activeTextColor = useLegibleColor("#ffffff", "var(--c-gold)", 4.5);
  
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.5rem", justifyContent: "center" }}>
        {Object.keys(NARRATIVE_MIRROR_DATA).map((key) => {
          const p = NARRATIVE_MIRROR_DATA[key];
          const isActive = active === key;
          return (
            <button key={key} onClick={() => { setActive(key); setPage(0); }} style={{
              fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.62rem",
              letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: "pointer", border: "none", borderRadius: 100,
              padding: "0.4rem 0.85rem",
              color: isActive ? activeTextColor : C.muted,
              background: isActive ? "var(--c-gold)" : "rgba(255,255,255,0.06)",
              transition: "all .2s ease",
              transform: isActive ? "scale(1.05)" : "none",
              boxShadow: isActive ? "0 2px 8px rgba(212,160,48,0.3)" : "none",
            }}>
              {p.concept}
            </button>
          );
        })}
      </div>
      
      <div key={active} style={{ animation: "fadeSlideIn 0.35s ease" }}>
        <WordMirrors wordsCirc={data.circumcised.words} wordsIntact={data.intact.words} />
        
        {active === "emotional" && (
          <TourButterflyChart
            title="Age of Awareness — When They First Understood"
            rows={AWARENESS_AGE_BUTTERFLY}
            intactN={144}
            circN={219}
          />
        )}

        <div style={{ borderTop: `1px dashed ${C.ghost}`, marginTop: "1.1rem", paddingTop: "1.1rem" }}>
          <div className="quote-grid" style={{ display: "grid", gap: "0.7rem" }}>
            <style>{`
              .quote-grid { grid-template-columns: 1fr; }
              @media (min-width: 768px) { .quote-grid { grid-template-columns: 1fr 1fr; } }
            `}</style>
            {[page * 3, page * 3 + 1, page * 3 + 2].flatMap(i => {
              const cQuote = data.circumcised.quotes[i];
              const iQuote = data.intact.quotes[i];
              return [
                cQuote && (
                  <VoiceCard key={`c-${i}`} colorVar={PATHS.circumcised.color} label={`— Circumcised Voice · ${cQuote.age_bracket || cQuote.generation || "Anonymous"}`}>
                    “{cQuote.text}”
                  </VoiceCard>
                ),
                iQuote && (
                  <VoiceCard key={`i-${i}`} colorVar={PATHS.intact.color} label={`— Intact Voice · ${iQuote.age_bracket || iQuote.generation || "Anonymous"}`}>
                    “{iQuote.text}”
                  </VoiceCard>
                )
              ].filter(Boolean);
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
            <button 
              onClick={() => {
                const maxLen = Math.max(data.circumcised.quotes.length, data.intact.quotes.length);
                const maxPages = Math.ceil(maxLen / 3);
                setPage((prev) => (prev + 1) % maxPages);
              }}
              style={{
                fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.7rem",
                letterSpacing: "0.1em", textTransform: "uppercase", color: C.textBright,
                background: "rgba(255,255,255,0.05)", border: `1px solid ${C.ghost}`,
                padding: "0.5rem 1.2rem", borderRadius: 100, cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.05)"}
            >
              Load More Quotes ↻
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuidedTour() {
  const navigate = useNavigate();
  const { theme, mode, colorblind } = useTheme();

  return (
    <>
      <LoomChoreography themeKey={`${theme}-${mode}-${colorblind}`} />
      <div style={{ paddingBottom: "12rem", position: "relative", zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', maxWidth: 1240, margin: '0 auto', paddingTop: "8rem" }}>
          <ScrollTracker />
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* ── THE HOOK & THE MISCONCEPTION ── */}
            <div id="ch-prologue" style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem", scrollMarginTop: 100 }}>
              <ActMarker actNum="00" kicker="Prologue" title="The Accidental Intactivist's Inquiry" count={0} total={4} colorVar={C.goldBright} />
            <TourCard title="From the Lead Researcher" refText="A LETTER · READ FIRST" stamp="Signed">
              <div style={{ fontFamily: FONT.body, fontWeight: 400, fontSize: "15.2px", lineHeight: 1.75, color: C.text, maxWidth: 680, margin: "2rem auto" }}>
                <p style={{ marginBottom: "1.5rem" }}>
                My name is Tone Pettit. If you are an American man reading this, there is a high probability your parents made a decision when you were an infant to remove a portion of your genital skin.
              </p>
              <p style={{ marginBottom: "1.5rem" }}>
                For most men, this was framed strictly as a prophylactic hygiene measure. It was so normalized that questioning it often feels taboo.
              </p>
              <p style={{ marginBottom: "1.5rem" }}>
                By a conscious choice of my parents in the 1970s, I grew up intact. I was an outlier in a culture where routine infant circumcision was the unquestioned, 90% norm. I became an "accidental intactivist," a witness to an alteration that nearly all my peers had undergone without a say.
              </p>
              
              <PullQuote 
                quote="If someone asked you honestly how you felt about your circumcision status, what would you say?" 
                byline="THE LEAD RESEARCHER · PROLOGUE" 
              />

              <p style={{ marginBottom: "1.5rem" }}>
                That is the question I set out to ask when I built this anonymous survey. The biology of the foreskin is well understood—its nerve density, mechanical function, and immunological role are documented in anatomy textbooks. Yet routine infant circumcision became standard practice in America during an era when self-pleasure was treated as a medical disorder, intentionally designed to reduce sexual sensation.
              </p>

              <HistoricalIntentReveal />
              <p style={{ marginBottom: "1.5rem" }}>
                Over time, the cultural justifications evolved, but the mechanical reality of the procedure remained exactly the same: the surgical removal of healthy, erogenous tissue from a child. Because this surgery requires no specialized training and has no standardized outcome, it is often an aesthetic lottery. Some men are left with brown, jagged scars, while others are stripped completely tight.
              </p>
              <p style={{ marginBottom: "1.5rem" }}>
                Now the culture is shifting. Newborn circumcision rates in the United States have fallen below 50% for the first time in over a century. Parents are asking questions that went unasked a generation ago, seeking to understand the lifelong impact of an irreversible choice.
              </p>
              
              <div style={{
                float: "right", width: 220, marginLeft: "1.4rem", marginBottom: "0.8rem",
                marginTop: "0.2rem",
              }}>
                <div style={{ position: "relative", width: 220, height: 175 }}>
                  <div style={{ position: "absolute", left: 55, top: 0, width: 130, height: 165, borderRadius: 4, border: `2px solid ${C.ghost}`, boxShadow: "0 6px 14px rgba(0,0,0,0.3)", transform: "rotate(6deg)", zIndex: 1, overflow: "hidden" }}>
                    <img src="/flyers/recruitment-3.jpg" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "23% 45%", transform: "scale(2.5)", transformOrigin: "23% 45%" }} alt="Street pole covered in grassroots survey posters" />
                  </div>
                  <img src="/flyers/recruitment-1.png" style={{ position: "absolute", left: 0, top: 10, width: 100, height: "auto", borderRadius: 4, border: `2px solid ${C.ghost}`, boxShadow: "0 6px 14px rgba(0,0,0,0.4)", transform: "rotate(-5deg)", zIndex: 2 }} alt="Survey recruitment flyer" />
                  <img src="/flyers/recruitment-2.png" style={{ position: "absolute", right: 5, top: 35, width: 100, height: "auto", borderRadius: 4, border: `2px solid ${C.ghost}`, boxShadow: "0 6px 14px rgba(0,0,0,0.4)", transform: "rotate(3deg)", zIndex: 3 }} alt="Survey recruitment flyer" />
                </div>
                <div style={{ fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.5rem", color: C.dim, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "0.4rem", textAlign: "center" }}>
                  Survey recruitment flyers, 2024
                </div>
              </div>
              
              <h4 style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "13.6px", color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "2rem", marginBottom: "0.5rem" }}>
                Grassroots Outreach
              </h4>
              
              <p style={{ marginBottom: "1.5rem" }}>
                There was no advertising budget or clinical recruitment pipeline. The survey spread entirely through grassroots efforts. It was posted to forums, shared across social media, and passed hand to hand. Five hundred people showed up to answer anonymously.
              </p>
              <p style={{ marginBottom: "1.5rem" }}>
                This project exists to invite you to pay attention to what surfaces when people are given the space to share their experiences honestly. What follows is a guided tour through their answers, summarized and never argued. Where I editorialize, it is clearly labeled. Otherwise, we simply report what they said.
              </p>
              
              <div style={{
                display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.4rem",
                paddingTop: "1.1rem", borderTop: `1px dashed ${C.ghost}`,
              }}>
                <img src="/tone-headshot.jpg" alt="Tone Pettit" width="52" height="52"
                  style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.ghost}`, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "0.9rem", color: C.textBright }}>Tone Pettit</div>
                  <div style={{ fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.62rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    The Accidental Intactivist · Lead Researcher · Seattle
                  </div>
                </div>
              </div>
            </div>
          </TourCard>
        </div>

        {/* ── TABLE OF CONTENTS ── */}
        <TableOfContents />

        {/* ── ACT I: THE MECHANICAL REALITY (THE B-PLOT) ── */}
        <section id="act-1-mechanics" style={{
          position: "relative", overflow: "hidden", margin: "0",
          paddingTop: "5.5rem", paddingBottom: "5rem",
          background: "color-mix(in srgb, var(--c-bgDeep) 72%, transparent)",
          borderTop: `1px solid ${C.ghost}`, borderBottom: `1px solid ${C.ghost}`,
          scrollMarginTop: 100,
        }}>
          <ActMarker actNum="I" kicker="Act I" title="Physical & Mechanical Data" count={1} total={4} colorVar={st("03").colorVar} />
          
          <div style={{ position: "relative", zIndex: 2, maxWidth: 960, margin: "3rem auto 0", padding: "0 1.6rem" }}>
            
            <Lens>Anatomical Alteration and Sexual Mechanics</Lens>
            <div style={{ fontFamily: FONT.body, fontSize: "19.2px", color: C.muted, lineHeight: 1.6, maxWidth: 620, margin: "0 auto 3rem", textAlign: "center" }}>
              To establish a baseline, we first examine the mechanics. We asked every respondent to rate their sexual experience across six key metrics. The data reveals a quantifiable variance in reported sensation between the cohorts, with intact men reporting higher average scores across all metrics.
            </div>
            
            <TourCard 
              id="sexual-experience-the-pleasure-gap" 
              title="Cohort Comparison: Sensation Metrics" 
              plateNum="PLATE 03-A"
              refText="EXHIBIT 03"
              sourceLine="SOURCE: PHASE 1 FROZEN SNAPSHOT · N = 501 · SELF-SELECTED SAMPLE · ASKED: 'RATE YOUR PLEASURE FROM MOBILE SKIN, 1-5' · EXHIBIT 03"
            >
              <PleasureGapWidget stats={PLEASURE_GAP_STATS} />
            </TourCard>
            
            <TwoColumnAnalysis>
              <p>
                The intact penis functions as a self-lubricating system with a natural gliding mechanism. The removal of this tissue introduces a friction-based mechanic. The most statistically significant variance was observed in "Pleasure from Mobile Skin" (the gliding action pleasure, rated 1 to 5), where the circumcised cohort reported a 55% lower average satisfaction score.
              </p>
              <p>
                The gap is widest exactly where the removed tissue worked: gliding action first, fine-touch second. Restoring respondents recover part of the mechanical function — their mobile-skin mean rises 0.89 over the circumcised baseline — while the fine-touch gap barely moves, consistent with tissue that can be regrown and nerve endings that cannot.
              </p>
            </TwoColumnAnalysis>

            <div style={{ marginTop: "3rem" }}>
              <TourCard 
                id="lubrication-dependency" 
                title="Intact vs. Circumcised: Mechanical Friction" 
                plateNum="PLATE 03-B"
                refText="FORM CS-058"
                sourceLine="SOURCE: PHASE 1 FROZEN SNAPSHOT · N = 349 (INTACT+CIRC) · ASKED: 'HOW OFTEN DO YOU REQUIRE ARTIFICIAL LUBRICATION?' · FORM CS-058"
                exhibitStation={st("03")}
              >
                <TourButterflyChart
                  title="Lubrication Requirement Frequency"
                  rows={[
                    { label: "Never", intactPct: 56.3, circPct: 6.3 },
                    { label: "Rarely", intactPct: 17.6, circPct: 14.5 },
                    { label: "Sometimes", intactPct: 19.7, circPct: 20.8 },
                    { label: "Often", intactPct: 4.9, circPct: 18.4 },
                    { label: "Always", intactPct: 1.4, circPct: 40.1 },
                  ]}
                  intactN={142}
                  circN={207}
                />
              </TourCard>
            </div>
            
            <TwoColumnAnalysis>
              <p>
                These mechanical differences are reflected in daily routines. By comparing the self-reported frequencies of artificial lubrication use during intercourse or masturbation, we can observe the practical impact of the differing tissue structures. 71% of intact men rarely or never need artificial lubrication. 65% of circumcised men always or almost always require it.
              </p>
            </TwoColumnAnalysis>

            <LubeTaxCalculator />
            <PartnersEcho />

          </div>
        </section>

        {/* ── ACT II: THE EMOTIONAL FALLOUT (THE A-PLOT) ── */}
        <section id="act-2-emotion" style={{
          position: "relative", overflow: "hidden", margin: "0",
          paddingTop: "5.5rem", paddingBottom: "5rem",
          scrollMarginTop: 100,
        }}>
          <ActMarker actNum="II" kicker="Act II" title="Emotional & Psychological Data" count={2} total={4} colorVar={st("02").colorVar} />
          <div style={{ position: "relative", zIndex: 2, maxWidth: 960, margin: "3rem auto 0", padding: "0 1.6rem" }}>
            
            <Lens>Emotional Correlates of Bodily Autonomy</Lens>
            <div style={{ fontFamily: FONT.body, fontSize: "19.2px", color: C.text, lineHeight: 1.6, maxWidth: 620, margin: "0 auto 3rem", textAlign: "center" }}>
              A common assertion regarding infant circumcision is that performing the procedure at an early age prevents psychological impact. We provided respondents with an anonymous space to report their long-term feelings regarding their alteration.
            </div>

            <TourCard 
              id="gratitude-vs-regret" 
              title="Cohort Comparison: Resentment vs. Regret" 
              plateNum="PLATE 02-A"
              refText="EXHIBIT 02" 
              sourceLine="SOURCE: PHASE 1 FROZEN SNAPSHOT · N = 501 · SELF-SELECTED SAMPLE · ASKED: 'HOW DO YOU FEEL ABOUT YOUR STATUS?' · EXHIBIT 02"
              exhibitStation={st("02")}
            >
              <ResentmentMirror />
            </TourCard>
            
            <TwoColumnAnalysis>
              <p>
                The data indicates that over 86% of infant-circumcised respondents report experiencing feelings of resentment, loss, anger, or grief regarding the alteration of their bodies. This section measures the frequency of these sentiments within the cohort.
              </p>
              <p>
                Conversely, the intact cohort reports high levels of satisfaction regarding their status. Their responses indicate a near-unanimous sense of gratitude toward their parents for leaving their bodies unaltered.
              </p>
            </TwoColumnAnalysis>

            <div style={{ marginTop: "3rem" }}>
              <TourCard 
                id="the-raw-words" 
                title="Intact vs. Circumcised: Narrative Testimonies" 
                plateNum="PLATE 06-A"
                refText="EXHIBIT 06" 
                sourceLine="SOURCE: PHASE 1 FROZEN SNAPSHOT · N = 501 · SELF-SELECTED SAMPLE · QUALITATIVE · EXHIBIT 06"
              >
                <NarrativeMirrorToggle />
              </TourCard>
            </div>
          </div>
        </section>

        {/* ── ACT III: THE JOURNEY OF RECLAMATION ── */}
        <section id="act-3-restoration" style={{
          position: "relative", overflow: "hidden", margin: "0",
          paddingTop: "5.5rem", paddingBottom: "5rem",
          background: "color-mix(in srgb, var(--c-bgDeep) 72%, transparent)",
          borderTop: `1px solid ${C.ghost}`, borderBottom: `1px solid ${C.ghost}`,
          scrollMarginTop: 100,
        }}>
          <ActMarker actNum="III" kicker="Act III" title="Foreskin Restoration" count={3} total={4} colorVar={st("10").colorVar} />
          <div style={{ position: "relative", zIndex: 2, maxWidth: 960, margin: "3rem auto 0", padding: "0 1.6rem" }}>
            
            <Lens>The Impact of Tissue Expansion</Lens>
            <div style={{ fontFamily: FONT.body, fontSize: "19.2px", color: C.muted, lineHeight: 1.6, maxWidth: 620, margin: "0 auto 3rem", textAlign: "center" }}>
              A subset of the circumcised cohort engages in a process called "foreskin restoration," which involves years of non-surgical tissue expansion. Our data examines the self-reported outcomes of this practice.
            </div>

            <TourCard 
              id="the-restoring-cohort-in-numbers" 
              title="The Restoring Cohort Data" 
              plateNum="PLATE 10-A"
              refText="EXHIBIT 10" 
              sourceLine="SOURCE: PHASE 1 FROZEN SNAPSHOT · N = 71 (RESTORING) · SELF-SELECTED SAMPLE · EXHIBIT 10"
              exhibitStation={st("10")}
            >
              <TourRestorationPathway />
            </TourCard>
            
            <TwoColumnAnalysis>
              <p>
                Restoring men report statistically significant improvements in mobility, comfort, and a reduced need for artificial lubrication. However, the data also indicates limitations. While tissue expansion can simulate the mechanical gliding function, respondents note that it does not recover the specialized nerve endings removed during the initial procedure.
              </p>
            </TwoColumnAnalysis>

            <RestorationGradient />
          </div>
        </section>

        {/* ── THE RESOLUTION: EMPOWERMENT & CONVERGENCE ── */}
        <section id="act-4-resolution" style={{
          position: "relative", overflow: "hidden", margin: "0",
          paddingTop: "5.5rem", paddingBottom: "5rem",
          scrollMarginTop: 100,
        }}>
          <ActMarker actNum="IV" kicker="Act IV" title="The Next Generation" count={4} total={4} colorVar={st("14").colorVar} />
          <div style={{ position: "relative", zIndex: 2, maxWidth: 960, margin: "3rem auto 0", padding: "0 1.6rem" }}>
            
            <Lens>Generational Trends in Intentions</Lens>
            <div style={{ fontFamily: FONT.body, fontSize: "19.2px", color: C.text, lineHeight: 1.6, maxWidth: 620, margin: "0 auto 3rem", textAlign: "center" }}>
              To gauge how these personal experiences might influence future generations, we asked our 500 respondents what they would do if they were to have a son today.
            </div>

            <TourCard 
              id="the-convergence" 
              title="Future Son Intentions & Convergence" 
              plateNum="PLATE 14-A"
              refText="EXHIBIT 14" 
              sourceLine="SOURCE: PHASE 1 FROZEN SNAPSHOT · N = 500 · ASKED: 'IF YOU HAD A SON TODAY, WOULD YOU CIRCUMCISE HIM?' · EXHIBIT 14"
              exhibitStation={st("14")}
            >
              <ConvergenceSankey />
              <StatCallout big="433" colorVar={C.textBright}>
                Of 500 respondents, 433 flow to "Keep Intact."
              </StatCallout>
              
              <ArrowNote lines={[
                <span key="conv">Follow the cohort pathways: <a href={EXPLORE_BASE + "the-forward-view"} style={{ color: C.blue }}>Exhibit 14</a></span>,
              ]} />
            </TourCard>
            
            <TwoColumnAnalysis>
              <p>
                The data reveals a strong convergence in intent. Across all demographics, including men who were circumcised themselves, the vast majority indicate they would choose to leave their sons intact.
              </p>
              <p>
                These findings suggest a significant generational shift in attitudes toward routine infant circumcision, driven by the firsthand experiences detailed in this report.
              </p>
            </TwoColumnAnalysis>
            
            <AsymmetryOfChoice />
            <ExitInterview />
          </div>
        </section>


        {/* ── APPENDIX: FURTHER EXPLORATION ── */}
        <div id="appendix" style={{ maxWidth: 960, margin: "8rem auto 4rem", padding: "4rem 1.6rem 0", borderTop: `1px solid ${C.ghost}`, scrollMarginTop: 100 }}>
          <ActMarker actNum="V" kicker="Appendix" title="Methodology & Demographics" count={5} total={5} colorVar={C.dim} />
          
          <div style={{ fontFamily: FONT.body, fontSize: "0.9rem", color: C.dim, textAlign: "center", marginBottom: "3rem" }}>
            The narrative above captures the core findings of the Accidental Intactivist survey. For those interested in the underlying demographics, cultural factors, and survey architecture, we have preserved the following detailed exhibits.
          </div>

          <Station num="01">
            <TourCard id="the-survey-architecture" title="Survey Architecture" refText="EXHIBIT 01" stamp="Map" exhibitStation={st("01")}>
              <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.2rem" }}>
                <p style={{ margin: 0 }}>The survey was engineered with a single constraint: core experience questions were answered blind, before the instrument forked into separate cohort pathways.</p>
              </div>
              <ExhibitSurveyFlowchart />
              <div style={{ padding: "1.5rem", background: "rgba(212, 160, 48, 0.08)", border: `1px solid rgba(212, 160, 48, 0.3)`, margin: "2rem 0 0", borderRadius: 8 }}>
                <p style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "1rem", letterSpacing: "0.05em", color: C.textBright, textTransform: "uppercase", marginBottom: "0.5rem" }}>A Note on Self-Selection and Population Prevalence</p>
                <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, margin: 0, lineHeight: 1.6 }}>
                  This survey (n=501) utilizes purposive, self-selected sampling. It is not designed to measure the prevalence of circumcision regret in the general public. Instead, it is designed to measure the intensity and characteristics of the lived experience among men who are actively engaged with their anatomical status. We do not claim 60% of all men are resentful; we demonstrate that when men do reflect on their circumcision, the resulting resentment and sensory loss are profound and measurable.
                </p>
              </div>
            </TourCard>
          </Station>

          <Station num="05">
            <TourCard id="respondent-census-origins" title="Respondent Census" refText={`EXHIBIT 05`} stamp="Phase 1" exhibitStation={st("05")}>
              <DemographicMapsBlock />
              <div style={{ marginTop: "2rem" }}>
                <DemographicGrids />
              </div>
            </TourCard>
          </Station>

          <Station num="07">
            <TourCard id="the-generational-faultline" title="Generational Shifts" refText="EXHIBIT 07" stamp="Shifting Norms" exhibitStation={st("07")}>
              <GenerationalShiftChart data={GENERATIONAL_SATISFACTION} />
            </TourCard>
          </Station>

          <Station num="13">
            <TourCard id="for-new-expectant-parents" title="Data for Expectant Parents" refText="EXHIBIT 13" stamp="Parents" exhibitStation={st("13")}>
              <TestimonyRotator />
              <ParentInsightCharts />
            </TourCard>
          </Station>
          
          <div style={{ textAlign: "center", marginTop: "4rem" }}>
             <a href={EXPLORE_BASE} style={{ color: C.blue, fontFamily: FONT.body, fontSize: "0.95rem" }}>The conversation is not over. Every exhibit is available for independent exploration in the full index.</a>
          </div>
        </div>
          </div>
        </div>
      </div>
    </>
  );
}
