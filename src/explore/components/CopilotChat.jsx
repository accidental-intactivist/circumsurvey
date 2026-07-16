import { useState, useEffect, useRef, useMemo } from "react";
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
import { UNDERLOOM_CONFIG } from "../../components/GuidedTour/LoomChoreography";
import { EXHIBIT_ROUTES } from "./ExploreMasthead";
import { useReport } from "../contexts/ReportContext";

function DocentChart({ questionId }) {
  const [question, setQuestion] = useState(null);
  const [dist, setDist] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getQuestions(),
      getResponseDistribution(questionId),
    ]).then(([qs, d]) => {
      if (cancelled) return;
      const q = qs.find(q => q.id === questionId);
      if (!q || !d?.distribution) {
        setFailed(true);
      } else {
        setQuestion(q);
        setDist(d);
      }
    }).catch(() => {
      if (!cancelled) setFailed(true);
    });
    return () => { cancelled = true; };
  }, [questionId]);

  if (failed) return null;
  if (!question || !dist) return <div style={{ color: C.dim, fontSize: "0.8rem", padding: "1rem" }}>Loading chart for {questionId}...</div>;
  return (
    <div style={{ marginTop: "1rem", marginBottom: "1rem", border: `1px solid ${C.ghost}`, borderRadius: 8, padding: "1rem", background: C.bgCard }}>
      <h5 style={{ fontFamily: FONT.display, fontSize: "1rem", marginBottom: "1rem", color: C.textBright }}>{question.prompt}</h5>
      <DistributionChart question={question} distribution={dist.distribution} />
    </div>
  );
}

