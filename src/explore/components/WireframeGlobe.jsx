import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { geoOrthographic, geoPath, geoGraticule, geoCentroid } from 'd3-geo';
import { normalizeName } from '../lib/formatters';
import * as topojson from 'topojson-client';
import { useTheme } from '../contexts/ThemeContext';

const WORLD_GEO_URL = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";
const US_TOPO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const CANADA_GEO_URL = "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/canada.geojson";

// Globe derives its palette from live CSS theme tokens.
// High contrast: dark ocean → light land → bright dots, on every theme/mode.

const getMovaPalette = (t, mode, defaultColors) => {
  const isDark = mode === 'dark';
  
  if (t === 'standard') {
    return isDark
      ? { ...defaultColors, ocean: '#0a0a0a', land: '#c5a059', border: '#e0e0e0', grat: '#222222', glint: '#ffffff', landBorder: 'rgba(0,0,0,0.6)' }
      : { ...defaultColors, ocean: '#7da2cc', land: '#ffffff', border: '#ffffff', grat: 'rgba(255,255,255,0.3)', glint: '#ffffff', landBorder: 'rgba(0,0,0,0.1)' };
  }
  if (t === 'ocean') {
    return isDark
      ? { ...defaultColors, ocean: '#1a4b6c', land: '#c29b62', border: '#00ffff', grat: 'rgba(0,255,255,0.2)', glint: '#00ffff', landBorder: 'rgba(0,0,0,0.5)' }
      : { ...defaultColors, ocean: '#003366', land: '#e0e0e0', border: '#ffffff', grat: 'rgba(255,255,255,0.2)', glint: '#ffffff', landBorder: 'rgba(0,0,0,0.2)' };
  }
  if (t === 'paper') {
    return isDark
      ? { ...defaultColors, ocean: '#3e2723', land: '#c5a059', border: '#ffb300', grat: 'rgba(255,179,0,0.2)', glint: '#ffb300', landBorder: 'rgba(0,0,0,0.6)' }
      : { ...defaultColors, ocean: '#eaddba', land: '#c3b793', border: '#b23a3a', grat: 'rgba(178,58,58,0.2)', glint: '#ffd700', landBorder: 'rgba(0,0,0,0.3)' };
  }
  if (t === 'evergreen') {
    return isDark
      ? { ...defaultColors, ocean: '#1a4314', land: '#c5a059', border: '#ffd700', grat: 'rgba(255,215,0,0.2)', glint: '#ffd700', landBorder: 'rgba(0,0,0,0.5)' }
      : { ...defaultColors, ocean: '#b0c4b1', land: '#f5f0e6', border: '#1a4314', grat: 'rgba(26,67,20,0.2)', glint: '#1a4314', landBorder: 'rgba(0,0,0,0.15)' };
  }
  if (t === 'vaporwave') {
    return isDark
      ? { ...defaultColors, ocean: '#2d004d', land: '#e6e6fa', border: '#00ffff', grat: 'rgba(0,255,255,0.2)', glint: '#00ffff', landBorder: 'rgba(0,0,0,0.4)' }
      : { ...defaultColors, ocean: '#00ffff', land: '#ff00ff', border: '#ffffff', grat: 'rgba(255,255,255,0.4)', glint: '#ffffff', landBorder: 'rgba(0,0,0,0.1)' };
  }
  if (t === 'brick') {
    return isDark
      ? { ...defaultColors, ocean: '#5c0000', land: '#cccccc', border: '#ffffff', grat: 'rgba(255,255,255,0.2)', glint: '#ffffff', landBorder: 'rgba(0,0,0,0.5)' }
      : { ...defaultColors, ocean: '#b22222', land: '#ffffff', border: '#e0e0e0', grat: 'rgba(224,224,224,0.3)', glint: '#ffffff', landBorder: 'rgba(0,0,0,0.15)' };
  }
  if (t === 'mono') {
    return isDark
      ? { ...defaultColors, ocean: '#000000', land: '#b3b3b3', border: '#ffffff', grat: 'rgba(255,255,255,0.2)', glint: '#ffffff', landBorder: 'rgba(0,0,0,0.6)' }
      : { ...defaultColors, ocean: '#ffffff', land: '#333333', border: '#000000', grat: 'rgba(0,0,0,0.1)', glint: '#000000', landBorder: 'rgba(255,255,255,0.5)' };
  }
  if (t === 'amber') {
    return isDark
      ? { ...defaultColors, ocean: '#111111', land: '#ff8c00', border: '#ff0000', grat: 'rgba(255,0,0,0.3)', glint: '#ffd700', landBorder: 'rgba(0,0,0,0.6)' }
      : { ...defaultColors, ocean: '#ffbf00', land: '#ffffff', border: '#ffffff', grat: 'rgba(255,255,255,0.4)', glint: '#ffffff', landBorder: 'rgba(0,0,0,0.1)' };
  }
  if (t === 'pueblo') {
    return isDark
      ? { ...defaultColors, ocean: '#5e2713', land: '#cccccc', border: '#ffffff', grat: 'rgba(255,255,255,0.2)', glint: '#ffffff', landBorder: 'rgba(0,0,0,0.5)' }
      : { ...defaultColors, ocean: '#d99a6c', land: '#fffdd0', border: '#8b4513', grat: 'rgba(139,69,19,0.2)', glint: '#8b4513', landBorder: 'rgba(0,0,0,0.2)' };
  }
  
  return defaultColors;
};

