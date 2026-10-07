import React, { useRef, useState, useEffect, Suspense, lazy } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
const HarmonicCanvas = lazy(() => import('../../components/HarmonicCanvas'));
const LoomChoreography = lazy(() => import('../../components/GuidedTour/LoomChoreography'));

gsap.registerPlugin(ScrollTrigger);

export default function UniversalSquishHeader({
  themeKey,
  loomPaused,
  navLeftContent,
  navRightContent,
  eyebrow,
  title,
  subtitle,
  heroContent,
  isTomorrow = false,
  startVh = 85,
  underloomFormation = null
}) {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const titleGroupRef = useRef(null);
  const eyebrowRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const heroContentRef = useRef(null);
  const navContentRef = useRef(null);
  const canvasRef = useRef(null);
  const spacerRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        setScrolled(window.scrollY > 100);
        
        if (headerRef.current) {
          if (window.scrollY < 0) {
            headerRef.current.style.transform = `translateY(${-window.scrollY}px)`;
          } else {
            headerRef.current.style.transform = 'translateY(0px)';
          }
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  useGSAP(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return;

    const startHeight = spacerRef.current ? spacerRef.current.offsetHeight : Math.round(window.innerHeight * (startVh / 100));
    const scrollDistance = Math.max(200, startHeight - 70);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: `+=${scrollDistance}`,
        scrub: true,
      }
    });

    tl.fromTo(headerRef.current, 
      { height: `${startHeight}px`, minHeight: `${startHeight}px` },
      { height: "70px", minHeight: "70px", duration: 1, ease: "none" },
      0
    );

    tl.to(canvasRef.current, { opacity: 0.15, duration: 1, ease: "none" }, 0);
    tl.to(titleGroupRef.current, { paddingTop: "0px", paddingBottom: "0px", duration: 1, ease: "none" }, 0);

    if (eyebrowRef.current) {
      tl.to(eyebrowRef.current, { fontSize: "0px", opacity: 0, height: 0, margin: 0, duration: 1, ease: "none" }, 0);
    }

    if (titleRef.current) {
      tl.to(titleRef.current, { fontSize: "1.2rem", letterSpacing: "0.02em", y: isTomorrow ? -3 : 0, duration: 1, ease: "none" }, 0);
    }

    if (subRef.current) {
      tl.to(subRef.current, { fontSize: "0px", opacity: 0, height: 0, margin: 0, duration: 1, ease: "none" }, 0);
    }

    if (heroContentRef.current) {
      tl.to(heroContentRef.current, { opacity: 0, y: -100, height: 0, margin: 0, padding: 0, duration: 1, ease: "none" }, 0);
    }

    tl.fromTo(navContentRef.current, 
      { opacity: 0 },
      { opacity: 1, duration: 0.2, ease: "power1.inOut" },
      0.8
    );

  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: 100 }}>
      <style>
        {`
          :root { --squish-start-h: ${startVh}vh; }
          @media (max-width: 768px) {
            .mobile-hide { display: none !important; }
            .squish-spacer { display: none !important; }
            .squish-header-el {
              position: static !important;
              height: auto !important;
              background: transparent !important;
              box-shadow: none !important;
              border: none !important;
              display: block !important;
            }
            .squish-nav-container { display: none !important; }
            .squish-title-group {
              position: relative !important;
              padding-top: 5rem !important;
              padding-bottom: 4rem !important;
              min-height: var(--squish-start-h) !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              height: auto !important;
            }
            .squish-canvas-wrapper {
              position: absolute !important;
              top: 0 !important;
              height: 100% !important;
            }
            .squish-nav-left { max-width: calc(100% - 130px); }
            .squish-nav-right { 
              padding: 0 0.5rem !important; 
              gap: 0.5rem !important; 
              z-index: 1001 !important;
            }
            .squish-nav-right a { padding: 0.3rem 0.5rem !important; }
            #tour-start-target {
              top: 80px !important;
              left: 50% !important;
              transform: translateX(-50%);
            }
          }
        `}
      </style>
      <div ref={spacerRef} className="squish-spacer" style={{ height: 'var(--squish-start-h)' }} />

      <header 
        ref={headerRef}
        className="squish-header-el"
        style={{ 
          position: 'fixed',
          top: 0, left: 0, width: '100%',
          height: 'var(--squish-start-h)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: scrolled
            ? 'color-mix(in srgb, var(--c-bg) 88%, transparent)'
            : 'radial-gradient(ellipse at center, var(--c-bgSoft) 0%, var(--c-bg) 50%, var(--c-bgDeep) 100%)',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'var(--c-ghost)' : 'transparent'}`,
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
          transition: 'background 0.3s ease, backdrop-filter 0.3s ease, border-bottom 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <div id="tour-start-target" style={{ position: 'absolute', top: '24px', left: '24px', width: '1px', height: '1px', pointerEvents: 'none' }} />

        <div className="squish-canvas-wrapper" style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
          <div ref={canvasRef} style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '85vh', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 0, opacity: 0.8 }}>
            <Suspense fallback={null}>
              {themeKey && underloomFormation ? (
                <LoomChoreography themeKey={themeKey} opacity={1} forceFormation={underloomFormation} isInline={true} />
              ) : (
                themeKey && <HarmonicCanvas themeKey={themeKey} opacity={1} paused={loomPaused} />
              )}
            </Suspense>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #d94f4f, #e8a44a, #e8c868, #68b878, #5b93c7)', zIndex: 50 }} />

        <div ref={navContentRef} className="squish-nav-container" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', zIndex: 100, pointerEvents: 'none' }}>
          <div className="squish-nav-left" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', pointerEvents: 'auto', fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)", fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', minWidth: 0 }}>
            {navLeftContent}
          </div>
        </div>

        <div className="squish-nav-right" style={{ position: 'absolute', top: 0, right: 0, height: 70, display: 'flex', gap: '1rem', alignItems: 'center', padding: '0 1.5rem', zIndex: 110, pointerEvents: 'auto' }}>
          {navRightContent}
        </div>

        <div className="squish-title-group" style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 10, pointerEvents: 'none' }}>
          <div ref={titleGroupRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, paddingTop: '75px', paddingBottom: '20px', paddingLeft: '1rem', paddingRight: '1rem', pointerEvents: 'auto' }}>
            {eyebrow && (
              <div ref={eyebrowRef} style={{ fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)", fontWeight: 700, fontSize: "clamp(0.75rem, 1.2vw, 0.88rem)", color: "var(--c-gold)", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: "1rem" }}>
                {eyebrow}
              </div>
            )}
            
            <h1 ref={titleRef} className={`squish-title ${scrolled ? 'scrolled' : ''}`} style={{ position: "relative", zIndex: 20, fontFamily: "var(--f-display, 'Playfair Display', serif)", fontWeight: 800, fontSize: "clamp(1.6rem, min(5vw, 7vh), 4.5rem)", color: "var(--c-textBright)", lineHeight: 1.05, letterSpacing: "-0.015em", margin: 0, textTransform: "uppercase", transform: isTomorrow ? "translateY(-6px)" : "none", transition: "opacity 0.25s ease" }}>
              {title}
            </h1>
            
            {subtitle && (
              <div ref={subRef} style={{ marginTop: '0.5rem' }}>
                {subtitle}
              </div>
            )}

            {heroContent && (
              <div ref={heroContentRef} style={{ width: '100%', maxWidth: 780, boxSizing: 'border-box', marginTop: 'clamp(1rem, 2vh, 2rem)' }}>
                {heroContent}
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
