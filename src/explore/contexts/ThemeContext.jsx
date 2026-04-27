import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cs_theme_mode');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });
  
  const [palette, setPalette] = useState(() => {
    return localStorage.getItem('cs_theme_palette') || 'standard';
  });
  
  const [typeScale, setTypeScale] = useState(() => {
    return localStorage.getItem('cs_theme_scale') || 'standard';
  });

  // Apply attributes to the root <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);
    root.setAttribute('data-palette', palette);
    
    // Manage CSS multiplier for typography scale
    let scaleMultiplier = 1;
    if (typeScale === 'large') scaleMultiplier = 1.15;
    if (typeScale === 'xlarge') scaleMultiplier = 1.3;
    
    // We could apply this to a CSS variable if we converted FONT sizes to calc(),
    // but the easiest robust way is just setting the root font-size percentage.
    // 100% is 16px by default. 
    root.style.fontSize = `${scaleMultiplier * 100}%`;

    localStorage.setItem('cs_theme_mode', mode);
    localStorage.setItem('cs_theme_palette', palette);
    localStorage.setItem('cs_theme_scale', typeScale);
  }, [mode, palette, typeScale]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, palette, setPalette, typeScale, setTypeScale }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