export default function WireframeGlobe({ 
  distribution,
  width = 400,
  height = 400,
  scale = 1,
  autoRotate = true,
  rotationSpeed = 0.15,
  initialRotation = [0, -20, 0],
  geoUrl = WORLD_GEO_URL,
  targetCountry = null,
  centerOnHover = true
}) {
  const canvasRef = useRef(null);
  const [geoData, setGeoData] = useState(null);  // STATE, not ref — triggers re-render
  const rotationRef = useRef([...initialRotation]);
  const animFrameRef = useRef(null);
  
  // Tooltip state
  const [tooltip, setTooltip] = useState(null);
  const mousePosRef = useRef(null);
  
  const themeContext = useTheme();
  const { theme: globalTheme, mode } = themeContext || { theme: "standard", mode: "dark" };

  const currentPalette = useMemo(() => {
    let defaultColors = {};
    if (typeof document !== 'undefined') {
      const cs = getComputedStyle(document.documentElement);
      const readVar = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
      defaultColors = {
        ocean:  readVar('--map-ocean',  '#003049'),
        land:   readVar('--map-land',   '#FFFFFF'),
        dot:    readVar('--c-red',      '#ef4444'),
        border: readVar('--map-border', 'rgba(255,215,0,0.2)'),
        grat:   readVar('--c-ghost',    '#2a2a2a'),
        glint:  readVar('--c-goldBright', '#ffd700'),
      };
    }
    return getMovaPalette(globalTheme, mode, defaultColors);
  }, [globalTheme, mode]);

  // Process data for dot sizing (stable reference via useMemo)
  const dataMap = useMemo(() => {
    if (!distribution || !distribution.distribution) return { map: {}, max: 0, labels: {} };
    const map = {};
    const labels = {};
    let max = 0;
    for (const d of distribution.distribution) {
      const val = d.n || 0;
      const norm = normalizeName(d.label);
      map[norm] = val;
      labels[norm] = d.label;
      if (val > max) max = val;
    }
    return { map, max, labels };
  }, [distribution]);

  // Fetch geo data — only sets state, does NOT call draw
  useEffect(() => {
    const urls = Array.isArray(geoUrl) ? geoUrl : [geoUrl];
    
    Promise.all(urls.map(url => fetch(url).then(r => r.json())))
      .then(datasets => {
        let allFeatures = [];
        datasets.forEach(data => {
          if (data.type === "Topology") {
            const key = Object.keys(data.objects)[0];
            allFeatures = allFeatures.concat(topojson.feature(data, data.objects[key]).features);
          } else {
            allFeatures = allFeatures.concat(data.features || []);
          }
        });
        setGeoData({ type: "FeatureCollection", features: allFeatures });
      })
      .catch(err => console.error("Error loading geojson for globe:", err));
  }, [geoUrl]);

  // Sync initialRotation prop into ref when it changes meaningfully
  const initRotKey = initialRotation.join(',');
  useEffect(() => {
    rotationRef.current = [...initialRotation];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initRotKey]);

  // ══════════════════════════════════════════════════════════════════
  // SINGLE drawing effect — the ONLY place drawing happens.
  // Depends on geoData (state), theme, mode, and all visual props.
  // ══════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!geoData) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Cancel any prior animation
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    
    const colors = currentPalette;
    
    // Setup DPR for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Setup projection
    const projection = geoOrthographic()
      .translate([width / 2, height / 2])
      .scale((Math.min(width, height) / 2 - 10) * scale)
      .clipAngle(90)
      .precision(0.1);
      
    const pathGen = geoPath(projection, ctx);
    const testPath = geoPath(projection); // Context-less for hit testing
    const graticuleLines = geoGraticule().step([10, 10]).lines();
    
    // Find target centroid if needed for rotation
    let targetCoords = null;
    if (centerOnHover && targetCountry && geoData) {
      const feature = geoData.features.find(f => normalizeName(f.properties.name) === normalizeName(targetCountry));
      if (feature) {
        targetCoords = geoCentroid(feature);
      }
    }
    
    // ── The render loop ──
    const drawFrame = () => {
      projection.rotate(rotationRef.current);

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);
      
      const radius = projection.scale();
      const center = projection.translate();
      
      // Clip everything to the sphere circle
      ctx.beginPath();
      ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
      ctx.clip();
      
      const t = (Date.now() % 12000) / 12000; // 0 to 1 over 12 seconds
      const cx = width / 2;
      const cy = height / 2;
      
      ctx.globalAlpha = 0.85;
      graticuleLines.forEach((line, i) => {
        // Stagger phase based on line index
        const phaseOffset = i * 0.08;
        // Shift global time 't' (which goes 0 to 1 over 4s)
        const localT = (t + phaseOffset) % 1.0;
        
        // Sweep diagonally across the globe
        const sweepX = cx + (localT - 0.5) * (radius * 3.5);
        const sweepY = cy + (localT - 0.5) * (radius * 3.5);
        
        // Diagonal linear gradient (sweep from top-left to bottom-right)
        // This gives a massive sweeping slash of light, but avoids flashing vertical lines instantly
        const lineGrad = ctx.createLinearGradient(sweepX - 120, sweepY - 120, sweepX + 120, sweepY + 120);
        lineGrad.addColorStop(0, colors.grat);
        lineGrad.addColorStop(0.4, colors.glint);
        lineGrad.addColorStop(0.5, '#ffffff'); // Massive white-hot core
        lineGrad.addColorStop(0.6, colors.glint);
        lineGrad.addColorStop(1, colors.grat);

        ctx.beginPath();
        pathGen(line);
        // Add an aggressive glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = colors.glint;
        
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = lineGrad;
        ctx.stroke();
        
        // Reset shadow so it doesn't affect landmasses
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1.0;
      
      // Border Glint (matches the 8s schedule)
      const borderSweepX = cx + (t - 0.5) * (radius * 3.5);
      const borderSweepY = cy + (t - 0.5) * (radius * 3.5);
      const borderGrad = ctx.createLinearGradient(borderSweepX - 120, borderSweepY - 120, borderSweepX + 120, borderSweepY + 120);
      // Use theme-specific translucent color for the unlit borders so they stand out against vibrant land
      const baseBorder = colors.landBorder || 'rgba(0, 0, 0, 0.4)';
      
      borderGrad.addColorStop(0, baseBorder);
      borderGrad.addColorStop(0.4, colors.glint);
      borderGrad.addColorStop(0.5, '#ffffff'); 
      borderGrad.addColorStop(0.6, colors.glint);
      borderGrad.addColorStop(1, baseBorder);

      // 3. LANDMASSES — holographic fill + synchronized scanning border
      geoData.features.forEach(feature => {
        if (feature.id === 'ATA' || feature.properties?.name === 'Antarctica') return;
        
        const isHovered = targetCountry && (normalizeName(feature.properties?.name) === normalizeName(targetCountry));

        ctx.beginPath();
        pathGen(feature);
        
        // Base opaque land fill
        ctx.fillStyle = colors.land;
        ctx.fill();
        
        // Hover accent
        if (isHovered) {
          ctx.fillStyle = colors.dot;
          ctx.globalAlpha = 0.3;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // Synchronized glinting border
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = borderGrad;
        ctx.stroke();
      });
      
      // 3.5 OUTER SPHERE BORDER
      // Draw a clean ring around the entire globe that catches the scanning glint
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = borderGrad;
      ctx.shadowBlur = 4;
      ctx.shadowColor = colors.glint;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      let hoveredThisFrame = null;
      
      // 4. DATA DOTS — bright accent on top of land
      geoData.features.forEach(feature => {
        const norm = normalizeName(feature.properties.name);
        const val = dataMap.map[norm] || 0;
        
        if (val > 0) {
          const centroid = geoCentroid(feature);
          const p = projection(centroid);
          
          if (p && testPath({ type: 'Point', coordinates: centroid })) {
            const r = Math.max(3, Math.min(14, Math.sqrt(val) * 1.5));
            ctx.beginPath();
            ctx.arc(p[0], p[1], r, 0, 2 * Math.PI);
            ctx.fillStyle = colors.dot;
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors.dot;
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Hit testing
            if (mousePosRef.current) {
              const dx = mousePosRef.current.x - p[0];
              const dy = mousePosRef.current.y - p[1];
              // A generous hit radius of dot radius + 6px
              if (dx * dx + dy * dy <= (r + 6) * (r + 6)) {
                hoveredThisFrame = {
                  x: p[0],
                  y: p[1],
                  label: dataMap.labels[norm] || feature.properties.name,
                  n: val
                };
              }
            }
          }
        }
      });
      
      setTooltip(prev => {
        if (!prev && !hoveredThisFrame) return prev;
        if (prev && hoveredThisFrame && prev.label === hoveredThisFrame.label) return prev;
        return hoveredThisFrame;
      });
      
      // 5. Sphere border
      ctx.beginPath();
      ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = colors.border;
      ctx.stroke();
      
      ctx.restore();
      
      // Advance rotation for next frame
      if (targetCoords) {
        const targetRot = [-targetCoords[0], -targetCoords[1], 0];
        rotationRef.current[0] += (targetRot[0] - rotationRef.current[0]) * 0.05;
        rotationRef.current[1] += (targetRot[1] - rotationRef.current[1]) * 0.05;
      } else if (autoRotate) {
        rotationRef.current[0] += rotationSpeed;
      }
      
      // Always request the next frame so the holographic glint scanner continuously sweeps!
      animFrameRef.current = requestAnimationFrame(drawFrame);
    };
    
    // Kick off the first frame
    drawFrame();
    
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [geoData, dataMap, currentPalette, autoRotate, width, height, scale, rotationSpeed, initRotKey, targetCountry]);
  
  // Compute ocean background from live CSS — reactive to theme/mode changes
  const oceanBg = currentPalette.ocean;
  
  const handleMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    mousePosRef.current = {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current = null;
    setTooltip(null);
  };

  return (
    <div style={{ position: 'relative', width, height, background: oceanBg, borderRadius: '50%', boxShadow: `0 4px 20px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,215,0,0.15)` }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          cursor: tooltip ? 'pointer' : 'default',
          display: 'block',
          borderRadius: '50%',
        }} 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: (tooltip.x / (window.devicePixelRatio || 1)),
          top: (tooltip.y / (window.devicePixelRatio || 1)) - 30,
          transform: 'translate(-50%, -100%)',
          background: 'rgba(0, 0, 0, 0.85)',
          border: '1px solid var(--map-border)',
          borderRadius: 4,
          padding: '0.4rem 0.6rem',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.7rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {tooltip.label}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.65rem', color: 'var(--c-red)' }}>
            N = {tooltip.n}
          </span>
        </div>
      )}
    </div>
  );
}
