import { useEffect, useState, useRef, useMemo } from "react";
import { useReport } from "../contexts/ReportContext";
import { C, FONT } from "../styles/tokens";
import { getQuestions, getResponseDistribution, getNarratives, getAggregate } from "../lib/api";
import { applyLikert } from "../lib/formatters";
import DistributionChart from "../components/DistributionChart";
import GeographicHeatmap from "../components/GeographicHeatmap";
import NarrativeList from "../components/NarrativeList";
import WordCloud from "../components/WordCloud";

export default function ReportBuilderPage({ routerState, navigate, updateState, setExhibitContext }) {
  const { cohort } = routerState;

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        exhibitName: "Custom Report Builder",
        exhibitDescription: "User's customized report containing saved charts and narratives.",
        cohort
      });
    }
  }, [cohort, setExhibitContext]);

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

  // Fetch all necessary data for the report items
  useEffect(() => {
    let cancelled = false;
    if (reportItems.length === 0 || questions.length === 0) return;
    
    const toFetch = reportItems.filter(id => !distributions[id]);
    
    toFetch.forEach(id => {
      const q = questions.find(q => q.id === id);
      if (!q) return;

      const isGeographic = ["demo_country_born", "demo_country_current", "demo_us_state_born", "demo_us_state_current", "demo_can_province_born", "demo_can_province_current"].includes(id);

      const promises = [getResponseDistribution(id)];
      
      if (q.type === "open_text" && !isGeographic) {
        promises.push(getNarratives(id).catch(() => null));
      } else {
        promises.push(Promise.resolve(null));
      }

      if (isGeographic) {
         promises.push(getAggregate(id, { by: "pathway" }).catch(() => null));
      } else {
         promises.push(Promise.resolve(null));
      }

      Promise.all(promises).then(([distRes, narRes, pathRes]) => {
        if (!cancelled) {
          setDistributions(prev => ({
            ...prev,
            [id]: {
               distribution: distRes?.distribution || [],
               narratives: narRes?.narratives || null,
               byPathway: pathRes || null
            }
          }));
        }
      }).catch(e => console.error("Failed to fetch full data for", id, e));
    });
    
    return () => { cancelled = true; };
  }, [reportItems, questions, distributions]);

  const reportQuestions = useMemo(() => {
    return reportItems
      .map(id => questions.find(q => q.id === id))
      .filter(Boolean);
  }, [reportItems, questions]);

  const moveUp = (index) => {
    if (index > 0) reorderReport(index, index - 1);
  };

  const moveDown = (index) => {
    if (index < reportItems.length - 1) reorderReport(index, index + 1);
  };

  const exportCSV = () => {
    let csv = "Question ID,Prompt,Theme,Data\\n";
    reportQuestions.forEach(q => {
      const data = distributions[q.id];
      const dist = data?.distribution;
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
      const data = distributions[q.id];
      const dist = data?.distribution;
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
          .report-block { break-inside: avoid; margin-bottom: 2rem; border-color: #ddd !important; }
        }
      `}</style>

      <div className="print-container" style={{ maxWidth: 900, margin: "0 auto" }}>
        
        {/* Action Toolbar */}
        {reportQuestions.length > 0 && (
          <div className="no-print" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.8rem",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            paddingBottom: "1.5rem",
            borderBottom: `1px solid ${C.ghost}`
          }}>
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
            <div style={{ width: "1px", height: "20px", background: C.ghost }} />
            <button style={{...buttonStyle, color: C.red, borderColor: "transparent"}} onClick={clearReport}
              onMouseEnter={(e) => { e.target.style.background = "rgba(217,79,79,0.1)"; }}
              onMouseLeave={(e) => { e.target.style.background = "transparent"; }}>
              Clear All
            </button>
          </div>
        )}

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
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {reportQuestions.map((q, index) => {
                const data = distributions[q.id];
                const isGeographic = ["demo_country_born", "demo_country_current", "demo_us_state_born", "demo_us_state_current", "demo_can_province_born", "demo_can_province_current"].includes(q.id);
                const isOpenText = q.type === "open_text" && !isGeographic;
                
                const displayDist = data ? { distribution: applyLikert(data.distribution, q) } : null;

                return (
                  <div key={q.id} className="report-block" style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                    <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "0.2rem", marginTop: "1.5rem" }}>
                      <button 
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        style={{
                          background: "transparent", border: "none", color: index === 0 ? C.dim : C.muted,
                          cursor: index === 0 ? "default" : "pointer", padding: "0 0.2rem", fontSize: "1rem"
                        }}
                      >▲</button>
                      <button 
                        onClick={() => moveDown(index)}
                        disabled={index === reportQuestions.length - 1}
                        style={{
                          background: "transparent", border: "none", color: index === reportQuestions.length - 1 ? C.dim : C.muted,
                          cursor: index === reportQuestions.length - 1 ? "default" : "pointer", padding: "0 0.2rem", fontSize: "1rem"
                        }}
                      >▼</button>
                    </div>
                    
                    <div style={{ 
                      flex: 1, 
                      border: `1px solid ${C.ghost}`, 
                      borderRadius: 12, 
                      background: C.bgCard,
                      overflow: "hidden" 
                    }}>
                      <div style={{ padding: "1.5rem 1.8rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                          <div>
                            <span style={{
                              fontFamily: FONT.condensed, fontSize: "0.65rem", fontWeight: 700,
                              letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold,
                              display: "block", marginBottom: "0.4rem"
                            }}>{q.section || "General"}</span>
                            <h2 style={{ 
                              fontFamily: FONT.display, fontSize: "1.35rem", color: C.textBright, 
                              lineHeight: 1.25, marginBottom: "1rem", letterSpacing: "-0.01em"
                            }}>
                              {index + 1}. {q.prompt}
                            </h2>
                            {q.subtitle && (
                              <p style={{
                                fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted,
                                fontStyle: "italic", marginBottom: "1.5rem"
                              }}>{q.subtitle}</p>
                            )}
                          </div>
                          <button 
                            className="no-print"
                            onClick={() => removeFromReport(q.id)}
                            style={{
                              background: "transparent", border: "none", color: C.dim,
                              cursor: "pointer", padding: "0.2rem", fontSize: "1.4rem",
                              transition: "color 0.15s", lineHeight: 1
                            }}
                            onMouseEnter={e => e.target.style.color = C.red}
                            onMouseLeave={e => e.target.style.color = C.dim}
                            title="Remove from report"
                          >×</button>
                        </div>

                        {!data ? (
                          <div style={{ color: C.dim, fontStyle: "italic" }}>Loading data...</div>
                        ) : isOpenText ? (
                          <>
                            <WordCloud narratives={data.narratives || []} />
                            <div style={{ marginTop: "1.5rem" }}>
                              <NarrativeList distribution={data.narratives || []} />
                            </div>
                          </>
                        ) : isGeographic ? (
                          <GeographicHeatmap 
                            questionId={q.id}
                            title="Geographic distribution"
                            distribution={{ distribution: data.distribution || [] }}
                            byPathway={data.byPathway}
                          />
                        ) : (
                          <DistributionChart 
                            distribution={displayDist} 
                            title="Distribution" 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
