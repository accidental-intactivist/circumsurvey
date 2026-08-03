import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useTelemetry } from '../lib/telemetry';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { trackEvent } = useTelemetry();
  const trackedSettings = useRef(new Set());

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
        trackEvent('theme_unlocked', { theme: themeName });
        return next;
      }
      return currentList;
    });
  };

  const [typeface, setTypeface] = useState(() => {
    try {
      let saved = localStorage.getItem('cs_theme_typeface');
      if (!saved) {
        // A/B Test assignment for new users
        saved = Math.random() > 0.5 ? 'tomorrow' : 'standard';
        localStorage.setItem('cs_theme_typeface', saved);
        // We defer trackEvent to a useEffect since we can't call it securely in the initializer
        window.__cs_ab_test_assignment = saved;
      }
      return saved;
    } catch {
      return 'tomorrow';
    }
  });

  useEffect(() => {
    if (window.__cs_ab_test_assignment) {
      trackEvent('ab_test_assigned', { test_name: 'font_choice', variant: window.__cs_ab_test_assignment });
      delete window.__cs_ab_test_assignment;
    }
  }, [trackEvent]);

  const [mode, setMode] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('cs_theme_mode');
        if (saved) return saved;
        return 'system';
      }
    } catch {}
    return 'system';
  });

  const [systemPreference, setSystemPreference] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e) => setSystemPreference(e.matches ? 'light' : 'dark');
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler); // fallback
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);
  
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

  // Track manual setting changes (but don't spam on initial mount)
  useEffect(() => {
    const trackSetting = (key, value) => {
      const stateKey = `${key}:${value}`;
      if (!trackedSettings.current.has(stateKey)) {
        trackedSettings.current.add(stateKey);
        // Only track if we already have some settings tracked (meaning it's not the first mount)
        if (trackedSettings.current.size > 6) {
          trackEvent('setting_changed', { setting: key, new_value: value });
        }
      }
    };
    trackSetting('theme', theme);
    trackSetting('typeface', typeface);
    trackSetting('mode', mode);
    trackSetting('colorblind', colorblind);
    trackSetting('dyslexic', dyslexicFont);
    trackSetting('scale', typeScale);
  }, [theme, typeface, mode, colorblind, dyslexicFont, typeScale, trackEvent]);

  // Synchronously apply attributes to the root <html> element during render
  if (typeof window !== 'undefined') {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme || 'standard');
    root.setAttribute('data-typeface', typeface || 'tomorrow');
    const actualMode = mode === 'system' ? systemPreference : (mode || 'dark');
    root.setAttribute('data-mode', actualMode);
    root.setAttribute('data-colorblind', String(!!colorblind));
    root.setAttribute('data-dyslexic', String(!!dyslexicFont));
    
    let scaleMultiplier = 1;
    if (typeScale === 'large') scaleMultiplier = 1.15;
    if (typeScale === 'xlarge') scaleMultiplier = 1.3;
    root.style.fontSize = `${scaleMultiplier * 100}%`;
  }

  useEffect(() => {
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
