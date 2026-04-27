import { useState, useEffect, useRef } from "react";
import { C, FONT } from "../styles/tokens";
import { queryCopilot } from "../lib/api";
import BivariateHeatmap from "./BivariateHeatmap";

export default function CopilotChat({ routerState, updateState }) {
  const [query, setQuery] = useState(routerState?.ai_query || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const initialRunDone = useRef(false);

  const executeSearch = async (searchQuery) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await queryCopilot(searchQuery);
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (updateState) {
      updateState({ ai_query: query.trim() });
    }
    
    executeSearch(query.trim());
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    }}>
      <div style={{
        fontFamily: FONT.condensed,
        fontSize: "0.85rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: C.goldBright,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem"
      }}>
        <span>✨ AI Research Assistant</span>
        <span style={{
          background: C.gold,
          color: "#000",
          padding: "0.1rem 0.4rem",
          borderRadius: 4,
          fontSize: "0.6rem",
          letterSpacing: "0.1em"
        }}>BETA</span>
      </div>

      <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about the data..."
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
            whiteSpace: "pre-wrap",
          }}>
            {result.answer}
          </div>

          <BivariateHeatmap metadata={result.metadata} />

          {result.quotes && result.quotes.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h5 style={{
                fontFamily: FONT.condensed,
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: C.dim,
                marginBottom: "1rem",
                borderBottom: `1px solid ${C.ghost}`,
                paddingBottom: "0.5rem"
              }}>Sources Cited</h5>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {result.quotes.map((q, i) => (
                  <div key={i} style={{
                    borderLeft: `2px solid ${C.ghost}`,
                    paddingLeft: "1rem",
                    fontSize: "0.85rem",
                    color: C.muted
                  }}>
                    <span style={{ color: C.goldBright, fontWeight: "bold", marginRight: "0.5rem" }}>
                      [Quote {i+1}]
                    </span>
                    <span style={{ fontStyle: "italic" }}>"{q.text}"</span>
                    <div style={{
                      marginTop: "0.4rem",
                      fontSize: "0.75rem",
                      fontFamily: FONT.mono,
                      color: C.dim
                    }}>
                      — Pathway: {q.pathway} | Gen: {q.generation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
