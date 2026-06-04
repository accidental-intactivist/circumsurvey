import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { C, FONT, PATH_COLORS, resolveCssColor } from "../styles/tokens";
import { PATHWAY_IDS, PATHWAYS } from "../lib/pathways";
import { normalizeName, rollUpDistribution } from "../lib/formatters";

const WORLD_TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const US_TOPO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const CANADA_GEO_URL = "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/canada.geojson";

export default function GeographicHeatmap({ questionId, distribution, cohortDistribution, title, byCohort }) {
  const [tooltip, setTooltip] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const isUS = questionId.includes("us_state");
  const isCanada = questionId.includes("can_province");
  
  let geoUrl = WORLD_TOPO_URL;
  if (isUS) geoUrl = US_TOPO_URL;
  else if (isCanada) geoUrl = CANADA_GEO_URL;
  
  // Choose which distribution to visualize
  const baseDist = (cohortDistribution?.distribution?.length > 0) 
    ? cohortDistribution.distribution 
    : (distribution?.distribution || []);
    
  const activeDist = activeTab === "all"
    ? baseDist
    : (byCohort?.results?.[activeTab]?.distribution || []);
    
  const tabKeys = useMemo(() => {
    if (!byCohort || !byCohort.results) return ["all"];
    return ["all", ...Object.keys(byCohort.results)];
  }, [byCohort]);
  
  // Reset active tab if the dimension changes and the old tab is no longer valid
  useEffect(() => {
    if (!tabKeys.includes(activeTab)) {
      setActiveTab("all");
    }
  }, [tabKeys, activeTab]);
    
  const dataMap = useMemo(() => {
    const map = {};
    let max = 0;
    let total = 0;
    for (const d of activeDist) {
      map[d.label] = d.n;
      if (d.n > max) max = d.n;
      total += d.n;
    }
    return { map, max, total };
  }, [activeDist]);
  
  const getScaleRange = (tab, idx) => {
    if (tab === "all") return ["#1f1135", "#be123c", resolveCssColor(C.goldBright)];
    
    if (PATHWAYS[tab]) {
      switch (tab) {
        case "intact": return ["#062417", "#059669", resolveCssColor(PATH_COLORS.intact)];
        case "circumcised": return ["#2e0c10", "#be123c", resolveCssColor(PATH_COLORS.circumcised)];
        case "restoring": return ["#2e1f06", "#d97706", resolveCssColor(PATH_COLORS.restoring)];
        case "observer": return ["#2a1005", "#c2410c", resolveCssColor(PATH_COLORS.observer)];
        case "trans_vaginoplasty": return ["#2e0c10", "#be123c", resolveCssColor(PATH_COLORS.trans_vaginoplasty)];
        case "trans_phalloplasty": return ["#2e0c10", "#be123c", resolveCssColor(PATH_COLORS.trans_phalloplasty)];
        case "intersex": return ["#1f1f1f", "#525252", resolveCssColor(PATH_COLORS.intersex)];
      }
    }
    
    const fallbacks = [
      ["#0a192f", "#2563eb", resolveCssColor(C.blue)],
      ["#2e0c10", "#e11d48", resolveCssColor(C.red)],
      ["#062417", "#10b981", resolveCssColor(C.green)],
      ["#2e1f06", "#f59e0b", resolveCssColor(C.yellow)],
      ["#2a1005", "#f97316", resolveCssColor(C.orange)],
      ["#1e1b4b", "#8b5cf6", resolveCssColor(C.ltBlue)],
      ["#1f2937", "#6b7280", resolveCssColor(C.grey)],
    ];
    return fallbacks[Math.max(0, idx) % fallbacks.length];
  };

  const colorScale = useMemo(() => {
    const idx = tabKeys.indexOf(activeTab);
    const range = getScaleRange(activeTab, idx);
    const max = dataMap.max || 1;
    // For a 3-stop scale, use [1, mid, max]
    return scaleLinear()
      .domain([1, max / 2, max])
      .range(range);
  }, [dataMap.max, activeTab, tabKeys]);

  const aggregatedDist = useMemo(() => rollUpDistribution(activeDist), [activeDist]);

  const cohortMap = useMemo(() => {
    const map = {};
    if (!byCohort || !byCohort.results) return map;
    
    for (const [cohortId, data] of Object.entries(byCohort.results)) {
      if (!data.distribution) continue;
      for (const d of data.distribution) {
        if (!d.label) continue;
        const norm = normalizeName(d.label);
        if (!map[norm]) map[norm] = {};
        if (!map[norm][cohortId]) map[norm][cohortId] = 0;
        map[norm][cohortId] += d.n;
      }
    }
    return map;
  }, [byCohort]);

  return (
    <div style={{
      background: C.bgSoft,
      border: `1px solid ${C.ghost}`,
      borderRadius: 8,
      padding: "1.2rem",
      marginBottom: "1.2rem",
      position: "relative"
    }}>
      <h2 style={{
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: "1.15rem",
        color: C.textBright,
        letterSpacing: "-0.01em",
        marginBottom: "0.8rem"
      }}>{title}</h2>
      
      {/* Cohort Filters */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
        {tabKeys.map((tabKey, idx) => {
          if (tabKey !== "all" && (!byCohort?.results || !byCohort.results[tabKey] || byCohort.results[tabKey].n === 0)) return null;
          
          const isActive = activeTab === tabKey;
          let color = C.muted;
          let label = tabKey;
          
          if (tabKey === "all") {
            color = C.goldBright;
            label = "All Participants";
          } else if (PATHWAYS[tabKey]) {
            color = PATHWAYS[tabKey].color;
            label = PATHWAYS[tabKey].label;
          } else {
            const cList = [C.blue, C.red, C.green, C.yellow, C.orange, C.ltBlue, C.grey];
            color = cList[idx % cList.length];
          }
          
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              style={{
                background: isActive ? `${color}22` : "transparent",
                border: `1px solid ${isActive ? color : C.ghost}`,
                color: isActive ? color : C.muted,
                fontFamily: FONT.condensed,
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0.25rem 0.6rem",
                borderRadius: 999,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      
      {tooltip && (
        <div style={{
          position: "absolute",
          top: "1.2rem",
          right: "1.2rem",
          background: C.bgCard,
          border: `1px solid ${C.ghost}`,
          padding: "0.5rem 0.8rem",
          borderRadius: 6,
          fontFamily: FONT.mono,
          fontSize: "0.8rem",
          color: C.goldBright,
          zIndex: 10
        }}>
          {tooltip}
        </div>
      )}

      <div style={{ width: "100%", aspectRatio: "16/9", background: `color-mix(in srgb, ${C.bgSoft} 50%, transparent)`, borderRadius: 6, overflow: "hidden" }}>
        <ComposableMap 
          projection={isUS ? "geoAlbersUsa" : (isCanada ? "geoAzimuthalEqualArea" : "geoMercator")}
          width={950}
          height={600}
          projectionConfig={
            isUS ? { scale: 1000 } : 
            isCanada ? { rotate: [95, -60, 0], scale: 800 } : 
            { scale: 125 }
          }
        >
          <ZoomableGroup>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoName = geo.properties.name;
                  
                  // Match TopoJSON names with our data labels
                  let matchedLabel = null;
                  let val = 0;
                  
                  for (const label of Object.keys(dataMap.map)) {
                    if (normalizeName(label) === normalizeName(geoName)) {
                      matchedLabel = label;
                      val = dataMap.map[label];
                      break;
                    }
                  }
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => {
                        const norm = normalizeName(geoName);
                        let content = `${geoName}: ${val}`;
                        
                        if (val > 0 && cohortMap[norm]) {
                          const pData = cohortMap[norm];
                          const breakdown = [];
                          for (const cid of tabKeys) {
                            if (cid !== "all" && pData[cid] > 0) {
                              breakdown.push({ id: cid, n: pData[cid] });
                            }
                          }
                          
                          if (breakdown.length > 0) {
                            content = (
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                <div style={{ 
                                  borderBottom: `1px solid ${C.ghost}`, 
                                  paddingBottom: "0.25rem", 
                                  marginBottom: "0.1rem",
                                  color: C.textBright
                                }}>
                                  <strong>{geoName}</strong>: {val}
                                </div>
                                {breakdown.map((b, bIdx) => {
                                  // Fallback color logic
                                  let bColor = C.muted;
                                  let bLabel = b.id;
                                  if (PATHWAYS[b.id]) {
                                    bColor = PATHWAYS[b.id].color;
                                    bLabel = PATHWAYS[b.id].label;
                                  } else {
                                    const cList = [C.blue, C.red, C.green, C.yellow, C.orange, C.ltBlue, C.grey];
                                    const safeIdx = Math.max(0, tabKeys.indexOf(b.id) - 1);
                                    bColor = cList[safeIdx % cList.length] || C.muted;
                                  }
                                  
                                  return (
                                    <div key={b.id}>
                                      <span style={{ color: bColor }}>●</span> {bLabel}: {b.n}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                        }
                        setTooltip(content);
                      }}
                      onMouseLeave={() => {
                        setTooltip("");
                      }}
                      style={{
                        default: {
                          fill: val > 0 ? colorScale(val) : `color-mix(in srgb, ${C.bgDeep} 40%, transparent)`,
                          stroke: `color-mix(in srgb, ${C.ghost} 20%, transparent)`,
                          strokeWidth: 0.6,
                          outline: "none"
                        },
                        hover: {
                          fill: val > 0 ? colorScale(val) : `color-mix(in srgb, ${C.bgCard} 50%, transparent)`,
                          stroke: C.textBright,
                          strokeWidth: 1.5,
                          outline: "none"
                        },
                        pressed: {
                          fill: val > 0 ? colorScale(val) : `color-mix(in srgb, ${C.bgCard} 50%, transparent)`,
                          outline: "none"
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
      
      <div style={{
        marginTop: "1rem",
        fontFamily: FONT.body,
        fontSize: "0.8rem",
        color: C.muted,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem"
      }}>
        <span>0</span>
        <div style={{
          height: 8,
          width: 100,
          background: `linear-gradient(to right, ${getScaleRange(activeTab)[0]}, ${getScaleRange(activeTab)[1]})`,
          borderRadius: 4
        }} />
        <span>{dataMap.max} (max per region)</span>
        <span style={{ marginLeft: "auto", fontFamily: FONT.mono, fontSize: "0.75rem" }}>
          Total mapped: n={dataMap.total} &middot; {cohortDistribution?.distribution?.length > 0 ? "Showing cohort distribution" : "Showing overall distribution"}
        </span>
      </div>

      {/* Data Table */}
      {aggregatedDist.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{
            fontFamily: FONT.condensed,
            fontWeight: 700,
            fontSize: "0.85rem",
            color: C.muted,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "0.8rem",
            borderBottom: `1px solid ${C.ghost}`,
            paddingBottom: "0.4rem"
          }}>
            Complete Data Table ({activeTab === "all" ? "All Pathways" : PATHWAYS[activeTab]?.label})
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "0.4rem 1rem"
          }}>
            {aggregatedDist.map((d, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.3rem 0.5rem",
                background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                borderRadius: 4,
                fontFamily: FONT.body,
                fontSize: "0.85rem"
              }}>
                <span style={{ color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "1rem" }} title={d.label}>
                  {d.label}
                </span>
                <span style={{ color: C.goldBright, fontFamily: FONT.mono, fontWeight: 500 }}>
                  n={d.n}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
