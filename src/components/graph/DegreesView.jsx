import React, { useMemo, useState } from 'react';
import { TYPE_GROUPS, STANCES, edgeWeight, nodeColor, edgeColor } from '../../utils/entityGraph';

const GROUP_ORDER = TYPE_GROUPS.map(g => g.key);
const STANCE_ORDER = STANCES.map(s => s.key);
const ORDINAL = ['', '1st', '2nd', '3rd', '4th', '5th', '6th'];

const truncate = (s, n) => (s.length > n ? `${s.slice(0, Math.max(1, n - 1))}…` : s);

function circularMean(angles) {
  let s = 0;
  let c = 0;
  for (const a of angles) { s += Math.sin(a); c += Math.cos(a); }
  return Math.atan2(s, c);
}

/**
 * Concentric "degrees of separation" layout: center entity in the middle,
 * each ring holds entities N hops away. Children are rotated to sit near
 * the parent that links them in, so the tree reads outward.
 */
function layoutDegrees(graph, bfs, maxDepth, width, height, forcedIds, colorBy) {
  const size = Math.min(width, height);
  const outerLabel = Math.max(60, Math.min(140, size * 0.19));
  const Rmax = Math.max(80, size / 2 - outerLabel);
  const forced = new Set(forcedIds || []);

  const rawLayers = [];
  for (let k = 1; k <= maxDepth && k < bfs.layers.length; k++) rawLayers.push(bfs.layers[k]);
  const D = rawLayers.length;

  const pos = new Map();
  const center = graph.nodes.get(bfs.centerId);
  pos.set(bfs.centerId, { node: center, x: 0, y: 0, angle: 0, depth: 0 });

  const rings = [];
  const fontSize = size < 520 ? 9.5 : 11;

  rawLayers.forEach((layer, i) => {
    const k = i + 1;
    const r = (Rmax * k) / D;
    const cap = Math.max(6, Math.floor((2 * Math.PI * r) / 13));

    let items = layer
      .filter(id => pos.has(bfs.parent.get(id) || bfs.centerId))
      .map(id => {
        const parent = bfs.parent.get(id) || bfs.centerId;
        return { id, parent, node: graph.nodes.get(id), weight: edgeWeight(graph, id, parent) };
      });

    const total = layer.length;
    items.sort((a, b) => (forced.has(b.id) - forced.has(a.id)) || b.weight - a.weight || b.node.docIds.length - a.node.docIds.length);
    items = items.slice(0, cap);

    if (k === 1) {
      const sector = colorBy === 'stance'
        ? (a, b) => STANCE_ORDER.indexOf(a.node.stance) - STANCE_ORDER.indexOf(b.node.stance)
        : (a, b) => GROUP_ORDER.indexOf(a.node.group) - GROUP_ORDER.indexOf(b.node.group);
      items.sort((a, b) => sector(a, b) || b.weight - a.weight);
    } else {
      items.sort((a, b) => pos.get(a.parent).angle - pos.get(b.parent).angle || b.weight - a.weight);
    }

    const step = (2 * Math.PI) / Math.max(items.length, 1);
    let offset = -Math.PI / 2;
    if (k > 1 && items.length) {
      const deltas = items.map((it, j) => pos.get(it.parent).angle - (j * step));
      offset = circularMean(deltas);
    }

    items.forEach((it, j) => {
      const angle = offset + j * step;
      pos.set(it.id, { node: it.node, parent: it.parent, weight: it.weight, depth: k, angle, x: r * Math.cos(angle), y: r * Math.sin(angle) });
    });

    const labelRoom = k < D ? Rmax / D - 14 : outerLabel - 14;
    rings.push({ k, r, shown: items.length, total, maxChars: Math.max(6, Math.floor(labelRoom / (fontSize * 0.56))) });
  });

  return { pos, rings, Rmax, fontSize, D };
}

