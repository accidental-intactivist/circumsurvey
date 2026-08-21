import React, { useRef, useState, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import GlobalHamburgerMenu from '../../explore/components/GlobalHamburgerMenu';
import BreadcrumbDropdown from '../../explore/components/BreadcrumbDropdown';
import HarmonicCanvas from '../../components/HarmonicCanvas';
import { useTheme } from '../../explore/contexts/ThemeContext';
import { TOUR } from '../GuidedTour/tourData';
import { NARRATIVE_STRUCTURE } from '../GuidedTour/ScrollTracker';
import { Play, Pause, ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const PHASE1_TOTAL = 500;

const TEASER_QUOTES = [
  { text: "“I’ve always wanted to include it into a discussion but haven’t had the chance, so I’ll put it here.”", author: "Observer, Millennial" },
  { text: "“Despite trying to restore and fix myself, I feel like something was fundamentally broken when I realized what was done to me.”", author: "Restoring, Gen Z" },
  { text: "“I think what stands out most to me is how normal and positive my experience of being intact has always been, and how little that narrative is represented.”", author: "Intact, Millennial" },
  { text: "“Growing up intact with anxiety about it shaped my personality in challenging ways. I had difficulty connecting with other boys because I knew I had a secret to keep.”", author: "Intact, Gen X" },
  { text: "“There is a secondary harm that come about from this abuse when culture/society refuses to acknowledge or validate the victims.”", author: "Circumcised, Millennial" },
  { text: "“My parents did not decide to circumcise me. It was so common that the doctors did it with[out] our asking.”", author: "Circumcised, Baby Boomer" },
  { text: "“It's odd that society almost refuses to acknowledge the magnitude of this topic and yet they continue to adamantly perpetuate it.”", author: "Observer, Gen X" },
  { text: "“Finding sexual partners has been very easy with an intact penis. Simply revealing this fact to new potential partners has always made them curious and more interested.”", author: "Intact, Gen Z" },
];

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
  const teaserRef = useRef(null);
  const arrow1Ref = useRef(null);
  const arrow2Ref = useRef(null);
  const arrow3Ref = useRef(null);

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(i => (i + 1) % TEASER_QUOTES.length);
    }, 7000); // 7 seconds per quote for slow reading
    return () => clearInterval(interval);
  }, []);

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
    // One switch, every loom: the Underloom (LoomChoreography) listens for
    // this so the pause button stops ALL background animation, not just
    // the masthead's HarmonicCanvas.
    window.dispatchEvent(new CustomEvent("cs-loom-pause", { detail: { paused: next } }));
  };
  const navContentRef = useRef(null);
  const canvasRef = useRef(null);
  const spacerRef = useRef(null);

  // Theme-aware "scrolled" chrome (glass, border, shadow)
  const [scrolled, setScrolled] = useState(false);

  // Scrollspy: which chapter is currently on screen. Drives the
  // Explore-style breadcrumb in the docked bar ("where am I" + jump anywhere).
  const [currentId, setCurrentId] = useState('ch-prologue');

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        setScrolled(window.scrollY > 100);
        
        // Stitch the fixed header to the page content during macOS elastic overscroll
        if (headerRef.current) {
          if (window.scrollY < 0) {
            headerRef.current.style.transform = `translateY(${-window.scrollY}px)`;
          } else {
            headerRef.current.style.transform = 'translateY(0px)';
          }
        }

        const triggerPoint = window.innerHeight / 2;
        let current = NARRATIVE_STRUCTURE[0].id;
        for (const s of NARRATIVE_STRUCTURE) {
          const el = document.getElementById(s.id);
          if (el && el.getBoundingClientRect().top <= triggerPoint) {
            current = s.id;
          }
        }
        setCurrentId(current);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  // Compute the label for the breadcrumb button
  const currentItem = NARRATIVE_STRUCTURE.find((s) => s.id === currentId) || NARRATIVE_STRUCTURE[0];
  let displayLabel = currentItem.label;
  if (currentItem.type === 'chapter') {
    const actIndex = NARRATIVE_STRUCTURE.findIndex((s) => s.id === currentId);
    for (let i = actIndex - 1; i >= 0; i--) {
      if (NARRATIVE_STRUCTURE[i].type === 'act') {
        displayLabel = `${NARRATIVE_STRUCTURE[i].label} · ${currentItem.label}`;
        break;
      }
    }
  }

  useGSAP(() => {
    // Use a CSS-variable-driven height so mobile gets a shorter masthead
    const isMobile = window.innerWidth <= 768;
    const startVh = isMobile ? 70 : 85;
    const startHeight = spacerRef.current ? spacerRef.current.offsetHeight : Math.round(window.innerHeight * (startVh / 100));
    const scrollDistance = Math.max(200, startHeight - 70);

    // Cascading glow animation for the arrow trail
    gsap.to(".scroll-arrow-chevron", {
      opacity: 1,
      duration: 0.5,
      stagger: 0.15,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut"
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: `+=${scrollDistance}`,
        scrub: true, // exact 1:1, no smoothing lag
      }
    });

    // 1. The header perfectly hugs the scrolling content below it.
    // By using a fromTo with exact pixel values, 1px of scroll removes exactly 1px of height.
    tl.fromTo(headerRef.current, 
      { height: `${startHeight}px`, minHeight: `${startHeight}px` },
      { height: "70px", minHeight: "70px", duration: 1, ease: "none" },
      0
    );

    // Fade the canvas background opacity as the header squishes/docks
    tl.to(canvasRef.current, {
      opacity: 0.15,
      duration: 1,
      ease: "none"
    }, 0);

    // 2. The title group flexes into the center of the nav bar by animating away its padding
    tl.to(titleGroupRef.current, {
      paddingTop: "0px",
      paddingBottom: "0px",
      duration: 1,
      ease: "none"
    }, 0);

    // ALL interior elements collapse at the SAME linear rate as the header
    // height. This welds the rainbow accent line to the top of the report
    // content so there is zero parallax disconnect ("nictitation").
    tl.to(eyebrowRef.current, {
      fontSize: "0px",
      opacity: 0,
      height: 0,
      margin: 0,
      duration: 1,
      ease: "none"
    }, 0);

    tl.to(titleRef.current, {
      fontSize: "1.2rem", // Nav bar size
      letterSpacing: "0.02em",
      y: isTomorrow ? -3 : 0,
      duration: 1,
      ease: "none"
    }, 0);

    tl.to(subRef.current, {
      fontSize: "0px",
      opacity: 0,
      height: 0,
      margin: 0,
      duration: 1,
      ease: "none"
    }, 0);

    tl.to(factsRef.current, {
      opacity: 0,
      y: -100,
      height: 0,
      margin: 0,
      padding: 0,
      duration: 1,
      ease: "none"
    }, 0);

    tl.to(teaserRef.current, {
      opacity: 0,
      y: -120,
      height: 0,
      margin: 0,
      padding: 0,
      duration: 1,
      ease: "none"
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
      <style>
        {`
          @media (max-width: 768px) {
            .mobile-hide { display: none !important; }
            .squish-title.scrolled { opacity: 0 !important; pointer-events: none !important; }
            .squish-nav-left { max-width: calc(100% - 130px); }
            .squish-nav-right { padding: 0 0.5rem !important; gap: 0.5rem !important; }
            .squish-nav-right a { padding: 0.3rem 0.5rem !important; }
            .squish-spacer { height: 70vh !important; }
            .squish-header-el { height: 70vh !important; }
          }
        `}
      </style>
      {/* Spacer to push content down initially since header is fixed */}
      <div ref={spacerRef} className="squish-spacer" style={{ height: '85vh' }} />

      <header 
        ref={headerRef}
        className="squish-header-el"
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
          <div className="squish-nav-left" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            pointerEvents: 'auto',
            fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            minWidth: 0,
          }}>
            <a href="#" className="mobile-hide" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ color: 'var(--c-textBright)', textDecoration: 'none', flexShrink: 0 }}>
              Findings
            </a>
            <span className="mobile-hide" style={{ color: 'var(--c-dim)', flexShrink: 0 }}>/</span>
            <span style={{ color: 'var(--c-muted)', minWidth: 0, flexShrink: 1, display: 'inline-flex' }}>
              <BreadcrumbDropdown
                label={displayLabel}
                currentId={currentId}
                items={NARRATIVE_STRUCTURE.map((s) => ({ id: s.id, href: `#${s.id}`, label: s.label, type: s.type }))}
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
        <div className="squish-nav-right" style={{
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
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            <span className="mobile-hide">Interactive </span>Explorer ➔
          </a>
          <div className="mobile-hide" style={{ width: 1, height: 16, background: 'var(--c-ghost)' }} />
          <GlobalHamburgerMenu />
        </div>

        {/* Clipping layer for the title group — squishes with the header */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 10, pointerEvents: 'none' }}>
          <div 
            ref={titleGroupRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              paddingTop: '75px', // Reserve space for the 70px nav bar + user button
              paddingBottom: '20px',
              paddingLeft: '1rem',
              paddingRight: '1rem',
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
              className={`squish-title ${scrolled ? 'scrolled' : ''}`}
              style={{
                position: "relative",
                zIndex: 20,
                fontFamily: "var(--f-display, 'Playfair Display', serif)",
                fontWeight: 800,
                fontSize: "clamp(1.6rem, min(5vw, 7vh), 4.5rem)",
                color: "var(--c-textBright)",
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
                margin: 0,
                textTransform: "uppercase",
                transform: isTomorrow ? "translateY(-6px)" : "none",
                transition: "opacity 0.25s ease",
              }}
            >
              The Accidental Intactivist's Inquiry
            </h1>
            
            <div ref={subRef} />

            <div ref={factsRef} style={{
              width: "100%",
              maxWidth: 780,
              boxSizing: "border-box",
              marginTop: "clamp(1rem, 2vh, 2rem)",
              background: "var(--c-bgCard)",
              borderRadius: 6,
              padding: "clamp(10px, 1.5vh, 20px)",
            }}>
              {/* Gold frame (the band around the content) */}
              <div style={{
                border: "2.5px solid var(--c-gold)",
                borderRadius: 2,
                padding: "clamp(0.8rem, 1.5vh, 2.2rem) clamp(1rem, 3vw, 3.5rem)",
              }}>
              {/* Line 1 */}
              <div style={{
                fontFamily: "var(--f-display, 'Playfair Display', serif)",
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: "clamp(1rem, min(1.8vw, 2.5vh), 1.5rem)",
                color: "var(--c-text)",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
              }}>
                If someone asked you honestly how you felt about your
              </div>

              {/* Line 2: "circumcision status" — highlighted */}
              <div style={{
                fontFamily: "var(--f-display, 'Playfair Display', serif)",
                fontWeight: 800,
                fontSize: "clamp(1.5rem, min(3.5vw, 5vh), 3.2rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
                margin: "clamp(0.4rem, 1vh, 1rem) 0",
                background: "linear-gradient(135deg, var(--c-goldBright), var(--c-gold), var(--c-orange))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                circumcision status
              </div>

              {/* Line 3: "what would you say?" */}
              <div style={{
                fontFamily: "var(--f-display, 'Playfair Display', serif)",
                fontWeight: 700,
                fontSize: "clamp(1.2rem, min(3vw, 4vh), 2.6rem)",
                color: "var(--c-textBright)",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                marginTop: "0",
              }}>
                what would you say?
              </div>

              {/* Divider rule */}
              <div style={{
                width: 60, height: 2, margin: "clamp(0.8rem, 1.5vh, 1.4rem) auto",
                background: "linear-gradient(90deg, var(--c-gold), var(--c-orange))",
                borderRadius: 1,
              }} />

              {/* Tagline */}
              <div style={{
                fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                fontWeight: 700,
                fontSize: "clamp(0.7rem, 1vw, 0.85rem)",
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "clamp(0.2rem, 1vh, 0.4rem)",
              }}>
                <span style={{ color: "var(--c-muted)" }}>{PHASE1_TOTAL} people answered anonymously.</span>
                <span style={{ color: "var(--c-goldBright)" }}>Here's what they chose to share.</span>
              </div>
              </div>
            </div>

            {/* Teaser Quotes Carousel (Moved inside titleGroupRef to prevent overlap) */}
            <div ref={teaserRef} style={{
              position: "relative",
              width: "100%",
              maxWidth: 780,
              boxSizing: "border-box",
              marginTop: "clamp(0.8rem, 2vh, 2.5rem)", // Responsive margin (Pica Rule on larger screens, tighter on cramped screens)
              background: "var(--c-bgCard)",
              border: "1px solid var(--c-ghost)",
              borderRadius: 6,
              padding: "clamp(10px, 1.5vh, 24px)",
              textAlign: "center",
              zIndex: 10,
              pointerEvents: "none",
            }}>
              <div style={{
                display: "grid",
                border: "2.5px solid transparent",
                width: "100%",
                minHeight: "90px",
                boxSizing: "border-box",
              }}>
                {TEASER_QUOTES.map((q, i) => (
                  <div key={i} style={{
                    gridArea: "1 / 1",
                    opacity: quoteIndex === i ? 1 : 0,
                    transition: "opacity 1.5s ease-in-out",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "0.6rem",
                    alignItems: "center",
                    padding: "0 clamp(1.5rem, 4vw, 3.5rem)",
                    pointerEvents: quoteIndex === i ? "auto" : "none",
                  }}>
                  <div style={{
                    fontFamily: "var(--f-display, 'Playfair Display', serif)",
                    fontSize: "clamp(0.9rem, 1.8vw, 1.15rem)",
                    fontStyle: "italic",
                    color: "var(--c-goldBright)",
                    lineHeight: 1.4,
                    textShadow: "0 2px 4px var(--c-bg)", // ensures readability over the loom
                  }}>
                    {q.text}
                  </div>
                  <div style={{
                    fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                    fontSize: "clamp(0.65rem, 1.5vw, 0.75rem)",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: "var(--c-gold)",
                    opacity: 0.8,
                  }}>
                    — {q.author}
                  </div>
                </div>
              ))}
              </div>
            </div>

          </div>
        </div>

        {/* Teaser Quotes Carousel was moved inside titleGroupRef */}

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

      {/* ── Scroll Indicator (On the Canvas) ── */}
      <div className="scroll-indicator-container">
        <style>
          {`
            .scroll-indicator-container {
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translate(-50%, 150%);
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 0.2rem;
              color: var(--c-gold);
              z-index: 10;
              pointer-events: none;
            }
            @media (max-width: 1200px) {
              .scroll-indicator-container {
                transform: translate(-50%, calc(150% - 60px)); /* Push up above the 60px mobile nav bar */
              }
            }
          `}
        </style>
        <span style={{
          fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
          fontSize: "0.85rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          opacity: 0.7,
        }}>Scroll to Read the Full Phase 1 Report</span>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "-0.2rem" }}>
          <ChevronDown className="scroll-arrow-chevron" size={22} strokeWidth={1.5} style={{ opacity: 0.15, marginBottom: "-8px" }} />
          <ChevronDown className="scroll-arrow-chevron" size={22} strokeWidth={1.5} style={{ opacity: 0.2, marginBottom: "-8px" }} />
          <ChevronDown className="scroll-arrow-chevron" size={22} strokeWidth={1.5} style={{ opacity: 0.3, marginBottom: "-8px" }} />
          <ChevronDown className="scroll-arrow-chevron" size={22} strokeWidth={1.5} style={{ opacity: 0.2, marginBottom: "-8px" }} />
          <ChevronDown className="scroll-arrow-chevron" size={22} strokeWidth={1.5} style={{ opacity: 0.15 }} />
        </div>
      </div>

    </div>
  );
}