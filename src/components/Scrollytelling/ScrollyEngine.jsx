import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ParticleSwarm from './ParticleSwarm';
import VintageArt from './VintageArt';

gsap.registerPlugin(ScrollTrigger);

// Reusable component for editorial text blocks
function NarrativeStep({ title, children }) {
  const stepRef = useRef(null);

  useGSAP(() => {
    gsap.from(stepRef.current, {
      scrollTrigger: {
        trigger: stepRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play reverse play reverse",
      },
      opacity: 0.1,
      y: 30,
      duration: 1,
      ease: "power2.out"
    });
  }, { scope: stepRef });

  return (
    <section ref={stepRef} className="min-h-screen flex items-center justify-center mb-32 relative z-10">
      <div className="bg-[var(--bg-primary)] p-10 md:p-14 rounded-xl border border-[var(--border-color)] shadow-2xl max-w-2xl w-full mx-4" style={{ transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
        <h2 className="text-3xl md:text-5xl font-bold font-serif mb-6 text-[var(--text-primary)] leading-tight tracking-tight">
          {title}
        </h2>
        <div className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed font-serif space-y-6">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function ScrollyEngine() {
  const containerRef = useRef();

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: ".sticky-visuals"
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="scrolly-engine relative w-full h-auto min-h-[500vh] flex flex-col lg:flex-row">
      
      {/* Sticky Background / Left Pane */}
      <div className="sticky-visuals lg:sticky lg:top-0 h-screen w-full lg:w-1/2 flex items-center justify-center bg-[var(--bg-secondary)] overflow-hidden border-r border-[var(--border-color)]" style={{ transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
        <ParticleSwarm />
        <VintageArt />
      </div>

      {/* Scrolling Text / Right Pane */}
      <div className="narrative-content relative w-full lg:w-1/2 z-10 px-0 py-24 bg-[var(--bg-primary)]" style={{ transition: 'background-color 0.3s ease' }}>
        
        <NarrativeStep title="The Accidental Intactivist Lens">
          <p>
            To much of the world, routine infant circumcision is bizarre. Yet in the United States, it remains an unquestioned norm.
          </p>
          <p>
            Growing up intact in a culture where that makes you an anomaly forces a unique perspective—an "accidental anthropologist" studying a practice that is almost universally accepted without thought.
          </p>
        </NarrativeStep>

        <NarrativeStep title="Setting the Baseline">
          <p>
            Before exploring the conclusions, we must establish the facts. We asked 504 men—intact, circumcised, and restoring—parallel questions about their physical characteristics, their sensitivity, and their satisfaction.
          </p>
          <p>
            This isn't an echo chamber. It's a rigorous, side-by-side comparison of lived realities.
          </p>
        </NarrativeStep>

        <NarrativeStep title="Sharpening the Differences">
          <p>
            When we move beyond the abstract data and read the qualitative responses, a stark contrast emerges.
          </p>
          <p>
            The routine, unquestioned normalization begins to fracture under the weight of firsthand accounts describing tightness, diminished sensation, and anatomical absence.
          </p>
        </NarrativeStep>

        <NarrativeStep title="The Pleasure Gap">
          <p>
            Here lies the cognitive dissonance. A procedure explicitly invented in the Victorian era to diminish the male orgasm and curb masturbation was conveniently "retconned" into a panacea for hygiene.
          </p>
          <p>
            The sensory data confirms its original design: it removes a boy's ability to experience full sexual pleasure for his entire life.
          </p>
        </NarrativeStep>

        <NarrativeStep title="Reclaiming Agency">
          <p>
            For those who choose to restore, the journey is profound. While biomechanically, the frenulum and rigid band cannot be regrown, restoration represents a triumphant reclamation of wholeness.
          </p>
          <p>
            It is a rejection of the original violation and a powerful reclaiming of bodily autonomy over a decision they never consented to.
          </p>
        </NarrativeStep>

        {/* Padding at the bottom so the last step clears the screen gracefully */}
        <div className="h-64" />
      </div>
    </div>
  );
}