export default function DegreesView({ graph, bfs, maxDepth, width, height, selectedId, selectedPath, colorBy = 'stance', onSelectNode, onSelectEdge, onCenter, onMeta }) {
  const [hoverId, setHoverId] = useState(null);

  const forcedKey = (selectedPath || []).join(',');
  const layout = useMemo(
    () => layoutDegrees(graph, bfs, maxDepth, width, height, selectedPath, colorBy),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph, bfs, maxDepth, width, height, forcedKey, colorBy]
  );

  React.useEffect(() => {
    onMeta?.({ rings: layout.rings });
  }, [layout, onMeta]);

  const { pos, rings, fontSize } = layout;
  const activeId = hoverId || selectedId;

  // Path from the active entity back to the center.
  const activePath = useMemo(() => {
    if (!activeId || !pos.has(activeId)) return [];
    const path = [activeId];
    let cur = activeId;
    while (cur && cur !== bfs.centerId) {
      cur = pos.get(cur)?.parent;
      if (cur) path.unshift(cur);
    }
    return path;
  }, [activeId, pos, bfs.centerId]);
  const pathSet = new Set(activePath);

  // Extra (non-tree) links of the active entity to other visible entities.
  const sideLinks = useMemo(() => {
    if (!activeId || !pos.has(activeId)) return [];
    const out = [];
    for (const [nb, key] of graph.adj.get(activeId) || []) {
      if (!pos.has(nb) || pathSet.has(nb)) continue;
      if (pos.get(nb).parent === activeId) continue;
      out.push({ key, nb });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, pos, graph]);

  const centerNode = pos.get(bfs.centerId).node;
  const nodes = [...pos.values()].filter(p => p.depth > 0);

  return (
    <svg width={width} height={height} onClick={() => onSelectNode(null)} role="img" aria-label={`Degrees of separation from ${centerNode.name}`}>
      <g transform={`translate(${width / 2},${height / 2})`}>
        {/* Ring guides */}
        {rings.map(ring => (
          <g key={ring.k}>
            <circle className="eg-ring-guide" r={ring.r} />
          </g>
        ))}

        {/* Tree links: how each entity is reached from the center */}
        <g>
          {nodes.map(p => {
            const par = pos.get(p.parent);
            const onPath = pathSet.has(p.node.id) && pathSet.has(p.parent);
            const dim = activeId && !onPath;
            return (
              <line key={`t-${p.node.id}`} className="eg-edge"
                x1={par.x} y1={par.y} x2={p.x} y2={p.y}
                style={{
                  stroke: onPath ? 'var(--c-goldBright)' : edgeColor(graph, p.node.id, p.parent, colorBy),
                  strokeOpacity: onPath ? 1 : dim ? 0.08 : 0.4,
                  strokeWidth: onPath ? 3 : 0.8 + Math.min(2.2, Math.log2(p.weight + 1) * 0.7),
                }} />
            );
          })}
        </g>

        {/* Other links of the active entity */}
        <g>
          {sideLinks.map(({ key, nb }) => {
            const a = pos.get(activeId);
            const b = pos.get(nb);
            return (
              <g key={`s-${key}`}>
                <line className="eg-edge" x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  style={{ stroke: 'var(--c-muted)', strokeOpacity: 0.55, strokeWidth: 1, strokeDasharray: '3 4' }} />
                <line className="eg-edge-hit" x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  onClick={ev => { ev.stopPropagation(); onSelectEdge(key); }}>
                  <title>{`${a.node.name} ↔ ${b.node.name} (click for evidence)`}</title>
                </line>
              </g>
            );
          })}
        </g>

        {/* Clickable hops along the active path */}
        <g>
          {activePath.slice(1).map((id, i) => {
            const a = pos.get(activePath[i]);
            const b = pos.get(id);
            const key = graph.adj.get(activePath[i])?.get(id);
            if (!key) return null;
            return (
              <line key={`h-${key}`} className="eg-edge-hit" x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                onClick={ev => { ev.stopPropagation(); onSelectEdge(key); }}>
                <title>{`${a.node.name} → ${b.node.name}: ${graph.edges.get(key).docIds.length} shared documents (click for evidence)`}</title>
              </line>
            );
          })}
        </g>

        {/* Ring entities */}
        {nodes.map(p => {
          const ring = rings[p.depth - 1];
          const deg = (p.angle * 180) / Math.PI;
          const norm = ((deg % 360) + 360) % 360;
          const flip = norm > 90 && norm < 270;
          const isActive = p.node.id === activeId;
          const onPath = pathSet.has(p.node.id);
          const isNeighbor = activeId && graph.adj.get(activeId)?.has(p.node.id);
          const cls = ['eg-node', isActive && 'is-active', (onPath || isNeighbor) && 'is-neighbor', activeId && !onPath && !isNeighbor && 'is-dim']
            .filter(Boolean).join(' ');
          const r = 3 + Math.min(4, Math.sqrt(p.node.docIds.length) / 2);
          const chars = isActive || onPath ? 40 : ring.maxChars;
          return (
            <g key={p.node.id} className={cls}
              transform={`translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`}
              onMouseEnter={() => setHoverId(p.node.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={ev => { ev.stopPropagation(); onSelectNode(p.node.id); }}
              onDoubleClick={ev => { ev.stopPropagation(); onCenter(p.node.id); }}>
              <title>{`${p.node.name} — ${ORDINAL[p.depth] || `${p.depth}th`} degree · ${p.node.docIds.length} documents`}</title>
              <circle r={isActive ? r + 2 : r} style={{ fill: nodeColor(p.node, colorBy), stroke: onPath ? 'var(--c-goldBright)' : 'none', strokeWidth: 2 }} />
              <g transform={`rotate(${deg.toFixed(2)})`}>
                <text
                  transform={flip ? `translate(${r + 5},0) rotate(180)` : `translate(${r + 5},0)`}
                  textAnchor={flip ? 'end' : 'start'}
                  dominantBaseline="central"
                  style={{ fontSize }}>
                  {truncate(p.node.name, chars)}
                </text>
              </g>
            </g>
          );
        })}

        {/* Center entity */}
        <g className="eg-node eg-center-node" onClick={ev => { ev.stopPropagation(); onSelectNode(bfs.centerId); }}>
          <circle className="eg-pulse" r={14} style={{ fill: nodeColor(centerNode, colorBy) }} />
          <circle r={14} style={{ fill: nodeColor(centerNode, colorBy), stroke: 'var(--c-goldBright)', strokeWidth: 3 }} />
          <text y={30} textAnchor="middle" style={{ fontSize: fontSize + 3 }}>{truncate(centerNode.name, 34)}</text>
        </g>

        {/* Degree labels (placed at the bottom of each guide ring, below the center label) */}
        {rings.map(ring => (
          <text key={`l-${ring.k}`} className="eg-ring-label" x={0} y={ring.r - 6} textAnchor="middle" style={{ pointerEvents: 'none' }}>
            {ORDINAL[ring.k]} degree
          </text>
        ))}
      </g>
    </svg>
  );
}
