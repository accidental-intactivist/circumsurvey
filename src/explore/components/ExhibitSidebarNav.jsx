// ═══════════════════════════════════════════════════════════════════════════
// ExhibitSidebarNav — a left-sidebar navigation component for exhibits
// It replicates the design from ByTheNumbersPage and tracks scroll position.
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { C, FONT, resolveCssColor } from "../styles/tokens";

/**
 * @param {{ sections: Array<{ id: string, label: string }> }} props
 */
export default function ExhibitSidebarNav({ sections }) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!sections || sections.length === 0) return;

    const ids = sections.map(s => s.id);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        let best = null;
        let bestRatio = 0;
        entries.forEach(entry => {
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = entry.target.id;
          }
        });
        if (best && bestRatio > 0) {
          setActiveSection(best);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -40% 0px", 
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
      }
    );

    const bind = () => {
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el && observerRef.current) {
          observerRef.current.observe(el);
        }
      });
    };

    bind();
    const retryTimer = setTimeout(bind, 800);

    return () => {
      clearTimeout(retryTimer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sections]);

  if (!sections || sections.length === 0) return null;

  return (
    <>
      <style>{`
        .desktop-sidebar-nav { display: flex; }
        .mobile-scroll-nav { display: none; }
        @media (max-width: 768px) {
          .desktop-sidebar-nav { display: none !important; }
          .mobile-scroll-nav { display: flex !important; }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="explore-nav desktop-sidebar-nav" style={{
        position: "sticky",
        top: "calc(var(--header-height, 56px) + 1.5rem)",
        maxHeight: "calc(100vh - var(--header-height, 56px) - 3rem)",
        overflowY: "auto",
        flexDirection: "column", gap: "0.5rem",
        zIndex: 100,
      }}>
        <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", color: C.text, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
          Sections
        </div>
        {sections.map(s => (
          <div
            key={s.id}
            onClick={() => {
              setActiveSection(s.id);
              document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            style={{
              cursor: "pointer", fontFamily: FONT.body, fontSize: "0.85rem",
              color: activeSection === s.id ? resolveCssColor(C.goldBright) : C.text,
              padding: "0.45rem 0.75rem", borderRadius: 6,
              background: activeSection === s.id ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${activeSection === s.id ? resolveCssColor(C.gold) : C.ghost}`,
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: "0.5rem",
            }}
            onMouseEnter={e => {
              if (activeSection !== s.id) {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = resolveCssColor(C.gold);
              }
            }}
            onMouseLeave={e => {
              if (activeSection !== s.id) {
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                e.currentTarget.style.borderColor = resolveCssColor(C.ghost);
              }
            }}
          >
            {s.label}
          </div>
        ))}
      </aside>

      {/* Mobile Dot and Line Nav */}
      <div className="mobile-scroll-nav" style={{
        position: "fixed",
        top: "50%",
        left: "0.6rem",
        transform: "translateY(-50%)",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.3rem",
        zIndex: 150,
      }}>
        {sections.map((s, idx) => (
          <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
            {/* The Dot */}
            <div
              onClick={() => {
                setActiveSection(s.id);
                document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={{
                width: activeSection === s.id ? 12 : 6,
                height: activeSection === s.id ? 12 : 6,
                borderRadius: "50%",
                background: activeSection === s.id ? resolveCssColor(C.goldBright) : resolveCssColor(C.ghost),
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: activeSection === s.id ? `0 0 10px ${resolveCssColor(C.gold)}` : "none",
                opacity: activeSection === s.id ? 1 : 0.4
              }}
              title={s.label}
            />
            {/* The Line (don't render after last item) */}
            {idx < sections.length - 1 && (
              <div style={{
                width: 2,
                height: 12,
                background: resolveCssColor(C.ghost),
                opacity: 0.15
              }} />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
