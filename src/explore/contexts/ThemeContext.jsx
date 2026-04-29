import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cs_theme_name') || 'standard';
  });

  const [typeface, setTypeface] = useState(() => {
    return localStorage.getItem('cs_theme_typeface') || 'tomorrow';
  });

  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cs_theme_mode');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });
  
  const [colorblind, setColorblind] = useState(() => {
    return localStorage.getItem('cs_theme_colorblind') === 'true';
  });

  const [dyslexicFont, setDyslexicFont] = useState(() => {
    return localStorage.getItem('cs_theme_dyslexic') === 'true';
  });
  
  const [typeScale, setTypeScale] = useState(() => {
    return localStorage.getItem('cs_theme_scale') || 'standard';
  });

  // Apply attributes to the root <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-typeface', typeface);
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-colorblind', colorblind.toString());
    root.setAttribute('data-dyslexic', dyslexicFont.toString());
    
    // Manage CSS multiplier for typography scale
    let scaleMultiplier = 1;
    if (typeScale === 'large') scaleMultiplier = 1.15;
    if (typeScale === 'xlarge') scaleMultiplier = 1.3;
    
    // We could apply this to a CSS variable if we converted FONT sizes to calc(),
    // but the easiest robust way is just setting the root font-size percentage.
    // 100% is 16px by default. 
    root.style.fontSize = `${scaleMultiplier * 100}%`;

    localStorage.setItem('cs_theme_name', theme);
    localStorage.setItem('cs_theme_typeface', typeface);
    localStorage.setItem('cs_theme_mode', mode);
    localStorage.setItem('cs_theme_colorblind', colorblind.toString());
    localStorage.setItem('cs_theme_dyslexic', dyslexicFont.toString());
    localStorage.setItem('cs_theme_scale', typeScale);
  }, [theme, typeface, mode, colorblind, dyslexicFont, typeScale]);

  return (
    <ThemeContext.Provider value={{ 
      theme, setTheme, 
      typeface, setTypeface,
      mode, setMode, 
      colorblind, setColorblind, 
      dyslexicFont, setDyslexicFont,
      typeScale, setTypeScale 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
