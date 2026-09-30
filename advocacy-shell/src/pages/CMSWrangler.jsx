import React, { useState, useEffect } from 'react';
import BulkIngestEngine from '../components/BulkIngestEngine';
import './AdminArchivePage.css';
import { Check, X, Globe, PlusSquare, MessageSquare } from 'lucide-react';

export default function CMSWrangler() {
  const [documents, setDocuments] = useState([]);
  const [ingestionQueue, setIngestionQueue] = useState([]);
  const [translationHopper, setTranslationHopper] = useState([]);
  const [groundTruths, setGroundTruths] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [newGtKeywords, setNewGtKeywords] = useState('');
  const [newGtStatement, setNewGtStatement] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ingestion'); // 'ingestion', 'queue', 'ingested', 'ocr', 'translations', 'groundtruth', 'comments'
  
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'ingestion') {
        const res = await fetch('/api/ingestion');
        if (res.ok) setIngestionQueue(await res.json());
      } else if (activeTab === 'translations') {
        const res = await fetch('/api/translations/hopper');
        if (res.ok) {
          const data = await res.json();
          setTranslationHopper(data.requests || []);
        }
      } else if (activeTab === 'groundtruth') {
        const res = await fetch('/api/ground-truth');
        if (res.ok) {
          setGroundTruths(await res.json());
        }
      } else if (activeTab === 'comments') {
        const res = await fetch('/api/comments?all=true');
        if (res.ok) {
          const data = await res.json();
          setPendingComments(data.filter(c => c.status === 'pending'));
        }
      } else {
        const res = await fetch('/api/cms');
        if (res.ok) {
          const body = await res.json();
          setDocuments(Array.isArray(body) ? body : (body.data || []));
        }
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    setLoading(false);
  };

  const handleApproveIngestion = async (id) => {
    try {
      const res = await fetch(`/api/ingestion/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectIngestion = async (id) => {
    try {
      const res = await fetch(`/api/ingestion/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveTranslation = async (document_id, target_language) => {
    try {
      const res = await fetch('/api/translations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id, target_language })
      });
      if (res.ok) fetchData();
      else {
        const err = await res.json();
        alert('Translation failed: ' + (err.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Error approving translation');
    }
  };

  const handleAddGroundTruth = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ground-truth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: newGtKeywords, statement: newGtStatement })
      });
      if (res.ok) {
        setNewGtKeywords('');
        setNewGtStatement('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGroundTruth = async (id) => {
    try {
      const res = await fetch('/api/ground-truth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleModerateComment = async (id, status) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const pendingDocs = documents.filter(d => d.status === 'pending');
  const ingestedDocs = documents.filter(d => d.status === 'ingested');
  const ocrDocs = documents.filter(d => d.status === 'pending_ocr');

  return (
    <div className="admin-archive-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div className="admin-header">
        <h1>CMS & Peer Review Wrangler</h1>
        <p>Manage the Intactivism Assistant's knowledge base and ingestion pipelines.</p>
      </div>

      <BulkIngestEngine 
        pendingCount={ocrDocs.length} 
        onRefresh={fetchData} 
      />

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('ingestion')}
          style={{
            background: activeTab === 'ingestion' ? 'var(--c-blue)' : 'transparent',
            color: activeTab === 'ingestion' ? '#fff' : 'var(--c-textBright)',
            border: '1px solid var(--c-blue)',
            padding: '0.6rem 1.2rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <Globe size={18} /> Deep Research Queue ({activeTab === 'ingestion' ? ingestionQueue.length : '?'})
        </button>
        <button 
          onClick={() => setActiveTab('queue')}
          style={{
            background: activeTab === 'queue' ? 'var(--c-goldBright)' : 'transparent',
            color: activeTab === 'queue' ? '#000' : 'var(--c-textBright)',
            border: '1px solid var(--c-goldBright)',
            padding: '0.6rem 1.2rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Peer Review Queue ({pendingDocs.length})
        </button>
        <button 
          onClick={() => setActiveTab('ocr')}
          style={{
            background: activeTab === 'ocr' ? 'var(--c-goldBright)' : 'transparent',
            color: activeTab === 'ocr' ? '#000' : 'var(--c-textBright)',
            border: '1px solid var(--c-goldBright)',
            padding: '0.6rem 1.2rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          OCR Queue ({ocrDocs.length})
        </button>
        <button 
          onClick={() => setActiveTab('ingested')}
          style={{
            background: activeTab === 'ingested' ? 'var(--c-goldBright)' : 'transparent',
            color: activeTab === 'ingested' ? '#000' : 'var(--c-textBright)',
            border: '1px solid var(--c-goldBright)',
            padding: '0.6rem 1.2rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Ingested Archive ({ingestedDocs.length})
        </button>
        <button 
          onClick={() => setActiveTab('translations')}
          style={{
            background: activeTab === 'translations' ? 'var(--c-purple)' : 'transparent',
            color: activeTab === 'translations' ? '#fff' : 'var(--c-textBright)',
            border: '1px solid var(--c-purple)',
            padding: '0.6rem 1.2rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <Globe size={18} /> Translations Hopper
        </button>
        <button 
          onClick={() => setActiveTab('groundtruth')}
          style={{
            background: activeTab === 'groundtruth' ? 'var(--c-red, #ef4444)' : 'transparent',
            color: activeTab === 'groundtruth' ? '#fff' : 'var(--c-textBright)',
            border: '1px solid var(--c-red, #ef4444)',
            padding: '0.6rem 1.2rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          Ground Truth Rules
        </button>
        <button 
          onClick={() => setActiveTab('comments')}
          style={{
            background: activeTab === 'comments' ? 'var(--c-green)' : 'transparent',
            color: activeTab === 'comments' ? '#000' : 'var(--c-textBright)',
            border: '1px solid var(--c-green)',
            padding: '0.6rem 1.2rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <MessageSquare size={18} /> Comment Moderation ({pendingComments.length || 0})
        </button>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: activeTab === 'ingestion' || activeTab === 'groundtruth' ? '1.5rem' : '0' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--c-dim)' }}>Loading...</div>
        ) : activeTab === 'ingestion' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {ingestionQueue.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--c-dim)', fontStyle: 'italic', padding: '2rem' }}>
                No pending ingestion points. Run the Deep Research script to find more.
              </div>
            )}
            {ingestionQueue.map(item => (
              <div key={item.id} style={{ background: 'var(--c-bgSoft)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--c-ghost)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--c-goldBright)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                      {item.source}
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--c-textBright)', fontSize: '1.2rem' }}>{item.title}</h3>
                    <p style={{ margin: '0 0 1rem 0', color: 'var(--c-text)', lineHeight: 1.6 }}>{item.abstract}</p>
                    <a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'var(--c-blue)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
                      <Globe size={14}/> View Source
                    </a>
                    
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '3px solid var(--c-blue)', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--c-blue)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem', fontWeight: 'bold' }}>Gemini Reasoning</div>
                      <div style={{ color: 'var(--c-textBright)', fontSize: '0.95rem' }}>{item.reason}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '150px' }}>
                    <button 
                      onClick={() => handleApproveIngestion(item.id)}
                      className="lux-hover-lift"
                      style={{ background: 'var(--c-green, #10b981)', color: '#000', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <PlusSquare size={20} /> Ingest
                    </button>
                    <button 
                      onClick={() => handleRejectIngestion(item.id)}
                      className="lux-hover-lift"
                      style={{ background: 'transparent', color: 'var(--c-red, #ef4444)', border: '1px solid var(--c-red, #ef4444)', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <X size={20} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'translations' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {translationHopper.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--c-dim)', fontStyle: 'italic', padding: '2rem' }}>
                No pending translation requests.
              </div>
            )}
            {translationHopper.map(req => (
              <div key={`${req.document_id}-${req.target_language}`} style={{ background: 'var(--c-bgSoft)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--c-ghost)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--c-textBright)' }}>{req.document_title || req.document_id}</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--c-goldBright)', fontWeight: 'bold' }}>Target: {req.target_language}</span>
                    <span style={{ color: 'var(--c-muted)', fontSize: '0.9rem' }}>Requested {req.request_count} time(s)</span>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => handleApproveTranslation(req.document_id, req.target_language)}
                    className="lux-hover-lift"
                    style={{ background: 'var(--c-purple)', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Sparkles size={18} /> AI Translate
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'groundtruth' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: 'var(--c-bgDeep)', padding: '1.5rem', borderRadius: '8px', border: `1px solid var(--c-borderMuted)` }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--c-textBright)' }}>Add Bayesian Ground Truth Rule</h3>
              <p style={{ color: 'var(--c-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Define statements that override the vector database. If a user query contains any of the keywords, this statement is forcefully injected as an absolute truth into the AI's context.
              </p>
              <form onSubmit={handleAddGroundTruth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                  type="text" 
                  value={newGtKeywords} 
                  onChange={e => setNewGtKeywords(e.target.value)} 
                  placeholder="Keywords (comma-separated, e.g. aap, consensus, policy)" 
                  required
                  style={{ padding: '0.8rem', background: 'var(--c-bg)', border: '1px solid var(--c-ghost)', color: 'var(--c-text)', borderRadius: '4px' }}
                />
                <textarea 
                  value={newGtStatement} 
                  onChange={e => setNewGtStatement(e.target.value)} 
                  placeholder="The absolute truth statement that supersedes obsolete archive data..." 
                  required
                  rows={4}
                  style={{ padding: '0.8rem', background: 'var(--c-bg)', border: '1px solid var(--c-ghost)', color: 'var(--c-text)', borderRadius: '4px', fontFamily: 'inherit' }}
                />
                <button type="submit" style={{ background: 'var(--c-red, #ef4444)', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-start' }}>
                  Create Ground Truth Rule
                </button>
              </form>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--c-textBright)' }}>Active Ground Truth Rules</h3>
              {groundTruths.length === 0 && <div style={{ color: 'var(--c-dim)' }}>No active rules.</div>}
              {groundTruths.map(rule => (
                <div key={rule.id} style={{ background: 'var(--c-bgSoft)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid var(--c-red, #ef4444)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--c-red, #ef4444)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Triggers: {rule.keywords}
                      </div>
                      <div style={{ color: 'var(--c-textBright)', lineHeight: 1.6 }}>{rule.statement}</div>
                    </div>
                    <button 
                      onClick={() => handleDeleteGroundTruth(rule.id)}
                      style={{ background: 'transparent', color: 'var(--c-red, #ef4444)', border: '1px solid var(--c-red, #ef4444)', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'comments' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {pendingComments.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--c-dim)', fontStyle: 'italic', padding: '2rem' }}>
                No pending comments to moderate.
              </div>
            )}
            {pendingComments.map(c => (
              <div key={c.id} style={{ background: 'var(--c-bgSoft)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--c-ghost)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--c-goldBright)' }}>{c.user_name}</strong>
                    <span style={{ color: 'var(--c-dim)', fontSize: '0.85rem' }}>on {new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ color: 'var(--c-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Doc ID: {c.doc_id}</div>
                  <p style={{ margin: 0, color: 'var(--c-textBright)', lineHeight: 1.6 }}>{c.comment}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '150px' }}>
                  <button 
                    onClick={() => handleModerateComment(c.id, 'approved')}
                    className="lux-hover-lift"
                    style={{ background: 'var(--c-green)', color: '#000', border: 'none', padding: '0.8rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Check size={18} /> Approve
                  </button>
                  <button 
                    onClick={() => handleModerateComment(c.id, 'rejected')}
                    className="lux-hover-lift"
                    style={{ background: 'transparent', color: 'var(--c-red, #ef4444)', border: '1px solid var(--c-red, #ef4444)', padding: '0.8rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <X size={18} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--c-ghost)' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Title</th>
                <th style={{ padding: '1rem 1.5rem' }}>Collection</th>
                <th style={{ padding: '1rem 1.5rem' }}>Type</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'queue' ? pendingDocs : activeTab === 'ocr' ? ocrDocs : ingestedDocs).map(doc => (
                <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 'bold', color: 'var(--c-textBright)' }}>{doc.title}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--c-muted)' }}>{doc.source_collection}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--c-muted)' }}>
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{doc.type}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    {doc.status === 'pending' ? (
                      <button 
                        style={{ background: 'var(--c-green)', color: '#000', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Approve
                      </button>
                    ) : (
                      <a href={doc.url} target="_blank" rel="noreferrer" style={{ color: 'var(--c-ltBlue)', textDecoration: 'underline' }}>View</a>
                    )}
                  </td>
                </tr>
              ))}
              {(activeTab === 'queue' ? pendingDocs : activeTab === 'ocr' ? ocrDocs : ingestedDocs).length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--c-muted)' }}>
                    No documents found in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
