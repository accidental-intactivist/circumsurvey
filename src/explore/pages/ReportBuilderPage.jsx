import { useEffect, useState, useRef } from "react";
import { useReport } from "../contexts/ReportContext";
import { C, FONT } from "../styles/tokens";
import { getQuestions, getResponseDistribution } from "../lib/api";
import QuestionRow from "../components/QuestionRow";
import ThemeToggle from "../components/ThemeToggle";

export default function ReportBuilderPage({ navigate }) {
  const { reportItems, removeFromReport, reorderReport, clearReport } = useReport();
  const [questions, setQuestions] = useState([]);
  const [distributions, setDistributions] = useState({});
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getQuestions({ counts: true }).then((data) => {
      if (cancelled) return;
      setQuestions(data.questions || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Fetch distributions for sparklines & CSV
  useEffect(() => {
    let cancelled = false;
    if (reportItems.length === 0) return;
    
    // Only fetch those we don't have
    const toFetch = reportItems.filter(id => !distributions[id]);
    
    toFetch.forEach(id => {
      getResponseDistribution(id).then(d => {
        if (!cancelled) {
          setDistributions(prev => ({ ...prev, [id]: d.distribution }));
        }
      }).catch(e => console.error("Failed to fetch dist for", id, e));
    });
    
    return () => { cancelled = true; };
  }, [reportItems]);

  const reportQuestions = reportItems
    .map(id => questions.find(q => q.id === id))
    .filter(Boolean);

  const moveUp = (index) => {
    if (index > 0) reorderReport(index, index - 1);
  };

  const moveDown = (index) => {
    if (index < reportItems.length - 1) reorderReport(index, index + 1);
  };

  const exportCSV = () => {
    let csv = "Question ID,Prompt,Theme,Data\\n";
    reportQuestions.forEach(q => {
      const dist = distributions[q.id];
      let dataStr = "";
      if (dist) {
        dataStr = dist.map(d => `${d.label}: ${d.n} (${d.pct.toFixed(1)}%)`).join(" | ");
      }
      csv += `"${q.id}","${q.prompt.replace(/"/g, '""')}","${q.section || ''}","${dataStr}"\\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "circumsurvey_report.csv";
    link.click();
  };

  const exportText = () => {
    let txt = "=== CIRCUMSURVEY CUSTOM REPORT ===\\n\\n";
    reportQuestions.forEach((q, i) => {
      txt += `${i + 1}. ${q.prompt}\\n`;
      txt += `ID: ${q.id} | Section: ${q.section || 'N/A'}\\n`;
      const dist = distributions[q.id];
      if (dist) {
        dist.forEach(d => {
          const bars = "█".repeat(Math.round(d.pct / 5));
          txt += `  ${d.label.padEnd(25)} | ${String(d.n).padStart(4)} | ${bars} ${d.pct.toFixed(1)}%\\n`;
        });
      }
      txt += "\\n";
    });
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "circumsurvey_report.txt";
    link.click();
  };

  const exportImage = async () => {
    if (!reportRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(reportRef.current, { 
        backgroundColor: C.bg,
        style: { padding: "2rem" } 
      });
      const link = document.createElement('a');
      link.download = `circumsurvey-report.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to capture image", err);
    }
  };

  const buttonStyle = {
    background: "transparent",
    border: `1px solid ${C.ghost}`,
    color: C.muted,
    fontFamily: FONT.condensed,
    fontSize: "0.7rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "0.4rem 0.8rem",
    borderRadius: 4,
    cursor: "pointer",
    transition: "all 0.15s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      padding: "1.5rem 1.1rem 5rem",
    }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-container { padding: 0 !important; }
          * { text-shadow: none !important; box-shadow: none !important; }
        }
      `}</style>

      <div className="print-container" style={{ maxWidth: 900, margin: "0 auto" }}>
        
        {/* Header */}
        <div className="no-print" style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}>
          <a href="#/" style={{
            fontFamily: FONT.condensed,
            fontSize: "0.8rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: C.gold,
            textDecoration: "none"
          }}>← Back to Index</a>
          
          <div style={{ flex: 1 }} />

          {reportQuestions.length > 0 && (
            <>
              <button style={buttonStyle} onClick={exportCSV}
                onMouseEnter={(e) => { e.target.style.color = C.goldBright; e.target.style.borderColor = C.gold; }}
                onMouseLeave={(e) => { e.target.style.color = C.muted; e.target.style.borderColor = C.ghost; }}>
                📊 Export CSV
              </button>
              <button style={buttonStyle} onClick={exportText}
                onMouseEnter={(e) => { e.target.style.color = C.goldBright; e.target.style.borderColor = C.gold; }}
                onMouseLeave={(e) => { e.target.style.color = C.muted; e.target.style.borderColor = C.ghost; }}>
                📝 Export Text
              </button>
              <button style={buttonStyle} onClick={exportImage}
                onMouseEnter={(e) => { e.target.style.color = C.goldBright; e.target.style.borderColor = C.gold; }}
                onMouseLeave={(e) => { e.target.style.color = C.muted; e.target.style.borderColor = C.ghost; }}>
                📸 Save as Image
              </button>
              <button style={buttonStyle} onClick={() => window.print()}
                onMouseEnter={(e) => { e.target.style.color = C.goldBright; e.target.style.borderColor = C.gold; }}
                onMouseLeave={(e) => { e.target.style.color = C.muted; e.target.style.borderColor = C.ghost; }}>
                🖨️ Print / PDF
              </button>
              <button style={{...buttonStyle, color: C.red, borderColor: "transparent"}} onClick={clearReport}
                onMouseEnter={(e) => { e.target.style.background = "rgba(217,79,79,0.1)"; }}
                onMouseLeave={(e) => { e.target.style.background = "transparent"; }}>
                Clear All
              </button>
            </>
          )}
          <div style={{ width: "1px", height: "24px", background: C.ghost }} />
          <ThemeToggle />
        </div>

        <div ref={reportRef}>
          <h1 style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: "2.5rem",
            color: C.textBright,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: "0.5rem",
          }}>Custom Narrative Report</h1>
          <p style={{
            fontFamily: FONT.body,
            fontSize: "1.1rem",
            color: C.muted,
            marginBottom: "3rem",
          }}>
            {reportQuestions.length} {reportQuestions.length === 1 ? 'item' : 'items'} selected from the inquiry.
          </p>

          {loading ? (
            <div style={{ color: C.muted, fontStyle: "italic" }}>Loading questions...</div>
          ) : reportQuestions.length === 0 ? (
            <div style={{ 
              padding: "4rem", 
              textAlign: "center", 
              border: `1px dashed ${C.ghost}`,
              borderRadius: 8,
              color: C.dim
            }}>
              Your report is empty. Browse the Master Index to add questions here.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {reportQuestions.map((q, index) => (
                <div key={q.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <button 
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      style={{
                        background: "transparent", border: "none", color: index === 0 ? C.dim : C.muted,
                        cursor: index === 0 ? "default" : "pointer", padding: "0 0.2rem", fontSize: "0.8rem"
                      }}
                    >▲</button>
                    <button 
                      onClick={() => moveDown(index)}
                      disabled={index === reportQuestions.length - 1}
                      style={{
                        background: "transparent", border: "none", color: index === reportQuestions.length - 1 ? C.dim : C.muted,
                        cursor: index === reportQuestions.length - 1 ? "default" : "pointer", padding: "0 0.2rem", fontSize: "0.8rem"
                      }}
                    >▼</button>
                  </div>
                  
                  <div style={{ flex: 1, border: `1px solid ${C.ghost}`, borderRadius: 6, overflow: "hidden" }}>
                    <QuestionRow 
                      q={q} 
                      index={index} 
                      distribution={distributions[q.id]}
                      onClick={() => {
                        window.open(`#/q/${q.id}`, "_blank");
                      }}
                    />
                  </div>

                  <button 
                    className="no-print"
                    onClick={() => removeFromReport(q.id)}
                    style={{
                      background: "transparent", border: "none", color: C.dim,
                      cursor: "pointer", padding: "0.5rem", fontSize: "1.2rem",
                      transition: "color 0.15s"
                    }}
                    onMouseEnter={e => e.target.style.color = C.red}
                    onMouseLeave={e => e.target.style.color = C.dim}
                    title="Remove from report"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
