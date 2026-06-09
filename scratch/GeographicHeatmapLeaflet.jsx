import { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { scaleLinear } from "d3-scale";
import * as topojson from "topojson-client";
import { C, FONT, PATH_COLORS, resolveCssColor } from "../styles/tokens";
import { PATHWAY_IDS, PATHWAYS } from "../lib/pathways";
import { normalizeName, rollUpDistribution } from "../lib/formatters";
import L from 'leaflet';

const WORLD_TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
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
    // Just pick the first polygon for a rough centroid
    const coords = feature.geometry.coordinates[0][0];
    let lng = 0, lat = 0;
    coords.forEach(c => { lng += c[0]; lat += c[1]; });
    return [lat / coords.length, lng / coords.length];
  }
  return [0, 0];
}

// Subcomponent to fit map bounds to the loaded GeoJSON
function FitBounds({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (geojson && geojson.features && geojson.features.length > 0) {
      const layer = L.geoJSON(geojson);
      map.fitBounds(layer.getBounds(), { padding: [20, 20] });
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
    if (isUS) {
      fetch(US_TOPO_URL).then(r => r.json()).then(topo => setUsGeo(topojson.feature(topo, topo.objects.states)));
      fetch(CANADA_GEO_URL).then(r => r.json()).then(geo => setCaGeo(geo));
    } else {
      fetch(WORLD_TOPO_URL).then(r => r.json()).then(topo => setWorldGeo(topojson.feature(topo, topo.objects.countries)));
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
          <div style={{ padding: "4px" }}>
            <div style={{ borderBottom: `1px solid ${C.ghost}`, paddingBottom: "4px", marginBottom: "4px", fontWeight: "bold" }}>{geoName}</div>
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
          <div style={{ padding: "4px" }}>
            <div style={{ borderBottom: `1px solid ${C.ghost}`, paddingBottom: "4px", marginBottom: "4px", fontWeight: "bold" }}>{geoName}: {val}</div>
            {breakdown.map(b => (
              <div key={b.id}><span style={{color: getCohortColor(b.id)}}>●</span> {b.id}: {b.n}</div>
            ))}
          </div>
        );
      }
    }
    
    return <div style={{ fontWeight: "bold", padding: "4px" }}>{geoName}: {val}</div>;
  };

  const getStyle = (feature) => {
    const geoName = feature.properties.name;
    const norm = normalizeName(geoName);
    const val = dataMap.map[norm] || 0;
    const isSelected = selectedRegionNorms.has(norm);
    
    let fillColor = "rgba(0,0,0,0.03)";
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
      fillOpacity: visType === "bullseye" ? 0.3 : 0.8
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

  if (isUS && (!usGeo || !caGeo)) return <div style={{ padding: "4rem", textAlign: "center" }}>Loading Map Data...</div>;
  if (!isUS && !worldGeo) return <div style={{ padding: "4rem", textAlign: "center" }}>Loading World Map...</div>;

  return (
    <div style={{ background: C.bgCard, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.ghost}`, padding: "1.5rem" }}>
      <h2 style={{ fontFamily: FONT.display, fontSize: "1.2rem", marginBottom: "1rem", color: C.textBright }}>{title}</h2>
      
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {tabKeys.map(tabKey => {
          if (tabKey !== "all" && (!byCohort?.results?.[tabKey] || byCohort.results[tabKey].n === 0)) return null;
          const isActive = activeTab === tabKey;
          const label = tabKey === "all" ? "All" : (PATHWAYS[tabKey === "unclassified" ? "observer" : tabKey]?.label || tabKey);
          const color = getCohortColor(tabKey);
          return (
            <button key={tabKey} onClick={() => setActiveTab(tabKey)} style={{
              background: isActive ? `${color}30` : "transparent", border: `1px solid ${isActive ? color : C.ghost}`,
              color: isActive ? color : C.muted, padding: "0.2rem 0.6rem", borderRadius: 999, fontSize: "0.75rem",
              fontFamily: FONT.condensed, textTransform: "uppercase", cursor: "pointer"
            }}>
              {label}
            </button>
          );
        })}

        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setVisType("bullseye")} style={{ background: visType === "bullseye" ? "rgba(255,255,255,0.1)" : "transparent", border: "1px solid " + C.ghost, color: C.textBright, padding: "0.2rem 0.6rem", borderRadius: 4, cursor: "pointer", fontSize: "0.75rem" }}>Bullseye</button>
          <button onClick={() => setVisType("heatmap")} style={{ background: visType === "heatmap" ? "rgba(255,255,255,0.1)" : "transparent", border: "1px solid " + C.ghost, color: C.textBright, padding: "0.2rem 0.6rem", borderRadius: 4, cursor: "pointer", fontSize: "0.75rem" }}>Heatmap</button>
        </div>
      </div>

      <div style={{ height: 500, borderRadius: 8, overflow: "hidden", position: "relative", zIndex: 1, background: "#f9f7f1" }}>
        <MapContainer style={{ height: "100%", width: "100%" }} zoomControl={true} scrollWheelZoom={false}>
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          
          {isUS && usGeo && (
            <GeoJSON data={usGeo} style={getStyle} onEachFeature={onEachFeature}>
              {feature => <Tooltip sticky>{renderTooltipContent(feature)}</Tooltip>}
            </GeoJSON>
          )}
          {isUS && caGeo && (
            <GeoJSON data={caGeo} style={getStyle} onEachFeature={onEachFeature}>
              {feature => <Tooltip sticky>{renderTooltipContent(feature)}</Tooltip>}
            </GeoJSON>
          )}
          {!isUS && worldGeo && (
            <GeoJSON data={worldGeo} style={getStyle} onEachFeature={onEachFeature}>
              {feature => <Tooltip sticky>{renderTooltipContent(feature)}</Tooltip>}
            </GeoJSON>
          )}

          {(isUS && usGeo && caGeo) && <FitBounds geojson={{ type: "FeatureCollection", features: [...usGeo.features, ...caGeo.features] }} />}
          {(!isUS && worldGeo) && <FitBounds geojson={worldGeo} />}

          {visType === "bullseye" && isUS && usGeo && renderBullseyes(usGeo)}
          {visType === "bullseye" && isUS && caGeo && renderBullseyes(caGeo)}
          {visType === "bullseye" && !isUS && worldGeo && renderBullseyes(worldGeo)}
        </MapContainer>
      </div>
    </div>
  );
}
