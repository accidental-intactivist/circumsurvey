import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Search, Loader2, Sparkles, BookOpen, X, FilePlus, Copy } from 'lucide-react';
import { useAssistant } from '../contexts/AssistantContext';
import { useReport } from '../contexts/ReportContext';
import ThinkingSpirograph from './ThinkingSpirograph';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { C, FONT } from '../styles/tokens';

const ENROLLING_QUESTIONS = [
  "How does the 'Pleasure Gap' manifest between circumcised and intact respondents?",
  "What do men report about the long-term psychological impact of infant circumcision?",
  "Trace the historical origins of the genital autonomy movement in the United States.",
  "What is the medical ethics consensus on routine infant circumcision in Europe versus the US?",
  "Summarize the legal arguments for applying Equal Protection to all children's genitals.",
  "How do Millennials and Gen Z view circumcision compared to previous generations?",
  "What is the 'Lube Tax' and how did it emerge in the survey data?",
  "What are the most common reasons intact men express gratitude to their parents?",
  "Find testimonies describing feelings of loss or resentment regarding circumcision.",
  "What role do partners play in a man's awareness of his circumcision status?",
  "Are there any documented connections between neonatal circumcision and medical trauma?",
  "How has the AAP's stance on circumcision evolved over the past four decades?",
  "Who are the key figures in the founding of GALDEF?",
  "What historical documentation exists regarding the origins of NOCIRC?",
  "How does religious background influence attitudes toward genital alteration?",
  "What do the demographic sankey charts reveal about the changing cultural tide?",
  "Explain the concept of 'Asymmetry of Choice' in the context of bodily integrity.",
  "What are the primary motivations for men seeking foreskin restoration?",
  "How do mothers and fathers differ in their retrospective feelings about circumcising their sons?",
  "What does the data show about the age of awareness for circumcised men?"
];

