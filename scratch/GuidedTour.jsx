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
  ChapterDivider, DocentMarker, ResearcherFootnote,
  SectionKicker, PullStat, MethodPillars, EXPLORE_BASE,
  EffectSizeRow, EffectBenchmarkChart, EffectSizeBadge,
} from "./tourKit";
import * as Icons from "../../explore/components/Icons";
import {
  PunchCardAtlas, ConvergenceSankey,
  WordMirrors, ResentmentMirror, MirrorPairToggle, ProjectionGate,
  TourButterflyChart, GenerationalShiftChart, TourObserverBreakdown, CuratedInsightsToggle,
  TourRestorationPathway, TestimonyRotator, ParentInsightCharts
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
      <Lens>{s.lens} <DocentMarker topic={s.title} onClick={() => window.dispatchEvent(new CustomEvent('open-docent', { detail: { context: s.docentContext, tourSuas: s.tourSuas } }))} /></Lens>
      {children}
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
  const [predicted, setPredicted] = useState(null);

  const VERDICT = {
    intact: "The projection was correct: the intact cohort reports higher sensation and orgasmic pleasure across the board.",
    circumcised: "The data contradicts the projection: the intact cohort reports higher sensation and orgasmic pleasure.",
    none: "The pool separates entirely: the intact cohort reports higher sensation and orgasmic pleasure across the board.",
  };

  return (
    <>
      {/* Scroll-choreographed background: one transparent canvas, formations
          morph between stations. Theme-token native — no palette flips. */}
      <LoomChoreography themeKey={`${theme}-${mode}-${colorblind}`} />
      <div style={{ paddingBottom: "12rem", position: "relative", zIndex: 1 }}>
        {/* ── Prologue ── */}
        <div id="ch-prologue" style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem", paddingTop: "8rem" }}>
          <SectionKicker kicker="Prologue" title="The Researcher's Letter" colorVar={C.goldBright} />
          <TourCard title="From the Lead Researcher" refText="A LETTER · READ FIRST" stamp="Signed">
            <div style={{ fontFamily: FONT.body, fontWeight: 300, fontSize: "0.95rem", color: C.text, lineHeight: 1.75, maxWidth: 760 }}>
              <p style={{ margin: "0 0 1rem" }}>
                My name is Tone Pettit. If you are an American man reading this, there is a high probability your parents made a decision when you were an infant to remove a portion of your genital skin.
              </p>
              <p style={{ margin: "0 0 1rem" }}>
                For most men, this was framed strictly as a prophylactic hygiene measure. It was so normalized that questioning it often feels taboo.
              </p>
              <p style={{ margin: "0 0 1rem" }}>
                By a conscious choice of my parents in the 1970s, I grew up intact. I was an outlier in a culture where routine infant circumcision was the unquestioned, 90% norm. I became an "accidental intactivist," a witness to an alteration that nearly all my peers had undergone without a say.
              </p>
              <blockquote style={{
                margin: "1.4rem 0", padding: "0.9rem 1.2rem",
                background: "color-mix(in srgb, var(--c-red) 6%, transparent)",
                borderLeft: `3px solid ${C.red}`, borderRadius: "0 4px 4px 0",
                fontFamily: FONT.display, fontStyle: "italic", fontWeight: 600,
                fontSize: "1.1rem", color: C.textBright, lineHeight: 1.5,
              }}>
                If someone asked you honestly how you felt about your circumcision status, what would you say?
              </blockquote>
              <p style={{ margin: "0 0 1rem" }}>
                That is the question I set out to ask when I built this anonymous survey. The biology of the foreskin is well understood. Its nerve density, mechanical function, and immunological role are documented in anatomy textbooks. Yet routine infant circumcision became standard practice in America during an era when self-pleasure was treated as a medical disorder. The procedure was designed to reduce sexual sensation.
              </p>
              <p style={{ margin: "0 0 1rem" }}>
                Now the culture is shifting. Newborn circumcision rates in the United States have fallen below 50% for the first time in over a century. Parents are asking questions that went unasked a generation ago.
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
              <div style={{
                fontFamily: FONT.display, fontWeight: 700, fontSize: "0.85rem",
                color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.08em",
                margin: "1.2rem 0 0.6rem", lineHeight: 1.2,
              }}>
                Grassroots Outreach
              </div>
              <p style={{ margin: "0 0 1rem" }}>
                There was no advertising budget or clinical recruitment pipeline. The survey spread entirely through grassroots efforts. It was posted to forums, shared across social media, and passed hand to hand. Five hundred people showed up to answer anonymously.
              </p>
              <p style={{ margin: "0 0 1rem" }}>
                The results are striking. <strong style={{ color: C.textBright }}>96% of intact respondents and over 81% of circumcised respondents</strong> agree the child should have the right to decide. No other question in this survey produces a consensus that strong. 
              </p>
              <p style={{ margin: "0 0 1rem" }}>
                Furthermore, <strong style={{ color: C.textBright }}>86% of infant-circumcised respondents</strong> report some resentment, loss, anger, or grief. Their testimonies challenge the old assumption that infants don't remember and men don't care.
              </p>
              <p style={{ margin: 0 }}>
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
          
          <MethodPillars pillars={[
            { Icon: Icons.Eye, title: "Blinded Pathways", line: "Core experience questions were answered before respondents knew they were being sorted.", colorVar: C.blue },
            { Icon: Icons.Grid, title: "Multi-Cohort", line: "Five pathways (intact, circumcised, restoring, observer, and trans/intersex) taking the same base survey.", colorVar: C.goldBright },
            { Icon: Icons.MessageSquareText, title: "Unstructured Data", line: "Respondents described their bodies and their cultural upbringing in their own open-ended words.", colorVar: C.orange },
            { Icon: Icons.Scale, title: "Self-Selected Sample", line: "The survey measures the intensity of experience within the dataset, not population prevalence.", colorVar: C.green },
          ]} />
        </div>

        {/* ── Chapter 1 ── */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem" }}>
          <ChapterDivider id="ch-who-took" act="Chapter 01" title="Who Took This Survey?">
            Five hundred people entered the same door and answered the same experience questions — before any mention of status. Then the survey forked. Let's look at who showed up.
          </ChapterDivider>

          <Station num="05">


            <TourCard title="Global Reach" refText={`FORM CS-001 · PHASE 1`} stamp="Map">
              <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.5rem", padding: "0 1rem" }}>
                <p style={{ margin: "0 0 0.8rem" }}>I originally designed this as a US-focused survey. But once it went live, it was quickly picked up and shared across international forums. People from all over the world started taking it.</p>
                <p style={{ margin: 0 }}>Seeing this broader response, I adjusted the survey's question sets and pathways to ensure non-US respondents could accurately report their experiences, too.</p>
              </div>
              <DemographicMapsBlock />
              <div style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.muted, lineHeight: 1.6, marginTop: "1rem", padding: "0 1rem" }}>
                <p style={{ margin: "0 0 0.6rem" }}>The map tells a story the survey wasn’t originally designed to capture. Circumcision is not solely an American phenomenon — it intersects religious covenants, colonial medical legacies, and cultural norms on every inhabited continent.</p>
                <p style={{ margin: 0 }}>Respondents from non-cutting cultures contributed something equally valuable: a baseline of experience that the United States has largely never had access to.</p>
              </div>
              <ArrowNote lines={[
                <span key="e">Regional counts provisional — stamped by the freeze script · country detail: <a href={EXPLORE_BASE + "demographics"} style={{ color: C.blue }}>Exhibit 05</a></span>,
              ]} />
            </TourCard>

            <TourCard title="Respondent Census & Origins" refText={`FORM CS-001 · PHASE 1 · N = ${N_TOTAL}`} stamp="Phase 1" exhibitStation={st("05")}>
              <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.2rem" }}>
                <p style={{ margin: "0 0 0.8rem" }}>Who are these five hundred people? They span six decades of birth years, from the Silent Generation through Gen Z. They cross political lines, income brackets, education levels, and occupations. They are not a single demographic bloc — and that is precisely the point.</p>
                <p style={{ margin: 0 }}>These are people who <em style={{ color: C.textBright }}>wanted</em> to talk about this. That self-selection is the study’s defining feature and its most important limitation.</p>
              </div>
              <DemographicGrids />
              <ArrowNote lines={[
                "Trans & intersex pathways receive dedicated treatment under the small-sample rule",
              ]} />
            </TourCard>
          </Station>

          <Station num="01">
            <TourCard title="The Survey Architecture" refText="EXHIBIT 01 · ROUTING LOGIC" stamp="Map" exhibitStation={st("01")}>
              <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.2rem" }}>
                <p style={{ margin: "0 0 0.8rem" }}>The survey was engineered with a single, critical constraint: every respondent answered the same core experience questions — <em style={{ color: C.textBright }}>how things feel, how things work, how satisfied they are</em> — before the survey ever asked about their circumcision status.</p>
                <p style={{ margin: 0 }}>Only after those ratings were sealed did the instrument fork into separate pathways. This means the pleasure data you are about to see was collected blind.</p>
              </div>
              <ExhibitSurveyFlowchart />
              <ArrowNote lines={[
                "A respondent is completely blind to the other pathways until the survey is submitted",
                <span key="a">Interact with the map: <a href={EXPLORE_BASE + "pathways"} style={{ color: C.blue }}>Exhibit 01</a></span>,
              ]} />
            </TourCard>
          </Station>
        </div>

        {/* ── Chapter 2 ── */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem" }}>
          <ChapterDivider id="ch-what-feel" act="Chapter 02" title="What Does It Actually Feel Like?">
            Every respondent rated their own sexual experience on the same six questions. This is the distribution of their answers.
          </ChapterDivider>
          
          <div id="baseline-questions" style={{ marginTop: "4rem", marginBottom: "2rem", textAlign: "center", maxWidth: 960, margin: "4rem auto 2rem", padding: "0 1.6rem" }}>
            <Lens>Before separating the data, we asked every single respondent—regardless of their anatomical status—to rate their own experience from 1 to 5 across six core dimensions of physical pleasure: <DocentMarker topic="The Six Dimensions of Pleasure" onClick={() => window.dispatchEvent(new CustomEvent('open-docent', { detail: { context: "The user is looking at the baseline physical pleasure questions before the data is separated by circumcision status.", tourSuas: ["Why did you choose these six specific metrics?", "What is 'mobile skin' in a sexual context?"] } }))} /></Lens>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginTop: "2.5rem",
              marginBottom: "3rem",
              textAlign: "left"
            }}>
              {[
                { label: "Ease of Orgasm", desc: "How effortlessly peak climax is reached." },
                { label: "Light Touch Sensitivity", desc: "Responsiveness to subtle, non-vigorous touch." },
                { label: "Variety of Sensation", desc: "The spectrum of different physical feelings." },
                { label: "Duration of Orgasm", desc: "The length of the climax experience." },
                { label: "Pleasure from Mobile Skin", desc: "Sensation derived from the gliding mechanism." },
                { label: "Orgasm Intensity", desc: "The sheer physical force of the climax." }
              ].map((q, i) => (
                <div key={i} style={{
                  background: "var(--c-bgCard)",
                  padding: "1.5rem",
                  borderRadius: 8,
                  border: `1px solid ${C.ghost}`,
                  borderTop: `2px solid var(--chart-${i})`,
                }}>
                  <div style={{ fontFamily: FONT.condensed, color: `var(--chart-${i})`, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                    Metric 0{i + 1}
                  </div>
                  <div style={{ fontFamily: FONT.display, fontSize: "1.1rem", color: `var(--chart-${i})`, marginBottom: "0.5rem" }}>
                    {q.label}
                  </div>
                  <div style={{ fontFamily: FONT.body, fontSize: "0.9rem", color: C.dim, lineHeight: 1.4 }}>
                    {q.desc}
                  </div>
                </div>
              ))}
            </div>
            
            <Lens>
              When we look at the entire dataset as one massive blob, it looks like a normal bell curve. Most people rate their sex lives somewhere in the middle. But what happens when we filter this exact same data by one crucial anatomical factor? The pool of answers comes apart.
              <DocentMarker topic="The separation of pleasure data" onClick={() => window.dispatchEvent(new CustomEvent('open-docent', { detail: { context: st("03").docentContext, tourSuas: st("03").tourSuas } }))} />
            </Lens>
          </div>
        </div>

        {/* ── 03 · The Demonstration (deep-dark band) ──
            The band's embedded HarmonicCanvas yielded to the UNDERLOOM:
            the background is translucent so the fixed choreography canvas
            shows through, and #demonstration-band is a formation anchor. */}
        <section id="demonstration-band" style={{
          position: "relative", overflow: "hidden", margin: "4rem 0",
          background: "color-mix(in srgb, var(--c-bgDeep) 72%, transparent)",
          borderTop: `1px solid ${C.ghost}`, borderBottom: `1px solid ${C.ghost}`,
        }}>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 960, margin: "0 auto", padding: "4.5rem 1.6rem" }}>
            <SectionKicker kicker="Exhibit 03" title="The Separation" colorVar={st("03").colorVar} />
            
            <TourCard title="Sexual Experience — The Separation" refText="EXHIBIT 03 · THE PLEASURE GAP, LIVE" stamp="Separated">
                  <PleasureGapWidget stats={PLEASURE_GAP_STATS} />
                  <ArrowNote lines={[
                    <span key="b">Explore the metrics: <a href={EXPLORE_BASE + "pleasure-gap"} style={{ color: C.blue }}>Exhibit 03</a></span>,
                  ]} />
                </TourCard>
                
                <TourCard title="How Large Are These Differences?" refText="STATISTICAL EFFECT SIZES · COHEN'S d" stamp="Analysis">
                  <div style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.muted, lineHeight: 1.6, marginBottom: "1rem" }}>
                    The data reveals a clear and consistent separation between the two cohorts across all physiological metrics. In the chart above, you can see the intact bars extend further to the right. But how significant is that gap? We measured the "effect size" — a standard way to gauge how different two groups really are.
                  </div>
                  {PLEASURE_GAP_STATS.map((stat, idx) => {
                    const spectrum = [C.red, C.orange, C.gold, C.green, C.teal, C.blue];
                    return (
                      <EffectSizeRow 
                        key={stat.label} 
                        label={stat.label} 
                        d={stat.intact_vs_circ.cohens_d} 
                        stars={stat.intact_vs_circ.stars} 
                        colorVar={spectrum[idx % spectrum.length]} 
                      />
                    );
                  })}
                  
                  <ResearcherFootnote>
                    Effect sizes (Cohen's d) measure the standardized difference between two means. 
                    All six pleasure metrics yield statistically significant differences (Welch's t-test, p &lt; .001).
                    The largest divergence is observed in the mobile skin rating (t(243.8) = 15.68, p = 7.73e-39), 
                    yielding a Cohen's d of 1.78, 95% CI [1.53, 2.03].
                  </ResearcherFootnote>

                  <div style={{
                    marginTop: "1.1rem", padding: "0.65rem 0.9rem",
                    background: "color-mix(in srgb, var(--c-gold) 6%, transparent)",
                    borderLeft: `3px solid ${C.gold}`, borderRadius: "0 4px 4px 0",
                    fontFamily: FONT.body, fontSize: "0.68rem", fontStyle: "italic", color: C.muted, lineHeight: 1.55,
                  }}>
                    <strong style={{ color: C.goldBright, fontStyle: "normal", fontWeight: 600 }}>{"★"} What is mobile skin? </strong>
                    The intact foreskin is a double-layered mucous membrane that glides freely back and forth over the glans during intercourse. 
                    Circumcision removes this structure, tethering the remaining shaft skin tightly. Our data shows this fundamental difference 
                    in penile mechanics is the single largest source of the pleasure gap.
                  </div>
                </TourCard>


                <TourCard title="Lubrication Requirement" refText={"FORM CS-058 · ANSWERING “NEVER” · N = 486"} stamp="Fig. 3" exhibitStation={st("03")}>
                  <div style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.text, lineHeight: 1.6, marginBottom: "1rem" }}>
                    For many circumcised respondents, artificial lubrication is simply a fact of life—a mandatory requirement for intimacy. But the data reveals this is not a universal male experience; it is associated with altered anatomy. The intact body has a built-in mechanical solution.
                  </div>
                  <div style={{
                    background: "rgba(255,255,255,0.03)", padding: "0.8rem", borderRadius: "6px",
                    border: `1px solid ${C.dim}`, marginBottom: "1.2rem",
                    fontFamily: FONT.body, fontSize: "0.75rem", color: C.muted, fontStyle: "italic", lineHeight: 1.5
                  }}>
                    <strong style={{ color: C.textBright, fontStyle: "normal" }}>Survey Question:</strong> "Do you generally need to use artificial lubrication (e.g., store-bought lube, saliva, lotion) for comfortable and pleasurable masturbation or partnered sex?"
                  </div>

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
                  <div style={{
                    marginTop: "1.1rem", padding: "0.65rem 0.9rem",
                    background: "color-mix(in srgb, var(--c-gold) 6%, transparent)",
                    borderLeft: `3px solid ${C.gold}`, borderRadius: "0 4px 4px 0",
                    fontFamily: FONT.body, fontSize: "0.68rem", fontStyle: "italic", color: C.muted, lineHeight: 1.55,
                  }}>
                    <strong style={{ color: C.goldBright, fontStyle: "normal", fontWeight: 600 }}>{"★"} The Mechanical Reality: </strong>
                    The intact foreskin is a double-layered gliding mechanism that provides its own friction-free
                    stimulation—the skin moves, so the hand doesn't need to. By removing this structure and tethering 
                    the remaining skin tightly to the shaft, circumcision introduces a lifetime requirement for an 
                    external commercial product just to simulate the body's original baseline function. Cultural 
                    euphemisms like "pass the lotion" are so pervasive that many circumcised men assume external 
                    lubrication is a universal requirement. The data shows it isn't.
                  </div>
                </TourCard>
          </div>

          <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem", marginBottom: "4rem" }}>
            <PullStat
              kicker="Across every measure of sexual experience"
              stat="6 for 6"
              line={"On all six pleasure metrics — sensation, mobility, orgasm quality, variety, duration, and ease — the intact cohort scores higher. Not one exception."}
              colorVar={C.red}
            />
          </div>

          {/* ── Chapter 3 ── */}
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem", paddingBottom: "5rem" }}>
            <ChapterDivider id="ch-how-feel" act="Chapter 03" title="What Is Their Experience?">
              The physical data speaks to mechanism. But the people who live in these bodies are the experts on what that means. We asked every respondent the same question: what has your experience actually been?
            </ChapterDivider>
          </div>
        </section>

        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem" }}>

          <Station num="02">
            <TourCard title="The Mirror Pairs" refText="EXHIBIT 02 · 5 OF 18 PAIRS" stamp="Contrasts" exhibitStation={st("02")}>
              <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.2rem" }}>
                Five of the eighteen mirror pairs from the full exhibit. Use the toggles to explore each one.
              </div>
              <MirrorPairToggle />
              <StatCallout big="86% vs 38%" colorVar={C.gold}>
                Infant-circumcised respondents reporting some negative feeling about their status — versus intact respondents who have ever felt any regret.
              </StatCallout>
              <ArrowNote lines={[
                <span key="c">Compare all 18 mirror pairs: <a href={EXPLORE_BASE + "pairs"} style={{ color: C.blue }}>Exhibit 02</a></span>,
              ]} />
            </TourCard>
          </Station>

          <Station num="06">
            <TourCard title="Narrative Mirrors — The Language of Each Side" refText="EXHIBIT 06 · OPEN-ENDED · CURATED SAMPLE" stamp="Voices" style={{ overflow: "hidden" }} exhibitStation={st("06")}>
              <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.2rem" }}>
                When the survey opened a blank text box and asked people to describe their experience in their own words, two entirely different vocabularies came back. One side speaks in terms of <em style={{ color: C.textBright }}>loss</em>. The other didn't know there was anything to say.
              </div>
              <NarrativeMirrorToggle />
              <div style={{ 
                background: "rgba(255, 255, 255, 0.03)", 
                borderLeft: `3px solid ${C.gold}`, 
                padding: "1.2rem", 
                borderRadius: "0 8px 8px 0",
                marginTop: "2rem" 
              }}>
                <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: C.textBright, marginBottom: "0.4rem" }}>
                  A Note on the Distribution
                </div>
                <div style={{ fontFamily: FONT.body, fontSize: "0.9rem", color: C.muted, lineHeight: 1.6 }}>
                  Not every circumcised respondent is distressed. The “fine with it” voice is real, and documenting that range is part of honest reporting. What the data shows is a distribution — and where the weight of that distribution falls.
                </div>
              </div>
              <div style={{ fontFamily: FONT.mono, fontSize: "0.55rem", color: C.dim, marginTop: "1rem" }}>
                ★ Anonymous quotes selected from open-ended responses. All identifying details removed.
              </div>
            </TourCard>
          </Station>
        </div>

        {/* ── Chapter 4 ── */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem" }}>
          <ChapterDivider id="ch-world-told" act="Chapter 04" title="What Did The World Tell Them?">
            The culture surrounding circumcision has changed over the last fifty years. With the internet, a practice that was once a quiet routine is now being actively debated and scrutinized by the very generations who experienced it.
          </ChapterDivider>

          <Station num="07">
            <TourCard title="The Generational Faultline" refText="EXHIBIT 07 · CULTURE & GENERATIONS" stamp="Shifting Norms" exhibitStation={st("07")}>
              <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.2rem" }}>
                <p style={{ margin: "0 0 0.8rem" }}>Satisfaction drops sharply in younger generations. Among Baby Boomers, where circumcision was the overwhelming norm, over half report being proud and satisfied with their status.</p>
                <p style={{ margin: "0 0 0.8rem" }}>But for Generation Z, the trend flips. Over half of Gen Z respondents report dissatisfaction, with the largest single group identifying as "very dissatisfied."</p>
                <p style={{ margin: 0 }}>This divide is mirrored in how respondents remember the communities they grew up in. Circumcised respondents overwhelmingly describe the procedure as <em style={{ color: C.textBright }}>automatic</em> or <em style={{ color: C.textBright }}>unquestioned</em>. For intact respondents, the landscape was far more varied.</p>
              </div>



              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.6rem" }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "0.74rem", color: PATHS.circumcised.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                    “What was the norm in your community?” (Circumcised)
                  </div>
                  <BarRows rows={[
                    { label: "Automatic / unquestioned",  value: 47.6, colorVar: PATHS.circumcised.color },
                    { label: "Strong push / very common", value: 18.9, colorVar: PATHS.circumcised.color },
                    { label: "Not discussed / uncommon",  value: 7.6,  colorVar: PATHS.circumcised.color },
                    { label: "Neutral / 50-50",           value: 2.7,  colorVar: PATHS.circumcised.color },
                  ]} max={50} />
                </div>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "0.74rem", color: PATHS.intact.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                    “What was the norm in your community?” (Intact)
                  </div>
                  <BarRows rows={[
                    { label: "Automatic / unquestioned",  value: 23.5, colorVar: PATHS.intact.color },
                    { label: "Strong push / very common", value: 22.8, colorVar: PATHS.intact.color },
                    { label: "Not discussed / uncommon",  value: 33.8, colorVar: PATHS.intact.color },
                    { label: "Neutral / 50-50",           value: 12.5, colorVar: PATHS.intact.color },
                  ]} max={50} />
                </div>
              </div>
              <div style={{
                marginTop: "3rem",
                paddingTop: "2rem",
                borderTop: `1px dashed ${C.ghost}`,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.45rem",
                  fontFamily: FONT.display, fontWeight: 700, fontSize: "0.74rem",
                  textTransform: "uppercase", letterSpacing: "0.14em", color: C.text,
                  marginBottom: "1rem"
                }}>
                  <span style={{ color: C.red }}>★</span> Belief Pathways
                </div>
                <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "2rem" }}>
                  <p style={{ margin: 0 }}>This diagram illustrates the flow of respondents based on their demographic background through their chosen circumcision pathway, and finally to their current beliefs or perceptions. By following the colored bands, you can see how different origins and experiences contribute to shaping these cultural attitudes.</p>
                </div>
                <div style={{ margin: "0 -1rem" }}>
                  <DemographicSankey 
                    dimensions={[
                      { id: "generation", label: "Generation" },
                      { id: "pathway", label: "Pathway" },
                      { id: "exp_pride_satisfaction_rating", label: "Satisfaction", type: "question" }
                    ]} 
                    targetQuestion="exp_pride_satisfaction_rating" 
                  />
                </div>
              </div>

              <ArrowNote lines={[
                <span key="f">Explore the full generational streamgraphs, from the Silent Generation through Gen Z: <a href={EXPLORE_BASE + "culture"} style={{ color: C.blue }}>Exhibit 07</a></span>,
              ]} />
            </TourCard>
          </Station>

          <Station num="09">
            <TourCard title="The Missing Congregation" refText="EXHIBIT 09 · RELIGION & CIRCUMCISION" stamp="Surprise" exhibitStation={st("09")}>
              <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.2rem" }}>
                <p style={{ margin: "0 0 0.8rem" }}>Religion is the oldest driver of ritual circumcision — but in this dataset, it barely registers. The traditions with millennia of investment in the practice are represented by single-digit samples. The dominant religious cohort describes circumcision not as theology but as culture. And when circumcised respondents rank the forces that shaped their parents' choice, <em style={{ color: C.textBright }}>religious mandate falls eighth out of eleven</em>.</p>
                <p style={{ margin: 0 }}>The few faith-identified respondents who did engage produced some of the survey's most searching, conflicted answers. Their voices deserve to be heard on their own terms.</p>
              </div>

              {/* ── The Missing Congregation: tradition breakdown ── */}
              <div style={{
                background: "linear-gradient(135deg, rgba(255,180,60,0.04) 0%, rgba(255,180,60,0.01) 100%)",
                border: `1px solid rgba(212,160,48,0.18)`,
                borderRadius: 12, padding: "1.2rem 1.4rem", marginBottom: "1.4rem",
                position: "relative",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #d4a030, #68b878, #5b93c7)", borderRadius: "12px 12px 0 0" }} />
                <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.68rem", color: C.gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.7rem" }}>
                  Who Identified a Religious Tradition?
                </div>
                {TRADITION_BREAKDOWN.map((row) => {
                  const maxN = Math.max(...TRADITION_BREAKDOWN.map(r => r.n));
                  return (
                    <div key={row.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                      <span style={{ width: 120, fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.68rem", color: row.colorVar || C.muted, textAlign: "right", flexShrink: 0 }}>
                        {row.label}
                      </span>
                      <div style={{ flex: 1, height: 16, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          width: `${Math.max((row.n / maxN) * 100, 1)}%`, height: "100%", borderRadius: 3,
                          background: row.colorVar ? row.colorVar : "rgba(255,255,255,0.25)",
                          display: "flex", alignItems: "center", paddingLeft: "0.4rem",
                        }}>
                          <span style={{ fontFamily: FONT.mono, fontSize: "0.52rem", fontWeight: 700, color: C.textBright, textShadow: "0 1px 2px rgba(0,0,0,0.8)", whiteSpace: "nowrap" }}>
                            n={row.n}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ fontFamily: FONT.body, fontSize: "0.7rem", color: C.dim, marginTop: "0.5rem", lineHeight: 1.45, fontStyle: "italic" }}>
                  Of {N_TOTAL} respondents, only 21 identified with a tradition historically tied to circumcision. The survey was promoted through bodily autonomy communities — a self-selection pattern worth noting.
                </div>
              </div>

              {/* ── Influence Ranking: where religion falls ── */}
              <div style={{ marginBottom: "1.4rem" }}>
                <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.68rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                  "What Influenced Your Parents?" — Where Religion Ranks
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  {INFLUENCE_RANKING.map((row) => {
                    const isReligion = row.rank === 8;
                    const maxN = INFLUENCE_RANKING[0].n;
                    return (
                      <div key={row.rank} style={{
                        display: "flex", alignItems: "center", gap: "0.4rem",
                        padding: isReligion ? "0.25rem 0.4rem" : "0.1rem 0",
                        background: isReligion ? "rgba(212,160,48,0.12)" : "transparent",
                        borderRadius: isReligion ? 6 : 0,
                        border: isReligion ? `1px solid rgba(212,160,48,0.25)` : "none",
                      }}>
                        <span style={{
                          fontFamily: FONT.mono, fontSize: "0.52rem", fontWeight: 700,
                          color: isReligion ? C.gold : C.dim, width: 14, textAlign: "right", flexShrink: 0,
                        }}>
                          {row.rank}.
                        </span>
                        <div style={{ flex: 1, height: 12, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{
                            width: `${(row.n / maxN) * 100}%`, height: "100%", borderRadius: 2,
                            background: isReligion ? C.goldBright : "rgba(255,255,255,0.35)",
                          }} />
                        </div>
                        <span style={{
                          fontFamily: FONT.condensed, fontSize: "0.58rem", fontWeight: isReligion ? 700 : 500,
                          color: isReligion ? C.gold : C.muted, width: 90, flexShrink: 0,
                        }}>
                          {row.short}
                        </span>
                        <span style={{
                          fontFamily: FONT.mono, fontSize: "0.52rem", fontWeight: 700,
                          color: isReligion ? C.gold : C.dim, width: 25, textAlign: "right", flexShrink: 0,
                        }}>
                          {row.n}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontFamily: FONT.body, fontSize: "0.7rem", color: C.dim, marginTop: "0.5rem", lineHeight: 1.45, fontStyle: "italic" }}>
                  Silence, institutional inertia, and health/hygiene beliefs outrank religion by a factor of 3–4×. In this dataset, circumcision perpetuates itself through medicine and culture, not faith.
                </div>
              </div>

              {/* ── Christian view: not theology ── */}
              <div style={{ marginBottom: "1.4rem" }}>
                <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.68rem", color: "#5b93c7", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                  ✝️ The Largest Religious Cohort: Christians (n=229)
                </div>
                <div style={{ fontFamily: FONT.body, fontSize: "0.82rem", color: C.muted, lineHeight: 1.5, marginBottom: "0.6rem" }}>
                  "Within your Christian tradition, was infant circumcision viewed as…"
                </div>
                <BarRows rows={CHRISTIAN_CIRC_VIEW.map(r => ({
                  label: r.label, value: Math.round(r.n / 222 * 100), colorVar: "#5b93c7",
                }))} />
                <div style={{ fontFamily: FONT.body, fontSize: "0.7rem", color: C.dim, marginTop: "0.5rem", lineHeight: 1.45, fontStyle: "italic" }}>
                  Over half say "a non-issue, left to parents." Christianity has no theological mandate for circumcision—an obligation Paul explicitly abolished for Gentile converts (Galatians 5:2)—yet American Christians circumcise at rates nearly identical to the secular population. The mechanism is culture, not covenant.
                </div>
              </div>

              {/* ── Voice cards: the real voices ── */}
              <div style={{ borderTop: `1px dashed ${C.ghost}`, paddingTop: "1.1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "0.7rem" }}>
                  <VoiceCard colorVar="#5b93c7" label={"— Christian · Restoring"}>
                    {"“There was no theological basis for circumcision in my family. It was regarded as a routine procedure for health and hygiene.”"}
                  </VoiceCard>
                  <VoiceCard colorVar="#d4a030" label={"— Jewish · Circumcised"}>
                    {"“No one who avoids Brit Milah talks about it. It’s done secretively, I think.”"}
                  </VoiceCard>
                  <VoiceCard colorVar="#68b878" label={"— Islamic · Intact"}>
                    {"“I don’t view circumcision as required at all since it’s not in the Quran. Religion is an individual experience.”"}
                  </VoiceCard>
                  <VoiceCard colorVar="#5b93c7" label={"— Christian · Restoring"}>
                    {"“I was beautifully made in my God’s image and someone took a part of that away from me.”"}
                  </VoiceCard>
                  <VoiceCard colorVar="#d4a030" label={"— Jewish · Restoring"}>
                    {"“Jews are known to discuss hard topics at length but this particular one really seems to be off-limits. I hope that changes.”"}
                  </VoiceCard>
                  <VoiceCard colorVar="#68b878" label={"— Islamic · Circumcised"}>
                    {"“I have tried to discuss this issue with several very religious people several times, but they considered it an insult and had no response.”"}
                  </VoiceCard>
                </div>
                <div style={{ fontFamily: FONT.mono, fontSize: "0.5rem", color: C.dim, marginTop: "0.55rem" }}>
                  ★ Anonymous quotes from the tradition-specific open-ended responses.
                </div>
              </div>
              <ArrowNote lines={[<span key="h">Explore each tradition in full: <a href={EXPLORE_BASE + "religious-mirrors"} style={{ color: C.blue }}>Exhibit 09</a></span>]} />
            </TourCard>
          </Station>
        </div>

        {/* ── Chapter 5 ── */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem" }}>
          <ChapterDivider id="ch-observers" act="Chapter 05" title="What Do The Observers Say?">
            Is this just one kind of person answering? We look at the data sliced by independent observers and cross-tabulations.
          </ChapterDivider>

          <Station num="08">
            <TourCard title="The Observers" refText="EXHIBIT 08 · N = 37 · SMALL-SAMPLE FLAGGED" stamp="n=37" exhibitStation={st("08")}>
              <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.2rem" }}>
                Thirty-seven respondents answered about bodies that aren't their own — sexual partners, parents who made the choice, and medical professionals who perform the procedure. Their perspective matters because they are independent observers to the outcomes that the other cohorts are describing from the inside.
              </div>
              <TourObserverBreakdown />
              <div style={{ height: "1.2rem" }} />
              <BarRows rows={[
                { label: "Would keep a future son intact", value: 90.9, colorVar: PATHS.observer.color },
                { label: "Prioritize bodily autonomy",     value: 97.0, colorVar: PATHS.observer.color },
              ]} />
              <ArrowNote lines={[<span key="g">Partner, parent & professional breakdowns: <a href={EXPLORE_BASE + "observer-lens"} style={{ color: C.blue }}>Exhibit 08</a></span>]} />
            </TourCard>
          </Station>

          <Station num="04">
            <TourCard title="The Cycle, Cross-Tabulated" refText="EXHIBIT 04 · FATHER STATUS × RESPONDENT STATUS" stamp="Cross-Tab" exhibitStation={st("04")}>
              <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.2rem" }}>
                Does the status repeat? When we cross-tabulated each respondent's circumcision status against their father's, a clear pattern emerged: circumcision tends to reproduce itself generationally — until someone stops to examine the choice.
              </div>
              <BarRows rows={[
                { label: "Circumcised respondents with circumcised fathers", value: 67.1, colorVar: PATHS.circumcised.color },
                { label: "Intact respondents with intact fathers",           value: 48.9, colorVar: PATHS.intact.color },
              ]} />
              <ArrowNote lines={[
                "The status tends to repeat — until someone examines it. See Exhibit 14 for where the cycle goes next",
                <span key="d">The “keep intact” majority holds across every displayable slice: <a href={EXPLORE_BASE + "correlations"} style={{ color: C.blue }}>Exhibit 04</a></span>,
              ]} />
              <CuratedInsightsToggle />
            </TourCard>
          </Station>
        </div>

        {/* ── Chapter 6 ── */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem" }}>
          <ChapterDivider id="ch-undone" act="Chapter 06" title="Can It Be Undone?">
            From experience to action. A group of respondents is actively trying to grow back what was removed.
          </ChapterDivider>

          <Station num="10">
            <TourCard title="The Restoring Cohort, In Numbers" refText="EXHIBIT 10 · N = 110" stamp="Restoring" exhibitStation={st("10")}>
              <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.2rem" }}>
                These are people who felt strongly enough about what was done to them to undertake a years-long, self-directed process of tissue expansion — with no medical support, no insurance coverage, and no cultural permission.
              </div>
              <BarRows rows={[
                { label: "Report no resentment, ever",                 value: 0.0,  decimals: 1, colorVar: PATHS.circumcised.color },
                { label: "“Something is missing” (orgasm confidence)", value: 59.6, colorVar: PATHS.restoring.color },
                { label: "Would keep a future son intact",             value: 98.1, colorVar: PATHS.restoring.color },
              ]} />
              <StatCallout big="2.85" colorVar="var(--c-green)">
                Restoring respondents' mobile-skin pleasure rating — sitting above the 1.96
                circumcised baseline. Partial regain, in their own numbers.
              </StatCallout>
              
              <TourRestorationPathway />


              <div style={{ marginTop: "3rem" }}>
                <h4 style={{ fontFamily: FONT.condensed, color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem" }}>
                  The Catalyst
                </h4>
                <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.5rem", marginTop: "1rem" }}>
                  What drives a person to embark on a multi-year physical restoration process? We asked respondents to describe the moment that moved them from passive feelings to active restoration.
                </div>
                <RotatingTestimonials motives={RESTORATION_MOTIVES} />
              </div>

              <div style={{ marginTop: "2rem" }}>
                <ArrowNote lines={[
                  "Every restoring respondent reports some resentment — and their mobile-skin ratings sit above the circumcised baseline",
                  <span key="i">Methods, RCI progress & timelines: <a href={EXPLORE_BASE + "restoration-journey"} style={{ color: C.blue }}>Exhibit 10</a></span>,
                ]} />
              </div>
            </TourCard>
          </Station>

          <Station num="11">
            <TourCard title="Adult Circumcision Testimony" refText="EXHIBIT 11 · N = 18 · SMALL-SAMPLE FLAGGED" stamp="n=18" exhibitStation={st("11")}>
              <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.2rem" }}>
                This small group can answer what no one else can: <em style={{ color: C.textBright }}>What changed?</em> These respondents experienced both states — intact and circumcised — as adults, and remember the difference. Their testimony is presented as narrative, not statistics.
              </div>
              <div style={{ marginTop: "2rem", marginBottom: "3rem" }}>
                <h4 style={{ fontFamily: FONT.condensed, color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem" }}>
                  The Context 
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2.5rem" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.05em", color: C.dim, marginBottom: "1rem" }}>When were they cut?</div>
                    <BarRows rows={[
                      { label: "Adulthood", value: 62.2, colorVar: "var(--c-blue)" },
                      { label: "Adolescence", value: 37.8, colorVar: "var(--c-blue)" },
                    ]} max={100} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.05em", color: C.dim, marginBottom: "1rem" }}>Stated Primary Reason</div>
                    <BarRows rows={[
                      { label: "Elective (Aesthetic, Partner, Culture)", value: 54.5, colorVar: "var(--c-blue)" },
                      { label: "Both Medical & Elective", value: 22.7, colorVar: "var(--c-purple)" },
                      { label: "Medical / Therapeutic", value: 18.2, colorVar: "var(--c-red)" },
                    ]} max={100} />
                  </div>
                </div>
              </div>

              <BarRows rows={[
                { label: "Report decreased overall sexual pleasure", value: 72.2, colorVar: PATHS.circumcised.color },
                { label: "Report increased overall sexual pleasure", value: 0.0,  decimals: 1, colorVar: PATHS.circumcised.color },
              ]} max={100} />

              <ArrowNote lines={[<span key="j">Read the testimony: <a href={EXPLORE_BASE + "adult-experience"} style={{ color: C.blue }}>Exhibit 11</a></span>]} />
            </TourCard>
          </Station>
        </div>

        {/* ── Chapter 7 ── */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem" }}>
          <ChapterDivider id="ch-future-son" act="Chapter 07" title="If You Had A Son Today?">
            Every cohort, every pathway, every background — we asked them all the same question. The answer, across nearly every demographic slice we tested, flows in one direction.
          </ChapterDivider>

          <Station num="13">
            <TourCard title="For New & Expectant Parents" refText={"EXHIBIT 13 · TESTIMONIES & INFORMED CHOICE"} stamp="Parents" exhibitStation={st("13")}>
              <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.2rem" }}>
                The exhibit this station previews exists for one audience above all: parents facing this choice right now. Below, grown men — both circumcised and intact — speak directly to those parents in their own words.
              </div>

              <TestimonyRotator />

              <ParentInsightCharts />

              {/* ── Choice environment stat ── */}
              <BarRows rows={[
                { label: "Procedure performed as default/automatic", value: 47.6, colorVar: PATHS.circumcised.color },
                { label: "Parents offered a neutral choice",         value: 2.7,  colorVar: PATHS.circumcised.color },
              ]} max={100} />
              <StatCallout big="2.7%" colorVar={C.red}>
                The fraction of circumcised respondents whose parents were offered a neutral, pros-and-cons choice before the procedure. This exhibit exists for the other 97.3%.
              </StatCallout>
              <ArrowNote lines={[
                <span key="p">Read every testimony and explore the full data: <a href={EXPLORE_BASE + "for-parents"} style={{ color: C.blue }}>Exhibit 13</a></span>,
              ]} />
            </TourCard>
          </Station>

          <Station num="12">
            <TourCard title="By the Numbers: Key Snapshots" refText="EXHIBIT 12 · SNAPSHOT WALL" stamp="Wonder" exhibitStation={st("12")}>

              <SnapshotWall navigate={navigate} isWidget={true} />
            </TourCard>
          </Station>

          <Station num="14">
            <TourCard title="The Convergence" refText="EXHIBIT 14 · ALL COHORTS" stamp="Future" exhibitStation={st("14")}>
              <ConvergenceSankey />
              <StatCallout big="433" colorVar={C.textBright}>
                Of 500 respondents, 433 flow to "Keep Intact."
              </StatCallout>
              <div style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.muted, lineHeight: 1.6, marginTop: "1rem", textAlign: "center" }}>
                The convergence holds across every demographic slice we tested — age, generation, geography, political identity, and religious background. The direction is the same.
              </div>
              <ArrowNote lines={[
                <span key="l">Follow the cohort pathways and read respondents' final thoughts and predictions for the future: <a href={EXPLORE_BASE + "the-forward-view"} style={{ color: C.blue }}>Exhibit 14</a></span>,
              ]} />
            </TourCard>
          </Station>
        </div>

        {/* ── Epilogue: Evidence Summarized ── */}
        <div id="ch-epilogue" style={{ maxWidth: 960, margin: "6rem auto", padding: "0 1.6rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <SectionKicker kicker="Epilogue" title="The Evidence, Summarized" colorVar={C.purple} />
            <DocentMarker topic="Epilogue & Final Thoughts" onClick={() => window.dispatchEvent(new CustomEvent('open-docent', { detail: { context: "The user has reached the end of the Special Report and is viewing the Epilogue summary statistics.", tourSuas: ["What is the main takeaway of this report?", "Where should I go from here?", "How can I help distribute this data?"] } }))} />
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.2rem", margin: "2rem 0"
          }}>
            {[
              { stat: "6 for 6", label: "Pleasure metrics where intact scores higher — a clean sweep", col: C.green },
              { stat: "86%", label: "Infant-circumcised respondents reporting resentment", col: C.gold },
              { stat: "433", label: "Of 500 respondents who would keep a son intact", col: C.blue },
              { stat: "96%", label: "Believe the child should have the right to decide", col: C.purple },
              { stat: "2.7%", label: "Parents offered a neutral choice before procedure", col: C.red },
              { stat: "10:1", label: "Ratio of intact vs circumcised never needing lube", col: C.orange },
            ].map((k) => (
              <div key={k.stat} style={{
                background: "rgba(255,255,255,0.03)", border: `1px solid ${C.ghost}`,
                borderRadius: 8, padding: "1.5rem", textAlign: "center",
              }}>
                <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: "2.2rem", color: k.col, lineHeight: 1 }}>{k.stat}</div>
                <div style={{ fontFamily: FONT.body, fontSize: "0.8rem", color: C.muted, margin: "0.6rem auto 0", lineHeight: 1.4, maxWidth: 180 }}>{k.label}</div>
              </div>
            ))}
          </div>

          <div style={{ fontFamily: FONT.body, fontSize: "1.1rem", color: C.textBright, lineHeight: 1.7, maxWidth: 680, margin: "0 auto 3rem", textAlign: "left" }}>
            <p style={{ marginBottom: "1.5rem" }}>
              These numbers reflect what five hundred people reported about their bodies, experiences, and wishes for the next generation.
            </p>
            <p style={{ marginBottom: "1.5rem" }}>
              Without euphemisms or clinical framing, the data points to a straightforward reality: routine infant circumcision is a penile reduction surgery. It permanently removes highly innervated, erogenous tissue. The data shows this is associated with measurable drops in sexual pleasure, mechanics, and sensitivity.
            </p>
            <p style={{ marginBottom: "1.5rem" }}>
              If parents were routinely given full access to this reality, rather than being offered a "benign cosmetic procedure" by default, this survey suggests far fewer would consent to altering their child's body.
            </p>
            <p style={{ marginBottom: "1.5rem" }}>
              The vast majority of those who have lived it, regardless of their own circumcision status, agree on one fundamental truth: <span style={{ color: C.goldBright }}>the decision belongs to the person who has to live in the body.</span>
            </p>
            <p>
              When you look at the evidence without the cultural blinders, it is hard not to walk away as an accidental intactivist yourself.
            </p>
          </div>

          <div style={{ maxWidth: 800, margin: "0 auto 4rem" }}>
            <h3 style={{ fontFamily: FONT.condensed, fontSize: "1.1rem", color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem", textAlign: "center" }}>
              Final Thoughts from the Survey
            </h3>
            
            <RotatingVoiceCards />

            <div style={{ textAlign: "center", marginTop: "2rem" }}>
               <a href={EXPLORE_BASE} style={{ color: C.blue, fontFamily: FONT.body, fontSize: "0.95rem" }}>The conversation is not over. Every exhibit is available for independent exploration.</a>
            </div>
          </div>



          <div style={{ textAlign: "center", fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, maxWidth: 600, margin: "0 auto" }}>
            The Accidental Intactivist survey is a self-selected sample (N=500). While these numbers do not represent population prevalence, they document the magnitude of differences and shared experiences within this dataset.
          </div>
        </div>
      </div>
    </>
  );
}
