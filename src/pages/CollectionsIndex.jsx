import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Archive, ArrowRight, Library } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function CollectionsIndex() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      let data = [];
      if (!isLocal) {
        const res = await fetch('/api/collections');
        if (res.ok) data = await res.json();
      }
      
      if (!data || data.length === 0) {
        // Fallback or Local mock
        data = [
          {
            id: 'umass-ms-1205',
            slug: 'umass-ms-1205',
            title: 'Tim Hammond Genital Autonomy Archive',
            subtitle: '1971-2023',
            institution: 'UMass Amherst',
            curator: 'SCUA',
            description: "Tim Hammond's pioneering contributions to the genital autonomy movement began in 1989 and includes founding NOHARMM, publishing circumcision harm documentation surveys, and more."
          }
        ];
      }
      setCollections(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ background: 'var(--c-bg)', minHeight: '100vh', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Archive size={24} style={{ color: 'var(--c-goldBright)' }} />
            <span style={{ fontFamily: 'var(--f-condensed)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--c-goldBright)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Special Collections
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '3rem', color: 'var(--c-textBright)', margin: '0 0 1rem 0' }}>
            Archive Exhibits
          </h1>
          <p style={{ color: 'var(--c-muted)', fontSize: '1.1rem', maxWidth: '700px', lineHeight: 1.6 }}>
            Explore curated exhibits and historical materials spanning decades of genital autonomy advocacy.
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'var(--c-dim)' }}>Loading collections...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {collections.map(col => (
              <Link 
                key={col.slug} 
                to={`/collections/${col.slug}`}
                style={{
                  display: 'block',
                  background: 'var(--c-bgCard)',
                  border: '1px solid var(--c-ghost)',
                  borderRadius: '12px',
                  padding: '2rem',
                  textDecoration: 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
                  e.currentTarget.style.borderColor = 'var(--c-border)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--c-ghost)';
                }}
              >
                <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(212, 160, 48, 0.1)', color: 'var(--c-gold)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
                  {col.institution}
                </div>
                
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '1.5rem', color: 'var(--c-textBright)', margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
                  {col.title}
                </h2>
                
                {col.subtitle && (
                  <div style={{ color: 'var(--c-dim)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {col.subtitle}
                  </div>
                )}
                
                <p style={{ color: 'var(--c-text)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {col.description}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-goldBright)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Explore Collection <ArrowRight size={16} />
                </div>
              </Link>
            ))}
            
            {/* Placeholder for future collections */}
            <div style={{
              background: 'transparent',
              border: '1px dashed var(--c-ghost)',
              borderRadius: '12px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--c-dim)'
            }}>
              <Library size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>University of Michigan</h3>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>Digitization & ingestion in progress</p>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
