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
    maskAllInputs: true, // Safely masks sensitive form inputs
    maskTextSelector: '[data-private], .ph-no-capture', // Leaves readable UI and text intact in replays
    recordCanvas: false, // Prevents canvas/performance overhead
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
