import { useState, useEffect } from 'react';
import { C, FONT } from "../styles/tokens";
import { getPendingProposals, approveProposal, rejectProposal, resetProposals } from "../lib/orchestratorMock";
import { useNarrativeConfig, DEFAULT_CONFIG, updateNarrativeConfig } from "../lib/narrativeConfig";

export default function EditorialDashboardPage() {
  const [proposals, setProposals] = useState([]);
  const { config, updateConfig } = useNarrativeConfig();
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsUnlocked(localStorage.getItem("cs_editorial_unlocked") === "true");
    }
    setProposals(getPendingProposals());
  }, []);

  if (!isUnlocked) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT.body, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: FONT.display, color: C.red, marginBottom: "1rem" }}>Access Denied</h1>
          <p style={{ color: C.muted }}>The editorial channel is currently locked.</p>
          <a href="#/" style={{ color: C.goldBright, textDecoration: "underline", marginTop: "1rem", display: "inline-block" }}>Return to Explore</a>
        </div>
      </div>
    );
  }

  const handleApprove = (id) => {
    approveProposal(id, config, updateConfig);
    setProposals(getPendingProposals());
  };

  const handleReject = (id) => {
    rejectProposal(id);
    setProposals(getPendingProposals());
  };

  const pendingProps = proposals.filter(p => p.status === 'pending');
  const resolvedProps = proposals.filter(p => p.status !== 'pending');

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT.body, padding: "2rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontFamily: FONT.display, color: C.goldBright, borderBottom: `1px solid ${C.ghost}`, paddingBottom: "1rem" }}>
          Human-in-the-Loop Editorial Dashboard
        </h1>
        <p style={{ color: C.muted, marginBottom: "2rem" }}>
          Review changes proposed by the dynamic narrative orchestrator based on user engagement telemetry.
        </p>
        
        <h2 style={{ fontFamily: FONT.condensed, color: C.textBright, letterSpacing: "0.1em", textTransform: "uppercase" }}>Pending Proposals</h2>
        {pendingProps.length === 0 && <div style={{ padding: "2rem", background: C.bgCard, borderRadius: 8, border: `1px solid ${C.ghost}`, color: C.muted }}>No pending proposals.</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
          {pendingProps.map(p => (
            <div key={p.id} style={{ background: C.bgCard, border: `1px solid ${C.gold}`, borderRadius: 8, padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                  <span style={{ fontFamily: FONT.mono, fontSize: "0.75rem", color: C.gold, background: "rgba(212,160,48,0.1)", padding: "0.2rem 0.5rem", borderRadius: 4 }}>
                    {p.type}
                  </span>
                  <h3 style={{ margin: "0.5rem 0", color: C.textBright, fontFamily: FONT.display }}>Target: {p.target}</h3>
                  {p.badge && <div style={{ fontSize: "0.85rem", color: C.muted }}>Proposed Badge: <strong>{p.badge}</strong></div>}
                </div>
              </div>
              <p style={{ color: C.muted, fontStyle: "italic", borderLeft: `2px solid ${C.ghost}`, paddingLeft: "1rem" }}>
                "{p.reason}"
              </p>
              
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button 
                  onClick={() => handleApprove(p.id)}
                  style={{ background: C.gold, color: C.bg, border: "none", padding: "0.5rem 1rem", borderRadius: 4, cursor: "pointer", fontFamily: FONT.condensed, fontWeight: "bold" }}>
                  Approve
                </button>
                <button 
                  onClick={() => handleReject(p.id)}
                  style={{ background: "transparent", color: C.red, border: `1px solid ${C.red}`, padding: "0.5rem 1rem", borderRadius: 4, cursor: "pointer", fontFamily: FONT.condensed, fontWeight: "bold" }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <h2 style={{ fontFamily: FONT.condensed, color: C.textBright, letterSpacing: "0.1em", textTransform: "uppercase" }}>Resolved Proposals</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {resolvedProps.map(p => (
            <div key={p.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.ghost}`, borderRadius: 8, padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ color: C.textBright }}>{p.target}</span> <span style={{ color: C.dim }}>({p.type})</span>
              </div>
              <div style={{ color: p.status === 'approved' ? C.goldBright : C.red, fontFamily: FONT.condensed, textTransform: "uppercase" }}>
                {p.status}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: `1px solid ${C.ghost}`, display: "flex", gap: "1rem" }}>
          <button 
            onClick={() => {
              resetProposals();
              setProposals(getPendingProposals());
            }}
            style={{ background: "transparent", border: `1px solid ${C.ghost}`, color: C.muted, padding: "0.5rem 1rem", borderRadius: 4, cursor: "pointer", fontFamily: FONT.condensed }}
          >
            Reset Proposals
          </button>
          
          <button 
            onClick={() => {
              updateNarrativeConfig(DEFAULT_CONFIG);
            }}
            style={{ background: "transparent", border: `1px solid ${C.ghost}`, color: C.muted, padding: "0.5rem 1rem", borderRadius: 4, cursor: "pointer", fontFamily: FONT.condensed }}
          >
            Reset Narrative Config
          </button>
        </div>
      </div>
    </div>
  );
}
