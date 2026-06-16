import { useState, useEffect, useMemo, useRef } from "react";
import { sankey, sankeyLinkHorizontal, sankeyCenter } from "d3-sankey";
import { getAggregate } from "../lib/api";
import { C, FONT, PATH_COLORS, resolveCssColor } from "../styles/tokens";
import { useTooltip, Tooltip } from "./Tooltip";
import { PATHWAY_IDS, PATHWAYS } from "../lib/pathways";

// Helper to shorten labels for the graph
function shortLabel(label) {
  if (!label) return "";
  
  // Clean up any training parentheses (e.g. " (born 1981-1996)")
  let s = label.replace(/\s*\([^)]*\)\s*$/, "").trim();
  
  // Clean up punctuation at the end of sentence options
  s = s.replace(/\.$/, "");
  
  // Map specific long strings to succinct, highly readable versions
  const mappings = {
    // Country
    "United States of America": "United States",
    "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
    
    // Sexuality
    "Straight/Heterosexual": "Straight",
    
    // Family Upbringing
    "I was raised by one or both of my birth/biological parents": "Biological Parents",
    "I was adopted as an infant": "Infant Adoption",
    "I was adopted as a child or teenager": "Child/Teen Adoption",
    "I was raised primarily in a different family structure": "Other Family Structure",
    
    // Politics
    "Very Liberal / Progressive / Left-Leaning": "Very Liberal",
    "Liberal / Progressive": "Liberal",
    "Moderate / Centrist": "Moderate",
    "Very Conservative / Right-Leaning": "Very Conservative",
    "Apolitical / Not focused on politics": "Apolitical",
    "Prefer not to say / Unsure": "Unsure",
    
    // Religion
    "Secular / Atheist / Agnostic": "Secular",
    "Atheist / Agnostic / Secular": "Secular",
    "No significant religious/spiritual/cultural tradition influencing this topic": "Secular",
    "Spiritual but not religious": "Spiritual",
    "Pagan / Indigenous / Earth-based": "Pagan",
    "Catholicism": "Catholic",
    
    // Education
    "Less than high school diploma or equivalent": "Less than High School",
    "High school diploma or GED": "High School / GED",
    "High school diploma or GED (or equivalent)": "High School / GED",
    "Trade School Certificate / Pre-Apprenticeship Program": "Trade School",
    "Journeyman Certification / Licensed Tradesperson": "Licensed Trades",
    "Some college / Associate's degree": "Some College",
    "Bachelor's degree": "Bachelor's",
    "Master's degree": "Master's",
    "Professional degree": "Professional Degree",
    "Doctoral degree": "Doctorate",
    
    // Socioeconomic
    "Upper income / Wealthy": "Upper Income",
    "Upper-middle income": "Upper-Middle",
    "Middle income": "Middle Income",
    "Working class / Lower-middle income": "Working Class",
    "Lower income": "Lower Income"
  };

  // Check exact or prefix matching
  for (const [key, val] of Object.entries(mappings)) {
    if (s.toLowerCase().startsWith(key.toLowerCase())) {
      return val;
    }
  }

  // Fallback truncation limit slightly increased to 24 for better readability
  return s.length > 24 ? s.slice(0, 22) + "…" : s;
}

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

        const dim0 = dimensions[0].id;
        const dim1 = dimensions[1].id;
        const dim2 = dimensions[2].id;

        // 1. Get Top for Dim 0
        const res0 = await getAggregate(targetQuestion, { by: dim0, cohort });
        if (cancelled) return;
        
        let counts0 = [];
        if (res0.results) {
          for (const [k, v] of Object.entries(res0.results)) {
            if (k && k !== "null" && k !== "unknown" && k !== "unclassified") counts0.push({ label: k, n: v.n });
          }
        }
        counts0.sort((a, b) => b.n - a.n);
        const top0 = counts0.slice(0, 4).map(g => g.label);
        
        const colors0 = [C.goldBright, C.orange, C.yellow, C.red, "var(--chart-1)"];
        const colors1 = [C.blue, C.ltBlue, C.purple, "var(--chart-0)", "var(--chart-9)"];
        const colors2 = [C.green, C.grey, "var(--chart-3)", "var(--chart-4)", "var(--chart-7)"];
        
        top0.forEach((val, i) => addNode(makeId(dim0, val), shortLabel(val), dim0, colors0[i % colors0.length]));

        // 2. For each top0, get Dim 1 breakdown
        const dim1Promises = top0.map(async (v0) => {
          const res = await getAggregate(targetQuestion, { by: dim1, cohort: { ...cohort, [dim0]: v0 } });
          return { v0, results: res.results || {} };
        });
        
        const data1 = await Promise.all(dim1Promises);
        if (cancelled) return;

        const dim1NodesAdded = new Set();
        const dim2Promises = [];

        for (const rd of data1) {
          let counts1 = [];
          for (const [r, v] of Object.entries(rd.results)) {
            if (r && r !== "null" && r !== "unknown" && r !== "unclassified") counts1.push({ label: r, n: v.n });
          }
          counts1.sort((a, b) => b.n - a.n);
          // Limit to top 3 sub-branches to prevent spiderweb explosion
          const top1 = counts1.slice(0, 3).map(r => r.label);

          for (const v1 of top1) {
            const node1Id = makeId(dim1, v1);
            if (!dim1NodesAdded.has(node1Id)) {
              addNode(node1Id, shortLabel(v1), dim1, colors1[dim1NodesAdded.size % colors1.length]);
              dim1NodesAdded.add(node1Id);
            }
            
            const n = rd.results[v1]?.n || 0;
            if (n > 0) {
              links.push({
                source: nodeIndexMap.get(makeId(dim0, rd.v0)),
                target: nodeIndexMap.get(node1Id),
                value: n
              });
            }

            // Fire off dim2 queries
            dim2Promises.push((async () => {
              const pRes = await getAggregate(targetQuestion, { 
                by: dim2, 
                cohort: { ...cohort, [dim0]: rd.v0, [dim1]: v1 } 
              });
              return { v0: rd.v0, v1, results: pRes.results || {} };
            })());
          }
        }

        const data2 = await Promise.all(dim2Promises);
        if (cancelled) return;

        const dim2NodesAdded = new Set();
        const finalLinks = new Map();

        for (const pd of data2) {
          // Sort results to only take top 4 of final column if it's not pathway
          let counts2 = [];
          for (const [k, v] of Object.entries(pd.results)) {
            if (k && k !== "null" && k !== "unknown" && k !== "unclassified") counts2.push({ label: k, n: v.n });
          }
          counts2.sort((a, b) => b.n - a.n);
          const top2 = dim2 === 'pathway' ? counts2.map(c => c.label) : counts2.slice(0, 4).map(c => c.label);

          for (const val2 of top2) {
            const id2 = makeId(dim2, val2);
            if (!dim2NodesAdded.has(id2)) {
              const safeVal = val2.toLowerCase();
              const color = dim2 === 'pathway' ? PATH_COLORS[safeVal] : colors2[dim2NodesAdded.size % colors2.length];
              addNode(id2, dim2 === 'pathway' ? (PATHWAYS[safeVal]?.label || val2) : shortLabel(val2), dim2, color);
              dim2NodesAdded.add(id2);
            }

            const val = pd.results[val2]?.n || 0;
            if (val > 0) {
              const sourceIdx = nodeIndexMap.get(makeId(dim1, pd.v1));
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
                  strokeOpacity={isHovered ? 0.7 : 0.25}
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
