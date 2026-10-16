import React, { useState } from 'react';
import { Layers, ShieldCheck, Feather, Activity, ShieldAlert } from 'lucide-react';
import { FONT } from '../../../styles/tokens';

const STRUCTURES = [
  {
    id: 'ridged-band',
    name: '1. The Ridged Band',
    icon: Activity,
    highlight: 'Dense Mechanoreceptors',
    detail: 'Located at the junction of inner and outer prepuce. Anatomist John Taylor identified this as containing the highest concentration of Meissner’s tactile corpuscles on the male body, specifically tuned to light touch and mechanical sensation.',
    citation: 'Taylor et al., Br J Urol (1996)'
  },
  {
    id: 'glide',
    name: '2. The Gliding Mechanism',
    icon: Layers,
    highlight: 'Frictionless Movement',
    detail: 'The prepuce rolls back upon itself in a dual-layered sleeve, acting like a biological roller bearing. During intercourse, it translates motion into a smooth internal roll, eliminating friction and protecting partner vaginal mucosa from chafing.',
    citation: 'Lakshmanan & Park, J Sex Med (1980)'
  },
  {
    id: 'frenulum',
    name: '3. The Frenulum',
    icon: Feather,
    highlight: 'Fine Erogenous Tether',
    detail: 'A highly innervated triangular tissue band on the ventral surface of the glans, supplied by branches of the perineal nerve. It provides intense erogenous feedback and coordinates contraction reflexes during climax.',
    citation: 'Halata & Munger, Brain Res (1986)'
  },
  {
    id: 'mucosa',
    name: '4. Mucosal Protection',
    icon: ShieldCheck,
    highlight: 'Non-Keratinized Glans Shield',
    detail: 'The glans is an internal organ designed to remain shielded by moist mucosal tissue. After circumcision, continuous abrasive contact with clothing forces the glans to develop a dry, thickened keratin armor, progressively dulling sensation over decades.',
    citation: 'Cold & McGrath, BJU Int (1999)'
  },
  {
    id: 'immune',
    name: '5. Immunological Barrier',
    icon: ShieldAlert,
    highlight: 'Antimicrobial Secretions',
    detail: 'Specialized subpreputial glands and mucosal secretions produce lysozymes, lactoferrin, and secretory IgA, forming an active biological defense against external pathogens while maintaining healthy commensal flora.',
    citation: 'Frenche et al., Lancet Infect Dis'
  }
];

export default function PhysiologicalDiagram() {
  const [activeId, setActiveId] = useState('ridged-band');
  const activeStruct = STRUCTURES.find(s => s.id === activeId) || STRUCTURES[0];

  return (
    <div style={{
      background: 'linear-gradient(180deg, #ffffff 0%, #fbf9f6 100%)',
      border: '1px solid #e2dccf',
      borderRadius: '16px',
      padding: '1.75rem',
      margin: '2rem 0 2.5rem 0',
      boxShadow: '0 6px 24px rgba(31, 37, 35, 0.06)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid #e8e2d5',
        paddingBottom: '1rem'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontFamily: FONT.condensed,
            fontWeight: 800,
            fontSize: '0.74rem',
            color: '#1a5c3a',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '0.25rem'
          }}>
            <Layers size={14} /> Anatomical Overview • 5 Specialized Structures
          </div>
          <h3 style={{
            fontFamily: FONT.display,
            fontSize: '1.35rem',
            color: '#1f2523',
            margin: 0
          }}>
            What Circumcision Physically Excises
          </h3>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#666', fontFamily: FONT.condensed }}>
          Select a structure below
        </span>
      </div>

      {/* Grid of Structure Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.65rem',
        marginBottom: '1.25rem'
      }}>
        {STRUCTURES.map((struct) => {
          const isSelected = struct.id === activeId;
          const Icon = struct.icon;
          return (
            <button
              key={struct.id}
              onClick={() => setActiveId(struct.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: isSelected ? '#1a5c3a' : '#f5f1e8',
                color: isSelected ? '#ffffff' : '#2a3530',
                border: `1px solid ${isSelected ? '#1a5c3a' : '#ded7c7'}`,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease'
              }}
            >
              <Icon size={16} style={{ color: isSelected ? '#ffffff' : '#1a5c3a', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.2 }}>
                  {struct.name}
                </div>
                <div style={{ fontSize: '0.68rem', opacity: isSelected ? 0.85 : 0.65 }}>
                  {struct.highlight}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Structure Explainer Box */}
      <div style={{
        background: '#f7f3ea',
        border: '1px solid #e5dfd3',
        borderRadius: '10px',
        padding: '1.25rem',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
          <h4 style={{
            fontFamily: FONT.display,
            fontSize: '1.15rem',
            color: '#1f2523',
            margin: 0
          }}>
            {activeStruct.name}: <span style={{ color: '#1a5c3a', fontStyle: 'italic' }}>{activeStruct.highlight}</span>
          </h4>
          <span style={{ fontFamily: FONT.mono, fontSize: '0.72rem', color: '#888' }}>
            {activeStruct.citation}
          </span>
        </div>
        <p style={{
          fontFamily: FONT.body,
          fontSize: '0.9rem',
          color: '#444',
          lineHeight: 1.55,
          margin: 0
        }}>
          {activeStruct.detail}
        </p>
      </div>
    </div>
  );
}
