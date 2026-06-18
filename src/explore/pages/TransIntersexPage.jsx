import { useEffect } from "react";
import { C, FONT } from "../styles/tokens";

export default function TransIntersexPage({ setCustomMeta }) {
  useEffect(() => {
    setCustomMeta(null);
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
          A placeholder for our deep dive into transgender and intersex perspectives, which require distinct analytical lenses to be fully explored in Phase 2 of this project.
        </p>
      </div>
    </div>
  );
}
