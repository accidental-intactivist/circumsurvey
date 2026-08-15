import React from 'react';
import { C, FONT } from '../explore/styles/tokens';
import GlobalFooter from '../explore/components/GlobalFooter';
import SquishHeader from '../components/Scrollytelling/SquishHeader';
import { Download, Copy, Share2 } from 'lucide-react';

export default function ToolkitPage() {
  const copyToClipboard = (text, btnId) => {
    navigator.clipboard.writeText(text);
    const btn = document.getElementById(btnId);
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = 'Copied!';
      setTimeout(() => btn.innerHTML = original, 2000);
    }
  };

  return (
    <div style={{
      background: 'var(--c-bg)',
      minHeight: '100dvh',
      color: 'var(--c-text)',
      fontFamily: "var(--f-body, 'Barlow', sans-serif)",
    }}>
      <div style={{ padding: "8rem 1.6rem 4rem", maxWidth: 960, margin: "0 auto" }}>
        
        <h1 style={{ 
          fontFamily: FONT.display, 
          fontSize: "clamp(2.5rem, 5vw, 4rem)", 
          color: C.textBright, 
          lineHeight: 1.1, 
          marginBottom: "1rem" 
        }}>
          The Advocate's Toolkit
        </h1>
        
        <p style={{ 
          fontSize: "1.1rem", 
          color: C.muted, 
          maxWidth: 700, 
          lineHeight: 1.6, 
          marginBottom: "3rem" 
        }}>
          If you want to share the findings of this survey with your network, this page contains high-resolution assets, printable flyers, and pre-written copy to make it as frictionless as possible.
        </p>

        <section style={{ marginBottom: "4rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem" }}>
            High-Impact Graphics
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            
            <div style={{ background: "var(--c-bgCard)", border: `1px solid ${C.ghost}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ height: 200, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${C.ghost}` }}>
                {/* Fallback visual since we don't have generated og-images yet, but we will assume they exist or can be generated */}
                <div style={{ color: C.dim, fontFamily: FONT.mono }}>[Preview: The Pleasure Gap]</div>
              </div>
              <div style={{ padding: "1.5rem" }}>
                <h3 style={{ fontFamily: FONT.display, color: C.textBright, marginBottom: "0.5rem" }}>The 6-for-6 Pleasure Gap</h3>
                <p style={{ fontSize: "0.85rem", color: C.muted, marginBottom: "1rem" }}>Our most striking physiological finding: the intact cohort scores higher across all 6 pleasure metrics.</p>
                <button 
                  onClick={() => window.open('/og-images/pleasure-gap.png', '_blank')}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.ghost}`, color: C.textBright, padding: "0.5rem 1rem", borderRadius: 4, cursor: "pointer", fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.75rem" }}
                >
                  <Download size={14} /> Download PNG
                </button>
              </div>
            </div>

            <div style={{ background: "var(--c-bgCard)", border: `1px solid ${C.ghost}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ height: 200, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${C.ghost}` }}>
                <div style={{ color: C.dim, fontFamily: FONT.mono }}>[Preview: The Convergence]</div>
              </div>
              <div style={{ padding: "1.5rem" }}>
                <h3 style={{ fontFamily: FONT.display, color: C.textBright, marginBottom: "0.5rem" }}>The Future Son Convergence</h3>
                <p style={{ fontSize: "0.85rem", color: C.muted, marginBottom: "1rem" }}>433 out of 500 respondents—including 78% of the circumcised cohort—would keep a future son intact.</p>
                <button 
                  onClick={() => window.open('/og-images/convergence.png', '_blank')}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.ghost}`, color: C.textBright, padding: "0.5rem 1rem", borderRadius: 4, cursor: "pointer", fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.75rem" }}
                >
                  <Download size={14} /> Download PNG
                </button>
              </div>
            </div>

          </div>
        </section>

        <section style={{ marginBottom: "4rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, color: C.blue, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem" }}>
            Social Copy Snippets
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[
              {
                title: "The Missing Consent",
                text: "The largest comparative survey of its kind found that 96% of respondents—across all backgrounds—believe a child should have the right to decide what happens to his own body. Explore the data: https://findings.circumsurvey.online"
              },
              {
                title: "The Regret Reality",
                text: "We're told infants don't remember and men don't care. But when 500 people were asked anonymously, 86% of infant-circumcised respondents reported experiencing resentment, loss, anger, or grief. Read their stories: https://findings.circumsurvey.online/explore#/pairs"
              },
              {
                title: "The Physiological Gap",
                text: "A new 500-person survey separated respondents by circumcision status. Across all six measures of sexual pleasure, sensitivity, and function, the intact cohort scored higher. See the breakdown: https://findings.circumsurvey.online/explore#/pleasure-gap"
              }
            ].map((snippet, i) => (
              <div key={i} style={{ background: "var(--c-bgCard)", border: `1px solid ${C.ghost}`, borderRadius: 8, padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ fontFamily: FONT.display, color: C.textBright, fontSize: "1.1rem" }}>{snippet.title}</h3>
                  <button 
                    id={`copy-btn-${i}`}
                    onClick={() => copyToClipboard(snippet.text, `copy-btn-${i}`)}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "transparent", border: "none", color: C.goldBright, cursor: "pointer", fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.75rem" }}
                  >
                    <Copy size={14} /> Copy Text
                  </button>
                </div>
                <div style={{ fontFamily: FONT.body, color: C.text, lineHeight: 1.5, padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: 4, fontStyle: "italic" }}>
                  "{snippet.text}"
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: "4rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, color: C.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem" }}>
            Printable Flyers (Grassroots Recruitment)
          </h2>
          <p style={{ fontSize: "0.9rem", color: C.muted, marginBottom: "1.5rem" }}>
            This survey spread primarily because advocates printed these flyers and posted them on college campuses and community boards. You can download the original PDFs here.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button 
              onClick={() => window.open('/flyers/recruitment-1.png', '_blank')}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.ghost}`, color: C.textBright, padding: "0.75rem 1.5rem", borderRadius: 4, cursor: "pointer", fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.85rem" }}
            >
              <Download size={16} /> Survey Flyer A (PNG)
            </button>
            <button 
              onClick={() => window.open('/flyers/recruitment-2.png', '_blank')}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.ghost}`, color: C.textBright, padding: "0.75rem 1.5rem", borderRadius: 4, cursor: "pointer", fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.85rem" }}
            >
              <Download size={16} /> Survey Flyer B (PNG)
            </button>
          </div>
        </section>

      </div>
      <GlobalFooter route="toolkit" navigate={(route) => window.location.href = `/${route}`} />
    </div>
  );
}
