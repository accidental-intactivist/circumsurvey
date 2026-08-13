import React, { useEffect } from 'react';
import { C, FONT } from '../explore/styles/tokens';
import GlobalFooter from '../explore/components/GlobalFooter';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{
      background: 'var(--c-bg)',
      minHeight: '100dvh',
      color: 'var(--c-text)',
      fontFamily: "var(--f-body, 'Barlow', sans-serif)",
    }}>
      <div style={{ padding: "8rem 1.6rem 4rem", maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontFamily: FONT.display, fontSize: "2.5rem", color: C.textBright, marginBottom: "2rem" }}>
          Privacy Policy
        </h1>
        
        <div style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.muted, lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <p>
            <strong>Last Updated:</strong> July 2026
          </p>

          <p>
            The Accidental Intactivist's Inquiry ("we," "our," or "us") respects your privacy and is committed to protecting it. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website (findings.circumsurvey.online), particularly regarding international regulations such as the General Data Protection Regulation (GDPR).
          </p>

          <h2 style={{ fontFamily: FONT.display, fontSize: "1.5rem", color: C.goldBright, marginTop: "1rem", marginBottom: "0.5rem" }}>
            1. Information We Collect
          </h2>
          <p>
            We collect information in two main ways:
          </p>
          <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li><strong>Anonymized Telemetry:</strong> We use PostHog, an open-source product analytics platform, to understand how visitors interact with the exhibition. We capture anonymized usage data (e.g., pages visited, exhibits expanded, buttons clicked) to improve the experience. We do <strong>not</strong> track cross-site behavior, and IP addresses are anonymized.</li>
            <li><strong>Voluntary Information:</strong> If you choose to join our mailing list or contact us, we collect the email address and information you voluntarily provide. This is strictly opt-in.</li>
          </ul>

          <h2 style={{ fontFamily: FONT.display, fontSize: "1.5rem", color: C.goldBright, marginTop: "1rem", marginBottom: "0.5rem" }}>
            2. How We Use Your Information
          </h2>
          <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li>To operate and maintain the website.</li>
            <li>To understand how the data is being explored, which helps us prioritize future research (Phase 2).</li>
            <li>To send you updates if you have explicitly opted into our mailing list.</li>
          </ul>

          <h2 style={{ fontFamily: FONT.display, fontSize: "1.5rem", color: C.goldBright, marginTop: "1rem", marginBottom: "0.5rem" }}>
            3. Data Sharing and Third Parties
          </h2>
          <p>
            We do not sell, trade, or rent your personal identification information to others. Data collected via PostHog is stored securely and used solely for internal analysis of this project.
          </p>

          <h2 style={{ fontFamily: FONT.display, fontSize: "1.5rem", color: C.goldBright, marginTop: "1rem", marginBottom: "0.5rem" }}>
            4. Your Rights (GDPR & CCPA)
          </h2>
          <p>
            If you are a resident of the European Economic Area (EEA), the UK, or California, you have certain data protection rights:
          </p>
          <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
            <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
            <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
          </ul>
          <p>
            Because our telemetry is anonymized and cookie-less where possible, we may not be able to identify your specific session data. However, if you have provided your email address and wish to be removed from our records, please contact us.
          </p>

          <h2 style={{ fontFamily: FONT.display, fontSize: "1.5rem", color: C.goldBright, marginTop: "1rem", marginBottom: "0.5rem" }}>
            5. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at: <a href="mailto:privacy@circumsurvey.online" style={{ color: C.blue }}>privacy@circumsurvey.online</a> (or via the Contact page).
          </p>
        </div>
      </div>
      <GlobalFooter route="privacy" navigate={(route) => window.location.href = `/${route}`} />
    </div>
  );
}
