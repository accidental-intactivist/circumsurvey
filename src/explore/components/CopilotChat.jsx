import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import { C, FONT } from "../styles/tokens";
import { queryCopilot, getQuestions, getResponseDistribution } from "../lib/api";
import BivariateHeatmap from "./BivariateHeatmap";
import { useTheme } from "../contexts/ThemeContext";
import { Sparkles } from "./Icons";
import DistributionChart from "./DistributionChart";
import SurveyFlowchart from "./SurveyFlowchart";
import { Link } from "react-router-dom";
import { LOOM_CONFIG } from "../../components/HarmonicCanvas";

function DocentChart({ questionId }) {
  const [question, setQuestion] = useState(null);
  const [dist, setDist] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getQuestions().then(qs => {
      if (!cancelled) setQuestion(qs.find(q => q.id === questionId));
    });
    getResponseDistribution(questionId).then(d => {
      if (!cancelled) setDist(d);
    });
    return () => { cancelled = true; };
  }, [questionId]);

  if (!question || !dist) return <div style={{ color: C.dim, fontSize: "0.8rem", padding: "1rem" }}>Loading chart for {questionId}...</div>;
  return (
    <div style={{ marginTop: "1rem", marginBottom: "1rem", border: `1px solid ${C.ghost}`, borderRadius: 8, padding: "1rem", background: C.bgCard }}>
      <h5 style={{ fontFamily: FONT.display, fontSize: "1rem", marginBottom: "1rem", color: C.textBright }}>{question.prompt}</h5>
      <DistributionChart question={question} distribution={dist.distribution} />
    </div>
  );
}

