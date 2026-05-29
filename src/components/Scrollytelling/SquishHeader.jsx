import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ThemeToggle from '../../explore/components/ThemeToggle';
import HarmonicCanvas from '../../components/HarmonicCanvas';
import { useTheme } from '../../explore/contexts/ThemeContext';

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
  const { theme, mode, colorblind } = useTheme();
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const titleGroupRef = useRef(null);
  const eyebrowRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const factsRef = useRef(null);
  const navContentRef = useRef(null);
  const canvasRef = useRef(null);

  useGSAP(() => {
    // We want the squish to complete over the first 600px of scrolling
    const scrollDistance = 600;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: `+=${scrollDistance}`,
        scrub: 0.5,
      }
    });

    // 1. The header container shrinks from 100vh to 70px, becomes a glassmorphic bar
    tl.to(headerRef.current, {
      height: "70px",
      minHeight: "70px",
      background: "rgba(10,10,12,0.85)", // Glassmorphic background
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--c-ghost)",
      ease: "none"
    }, 0);

    // Fade the canvas background opacity as the header squishes/docks
    tl.to(canvasRef.current, {
      opacity: 0.15,
      ease: "none"
    }, 0);

    // 2. The title group moves up and scales down into the center of the nav bar
    tl.to(titleGroupRef.current, {
      y: 0,
      marginTop: "0px", // Align to center of the 70px bar
      ease: "none"
    }, 0);

    tl.to(eyebrowRef.current, {
      fontSize: "0px", // Disappears
      opacity: 0,
      height: 0,
      margin: 0,
      ease: "power2.out"
    }, 0);

    tl.to(titleRef.current, {
      fontSize: "1.2rem", // Nav bar size
      letterSpacing: "0.02em",
      ease: "none"
    }, 0);

    tl.to(subRef.current, {
      fontSize: "0px", // Disappears
      opacity: 0,
      height: 0,
      margin: 0,
      ease: "power2.out"
    }, 0);

    tl.to(factsRef.current, {
      opacity: 0,
      height: 0,
      margin: 0,
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
          background: 'radial-gradient(ellipse at center, var(--c-bgSoft) 0%, var(--c-bg) 50%, var(--c-bgDeep) 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Harmonic background canvas that squishes (crops) with the header height */}
        <div 
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '85vh',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.8,
          }}
        >
          <HarmonicCanvas themeKey={`${theme}-${mode}-${colorblind}`} opacity={1} />
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
            zIndex: 10,
            pointerEvents: 'none', // Prevent clicking when invisible
          }}
        >
          {/* Left Side: Navigation Anchors */}
          <div style={{ display: 'flex', gap: '1rem', pointerEvents: 'auto' }}>
            {['The Question', 'The People', 'The Voices', 'The Reality'].map((label, i) => (
              <button key={label} style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--c-muted)',
                fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Right Side: Tools & Actions */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', pointerEvents: 'auto' }}>
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
        </div>

        {/* Centered Title Group */}
        <div 
          ref={titleGroupRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 20,
            padding: '0 1rem',
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
      </header>
    </div>
  );
}
