import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { C, FONT, RAINBOW } from "../styles/tokens";
import { EXHIBIT_ROUTES } from "./ExploreMasthead";

import * as LucideIcons from "lucide-react";

function ExhibitLink({ exhibit, direction, navigate }) {
  const [isHovered, setIsHovered] = useState(false);
  const isNext = direction === "next";
  const IconComponent = LucideIcons[exhibit.icon] || LucideIcons.Circle;

  return (
    <div
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => navigate(exhibit.route), 300);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        flex: 1,
        padding: "2.5rem 2rem",
        borderRadius: "12px",
        background: isHovered ? C.bgCard : "transparent",
        border: `1px solid ${isHovered ? (exhibit.colorVar || C.dim) : C.ghost}`,
        cursor: "pointer",
        display: "flex",
        flexDirection: isNext ? "row" : "row-reverse", 
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.5rem",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: isHovered ? (isNext ? "translateX(4px)" : "translateX(-4px)") : "none",
        boxShadow: isHovered ? `0 10px 30px rgba(0,0,0,0.3)` : "none",
        textAlign: isNext ? "right" : "left",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Ghosted Icon */}
      <div style={{
        position: "absolute",
        bottom: "-20px",
        right: isNext ? "auto" : "-10px",
        left: isNext ? "-10px" : "auto", // Ghosted icon behind the text side
        opacity: isHovered ? 0.08 : 0.03,
        color: exhibit.colorVar || C.gold,
        transition: "all 0.5s ease",
        transform: isHovered ? "scale(1.1) rotate(-5deg)" : "scale(1) rotate(0deg)",
        pointerEvents: "none",
        zIndex: 0
      }}>
        <IconComponent size={140} strokeWidth={1} />
      </div>

      <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
        <div style={{
          fontFamily: FONT.condensed,
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: isHovered ? (exhibit.colorVar || C.gold) : C.muted,
          marginBottom: "0.5rem",
          transition: "color 0.3s ease"
        }}>
          {isNext ? "Next Exhibit" : "Previous"} • {exhibit.num}
        </div>
        <div style={{
          fontFamily: FONT.display,
          fontSize: "1.75rem",
          fontWeight: 700,
          color: C.textBright,
          marginBottom: "0.25rem",
          lineHeight: 1.2
        }}>
          {exhibit.label}
        </div>
        <div style={{
          fontFamily: FONT.body,
          fontSize: "0.95rem",
          color: C.muted,
          lineHeight: 1.4
        }}>
          {exhibit.tagline}
        </div>
      </div>
      <div style={{ 
        color: isHovered ? (exhibit.colorVar || C.gold) : C.dim,
        transition: "all 0.3s ease",
        transform: isHovered ? "scale(1.1)" : "scale(1)",
        position: "relative", 
        zIndex: 1
      }}>
        {isNext ? <ArrowRight size={32} strokeWidth={1.5} /> : <ArrowLeft size={32} strokeWidth={1.5} />}
      </div>
    </div>
  );
}

function DirectoryItem({ num, label, route, colorVar, isCurrent, navigate }) {
  const [hover, setHover] = useState(false);
  
  if (!num) {
    return (
      <div
        onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate(route); }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "flex",
          alignItems: "baseline",
          cursor: "pointer",
          color: isCurrent ? C.textBright : (hover ? C.textBright : C.muted),
          transition: "color 0.2s ease",
          padding: "0.3rem 0",
          fontFamily: FONT.display,
          fontSize: "1rem",
          letterSpacing: "0.02em"
        }}
      >
        {label}
      </div>
    );
  }
  
  return (
    <div
      onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate(route); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "baseline",
        cursor: "pointer",
        color: isCurrent ? C.textBright : (hover ? C.textBright : C.muted),
        transition: "color 0.2s ease",
        padding: "0.3rem 0"
      }}
    >
      <span style={{ 
        width: "110px", 
        flexShrink: 0,
        whiteSpace: "nowrap",
        color: isCurrent ? C.goldBright : (hover ? colorVar || C.gold : C.dim), 
        fontFamily: FONT.condensed, 
        letterSpacing: "0.1em",
        fontSize: "0.75rem",
        textTransform: "uppercase",
        transition: "color 0.2s ease"
      }}>
        {num}
      </span>
      <span style={{
        flexGrow: 1,
        borderBottom: `1.5px dotted ${hover || isCurrent ? C.dim : C.ghost}`,
        margin: "0 0.75rem",
        opacity: hover || isCurrent ? 1 : 0.8,
        position: "relative",
        top: "-4px",
        minWidth: "20px", // Ensure dotted line doesn't disappear if text wraps
        transition: "border-color 0.2s ease, opacity 0.2s ease"
      }} />
      <span style={{ 
        fontFamily: FONT.body, 
        fontSize: "0.9rem",
        letterSpacing: "0.02em",
        fontWeight: isCurrent ? 600 : 400,
        textAlign: "right", // Right align wrapping text
        flexShrink: 1 // Allow shrinking to wrap
      }}>
        {label}
      </span>
    </div>
  );
}

