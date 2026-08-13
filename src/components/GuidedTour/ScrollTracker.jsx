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
    <>
      <style>
        {`
          .desktop-tracker { display: flex; }
          .mobile-tracker { display: none; }
          @media (max-width: 1200px) {
            .desktop-tracker { display: none !important; }
            .mobile-tracker { display: flex; }
          }
        `}
      </style>

      {/* Desktop Tracker */}
      <div 
        className="desktop-tracker"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'sticky',
          top: '15vh',
          height: '70vh',
          width: '240px',
          flexShrink: 0,
          flexDirection: 'column',
          paddingLeft: '1rem',
          opacity: (isHovered || isScrolling) ? 1 : 0.15,
          transition: 'opacity 0.6s ease',
          zIndex: 50
        }}
      >
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
                  height: '28px',
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
                  left: isAct ? '26px' : '28px',
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

      {/* Mobile Tracker */}
      <MobileTracker activeId={activeId} />
    </>
  );
}

function MobileTracker({ activeId }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeItem = NARRATIVE_STRUCTURE.find(x => x.id === activeId) || NARRATIVE_STRUCTURE[0];
  const activeIndex = NARRATIVE_STRUCTURE.findIndex(x => x.id === activeId);

  // Determine current Act
  let currentAct = NARRATIVE_STRUCTURE[0];
  for (let i = activeIndex; i >= 0; i--) {
    if (NARRATIVE_STRUCTURE[i].type === 'act') {
      currentAct = NARRATIVE_STRUCTURE[i];
      break;
    }
  }

  return (
    <>
      {/* Dim Overlay when open */}
      <div 
        className="mobile-tracker"
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 90,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease'
        }}
      />
      
      <div 
        className="mobile-tracker"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 91,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--c-bgDeep)',
          borderTop: '1px solid var(--c-ghost)',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
      >
        {/* Expanded Menu */}
        <div style={{ maxHeight: '50vh', overflowY: 'auto', padding: '1rem', borderBottom: '1px solid var(--c-ghost)' }}>
          {NARRATIVE_STRUCTURE.map((item, index) => {
            const isActive = activeId === item.id;
            const isAct = item.type === 'act';
            const isPassed = index <= activeIndex;

            return (
              <div 
                key={item.id} 
                onClick={() => {
                  setIsOpen(false);
                  const el = document.getElementById(item.id);
                  if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
                }}
                style={{
                  padding: '0.8rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  opacity: isPassed ? 1 : 0.6,
                  background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderRadius: '8px',
                  marginBottom: '0.2rem'
                }}
              >
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isActive ? 'var(--c-goldBright)' : (isPassed ? 'var(--c-gold)' : 'var(--c-ghost)'),
                }} />
                <span style={{
                  fontFamily: isAct ? "var(--f-condensed, 'Barlow Condensed', sans-serif)" : "var(--f-body, 'Barlow', sans-serif)",
                  fontSize: isAct ? '0.85rem' : '0.9rem',
                  fontWeight: isAct ? 700 : (isActive ? 600 : 400),
                  textTransform: isAct ? 'uppercase' : 'none',
                  letterSpacing: isAct ? '0.15em' : '0',
                  color: isActive ? 'var(--c-textBright)' : 'var(--c-text)'
                }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Sticky Bottom Bar */}
      <div 
        className="mobile-tracker"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'rgba(23, 23, 23, 0.85)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--c-ghost)',
          zIndex: 92,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 1.5rem',
          cursor: 'pointer',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem'
        }}>
          <span style={{
            fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
            fontWeight: 700,
            fontSize: '0.65rem',
            color: 'var(--c-goldBright)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em'
          }}>
            {currentAct.label}
          </span>
          <span style={{
            fontFamily: "var(--f-display, 'Outfit', sans-serif)",
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--c-textBright)',
          }}>
            {activeItem.type !== 'act' ? activeItem.label : 'Introduction'}
          </span>
        </div>

        <div style={{
          position: 'absolute',
          right: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px'
        }}>
          <div style={{ width: 18, height: 2, background: 'var(--c-text)', transition: 'all 0.3s', transform: isOpen ? 'translateY(5px) rotate(45deg)' : 'none' }} />
          <div style={{ width: 18, height: 2, background: 'var(--c-text)', transition: 'all 0.3s', opacity: isOpen ? 0 : 1 }} />
          <div style={{ width: 18, height: 2, background: 'var(--c-text)', transition: 'all 0.3s', transform: isOpen ? 'translateY(-5px) rotate(-45deg)' : 'none' }} />
        </div>
      </div>
    </>
  );
}
