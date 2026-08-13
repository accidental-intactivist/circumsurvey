import React from 'react';
import { C, FONT } from '../explore/styles/tokens';
import GlobalFooter from '../explore/components/GlobalFooter';

export default function NotFoundPage() {
  return (
    <div style={{
      background: 'var(--c-bg)',
      minHeight: '100dvh',
      color: 'var(--c-text)',
      fontFamily: "var(--f-body, 'Barlow', sans-serif)",
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "4rem 1.6rem",
        textAlign: "center"
      }}>
        <div style={{
          fontFamily: FONT.mono,
          fontSize: "clamp(4rem, 10vw, 8rem)",
          fontWeight: 700,
          color: C.dim,
          opacity: 0.3,
          lineHeight: 1,
          marginBottom: "1rem"
        }}>
          404
        </div>
        
        <h1 style={{ 
          fontFamily: FONT.display, 
          fontSize: "clamp(2rem, 5vw, 3rem)", 
          color: C.textBright, 
          lineHeight: 1.1, 
          marginBottom: "1.5rem" 
        }}>
          Page Not Found
        </h1>
        
        <p style={{ 
          fontSize: "1.1rem", 
          color: C.muted, 
          maxWidth: 500, 
          lineHeight: 1.6, 
          marginBottom: "3rem" 
        }}>
          The exhibit or page you are looking for does not exist or has been moved.
        </p>

        <a href="/" style={{
          background: C.goldBright,
          color: C.bg,
          padding: "0.8rem 2rem",
          borderRadius: 4,
          fontFamily: FONT.condensed,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          textDecoration: "none",
          transition: "transform 0.2s"
        }}
        onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
        >
          Return to the Special Report
        </a>
      </div>
      
      <GlobalFooter route="404" navigate={(route) => window.location.href = `/${route}`} />
    </div>
  );
}
