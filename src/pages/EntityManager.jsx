import React, { useState, useEffect } from 'react';
import './AdminArchivePage.css';
import { Check, X, UserPlus, Globe, Star } from 'lucide-react';

export default function EntityManager() {
  const [nominations, setNominations] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ type: 'person', name: '', project_context: '', url: '', image_url: '', stance: '', tagline: '', tags: '' });
  const [activeTab, setActiveTab] = useState('nominations'); // 'nominations', 'active', 'merge'
  const [mergeSource, setMergeSource] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'nominations') {
        const res = await fetch('/api/nominations');
        if (res.ok) setNominations(await res.json());
      } else {
        const res = await fetch('/api/entities');
        if (res.ok) {
          const ents = await res.json();
          // Sort alphabetically by name for easier selection in merge dropdowns
          ents.sort((a, b) => a.name.localeCompare(b.name));
          setEntities(ents);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleNominate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/nominations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ type: 'person', name: '', project_context: '', url: '', image_url: '', stance: '', tagline: '', tags: '' });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`/api/nominations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteEntity = async (id) => {
    if (!confirm('Are you sure you want to delete this active entity?')) return;
    try {
      const res = await fetch(`/api/entities/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMerge = async (e) => {
    e.preventDefault();
    if (!mergeSource || !mergeTarget) return alert("Select both source and target.");
    if (mergeSource === mergeTarget) return alert("Source and Target cannot be the same.");
    if (!confirm('WARNING: This will permanently rewrite document references and DELETE the Source entity. Proceed?')) return;
    
    setIsMerging(true);
    try {
      const sourceEnt = entities.find(e => e.id === mergeSource);
      const targetEnt = entities.find(e => e.id === mergeTarget);
      
      const res = await fetch('/api/entities/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sourceId: mergeSource, sourceName: sourceEnt.name,
          targetId: mergeTarget, targetName: targetEnt.name
        })
      });
      
      if (res.ok) {
        setMergeSource('');
        setMergeTarget('');
        fetchData();
      } else {
        const d = await res.json();
        alert('Error: ' + d.error);
      }
    } catch (e) {
      console.error(e);
      alert('Merge failed.');
    }
    setIsMerging(false);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ color: 'var(--c-goldBright)', margin: '0 0 0.5rem 0' }}>Curator Dashboard: Entities</h1>
          <p style={{ color: 'var(--c-muted)', margin: 0 }}>Review AI and manual nominations before they enter the living archive.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="lux-hover-lift"
          style={{ background: 'var(--c-blue)', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <UserPlus size={18} /> Nominate Entity
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--c-ghost)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('nominations')}
          style={{ padding: '1rem 2rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'nominations' ? '2px solid var(--c-goldBright)' : 'none', color: activeTab === 'nominations' ? 'var(--c-goldBright)' : 'var(--c-dim)', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
        >
          Pending Nominations
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          style={{ padding: '1rem 2rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'active' ? '2px solid var(--c-goldBright)' : 'none', color: activeTab === 'active' ? 'var(--c-textBright)' : 'var(--c-dim)', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
        >
          Active Entities
        </button>
        <button 
          onClick={() => setActiveTab('merge')}
          style={{ padding: '1rem 2rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'merge' ? '2px solid var(--c-goldBright)' : 'none', color: activeTab === 'merge' ? 'var(--c-textBright)' : 'var(--c-dim)', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
        >
          Merge Entities
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--c-dim)', textAlign: 'center', padding: '3rem' }}>Fetching data...</div>
      ) : activeTab === 'nominations' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {nominations.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--c-dim)', fontStyle: 'italic', background: 'var(--c-bgSoft)', borderRadius: '8px' }}>
              The queue is clear! No pending nominations.
            </div>
          )}
          {nominations.map(nom => (
            <div key={nom.id} style={{ background: 'var(--c-bgCard)', border: '1px solid var(--c-borderMuted)', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '2rem', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--c-goldBright)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{nom.type}</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--c-textBright)', fontSize: '1.4rem' }}>{nom.name}</h3>
                {nom.universal_summary && <p style={{ margin: '0 0 0.5rem 0', color: 'var(--c-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>{nom.universal_summary}</p>}
                <p style={{ margin: '0 0 1rem 0', color: 'var(--c-text)', lineHeight: 1.6 }}>{nom.project_context}</p>
                {nom.url && <a href={nom.url} target="_blank" rel="noreferrer" style={{ color: 'var(--c-blue)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}><Globe size={14}/> {nom.url}</a>}
                
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '3px solid var(--c-blue)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--c-blue)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem', fontWeight: 'bold' }}>AI Justification</div>
                  <div style={{ color: 'var(--c-textBright)', fontSize: '0.95rem' }}>{nom.justification}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '150px' }}>
                <button 
                  onClick={() => handleAction(nom.id, 'approve')}
                  className="lux-hover-lift"
                  style={{ background: 'var(--c-green, #10b981)', color: '#000', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Check size={20} /> Approve
                </button>
                <button 
                  onClick={() => handleAction(nom.id, 'reject')}
                  className="lux-hover-lift"
                  style={{ background: 'transparent', color: 'var(--c-red, #ef4444)', border: '1px solid var(--c-red, #ef4444)', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <X size={20} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'active' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {entities.map(e => (
            <div key={e.id} style={{ background: 'var(--c-bgCard)', border: '1px solid var(--c-borderMuted)', borderRadius: '12px', position: 'relative', padding: '1.5rem' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {/* Featured toggle */}
                <button 
                  onClick={async () => {
                    try {
                      await fetch('/api/entities', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: e.id, featured: !e.featured })
                      });
                      fetchData();
                    } catch(err) { console.error(err); }
                  }}
                  title={e.featured ? 'Unfeature' : 'Feature on directory'}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: e.featured ? 'var(--c-goldBright)' : 'var(--c-dim)' }}
                >
                  <Star size={16} fill={e.featured ? 'var(--c-goldBright)' : 'transparent'} />
                </button>
                {/* Delete */}
                <button 
                  onClick={() => handleDeleteEntity(e.id)}
                  style={{ background: 'transparent', color: 'var(--c-red, #ef4444)', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  &times;
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--c-goldBright)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{e.type}</span>
                {/* Inline role selector */}
                <select
                  value={e.stance || ''}
                  onChange={async (ev) => {
                    try {
                      await fetch('/api/entities', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: e.id, stance: ev.target.value })
                      });
                      fetchData();
                    } catch(err) { console.error(err); }
                  }}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '4px' }}
                >
                  <option value="">-- No Badges --</option>
                  <option value="champion">✦ Champion</option>
                  <option value="critic">⚡ Critic</option>
                </select>
              </div>
              <h3 style={{ margin: '0 0 0.3rem 0', color: 'var(--c-textBright)', fontSize: '1.2rem' }}>{e.name}</h3>
              {e.tagline && <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', margin: '0 0 0.5rem', fontStyle: 'italic' }}>{e.tagline}</p>}
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Image URL (Face/Logo)..." 
                  defaultValue={e.image_url || ''} 
                  onBlur={async (ev) => {
                    if (ev.target.value !== (e.image_url || '')) {
                      try {
                        await fetch('/api/entities', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: e.id, image_url: ev.target.value })
                        });
                        // update locally or re-fetch
                        e.image_url = ev.target.value;
                      } catch(err) { console.error(err); }
                    }
                  }}
                  style={{ flex: 1, padding: '0.4rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '4px', fontSize: '0.8rem' }}
                />
              </div>
              {e.universal_summary && <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', margin: '0 0 0.5rem 0', lineHeight: 1.5, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.universal_summary}</p>}
              {e.project_context && <p style={{ color: 'var(--c-text)', fontSize: '0.9rem', margin: '0 0 1rem 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.project_context}</p>}
              {e.url && <a href={e.url} target="_blank" rel="noreferrer" style={{ color: 'var(--c-blue)', fontSize: '0.9rem', textDecoration: 'none' }}>Reference Link &rarr;</a>}
            </div>
          ))}
          {entities.length === 0 && (
            <div style={{ color: 'var(--c-dim)', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', fontStyle: 'italic' }}>
              No active entities found.
            </div>
          )}
        </div>
      ) : activeTab === 'merge' ? (
        <div style={{ background: 'var(--c-bgCard)', border: '1px solid var(--c-borderMuted)', borderRadius: '12px', padding: '2rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', color: 'var(--c-goldBright)' }}>Merge Duplicate Entities</h2>
          <p style={{ color: 'var(--c-dim)', marginBottom: '2rem', lineHeight: '1.5' }}>Select a <strong>Source Entity</strong> to be deleted. All archive documents referencing the Source Entity will be updated to point to the <strong>Target Entity</strong> instead.</p>
          
          <form onSubmit={handleMerge} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: 'var(--c-muted)', marginBottom: '0.5rem', fontWeight: 'bold' }}>1. Source Entity (Will be deleted)</label>
                <select 
                  value={mergeSource} 
                  onChange={e => setMergeSource(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-red, #ef4444)', borderRadius: '4px' }}
                >
                  <option value="">-- Select Source --</option>
                  {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div style={{ color: 'var(--c-dim)', fontSize: '1.5rem' }}>&rarr;</div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: 'var(--c-muted)', marginBottom: '0.5rem', fontWeight: 'bold' }}>2. Target Entity (Will be kept)</label>
                <select 
                  value={mergeTarget} 
                  onChange={e => setMergeTarget(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-green, #10b981)', borderRadius: '4px' }}
                >
                  <option value="">-- Select Target --</option>
                  {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isMerging || !mergeSource || !mergeTarget}
              className="lux-hover-lift"
              style={{ background: 'var(--c-goldBright)', color: '#000', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: isMerging ? 'wait' : 'pointer', opacity: (isMerging || !mergeSource || !mergeTarget) ? 0.5 : 1, marginTop: '1rem' }}
            >
              {isMerging ? 'Merging...' : 'Execute Merge'}
            </button>
          </form>
        </div>
      ) : null}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div style={{ width: '450px', background: 'var(--c-bgCard)', border: '1px solid var(--c-borderMuted)', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ color: 'var(--c-goldBright)', marginTop: 0, fontSize: '1.5rem' }}>Nominate New Entity</h2>
            <p style={{ color: 'var(--c-dim)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>The entity will be added to the pending queue for Curator review.</p>
            <form onSubmit={handleNominate}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'var(--c-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Type</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--c-bgSoft)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '4px' }}
                >
                  <option value="person">Key Figure</option>
                  <option value="organization">Organization</option>
                  <option value="publication">Publication</option>
                  <option value="essay">Essay / Editorial</option>
                  <option value="medical_authority">Medical Authority</option>
                  <option value="policy_statement">Policy Statement</option>
                  <option value="data_correction">Statistical Context / Correction</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'var(--c-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Stance / Badge (Optional)</label>
                <select 
                  value={formData.stance || ''} 
                  onChange={e => setFormData({...formData, stance: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--c-bgSoft)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '4px' }}
                >
                  <option value="">-- Neutral / None --</option>
                  <option value="champion">✦ Champion</option>
                  <option value="critic">⚡ Critic</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'var(--c-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--c-bgSoft)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'var(--c-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Project Context / Intactivist Relevance</label>
                <textarea 
                  value={formData.project_context || ''} 
                  onChange={e => setFormData({...formData, project_context: e.target.value})}
                  placeholder="How does this entity relate to the movement or the data?"
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--c-bgSoft)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '4px', minHeight: '80px', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'var(--c-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tagline (short one-liner)</label>
                <input 
                  type="text" 
                  value={formData.tagline} 
                  onChange={e => setFormData({...formData, tagline: e.target.value})}
                  placeholder="e.g., 'Founder of NOCIRC'"
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--c-bgSoft)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: 'var(--c-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>External URL (Optional)</label>
                <input 
                  type="url" 
                  value={formData.url} 
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  placeholder="https://wikipedia.org/wiki/..."
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--c-bgSoft)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: 'var(--c-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Image URL (Optional)</label>
                <input 
                  type="url" 
                  value={formData.image_url || ''} 
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://example.com/logo.jpg"
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--c-bgSoft)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', color: 'var(--c-muted)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" className="lux-hover-lift" style={{ background: 'var(--c-goldBright)', color: '#000', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Nomination</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
