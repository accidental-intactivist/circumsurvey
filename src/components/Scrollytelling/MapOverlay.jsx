import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { DEMOGRAPHIC_DIMENSIONS } from '../../demographics';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Coordinates for the top countries [longitude, latitude]
const COUNTRY_COORDS = {
  "USA": [-98.5795, 39.8283],
  "Canada": [-106.3468, 56.1304],
  "United Kingdom": [-3.4359, 55.3781],
  "Australia": [133.7751, -25.2744],
  "Germany": [10.4515, 51.1657],
  "South Africa": [22.9375, -30.5595],
};

export default function MapOverlay({ active }) {
  const countryData = DEMOGRAPHIC_DIMENSIONS.find(d => d.id === 'country_birth')?.categories || [];
  
  // Filter out "Other"
  const topCountries = countryData.filter(c => COUNTRY_COORDS[c.category]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      opacity: active ? 0.3 : 0,
      transition: 'opacity 1s ease',
      pointerEvents: 'none',
      zIndex: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <ComposableMap projection="geoEqualEarth" style={{ width: "100%", height: "100%", maxHeight: "800px" }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="var(--c-ghost)"
                stroke="var(--c-dim)"
                strokeWidth={0.3}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Demographic Density Markers */}
        {topCountries.map(({ category, total }) => {
          const coordinates = COUNTRY_COORDS[category];
          // Scale radius by square root for area proportionality
          const radius = Math.max(3, Math.sqrt(total) * 1.5);
          
          return (
            <Marker key={category} coordinates={coordinates}>
              <circle r={radius} fill="var(--c-gold)" opacity={0.6} />
              <circle r={radius} fill="none" stroke="var(--c-gold)" strokeWidth={1} />
              {total > 15 && (
                <text
                  textAnchor="middle"
                  y={radius + 8}
                  style={{
                    fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                    fontSize: "8px",
                    fill: "var(--c-textBright)",
                    fontWeight: 600,
                    textTransform: "uppercase"
                  }}
                >
                  {category}
                </text>
              )}
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
}
