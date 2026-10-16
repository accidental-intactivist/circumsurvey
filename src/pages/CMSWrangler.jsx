import React, { useState, useEffect } from 'react';
import BulkIngestEngine from '../components/BulkIngestEngine';
import AuthoringStudio from '../components/AuthoringStudio';
import './AdminArchivePage.css';
import { 
  Check, X, Globe, PlusSquare, MessageSquare, PenTool, 
  Sparkles, FileJson, Upload, CheckCircle2, AlertCircle, 
  Zap, Search, RefreshCw, BookmarkCheck
} from 'lucide-react';

const SAMPLE_MORNING_PAYLOAD = JSON.stringify([
  {
    "keywords": "hadachek, police power, zoning, precedent, public welfare",
    "statement": "Hadachek v. Sebastian (1915) affirmed that municipal police power extends to regulating private enterprise to safeguard public health and morals, establishing key jurisprudence regarding state interests versus individual liberties."
  },
  {
    "keywords": "aap, 2012 policy, pediatric consensus, expired, policy statement",
    "statement": "The American Academy of Pediatrics 2012 Circumcision Policy Statement officially expired in 2017 without renewal; currently, the AAP holds no active clinical policy endorsing non-therapeutic neonatal circumcision."
  },
  {
    "keywords": "meissner, corpuscles, prepuce histology, innervation, tactile sensitivity",
    "statement": "Peer-reviewed histological research demonstrates the human prepuce contains abundant Meissner corpuscles, fine-touch receptors, and specialized ridged band architecture essential for normal mechanoreception, refuting assertions that it lacks unique function."
  }
], null, 2);

