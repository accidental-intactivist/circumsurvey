import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { Search, X, Sparkles, ExternalLink, BookOpen, Network, Library } from 'lucide-react';
import ThinkingSpirograph from '../components/ThinkingSpirograph';
import { useAssistant } from '../contexts/AssistantContext';
import { resolveItemRoute } from '../utils/routing';
import { buildCitationGraph, topCited, citationSpan, selectView, NODE_KINDS } from '../utils/citationGraph';
import { captureEvent } from '../lib/telemetry';
import './CitationWeb.css';

const MIN_OPTIONS = [1, 2, 3, 5, 10, 20];
const DEFAULT_MIN = 5;
const PAGE_SIZE = 1000;
const MAX_PAGES = 40;
const CONCURRENCY = 4;

/** Page through /api/cms (1000 per request) and fall back to the local mock if the API is unavailable. */
async function loadAllDocuments(onProgress) {
  const url = offset => `/api/cms?limit=${PAGE_SIZE}&offset=${offset}&hide_rejected=1`;
  try {
    const first = await fetch(url(0));
    if (!first.ok) throw new Error(`HTTP ${first.status}`);
    const body = await first.json();
    let docs = body.data || [];
    const total = Math.min(body.total || docs.length, PAGE_SIZE * MAX_PAGES);
    onProgress?.(docs.length, total);
    const offsets = [];
    for (let o = PAGE_SIZE; o < total; o += PAGE_SIZE) offsets.push(o);
    for (let i = 0; i < offsets.length; i += CONCURRENCY) {
      const pages = await Promise.all(offsets.slice(i, i + CONCURRENCY).map(o =>
        fetch(url(o)).then(r => (r.ok ? r.json() : { data: [] })).catch(() => ({ data: [] }))));
      pages.forEach(p => { docs = docs.concat(p.data || []); });
      onProgress?.(docs.length, total);
    }
    if (docs.length) return docs;
  } catch (e) {
    console.warn('CMS load failed; falling back to local mock', e);
  }
  const mock = await fetch('/api_mock.json').catch(() => null);
  if (!mock?.ok) return [];
  const data = await mock.json();
  return Array.isArray(data) ? data : data.data || [];
}

const idOf = v => (v && typeof v === 'object' ? v.id : v);
const radius = n => (n.citedBy ? 2.5 + Math.sqrt(n.citedBy) * 1.5 : 2);
const truncate = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s || '');

