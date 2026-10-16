import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Shield, Sparkles, FileText, CreditCard, MessageCircle, Presentation, Mail, Wand2, Play, Pause } from 'lucide-react';
import { DIMENSIONS, normalizeParams, paramsToQuery } from '../../lib/guides/dimensions.js';
import { PRESETS } from '../../lib/guides/presets.js';
import { composeGuide } from '../../lib/guides/compose.js';
import { SpecialReport, Playbook } from '../components/guides/GuideFormats';
import { useIsCurator } from '../components/guides/useIsCurator';
import LoomChoreography from '../components/GuidedTour/LoomChoreography';
import { captureEvent } from '../lib/telemetry';
import './Guides.css';

const FORMAT_LINKS = [
  { id: 'report', label: 'Special Report', icon: FileText },
  { id: 'card', label: 'Pocket card', icon: CreditCard },
  { id: 'conversation', label: 'Conversation guide', icon: MessageCircle },
  { id: 'slides', label: 'Slides', icon: Presentation },
  { id: 'letter', label: 'Legislator letter', icon: Mail },
];

function DimensionPicker({ dim, value, onChange, includeDrafts }) {
  const options = dim.options.filter(o => includeDrafts || o.status !== 'draft');
  const isSelected = id => (dim.multi ? value.includes(id) : value === id);
  const toggle = id => {
    if (dim.multi) onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);
    else onChange(value === id && !dim.required && !dim.default ? null : id);
  };
  return (
    <fieldset className="gb-dim">
      <legend>{dim.label}{dim.multi && <span className="gd-muted"> (pick any; these go first)</span>}</legend>
      <div className="gb-chips" role={dim.multi ? 'group' : 'radiogroup'}>
        {options.map(o => (
          <button
            key={o.id}
            type="button"
            id={`gb-${dim.id}-${o.id}`}
            className={`gb-chip ${isSelected(o.id) ? 'is-on' : ''} ${o.status === 'draft' ? 'is-draft' : ''}`}
            aria-pressed={isSelected(o.id)}
            onClick={() => toggle(o.id)}
          >
            {o.label}{o.status === 'draft' && <span className="gb-draft-pill">draft</span>}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function GuideBuilderPage() {
  const navigate = useNavigate();
  const isCurator = useIsCurator();
  const [showDrafts, setShowDrafts] = useState(false);
  const includeDrafts = isCurator && showDrafts;
  const [params, setParams] = useState(() => normalizeParams(PRESETS[0].params));
  const [activePreset, setActivePreset] = useState(PRESETS[0].id);

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

  useEffect(() => { document.title = 'The Accidental Intactivist\u2019s Guide Series'; }, []);

  const guide = useMemo(() => composeGuide(params, { includeDrafts }), [params, includeDrafts]);
  const query = paramsToQuery(params, includeDrafts ? { drafts: '1' } : {});

  const setDim = (id, v) => { 
    setParams(p => normalizeParams({ ...p, [id]: v }, { includeDrafts })); 
    setActivePreset(null); 
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('loom-weave-draft', { detail: { id, v } }));
  };
  const applyPreset = preset => {
    setParams(normalizeParams(preset.params, { includeDrafts }));
    setActivePreset(preset.id);
    captureEvent('guide_preset_selected', { preset: preset.id });
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('loom-weave-draft', { detail: { preset: preset.id } }));
    document.getElementById('gb-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const openFormat = fmt => {
    captureEvent('guide_opened', { format: fmt, relationship: params.relationship, preset: activePreset });
    navigate(`/guides/view?${paramsToQuery(params, { format: fmt, ...(includeDrafts ? { drafts: '1' } : {}) })}`);
  };

  return (
    <div className="gd-page gb-page">
      <header className="gb-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.45 }}>
          <LoomChoreography isInline={true} forceFormation="greatLoom" opacity={1} themeColor="guides" />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="gd-series">The Accidental Intactivist's Guide · Series</div>
          <h1>Meet them where they are.</h1>
          <p className="gb-lede">
            Build a guide for the person you're trying to reach: an expectant parent, a skeptical nurse, a conservative grandfather, a pastor.
            Each one starts from values they already hold, finds the point where you agree, and backs every step with receipts.
          </p>
          <div className="gb-hero-actions">
            <a href="#gb-series" className="gd-btn gd-btn--primary"><BookOpen size={16} /> Browse the Series</a>
            <a href="#gb-builder" className="gd-btn"><Wand2 size={16} /> Build your own</a>
            <Link to="/guides/rebuttals" className="gd-btn"><Shield size={16} /> Counter-evidence builder</Link>
          </div>
        </div>

        {/* ── Great Loom Pause / Play Button ── */}
        <button
          type="button"
          onClick={toggleLoom}
          aria-label={loomPaused ? "Play background animation" : "Pause background animation"}
          title={loomPaused ? "Play background animation" : "Pause background animation"}
          className="gb-pause-btn"
          style={{
            position: "absolute",
            bottom: "1rem",
            right: "1.25rem",
            zIndex: 10,
            background: "rgba(0,0,0,0.45)",
            border: `1px solid ${loomPaused ? "var(--c-goldBright)" : "var(--c-ghost)"}`,
            color: loomPaused ? "var(--c-goldBright)" : "var(--c-dim)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = "var(--c-goldBright)";
            e.currentTarget.style.borderColor = "var(--c-goldBright)";
            e.currentTarget.style.background = "rgba(0,0,0,0.65)";
          }}
          onMouseLeave={e => {
            if (!loomPaused) {
              e.currentTarget.style.color = "var(--c-dim)";
              e.currentTarget.style.borderColor = "var(--c-ghost)";
              e.currentTarget.style.background = "rgba(0,0,0,0.45)";
            }
          }}
        >
          {loomPaused ? (
            <Play size={14} style={{ marginLeft: "2px", fill: "currentColor" }} />
          ) : (
            <Pause size={14} style={{ fill: "currentColor" }} />
          )}
        </button>
      </header>

      <section id="gb-series" className="gb-series">
        <h2>The Series</h2>
        <div className="gb-preset-grid">
          {PRESETS.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              id={`preset-${p.id}`}
              className={`gb-preset ${activePreset === p.id ? 'is-on' : ''} ${p.params.relationship === 'troll' ? 'gb-preset--playbook' : ''}`}
              style={{ animationDelay: `${idx * 40}ms` }}
              onClick={() => applyPreset(p)}
            >
              <span className="gb-preset-num">No. {String(idx + 1).padStart(2, '0')}</span>
              <span className="gb-preset-title">{p.title}</span>
              <span className="gb-preset-blurb">{p.blurb}</span>
            </button>
          ))}
        </div>
      </section>

      <section id="gb-builder" className="gb-builder">
        <div className="gb-controls">
          <h2>Build a bespoke guide</h2>
          {DIMENSIONS.map(dim => (
            <DimensionPicker key={dim.id} dim={dim} value={params[dim.id]} includeDrafts={includeDrafts} onChange={v => setDim(dim.id, v)} />
          ))}
          {isCurator && (
            <label className="gb-drafts">
              <input type="checkbox" checked={showDrafts} onChange={e => setShowDrafts(e.target.checked)} />
              Curator: show draft modules (not for distribution)
            </label>
          )}
          <div className="gb-formats">
            <h3>Open as…</h3>
            <div className="gb-format-grid">
              {FORMAT_LINKS.filter(f => guide.mode === 'guide' || f.id === 'report').map(f => (
                <button key={f.id} type="button" id={`open-${f.id}`} className="gd-btn" onClick={() => openFormat(f.id)}>
                  <f.icon size={16} /> {guide.mode === 'playbook' ? 'Open playbook' : f.label}
                </button>
              ))}
            </div>
            <p className="gd-muted gb-share">Share link: <code>/guides/view?{query}</code></p>
            <p className="gd-muted"><Sparkles size={12} /> <i>Weave with AI</i> (personalized narrative with fresh archive receipts) is coming in Phase 2 for signed-in users.</p>
          </div>
        </div>
        <div className="gb-preview" aria-live="polite">
          <div className="gb-preview-label">Live preview</div>
          <div className="gb-preview-paper">
            {guide.mode === 'playbook' ? <Playbook guide={guide} /> : <SpecialReport guide={guide} showAdvocateNotes={false} />}
          </div>
        </div>
      </section>
    </div>
  );
}
