import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import 'leaflet/dist/leaflet.css'
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      localization={{
        signIn: {
          start: {
            title: "Access Your Account",
            subtitle: "Save your pathway and return to any exhibit.",
          },
          emailAddress__placeholder: "you@example.com"
        },
        signUp: {
          start: {
            title: "Create Your Account",
            subtitle: "Save your pathway and return to any exhibit.",
          },
          emailAddress__placeholder: "you@example.com"
        },
        formFieldInputPlaceholder__emailAddress: "you@example.com",
        formFieldInputPlaceholder__password: "••••••••••",
        dividerText: "✦"
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
        },
        elements: {
          modalBackdrop: {
            backgroundColor: 'rgba(0, 0, 0, 0.55)'
          },
          card: {
            border: '1px solid var(--c-ghost)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            background: 'var(--c-bgCard)',
            position: 'relative',
            overflow: 'visible' /* to allow footer promise to sit correctly if needed */
          },
          headerTitle: {
            fontFamily: 'var(--f-condensed)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '1.5rem',
            color: 'var(--c-blue)',
            textAlign: 'center',
            width: '100%'
          },
          headerSubtitle: {
            fontFamily: 'var(--f-body)',
            color: 'var(--c-muted)',
            textAlign: 'center',
            width: '100%'
          },
          formFieldLabel: {
            fontFamily: 'var(--f-body)',
            fontWeight: 500,
            color: 'var(--c-textBright)'
          },
          formFieldInput: {
            minHeight: '44px',
            background: 'var(--c-bgSoft)',
            border: '1px solid var(--c-ghost)',
            color: 'var(--c-textBright)'
          },
          formFieldInputFocus: {
            boxShadow: '0 0 0 2px var(--c-blue)',
            borderColor: 'var(--c-blue)'
          },
          socialButtonsIconButton: {
            border: '1px solid var(--c-ghost)',
            background: 'var(--c-bgSoft)',
            transition: 'all 0.2s',
            flexGrow: 1,
            color: 'var(--c-textBright)'
          },
          socialButtonsIconButton__discord: { '&:hover': { background: 'var(--c-ghost)' } },
          socialButtonsIconButton__google: { '&:hover': { background: 'var(--c-ghost)' } },
          socialButtonsIconButton__facebook: { '&:hover': { background: 'var(--c-ghost)' } },
          dividerLine: {
            background: 'var(--c-gold)',
            height: '1px'
          },
          dividerText: {
            color: 'var(--c-goldBright)',
            fontFamily: 'var(--f-condensed)',
            fontSize: '16px'
          },
          formButtonPrimary: {
            minHeight: '44px',
            fontFamily: 'var(--f-condensed)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 700,
            boxShadow: 'none',
            background: 'var(--c-blue)',
            color: 'var(--c-bgCard)',
            transition: 'all 0.2s',
            '&:hover': {
              filter: 'brightness(1.1)',
            }
          },
          footerActionLink: {
            color: 'var(--c-gold)',
            fontWeight: 500
          },
          identityPreviewEditButton: {
            color: 'var(--c-gold)'
          },
          footer: {
            background: 'transparent'
          }
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
