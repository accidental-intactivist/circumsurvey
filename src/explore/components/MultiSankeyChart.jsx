import React, { useState, useEffect, useMemo, useRef } from "react";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { API_BASE, C, FONT } from "../styles/tokens";
import { Activity } from "lucide-react";
import { useTooltip, Tooltip } from "./Tooltip";
import SmallSampleBadge from "./SmallSampleBadge";

// Helper to define consistent sorting rules across all 4 potential layers
const getSortIndex = (label) => {
  const l = String(label || "").toLowerCase();
  
  // RCI
  if (l.includes("ci-9")) return -9;
  if (l.includes("ci-8")) return -8;
  if (l.includes("ci-7")) return -7;
  if (l.includes("ci-6")) return -6;
  if (l.includes("ci-5")) return -5;
  if (l.includes("ci-4")) return -4;
  if (l.includes("ci-3")) return -3;
  if (l.includes("ci-2")) return -2;
  if (l.includes("ci-1")) return -1;
  if (l.includes("ci-0") || l.includes("ci- 0")) return 0;
  if (l.includes("not familiar") || l.includes("can't estimate")) return 99;
  
  // Duration
  if (l.includes("less than 6 months")) return 1;
  if (l.includes("6 months - 1 year") || l.includes("6 months to 1 year")) return 2;
  if (l.includes("1-2 years")) return 3;
  if (l.includes("2-3 years")) return 4;
  if (l.includes("3-5 years")) return 5;
  if (l.includes("5-7 years")) return 6;
  if (l.includes("7-10 years") || l.includes("5-10 years")) return 7;
  if (l.includes("more than 10 years") || l.includes("10+ years")) return 8;
  if (l.includes("complete") || l.includes("achieved my goals")) return 9;
  if (l.includes("< 1 year") || l.includes("less than 1 year")) return 1.5;

  // Outcomes
  if (l.includes("significantly increased") || l.includes("significantly improved")) return 10;
  if (l.includes("somewhat increased") || l.includes("somewhat improved")) return 11;
  if (l.includes("no change") || l.includes("no noticeable change")) return 12;
  if (l.includes("somewhat decreased") || l.includes("somewhat diminished")) return 13;
  if (l.includes("significantly decreased") || l.includes("significantly diminished")) return 14;
  if (l.includes("not a primary goal")) return 15;
  
  // Age Started
  if (l.includes("teens")) return 16;
  if (l.includes("20s")) return 17;
  if (l.includes("30s")) return 18;
  if (l.includes("40s")) return 19;
  if (l.includes("50s")) return 20;
  if (l.includes("60s")) return 21;
  if (l.includes("70+")) return 22;
  
  return 30;
};

const getDefinition = (originalName) => {
  if (!originalName) return null;
  const match = originalName.match(/\((.*?)\)/);
  return match ? match[1] : null;
};

const simplifyLabel = (label, layer) => {
  if (!label) return "";
  let s = String(label);
  
  // 1. RCI -> CI for layer 0 (Starting), keep RCI for layer 1 (Current)
  if (s.startsWith("RCI-")) {
    const base = s.split(" ")[0]; // "RCI-X"
    s = layer === 0 ? base.replace("RCI-", "CI-") : base;
  }
  
  // 2. Unknowns
  if (s.includes("not familiar") || s.includes("can't estimate")) {
    return "Unknown";
  }
  
  // 3. Complete
  if (s.includes("complete") || s.includes("achieved my goals")) {
    return "Complete";
  }
  
  // 4. Outcomes (remove everything after / )
  if (s.includes(" / ")) {
    s = s.split(" / ")[0];
  }
  
  // 5. Shorten common words to save space
  if (s.includes("Significantly ")) s = s.replace("Significantly ", "Signif. ");
  if (s.includes("Somewhat ")) s = s.replace("Somewhat ", "Smwt. ");
  
  return s.trim();
};

