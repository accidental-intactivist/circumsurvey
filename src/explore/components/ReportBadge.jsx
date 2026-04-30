import React from "react";
import { useReport } from "../contexts/ReportContext";
import { C, FONT } from "../styles/tokens";

export default function ReportBadge() {
  const { reportItems } = useReport();
  
  if (reportItems.length === 0) return null;

  return (
    <a
      href="#/report"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        padding: "0.6rem 1.2rem",
        background: C.gold,
        color: "#000",
        borderRadius: 999,
        fontFamily: FONT.condensed,
        fontSize: "0.85rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        textDecoration: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "transform 0.2s, background 0.2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.background = C.goldBright;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = C.gold;
      }}
    >
      <span>📋 Report</span>
      <span style={{
        background: "#000",
        color: C.goldBright,
        padding: "0.1rem 0.4rem",
        borderRadius: 999,
        fontSize: "0.75rem",
      }}>
        {reportItems.length}
      </span>
    </a>
  );
}
