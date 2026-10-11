import 'leaflet/dist/leaflet.css';
import React, { useEffect, useMemo } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { colorForValue, recencyBucket, RECENCY, NO_DATA_COLOR } from '../../../lib/atlas/metrics.js';
import { formatValue } from '../../../lib/atlas/series.js';
import { censusRegionForState } from '../../../lib/atlas/seed.js';

const WORLD_BOUNDS = [[-55, -170], [75, 175]];
const US_BOUNDS = [[24, -125], [50, -66]];

function Fit({ bounds, focus }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      if (focus) map.fitBounds(focus, { padding: [60, 60], maxZoom: 4 });
      else map.fitBounds(bounds, { padding: [8, 8] });
    }, 60);
    return () => clearTimeout(t);
  }, [map, bounds, focus]);
  return null;
}

function fillFor(obs, layer, nowYear) {
  if (!obs) return NO_DATA_COLOR;
  if (layer === 'recency') return RECENCY[recencyBucket(obs.period, nowYear)].color;
  return colorForValue(obs.value);
}

/**
 * mode 'world': features = world countries (feature.id = ISO3), values = Map<ISO3, obs>
 * mode 'us':    features = US states, values = Map<'USA:<region>', obs> (census-region shading)
 */
export default function AtlasMap({ mode = 'world', geo, values, layer = 'reported', selected, onSelect, nowYear = new Date().getFullYear() }) {
  const isUs = mode === 'us';

  const keyFor = f => (isUs ? `USA:${censusRegionForState(f.properties?.name)}` : f.id);

  const focus = useMemo(() => {
    if (isUs || !selected || !geo) return null;
    const f = geo.features.find(x => x.id === selected);
    if (!f) return null;
    try { return L.geoJSON(f).getBounds(); } catch { return null; }
  }, [geo, selected, isUs]);

  if (!geo) return <div className="at-map at-map--loading">Loading boundaries…</div>;

  const style = f => {
    const k = keyFor(f);
    const obs = values.get(k);
    const isSel = !isUs && selected && f.id === selected;
    return {
      fillColor: fillFor(obs, layer, nowYear),
      fillOpacity: obs ? 0.92 : 0.55,
      color: isSel ? '#d4a030' : '#ffffff',
      weight: isSel ? 2.5 : 0.6,
      dashArray: obs ? null : '2 3',
    };
  };

  const onEach = (f, lyr) => {
    const k = keyFor(f);
    const obs = values.get(k);
    const name = isUs ? `${f.properties.name}${obs ? ` · ${obs.geo_name}` : ''}` : f.properties?.name;
    const body = obs
      ? `<strong>${formatValue(obs.value)}</strong> <span class="at-tip-yr">(${obs.period})</span>`
      : `<span class="at-tip-none">${isUs ? 'Region figure awaiting verification' : 'No data in ledger yet'}</span>`;
    lyr.bindTooltip(`<div class="at-tip"><div class="at-tip-name">${name}</div>${body}</div>`, { sticky: true, className: 'at-tip-wrap', direction: 'top' });
    lyr.on({
      mouseover: e => e.target.setStyle({ weight: 2, color: '#d4a030' }),
      mouseout: e => e.target.setStyle(style(f)),
      click: () => onSelect?.(isUs ? 'USA' : f.id, f),
    });
  };

  // react-leaflet's GeoJSON doesn't restyle on prop change; remount when the data signature changes.
  const dataKey = `${mode}|${layer}|${selected || ''}|${[...values.values()].map(o => o.id).join(',')}`;

  return (
    <MapContainer
      className="at-map"
      center={[20, 10]}
      zoom={2}
      minZoom={1.5}
      maxZoom={7}
      zoomSnap={0.25}
      worldCopyJump={false}
      maxBounds={[[-60, -200], [85, 200]]}
      attributionControl={false}
      scrollWheelZoom={false}
    >
      <Fit bounds={isUs ? US_BOUNDS : WORLD_BOUNDS} focus={focus} />
      <GeoJSON key={dataKey} data={geo} style={style} onEachFeature={onEach} />
    </MapContainer>
  );
}
