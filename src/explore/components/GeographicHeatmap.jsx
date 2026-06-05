import { useMemo, useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker, useMapContext } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { geoCentroid } from "d3-geo";
import { C, FONT, PATH_COLORS, resolveCssColor } from "../styles/tokens";
import { PATHWAY_IDS, PATHWAYS } from "../lib/pathways";
import { normalizeName, rollUpDistribution } from "../lib/formatters";

const WORLD_TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const US_TOPO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const CANADA_GEO_URL = "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/canada.geojson";

// Custom manual coordinate overrides for better visual placement on the maps
const CENTROID_OVERRIDES = {
  // Countries
  "unitedstates": [-98.5795, 38.8283],
  "usa": [-98.5795, 38.8283],
  "canada": [-102.3468, 56.1304],
  "unitedkingdom": [-2.4359, 53.5],
  "australia": [133.7751, -25.2744],
  "germany": [10.4515, 51.1657],
  "southafrica": [22.9375, -30.5595],
  "ireland": [-8.2439, 53.4129],
  "newzealand": [174.8860, -40.9006],
  
  // States / Provinces
  "michigan": [-84.5, 43.5], // shift away from lake water body
  "florida": [-81.5, 27.8],
  "california": [-119.5, 37.0],
  "ontario": [-85.3232, 48.5],
  "quebec": [-71.2080, 50.0],
  "britishcolumbia": [-125.0, 52.0],
  "alberta": [-115.0, 52.0]
};

const getCoordinates = (geo) => {
  const name = geo.properties.name;
  if (!name) return null;
  const norm = normalizeName(name);
  
  if (CENTROID_OVERRIDES[norm]) return CENTROID_OVERRIDES[norm];
  
  // Dynamic fallback using d3-geo centroid calculation
  try {
    const coords = geoCentroid(geo);
    if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return coords;
    }
  } catch (e) {
    console.error("Error calculating centroid for", name, e);
  }
  return null;
};

// SafeMarker wrapper to handle D3 projection boundaries (e.g. US territories on geoAlbersUsa)
function SafeMarker({ coordinates, children, ...markerProps }) {
  const { projection } = useMapContext();
  if (!projection) return null;
  
  try {
    const projected = projection(coordinates);
    if (!projected || isNaN(projected[0]) || isNaN(projected[1])) {
      return null;
    }
  } catch (e) {
    return null;
  }
  
  return (
    <Marker coordinates={coordinates} {...markerProps}>
      {children}
    </Marker>
  );
}

// Subcomponent to safely handle side-effects and report loaded geographies back to parent
function GeographiesReporter({ geographies, onGeographiesLoaded }) {
  useEffect(() => {
    if (geographies && geographies.length > 0) {
      onGeographiesLoaded(geographies);
    }
  }, [geographies, onGeographiesLoaded]);
  return null;
}