export default function GlobalFooter({ route, navigate }) {
  const currentIndex = useMemo(() => {
    if (!route || route === "index") return -1;
    const searchRoute = route === "generational-faultlines" ? "culture" : route;
    return EXHIBIT_ROUTES.findIndex((e) => e.route === searchRoute);
  }, [route]);

  const prevExhibit = currentIndex > 0 ? EXHIBIT_ROUTES[currentIndex - 1] : null;
  const nextExhibit = currentIndex === -1 ? EXHIBIT_ROUTES[0] : (currentIndex >= 0 && currentIndex < EXHIBIT_ROUTES.length - 1 ? EXHIBIT_ROUTES[currentIndex + 1] : null);

  const LinkStyle = {
    color: C.muted,
    textDecoration: "none",
    fontFamily: FONT.body,
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "color 0.2s ease"
  };

  const allItems = [
    { num: null, label: "Master Index", route: "index" },
    ...EXHIBIT_ROUTES
  ];

  return (
    <footer style={{
      marginTop: "6rem",
      background: C.bgDeep,
      padding: "4rem 2rem 6rem 2rem",
      position: "relative",
      zIndex: 10,
    }}>
      {/* Signature Top Gradient Rule */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: RAINBOW,
      }} />
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Next / Previous Navigation */}
        {(prevExhibit || nextExhibit) && (
          <div style={{
            display: "flex",
            flexDirection: "row",
            gap: "2rem",
            marginBottom: "5rem",
            flexWrap: "wrap"
          }}>
            {prevExhibit ? (
              <ExhibitLink exhibit={prevExhibit} direction="prev" navigate={navigate} />
            ) : (
              <div style={{ flex: 1 }} />
            )}
            
            {nextExhibit && (
              <ExhibitLink exhibit={nextExhibit} direction="next" navigate={navigate} />
            )}
          </div>
        )}

        {/* Divider */}
        <div style={{
          height: "1px",
          background: C.ghost,
          marginBottom: "4rem"
        }} />

        {/* Sitemap Grid (4-column layout) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "4rem",
        }}>
          
          {/* Brand Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{
              fontFamily: FONT.display,
              fontSize: "1.2rem",
              fontWeight: 700,
              color: C.textBright,
              lineHeight: 1.2
            }}>
              The Accidental Intactivist's Inquiry
            </div>
            <div style={{
              fontFamily: FONT.body,
              fontSize: "0.9rem",
              color: C.muted,
              lineHeight: 1.6
            }}>
              An open-source exploration into the lived experiences, perceptions, and pathways of 501 respondents.
            </div>
            
            <a href="https://forms.gle/FQ8o9g7j1yU3Cw7n7" target="_blank" rel="noreferrer" style={{
              marginTop: "1rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: C.gold,
              color: C.bgDeep,
              padding: "0.75rem 1.5rem",
              borderRadius: "100px",
              fontFamily: FONT.condensed,
              fontWeight: 700,
              fontSize: "0.9rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
              border: `1px solid ${C.gold}`,
              transition: "all 0.2s ease",
              alignSelf: "flex-start",
            }}
            onMouseEnter={e => e.target.style.background = C.goldBright}
            onMouseLeave={e => e.target.style.background = C.gold}
            >
              Take the Anonymous Survey
            </a>

            <div style={{
              marginTop: "1.5rem",
              height: "2px",
              width: "40px",
              background: RAINBOW,
              borderRadius: "2px"
            }} />
          </div>

          {/* Core Exhibits (Single Column Dotted Directory) */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ 
              fontFamily: FONT.condensed, 
              fontSize: "0.8rem", 
              letterSpacing: "0.1em", 
              textTransform: "uppercase", 
              color: C.dim, 
              fontWeight: 700, 
              marginBottom: "1rem",
            }}>
              Featured Exhibits
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {allItems.map((ex) => {
                const isCurrent = ex.route === route || (route === undefined && ex.route === "index");
                return (
                  <DirectoryItem 
                    key={ex.route} 
                    num={ex.num} 
                    label={ex.label} 
                    route={ex.route} 
                    colorVar={ex.colorVar}
                    isCurrent={isCurrent} 
                    navigate={navigate} 
                  />
                );
              })}
            </div>
          </div>

          {/* Project & Community */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ fontFamily: FONT.condensed, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: C.dim, fontWeight: 700 }}>
              Project & Community
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <a style={LinkStyle} onMouseEnter={e => e.target.style.color = C.textBright} onMouseLeave={e => e.target.style.color = C.muted} onClick={() => { window.scrollTo(0,0); navigate("about"); }}>About the Project</a>
              <a style={LinkStyle} onMouseEnter={e => e.target.style.color = C.textBright} onMouseLeave={e => e.target.style.color = C.muted} onClick={() => { window.scrollTo(0,0); navigate("methodology"); }}>Survey Methodology</a>
              <a style={LinkStyle} onMouseEnter={e => e.target.style.color = C.textBright} onMouseLeave={e => e.target.style.color = C.muted} onClick={() => { window.scrollTo(0,0); navigate("get-involved"); }}>Get Involved</a>
              <a style={LinkStyle} onMouseEnter={e => e.target.style.color = C.textBright} onMouseLeave={e => e.target.style.color = C.muted} onClick={() => { window.scrollTo(0,0); navigate("about"); }}>Strategic Partners</a>
              <a style={LinkStyle} onMouseEnter={e => e.target.style.color = C.textBright} onMouseLeave={e => e.target.style.color = C.muted} onClick={() => { window.scrollTo(0,0); navigate("faq"); }}>FAQ</a>
            </div>
          </div>

          {/* Resources */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ fontFamily: FONT.condensed, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: C.dim, fontWeight: 700 }}>
              Resources & Tools
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <a style={LinkStyle} onMouseEnter={e => e.target.style.color = C.textBright} onMouseLeave={e => e.target.style.color = C.muted} onClick={() => { window.scrollTo(0,0); navigate("for-parents"); }}>For New Parents</a>
              <a style={LinkStyle} onMouseEnter={e => e.target.style.color = C.textBright} onMouseLeave={e => e.target.style.color = C.muted} onClick={() => { window.scrollTo(0,0); navigate("demographics"); }}>Demographic Profile</a>
              <a style={LinkStyle} onMouseEnter={e => e.target.style.color = C.textBright} onMouseLeave={e => e.target.style.color = C.muted} onClick={() => { window.scrollTo(0,0); navigate("report"); }}>Report Builder</a>
              <a style={LinkStyle} onMouseEnter={e => e.target.style.color = C.textBright} onMouseLeave={e => e.target.style.color = C.muted} onClick={() => { window.scrollTo(0,0); navigate("resources"); }}>Downloads & External</a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{
          marginTop: "5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: FONT.body,
          fontSize: "0.8rem",
          color: C.dim,
          borderTop: `1px solid ${C.ghost}`,
          paddingTop: "1.5rem"
        }}>
          <div>© {new Date().getFullYear()} The Accidental Intactivist</div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <span style={{ cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              ↑ Back to top
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
