/**
 * colorUtils.js
 * Utilities for WCAG contrast calculation and dynamic color legibility.
 */

// Convert hex to rgb
export function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

// Convert rgb to hex
export function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Get relative luminance (WCAG 2.1)
export function getLuminance(hex) {
  if (!hex || !hex.startsWith('#')) return 0;
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Get contrast ratio between two hex colors
export function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Lighten a hex color by a percentage (0-1)
export function lightenHex(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const newR = Math.min(255, Math.round(r + (255 - r) * percent));
  const newG = Math.min(255, Math.round(g + (255 - g) * percent));
  const newB = Math.min(255, Math.round(b + (255 - b) * percent));
  return rgbToHex({ r: newR, g: newG, b: newB });
}

// Darken a hex color by a percentage (0-1)
export function darkenHex(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const newR = Math.max(0, Math.round(r * (1 - percent)));
  const newG = Math.max(0, Math.round(g * (1 - percent)));
  const newB = Math.max(0, Math.round(b * (1 - percent)));
  return rgbToHex({ r: newR, g: newG, b: newB });
}

/**
 * Ensures a text color is legible against a background color by
 * progressively lightening or darkening it until it meets the target ratio.
 * @param {string} textColor - Hex color for the text
 * @param {string} bgColor - Hex color for the background
 * @param {number} targetRatio - Target WCAG contrast ratio (default 4.5)
 * @returns {string} - The adjusted hex color
 */
export function ensureLegibleHex(textColor, bgColor, targetRatio = 4.5) {
  if (!textColor || !bgColor || !textColor.startsWith('#') || !bgColor.startsWith('#')) return textColor;
  let currentRatio = getContrastRatio(textColor, bgColor);
  if (currentRatio >= targetRatio) return textColor;

  const bgLuminance = getLuminance(bgColor);
  const isDarkBg = bgLuminance < 0.5;
  
  let adjustedColor = textColor;
  let step = 0.1;
  let attempts = 0;

  // Progressively step the color lighter or darker
  while (currentRatio < targetRatio && attempts < 15) {
    adjustedColor = isDarkBg ? lightenHex(adjustedColor, step) : darkenHex(adjustedColor, step);
    currentRatio = getContrastRatio(adjustedColor, bgColor);
    attempts++;
  }
  
  return adjustedColor;
}

/**
 * Helper for React components to resolve CSS variables to hex at runtime.
 */
export function getComputedVar(varString, el = null) {
  if (!varString || typeof window === 'undefined') return null;
  // If it's already a hex, just return it
  if (varString.startsWith('#')) return varString;
  
  const element = el || document.body;
  // Extract just the variable name if it's wrapped in var()
  const match = varString.match(/var\(([^)]+)\)/);
  const varName = match ? match[1] : varString;
  
  if (!varName.startsWith('--')) return null;
  const computed = getComputedStyle(element).getPropertyValue(varName).trim();
  return computed || null;
}

import { useState, useEffect } from 'react';

/**
 * React hook to automatically ensure a CSS variable or hex color
 * is legible against a background color.
 */
export function useLegibleColor(textColorVar, bgColorVar, targetRatio = 4.5) {
  const [safeColor, setSafeColor] = useState(textColorVar);

  useEffect(() => {
    // Need a small timeout to ensure DOM/CSS is fully painted/resolved when switching themes
    const t = setTimeout(() => {
      const textHex = getComputedVar(textColorVar);
      const bgHex = getComputedVar(bgColorVar);
      if (textHex && bgHex) {
        setSafeColor(ensureLegibleHex(textHex, bgHex, targetRatio));
      } else {
        setSafeColor(textColorVar); // fallback to raw var
      }
    }, 10);
    return () => clearTimeout(t);
  }, [textColorVar, bgColorVar, targetRatio]);

  return safeColor;
}
