import React, { useState, useEffect, useMemo, useRef } from "react";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { API_BASE, C, FONT } from "../styles/tokens";
import { Activity } from "lucide-react";
import { useTooltip, Tooltip } from "./Tooltip";
import SmallSampleBadge from "./SmallSampleBadge";

export default function SankeyChart({ title, beforeQuestion, afterQuestion, filter, customColorMap, height = 400 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  useEffect(() => {
    let url = `${API_BASE}/aggregate?q=${afterQuestion.id}`;
    if (beforeQuestion.id !== "pathway") {
      url += `&by_question=${beforeQuestion.id}`;
    }
    if (filter) {
      const parts = filter.split(".");
      url += `&filter=${encodeURIComponent(`${parts[0]}.${parts[1]}=${parts[2]}`)}`;
    }
    setLoading(true);
    fetch(url).then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [beforeQuestion.id, afterQuestion.id, filter]);

  const { nodes, links } = useMemo(() => {
    if (!data || !data.results) return { nodes: [], links: [] };

    // Before rating sort logic
    const getBeforeIndex = (label) => {
      const l = String(label || "").toLowerCase();
      // Restoration RCI
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
      
      // Restoration Duration
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

      // Adult Experience
      if (l.includes("excellent") || l.includes("very satisfied")) return 10;
      if (l.includes("above average") || l.includes("somewhat satisfied")) return 11;
      if (l.includes("average") || l.includes("neutral")) return 12;
      if (l.includes("below average") || l.includes("somewhat dissatisfied")) return 13;
      if (l.includes("poor") || l.includes("very dissatisfied")) return 14;
      
      return 20;
    };

    const getDefinition = (originalName) => {
      if (!originalName) return null;
      const match = originalName.match(/\((.*?)\)/);
      return match ? match[1] : null;
    };

    const simplifyLabel = (label, layer) => {
      if (!label) return "";
      let s = String(label);
      if (s.startsWith("RCI-")) {
        const base = s.split(" ")[0]; // "RCI-X"
        s = layer === "before" ? base.replace("RCI-", "CI-") : base;
      }
      if (s.includes("not familiar") || s.includes("can't estimate")) return "Unknown";
      if (s.includes("complete") || s.includes("achieved my goals")) return "Complete";
      if (s.includes(" / ")) s = s.split(" / ")[0];
      if (s.includes("Significantly ")) s = s.replace("Significantly ", "Signif. ");
      if (s.includes("Somewhat ")) s = s.replace("Somewhat ", "Smwt. ");
      
      // Capitalize cohort names if they are pure lowercase
      if (s === "intact") return "Intact";
      if (s === "circumcised") return "Circumcised";
      if (s === "restoring") return "Restoring";
      if (s === "observer") return "Observer";

      return s.trim();
    };

    const getAfterIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("significantly increased") || l.includes("significantly improved")) return 0;
      if (l.includes("somewhat increased") || l.includes("somewhat improved")) return 1;
      if (l.includes("no change") || l.includes("no noticeable change")) return 2;
      if (l.includes("somewhat decreased") || l.includes("somewhat diminished")) return 3;
      if (l.includes("significantly decreased") || l.includes("significantly diminished")) return 4;
      if (l.includes("not a primary goal")) return 5;
      return 6;
    };

    const nodeMap = new Map();
    const linksArr = [];

    // Keys are the "Before" answers. 
    Object.keys(data.results).forEach(beforeLabel => {
      if (beforeLabel === "null" || beforeLabel === "Unknown" || (beforeQuestion.id !== "pathway" && beforeLabel === "observer")) return;
      
      const dist = data.results[beforeLabel].distribution || [];
      if (dist.length === 0) return;

      const sId = `before_${beforeLabel}`;
      if (!nodeMap.has(sId)) {
        nodeMap.set(sId, { 
          id: sId, 
          name: simplifyLabel(beforeLabel, "before"), 
          originalName: beforeLabel,
          layer: "before",
          sortIndex: getBeforeIndex(beforeLabel)
        });
      }

      dist.forEach(targetItem => {
        const afterLabel = targetItem.label;
        if (!afterLabel || targetItem.n === 0) return;
        
        const tId = `after_${afterLabel}`;
        if (!nodeMap.has(tId)) {
          nodeMap.set(tId, { 
            id: tId, 
            name: simplifyLabel(afterLabel, "after"), 
            originalName: afterLabel,
            layer: "after",
            sortIndex: getAfterIndex(afterLabel)
          });
        }
        
        linksArr.push({
          source: sId,
          target: tId,
          value: targetItem.n
        });
      });
    });

    const nodesArr = Array.from(nodeMap.values());
    
    // Sort nodes to maintain chronological order in the Sankey layout
    nodesArr.sort((a, b) => a.sortIndex - b.sortIndex);

    // D3 Sankey requires zero-based indexes or objects for links. We will use node indexes.
    const finalLinks = linksArr.map(l => {
      const sourceIndex = nodesArr.findIndex(n => n.id === l.source);
      const targetIndex = nodesArr.findIndex(n => n.id === l.target);
      return {
        source: sourceIndex,
        target: targetIndex,
        value: l.value
      };
    }).filter(l => l.source !== -1 && l.target !== -1);

    return { nodes: nodesArr, links: finalLinks };
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
    
    // Create the sankey layout
    const sankeyLayout = sankey()
      .nodeWidth(24)
      .nodePadding(20)
      .extent([[20, 20], [dimensions.width - 20, dimensions.height - 40]]) // leave room for labels
      .nodeId((d, i) => i) 
      .nodeSort((a, b) => a.sortIndex - b.sortIndex)
      .linkSort((a, b) => {
         return (a.source.sortIndex - b.source.sortIndex) || (a.target.sortIndex - b.target.sortIndex);
      });

    try {
      const { nodes: sn, links: sl } = sankeyLayout({
        nodes: nodes.map(d => ({ ...d })),
        links: links.map(l => ({ ...l }))
      });
      return { sankeyNodes: sn, sankeyLinks: sl };
    } catch (e) {
      console.error("Sankey Layout Error:", e);
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

  const totalN = useMemo(() => {
    return links.reduce((acc, l) => acc + l.value, 0);
  }, [links]);

  if (loading) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 8 }}>
        <Activity size={24} color={C.brand} className="pulse" />
      </div>
    );
  }

  if (sankeyNodes.length === 0) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 8, color: C.textMuted }}>
        No connection data available.
      </div>
    );
  }

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
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 1rem 0", color: C.textBright, textAlign: "center" }}>
          {title}
        </h3>
      )}
      
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 20px", marginBottom: "1rem" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textMuted }}>Baseline (Before)</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textMuted }}>Outcome (After)</div>
      </div>

      <div ref={containerRef} style={{ width: "100%", height, position: "relative" }}>
        <svg width={dimensions.width} height={dimensions.height} style={{ overflow: "visible" }}>
          {/* LINKS */}
          <g strokeOpacity={0.4}>
            {sankeyLinks.map((link, i) => {
              const color = getColor(link.source);
              return (
                <path
                  key={`link-${i}`}
                  d={sankeyLinkHorizontal()(link)}
                  fill="none"
                  stroke={color}
                  strokeWidth={Math.max(1, link.width)}
                  opacity={0.35}
                  style={{ transition: "stroke-opacity 0.2s" }}
                  onMouseEnter={(e) => {
                    e.target.style.filter = "brightness(1.2)";
                    showTooltip(e, (
                      <div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>
                          {link.source.name} → {link.target.name}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: "bold", color: C.textBright }}>
                          {link.value} respondents
                        </div>
                      </div>
                    ));
                  }}
                  onMouseMove={(e) => moveTooltip(e)}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = 0.35;
                    hideTooltip();
                  }}
                />
              );
            })}
          </g>
          
          {/* NODES */}
          <g>
            {sankeyNodes.map((node, i) => {
              const color = getColor(node);
              const isLeft = node.layer === "before" || node.x0 < dimensions.width / 2;
              return (
                <g key={`node-${i}`}>
                  <rect
                    x={node.x0}
                    y={node.y0}
                    height={node.y1 - node.y0}
                    width={node.x1 - node.x0}
                    fill={color}
                    rx={2}
                    onMouseEnter={(e) => {
                      showTooltip(e, (
                        <div>
                          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>
                            {node.layer === "before" ? "Initial Rating" : "Change Outcome"}
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
                    onMouseLeave={hideTooltip}
                  />
                  {/* Add labels */}
                  {node.y1 - node.y0 > 10 && (
                    <text
                      x={isLeft ? node.x1 + 6 : node.x0 - 6}
                      y={(node.y1 + node.y0) / 2}
                      dy="0.35em"
                      textAnchor={isLeft ? "start" : "end"}
                      fill={C.textBright}
                      fontSize={11}
                      fontFamily={FONT.body}
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
