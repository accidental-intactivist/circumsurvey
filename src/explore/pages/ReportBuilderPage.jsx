import { Component, useEffect, useState, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { useReport } from "../contexts/ReportContext";
import { C, FONT } from "../styles/tokens";
import { getQuestions, getResponseDistribution, getNarratives, getAggregate } from "../lib/api";
import { applyLikert } from "../lib/formatters";
import DistributionChart from "../components/DistributionChart";
import GeographicHeatmap from "../components/GeographicHeatmap";
import NarrativeList from "../components/NarrativeList";
import WordCloud from "../components/WordCloud";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as Icons from "../components/Icons";

// Human-readable labels for exhibit blocks added from the interactive explorers.
const EXHIBIT_LABELS = {
  factor_grid: { title: "Factor Grid", route: "numbers", exhibit: "Exhibit 12 · By the Numbers" },
  correlation_matrix: { title: "Correlation Matrix", route: "correlations", exhibit: "Exhibit 04 · Correlations Explorer" },
};

function SortablePill({ item, index, moveUp, moveDown, removeFromReport, updateTextBlock, isLast, questions }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: transform ? 1 : 0,
    position: transform ? "relative" : "static",
  };

  const isText = item.type === 'text';
  const isQuestion = item.type === 'question';
  const isAiChat = item.type === 'ai_chat';
  const isExhibit = item.type === 'exhibit';

  let typeLabel = "BLOCK";
  let title = "Unknown Item";
  let metaText = `POS ${index + 1}`;

  if (isText) {
    typeLabel = "TEXT";
    title = item.content || "Empty text block";
  } else if (isQuestion) {
    const q = questions.find(q => q.id === item.refId);
    if (q) {
      typeLabel = q.type === "open_text" ? "QUOTE" : "STAT";
      title = q.prompt;
      metaText = `${q.section || 'General'} • ${item.cohort ? item.cohort.toUpperCase() : 'ALL'}`;
    }
  } else if (isAiChat) {
    typeLabel = "AI";
    title = item.query;
    metaText = "RESEARCH ASST";
  } else if (isExhibit) {
    typeLabel = "STATION";
    const meta = EXHIBIT_LABELS[item.exhibitType] || { title: item.exhibitType };
    title = meta.title;
    metaText = `PLATE ${index + 1}`;
  }

  return (
    <div ref={setNodeRef} style={style} className="report-pill">
      <div className="pill-drag" title="Drag to reorder" {...attributes} {...listeners}>
        ::
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
        {index > 0 ? <span onClick={() => moveUp(index)} style={{cursor:"pointer", color:C.textBright, fontSize: '0.6rem'}}>▲</span> : <span style={{opacity:0.2, fontSize: '0.6rem'}}>▲</span>}
        {index < isLast ? <span onClick={() => moveDown(index)} style={{cursor:"pointer", color:C.textBright, fontSize: '0.6rem'}}>▼</span> : <span style={{opacity:0.2, fontSize: '0.6rem'}}>▼</span>}
      </div>
      <div className="pill-type" style={{ borderColor: typeLabel === 'QUOTE' ? 'var(--c-gold)' : 'var(--c-blue)', color: typeLabel === 'QUOTE' ? 'var(--c-goldBright)' : 'var(--c-blue)' }}>
        {typeLabel}
      </div>
      <div className="pill-title">
        {isText ? (
          <input 
            value={item.content}
            onChange={(e) => updateTextBlock(item.id, e.target.value)}
            placeholder="Type text here..."
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "inherit", fontFamily: "inherit", fontSize: "inherit" }}
          />
        ) : title}
      </div>
      <div className="pill-meta">{metaText}</div>
      <button className="pill-close" onClick={() => removeFromReport(item.id)}>✕</button>
    </div>
  );
}

