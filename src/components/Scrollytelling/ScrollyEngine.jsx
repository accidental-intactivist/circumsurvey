import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import PlotterCanvas from './PlotterCanvas';
import RegistrationMarks from './RegistrationMarks';
import ScrollyNarrative from './ScrollyNarrative';
import CIROLegend from './CIROLegend';
import CIRODotExplorer from './CIRODotExplorer';
import ScrollyDataChart from './ScrollyDataChart';
import BeliefSwarm from './BeliefSwarm';
import ObserverLens from './ObserverLens';
import CinematicIntro from './CinematicIntro';
import StickyScrollyBlock from './StickyScrollyBlock';
import { META, PATHWAY, MIRROR_PAIRS } from '../../data.js';
import { DEMOGRAPHIC_DIMENSIONS } from '../../demographics.js';
import { VOICES_THEMES } from '../../voices.js';

gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════════════════════════════
// Phase 1 static data — frozen snapshot at the 500-respondent milestone.
// The Explore dashboard (/explore) stays live and real-time.
// Exception: Observer & Trans pathway respondents arriving after 500
// are still aggregated into this report as they become available.
// ═══════════════════════════════════════════════════════════════════════════

const PHASE1_TOTAL = 500; // Phase 1 milestone cutoff

// Rotating hook facts — reworded for invitation, not aggression.
// These frame mysteries to explore, not verdicts to accept.
const HOOK_FACTS = [
  {
    text: "When asked anonymously, what do people actually think about circumcision?",
    color: "var(--c-blue)",
  },
  {
    text: `${PHASE1_TOTAL} men answered questions they've never been asked before.`,
    color: "var(--c-gold)",
  },
  {
    text: "What if the most common reason parents choose it is... that nobody told them not to?",
    color: "var(--c-orange)",
  },
  {
    text: "What would you say if someone finally asked?",
    color: "var(--c-red)",
  },
];

const PROUD_CATEGORIES = [
  { key: 'v_diss', label: 'Very Dissatisfied', color: '#d94f4f' },
  { key: 's_diss', label: 'Somewhat Dissatisfied', color: '#e8a44a' },
  { key: 'neutral', label: 'Neutral', color: '#e8c868', textColor: '#000' },
  { key: 'g_proud', label: 'Generally Proud', color: '#add8e6', textColor: '#000' },
  { key: 'v_proud', label: 'Very Proud', color: '#5b93c7' },
];

const PROUD_DATA = [
  { group: 'Intact', values: { v_diss: 0.56, s_diss: 9.56, neutral: 12.5, g_proud: 38.24, v_proud: 38.97 } },
  { group: 'Restoring', values: { v_diss: 24.76, s_diss: 38.1, neutral: 12.38, g_proud: 17.14, v_proud: 7.62 } },
  { group: 'Circumcised', values: { v_diss: 31.1, s_diss: 22.49, neutral: 12.92, g_proud: 24.88, v_proud: 8.61 } },
];

const PLEASURE_CATEGORIES = [
  { key: 'intact', label: 'Intact', color: '#5b93c7' },
  { key: 'rest', label: 'Restoring', color: '#e8c868', textColor: '#000' },
  { key: 'circ', label: 'Circumcised', color: '#d94f4f' },
];

const PLEASURE_DATA = [
  { group: 'Orgasm Intensity', values: { circ: 2.99, rest: 2.93, intact: 3.73 } },
  { group: 'Ease of Orgasm', values: { circ: 2.91, rest: 2.80, intact: 3.43 } },
  { group: 'Variety of Sensation', values: { circ: 2.58, rest: 2.65, intact: 3.78 } },
  { group: 'Light Touch Sensitivity', values: { circ: 2.60, rest: 2.67, intact: 3.67 } },
  { group: 'Pleasure from Mobile Skin', values: { circ: 2.49, rest: 3.00, intact: 3.88 } },
];

// ── Resentment Mirror ─────────────────────────────────────────────────────
const RESENTMENT_CATEGORIES = [
  { key: 'intact', label: 'Intact (Regret)', color: '#5b93c7' },
  { key: 'circumcised', label: 'Circumcised (Resentment)', color: '#d94f4f' },
];

const RESENTMENT_DATA = [
  { group: 'Strong & Freq.', values: { intact: 8.6, restoring: 79.6, circumcised: 54.6 } },
  { group: 'Sometimes', values: { intact: 11.5, restoring: 15.5, circumcised: 16.1 } },
  { group: 'Rarely', values: { intact: 18.0, restoring: 4.9, circumcised: 8.3 } },
  { group: 'No, never', values: { intact: 61.9, restoring: 0.0, circumcised: 21.0 } },
];

// ── Systemic Failure / Cultural Default ───────────────────────────────────
const HANDLED_CATEGORIES = [
  { key: 'intact', label: 'Intact (Cultural Norm)', color: '#5b93c7' },
  { key: 'circumcised', label: 'Circumcised (Medical Handling)', color: '#d94f4f' },
];

