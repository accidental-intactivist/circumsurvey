import React, { useState, useEffect } from 'react';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import UniversalSquishHeader from './UniversalSquishHeader';
import GlobalHamburgerMenu from '../../explore/components/GlobalHamburgerMenu';
import BreadcrumbDropdown from '../../explore/components/BreadcrumbDropdown';
import { useTheme } from '../../contexts/ThemeContext';
import { TOUR } from '../GuidedTour/tourData';
import { NARRATIVE_STRUCTURE } from '../GuidedTour/ScrollTracker';

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

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(i => (i + 1) % TEASER_QUOTES.length);
    }, 7000);
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
    window.dispatchEvent(new CustomEvent("cs-loom-pause", { detail: { paused: next } }));
  };

  const [currentId, setCurrentId] = useState('ch-prologue');

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
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

  const navLeft = (
    <>
      <a href="/" className="mobile-hide" style={{ color: 'var(--c-goldBright)', textDecoration: 'none', flexShrink: 0, marginRight: '0.5rem' }}>
        ← Guide Home
      </a>
      <span className="mobile-hide" style={{ color: 'var(--c-dim)', flexShrink: 0 }}>|</span>
      <a href="#" className="mobile-hide" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        style={{ color: 'var(--c-textBright)', textDecoration: 'none', flexShrink: 0, marginLeft: '0.5rem' }}>
        Special Report
      </a>
      <span className="mobile-hide" style={{ color: 'var(--c-dim)', flexShrink: 0 }}>/</span>
      <span id="tour-chapters" style={{ color: 'var(--c-muted)', minWidth: 0, flexShrink: 1, display: 'inline-flex' }}>
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
    </>
  );

  const navRight = (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="mobile-hide" style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--c-textBright)',
            padding: '0.3rem 0.8rem', borderRadius: 100, fontSize: '0.75rem', fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)", textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer'
          }}>Sign In</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserButton />
        </div>
      </SignedIn>
      <a id="tour-explore" href="/explore" style={{
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
      <span id="tour-hamburger" style={{ display: 'flex', alignItems: 'center' }}>
        <GlobalHamburgerMenu />
      </span>
    </>
  );

  const heroContent = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{
        width: "100%",
        maxWidth: 780,
        boxSizing: "border-box",
        background: "var(--c-bgCard)",
        borderRadius: 6,
        padding: "clamp(10px, 1.5vh, 20px)",
      }}>
        <div style={{
          border: "2.5px solid var(--c-gold)",
          borderRadius: 2,
          padding: "clamp(0.8rem, 1.5vh, 2.2rem) clamp(1rem, 3vw, 3.5rem)",
        }}>
          <div style={{ fontFamily: "var(--f-display, 'Playfair Display', serif)", fontWeight: 400, fontStyle: "italic", fontSize: "clamp(1rem, min(1.8vw, 2.5vh), 1.5rem)", color: "var(--c-text)", lineHeight: 1.4, letterSpacing: "0.01em" }}>
            If someone asked you honestly how you felt about your
          </div>
          <div style={{ fontFamily: "var(--f-display, 'Playfair Display', serif)", fontWeight: 800, fontSize: "clamp(1.5rem, min(3.5vw, 5vh), 3.2rem)", lineHeight: 1.1, letterSpacing: "-0.01em", textTransform: "uppercase", margin: "clamp(0.4rem, 1vh, 1rem) 0", background: "linear-gradient(135deg, var(--c-goldBright), var(--c-gold), var(--c-orange))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            circumcision status
          </div>
          <div style={{ fontFamily: "var(--f-display, 'Playfair Display', serif)", fontWeight: 700, fontSize: "clamp(1.2rem, min(3vw, 4vh), 2.6rem)", color: "var(--c-textBright)", lineHeight: 1.2, letterSpacing: "-0.01em", marginTop: "0" }}>
            what would you say?
          </div>
          <div style={{ width: 60, height: 2, margin: "clamp(0.8rem, 1.5vh, 1.4rem) auto", background: "linear-gradient(90deg, var(--c-gold), var(--c-orange))", borderRadius: 1 }} />
          <div style={{ fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)", fontWeight: 700, fontSize: "clamp(0.7rem, 1vw, 0.85rem)", textTransform: "uppercase", letterSpacing: "0.25em", display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(0.2rem, 1vh, 0.4rem)" }}>
            <span style={{ color: "var(--c-muted)" }}>{PHASE1_TOTAL} people answered anonymously.</span>
            <span style={{ color: "var(--c-goldBright)" }}>Here's what they chose to share.</span>
          </div>
        </div>
      </div>

      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 780,
        boxSizing: "border-box",
        marginTop: "clamp(0.8rem, 2vh, 2.5rem)",
        background: "var(--c-bgCard)",
        border: "1px solid var(--c-ghost)",
        borderRadius: 6,
        padding: "clamp(10px, 1.5vh, 24px)",
        textAlign: "center",
        zIndex: 10,
        pointerEvents: "none",
      }}>
        <div style={{ display: "grid", border: "2.5px solid transparent", width: "100%", minHeight: "90px", boxSizing: "border-box" }}>
          {TEASER_QUOTES.map((q, i) => (
            <div key={i} style={{ gridArea: "1/1", opacity: quoteIndex === i ? 1 : 0, transition: "opacity 1s ease", display: "flex", flexDirection: "column", justifyContent: "center", pointerEvents: quoteIndex === i ? "auto" : "none" }}>
              <div style={{ fontFamily: "var(--f-body, 'Inter', sans-serif)", fontSize: "clamp(0.95rem, 1.8vw, 1.1rem)", color: "var(--c-textBright)", lineHeight: 1.5, fontStyle: "italic", marginBottom: "0.8rem" }}>
                {q.text}
              </div>
              <div style={{ fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)", fontSize: "0.75rem", color: "var(--c-gold)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>
                — {q.author}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <UniversalSquishHeader
      themeKey={`${theme}-${mode}-${colorblind}`}
      loomPaused={loomPaused}
      toggleLoom={toggleLoom}
      navLeftContent={navLeft}
      navRightContent={navRight}
      eyebrow="★ Special Report ★"
      title="The Accidental Intactivist's Inquiry"
      heroContent={heroContent}
      isTomorrow={isTomorrow}
      startVh={85}
    />
  );
}