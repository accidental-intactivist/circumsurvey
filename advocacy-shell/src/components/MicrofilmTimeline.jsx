import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MicrofilmTimeline({ documents, getYear, getCleanTitle, getDocumentIcon }) {
  const scrollRef = useRef(null);
  
  // 1. Extract years and valid bounds
  const docYears = documents.map(d => ({ ...d, year: getYear(d) }));
  const validYears = docYears.map(d => d.year).filter(y => y !== 9999);
  
  const hasValidYears = validYears.length > 0;
  const minYear = hasValidYears ? Math.min(...validYears) : null;
  const maxYear = hasValidYears ? Math.max(...validYears) : null;

  // Group by year
  const grouped = {};
  docYears.forEach(d => {
    if (!grouped[d.year]) grouped[d.year] = [];
    grouped[d.year].push(d);
  });

  // Create timeline array
  const timelineItems = [];
  if (hasValidYears) {
    // Pad min and max by a year or two for breathing room
    for (let y = minYear - 1; y <= maxYear + 1; y++) {
      timelineItems.push({
        year: y,
        isUndated: false,
        docs: grouped[y] || []
      });
    }
  }

  if (grouped[9999] && grouped[9999].length > 0) {
    timelineItems.push({
      year: 9999,
      isUndated: true,
      docs: grouped[9999]
    });
  }

  // Scroll handlers
  const scrollInterval = useRef(null);

  const startScroll = (direction) => {
    if (scrollInterval.current) return;
    const amount = direction === 'left' ? -10 : 10;
    scrollInterval.current = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: amount, behavior: 'auto' });
      }
    }, 16);
  };

  const stopScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  const scrollClick = (direction) => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Sprocket hole styling
  const sprocketStyle = {
    height: '16px',
    width: '100%',
    backgroundRepeat: 'repeat-x',
    backgroundSize: '24px 16px',
    backgroundImage: 'radial-gradient(circle at 12px 8px, transparent 4px, var(--c-bgDeep) 4px, var(--c-bgDeep) 5px, var(--c-bgCard) 6px)',
    opacity: 0.6
  };

  return (
    <div style={{ 
      position: 'relative', 
      margin: '2rem 0 3rem', 
      background: 'var(--c-bgCard)', 
      border: '1px solid var(--c-ghost)',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    }}>
      
      {/* Top Sprockets */}
      <div style={{ ...sprocketStyle, borderBottom: '1px solid var(--c-ghost)' }} />

      {/* Controls */}
      <button 
        onMouseDown={() => startScroll('left')}
        onMouseUp={stopScroll}
        onMouseLeave={stopScroll}
        onClick={() => scrollClick('left')}
        className="lux-hover-lift"
        style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'var(--c-bgDeep)', border: '1px solid var(--c-gold)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-goldBright)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
      >
        <ChevronLeft size={28} />
      </button>

      <button 
        onMouseDown={() => startScroll('right')}
        onMouseUp={stopScroll}
        onMouseLeave={stopScroll}
        onClick={() => scrollClick('right')}
        className="lux-hover-lift"
        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'var(--c-bgDeep)', border: '1px solid var(--c-gold)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-goldBright)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
      >
        <ChevronRight size={28} />
      </button>

      {/* Scrollable Track */}
      <div 
        ref={scrollRef}
        style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          padding: '3rem 4rem',
          gap: '2rem',
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none' /* IE/Edge */
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `div::-webkit-scrollbar { display: none; }`}} />

        {/* Continuous Axis Line Container */}
        <div style={{ position: 'relative', display: 'flex' }}>
          
          {/* The actual line drawn across the container */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'var(--c-ghost)', zIndex: 1 }} />

          {timelineItems.map((item) => (
            <div key={item.year} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2, minWidth: '140px', padding: '0 1rem' }}>
              
              {/* Top items (staggered) */}
              <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '0.5rem', marginBottom: '1rem', minHeight: '120px', justifyContent: 'flex-start' }}>
                {item.docs.filter((_, i) => i % 2 === 0).map(doc => (
                  <DocumentCard key={doc.id} doc={doc} getCleanTitle={getCleanTitle} getDocumentIcon={getDocumentIcon} />
                ))}
              </div>

              {/* Axis Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'var(--c-bgCard)', padding: '0 0.5rem', zIndex: 3 }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: item.docs.length > 0 ? 'var(--c-goldBright)' : 'var(--c-dim)', border: '3px solid var(--c-bgCard)' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: item.docs.length > 0 ? 'var(--c-textBright)' : 'var(--c-dim)', fontFamily: 'var(--f-mono)' }}>
                  {item.isUndated ? 'Undated' : item.year}
                </div>
              </div>

              {/* Bottom items (staggered) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', minHeight: '120px', justifyContent: 'flex-start' }}>
                {item.docs.filter((_, i) => i % 2 !== 0).map(doc => (
                  <DocumentCard key={doc.id} doc={doc} getCleanTitle={getCleanTitle} getDocumentIcon={getDocumentIcon} />
                ))}
              </div>

            </div>
          ))}

        </div>

        {timelineItems.length === 0 && (
          <div style={{ padding: '4rem', color: 'var(--c-dim)', textAlign: 'center', width: '100%' }}>
            No timeline data available.
          </div>
        )}
      </div>

      {/* Bottom Sprockets */}
      <div style={{ ...sprocketStyle, borderTop: '1px solid var(--c-ghost)' }} />

    </div>
  );
}

function DocumentCard({ doc, getCleanTitle, getDocumentIcon }) {
  return (
    <Link 
      to={`/library/${doc.id}`} 
      className="lux-hover-lift" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        width: '220px', 
        background: 'var(--c-bgDeep)', 
        border: '1px solid var(--c-ghost)', 
        borderRadius: '6px', 
        padding: '0.75rem', 
        textDecoration: 'none', 
        transition: 'all 0.2s',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'var(--c-bgSoft)', borderRadius: '4px', color: 'var(--c-gold)', flexShrink: 0 }}>
        {getDocumentIcon(doc.type)}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--c-textBright)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {getCleanTitle(doc)}
      </div>
    </Link>
  );
}
