import React from 'react';

/**
 * A Consumer Reports-style Harvey Ball for 5-point ordinal scales.
 *
 * @param {number} score 1 (empty) to 5 (extra special / dot in middle)
 * @param {string} color CSS color for the filled areas
 * @param {number|string} size Width/Height of the SVG
 */
export default function HarveyBall({ score, color = 'currentColor', size = '1.2em', style = {}, ...props }) {
  const s = Math.round(score);

  // Common SVG shell
  const renderSvg = (paths) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      {...props}
    >
      {/* Outer circle stroke (always present) */}
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      {paths}
    </svg>
  );

  switch(s) {
    case 5:
      // Extra Special: Dot in the middle
      return renderSvg(
        <circle cx="12" cy="12" r="5" fill={color} />
      );
    case 4:
      // Full: Solid fill
      return renderSvg(
        <circle cx="12" cy="12" r="10" fill={color} />
      );
    case 3:
      // Half Full: Left half filled
      // Sweep=0 draws the arc counter-clockwise from top (12,2) to bottom (12,22)
      return renderSvg(
        <path d="M12,2 A10,10 0 0,0 12,22 Z" fill={color} />
      );
    case 2:
      // Quarter / Fair: Bottom half filled
      // Sweep=0 draws counter-clockwise from left (2,12) to right (22,12)
      return renderSvg(
        <path d="M2,12 A10,10 0 0,0 22,12 Z" fill={color} />
      );
    case 1:
      // Empty
    default:
      return renderSvg(null);
  }
}
