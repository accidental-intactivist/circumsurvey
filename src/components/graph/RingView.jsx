import React, { useMemo, useState } from 'react';
import { TYPE_GROUPS, GROUP_COLOR, STANCES, degreeOf, isCrossStance, nodeColor, edgeColor } from '../../utils/entityGraph';

const GROUP_ORDER = TYPE_GROUPS.map(g => g.key);
const GROUP_LABEL = Object.fromEntries(TYPE_GROUPS.map(g => [g.key, g.label]));
const STANCE_ORDER = STANCES.map(s => s.key);
const MAX_EDGES = 1500;

const truncate = (s, n) => (s.length > n ? `${s.slice(0, Math.max(1, n - 1))}…` : s);

function hasCrossEdge(graph, id) {
  for (const nb of graph.adj.get(id)?.keys() || []) if (isCrossStance(graph, id, nb)) return true;
  return false;
}

function selectRingNodes(graph, width, height, crossOnly) {
  const size = Math.min(width, height);
  const labelSpace = Math.max(70, Math.min(170, size * 0.22));
  const R = Math.max(60, size / 2 - labelSpace);
  const maxNodes = Math.max(24, Math.min(160, Math.floor((2 * Math.PI * R) / 12)));

  const candidates = [...graph.nodes.values()].filter(n =>
    degreeOf(graph, n.id) > 0 && (!crossOnly || hasCrossEdge(graph, n.id)));
  candidates.sort((a, b) => b.docIds.length - a.docIds.length || degreeOf(graph, b.id) - degreeOf(graph, a.id));

  return { R, labelSpace, base: candidates.slice(0, maxNodes), totalConnected: candidates.length };
}

function layoutRing(graph, { R, labelSpace, base }, extraId, colorBy, crossOnly) {
  const chosen = [...base];
  if (extraId && graph.nodes.has(extraId) && !chosen.some(n => n.id === extraId)) {
    chosen.push(graph.nodes.get(extraId));
  }

  // Arcs by type. Inside an arc: grouped by stance (stance mode) then alphabetical.
  const inArc = (a, b) =>
    (colorBy === 'stance' ? STANCE_ORDER.indexOf(a.stance) - STANCE_ORDER.indexOf(b.stance) : 0) ||
    a.name.localeCompare(b.name);
  const grouped = GROUP_ORDER.map(key => ({
    key,
    nodes: chosen.filter(n => n.group === key).sort(inArc),
  })).filter(g => g.nodes.length);

  const GAP = 2.5; // empty slots between arcs
  const totalSlots = chosen.length + grouped.length * GAP;
  const slotAngle = (2 * Math.PI) / totalSlots;
  const fontSize = Math.max(8, Math.min(12, R * slotAngle * 0.92));
  const maxChars = Math.max(8, Math.floor((labelSpace - 14) / (fontSize * 0.56)));

  const pos = new Map();
  const arcs = [];
  let slot = GAP / 2;
  for (const g of grouped) {
    const start = -Math.PI / 2 + slot * slotAngle;
    for (const n of g.nodes) {
      const angle = -Math.PI / 2 + slot * slotAngle;
      pos.set(n.id, { node: n, angle, x: R * Math.cos(angle), y: R * Math.sin(angle) });
      slot += 1;
    }
    const end = -Math.PI / 2 + (slot - 1) * slotAngle;
    arcs.push({ key: g.key, count: g.nodes.length, start: start - slotAngle * 0.4, end: end + slotAngle * 0.4 });
    slot += GAP;
  }

  // Edges among displayed nodes, strongest kept if we have to thin them out.
  let edges = [];
  for (const id of pos.keys()) {
    const nbrs = graph.adj.get(id);
    if (!nbrs) continue;
    for (const [nb, key] of nbrs) {
      if (id < nb && pos.has(nb) && (!crossOnly || isCrossStance(graph, id, nb))) edges.push(graph.edges.get(key));
    }
  }
  edges.sort((a, b) => b.docIds.length - a.docIds.length);
  if (edges.length > MAX_EDGES) edges = edges.slice(0, MAX_EDGES);
  edges.reverse(); // weakest first so strong links paint on top

  const drawn = edges.map(e => {
    const p = pos.get(e.a);
    const q = pos.get(e.b);
    // Bundle toward the center: control point pulled most of the way in.
    const cx = (p.x + q.x) * 0.12;
    const cy = (p.y + q.y) * 0.12;
    return {
      key: e.key,
      a: e.a,
      b: e.b,
      weight: e.docIds.length,
      color: edgeColor(graph, e.a, e.b, colorBy),
      d: `M${p.x.toFixed(1)},${p.y.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${q.x.toFixed(1)},${q.y.toFixed(1)}`,
    };
  });

  return { R, pos, arcs, edges: drawn, fontSize, maxChars, shown: chosen.length };
}

function arcPath(r, start, end) {
  const large = end - start > Math.PI ? 1 : 0;
  const x1 = r * Math.cos(start);
  const y1 = r * Math.sin(start);
  const x2 = r * Math.cos(end);
  const y2 = r * Math.sin(end);
  return `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`;
}

