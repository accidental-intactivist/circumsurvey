import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Search, Loader2, Sparkles, BookOpen } from 'lucide-react';
import HarmonicCanvas from '../components/HarmonicCanvas';
import { useTheme } from '../contexts/ThemeContext';
import { C, FONT } from '../styles/tokens';

export default function ArchiveExplorer() {
  const { theme, mode } = useTheme();
  const themeKey = `${theme}-${mode}`;
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        citations: data.citations 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message}. Please try again.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Background Loom */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.15 }}>
        <HarmonicCanvas position="absolute" opacity={1} themeKey={themeKey} />
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, color-mix(in srgb, var(--c-bg) 20%, transparent), var(--c-bg) 80%)`
        }} />
      </div>

      {/* Header */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        height: '64px',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        background: 'color-mix(in srgb, var(--c-bg) 75%, transparent)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.ghost}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: 'transparent', border: 'none', color: C.muted,
              cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center',
              borderRadius: '50%', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft size={18} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: C.goldBright, boxShadow: `0 0 10px ${C.goldBright}`
            }} />
            <span style={{
              fontFamily: FONT.condensed, fontWeight: 800, fontSize: '0.9rem',
              color: C.textBright, letterSpacing: '0.08em', textTransform: 'uppercase'
            }}>
              AI Archive Explorer
            </span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main style={{
        position: 'relative',
        zIndex: 10,
        flex: 1,
        overflowY: 'auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '800px', paddingBottom: '100px' }}>
          
          {messages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', marginTop: '10vh',
              animation: 'fadeUp 0.6s ease forwards'
            }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: 16, background: 'rgba(212,160,48,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                border: `1px solid ${C.goldBright}`
              }}>
                <Sparkles size={32} style={{ color: C.goldBright }} />
              </div>
              <h2 style={{ fontFamily: FONT.display, fontSize: '2rem', color: C.textBright, marginBottom: '1rem' }}>
                Search the Intactivist Archives
              </h2>
              <p style={{ color: C.muted, fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
                Ask questions about statutory case law, medical ethics consensus, or historical findings. The AI will retrieve and cite exact documents.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '85%',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '16px',
                    borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '16px',
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
                    
                    <div style={{ 
                      lineHeight: 1.6, 
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.95rem'
                    }}>
                      {m.content}
                    </div>

                    {m.citations && m.citations.length > 0 && (
                      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: `1px solid ${C.ghost}` }}>
                        <div style={{ fontFamily: FONT.condensed, fontSize: '0.75rem', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                          Sources Consulted:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {m.citations.map((c, idx) => (
                            <a 
                              key={idx}
                              href={`/api/assets/${encodeURIComponent(c)}`}
                              target="_blank" rel="noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.35rem 0.75rem', background: 'rgba(255,255,255,0.03)',
                                border: `1px solid ${C.border}`, borderRadius: '100px',
                                textDecoration: 'none', color: C.muted, fontSize: '0.75rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,160,48,0.1)'; e.currentTarget.style.color = C.goldBright; e.currentTarget.style.borderColor = C.goldBright; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
                            >
                              <BookOpen size={12} />
                              <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {c}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    padding: '1.25rem', borderRadius: '16px', background: C.card,
                    border: `1px solid ${C.borderMuted}`, display: 'flex', alignItems: 'center', gap: '0.75rem'
                  }}>
                    <Loader2 size={16} style={{ color: C.goldBright, animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '0.9rem', color: C.muted }}>Retrieving archival records...</span>
                  </div>
                </div>
              )}
              
              <div ref={endRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
        padding: '1.5rem 2rem',
        background: `linear-gradient(0deg, var(--c-bg) 60%, transparent)`,
        display: 'flex', justifyContent: 'center'
      }}>
        <form 
          onSubmit={handleSubmit}
          style={{
            width: '100%', maxWidth: '800px', position: 'relative',
            display: 'flex', alignItems: 'center'
          }}
        >
          <div style={{ position: 'absolute', left: '1.25rem', color: C.muted }}>
            <Search size={18} />
          </div>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask a question about the archive..."
            style={{
              width: '100%', padding: '1.25rem 4rem 1.25rem 3rem',
              background: C.card, color: C.textBright,
              border: `1px solid ${C.border}`, borderRadius: '100px',
              fontSize: '1rem', outline: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              fontFamily: FONT.body
            }}
            onFocus={e => e.currentTarget.style.borderColor = C.goldBright}
            onBlur={e => e.currentTarget.style.borderColor = C.border}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              position: 'absolute', right: '0.5rem',
              width: 44, height: 44, borderRadius: '50%',
              background: input.trim() && !loading ? C.goldBright : 'rgba(255,255,255,0.05)',
              color: input.trim() && !loading ? C.bgDeep : C.muted,
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              transition: 'all 0.2s'
            }}
          >
            <Send size={18} style={{ marginLeft: '-2px' }} />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
