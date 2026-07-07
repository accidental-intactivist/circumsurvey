import React, { useRef, useState, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ThemeToggle from '../../explore/components/ThemeToggle';
import BreadcrumbDropdown from '../../explore/components/BreadcrumbDropdown';
import HarmonicCanvas from '../../components/HarmonicCanvas';
import { useTheme } from '../../explore/contexts/ThemeContext';
import { TOUR } from '../GuidedTour/tourData';
import { Play, Pause } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const PHASE1_TOTAL = 500;

const HERO_FACTS = [
  {
    big:   "96%",
    line1: "prioritize the child's right",
    line2: "to bodily autonomy.",
    context: "Across every pathway — intact, circumcised, restoring, observer.",
    color: "#5b93c7", // C.blue
  },
  {
    big:   "80%",
    line1: "of restoring respondents",
    line2: "report strong, frequent resentment.",
    context: "0% said they have never felt negative about their circumcision.",
    color: "#e85d50", // C.red
  },
  {
    big:   "47.6%",
    line1: "describe the decision as",
    line2: "\"routine / automatic.\"",
    context: "Only 2.7% were offered it as a neutral choice with pros and cons.",
    color: "#e8a44a", // C.orange
  },
  {
    big:   "52%",
    line1: "of circumcised respondents",
    line2: "prefer the intact appearance.",
    context: "A quiet majority, in their own words.",
    color: "#e8c868", // C.yellow
  },
  {
    big:   "88%",
    line1: "of intact respondents would",
    line2: "keep their son intact.",
    context: "78% of circumcised respondents would make the same choice for their son.",
    color: "#68b878", // C.green
  },
];

function CountUp({ to, suffix = "", duration = 1400, decimals = 0, visible = true }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!visible) { setVal(0); return; }
    let start = performance.now();
    let r = requestAnimationFrame(function step(now) {
      let p = Math.min((now - start) / duration, 1);
      // easeOutExpo
      let e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setVal(to * e);
      if (p < 1) requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(r);
  }, [to, duration, visible]);
  return <>{val.toFixed(decimals)}{suffix}</>;
}

function RotatingFact() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("in"); // in | holding | out
  useEffect(() => {
    let t;
    if (phase === "in")      t = setTimeout(() => setPhase("holding"), 1200);
    else if (phase === "holding") t = setTimeout(() => setPhase("out"), 4500);
    else if (phase === "out")     t = setTimeout(() => {
      setIdx(i => (i + 1) % HERO_FACTS.length);
      setPhase("in");
    }, 700);
    return () => clearTimeout(t);
  }, [phase]);

  const fact = HERO_FACTS[idx];
  const opacity = phase === "holding" ? 1 : phase === "in" ? 1 : 0;
  const y = phase === "in" ? 0 : phase === "holding" ? 0 : -16;

  return (
    <div style={{
      textAlign: "center",
      maxWidth: 820,
      margin: "2rem auto 0",
      opacity,
      transform: `translateY(${y}px)`,
      transition: "opacity 0.6s ease-out, transform 0.7s ease-out",
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 800,
        fontSize: "clamp(3rem, 8vw, 6rem)",
        color: fact.color,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        marginBottom: "1rem",
        textShadow: `0 0 48px ${fact.color}22`,
        transition: "color 0.7s ease-out, text-shadow 0.7s ease-out",
      }}>
        <CountUp 
          to={parseFloat(fact.big)} 
          suffix={fact.big.replace(/[\d.]+/g, "")}
          duration={1400} 
          decimals={fact.big.includes(".") ? 1 : 0}
          visible={phase === "in" || phase === "holding"} 
        />
      </div>

      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 600,
        fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)",
        color: "var(--c-textBright)",
        lineHeight: 1.3,
        marginBottom: "0.3rem",
      }}>
        {fact.line1}
      </div>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 600,
        fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)",
        color: "var(--c-textBright)",
        lineHeight: 1.3,
        marginBottom: "1.25rem",
      }}>
        {fact.line2}
      </div>
      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 400,
        fontStyle: "italic",
        fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)",
        color: "var(--c-muted)",
        lineHeight: 1.55,
        maxWidth: 540,
        margin: "0 auto",
      }}>
        {fact.context}
      </div>
    </div>
  );
}

