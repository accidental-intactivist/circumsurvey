import { useCallback } from 'react';
import posthog from 'posthog-js';

let isInitialized = false;

// Determine if we should mock telemetry (e.g. local dev without an API key)
const MOCK_TELEMETRY = !import.meta.env.VITE_POSTHOG_KEY;

export function initTelemetry() {
  if (isInitialized || (typeof posthog !== 'undefined' && posthog.__loaded)) {
    isInitialized = true;
    return;
  }

  const key = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN || import.meta.env.VITE_POSTHOG_KEY;

  if (!key) {
    console.log('[Telemetry] Initialized in mock mode (no key provided). Events will be logged to console.');
  } else {
    posthog.init(key, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://t.circumsurvey.online',
      person_profiles: 'identified_only',
      capture_pageview: true,
      autocapture: true,
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
          email: true,
          tel: true,
          text: false,
        },
        maskTextSelector: '',
        maskTextFn: (text) => {
          if (!text || typeof text !== 'string') return text;
          const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          const PHONE_REGEX = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
          const IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
          if (EMAIL_REGEX.test(text) || PHONE_REGEX.test(text) || IP_REGEX.test(text)) {
            return text
              .replace(EMAIL_REGEX, '***@***.***')
              .replace(PHONE_REGEX, '***-***-****')
              .replace(IP_REGEX, '***.***.***.***');
          }
          return text;
        },
        maskInputFn: (text, element) => {
          if (!text || typeof text !== 'string') return text;
          if (element?.type === 'password' || element?.type === 'email' || element?.name === 'email') {
            return '********';
          }
          const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          if (EMAIL_REGEX.test(text)) {
            return text.replace(EMAIL_REGEX, '***@***.***');
          }
          return text;
        },
        recordCanvas: false
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

  const getFeatureFlag = useCallback((flagName, defaultValue = false) => {
    if (!isInitialized) initTelemetry();
    
    if (MOCK_TELEMETRY) {
      console.log(`[Telemetry Feature Flag Check] ${flagName} (returning defaultValue: ${defaultValue})`);
      return defaultValue;
    }
    
    // Feature flags might not be loaded immediately, so we just return current state
    return posthog.getFeatureFlag(flagName) ?? defaultValue;
  }, []);

  return { trackEvent, trackPageview, identifyUser, getFeatureFlag };
}
