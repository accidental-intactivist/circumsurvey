import { useState, useEffect } from 'react';

export const DEFAULT_CONFIG = {
  exhibitOrder: [], // ordered array of exhibit routes
  featuredExhibits: {}, // key: route, value: { badge: 'Trending' }
  featuredQuestions: [], // array of question ids
};

const LISTENERS = new Set();
let config = null;

export function getActiveNarrativeConfig() {
  if (!config) {
    try {
      const stored = localStorage.getItem('narrative_config');
      config = stored ? JSON.parse(stored) : { ...DEFAULT_CONFIG };
    } catch (e) {
      config = { ...DEFAULT_CONFIG };
    }
  }
  return config;
}

export function updateNarrativeConfig(updates) {
  config = { ...getActiveNarrativeConfig(), ...updates };
  try {
    localStorage.setItem('narrative_config', JSON.stringify(config));
  } catch (e) {}
  LISTENERS.forEach(fn => fn(config));
}

export function subscribeToNarrativeConfig(fn) {
  LISTENERS.add(fn);
  fn(getActiveNarrativeConfig());
  return () => LISTENERS.delete(fn);
}

export function useNarrativeConfig() {
  const [currentConfig, setCurrentConfig] = useState(getActiveNarrativeConfig());

  useEffect(() => {
    return subscribeToNarrativeConfig(setCurrentConfig);
  }, []);

  return { config: currentConfig, updateConfig: updateNarrativeConfig };
}
