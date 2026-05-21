import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function LottieScrollAnimation({ 
  animationData, 
  triggerSelector, 
  start = "top center", 
  end = "bottom center",
  className = ""
}) {
  const containerRef = useRef(null);
  const lottieObj = useRef(null);
  const playhead = useRef({ frame: 0 });

  useEffect(() => {
    if (!containerRef.current || !animationData) return;

    lottieObj.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: animationData,
    });

    return () => {
      if (lottieObj.current) {
        lottieObj.current.destroy();
      }
    };
  }, [animationData]);

  useGSAP(() => {
    if (!lottieObj.current || !triggerSelector) return;

    // Wait for DOM and Lottie to be ready
    const totalFrames = lottieObj.current.totalFrames - 1;
    
    gsap.to(playhead.current, {
      frame: totalFrames,
      ease: "none",
      scrollTrigger: {
        trigger: triggerSelector,
        start: start,
        end: end,
        scrub: 1, // Smooth scrubbing
        onUpdate: () => {
          if (lottieObj.current) {
            lottieObj.current.goToAndStop(Math.round(playhead.current.frame), true);
          }
        }
      }
    });

  }, { dependencies: [animationData, triggerSelector] });

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`} />
  );
}
