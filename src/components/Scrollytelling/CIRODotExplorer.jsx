import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3-force';
import { geoOrthographic, geoPath, geoAlbers } from 'd3-geo';
import * as topojson from 'topojson-client';
import { DEMOGRAPHIC_DIMENSIONS } from '../../demographics';

const PATHWAYS = [
  { id: 'intact', count: 142, color: '#5b93c7' },
  { id: 'circumcised', count: 213, color: '#d94f4f' },
  { id: 'restoring', count: 109, color: '#e8c868' },
  { id: 'observer', count: 37, color: '#a0a0a0' }
];

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const US_GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const COORDS = {
  "USA": [-98.5795, 39.8283],
  "Canada": [-106.3468, 56.1304],
  "United Kingdom": [-3.4359, 55.3781],
  "Australia": [133.7751, -25.2744],
  "Germany": [10.4515, 51.1657],
  "South Africa": [22.9375, -30.5595],
  "Ireland": [-8.2439, 53.4129],
  "New Zealand": [174.8860, -40.9006],
  
  // North American Regions for 2D Map
  "California": [-119.4179, 36.7783],
  "Texas": [-99.9018, 31.9686],
  "Florida": [-81.5158, 27.6648],
  "New York": [-75.0000, 43.0000],
  "Illinois": [-89.3985, 40.6331],
  "Pennsylvania": [-77.1945, 41.2033],
  "Ohio": [-82.9071, 40.4173],
  "Georgia": [-83.6431, 32.1656],
  "North Carolina": [-79.0193, 35.7596],
  "Michigan": [-85.6024, 44.3148],
  "New Jersey": [-74.4057, 40.0583],
  "Virginia": [-78.6569, 37.4316],
  "Washington": [-120.7401, 47.7511],
  "Arizona": [-111.0937, 34.0489],
  "Massachusetts": [-71.3824, 42.4072],
  "Tennessee": [-86.5804, 35.5175],
  "Indiana": [-86.1349, 40.2672],
  "Missouri": [-92.2884, 38.5739],
  "Maryland": [-76.6413, 39.0458],
  "Wisconsin": [-89.6165, 43.7844],
  "Colorado": [-105.3588, 39.1130],
  "Minnesota": [-94.6859, 46.7296],
  "South Carolina": [-81.1637, 33.8361],
  "Alabama": [-86.9023, 32.3182],
  "Louisiana": [-91.9623, 31.1695],
  "Kentucky": [-84.2700, 37.8393],
  "Oregon": [-120.5542, 43.8041],
  "Oklahoma": [-97.5164, 35.4676],
  "Connecticut": [-73.0877, 41.6032],
  "Utah": [-111.0937, 39.3210],
  "Nevada": [-116.4194, 38.8026],
  "Iowa": [-93.0977, 41.8780],
  "Arkansas": [-92.1999, 35.2010],
  "Mississippi": [-89.3985, 32.3547],
  "Kansas": [-98.4842, 39.0119],
  "New Mexico": [-105.8701, 34.5199],
  "Nebraska": [-99.9018, 41.4925],
  "Idaho": [-114.7420, 44.0682],
  "West Virginia": [-80.4549, 38.5976],
  "Hawaii": [-155.8444, 19.8968],
  "New Hampshire": [-71.5724, 43.1939],
  "Maine": [-69.4455, 45.2538],
  "Rhode Island": [-71.4128, 41.8239],
  "Montana": [-110.3626, 46.8797],
  "Delaware": [-75.5277, 38.9108],
  "South Dakota": [-99.9018, 43.9695],
  "North Dakota": [-99.9018, 47.5515],
  "Alaska": [-149.4937, 64.2008],
  "Vermont": [-72.5778, 44.5588],
  "Wyoming": [-107.2903, 43.0759],
  "Ontario": [-85.3232, 51.2538],
  "Quebec": [-71.2080, 52.9399],
  "British Columbia": [-123.3656, 54.0000],
  "Alberta": [-113.4687, 53.9333]
};