export default function CopilotChat({ routerState, updateState, question, exhibitContext }) {
  const { unlockTheme, setTheme } = useTheme();
  const [query, setQuery] = useState(routerState?.ai_query || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const initialRunDone = useRef(false);

  const executeSearch = async (searchQuery) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const isSnapshotRequested = /this page|this exhibit|\{this_page\}/i.test(searchQuery);
    let pageSnapshot = undefined;
    
    if (isSnapshotRequested) {
      const mainEl = document.querySelector('main');
      if (mainEl) {
        // Strip out excessive whitespace and limit to ~15,000 characters to avoid payload bloat
        pageSnapshot = mainEl.innerText.replace(/\n{3,}/g, '\n\n').slice(0, 15000);
      }
    }

    const context = {
      route: routerState?.route,
      questionId: routerState?.params?.id,
      cohort: routerState?.cohort,
      questionPrompt: question?.prompt,
      questionOptions: question?.opts ? JSON.stringify(question.opts) : undefined,
      questionPathway: question?.pathway,
      pageSnapshot,
      ...exhibitContext
    };

    try {
      const data = await queryCopilot(searchQuery, context);
      setResult(data);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // Auto-run if URL has ai_query
  useEffect(() => {
    if (routerState?.ai_query && !initialRunDone.current) {
      initialRunDone.current = true;
      setQuery(routerState.ai_query);
      executeSearch(routerState.ai_query);
    }
  }, [routerState?.ai_query]);

  const handleClear = () => {
    setQuery("");
    setResult(null);
    setError(null);
    initialRunDone.current = true; // don't auto-replay a stale ai_query
    if (updateState) updateState({ ai_query: "" });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const upperQ = query.trim().toUpperCase();
    if (upperQ === 'SYS 64738' || upperQ === 'LOAD"*",8,1') {
      unlockTheme('frodo');
      setTheme('frodo');
      setResult({
         answer: "READY.\nLOAD\n\nPRESS PLAY ON TAPE\n\nOK\n\nSEARCHING FOR CIRCUMSURVEY...\nLOADING...\n\nMODULE [FRODO_THEME] UNLOCKED IN SETTINGS.",
         suggestions: [],
         quotes: [],
         metadata: { intent: "system_override" }
      });
      return;
    }

    if (upperQ === 'LOADWB' || upperQ === 'AGNES' || upperQ === 'AMIGA') {
      unlockTheme('agnes');
      setTheme('agnes');
      setResult({
         answer: "1> LOADWB\n\nAmigaOS Workbench Loaded.\nGuru Meditation avoided.\n\nMODULE [AGNES_THEME] UNLOCKED IN SETTINGS.",
         suggestions: [],
         quotes: [],
         metadata: { intent: "system_override" }
      });
      return;
    }

    // Hidden easter egg: a nod to the LucasArts game "Loom" reveals the live
    // Harmonic Loom config (the masthead's motion + glisten). Triggered by
    // "I'm Bobbin Threadbare, are you my mother?" (punctuation/case forgiving).
    const _norm = query.trim().toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();
    if (_norm.includes("bobbin threadbare")) {
      const body = Object.entries(LOOM_CONFIG).map(([k, v]) => `  ${k}: ${v},`).join("\n");
      setResult({
        answer:
          "\"No, Bobbin — I am not your mother. But I am the Loom, and I still remember the pattern she wove for you.\"\n\n" +
          "Here is the weave drifting behind the header — its motion and its glisten:\n\n" +
          "const PARAMS = {\n" + body + "\n};\n\n" +
          "Carry the pattern to the tuner (docs/harmonic-tuner.html) or to LOOM_CONFIG in HarmonicCanvas.jsx.",
        suggestions: [],
        quotes: [],
        metadata: { intent: "harmonic_loom" }
      });
      return;
    }

    if (updateState) {
      updateState({ ai_query: query.trim() });
    }

    executeSearch(query.trim());
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden"
    }}>
      {/* Scrollable history/results container */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        paddingBottom: "1rem",
        paddingRight: "0.5rem"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
        alignItems: "center",
        marginBottom: "-1rem" // pulls the chat closer since header is gone
      }}>
        {(result || query) && (
          <button
            onClick={handleClear}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: `1px solid ${C.ghost}`,
              color: C.muted,
              fontFamily: FONT.condensed,
              fontSize: "0.62rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "0.15rem 0.55rem",
              borderRadius: 4,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C.textBright; e.currentTarget.style.borderColor = C.muted; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.ghost; }}
          >
            Clear
          </button>
        )}
      </div>

      {!result && !loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
          <h5 style={{
            fontFamily: FONT.condensed,
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.dim,
            margin: 0
          }}>Suggested Queries</h5>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {[
              "What can I learn from this page?",
              "Summarize the key findings here."
            ].map((sua, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sua);
                  executeSearch(sua);
                }}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${C.ghost}`,
                  borderRadius: 16,
                  padding: "0.4rem 0.8rem",
                  color: C.goldBright,
                  fontFamily: FONT.body,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.borderColor = C.goldBright; }}
                onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.borderColor = C.ghost; }}
              >
                {sua}
              </button>
            ))}
          </div>
        </div>
      )}


      {error && (
        <div style={{ color: C.red, fontFamily: FONT.mono, fontSize: "0.85rem", marginTop: "1rem" }}>
          ❌ Error: {error}
        </div>
      )}

      {result && (
        <div style={{
          background: C.bgSoft,
          borderRadius: 8,
          padding: "1.5rem",
          border: `1px solid ${C.ghost}`,
          fontFamily: FONT.body,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
            <h4 style={{
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: "1.2rem",
              color: C.textBright,
            }}>AI Synthesis</h4>
            
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {result.metadata?.intent && (
                <span style={{
                  fontFamily: FONT.mono,
                  fontSize: "0.65rem",
                  color: C.dim,
                  border: `1px solid ${C.ghost}`,
                  padding: "0.1rem 0.4rem",
                  borderRadius: 4,
                  textTransform: "uppercase"
                }}>
                  {result.metadata.intent} query detected
                </span>
              )}
              
              <button
                onClick={(e) => {
                  navigator.clipboard.writeText(window.location.href);
                  const origText = e.target.innerText;
                  e.target.innerText = "✓ COPIED";
                  setTimeout(() => { e.target.innerText = origText; }, 2000);
                }}
                style={{
                  background: "transparent",
                  border: `1px solid ${C.ghost}`,
                  color: C.goldBright,
                  fontFamily: FONT.condensed,
                  fontSize: "0.64rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "0.1rem 0.5rem",
                  borderRadius: 4,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.target.style.background = "rgba(212,160,48,0.1)"; }}
                onMouseLeave={(e) => { e.target.style.background = "transparent"; }}
              >
                🔗 Share Link
              </button>
            </div>
          </div>
          
          <div style={{
            color: C.text,
            lineHeight: 1.6,
            fontSize: "0.95rem",
            marginBottom: result.suggestions && result.suggestions.length > 0 ? "1.5rem" : "0"
          }}>
            {(result.answer || "").split(/(\[CHART:[^\]]+\]|\[SANKEY\]|\[EXHIBIT:[^\]]+\])/g).map((part, i) => {
              if (part.startsWith("[CHART:")) {
                const qid = part.replace("[CHART:", "").replace("]", "").trim();
                return <DocentChart key={i} questionId={qid} />;
              }
              if (part === "[SANKEY]") {
                return (
                  <div key={i} style={{ marginTop: "1rem", marginBottom: "1rem", height: "400px", border: `1px solid ${C.ghost}`, borderRadius: 8, overflow: "auto", position: "relative", background: C.bgCard }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: "800px", height: "800px", transform: "scale(0.8)", transformOrigin: "top left" }}>
                      <SurveyFlowchart />
                    </div>
                  </div>
                );
              }
              if (part.startsWith("[EXHIBIT:")) {
                const exid = part.replace("[EXHIBIT:", "").replace("]", "").trim();
                return (
                  <Link key={i} to={`/exhibits/${exid}`} style={{ color: C.goldBright, textDecoration: "underline", display: "inline-block", padding: "0.2rem 0" }}>
                    Explore Exhibit: {exid}
                  </Link>
                );
              }
              return (
                <ReactMarkdown
                  key={i}
                  components={{
                    p: ({node, ...props}) => <p style={{ marginTop: 0, marginBottom: "1rem" }} {...props} />,
                    ul: ({node, ...props}) => <ul style={{ paddingLeft: "1.5rem", marginTop: 0, marginBottom: "1rem" }} {...props} />,
                    ol: ({node, ...props}) => <ol style={{ paddingLeft: "1.5rem", marginTop: 0, marginBottom: "1rem" }} {...props} />,
                    li: ({node, ...props}) => <li style={{ marginBottom: "0.5rem" }} {...props} />,
                    strong: ({node, ...props}) => <strong style={{ color: C.textBright, fontWeight: 700 }} {...props} />,
                    a: ({node, ...props}) => <a style={{ color: C.goldBright, textDecoration: "underline" }} target="_blank" rel="noopener noreferrer" {...props} />
                  }}
                >
                  {part}
                </ReactMarkdown>
              );
            })}
          </div>

          {result.metadata?.sql && (
            <div style={{
              marginTop: "1.5rem",
              marginBottom: "1.5rem",
              background: "rgba(0,0,0,0.2)",
              border: `1px solid ${C.ghost}`,
              borderRadius: 6,
              padding: "1rem",
              fontFamily: FONT.mono,
              fontSize: "0.75rem",
              color: C.muted
            }}>
              <div style={{ color: C.dim, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>🔍 Query Executed By AI</div>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: C.ltBlue }}>
                {result.metadata.sql}
              </pre>
            </div>
          )}

          {result.suggestions && result.suggestions.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <h5 style={{
                fontFamily: FONT.condensed,
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: C.dim,
              }}>Suggested Actions & Follow-ups</h5>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {result.suggestions.map((sua, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(sua);
                      executeSearch(sua);
                    }}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${C.ghost}`,
                      borderRadius: 16,
                      padding: "0.4rem 0.8rem",
                      color: C.goldBright,
                      fontFamily: FONT.body,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.borderColor = C.goldBright; }}
                    onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.borderColor = C.ghost; }}
                  >
                    {sua}
                  </button>
                ))}
              </div>
            </div>
          )}

          <BivariateHeatmap metadata={result.metadata} />

          {result.quotes && result.quotes.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <details>
                <summary style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: C.dim,
                  marginBottom: "1rem",
                  borderBottom: `1px solid ${C.ghost}`,
                  paddingBottom: "0.5rem",
                  cursor: "pointer",
                  listStyle: "none"
                }}>Sources Cited ({result.quotes.length})</summary>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {result.quotes.map((q, i) => {
                    const isDoc = q.source_type ? q.source_type === "documentation" : q.type === "static_context";
                    const accent = isDoc ? C.ltBlue : C.goldBright;
                    const typeLabel = isDoc ? "About the Survey" : "Survey Response";
                    const heading = q.source_label || (isDoc ? (q.title || "About the Survey") : "Respondent voice");
                    const detail = q.source_detail || (isDoc ? "Project documentation" : [q.pathway, q.generation].filter(Boolean).join(" · "));
                    return (
                    <div key={i} style={{
                      borderLeft: `2px solid ${accent}`,
                      paddingLeft: "1rem",
                      fontSize: "0.85rem",
                      color: C.muted
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                        <span style={{ color: accent, fontWeight: "bold", fontFamily: FONT.mono, fontSize: "0.72rem" }}>[{i + 1}]</span>
                        <span style={{
                          fontFamily: FONT.condensed,
                          fontSize: "0.56rem",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: accent,
                          background: `${accent}1a`,
                          border: `1px solid ${accent}40`,
                          borderRadius: 999,
                          padding: "0.1rem 0.45rem",
                        }}>{typeLabel}</span>
                        <span style={{ fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.04em", textTransform: "uppercase", color: C.muted }}>{heading}</span>
                      </div>
                      <span style={{ fontStyle: "italic" }}>"{q.text}"</span>
                      <div style={{
                        marginTop: "0.6rem",
                        fontSize: "0.72rem",
                        fontFamily: FONT.mono,
                        color: C.dim,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.5rem",
                        flexWrap: "wrap"
                      }}>
                        <span>{detail}</span>
                        {!isDoc && (
                          <button
                            onClick={() => {
                              const sq = `Find a thematic match for this quote: "${q.text}". Search specifically for responses from DIFFERENT pathways to see how these experiences intersect.`;
                              setQuery(sq);
                              executeSearch(sq);
                            }}
                            style={{
                              background: "transparent",
                              border: `1px solid ${C.ghost}`,
                              color: C.goldBright,
                              fontFamily: FONT.condensed,
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              padding: "0.2rem 0.6rem",
                              borderRadius: 4,
                              cursor: "pointer",
                            }}
                          >
                            Find Intersections
                          </button>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </details>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Fixed bottom input container */}
      <div style={{
        flexShrink: 0,
        paddingTop: "1.5rem",
        marginTop: "0.5rem",
        borderTop: `1px solid ${C.ghost}`
      }}>
        <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (query.trim() && !loading) {
                  handleSearch(e);
                }
              }
            }}
            placeholder={result ? "Ask a follow up question..." : "Ask about the data… (Enter to send)"}
            style={{
              width: "100%",
              minHeight: "80px",
              resize: "vertical",
              padding: "0.8rem",
              background: C.bgCard,
              border: `1px solid ${C.ghost}`,
              borderRadius: 8,
              color: C.textBright,
              fontFamily: FONT.body,
              fontSize: "0.9rem",
              outline: "none",
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              padding: "0.7rem",
              background: loading ? C.dim : C.gold,
              color: loading ? C.bg : "#000",
              border: "none",
              borderRadius: 8,
              fontFamily: FONT.condensed,
              fontWeight: 700,
              fontSize: "0.9rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: loading || !query.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              alignSelf: "flex-end"
            }}
          >
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </form>
      </div>

    </div>
  );
}
