import React from "react";
import { C, FONT } from "../explore/styles/tokens";

export default function ResourcesCTA() {
  return (
    <div style={{ marginBottom: "5rem", padding: "2.5rem", background: "rgba(212,160,48,0.06)", border: `1px solid rgba(212,160,48,0.2)`, borderRadius: 12 }}>
      <h2 style={{ fontFamily: FONT.display, fontSize: "1.75rem", color: C.goldBright, marginBottom: "1rem" }}>
        Moving Forward
      </h2>
      <p style={{ color: C.textBright, fontFamily: FONT.body, fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        The data presented throughout this inquiry paints a stark picture of the lived consequences of non-therapeutic circumcision. While we strive to maintain an objective presentation of the findings, the ultimate goal of The Accidental Intactivist's Inquiry is to question the normalcy of a practice that permanently alters the bodies of millions of infants globally. 
      </p>
      <p style={{ color: C.textBright, fontFamily: FONT.body, fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        I want to invite you to join me in going from an Accidental to an Intentional Intactivist, and help break the silence around a procedure still elected by nearly half of all parents. It took me 40 years to build the confidence and reassurance that this conversation is ready for the mainstream. You can help us make that a reality. Share, subscribe, build your own reports, find new ways to explore the data! Get involved.
      </p>

      <div style={{
        background: "rgba(212,160,48,0.15)",
        border: `2px solid ${C.goldBright}`,
        borderRadius: 8,
        padding: "2rem",
        marginBottom: "2.5rem",
        textAlign: "center"
      }}>
        <h3 style={{ fontFamily: FONT.display, fontSize: "1.5rem", color: C.textBright, margin: "0 0 1rem 0" }}>
          Double Your Impact: The $5,000 Match Campaign
        </h3>
        <p style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.textBright, lineHeight: 1.6, maxWidth: 600, margin: "0 auto 1.5rem" }}>
          The Accidental Intactivist is personally matching the first <strong>$5,000</strong> in donations to Intact Global. Your support helps fund critical advocacy, education, and legal efforts to protect children's bodily autonomy worldwide.
        </p>
        <a href="https://www.circumsurvey.online/get-involved-support" target="_blank" rel="noreferrer" style={{
          display: "inline-block",
          background: C.goldBright,
          color: C.bg,
          fontFamily: FONT.condensed,
          fontWeight: 700,
          fontSize: "1.1rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          padding: "0.8rem 2rem",
          borderRadius: 4,
          textDecoration: "none",
          transition: "transform 0.2s"
        }}>
          Donate Now & Match My Gift
        </a>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <a href="https://medium.com/@ambp/the-accidental-intactivist-manifesto-exposing-the-monster-we-agree-not-to-see-e96e86490bc0" target="_blank" rel="noreferrer" style={{ color: C.goldBright, textDecoration: "none", fontSize: "1.1rem", fontFamily: FONT.condensed, letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>↗</span> The Accidental Intactivist's Manifesto (Medium)
        </a>
        <a href="https://substack.com/@theaccidentalintactivist" target="_blank" rel="noreferrer" style={{ color: C.goldBright, textDecoration: "none", fontSize: "1.1rem", fontFamily: FONT.condensed, letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>↗</span> The Accidental Intactivist Substack
        </a>
        <a href="https://15square.org.uk/" target="_blank" rel="noreferrer" style={{ color: C.goldBright, textDecoration: "none", fontSize: "1.1rem", fontFamily: FONT.condensed, letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>↗</span> 15 Square — Charity for Education, Support, and Medical Information
        </a>
        <a href="https://www.reddit.com/r/foreskin_restoration/" target="_blank" rel="noreferrer" style={{ color: C.goldBright, textDecoration: "none", fontSize: "1.1rem", fontFamily: FONT.condensed, letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>↗</span> r/foreskin_restoration — Community & Peer Support for Restoration
        </a>
        <a href="https://www.reddit.com/r/CircumcisionGrief/" target="_blank" rel="noreferrer" style={{ color: C.goldBright, textDecoration: "none", fontSize: "1.1rem", fontFamily: FONT.condensed, letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>↗</span> r/CircumcisionGrief — Emotional Support Space
        </a>
      </div>
    </div>
  );
}
