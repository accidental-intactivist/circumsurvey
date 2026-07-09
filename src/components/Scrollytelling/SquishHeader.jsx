import React, { useRef, useState, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ThemeToggle from '../../explore/components/ThemeToggle';
import BreadcrumbDropdown from '../../explore/components/BreadcrumbDropdown';
import HarmonicCanvas from '../../components/HarmonicCanvas';
import { useTheme } from '../../explore/contexts/ThemeContext';
import { TOUR } from '../GuidedTour/tourData';
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
  };
  const navContentRef = useRef(null);
  const canvasRef = useRef(null);
  const spacerRef = useRef(null);

  // Theme-aware "scrolled" chrome (glass, border, shadow)
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
    // Exact pixel measurement of the spacer's rendered 85vh to prevent scroll tearing
    const startHeight = spacerRef.current ? spacerRef.current.offsetHeight : Math.round(window.innerHeight * 0.85);
    const scrollDistance = Math.max(200, startHeight - 70);

    // Cascading glow animation for the arrow trail
    gsap.to([arrow1Ref.current, arrow2Ref.current, arrow3Ref.current], {
      opacity: 1,
      duration: 0.5,
      stagger: 0.2,
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
      y: -100, // Slides up behind the title
      height: 0,
      margin: 0,
      padding: 0,
      duration: 0.35,
      ease: "power2.out"
    }, 0);

    tl.to(teaserRef.current, {
      opacity: 0,
      y: -120, // Slides up faster for parallax
      height: 0,
      margin: 0,
      padding: 0,
      duration: 0.3, 
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
      <div ref={spacerRef} style={{ height: '85vh' }} />

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
                position: "relative",
                zIndex: 20,
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
            
            <div ref={subRef} />

            <div ref={factsRef} style={{
              width: "100%",
              maxWidth: 780,
              boxSizing: "border-box",
              marginTop: "clamp(1rem, 3vh, 2rem)",
              background: "var(--c-bgCard)",
              borderRadius: 6,
              padding: "clamp(10px, 2vh, 20px)",
            }}>
              {/* Gold frame (the band around the content) */}
              <div style={{
                border: "2.5px solid var(--c-gold)",
                borderRadius: 2,
                padding: "clamp(1.5rem, 3vh, 2.2rem) clamp(1.5rem, 4vw, 3.5rem)",
              }}>
              {/* Line 1 */}
              <div style={{
                fontFamily: "var(--f-display, 'Playfair Display', serif)",
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
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
                fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
                margin: "clamp(0.5rem, 2vh, 1rem) 0",
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
                fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
                color: "var(--c-textBright)",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                marginTop: "0",
              }}>
                what would you say?
              </div>

              {/* Divider rule */}
              <div style={{
                width: 60, height: 2, margin: "1.4rem auto",
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
                gap: "0.4rem",
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
              marginTop: "clamp(1rem, 3vh, 2rem)",
              background: "var(--c-bgCard)",
              border: "1px solid var(--c-ghost)",
              borderRadius: 6,
              padding: "clamp(10px, 2vh, 20px)",
              textAlign: "center",
              zIndex: 10,
              pointerEvents: "none",
            }}>
              <div style={{
                position: "relative",
                border: "2.5px solid transparent",
                width: "100%",
                minHeight: "90px",
                boxSizing: "border-box",
              }}>
                {TEASER_QUOTES.map((q, i) => (
                  <div key={i} style={{
                    position: "absolute",
                    top: "50%", 
                    left: "clamp(1.5rem, 4vw, 3.5rem)", 
                    right: "clamp(1.5rem, 4vw, 3.5rem)",
                    transform: "translateY(-50%)",
                  opacity: quoteIndex === i ? 1 : 0,
                  transition: "opacity 1.5s ease-in-out",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  alignItems: "center"
                }}>
                  <div style={{
                    fontFamily: "var(--f-display, 'Playfair Display', serif)",
                    fontSize: "clamp(1rem, 2vw, 1.15rem)",
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
      <div style={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translate(-50%, 150%)", // Pushes it down past the 85vh spacer onto the canvas
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.2rem",
        color: "var(--c-gold)",
        zIndex: 10,
        pointerEvents: "none",
      }}>
        <span style={{
          fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
          fontSize: "0.85rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          opacity: 0.7,
        }}>Scroll to Read the Full Phase 1 Report</span>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "-0.2rem" }}>
          <ChevronDown ref={arrow1Ref} size={22} strokeWidth={1.5} style={{ opacity: 0.2, marginBottom: "-12px" }} />
          <ChevronDown ref={arrow2Ref} size={22} strokeWidth={1.5} style={{ opacity: 0.2, marginBottom: "-12px" }} />
          <ChevronDown ref={arrow3Ref} size={22} strokeWidth={1.5} style={{ opacity: 0.2 }} />
        </div>
      </div>

    </div>
  );
}