const NA_REGIONS_US = [
  { name: "California", weight: 12 }, { name: "Texas", weight: 9 }, { name: "Florida", weight: 6 },
  { name: "New York", weight: 6 }, { name: "Illinois", weight: 4 }, { name: "Pennsylvania", weight: 4 },
  { name: "Ohio", weight: 4 }, { name: "Georgia", weight: 3 }, { name: "North Carolina", weight: 3 },
  { name: "Michigan", weight: 3 }, { name: "New Jersey", weight: 3 }, { name: "Virginia", weight: 3 },
  { name: "Washington", weight: 3 }, { name: "Arizona", weight: 3 }, { name: "Massachusetts", weight: 2 },
  { name: "Tennessee", weight: 2 }, { name: "Indiana", weight: 2 }, { name: "Missouri", weight: 2 },
  { name: "Maryland", weight: 2 }, { name: "Wisconsin", weight: 2 }, { name: "Colorado", weight: 2 },
  { name: "Minnesota", weight: 2 }, { name: "South Carolina", weight: 2 }, { name: "Alabama", weight: 1 },
  { name: "Louisiana", weight: 1 }, { name: "Kentucky", weight: 1 }, { name: "Oregon", weight: 1 },
  { name: "Oklahoma", weight: 1 }, { name: "Connecticut", weight: 1 }, { name: "Utah", weight: 1 },
  { name: "Nevada", weight: 1 }, { name: "Iowa", weight: 1 }, { name: "Arkansas", weight: 1 },
  { name: "Mississippi", weight: 1 }, { name: "Kansas", weight: 1 }, { name: "New Mexico", weight: 1 },
  { name: "Nebraska", weight: 1 }, { name: "Idaho", weight: 1 }, { name: "West Virginia", weight: 1 },
  { name: "Hawaii", weight: 1 }, { name: "New Hampshire", weight: 1 }, { name: "Maine", weight: 1 },
  { name: "Rhode Island", weight: 1 }, { name: "Montana", weight: 1 }, { name: "Delaware", weight: 1 },
  { name: "South Dakota", weight: 1 }, { name: "North Dakota", weight: 1 }, { name: "Alaska", weight: 1 },
  { name: "Vermont", weight: 1 }, { name: "Wyoming", weight: 1 }
];
const NA_REGIONS_CA = [
  { name: "Ontario", weight: 4 }, { name: "Quebec", weight: 2 },
  { name: "British Columbia", weight: 1 }, { name: "Alberta", weight: 1 }
];

const pickWeighted = (arr) => {
  let total = arr.reduce((acc, a) => acc + a.weight, 0);
  let r = Math.random() * total;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i].weight;
    if (r <= sum) return arr[i].name;
  }
  return arr[0].name;
};

function allocateCategories(nodes, pathway, dimensionId) {
  const dim = DEMOGRAPHIC_DIMENSIONS.find(d => d.id === dimensionId);
  if (!dim) return;
  
  let pool = [];
  dim.categories.forEach(c => {
    let count = c[pathway] || 0;
    for(let i=0; i<count; i++) pool.push(c.category);
  });
  
  // If pool is empty (e.g., Observers aren't in the crosstabs),
  // fallback to using the total population distribution for this dimension.
  if (pool.length === 0) {
    dim.categories.forEach(c => {
      let count = c.total || 0;
      for(let i=0; i<count; i++) pool.push(c.category);
    });
  }

  pool.sort(() => Math.random() - 0.5);
  
  let pNodes = nodes.filter(n => n.pathway === pathway);
  pNodes.forEach((n, i) => {
    n[`category_${dimensionId}`] = pool.length > 0 ? pool[i % pool.length] : 'Unknown';
  });
}

// Build UI Dimensions list from demographics
const EXCLUDED_DIMS = ['country_birth']; // Handled exclusively by 'geography'
const UI_DIMENSIONS = [
  { id: 'geography', label: 'Origin Globe' },
  { id: 'geography_na', label: 'North America (2D)' },
  ...DEMOGRAPHIC_DIMENSIONS
    .filter(d => !EXCLUDED_DIMS.includes(d.id))
    .map(d => ({ id: d.id, label: d.short || d.label }))
];

