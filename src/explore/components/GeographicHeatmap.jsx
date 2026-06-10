import { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { scaleLinear } from "d3-scale";
import * as topojson from "topojson-client";
import { C, FONT, PATH_COLORS, resolveCssColor } from "../styles/tokens";
import { PATHWAYS } from "../lib/pathways";
import { normalizeName, rollUpDistribution } from "../lib/formatters";
import L from 'leaflet';

const WORLD_GEO_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";
const US_TOPO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const CANADA_GEO_URL = "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/canada.geojson";

// Leaflet custom tile layers: CartoDB Positron
const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const CENTROID_OVERRIDES = {
  "unitedstates": [38.8283, -98.5795],
  "usa": [38.8283, -98.5795],
  "canada": [56.1304, -102.3468],
  "unitedkingdom": [53.5, -2.4359],
  "australia": [-25.2744, 133.7751],
  "germany": [51.1657, 10.4515],
  "southafrica": [-30.5595, 22.9375],
  "ireland": [53.4129, -8.2439],
  "newzealand": [-40.9006, 174.8860],
  "michigan": [43.5, -84.5], 
  "florida": [27.8, -81.5],
  "california": [37.0, -119.5],
  "ontario": [48.5, -85.3232],
  "quebec": [50.0, -71.2080],
  "alberta": [52.0, -115.0],
  "britishcolumbia": [52.0, -125.0]
};

// Calculate visual centroid (lat, lng) for Leaflet
function getCentroid(feature) {
  const norm = normalizeName(feature.properties.name);
  if (CENTROID_OVERRIDES[norm]) return CENTROID_OVERRIDES[norm];
  
  if (feature.geometry.type === "Polygon") {
    const coords = feature.geometry.coordinates[0];
    let lng = 0, lat = 0;
    coords.forEach(c => { lng += c[0]; lat += c[1]; });
    return [lat / coords.length, lng / coords.length];
  } else if (feature.geometry.type === "MultiPolygon") {
    const coords = feature.geometry.coordinates[0][0];
    let lng = 0, lat = 0;
    coords.forEach(c => { lng += c[0]; lat += c[1]; });
    return [lat / coords.length, lng / coords.length];
  }
  return [0, 0];
}

function FitBounds({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (geojson && geojson.features && geojson.features.length > 0) {
      const layer = L.geoJSON(geojson);
      map.fitBounds(layer.getBounds(), { padding: [20, 20], maxZoom: 4 });
    }
  }, [geojson, map]);
  return null;
}

