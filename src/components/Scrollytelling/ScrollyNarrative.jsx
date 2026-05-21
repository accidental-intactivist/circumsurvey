import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollyNarrative — theme-aware narrative text block for the scrollytelling engine.
 * 
 * Replaces the glassmorphism NarrativeStep. Renders directly on the page background
 * with clean serif typography and GSAP scroll-triggered reveal animations.
 * 
 * Variants control the "room" each act lives in:
 *   "void"   — transparent bg, text floats on the dark/light background (Acts 1, 3)
 *   "paper"  — warm Bureau Card treatment with grain texture (Acts 2, 4 opening)
 *   "golden" — warm amber-tinted panel for the resolution (Act 5)
 * 
 * All colors use CSS custom properties from ThemeContext for full theme compatibility.
 */

// Paper grain SVG as inline data URI (reused from LandingPage)
const GRAIN_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.17 0 0 0 0 0.15 0 0 0 0 0.13 0 0 0 0.085 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>`;

const VARIANT_STYLES = {
  void: {
    wrapper: {
      background: 'transparent',
    },
    card: {
      background: 'transparent',
      border: 'none',
      maxWidth: 820,
    },
  },
  paper: {
    wrapper: {
      background: 'transparent',
    },
    card: {
      background: `url("${GRAIN_SVG}"), linear-gradient(180deg, #faf6f0 0%, #f4ede0 100%)`,
      border: '2.5px solid #2a2622',
      borderRadius: 10,
      maxWidth: 900,
      boxShadow: '0 6px 32px rgba(0,0,0,0.2)',
    },
  },
  golden: {
    wrapper: {
      background: 'radial-gradient(ellipse at center, rgba(212, 160, 48, 0.15) 0%, transparent 70%)',
    },
    card: {
      background: 'transparent',
      border: 'none',
      maxWidth: 820,
    },
  },
  glass: {
    wrapper: {
      background: 'transparent',
    },
    card: {
      background: 'rgba(15, 15, 20, 0.65)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 12,
      maxWidth: 820,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    },
  },
};

export default function ScrollyNarrative({ 
  title, 
  eyebrow,
  children, 
  index, 
  setActiveStep,
  variant = 'void',
  accentColor,
  onEnter,
}) {
  const stepRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(() => {
    // Track which act is active
    ScrollTrigger.create({
      trigger: stepRef.current,
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        if (setActiveStep && index !== undefined) setActiveStep(index);
        if (onEnter) onEnter();
      },
      onEnterBack: () => {
        if (setActiveStep && index !== undefined) setActiveStep(index);
        if (onEnter) onEnter();
      },
    });

    // Reveal animation — fade + slide up
    gsap.from(contentRef.current, {
      scrollTrigger: {
        trigger: stepRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play reverse play reverse",
      },
      opacity: 0,
      y: 40,
      duration: 1,
      ease: "power3.out"
    });
  }, { scope: stepRef });

  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.void;
  const isPaper = variant === 'paper';
  const isGlass = variant === 'glass';

  return (
    <section 
      ref={stepRef} 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 20,
        padding: '4rem 1.5rem',
        ...variantStyle.wrapper,
        transition: 'background 0.6s ease',
      }}
    >
      <div 
        ref={contentRef}
        style={{
          width: '100%',
          margin: '0 auto',
          padding: isPaper ? '3rem 3rem 2.5rem' : '2rem 1rem',
          ...variantStyle.card,
          transition: 'background 0.6s ease, border-color 0.6s ease',
        }}
      >
        {/* Accent bar for paper and glass variants */}
        {(isPaper || isGlass) && (
          <div style={{
            height: isGlass ? 2 : 4,
            background: accentColor || 'linear-gradient(90deg, #d94f4f, #e8a44a, #e8c868, #68b878, #5b93c7)',
            borderRadius: '8px 8px 0 0',
            marginTop: -3,
            marginLeft: -2,
            marginRight: -2,
            position: 'relative',
            top: isPaper ? '-3rem' : 0,
            opacity: isGlass ? 0.8 : 1,
          }} />
        )}

        {/* Eyebrow label */}
        {eyebrow && (
          <div style={{
            fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
            fontWeight: 700,
            fontSize: 'clamp(0.65rem, 0.9vw, 0.78rem)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: accentColor || 'var(--c-gold)',
            marginBottom: '0.6rem',
          }}>
            {eyebrow}
          </div>
        )}

        {/* Title */}
        {title && (
          <h2 style={{
            fontFamily: "var(--f-display, 'Playfair Display', serif)",
            fontWeight: 800,
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            color: isPaper ? '#1a1815' : 'var(--c-textBright)',
            lineHeight: 1.1,
            letterSpacing: '-0.015em',
            marginBottom: '1.5rem',
            textShadow: isGlass ? `0 0 20px ${accentColor || 'rgba(255,255,255,0.2)'}` : 'none',
          }}>
            {title}
          </h2>
        )}

        {/* Narrative content — children can include text, data widgets, etc. */}
        <div style={{
          fontFamily: "var(--f-display, 'Playfair Display', serif)",
          fontWeight: 400,
          fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)',
          color: isPaper ? '#3a3530' : 'var(--c-text)',
          lineHeight: 1.75,
          maxWidth: 720,
        }}>
          {children}
        </div>
      </div>
    </section>
  );
}
