// Polyfills for TC39 proposals required by pdfjs-dist 6.x in browsers < Chrome 130
if (typeof Uint8Array !== 'undefined') {
  if (!Uint8Array.prototype.toHex) {
    Uint8Array.prototype.toHex = function() {
      return Array.from(this).map(b => b.toString(16).padStart(2, '0')).join('');
    };
  }
  if (!Uint8Array.fromHex) {
    Uint8Array.fromHex = function(hex) {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
      }
      return bytes;
    };
  }
}
if (typeof Map !== 'undefined') {
  if (!Map.prototype.getOrInsertComputed) {
    Map.prototype.getOrInsertComputed = function(key, callback) {
      if (this.has(key)) return this.get(key);
      const val = callback(key);
      this.set(key, val);
      return val;
    };
  }
  if (!Map.prototype.getOrInsert) {
    Map.prototype.getOrInsert = function(key, defaultValue) {
      if (this.has(key)) return this.get(key);
      this.set(key, defaultValue);
      return defaultValue;
    };
  }
}
if (typeof Promise !== 'undefined' && !Promise.withResolvers) {
  Promise.withResolvers = function() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { PostHogProvider } from 'posthog-js/react'

const rawKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const PUBLISHABLE_KEY = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'pk_test_c3R1bm5pbmctbWFjYXF1ZS0zNS5jbGVyay5hY2NvdW50cy5kZXYk'
  : rawKey;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://t.circumsurvey.online'

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const posthogOptions = {
  api_host: POSTHOG_HOST,
  disable_session_recording: false,
  session_recording: {
    maskAllInputs: false,
    maskInputOptions: {
      password: true,
      email: true,
      tel: true,
      text: false, // Allows search terms and non-sensitive inputs to remain visible
    },
    maskTextSelector: '', // Clears blanket text masking so content/UI is visible
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
  capture_pageview: true,
  capture_pageleave: true,
  loaded: (posthogInstance) => {
    if (posthogInstance && typeof posthogInstance.startSessionRecording === 'function') {
      posthogInstance.startSessionRecording();
    }
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider apiKey={POSTHOG_KEY} options={posthogOptions}>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        localization={{
          signIn: {
            start: {
              title: "Access Archive Administration",
              subtitle: "Authorized personnel only.",
            },
            emailAddress__placeholder: "admin@example.com"
          }
        }}
        appearance={{
          layout: {
            socialButtonsVariant: 'iconButton',
            logoImageUrl: '/favicon.png',
          },
          variables: {
            colorPrimary: 'var(--c-blue)',
            colorBackground: 'var(--c-bgCard)',
            colorText: 'var(--c-textBright)',
            colorDanger: 'var(--c-red)',
            fontFamily: 'var(--f-body)',
            borderRadius: '8px',
          }
        }}
      >
        <App />
      </ClerkProvider>
    </PostHogProvider>
  </StrictMode>,
)
