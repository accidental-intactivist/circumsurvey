import posthog from 'posthog-js';

// Extremely strict PII scrubber regexes
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

/**
 * Scrubs a string or JSON object recursively of any PII.
 */
export function scrubPII(data) {
  if (typeof data === 'string') {
    return data
      .replace(EMAIL_REGEX, '[REDACTED_EMAIL]')
      .replace(IP_REGEX, '[REDACTED_IP]');
  }

  if (Array.isArray(data)) {
    return data.map(item => scrubPII(item));
  }

  if (typeof data === 'object' && data !== null) {
    const scrubbed = {};
    for (const [key, value] of Object.entries(data)) {
      // Never log passwords, tokens, or explicitly named PII keys
      if (['password', 'token', 'email', 'name', 'phone'].includes(key.toLowerCase())) {
        scrubbed[key] = '[REDACTED]';
      } else {
        scrubbed[key] = scrubPII(value);
      }
    }
    return scrubbed;
  }

  return data;
}

/**
 * Initialize PostHog with session recording enabled.
 */
export function initTelemetry() {
  if (typeof window === 'undefined') return;
  if (posthog.__loaded) return;

  const key = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN || import.meta.env.VITE_POSTHOG_KEY;
  if (key) {
    posthog.init(key, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://t.circumsurvey.online',
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
        recordCanvas: false,
      },
      person_profiles: 'identified_only',
      persistence: 'localStorage+cookie',
      autocapture: true,
      loaded: (ph) => {
        if (ph && typeof ph.startSessionRecording === 'function') {
          ph.startSessionRecording();
        }
      }
    });
  }
}

/**
 * Capture an event, heavily scrubbed.
 */
export function captureEvent(eventName, properties = {}) {
  try {
    const safeEvent = scrubPII(eventName);
    const safeProps = scrubPII(properties);
    posthog.capture(safeEvent, safeProps);
  } catch (err) {
    console.error("Telemetry error", err);
  }
}
