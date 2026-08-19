import React from "react";
import { FONT, C } from "../styles/tokens";
import { useLegibleColor } from "../lib/colorUtils";
import ExhibitSidebarNav from "../components/ExhibitSidebarNav";

const SECTIONS = [
  { id: "advocacy", label: "Advocacy & Education" },
  { id: "legal", label: "Legal & Direct Action" },
  { id: "faith", label: "Community & Faith" },
  { id: "manifesto", label: "The Manifesto" }
];

const SectionBlock = ({ id, title, children, accentColor = "var(--c-ghost)" }) => (
  <section id={id} style={{
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

const LinkButton = ({ href, children, primary }) => {
  const safeColor = useLegibleColor(
    primary ? "var(--c-bgDeep)" : "var(--c-textBright)",
    primary ? "var(--c-gold)" : "transparent"
  );
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{
      display: "inline-block",
      background: primary ? "var(--c-gold)" : "transparent",
      color: safeColor,
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
        e.target.style.color = safeColor;
      }
    }}>
      {children}
    </a>
  );
};

export default function ResourcesPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      padding: "2rem 1.5rem 6rem",
    }}>
      <div className="explore-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "3rem", alignItems: "start", maxWidth: 1200, margin: "0 auto" }}>
        
        {/* LEFT: Nav sidebar */}
        <ExhibitSidebarNav sections={SECTIONS} />

        {/* RIGHT: Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0rem", maxWidth: 900 }}>
          
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p style={{
            fontSize: "1.1rem",
            lineHeight: 1.6,
            color: "var(--c-textBright)",
          }}>
            The fight for genital autonomy and the reckoning with routine infant circumcision requires ongoing education, community support, and strategic action. This curated list provides key resources for deepening your understanding, connecting with others, and contributing to change.
          </p>
          <div style={{ marginTop: "2rem" }}>
            <LinkButton primary href="https://forms.gle/FQ8o9g7j1yU3Cw7n7">Take the Anonymous Survey</LinkButton>
          </div>
        </div>

        <SectionBlock id="advocacy" title="Core Advocacy & Education" accentColor="var(--path-intact)">
          <p>These organizations are central hubs for information, advocacy, parental support, and community.</p>
          <ul style={{ paddingLeft: "1.5rem", marginTop: "1.5rem" }}>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://intactamerica.org" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>Intact America</a></strong>
              <br />Leading US-based advocacy organization working to end Routine Infant Circumcision through public education, legislative action, and providing resources for parents and advocates.
            </li>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://nocirc.org" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>NOCIRC</a></strong>
              <br />A foundational US organization (since 1986) offering comprehensive educational materials, symposia proceedings, and resources for parents and medical professionals.
            </li>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://doctorsopposingcircumcision.org" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>Doctors Opposing Circumcision (DOC)</a></strong>
              <br />An international group of physicians and health professionals challenging the practice on medical and ethical grounds, featuring position papers and research databases.
            </li>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://circumcision.org" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>Circumcision Resource Center</a></strong>
              <br />Founded by psychologist Dr. Ronald Goldman, focusing on the psychological impacts of circumcision, providing educational resources and research analysis.
            </li>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://yourwholebaby.org" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>Your Whole Baby</a></strong>
              <br />Offers evidence-based information and a supportive community specifically for parents navigating the circumcision decision and choosing to keep their children intact.
            </li>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://savingoursons.org" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>Saving Our Sons (SOS)</a></strong>
              <br />A grassroots organization focused on public education, awareness events, supporting legislative action, and providing resources for families.
            </li>
          </ul>
        </SectionBlock>

        <SectionBlock id="legal" title="Direct Action & Legal Defense" accentColor="var(--c-red)">
          <p>Organizations focusing on legal challenges, human rights perspectives, and direct public action.</p>
          <ul style={{ paddingLeft: "1.5rem", marginTop: "1.5rem" }}>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://www.galdef.org/" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>GALDEF (Genital Autonomy Legal Defense and Education Fund)</a></strong>
              <br />Headed by human rights activist Tim Hammond, GALDEF focuses on educating and supporting attorneys in impact litigation to expand the US legal landscape to protect all children from forced genital cutting.
            </li>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://intactglobal.org" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>Intact Global</a></strong>
              <br />Focuses on legal challenges to forced genital cutting globally, human rights perspectives, and strategic litigation.
            </li>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://15square.org.uk/" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>15 Square</a></strong>
              <br />A UK-based charity providing support, information, and a sense of community for individuals affected by circumcision issues, including those dealing with complications or seeking restoration.
            </li>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://bloodstainedmen.com" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>Bloodstained Men & Their Friends</a></strong>
              <br />A highly visible US-based activist group known for striking public protests across the country, using powerful visuals to raise awareness about the harms of circumcision.
            </li>
          </ul>
        </SectionBlock>

        <SectionBlock id="faith" title="Community & Faith-Based" accentColor="var(--c-purple)">
          <p>Resources addressing religious dimensions of genital cutting and promoting alternative, non-cutting practices consistent with bodily integrity and faith traditions.</p>
          <ul style={{ paddingLeft: "1.5rem", marginTop: "1.5rem" }}>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://bruchim.online" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>Bruchim</a></strong>
              <br />A Jewish non-profit organization supporting Jewish families who choose not to circumcise their sons. Bruchim promotes alternative, non-cutting welcoming ceremonies (such as Brit Shalom).
            </li>
            <li style={{ marginBottom: "1rem" }}>
              <strong><a href="https://quranicpath.com/misconceptions/circumcision.html" target="_blank" rel="noreferrer" style={{ color: "var(--c-gold)" }}>Quranic Path</a></strong>
              <br />An exploration of Islamic perspectives that questions the necessity of routine Khitan (circumcision), focusing on Quranic non-mandate and the principle of harm avoidance.
            </li>
          </ul>
        </SectionBlock>

        <SectionBlock id="manifesto" title="The Accidental Intactivist Manifesto" accentColor="var(--c-gold)">
          <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "0 0 auto", width: "100%", maxWidth: "220px", alignSelf: "flex-start", margin: "0 auto" }}>
              <img src="/manifesto-cover.jpg" alt="The Accidental Intactivist Manifesto Cover" style={{ width: "100%", height: "auto", borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }} />
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <p style={{ marginTop: 0, marginBottom: "1.5rem" }}>The perspective and research that inspired this survey are detailed in this comprehensive manifesto. It weaves together personal insight, scientific inquiry, and cultural critique into a bold, eye-opening call to action.</p>
              <p>Whether you're new to this issue or deep in the fight for genital autonomy, this 117-page manifesto delivers the history, ethics, anatomy, and emotional truth that so often go unspoken.</p>
              
              <div style={{ marginTop: "2rem" }}>
                <LinkButton primary href="https://drive.google.com/file/d/1C3T_nDzIPHSWDUcrvvvcrH_Iallk06pT/view?usp=sharing">Download Full Manifesto (PDF)</LinkButton>
                <LinkButton href="https://medium.com/@ambp/the-accidental-intactivist-manifesto-exposing-the-monster-we-agree-not-to-see-e96e86490bc0">Read on Medium</LinkButton>
                <LinkButton href="https://substack.com/@c4charkey">Read on Substack</LinkButton>
              </div>
            </div>
          </div>
        </SectionBlock>

      </div>
    </div>
  );
}
