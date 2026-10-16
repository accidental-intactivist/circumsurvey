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
      let data = [];
      try {
        const res = await fetch('/api/collections');
        if (res.ok) data = await res.json();
      } catch {
        // Fallback below
      }
      
      if (!data || data.length === 0) {
        // Fallback / Local curated list
        data = [
          {
            id: 'umass-ms-1205',
            slug: 'tim-hammond-archive',
            canonicalSlug: 'umass-ms-1205',
            title: 'The Tim Hammond Genital Autonomy Advocacy Archive',
            subtitle: 'MS 1205 (1971–2023)',
            institution: 'UMass Amherst Special Collections',
            curator: 'Tim Hammond & SCUA',
            featured: true,
            itemCount: '195,000+ records',
            description: "The defining historical collection of the movement. Spanning 53 linear feet and over 195,000 cataloged records, including NOHARMM founding papers, Marilyn Milos / NOCIRC correspondence, and the landmark 1999 AWAKENINGS empirical survey."
          },
          {
            id: 'msu-clippings',
            slug: 'msu-clippings',
            title: 'Changing Men Collection',
            subtitle: 'Historic News Clippings & Periodicals',
            institution: 'Michigan State University',
            curator: 'Samer Daffarini (compiler)',
            featured: false,
            itemCount: 'Thousands of press clippings',
            description: 'An extensive archive of early movement documentation, mainstream news coverage, and talk show clippings capturing public and media sentiment during the formative years of anti-circumcision activism.'
          },
          {
            id: 'published-articles',
            slug: 'published-articles',
            title: 'Curated Published Articles',
            subtitle: 'Medical, Legal, and Academic Journals',
            institution: 'Intactivist Guide Archive',
            curator: 'Tim Hammond',
            featured: false,
            itemCount: 'Seminal Peer-Reviewed Papers',
            description: 'A comprehensive collection of published articles spanning several decades, meticulously compiled by Tim Hammond. Contains critical medical literature, sensory histology studies, and constitutional policy analyses.'
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
              Special Collections & Archival Repositories
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '3rem', color: 'var(--c-textBright)', margin: '0 0 1rem 0' }}>
            Archive Exhibits
          </h1>
          <p style={{ color: 'var(--c-muted)', fontSize: '1.1rem', maxWidth: '700px', lineHeight: 1.6 }}>
            Explore curated exhibits, institutional repositories, and primary source materials spanning decades of genital autonomy advocacy.
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
                  display: 'flex',
                  flexDirection: 'column',
                  background: col.featured 
                    ? 'radial-gradient(circle at top right, rgba(212, 160, 48, 0.12), var(--c-bgCard) 70%)' 
                    : 'var(--c-bgCard)',
                  border: col.featured ? '1.5px solid var(--c-goldBright)' : '1px solid var(--c-ghost)',
                  borderRadius: '16px',
                  padding: '2rem',
                  textDecoration: 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: col.featured ? '0 10px 30px rgba(212, 160, 48, 0.15)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = col.featured 
                    ? '0 16px 40px rgba(212, 160, 48, 0.25)' 
                    : '0 12px 30px rgba(0,0,0,0.15)';
                  e.currentTarget.style.borderColor = col.featured ? 'var(--c-goldBright)' : 'var(--c-border)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = col.featured ? '0 10px 30px rgba(212, 160, 48, 0.15)' : 'none';
                  e.currentTarget.style.borderColor = col.featured ? 'var(--c-goldBright)' : 'var(--c-ghost)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(212, 160, 48, 0.1)', color: 'var(--c-gold)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {col.institution}
                  </div>
                  {col.featured && (
                    <span style={{
                      background: 'var(--c-gold)',
                      color: '#000',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '100px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--f-condensed)'
                    }}>
                      Featured Landmark Archive
                    </span>
                  )}
                </div>
                
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '1.5rem', color: 'var(--c-textBright)', margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
                  {col.title}
                </h2>
                
                {col.subtitle && (
                  <div style={{ color: 'var(--c-goldBright)', fontSize: '0.85rem', fontFamily: 'var(--f-condensed)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '1rem' }}>
                    {col.subtitle} {col.itemCount ? `• ${col.itemCount}` : ''}
                  </div>
                )}
                
                <p style={{ color: 'var(--c-text)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