export default function CitationWebPage() {
  const { openAssistant } = useAssistant();
  const [searchParams, setSearchParams] = useSearchParams();
  const fgRef = useRef(null);
  const canvasRef = useRef(null);
  const fitted = useRef(false);

  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [minCitations, setMinCitations] = useState(DEFAULT_MIN);
  const [archiveOnly, setArchiveOnly] = useState(false);
  const [boardKind, setBoardKind] = useState(null); // null | 'archive' | 'external'
  const [selectedId, setSelectedId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [query, setQuery] = useState('');

  // Size tracking for the canvas
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims(d => (Math.abs(d.width - width) < 1 && Math.abs(d.height - height) < 1 ? d : { width, height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadAllDocuments((loaded, total) => { if (!cancelled) setProgress({ loaded, total }); })
      .then(docs => { if (!cancelled) setGraph(buildCitationGraph(docs)); })
      .catch(err => console.error('Citation graph load failed', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const view = useMemo(() => selectView(graph, { minCitations, archiveOnly }), [graph, minCitations, archiveOnly]);
  useEffect(() => { fitted.current = false; }, [view]);

  // Tune forces for a dense, readable layout
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || !view.nodes.length) return;
    fg.d3Force('charge')?.strength(-28).distanceMax(400);
    fg.d3Force('link')?.distance(34);
  }, [view, dims.width]);

  const leaderboard = useMemo(() => topCited(graph, 30, { kind: boardKind }), [graph, boardKind]);
  const topLabelIds = useMemo(() => new Set(topCited(graph, 12).map(n => n.id)), [graph]);

  const focusId = hoverId || selectedId;
  const focusSet = useMemo(() => {
    const n = focusId && graph?.nodes.get(focusId);
    if (!n) return null;
    return new Set([n.id, ...n.citedBy, ...n.cites]);
  }, [focusId, graph]);

  const searchIndex = useMemo(() => {
    if (!graph) return [];
    return [...graph.nodes.values()]
      .filter(n => n.citedBy.size > 0)
      .sort((a, b) => b.citedBy.size - a.citedBy.size)
      .slice(0, 1500);
  }, [graph]);

  const centerOnNode = useCallback((id, delay = 0) => {
    setTimeout(() => {
      const fg = fgRef.current;
      const n = view.nodes.find(x => x.id === id);
      if (fg && n && Number.isFinite(n.x)) {
        fg.centerAt(n.x, n.y, 700);
        fg.zoom(2.6, 700);
      }
    }, delay);
  }, [view]);

  const selectNode = useCallback((id, { center = true } = {}) => {
    setSelectedId(id);
    if (!id || !graph) return;
    captureEvent('Citation Web Node Selected', { node_id: id });
    const n = graph.nodes.get(id);
    // If the work is filtered out of the current view, relax the threshold so it appears.
    const needsRelax = n && n.kind === 'external' && (archiveOnly || n.citedBy.size < minCitations);
    if (needsRelax) {
      setArchiveOnly(false);
      setMinCitations([...MIN_OPTIONS].reverse().find(m => m <= n.citedBy.size) || 1);
    }
    if (center) centerOnNode(id, needsRelax ? 1400 : 0);
  }, [graph, archiveOnly, minCitations, centerOnNode]);

  // Shareable focus: /citations?focus=<nodeId> or ?doc=<docId>
  useEffect(() => {
    if (!graph) return;
    const f = searchParams.get('focus') || searchParams.get('doc');
    if (!f) return;
    if (graph.nodes.has(f)) {
      selectNode(f, { center: true });
    } else {
      const foundNode = [...graph.nodes.values()].find(n => n.doc?.id === f || n.id === f || n.label?.toLowerCase() === f.toLowerCase());
      if (foundNode) selectNode(foundNode.id, { center: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (selectedId) next.set('focus', selectedId); else next.delete('focus');
    if (next.has('doc')) next.delete('doc');
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setSelectedId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const runSearch = (value, commit = false) => {
    const q = value.trim().toLowerCase();
    if (!q) return;
    const exact = searchIndex.find(n => n.label.toLowerCase() === q);
    const hit = exact || (commit && searchIndex.find(n => n.label.toLowerCase().includes(q) || (n.title || '').toLowerCase().includes(q)));
    if (hit) {
      selectNode(hit.id);
      setQuery('');
    }
  };

  // ── Canvas drawing ────────────────────────────────────────────────────
  const drawNode = useCallback((node, ctx, scale) => {
    const r = radius(node);
    const color = NODE_KINDS[node.kind]?.color || '#999';
    const dim = focusSet && !focusSet.has(node.id);
    ctx.globalAlpha = dim ? 0.1 : 1;
    if (!dim && node.citedBy >= 10) { ctx.shadowColor = color; ctx.shadowBlur = 14; }
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;
    if (node.id === selectedId) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 3 / scale + 1, 0, 2 * Math.PI);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 / scale;
      ctx.stroke();
    }
    const showLabel = focusSet
      ? focusSet.has(node.id) && (node.id === focusId || node.citedBy >= 1)
      : topLabelIds.has(node.id) || (scale > 2.5 && node.citedBy >= Math.max(2, minCitations));
    if (showLabel) {
      const fontSize = Math.max(10 / scale, 1.5);
      ctx.font = `${node.id === focusId ? 600 : 400} ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = node.id === focusId ? '#ffffff' : 'rgba(235,235,245,0.85)';
      ctx.fillText(truncate(node.label, node.id === focusId ? 70 : 38), node.x, node.y + r + 2 / scale);
    }
    ctx.globalAlpha = 1;
  }, [focusSet, focusId, selectedId, topLabelIds, minCitations]);

  const paintPointer = useCallback((node, color, ctx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius(node) + 2, 0, 2 * Math.PI);
    ctx.fill();
  }, []);

  const isLit = useCallback(l => focusId && (idOf(l.source) === focusId || idOf(l.target) === focusId), [focusId]);
  const linkColor = useCallback(l => {
    if (focusId) return isLit(l) ? 'rgba(242,193,78,0.8)' : 'rgba(255,255,255,0.015)';
    return l.internal ? 'rgba(92,200,161,0.28)' : 'rgba(180,170,255,0.08)';
  }, [focusId, isLit]);

  // ── Sidebar data ──────────────────────────────────────────────────────
  const selected = selectedId ? graph?.nodes.get(selectedId) : null;
  const span = selected ? citationSpan(graph, selected.id) : null;
  const citedByList = useMemo(() => (selected
    ? [...selected.citedBy].map(id => graph.nodes.get(id)).filter(Boolean).sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999))
    : []), [selected, graph]);
  const citesList = useMemo(() => (selected
    ? [...selected.cites].map(id => graph.nodes.get(id)).filter(Boolean).sort((a, b) => b.citedBy.size - a.citedBy.size).slice(0, 40)
    : []), [selected, graph]);

  const askAssistant = () => {
    if (!selected) return;
    const name = selected.title || selected.label;
    if (selected.kind === 'archive') {
      openAssistant(`Why is "${name}" cited so often across the archive, and how do later documents use it?`, null, selected.doc);
    } else {
      const citing = [...citedByList].reverse().slice(0, 5).map(n => n.doc).filter(Boolean);
      openAssistant(`How do these documents cite and use "${name}"? Summarize the role it plays in their arguments.`, null, citing);
    }
  };

  const maxCount = leaderboard[0]?.citedBy.size || 1;
  const ready = graph && dims.width > 0 && dims.height > 0;

  return (
    <div className="cw-root">
      <div ref={canvasRef} className="cw-canvas">
        {ready && view.nodes.length > 0 && (
          <ForceGraph2D
            ref={fgRef}
            width={dims.width}
            height={dims.height}
            graphData={view}
            backgroundColor="rgba(0,0,0,0)"
            nodeId="id"
            nodeLabel={() => ''}
            nodeCanvasObject={drawNode}
            nodePointerAreaPaint={paintPointer}
            linkColor={linkColor}
            linkWidth={l => (isLit(l) ? 1.4 : 0.5)}
            linkDirectionalArrowLength={l => (isLit(l) ? 4 : 0)}
            linkDirectionalArrowRelPos={1}
            linkDirectionalParticles={l => (isLit(l) ? 2 : 0)}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.006}
            linkDirectionalParticleColor={() => '#f2c14e'}
            onNodeHover={n => setHoverId(n ? n.id : null)}
            onNodeClick={n => selectNode(n.id, { center: false })}
            onBackgroundClick={() => setSelectedId(null)}
            cooldownTicks={220}
            d3AlphaDecay={0.03}
            onEngineStop={() => {
              if (!fitted.current && fgRef.current) {
                fitted.current = true;
                if (selectedId) centerOnNode(selectedId); else fgRef.current.zoomToFit(600, 70);
              }
            }}
          />
        )}
      </div>

      {loading && (
        <div className="cw-center-msg" style={{ color: 'var(--c-goldBright)' }}>
          <ThinkingSpirograph text="Tracing citations across the archive..." />
          {progress && <span className="cw-stats">{progress.loaded.toLocaleString()} / {progress.total.toLocaleString()} documents read</span>}
        </div>
      )}
      {!loading && (!graph || graph.links.length === 0) && (
        <div className="cw-center-msg">No citations have been extracted from archive documents yet.</div>
      )}
      {!loading && graph && graph.links.length > 0 && view.nodes.length === 0 && (
        <div className="cw-center-msg">Nothing meets this threshold. Lower &ldquo;Cited by at least&rdquo; to see more.</div>
      )}

      {/* Header & controls */}
      <header className="cw-header cw-glass">
        <h1>Citation Web</h1>
        <p>
          How the movement&apos;s documents build on one another. Each arrow runs from a document to a work it cites;
          the bigger the node, the more of the archive leans on it.
        </p>
        <datalist id="cw-node-names">
          {searchIndex.map(n => <option key={n.id} value={n.label} />)}
        </datalist>
        <div className="cw-controls">
          <label className="cw-search">
            <Search size={14} style={{ color: 'var(--c-dim)' }} />
            <input
              id="citation-search"
              list="cw-node-names"
              value={query}
              placeholder="Find a paper, author or year…"
              onChange={e => { setQuery(e.target.value); runSearch(e.target.value); }}
              onKeyDown={e => { if (e.key === 'Enter') runSearch(query, true); }}
              aria-label="Find a cited work"
            />
          </label>
          <div className="cw-segment" aria-label="Minimum citations">
            <span className="cw-kicker">Cited by ≥</span>
            {MIN_OPTIONS.map(m => (
              <button key={m} id={`citation-min-${m}`} className={minCitations === m ? 'is-active' : ''} onClick={() => setMinCitations(m)}>{m}</button>
            ))}
          </div>
          <button
            id="citation-archive-only"
            className={`cw-toggle ${archiveOnly ? 'is-on' : ''}`}
            onClick={() => setArchiveOnly(v => !v)}
            title="Only show documents in the archive citing other documents in the archive"
          >
            <Network size={13} /> Archive ↔ Archive
          </button>
        </div>
        {graph && (
          <div className="cw-stats">
            <strong>{view.nodes.length.toLocaleString()}</strong> works · <strong>{view.links.length.toLocaleString()}</strong> citations shown ·{' '}
            <strong>{graph.stats.citingDocs.toLocaleString()}</strong> citing documents · <strong>{graph.stats.internalLinks.toLocaleString()}</strong> archive-to-archive links
          </div>
        )}
      </header>

      {/* Legend */}
      {graph && (
        <div className="cw-legend cw-glass">
          {Object.entries(NODE_KINDS).map(([k, v]) => (
            <div key={k} className="cw-legend-row"><span className="cw-dot" style={{ background: v.color, color: v.color }} />{v.label}</div>
          ))}
          <div className="cw-legend-row"><span style={{ width: 18, borderTop: '2px solid rgba(92,200,161,0.7)' }} />Archive-to-archive citation</div>
          <div className="cw-legend-note">Node size = how many archive documents cite it. Glowing nodes are cited 10+ times.</div>
        </div>
      )}

      {!selected && graph && <div className="cw-hint cw-glass">Hover to trace · Click for details · Scroll to zoom · Esc to clear</div>}

      {/* Sidebar */}
      <aside className="cw-sidebar cw-glass" aria-label="Citation details">
        {selected ? (
          <>
            <div className="cw-sidebar-head">
              <div>
                <span className="cw-badge" style={{ color: NODE_KINDS[selected.kind].color }}>
                  {selected.kind === 'archive' ? <Library size={11} /> : <BookOpen size={11} />}
                  {NODE_KINDS[selected.kind].label}
                </span>
                <h2 className="cw-detail-title">{selected.kind === 'archive' ? selected.title : (selected.title || selected.label)}</h2>
                <div className="cw-detail-sub">
                  {selected.kind === 'archive'
                    ? `${selected.author || 'Unknown author'} · ${selected.year || 'n.d.'}${selected.category ? ` · ${selected.category}` : ''}`
                    : selected.label}
                </div>
              </div>
              <button className="cw-close" onClick={() => setSelectedId(null)} aria-label="Close details"><X size={16} /></button>
            </div>
            <div className="cw-sidebar-body">
              <div className="cw-metrics">
                <div className="cw-metric"><strong>{selected.citedBy.size}</strong><span>Cited by</span></div>
                <div className="cw-metric"><strong>{selected.cites.size}</strong><span>Cites</span></div>
                <div className="cw-metric" title={span ? `First cited ${span.from}, most recently ${span.to}` : ''}>
                  <strong>{span ? `${span.to - span.from + 1}y` : '—'}</strong><span>{span ? `${span.from}–${span.to}` : 'Span'}</span>
                </div>
              </div>

              <div className="cw-actions">
                {(selected.citedBy.size > 0 || selected.kind === 'archive') && (
                  <button className="cw-btn is-primary" onClick={askAssistant}><Sparkles size={14} /> Ask Assistant</button>
                )}
                {selected.kind === 'archive' && selected.doc && (
                  <Link className="cw-btn" to={resolveItemRoute(selected.doc, selected.meta).path}><BookOpen size={14} /> Open document</Link>
                )}
                {selected.kind === 'external' && (
                  <a className="cw-btn" href={`https://scholar.google.com/scholar?q=${encodeURIComponent(selected.title || selected.raws[0] || selected.label)}`} target="_blank" rel="noreferrer">
                    <ExternalLink size={14} /> Google Scholar
                  </a>
                )}
              </div>

              {selected.kind === 'external' && selected.raws.length > 0 && (
                <>
                  <div className="cw-section-title">As cited</div>
                  {selected.raws.map(r => <div key={r} className="cw-raw">{r}</div>)}
                </>
              )}

              {citedByList.length > 0 && (
                <>
                  <div className="cw-section-title">Cited by {citedByList.length} archive document{citedByList.length === 1 ? '' : 's'}</div>
                  {citedByList.map(n => (
                    <button key={n.id} className="cw-list-item" onClick={() => selectNode(n.id)}>
                      <span className="cw-list-year">{n.year || '—'}</span>
                      <span>{n.title}</span>
                    </button>
                  ))}
                </>
              )}

              {citesList.length > 0 && (
                <>
                  <div className="cw-section-title">Cites {selected.cites.size} work{selected.cites.size === 1 ? '' : 's'}{selected.cites.size > citesList.length ? ` (top ${citesList.length})` : ''}</div>
                  {citesList.map(n => (
                    <button key={n.id} className="cw-list-item" onClick={() => selectNode(n.id)}>
                      <span className="cw-list-year" style={{ color: NODE_KINDS[n.kind].color }}>×{n.citedBy.size}</span>
                      <span>{n.kind === 'archive' ? n.title : n.label}{n.kind === 'external' && n.title ? <span style={{ color: 'var(--c-dim)' }}> — {truncate(n.title, 70)}</span> : null}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="cw-sidebar-head">
              <div>
                <div className="cw-kicker">Most cited</div>
                <h2 className="cw-detail-title" style={{ marginTop: '0.3rem' }}>
                  {boardKind === 'external' ? 'Not yet in the archive' : boardKind === 'archive' ? 'Foundational holdings' : 'The works everyone builds on'}
                </h2>
                <div className="cw-detail-sub">
                  {boardKind === 'external'
                    ? 'Frequently cited works we don\u2019t hold yet: a ready-made acquisition list.'
                    : 'Ranked by how many archive documents cite them.'}
                </div>
              </div>
            </div>
            <div style={{ padding: '0.75rem 1rem 0' }}>
              <div className="cw-segment" aria-label="Filter leaderboard">
                <button id="citation-board-all" className={!boardKind ? 'is-active' : ''} onClick={() => setBoardKind(null)}>All</button>
                <button id="citation-board-archive" className={boardKind === 'archive' ? 'is-active' : ''} onClick={() => setBoardKind('archive')}>In archive</button>
                <button id="citation-board-external" className={boardKind === 'external' ? 'is-active' : ''} onClick={() => setBoardKind('external')}>Missing</button>
              </div>
            </div>
            <div className="cw-sidebar-body">
              {leaderboard.map((n, i) => {
                const s = citationSpan(graph, n.id);
                const color = NODE_KINDS[n.kind].color;
                return (
                  <button key={n.id} className="cw-rank" style={{ animationDelay: `${Math.min(i, 15) * 25}ms` }} onClick={() => selectNode(n.id)}
                    onMouseEnter={() => setHoverId(n.id)} onMouseLeave={() => setHoverId(null)}>
                    <span className="cw-rank-num">{i + 1}</span>
                    <span>
                      <div className="cw-rank-label">{n.kind === 'archive' ? n.title : (n.title ? `${n.label} — ${n.title}` : n.label)}</div>
                      <div className="cw-rank-sub">{s ? `Cited ${s.from}–${s.to}` : ''}</div>
                      <div className="cw-bar" style={{ color, width: `${Math.max(8, (n.citedBy.size / maxCount) * 100)}%`, animationDelay: `${Math.min(i, 15) * 25}ms` }} />
                    </span>
                    <span className="cw-count" style={{ color }}>{n.citedBy.size}</span>
                  </button>
                );
              })}
              {!loading && leaderboard.length === 0 && <div className="cw-detail-sub">No citations found yet.</div>}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
