import { useState } from "react";
import { C, FONT } from "../styles/tokens";

export function useTooltip() {
  const [tooltip, setTooltip] = useState({ visible: false, content: null, x: 0, y: 0 });

  const showTooltip = (e, content) => {
    setTooltip({ visible: true, content, x: e.clientX, y: e.clientY });
  };

  const moveTooltip = (e) => {
    setTooltip(prev => prev.visible ? { ...prev, x: e.clientX, y: e.clientY } : prev);
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return { tooltip, showTooltip, moveTooltip, hideTooltip };
}

export function Tooltip({ visible, content, x, y }) {
  if (!visible) return null;
  
  // Keep tooltip on screen
  const safeX = typeof window !== 'undefined' ? Math.min(x + 15, window.innerWidth - 150) : x + 15;
  const safeY = typeof window !== 'undefined' ? Math.min(y + 15, window.innerHeight - 50) : y + 15;

  return (
    <div style={{
      position: "fixed",
      top: safeY,
      left: safeX,
      pointerEvents: "none",
      background: C.bgDeep,
      border: `1px solid ${C.ghost}`,
      padding: "0.4rem 0.6rem",
      borderRadius: 4,
      fontFamily: FONT.mono,
      fontSize: "0.75rem",
      color: C.text,
      whiteSpace: "pre-wrap",
      zIndex: 9999,
      boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
    }}>
      {content}
    </div>
  );
}
