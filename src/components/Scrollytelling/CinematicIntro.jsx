import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function CinematicIntro() {
  const containerRef = useRef(null);
  const textRef1 = useRef(null);
  const textRef2 = useRef(null);
  const enterRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.fromTo(textRef1.current, 
      { opacity: 0, y: 30, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out' }
    )
    .fromTo(textRef2.current,
      { opacity: 0, y: 30, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out' },
      "-=1.0"
    )
    .fromTo(enterRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 2, ease: 'power2.inOut' },
      "-=0.5"
    );

    // Subtle floating animation for the text
    gsap.to([textRef1.current, textRef2.current], {
      y: "-=10",
      duration: 4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        zIndex: 50,
      }}
    >
      <div style={{ textAlign: 'center', padding: '0 2rem' }}>
        <div 
          ref={textRef1}
          style={{
            fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
            fontWeight: 700,
            fontSize: 'clamp(1rem, 2vw, 1.5rem)',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: 'var(--c-gold)',
            marginBottom: '1rem',
            opacity: 0,
          }}
        >
          A Data-Guided Discovery
        </div>
        
        <h1 
          ref={textRef2}
          style={{
            fontFamily: "var(--f-display, 'Playfair Display', serif)",
            fontWeight: 800,
            fontSize: 'clamp(4rem, 10vw, 8rem)',
            color: 'var(--c-textBright)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            margin: 0,
            textShadow: '0 0 40px rgba(212, 160, 48, 0.2)',
            opacity: 0,
          }}
        >
          The Transparent<br />Monster
        </h1>
      </div>

      <div 
        ref={enterRef}
        style={{
          position: 'absolute',
          bottom: '10vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          opacity: 0,
        }}
      >
        <div style={{
          width: 1,
          height: 60,
          background: 'linear-gradient(to bottom, var(--c-gold) 0%, transparent 100%)',
        }} />
        <span style={{
          fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
          fontWeight: 600,
          fontSize: '0.8rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--c-gold)',
        }}>
          Scroll to Begin
        </span>
      </div>
    </section>
  );
}
