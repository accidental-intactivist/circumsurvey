import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('cs_theme_name') || 'standard';
    } catch {
      return 'standard';
    }
  });

  const [unlockedThemes, setUnlockedThemes] = useState(() => {
    try {
      const saved = localStorage.getItem('cs_unlocked_themes');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const unlockTheme = (themeName) => {
    setUnlockedThemes(prev => {
      const currentList = Array.isArray(prev) ? prev : [];
      if (!currentList.includes(themeName)) {
        const next = [...currentList, themeName];
        try {
          localStorage.setItem('cs_unlocked_themes', JSON.stringify(next));
        } catch {}
        return next;
      }
      return currentList;
    });
  };

  const [typeface, setTypeface] = useState(() => {
    try {
      return localStorage.getItem('cs_theme_typeface') || 'tomorrow';
    } catch {
      return 'tomorrow';
    }
  });

  const [mode, setMode] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('cs_theme_mode');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
    } catch {}
    return 'dark';
  });
  
  const [colorblind, setColorblind] = useState(() => {
    try {
      return localStorage.getItem('cs_theme_colorblind') === 'true';
    } catch {
      return false;
    }
  });

  const [dyslexicFont, setDyslexicFont] = useState(() => {
    try {
      return localStorage.getItem('cs_theme_dyslexic') === 'true';
    } catch {
      return false;
    }
  });
  
  const [typeScale, setTypeScale] = useState(() => {
    try {
      return localStorage.getItem('cs_theme_scale') || 'standard';
    } catch {
      return 'standard';
    }
  });

  // Apply attributes to the root <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme || 'standard');
    root.setAttribute('data-typeface', typeface || 'tomorrow');
    root.setAttribute('data-mode', mode || 'dark');
    root.setAttribute('data-colorblind', String(!!colorblind));
    root.setAttribute('data-dyslexic', String(!!dyslexicFont));
    
    // Manage CSS multiplier for typography scale
    let scaleMultiplier = 1;
    if (typeScale === 'large') scaleMultiplier = 1.15;
    if (typeScale === 'xlarge') scaleMultiplier = 1.3;
    
    // We could apply this to a CSS variable if we converted FONT sizes to calc(),
    // but the easiest robust way is just setting the root font-size percentage.
    // 100% is 16px by default. 
    root.style.fontSize = `${scaleMultiplier * 100}%`;

    try {
      localStorage.setItem('cs_theme_name', theme || 'standard');
      localStorage.setItem('cs_theme_typeface', typeface || 'tomorrow');
      localStorage.setItem('cs_theme_mode', mode || 'dark');
      localStorage.setItem('cs_theme_colorblind', String(!!colorblind));
      localStorage.setItem('cs_theme_dyslexic', String(!!dyslexicFont));
      localStorage.setItem('cs_theme_scale', typeScale || 'standard');
    } catch {}
  }, [theme, typeface, mode, colorblind, dyslexicFont, typeScale]);

  return (
    <ThemeContext.Provider value={{ 
      theme, setTheme, 
      unlockedThemes, unlockTheme,
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
