// ═══════════════════════════════════════════════════════════════════════════
// GuidedTour — the Special Report as a guided walk through all 14 exhibits.
// Fully theme-engine native: tokens, PATH_COLORS, HarmonicCanvas, Icons.
// Voice: the Accidental Intactivist lens — summarize and report, never argue.
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { C, FONT, RAINBOW } from "../../explore/styles/tokens";
import HarmonicCanvas from "../HarmonicCanvas";
import { useTheme } from "../../explore/contexts/ThemeContext";
import { ExhibitCard } from "../../explore/components/ExhibitsDashboard";
import { EXHIBIT_ROUTES, ROUTE_META } from "../../explore/components/ExploreMasthead";

import ExhibitSurveyFlowchart from "../../explore/components/SurveyFlowchart";
import { TOUR, PATHS, N_TOTAL, PLEASURE_METRICS, pooledMean } from "./tourData";
import {
  Reveal, StationHero, Lens, TourCard, BarRows, ArrowNote, StatCallout,
  ChapterDivider, DocentMarker, ResearcherFootnote,
  SectionKicker, PullStat, MethodPillars, EXPLORE_BASE,
  EffectSizeRow, EffectBenchmarkChart, EffectSizeBadge,
} from "./tourKit";
import * as Icons from "../../explore/components/Icons";
import {
  PunchCardAtlas, ConvergenceSankey,
  WordMirrors, ResentmentMirror, ProjectionGate,
} from "./TourVisuals";
import PleasureGapWidget from "../../explore/components/PleasureGapWidget";
import { PLEASURE_GAP_STATS, EFFECT_BENCHMARKS, dMagnitude, sigLabel } from "./tourStats";

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

function Station({ num, children }) {
  const s = st(num);
  return (
    <>
      <StationHero station={s} />
      <Lens>{s.lens} <DocentMarker topic={s.title} onClick={() => window.dispatchEvent(new CustomEvent('open-docent', { detail: { context: s.docentContext } }))} /></Lens>
      {children}
    </>
  );
}

