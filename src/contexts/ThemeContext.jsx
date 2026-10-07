import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('cs_theme_name') || 'standard'; } catch { return 'standard'; }
  });

  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem('cs_theme_mode');
      if (saved) return saved;
      return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch { return 'dark'; }
  });

  const [typeface, setTypeface] = useState(() => {
    try { return localStorage.getItem('cs_theme_typeface') || 'bureau'; } catch { return 'bureau'; }
  });

  const [typeScale, setTypeScale] = useState(() => {
    try { return localStorage.getItem('cs_theme_scale') || 'standard'; } catch { return 'standard'; }
  });

  const [colorblind, setColorblind] = useState(() => {
    try { return localStorage.getItem('cs_theme_colorblind') === 'true'; } catch { return false; }
  });

  const [dyslexicFont, setDyslexicFont] = useState(() => {
    try { return localStorage.getItem('cs_theme_dyslexic') === 'true'; } catch { return false; }
  });

  // Apply attributes & font size scaling to <html> root in an effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', theme || 'standard');
      root.setAttribute('data-typeface', typeface || 'bureau');
      root.setAttribute('data-mode', mode || 'dark');
      root.setAttribute('data-colorblind', String(!!colorblind));
      root.setAttribute('data-dyslexic', String(!!dyslexicFont));

      let scaleMultiplier = 1;
      if (typeScale === 'large') scaleMultiplier = 1.15;
      if (typeScale === 'xlarge') scaleMultiplier = 1.3;
      root.style.fontSize = `${scaleMultiplier * 100}%`;
    }
  }, [theme, typeface, mode, colorblind, dyslexicFont, typeScale]);

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cs_theme_name', theme || 'standard');
      localStorage.setItem('cs_theme_typeface', typeface || 'bureau');
      localStorage.setItem('cs_theme_mode', mode || 'dark');
      localStorage.setItem('cs_theme_colorblind', String(!!colorblind));
      localStorage.setItem('cs_theme_dyslexic', String(!!dyslexicFont));
      localStorage.setItem('cs_theme_scale', typeScale || 'standard');
    } catch {}
  }, [theme, typeface, mode, colorblind, dyslexicFont, typeScale]);

  const toggleMode = () => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{
      theme, setTheme,
      unlockedThemes: [],
      typeface, setTypeface,
      mode, setMode, toggleMode,
      colorblind, setColorblind,
      dyslexicFont, setDyslexicFont,
      typeScale, setTypeScale
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: 'standard', mode: 'dark' };
  return ctx;
}