export default function GeographicHeatmap({ questionId, distribution, cohortDistribution, title, byCohort, splitBy, onRegionClick, selectedRegions }) {
  const selectedRegionNorms = useMemo(() => {
    if (!selectedRegions || selectedRegions.length === 0) return new Set();
    return new Set(selectedRegions.map((r) => normalizeName(r.name)));
  }, [selectedRegions]);

  const [activeTab, setActiveTab] = useState("all");
  const [visType, setVisType] = useState("bullseye");
  const [usGeo, setUsGeo] = useState(null);
  const [caGeo, setCaGeo] = useState(null);
  const [worldGeo, setWorldGeo] = useState(null);

  const isUS = questionId.includes("us_state");
  
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

  useEffect(() => { if (!tabKeys.includes(activeTab)) setActiveTab("all"); }, [tabKeys, activeTab]);
  useEffect(() => { setVisType(tabKeys.length > 1 ? "bullseye" : "heatmap"); }, [tabKeys]);

  // Load TopoJSON/GeoJSON
  useEffect(() => {
    setUsGeo(null); setCaGeo(null); setWorldGeo(null);
    if (isUS) {
      fetch(US_TOPO_URL).then(r => r.json()).then(topo => setUsGeo(topojson.feature(topo, topo.objects.states)));
      fetch(CANADA_GEO_URL).then(r => r.json()).then(geo => setCaGeo(geo));
    } else {
      fetch(WORLD_GEO_URL).then(r => r.json()).then(geo => setWorldGeo(geo));
    }
  }, [isUS]);

  const dataMap = useMemo(() => {
    const map = {};
    let max = 0, total = 0;
    for (const d of activeDist) {
      map[normalizeName(d.label)] = d.n;
      if (d.n > max) max = d.n;
      total += d.n;
    }
    return { map, max, total };
  }, [activeDist]);

  const aggregatedDist = useMemo(() => rollUpDistribution(activeDist), [activeDist]);

  const cohortMap = useMemo(() => {
    const map = {};
    if (!byCohort?.results) return map;
    for (const [cohortId, data] of Object.entries(byCohort.results)) {
      if (!data.distribution) continue;
      for (const d of data.distribution) {
        const norm = normalizeName(d.label);
        if (!map[norm]) map[norm] = {};
        map[norm][cohortId] = (map[norm][cohortId] || 0) + d.n;
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

  const getScaleRange = (tab) => {
    if (tab === "all") return ["#f8f5f0", resolveCssColor(C.goldBright)];
    const mappedTab = tab === "unclassified" ? "observer" : tab;
    if (PATHWAYS[mappedTab]) return ["#f8f5f0", resolveCssColor(PATHWAYS[mappedTab].color)];
    return ["#f8f5f0", resolveCssColor(C.blue)];
  };

  const colorScale = useMemo(() => {
    const range = getScaleRange(activeTab);
    return scaleLinear().domain([0, dataMap.max || 1]).range(range);
  }, [dataMap.max, activeTab]);

  const balanceColorScale = useMemo(() => {
    return scaleLinear().domain([0, 0.5, 1]).range([resolveCssColor(C.red), resolveCssColor(C.purple), resolveCssColor(C.blue)]);
  }, []);

  const getCohortColor = (cohortId) => {
    if (cohortId === "all") return resolveCssColor(C.goldBright);
    const mappedKey = cohortId === "unclassified" ? "observer" : cohortId;
    if (PATHWAYS[mappedKey]) return resolveCssColor(PATHWAYS[mappedKey].color);
    return resolveCssColor(C.muted);
  };

  const renderTooltipContent = (feature) => {
    const geoName = feature.properties.name;
    const norm = normalizeName(geoName);
    const val = dataMap.map[norm] || 0;
    
    if (visType === "balance") {
      let intactCount = cohortMap[norm]?.["intact"] || 0;
      let circCount = cohortMap[norm]?.["circumcised"] || 0;
      const totalCount = intactCount + circCount;
      if (totalCount > 0) {
        const ratio = Math.round((intactCount / totalCount) * 100);
        return (
          <div style={{ padding: "8px", fontFamily: FONT.body }}>
            <div style={{ borderBottom: `1px solid ${C.ghost}`, paddingBottom: "4px", marginBottom: "4px", fontWeight: "bold", fontSize: "1.1em" }}>{geoName}</div>
            <div><span style={{color: resolveCssColor(C.blue)}}>●</span> Intact: {intactCount} ({ratio}%)</div>
            <div><span style={{color: resolveCssColor(C.red)}}>●</span> Circumcised: {circCount} ({100 - ratio}%)</div>
          </div>
        );
      }
    }
    
    if (val > 0 && cohortMap[norm]) {
      const breakdown = tabKeys.filter(k => k !== "all" && cohortMap[norm][k] > 0).map(k => ({ id: k, n: cohortMap[norm][k] }));
      if (breakdown.length > 0) {
        return (
          <div style={{ padding: "8px", fontFamily: FONT.body }}>
            <div style={{ borderBottom: `1px solid ${C.ghost}`, paddingBottom: "4px", marginBottom: "4px", fontWeight: "bold", fontSize: "1.1em" }}>{geoName}: {val}</div>
            {breakdown.map(b => {
               const label = b.id === "unclassified" ? "Observer" : (PATHWAYS[b.id]?.label || b.id);
               return <div key={b.id}><span style={{color: getCohortColor(b.id)}}>●</span> {label}: {b.n}</div>;
            })}
          </div>
        );
      }
    }
    
    return <div style={{ fontWeight: "bold", padding: "8px", fontFamily: FONT.body }}>{geoName}: {val}</div>;
  };

  const getStyle = (feature) => {
    const geoName = feature.properties.name;
    const norm = normalizeName(geoName);
    const val = dataMap.map[norm] || 0;
    const isSelected = selectedRegionNorms.has(norm);
    
    let fillColor = "transparent";
    if (visType === "balance") {
      let intactCount = cohortMap[norm]?.["intact"] || 0;
      let circCount = cohortMap[norm]?.["circumcised"] || 0;
      const totalCount = intactCount + circCount;
      if (totalCount > 0) fillColor = balanceColorScale(intactCount / totalCount);
    } else if (visType === "heatmap" && val > 0) {
      fillColor = colorScale(val);
    }

    return {
      fillColor,
      weight: isSelected ? 2 : 1,
      opacity: 1,
      color: isSelected ? resolveCssColor(C.goldBright) : resolveCssColor(C.ghost),
      fillOpacity: (visType === "bullseye" && !isSelected) ? 0.05 : 0.8
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        if (onRegionClick) onRegionClick(feature.properties.name, isUS ? "us_state" : "country");
      }
    });
  };

  const renderBullseyes = (geojson) => {
    if (!geojson) return null;
    return geojson.features.map(feature => {
      const norm = normalizeName(feature.properties.name);
      const regionData = cohortMap[norm];
      if (!regionData) return null;
      
      const T = Object.values(regionData).reduce((sum, n) => sum + n, 0);
      if (T === 0) return null;
      
      const coords = getCentroid(feature);
      if (coords[0] === 0) return null;
      
      const activeCohorts = tabKeys
        .filter(key => key !== "all")
        .map(key => ({ id: key, n: regionData[key] || 0, color: getCohortColor(key) }))
        .filter(c => c.n > 0)
        .sort((a, b) => b.n - a.n);
        
      if (activeCohorts.length === 0) return null;
      
      const R_max = 6 + 18 * Math.sqrt(T / maxT);
      let cumulativeSum = T;
      
      return (
        <div key={`bullseye-${norm}`}>
          {activeCohorts.map((cohort, idx) => {
            const r = R_max * Math.sqrt(cumulativeSum / T);
            cumulativeSum -= cohort.n;
            const isSelected = activeTab === cohort.id || activeTab === "all";
            return (
              <CircleMarker
                key={`${norm}-${cohort.id}`}
                center={coords}
                radius={r}
                pathOptions={{
                  fillColor: cohort.color,
                  fillOpacity: isSelected ? 0.9 : 0.2,
                  color: "#000",
                  weight: 0.5,
                  interactive: false
                }}
              />
            );
          })}
        </div>
      );
    });
  };

  const isLoading = isUS ? (!usGeo || !caGeo) : (!worldGeo);

  return (
    <div style={{ background: C.bgCard, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.ghost}`, padding: "1.5rem", position: "relative" }}>
      <h2 style={{ fontFamily: FONT.display, fontSize: "1.2rem", marginBottom: "1rem", color: C.textBright }}>{title}</h2>
      
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        {/* Cohort Filters */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {tabKeys.map(tabKey => {
            if (tabKey !== "all" && (!byCohort?.results?.[tabKey] || byCohort.results[tabKey].n === 0)) return null;
            const isActive = activeTab === tabKey;
            const label = tabKey === "all" ? "All Participants" : (PATHWAYS[tabKey === "unclassified" ? "observer" : tabKey]?.label || tabKey);
            const color = getCohortColor(tabKey);
            return (
              <button key={tabKey} onClick={() => setActiveTab(tabKey)} style={{
                background: isActive ? `color-mix(in srgb, ${color} 18%, transparent)` : "transparent", 
                border: `1px solid ${isActive ? color : `color-mix(in srgb, ${color} 30%, transparent)`}`,
                color: isActive ? color : `color-mix(in srgb, ${color} 75%, transparent)`, 
                padding: "0.25rem 0.6rem", borderRadius: 999, fontSize: "0.65rem", fontWeight: 600,
                fontFamily: FONT.condensed, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s"
              }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Vis Type Toggle */}
        {tabKeys.length > 1 && (
          <div style={{
            marginLeft: "auto", display: "flex", background: "rgba(255, 255, 255, 0.03)",
            border: `1px solid ${C.ghost}`, borderRadius: 999, padding: "0.15rem"
          }}>
            <button onClick={() => setVisType("bullseye")} style={{ 
              background: visType === "bullseye" ? "rgba(255, 255, 255, 0.08)" : "transparent", border: "none", 
              color: visType === "bullseye" ? C.textBright : C.muted, padding: "0.25rem 0.6rem", borderRadius: 999, 
              cursor: "pointer", fontSize: "0.65rem", fontFamily: FONT.condensed, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s" 
            }}>
              Bullseye Map
            </button>
            <button onClick={() => setVisType("heatmap")} style={{ 
              background: visType === "heatmap" ? "rgba(255, 255, 255, 0.08)" : "transparent", border: "none", 
              color: visType === "heatmap" ? C.textBright : C.muted, padding: "0.25rem 0.6rem", borderRadius: 999, 
              cursor: "pointer", fontSize: "0.65rem", fontFamily: FONT.condensed, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s" 
            }}>
              Choropleth Density
            </button>
            {splitBy === "pathway" && (
              <button onClick={() => setVisType("balance")} style={{ 
                background: visType === "balance" ? "rgba(255, 255, 255, 0.08)" : "transparent", border: "none", 
                color: visType === "balance" ? C.textBright : C.muted, padding: "0.25rem 0.6rem", borderRadius: 999, 
                cursor: "pointer", fontSize: "0.65rem", fontFamily: FONT.condensed, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s" 
              }}>
                Representation Balance ⚡
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ height: 700, borderRadius: 8, overflow: "hidden", position: "relative", zIndex: 1, background: "#f5f5f5", border: `1px solid color-mix(in srgb, ${C.blue} 15%, transparent)`, boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)" }}>
        {isLoading ? (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>
            <div style={{ animation: "pulse 1.5s infinite" }}>Rendering map...</div>
          </div>
        ) : (
          <MapContainer style={{ height: "100%", width: "100%" }} zoomControl={true} scrollWheelZoom={false}>
            <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
            
            {isUS && usGeo && (
              <GeoJSON data={usGeo} style={getStyle} onEachFeature={onEachFeature}>
                {feature => <Tooltip sticky direction="top">{renderTooltipContent(feature)}</Tooltip>}
              </GeoJSON>
            )}
            {isUS && caGeo && (
              <GeoJSON data={caGeo} style={getStyle} onEachFeature={onEachFeature}>
                {feature => <Tooltip sticky direction="top">{renderTooltipContent(feature)}</Tooltip>}
              </GeoJSON>
            )}
            {!isUS && worldGeo && (
              <GeoJSON data={worldGeo} style={getStyle} onEachFeature={onEachFeature}>
                {feature => <Tooltip sticky direction="top">{renderTooltipContent(feature)}</Tooltip>}
              </GeoJSON>
            )}

            {(isUS && usGeo && caGeo) && <FitBounds geojson={{ type: "FeatureCollection", features: [...usGeo.features, ...caGeo.features] }} />}
            {(!isUS && worldGeo) && <FitBounds geojson={worldGeo} />}

            {visType === "bullseye" && isUS && usGeo && renderBullseyes(usGeo)}
            {visType === "bullseye" && isUS && caGeo && renderBullseyes(caGeo)}
            {visType === "bullseye" && !isUS && worldGeo && renderBullseyes(worldGeo)}
          </MapContainer>
        )}
      </div>

      <div style={{
        marginTop: "1rem", fontFamily: FONT.body, fontSize: "0.8rem", color: C.muted,
        display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap"
      }}>
        {visType === "heatmap" ? (
          <>
            <span>0</span>
            <div style={{
              height: 8, width: 100, background: `linear-gradient(to right, ${getScaleRange(activeTab)[0]}, ${getScaleRange(activeTab)[1]})`, borderRadius: 4
            }} />
            <span>{dataMap.max} (max per region)</span>
          </>
        ) : visType === "balance" ? (
          <>
            <span style={{ color: resolveCssColor(C.red) }}>Mostly Circumcised</span>
            <div style={{
              height: 8, width: 100, background: `linear-gradient(to right, ${resolveCssColor(C.red)}, ${resolveCssColor(C.purple)}, ${resolveCssColor(C.blue)})`, borderRadius: 4
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

      {aggregatedDist.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{
            fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.85rem", color: C.muted,
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.8rem",
            borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.4rem"
          }}>
            Complete Data Table ({activeTab === "all" ? "All Pathways" : (PATHWAYS[activeTab === "unclassified" ? "observer" : activeTab]?.label || activeTab)})
          </h3>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.4rem 1rem"
          }}>
            {aggregatedDist.map((d, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", padding: "0.3rem 0.5rem",
                background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                borderRadius: 4, fontFamily: FONT.body, fontSize: "0.85rem"
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
