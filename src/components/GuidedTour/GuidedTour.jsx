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
import { ReportProvider } from "../../explore/contexts/ReportContext";
import ExhibitSurveyFlowchart from "../../explore/components/SurveyFlowchart";
import { TOUR, PATHS, N_TOTAL, PLEASURE_METRICS, pooledMean } from "./tourData";
import {
  Reveal, StationHero, Lens, TourCard, BarRows, ArrowNote, StatCallout,
  SectionKicker, PullStat, MethodPillars, EXPLORE_BASE,
} from "./tourKit";
import * as Icons from "../../explore/components/Icons";
import {
  PunchCardAtlas, ConvergenceSankey,
  WordMirrors, ResentmentMirror, ProjectionGate,
} from "./TourVisuals";
import PleasureGapWidget from "../../explore/components/PleasureGapWidget";

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
      <Lens>{s.lens}</Lens>
      {children}
    </>
  );
}

export default function GuidedTour() {
  const { theme, mode, colorblind } = useTheme();
  const [predicted, setPredicted] = useState(null);
  const VERDICT = {
    split: "You projected a wide split. Watch how wide the respondents drew it.",
    small: "You projected small differences. Watch what the respondents reported.",
    same:  "You projected no change. Watch what actually happened.",
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem" }}>

        {/* ── Introduction: the researcher's letter ── */}
        <SectionKicker kicker="Before you enter" title="The 'Why' Behind This Inquiry" />
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
              know: what made parents like mine such outliers? What was the actual, lived experience
              of the people in these bodies? The historical record is stranger than most people
              know — infant circumcision was popularized in America specifically to curb
              masturbation — and the latest European clinical consensus describes the routine form
              as non-therapeutic. Yet as a Johns Hopkins release noted, US newborn circumcision has
              now dropped below 49% — a <strong style={{ color: C.textBright }}>minority
              procedure</strong> for the first time in a century. Something is shifting. Nobody was
              asking the people it happened to.
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

        <SectionKicker kicker="The instrument" title="The Inquiry & Its Method" />
        <TourCard title="How This Inquiry Works" refText="METHODOLOGY · CONDENSED · FULL VERSION ONE CLICK AWAY" stamp="Read First">
          <MethodPillars pillars={[
            { Icon: Icons.Zap,       colorVar: "var(--c-orange)", title: "Experience first",
              line: "Sensation was rated before circumcision was ever mentioned." },
            { Icon: Icons.GitBranch, colorVar: "var(--c-blue)",   title: "Six pathways",
              line: "Every respondent walks a route phrased for their life." },
            { Icon: Icons.Shield,    colorVar: "var(--c-green)",  title: "Anonymous by design",
              line: "No identifiers. Every question optional. Quotes scrubbed." },
            { Icon: Icons.Users,     colorVar: "var(--c-grey)",   title: "An honest sample",
              line: "Self-selected, mostly North American — reported as exactly that." },
          ]} />
          <ArrowNote lines={[
            <span key="m1">Full survey design, ethics framework & limitations: <a href={EXPLORE_BASE + "methodology"} style={{ color: C.blue }}>Survey Methodology</a> · the project & collaborators: <a href="https://circumsurvey.online" style={{ color: C.blue }}>circumsurvey.online</a></span>,
          ]} />
        </TourCard>

        {/* ── Tour map ── */}
        <SectionKicker kicker="Your tour map" title="Fourteen Exhibits, One Honest Question" />
        <Lens center>
          The findings live in fourteen interactive exhibits. This tour walks each one in order —
          tap any tile to jump ahead, and step into the live exhibit the moment it interests you.
        </Lens>
        <Reveal>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "1.4rem" }}>
            {Object.values(PATHS).map((p) => (
              <span key={p.label} style={{
                fontFamily: FONT.condensed, fontSize: "0.64rem", fontWeight: 600, letterSpacing: "0.02em",
                padding: "0.28rem 0.75rem", borderRadius: 100, color: p.color,
                border: `1.5px solid color-mix(in srgb, ${p.color} 40%, transparent)`,
                background: `color-mix(in srgb, ${p.color} 10%, transparent)`,
                display: "inline-flex", alignItems: "center", gap: "0.35rem",
              }}>
                <i style={{ width: 9, height: 9, borderRadius: "50%", background: p.color }} />
                {p.label} n={p.n}
              </span>
            ))}
          </div>
          {/* The exhibition's own gemstone tiles — tap to jump to that station */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "1rem",
          }}>
            {EXHIBIT_ROUTES.map((ex) => (
              <ExhibitCard
                key={ex.route}
                exhibit={ex}
                meta={ROUTE_META[ex.route] || {}}
                href={`#st${ex.num.replace("Exhibit ", "")}`}
              />
            ))}
          </div>
          <ArrowNote lines={["Tap any tile to jump to its station — every station links into its live, interactive original"]} />
        </Reveal>

        {/* ── 01 Survey Map — the exhibit's own board-game flowchart, embedded ── */}
        <Station num="01">
          <Reveal>
            <ReportProvider>
              <ExhibitSurveyFlowchart
                navigate={(route) => { window.location.href = `/explore#/${route}`; }}
              />
            </ReportProvider>
            <ArrowNote lines={[
              "The board above IS Exhibit 01 — expand any card, follow any ribbon, pin pathways to compare",
              <span key="a">Prefer the full-page version? <a href={EXPLORE_BASE + "pathways"} style={{ color: C.blue }}>Enter Exhibit 01</a></span>,
            ]} />
          </Reveal>
        </Station>

        {/* ── 02 Mirror Pairs ── */}
        <Station num="02">
          <TourCard title="Mirror Comparison · Resentment vs Regret" refText="EXHIBIT 02 · PARALLEL QUESTION PAIR" stamp="Mirror">
            <div style={{
              margin: "0 0 1rem", padding: "0.55rem 0.8rem",
              background: "color-mix(in srgb, var(--c-gold) 6%, transparent)",
              borderLeft: `3px solid ${C.gold}`, borderRadius: "0 4px 4px 0",
              fontFamily: FONT.body, fontSize: "0.68rem", fontStyle: "italic", color: C.muted, lineHeight: 1.55,
            }}>
              <strong style={{ color: C.goldBright, fontStyle: "normal", fontWeight: 600 }}>★ Language note: </strong>
              We use “resentment” for the Circumcised Pathway because the procedure was performed
              without their agency, and “regret” for the Intact Pathway because that is the word that
              could meaningfully apply to a state they grew into. Shaped by community feedback.
            </div>
            <ResentmentMirror />
            <ArrowNote lines={[
              "79% of circumcised respondents report some resentment; 61.9% of intact respondents report no regret, ever",
              <span key="b">All eighteen pairs, interactive: <a href={EXPLORE_BASE + "pairs"} style={{ color: C.blue }}>Exhibit 02</a></span>,
            ]} />
          </TourCard>
        </Station>

        {/* ── 03 Pleasure Gap: the gate ── */}
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
          <Lens center>{predicted ? VERDICT[predicted] : "Sorted by a single question, the pool of answers comes apart."}</Lens>
          {predicted && (
            <>
              <TourCard title="Sexual Experience — The Separation" refText="EXHIBIT 03 · THE PLEASURE GAP, LIVE" stamp="Separated">
                {/* The exhibit's own polished chart — self-fetching, theme-native */}
                <PleasureGapWidget />
                <ArrowNote lines={[
                  "Largest gap in the dataset: pleasure from mobile skin — roughly 2.5 points on a 5-point scale",
                  <span key="c">Gap plot, cohort filters & voices: <a href={EXPLORE_BASE + "pleasure-gap"} style={{ color: C.blue }}>Exhibit 03</a></span>,
                ]} />
              </TourCard>
              <TourCard title="Lubrication Requirement" refText="FORM CS-058 · ANSWERING “NEVER” · N = 486" stamp="Fig. 3">
                <BarRows rows={[
                  { label: "Intact",      value: 55.5, colorVar: PATHS.intact.color },
                  { label: "Restoring",   value: 16.0, colorVar: PATHS.restoring.color },
                  { label: "Circumcised", value: 5.5,  colorVar: PATHS.circumcised.color },
                ]} />
                <StatCallout big="10:1" colorVar={PATHS.circumcised.color}>
                  The ratio between intact and circumcised respondents who never need artificial
                  lubrication — in the respondents' own reporting. We add no adjective to it.
                </StatCallout>
              </TourCard>
            </>
          )}
        </div>
      </section>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 1.6rem" }}>

        {/* breathing moment */}
        {predicted && (
          <PullStat
            kicker="The widest gap the survey measured"
            stat="4.47 vs 1.96"
            line="Pleasure from mobile skin, intact vs circumcised — two and a half points apart on a five-point scale."
            colorVar={PATHS.intact.color}
          />
        )}

        {/* ── 04 Correlations ── */}
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

        {/* ── 05 Demographics ── */}
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

        {/* ── 06 Voices ── */}
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
                ★ Anonymous quotes selected from open-ended responses. All identifying details removed. Word weights provisional pending the narrative-frequency export.
              </div>
            </div>
          </TourCard>
        </Station>

        {/* ── 07 Culture ── */}
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
              "Same question, mirrored — two very different weather reports",
              <span key="f">Generational trend lines, Silent Generation through Gen Z: <a href={EXPLORE_BASE + "culture"} style={{ color: C.blue }}>Exhibit 07</a></span>,
            ]} />
          </TourCard>
        </Station>

        {/* ── 08 Observer ── */}
        <Station num="08">
          <TourCard title="The Witnesses" refText="EXHIBIT 08 · N = 37 · SMALL-SAMPLE FLAGGED" stamp="n=37">
            <BarRows rows={[
              { label: "Would keep a future son intact", value: 90.9, colorVar: PATHS.observer.color },
              { label: "Prioritize bodily autonomy",     value: 97.0, colorVar: PATHS.observer.color },
            ]} />
            <ArrowNote lines={[<span key="g">Partner, parent & professional breakdowns: <a href={EXPLORE_BASE + "observer-lens"} style={{ color: C.blue }}>Exhibit 08</a></span>]} />
          </TourCard>
        </Station>

        {/* ── 09 Religious ── */}
        <Station num="09">
          <TourCard title="Three Traditions, One Question Set" refText="EXHIBIT 09 · OPTIONAL FAITH SECTIONS" stamp="In Full">
            <div style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.muted, lineHeight: 1.6 }}>
              The exhibit presents each tradition's responses in parallel, unabridged and uncompared
              until you choose to compare them.
            </div>
            <ArrowNote lines={[<span key="h">Enter the mirrors: <a href={EXPLORE_BASE + "religious-mirrors"} style={{ color: C.blue }}>Exhibit 09</a></span>]} />
          </TourCard>
        </Station>

        {/* ── 10 Restoration ── */}
        <Station num="10">
          <TourCard title="The Restoring Cohort, In Numbers" refText="EXHIBIT 10 · N = 110" stamp="Restoring">
            <BarRows rows={[
              { label: "Report no resentment, ever",                 value: 0.0,  decimals: 1, colorVar: PATHS.circumcised.color },
              { label: "“Something is missing” (orgasm confidence)", value: 59.6, colorVar: PATHS.restoring.color },
              { label: "Would keep a future son intact",             value: 98.1, colorVar: PATHS.restoring.color },
            ]} />
            <StatCallout big="2.85" colorVar="var(--c-green)">
              Restoring respondents' mobile-skin pleasure rating — sitting clearly above the 1.96
              circumcised baseline. Partial regain, in their own numbers.
            </StatCallout>
            <ArrowNote lines={[
              "Every restoring respondent reports some resentment — and their mobile-skin ratings sit above the circumcised baseline",
              <span key="i">Methods, RCI progress & timelines: <a href={EXPLORE_BASE + "restoration-journey"} style={{ color: C.blue }}>Exhibit 10</a></span>,
            ]} />
          </TourCard>
        </Station>

        {/* ── 11 Adult experience ── */}
        <Station num="11">
          <TourCard title="The Only Direct Witnesses" refText="EXHIBIT 11 · SMALL N · TESTIMONY-FIRST" stamp="Testimony">
            <div style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.muted, lineHeight: 1.6 }}>
              First-hand before-and-after comparisons — presented individually, flagged for sample
              size, never aggregated into percentages the n cannot support.
            </div>
            <ArrowNote lines={[<span key="j">Read their accounts: <a href={EXPLORE_BASE + "adult-experience"} style={{ color: C.blue }}>Exhibit 11</a></span>]} />
          </TourCard>
        </Station>

        {/* ── 12 Numbers ── */}
        <Station num="12">
          <TourCard title="Three Unexpected Numbers" refText="EXHIBIT 12 · COHORT FILTERS AVAILABLE" stamp="Key Stats">
            <BarRows rows={[
              { label: "Circumcised men preferring the intact appearance",     value: 52,   colorVar: PATHS.circumcised.color },
              { label: "Circumcised who often wonder about intact experience", value: 67.8, colorVar: PATHS.circumcised.color },
              { label: "Intact who often wonder the reverse",                  value: 27.3, colorVar: PATHS.intact.color },
              { label: "Prioritize bodily autonomy (every pathway's floor)",   value: 81,   colorVar: "var(--c-green)" },
            ]} />
            <ArrowNote lines={[
              "The curiosity points overwhelmingly in one direction; we leave it to you to say which",
              <span key="k">All key metrics with cohort filters: <a href={EXPLORE_BASE + "numbers"} style={{ color: C.blue }}>Exhibit 12</a></span>,
            ]} />
          </TourCard>
        </Station>

        {/* breathing moment */}
        <PullStat
          kicker="How the decision was presented to parents"
          stat="2.7%"
          line="were offered circumcision as a neutral choice with pros and cons. The other 97.3% got a default."
          colorVar={PATHS.circumcised.color}
        />

        {/* ── 13 For parents ── */}
        <Station num="13">
          <TourCard title="How the Decision Was Handled" refText="FORM CS-095 · CIRCUMCISED PATHWAY · EXHIBIT 13" stamp="For Parents">
            <BarRows max={50} rows={[
              { label: "Routine / automatic",           value: 47.6, colorVar: PATHS.circumcised.color },
              { label: "No idea",                       value: 23.2, colorVar: "var(--c-grey)" },
              { label: "Strong medical recommendation", value: 18.9, colorVar: "var(--c-orange)" },
              { label: "Not brought up",                value: 7.6,  colorVar: "var(--c-yellow)" },
              { label: "Neutral pros & cons",           value: 2.7,  colorVar: PATHS.intact.color },
            ]} />
            <StatCallout big="2.7%" colorVar={PATHS.circumcised.color}>
              report the procedure was presented as a neutral choice with pros and cons. This exhibit
              exists so the next 97.3% can have what they didn't: what grown children, other parents,
              and medical professionals actually say.
            </StatCallout>
            <ArrowNote lines={[<span key="l">The shareable parents' resource: <a href={EXPLORE_BASE + "for-parents"} style={{ color: C.blue }}>Exhibit 13</a></span>]} />
          </TourCard>
        </Station>

        {/* breathing moment */}
        <PullStat
          kicker="If you had a son today"
          stat="433 of 500"
          line="would keep him intact — including 78% of circumcised respondents. Whatever their past, watch where they flow."
          colorVar="var(--c-green)"
        />

        {/* ── 14 Forward view ── */}
        <Station num="14">
          <TourCard title="Future-Son Intentions — The Convergence" refText={`EXHIBIT 14 · FORM CS-177 · ALL PATHWAYS · N = ${N_TOTAL}`} stamp="Consensus">
            <ConvergenceSankey />
            <StatCallout big="0%" colorVar="var(--c-green)">
              of intact and restoring respondents would choose circumcision for a future son. The
              “keep intact” majority holds across every demographic slice we can display.
            </StatCallout>
            <ArrowNote lines={[
              "433 of 500 flow to “keep intact” — including 78.1% of circumcised respondents",
              <span key="m">Re-cut by any demographic: <a href={EXPLORE_BASE + "the-forward-view"} style={{ color: C.blue }}>Exhibit 14</a></span>,
            ]} />
          </TourCard>
        </Station>

        {/* ── Finale ── */}
        <SectionKicker kicker="The tour concludes" title="The Exhibition Stays Open" />
        <Lens center>
          Fourteen exhibits, five hundred voices, zero adjectives from me. Three doors lead out — choose freely.
        </Lens>
        <Reveal>
          <div style={{ display: "flex", gap: "1.1rem", flexWrap: "wrap", justifyContent: "center", margin: "2rem 0 1rem" }}>
            {[
              { adm: "Admit One",    t: "Add your voice",      d: "Take the survey. Fifteen minutes, totally anonymous, skip any question.", href: "https://forms.gle/FQ8o9g7j1yU3Cw7n7" },
              { adm: "All-Day Pass", t: "The full exhibition", d: "All fourteen exhibits, every question, cohort filters, and the AI docent.", href: "/explore" },
              { adm: "Guide's Notes", t: "The researcher's view", d: "Interpretation and argument, clearly labeled as such. Off the exhibit floor.", href: "https://theaccidentalintactivist.substack.com" },
            ].map((k) => (
              <a key={k.adm} href={k.href} style={{
                flex: 1, minWidth: 216, maxWidth: 262, border: `1px solid ${C.ghost}`, borderRadius: 12,
                background: C.bgCard, textDecoration: "none", overflow: "hidden", transition: "all .18s ease",
              }}>
                <div style={{ height: 4, background: RAINBOW }} />
                <div style={{ padding: "1.15rem 1.3rem 1.3rem" }}>
                  <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: "0.54rem", letterSpacing: "0.22em", color: C.goldBright, textTransform: "uppercase" }}>
                    ★ {k.adm}
                  </div>
                  <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase", color: C.textBright, margin: "0.4rem 0 0.3rem" }}>{k.t}</div>
                  <div style={{ fontFamily: FONT.body, fontWeight: 300, fontSize: "0.76rem", color: C.muted, lineHeight: 1.55 }}>{k.d}</div>
                </div>
              </a>
            ))}
          </div>
          <div style={{ textAlign: "center", padding: "2.5rem 2rem 3rem" }}>
            <div style={{ height: 4, background: RAINBOW, width: 120, margin: "0 auto 1rem", borderRadius: 2 }} />
            <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: "0.9rem", color: C.gold, marginBottom: "0.3rem" }}>
              The Accidental Intactivist's Inquiry
            </div>
            <div style={{ fontFamily: FONT.mono, fontSize: "0.56rem", color: C.dim, letterSpacing: "0.1em", lineHeight: 2, textTransform: "uppercase" }}>
              Phase 1 snapshot · N = {N_TOTAL} · Fourteen exhibits · findings.circumsurvey.online/explore<br />
              Methodology & limitations one click away, always · Anonymous quotes, all identifying details removed
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
