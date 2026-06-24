import { useEffect } from "react";
import { C, FONT } from "../styles/tokens";
import CopilotChat from "./CopilotChat";
import { Sparkles, ArrowRight } from "./Icons";

export default function GlobalDocentDrawer({ isOpen, onClose, routerState, updateState, exhibitContext }) {
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={18} color={C.goldBright} />
            <span style={{
              fontFamily: FONT.condensed,
              fontSize: "1.1rem",
              fontWeight: 700,
              color: C.goldBright,
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            }}>
              AI Docent
            </span>
            <span style={{
              background: C.gold,
              color: "#000",
              padding: "0.1rem 0.4rem",
              borderRadius: 4,
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              fontWeight: 700,
              fontFamily: FONT.condensed
            }}>BETA</span>
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
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
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
