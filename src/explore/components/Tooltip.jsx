import { useState } from "react";
import { createPortal } from "react-dom";
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
  if (!visible || typeof window === 'undefined') return null;
  
  // Keep tooltip on screen
  const safeX = Math.min(x + 15, window.innerWidth - 150);
  const safeY = Math.min(y + 15, window.innerHeight - 50);

  return createPortal(
    <div style={{
      position: "fixed",
      top: safeY,
      left: safeX,
      pointerEvents: "none",
      background: C.bgDeep,
      border: `1px solid ${C.ghost}`,
      padding: "0.5rem 0.75rem",
      borderRadius: 6,
      fontFamily: FONT.mono,
      fontSize: "0.75rem",
      color: C.text,
      whiteSpace: "pre-wrap",
      zIndex: 99999,
      boxShadow: "0 8px 24px rgba(0,0,0,0.6)"
    }}>
      {typeof content === 'string' ? <span dangerouslySetInnerHTML={{ __html: content }} /> : content}
    </div>,
    document.body
  );
}
