import React from "react";
import { FONT, C, RAINBOW } from "../styles/tokens";
import { useLegibleColor } from "../lib/colorUtils";

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

export default function GetInvolvedPage() {
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
            Thank you for your interest in "The Accidental Intactivist's Inquiry" and the broader mission to foster informed dialogue about male genital anatomy, autonomy, and cultural assumptions. This independent research project thrives on community engagement and support. Below are several ways you can contribute to this vital work and help us expand our reach and impact.
          </p>
          <div style={{ marginTop: "2rem" }}>
            <LinkButton primary href="https://forms.gle/FQ8o9g7j1yU3Cw7n7">Take the Anonymous Survey</LinkButton>
          </div>
        </div>

        <SectionBlock title="★ URGENT CALL TO ACTION ★" accentColor="var(--c-orange)">
          <p>Beyond our broader research, this project is now actively supporting a critical, time-sensitive legal effort with the potential to create historic change for children's rights in Washington State.</p>
          <p>Leaders from <strong>Intact Global</strong>, <strong>Doctors Opposing Circumcision</strong>, and the <strong>Washington Initiative for Boys and Men (WIBM)</strong> are preparing a potential Equal Protection lawsuit. This legal challenge argues that the state's failure to protect boys from non-consensual genital cutting, while protecting girls, is a violation of its own constitution.</p>
          <p>To move forward, this lawsuit needs a courageous plaintiff. Our survey is now a key tool in this search.</p>
          
          <div style={{ background: "var(--c-bgDeep)", padding: "1.5rem", borderRadius: "8px", margin: "2rem 0", borderLeft: "4px solid var(--c-orange)" }}>
            <h3 style={{ fontFamily: FONT.condensed, color: "var(--c-textBright)", margin: "0 0 1rem 0", letterSpacing: "0.05em" }}>We are looking for a "regret parent" who meets the following specific criteria:</h3>
            <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
              <li style={{ marginBottom: "0.5rem" }}>You are a parent (or parents) who now regrets the decision to have your son circumcised.</li>
              <li style={{ marginBottom: "0.5rem" }}>Your son was born AND circumcised in WASHINGTON STATE.</li>
              <li style={{ marginBottom: 0 }}>The circumcision occurred ON or AFTER March 1, 2023.</li>
            </ul>
          </div>
          
          <p>If you are this person, or if you know a family who might be, you have a rare opportunity to be a catalyst for profound change. Sharing your story could be the key that unlocks this landmark case.</p>
          <p><strong>Reach Out Confidentially:</strong> Please contact us directly and in the strictest confidence at <strong>tone@circumsurvey.online</strong>. All communications will be handled with the utmost sensitivity.</p>
        </SectionBlock>

        <SectionBlock title="1. Become a Survey Ambassador">
          <p>The single most impactful way to support this research right now is to help us gather as many diverse perspectives as possible. Our goal is to reach at least 500+ responses to ensure robust and meaningful findings.</p>
          
          <h3 style={{ fontFamily: FONT.condensed, color: "var(--c-textBright)", marginTop: "1.5rem", letterSpacing: "0.05em" }}>Share the Survey Link</h3>
          <p>Directly share the link to our survey portal with your friends, family, colleagues, and online communities: <strong>https://circumsurvey.online</strong></p>

          <h3 style={{ fontFamily: FONT.condensed, color: "var(--c-textBright)", marginTop: "1.5rem", letterSpacing: "0.05em" }}>Use Our Shareable Materials</h3>
          <p>Visit our <strong>Resources & Downloads</strong> page to download printable flyers, the QR code, and our 2-Page Survey Overview PDF to share with interested individuals.</p>

          <h3 style={{ fontFamily: FONT.condensed, color: "var(--c-textBright)", marginTop: "1.5rem", letterSpacing: "0.05em" }}>Engage Online</h3>
          <p>Discuss the themes raised in relevant online forums (always respecting community guidelines) and encourage thoughtful, respectful conversation.</p>
        </SectionBlock>

        <SectionBlock title="2. Volunteer Your Skills & Expertise">
          <p>This project is a significant undertaking, and many hands make light work! If you have skills or expertise you'd be willing to contribute, we'd love to hear from you. We are currently particularly interested in help with:</p>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}><strong>Translation & Localization:</strong> Help us make the survey accessible to non-English speaking communities. We are looking for volunteers to accurately translate the survey into Spanish, Hebrew, German, and Arabic.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Data Analysis & Visualization:</strong> If you have experience with statistical analysis, qualitative data coding, or creating compelling data visualizations.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Regional Outreach & Promotion:</strong> Help us connect with specific communities or regions to ensure a diverse respondent pool.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Content Creation & Writing Support:</strong> Assistance with drafting articles, summaries, or social media content based on the survey findings.</li>
          </ul>
          <p style={{ marginTop: "1.5rem" }}>Interested in volunteering? Please contact us at <strong>tone@circumsurvey.online</strong> with a brief description of your skills and how you'd like to help.</p>
        </SectionBlock>

        <SectionBlock title="3. Support Independent Research">
          <p>"The Accidental Intactivist's Guide" series and this survey are 100% independent, grassroots initiatives, conducted without institutional funding. While the initial setup costs have been managed creatively, sustaining and expanding this research involves significant time and future expenses. If you find this work valuable, there are two great ways to show your support:</p>
          
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "2rem" }}>
            <LinkButton href="https://coff.ee/accidental.intactivist">Make a One-Time Contribution</LinkButton>
            <LinkButton href="https://theaccidentalintactivist.substack.com/subscribe">Become a Paid Substack Subscriber</LinkButton>
          </div>
        </SectionBlock>

      </div>
    </div>
  );
}
