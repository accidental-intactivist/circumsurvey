import React, { lazy, Suspense } from "react";

const GeographicHeatmap = lazy(() => import("./GeographicHeatmap"));

/**
 * LazyGeographicHeatmap — thin wrapper that dynamically imports the full
 * GeographicHeatmap component (and its Leaflet/react-leaflet/topojson
 * dependencies) only when rendered. Shows a themed placeholder while loading.
 *
 * Usage: drop-in replacement for `import GeographicHeatmap from "..."`.
 */
export default function LazyGeographicHeatmap(props) {
  return (
    <Suspense fallback={
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: 300, background: "var(--c-bgSoft, #1a1a2e)",
        borderRadius: 8, border: "1px solid var(--c-ghost, #333)",
        flexDirection: "column", gap: "0.75rem",
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          border: "3px solid var(--c-ghost, #333)",
          borderTopColor: "var(--c-blue, #4a9eff)",
          animation: "map-spin 0.8s linear infinite",
        }} />
        <span style={{
          fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
          fontSize: "0.7rem", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "var(--c-muted, #888)",
        }}>Loading map…</span>
        <style>{`@keyframes map-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <GeographicHeatmap {...props} />
    </Suspense>
  );
}
