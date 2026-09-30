import React, { useState, useEffect, useRef } from 'react';
import { Sankey, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function EntityNetworkGraph({ focusEntityId = null }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver(entries => {
        if (entries[0]) {
          setDimensions({
            width: entries[0].contentRect.width,
            height: entries[0].contentRect.height
          });
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    fetchGraphData();
  }, [focusEntityId]);

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocal ? '/api_mock.json' : '/api/cms';
      const entUrlMock = '/api_entities_mock.json';
      
      const [entRes, entMockRes, docRes] = await Promise.all([
        fetch('/api/entities'),
        isLocal ? fetch(entUrlMock) : Promise.resolve({ ok: false }),
        fetch(apiUrl)
      ]);
      
      let allEntities = entRes.ok ? await entRes.json() : [];
      if (entMockRes.ok) {
        try {
          const mockEntities = await entMockRes.json();
          const existingIds = new Set(allEntities.map(e => e.id));
          mockEntities.forEach(e => {
            if (!existingIds.has(e.id)) {
              allEntities.push(e);
            }
          });
        } catch(e) {}
      }

      let allDocs = docRes.ok ? await docRes.json() : [];
      if (allDocs.data) allDocs = allDocs.data;

      let targetEntity = null;
      if (focusEntityId) {
        targetEntity = allEntities.find(e => e.id === focusEntityId || e.name.toLowerCase() === focusEntityId.toLowerCase());
        if (!targetEntity) {
          targetEntity = { id: focusEntityId, name: focusEntityId, type: 'person' };
          allEntities.push(targetEntity);
        }
      }

      // We will build a direct co-occurrence graph: Target Entity -> Category -> Co-Entity
      const rechartsNodes = [];
      const rechartsLinks = [];

      if (targetEntity) {
        const coOccurrence = {};
        
        allDocs.forEach(doc => {
          let meta = {};
          try { if (doc.metadata_json) meta = JSON.parse(doc.metadata_json); } catch (e) {}

          const orgs = Array.isArray(meta.organizations) ? meta.organizations : (typeof meta.organizations === 'string' ? [meta.organizations] : []);
          const people = Array.isArray(meta.key_people) ? meta.key_people : (typeof meta.key_people === 'string' ? [meta.key_people] : []);
          const authors = Array.isArray(meta.gemini_extracted_metadata?.authors) ? meta.gemini_extracted_metadata.authors : [];
          const geminiOrgs = Array.isArray(meta.gemini_extracted_metadata?.organizations) ? meta.gemini_extracted_metadata.organizations : [];
          const tags = Array.isArray(meta.tags) ? meta.tags : (typeof meta.tags === 'string' ? [meta.tags] : []);
          
          const allPeople = [...people, ...authors];
          const allOrgs = [...orgs, ...geminiOrgs];

          const mentionedIds = [];
          allEntities.forEach(e => {
            const name = e.name.toLowerCase();
            const inOrgs = allOrgs.some(o => typeof o === 'string' && o.toLowerCase() === name);
            const inPeople = allPeople.some(p => typeof p === 'string' && p.toLowerCase() === name);
            const inPub = typeof meta.source_publication === 'string' && meta.source_publication.toLowerCase() === name;
            const inTags = tags.some(t => typeof t === 'string' && t.toLowerCase() === name);
            
            if (inOrgs || inPeople || inPub || inTags) {
              mentionedIds.push(e.id);
            }
          });

          // If the target entity is mentioned in this document, we track its co-occurrences
          if (mentionedIds.includes(targetEntity.id)) {
            mentionedIds.forEach(id => {
              if (id !== targetEntity.id) {
                coOccurrence[id] = (coOccurrence[id] || 0) + 1;
              }
            });
          }
        });

        rechartsNodes.push({ ...targetEntity, isTarget: true });

        const catNodes = {
          organization: { name: 'Organizations', type: 'organization', id: 'cat-org', isCategory: true },
          person: { name: 'Key Figures', type: 'person', id: 'cat-person', isCategory: true },
          publication: { name: 'Publications', type: 'publication', id: 'cat-pub', isCategory: true }
        };

        const catTotals = { organization: 0, person: 0, publication: 0 };
        const entitiesToAdd = [];

        Object.entries(coOccurrence).forEach(([id, count]) => {
          const ent = allEntities.find(e => e.id === id);
          if (ent && catNodes[ent.type]) {
            catTotals[ent.type] += count;
            entitiesToAdd.push({ ...ent, count });
          }
        });

        // Add Category Nodes
        ['person', 'organization', 'publication'].forEach(type => {
          if (catTotals[type] > 0) {
            rechartsNodes.push(catNodes[type]);
            rechartsLinks.push({
              source: 0, // targetEntity is at index 0
              target: rechartsNodes.length - 1,
              value: catTotals[type]
            });
          }
        });

        // Add Co-Entity Nodes (Top 25 to prevent crowding)
        entitiesToAdd.sort((a, b) => b.count - a.count).slice(0, 25).forEach(ent => {
          rechartsNodes.push(ent);
          const entIdx = rechartsNodes.length - 1;
          const catIdx = rechartsNodes.findIndex(n => n.id === `cat-${ent.type}`);
          rechartsLinks.push({
            source: catIdx,
            target: entIdx,
            value: ent.count
          });
        });

      }

      setGraphData({ nodes: rechartsNodes, links: rechartsLinks });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const SankeyNode = ({ x, y, width, height, index, payload, containerWidth }) => {
    let fill = '#ffffff';
    if (payload.isTarget) fill = 'var(--c-goldBright)';
    else if (payload.isCategory) fill = 'var(--c-bgSoft)';
    else if (payload.type === 'person') fill = 'var(--c-gold)';
    else if (payload.type === 'organization') fill = 'var(--c-blue)';
    else if (payload.type === 'publication') fill = 'var(--c-purple)';
    
    const stroke = payload.isCategory ? (
      payload.type === 'person' ? 'var(--c-gold)' : 
      payload.type === 'organization' ? 'var(--c-blue)' : 
      payload.type === 'publication' ? 'var(--c-purple)' : 'none'
    ) : 'none';

    const isOut = x + width > containerWidth / 2;
    
    return (
      <g 
        onClick={() => { if (!payload.isCategory) navigate(payload.url || `/to/${payload.id}`) }} 
        style={{ cursor: payload.isCategory ? 'default' : 'pointer', outline: 'none' }}
        className={payload.isCategory ? '' : 'lux-hover-lift'}
      >
        <rect x={x} y={y} width={Math.max(0, width)} height={Math.max(0, height)} fill={fill} stroke={stroke} strokeWidth={payload.isCategory ? 2 : 0} rx="2" ry="2" />
        <text
          x={isOut ? x - 8 : x + width + 8}
          y={y + height / 2}
          dy="0.35em"
          textAnchor={isOut ? 'end' : 'start'}
          fill="var(--c-textBright)"
          fontSize={payload.isTarget ? "14" : payload.isCategory ? "10" : "11"}
          fontFamily="var(--f-body)"
          fontWeight="bold"
          style={{ pointerEvents: 'none', textTransform: payload.isCategory ? 'uppercase' : 'none', letterSpacing: payload.isCategory ? '0.05em' : 'normal' }}
        >
          {payload.name.length > 40 ? payload.name.substring(0, 40) + '...' : payload.name}
        </text>
      </g>
    );
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--c-goldBright)' }}>Synthesizing Knowledge Graph...</div>;
  }

  if (graphData.nodes.length === 0 || graphData.links.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--c-dim)' }}>No relationships found to graph.</div>;
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--c-bgDeep)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--c-ghost)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Sankey
          width={dimensions.width}
          height={dimensions.height}
          data={graphData}
          node={<SankeyNode containerWidth={dimensions.width} />}
          nodePadding={25}
          margin={{ left: 200, right: 200, top: 40, bottom: 40 }}
          link={{ stroke: 'var(--c-borderMuted)', strokeOpacity: 0.15 }}
        >
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div style={{ background: 'var(--c-bgCard)', border: '1px solid var(--c-gold)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'var(--c-textBright)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                    {data.source ? (
                      <div>
                        <strong>{data.source.name}</strong>
                        <div style={{ margin: '0.4rem 0', color: 'var(--c-dim)', fontSize: '0.8rem' }}>&rarr; links to &rarr;</div>
                        <strong>{data.target.name}</strong>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--c-gold)', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                          {data.type}
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{data.name}</div>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
        </Sankey>
      )}
      
      <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', background: 'rgba(20, 20, 24, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid var(--c-ghost)', padding: '1rem', borderRadius: '8px', pointerEvents: 'none' }}>
        <div style={{ color: 'var(--c-textBright)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Network Key</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--c-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: 10, height: 10, borderRadius: '2px', background: 'var(--c-gold)' }}></span> Key Figure</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: 10, height: 10, borderRadius: '2px', background: 'var(--c-blue)' }}></span> Organization</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: 10, height: 10, borderRadius: '2px', background: 'var(--c-purple)' }}></span> Publication</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: 10, height: 10, borderRadius: '2px', background: 'var(--c-ghost)' }}></span> Document</div>
        </div>
      </div>
      
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(20, 20, 24, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid var(--c-ghost)', padding: '0.8rem 1.2rem', borderRadius: '30px', pointerEvents: 'none', color: 'var(--c-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Click a node to visit
      </div>
    </div>
  );
}
