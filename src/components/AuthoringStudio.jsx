import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { Bold, Italic, Link as LinkIcon, Image as ImageIcon, BookOpen, User, PenTool, CheckCircle, FileText, Building, X, Sparkles } from 'lucide-react';
import { C, FONT } from '../styles/tokens';
import SafeImage from './SafeImage';

export default function AuthoringStudio() {
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [content, setContent] = useState('');
  const [docType, setDocType] = useState('article');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [coachingFeedback, setCoachingFeedback] = useState(null);
  
  const textareaRef = useRef(null);

  const insertText = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newText);
    
    // Focus back and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handlePublish = async () => {
    if (!title || !content) {
      alert("Title and Content are required.");
      return;
    }

    setIsPublishing(true);
    
    const isFieldNote = docType === 'field_note';
    const payload = {
      title,
      type: isFieldNote ? 'field_note' : 'article',
      status: isFieldNote ? 'internal' : 'indexed', // field notes are internal only
      source_collection: isFieldNote ? 'Internal Field Notes' : 'Editorial Articles',
      content,
      metadata: {
        abstract,
        author: isFieldNote ? 'Accidental Intactivist' : 'Editorial Team',
        date: new Date().toISOString(),
        internal_only: isFieldNote
      }
    };

    try {
      const res = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const responseData = await res.json();
        setPublishSuccess(true);
        if (responseData.coaching_feedback) {
          setCoachingFeedback(responseData.coaching_feedback);
        }
        
        setTimeout(() => {
          setTitle('');
          setAbstract('');
          setContent('');
          setPublishSuccess(false);
        }, 3000);
      } else {
        const err = await res.json();
        alert("Failed to publish: " + err.error);
      }
    } catch (e) {
      console.error(e);
      alert("Error publishing.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: C.bgCard, padding: '2rem', borderRadius: 8, border: `1px solid ${C.ghost}` }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontFamily: FONT.display, color: C.textBright, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PenTool size={24} color={C.goldBright} /> Editorial Authoring Studio
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select 
            value={docType}
            onChange={e => setDocType(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.2)',
              color: C.goldBright,
              border: `1px solid ${C.goldBright}`,
              padding: '0.6rem 1rem',
              borderRadius: 4,
              fontFamily: FONT.condensed,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            <option value="article">Editorial Article (Public)</option>
            <option value="field_note">Field Note (Internal AI Context)</option>
          </select>
          <button 
            onClick={handlePublish}
            disabled={isPublishing || publishSuccess}
            className="lux-hover-lift"
            style={{
              background: publishSuccess ? C.green : C.gold,
              color: '#000',
              border: 'none',
              padding: '0.6rem 1.5rem',
              borderRadius: 4,
              fontWeight: 'bold',
              fontFamily: FONT.condensed,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: (isPublishing || publishSuccess) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isPublishing ? 'Publishing...' : (publishSuccess ? <><CheckCircle size={18} /> Saved!</> : (docType === 'field_note' ? 'Save to RAG' : 'Publish to News Feed'))}
          </button>
        </div>
      </div>

      {coachingFeedback && (
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--c-blue)', borderRadius: 8, padding: '1.5rem', marginBottom: '1rem', position: 'relative' }}>
          <button 
            onClick={() => setCoachingFeedback(null)}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--c-blue)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-blue)', fontWeight: 'bold', marginBottom: '1rem', fontFamily: FONT.condensed, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Sparkles size={18} /> Glenda's Feedback
          </div>
          <div style={{ color: 'var(--c-textBright)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: FONT.body }}>
            {coachingFeedback}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Article Title..." 
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: `1px solid ${C.ghost}`, color: C.textBright, borderRadius: 4, fontFamily: FONT.display, fontSize: '1.25rem' }}
        />
      </div>
      
      <textarea 
        placeholder="Short Abstract/Summary (optional)..." 
        value={abstract}
        onChange={e => setAbstract(e.target.value)}
        rows={2}
        style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: `1px solid ${C.ghost}`, color: C.text, borderRadius: 4, fontFamily: FONT.body, resize: 'vertical' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
        
        {/* LEFT PANE: Editor */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.ghost}`, borderBottom: 'none', borderRadius: '4px 4px 0 0' }}>
            <button title="Bold" onClick={() => insertText('**', '**')} style={{ background: 'transparent', border: 'none', color: C.text, cursor: 'pointer', padding: '0.2rem' }}><Bold size={16} /></button>
            <button title="Italic" onClick={() => insertText('_', '_')} style={{ background: 'transparent', border: 'none', color: C.text, cursor: 'pointer', padding: '0.2rem' }}><Italic size={16} /></button>
            <div style={{ width: 1, background: C.ghost, margin: '0 0.2rem' }}></div>
            <button title="Insert Link" onClick={() => insertText('[', '](url)')} style={{ background: 'transparent', border: 'none', color: C.text, cursor: 'pointer', padding: '0.2rem' }}><LinkIcon size={16} /></button>
            <button title="Insert Image" onClick={() => insertText('![alt text](', ')')} style={{ background: 'transparent', border: 'none', color: C.text, cursor: 'pointer', padding: '0.2rem' }}><ImageIcon size={16} /></button>
            <div style={{ width: 1, background: C.ghost, margin: '0 0.2rem' }}></div>
            <button title="Smart Link: Entity" onClick={() => insertText('[Entity Name](/to/', ')')} style={{ background: 'transparent', border: 'none', color: C.goldBright, cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontFamily: FONT.condensed }}><User size={14} /> Entity Link</button>
            <button title="Smart Link: Document" onClick={() => insertText('[Doc Name](/library/', ')')} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontFamily: FONT.condensed }}><BookOpen size={14} /> Doc Link</button>
          </div>
          
          <textarea 
            ref={textareaRef}
            placeholder="Write your article in Markdown..." 
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{ 
              flex: 1, minHeight: '500px', padding: '1rem', background: 'rgba(0,0,0,0.3)', 
              border: `1px solid ${C.ghost}`, borderRadius: '0 0 4px 4px', color: C.textBright, 
              fontFamily: FONT.mono, fontSize: '0.9rem', lineHeight: 1.6, resize: 'vertical' 
            }}
          />
        </div>

        {/* RIGHT PANE: Preview */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.ghost}`, borderBottom: 'none', borderRadius: '4px 4px 0 0', fontFamily: FONT.condensed, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live Preview
          </div>
          <div 
            className="markdown-assistant"
            style={{ 
              flex: 1, minHeight: '500px', padding: '1.5rem', background: 'rgba(0,0,0,0.1)', 
              border: `1px solid ${C.ghost}`, borderRadius: '0 0 4px 4px', 
              overflowY: 'auto', color: C.text 
            }}>
            {content ? (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({node, ...props}) => {
                    const isEntity = props.href?.startsWith('/to/');
                    const isDoc = props.href?.startsWith('/library/');
                    
                    if (isEntity || isDoc) {
                      const linkText = String(props.children || "").toLowerCase();
                      const isOrg = linkText.match(/(center|association|organization|society|project|foundation|network|institute|university|hospital|clinic|group|coalition|alliance|chapter)/i);
                      
                      const IconCmp = isDoc ? FileText : (isOrg ? Building : User);

                      return (
                        <Link 
                          to={props.href} 
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            color: 'var(--c-goldBright)', textDecoration: 'none', fontWeight: 600,
                            background: 'rgba(212,160,48,0.1)', padding: '0.1rem 0.4rem',
                            borderRadius: '4px', margin: '0 0.2rem', transition: 'background 0.2s'
                          }}
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
                {content}
              </ReactMarkdown>
            ) : (
              <div style={{ color: C.dim, fontStyle: 'italic', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Preview will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
