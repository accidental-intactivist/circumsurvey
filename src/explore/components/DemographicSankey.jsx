import { useState, useEffect, useMemo, useRef } from "react";
import { sankey, sankeyLinkHorizontal, sankeyCenter } from "d3-sankey";
import { getAggregate, getResponseDistribution } from "../lib/api";
import { shortLabel, consolidateLabel } from "../lib/formatters";
import { C, FONT, PATH_COLORS, resolveCssColor } from "../styles/tokens";
import { useTooltip, Tooltip } from "./Tooltip";
import { PATHWAY_IDS, PATHWAYS } from "../lib/pathways";

// Generate unique node ID
const makeId = (type, label) => `${type}_${label}`;

export default function DemographicSankey({ cohort, dimensions, tooltip, targetQuestion = "final_social_norm_perception" }) {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [hoverNode, setHoverNode] = useState(null);
  const [hoverLink, setHoverLink] = useState(null);
  
  // Use our own tooltip if not provided by parent
  const localTooltip = useTooltip();
  const tTip = tooltip || localTooltip;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function buildGraph() {
      if (!dimensions || dimensions.length !== 3) {
        setLoading(false);
        return;
      }

      // Defensive: a 3-stage Sankey requires three distinct dimensions.
      // If two slots share an id, makeId() produces colliding node ids and
      // d3-sankey throws on the resulting self-loop. Bail out cleanly with
      // an empty graph so the page degrades instead of white-screening.
      // (The Correlations Explorer page already prevents this via disabled
      // dropdown options; this is just defense in depth.)
      const dimIds = dimensions.map(d => d?.id);
      if (new Set(dimIds.filter(Boolean)).size !== dimIds.filter(Boolean).length) {
        setData({ nodes: [], links: [] });
        setLoading(false);
        return;
      }

      try {
        const nodes = [];
        const links = [];
        const nodeIndexMap = new Map();

        function addNode(id, name, type, color) {
          if (!nodeIndexMap.has(id)) {
            nodeIndexMap.set(id, nodes.length);
            nodes.push({ id, name, type, color });
          }
          return nodeIndexMap.get(id);
        }

        function groupResultsByConsolidation(results, dimId) {
          if (!results) return [];
          const grouped = new Map();
          for (const [k, v] of Object.entries(results)) {
            if (k && k !== "null" && k !== "unknown" && k !== "unclassified") {
              const cleanKey = consolidateLabel(k, dimId);
              if (!grouped.has(cleanKey)) {
                grouped.set(cleanKey, { label: cleanKey, rawKeys: [], n: 0 });
              }
              const g = grouped.get(cleanKey);
              g.rawKeys.push(k);
              g.n += v.n;
            }
          }
          const arr = Array.from(grouped.values());
          arr.sort((a, b) => b.n - a.n);
          return arr;
        }

        const dim0 = dimensions[0].id;
        const dim1 = dimensions[1].id;
        const dim2 = dimensions[2].id;

        // 1. Get Top for Dim 0
        const res0 = await getAggregate(targetQuestion, { by: dim0, cohort });
        if (cancelled) return;
        
        const grouped0 = groupResultsByConsolidation(res0.results, dim0);
        const top0 = grouped0.slice(0, 4);
        
        const colors0 = [C.goldBright, C.orange, C.yellow, C.red, "var(--chart-1)"];
        const colors1 = [C.blue, C.ltBlue, C.purple, "var(--chart-0)", "var(--chart-9)"];
        const colors2 = [C.green, C.grey, "var(--chart-3)", "var(--chart-4)", "var(--chart-7)"];
        
        function getNodeLabelAndColor(dimId, rawLabel, defaultColor) {
          const safeVal = String(rawLabel).toLowerCase();
          if (dimId === 'pathway') {
            return {
              label: PATHWAYS[safeVal]?.label || rawLabel,
              color: PATH_COLORS[safeVal] || defaultColor
            };
          }
          return {
            label: shortLabel(rawLabel),
            color: defaultColor
          };
        }
        
        top0.forEach((g, i) => {
          const { label, color } = getNodeLabelAndColor(dim0, g.label, colors0[i % colors0.length]);
          addNode(makeId(dim0, g.label), label, dim0, color);
        });

        // 2. For each top0, get Dim 1 breakdown
        const dim1Promises = top0.map(async (g0) => {
          const res = await getAggregate(targetQuestion, { by: dim1, cohort: { ...cohort, [dim0]: g0.rawKeys } });
          return { g0, results: res.results || {} };
        });
        
        const data1 = await Promise.all(dim1Promises);
        if (cancelled) return;

        const dim1NodesAdded = new Set();
        const dim2Promises = [];

        for (const rd of data1) {
          const grouped1 = groupResultsByConsolidation(rd.results, dim1);
          // Limit to top 3 sub-branches to prevent spiderweb explosion
          const top1 = grouped1.slice(0, 3);

          for (const g1 of top1) {
            const node1Id = makeId(dim1, g1.label);
            if (!dim1NodesAdded.has(node1Id)) {
              const { label, color } = getNodeLabelAndColor(dim1, g1.label, colors1[dim1NodesAdded.size % colors1.length]);
              addNode(node1Id, label, dim1, color);
              dim1NodesAdded.add(node1Id);
            }
            
            const n = g1.n;
            if (n > 0) {
              links.push({
                source: nodeIndexMap.get(makeId(dim0, rd.g0.label)),
                target: nodeIndexMap.get(node1Id),
                value: n
              });
            }

            // Fire off dim2 queries
            dim2Promises.push((async () => {
              const dim2Obj = dimensions[2];
              if (dim2Obj?.type === "question") {
                const res = await getResponseDistribution(dim2, {
                  cohort: { ...cohort, [dim0]: rd.g0.rawKeys, [dim1]: g1.rawKeys }
                });
                const formattedResults = {};
                for (const d of res.distribution || []) {
                  if (d.label && d.label !== "-" && d.label !== "—") {
                    formattedResults[d.label] = { n: d.n };
                  }
                }
                return { g0: rd.g0, g1, results: formattedResults };
              } else if (dim2Obj?.type === "aggregate") {
                const { sources, buckets } = dim2Obj.source;
                let aggFormatted = {};
                for (const qid of sources) {
                   const res = await getResponseDistribution(qid, {
                     cohort: { ...cohort, [dim0]: rd.g0.rawKeys, [dim1]: g1.rawKeys }
                   });
                   for (const d of res.distribution || []) {
                     if (d.label && d.label !== "-" && d.label !== "—") {
                       let bucketLabel = d.label; // fallback
                       for (const b of buckets) {
                         if (b.match.some(m => d.label.toLowerCase().includes(m.toLowerCase()))) {
                           bucketLabel = b.label;
                           break;
                         }
                       }
                       if (!aggFormatted[bucketLabel]) aggFormatted[bucketLabel] = { n: 0 };
                       aggFormatted[bucketLabel].n += d.n;
                     }
                   }
                }
                return { g0: rd.g0, g1, results: aggFormatted };
              } else {
                const pRes = await getAggregate(targetQuestion, { 
                  by: dim2, 
                  cohort: { ...cohort, [dim0]: rd.g0.rawKeys, [dim1]: g1.rawKeys } 
                });
                return { g0: rd.g0, g1, results: pRes.results || {} };
              }
            })());
          }
        }

        const data2 = await Promise.all(dim2Promises);
        if (cancelled) return;

        const dim2NodesAdded = new Set();
        const finalLinks = new Map();

        for (const pd of data2) {
          // Sort results to only take top 4 of final column if it's not pathway
          const grouped2 = groupResultsByConsolidation(pd.results, dim2);
          const top2 = dim2 === 'pathway' ? grouped2 : grouped2.slice(0, 4);

          for (const g2 of top2) {
            const id2 = makeId(dim2, g2.label);
            if (!dim2NodesAdded.has(id2)) {
              const { label, color } = getNodeLabelAndColor(dim2, g2.label, colors2[dim2NodesAdded.size % colors2.length]);
              addNode(id2, label, dim2, color);
              dim2NodesAdded.add(id2);
            }

            const val = g2.n;
            if (val > 0) {
              const sourceIdx = nodeIndexMap.get(makeId(dim1, pd.g1.label));
              const targetIdx = nodeIndexMap.get(id2);
              const linkKey = `${sourceIdx}-${targetIdx}`;
              
              if (finalLinks.has(linkKey)) {
                finalLinks.get(linkKey).value += val;
              } else {
                finalLinks.set(linkKey, { source: sourceIdx, target: targetIdx, value: val });
              }
            }
          }
        }
        
        for (const link of finalLinks.values()) {
          links.push(link);
        }

        if (!cancelled) {
          setData({ nodes, links });
          setLoading(false);
        }

      } catch (err) {
        console.error("Failed to build Sankey data", err);
        if (!cancelled) setLoading(false);
      }
    }

    buildGraph();
    return () => { cancelled = true; };
  }, [JSON.stringify(cohort), JSON.stringify(dimensions), targetQuestion]);

  // Layout sankey
  const { nodes: graphNodes, links: graphLinks } = useMemo(() => {
    if (!data.nodes.length || !data.links.length) return { nodes: [], links: [] };
    
    const clonedNodes = data.nodes.map(d => ({ ...d }));
    const clonedLinks = data.links.map(d => ({ ...d }));

    const sankeyGenerator = sankey()
      .nodeWidth(20)
      .nodePadding(30)
      .extent([[20, 60], [780, 480]])
      .nodeAlign(sankeyCenter);

    return sankeyGenerator({
      nodes: clonedNodes,
      links: clonedLinks
    });
  }, [data]);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 840, margin: "0 auto" }}>
      {loading ? (
        <div style={{ height: 500, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim, fontStyle: "italic" }}>
          Tracing demographic flow...
        </div>
      ) : graphNodes.length === 0 ? (
        <div style={{ height: 500, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim, fontStyle: "italic" }}>
          Not enough data to trace flow.
        </div>
      ) : (
        <svg viewBox="0 0 800 500" style={{ width: "100%", height: "auto", overflow: "visible" }}>
          <defs>
            {graphLinks.map((link, i) => {
              const srcColor = resolveCssColor(link.source.color || C.ghost);
              const tgtColor = resolveCssColor(link.target.color || C.ghost);
              return (
                <linearGradient key={`grad-${i}`} id={`grad-${i}`} gradientUnits="userSpaceOnUse" x1={link.source.x1} x2={link.target.x0}>
                  <stop offset="0%" stopColor={srcColor} />
                  <stop offset="100%" stopColor={tgtColor} />
                </linearGradient>
              );
            })}
          </defs>
          
          {/* Column Headers */}
          <g style={{ fontFamily: FONT.condensed, fontSize: "14px", fontWeight: 700, fill: C.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            <text x="20" y="20" textAnchor="start">{dimensions[0].label}</text>
            <text x="400" y="20" textAnchor="middle">{dimensions[1].label}</text>
            <text x="780" y="20" textAnchor="end">{dimensions[2].label}</text>
          </g>

          <g>
            {graphLinks.map((link, i) => {
              const isHovered = hoverLink === i || (hoverNode !== null && (link.source.index === hoverNode || link.target.index === hoverNode));
              return (
                <path
                  key={i}
                  d={sankeyLinkHorizontal()(link)}
                  fill="none"
                  stroke={`url(#grad-${i})`}
                  strokeOpacity={isHovered ? 0.85 : 0.55}
                  strokeWidth={Math.max(1, link.width)}
                  style={{ transition: "stroke-opacity 0.2s, stroke-width 0.2s", cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    setHoverLink(i);
                    tTip.showTooltip(e, `${link.source.name} → ${link.target.name}: n=${link.value}`);
                  }}
                  onMouseMove={tTip.moveTooltip}
                  onMouseLeave={() => {
                    setHoverLink(null);
                    tTip.hideTooltip();
                  }}
                />
              );
            })}
          </g>
          <g>
            {graphNodes.filter(n => n.value > 0).map((node, i) => {
              const isHovered = hoverNode === node.index;
              const resolvedColor = resolveCssColor(node.color || C.ghost);
              
              // Use node.layer to determine text placement (0 = left, 1 = middle, 2 = right)
              const isLeft = node.layer === 0;
              const isMiddle = node.layer > 0 && node.layer < Math.max(...graphNodes.map(n => n.layer));
              const isRight = node.layer === Math.max(...graphNodes.map(n => n.layer));
              
              let textX = node.x0;
              let textY = node.y0;
              let textAnchor = "start";
              let dy = "0.35em";
              
              if (isLeft) {
                textX = node.x1 + 12;
                textY = (node.y0 + node.y1) / 2;
                textAnchor = "start";
              } else if (isRight) {
                textX = node.x0 - 12;
                textY = (node.y0 + node.y1) / 2;
                textAnchor = "end";
              } else {
                textX = (node.x0 + node.x1) / 2;
                textY = node.y0 - 10;
                textAnchor = "middle";
                dy = "0";
              }

              return (
                <g key={`node-${node.index}`}>
                  <rect
                    x={node.x0}
                    y={node.y0}
                    width={node.x1 - node.x0}
                    height={node.y1 - node.y0}
                    fill={resolvedColor}
                    opacity={isHovered ? 1 : 0.8}
                    rx={2}
                    style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                    onMouseEnter={(e) => {
                      setHoverNode(node.index);
                      tTip.showTooltip(e, `${node.name}: n=${node.value}`);
                    }}
                    onMouseMove={tTip.moveTooltip}
                    onMouseLeave={() => {
                      setHoverNode(null);
                      tTip.hideTooltip();
                    }}
                  />
                  <text
                    x={textX}
                    y={textY}
                    dy={dy}
                    textAnchor={textAnchor}
                    fill={resolveCssColor(C.textBright)}
                    style={{ 
                      fontFamily: FONT.condensed, 
                      fontSize: "13px", 
                      fontWeight: 600, 
                      pointerEvents: "none",
                      textShadow: `var(--sankey-text-shadow)`
                    }}
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      )}
      {!tooltip && <Tooltip {...localTooltip.tooltip} />}
    </div>
  );
}
