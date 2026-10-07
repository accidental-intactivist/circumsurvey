import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Target, User, ArrowRight, FileText } from 'lucide-react';
import { GROUP_COLOR, STANCES, STANCE_COLOR, degreeOf, stanceBreakdown } from '../../utils/entityGraph';
import { resolveItemRoute } from '../../utils/routing';

const ORDINAL = ['', '1st', '2nd', '3rd', '4th', '5th', '6th'];
const PAGE = 40;

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const entityPath = node => `/to/${node.slug || node.id}`;

function DocList({ graph, docIds }) {
  const [limit, setLimit] = useState(PAGE);
  const docs = useMemo(
    () => docIds.map(id => graph.docs.get(id)).filter(Boolean)
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))),
    [graph, docIds]
  );
  return (
    <>
      <ul className="eg-list">
        {docs.slice(0, limit).map(doc => (
          <li key={doc.id}>
            <Link className="eg-row" to={resolveItemRoute(doc).path}>
              <FileText size={14} style={{ flexShrink: 0, color: 'var(--c-dim)' }} />
              <span className="eg-row-main">
                <span className="eg-row-title">{doc.title}</span>
                <span className="eg-row-meta">{[doc.date, (doc.type || '').replace(/_/g, ' ')].filter(Boolean).join(' · ')}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {docs.length > limit && (
        <button className="eg-btn" style={{ marginTop: '0.6rem' }} onClick={() => setLimit(l => l + PAGE)}>
          Show {Math.min(PAGE, docs.length - limit)} more
        </button>
      )}
    </>
  );
}

function EdgeEvidence({ graph, edgeKeyValue, onSelectNode }) {
  const edge = graph.edges.get(edgeKeyValue);
  if (!edge) return null;
  const a = graph.nodes.get(edge.a);
  const b = graph.nodes.get(edge.b);
  return (
    <>
      <div className="eg-panel-head">
        <div className="eg-panel-kicker">Connection evidence</div>
        <h3 className="eg-panel-title">
          <button className="eg-link-btn" onClick={() => onSelectNode(a.id)} style={linkBtn(a)}>{a.name}</button>
          <span style={{ color: 'var(--c-dim)', margin: '0 0.35rem' }}>↔</span>
          <button className="eg-link-btn" onClick={() => onSelectNode(b.id)} style={linkBtn(b)}>{b.name}</button>
        </h3>
        <p className="eg-panel-sub">
          Both are named in <strong>{plural(edge.docIds.length, 'document')}</strong> in the archive. These are the sources behind this line.
        </p>
      </div>
      <div className="eg-panel-body">
        <DocList key={edgeKeyValue} graph={graph} docIds={edge.docIds} />
      </div>
    </>
  );
}

const linkBtn = node => ({
  background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer',
  color: 'var(--c-textBright)', textDecoration: 'underline', textDecorationColor: GROUP_COLOR[node.group], textUnderlineOffset: 4,
});

function StanceBar({ counts }) {
  const total = STANCES.reduce((s, x) => s + counts[x.key], 0);
  if (!total) return null;
  const bridge = counts.champion > 0 && counts.critic > 0 && Math.min(counts.champion, counts.critic) / total >= 0.2;
  return (
    <div className="eg-stancebar-wrap">
      <div className="eg-stancebar" role="img" aria-label="Connections by stance">
        {STANCES.filter(s => counts[s.key]).map(s => (
          <span key={s.key} style={{ flex: counts[s.key], background: s.color }} title={`${counts[s.key]} ${s.label}`} />
        ))}
      </div>
      <div className="eg-stancebar-legend">
        {STANCES.filter(s => counts[s.key]).map(s => (
          <span key={s.key}><i style={{ background: s.color }} />{counts[s.key]} {s.label.split(' ')[0].toLowerCase()}</span>
        ))}
      </div>
      {bridge && <div className="eg-bridge">Bridge figure: regularly named alongside both champions and critics.</div>}
    </div>
  );
}

function NodeDetail({ graph, nodeId, mode, bfs, path, onSelectEdge, onSelectNode, onCenter }) {
  const node = graph.nodes.get(nodeId);
  const strongest = useMemo(() => {
    const out = [];
    for (const [nb, key] of graph.adj.get(nodeId) || []) {
      out.push({ nb: graph.nodes.get(nb), key, w: graph.edges.get(key).docIds.length });
    }
    return out.sort((x, y) => y.w - x.w).slice(0, 25);
  }, [graph, nodeId]);

  if (!node) return null;
  const isCenter = mode === 'degrees' && bfs?.centerId === nodeId;
  const depth = mode === 'degrees' && bfs ? bfs.depth.get(nodeId) : undefined;
  const center = bfs ? graph.nodes.get(bfs.centerId) : null;

  return (
    <>
      <div className="eg-panel-head">
        <div className="eg-panel-kicker" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="eg-swatch" style={{ background: GROUP_COLOR[node.group] }} />
          {(node.type || 'entity').replace(/_/g, ' ')}
          {depth > 0 && <> · {ORDINAL[depth] || `${depth}th`} degree from {center.name}</>}
        </div>
        <h3 className="eg-panel-title">{node.name}</h3>
        <p className="eg-panel-sub">
          <span className="eg-stance-pill" style={{ '--pill': STANCE_COLOR[node.stance] }}>
            {STANCES.find(s => s.key === node.stance)?.label}
          </span>{' '}
          Named in {plural(node.docIds.length, 'document')} · connected to {plural(degreeOf(graph, nodeId), 'entity')}
        </p>
        <StanceBar counts={stanceBreakdown(graph, nodeId)} />
        <div className="eg-actions">
          {!isCenter && (
            <button className="eg-btn is-primary" onClick={() => onCenter(nodeId)}>
              <Target size={13} /> Six Degrees from here
            </button>
          )}
          <Link className="eg-btn" to={entityPath(node)}>
            <User size={13} /> Open profile
          </Link>
        </div>
      </div>

      <div className="eg-panel-body">
        {mode === 'degrees' && !isCenter && (
          <>
            <div className="eg-section-title">How {node.name} connects to {center?.name}</div>
            {path ? (
              <ol className="eg-path">
                {path.map((id, i) => {
                  const n = graph.nodes.get(id);
                  const next = path[i + 1];
                  const key = next ? graph.adj.get(id)?.get(next) : null;
                  return (
                    <li key={id}>
                      <div className="eg-path-node">
                        <span className="eg-swatch" style={{ background: STANCE_COLOR[n.stance] }} />
                        {n.name}
                      </div>
                      {key && (
                        <div className="eg-path-hop">
                          <button onClick={() => onSelectEdge(key)}>
                            named together in {plural(graph.edges.get(key).docIds.length, 'document')} →
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="eg-empty">No documented chain links {node.name} to {center?.name} in the archive yet.</p>
            )}
          </>
        )}

        <div className="eg-section-title">Strongest connections</div>
        {strongest.length === 0 ? (
          <p className="eg-empty">No co-mentions found for this entity yet.</p>
        ) : (
          <ul className="eg-list">
            {strongest.map(({ nb, key, w }) => (
              <li key={key}>
                <button className="eg-row" onClick={() => onSelectEdge(key)}>
                  <span className="eg-swatch" style={{ background: STANCE_COLOR[nb.stance] }} />
                  <span className="eg-row-main"><span className="eg-row-title">{nb.name}</span></span>
                  <span className="eg-count">{plural(w, 'doc')}</span>
                  <ArrowRight size={13} style={{ color: 'var(--c-dim)' }} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default function EvidencePanel({ graph, selection, mode, bfs, path, onClose, onSelectEdge, onSelectNode, onCenter }) {
  if (!selection) return null;
  return (
    <aside className="eg-panel eg-glass" onClick={e => e.stopPropagation()} aria-label="Connection details">
      <button className="eg-close" onClick={onClose} aria-label="Close panel"><X size={16} /></button>
      {selection.kind === 'edge' ? (
        <EdgeEvidence graph={graph} edgeKeyValue={selection.key} onSelectNode={onSelectNode} />
      ) : (
        <NodeDetail graph={graph} nodeId={selection.id} mode={mode} bfs={bfs} path={path}
          onSelectEdge={onSelectEdge} onSelectNode={onSelectNode} onCenter={onCenter} />
      )}
    </aside>
  );
}
