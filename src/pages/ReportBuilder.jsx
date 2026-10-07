import React, { useState, useRef, useEffect } from 'react';
import { Send, Layers, Database, CheckCircle, Search, Edit3, ChevronRight, FileText, Download, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useReport } from '../contexts/ReportContext';

export default function ReportBuilder() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { reportText, setReportText, addToReport } = useReport();
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.content }),
      });

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: data.response || data.error, 
          intent: data.intent_parsed,
          citations: data.citations || [] 
        },
      ]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Engine timeout. The archive may be overloaded.' }]);
    } finally {
      setLoading(false);
    }
  };



  const downloadReport = () => {
    const element = document.createElement("a");
    const file = new Blob([reportText], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "astute_report.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const [isPrinting, setIsPrinting] = useState(false);

  const downloadPdf = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--c-bg)', color: 'var(--c-textBright)', overflow: 'hidden', fontFamily: 'var(--f-body)' }}>
      
      {/* LEFT PANE: Vector RAG Chat */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--c-ghost)', background: 'var(--c-bgDeep)' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--c-ghost)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(20, 20, 24, 0.8)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--f-display)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Layers size={22} color="var(--c-goldBright)" />
              Semantic Engine
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--c-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              RAG-Powered Archive Querying
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', background: 'rgba(0, 255, 128, 0.1)', color: '#00ff80', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(0, 255, 128, 0.3)', fontFamily: 'var(--f-mono)', letterSpacing: '0.1em' }}>ARCHIVE INDEX: ONLINE</span>
            <span style={{ fontSize: '0.7rem', background: 'rgba(128, 128, 255, 0.1)', color: '#8080ff', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(128, 128, 255, 0.3)', fontFamily: 'var(--f-mono)', letterSpacing: '0.1em' }}>SURVEY DB: ONLINE</span>
          </div>
        </div>

        {/* Chat Log */}
        <div style={{ flex: '1', overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--c-dim)', maxWidth: '400px' }}>
              <Database size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.3, color: 'var(--c-gold)' }} />
              <h3 style={{ margin: '0 0 0.5rem', fontFamily: 'var(--f-display)', fontSize: '1.2rem', color: 'var(--c-textBright)' }}>Ask the Archive</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
                The engine will automatically route your query. Analytical questions hit the SQL database; qualitative questions traverse the vector embeddings.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: msg.role === 'user' ? 'rgba(var(--c-blue-rgb), 0.1)' : 'var(--c-bgCard)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(var(--c-blue-rgb), 0.3)' : 'var(--c-ghost)'}`,
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}>
              
              {msg.role === 'assistant' && msg.intent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--c-ghost)' }}>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'var(--f-mono)', letterSpacing: '0.15em', padding: '0.2rem 0.5rem', borderRadius: '4px', background: msg.intent === 'ANALYTICAL' ? 'rgba(128,128,255,0.15)' : 'rgba(0,255,128,0.15)', color: msg.intent === 'ANALYTICAL' ? '#a0a0ff' : '#60ffb0' }}>
                    {msg.intent} ROUTE
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)' }}>Synthesized from vectors</span>
                </div>
              )}

              <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: msg.role === 'user' ? '#fff' : 'var(--c-textBright)' }}>
                {msg.role === 'user' ? (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({node, ...props}) => <img style={{ maxWidth: '100%', borderRadius: '8px', margin: '1rem 0' }} {...props} />,
                      a: ({node, ...props}) => <a style={{ color: 'var(--c-goldBright)' }} target="_blank" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
              
              {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--c-ghost)' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontFamily: 'var(--f-condensed)', letterSpacing: '0.1em', color: 'var(--c-goldBright)', textTransform: 'uppercase' }}>
                    Primary Sources Cited:
                  </p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {msg.citations.map((c, j) => (
                      <li key={j} style={{ fontSize: '0.8rem', color: 'var(--c-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.75rem', borderRadius: '4px' }}>
                        <ChevronRight size={12} color="var(--c-gold)" /> 
                        {typeof c === 'string' ? c : (c.source || 'Archive Document')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {msg.role === 'assistant' && (
                <button 
                  onClick={() => addToReport(msg.content, msg.citations)}
                  className="lux-hover-lift"
                  style={{ marginTop: '1.5rem', fontSize: '0.8rem', background: 'var(--c-goldBright)', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  <CheckCircle size={14} /> Send to Report
                </button>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '85%', background: 'var(--c-bgCard)', border: '1px solid var(--c-gold)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="lux-lens" style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--c-goldBright)', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--c-goldBright)', fontFamily: 'var(--f-mono)' }}>Querying Vector Index...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '1.5rem 2rem', background: 'rgba(20, 20, 24, 0.9)', borderTop: '1px solid var(--c-ghost)' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={20} color="var(--c-dim)" style={{ position: 'absolute', left: '1.25rem' }} />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about historical paradigms, AAP shifts, or specific demographics..."
              style={{ width: '100%', background: '#0a0a0c', color: '#fff', border: '1px solid var(--c-ghost)', borderRadius: '100px', padding: '1rem 4rem 1rem 3rem', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--c-goldBright)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--c-ghost)'}
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="lux-hover-lift"
              style={{ position: 'absolute', right: '0.5rem', background: 'var(--c-goldBright)', color: '#000', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
            >
              <Send size={18} style={{ transform: 'translateX(1px)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Report Editor */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', background: '#08080a' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--c-ghost)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8, 8, 10, 0.8)', backdropFilter: 'blur(12px)' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--f-display)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--c-textBright)' }}>
            <Edit3 size={22} color="var(--c-blue)" />
            Astute Report Builder
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={downloadReport}
              className="lux-hover-lift"
              style={{ background: 'transparent', color: 'var(--c-blue)', border: '1px solid var(--c-blue)', padding: '0.4rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <Download size={14} /> MD
            </button>
            <button 
              onClick={downloadPdf}
              className="lux-hover-lift"
              style={{ background: 'var(--c-blue)', color: '#000', border: '1px solid var(--c-blue)', padding: '0.4rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <Printer size={14} /> Export PDF
            </button>
          </div>
        </div>
        
        <div style={{ flex: '1', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: '1', background: 'var(--c-bgDeep)', borderRadius: '12px', border: '1px solid var(--c-ghost)', padding: '2rem', display: 'flex', flexDirection: 'column', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--c-dim)', fontSize: '0.8rem', fontFamily: 'var(--f-condensed)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <FileText size={14} /> Markdown Editor
            </div>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              style={{ flex: '1', width: '100%', background: 'transparent', color: 'var(--c-textBright)', border: 'none', resize: 'none', outline: 'none', fontFamily: 'var(--f-mono)', fontSize: '0.9rem', lineHeight: 1.7 }}
              placeholder="Your report will assemble here..."
            />
          </div>
        </div>
      </div>

      {/* Hidden Print Container */}
      {isPrinting && (
        <div style={{ 
          position: 'fixed', inset: 0, background: '#fff', color: '#000', zIndex: 9999, 
          padding: '40px', overflow: 'auto', fontFamily: 'serif',
          display: 'block' // Required for print rendering
        }}>
          <style>
            {`
              @media print {
                body * { visibility: hidden; }
                .print-container, .print-container * { visibility: visible; }
                .print-container { position: absolute; left: 0; top: 0; width: 100%; padding: 20mm; }
                h1, h2, h3 { color: #000 !important; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem; }
                p { line-height: 1.6; }
                code { background: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
                pre { background: #f4f4f4; padding: 10px; border-radius: 4px; white-space: pre-wrap; font-family: monospace; }
              }
            `}
          </style>
          <div className="print-container">
            <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontFamily: 'sans-serif' }}>Astute Research Report</h1>
            <div style={{ fontSize: '12pt', lineHeight: 1.6 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportText}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
