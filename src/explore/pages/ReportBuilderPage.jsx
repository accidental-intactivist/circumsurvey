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

  const { reportItems, reportMeta, updateReportMeta, addTextBlock, updateTextBlock, removeFromReport, reorderReport, clearReport } = useReport();
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

  // Fetch all necessary data for the report question blocks
  useEffect(() => {
    let cancelled = false;
    if (reportItems.length === 0 || questions.length === 0) return;
    
    const toFetch = reportItems.filter(item => item.type === 'question' && !distributions[item.id]);
    
    toFetch.forEach(item => {
      const q = questions.find(q => q.id === item.refId);
      if (!q) return;

      const isGeographic = ["demo_country_born", "demo_country_current", "demo_us_state_born", "demo_us_state_current", "demo_can_province_born", "demo_can_province_current"].includes(item.refId);

      const promises = [getResponseDistribution(item.refId, { cohort: item.cohort })];
      
      if (q.type === "open_text" && !isGeographic) {
        promises.push(getNarratives(item.refId, { cohort: item.cohort }).catch(() => null));
      } else {
        promises.push(Promise.resolve(null));
      }

      if (isGeographic) {
         promises.push(getAggregate(item.refId, { by: "pathway", cohort: item.cohort }).catch(() => null));
      } else {
         promises.push(Promise.resolve(null));
      }

      Promise.all(promises).then(([distRes, narRes, pathRes]) => {
        if (!cancelled) {
          setDistributions(prev => ({
            ...prev,
            [item.id]: {
               distribution: distRes?.distribution || [],
               narratives: narRes?.narratives || null,
               byPathway: pathRes || null
            }
          }));
        }
      }).catch(e => console.error("Failed to fetch full data for", item.refId, e));
    });
    
    return () => { cancelled = true; };
  }, [reportItems, questions, distributions]);

  const moveUp = (index) => {
    if (index > 0) reorderReport(index, index - 1);
  };

  const moveDown = (index) => {
    if (index < reportItems.length - 1) reorderReport(index, index + 1);
  };

  const exportCSV = () => {
    let csv = "Question ID,Prompt,Cohort,Theme,Data\\n";
    reportItems.filter(item => item.type === 'question').forEach(item => {
      const q = questions.find(q => q.id === item.refId);
      if (!q) return;
      const data = distributions[item.id];
      const dist = data?.distribution;
      let dataStr = "";
      if (dist) {
        dataStr = dist.map(d => `${d.label}: ${d.n} (${d.pct.toFixed(1)}%)`).join(" | ");
      }
      csv += `"${q.id}","${q.prompt.replace(/"/g, '""')}","${item.cohort || 'All'}","${q.section || ''}","${dataStr}"\\n`;
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
    txt += `${reportMeta.title}\\n${reportMeta.subtitle ? reportMeta.subtitle + '\\n' : ''}${reportMeta.author ? 'By ' + reportMeta.author + '\\n' : ''}\\n`;
    
    reportItems.forEach((item, i) => {
      if (item.type === 'text') {
        txt += `--- TEXT BLOCK ---\\n${item.content}\\n\\n`;
      } else if (item.type === 'question') {
        const q = questions.find(q => q.id === item.refId);
        if (!q) return;
        txt += `${i + 1}. ${q.prompt}\\n`;
        txt += `ID: ${q.id} | Cohort: ${item.cohort || 'All'} | Section: ${q.section || 'N/A'}\\n`;
        const data = distributions[item.id];
        const dist = data?.distribution;
        if (dist) {
          dist.forEach(d => {
            const bars = "█".repeat(Math.round(d.pct / 5));
            txt += `  ${d.label.padEnd(25)} | ${String(d.n).padStart(4)} | ${bars} ${d.pct.toFixed(1)}%\\n`;
          });
        }
        txt += "\\n";
      } else if (item.type === 'ai_chat') {
        txt += `--- AI RESEARCH ASSISTANT ---\\n`;
        txt += `Q: ${item.query}\\n\\n`;
        txt += `${item.answer}\\n\\n`;
      }
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
          .print-only { display: block !important; }
          body { background: white !important; color: black !important; }
          .print-container { padding: 0 !important; max-width: 100% !important; }
          * { text-shadow: none !important; box-shadow: none !important; }
          .report-block { break-inside: avoid; margin-bottom: 2rem; border-color: #ddd !important; }
          .cover-page { height: 90vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; break-after: page; }
          .report-input-title { color: black !important; }
          input { color: black !important; }
        }
      `}</style>

      <div className="print-container" style={{ maxWidth: 900, margin: "0 auto" }}>
        
        {/* Action Toolbar */}
        {/* Action Toolbar */}
        {reportItems.length > 0 && (
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
          {/* Cover Page */}
          <div className="cover-page" style={{ marginBottom: "4rem" }}>
            <input 
              className="report-input-title"
              value={reportMeta.title}
              onChange={(e) => updateReportMeta({ title: e.target.value })}
              placeholder="Report Title"
              style={{
                fontFamily: FONT.display,
                fontWeight: 700,
                fontSize: "2.5rem",
                color: C.textBright,
                background: "transparent",
                border: "none",
                outline: "none",
                width: "100%",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBottom: "0.5rem",
              }}
            />
            <input 
              value={reportMeta.subtitle}
              onChange={(e) => updateReportMeta({ subtitle: e.target.value })}
              placeholder="Optional Subtitle or Description..."
              style={{
                fontFamily: FONT.body,
                fontSize: "1.1rem",
                color: C.muted,
                background: "transparent",
                border: "none",
                outline: "none",
                width: "100%",
                marginBottom: "0.5rem",
              }}
            />
            <input 
              value={reportMeta.author}
              onChange={(e) => updateReportMeta({ author: e.target.value })}
              placeholder="Author Name..."
              style={{
                fontFamily: FONT.condensed,
                fontSize: "0.9rem",
                color: C.dim,
                background: "transparent",
                border: "none",
                outline: "none",
                width: "100%",
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}
            />
          </div>

          {loading ? (
            <div style={{ color: C.muted, fontStyle: "italic" }}>Loading questions...</div>
          ) : reportItems.length === 0 ? (
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
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Top Insert Button */}
              <div className="no-print" style={{ textAlign: "center" }}>
                <button onClick={() => addTextBlock(0)} style={{ ...buttonStyle, fontSize: "0.65rem", padding: "0.2rem 0.6rem" }}>
                  + Add Text Block
                </button>
              </div>

              {reportItems.map((item, index) => {
                const isText = item.type === 'text';
                const isQuestion = item.type === 'question';
                
                let contentNode = null;
                
                if (isText) {
                  contentNode = (
                    <div style={{ width: "100%" }}>
                      <textarea
                        value={item.content}
                        onChange={(e) => updateTextBlock(item.id, e.target.value)}
                        placeholder="Write your analysis or narrative here..."
                        style={{
                          width: "100%",
                          minHeight: "100px",
                          background: "rgba(255,255,255,0.03)",
                          border: `1px solid ${C.ghost}`,
                          borderRadius: 8,
                          color: C.textBright,
                          fontFamily: FONT.body,
                          fontSize: "1rem",
                          padding: "1rem",
                          resize: "vertical",
                          outline: "none"
                        }}
                        onFocus={(e) => e.target.style.borderColor = C.gold}
                        onBlur={(e) => e.target.style.borderColor = C.ghost}
                        className="no-print"
                      />
                      {/* Print only view */}
                      <div className="print-only" style={{ display: "none", fontFamily: FONT.body, fontSize: "1rem", color: C.textBright, whiteSpace: "pre-wrap", padding: "1rem 0" }}>
                        {item.content || " "}
                      </div>
                    </div>
                  );
                } else if (isQuestion) {
                  const q = questions.find(q => q.id === item.refId);
                  if (!q) return null;
                  
                  const data = distributions[item.id];
                  const isGeographic = ["demo_country_born", "demo_country_current", "demo_us_state_born", "demo_us_state_current", "demo_can_province_born", "demo_can_province_current"].includes(q.id);
                  const isOpenText = q.type === "open_text" && !isGeographic;
                  
                  const displayDist = data ? { distribution: applyLikert(data.distribution, q) } : null;

                  contentNode = (
                    <div style={{ width: "100%", border: `1px solid ${C.ghost}`, borderRadius: 12, background: C.bgCard, overflow: "hidden" }}>
                      <div style={{ padding: "1.5rem 1.8rem" }}>
                        <span style={{ fontFamily: FONT.condensed, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, display: "block", marginBottom: "0.4rem" }}>
                          {item.cohort ? `COHORT: ${item.cohort.toUpperCase()} | ` : ''}{q.section || "General"}
                        </span>
                        <h2 style={{ fontFamily: FONT.display, fontSize: "1.35rem", color: C.textBright, lineHeight: 1.25, marginBottom: "1rem", letterSpacing: "-0.01em" }}>
                          {q.prompt}
                        </h2>
                        
                        {!data ? (
                          <div style={{ color: C.dim, fontStyle: "italic" }}>Loading data...</div>
                        ) : isOpenText ? (
                          <>
                            <WordCloud narratives={data.narratives || []} />
                            <div style={{ marginTop: "1.5rem" }}>
                              <NarrativeList distribution={data.narratives || []} cohort={item.cohort} />
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
                            cohort={item.cohort}
                          />
                        )}
                      </div>
                    </div>
                  );
                } else if (isAiChat) {
                  contentNode = (
                    <div style={{ width: "100%", border: `1px solid ${C.blue}`, borderRadius: 12, background: "rgba(0, 10, 40, 0.4)", overflow: "hidden" }}>
                      <div style={{ padding: "1.5rem 1.8rem" }}>
                        <span style={{ fontFamily: FONT.condensed, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.blue, display: "block", marginBottom: "0.4rem" }}>
                          AI Research Assistant
                        </span>
                        <h2 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, lineHeight: 1.25, marginBottom: "1rem", letterSpacing: "-0.01em", fontStyle: "italic" }}>
                          "{item.query}"
                        </h2>
                        <div style={{ color: C.textBright, fontFamily: FONT.body, lineHeight: 1.6, fontSize: "0.95rem" }} className="markdown-body">
                          <ReactMarkdown>{item.answer}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={item.id} className="report-block" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                      {/* Controls Sidebar */}
                      <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "0.2rem", marginTop: isText ? "1rem" : "1.5rem" }}>
                        <button 
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          style={{ background: "transparent", border: "none", color: index === 0 ? C.dim : C.muted, cursor: index === 0 ? "default" : "pointer", padding: "0 0.2rem", fontSize: "1rem" }}
                        >▲</button>
                        <button 
                          onClick={() => removeFromReport(item.id)}
                          style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", padding: "0.2rem", fontSize: "1.4rem", transition: "color 0.15s", lineHeight: 1 }}
                          onMouseEnter={e => e.target.style.color = C.red}
                          onMouseLeave={e => e.target.style.color = C.dim}
                          title="Remove from report"
                        >×</button>
                        <button 
                          onClick={() => moveDown(index)}
                          disabled={index === reportItems.length - 1}
                          style={{ background: "transparent", border: "none", color: index === reportItems.length - 1 ? C.dim : C.muted, cursor: index === reportItems.length - 1 ? "default" : "pointer", padding: "0 0.2rem", fontSize: "1rem" }}
                        >▼</button>
                      </div>
                      
                      {/* Main Content */}
                      <div style={{ flex: 1 }}>
                        {contentNode}
                      </div>
                    </div>

                    {/* Insert Text Block Button Below */}
                    <div className="no-print" style={{ textAlign: "center", margin: "0.5rem 0" }}>
                      <button onClick={() => addTextBlock(index + 1)} style={{ ...buttonStyle, fontSize: "0.65rem", padding: "0.2rem 0.6rem" }}>
                        + Add Text Block
                      </button>
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
