import React, { useState, useEffect } from 'react';
import { Database, Zap, RefreshCw, CheckCircle } from 'lucide-react';

export default function BulkIngestEngine({ pendingCount, onRefresh }) {
  const [matching, setMatching] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState(null);
  const [localPending, setLocalPending] = useState(pendingCount);

  // Sync local count when parent updates
  useEffect(() => {
    setLocalPending(pendingCount);
  }, [pendingCount]);

  const handleBulkMatch = async () => {
    setMatching(true);
    setStats(null);
    try {
      const res = await fetch('/api/cms/bulk-match', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        if (onRefresh) onRefresh();
      } else {
        alert("Error matching R2 files: " + data.error);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
    setMatching(false);
  };

  const processNextDocument = async () => {
    try {
      const res = await fetch('/api/cms/process-ocr', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok && data.processed > 0) {
        setLocalPending(prev => Math.max(0, prev - 1));
        return true; // Keep going
      } else {
        return false; // Stop
      }
    } catch (err) {
      console.error(err);
      return false; // Stop on error
    }
  };

  const startIngestionEngine = async () => {
    if (processing || localPending === 0) return;
    setProcessing(true);
    
    let shouldContinue = true;
    while (shouldContinue && localPending > 0) {
      shouldContinue = await processNextDocument();
      // Add a tiny delay to not hammer the API too hard
      await new Promise(r => setTimeout(r, 1000));
    }
    
    setProcessing(false);
    if (onRefresh) onRefresh();
  };

  return (
    <div style={{
      background: 'rgba(212, 160, 48, 0.05)',
      border: '1px solid var(--c-gold)',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-goldBright)' }}>
        <Database size={24} />
        <h3 style={{ margin: 0, fontFamily: 'var(--f-condensed)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Zero-Click Bulk Ingestion Pipeline
        </h3>
      </div>
      
      <p style={{ margin: 0, color: 'var(--c-muted)', fontSize: '0.9rem' }}>
        Step 1: Upload your PDFs directly to the Cloudflare R2 Bucket. <br/>
        Step 2: Run the Matcher to link files to the database. <br/>
        Step 3: Start the Ingestion Engine to run AI OCR and Vectorize.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <button 
          onClick={handleBulkMatch}
          disabled={matching || processing}
          style={{
            background: 'transparent',
            border: '1px solid var(--c-gold)',
            color: 'var(--c-goldBright)',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: (matching || processing) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--f-condensed)',
            textTransform: 'uppercase',
            fontWeight: 700
          }}
        >
          {matching ? <RefreshCw size={16} className="spin" /> : <RefreshCw size={16} />}
          {matching ? "Matching Files..." : "Run R2 Matcher"}
        </button>

        <button 
          onClick={startIngestionEngine}
          disabled={processing || localPending === 0 || matching}
          style={{
            background: (processing || localPending === 0) ? 'rgba(255,255,255,0.1)' : 'var(--c-blue)',
            border: 'none',
            color: (processing || localPending === 0) ? 'var(--c-muted)' : '#000',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: (processing || localPending === 0 || matching) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--f-condensed)',
            textTransform: 'uppercase',
            fontWeight: 700
          }}
        >
          {processing ? <RefreshCw size={16} className="spin" /> : <Zap size={16} />}
          {processing ? `Processing... (${localPending} left)` : `Start OCR Engine (${localPending} pending)`}
        </button>
      </div>

      {stats && (
        <div style={{ fontSize: '0.85rem', color: 'var(--c-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={14} />
          Matched: {stats.matched} | Created: {stats.created} | Skipped: {stats.skipped}
        </div>
      )}

      {/* Add a simple spin animation if not exists globally */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
