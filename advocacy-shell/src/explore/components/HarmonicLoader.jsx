import React from "react";
import HarmonicCanvas from "../../components/HarmonicCanvas";
import { C, FONT } from "../styles/tokens";

export default function HarmonicLoader({ text = "Processing..." }) {
  return (
    <div style={{
      width: "100%",
      minHeight: 250,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      padding: "2rem",
    }}>
      {/* 
        The Harmonic Canvas is absolutely positioned by default. 
        We contain it in a small box to act as a localized loading spinner.
      */}
      <div style={{
        width: 140,
        height: 80,
        position: "relative",
        marginBottom: "1.5rem",
        opacity: 0.7,
        overflow: "hidden",
        borderRadius: 8,
        // The WEDway / Imagineering aesthetic: a dark screen with elegant geometric line art
        background: "rgba(0, 0, 0, 0.2)",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
        border: `1px solid ${C.ghost}`,
      }}>
        <HarmonicCanvas themeKey="loader" opacity={1} />
      </div>

      <div style={{
        fontFamily: FONT.mono,
        fontSize: "0.75rem",
        color: C.gold,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem"
      }}>
        <span style={{
          display: "inline-block",
          width: 8,
          height: 8,
          background: C.goldBright,
          borderRadius: "50%",
          animation: "pulse 1.5s infinite"
        }} />
        {text}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0.3; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