export default function CMSWrangler() {
  const [documents, setDocuments] = useState([]);
  const [ingestionQueue, setIngestionQueue] = useState([]);
  const [translationHopper, setTranslationHopper] = useState([]);
  const [groundTruths, setGroundTruths] = useState([]);
  const [gtSuggestions, setGtSuggestions] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [newGtKeywords, setNewGtKeywords] = useState('');
  const [newGtStatement, setNewGtStatement] = useState('');
  const [jsonSyncInput, setJsonSyncInput] = useState('');
  const [jsonSyncStatus, setJsonSyncStatus] = useState(null);
  const [syncingJson, setSyncingJson] = useState(false);
  const [gtSearchQuery, setGtSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('ingestion'); // 'ingestion', 'queue', 'ingested', 'ocr', 'translations', 'groundtruth', 'comments', 'authoring'
  
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats independently
      fetch('/api/cms/stats').then(res => res.ok ? res.json() : null).then(data => {
        if (data && !data.error) setStats(data);
      }).catch(console.error);

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
        const [gtRes, sugRes] = await Promise.all([
          fetch('/api/ground-truth'),
          fetch('/api/ground-truth?suggestions=true')
        ]);
        if (gtRes.ok) {
          setGroundTruths(await gtRes.json());
        }
        if (sugRes.ok) {
          setGtSuggestions(await sugRes.json());
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

  const handleBatchSyncGroundTruth = async (e) => {
    if (e) e.preventDefault();
    setJsonSyncStatus(null);
    if (!jsonSyncInput.trim()) {
      setJsonSyncStatus({ type: 'error', message: 'Please paste a JSON array of ground truth statements.' });
      return;
    }
    setSyncingJson(true);
    try {
      let items;
      try {
        const parsed = JSON.parse(jsonSyncInput);
        if (Array.isArray(parsed)) {
          items = parsed;
        } else if (parsed && Array.isArray(parsed.ground_truths)) {
          items = parsed.ground_truths;
        } else if (parsed && Array.isArray(parsed.items)) {
          items = parsed.items;
        } else {
          throw new Error("JSON must be an array of objects or contain a 'ground_truths' array.");
        }
      } catch (parseErr) {
        setJsonSyncStatus({ type: 'error', message: 'Invalid JSON format: ' + parseErr.message });
        setSyncingJson(false);
        return;
      }

      const res = await fetch('/api/ground-truth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'batch_sync', items })
      });

      if (res.ok) {
        const result = await res.json();
        setJsonSyncStatus({ 
          type: 'success', 
          message: `Successfully indexed ${result.count} new ground truth rule(s) (${result.total} evaluated).` 
        });
        setJsonSyncInput('');
        fetchData();
      } else {
        setJsonSyncStatus({ type: 'error', message: 'Server failed to sync ground truths.' });
      }
    } catch (err) {
      console.error(err);
      setJsonSyncStatus({ type: 'error', message: err.message || 'Error executing batch sync.' });
    } finally {
      setSyncingJson(false);
    }
  };

  const handleApproveSuggestion = async (id) => {
    try {
      const res = await fetch('/api/ground-truth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_suggestion', id })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Failed to approve suggestion:', err);
    }
  };

  const handleRejectSuggestion = async (id) => {
    try {
      const res = await fetch('/api/ground-truth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject_suggestion', id })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Failed to reject suggestion:', err);
    }
  };

  const handleSeedSampleSuggestion = async () => {
    try {
      const sample = {
        action: 'suggest',
        keywords: 'prepuce, specialized innervation, meissner corpuscles, zeitgeist',
        statement: 'Histological peer-reviewed research demonstrates the human prepuce is specialized, highly vascularized mucocutaneous tissue containing dense concentrations of Meissner corpuscles, fine-touch receptors, and branched nerve endings, refuting claims that it is redundant or non-functional.',
        zeitgeist_impact: 'Directly counters media narratives treating infant circumcision as a benign cosmetic trim; anchors discussions in neurological anatomy.',
        source_id: 'sample-zeitgeist-pulse',
        source_title: 'Anatomical Survey & Prepuce Neurological Density Analysis'
      };
      const res = await fetch('/api/ground-truth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sample)
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Failed to seed sample suggestion:', err);
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

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--c-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Active Documents</div>
            <div style={{ color: 'var(--c-goldBright)', fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.active}</div>
            <div style={{ color: 'var(--c-dim)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Total in DB: {stats.total}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--c-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Added (Week)</div>
            <div style={{ color: '#4ade80', fontSize: '2.5rem', fontWeight: 'bold' }}>+{stats.added_week}</div>
            <div style={{ color: 'var(--c-dim)', fontSize: '0.8rem', marginTop: '0.5rem' }}>New knowledge</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--c-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Added (Month)</div>
            <div style={{ color: 'var(--c-blue)', fontSize: '2.5rem', fontWeight: 'bold' }}>+{stats.added_month}</div>
            <div style={{ color: 'var(--c-dim)', fontSize: '0.8rem', marginTop: '0.5rem' }}>30-day velocity</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--c-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Pending / Rejected</div>
            <div style={{ color: 'var(--c-textBright)', fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.pending} <span style={{ color: 'var(--c-dim)', fontSize: '1.5rem' }}>/</span> <span style={{ color: 'var(--c-red, #ef4444)'}}>{stats.rejected}</span></div>
            <div style={{ color: 'var(--c-dim)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Awaiting review</div>
          </div>
        </div>
      )}

      <BulkIngestEngine 
        pendingCount={ocrDocs.length} 
        onRefresh={fetchData} 
      />

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('authoring')}
          style={{
            background: activeTab === 'authoring' ? 'var(--c-goldBright)' : 'transparent',
            color: activeTab === 'authoring' ? '#000' : 'var(--c-textBright)',
            border: '1px solid var(--c-goldBright)',
            padding: '0.6rem 1.2rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <PenTool size={18} /> Authoring Studio
        </button>
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
          <Zap size={18} /> Ground Truth Rules ({groundTruths.length})
          {gtSuggestions.length > 0 && (
            <span style={{ 
              background: 'var(--c-goldBright, #f59e0b)', 
              color: '#000', 
              fontSize: '0.72rem', 
              fontWeight: 800, 
              padding: '0.15rem 0.5rem', 
              borderRadius: '999px',
              boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)'
            }}>
              {gtSuggestions.length} zeitgeist
            </span>
          )}
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

      {activeTab === 'authoring' ? (
        <AuthoringStudio />
      ) : (
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* 1. Header Overview */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(20, 20, 25, 0.95) 100%)', 
              padding: '1.8rem', 
              borderRadius: '12px', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                <span style={{ 
                  background: 'var(--c-red, #ef4444)', 
                  color: '#fff', 
                  fontSize: '0.75rem', 
                  fontWeight: 800, 
                  letterSpacing: '0.08em', 
                  textTransform: 'uppercase', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '4px' 
                }}>
                  Deterministic Bayesian System
                </span>
                <span style={{ color: 'var(--c-goldBright)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Active Rules: {groundTruths.length} | Pending Zeitgeist Candidates: {gtSuggestions.length}
                </span>
              </div>
              <h2 style={{ margin: '0.4rem 0 0.6rem 0', color: 'var(--c-textBright)', fontSize: '1.6rem' }}>
                Ground Truth & Zeitgeist Calibration
              </h2>
              <p style={{ color: 'var(--c-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0, maxWidth: '900px' }}>
                Ground truth rules are deterministic anchors that forcefully supersede vector database embeddings and outdated medical or legal literature. When a user inquiry matches any trigger keywords, these statements are injected directly into the LLM context as non-negotiable facts.
              </p>
            </div>

            {/* 2. Morning JSON Ingestion (Zeitgeist Sync) */}
            <div style={{ 
              background: 'var(--c-bgDeep, #121216)', 
              padding: '1.8rem', 
              borderRadius: '12px', 
              border: '1px solid var(--c-ghost, rgba(255,255,255,0.1))',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <FileJson size={22} style={{ color: 'var(--c-goldBright)' }} />
                    <h3 style={{ margin: 0, color: 'var(--c-textBright)', fontSize: '1.25rem' }}>
                      Morning Ground Truths JSON Ingestion
                    </h3>
                  </div>
                  <p style={{ color: 'var(--c-muted)', fontSize: '0.88rem', margin: 0 }}>
                    Batch calibrate the knowledge base each morning by supplying a JSON payload of newly established truths or zeitgeist updates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setJsonSyncInput(SAMPLE_MORNING_PAYLOAD)}
                  className="lux-hover-lift"
                  style={{
                    background: 'rgba(217, 119, 6, 0.15)',
                    color: 'var(--c-goldBright, #f59e0b)',
                    border: '1px solid rgba(217, 119, 6, 0.4)',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Sparkles size={14} /> Paste Sample Morning Payload
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <textarea
                  value={jsonSyncInput}
                  onChange={(e) => setJsonSyncInput(e.target.value)}
                  placeholder={`[\n  {\n    "keywords": "hadachek, police power, precedent",\n    "statement": "Hadachek v. Sebastian (1915) affirmed that municipal police power..."\n  },\n  {\n    "keywords": "aap, 2012 policy, expired",\n    "statement": "The American Academy of Pediatrics 2012 Circumcision Policy Statement officially expired in 2017..."\n  }\n]`}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'rgba(0, 0, 0, 0.45)',
                    border: '1px solid var(--c-ghost, rgba(255,255,255,0.12))',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />

                {/* Validation and Action Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    {(() => {
                      if (!jsonSyncInput.trim()) {
                        return <span style={{ color: 'var(--c-dim)' }}>Ready for JSON array or object with ground_truths array.</span>;
                      }
                      try {
                        const parsed = JSON.parse(jsonSyncInput);
                        const count = Array.isArray(parsed) ? parsed.length : (parsed.ground_truths || parsed.items || []).length;
                        return (
                          <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <CheckCircle2 size={16} /> Valid JSON: {count} rule{count === 1 ? '' : 's'} detected
                          </span>
                        );
                      } catch (err) {
                        return (
                          <span style={{ color: 'var(--c-red, #ef4444)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <AlertCircle size={16} /> Syntax error: {err.message}
                          </span>
                        );
                      }
                    })()}
                  </div>

                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    {jsonSyncInput && (
                      <button
                        type="button"
                        onClick={() => { setJsonSyncInput(''); setJsonSyncStatus(null); }}
                        style={{
                          background: 'transparent',
                          color: 'var(--c-dim)',
                          border: 'none',
                          padding: '0.6rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleBatchSyncGroundTruth}
                      disabled={syncingJson}
                      className="lux-hover-lift"
                      style={{
                        background: 'var(--c-red, #ef4444)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.7rem 1.4rem',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: syncingJson ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: syncingJson ? 0.7 : 1
                      }}
                    >
                      {syncingJson ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                      {syncingJson ? 'Indexing...' : 'Ingest & Index Ground Truths'}
                    </button>
                  </div>
                </div>

                {jsonSyncStatus && (
                  <div style={{
                    padding: '0.8rem 1.2rem',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    background: jsonSyncStatus.type === 'success' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${jsonSyncStatus.type === 'success' ? 'rgba(74, 222, 128, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                    color: jsonSyncStatus.type === 'success' ? '#4ade80' : 'var(--c-red, #ef4444)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}>
                    {jsonSyncStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {jsonSyncStatus.message}
                  </div>
                )}
              </div>
            </div>

            {/* 3. AI Zeitgeist Radar: Suggested Ground Truths */}
            <div style={{ 
              background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, var(--c-bgDeep, #121216) 100%)', 
              padding: '1.8rem', 
              borderRadius: '12px', 
              border: '1px solid rgba(245, 158, 11, 0.25)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <Zap size={22} style={{ color: 'var(--c-goldBright, #f59e0b)' }} />
                    <h3 style={{ margin: 0, color: 'var(--c-textBright)', fontSize: '1.25rem' }}>
                      AI Zeitgeist Radar: Candidate Ground Truths ({gtSuggestions.length})
                    </h3>
                  </div>
                  <p style={{ color: 'var(--c-muted)', fontSize: '0.88rem', margin: 0 }}>
                    Automatically captured during morning news ingestion and daily movement digests when events impact the cultural, legal, or anatomical consensus.
                  </p>
                </div>
                {gtSuggestions.length === 0 && (
                  <button
                    type="button"
                    onClick={handleSeedSampleSuggestion}
                    className="lux-hover-lift"
                    style={{
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: 'var(--c-goldBright)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Sparkles size={14} /> Seed Sample Zeitgeist Candidate
                  </button>
                )}
              </div>

              {gtSuggestions.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: 'var(--c-dim)', 
                  padding: '2.5rem 1rem', 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '8px',
                  border: '1px dashed var(--c-ghost)' 
                }}>
                  <BookmarkCheck size={28} style={{ color: 'var(--c-goldBright)', opacity: 0.5, marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: 600, color: 'var(--c-muted)', marginBottom: '0.3rem' }}>No Pending Zeitgeist Suggestions</div>
                  <div style={{ fontSize: '0.82rem' }}>The daily news ingest cron continuously scans for high-impact developments and surfaces candidate rules here for review.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {gtSuggestions.map((sug) => (
                    <div 
                      key={sug.id} 
                      style={{ 
                        background: 'rgba(0,0,0,0.4)', 
                        padding: '1.3rem', 
                        borderRadius: '8px', 
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
                        <div>
                          <span style={{ 
                            background: 'rgba(239, 68, 68, 0.2)', 
                            color: 'var(--c-red, #ef4444)', 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            textTransform: 'uppercase', 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '4px',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          }}>
                            Triggers: {sug.keywords}
                          </span>
                          {sug.source_title && (
                            <span style={{ color: 'var(--c-dim)', fontSize: '0.78rem', marginLeft: '0.8rem' }}>
                              Sourced from: {sug.source_title}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                          <button
                            onClick={() => handleApproveSuggestion(sug.id)}
                            className="lux-hover-lift"
                            style={{
                              background: '#15803d',
                              color: '#fff',
                              border: 'none',
                              padding: '0.45rem 0.9rem',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            <Check size={14} /> Approve & Index
                          </button>
                          <button
                            onClick={() => handleRejectSuggestion(sug.id)}
                            className="lux-hover-lift"
                            style={{
                              background: 'transparent',
                              color: 'var(--c-dim)',
                              border: '1px solid var(--c-ghost)',
                              padding: '0.45rem 0.8rem',
                              borderRadius: '6px',
                              fontWeight: 600,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <X size={14} /> Dismiss
                          </button>
                        </div>
                      </div>

                      <div style={{ color: 'var(--c-textBright)', fontSize: '0.98rem', lineHeight: 1.6, fontWeight: 500 }}>
                        {sug.statement}
                      </div>

                      {sug.zeitgeist_impact && (
                        <div style={{ 
                          fontSize: '0.82rem', 
                          color: 'var(--c-goldBright)', 
                          background: 'rgba(245, 158, 11, 0.08)', 
                          padding: '0.6rem 0.9rem', 
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <Sparkles size={14} />
                          <span><strong>Zeitgeist Impact:</strong> {sug.zeitgeist_impact}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Manual Ground Truth Rule Addition */}
            <div style={{ background: 'var(--c-bgDeep)', padding: '1.5rem', borderRadius: '12px', border: `1px solid var(--c-borderMuted)` }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--c-textBright)', fontSize: '1.15rem' }}>
                Add Single Ground Truth Rule
              </h3>
              <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Quickly author a single Bayesian rule for immediate deployment.
              </p>
              <form onSubmit={handleAddGroundTruth} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <input 
                  type="text" 
                  value={newGtKeywords} 
                  onChange={e => setNewGtKeywords(e.target.value)} 
                  placeholder="Keywords (comma-separated, e.g. aap, consensus, policy)" 
                  required
                  style={{ padding: '0.8rem', background: 'var(--c-bg)', border: '1px solid var(--c-ghost)', color: 'var(--c-text)', borderRadius: '4px', fontSize: '0.9rem' }}
                />
                <textarea 
                  value={newGtStatement} 
                  onChange={e => setNewGtStatement(e.target.value)} 
                  placeholder="The absolute truth statement that supersedes obsolete archive data..." 
                  required
                  rows={3}
                  style={{ padding: '0.8rem', background: 'var(--c-bg)', border: '1px solid var(--c-ghost)', color: 'var(--c-text)', borderRadius: '4px', fontFamily: 'inherit', fontSize: '0.9rem' }}
                />
                <button type="submit" style={{ background: 'var(--c-red, #ef4444)', color: '#fff', border: 'none', padding: '0.7rem 1.4rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-start' }}>
                  Create Ground Truth Rule
                </button>
              </form>
            </div>
            
            {/* 5. Active Ground Truth Rules Directory */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--c-textBright)', fontSize: '1.25rem' }}>
                  Active Ground Truth Rules ({groundTruths.length})
                </h3>
                <div style={{ position: 'relative', width: '280px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-dim)' }} />
                  <input
                    type="text"
                    value={gtSearchQuery}
                    onChange={(e) => setGtSearchQuery(e.target.value)}
                    placeholder="Filter active rules..."
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.8rem 0.5rem 2.2rem',
                      background: 'var(--c-bgDeep)',
                      border: '1px solid var(--c-ghost)',
                      borderRadius: '6px',
                      color: 'var(--c-text)',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {(() => {
                const filtered = groundTruths.filter(rule => {
                  if (!gtSearchQuery.trim()) return true;
                  const q = gtSearchQuery.toLowerCase();
                  return (rule.keywords || '').toLowerCase().includes(q) || (rule.statement || '').toLowerCase().includes(q);
                });

                if (filtered.length === 0) {
                  return (
                    <div style={{ color: 'var(--c-dim)', padding: '2rem', textAlign: 'center' }}>
                      {groundTruths.length === 0 ? 'No active rules in database.' : 'No rules match your filter query.'}
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {filtered.map(rule => (
                      <div key={rule.id} style={{ background: 'var(--c-bgSoft)', padding: '1.2rem 1.5rem', borderRadius: '8px', border: '1px solid var(--c-red, #ef4444)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: 'var(--c-red, #ef4444)', fontSize: '0.78rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                              Triggers: {rule.keywords}
                            </div>
                            <div style={{ color: 'var(--c-textBright)', lineHeight: 1.6, fontSize: '0.94rem' }}>{rule.statement}</div>
                          </div>
                          <button 
                            onClick={() => handleDeleteGroundTruth(rule.id)}
                            title="Delete Rule"
                            style={{ background: 'transparent', color: 'var(--c-dim)', border: '1px solid var(--c-ghost)', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
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
      )}
    </div>
  );
}