export default function MultiSankeyChart({ title, pathQuestions, headers = [], filter, customColorMap, height = 500 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  useEffect(() => {
    if (!pathQuestions || pathQuestions.length < 2) return;
    
    let url = `${API_BASE}/sankey-path?paths=${pathQuestions.map(q => q.id).join(",")}`;
    if (filter) {
      const parts = filter.split(".");
      if (parts.length === 3) {
        url += `&filter=${encodeURIComponent(`${parts[0]}.${parts[1]}=${parts[2]}`)}`;
      }
    }
    
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error("MultiSankey fetch error:", e);
        setLoading(false);
      });
  }, [pathQuestions, filter]);

  const { nodes, links } = useMemo(() => {
    if (!data || !data.results) return { nodes: [], links: [] };

    const nodeMap = new Map();
    const linkMap = new Map(); // key: "sourceId->targetId", value: count

    data.results.forEach((row) => {
      const path = row.path;
      const count = row.count;
      if (!path || path.length < 2) return;

      // Ensure nodes exist for all steps in the path
      for (let i = 0; i < path.length; i++) {
        const label = path[i];
        const nodeId = `layer${i}_${label}`;
        if (!nodeMap.has(nodeId)) {
          nodeMap.set(nodeId, {
            id: nodeId,
            name: simplifyLabel(label, i),
            originalName: label,
            layer: i,
            sortIndex: getSortIndex(label)
          });
        }
      }

      // Aggregate links between adjacent steps
      for (let i = 0; i < path.length - 1; i++) {
        const sourceId = `layer${i}_${path[i]}`;
        const targetId = `layer${i+1}_${path[i+1]}`;
        const linkKey = `${sourceId}->${targetId}`;
        
        if (!linkMap.has(linkKey)) {
          linkMap.set(linkKey, { source: sourceId, target: targetId, value: 0 });
        }
        linkMap.get(linkKey).value += count;
      }
    });

    const nodesArr = Array.from(nodeMap.values());
    
    // Sort nodes
    nodesArr.sort((a, b) => {
      if (a.layer !== b.layer) return a.layer - b.layer;
      return a.sortIndex - b.sortIndex;
    });

    const linksArr = Array.from(linkMap.values()).map(l => {
      const sourceIndex = nodesArr.findIndex(n => n.id === l.source);
      const targetIndex = nodesArr.findIndex(n => n.id === l.target);
      return {
        source: sourceIndex,
        target: targetIndex,
        value: l.value
      };
    }).filter(l => l.source !== -1 && l.target !== -1);

    return { nodes: nodesArr, links: linksArr };
  }, [data]);

  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height });

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({ width: entry.contentRect.width, height });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [height, loading]);

  const { sankeyNodes, sankeyLinks } = useMemo(() => {
    if (nodes.length === 0 || links.length === 0) return { sankeyNodes: [], sankeyLinks: [] };
    
    const sankeyLayout = sankey()
      .nodeWidth(16) // Slightly thinner nodes for multi-stage to save space
      .nodePadding(12)
      .nodeAlign((node) => node.layer)
      .extent([[20, 30], [dimensions.width - 20, dimensions.height - 30]])
      .nodeId((d, i) => i) 
      .nodeSort((a, b) => a.sortIndex - b.sortIndex)
      .linkSort((a, b) => (a.source.sortIndex - b.source.sortIndex) || (a.target.sortIndex - b.target.sortIndex));

    try {
      const { nodes: sn, links: sl } = sankeyLayout({
        nodes: nodes.map(d => ({ ...d })),
        links: links.map(l => ({ ...l }))
      });
      return { sankeyNodes: sn, sankeyLinks: sl };
    } catch (e) {
      console.error("MultiSankey Layout Error:", e);
      return { sankeyNodes: [], sankeyLinks: [] };
    }
  }, [nodes, links, dimensions]);

  const getColor = (node) => {
    if (customColorMap) {
      if (customColorMap[node.originalName]) return customColorMap[node.originalName];
      if (customColorMap[node.name]) return customColorMap[node.name];
    }
    return "#a855f7"; // fallback
  };

  if (loading) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 8 }}>
        <Activity size={24} color={C.brand} className="pulse" />
      </div>
    );
  }

  if (sankeyNodes.length === 0) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 8, color: C.dim }}>
        No valid flow pathways found for the given criteria.
      </div>
    );
  }

  const totalN = useMemo(() => {
    if (!data || !data.results) return 0;
    return data.results.reduce((acc, row) => acc + (row.count || 0), 0);
  }, [data]);

  return (
    <SmallSampleBadge n={totalN}>
      <div style={{ 
        background: C.bgCard, 
        border: `1px solid ${C.ghost}`, 
        borderRadius: 12, 
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}>
      {title && (
        <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 1.5rem 0", color: C.textBright, textAlign: "center", fontFamily: FONT.display }}>
          {title}
        </h3>
      )}
      
      {headers && headers.length > 0 && sankeyNodes.length > 0 && (
        <div style={{ position: "relative", height: 40, marginBottom: "0.5rem" }}>
          {headers.map((h, i) => {
            // Find a node in this layer to get its x coordinate
            const layerNode = sankeyNodes.find(n => n.layer === i);
            if (!layerNode) return null;
            
            // Adjust X to be centered on the node, but for the first node left-align, and last node right-align
            const isFirst = i === 0;
            const isLast = i === headers.length - 1;
            const x = layerNode.x0;
            
            let alignStyle = {
              left: x + (layerNode.x1 - layerNode.x0) / 2,
              transform: "translateX(-50%)",
              textAlign: "center"
            };
            
            if (isFirst) {
              alignStyle = { left: 20, textAlign: "left" };
            } else if (isLast) {
              alignStyle = { right: 20, textAlign: "right" };
            }

            return (
              <div key={i} style={{ 
                position: "absolute", 
                top: 0,
                ...alignStyle,
                fontSize: 13, 
                fontWeight: 700, 
                color: C.muted, 
                textTransform: "uppercase", 
                letterSpacing: "0.05em",
                zIndex: 10
              }}>
                {h}
              </div>
            );
          })}
        </div>
      )}

      <div ref={containerRef} style={{ width: "100%", height, position: "relative" }}>
        <svg width={dimensions.width} height={dimensions.height} style={{ overflow: "visible" }}>
          {/* LINKS */}
          <g strokeOpacity={0.4}>
            {sankeyLinks.map((link, i) => {
              // Create a gradient for the link if source and target colors differ
              const sColor = getColor(link.source);
              const tColor = getColor(link.target);
              const gradientId = `grad-link-${i}`;
              
              return (
                <g key={`link-group-${i}`}>
                  <defs>
                    <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={link.source.x1} x2={link.target.x0}>
                      <stop offset="0%" stopColor={sColor} />
                      <stop offset="100%" stopColor={tColor} />
                    </linearGradient>
                  </defs>
                  <path
                    d={sankeyLinkHorizontal()(link)}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={Math.max(1, link.width)}
                    opacity={0.3}
                    style={{ transition: "opacity 0.2s" }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = 0.8;
                      showTooltip(e, (
                        <div>
                          <div style={{ fontSize: 11, color: C.dim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {headers[link.source.layer] || `Stage ${link.source.layer+1}`} → {headers[link.target.layer] || `Stage ${link.target.layer+1}`}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.textBright, marginBottom: 4 }}>
                            <span style={{ color: sColor }}>{link.source.name}</span> → <span style={{ color: tColor }}>{link.target.name}</span>
                          </div>
                          <div style={{ fontSize: 13, color: C.text }}>
                            <strong>{link.value}</strong> respondents took this exact path step.
                          </div>
                        </div>
                      ));
                    }}
                    onMouseMove={(e) => moveTooltip(e)}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = 0.3;
                      hideTooltip();
                    }}
                  />
                </g>
              );
            })}
          </g>

          {/* NODES */}
          <g>
            {sankeyNodes.map((node, i) => {
              const color = getColor(node);
              const isStart = node.x0 < dimensions.width / 2;
              return (
                <g key={`node-${i}`}>
                  <rect
                    x={node.x0}
                    y={node.y0}
                    height={Math.max(2, node.y1 - node.y0)}
                    width={node.x1 - node.x0}
                    fill={color}
                    rx={2}
                    onMouseEnter={(e) => {
                      e.target.style.filter = "brightness(1.2)";
                      showTooltip(e, (
                        <div>
                          <div style={{ fontSize: 11, color: C.dim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {headers[node.layer] || `Stage ${node.layer+1}`}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: "bold", color: C.textBright }}>
                            {node.name}
                          </div>
                          {getDefinition(node.originalName) && (
                            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, fontStyle: "italic", maxWidth: 220, whiteSpace: "normal", lineHeight: 1.3 }}>
                              "{getDefinition(node.originalName)}"
                            </div>
                          )}
                          <div style={{ fontSize: 12, color: color, marginTop: 6 }}>
                            Total: {node.value}
                          </div>
                        </div>
                      ));
                    }}
                    onMouseMove={(e) => moveTooltip(e)}
                    onMouseLeave={(e) => {
                      e.target.style.filter = "none";
                      hideTooltip();
                    }}
                    style={{ transition: "filter 0.2s", cursor: "pointer" }}
                  />
                  
                  {/* Labels: Show only if node is tall enough, or if it's the very first/last node of its layer to anchor it */}
                  {(node.y1 - node.y0 > 10 || node.value > 10) && (
                    <text
                      x={isStart ? node.x1 + 6 : node.x0 - 6}
                      y={(node.y0 + node.y1) / 2}
                      dy="0.35em"
                      textAnchor={isStart ? "start" : "end"}
                      fontSize={11}
                      fontWeight={600}
                      fill={C.textBright}
                      style={{ pointerEvents: "none" }}
                    >
                      {node.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <Tooltip {...tooltip} />
      </div>
    </SmallSampleBadge>
  );
}
