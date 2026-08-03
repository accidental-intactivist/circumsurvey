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
    });
  }
  isInitialized = true;
}

export function useTelemetry() {
  const trackEvent = (eventName, properties = {}) => {
    if (!isInitialized) initTelemetry();

    if (MOCK_TELEMETRY) {
      console.log(`[Telemetry Event] ${eventName}`, properties);
    } else {
      posthog.capture(eventName, properties);
    }
  };

  const trackPageview = (url) => {
    if (!isInitialized) initTelemetry();
    
    if (MOCK_TELEMETRY) {
      console.log(`[Telemetry Pageview] ${url}`);
    } else {
      posthog.capture('$pageview', { $current_url: url });
    }
  };

  const identifyUser = (distinctId, properties = {}) => {
    if (!isInitialized) initTelemetry();

    if (MOCK_TELEMETRY) {
      console.log(`[Telemetry Identify] ${distinctId}`, properties);
    } else {
      posthog.identify(distinctId, properties);
    }
  };

  return { trackEvent, trackPageview, identifyUser };
}
