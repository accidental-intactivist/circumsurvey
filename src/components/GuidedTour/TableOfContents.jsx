import React, { useState } from 'react';
import { TOUR } from './tourData';

const TOC_ACTS = [
  {
    id: 'act-1-mechanics',
    kicker: 'ACT I',
    title: 'Physical & Mechanical Data',
    color: 'var(--c-green)',
    chapters: [
      { type: 'custom', title: 'Cohort Comparison: Sensation Metrics', tagline: 'EXHIBIT 03', colorVar: 'var(--c-green)', id: 'sexual-experience-the-pleasure-gap' },
      { type: 'custom', title: 'Intact vs. Circumcised: Mechanical Friction', tagline: 'FORM CS-058', colorVar: 'var(--c-blue)', id: 'lubrication-dependency' }
    ]
  },
  {
    id: 'act-2-emotion',
    kicker: 'ACT II',
    title: 'Emotional & Psychological Data',
    color: 'var(--c-gold)',
    chapters: [
      { type: 'custom', title: 'Cohort Comparison: Resentment vs. Regret', tagline: 'EXHIBIT 02', colorVar: 'var(--c-gold)', id: 'gratitude-vs-regret' },
      { type: 'custom', title: 'Intact vs. Circumcised: Narrative Testimonies', tagline: 'EXHIBIT 06', colorVar: 'var(--c-orange)', id: 'the-raw-words' }
    ]
  },
  {
    id: 'act-3-restoration',
    kicker: 'ACT III',
    title: 'Foreskin Restoration',
    color: 'var(--c-red)',
    chapters: [
      { type: 'custom', title: 'The Restoring Cohort Data', tagline: 'EXHIBIT 10', colorVar: 'var(--c-red)', id: 'the-restoring-cohort-in-numbers' }
    ]
  },
  {
    id: 'act-4-resolution',
    kicker: 'ACT IV',
    title: 'The Next Generation',
    color: 'var(--c-ltBlue)',
    chapters: [
      { type: 'custom', title: 'Future Son Intentions & Convergence', tagline: 'EXHIBIT 14', colorVar: 'var(--c-blue)', id: 'the-convergence' }
    ]
  },
  {
    id: 'appendix',
    kicker: 'APPENDIX',
    title: 'Methodology & Demographics',
    color: 'var(--c-dim)',
    chapters: [
      { type: 'custom', title: 'Survey Architecture', tagline: 'EXHIBIT 01', colorVar: 'var(--c-blue)', id: 'the-survey-architecture' },
      { type: 'custom', title: 'Respondent Census', tagline: 'EXHIBIT 05', colorVar: 'var(--c-purple)', id: 'respondent-census-origins' },
      { type: 'custom', title: 'Generational Shifts', tagline: 'EXHIBIT 07', colorVar: 'var(--c-ltBlue)', id: 'the-generational-faultline' },
      { type: 'custom', title: 'Data for Expectant Parents', tagline: 'EXHIBIT 13', colorVar: 'var(--c-purple)', id: 'for-new-expectant-parents' }
    ]
  }
];

function TOCItem({ num, label, id, colorVar }) {
  const [hover, setHover] = useState(false);
  
  return (
    <div
      onClick={(e) => { 
        e.preventDefault(); 
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" }); 
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "baseline",
        cursor: "pointer",
        color: hover ? "var(--c-textBright)" : "var(--c-muted)",
        transition: "color 0.2s ease",
        padding: "0.5rem 0",
        textDecoration: "none"
      }}
    >
      <span style={{ 
        width: "120px", 
        flexShrink: 0,
        whiteSpace: "nowrap",
        color: hover ? (colorVar || "var(--c-gold)") : "var(--c-dim)", 
        fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)", 
        letterSpacing: "0.1em",
        fontSize: "0.8rem",
        textTransform: "uppercase",
        transition: "color 0.2s ease"
      }}>
        {num}
      </span>
      <span style={{
        flexGrow: 1,
        borderBottom: `1.5px dotted ${hover ? "var(--c-dim)" : "var(--c-ghost)"}`,
        margin: "0 1rem",
        opacity: hover ? 1 : 0.6,
        position: "relative",
        top: "-4px",
        minWidth: "20px",
        transition: "border-color 0.2s ease, opacity 0.2s ease"
      }} />
      <span style={{ 
        fontFamily: "var(--f-body, 'Barlow', sans-serif)", 
        fontSize: "1.05rem",
        letterSpacing: "0.02em",
        textAlign: "right",
        flexShrink: 1,
        fontWeight: hover ? 500 : 400
      }}>
        {label}
      </span>
    </div>
  );
}

export default function TableOfContents() {
  const [hoveredAct, setHoveredAct] = useState(null);

  return (
    <div style={{
      maxWidth: 960,
      margin: "0 auto 6rem",
      padding: "0 1.6rem",
      position: "relative",
      zIndex: 10,
    }}>
      <div style={{
        background: "var(--c-bgCard)",
        border: "1px solid var(--c-ghost)",
        borderRadius: 8,
        padding: "clamp(2rem, 5vw, 4rem)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative corner accents */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 30, height: 30, borderTop: '2px solid var(--c-gold)', borderLeft: '2px solid var(--c-gold)' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderBottom: '2px solid var(--c-gold)', borderRight: '2px solid var(--c-gold)' }} />

        <div style={{
          fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
          fontWeight: 700,
          fontSize: "0.85rem",
          color: "var(--c-gold)",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          marginBottom: "1rem",
          textAlign: "center"
        }}>
          Table of Contents
        </div>
        <h2 style={{
          fontFamily: "var(--f-display, 'Playfair Display', serif)",
          fontWeight: 800,
          fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
          color: "var(--c-textBright)",
          textAlign: "center",
          marginBottom: "4rem",
          marginTop: 0,
          letterSpacing: "-0.01em"
        }}>
          Where would you like to start?
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", maxWidth: "600px", margin: "0 auto" }}>
          {TOC_ACTS.map((act) => (
            <div key={act.id}>
              {/* Act Header */}
              <a 
                href={`#${act.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(act.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onMouseEnter={() => setHoveredAct(act.id)}
                onMouseLeave={() => setHoveredAct(null)}
                style={{ 
                  display: "flex", alignItems: "baseline",
                  textDecoration: 'none', marginBottom: "1rem",
                  color: hoveredAct === act.id ? "var(--c-textBright)" : "var(--c-text)",
                  cursor: "pointer",
                  transition: "color 0.2s ease"
                }}
              >
                <div style={{
                  fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: act.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  width: "120px",
                  flexShrink: 0
                }}>
                  {act.kicker}
                </div>
                <div style={{
                  fontFamily: "var(--f-display, 'Playfair Display', serif)",
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  letterSpacing: "0.02em"
                }}>
                  {act.title}
                </div>
              </a>

              {/* Chapters List */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {act.chapters.map((chap, i) => {
                  let chapterData = chap;
                  if (chap.type === 'exhibit') {
                    const t = TOUR.find(x => x.num === chap.num);
                    if (t) {
                      chapterData = {
                        title: t.title,
                        colorVar: t.colorVar,
                        num: `Exhibit ${t.num}`,
                        id: chap.id
                      };
                    }
                  } else {
                    chapterData = {
                      title: chap.title,
                      colorVar: chap.colorVar,
                      num: chap.tagline,
                      id: chap.id
                    };
                  }
                  
                  return (
                    <TOCItem 
                      key={i} 
                      num={chapterData.num} 
                      label={chapterData.title} 
                      id={chapterData.id} 
                      colorVar={chapterData.colorVar} 
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
