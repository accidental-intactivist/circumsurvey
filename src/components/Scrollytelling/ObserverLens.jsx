import React from 'react';
import { EXHIBIT_DATA } from '../../data_exhibits';
import { PATHWAY } from '../../data';

export default function ObserverLens() {
  const roles = EXHIBIT_DATA.observerRoles;
  const totalObservers = Object.values(roles).reduce((a, b) => a + b, 0);

  return (
    <div style={{ margin: '4rem 0', padding: '2rem', background: 'var(--c-bgCard)', border: `1px solid var(--c-ghost)`, borderRadius: '12px' }}>
      <h3 style={{ 
        fontFamily: 'var(--f-display, serif)', 
        fontSize: '2rem', 
        color: 'var(--c-orange)',
        marginBottom: '0.5rem',
        textAlign: 'center'
      }}>
        The Observer Lens
      </h3>
      <p style={{ textAlign: 'center', color: 'var(--c-muted)', marginBottom: '2rem', fontStyle: 'italic' }}>
        What do the {totalObservers} partners, parents, and medical professionals see from the outside?
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        {Object.keys(roles).map(role => {
          const count = roles[role];
          if (count === 0) return null;
          const pct = Math.round((count / totalObservers) * 100);
          
          return (
            <div key={role} style={{ 
              background: 'rgba(255, 165, 0, 0.1)', 
              border: '1px solid rgba(255, 165, 0, 0.3)',
              padding: '1.5rem',
              borderRadius: '8px',
              minWidth: '200px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--c-textBright)', marginBottom: '0.5rem', fontFamily: 'var(--f-display)' }}>
                {pct}%
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--c-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {role}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--c-dim)', marginTop: '0.5rem' }}>
                n = {count}
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--c-muted)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
          This cohort represents the cultural ecosystem. Their views on the "transparent monster" thesis provide crucial insight into the systemic pressures that sustain routine infant circumcision, long after medical justifications fade.
        </p>
      </div>
    </div>
  );
}