// A block that renders nothing must never take the whole report down with it.
class BlockErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error("Report block failed to render:", error);
  }
  render() {
    if (this.state.failed) {
      return (
        <div style={{ width: "100%", border: `1px dashed ${C.ghost}`, borderRadius: 8, padding: "1.25rem", color: C.dim, fontStyle: "italic" }}>
          This block could not be displayed. Try removing and re-adding it.
        </div>
      );
    }
    return this.props.children;
  }
}

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = reportItems.findIndex((item) => item.id === active.id);
      const newIndex = reportItems.findIndex((item) => item.id === over.id);
      reorderReport(oldIndex, newIndex);
    }
  };

  const exportCSV = () => {
    let csv = "Question ID,Prompt,Cohort,Theme,Data\n";
    reportItems.filter(item => item.type === 'question').forEach(item => {
      const q = questions.find(q => q.id === item.refId);
      if (!q) return;
      const data = distributions[item.id];
      const dist = data?.distribution;
      let dataStr = "";
      if (dist) {
        dataStr = dist.map(d => `${d.label}: ${d.n} (${d.pct.toFixed(1)}%)`).join(" | ");
      }
      csv += `"${q.id}","${q.prompt.replace(/"/g, '""')}","${item.cohort || 'All'}","${q.section || ''}","${dataStr}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "circumsurvey_report.csv";
    link.click();
  };

  const exportText = () => {
    let txt = "=== CIRCUMSURVEY CUSTOM REPORT ===\n\n";
    txt += `${reportMeta.title}\n${reportMeta.subtitle ? reportMeta.subtitle + '\n' : ''}${reportMeta.author ? 'By ' + reportMeta.author + '\n' : ''}\n`;

    reportItems.forEach((item, i) => {
      if (item.type === 'text') {
        txt += `--- TEXT BLOCK ---\n${item.content}\n\n`;
      } else if (item.type === 'question') {
        const q = questions.find(q => q.id === item.refId);
        if (!q) return;
        txt += `${i + 1}. ${q.prompt}\n`;
        txt += `ID: ${q.id} | Cohort: ${item.cohort || 'All'} | Section: ${q.section || 'N/A'}\n`;
        const data = distributions[item.id];
        const dist = data?.distribution;
        if (dist) {
          dist.forEach(d => {
            const bars = "█".repeat(Math.round(d.pct / 5));
            txt += `  ${d.label.padEnd(25)} | ${String(d.n).padStart(4)} | ${bars} ${d.pct.toFixed(1)}%\n`;
          });
        }
        txt += "\n";
      } else if (item.type === 'exhibit') {
        const meta = EXHIBIT_LABELS[item.exhibitType] || { title: item.exhibitType };
        txt += `--- EXHIBIT: ${meta.title} ---\n`;
        if (item.cohort) txt += `Cohort: ${item.cohort}\n`;
        if (item.config && Object.keys(item.config).length) {
          txt += `Parameters: ${Object.entries(item.config).map(([k, v]) => `${k}=${v}`).join(", ")}\n`;
        }
        txt += "\n";
      } else if (item.type === 'ai_chat') {
        txt += `--- AI RESEARCH ASSISTANT ---\n`;
        txt += `Q: ${item.query}\n\n`;
        txt += `${item.answer}\n\n`;
      }
    });
    txt += `\n---\nSource: The Accidental Intactivist's Inquiry · circumsurvey.online\n`;
    txt += `Self-selected online sample; figures describe respondents, not the general population.\n`;
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
        style: { padding: "2rem" },
        // Keep the editing chrome (move/remove arrows, "+ Add Text Block")
        // out of the exported image — .no-print is otherwise print-only CSS.
        filter: (node) => !(node.classList && node.classList.contains("no-print")),
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
      background: "var(--c-bgDeep)",
      color: C.text,
      fontFamily: FONT.body,
      padding: "4rem 2rem 6rem",
    }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { 
            display: block !important; 
            position: static !important;
            width: auto !important;
            opacity: 1 !important;
          }
          body { background: white !important; color: black !important; }
          .print-container { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
          * { text-shadow: none !important; box-shadow: none !important; }
          .report-block { break-inside: avoid; margin-bottom: 2rem; border-color: #ddd !important; }
          .cover-page { height: 90vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; break-after: page; }
          .report-input-title { color: black !important; border: none !important; background: transparent !important; }
          input { color: black !important; border: none !important; background: transparent !important; }
        }
        @media screen {
          .print-only { 
            position: absolute !important;
            top: -9999px !important;
            left: -9999px !important;
            width: 1000px !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        }
        .report-pill {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #fff;
          border: 1px solid var(--c-ghost);
          border-radius: 6px;
          padding: 0.75rem 1rem;
          margin-bottom: 0.5rem;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .report-pill:hover {
          border-color: var(--c-dim);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .pill-drag {
          color: var(--c-ghost);
          cursor: grab;
          font-family: monospace;
          font-size: 1.2rem;
          user-select: none;
        }
        .pill-type {
          font-family: ${FONT.condensed};
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--c-blue);
          border: 1px solid rgba(0, 150, 200, 0.2);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          min-width: 60px;
          text-align: center;
        }
        .pill-title {
          font-family: ${FONT.display};
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--c-textBright);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pill-meta {
          font-family: ${FONT.condensed};
          font-size: 0.65rem;
          color: var(--c-dim);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .pill-close {
          background: transparent;
          border: none;
          color: var(--c-dim);
          cursor: pointer;
          font-size: 1rem;
          padding: 0.2rem 0.5rem;
          transition: color 0.15s;
        }
        .pill-close:hover {
          color: var(--c-redBright);
        }
        .desk-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        @media (min-width: 900px) {
          .desk-layout {
            grid-template-columns: 1fr 280px;
          }
        }
        .issue-btn {
          width: 100%;
          font-family: ${FONT.condensed};
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.9rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 0.75rem;
          text-align: center;
        }
        .issue-btn-primary {
          background: var(--c-blue);
          color: #fff;
          border: 1px solid var(--c-blue);
        }
        .issue-btn-primary:hover {
          filter: brightness(1.15);
        }
        .issue-btn-secondary {
          background: transparent;
          color: var(--c-blue);
          border: 1px solid var(--c-blue);
        }
        .issue-btn-secondary:hover {
          background: rgba(0, 150, 200, 0.05);
        }
      `}</style>

      {/* PASTE-UP DESK SCREEN VIEW */}
      <div className="desk-layout no-print" style={{
        background: "var(--c-bgCard)",
        border: `1px solid ${C.ghost}`,
        borderTop: `4px solid var(--c-redBright)`,
        borderRadius: 12,
        padding: "3.5rem 3rem",
        boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
        maxWidth: 1100,
      }}>
        {/* Left Column: Report Builder */}
        <div>
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ 
                width: "28px", 
                height: "28px", 
                background: "var(--c-redBright)", 
                borderRadius: "50%", 
                margin: "0 auto 1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontFamily: FONT.display,
                fontWeight: 700,
                fontSize: "14px"
              }}>
                R
              </div>
              <div style={{ 
                fontFamily: FONT.condensed, 
                fontSize: "0.75rem", 
                fontWeight: 700, 
                letterSpacing: "0.15em", 
                textTransform: "uppercase", 
                color: "var(--c-redBright)", 
              }}>
                YOUR REPORT
              </div>
            </div>
            
            <textarea 
              value={reportMeta.title}
              onChange={(e) => updateReportMeta({ title: e.target.value })}
              placeholder="REPORT TITLE"
              rows={1}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              style={{
                fontFamily: FONT.condensed,
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: C.textBright,
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${C.ghost}`,
                outline: "none",
                width: "100%",
                lineHeight: 1.2,
                paddingBottom: "0.5rem",
                marginBottom: "1rem",
                resize: "none",
                overflow: "hidden",
                textAlign: "center"
              }}
            />
            <textarea 
              value={reportMeta.subtitle}
              onChange={(e) => updateReportMeta({ subtitle: e.target.value })}
              placeholder="Add an optional introduction or description for your report..."
              rows={2}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onFocus={(e) => {
                e.target.style.border = `1px solid var(--c-gold)`;
                e.target.style.background = "var(--c-bgCard)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px dashed var(--c-ghost)";
                e.target.style.background = "var(--c-bgSoft)";
              }}
              style={{
                fontFamily: FONT.body,
                fontSize: "1rem",
                color: C.text,
                background: "var(--c-bgSoft)",
                border: "1px dashed var(--c-ghost)",
                borderRadius: "6px",
                padding: "1rem",
                outline: "none",
                width: "100%",
                resize: "none",
                overflow: "hidden",
                textAlign: "center",
                transition: "all 0.2s ease"
              }}
            />
          </div>

          {loading ? (
            <div style={{ color: C.muted, fontStyle: "italic" }}>Loading data...</div>
          ) : reportItems.length === 0 ? (
            <div style={{ 
              padding: "4rem 2rem", 
              border: `1px dashed ${C.ghost}`, 
              borderRadius: 8, 
              background: "rgba(255,255,255,0.4)",
              color: C.dim,
              textAlign: "left"
            }}>
              <div style={{
                fontFamily: FONT.display,
                fontSize: "1.5rem",
                fontWeight: 800,
                color: C.textBright,
                marginBottom: "1rem"
              }}>
                Welcome to the Paste-Up Desk
              </div>
              <div style={{ fontFamily: FONT.body, fontSize: "1rem", lineHeight: 1.6, color: C.text, marginBottom: "2rem", maxWidth: "600px" }}>
                This is your workspace for assembling custom research reports. You can pull data from anywhere in the survey and arrange it here into a single, cohesive document.
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--c-blue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.condensed, fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>1</div>
                  <div>
                    <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: C.textBright, marginBottom: "0.25rem" }}>Browse the Index</div>
                    <div style={{ fontFamily: FONT.body, fontSize: "0.9rem", color: C.muted }}>Explore the exhibits, demographic filters, and survey questions.</div>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
                      <button onClick={() => navigate("index")} style={{ background: "rgba(0,0,0,0.05)", border: `1px solid ${C.ghost}`, borderRadius: 4, padding: "0.3rem 0.6rem", fontFamily: FONT.condensed, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", color: C.textBright, cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = C.blue} onMouseLeave={(e) => e.currentTarget.style.borderColor = C.ghost}>Master Index</button>
                      <button onClick={() => navigate("pleasure-gap")} style={{ background: "rgba(0,0,0,0.05)", border: `1px solid ${C.ghost}`, borderRadius: 4, padding: "0.3rem 0.6rem", fontFamily: FONT.condensed, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", color: C.textBright, cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = C.blue} onMouseLeave={(e) => e.currentTarget.style.borderColor = C.ghost}>The Pleasure Gap</button>
                      <button onClick={() => navigate("narrative-mirrors")} style={{ background: "rgba(0,0,0,0.05)", border: `1px solid ${C.ghost}`, borderRadius: 4, padding: "0.3rem 0.6rem", fontFamily: FONT.condensed, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", color: C.textBright, cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = C.blue} onMouseLeave={(e) => e.currentTarget.style.borderColor = C.ghost}>Narratives</button>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--c-gold)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.condensed, fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>2</div>
                  <div>
                    <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: C.textBright, marginBottom: "0.25rem" }}>Clip Findings</div>
                    <div style={{ fontFamily: FONT.body, fontSize: "0.9rem", color: C.muted }}>Whenever you see a chart, narrative, or statistic you want to keep, click the <span style={{ padding: "0 0.3rem", background: "rgba(0,0,0,0.05)", border: `1px solid ${C.ghost}`, borderRadius: 4, fontFamily: FONT.condensed, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em" }}>CLIP</span> button to send it to this desk.</div>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--c-green)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.condensed, fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>3</div>
                  <div>
                    <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: C.textBright, marginBottom: "0.25rem" }}>Assemble & Export</div>
                    <div style={{ fontFamily: FONT.body, fontSize: "0.9rem", color: C.muted }}>Return here to reorder your clippings, add your own text blocks, and export the final report as a PDF, Image, or Data File.</div>
                  </div>
                </div>
              </div>

              <div style={{ 
                marginTop: "3rem", 
                padding: "1.5rem", 
                background: "rgba(212, 160, 48, 0.08)", 
                border: "1px solid rgba(212, 160, 48, 0.3)", 
                borderRadius: 8, 
                display: "flex", 
                gap: "1.5rem", 
                alignItems: "center" 
              }}>
                <div style={{ color: "var(--c-goldBright)", flexShrink: 0 }}><Icons.Sparkles size={28} /></div>
                <div>
                  <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: C.textBright, marginBottom: "0.25rem" }}>Not sure where to start?</div>
                  <div style={{ fontFamily: FONT.body, fontSize: "0.9rem", color: C.muted, marginBottom: "0.75rem" }}>Ask the Research Assistant to suggest a reporting pathway or point you toward interesting findings based on your interests.</div>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-docent', {
                      detail: {
                        tourSuas: [
                          "Help me brainstorm a report topic.",
                          "What exhibits or charts are available?",
                          "Point me to some interesting findings."
                        ]
                      }
                    }))} 
                    style={{ 
                      background: "transparent", 
                      border: "1px solid var(--c-goldBright)", 
                      borderRadius: 100,
                      padding: "0.4rem 1rem", 
                      fontFamily: FONT.condensed, 
                      fontSize: "0.75rem", 
                      fontWeight: 700, 
                      letterSpacing: "0.1em", 
                      color: "var(--c-goldBright)", 
                      textTransform: "uppercase", 
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(212, 160, 48, 0.15)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    Open Research Assistant
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={reportItems.map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {reportItems.map((item, index) => (
                    <SortablePill 
                      key={item.id}
                      item={item}
                      index={index}
                      moveUp={moveUp}
                      moveDown={moveDown}
                      removeFromReport={removeFromReport}
                      updateTextBlock={updateTextBlock}
                      isLast={reportItems.length - 1}
                      questions={questions}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button 
                  onClick={() => addTextBlock(reportItems.length)}
                  style={{
                    background: "transparent",
                    border: `1px dashed ${C.dim}`,
                    color: C.dim,
                    padding: "0.5rem 1rem",
                    borderRadius: 6,
                    fontFamily: FONT.condensed,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.textBright; e.currentTarget.style.color = C.textBright; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.dim; e.currentTarget.style.color = C.dim; }}
                >
                  + Add Text Block
                </button>
              </div>
              
              <div style={{ fontFamily: FONT.body, fontSize: "0.8rem", color: C.dim, marginTop: "2rem", fontStyle: "italic" }}>
                Drag to reorder - up/down buttons on touch. Clippings re-render from live tokens; values stay frozen as clipped.
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div>
          <div style={{ 
            background: "#fff", 
            border: `1px solid ${C.ghost}`, 
            borderRadius: 8, 
            padding: "1.5rem",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
          }}>
            <div style={{ 
              fontFamily: FONT.condensed, 
              fontSize: "0.75rem", 
              fontWeight: 700, 
              letterSpacing: "0.15em", 
              textTransform: "uppercase", 
              color: C.dim, 
              marginBottom: "1rem" 
            }}>
              ISSUE IT
            </div>
            
            <button className="issue-btn issue-btn-primary" onClick={exportText}>
              ★ SAVE NOTEBOOK ★
            </button>
            <button className="issue-btn issue-btn-secondary" onClick={exportImage}>
              EXPORT IMAGE
            </button>
            <button className="issue-btn issue-btn-secondary" onClick={() => window.print()}>
              PRINT / PDF
            </button>
            <button className="issue-btn issue-btn-secondary" onClick={exportCSV} style={{ marginTop: "1.5rem" }}>
              EXPORT CSV
            </button>
            <button className="issue-btn issue-btn-secondary" disabled style={{ opacity: 0.5, cursor: "not-allowed", marginTop: "0.5rem" }} title="Requires backend storage">
              SHARE LINK...
            </button>

            <div style={{ 
              marginTop: "2rem", 
              borderTop: `1px solid ${C.ghost}`, 
              paddingTop: "1rem",
              fontFamily: FONT.body,
              fontSize: "0.75rem",
              lineHeight: 1.5,
              color: C.dim
            }}>
              <strong style={{ color: C.textBright, fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>MARGIN NOTE</strong>
              Every output carries the full apparatus and the fixed cover text assembled from The Accidental Intactivist's Inquiry. Share links are read-only and revocable.
            </div>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY FULL EXPORT VIEW */}
      <div className="print-only" ref={reportRef} style={{ background: "white", color: "black", padding: "2rem" }}>
        <div className="cover-page" style={{ marginBottom: "4rem" }}>
          <h1 style={{ fontFamily: FONT.display, fontSize: "3rem", marginBottom: "1rem", color: "black" }}>{reportMeta.title || "Untitled Report"}</h1>
          <p style={{ fontFamily: FONT.body, fontSize: "1.2rem", fontStyle: "italic", marginBottom: "1rem", color: "#333" }}>{reportMeta.subtitle}</p>
          <p style={{ fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.1em", color: "#666" }}>{reportMeta.author}</p>
        </div>

        {reportItems.map((item, index) => {
          const isText = item.type === 'text';
          const isQuestion = item.type === 'question';
          const isAiChat = item.type === 'ai_chat';
          const isExhibit = item.type === 'exhibit';

          let contentNode = null;

          if (isText) {
            contentNode = <div style={{ fontSize: "1.1rem", lineHeight: 1.6, padding: "1rem 0" }}>{item.content}</div>;
          } else if (isQuestion) {
            const q = questions.find(q => q.id === item.refId);
            if (!q) return null;
            const data = distributions[item.id];
            const isGeographic = ["demo_country_born", "demo_country_current", "demo_us_state_born", "demo_us_state_current", "demo_can_province_born", "demo_can_province_current"].includes(q.id);
            const isOpenText = q.type === "open_text" && !isGeographic;
            const displayDist = data ? { distribution: applyLikert(data.distribution, q) } : null;

            contentNode = (
              <div style={{ border: "1px solid #ccc", padding: "2rem", marginBottom: "2rem", breakInside: "avoid" }}>
                <div style={{ fontFamily: FONT.condensed, color: "#666", textTransform: "uppercase", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                  {item.cohort ? `COHORT: ${item.cohort.toUpperCase()} | ` : ''}{q.section || "General"}
                </div>
                <h2 style={{ fontFamily: FONT.display, fontSize: "1.5rem", marginBottom: "1.5rem" }}>{q.prompt}</h2>
                {!data ? <div>Loading...</div> : isOpenText ? (
                  <NarrativeList distribution={data.narratives || []} cohort={item.cohort} />
                ) : isGeographic ? (
                  <GeographicHeatmap questionId={q.id} title="Geographic distribution" distribution={{ distribution: data.distribution || [] }} byPathway={data.byPathway} />
                ) : (
                  <DistributionChart distribution={displayDist} title="Distribution" cohort={item.cohort} />
                )}
              </div>
            );
          } else if (isAiChat) {
            contentNode = (
              <div style={{ border: "1px solid #ccc", padding: "2rem", marginBottom: "2rem", breakInside: "avoid" }}>
                <div style={{ fontFamily: FONT.condensed, color: "#666", textTransform: "uppercase", fontSize: "0.8rem", marginBottom: "0.5rem" }}>AI Research Assistant</div>
                <h2 style={{ fontFamily: FONT.display, fontSize: "1.3rem", fontStyle: "italic", marginBottom: "1rem" }}>"{item.query}"</h2>
                <div style={{ lineHeight: 1.6 }}><ReactMarkdown>{item.answer}</ReactMarkdown></div>
              </div>
            );
          } else if (isExhibit) {
            const meta = EXHIBIT_LABELS[item.exhibitType] || { title: item.exhibitType };
            contentNode = (
              <div style={{ border: "1px solid #ccc", padding: "2rem", marginBottom: "2rem", breakInside: "avoid" }}>
                <div style={{ fontFamily: FONT.condensed, color: "#666", textTransform: "uppercase", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Interactive Exhibit</div>
                <h2 style={{ fontFamily: FONT.display, fontSize: "1.5rem" }}>{meta.title}</h2>
                <p style={{ fontStyle: "italic", color: "#666" }}>[Interactive exhibits are fully rendered in the online Master Index.]</p>
              </div>
            );
          }

          return <div key={item.id} className="report-block">{contentNode}</div>;
        })}
        
        <div style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid #ccc", color: "#666", fontSize: "0.8rem" }}>
          The Accidental Intactivist's Inquiry · circumsurvey.online<br/>
          Self-selected online survey; figures describe respondents to this survey, not the general population. Generated {new Date().toLocaleDateString()}.
        </div>
      </div>
    </div>
  );
}
