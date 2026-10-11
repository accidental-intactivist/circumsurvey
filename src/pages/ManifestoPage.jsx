import React, { useEffect, useRef } from 'react';
import { BookOpen, Crosshair, Sparkles } from 'lucide-react';
import { FONT } from '../styles/tokens';

export default function ManifestoPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const sections = containerRef.current.querySelectorAll('.manifesto-section');
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.75;
        if (isVisible) {
          section.classList.add('is-visible');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="manifesto-container" style={{ background: '#0a0a0a', color: 'var(--c-textBright)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <section className="manifesto-hero" style={{ height: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative', padding: '2rem' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 30%, rgba(212,160,48,0.1) 0%, #0a0a0a 70%)', pointerEvents: 'none' }} />
        
        <div className="manifesto-eyebrow" style={{ color: 'var(--c-goldBright)', fontFamily: FONT.condensed, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 800, marginBottom: '1.5rem', fontSize: '1rem' }}>
          Our Core Philosophy
        </div>
        
        <h1 style={{ fontFamily: FONT.display, fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 1, margin: '0 0 2rem 0', letterSpacing: '-0.03em', maxWidth: '1000px' }}>
          Not About Us <br /><span style={{ color: 'var(--c-dim)' }}>Without Us.</span>
        </h1>
        
        <p style={{ fontFamily: FONT.body, fontSize: '1.2rem', color: 'var(--c-muted)', maxWidth: '600px', lineHeight: 1.8 }}>
          We approach this historical archive not as a judge, but as an outside investigator. We provide the primary sources, the money trails, and the timeline. You provide the courage.
        </p>

        <div style={{ marginTop: '4rem', animation: 'float 3s ease-in-out infinite' }}>
          <div style={{ width: '1px', height: '80px', background: 'linear-gradient(to bottom, var(--c-goldBright), transparent)' }} />
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="manifesto-section" style={{ padding: '8rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Crosshair size={32} color="var(--c-goldBright)" />
          <h2 style={{ fontFamily: FONT.display, fontSize: '2.5rem', margin: 0 }}>The Outside Investigator</h2>
        </div>
        <p style={{ fontSize: '1.25rem', color: 'var(--c-text)', lineHeight: 1.8, marginBottom: '2rem' }}>
          As researchers who grew up completely intact within a genital cutting culture, we can understand the myriad of societal, medical, and personal reasons one might advocate for the practice. We see the pressure, the tradition, and the fear.
        </p>
        <p style={{ fontSize: '1.25rem', color: 'var(--c-text)', lineHeight: 1.8 }}>
          But when it comes to the topics of grief, physical loss, and support for those impacted, <strong>we refuse to speak for you or diminish what you are dealing with.</strong> This platform is designed to equip you with undeniable, museum-grade evidence so that you can advocate for yourselves.
        </p>
      </section>

      {/* Landmark Section */}
      <section className="manifesto-section" style={{ padding: '8rem 2rem', maxWidth: '800px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Sparkles size={32} color="var(--c-goldBright)" />
          <h2 style={{ fontFamily: FONT.display, fontSize: '2.5rem', margin: 0 }}>Empty and Meaningless</h2>
        </div>
        <p style={{ fontSize: '1.25rem', color: 'var(--c-text)', lineHeight: 1.8, marginBottom: '2rem' }}>
          We subscribe to a philosophy that the events of the past are inherently empty and meaningless until we assign them meaning. 
          <em> It happened. It is never going to not have happened. </em>
        </p>
        <p style={{ fontSize: '1.25rem', color: 'var(--c-text)', lineHeight: 1.8 }}>
          There is immense, radical power in intentionally choosing not to be resentful. Instead, we encourage you to become the kind of person who is confident enough, grounded enough, and educated enough to challenge these deeply entrenched notions in places where this conversation has never been expected.
        </p>
      </section>

      {/* The Archive Section */}
      <section className="manifesto-section" style={{ padding: '8rem 2rem', maxWidth: '800px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <BookOpen size={48} color="var(--c-goldBright)" style={{ marginBottom: '2rem' }} />
        <h2 style={{ fontFamily: FONT.display, fontSize: '3rem', margin: '0 0 1.5rem 0' }}>The Archive Researcher</h2>
        <p style={{ fontSize: '1.25rem', color: 'var(--c-muted)', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          We do not rely on assumptions. This platform is powered by an advanced <strong>Archive Synthesis</strong> engine. It continuously reads, categorizes, and cross-references centuries of medical journals, historical footage, and financial trails to bring you the truth.
        </p>
        
        <div style={{ padding: '2rem', background: 'rgba(212,160,48,0.05)', borderRadius: '16px', border: '1px solid rgba(212,160,48,0.2)' }}>
          <h3 style={{ fontFamily: FONT.condensed, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-goldBright)', margin: '0 0 1rem 0' }}>Our Promise</h3>
          <p style={{ margin: 0, color: 'var(--c-textBright)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            We will never obscure the data. We will always provide the source document. We will build the tools you need to shift the culture.
          </p>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .manifesto-section {
          opacity: 0;
          transform: translateY(40px);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .manifesto-section.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(15px); }
          100% { transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
