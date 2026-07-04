import { useState } from "react";
import { C, FONT } from "../styles/tokens";
import CopilotChat from "./CopilotChat";
import { Sparkles, X } from "./Icons";

export default function GlobalDocentDrawer({ isOpen, onClose, routerState, updateState, exhibitContext }) {
  const [showInfo, setShowInfo] = useState(false);

  // Stay mounted even when closed (slide off-screen) so the conversation
  // persists across open/close and page navigation instead of being wiped.
  return (
    <>
      {/* Slide-out Drawer */}
      <div aria-hidden={!isOpen} style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        maxWidth: 480,
        backgroundColor: C.bgDeep,
        borderLeft: `1px solid ${C.ghost}`,
        boxShadow: "-10px 0 40px rgba(0,0,0,0.5)",
        zIndex: 10001,
        display: "flex",
        flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        pointerEvents: isOpen ? "auto" : "none",
      }}>
        
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1.5rem",
          borderBottom: `1px solid ${C.ghost}`,
          backgroundColor: C.bgCard,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", position: "relative" }}>
            <Sparkles size={18} color={C.goldBright} />
            <span style={{
              fontFamily: FONT.condensed,
              fontSize: "1.1rem",
              fontWeight: 700,
              color: C.goldBright,
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            }}>
              Research Assistant
            </span>

            {/* Info button */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              onBlur={() => setTimeout(() => setShowInfo(false), 200)}
              aria-label="About the Research Assistant"
              style={{
                background: "transparent",
                border: `1px solid ${showInfo ? C.gold : C.ghost}`,
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: showInfo ? C.goldBright : C.dim,
                transition: "all 0.2s ease",
                padding: 0,
                marginLeft: "0.25rem",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.goldBright; e.currentTarget.style.borderColor = C.gold; }}
              onMouseLeave={(e) => { if (!showInfo) { e.currentTarget.style.color = C.dim; e.currentTarget.style.borderColor = C.ghost; } }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>

            {/* Info tooltip */}
            {showInfo && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 0.75rem)",
                left: 0,
                right: "-4rem",
                background: C.bgCard,
                border: `1px solid ${C.gold}40`,
                borderRadius: 10,
                padding: "1rem 1.25rem",
                zIndex: 10,
                boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 15px rgba(255,200,50,0.05)`,
              }}>
                {/* Arrow */}
                <div style={{
                  position: "absolute",
                  top: -6,
                  left: 80,
                  width: 12,
                  height: 12,
                  background: C.bgCard,
                  border: `1px solid ${C.gold}40`,
                  borderRight: "none",
                  borderBottom: "none",
                  transform: "rotate(45deg)",
                }} />
                <p style={{
                  fontFamily: FONT.body,
                  fontSize: "0.82rem",
                  color: C.text,
                  lineHeight: 1.55,
                  margin: "0 0 0.6rem",
                }}>
                  The Research Assistant uses AI to help you explore the CircumSurvey findings. 
                  Ask questions in natural language and it will synthesize relevant survey responses, 
                  demographic patterns, and project documentation.
                </p>
                <p style={{
                  fontFamily: FONT.body,
                  fontSize: "0.78rem",
                  color: C.dim,
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  Try asking about specific topics, or use the suggested queries to get started. 
                  Responses are generated from real survey data with cited sources.
                </p>
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: C.muted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5rem",
              borderRadius: "50%",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.textBright; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = "transparent"; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem",
          overflow: "hidden"
        }}>
          <CopilotChat 
            routerState={routerState} 
            updateState={updateState} 
            exhibitContext={exhibitContext}
          />
        </div>

      </div>
    </>
  );
}
