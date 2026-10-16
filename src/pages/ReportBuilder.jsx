import React, { useState, useRef, useEffect } from 'react';
import { Send, Layers, Database, CheckCircle, Search, Edit3, ChevronRight, FileText, Download, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSearchParams } from 'react-router-dom';
import { useReport } from '../contexts/ReportContext';
import { useMediaList } from '../contexts/MediaListContext';
import { X } from 'lucide-react';
import { captureEvent } from '../lib/telemetry';

export default function ReportBuilder() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { reportText, setReportText, addToReport } = useReport();
  const { mediaLists } = useMediaList();
  const chatEndRef = useRef(null);

  const [showListModal, setShowListModal] = useState(false);
  const [generatingList, setGeneratingList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const kit = searchParams.get('kit');
    if (kit && !reportText) {
      if (kit === 'pediatrician') {
        setReportText(`# The Pediatrician Discussion Kit\n\n*A Curated Evidence Brief for Medical Consultations*\n\n---\n\n## Core Objective\nThis brief is designed to be provided to your child's pediatrician to establish a firm, medically-supported boundary regarding genital intactness.\n\n## Foundational Facts to Discuss\n\n### 1. The Prepuce is Normal, Functional Tissue\n**Source:** [Cold & Taylor (1999) - The Prepuce](/library/cold-taylor-1999)\n**Summary:** The prepuce is a highly innervated, functional mucosal tissue, not a "birth defect" or useless appendage.\n\n### 2. Routine Infant Circumcision is Not Recommended Globally\n**Source:** [Royal Dutch Medical Association (KNMG) Policy](/library/knmg-policy)\n**Summary:** The KNMG firmly concludes that there is no convincing medical evidence for routine neonatal circumcision and that it violates the child's right to autonomy.\n\n### 3. "Hygiene" is Not a Medical Indication\n**Source:** [AAP Task Force Context](/library/aap-task-force)\n**Summary:** Proper hygiene of the intact penis requires nothing more than washing with water, identical to female anatomy.\n\n---\n\n*Please append your own generated AI rebuttals or custom notes below this line.*`);
      } else if (kit === 'expectant') {
        setReportText(`# The Expectant Parent's Guide\n\n*Foundational Literature on Bodily Autonomy*\n\n---\n\n## Core Objective\nTo provide parents with clear, objective facts about the physiology and function of the intact penis, empowering them to make the default choice.\n\n## Key Reading\n\n### 1. The Anatomy of the Intact Penis\n**Source:** [British Medical Association (BMA) Guidelines](/library/bma-guidelines)\n**Summary:** Outlines the standard development and care of the intact child.\n\n### 2. Understanding the "Pleasure Gap"\n**Source:** [CircumSurvey Phase 1 Findings](/explore)\n**Summary:** Hard data showing a 36% drop in specific sensory experiences for circumcised men, confirming the physiological cost.\n\n---\n\n*Use the Assistant on the left to ask specific questions about care and append the answers here.*`);
      } else if (kit === 'partner') {
        setReportText(`# The Partner Alignment Guide\n\n*Navigating the Intact Conversation Together*\n\n---\n\n## Core Objective\nTo provide neutral, objective data for parents who may be coming from different cultural or familial backgrounds regarding circumcision.\n\n## Conversation Starters & Evidence\n\n### 1. "It's just a snip"\n**Counter-Evidence:** It involves the removal of 30-50% of the penile skin system, including the highly sensitive ridged band.\n\n### 2. "I want him to look like his father"\n**Counter-Evidence:** Medical ethics do not support altering a child's body for cosmetic family resemblance. The child has a right to an open future.\n\n---\n\n*Ask the Archive Researcher to generate empathetic rebuttals to specific family concerns and add them here.*`);
      }
      
      captureEvent('report_kit_loaded', { kit });
      // Clear the param so it doesn't keep overriding if they refresh
      setSearchParams({});
    }
  }, [searchParams, reportText, setSearchParams, setReportText]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    captureEvent('report_builder_query_submitted', { queryLength: userMessage.content.length });

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
    captureEvent('report_downloaded', { format: 'markdown', length: reportText?.length || 0 });
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
    captureEvent('report_printed', { length: reportText?.length || 0 });
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const handleGenerateBrief = async (list) => {
    setGeneratingList(true);
    try {
      const res = await fetch('/api/cms?limit=1000');
      if (res.ok) {
        const data = await res.json();
        const allDocs = data.data || data;
        const docs = list.items.map(id => allDocs.find(d => d.id === id)).filter(Boolean);
        
        let brief = `## Evidence Brief: ${list.name}\n\n`;
        brief += `*Generated on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
        
        docs.forEach(doc => {
          const meta = doc.metadata_json ? JSON.parse(doc.metadata_json) : {};
          const title = meta.academic_title || meta.title || doc.title || 'Untitled Document';
          const author = meta.author || meta.authors?.join(', ') || 'Unknown Author';
          const date = meta.date || 'Unknown Date';
          const desc = meta.abstract || meta.summary || meta.description || 'No summary available.';
          
          brief += `### ${title}\n`;
          brief += `**Date:** ${date} | **Author/Source:** ${author}\n\n`;
          brief += `${desc}\n\n`;
          if (doc.url && doc.url !== '#') {
            brief += `*[View Primary Source](${doc.url})*\n\n`;
          }
          brief += `---\n\n`;
        });

        setReportText(prev => prev + (prev.trim() ? '\n\n' : '') + brief);
      }
    } catch (e) {
      console.error(e);
    }
    setGeneratingList(false);
    setShowListModal(false);
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
              Archive Assistant
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--c-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Your Personal Research Aide
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', background: 'rgba(0, 255, 128, 0.1)', color: '#00ff80', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(0, 255, 128, 0.3)', fontFamily: 'var(--f-mono)', letterSpacing: '0.1em' }}>ARCHIVE LINKED</span>
          </div>
        </div>

        {/* Chat Log */}
        <div style={{ flex: '1', overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--c-dim)', maxWidth: '400px' }}>
              <Database size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.3, color: 'var(--c-gold)' }} />
              <h3 style={{ margin: '0 0 0.5rem', fontFamily: 'var(--f-display)', fontSize: '1.2rem', color: 'var(--c-textBright)' }}>Ask the Archive</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
                Type any question below. The Archive Researcher will read through the medical journals, historical documents, and survey data to find the exact answers for you.
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
                  <span style={{ fontSize: '0.65rem', fontFamily: 'var(--f-mono)', letterSpacing: '0.15em', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(212,160,48,0.15)', color: 'var(--c-goldBright)' }}>
                    ARCHIVE RESEARCHER
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)' }}>Synthesized from the Archive</span>
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
                  onClick={() => {
                    addToReport(msg.content, msg.citations);
                    captureEvent('report_section_appended', { citationsCount: msg.citations?.length || 0 });
                  }}
                  className="lux-hover-lift"
                  style={{ marginTop: '1.5rem', fontSize: '0.8rem', background: 'var(--c-goldBright)', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  <CheckCircle size={14} /> Add to Guide
                </button>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '85%', background: 'var(--c-bgCard)', border: '1px solid var(--c-gold)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="lux-lens" style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--c-goldBright)', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--c-goldBright)', fontFamily: 'var(--f-mono)' }}>Reading the archive...</span>
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
            Custom Discussion Guide
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setShowListModal(true)}
              className="lux-hover-lift"
              style={{ background: 'transparent', color: 'var(--c-goldBright)', border: '1px solid var(--c-goldBright)', padding: '0.4rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <Database size={14} /> Import from List
            </button>
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
              <FileText size={14} /> Your Notebook
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

      {/* Media List Import Modal */}
      {showListModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseDown={(e) => e.stopPropagation()}>
          <div className="lux-glide-in" style={{ background: 'var(--c-bgCard)', padding: '2rem', borderRadius: '12px', width: '400px', border: '1px solid var(--c-ghost)', position: 'relative' }}>
            <button onClick={() => setShowListModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--c-dim)', cursor: 'pointer' }}><X size={18} /></button>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--c-textBright)' }}>Generate Brief from List</h3>
            
            {mediaLists.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mediaLists.map(list => (
                  <button 
                    key={list.id} 
                    onClick={() => handleGenerateBrief(list)} 
                    disabled={generatingList}
                    style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                      width: '100%', padding: '1rem', background: 'var(--c-bgSoft)', 
                      border: '1px solid var(--c-ghost)', borderRadius: '8px', 
                      color: 'var(--c-textBright)', cursor: generatingList ? 'not-allowed' : 'pointer',
                      opacity: generatingList ? 0.7 : 1
                    }}
                    className="lux-hover-lift"
                  >
                    <span style={{ fontWeight: 'bold' }}>{list.name}</span>
                    <span style={{ color: 'var(--c-goldBright)', fontSize: '0.8rem', fontFamily: 'var(--f-mono)' }}>{list.items.length} docs</span>
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--c-dim)', fontSize: '0.9rem' }}>You haven't created any reading lists yet. Save documents to a list while exploring the archive or news feed.</p>
            )}
          </div>
        </div>
      )}

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
