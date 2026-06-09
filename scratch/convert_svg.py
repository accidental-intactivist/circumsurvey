import re
import os

input_file = r"D:\Dropbox\Accidental Intactivist\Website\Wireframes\Baby.svg"
output_file = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\src\components\scrollytelling\BabySvg.jsx"

with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract viewBox
viewbox_match = re.search(r'viewBox="([^"]+)"', content)
viewbox = viewbox_match.group(1) if viewbox_match else "0 0 1000 1000"

# Extract paths
paths = re.findall(r'<path[^>]*d="([^"]+)"[^>]*>', content)

# Generate React Component
react_code = """import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const BabySvg = ({ color = '#00FFFF' }) => {
  const svgRef = useRef(null);

  useGSAP(() => {
    const paths = gsap.utils.toArray('path', svgRef.current);
    
    // Custom DrawSVG setup
    paths.forEach(path => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });

    // The Scrollytelling Animation
    gsap.to(paths, {
      strokeDashoffset: 0,
      stagger: {
        amount: 2, // It takes 2 seconds for all paths to begin drawing
        from: "start" 
      },
      ease: 'none',
      scrollTrigger: {
        trigger: svgRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1, // Smooth scrubbing
      }
    });
  }, { scope: svgRef });

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '4rem 0' }}>
      <svg 
        ref={svgRef}
        viewBox=\"""" + viewbox + """\"
        style={{
          width: '100%', 
          height: 'auto', 
          filter: 'url(#phosphor-bloom)',
          overflow: 'visible' // Prevent glows from getting clipped
        }}
      >
        <defs>
          <filter id="phosphor-bloom" x="-50%" y="-50%" width="200%" height="200%">
            <!-- Create a glowing, bleeding effect simulating analog CRT bloom -->
            <feGaussianBlur stdDeviation="2" result="blur1" />
            <feGaussianBlur stdDeviation="5" result="blur2" />
            <feGaussianBlur stdDeviation="15" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <!-- The crisp white hot core line -->
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Render all structural paths with the dynamic theme color */}
        <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
"""

for d in paths:
    react_code += f'          <path d="{d}" />\n'

react_code += """        </g>
      </svg>
    </div>
  );
};

export default BabySvg;
"""

os.makedirs(os.path.dirname(output_file), exist_ok=True)
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(react_code)

print(f"Conversion complete! Extracted {len(paths)} paths.")