export default function RingView({ graph, width, height, selectedId, colorBy = 'stance', crossOnly = false, onSelectNode, onSelectEdge, onCenter, onMeta }) {
  const [hoverId, setHoverId] = useState(null);

  const base = useMemo(() => selectRingNodes(graph, width, height, crossOnly), [graph, width, height, crossOnly]);
  const extraId = selectedId && !base.base.some(n => n.id === selectedId) ? selectedId : null;
  const layout = useMemo(() => layoutRing(graph, base, extraId, colorBy, crossOnly), [graph, base, extraId, colorBy, crossOnly]);

  React.useEffect(() => {
    onMeta?.({ shown: layout.shown, total: base.totalConnected, edges: layout.edges.length });
  }, [layout, base, onMeta]);

  const activeId = hoverId || selectedId;
  const neighbors = activeId ? graph.adj.get(activeId) : null;
  const { R, pos, arcs, edges, fontSize, maxChars } = layout;

  const maxW = edges.reduce((m, e) => Math.max(m, e.weight), 1);
  const widthFor = w => 0.6 + 2.6 * (Math.log(w + 1) / Math.log(maxW + 1));
  const baseOpacity = w => Math.min((crossOnly ? 0.3 : 0.12) + w * 0.04, 0.6);

  const activeEdges = activeId ? edges.filter(e => e.a === activeId || e.b === activeId) : [];

  return (
    <svg width={width} height={height} onClick={() => onSelectNode(null)} role="img" aria-label="Ring diagram of entity connections">
      <g transform={`translate(${width / 2},${height / 2})`}>
        {/* Type arcs (neutral in stance mode so color only ever means one thing) */}
        {arcs.map(a => {
          const mid = (a.start + a.end) / 2;
          const lr = R - 18;
          return (
            <g key={a.key}>
              <path d={arcPath(R + 2, a.start, a.end)} fill="none"
                style={{ stroke: colorBy === 'stance' ? 'var(--c-dim)' : GROUP_COLOR[a.key], strokeWidth: 3, strokeLinecap: 'round', opacity: 0.55 }} />
              {a.end - a.start > 0.35 && (
                <text className="eg-arc-label" x={lr * Math.cos(mid)} y={lr * Math.sin(mid)} textAnchor="middle" dominantBaseline="central">
                  {GROUP_LABEL[a.key]}
                </text>
              )}
            </g>
          );
        })}

        {/* All connections */}
        <g>
          {edges.map(e => {
            const incident = activeId && (e.a === activeId || e.b === activeId);
            if (incident) return null; // drawn in the highlight layer
            const op = activeId ? 0.035 : baseOpacity(e.weight);
            return (
              <path key={e.key} className="eg-edge" d={e.d}
                style={{ stroke: e.color, strokeOpacity: op, strokeWidth: widthFor(e.weight) }} />
            );
          })}
        </g>

        {/* Highlighted connections for the active entity (clickable for evidence) */}
        <g>
          {activeEdges.map(e => {
            const other = e.a === activeId ? e.b : e.a;
            const color = colorBy === 'stance' ? e.color : GROUP_COLOR[pos.get(other).node.group];
            return (
              <g key={e.key}>
                <path className="eg-edge" d={e.d}
                  style={{ stroke: color, strokeOpacity: 0.9, strokeWidth: widthFor(e.weight) + 0.8 }} />
                <path className="eg-edge-hit" d={e.d}
                  onClick={ev => { ev.stopPropagation(); onSelectEdge(e.key); }}>
                  <title>{`${pos.get(e.a).node.name} ↔ ${pos.get(e.b).node.name}: ${e.weight} shared document${e.weight === 1 ? '' : 's'} (click for evidence)`}</title>
                </path>
              </g>
            );
          })}
        </g>

        {/* Entities around the ring */}
        {[...pos.values()].map(({ node, angle }) => {
          const deg = (angle * 180) / Math.PI;
          const flip = deg > 90 && deg < 270;
          const isActive = node.id === activeId;
          const isNeighbor = !!neighbors?.has(node.id);
          const cls = ['eg-node', isActive && 'is-active', isNeighbor && 'is-neighbor', activeId && !isActive && !isNeighbor && 'is-dim']
            .filter(Boolean).join(' ');
          const r = 2.5 + Math.min(4, Math.sqrt(node.docIds.length) / 2);
          return (
            <g key={node.id} className={cls} transform={`rotate(${deg.toFixed(2)})`}
              onMouseEnter={() => setHoverId(node.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={ev => { ev.stopPropagation(); onSelectNode(node.id); }}
              onDoubleClick={ev => { ev.stopPropagation(); onCenter(node.id); }}>
              <title>{`${node.name} (${node.stance === 'notable' ? 'neutral' : node.stance}) · ${node.docIds.length} documents, ${degreeOf(graph, node.id)} connections`}</title>
              <circle cx={R} cy={0} r={isActive ? r + 2 : r} style={{ fill: nodeColor(node, colorBy) }} />
              <text
                transform={flip ? `translate(${R + 9},0) rotate(180)` : `translate(${R + 9},0)`}
                textAnchor={flip ? 'end' : 'start'}
                dominantBaseline="central"
                style={{ fontSize }}>
                {truncate(node.name, maxChars)}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
