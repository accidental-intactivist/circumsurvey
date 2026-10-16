import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Send, Search, Loader2, Sparkles, BookOpen, X, FilePlus, Copy, User, FileText, Link as LinkIcon, Building, EyeOff } from 'lucide-react';
import { useAssistant } from '../contexts/AssistantContext';
import { useReport } from '../contexts/ReportContext';
import { useMediaList } from '../contexts/MediaListContext';
import ThinkingSpirograph from './ThinkingSpirograph';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { C, FONT } from '../styles/tokens';

const ENROLLING_QUESTIONS = [
  "What can you tell me about the history of the genital autonomy movement?",
  "What are the most common themes in men's testimonies about their circumcision?",
  "How do the survey results differ across generations (e.g., Millennials vs. Boomers)?",
  "Summarize the legal and ethical arguments surrounding routine infant circumcision.",
  "What does the data say about foreskin restoration and why men pursue it?",
  "Find historical documents related to the medical community's stance on this issue.",
  "What are some surprising insights from the demographic data?",
  "Explain the concept of 'bodily integrity' and how it applies here.",
  "What do mothers and fathers report about their decisions regarding their sons?",
  "Are there any documented connections between neonatal circumcision and medical trauma?",
  "What role do partners play in a man's awareness of his circumcision status?",
  "What do intact men consider to be the main advantages of having a foreskin?"
];

import SafeImage from './SafeImage';