export default function CopilotChat({ routerState, updateState, question, exhibitContext, tourSuas }) {
  const { unlockTheme, setTheme, setMode, setTypeface, setColorblind, setDyslexicFont, setTypeScale } = useTheme();
  const { addAIChatBlock } = useReport();
  const [query, setQuery] = useState(routerState?.ai_query || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [addedToReport, setAddedToReport] = useState(false);
  const initialRunDone = useRef(false);

  const astuteSua = useMemo(() => {
    const list = [
      "Can you cross-tabulate generation against circumcision regret?",
      "What is the most unexpected demographic correlation in the data?",
      "What are the hidden emotional themes in the open-text narratives?",
      "How do geographical origins affect respondents' views on bodily autonomy?",
      "Are there statistical differences between religious and secular upbringing?",
      "What is the most statistically significant finding regarding the pleasure gap?"
    ];
    return list[Math.floor(Math.random() * list.length)];
  }, [routerState?.route]);

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

    if (upperQ === 'PR#6' || upperQ === 'CALL -151' || upperQ === 'CALL-151') {
      unlockTheme('woz');
      setTheme('woz');
      setResult({
         answer: "] PR#6\n\nAPPLE ][\n\nDOS VERSION 3.3\n\nMODULE [WOZ_THEME] UNLOCKED IN SETTINGS.",
         suggestions: [],
         quotes: [],
         metadata: { intent: "system_override" }
      });
      return;
    }

    // Hidden easter egg: a nod to the LucasArts game "Loom" reveals the live
    // config of BOTH looms — the masthead's Harmonic Loom (motion + glisten)
    // and the Underloom, the scroll-choreographed weave beneath the report.
    // Triggered by "I'm Bobbin Threadbare, are you my mother?" (forgiving).
    const _norm = query.trim().toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();
    if (_norm.includes("bobbin threadbare")) {
      const body = Object.entries(LOOM_CONFIG).map(([k, v]) => `  ${k}: ${v},`).join("\n");
      const under = JSON.stringify(UNDERLOOM_CONFIG, null, 2);
      setResult({
        answer:
          "\"No, Bobbin — I am not your mother. But I am the Loom, and I still remember the pattern she wove for you.\"\n\n" +
          "There are two looms in this hall now. Above the fold, the weave you know — its motion and its glisten:\n\n" +
          "const LOOM_CONFIG = {\n" + body + "\n};\n\n" +
          "And beneath the report, the UNDERLOOM — the choreography that re-forms station by station as you walk the tour:\n\n" +
          "const UNDERLOOM_CONFIG = " + under + ";\n\n" +
          "Carry the patterns to their tuners — docs/harmonic-tuner.html for the masthead, loom-choreography-v2.html (workspace root) for the Underloom — or stamp them into HarmonicCanvas.jsx and LoomChoreography.jsx.",
        suggestions: [],
        quotes: [],
        metadata: { intent: "harmonic_loom" }
      });
      return;
    }

    if (/(turn off|disable|stop|pause|halt|hide)\s+(animation|animations|loom|harmonic loom|motion|graphics)/.test(_norm)) {
      window.dispatchEvent(new CustomEvent('toggle-loom', { detail: { enabled: false } }));
      setResult({
        answer: "As you wish. The Harmonic Loom animations have been paused.",
        suggestions: ["Turn animations back on"],
        quotes: [],
        metadata: { intent: "system_override" }
      });
      return;
    }

    if (/(turn on|enable|start|play|resume|show)\s+(animation|animations|loom|harmonic loom|motion|graphics)/.test(_norm)) {
      window.dispatchEvent(new CustomEvent('toggle-loom', { detail: { enabled: true } }));
      setResult({
        answer: "The Harmonic Loom animations have been restored.",
        suggestions: ["Turn animations off"],
        quotes: [],
        metadata: { intent: "system_override" }
      });
      return;
    }

    if (/(change|switch|set)\s+(to\s+)?(the\s+)?(dark|light)\s+(mode|theme)/.test(_norm) || /(dark|light)\s+mode/.test(_norm)) {
      const isLight = _norm.includes("light");
      setMode(isLight ? 'light' : 'dark');
      setResult({
        answer: `${isLight ? 'Light' : 'Dark'} mode has been enabled.`,
        suggestions: [`Change to ${isLight ? 'dark' : 'light'} mode`],
        quotes: [],
        metadata: { intent: "system_override" }
      });
      return;
    }

    const aestheticMatch = _norm.match(/(change|switch|set)\s+(to\s+)?(the\s+)?(standard|vaporwave|evergreen|ocean|amber|paper|pueblo|brick|mono|frodo|agnes|woz)(\s+theme|\s+aesthetic)?/);
    if (aestheticMatch) {
      const targetTheme = aestheticMatch[4];
      if (targetTheme === 'frodo' || targetTheme === 'agnes' || targetTheme === 'woz') {
        unlockTheme(targetTheme);
      }
      setTheme(targetTheme);
      setResult({
        answer: `The ${targetTheme} aesthetic theme has been applied.`,
        suggestions: [],
        quotes: [],
        metadata: { intent: "system_override" }
      });
      return;
    }

    const fontMatch = _norm.match(/(change|switch|set)\s+(to\s+)?(the\s+)?(bureau|tomorrow)(\s+font|\s+typeface)?/);
    if (fontMatch) {
      setTypeface(fontMatch[4]);
      setResult({
        answer: `The typeface has been changed to ${fontMatch[4]}.`,
        suggestions: [],
        quotes: [],
        metadata: { intent: "system_override" }
      });
      return;
    }

    if (/(large|extra large|xl|standard)\s+(text|font|typography)/.test(_norm)) {
      const scale = _norm.includes("extra large") || _norm.includes("xl") ? 'xlarge' : _norm.includes("large") ? 'large' : 'standard';
      setTypeScale(scale);
      setResult({
        answer: `Typography size set to ${scale}.`,
        suggestions: [],
        quotes: [],
        metadata: { intent: "system_override" }
      });
      return;
    }

    if (/(turn on|enable|use)\s+(colorblind|color blind|wong)/.test(_norm)) {
      setColorblind(true);
      setResult({
        answer: "Colorblind-safe charts (Wong palette) have been enabled.",
        suggestions: [],
        quotes: [],
        metadata: { intent: "system_override" }
      });
      return;
    } else if (/(turn off|disable)\s+(colorblind|color blind)/.test(_norm)) {
      setColorblind(false);
      setResult({
        answer: "Colorblind-safe charts have been disabled.",
        suggestions: [],
        quotes: [],
        metadata: { intent: "system_override" }
      });
      return;
    }

    if (/(turn on|enable|use)\s+(dyslexic|lexend)/.test(_norm)) {
      setDyslexicFont(true);
      setResult({
        answer: "Dyslexia-friendly typography (Lexend) has been enabled.",
        suggestions: [],
        quotes: [],
        metadata: { intent: "system_override" }
      });
      return;
    } else if (/(turn off|disable)\s+(dyslexic|lexend)/.test(_norm)) {
      setDyslexicFont(false);
      setResult({
        answer: "Dyslexia-friendly typography has been disabled.",
        suggestions: [],
        quotes: [],
        metadata: { intent: "system_override" }
      });
      return;
    }

    if (/(download|print|export|save)\s+(my\s+)?report/.test(_norm)) {
      setResult({
        answer: "Preparing your report. The print/save dialog should open momentarily.",
        suggestions: ["Clear my filters"],
        quotes: [],
        metadata: { intent: "system_override" }
      });
      setTimeout(() => window.print(), 500);
      return;
    }

    if (/(clear|reset|remove)\s+(my\s+)?(filters|cohorts|cohort)/.test(_norm)) {
      if (updateState) updateState({ cohort: {} });
      setResult({
        answer: "All cohort filters have been cleared. You are now viewing the aggregate data.",
        suggestions: ["Take me to the Demographics page"],
        quotes: [],
        metadata: { intent: "system_override" }
      });
      return;
    }

    const routeMatch = _norm.match(/(take me to|go to|open|show me)\s+(the\s+)?(pleasure gap|culture|demographics|restoration|adult experience|numbers)/);
    if (routeMatch) {
      const target = routeMatch[3].replace(" ", "-");
      const targetId = target === "numbers" ? "numbers" : target === "culture" ? "culture" : target === "demographics" ? "demographics" : target === "restoration" ? "restoration-journey" : target === "adult experience" ? "adult-experience" : target === "pleasure gap" ? "pleasure-gap" : target;
      window.location.hash = `#/${targetId}`;
      setResult({
        answer: `Navigating you to the ${routeMatch[3]} exhibit...`,
        suggestions: [],
        quotes: [],
        metadata: { intent: "system_override" }
      });
      return;
    }

    if (updateState) {
      updateState({ ai_query: query.trim() });
    }

    executeSearch(query.trim());
  };

  const executeSearch = async (searchQuery) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAddedToReport(false);

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
          marginBottom: "0.5rem",
          minHeight: "2rem",
          gap: "0.5rem"
        }}>
          {result && !error && (
            <button
              onClick={() => {
                if (addedToReport) return;
                addAIChatBlock(query, result.answer);
                setAddedToReport(true);
              }}
              style={{
                background: addedToReport ? "rgba(100, 200, 100, 0.1)" : "transparent",
                border: `1px solid ${addedToReport ? C.green : C.ghost}`,
                color: addedToReport ? C.green : C.gold,
                fontFamily: FONT.condensed,
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0.3rem 0.75rem",
                borderRadius: 999,
                cursor: addedToReport ? "default" : "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { 
                if (addedToReport) return;
                e.currentTarget.style.color = C.goldBright; 
                e.currentTarget.style.borderColor = C.gold; 
              }}
              onMouseLeave={(e) => { 
                if (addedToReport) return;
                e.currentTarget.style.color = C.gold; 
                e.currentTarget.style.borderColor = C.ghost; 
              }}
            >
              {addedToReport ? "Added to Report" : "+ Add to Report"}
            </button>
          )}
          {(result || query) && (
            <button
              onClick={handleClear}
              style={{
                background: "transparent",
                border: `1px solid ${C.ghost}`,
                color: C.muted,
                fontFamily: FONT.condensed,
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0.3rem 0.75rem",
                borderRadius: 999,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.textBright; e.currentTarget.style.borderColor = C.muted; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.ghost; }}
            >
              Clear
            </button>
          )}
        </div>

      {!result && !loading && !error && (() => {
        // "What can I learn from this page?" is universal.
        const route = routerState?.route;
        let second;
        
        const routeSpecificSuas = {
          "index": "Which exhibit covers sensitivity and satisfaction?",
          "question": "How do different demographic groups answer this question?",
          "not-found": "What topics does this survey cover?",
          "pathways": "How do the three pathways differ overall?",
          "pairs": "What are the most polarized answers between cohorts?",
          "pleasure-gap": "How does circumcision status impact sexual satisfaction?",
          "correlations": "Which demographic factors predict the strongest regret?",
          "demographics": "Show me a breakdown of the participants by generation.",
          "narrative-mirrors": "What are the most common emotional themes in the narratives?",
          "culture": "How have cultural attitudes shifted between generations?",
          "observer-lens": "How do partners and parents view circumcision differently?",
          "religious-mirrors": "How does religion influence the decision to circumcise?",
          "restoration-journey": "Why do men choose to undergo foreskin restoration?",
          "adult-experience": "What do men who remember both states say about the change?",
          "numbers": "What are the most statistically significant findings in the survey?",
          "for-parents": "What data is most relevant for expecting parents?",
          "the-forward-view": "Are respondents likely to advocate for or against circumcision?"
        };

        second = routeSpecificSuas[route] || "What surprised respondents most about this topic?";
        
        // If tourSuas are provided (from the scrolly tale), use those instead
        const suas = tourSuas && tourSuas.length > 0
          ? tourSuas
          : [
              "What can I learn from this page?",
              second,
              astuteSua
            ];
        return (
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
            {suas.map((sua, i) => (
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
        );
      })()}


      {error && (
        <div style={{ color: C.red, fontFamily: FONT.mono, fontSize: "0.85rem", marginTop: "1rem" }}>
          ❌ Error: {error}
        </div>
      )}

      {result && (
        <div style={{
          background: C.bgSoft,
          borderRadius: 10,
          padding: "1.5rem",
          border: `1px solid ${C.ghost}`,
          borderTop: `2px solid ${C.gold}40`,
          fontFamily: FONT.body,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={16} color={C.gold} style={{ opacity: 0.7 }} />
              <h4 style={{
                fontFamily: FONT.condensed,
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.gold,
                margin: 0,
              }}>Synthesis</h4>
            </div>
            
            <button
              onClick={(e) => {
                navigator.clipboard.writeText(window.location.href);
                const span = e.currentTarget.querySelector('span');
                e.currentTarget.style.borderColor = C.gold;
                span.textContent = 'Copied';
                setTimeout(() => { span.textContent = 'Share'; e.currentTarget.style.borderColor = C.ghost; }, 2000);
              }}
              style={{
                background: "transparent",
                border: `1px solid ${C.ghost}`,
                color: C.muted,
                fontFamily: FONT.condensed,
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0.2rem 0.6rem",
                borderRadius: 999,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.goldBright; e.currentTarget.style.borderColor = C.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.ghost; }}
            >
              <span>Share</span>
            </button>
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
                const routeConfig = EXHIBIT_ROUTES.find(r => r.route === exid);
                const title = routeConfig ? `${routeConfig.num} - ${routeConfig.label}` : (exid.charAt(0).toUpperCase() + exid.slice(1).replace(/-/g, ' '));
                const isExplorer = window.location.pathname.includes("/explore");
                const exhibitHref = isExplorer ? `#/${exid}` : `/explore#/${exid}`;
                return (
                  <a key={i} href={exhibitHref} style={{ color: C.goldBright, textDecoration: "underline", display: "inline-block", padding: "0.2rem 0", fontWeight: 600 }}>
                    {title}
                  </a>
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
              <div style={{ color: C.dim, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: FONT.condensed }}>Query</div>
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
            {loading ? "Thinking…" : "Submit"}
          </button>
        </form>
      </div>

    </div>
  );
}
