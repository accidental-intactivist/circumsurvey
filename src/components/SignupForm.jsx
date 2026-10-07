import React, { useState } from 'react';
import { C, FONT } from '../styles/tokens';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div style={{ 
        padding: '2rem', 
        background: C.goldGlow, 
        border: `1px solid ${C.goldBright}`,
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(212, 160, 48, 0.15)'
      }}>
        <h3 style={{ 
          fontFamily: FONT.display, 
          color: C.goldBright, 
          marginBottom: '0.5rem', 
          fontSize: '1.4rem' 
        }}>
          You're Subscribed.
        </h3>
        <p style={{ fontFamily: FONT.body, color: C.textBright, margin: 0, fontSize: '0.95rem' }}>
          Thank you for subscribing to our updates and research releases.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.2rem',
      padding: '2rem',
      background: 'rgba(19, 22, 26, 0.75)',
      backdropFilter: 'blur(12px)',
      border: `1px solid ${C.border}`,
      borderRadius: '12px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
    }}>
      <div>
        <label htmlFor="email" style={{ 
          display: 'block', 
          color: C.goldBright, 
          marginBottom: '0.6rem', 
          fontFamily: FONT.condensed,
          fontWeight: 700,
          fontSize: '0.85rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          Subscribe for Updates
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            style={{
              flex: 1,
              minWidth: '220px',
              padding: '0.85rem 1rem',
              background: 'rgba(13, 15, 18, 0.8)',
              border: `1px solid ${C.ghost}`,
              borderRadius: '6px',
              color: C.textBright,
              outline: 'none',
              fontFamily: FONT.body,
              fontSize: '0.95rem',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = C.gold}
            onBlur={(e) => e.target.style.borderColor = C.ghost}
          />
          <button 
            type="submit"
            style={{
              padding: '0.85rem 1.75rem',
              background: C.goldBright,
              color: C.bg,
              border: 'none',
              borderRadius: '6px',
              fontFamily: FONT.condensed,
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(212,160,48,0.3)',
              transition: 'transform 0.2s, background-color 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.background = '#f7d063';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = C.goldBright;
            }}
          >
            Request Access
          </button>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '0.8rem', color: C.muted, fontFamily: FONT.body }}>
        Strict privacy guaranteed. We only send research releases and platform announcements.
      </p>
    </form>
  );
}
