import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ThemeToggle from '../../explore/components/ThemeToggle';
import HarmonicCanvas from '../../components/HarmonicCanvas';
import { META } from '../../data.js';

gsap.registerPlugin(ScrollTrigger);

export default function SquishHeader() {
  const headerRef = useRef(null);
  const title1Ref = useRef(null);
  const title2Ref = useRef(null);
  const title3Ref = useRef(null);
  const containerRef = useRef(null);

  useGSAP(() => {
    const scrollDistance = 500;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: `+=${scrollDistance}`,
        scrub: 0.5,
      }
    });

    tl.to(headerRef.current, {
      minHeight: "70px",
      height: "70px",
      paddingTop: "10px",
      paddingBottom: "10px",
      backgroundColor: "#0a0a0c", // C.bg
      borderBottomColor: "#2a2a30", // C.pageGhost
      ease: "none"
    }, 0);

    tl.to(title1Ref.current, {
      fontSize: "0.6rem",
      opacity: 0,
      y: -20,
      ease: "none"
    }, 0);

    tl.to(title2Ref.current, {
      fontSize: "1.2rem",
      y: -20,
      ease: "none"
    }, 0);

    tl.to(title3Ref.current, {
      fontSize: "0.7rem",
      y: -30,
      opacity: 0,
      ease: "none"
    }, 0);

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative z-50">
      <div style={{ height: '80vh' }} />

      <header 
        ref={headerRef}
        className="fixed top-0 left-0 w-full flex flex-col items-center justify-center border-b border-transparent overflow-hidden"
        style={{ 
          height: '80vh', 
          backgroundColor: 'transparent',
          transition: 'background-color 0.3s ease'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.6 }}>
          <HarmonicCanvas />
        </div>

        <div className="absolute top-6 right-6 z-50 flex gap-4 items-center">
          <ThemeToggle />
        </div>

        <div className="flex flex-col items-center text-center relative z-10 px-4">
          <div 
            ref={title1Ref}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(0.75rem, 1.2vw, 0.88rem)",
              color: "#d4a030", // C.gold
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              marginBottom: "0.5rem",
            }}
          >
            An Anonymous Survey · Findings Updated Live
          </div>
          
          <h1 
            ref={title2Ref}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 800,
              fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
              color: "#fff", // C.pageTextBright
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
              margin: 0,
            }}
          >
            The Accidental Intactivist's Inquiry
          </h1>
          
          <div 
            ref={title3Ref}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 400,
              fontStyle: "italic",
              fontSize: "clamp(1.05rem, 1.6vw, 1.3rem)",
              color: "#999", // C.pageMuted
              marginTop: "0.4rem",
            }}
          >
            {META.totalRespondents} Voices · Six Pathways · One Question, Asked Honestly
          </div>
        </div>
      </header>
    </div>
  );
}
