import { useEffect } from "react";
import { C, FONT } from "../styles/tokens";

export default function TheDecisionPage({ setCustomMeta }) {
  useEffect(() => {
    setCustomMeta(null); // Use default from masthead
  }, [setCustomMeta]);

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      padding: "2rem 1.1rem"
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", paddingTop: "4rem" }}>
        <h2 style={{ fontFamily: FONT.display, color: C.goldBright }}>Coming Soon (Phase 2)</h2>
        <p style={{ color: C.dim, marginTop: "1rem" }}>
          This exhibit will trace the timeline, tipping points, and reflections of parents making the circumcision decision.
        </p>
      </div>
    </div>
  );
}
