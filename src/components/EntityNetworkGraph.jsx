import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Circle, Target, Crosshair, FileText } from 'lucide-react';
import ThinkingSpirograph from './ThinkingSpirograph';
import RingView from './graph/RingView';
import DegreesView from './graph/DegreesView';
import EvidencePanel from './graph/EvidencePanel';
import {
  buildEntityGraph, bfsFrom, pathTo, degreeOf, findByName,
  TYPE_GROUPS, STANCES, PREFERRED_CENTERS, CROSS_STANCE_COLOR,
  AUTONOMY_SCALE, getEntityAutonomy
} from '../utils/entityGraph';
import './graph/EntityGraph.css';

const ORDINAL = ['', '1st', '2nd', '3rd'];

async function loadGraphSources() {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const [entRes, entMockRes] = await Promise.all([
    fetch('/api/entities').catch(() => ({ ok: false })),
    isLocal ? fetch('/api_entities_mock.json').catch(() => ({ ok: false })) : Promise.resolve({ ok: false }),
  ]);

  let entities = [];
  if (entRes.ok) { try { entities = await entRes.json(); } catch (e) { /* non-JSON */ } }
  if (!Array.isArray(entities)) entities = entities?.data || [];
  if (entMockRes.ok) {
    try {
      const mock = await entMockRes.json();
      if (Array.isArray(mock)) entities = entities.concat(mock); // merged by name in buildEntityGraph
    } catch (e) { /* ignore */ }
  }

  let docs = [];
  try {
    if (isLocal) {
      const mockRes = await fetch('/api_mock.json').catch(() => ({ ok: false }));
      if (mockRes.ok) {
        const mockData = await mockRes.json();
        docs = Array.isArray(mockData) ? mockData : mockData.data || [];
      }
    } else {
      // Production: page through /api/cms so all 3,300+ archive documents are included in the graph
      const firstRes = await fetch('/api/cms?limit=1000&hide_rejected=1').catch(() => ({ ok: false }));
      if (firstRes.ok) {
        const body = await firstRes.json();
        docs = body.data || [];
        const total = body.total || docs.length;
        if (total > 1000) {
          const offsets = [];
          for (let o = 1000; o < total && o < 5000; o += 1000) offsets.push(o);
          const paged = await Promise.all(
            offsets.map(o => fetch(`/api/cms?limit=1000&offset=${o}&hide_rejected=1`)
              .then(r => r.ok ? r.json() : { data: [] })
              .catch(() => ({ data: [] }))
            )
          );
          paged.forEach(p => { docs = docs.concat(p.data || []); });
        }
      }
    }
  } catch (e) {
    console.warn("Failed to load documents for graph", e);
  }

  return { entities, docs };
}