// Subcomponent to safely handle Geographies rendering
function MapGeographies({ geoUrl, visType, onGeographiesLoaded, dataMap, cohortMap, tabKeys, activeTab, getCohortColor, setTooltip, colorScale, balanceColorScale }) {
  return (
    <Geographies geography={geoUrl}>
      {({ geographies }) => {
        const geographyElements = geographies.map((geo) => {
          const geoName = geo.properties.name;
          
          let val = 0;
          for (const label of Object.keys(dataMap.map)) {
            if (normalizeName(label) === normalizeName(geoName)) {
              val = dataMap.map[label];
              break;
            }
          }
          
          let defaultFill = `color-mix(in srgb, ${C.ghost} 15%, transparent)`;
          let hoverFill = `color-mix(in srgb, ${C.ghost} 25%, transparent)`;

          if (visType === "balance") {
            const norm = normalizeName(geoName);
            let intactCount = 0;
            let circCount = 0;
            if (cohortMap[norm]) {
              intactCount = cohortMap[norm]["intact"] || 0;
              circCount = cohortMap[norm]["circumcised"] || 0;
            }
            const totalCount = intactCount + circCount;
            if (totalCount > 0) {
              const ratio = intactCount / totalCount;
              defaultFill = balanceColorScale(ratio);
              hoverFill = `color-mix(in srgb, ${defaultFill} 20%, #fff)`;
            }
          } else {
            defaultFill = visType === "bullseye"
              ? (val > 0 ? "color-mix(in srgb, var(--c-text) 5%, transparent)" : "color-mix(in srgb, var(--c-text) 1.5%, transparent)")
              : (val > 0 ? colorScale(val) : `color-mix(in srgb, ${C.ghost} 15%, transparent)`);

            hoverFill = visType === "bullseye"
              ? (val > 0 ? "color-mix(in srgb, var(--c-text) 12%, transparent)" : "color-mix(in srgb, var(--c-text) 4%, transparent)")
              : (val > 0 ? colorScale(val) : `color-mix(in srgb, ${C.ghost} 25%, transparent)`);
          }
          
          return (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              onMouseEnter={() => {
                const norm = normalizeName(geoName);
                let content = `${geoName}: ${val}`;
                
                if (visType === "balance") {
                  let intactCount = 0;
                  let circCount = 0;
                  if (cohortMap[norm]) {
                    intactCount = cohortMap[norm]["intact"] || 0;
                    circCount = cohortMap[norm]["circumcised"] || 0;
                  }
                  const totalCount = intactCount + circCount;
                  if (totalCount > 0) {
                    const ratio = Math.round((intactCount / totalCount) * 100);
                    content = (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <div style={{ borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.25rem", marginBottom: "0.1rem", color: C.textBright }}>
                          <strong>{geoName}</strong>
                        </div>
                        <div><span style={{ color: resolveCssColor(C.blue) }}>●</span> Intact: {intactCount} ({ratio}%)</div>
                        <div><span style={{ color: resolveCssColor(C.red) }}>●</span> Circumcised: {circCount} ({100 - ratio}%)</div>
                      </div>
                    );
                  }
                } else if (val > 0 && cohortMap[norm]) {
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
                        {breakdown.map((b) => {
                          let bColor = getCohortColor(b.id);
                          let bLabel = b.id;
                          const mappedKey = b.id === "unclassified" ? "observer" : b.id;
                          if (PATHWAYS[mappedKey]) {
                            bLabel = PATHWAYS[mappedKey].label;
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
                  fill: defaultFill,
                  stroke: visType === "bullseye" ? "color-mix(in srgb, var(--c-text) 45%, transparent)" : "color-mix(in srgb, var(--c-text) 20%, transparent)",
                  strokeWidth: visType === "bullseye" ? 1.0 : 0.6,
                  outline: "none"
                },
                hover: {
                  fill: hoverFill,
                  stroke: "var(--c-textBright)",
                  strokeWidth: 1.5,
                  outline: "none"
                },
                pressed: {
                  fill: hoverFill,
                  outline: "none"
                }
              }}
            />
          );
        });

        return (
          <>
            <GeographiesReporter geographies={geographies} onGeographiesLoaded={onGeographiesLoaded} />
            {geographyElements}
          </>
        );
      }}
    </Geographies>
  );
}

export default function GeographicHeatmap({ questionId, distribution, cohortDistribution, title, byCohort, splitBy }) {
  const [geoLevel, setGeoLevel] = useState("us_state"); // Options: "country", "us_state", "ca_province"
  const [activeTab, setActiveTab] = useState("all");
  const [visType, setVisType] = useState("bullseye"); // Options: "bullseye", "heatmap"
  const [tooltip, setTooltip] = useState("");
  const [geographies, setGeographies] = useState([]);
  const [geographiesCA, setGeographiesCA] = useState([]);
  
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
  // Also default visType to "bullseye" if cohort split data is active, else fallback to "heatmap"
  useEffect(() => {
    if (!tabKeys.includes(activeTab)) {
      setActiveTab("all");
    }
  }, [tabKeys, activeTab]);

  useEffect(() => {
    if (tabKeys.length > 1) {
      setVisType("bullseye");
    } else {
      setVisType("heatmap");
    }
  }, [tabKeys]);

  // Clear loaded geographies when geoUrl changes to prevent rendering stale bullseyes
  useEffect(() => {
    setGeographies([]);
    setGeographiesCA([]);
  }, [geoUrl]);
    
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
    
    const mappedTab = tab === "unclassified" ? "observer" : tab;
    
    if (PATHWAYS[mappedTab]) {
      switch (mappedTab) {
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
      ["#0f2e1a", "#16a34a", resolveCssColor(C.green)],
      ["#3a2003", "#eab308", resolveCssColor(C.yellow)],
      ["#1f102b", "#9333ea", resolveCssColor(C.purple)],
    ];
    
    const fallbackIdx = Math.max(0, tabKeys.indexOf(tab) - 1);
    return fallbacks[fallbackIdx % fallbacks.length];
  };

  const colorScale = useMemo(() => {
    const idx = tabKeys.indexOf(activeTab);
    const range = getScaleRange(activeTab, idx);
    const max = dataMap.max || 1;
    return scaleLinear()
      .domain([1, max / 2, max])
      .range(range);
  }, [dataMap.max, activeTab, tabKeys]);

  const balanceColorScale = useMemo(() => {
    return scaleLinear()
      .domain([0, 0.5, 1])
      .range([resolveCssColor(C.red), resolveCssColor(C.purple), resolveCssColor(C.blue)]);
  }, []);

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

  const maxT = useMemo(() => {
    let max = 1;
    for (const data of Object.values(cohortMap)) {
      const sum = Object.values(data).reduce((s, val) => s + val, 0);
      if (sum > max) max = sum;
    }
    return max;
  }, [cohortMap]);

  const getCohortColor = (cohortId) => {
    if (cohortId === "all") return resolveCssColor(C.goldBright);
    const mappedKey = cohortId === "unclassified" ? "observer" : cohortId;
    if (PATHWAYS[mappedKey]) {
      return resolveCssColor(PATHWAYS[mappedKey].color);
    }
    const cList = [C.blue, C.red, C.green, C.yellow, C.orange, C.ltBlue, C.grey];
    const nonAllKeys = tabKeys.filter(k => k !== "all");
    const idx = nonAllKeys.indexOf(cohortId);
    if (idx === -1) return resolveCssColor(C.muted);
    return resolveCssColor(cList[idx % cList.length]);
  };

  const renderBullseyes = (geos) => {
    if (!geos || geos.length === 0) return null;
    return geos.map((geo) => {
      const geoName = geo.properties.name;
      const norm = normalizeName(geoName);
      const regionData = cohortMap[norm];
      
      if (!regionData) return null;
      
      const T = Object.values(regionData).reduce((sum, n) => sum + n, 0);
      if (T === 0) return null;
      
      const coords = getCoordinates(geo);
      if (!coords) return null;
      
      // Map and sort active cohorts descending by count
      const activeCohorts = tabKeys
        .filter(key => key !== "all")
        .map(key => {
          const count = regionData[key] || 0;
          return {
            id: key,
            n: count,
            color: getCohortColor(key)
          };
        })
        .filter(c => c.n > 0)
        .sort((a, b) => b.n - a.n);
        
      if (activeCohorts.length === 0) return null;
      
      // Sizing calculation (Area proportional to total count in region)
      const minRadius = 4;
      const maxRadiusLimit = isUS ? 24 : 14;
      const R_max = minRadius + (maxRadiusLimit - minRadius) * Math.sqrt(T / maxT);
      
      // Calculate concentric rings
      let cumulativeSum = T;
      const circles = activeCohorts.map((cohort) => {
        const r = R_max * Math.sqrt(cumulativeSum / T);
        cumulativeSum -= cohort.n;
        return { ...cohort, r };
      });
      
      return (
        <SafeMarker key={`bullseye-${geo.rsmKey || geoName}`} coordinates={coords}>
          <g style={{ pointerEvents: "none" }}>
            {circles.map((circle, idx) => {
              const isSelectedCohort = activeTab === circle.id;
              const isAllTab = activeTab === "all";
              const opacity = (isAllTab || isSelectedCohort) ? 0.95 : 0.22;
              
              return (
                <circle
                  key={idx}
                  r={circle.r}
                  fill={circle.color}
                  opacity={opacity}
                  stroke="rgba(0, 0, 0, 0.45)"
                  strokeWidth={0.6}
                  style={{ transition: "all 0.25s ease" }}
                />
              );
            })}
          </g>
        </SafeMarker>
      );
    });
  };

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
      
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.2rem",
        flexWrap: "wrap",
        gap: "0.8rem"
      }}>
        {/* Cohort Filters */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {tabKeys.map(tabKey => {
            if (tabKey !== "all" && (!byCohort?.results || !byCohort.results[tabKey] || byCohort.results[tabKey].n === 0)) return null;
            
            const isActive = activeTab === tabKey;
            const isAll = tabKey === "all";
            const mappedKey = tabKey === "unclassified" ? "observer" : tabKey;
            
            let label = mappedKey;
            if (isAll) {
              label = "All Participants";
            } else if (PATHWAYS[mappedKey]) {
              label = PATHWAYS[mappedKey].label;
            }
            
            const color = getCohortColor(tabKey);
            
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                style={{
                  background: isActive ? `color-mix(in srgb, ${color} 18%, transparent)` : "transparent",
                  border: `1px solid ${isActive ? color : `color-mix(in srgb, ${color} 30%, transparent)`}`,
                  color: isActive ? color : `color-mix(in srgb, ${color} 75%, transparent)`,
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

        {/* Vis Type Toggle */}
        {tabKeys.length > 1 && (
          <div style={{
            display: "flex",
            background: "rgba(255, 255, 255, 0.03)",
            border: `1px solid ${C.ghost}`,
            borderRadius: 999,
            padding: "0.15rem"
          }}>
            <button
              onClick={() => setVisType("bullseye")}
              style={{
                background: visType === "bullseye" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                border: "none",
                color: visType === "bullseye" ? C.textBright : C.muted,
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
              Bullseye Map
            </button>
            <button
              onClick={() => setVisType("heatmap")}
              style={{
                background: visType === "heatmap" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                border: "none",
                color: visType === "heatmap" ? C.textBright : C.muted,
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
              Heatmap
            </button>
            {splitBy === "pathway" && (
              <button
                onClick={() => setVisType("balance")}
                style={{
                  background: visType === "balance" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                  border: "none",
                  color: visType === "balance" ? C.textBright : C.muted,
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
                Representation Balance
              </button>
            )}
          </div>
        )}
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

      <div style={{ width: "100%", aspectRatio: "16/9", background: `linear-gradient(to bottom right, color-mix(in srgb, ${C.blue} 5%, ${C.bgCard}), color-mix(in srgb, ${C.purple} 2%, ${C.bgSoft}))`, borderRadius: 12, overflow: "hidden", border: `1px solid color-mix(in srgb, ${C.blue} 15%, transparent)`, boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)" }}>
        <ComposableMap 
          projection={isUS ? "geoAlbers" : (isCanada ? "geoAzimuthalEqualArea" : "geoMercator")}
          width={950}
          height={600}
          projectionConfig={
            isUS ? { center: [0, 48], rotate: [96, 0, 0], scale: 650 } : 
            isCanada ? { rotate: [95, -60, 0], scale: 800 } : 
            { scale: 140 }
          }
        >
          {isUS && (
            <MapGeographies
              geoUrl={US_TOPO_URL}
              visType={visType}
              onGeographiesLoaded={setGeographies}
              dataMap={dataMap}
              cohortMap={cohortMap}
              tabKeys={tabKeys}
              activeTab={activeTab}
              getCohortColor={getCohortColor}
              setTooltip={setTooltip}
              colorScale={colorScale}
              balanceColorScale={balanceColorScale}
            />
          )}
          {isUS && (
            <MapGeographies
              geoUrl={CANADA_GEO_URL}
              visType={visType}
              onGeographiesLoaded={setGeographiesCA}
              dataMap={dataMap}
              cohortMap={cohortMap}
              tabKeys={tabKeys}
              activeTab={activeTab}
              getCohortColor={getCohortColor}
              setTooltip={setTooltip}
              colorScale={colorScale}
              balanceColorScale={balanceColorScale}
            />
          )}
          {isUS && visType === "bullseye" && renderBullseyes([...geographies, ...geographiesCA])}

          {!isUS && (
            <ZoomableGroup center={[0, 20]} zoom={1} maxZoom={4} translateExtent={[[ -200, -100 ], [ 1150, 700 ]]}>
              <MapGeographies
                geoUrl={geoUrl}
                visType={visType}
                onGeographiesLoaded={setGeographies}
                dataMap={dataMap}
                cohortMap={cohortMap}
                tabKeys={tabKeys}
                activeTab={activeTab}
                getCohortColor={getCohortColor}
                setTooltip={setTooltip}
                colorScale={colorScale}
                balanceColorScale={balanceColorScale}
              />
              {visType === "bullseye" && renderBullseyes(geographies)}
            </ZoomableGroup>
          )}
        </ComposableMap>
      </div>
      
      <div style={{
        marginTop: "1rem",
        fontFamily: FONT.body,
        fontSize: "0.8rem",
        color: C.muted,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        flexWrap: "wrap"
      }}>
        {visType === "heatmap" ? (
          <>
            <span>0</span>
            <div style={{
              height: 8,
              width: 100,
              background: `linear-gradient(to right, ${getScaleRange(activeTab)[0]}, ${getScaleRange(activeTab)[1]})`,
              borderRadius: 4
            }} />
            <span>{dataMap.max} (max per region)</span>
          </>
        ) : visType === "balance" ? (
          <>
            <span style={{ color: resolveCssColor(C.red) }}>Mostly Circumcised</span>
            <div style={{
              height: 8,
              width: 100,
              background: `linear-gradient(to right, ${resolveCssColor(C.red)}, ${resolveCssColor(C.purple)}, ${resolveCssColor(C.blue)})`,
              borderRadius: 4
            }} />
            <span style={{ color: resolveCssColor(C.blue) }}>Mostly Intact</span>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ fontSize: "0.95rem" }}>🎯</span> Concentric rings show cohort splits (area proportional to count)
            </span>
            <span style={{ color: C.ghost }}>•</span>
            <span>Circle size represents total respondents (n) in region</span>
          </div>
        )}
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
            Complete Data Table ({activeTab === "all" ? "All Pathways" : (PATHWAYS[activeTab === "unclassified" ? "observer" : activeTab]?.label || activeTab)})
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
