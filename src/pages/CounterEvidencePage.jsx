import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Printer, FilePlus2, Check, ArrowLeft, X, Sparkles, Loader2, Play, Pause } from 'lucide-react';
import { availableCards, cardClaims, TIERS } from '../../lib/guides/compose.js';
import { CounterEvidenceCard, LedgerLegend } from '../components/guides/GuideParts';
import { useReport } from '../contexts/ReportContext';
import { captureEvent } from '../lib/telemetry';
import LoomChoreography from '../components/GuidedTour/LoomChoreography';
import './Guides.css';

function cardMatches(card, q) {
  if (!q) return true;
  const hay = [card.claim, card.askBack, ...cardClaims(card).map(c => c.text)].join(' ').toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w));
}

function cardMarkdown(card) {
  const lines = [`**${card.claim}**`];
  cardClaims(card).forEach(c => lines.push(`- ${TIERS[c.tier].icon} ${c.text}${c.cites?.length ? ` *(${c.cites.join('; ')})*` : c.ref ? ` *(${c.ref})*` : ''}`));
  lines.push(`- ❓ *${card.askBack}*`);
  return lines.join('\n');
}

export default function CounterEvidencePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState('');
  const tone = searchParams.get('tone') === 'direct' ? 'direct' : 'gentle';
  const selected = useMemo(() => new Set((searchParams.get('cards') || '').split(',').filter(Boolean)), [searchParams]);
  const [onlySelected, setOnlySelected] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToReport } = useReport();
  
  // AI Generation State
  const [aiLoading, setAiLoading] = useState(false);
  const [customRebuttal, setCustomRebuttal] = useState(null);

  const [loomPaused, setLoomPaused] = useState(() => {
    try { return localStorage.getItem('cs_loom_paused') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    const handlePauseEvent = (e) => {
      if (e.detail && e.detail.paused !== undefined) {
        setLoomPaused(e.detail.paused);
      }
    };
    window.addEventListener('cs-loom-pause', handlePauseEvent);
    return () => window.removeEventListener('cs-loom-pause', handlePauseEvent);
  }, []);

  const toggleLoom = () => {
    const next = !loomPaused;
    setLoomPaused(next);
    try { localStorage.setItem('cs_loom_paused', String(next)); } catch {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cs-loom-pause', { detail: { paused: next } }));
    }
  };

  useEffect(() => { document.title = 'Counter-Evidence Builder · The Accidental Intactivist\u2019s Guide'; }, []);

  const cards = useMemo(() => availableCards(tone), [tone]);
  const visible = cards.filter(c => cardMatches(c, q) && (!onlySelected || selected.has(c.id)));

  const update = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next, { replace: true });
  };
  const toggle = id => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    update('cards', [...s].join(','));
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('loom-weave-draft', { detail: { id } }));
  };
  const sendToReport = () => {
    const chosen = cards.filter(c => selected.has(c.id));
    if (customRebuttal && selected.has(customRebuttal.id)) {
      chosen.push(customRebuttal);
    }
    if (!chosen.length) return;
    addToReport(`## Counter-evidence\n\n${chosen.map(cardMarkdown).join('\n\n')}`);
    captureEvent('rebuttals_sent_to_report', { count: chosen.length });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleGenerateAI = async () => {
    if (!q.trim()) return;
    setAiLoading(true);
    try {
      const prompt = `
        You are a highly effective, patient, and empowering debater who really listens and processes what your opponents are dealing with to help find where your alignment truly lies. This is a highly pro-social, empathetic, and winning debate tactic.
        A user is facing the following claim regarding bodily autonomy/circumcision: "${q}".
        
        Using ONLY the factual archives and evidence briefs, generate a rebuttal structured EXACTLY as follows:
        1. **Recreate & Validate:** Steel-man their concern to show you understand it and check if it's a deeply held belief or just an inherited assumption they've never considered.
        2. **The Counter-Evidence:** Provide 1-2 concise, factual points from the archive that challenge the premise gently.
        3. **The Ask-Back:** End with a single, highly calibrated question that checks in with them and forces them to reconcile their belief with the new evidence.
        
        Do not use introductory or concluding filler.
      `;
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, system_prompt_override: prompt }),
      });
      const data = await response.json();
      
      let generatedText = data.response.trim();
      let askBack = "What specific medical necessity justifies removing healthy tissue from someone who cannot consent?";
      
      // Try to extract the final question as the ask back
      const paragraphs = generatedText.split('\n').filter(p => p.trim() !== '');
      if (paragraphs.length > 0) {
        const lastPara = paragraphs[paragraphs.length - 1];
        if (lastPara.includes('?')) {
          askBack = lastPara.replace(/^-\s*/, '').replace(/^\d+\.\s*\*\*.*?\*\*\s*/, '').trim();
          generatedText = paragraphs.slice(0, paragraphs.length - 1).join('\n\n');
        }
      }

      const newCard = {
        id: `custom-${Date.now()}`,
        claim: `Claim: "${q}"`,
        askBack: askBack,
        sections: [
          {
            type: 'rebuttal',
            items: [
              { tier: 1, text: generatedText, ref: 'Empathetic Synthesis' },
              { tier: 3, text: 'This is a custom research-assisted synthesis based on archive data and pro-social debate tactics. Please verify primary sources before use.', ref: 'Archive Researcher' }
            ]
          }
        ]
      };
      
      // Try to extract the ask back if AI provided one
      const askMatch = data.response.match(/\?(.*)$/m);
      if (askMatch) {
         newCard.askBack = data.response.substring(data.response.lastIndexOf('\n') + 1).replace(/^-\s*/, '').trim() || newCard.askBack;
      }
      
      setCustomRebuttal(newCard);
      
      // Ensure it's auto-selected
      const s = new Set(selected);
      s.add(newCard.id);
      update('cards', [...s].join(','));
      
    } catch (err) {
      console.error(err);
    }
    setAiLoading(false);
  };

  return (
    <div className={`gd-page ce-page ${selected.size ? 'has-selection' : ''}`} style={{ position: 'relative' }}>
      {/* Background Underloom holographic canvas in Guides Land (The Great Loom) */}
      <div className="no-print" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.28 }}>
        <LoomChoreography isInline={true} forceFormation="greatLoom" opacity={1} themeColor="guides" />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <header className="ce-hero no-print" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Link to="/guides" className="gd-btn gd-btn--ghost"><ArrowLeft size={16} /> Guide Series</Link>
            <button
              type="button"
              className="gd-btn gd-btn--ghost"
              onClick={toggleLoom}
              aria-label={loomPaused ? "Play background animation" : "Pause background animation"}
              title={loomPaused ? "Play background animation" : "Pause background animation"}
            >
              {loomPaused ? <Play size={16} /> : <Pause size={16} />} {loomPaused ? 'Play Loom' : 'Pause Loom'}
            </button>
          </div>
          <div className="gd-series">The Accidental Intactivist's Guide</div>
          <h1>Counter-Evidence Builder</h1>
          <p className="gb-lede">
            Pick the justifications you expect to hear or type a custom claim below. We utilize a <strong>highly effective, pro-social debate strategy</strong> that patiently listens and acknowledges the other person's concerns to help find where your alignment truly lies, before introducing counter-evidence and an "ask-back".
          </p>
          <LedgerLegend />
        </header>

        <div className="ce-controls no-print">
        <label className="ce-search" style={{ position: 'relative', display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '800px', background: 'transparent' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-dim)' }} />
            <input id="ce-search" type="search" placeholder="Search justifications (e.g. HIV, hygiene, pain)…" value={q} onChange={e => setQ(e.target.value)} style={{ width: '100%', padding: '0.8rem 2.5rem', borderRadius: '8px', border: '1px solid var(--c-ghost)', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', fontSize: '1rem' }} />
            {q && <button type="button" aria-label="Clear search" onClick={() => setQ('')} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--c-dim)', cursor: 'pointer' }}><X size={14} /></button>}
          </div>
          {q && (
            <button 
              type="button" 
              onClick={handleGenerateAI}
              disabled={aiLoading}
              className="lux-hover-lift"
              style={{ background: 'var(--c-goldBright)', color: '#000', border: 'none', padding: '0 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: aiLoading ? 'not-allowed' : 'pointer', opacity: aiLoading ? 0.7 : 1 }}
            >
              {aiLoading ? <Loader2 size={16} className="lux-spin" /> : <Sparkles size={16} />}
              {aiLoading ? 'Synthesizing...' : 'Ask Archive Researcher'}
            </button>
          )}
        </label>
        <div className="gv-tabs" role="radiogroup" aria-label="Tone">
          {['gentle', 'direct'].map(t => (
            <button key={t} type="button" role="radio" aria-checked={tone === t} className={`gv-tab ${tone === t ? 'is-on' : ''}`} onClick={() => update('tone', t === 'direct' ? 'direct' : null)}>
              {t === 'gentle' ? 'Gentle' : 'Direct (adds FGM comparison)'}
            </button>
          ))}
        </div>
        <label className="gb-drafts"><input type="checkbox" checked={onlySelected} onChange={e => setOnlySelected(e.target.checked)} /> Selected only ({selected.size})</label>
        <button type="button" className="gd-btn" onClick={() => window.print()} disabled={!selected.size} title="Prints the selected cards"><Printer size={16} /> Print selected</button>
        <button type="button" className="gd-btn gd-btn--primary" onClick={sendToReport} disabled={!selected.size}>{added ? <Check size={16} /> : <FilePlus2 size={16} />} {added ? 'Added' : 'To Report'}</button>
      </div>

      <div className="ce-grid gd-print-root">
        {customRebuttal && (!onlySelected || selected.has(customRebuttal.id)) && (
          <div key={customRebuttal.id} className={`ce-item ${selected.has(customRebuttal.id) ? 'is-selected' : 'not-selected'}`} style={{ border: '2px solid var(--c-goldBright)' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '1rem', background: 'var(--c-goldBright)', color: '#000', padding: '0.1rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={12} /> ARCHIVE SYNTHESIS
            </div>
            <label className="ce-select no-print">
              <input type="checkbox" checked={selected.has(customRebuttal.id)} onChange={() => toggle(customRebuttal.id)} id={`ce-pick-${customRebuttal.id}`} />
              {selected.has(customRebuttal.id) ? 'Selected' : 'Select'}
            </label>
            <CounterEvidenceCard card={customRebuttal} />
          </div>
        )}
        
        {visible.map(card => (
          <div key={card.id} className={`ce-item ${selected.has(card.id) ? 'is-selected' : 'not-selected'}`}>
            <label className="ce-select no-print">
              <input type="checkbox" checked={selected.has(card.id)} onChange={() => toggle(card.id)} id={`ce-pick-${card.id}`} />
              {selected.has(card.id) ? 'Selected' : 'Select'}
            </label>
            <CounterEvidenceCard card={card} />
          </div>
        ))}
        {!visible.length && !customRebuttal && <p className="gd-muted">No cards match “{q}”. Type a claim and click "Ask Archive Researcher" to create a custom rebuttal.</p>}
      </div>
      </div>
    </div>
  );
}
