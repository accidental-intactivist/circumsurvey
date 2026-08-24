import { useCallback } from 'react';
import posthog from 'posthog-js';

let isInitialized = false;

// Determine if we should mock telemetry (e.g. local dev without an API key)
const MOCK_TELEMETRY = !import.meta.env.VITE_POSTHOG_KEY;

export function initTelemetry() {
  if (isInitialized) return;

  if (MOCK_TELEMETRY) {
    console.log('[Telemetry] Initialized in mock mode (no VITE_POSTHOG_KEY provided). Events will be logged to console.');
  } else {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'always', // or 'identified_only'
      capture_pageview: false, // We'll handle this manually via React Router
      autocapture: false, // Opt-out of generic autocapture to respect privacy
      disable_session_recording: true, // Disable to save payload/execution time on mobile
      disable_surveys: true, // Disable to save payload/execution time
      session_recording: {
        recordCanvas: false // Prevents rrweb willReadFrequently warnings
      }
    });
  }
  isInitialized = true;
}

export function useTelemetry() {
  const trackEvent = useCallback((eventName, properties = {}) => {
    if (!isInitialized) initTelemetry();

    if (MOCK_TELEMETRY) {
      console.log(`[Telemetry Event] ${eventName}`, properties);
    } else {
      posthog.capture(eventName, properties);
    }
  }, []);

  const trackPageview = useCallback((url) => {
    if (!isInitialized) initTelemetry();
    
    const utmParams = {};
    try {
      const parsedUrl = new URL(url);
      const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      utms.forEach(utm => {
        const val = parsedUrl.searchParams.get(utm);
        if (val) {
          utmParams[`$${utm}`] = val;
        }
      });
    } catch(e) {}

    const properties = { 
      $current_url: url, 
      ...utmParams,
      ...(Object.keys(utmParams).length > 0 ? { $set_once: utmParams } : {})
    };

    if (MOCK_TELEMETRY) {
      console.log(`[Telemetry Pageview] ${url}`, properties);
    } else {
      posthog.capture('$pageview', properties);
    }
  }, []);

  const identifyUser = useCallback((distinctId, properties = {}) => {
    if (!isInitialized) initTelemetry();

    if (MOCK_TELEMETRY) {
      console.log(`[Telemetry Identify] ${distinctId}`, properties);
    } else {
      posthog.identify(distinctId, properties);
    }
  }, []);

  return { trackEvent, trackPageview, identifyUser };
}
