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
    maskTextSelector: "*", // Optional: replace with specific classes if you want to mask
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
