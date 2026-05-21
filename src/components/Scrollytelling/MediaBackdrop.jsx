import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function MediaBackdrop({ currentMediaUrl, mediaType = 'image' }) {
  const containerRef = useRef(null);
  const mediaRef = useRef(null);

  // Crossfade animation when media changes
  useGSAP(() => {
    if (mediaRef.current) {
      gsap.fromTo(mediaRef.current, 
        { opacity: 0 }, 
        { opacity: 0.3, duration: 1.5, ease: "power2.inOut" } // Keep opacity low so geometry pops
      );
    }
  }, { dependencies: [currentMediaUrl], scope: containerRef });

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-[var(--bg-primary)]"
      style={{ transition: 'background-color 0.5s ease' }}
    >
      {/* 
        This is a placeholder for the cinematic media layer.
        We will use a mix-blend-mode or low opacity so the high-contrast
        plotter lines stand out clearly on top.
      */}
      {currentMediaUrl ? (
        mediaType === 'video' ? (
          <video 
            ref={mediaRef}
            src={currentMediaUrl} 
            className="w-full h-full object-cover mix-blend-overlay"
            autoPlay 
            loop 
            muted 
            playsInline
          />
        ) : (
          <img 
            ref={mediaRef}
            src={currentMediaUrl} 
            alt="Cinematic Backdrop"
            className="w-full h-full object-cover mix-blend-overlay"
          />
        )
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black opacity-50 mix-blend-multiply" />
      )}
      
      {/* Subtle vignette/gradient overlay to ensure text legibility at edges */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[var(--bg-primary)] opacity-60 pointer-events-none" />
    </div>
  );
}