export default function GuidedTour() {
  const { theme, mode, colorblind } = useTheme();
  const [predicted, setPredicted] = useState(null);

  const VERDICT = {
    intact: "The projection was correct: the intact cohort reports higher sensation and orgasmic pleasure across the board.",
    circumcised: "The data contradicts the projection: the intact cohort reports higher sensation and orgasmic pleasure.",
    none: "The pool separates entirely: the intact cohort reports higher sensation and orgasmic pleasure across the board.",
  };

  return (
    <>
      <div style={{ paddingBottom: "12rem" }}>
        {/* ── Prologue ── */}
        <div id="ch-prologue" style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem", paddingTop: "8rem" }}>
          <SectionKicker kicker="Prologue" title="The Researcher's Letter" colorVar={C.goldBright} />
          <TourCard title="From the Lead Researcher" refText="A LETTER · READ FIRST" stamp="Signed">
            <div style={{ fontFamily: FONT.body, fontWeight: 300, fontSize: "0.95rem", color: C.text, lineHeight: 1.75, maxWidth: 760 }}>
              <p style={{ margin: "0 0 1rem" }}>
                My name is Tone Pettit, and I am the "Accidental Intactivist." This project was born
                from a lifetime of observation and a single, persistent question.
              </p>
              <p style={{ margin: "0 0 1rem" }}>
                By a conscious choice of my parents in the 1970s, I grew up intact — a complete
                outlier in a US culture where routine infant circumcision was the unquestioned, 90%
                norm. I became an <em style={{ color: C.goldBright }}>accidental witness</em> to a
                profound alteration that nearly all my friends and peers had undergone — something my
                parents had simply waved off as unnecessary.
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
                That is the question I set out to ask when I built this anonymous survey. I wanted to
                know: what was the actual, lived experience of the people in these bodies? The biology
                of the foreskin is well understood. Its nerve density, mechanical function, and
                immunological role are documented in anatomy textbooks, not fringe pamphlets. And yet
                routine infant circumcision became standard practice in America during an era when
                self-pleasure was treated as a medical disorder. The procedure was designed, explicitly,
                to reduce sexual sensation. That history is not in dispute.
              </p>
              <p style={{ margin: "0 0 1rem" }}>
                What is shifting is the culture. Newborn circumcision rates in the United States have
                been reported below 50% for the first time in over a century. Parents are asking
                questions that a generation ago went unasked. This project does not tell anyone what to
                conclude. It asks the people who live in these bodies what their experience actually is,
                and it reports what they said.
              </p>
              <p style={{ margin: "0 0 1rem" }}>
                So I asked. <strong style={{ color: C.textBright }}>96% of respondents across every
                pathway</strong> — intact, circumcised, restoring, and observers alike — agree the
                child should have the right to decide; no other question in this survey produces a
                consensus that strong. <strong style={{ color: C.textBright }}>86% of born-circumcised
                respondents</strong> (circumcised + restoring) report some resentment, loss, anger,
                or grief; only 14% say they have never felt negative about it. Their testimonies
                speak directly to the old assumption that "they don't remember, so they don't care."
              </p>
              <p style={{ margin: 0 }}>
                We are not telling anyone how to feel. This project exists so people can say —
                anonymously, in their own words — how they actually feel and what they actually
                experience. What follows is a guided tour through their answers: summarized, never
                argued. Where I editorialize, it is clearly labeled and kept off the exhibit floor.
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
          <ChapterDivider id="ch-who-took" act="Act I" title="Who Took This Survey?">
            Five hundred people entered the same door and answered the same experience questions — before any mention of status. Then the survey forked. Let's look at who showed up.
          </ChapterDivider>

          <Station num="05">
            <TourCard title="Respondent Census & Origins" refText={`FORM CS-001 · PHASE 1 · N = ${N_TOTAL}`} stamp="Phase 1">
              <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", margin: "0.4rem 0 1.4rem" }}>
                {Object.values(PATHS).map((p) => (
                  <div key={p.label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "1.9rem", lineHeight: 1, color: p.color }}>{p.n}</div>
                    <div style={{ fontFamily: FONT.condensed, fontWeight: 600, fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginTop: "0.3rem" }}>{p.label}</div>
                  </div>
                ))}
              </div>
              <PunchCardAtlas />
              <ArrowNote lines={[
                <span key="e">Regional counts provisional — stamped by the freeze script · country detail: <a href={EXPLORE_BASE + "demographics"} style={{ color: C.blue }}>Exhibit 05</a></span>,
                "Trans & intersex pathways receive dedicated treatment under the small-sample rule",
              ]} />
            </TourCard>
          </Station>

          <Station num="01">
            <TourCard title="The Architecture" refText="EXHIBIT 01 · ROUTING LOGIC" stamp="Map">
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
          <ChapterDivider id="ch-what-feel" act="Act II" title="What Does It Actually Feel Like?">
            Every respondent rated their own sexual experience on the same six questions. Watch what happens when you sort the answers.
          </ChapterDivider>
          
          <Station num="03">
            <TourCard title="Audience Participation" refText="MAKE YOUR PROJECTION" stamp="Sealed">
              <div style={{
                textAlign: "center", fontFamily: FONT.body, fontWeight: 300,
                fontSize: "0.9rem", color: C.muted, maxWidth: 560,
                margin: "0 auto 0.4rem", lineHeight: 1.65,
              }}>
                Pooled together — before anyone was sorted — every one of the six sensation ratings
                sits near the middle of the scale, between {Math.min(...PLEASURE_METRICS.map(pooledMean)).toFixed(1)} and {Math.max(...PLEASURE_METRICS.map(pooledMean)).toFixed(1)} out
                of 5. One unremarkable pool of answers.
              </div>
              <ProjectionGate predicted={!!predicted} onPredict={setPredicted} />
            </TourCard>
          </Station>
        </div>

        {/* ── 03 · The Demonstration (deep-dark band, gated) ── */}
        <section style={{
          position: "relative", overflow: "hidden", margin: "4rem 0",
          background: C.bgDeep, borderTop: `1px solid ${C.ghost}`, borderBottom: `1px solid ${C.ghost}`,
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
            <HarmonicCanvas themeKey={`${theme}-${mode}-${colorblind}`} opacity={1} />
          </div>
          {!predicted && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 3, background: "color-mix(in srgb, var(--c-bgDeep) 92%, transparent)",
              backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center",
              textAlign: "center", padding: "2rem",
            }}>
              <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.22em", textTransform: "uppercase", color: C.goldBright }}>
                The demonstration awaits your projection above
              </div>
            </div>
          )}
          <div style={{ position: "relative", zIndex: 2, maxWidth: 960, margin: "0 auto", padding: "4.5rem 1.6rem" }}>
            <SectionKicker kicker="Exhibit 03 · Lights down, please" title="The Separation" colorVar={st("03").colorVar} />
            <Lens center>{predicted ? VERDICT[predicted] : "Sorted by a single question, the pool of answers comes apart."} <DocentMarker topic="The separation of pleasure data" onClick={() => window.dispatchEvent(new CustomEvent('open-docent', { detail: { context: st("03").docentContext } }))} /></Lens>
            {predicted && (
              <>
                <TourCard title="Sexual Experience — The Separation" refText="EXHIBIT 03 · THE PLEASURE GAP, LIVE" stamp="Separated">
                  <PleasureGapWidget stats={PLEASURE_GAP_STATS} />
                  <ArrowNote lines={[
                    <span key="b">Explore the metrics: <a href={EXPLORE_BASE + "pleasure-gap"} style={{ color: C.blue }}>Exhibit 03</a></span>,
                  ]} />
                </TourCard>
                
                <TourCard title="How Large Are These Differences?" refText="STATISTICAL EFFECT SIZES · COHEN'S d" stamp="Analysis">
                  <div style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.muted, lineHeight: 1.6, marginBottom: "1rem" }}>
                    In the chart above, you can see the intact bars extend further to the right. 
                    But how significant is that gap? We measured the "effect size" — a standard way to gauge how different two groups really are.
                  </div>
                  {PLEASURE_METRICS.map(k => (
                    <EffectSizeRow key={k} statKey={k} data={PLEASURE_GAP_STATS[k]} colorVar={st("03").colorVar} />
                  ))}
                  
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
                    The intact foreskin is a double-layered mucous membrane that glides back and forth over the glans. 
                    Circumcision removes this structure, tethering the remaining shaft skin tightly. Because the famous 1966 
                    Masters & Johnson study only measured the <em>glans</em> (head) of the penis, they missed the primary 
                    mechanical function of the foreskin entirely. Our data shows this gliding mechanism is the single largest 
                    source of the pleasure gap.
                  </div>
                </TourCard>

                <TourCard title="For Perspective: Known Effect Sizes" refText="COHEN'S d BENCHMARKS · PUBLISHED LITERATURE" stamp="Context">
                  <div style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.muted, lineHeight: 1.6, marginBottom: "0.4rem" }}>
                    Is d = 1.78 big? Here is how it compares to well-known effect sizes from other domains. The dashed lines 
                    mark Cohen's conventional thresholds.
                  </div>
                  <EffectBenchmarkChart benchmarks={EFFECT_BENCHMARKS} />
                  <ArrowNote lines={[
                    "The mobile-skin gap exceeds the height difference between men and women (d = 1.6) — one of the largest known biological effect sizes",
                    "Self-selected sample; these statistics describe the magnitude of differences within this dataset, not population prevalence"
                  ]} />
                </TourCard>

                <TourCard title="Lubrication Requirement" refText={"FORM CS-058 · ANSWERING “NEVER” · N = 486"} stamp="Fig. 3">
                  <div style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.text, lineHeight: 1.6, marginBottom: "1rem" }}>
                    More than half of intact respondents say they've never needed artificial lubrication. For circumcised respondents, that number is 5.5%.
                  </div>
                  <BarRows rows={[
                    { label: "Intact",      value: 55.5, colorVar: PATHS.intact.color },
                    { label: "Restoring",   value: 16.0, colorVar: PATHS.restoring.color },
                    { label: "Circumcised", value: 5.5,  colorVar: PATHS.circumcised.color },
                  ]} />
                  <StatCallout big="10:1" colorVar={PATHS.circumcised.color}>
                    The ratio between intact and circumcised respondents who never need artificial
                    lubrication — in the respondents' own reporting.
                  </StatCallout>
                  <div style={{
                    marginTop: "1.1rem", padding: "0.65rem 0.9rem",
                    background: "color-mix(in srgb, var(--c-gold) 6%, transparent)",
                    borderLeft: `3px solid ${C.gold}`, borderRadius: "0 4px 4px 0",
                    fontFamily: FONT.body, fontSize: "0.68rem", fontStyle: "italic", color: C.muted, lineHeight: 1.55,
                  }}>
                    <strong style={{ color: C.goldBright, fontStyle: "normal", fontWeight: 600 }}>{"★"} Why this gap exists: </strong>
                    The intact foreskin's double-layered gliding mechanism provides its own
                    lubrication-free stimulation — the skin moves, the hand doesn't need to. Cultural
                    euphemisms like "pass the lotion" are so pervasive that many circumcised men assume
                    external lubrication is a universal requirement. It isn't. More than half of intact
                    respondents report they have <em>never</em> needed it. This is the natural mechanical
                    function that circumcision removes — and the function that Masters & Johnson's
                    sensitivity studies never measured.
                  </div>
                </TourCard>
              </>
            )}
          </div>
        </section>

        {/* breathing moment */}
        {predicted && (
          <PullStat
            kicker="The widest gap the survey measured"
            stat="d = 1.78"
            line={"Pleasure from mobile skin. The bar exceeds the height difference between men and women."}
            colorVar={C.red}
          />
        )}

        {/* ── Chapter 3 ── */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem" }}>
          <ChapterDivider id="ch-how-feel" act="Act II" title="How Do They Feel About It?">
            The physical difference is one thing. The psychological experience is another. We asked respondents how they felt about what happened to them.
          </ChapterDivider>

          <Station num="02">
            <TourCard title="Resentment vs Regret" refText="EXHIBIT 02 · THE MIRROR PAIRS" stamp="Contrasts">
              <ResentmentMirror />
              <ArrowNote lines={[
                <span key="c">Compare all 18 mirror pairs: <a href={EXPLORE_BASE + "pairs"} style={{ color: C.blue }}>Exhibit 02</a></span>,
              ]} />
            </TourCard>
          </Station>

          <Station num="06">
            <TourCard title="Narrative Mirrors — The Language of Each Side" refText="EXHIBIT 06 · OPEN-ENDED · CURATED SAMPLE" stamp="Voices" style={{ overflow: "hidden" }}>
              <WordMirrors />
              <div style={{ borderTop: `1px dashed ${C.ghost}`, marginTop: "1.1rem", paddingTop: "1.1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "0.7rem" }}>
                  <VoiceCard colorVar={PATHS.circumcised.color} label="— Circumcised Voice · On drawbacks">
                    “Pain. Loss of pleasure. Loss of confidence. Loss of trust. Self hatred. Depression.”
                  </VoiceCard>
                  <VoiceCard colorVar={PATHS.intact.color} label="— Intact Voice · On the everyday">
                    “Honestly? I never think about it. It works, everything moves, nothing hurts. I didn't realize that was worth saying out loud until this survey.”
                  </VoiceCard>
                  <VoiceCard colorVar={PATHS.circumcised.color} label="— Circumcised Voice · On satisfaction">
                    “I'm fine with it. My parents did what everyone did. I don't feel damaged and I don't feel angry.”
                  </VoiceCard>
                </div>
                <div style={{ fontFamily: FONT.mono, fontSize: "0.5rem", color: C.dim, marginTop: "0.55rem" }}>
                  ★ Anonymous quotes selected from open-ended responses. All identifying details removed.
                </div>
              </div>
            </TourCard>
          </Station>
        </div>

        {/* ── Chapter 4 ── */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem" }}>
          <ChapterDivider id="ch-world-told" act="Act II" title="What Did The World Tell Them?">
            Nobody grows up in a vacuum. We asked everyone the same question: 'What was the norm where you grew up?' The answers describe two different Americas.
          </ChapterDivider>

          <Station num="07">
            <TourCard title="“What was the norm in your community growing up?”" refText="EXHIBIT 07 · MIRROR · CIRCUMCISED VS INTACT" stamp="Two Worlds">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.6rem" }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "0.74rem", color: PATHS.circumcised.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                    The circumcised respondents' world
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
                    The intact respondents' world
                  </div>
                  <BarRows rows={[
                    { label: "Automatic / unquestioned",  value: 23.5, colorVar: PATHS.intact.color },
                    { label: "Strong push / very common", value: 22.8, colorVar: PATHS.intact.color },
                    { label: "Not discussed / uncommon",  value: 33.8, colorVar: PATHS.intact.color },
                    { label: "Neutral / 50-50",           value: 12.5, colorVar: PATHS.intact.color },
                  ]} max={50} />
                </div>
              </div>
              <ArrowNote lines={[
                <span key="f">Generational trend lines, Silent Generation through Gen Z: <a href={EXPLORE_BASE + "culture"} style={{ color: C.blue }}>Exhibit 07</a></span>,
              ]} />
            </TourCard>
          </Station>

          <Station num="09">
            <TourCard title="Three Traditions, One Question Set" refText="EXHIBIT 09 · OPTIONAL FAITH SECTIONS" stamp="In Full">
              <div style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.muted, lineHeight: 1.6 }}>
                The exhibit presents each tradition's responses in parallel, unabridged and uncompared
                until you choose to compare them.
              </div>
              <ArrowNote lines={[<span key="h">Enter the mirrors: <a href={EXPLORE_BASE + "religious-mirrors"} style={{ color: C.blue }}>Exhibit 09</a></span>]} />
            </TourCard>
          </Station>
        </div>

        {/* ── Chapter 5 ── */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem" }}>
          <ChapterDivider id="ch-witnesses" act="Act II" title="What Do The Witnesses Say?">
            Is this just one kind of person answering? We look at the data sliced by independent witnesses and cross-tabulations.
          </ChapterDivider>

          <Station num="08">
            <TourCard title="The Witnesses" refText="EXHIBIT 08 · N = 37 · SMALL-SAMPLE FLAGGED" stamp="n=37">
              <BarRows rows={[
                { label: "Would keep a future son intact", value: 90.9, colorVar: PATHS.observer.color },
                { label: "Prioritize bodily autonomy",     value: 97.0, colorVar: PATHS.observer.color },
              ]} />
              <ArrowNote lines={[<span key="g">Partner, parent & professional breakdowns: <a href={EXPLORE_BASE + "observer-lens"} style={{ color: C.blue }}>Exhibit 08</a></span>]} />
            </TourCard>
          </Station>

          <Station num="04">
            <TourCard title="The Cycle, Cross-Tabulated" refText="EXHIBIT 04 · FATHER STATUS × RESPONDENT STATUS" stamp="Cross-Tab">
              <BarRows rows={[
                { label: "Circumcised respondents with circumcised fathers", value: 67.1, colorVar: PATHS.circumcised.color },
                { label: "Intact respondents with intact fathers",           value: 48.9, colorVar: PATHS.intact.color },
              ]} />
              <ArrowNote lines={[
                "The status tends to repeat — until someone examines it. See Exhibit 14 for where the cycle goes next",
                <span key="d">The “keep intact” majority holds across every displayable slice: <a href={EXPLORE_BASE + "correlations"} style={{ color: C.blue }}>Exhibit 04</a></span>,
              ]} />
            </TourCard>
          </Station>
        </div>

        {/* ── Chapter 6 ── */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem" }}>
          <ChapterDivider id="ch-undone" act="Act III" title="Can It Be Undone?">
            From experience to action. A group of respondents is actively trying to grow back what was removed.
          </ChapterDivider>

          <Station num="10">
            <TourCard title="The Restoring Cohort, In Numbers" refText="EXHIBIT 10 · N = 110" stamp="Restoring">
              <BarRows rows={[
                { label: "Report no resentment, ever",                 value: 0.0,  decimals: 1, colorVar: PATHS.circumcised.color },
                { label: "“Something is missing” (orgasm confidence)", value: 59.6, colorVar: PATHS.restoring.color },
                { label: "Would keep a future son intact",             value: 98.1, colorVar: PATHS.restoring.color },
              ]} />
              <StatCallout big="2.85" colorVar="var(--c-green)">
                Restoring respondents' mobile-skin pleasure rating — sitting above the 1.96
                circumcised baseline. Partial regain, in their own numbers.
              </StatCallout>
              <ArrowNote lines={[
                "Every restoring respondent reports some resentment — and their mobile-skin ratings sit above the circumcised baseline",
                <span key="i">Methods, RCI progress & timelines: <a href={EXPLORE_BASE + "restoration-journey"} style={{ color: C.blue }}>Exhibit 10</a></span>,
              ]} />
            </TourCard>
          </Station>

          <Station num="11">
            <TourCard title="Adult Circumcision Testimony" refText="EXHIBIT 11 · N = 18 · SMALL-SAMPLE FLAGGED" stamp="n=18">
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
          <ChapterDivider id="ch-future-son" act="Act III" title="If You Had A Son Today?">
            The final question asks everyone to look forward. Where does this go next?
          </ChapterDivider>

          <Station num="13">
            <TourCard title="The Decision Environment" refText="EXHIBIT 13 · N = 212" stamp="Context">
              <BarRows rows={[
                { label: "Procedure performed as default/automatic", value: 47.6, colorVar: PATHS.circumcised.color },
                { label: "Parents offered a neutral choice",         value: 2.7,  colorVar: PATHS.circumcised.color },
              ]} max={100} />
            </TourCard>
          </Station>

          <Station num="14">
            <TourCard title="The Convergence" refText="EXHIBIT 14 · ALL COHORTS" stamp="Future">
              <ConvergenceSankey />
              <StatCallout big="433" colorVar={C.textBright}>
                Of 500 respondents, 433 flow to "Keep Intact."
              </StatCallout>
              <ArrowNote lines={[
                <span key="l">Follow the individual cohort pathways: <a href={EXPLORE_BASE + "the-forward-view"} style={{ color: C.blue }}>Exhibit 14</a></span>,
              ]} />
            </TourCard>
          </Station>

          <Station num="12">
            <TourCard title="The Curiosity Gap" refText="EXHIBIT 12 · MIRROR QUESTIONS" stamp="Wonder">
              <BarRows rows={[
                { label: "Circumcised respondents who wonder what it's like to be intact", value: 67.8, colorVar: PATHS.circumcised.color },
                { label: "Intact respondents who wonder what it's like to be circumcised", value: 27.3, colorVar: PATHS.intact.color },
              ]} max={100} />
            </TourCard>
          </Station>
        </div>

        {/* ── Epilogue: Evidence Summarized ── */}
        <div id="ch-epilogue" style={{ maxWidth: 960, margin: "6rem auto", padding: "0 1.6rem" }}>
          <SectionKicker kicker="Epilogue" title="The Evidence, Summarized" colorVar={C.purple} />
          
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.2rem", margin: "2rem 0"
          }}>
            {[
              { stat: "d = 1.78", label: "Effect size of the 'mobile skin' pleasure gap", col: C.green },
              { stat: "86%", label: "Born-circumcised respondents reporting resentment", col: C.gold },
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

          <div style={{ textAlign: "center", fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, maxWidth: 600, margin: "0 auto" }}>
            The Accidental Intactivist survey is a self-selected sample (N=500). While these numbers do not represent population prevalence, they document the magnitude of differences and shared experiences within this dataset.
          </div>
        </div>
      </div>
    </>
  );
}
