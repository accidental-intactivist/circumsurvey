import React from "react";
import { useReport } from "../contexts/ReportContext";
import { C, FONT } from "../styles/tokens";

export default function AddToReportButton({ questionId, iconOnly }) {
  const { reportItems, toggleInReport } = useReport();
  const isInReport = reportItems.includes(questionId);

  if (iconOnly) {
    return (
      <button
        onClick={() => toggleInReport(questionId)}
        title={isInReport ? "Remove from Custom Report" : "Add to Custom Report"}
        style={{
          background: isInReport ? "rgba(212,160,48,0.15)" : "transparent",
          border: `1px solid ${isInReport ? C.gold : C.ghost}`,
          color: isInReport ? C.goldBright : C.muted,
          fontFamily: FONT.condensed,
          fontSize: "0.6rem",
          fontWeight: 600,
          padding: "0.15rem 0.4rem",
          borderRadius: 4,
          cursor: "pointer",
          transition: "all 0.15s",
          display: "flex",
          alignItems: "center",
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          if (!isInReport) {
            e.target.style.color = C.goldBright;
            e.target.style.borderColor = C.gold;
          }
        }}
        onMouseLeave={(e) => {
          if (!isInReport) {
            e.target.style.color = C.muted;
            e.target.style.borderColor = C.ghost;
          }
        }}
      >
        {isInReport ? "✓" : "+"}
      </button>
    );
  }

  return (
    <button
      onClick={() => toggleInReport(questionId)}
      title={isInReport ? "Remove from Custom Report" : "Add to Custom Report"}
      style={{
        background: isInReport ? "rgba(212,160,48,0.15)" : "transparent",
        border: `1px solid ${isInReport ? C.gold : C.ghost}`,
        color: isInReport ? C.goldBright : C.muted,
        fontFamily: FONT.condensed,
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "0.4rem 0.8rem",
        borderRadius: 4,
        cursor: "pointer",
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
      }}
      onMouseEnter={(e) => {
        if (!isInReport) {
          e.target.style.color = C.goldBright;
          e.target.style.borderColor = C.gold;
        }
      }}
      onMouseLeave={(e) => {
        if (!isInReport) {
          e.target.style.color = C.muted;
          e.target.style.borderColor = C.ghost;
        }
      }}
    >
      {isInReport ? "✓ IN REPORT" : "+ ADD TO REPORT"}
    </button>
  );
}