const HANDLED_DATA = [
  { group: 'Automatic / Unquestioned', values: { intact: 23.5, circumcised: 47.6 } },
  { group: 'Strong Push / Very Common', values: { intact: 22.8, circumcised: 18.9 } },
  { group: 'Not Discussed / Uncommon', values: { intact: 33.8, circumcised: 7.6 } },
  { group: 'Neutral / 50-50', values: { intact: 12.5, circumcised: 2.7 } },
  { group: 'Unsure / No Idea', values: { intact: 7.4, circumcised: 23.2 } },
];

// ── "Would you circumcise your son?" ──────────────────────────────────────
const SONS_CATEGORIES = [
  { key: 'intact', label: 'Intact', color: '#5b93c7' },
  { key: 'circumcised', label: 'Circumcised', color: '#d94f4f' },
  { key: 'restoring', label: 'Restoring', color: '#e8c868' },
  { key: 'observer', label: 'Observer', color: '#a0a0a0' },
];

const SONS_DATA = [
  { label: 'Keep intact', values: { intact: 88.8, circumcised: 78.1, restoring: 98.1, observer: 90.9 } },
  { label: 'Circumcise', values: { intact: 0, circumcised: 8.5, restoring: 0, observer: 3.0 } },
  { label: 'Undecided', values: { intact: 2.2, circumcised: 4.0, restoring: 0, observer: 0 } },
  { label: "Partner's choice", values: { intact: 1.5, circumcised: 3.5, restoring: 0, observer: 3.0 } },
];

// ── Lubrication Data ──────────────────────────────────────────────────────
const LUBE_CATEGORIES = [
  { key: 'intact', label: 'Intact', color: '#5b93c7' },
  { key: 'restoring', label: 'Restoring', color: '#e8c868' },
  { key: 'circumcised', label: 'Circumcised', color: '#d94f4f' },
];

const LUBE_DATA = [
  { label: 'Never', values: { intact: 55.5, circumcised: 5.5, restoring: 16.0 } },
  { label: 'Rarely', values: { intact: 18.2, circumcised: 14.5, restoring: 17.9 } },
  { label: 'Sometimes', values: { intact: 19.7, circumcised: 20.0, restoring: 17.9 } },
  { label: 'Often helpful', values: { intact: 5.1, circumcised: 18.0, restoring: 14.2 } },
  { label: 'Always/almost always', values: { intact: 1.5, circumcised: 39.0, restoring: 33.0 } },
];

// ── Demographics Data ─────────────────────────────────────────────────────
const GEN_CATEGORIES = [
  { key: 'total', label: 'Respondents', color: 'var(--c-gold)' },
];

const GEN_DATA = [
  { label: 'Millennial (1981-1996)', values: { total: 175 } },
  { label: 'Gen Z (1997-2012)', values: { total: 130 } },
  { label: 'Gen X (1965-1980)', values: { total: 64 } },
  { label: 'Boomer (1946-1964)', values: { total: 45 } },
  { label: 'Xennial/Oregon Trail', values: { total: 24 } },
];

// ── Rotating Fact Hook ────────────────────────────────────────────────────
function RotatingHook() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("in");

  React.useEffect(() => {
    let t;
    if (phase === "in")       t = setTimeout(() => setPhase("holding"), 800);
    else if (phase === "holding") t = setTimeout(() => setPhase("out"), 4000);
    else if (phase === "out")     t = setTimeout(() => {
      setIdx(i => (i + 1) % HOOK_FACTS.length);
      setPhase("in");
    }, 600);
    return () => clearTimeout(t);
  }, [phase]);

  const fact = HOOK_FACTS[idx];
  const opacity = phase === "out" ? 0 : 1;
  const y = phase === "out" ? -12 : 0;

  return (
    <div style={{
      textAlign: 'center',
      maxWidth: 700,
      margin: '0 auto',
      opacity,
      transform: `translateY(${y}px)`,
      transition: 'opacity 0.5s ease-out, transform 0.6s ease-out',
      minHeight: '6rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <p style={{
        fontFamily: "var(--f-display, 'Playfair Display', serif)",
        fontWeight: 600,
        fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
        color: fact.color,
        lineHeight: 1.4,
        fontStyle: 'italic',
        transition: 'color 0.6s ease-out',
      }}>
        {fact.text}
      </p>
    </div>
  );
}

