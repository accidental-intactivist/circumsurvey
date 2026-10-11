import React, { useRef, useEffect } from 'react';
import './FacetedHero.css';

export default function FacetedHero({ title, subtitle }) {
  const lightRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!lightRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Stop updating if mouse is far from the element
      if (e.clientX < rect.left - 300 || e.clientX > rect.right + 300 || e.clientY < rect.top - 300 || e.clientY > rect.bottom + 300) {
        return;
      }
      
      // Calculate offset based on mouse position relative to container center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const xOffset = ((e.clientX - centerX) / rect.width) * 150;
      const yOffset = ((e.clientY - centerY) / rect.height) * 150;
      
      lightRef.current.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fh-container" ref={containerRef}>
      <div className="fh-light-wrapper" ref={lightRef}>
        <div className="fh-light-source"></div>
      </div>
      <div className="fh-faceted-card">
        <div className="fh-facet fh-facet-1"></div>
        <div className="fh-facet fh-facet-2"></div>
        <div className="fh-facet fh-facet-3"></div>
        <div className="fh-glass-overlay"></div>
        
        {/* Only render content section if props are provided */}
        {(title || subtitle) && (
          <div className="fh-content">
            {title && <h1>{title}</h1>}
            {subtitle && <p>{subtitle}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