export default function AIAssistantFlyout() {
  const { isOpen, closeAssistant, initialQuery, setInitialQuery, initialSuggestions, setInitialSuggestions, attachedDocs, removeAttachedDoc, setAttachedDocs } = useAssistant();
  const { addToReport, reportText } = useReport();
  const { mediaLists } = useMediaList();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [randomSuggestions, setRandomSuggestions] = useState([]);
  const endRef = useRef(null);
  const chatContainerRef = useRef(null);
  const latestResponseRef = useRef(null);
  const latestUserMsgRef = useRef(null);
  const abortControllerRef = useRef(null);

  const [showListSelector, setShowListSelector] = useState(false);
  const [listDocs, setListDocs] = useState([]);
  const [listSearch, setListSearch] = useState('');
  const [listSort, setListSort] = useState('date');
  const [loadingList, setLoadingList] = useState(false);

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
    if (!isOpen) return;

    if (loading) {
      // While thinking, keep the bottom (user question + loading indicator) in view
      const timer = setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }

    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') {
        // Scoot up so the top of this new response is right at the top of the chat window!
        // The user shouldn't have to scroll back up to read from the start of the response.
        const scrollToResponseTop = () => {
          if (chatContainerRef.current && latestResponseRef.current) {
            const targetTop = latestResponseRef.current.offsetTop - 16;
            chatContainerRef.current.scrollTo({
              top: Math.max(0, targetTop),
              behavior: 'smooth'
            });
          } else if (latestResponseRef.current) {
            latestResponseRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        };

        const t1 = setTimeout(scrollToResponseTop, 50);
        const t2 = setTimeout(scrollToResponseTop, 220); // follow-up in case markdown reflows
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
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
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg, attachedDocs }),
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

  const handleAttachReport = () => {
    setAttachedDocs(prev => {
      if (prev.find(d => d.id === 'report-context')) return prev;
      return [...prev, { id: 'report-context', title: 'Current Evidence Report', content: reportText }].slice(-5);
    });
  };

  const openListSelector = async (list) => {
    if (!list || !list.items || list.items.length === 0) return;
    setShowListSelector(true);
    setLoadingList(true);
    try {
      const res = await fetch('/api/cms');
      if (res.ok) {
        const data = await res.json();
        const allDocs = data.data || data;
        const docs = list.items.map(id => allDocs.find(d => d.id === id)).filter(Boolean);
        setListDocs(docs);
      }
    } catch (e) {
      console.error("Failed to fetch docs for media list", e);
    }
    setLoadingList(false);
  };

  const filteredAndSortedDocs = useMemo(() => {
    let result = [...listDocs];
    if (listSearch) {
      const q = listSearch.toLowerCase();
      result = result.filter(d => {
        const title = (d.title || '').toLowerCase();
        const meta = d.metadata_json ? JSON.parse(d.metadata_json) : {};
        const metaTitle = (meta.title || meta.academic_title || '').toLowerCase();
        const keywords = (meta.keywords || meta.tags || []).join(' ').toLowerCase();
        return title.includes(q) || metaTitle.includes(q) || keywords.includes(q);
      });
    }
    result.sort((a, b) => {
      const metaA = a.metadata_json ? JSON.parse(a.metadata_json) : {};
      const metaB = b.metadata_json ? JSON.parse(b.metadata_json) : {};
      if (listSort === 'name') {
        const titleA = metaA.academic_title || metaA.title || a.title || '';
        const titleB = metaB.academic_title || metaB.title || b.title || '';
        return titleA.localeCompare(titleB);
      } else if (listSort === 'keyword') {
        const kA = (metaA.keywords || metaA.tags || [])[0] || '';
        const kB = (metaB.keywords || metaB.tags || [])[0] || '';
        return kA.localeCompare(kB);
      } else {
        const dateA = metaA.date || '0000';
        const dateB = metaB.date || '0000';
        return dateB.localeCompare(dateA);
      }
    });
    return result;
  }, [listDocs, listSearch, listSort]);

  const attachSpecificDoc = (doc) => {
    setAttachedDocs(prev => {
      if (prev.find(d => d.id === doc.id)) return prev;
      return [...prev, doc].slice(-5);
    });
    setShowListSelector(false);
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

        {/* List Selector Overlay */}
        {showListSelector && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: C.bgDeep, zIndex: 10, display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: `1px solid ${C.ghost}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: C.textBright, fontFamily: FONT.display, fontSize: '1.2rem' }}>Select Document</h3>
              <button onClick={() => setShowListSelector(false)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 0 }}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${C.ghost}`, background: C.bgCard }}>
              <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
                <input 
                  type="text" 
                  placeholder="Search reading list..." 
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2rem', background: C.bgDeep, border: `1px solid ${C.border}`, borderRadius: '6px', color: C.textBright, fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
              <select 
                value={listSort}
                onChange={e => setListSort(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem', background: C.bgDeep, border: `1px solid ${C.border}`, borderRadius: '6px', color: C.textBright, fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="date">Sort by Date (Newest first)</option>
                <option value="name">Sort by Name</option>
                <option value="keyword">Sort by Keyword</option>
              </select>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {loadingList ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: C.dim }}><Loader2 className="animate-spin" size={20} /></div>
              ) : filteredAndSortedDocs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: C.dim, fontSize: '0.85rem' }}>No documents found matching your criteria.</div>
              ) : (
                filteredAndSortedDocs.map(doc => {
                  const meta = doc.metadata_json ? JSON.parse(doc.metadata_json) : {};
                  const title = meta.academic_title || meta.title || doc.title || 'Untitled Document';
                  const date = meta.date || 'Unknown date';
                  const isAttached = attachedDocs.some(d => d.id === doc.id);
                  
                  return (
                    <div key={doc.id} style={{
                      padding: '1rem', background: C.card, border: `1px solid ${isAttached ? C.goldBright : C.border}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem'
                    }}>
                      <div style={{ color: C.textBright, fontSize: '0.9rem', fontWeight: 'bold', lineHeight: 1.4 }}>{title}</div>
                      <div style={{ color: C.dim, fontSize: '0.75rem' }}>{date} {meta.category ? `· ${meta.category}` : ''}</div>
                      <button 
                        disabled={isAttached}
                        onClick={() => attachSpecificDoc(doc)}
                        style={{
                          marginTop: '0.5rem', padding: '0.4rem 0', background: isAttached ? 'rgba(255,255,255,0.05)' : 'rgba(212,160,48,0.1)',
                          border: `1px solid ${isAttached ? 'transparent' : C.gold}`, borderRadius: '4px',
                          color: isAttached ? C.muted : C.goldBright, fontSize: '0.75rem', fontWeight: 'bold', cursor: isAttached ? 'default' : 'pointer'
                        }}
                      >
                        {isAttached ? 'Already Attached' : '+ Attach Document'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div 
          ref={chatContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            position: 'relative',
            scrollPaddingTop: '1rem'
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
            messages.map((m, i) => {
              const isLatestAssistant = m.role === 'assistant' && i === messages.length - 1;
              const isLatestUser = m.role === 'user' && i === messages.length - 1;
              return (
                <div 
                  key={i} 
                  ref={isLatestAssistant ? latestResponseRef : (isLatestUser ? latestUserMsgRef : null)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                    scrollMarginTop: '1rem'
                  }}
                >
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
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({node, ...props}) => {
                          const isEntity = props.href?.startsWith('/to/');
                          const isDoc = props.href?.startsWith('/library/');
                          
                          if (isEntity || isDoc) {
                            // Extract the text to guess if it's an organization
                            const linkText = String(props.children || "").toLowerCase();
                            const isOrg = linkText.match(/(center|association|organization|society|project|foundation|network|institute|university|hospital|clinic|group|coalition|alliance|chapter)/i);
                            
                            const IconCmp = isDoc ? FileText : (isOrg ? Building : User);

                            return (
                              <Link 
                                to={props.href} 
                                onClick={closeAssistant}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  color: 'var(--c-goldBright)',
                                  textDecoration: 'none',
                                  fontWeight: 600,
                                  background: 'rgba(212,160,48,0.1)',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  margin: '0 0.2rem',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,160,48,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,160,48,0.1)'}
                              >
                                <IconCmp size={12} />
                                <span>{props.children}</span>
                              </Link>
                            );
                          }
                          
                          return (
                            <a {...props} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#60a5fa', textDecoration: 'underline' }}>
                              <LinkIcon size={12} />
                              <span>{props.children}</span>
                            </a>
                          );
                        },
                        img: SafeImage
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
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
            );
          })
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
          {attachedDocs && attachedDocs.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {attachedDocs.map(doc => (
                <div key={doc.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.2rem 0.5rem', background: 'rgba(212,160,48,0.1)',
                  border: `1px solid ${C.goldBright}`, borderRadius: '4px',
                  fontSize: '0.75rem', color: C.textBright
                }}>
                  <BookOpen size={12} style={{ color: C.goldBright }} />
                  <span style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doc.title || 'Attached Document'}
                  </span>
                  <button 
                    onClick={() => removeAttachedDoc(doc.id)}
                    style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex', padding: 0 }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
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
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', paddingLeft: '1rem' }}>
             <button onClick={handleAttachReport} style={{ background: 'none', border: 'none', color: C.dim, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: 0 }} className="lux-hover-bright">
               <FileText size={12} /> Attach Report
             </button>
             {mediaLists && mediaLists.length > 0 && (
               <button onClick={() => openListSelector(mediaLists[0])} style={{ background: 'none', border: 'none', color: C.dim, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: 0 }} className="lux-hover-bright">
                 <BookOpen size={12} /> Attach from List
               </button>
             )}
          </div>
        </div>
      </div>
    </>
  );
}