export default function AIAssistantFlyout() {
  const { isOpen, closeAssistant, initialQuery, setInitialQuery, initialSuggestions, setInitialSuggestions } = useAssistant();
  const { addToReport } = useReport();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [randomSuggestions, setRandomSuggestions] = useState([]);
  const endRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const shuffled = [...ENROLLING_QUESTIONS].sort(() => 0.5 - Math.random());
      setRandomSuggestions(shuffled.slice(0, 3));
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (isOpen && initialQuery) {
      setInput(initialQuery);
      setInitialQuery(''); // consume it
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const handleQuerySubmit = async (queryText) => {
    if (!queryText.trim() || loading || cooldown > 0) return;

    // Abort previous request if any (Debounce/Throttle)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMsg = queryText.trim();
    setInput(userMsg);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg }),
        signal: abortControllerRef.current.signal
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      setInput('');

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        citations: data.citations // Now an array of objects {source, doc_id, snippets}
      }]);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("Request aborted");
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${error.message}` 
        }]);
      }
    } finally {
      setLoading(false);
      setCooldown(5); // 5 second cooldown
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleQuerySubmit(input);
  };

  const handleCopy = (msg) => {
    let textToCopy = msg.content;
    if (msg.citations && msg.citations.length > 0) {
      textToCopy += `\n\nCitations:\n`;
      msg.citations.forEach(c => {
        textToCopy += `- ${c.source}\n`;
      });
    }
    navigator.clipboard.writeText(textToCopy);
  };

  const handleAddToReport = (msg) => {
    const citations = msg.citations ? msg.citations.map(c => c.source) : [];
    addToReport(msg.content, citations);
    // Optionally show a toast here
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop Removed to allow canvas interaction */}
      
      {/* Drawer */}
      <div 
        className="lux-glide-in"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '450px',
          background: C.bgCard,
          borderLeft: `1px solid ${C.ghost}`,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
        }}
      >
        {/* Header */}
        <div style={{
          height: '70px', /* Fixed height to match squished TopNav */
          padding: '0 1.5rem',
          borderBottom: `1px solid ${C.ghost}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: C.bgDeep,
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: C.goldBright, boxShadow: `0 0 10px ${C.goldBright}`
            }} />
            <span style={{
              fontFamily: FONT.condensed, fontWeight: 800, fontSize: '0.9rem',
              color: C.textBright, letterSpacing: '0.08em', textTransform: 'uppercase'
            }}>
              Research Assistant
            </span>
          </div>
          <button 
            onClick={closeAssistant}
            style={{
              background: 'transparent', border: 'none', color: C.muted,
              cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center',
              borderRadius: '50%', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {messages.length === 0 ? (
            <div style={{ marginTop: '1rem', animation: 'fadeUp 0.6s ease forwards' }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: 12, background: 'rgba(212,160,48,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                border: `1px solid ${C.goldBright}`
              }}>
                <Sparkles size={24} style={{ color: C.goldBright }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(initialSuggestions || (randomSuggestions.length ? randomSuggestions : ENROLLING_QUESTIONS.slice(0,3))).map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuerySubmit(action)}
                    className="lux-hover-lift"
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: '8px',
                      padding: '1rem',
                      color: C.textBright,
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      lineHeight: 1.4,
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                  >
                    "{action}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '90%',
                  padding: '1rem',
                  borderRadius: '12px',
                  borderBottomRightRadius: m.role === 'user' ? '4px' : '12px',
                  borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '12px',
                  background: m.role === 'user' ? 'rgba(212,160,48,0.1)' : C.card,
                  border: `1px solid ${m.role === 'user' ? 'rgba(212,160,48,0.3)' : C.borderMuted}`,
                  color: m.role === 'user' ? C.textBright : C.text,
                  boxShadow: m.role === 'assistant' ? '0 4px 20px rgba(0,0,0,0.1)' : 'none'
                }}>
                  {m.role === 'assistant' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: C.goldBright }}>
                      <Sparkles size={14} />
                      <span style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Archive AI
                      </span>
                    </div>
                  )}
                  
                  <div className="markdown-assistant">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>

                  {m.citations && m.citations.length > 0 && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${C.ghost}` }}>
                      <div style={{ fontFamily: FONT.condensed, fontSize: '0.7rem', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        Sources Consulted:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {m.citations.filter(c => {
                          const name = typeof c === 'string' ? c : c.source;
                          if (!name || name === 'bulk_auto_ingest') return false;
                          return true;
                        }).map((c, idx) => {
                          const isLegacyString = typeof c === 'string';
                          const sourceName = isLegacyString ? c : c.source;
                          const docId = isLegacyString ? null : c.doc_id;
                          const highlightParam = (!isLegacyString && c.snippets && c.snippets.length > 0) 
                                                ? `?highlight=${encodeURIComponent(c.snippets[0])}` 
                                                : '';
                          const href = docId ? `/library/${docId}${highlightParam}` : `/api/assets/${encodeURIComponent(sourceName)}`;

                          return (
                            <button 
                              key={idx}
                              onClick={() => {
                                closeAssistant();
                                navigate(href);
                              }}
                              className="lux-hover-lift"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.35rem 0.75rem', background: 'rgba(255,255,255,0.03)',
                                border: `1px solid ${C.border}`, borderRadius: '100px',
                                color: C.muted, fontSize: '0.75rem', cursor: 'pointer'
                              }}
                            >
                              <BookOpen size={12} />
                              <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {sourceName}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Assistant Actions Toolbar */}
                {m.role === 'assistant' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', marginLeft: '0.5rem' }}>
                    <button 
                      onClick={() => handleCopy(m)}
                      style={{ background: 'transparent', border: 'none', color: C.dim, cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Copy size={12} /> Copy with Citation
                    </button>
                    <button 
                      onClick={() => handleAddToReport(m)}
                      style={{ background: 'transparent', border: 'none', color: C.dim, cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <FilePlus size={12} /> Add to Report
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
          
          {loading && (
            <div style={{ padding: '2rem 0' }}>
              <ThinkingSpirograph />
            </div>
          )}
          
          <div ref={endRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: '1rem 1.5rem',
          background: C.bgDeep,
          borderTop: `1px solid ${C.ghost}`
        }}>
          <form onSubmit={handleSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: '1rem', color: C.muted }}>
              <Search size={16} />
            </div>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading || cooldown > 0}
              placeholder={cooldown > 0 ? `Please wait ${cooldown}s...` : "Ask a question..."}
              style={{
                width: '100%', padding: '1rem 3rem 1rem 2.5rem',
                background: C.card, color: C.textBright,
                border: `1px solid ${C.border}`, borderRadius: '100px',
                fontSize: '0.9rem', outline: 'none',
                fontFamily: FONT.body
              }}
              onFocus={e => e.currentTarget.style.borderColor = C.goldBright}
              onBlur={e => e.currentTarget.style.borderColor = C.border}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || cooldown > 0}
              style={{
                position: 'absolute', right: '0.5rem',
                width: 32, height: 32, borderRadius: '50%',
                background: input.trim() && !loading && cooldown === 0 ? C.goldBright : 'rgba(255,255,255,0.05)',
                color: input.trim() && !loading && cooldown === 0 ? C.bgDeep : C.muted,
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !loading && cooldown === 0 ? 'pointer' : 'default',
                transition: 'all 0.2s'
              }}
            >
              <Send size={14} style={{ marginLeft: '-2px' }} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