// ── Stat Callout ──────────────────────────────────────────────────────────
function StatCallout({ value, label, sublabel, color }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '1.5rem 0',
    }}>
      <div style={{
        fontFamily: "var(--f-display, 'Playfair Display', serif)",
        fontWeight: 800,
        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
        color: color || 'var(--c-goldBright)',
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "var(--f-display, 'Playfair Display', serif)",
        fontWeight: 600,
        fontSize: 'clamp(1rem, 1.5vw, 1.3rem)',
        color: 'var(--c-text)',
        marginTop: '0.4rem',
        lineHeight: 1.3,
      }}>
        {label}
      </div>
      {sublabel && (
        <div style={{
          fontFamily: "var(--f-body, 'Barlow', sans-serif)",
          fontSize: '0.85rem',
          color: 'var(--c-muted)',
          fontStyle: 'italic',
          marginTop: '0.3rem',
        }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

// ── Devastating Number ──────────────────────────────────────────────────────
// Huge, impact typography for key survey results.
function DevastatingNumber({ big, line1, line2, context, color = 'var(--c-red)', eyebrow }) {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  const [tween, setTween] = React.useState(0);

  React.useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) setVisible(true);
      },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [visible]);

  React.useEffect(() => {
    if (!visible) return;
    let start;
    let raf;
    const dur = 1200;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      setTween(1 - Math.pow(1 - p, 3)); // ease-out cubic
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  const numMatch = String(big).match(/^([\d.]+)(.*)$/);
  const numVal = numMatch ? parseFloat(numMatch[1]) : 0;
  const suffix = numMatch ? numMatch[2] : '';
  const decimals = big.includes('.') ? 1 : 0;

  return (
    <div
      ref={ref}
      style={{
        margin: '0 -2rem',
        padding: 'clamp(4rem, 8vh, 7rem) 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 20,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.9s ease-out, transform 0.9s ease-out',
      }}
    >
      {/* Radial color wash */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at center, ${color}18 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      {/* Subtle dot grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.1,
        background: `radial-gradient(circle, ${color} 1px, transparent 1.5px)`,
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />

      {/* Hairline top/bottom */}
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
      <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {eyebrow && (
          <div style={{
            fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--c-muted)',
            marginBottom: '1rem',
          }}>{eyebrow}</div>
        )}
        <div style={{
          fontFamily: "var(--f-display, 'Playfair Display', serif)",
          fontWeight: 800,
          fontSize: 'clamp(4rem, 12vw, 9rem)',
          color,
          lineHeight: 0.95,
          letterSpacing: '-0.03em',
          marginBottom: '1.5rem',
          textShadow: `0 0 80px ${color}33`,
        }}>
          {(numVal * tween).toFixed(decimals)}{suffix}
        </div>

        {line1 && (
          <div style={{
            fontFamily: "var(--f-display, 'Playfair Display', serif)",
            fontWeight: 500,
            fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
            color: 'var(--c-textBright)',
            lineHeight: 1.25,
            maxWidth: 800,
            margin: '0 auto 0.3rem',
          }}>{line1}</div>
        )}
        {line2 && (
          <div style={{
            fontFamily: "var(--f-display, 'Playfair Display', serif)",
            fontWeight: 500,
            fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
            color: 'var(--c-textBright)',
            lineHeight: 1.25,
            maxWidth: 800,
            margin: '0 auto 1.5rem',
          }}>{line2}</div>
        )}

        {context && (
          <div style={{
            fontFamily: "var(--f-body, 'Barlow', sans-serif)",
            fontWeight: 400,
            fontStyle: 'italic',
            fontSize: 'clamp(0.9rem, 1.2vw, 1.05rem)',
            color: 'var(--c-muted)',
            maxWidth: 560,
            margin: '0 auto',
            lineHeight: 1.55,
          }}>{context}</div>
        )}
      </div>
    </div>
  );
}

// ── Pull Quote ────────────────────────────────────────────────────────────
// Respondent voice between sections — emotional breathing room.
function PullQuote({ quote, attribution, color = 'var(--c-red)' }) {
  return (
    <div style={{
      padding: '4rem 2rem',
      textAlign: 'center',
      position: 'relative',
      zIndex: 20,
    }}>
      <div style={{
        fontFamily: "var(--f-display, 'Playfair Display', serif)",
        fontWeight: 400,
        fontStyle: 'italic',
        fontSize: 'clamp(1.15rem, 2vw, 1.6rem)',
        color: 'var(--c-textBright)',
        maxWidth: 700,
        margin: '0 auto 1rem',
        lineHeight: 1.45,
        letterSpacing: '-0.005em',
      }}>
        <span style={{ color, fontSize: '0.7em', marginRight: '0.4rem', verticalAlign: 'top' }}>★</span>
        {quote}
        <span style={{ color, fontSize: '0.7em', marginLeft: '0.4rem', verticalAlign: 'top' }}>★</span>
      </div>
      <div style={{
        fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
        fontWeight: 700,
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        color,
      }}>— {attribution}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCROLLY ENGINE — The 5-Act Data-Guided Discovery
// ═══════════════════════════════════════════════════════════════════════════

export default function ScrollyEngine() {
  const containerRef = useRef();
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [ciroDimension, setCiroDimension] = useState('geography');
  const [ciroSplitMode, setCiroSplitMode] = useState(false);

  // Randomize narrative quotes on mount
  const randomQuotes = React.useMemo(() => {
    const getRandom = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : { text: '', age: '' };
    
    // Act 2->3 Pull Quote (Circumcised)
    const pq1Pool = VOICES_THEMES.wish_understood.pathways.circumcised;
    const pq1 = getRandom(pq1Pool);

    // Act 3 Inline Panels (Message to Parents)
    const inlineIntactPool = VOICES_THEMES.message_to_parents.pathways.intact;
    const inlineCircPool = VOICES_THEMES.message_to_parents.pathways.circumcised;
    const inlineIntact = getRandom(inlineIntactPool);
    const inlineCirc = getRandom(inlineCircPool);

    // Act 4->5 Pull Quotes (Drawbacks - Circ, Advantages - Intact)
    const pq2CircPool = VOICES_THEMES.drawbacks.pathways.circumcised;
    const pq2IntactPool = VOICES_THEMES.advantages.pathways.intact;
    const pq2Circ = getRandom(pq2CircPool);
    const pq2Intact = getRandom(pq2IntactPool);

    return {
      pullQuote1: {
        text: pq1.text,
        attr: `Circumcised respondent, age ${pq1.age}`
      },
      inlineIntact: inlineIntact.text,
      inlineCirc: inlineCirc.text,
      pullQuote2Circ: {
        text: pq2Circ.text,
        attr: `Circumcised respondent, age ${pq2Circ.age}`
      },
      pullQuote2Intact: {
        text: pq2Intact.text,
        attr: `Intact respondent, age ${pq2Intact.age}`
      }
    };
  }, []);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{
      position: 'relative',
      width: '100%',
      minHeight: '500vh',
      background: 'var(--c-bg)',
      color: 'var(--c-text)',
      transition: 'background 0.3s ease, color 0.3s ease',
    }}>

      {/* Layer 0: Plotter Canvas Engine (z-index 0) */}
      {/* Fades to 0.2 during data-dense Acts III-IV so charts are legible */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: activeStep >= 2 && activeStep <= 3 ? 0.2 : 0.8, transition: 'opacity 1s ease' }}>
        <PlotterCanvas 
          scrollProgress={scrollProgress} 
          activeStep={activeStep}
        />
      </div>

      {/* Marginal Registration Marks */}
      <RegistrationMarks activeAct={activeStep + 1} scrollProgress={scrollProgress} />

      {/* Layer 1: Narrative Content — always above canvas */}
      <div style={{
        position: 'relative',
        width: '100%',
        zIndex: 10,
        paddingTop: '50vh',
      }}>

        <CinematicIntro />
        
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* ACT 1: "The Question Nobody Asks"                             */}
        {/* Background: void — text floats on the dark/light background   */}
        {/* Tone: curious, slightly mischievous                            */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <ScrollyNarrative
          index={0}
          setActiveStep={setActiveStep}
          variant="glass"
          eyebrow="Act I"
          title="The Glitch in the American Dream"
          accentColor="var(--c-blue)"
        >
          <p style={{ marginBottom: '1.5rem' }}>
            We Americans are masters of the comforting narrative. We wrap ourselves in stories of Liberty, Freedom of Choice, and the inviolable sanctity of the individual body.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            But if you resist the immense gravitational pull of the default narrative, you perceive a glitch in the matrix. A detail hidden in plain sight: the routine, unquestioned amputation of healthy infant anatomy.
          </p>
          <p style={{ marginBottom: '2rem' }}>
            Growing up intact in a culture where that makes you a statistical anomaly forces you to become an "accidental anthropologist." It forces you to finally look at the Transparent Monster we have all agreed not to see.
          </p>

          {/* Rotating hook facts */}
          <RotatingHook />

          {/* Editor's Letter: The "Why" */}
          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--c-ghost)',
            borderRadius: 8,
          }}>
            <div style={{
              fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--c-gold)',
              marginBottom: '0.5rem',
            }}>From the Lead Researcher</div>
            <h3 style={{
              fontFamily: "var(--f-display, 'Playfair Display', serif)",
              fontWeight: 800,
              fontSize: 'clamp(1.3rem, 2vw, 1.7rem)',
              color: 'var(--c-textBright)',
              marginBottom: '1.25rem',
              lineHeight: 1.2,
            }}>The 'Why' Behind This Inquiry</h3>

            <div style={{ lineHeight: 1.75, color: 'var(--c-text)' }}>
              <p style={{ marginBottom: '1rem' }}>
                My name is Tone Pettit, and I am the "Accidental Intactivist." This project was
                born from a lifetime of observation and a single, persistent question.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                By a conscious choice of my parents in the 1970s, I grew up intact — a complete outlier
                in a US culture where routine infant circumcision (RIC) was the unquestioned, 90% norm. I
                became an <em>accidental witness</em> to a profound alteration that nearly all
                my friends and peers had undergone — something my parents had simply waved off
                as unnecessary, refusing to subject their newborn son to a life-altering surgery.
              </p>

              <blockquote style={{
                margin: '1.5rem 0',
                padding: '1rem 1.3rem',
                background: 'rgba(217,79,79,0.06)',
                borderLeft: '3px solid var(--c-red)',
                borderRadius: '0 4px 4px 0',
                fontFamily: "var(--f-display, 'Playfair Display', serif)",
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)',
                color: 'var(--c-textBright)',
                lineHeight: 1.5,
              }}>
                If someone asked you honestly how you felt about your circumcision status, what would you say?
              </blockquote>

              <p style={{ marginBottom: '1rem' }}>
                That is the question I set out to ask when I built this anonymous survey.
                I wanted to know: what makes parents like mine such outliers? What was the actual, lived experience of men in these bodies?
                Historically, infant circumcision was popularized specifically to curb masturbation and diminish sexual experience.
                Today, modern neuroscience and anatomical evidence unequivocally support the obvious claim that removing highly sensitive, functional tissue dictates sexual dysfunction.
                Furthermore, the latest European clinical consensus states clearly that circumcision is non-therapeutic and should not be considered a medical procedure.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                Yet, nearly half of American parents still opt to circumcise their newborn boys. While that number is still high, it represents a significant historical decline. In fact, as highlighted in a Johns Hopkins press release, neonatal circumcision has officially dropped below 49% — making routine infant circumcision a <strong>minority procedure</strong> in the United States for the first time in a century.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                When given an anonymous platform to speak honestly, the data speaks clearly for itself.
                The findings show that circumcised men are overwhelmingly dissatisfied and frequently require external lubrication for their entire lives.
                Our goal is to bring agnostic readers, expectant parents, and medical professionals over to the side of bodily autonomy. We want to let the raw data and verbatim voices speak for themselves.
              </p>
            </div>

            {/* Signature */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px dashed var(--c-ghost)',
            }}>
              <img
                src="/tone-headshot.jpg"
                alt="Tone Pettit"
                width="60"
                height="60"
                style={{
                  width: 60, height: 60, borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--c-textBright)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--c-textBright)' }}>Tone Pettit</div>
                <div style={{
                  fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  color: 'var(--c-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>The Accidental Intactivist · Lead Researcher</div>
              </div>
            </div>
          </div>
        </ScrollyNarrative>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* ACT 2: "Who Showed Up"                                        */}
        {/* Background: warm paper Bureau Card treatment                   */}
        {/* CIRO breakdown, demographics                                   */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <StickyScrollyBlock
          stickyContent={
            <div style={{ width: '100%', height: '100%' }}>
              <CIRODotExplorer 
                controlledDimension={ciroDimension} 
                controlledSplit={ciroSplitMode} 
                hideControls={true}
              />
            </div>
          }
          scrollingContent={
            <>
              {/* Spacer 1: Show Orthographic Globe entry and spin animation */}
              <ScrollyNarrative
                onEnter={() => { setCiroDimension('geography'); setCiroSplitMode(false); }}
                variant="void"
              >
                {/* Visual zone: Ambient globe entry */}
              </ScrollyNarrative>

              <ScrollyNarrative
                index={1}
                setActiveStep={setActiveStep}
                onEnter={() => { setCiroDimension('geography'); setCiroSplitMode(false); }}
                variant="glass"
                eyebrow="Act II"
                title="Setting the Baseline"
                accentColor="var(--c-gold)"
              >
                <p style={{ marginBottom: '1.5rem' }}>
                  Before we can dismantle the monster, we must establish the facts. We cannot rely on clinical abstractions or institutional cover-ups. We must look at the real-world evidence.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  We asked 504 men—intact, circumcised, and those actively restoring—to anonymously share their lived realities. We asked parallel questions about their physical characteristics, their sensitivity, and their satisfaction. This is not an echo chamber. It is a rigorous, side-by-side reckoning.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  They came from across the anatomical spectrum too: circumcised men, 
                  intact men, men actively restoring their foreskin, and observers — partners, 
                  parents, and healthcare professionals who've seen this issue from the other side.
                </p>
                {/* CIRO Legend */}
                <CIROLegend style={{ marginBottom: '1.5rem' }} />

                {/* Pathway Breakdown Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '1rem',
                  margin: '2rem 0',
                }}>
                  {[
                    { label: 'Circumcised', n: 213, color: 'var(--path-circumcised)' },
                    { label: 'Intact', n: 142, color: 'var(--path-intact)' },
                    { label: 'Restoring', n: 109, color: 'var(--path-restoring)' },
                    { label: 'Observers', n: 37, color: '#a0a0a0' },
                  ].map(pw => (
                    <div key={pw.label} style={{
                      textAlign: 'center',
                      padding: '1rem 0.5rem',
                      borderLeft: `3px solid ${pw.color}`,
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '0 4px 4px 0',
                    }}>
                      <div style={{
                        fontFamily: "var(--f-display, 'Playfair Display', serif)",
                        fontWeight: 800,
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                        color: pw.color,
                      }}>{pw.n}</div>
                      <div style={{
                        fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--c-muted)',
                        marginTop: '0.25rem',
                      }}>{pw.label}</div>
                    </div>
                  ))}
                </div>
              </ScrollyNarrative>

              {/* Spacer 2: Show flat North America map entry and dots flying/stacking in CIRO order */}
              <ScrollyNarrative
                onEnter={() => { setCiroDimension('geography_na'); setCiroSplitMode(false); }}
                variant="void"
              >
                {/* Visual zone: North America geographic stacking */}
              </ScrollyNarrative>

              <ScrollyNarrative
                onEnter={() => { setCiroDimension('geography_na'); setCiroSplitMode(false); }}
                variant="glass"
                accentColor="var(--c-gold)"
              >
                <p style={{
                  fontFamily: "var(--f-body, 'Barlow', sans-serif)",
                  fontSize: '0.88rem',
                  color: 'var(--c-muted)',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                }}>
                  As the survey continues, the experiences of Trans and Intersex 
                  respondents will further deepen our understanding. The data explorer 
                  updates in real time — this report captures the Phase 1 snapshot.
                </p>

                <ObserverLens />
              </ScrollyNarrative>

              {/* Spacer 3: Show generational beeswarm layout transition */}
              <ScrollyNarrative
                onEnter={() => { setCiroDimension('demo_generation'); setCiroSplitMode(false); }}
                variant="void"
              >
                {/* Visual zone: Beeswarm layout alignment */}
              </ScrollyNarrative>

              <ScrollyNarrative
                onEnter={() => { setCiroDimension('demo_generation'); setCiroSplitMode(false); }}
                variant="glass"
                accentColor="var(--c-gold)"
              >
                <p style={{ marginBottom: '1.5rem' }}>
                  Our respondents span all political, socioeconomic, and generational lines. But generationally, we see a massive historical shift. In fact, routine infant circumcision (RIC) has officially become a <strong>minority procedure</strong> in the United States, with neonatal rates dropping below 49%—a decline famously lamented in a Johns Hopkins press release. Generationally, our survey captures this changing landscape:
                </p>

                <div style={{ margin: '3rem 0' }}>
                  <ScrollyDataChart
                    variant="horizontal"
                    title="Generational Breakdown"
                    subtitle="Responses span all age groups, primarily Millennials and Gen Z."
                    data={GEN_DATA}
                    categories={GEN_CATEGORIES}
                    format="number"
                  />
                </div>
              </ScrollyNarrative>

              <ScrollyNarrative
                onEnter={() => { setCiroDimension('demo_generation'); setCiroSplitMode(true); }}
                variant="glass"
                accentColor="var(--c-gold)"
              >
                <p style={{ marginBottom: '1.5rem', marginTop: '3rem' }}>
                  But who showed up doesn't fully capture what they believe. The cultural conditioning around this topic is so intense that almost everyone absorbs a specific set of assumptions about what is "cleaner," "better," or "normal."
                </p>
                
                <BeliefSwarm activeBeliefKey="medicallyHealthier" />

                <p style={{ marginBottom: '1.5rem', marginTop: '3rem' }}>
                  The survey spans 130+ questions across body image, sexual experience, 
                  autonomy and ethics, decision and consent, and beliefs and perceptions. 
                  Every question is optional. Every response is anonymous.
                </p>
              </ScrollyNarrative>
            </>
          }
        />

        {/* ── Pull Quote: Between Acts II and III ── */}
        <PullQuote
          quote={randomQuotes.pullQuote1.text}
          attribution={randomQuotes.pullQuote1.attr}
          color="var(--path-circumcised)"
        />

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* ACT 3: "What They Told Us"                                    */}
        {/* Background: void with pathway-colored borders                  */}
        {/* Side-by-side narratives: "what have you always wanted to say?" */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <ScrollyNarrative
          index={2}
          setActiveStep={setActiveStep}
          variant="glass"
          eyebrow="Act III"
          title="Sharpening the Differences"
          accentColor="var(--path-circumcised)"
        >
          <p style={{ marginBottom: '1.5rem' }}>
            When we move beyond the aggregate data and read the anonymous qualitative responses, the great American illusion fractures completely.
          </p>
          <p style={{ marginBottom: '2rem' }}>
            We do not see evidence of a "cleaner" or "healthier" baseline. Instead, we see distinct, undeniable patterns of harm: descriptions of lifelong tightness, severely diminished sensation, and the haunting psychological weight of anatomical absence.
          </p>

          {/* Inline Quote Panels */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            margin: '2.5rem 0',
          }}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{
                flex: '1 1 300px',
                borderLeft: '2px solid var(--path-intact)',
                paddingLeft: '1.25rem',
              }}>
                <div style={{
                  fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--path-intact)',
                  marginBottom: '0.5rem',
                }}>
                  Intact Perspective
                </div>
                <p style={{ fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.5, color: 'var(--c-textBright)' }}>
                  "{randomQuotes.inlineIntact}"
                </p>
              </div>
              
              <div style={{
                flex: '1 1 300px',
                borderLeft: '2px solid var(--path-circumcised)',
                paddingLeft: '1.25rem',
              }}>
                <div style={{
                  fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--path-circumcised)',
                  marginBottom: '0.5rem',
                }}>
                  Circumcised Perspective
                </div>
                <p style={{ fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.5, color: 'var(--c-textBright)' }}>
                  "{randomQuotes.inlineCirc}"
                </p>
              </div>
            </div>
          </div>

          {/* Teaser stats from Phase 1 data */}
          <div style={{ margin: '3rem 0' }}>
            <ScrollyDataChart 
              variant="diverging"
              title="Overall, how PROUD or satisfied are you with your penis?"
              subtitle="Considering all aspects (appearance, how it functions, and the pleasure it provides)?"
              data={PROUD_DATA}
              categories={PROUD_CATEGORIES}
              format="percent"
            />
          </div>

          {/* ── Devastating Number: Resentment ── */}
          <DevastatingNumber
            eyebrow="Have you ever felt resentment towards your parents for this procedure?"
            big="0%"
            line1="of restoring respondents"
            line2={'said "no, never."'}
            context="Every single restoring respondent reported feeling some resentment, loss, anger, or grief about their circumcision."
            color="#e85d50"
          />

          {/* Resentment Mirror */}
          <div style={{ margin: '3rem 0' }}>
            <ScrollyDataChart 
              variant="mirror"
              title="A Schism in Emotional Reality: Resentment vs Regret"
              subtitle="Comparing circumcised resentment against intact regret regarding parents' choices."
              data={RESENTMENT_DATA}
              categories={RESENTMENT_CATEGORIES}
              format="percent"
              note="For circumcised men, we ask about 'resentment' regarding the procedure performed on them. For intact men, we ask about 'regret' regarding their unaltered state."
            />
          </div>

          {/* Lubrication data */}
          <div style={{ margin: '3rem 0' }}>
            <ScrollyDataChart
              variant="horizontal"
              title="Do you generally need artificial lubrication?"
              subtitle="Intact men rarely or never need it. Circumcised men overwhelmingly do."
              data={LUBE_DATA}
              categories={LUBE_CATEGORIES}
            />
          </div>

          {/* ── Devastating Number: Lubrication ── */}
          <DevastatingNumber
            big="36%"
            line1="lower pleasure from"
            line2="mobile skin gliding."
            context="Intact respondents rate it 3.88, circumcised respondents 2.49 — across every dimension of sexual experience, intact leads."
            color="#d94f4f"
          />

          <p style={{
            textAlign: 'center',
            marginTop: '1.5rem',
          }}>
            <a href="/explore#/narrative-mirrors" style={{
              fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--c-gold)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--c-ghost)',
              paddingBottom: '0.15rem',
              transition: 'border-color 0.2s',
            }}>
              Read the full Narrative Mirrors →
            </a>
          </p>
        </ScrollyNarrative>

        {/* ── Pull Quote: Between Acts III and IV ── */}
        <PullQuote
          quote="Nobody asked me. Nobody asked my father. It was just done. Three generations of men in my family — none of us were asked."
          attribution="Restoring respondent, age 41"
          color="var(--path-restoring)"
        />

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* ACT 4: "Why Did It Happen?"                                   */}
        {/* Mirror pair data: parents' reasons, "no one told them not to" */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <ScrollyNarrative
          index={3}
          setActiveStep={setActiveStep}
          variant="glass"
          eyebrow="Act IV"
          title="The Pleasure Gap"
          accentColor="var(--c-orange)"
        >
          <p style={{ marginBottom: '1.5rem' }}>
            Here lies the ultimate cognitive firewall.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            A procedure explicitly popularized in the Victorian era to diminish the male orgasm and curb masturbation was, decades later, conveniently "retconned" by the medical-industrial complex into a panacea for hygiene.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            But the data confirms the original design: it purposefully degrades a boy's ability to experience full sexual pleasure. Today, modern neuroscience and anatomical evidence unequivocally support the obvious claim that removing highly sensitive, functional tissue necessarily dictates sexual dysfunction. Indeed, the latest European clinical consensus states unequivocally that routine infant circumcision is non-therapeutic and should not be considered a medical procedure.
          </p>

          <div style={{ margin: '3rem 0' }}>
            <ScrollyDataChart
              variant="mirror"
              title="The Systemic Default: Medicine vs Culture"
              subtitle="Comparing the medical handling of circumcision with the cultural expectations of intact respondents."
              data={HANDLED_DATA}
              categories={HANDLED_CATEGORIES}
              format="percent"
              note="For circumcised men, we ask how it was medically handled at birth. For intact men, we ask what the cultural expectation was in their community."
            />
          </div>

          <p style={{ marginBottom: '1.5rem' }}>
            But now look at how those same men feel about it, and how the physical reality compares.
          </p>

          <div style={{ margin: '3rem 0' }}>
            <ScrollyDataChart 
              variant="grouped"
              title="Direct Comparison of Sexual Experience by Status"
              subtitle="Please rate the following aspects of your own sexual experience on a scale of 1 to 5"
              data={PLEASURE_DATA}
              categories={PLEASURE_CATEGORIES}
              yDomain={[0, 5]}
              yTicks={6}
              height={360}
            />
          </div>

          {/* Sons decision */}
          <div style={{ margin: '3rem 0' }}>
            <ScrollyDataChart
              variant="horizontal"
              title="If you had a son today, what would your decision be?"
              subtitle="Based on everything you know and have experienced"
              data={SONS_DATA}
              categories={SONS_CATEGORIES}
            />
          </div>

          {/* ── Devastating Number: Future Sons ── */}
          <DevastatingNumber
            big="88%"
            line1="of intact respondents would"
            line2="keep their son intact."
            context="78% of circumcised, 98% of restoring, and 91% of observer respondents would do the same."
            color="#68b878"
          />

          {/* ── Devastating Number: Autonomy consensus ── */}
          <DevastatingNumber
            big="96%"
            line1="prioritize the child's"
            line2="right to bodily autonomy."
            context="A near-universal consensus across all four pathways — the rare finding where every voice agrees."
            color="#5b93c7"
          />

          <p style={{
            textAlign: 'center',
            marginTop: '1.5rem',
          }}>
            <a href="/explore#/pairs" style={{
              fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--c-gold)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--c-ghost)',
              paddingBottom: '0.15rem',
            }}>
              Explore all Mirror Pairs →
            </a>
          </p>
        </ScrollyNarrative>

        {/* ── Pull Quote: Between Acts IV and V ── */}
        <PullQuote
          quote={randomQuotes.pullQuote2Circ.text}
          attribution={randomQuotes.pullQuote2Circ.attr}
          color="var(--path-circumcised)"
        />

        {/* ── Pull Quote: Intact counterpoint ── */}
        <PullQuote
          quote={randomQuotes.pullQuote2Intact.text}
          attribution={randomQuotes.pullQuote2Intact.attr}
          color="var(--path-intact)"
        />

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* ACT 5: "Now You Know"                                         */}
        {/* Background: warm golden glow, procedural spirograph            */}
        {/* Empowerment, CTA to explore                                    */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <ScrollyNarrative
          index={4}
          setActiveStep={setActiveStep}
          variant="glass"
          eyebrow="Act V"
          title="Reclaiming Wholeness"
          accentColor="var(--c-goldBright)"
        >
          <p style={{ marginBottom: '1.5rem' }}>
            For those who discover what was lost, the journey does not have to end in grief. For the men who choose to restore, the physical and psychological metamorphosis is profound.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            While biomechanically, the rigid band cannot be regrown, restoration represents a triumphant reclamation of identity. It is a rejection of the original violation.
          </p>
          <p style={{ marginBottom: '2rem' }}>
            It is the ultimate act of reclaiming agency, shattering the silence, and stepping out of the shadow of the Transparent Monster. 
          </p>

          <div style={{ margin: '3rem 0' }}>
            <div style={{
              fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--c-goldBright)',
              marginBottom: '1rem',
              textAlign: 'center',
            }}>
              Interactive: Phase 1 Respondents
            </div>
            <CIRODotExplorer />
          </div>

          {/* CTA block */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '2rem',
            padding: '2rem 1rem',
            borderTop: '1px solid var(--c-ghost)',
          }}>
            <a href="/explore" style={{
              display: 'inline-block',
              padding: '0.8rem 2rem',
              background: 'var(--c-gold)',
              color: 'var(--c-bg)',
              fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
              fontWeight: 700,
              fontSize: '0.88rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: 6,
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 2px 12px rgba(212,160,48,0.3)',
            }}>
              Explore the Full Dataset →
            </a>

            <div style={{
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              {[
                { label: 'Mirror Pairs', href: '/explore#/pairs' },
                { label: 'Narrative Mirrors', href: '/explore#/narrative-mirrors' },
                { label: 'Demographics', href: '/explore#/demographics' },
                { label: 'Cultural Alignment', href: '/explore#/tools/cultural-alignment' },
              ].map(link => (
                <a key={link.label} href={link.href} style={{
                  fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--c-muted)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--c-ghost)',
                  paddingBottom: '0.1rem',
                  transition: 'color 0.2s',
                }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </ScrollyNarrative>

        {/* Bottom padding for scroll clearance */}
        <div style={{ height: '50vh' }} />
      </div>
    </div>
  );
}