export default function SquishHeader() {
  const { theme, mode, colorblind, typeface } = useTheme();
  const isTomorrow = typeface === "tomorrow";
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const titleGroupRef = useRef(null);
  const eyebrowRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const factsRef = useRef(null);

  const [loomPaused, setLoomPaused] = useState(() => {
    try {
      return localStorage.getItem("cs_loom_paused") === "true";
    } catch { return false; }
  });

  const toggleLoom = () => {
    const next = !loomPaused;
    setLoomPaused(next);
    try {
      localStorage.setItem("cs_loom_paused", String(next));
    } catch {}
  };
  const navContentRef = useRef(null);
  const canvasRef = useRef(null);

  // Theme-aware "scrolled" chrome (glass, border, shadow) — matches
  // ExploreMasthead's docked treatment instead of a hardcoded dark rgba.
  const [scrolled, setScrolled] = useState(false);

  // Scrollspy: which chapter is currently on screen. Drives the
  // Explore-style breadcrumb in the docked bar ("where am I" + jump anywhere).
  const chapters = useMemo(() => ([
    { id: 'ch-prologue', label: 'Prologue \u00B7 The Researcher\'s Letter' },
    { id: 'ch-who-took', label: 'Chapter 1 \u00B7 Who Took This Survey?' },
    { id: 'ch-what-feel', label: 'Chapter 2 \u00B7 What Does It Actually Feel Like?' },
    { id: 'ch-how-feel', label: 'Chapter 3 \u00B7 How Do They Feel About It?' },
    { id: 'ch-world-told', label: 'Chapter 4 \u00B7 What Did The World Tell Them?' },
    { id: 'ch-witnesses', label: 'Chapter 5 \u00B7 What Do The Witnesses Say?' },
    { id: 'ch-undone', label: 'Chapter 6 \u00B7 Can It Be Undone?' },
    { id: 'ch-future-son', label: 'Chapter 7 \u00B7 If You Had A Son Today?' },
    { id: 'ch-epilogue', label: 'Epilogue \u00B7 The Evidence, Summarized' },
  ]), []);
  const [currentId, setCurrentId] = useState('ch-prologue');

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        setScrolled(window.scrollY > 100);
        // last chapter whose top has passed under the docked bar
        let current = 'ch-prologue';
        for (const s of chapters) {
          const el = document.getElementById(s.id);
          if (el && el.getBoundingClientRect().top <= 140) current = s.id;
        }
        setCurrentId(current);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [chapters]);

  const currentChapter = chapters.find((s) => s.id === currentId) || chapters[0];

  useGSAP(() => {
    // 1:1 with scroll, like ExploreMasthead (height = HERO − scrollY):
    // the squish completes exactly when the spacer has scrolled past, so
    // content rises to meet the docked bar with no dead gap.
    const scrollDistance = Math.max(200, Math.round(window.innerHeight * 0.85) - 70);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: `+=${scrollDistance}`,
        scrub: true, // exact 1:1, no smoothing lag
      }
    });

    // 1. The header container shrinks from 85vh to a 70px bar.
    //    (Background/border/blur are handled reactively via `scrolled`.)
    tl.to(headerRef.current, {
      height: "70px",
      minHeight: "70px",
      duration: 1,
      ease: "none"
    }, 0);

    // Fade the canvas background opacity as the header squishes/docks
    tl.to(canvasRef.current, {
      opacity: 0.15,
      duration: 1,
      ease: "none"
    }, 0);

    // 2. The title group moves up and scales down into the center of the nav bar
    tl.to(titleGroupRef.current, {
      y: 0,
      marginTop: "0px", // Align to center of the 70px bar
      duration: 1,
      ease: "none"
    }, 0);

    // Interior settles FAST (first ~30% of the squish), so that for most of
    // the scroll there is only ONE visible motion: the header's bottom edge
    // gliding up with the content glued to it. Multiple elements collapsing
    // at different rates over the full distance is what made the squish feel
    // like the masthead and page were scrolling at different speeds.
    tl.to(eyebrowRef.current, {
      fontSize: "0px", // Disappears
      opacity: 0,
      height: 0,
      margin: 0,
      duration: 0.3,
      ease: "power2.out"
    }, 0);

    tl.to(titleRef.current, {
      fontSize: "1.2rem", // Nav bar size
      letterSpacing: "0.02em",
      y: isTomorrow ? -3 : 0,
      duration: 0.55,
      ease: "power1.out"
    }, 0);

    tl.to(subRef.current, {
      fontSize: "0px", // Disappears
      opacity: 0,
      height: 0,
      margin: 0,
      duration: 0.3,
      ease: "power2.out"
    }, 0);

    tl.to(factsRef.current, {
      opacity: 0,
      height: 0,
      margin: 0,
      duration: 0.25,
      ease: "power2.out"
    }, 0);

    // 3. Fade in the navigation items (left and right) once it docks
    tl.fromTo(navContentRef.current, 
      { opacity: 0 },
      { opacity: 1, duration: 0.2, ease: "power1.inOut" },
      0.8 // Fades in near the end of the scroll distance
    );

  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: 100 }}>
      {/* Spacer to push content down initially since header is fixed */}
      <div style={{ height: '85vh' }} />

      <header 
        ref={headerRef}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: scrolled
            ? 'color-mix(in srgb, var(--c-bg) 88%, transparent)'
            : 'radial-gradient(ellipse at center, var(--c-bgSoft) 0%, var(--c-bg) 50%, var(--c-bgDeep) 100%)',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'var(--c-ghost)' : 'transparent'}`,
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
          transition: 'background 0.3s ease, backdrop-filter 0.3s ease, border-bottom 0.3s ease, box-shadow 0.3s ease',
          // NOTE: no overflow:hidden here — it would clip the ThemeToggle
          // settings panel. The canvas gets its own clipping wrapper below.
        }}
      >
        {/* Clipping wrapper so the Loom crops with the header height without
            clipping UI (the ThemeToggle panel must escape the header). */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
          {/* Harmonic background canvas that squishes (crops) with the header height */}
          <div 
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: '50%', left: 0,
              width: '100%',
              height: '85vh',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              zIndex: 0,
              opacity: 0.8,
            }}
          >
            <HarmonicCanvas themeKey={`${theme}-${mode}-${colorblind}`} opacity={1} paused={loomPaused} />
          </div>
        </div>

        {/* Rainbow accent line at the bottom of the masthead (always there, but moves up) */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #d94f4f, #e8a44a, #e8c868, #68b878, #5b93c7)',
          zIndex: 50,
        }} />

        {/* Navigation contents (Left and Right sides) that fade in when docked */}
        <div 
          ref={navContentRef}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            zIndex: 100,
            pointerEvents: 'none', // Prevent clicking when invisible
          }}
        >
          {/* Left Side — Explore-masthead pattern: wordmark, then a
              scrollspy breadcrumb of the current station with the full
              tour in its dropdown. */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            pointerEvents: 'auto',
            fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ color: 'var(--c-textBright)', textDecoration: 'none' }}>
              Findings
            </a>
            <span style={{ color: 'var(--c-dim)' }}>/</span>
            <span style={{ color: 'var(--c-muted)' }}>
              <BreadcrumbDropdown
                label={currentChapter.label}
                currentId={currentId}
                items={chapters.map((s) => ({ id: s.id, href: `#${s.id}`, label: s.label }))}
                onSelect={(item) => {
                  const el = document.getElementById(item.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </span>
          </div>

        </div>

        {/* Right Side: Tools & Actions — ALWAYS visible (not gated on dock),
            so Display Settings are reachable from the full masthead too. */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: 70,
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          padding: '0 1.5rem',
          zIndex: 110,
          pointerEvents: 'auto',
        }}>
          <ThemeToggle />
          <div style={{ width: 1, height: 16, background: 'var(--c-ghost)' }} />
          <a href="/explore" style={{
            fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
            fontWeight: 700,
            fontSize: '0.75rem',
            color: 'var(--c-goldBright)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textDecoration: 'none',
            padding: '0.3rem 0.8rem',
            border: '1px solid rgba(212,160,48,0.4)',
            borderRadius: 100,
            background: 'rgba(212,160,48,0.1)',
          }}>
            Interactive Explorer ➔
          </a>
        </div>

        {/* Clipping layer for the title group — squishes with the header */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 10, pointerEvents: 'none' }}>
          <div 
            ref={titleGroupRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              transform: 'translateY(-50%)',
              padding: '0 1rem',
              pointerEvents: 'auto',
            }}
          >
            <div 
              ref={eyebrowRef}
              style={{
                fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                fontWeight: 700,
                fontSize: "clamp(0.75rem, 1.2vw, 0.88rem)",
                color: "var(--c-gold)",
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                marginBottom: "1rem",
              }}
            >
              ★ Special Report ★
            </div>
            
            <h1 
              ref={titleRef}
              style={{
                fontFamily: "var(--f-display, 'Playfair Display', serif)",
                fontWeight: 800,
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                color: "var(--c-textBright)",
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
                margin: 0,
                textTransform: "uppercase",
                transform: isTomorrow ? "translateY(-6px)" : "none",
              }}
            >
              The Accidental Intactivist's Inquiry
            </h1>
            
            <div 
              ref={subRef}
              style={{
                fontFamily: "var(--f-display, 'Playfair Display', serif)",
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: "clamp(1.05rem, 1.6vw, 1.3rem)",
                color: "var(--c-muted)",
                marginTop: "1rem",
              }}
            >
              {PHASE1_TOTAL} Voices · Six Pathways · One Question, Asked Honestly
            </div>

            <div ref={factsRef}>
              <RotatingFact />
            </div>
          </div>
        </div>

        {/* ── Pause Button for Harmonic Loom ── */}
        <button
          onClick={toggleLoom}
          title={loomPaused ? "Play background animation" : "Pause background animation"}
          style={{
            position: "absolute",
            bottom: "1.5rem",
            right: "2rem",
            zIndex: 120,
            background: "rgba(0,0,0,0.4)",
            border: `1px solid ${loomPaused ? "var(--c-goldBright)" : "var(--c-ghost)"}`,
            color: loomPaused ? "var(--c-goldBright)" : "var(--c-dim)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
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
          {loomPaused ? <Play size={15} style={{ marginLeft: "2px", fill: "currentColor" }} /> : <Pause size={15} style={{ fill: "currentColor" }} />}
        </button>
      </header>
    </div>
  );
}