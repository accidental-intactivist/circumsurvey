import React from "react";
import { FONT, C } from "../styles/tokens";

const SectionBlock = ({ title, children, accentColor = "var(--c-ghost)" }) => (
  <section style={{
    background: "var(--c-bgCard)",
    color: "var(--c-text)",
    borderRadius: 8,
    padding: "3rem 2.5rem",
    marginBottom: "2rem",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    border: `1px solid ${accentColor}`
  }}>
    <h2 style={{ 
      fontFamily: FONT.display, 
      fontSize: "2rem", 
      color: "var(--c-textBright)", 
      borderBottom: `2px solid var(--c-ghost)`,
      paddingBottom: "1rem",
      marginBottom: "2rem",
      marginTop: 0
    }}>{title}</h2>
    <div style={{
      fontFamily: FONT.body,
      fontSize: "1.05rem",
      lineHeight: 1.6,
      color: "var(--c-dim)"
    }}>
      {children}
    </div>
  </section>
);

const LinkButton = ({ href, children, primary }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{
    display: "inline-block",
    background: primary ? "var(--c-gold)" : "transparent",
    color: primary ? "var(--c-bgDeep)" : "var(--c-textBright)",
    border: `1px solid ${primary ? "var(--c-gold)" : "var(--c-ghost)"}`,
    padding: "0.75rem 1.5rem",
    borderRadius: "100px",
    fontFamily: FONT.condensed,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    textDecoration: "none",
    marginTop: "1rem",
    marginRight: "1rem",
    transition: "all 0.2s ease",
  }}
  onMouseEnter={e => {
    if (primary) {
      e.target.style.background = "var(--c-goldBright)";
    } else {
      e.target.style.background = "var(--c-bgGlass)";
      e.target.style.borderColor = "var(--c-gold)";
      e.target.style.color = "var(--c-gold)";
    }
  }}
  onMouseLeave={e => {
    if (primary) {
      e.target.style.background = "var(--c-gold)";
    } else {
      e.target.style.background = "transparent";
      e.target.style.borderColor = "var(--c-ghost)";
      e.target.style.color = "var(--c-textBright)";
    }
  }}>
    {children}
  </a>
);

export default function ResourcesPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      padding: "2rem 1.5rem 6rem",
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p style={{
            fontSize: "1.1rem",
            lineHeight: 1.6,
            color: "var(--c-textBright)",
          }}>
            Here you will find materials to help you dive deeper into the research, as well as tools to help spread the word and encourage others to participate in the survey. Every share, every conversation, and every flyer posted makes a difference.
          </p>
          <div style={{ marginTop: "2rem" }}>
            <LinkButton primary href="https://forms.gle/FQ8o9g7j1yU3Cw7n7">Take the Anonymous Survey</LinkButton>
          </div>
        </div>

        <SectionBlock title="The Core Research: The Accidental Intactivist Manifesto">
          <p>The perspective and research that inspired this survey are detailed in this comprehensive manifesto. It explores the history, ethics, anatomy, and cultural forces behind routine infant circumcision from the unique vantage point of the "Accidental Intactivist."</p>
          <p>The Accidental Intactivist Manifesto is the foundational document behind this entire research effort. It weaves together personal insight, scientific inquiry, and cultural critique into a bold, eye-opening call to action.</p>
          <p>Whether you're new to this issue or deep in the fight for genital autonomy, this 117-page manifesto delivers the history, ethics, anatomy, and emotional truth that so often go unspoken.</p>
          
          <div style={{ marginTop: "2rem" }}>
            <LinkButton primary href="https://drive.google.com/file/d/1C3T_nDzIPHSWDUcrvvvcrH_Iallk06pT/view?usp=sharing">Download Full Manifesto (PDF)</LinkButton>
            <LinkButton href="https://medium.com/@ambp/the-accidental-intactivist-manifesto-exposing-the-monster-we-agree-not-to-see-e96e86490bc0">Read on Medium</LinkButton>
            <LinkButton href="https://substack.com/@c4charkey">Read on Substack</LinkButton>
          </div>
        </SectionBlock>

        <SectionBlock title="Resources for Further Exploration, Support, and Action">
          <p>Diving into this topic can bring up many questions. The manifesto's final section is an extensive, curated list of organizations, research, multimedia, books, and online communities for further exploration, support, and action.</p>
          <p>This is your next step for connecting with the broader intactivist movement and accessing decades of work from dedicated advocates and researchers.</p>
          
          <div style={{ marginTop: "1.5rem" }}>
            <LinkButton href="https://substack.com/home/post/p-165295190">View Resource Directory</LinkButton>
          </div>
        </SectionBlock>

        <SectionBlock title="Shareable Downloads">
          <p>Help us reach our goal of gathering 500+ diverse perspectives! These materials are designed for you to print, post (with permission), and share in your community, at events like Pride and local fairs, conferences, or online.</p>
          
          <ul style={{ paddingLeft: "1.5rem", marginTop: "1.5rem" }}>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://drive.google.com/file/d/1TzhNbktVBKKzh6JGaKti2G0hxyUOb_ol/view?usp=drive_link" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>Download the 2-Page Survey Overview (PDF)</a></strong>
              <br />The detailed prospectus outlining the survey's goals, methodology, and ethical framework. Perfect for sharing with organizations, researchers, journalists, or anyone who wants a deeper understanding of the project.
            </li>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://drive.google.com/file/d/1EYqCluOqfIEvk90qXpLE7Wn6-YZBiDQC/view?usp=drive_link" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>Download Full-Page Color Poster (PDF)</a></strong>
              <br />Perfect for posting on community bulletin boards, leaving on info tables, or using as a larger sign on a backpack. Contains the survey title, a brief description, the QR code, and the direct link.
            </li>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://drive.google.com/file/d/1Cb5wVsfuHcay7DONYIJqzPgjUmjQ6F6e/view?usp=drive_link" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>Download 2x2 Fliers (PDF)</a></strong>
              <br />These small handouts are ideal for quick, direct sharing. Easy to carry and give to individuals who show interest. Contains a punchy headline, the QR code, and the link.
            </li>
            <li>
              <strong><a href="https://drive.google.com/file/d/1EJWfyTBr2dp4OnTXz9DfEUTc2ba1j3PW/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>Download CircumSurvey QR Code (PNG)</a></strong>
              <br />Use this high-resolution file for your own custom flyers, signs, or social media graphics.
            </li>
          </ul>
        </SectionBlock>

      </div>
    </div>
  );
}
