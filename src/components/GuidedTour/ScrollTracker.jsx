import React, { useEffect, useState } from 'react';

export const NARRATIVE_STRUCTURE = [
  { id: 'ch-prologue', type: 'act', label: 'Prologue' },
  { id: 'act-1-mechanics', type: 'act', label: 'Act I' },
  { id: 'sexual-experience-the-pleasure-gap', type: 'chapter', label: 'Sensation Metrics' },
  { id: 'lubrication-dependency', type: 'chapter', label: 'Mechanical Friction' },
  { id: 'act-2-emotion', type: 'act', label: 'Act II' },
  { id: 'gratitude-vs-regret', type: 'chapter', label: 'Resentment vs. Regret' },
  { id: 'the-raw-words', type: 'chapter', label: 'Narrative Testimonies' },
  { id: 'act-3-restoration', type: 'act', label: 'Act III' },
  { id: 'the-restoring-cohort-in-numbers', type: 'chapter', label: 'Restoring Cohort' },
  { id: 'act-4-resolution', type: 'act', label: 'Act IV' },
  { id: 'the-convergence', type: 'chapter', label: 'Future Son Intentions' },
  { id: 'appendix', type: 'act', label: 'Appendix' },
  { id: 'the-survey-architecture', type: 'chapter', label: 'Survey Architecture' },
  { id: 'respondent-census-origins', type: 'chapter', label: 'Respondent Census' },
  { id: 'the-generational-faultline', type: 'chapter', label: 'Generational Shifts' },
  { id: 'for-new-expectant-parents', type: 'chapter', label: 'Data for Parents' }
];

export default function ScrollTracker() {
  const [activeId, setActiveId] = useState('ch-prologue');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 1500);

      // Calculate overall scroll progress (0 to 1) for the background line
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / totalHeight)));
      }

      // Determine the currently active section
      const triggerPoint = window.innerHeight / 2; // Middle of the screen
      let current = NARRATIVE_STRUCTURE[0].id;
      
      for (const item of NARRATIVE_STRUCTURE) {
        const element = document.getElementById(item.id);
        if (element && element.getBoundingClientRect().top <= triggerPoint) {
          current = item.id;
        }
      }
      setActiveId(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call
    setTimeout(handleScroll, 100);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const activeIndex = NARRATIVE_STRUCTURE.findIndex(x => x.id === activeId);

  return (
    <div 
      className="scroll-tracker" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'sticky',
        top: '15vh',
        height: '70vh',
        width: '240px',
        flexShrink: 0,
        display: 'flex',
        paddingLeft: '1rem',
        opacity: (isHovered || isScrolling) ? 1 : 0.15,
        transition: 'opacity 0.6s ease',
        zIndex: 50
      }}
    >
      <style>
        {`
          @media (max-width: 1200px) {
            .scroll-tracker { display: none !important; }
          }
        `}
      </style>

      {/* Background track line */}
      <div style={{
        position: 'absolute',
        left: '29px',
        top: '14px',
        bottom: '14px',
        width: '4px',
        background: 'var(--c-ghost)',
        borderRadius: '2px'
      }} />

      {/* Progress fill line */}
      <div style={{
        position: 'absolute',
        left: '29px',
        top: '14px',
        height: `calc(${scrollProgress * 100}% - 28px)`,
        minHeight: '4px',
        width: '4px',
        background: 'var(--c-gold)',
        borderRadius: '2px',
        transition: 'height 0.1s ease-out'
      }} />

      {/* Nodes */}
      <div style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}>
        {/* Sliding Highlight Bar */}
        <div style={{
          position: 'absolute',
          left: '12px',
          right: '8px',
          height: '28px',
          background: 'color-mix(in srgb, var(--c-gold) 15%, transparent)',
          border: '1px solid color-mix(in srgb, var(--c-gold) 30%, transparent)',
          borderRadius: '6px',
          top: `${(Math.max(0, activeIndex) / (NARRATIVE_STRUCTURE.length - 1)) * 100}%`,
          transform: `translateY(-${(Math.max(0, activeIndex) / (NARRATIVE_STRUCTURE.length - 1)) * 100}%)`,
          transition: 'top 0.4s cubic-bezier(0.25, 1, 0.5, 1), transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
          zIndex: 0
        }} />

        {NARRATIVE_STRUCTURE.map((item, index) => {
          const isActive = activeId === item.id;
          const isAct = item.type === 'act';
          // A node is considered "passed" if it comes before the active node in the array
          const isPassed = index <= activeIndex;

          return (
            <div 
              key={item.id} 
              onClick={() => {
                const el = document.getElementById(item.id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                height: '28px', // Fixed height for exact highlight calculation
                cursor: 'pointer',
                opacity: isPassed ? 1 : 0.4,
                transition: 'all 0.3s ease',
                transform: isActive ? 'translateX(4px)' : 'none',
                zIndex: 1
              }}
            >
              {/* Dot */}
              <div style={{
                position: 'absolute',
                left: isAct ? '26px' : '28px', // Center the dot over the 2px line at left: 30px
                width: isAct ? '10px' : '6px',
                height: isAct ? '10px' : '6px',
                borderRadius: '50%',
                background: isActive ? 'var(--c-goldBright)' : (isPassed ? 'var(--c-gold)' : 'var(--c-bgCard)'),
                border: isAct ? `2px solid ${isActive ? 'var(--c-bgCard)' : 'var(--c-ghost)'}` : `2px solid ${isPassed ? 'var(--c-gold)' : 'var(--c-ghost)'}`,
                boxShadow: isActive ? '0 0 10px var(--c-gold)' : 'none',
                transition: 'all 0.3s ease',
                zIndex: 2
              }} />

              {/* Label */}
              <div style={{
                marginLeft: '50px',
                fontFamily: isAct ? "var(--f-condensed, 'Barlow Condensed', sans-serif)" : "var(--f-body, 'Barlow', sans-serif)",
                fontSize: isAct ? '0.75rem' : '0.8rem',
                fontWeight: isAct ? 700 : (isActive ? 600 : 400),
                textTransform: isAct ? 'uppercase' : 'none',
                letterSpacing: isAct ? '0.15em' : '0',
                color: isActive ? 'var(--c-textBright)' : (isPassed ? 'var(--c-text)' : 'var(--c-muted)'),
                transition: 'color 0.3s ease',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                maxWidth: '170px'
              }}>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
