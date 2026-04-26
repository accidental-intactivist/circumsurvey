import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { C, FONT, PATH_COLORS } from "../styles/tokens";

const WORLD_TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const US_TOPO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export default function GeographicHeatmap({ questionId, distribution, cohortDistribution, title, byPathway }) {
  const [tooltip, setTooltip] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const isUS = questionId.includes("us_state");
  const geoUrl = isUS ? US_TOPO_URL : WORLD_TOPO_URL;
  
  // Choose which distribution to visualize
  const baseDist = (cohortDistribution?.distribution?.length > 0) 
    ? cohortDistribution.distribution 
    : (distribution?.distribution || []);
    
  const activeDist = activeTab === "all"
    ? baseDist
    : (byPathway?.results?.[activeTab]?.distribution || []);
    
  const dataMap = useMemo(() => {
    const map = {};
    let max = 0;
    for (const d of activeDist) {
      map[d.label] = d.n;
      if (d.n > max) max = d.n;
    }
    return { map, max };
  }, [activeDist]);
  
  const getScaleRange = (tab) => {
    switch (tab) {
      case "intact": return ["#182838", PATH_COLORS.intact];
      case "circumcised": return ["#381818", PATH_COLORS.circumcised];
      case "restoring": return ["#383018", PATH_COLORS.restoring];
      case "observer": return ["#383838", PATH_COLORS.observer];
      default: return ["#4a3a1d", C.goldBright];
    }
  };

  const colorScale = useMemo(() => {
    return scaleLinear()
      .domain([1, dataMap.max || 1])
      .range(getScaleRange(activeTab));
  }, [dataMap.max, activeTab]);

  // Handle common name variations
  const normalizeName = (name) => {
    if (!name) return "";
    let n = name.toLowerCase();
    
    // Strip state code prefix if present, e.g. "wa - washington" -> "washington"
    if (n.match(/^[a-z]{2}\s-\s/)) {
      n = n.substring(5);
    }
    
    if (n === "united states of america (usa)" || n === "united states of america" || n === "usa") return "united states";
    if (n === "great britain" || n === "uk") return "united kingdom";
    return n;
  };

  // Build a lookup map for pathway data
  const pathwayMap = useMemo(() => {
    const map = {};
    if (!byPathway || !byPathway.results) return map;
    
    for (const [pathwayId, data] of Object.entries(byPathway.results)) {
      if (!data.distribution) continue;
      for (const d of data.distribution) {
        const norm = normalizeName(d.label);
        if (!map[norm]) map[norm] = {};
        map[norm][pathwayId] = d.n;
      }
    }
    return map;
  }, [byPathway]);

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
      
      {/* Pathway Filters */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
        {["all", "intact", "circumcised", "restoring", "observer"].map(pathKey => {
          // Only show pathways that have data in byPathway
          if (pathKey !== "all" && (!byPathway?.results || !byPathway.results[pathKey] || byPathway.results[pathKey].n === 0)) return null;
          
          const isActive = activeTab === pathKey;
          const color = pathKey === "all" ? C.goldBright : PATH_COLORS[pathKey];
          const label = pathKey === "all" ? "All Pathways" : pathKey.charAt(0).toUpperCase() + pathKey.slice(1);
          
          return (
            <button
              key={pathKey}
              onClick={() => setActiveTab(pathKey)}
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

      <div style={{ width: "100%", aspectRatio: "16/9", background: C.bgDeep, borderRadius: 6, overflow: "hidden" }}>
        <ComposableMap 
          projection={isUS ? "geoAlbersUsa" : "geoMercator"}
          width={950}
          height={600}
          projectionConfig={isUS ? { scale: 1000 } : { scale: 125 }}
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
                        
                        if (val > 0 && pathwayMap[norm]) {
                          const pData = pathwayMap[norm];
                          const intact = pData.intact || 0;
                          const circ = pData.circumcised || 0;
                          const rest = pData.restoring || 0;
                          
                          if (intact > 0 || circ > 0 || rest > 0) {
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
                                {intact > 0 && <div><span style={{ color: PATH_COLORS.intact }}>●</span> Intact: {intact}</div>}
                                {circ > 0 && <div><span style={{ color: PATH_COLORS.circumcised }}>●</span> Circ: {circ}</div>}
                                {rest > 0 && <div><span style={{ color: PATH_COLORS.restoring }}>●</span> Restoring: {rest}</div>}
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
                          fill: val > 0 ? colorScale(val) : "#1f1f24",
                          stroke: "#33333a",
                          strokeWidth: 0.5,
                          outline: "none"
                        },
                        hover: {
                          fill: C.ltBlue,
                          stroke: C.ghost,
                          strokeWidth: 1,
                          outline: "none"
                        },
                        pressed: {
                          fill: C.blue,
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
        <span>{dataMap.max}</span>
        <span style={{ marginLeft: "auto", fontFamily: FONT.mono, fontSize: "0.75rem" }}>
          {cohortDistribution?.distribution?.length > 0 ? "Showing cohort distribution" : "Showing overall distribution"}
        </span>
      </div>
    </div>
  );
}
