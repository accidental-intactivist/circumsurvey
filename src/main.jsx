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
      appearance={{
        variables: {
          colorPrimary: '#245b6c',
          colorBackground: '#fdfbf7',
          colorText: '#333333',
          fontFamily: 'Barlow, sans-serif',
          borderRadius: '8px',
        },
        elements: {
          card: {
            border: '1px solid rgba(212,160,48,0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
          },
          headerTitle: {
            fontFamily: "'Barlow Condensed', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '1.5rem',
            color: '#245b6c',
          },
          headerSubtitle: {
            fontFamily: 'Lora, serif',
            color: '#666666'
          },
          socialButtonsBlockButton: {
            border: '1px solid rgba(36,91,108,0.2)',
            background: 'rgba(36,91,108,0.04)',
            transition: 'all 0.2s',
            '&:hover': {
              background: 'rgba(36,91,108,0.08)',
            }
          },
          formButtonPrimary: {
            fontFamily: "'Barlow Condensed', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 700,
            transition: 'all 0.2s',
            boxShadow: 'none',
            '&:hover': {
              filter: 'brightness(1.1)',
            }
          },
          footer: {
            display: 'none'
          }
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