export default function EntityNetworkGraph({ focusEntityId = null }) {
  const rootRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const syncUrl = !focusEntityId; // only the standalone /graph page owns the URL

  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState(() =>
    focusEntityId || (syncUrl && (searchParams.get('view') === 'degrees' || searchParams.get('center') || searchParams.get('focus'))) ? 'degrees' : 'ring');
  const [centerId, setCenterId] = useState(null);
  const [depth, setDepth] = useState(focusEntityId ? 2 : 3);
  const [colorBy, setColorBy] = useState('rubric');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [activePathIds, setActivePathIds] = useState([]);
  const [crossOnly, setCrossOnly] = useState(false);
  const [moneyTrailsOnly, setMoneyTrailsOnly] = useState(false);
  const [pinnedId, setPinnedId] = useState(null);
  const [panel, setPanel] = useState(null); // { kind: 'node', id } | { kind: 'edge', key }
  const [ringMeta, setRingMeta] = useState(null);
  const [degMeta, setDegMeta] = useState(null);
  const [query, setQuery] = useState('');
  const [centerQuery, setCenterQuery] = useState('');

  const handleActivePathChange = useCallback((path) => {
    setActivePathIds(prev => {
      if (prev.length === path.length && prev.every((id, idx) => id === path[idx])) return prev;
      return path;
    });
  }, []);

  // Size tracking (root is always mounted so the observer attaches immediately).
  useEffect(() => {
    const el = rootRef.current;
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
    setLoading(true);
    loadGraphSources()
      .then(({ entities, docs }) => { if (!cancelled) setGraph(buildEntityGraph(entities, docs)); })
      .catch(err => console.error('Graph load failed', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Default center: profile entity > ?focus= / ?center= > preferred hub (Tim Hammond) > most documented.
  useEffect(() => {
    if (!graph) return;
    const usable = id => (id && degreeOf(graph, id) ? id : null);
    let id = focusEntityId ? graph.aliasToId.get(focusEntityId) : null;
    if (!id && syncUrl) {
      const fromUrl = searchParams.get('center') || searchParams.get('focus');
      if (fromUrl) {
        id = usable(graph.aliasToId.get(fromUrl)) ||
          usable(graph.aliasToId.get(decodeURIComponent(fromUrl))) ||
          usable([...graph.nodes.values()].find(n => n.slug === fromUrl || n.slug === fromUrl.toLowerCase())?.id) ||
          usable(findByName(graph, fromUrl.replace(/[-_]/g, ' '))) ||
          usable(findByName(graph, decodeURIComponent(fromUrl).replace(/[-_]/g, ' ')));
        if (id) {
          setMode('degrees');
        }
      }
    }
    if (!id) id = PREFERRED_CENTERS.map(n => usable(findByName(graph, n))).find(Boolean);
    if (!id) {
      let best = null;
      for (const n of graph.nodes.values()) {
        if (degreeOf(graph, n.id) && (!best || n.docIds.length > best.docIds.length)) best = n;
      }
      id = best?.id || null;
    }
    setCenterId(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, focusEntityId]);

  // Keep /graph URLs shareable: ?view=degrees&center=<slug-or-id>
  useEffect(() => {
    if (!syncUrl || !graph || !centerId) return;
    const next = new URLSearchParams(searchParams);
    if (mode === 'degrees') {
      const node = graph.nodes.get(centerId);
      next.set('view', 'degrees');
      next.set('center', node?.slug || centerId);
      next.delete('focus');
    } else {
      next.delete('view');
      next.delete('center');
      next.delete('focus');
    }
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, centerId, graph, syncUrl]);

  const bfs = useMemo(() => (graph && centerId ? bfsFrom(graph, centerId, moneyTrailsOnly) : null), [graph, centerId, moneyTrailsOnly]);

  const stats = useMemo(() => {
    if (!graph) return null;
    let connected = 0;
    for (const id of graph.nodes.keys()) if (degreeOf(graph, id)) connected += 1;
    return { connected, edges: graph.edges.size, docs: graph.docs.size };
  }, [graph]);

  const presentGroups = useMemo(
    () => (graph ? TYPE_GROUPS.filter(g => [...graph.nodes.values()].some(n => n.group === g.key && degreeOf(graph, n.id))) : []),
    [graph]
  );
  const presentStances = useMemo(
    () => (graph ? STANCES.filter(s => [...graph.nodes.values()].some(n => n.stance === s.key && degreeOf(graph, n.id))) : []),
    [graph]
  );

  const nameIndex = useMemo(() => {
    if (!graph) return { list: [], map: new Map() };
    const list = [...graph.nodes.values()].filter(n => degreeOf(graph, n.id)).sort((a, b) => a.name.localeCompare(b.name));
    return { list, map: new Map(list.map(n => [n.name.toLowerCase(), n.id])) };
  }, [graph]);

  const selectedNodeId = panel?.kind === 'node' ? panel.id : null;
  const selectedPath = useMemo(
    () => (mode === 'degrees' && bfs && selectedNodeId ? pathTo(bfs, selectedNodeId) : null),
    [mode, bfs, selectedNodeId]
  );

  const selectNode = useCallback(id => {
    setPinnedId(id);
    setPanel(id ? { kind: 'node', id } : null);
  }, []);
  const selectEdge = useCallback(key => setPanel({ kind: 'edge', key }), []);
  const clearAll = useCallback(() => { setPinnedId(null); setPanel(null); }, []);
  const centerOn = useCallback(id => {
    setMode('degrees');
    setCenterId(id);
    setPinnedId(null);
    setPanel({ kind: 'node', id });
  }, []);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') clearAll(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clearAll]);

  const matchName = value => nameIndex.map.get(value.trim().toLowerCase());

  const onSearch = e => {
    const value = e.target.value;
    setQuery(value);
    const id = matchName(value);
    if (id) {
      selectNode(id);
      setQuery('');
      e.target.blur();
    }
  };

  const onCenterSearch = e => {
    const value = e.target.value;
    setCenterQuery(value);
    const id = matchName(value);
    if (id) {
      centerOn(id);
      setCenterQuery('');
      e.target.blur();
    }
  };

  const ready = graph && dims.width > 0 && dims.height > 0;
  const centerName = centerId && graph?.nodes.get(centerId)?.name;
  // In Six Degrees mode, only force a path into the rings if it fits the chosen depth.
  const forcedPath = selectedPath && selectedPath.length - 1 <= depth ? selectedPath : null;

  return (
    <div ref={rootRef} className="eg-root">
      {loading && (
        <div className="eg-center-msg" style={{ color: 'var(--c-goldBright)' }}>
          <ThinkingSpirograph text="Mapping connections..." />
        </div>
      )}

      {!loading && (!graph || graph.edges.size === 0) && (
        <div className="eg-center-msg">No documented connections found to graph yet.</div>
      )}

      {!loading && ready && graph.edges.size > 0 && (
        <>
          <div className="eg-canvas">
            {mode === 'ring' ? (
              <RingView
                key="ring"
                graph={graph}
                width={dims.width}
                height={dims.height}
                selectedId={pinnedId}
                colorBy={colorBy}
                crossOnly={crossOnly}
                moneyTrailsOnly={moneyTrailsOnly}
                onSelectNode={id => (id ? selectNode(id) : clearAll())}
                onSelectEdge={selectEdge}
                onCenter={centerOn}
                onMeta={setRingMeta}
              />
            ) : bfs ? (
              <DegreesView
                key={`deg-${centerId}-${depth}-${gradeFilter}`}
                graph={graph}
                bfs={bfs}
                maxDepth={depth}
                width={dims.width}
                height={dims.height}
                selectedId={pinnedId}
                selectedPath={forcedPath}
                colorBy={colorBy}
                gradeFilter={gradeFilter}
                moneyTrailsOnly={moneyTrailsOnly}
                onSelectNode={id => (id ? selectNode(id) : clearAll())}
                onSelectEdge={selectEdge}
                onCenter={centerOn}
                onMeta={setDegMeta}
                onActivePathChange={handleActivePathChange}
              />
            ) : null}
          </div>

          <datalist id="graph-entity-names">
            {nameIndex.list.map(n => <option key={n.id} value={n.name} />)}
          </datalist>

          <div className="eg-top-overlay">
            <div className="eg-toolbar">
              <div className="eg-segment eg-glass" role="tablist" aria-label="Graph view">
                <button id="graph-mode-ring" className={mode === 'ring' ? 'is-active' : ''} onClick={() => { setMode('ring'); clearAll(); }}>
                  <Circle size={11} style={{ verticalAlign: '-1px', marginRight: 5 }} />Ring
                </button>
                <button id="graph-mode-degrees" className={mode === 'degrees' ? 'is-active' : ''} onClick={() => { setMode('degrees'); clearAll(); }}>
                  <Target size={11} style={{ verticalAlign: '-1px', marginRight: 5 }} />Six Degrees
                </button>
              </div>

              {mode === 'degrees' && (
                <label className="eg-center-picker eg-glass" title="Pick who sits at the center">
                  <Crosshair size={13} style={{ color: 'var(--c-goldBright)', flexShrink: 0 }} />
                  <span className="eg-kicker">Center</span>
                  <input
                    id="graph-center-picker"
                    list="graph-entity-names"
                    value={centerQuery}
                    onChange={onCenterSearch}
                    placeholder={centerName || 'Choose an entity…'}
                    aria-label="Choose the center entity"
                  />
                </label>
              )}

              <label className="eg-search eg-glass">
                <Search size={14} style={{ color: 'var(--c-dim)', flexShrink: 0 }} />
                <input
                  id="graph-entity-search"
                  list="graph-entity-names"
                  value={query}
                  onChange={onSearch}
                  placeholder={mode === 'ring' ? 'Find a person or organization…' : `Trace a path to ${centerName || 'center'}…`}
                  aria-label="Find an entity"
                />
              </label>

              {mode === 'degrees' && (
                <div className="eg-segment eg-glass" aria-label="Degrees shown">
                  {[1, 2, 3].map(d => (
                    <button key={d} id={`graph-depth-${d}`} className={depth === d ? 'is-active' : ''} onClick={() => setDepth(d)}>
                      {d}°
                    </button>
                  ))}
                </div>
              )}

              {mode === 'degrees' && (
                <label className="eg-grade-picker eg-glass" title="Filter nodes by Genital Autonomy Ground Truth Grade">
                  <span className="eg-kicker">Grade</span>
                  <select
                    id="graph-grade-filter"
                    value={gradeFilter}
                    onChange={e => setGradeFilter(e.target.value)}
                    aria-label="Filter by Autonomy Grade"
                  >
                    <option value="all">All Grades (A+ to F)</option>
                    <option value="A+">A+ · Very Pro-Intact</option>
                    <option value="B+">B+ · Leans Autonomy</option>
                    <option value="C">C · Neutral Record</option>
                    <option value="D">D · Leans Cutting</option>
                    <option value="F">F · Very Pro-Cutting</option>
                  </select>
                </label>
              )}

              <div className="eg-segment eg-glass" aria-label="Color nodes by">
                <button id="graph-color-rubric" className={colorBy === 'rubric' ? 'is-active' : ''} onClick={() => setColorBy('rubric')} title="Color by 5-Point Autonomy Rubric Grade">
                  Autonomy
                </button>
                <button id="graph-color-stance" className={colorBy === 'stance' ? 'is-active' : ''} onClick={() => setColorBy('stance')}>
                  Stance
                </button>
                <button id="graph-color-type" className={colorBy === 'type' ? 'is-active' : ''} onClick={() => setColorBy('type')}>
                  Type
                </button>
              </div>

              {mode === 'ring' && (
                <button id="graph-cross-filter" className={`eg-toggle eg-glass ${crossOnly ? 'is-on' : ''}`}
                  onClick={() => { setCrossOnly(v => !v); setMoneyTrailsOnly(false); clearAll(); }}
                  title="Only show links where a champion and a critic are named in the same document">
                  <span className="eg-swatch" style={{ background: CROSS_STANCE_COLOR }} />
                  Champion ↔ Critic
                </button>
              )}

              <button id="graph-money-filter" className={`eg-toggle eg-glass ${moneyTrailsOnly ? 'is-on' : ''}`}
                onClick={() => { setMoneyTrailsOnly(v => !v); setCrossOnly(false); clearAll(); }}
                title="Only show financial links (funding, grants, boards, lobbying)">
                <span className="eg-swatch" style={{ background: '#5b93c7' }} />
                Money Trails
              </button>

              {stats && (
                <div className="eg-stats eg-glass">
                  <strong>{stats.connected}</strong> entities · <strong>{stats.edges.toLocaleString()}</strong> connections · <strong>{stats.docs.toLocaleString()}</strong> source documents
                </div>
              )}
            </div>

            {/* Horizontal Breadcrumb Trail Bar */}
            {mode === 'degrees' && (
              <div className="eg-breadcrumb-bar eg-glass" role="region" aria-label="Evidence breadcrumb path">
                {activePathIds.length >= 2 ? (
                  <div className="eg-breadcrumb-inner">
                    {activePathIds.map((id, idx) => {
                      const node = graph.nodes.get(id);
                      if (!node) return null;
                      const auto = node.autonomy || getEntityAutonomy(node);
                      const isOrigin = idx === 0;
                      const isTarget = idx === activePathIds.length - 1;
                      const nextId = activePathIds[idx + 1];
                      const edgeKey = nextId ? graph.adj.get(id)?.get(nextId) : null;
                      const edge = edgeKey ? graph.edges.get(edgeKey) : null;
                      const docCount = edge?.docIds?.length || 0;

                      return (
                        <React.Fragment key={id}>
                          <div 
                            className={`eg-breadcrumb-node ${isOrigin ? 'is-origin' : ''} ${isTarget ? 'is-target' : ''}`}
                            onClick={() => selectNode(id)}
                            onDoubleClick={() => centerOn(id)}
                            title={`[${auto.grade} · ${auto.shortLabel}] ${node.name} — Click to inspect, double-click to center`}
                          >
                            <span className="eg-bc-step-tag">
                              {isOrigin ? 'ORIGIN' : isTarget ? 'TARGET' : `${idx}° HOP`}
                            </span>
                            <span 
                              className="eg-bc-grade-badge" 
                              style={{ background: auto.bg, color: auto.color, borderColor: auto.border }}
                            >
                              {auto.grade}
                            </span>
                            <span className="eg-bc-name">{node.name}</span>
                          </div>

                          {nextId && (
                            <button 
                              type="button"
                              className="eg-breadcrumb-connector"
                              onClick={() => edgeKey && selectEdge(edgeKey)}
                              title={`View ${docCount} shared source document${docCount === 1 ? '' : 's'} connecting ${node.name} and ${graph.nodes.get(nextId)?.name}`}
                            >
                              <span className="eg-bc-line" />
                              <span className="eg-bc-doc-count">
                                <FileText size={10} style={{ marginRight: 3, verticalAlign: '-1px' }} />
                                {docCount} {docCount === 1 ? 'doc' : 'docs'}
                              </span>
                              <span className="eg-bc-arrow">→</span>
                            </button>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                ) : activePathIds.length === 1 ? (
                  <div className="eg-breadcrumb-guide">
                    {(() => {
                      const node = graph.nodes.get(activePathIds[0]);
                      const auto = node?.autonomy || getEntityAutonomy(node);
                      return (
                        <>
                          <span className="eg-bc-guide-icon">📍</span>
                          <span className="eg-bc-guide-text">
                            <strong>Center Origin:</strong> {node?.name}{' '}
                            {auto && (
                              <span className="eg-bc-grade-badge" style={{ background: auto.bg, color: auto.color, borderColor: auto.border, marginLeft: 4 }}>
                                {auto.grade} · {auto.shortLabel}
                              </span>
                            )}
                            {' '}— Hover any outer entity or line to trace the connection chain.
                          </span>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="eg-breadcrumb-guide">
                    <span className="eg-bc-guide-icon">⚡</span>
                    <span className="eg-bc-guide-text">
                      <strong>Horizontal Evidence Trail:</strong> Hover any node or radial line to inspect the direct connection chain across the 
                      <span className="eg-grade-inline grade-a"> A+ Pro-Intact</span> ↔ <span className="eg-grade-inline grade-f">F Pro-Cutting</span> spectrum without mental rotation.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="eg-legend eg-glass">
            <div className="eg-legend-title">
              {colorBy === 'rubric'
                ? 'Autonomy Rubric Scale'
                : mode === 'ring' ? 'How to read the ring' : `Degrees from ${centerName || '…'}`}
            </div>
            {colorBy === 'rubric' ? (
              <>
                {AUTONOMY_SCALE.map(s => (
                  <div key={s.grade} className="eg-legend-row">
                    <span className="eg-swatch" style={{ background: s.color }} />
                    <strong>{s.grade}</strong>: {s.shortLabel}
                  </div>
                ))}
                <div className="eg-legend-row">
                  <span className="eg-legend-line" style={{ borderColor: CROSS_STANCE_COLOR }} />
                  Polar cross-stance link (A/B ↔ D/F)
                </div>
              </>
            ) : (
              (colorBy === 'stance' ? presentStances : presentGroups).map(g => (
                <div key={g.key} className="eg-legend-row"><span className="eg-swatch" style={{ background: g.color }} />{g.label}</div>
              ))
            )}
            {colorBy === 'stance' && (
              <div className="eg-legend-row"><span className="eg-legend-line" style={{ borderColor: CROSS_STANCE_COLOR }} />Champion ↔ critic link</div>
            )}
            {mode === 'ring' ? (
              <div className="eg-legend-note">
                A line means both were <strong>named in the same document</strong>. Thicker = more shared documents.
                {colorBy === 'stance' && ' Arcs group entities by type.'}
                {ringMeta && ringMeta.shown < ringMeta.total && <><br />Showing the {ringMeta.shown} most-documented of {ringMeta.total}.</>}
              </div>
            ) : (
              <div className="eg-legend-note">
                Each ring is one more step away. Lines show the best-documented link that reaches each name.
                {degMeta?.rings?.map(r => (
                  <div key={r.k}>{ORDINAL[r.k]}: {r.shown}{r.shown < r.total ? ` of ${r.total}` : ''}</div>
                ))}
              </div>
            )}
          </div>

          {!panel && (
            <div className="eg-hint eg-glass">
              {mode === 'ring'
                ? 'Hover a name to light up its links · Click to pin & see evidence · Double-click for Six Degrees'
                : 'Hover to trace horizontal trail · Click for evidence · Double-click to re-center'}
            </div>
          )}

          <EvidencePanel
            graph={graph}
            selection={panel}
            mode={mode}
            bfs={bfs}
            path={selectedPath}
            onClose={clearAll}
            onSelectEdge={selectEdge}
            onSelectNode={selectNode}
            onCenter={centerOn}
          />
        </>
      )}
    </div>
  );
}