export default function CIRODotExplorer({ controlledDimension, controlledSplit, hideControls = false }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [internalDimension, setInternalDimension] = useState('geography');
  const [internalSplit, setInternalSplit] = useState(false);

  const activeDimension = controlledDimension !== undefined ? controlledDimension : internalDimension;
  const isSplitMode = controlledSplit !== undefined ? controlledSplit : internalSplit;
  
  const setActiveDimension = controlledDimension !== undefined ? () => {} : setInternalDimension;
  const setIsSplitMode = controlledSplit !== undefined ? () => {} : setInternalSplit;

  const [worldData, setWorldData] = useState(null);
  const [usData, setUsData] = useState(null);
  const simulationRef = useRef(null);
  const [categoriesToRender, setCategoriesToRender] = useState([]);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    Promise.all([
      fetch(GEO_URL).then(r => r.json()),
      fetch(US_GEO_URL).then(r => r.json())
    ]).then(([world, us]) => {
      setWorldData(topojson.feature(world, world.objects.countries));
      setUsData(topojson.feature(us, us.objects.states));
    });
  }, []);

  const nodes = useMemo(() => {
    let arr = [];
    PATHWAYS.forEach(p => {
      for (let i = 0; i < p.count; i++) {
        arr.push({
          id: `${p.id}-${i}`,
          pathway: p.id,
          color: p.color,
          radius: 3.5,
        });
      }
    });

    // Allocate all dimensions
    DEMOGRAPHIC_DIMENSIONS.forEach(dim => {
      PATHWAYS.forEach(p => allocateCategories(arr, p.id, dim.id));
    });
    
    // Assign specific NA regions for stacking demo
    arr.forEach(n => {
      if (n.category_country_birth === 'USA') {
        n.region = pickWeighted(NA_REGIONS_US);
      } else if (n.category_country_birth === 'Canada') {
        n.region = pickWeighted(NA_REGIONS_CA);
      } else {
        n.region = n.category_country_birth;
      }
    });

    // Sort by pathway in cohort (CIRO) order: Circumcised at bottom, then Intact, then Restoring, then Observer on top
    const CIRO_ORDER = ['circumcised', 'intact', 'restoring', 'observer'];
    arr.sort((a, b) => CIRO_ORDER.indexOf(a.pathway) - CIRO_ORDER.indexOf(b.pathway));
    
    // Assign stack index per region
    const counts = {};
    arr.forEach(n => {
      counts[n.region] = (counts[n.region] || 0) + 1;
      n.stackIndex = counts[n.region];
    });

    return arr;
  }, []);

  useEffect(() => {
    if (!worldData || !canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const projectionGlobe = geoOrthographic().fitSize([width * 0.9, height * 0.9], worldData).translate([width/2, height/2]);
    const projectionBack = geoOrthographic().rotate(projectionGlobe.rotate()).scale(projectionGlobe.scale()).translate(projectionGlobe.translate()).clipAngle(180);
    const projectionNA = geoAlbers().scale(width * 1.2).translate([width/2, height/2]);
    
    const isGlobe = activeDimension === 'geography';
    const isNA = activeDimension === 'geography_na';
    const isGeo = isGlobe || isNA;

    const projection = isGlobe ? projectionGlobe : projectionNA;
    const pathGenerator = geoPath(projection, ctx);

    let activeCats = [];
    if (!isGeo) {
      const dimData = DEMOGRAPHIC_DIMENSIONS.find(d => d.id === activeDimension);
      if (dimData) activeCats = dimData.categories.map(c => c.category);
    }
    setCategoriesToRender(activeCats);

    const forceGeo = (alpha) => {
      if (!isGeo) return;
      for (let i = 0, n = nodes.length; i < n; ++i) {
        const d = nodes[i];
        
        if (isNA) {
          const coords = COORDS[d.region] || COORDS["USA"];
          const p = projectionNA(coords);
          if (p) {
             // Poker chip stack (3px thickness per dot, offset upward)
             const targetX = p[0];
             const targetY = p[1] - (d.stackIndex * 3);
             d.vx += (targetX - d.x) * alpha * 0.6;
             d.vy += (targetY - d.y) * alpha * 0.6;
          }
        } else {
          // Globe swarm
          const cat = d.category_country_birth;
          const coords = COORDS[cat] || COORDS["USA"];
          const p = projectionBack(coords);
          if (p) {
             d.vx += (p[0] - d.x) * alpha * 0.2;
             d.vy += (p[1] - d.y) * alpha * 0.2;
          }
        }
      }
    };

    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-1.5))
      .force('collide', d3.forceCollide().radius(d => d.radius + 1.2).iterations(2))
      .force('geo', forceGeo)
      .alphaDecay(0.015)
      .on('tick', () => {
        ctx.clearRect(0, 0, width, height);

        if (isGeo) {
          ctx.beginPath();
          if (isNA && usData) {
            pathGenerator(usData); // Draw US States
          } else {
            pathGenerator(worldData); // Draw World
          }
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
          
          if (isGlobe) {
            ctx.beginPath();
            pathGenerator({type: "Sphere"});
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.stroke();
          }
        }

        // Draw nodes (from bottom of stack to top)
        // Since they are sorted by pathway, the stack naturally renders bottom to top
        nodes.forEach(d => {
          if (isGlobe) {
            // Hide dots if they are on the back side of the globe
            const cat = d.category_country_birth;
            const coords = COORDS[cat] || COORDS["USA"];
            const p = projectionGlobe(coords);
            if (!p) return; // Clipped/back side, do not draw!
          }

          ctx.beginPath();
          // Draw poker chip style for NA
          if (isNA) {
            // Shadow / Chip edge
            ctx.arc(d.x, d.y + 1.5, d.radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fill();
            
            // Chip face
            ctx.beginPath();
            ctx.ellipse(d.x, d.y, d.radius * 1.2, d.radius * 0.8, 0, 0, 2 * Math.PI);
            ctx.fillStyle = d.color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.stroke();
          } else {
            ctx.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
            ctx.fillStyle = d.color;
            ctx.fill();
          }
        });
        
        // Draw split dividers
        if (activeDimension !== 'geography' && isSplitMode) {
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
      });

    simulationRef.current = simulation;

    const applyForces = () => {
      if (isGeo) {
        simulation.force('x', null).force('y', null);
        if (isNA) {
          // Disable collision for precise stacking
          simulation.force('collide', null);
          simulation.force('charge', null);
        } else {
          simulation.force('collide', d3.forceCollide().radius(d => d.radius + 1.2).iterations(2));
          simulation.force('charge', d3.forceManyBody().strength(-1.5));
        }
      } else {
        simulation.force('collide', d3.forceCollide().radius(d => d.radius + 1.2).iterations(2));
        simulation.force('charge', d3.forceManyBody().strength(-1.5));
        const numCols = activeCats.length;
        simulation
          .force('x', d3.forceX(d => {
            const idx = activeCats.indexOf(d[`category_${activeDimension}`]);
            if (idx === -1) return width / 2;
            return (width / (numCols + 1)) * (idx + 1);
          }).strength(0.15))
          .force('y', d3.forceY(d => {
              if (!isSplitMode) {
                // Within the cluster, separate slightly by pathway to create colored bands
                if (d.pathway === 'intact') return height / 2 - 25;
                if (d.pathway === 'restoring') return height / 2;
                if (d.pathway === 'circumcised') return height / 2 + 25;
                if (d.pathway === 'observer') return height / 2 + 45;
                return height / 2;
              }
              // Split mode: Intact high, others low
              return d.pathway === 'intact' ? height * 0.3 : height * 0.7;
          }).strength(0.12));
      }
      simulation.alpha(0.8).restart();
    };

    applyForces();

    let rotationFrameId;
    if (isGlobe) {
      let start = null;
      const rotate = (timestamp) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        projectionGlobe.rotate([elapsed * 0.005 - 60, -20, 0]);
        projectionBack.rotate(projectionGlobe.rotate()); // Sync back projection rotation
        simulation.alpha(0.1).restart();
        rotationFrameId = requestAnimationFrame(rotate);
      };
      rotationFrameId = requestAnimationFrame(rotate);
    }

    const handleResize = () => {
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      projectionGlobe.fitSize([width * 0.9, height * 0.9], worldData).translate([width/2, height/2]);
      projectionBack.scale(projectionGlobe.scale()).translate(projectionGlobe.translate()); // Sync back projection size
      projectionNA.scale(width * 1.2).translate([width/2, height/2]);
      applyForces();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      simulation.stop();
      if (rotationFrameId) cancelAnimationFrame(rotationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [nodes, worldData, usData, activeDimension, isSplitMode]);

  const handleMouseMove = (e) => {
    if (activeDimension !== 'geography_na' || !containerRef.current) {
      setHoveredRegion(null);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setMousePos({ x: e.clientX, y: e.clientY });

    const width = rect.width;
    const height = rect.height;
    const projectionNA = geoAlbers().scale(width * 1.2).translate([width/2, height/2]);

    let closestRegion = null;
    let maxStackHeight = 0;

    Object.keys(COORDS).forEach(region => {
      if (NA_REGIONS_US.some(r => r.name === region) || NA_REGIONS_CA.some(r => r.name === region)) {
        const p = projectionNA(COORDS[region]);
        if (p) {
          const dx = p[0] - mouseX;
          const dy = p[1] - mouseY;
          // approximate hover area for a stack
          if (Math.abs(dx) < 20 && dy > -20 && dy < 200) {
             closestRegion = region;
          }
        }
      }
    });
    setHoveredRegion(closestRegion);
  };

  const hoveredStackCount = useMemo(() => {
    if (!hoveredRegion) return 0;
    return nodes.filter(n => n.region === hoveredRegion).length;
  }, [hoveredRegion, nodes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Top Control Bar */}
      {!hideControls && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Horizontal Scrolling Pill Menu */}
        <div style={{ 
          display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', flex: 1,
          scrollbarWidth: 'none', msOverflowStyle: 'none'
        }}>
          {UI_DIMENSIONS.map(dim => (
            <button
              key={dim.id}
              onClick={() => setActiveDimension(dim.id)}
              style={{
                flexShrink: 0,
                background: activeDimension === dim.id ? 'var(--c-gold)' : 'transparent',
                color: activeDimension === dim.id ? 'var(--c-bg)' : 'var(--c-text)',
                border: `1px solid ${activeDimension === dim.id ? 'var(--c-gold)' : 'var(--c-dim)'}`,
                padding: '0.4rem 1rem', borderRadius: '100px',
                fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {dim.label}
            </button>
          ))}
        </div>

        {/* Aggregate vs Split Toggle */}
        {!['geography', 'geography_na'].includes(activeDimension) && (
          <div style={{ 
            display: 'flex', background: 'var(--c-bgSoft)', border: '1px solid var(--c-ghost)', borderRadius: '100px', padding: '0.2rem'
          }}>
            <button
              onClick={() => setIsSplitMode(false)}
              style={{
                background: !isSplitMode ? 'var(--c-textSoft)' : 'transparent',
                color: !isSplitMode ? 'var(--c-bg)' : 'var(--c-dim)',
                border: 'none', padding: '0.3rem 0.8rem', borderRadius: '100px',
                fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              Combined View
            </button>
            <button
              onClick={() => setIsSplitMode(true)}
              style={{
                background: isSplitMode ? 'var(--c-textSoft)' : 'transparent',
                color: isSplitMode ? 'var(--c-bg)' : 'var(--c-dim)',
                border: 'none', padding: '0.3rem 0.8rem', borderRadius: '100px',
                fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              Split by Outcome
            </button>
            </div>
          )}
        </div>
      )}

      <div style={{ position: 'relative', width: '100%', height: '70vh', overflow: 'hidden', background: 'var(--c-bgSoft)', borderRadius: 12, border: '1px solid var(--c-ghost)' }}>
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredRegion(null)}>
          <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 10 }} />
        </div>

        {/* Tooltip Overlay */}
        {hoveredRegion && (
          <div style={{
            position: 'fixed',
            left: mousePos.x + 15,
            top: mousePos.y + 15,
            background: 'var(--c-bg)',
            border: '1px solid var(--c-dim)',
            padding: '1rem',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <h4 style={{ margin: 0, fontFamily: "var(--f-condensed)", color: 'var(--c-gold)', textTransform: 'uppercase' }}>
              {hoveredRegion}
            </h4>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--c-textBright)', marginTop: '0.2rem' }}>
              {hoveredStackCount} Respondents
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--c-textSoft)' }}>
              <span>Intact: {nodes.filter(n => n.region === hoveredRegion && n.pathway === 'intact').length}</span>
              <span>Cut: {nodes.filter(n => n.region === hoveredRegion && n.pathway === 'circumcised').length}</span>
            </div>
          </div>
        )}

        {/* Beeswarm Labels */}
        {!['geography', 'geography_na'].includes(activeDimension) && (
          <>
            {/* Column Headers */}
            <div style={{
              position: 'absolute', top: '1rem', left: 0, right: 0,
              display: 'flex', justifyContent: 'space-evenly', zIndex: 20, pointerEvents: 'none'
            }}>
              {categoriesToRender.map((cat, i) => (
                <div key={i} style={{
                  width: `${100 / categoriesToRender.length}%`,
                  textAlign: 'center',
                  fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                  fontWeight: 600, fontSize: '0.8rem', color: 'var(--c-textBright)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  padding: '0 0.5rem',
                  lineHeight: '1.2'
                }}>
                  {cat}
                </div>
              ))}
            </div>

            {/* Split Mode Y-Axis Row Labels */}
            {isSplitMode && (
              <>
                <div style={{
                  position: 'absolute', top: '30%', left: '1rem',
                  transform: 'translateY(-50%)', zIndex: 20, pointerEvents: 'none',
                  fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                  fontWeight: 700, fontSize: '0.9rem', color: 'var(--path-intact)',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  opacity: 0.8
                }}>
                  Intact Parents
                </div>
                <div style={{
                  position: 'absolute', top: '70%', left: '1rem',
                  transform: 'translateY(-50%)', zIndex: 20, pointerEvents: 'none',
                  fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
                  fontWeight: 700, fontSize: '0.9rem', color: 'var(--path-circumcised)',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  opacity: 0.8
                }}>
                  Cut / Restoring
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
