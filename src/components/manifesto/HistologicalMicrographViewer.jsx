import React, { useState } from 'react';
import { 
  Microscope, 
  ZoomIn, 
  X, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  Info, 
  ChevronRight, 
  Download,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { FONT } from '../../styles/tokens';

export const HISTOLOGICAL_SPECIMENS = [
  {
    id: 'c892f9e896c84a4c',
    title: 'Penile Innervation & Frenular Delta Schematic',
    shortTitle: 'Innervation & Frenular Delta',
    category: 'Anatomical Mapping',
    citation: 'Cepeda-Emiliani et al. (2025), Andrology',
    stains: ['Macroscopic Neuroanatomy', 'Dorsal Nerve Branches', 'Frenular Delta', 'Ridged Band'],
    summary: 'Composite anatomical illustration showing neural trajectories: ventrolateral branches of the dorsal nerve, intraspongiosal nerves, and dense convergence at the frenular delta and preputial ridged band.',
    clinicalSignificance: 'Demonstrates the rich arborization of sensory branches terminating specifically in the tissue excised during routine circumcision.',
    src: '/figures/c892f9e896c84a4c.webp'
  },
  {
    id: '8d5a920fe2bd9c7d',
    title: 'Immunohistochemistry: S100, CD56, PGP9.5 & PAN-TRK',
    shortTitle: 'Schwann & Neural Bundles',
    category: 'Immunohistochemistry',
    citation: 'Cepeda-Emiliani et al. (2025), Andrology',
    stains: ['S100 (Schwann Cells)', 'CD56 (Axons)', 'PAN-TRK', 'NGFR', 'PGP9.5'],
    summary: 'Panels A–J demonstrate dense peripheral nerve bundles, Schwann cell sheaths (S100), intraepithelial nerve fibers (CD56), and high-density sensory receptors.',
    clinicalSignificance: 'Proves high metabolic neural presence in distal mucocutaneous tissue. S100 and CD56 stains refute claims that the prepuce is merely passive redundant dermis.',
    src: '/figures/8d5a920fe2bd9c7d.webp'
  },
  {
    id: '0bce81d4b2f610e3',
    title: 'Fetal & Perinatal Nerve Architecture (NF / SOX10 / CD56)',
    shortTitle: 'Serial Neurofilament Stains',
    category: 'Confocal & Dual Stain',
    citation: 'Cepeda-Emiliani et al. (2025), Andrology',
    stains: ['Neurofilament (NF)', 'SOX10 (Schwann Cells)', 'CD56 (NCAM)', 'GAP-43'],
    summary: 'High-power dual-stain panels showing neurofilament (brown) and SOX10 (magenta) displaying nerve fibers traversing adjacent to the tunica albuginea and subepithelial stroma.',
    clinicalSignificance: 'Confirms that peripheral innervation is structurally complete, mature, and actively functional at the time routine infant surgeries are performed.',
    src: '/figures/0bce81d4b2f610e3.webp'
  },
  {
    id: '48ab95770483e073',
    title: 'Subepithelial & Dermal Sensory Nerve Networks',
    shortTitle: 'Subepithelial Networks',
    category: 'Histology',
    citation: 'Cepeda-Emiliani et al. (2025), Andrology',
    stains: ['S100', 'CD56', 'PGP9.5', 'NGFR'],
    summary: 'Panels A–H showing high-magnification immunoreactivity along the dermal and subepithelial boundary, highlighting fine-touch sensory nerve arborization.',
    clinicalSignificance: 'Highlights the delicate sensory web right beneath the mucosal surface, which transduces shear stress, gliding displacement, and subtle mechanosensory touch.',
    src: '/figures/48ab95770483e073.webp'
  },
  {
    id: '0e26b020c7876475',
    title: 'Frenular & Coronal Innervation Cross-Sections',
    shortTitle: 'Frenular Cross-Sections',
    category: 'Immunohistochemistry',
    citation: 'Cepeda-Emiliani et al. (2025), Andrology',
    stains: ['NGFR', 'D2-40 (Lymphatics)', 'Collagen IV (Basement)'],
    summary: 'Detailed micrographs examining frenular nerve bundles, intraepithelial nerve endings, and microvascular architecture at 2 mm down to 100 µm resolution.',
    clinicalSignificance: 'Shows why the frenulum and adjacent mucosal collar represent the apex of erogenous sensitivity, frequently severed or scarred during clamping procedures.',
    src: '/figures/0e26b020c7876475.webp'
  },
  {
    id: 'edd5e6e267a419cb',
    title: 'Ontogenetic Progression of Penile Innervation',
    shortTitle: 'Developmental Timeline',
    category: 'Developmental Biology',
    citation: 'Cepeda-Emiliani et al. (2025), Andrology',
    stains: ['Ontogenetic Stages A–D', 'Pre-corpuscular to Corpuscular Transition'],
    summary: 'Schematic illustrating progressive elongation of sensory fibers along the developing phallus and prepuce leading to mature encapsulated sensory corpuscle distribution.',
    clinicalSignificance: 'Illustrates that natural genital development culminates in a unified, interconnected sensory apparatus that infant surgery prematurely fragments.',
    src: '/figures/edd5e6e267a419cb.webp'
  }
];

export default function HistologicalMicrographViewer({ initialSpecimenIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(initialSpecimenIndex);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const activeSpecimen = HISTOLOGICAL_SPECIMENS[activeIndex] || HISTOLOGICAL_SPECIMENS[0];

  return (
    <section 
      className="histological-micrograph-viewer"
      style={{
        margin: '2.5rem 0',
        borderRadius: '16px',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 29, 0.98) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.08)',
        overflow: 'hidden'
      }}
    >
      {/* Header Bar */}
      <div style={{
        padding: '1.25rem 1.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(56, 189, 248, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8'
          }}>
            <Microscope size={20} />
          </div>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#38bdf8',
              fontWeight: 800
            }}>
              <span>PEER-REVIEWED HISTOLOGY LABORATORY</span>
              <span>•</span>
              <span>ANDROLOGY (2025)</span>
            </div>
            <h3 style={{
              fontFamily: FONT.display,
              fontSize: '1.2rem',
              color: '#f8fafc',
              margin: '0.2rem 0 0',
              fontWeight: 700
            }}>
              Immunohistochemical & Neural Mapping Gallery
            </h3>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{
            fontSize: '0.72rem',
            fontFamily: 'JetBrains Mono, monospace',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#7dd3fc'
          }}>
            Specimen {activeIndex + 1} of {HISTOLOGICAL_SPECIMENS.length}
          </span>
          <button
            onClick={() => setIsLightboxOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ZoomIn size={13} />
            <span>Examine Specimen</span>
          </button>
        </div>
      </div>

      {/* Specimen Navigation Tabs */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        background: 'rgba(10, 15, 29, 0.6)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '0.5rem 1rem',
        gap: '0.5rem'
      }}>
        {HISTOLOGICAL_SPECIMENS.map((specimen, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={specimen.id}
              onClick={() => setActiveIndex(idx)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                background: isActive ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isActive ? '#38bdf8' : 'rgba(148, 163, 184, 0.4)'
              }} />
              {specimen.shortTitle}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
        gap: '1.5rem',
        padding: '1.75rem',
        alignItems: 'start'
      }}>
        {/* Left: Micrograph Stage with Zoom affordance */}
        <div style={{
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#020617',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '340px'
        }}>
          <img 
            src={activeSpecimen.src} 
            alt={activeSpecimen.title}
            onClick={() => setIsLightboxOpen(true)}
            style={{
              maxWidth: '100%',
              maxHeight: '440px',
              objectFit: 'contain',
              display: 'block',
              cursor: 'zoom-in',
              transition: 'transform 0.3s ease'
            }}
            loading="lazy"
          />

          {/* Overlay Tag */}
          <div style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '6px',
            padding: '0.3rem 0.6rem',
            fontSize: '0.68rem',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Layers size={11} color="#38bdf8" />
            <span>ID: {activeSpecimen.id}</span>
          </div>

          {/* Click to inspect affordance */}
          <div 
            onClick={() => setIsLightboxOpen(true)}
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              right: '0.75rem',
              background: 'rgba(2, 6, 23, 0.85)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '6px',
              padding: '0.3rem 0.65rem',
              fontSize: '0.7rem',
              color: '#38bdf8',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <ZoomIn size={12} />
            <span>Click to Magnify</span>
          </div>
        </div>

        {/* Right: Scientific Analysis & Stains */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.7rem',
              fontFamily: 'JetBrains Mono, monospace',
              color: '#38bdf8',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.35rem'
            }}>
              <span>{activeSpecimen.category}</span>
              <span>//</span>
              <span>{activeSpecimen.citation}</span>
            </div>

            <h4 style={{
              fontFamily: FONT.display,
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 0.5rem',
              lineHeight: 1.3
            }}>
              {activeSpecimen.title}
            </h4>

            <p style={{
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: '#cbd5e1',
              margin: 0
            }}>
              {activeSpecimen.summary}
            </p>
          </div>

          {/* Stains & Markers Pills */}
          <div>
            <div style={{
              fontSize: '0.7rem',
              fontFamily: 'JetBrains Mono, monospace',
              color: '#94a3b8',
              textTransform: 'uppercase',
              marginBottom: '0.4rem'
            }}>
              Targeted Neural & Histological Markers:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {activeSpecimen.stains.map((stain, sIdx) => (
                <span 
                  key={sIdx}
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    color: '#bae6fd'
                  }}
                >
                  {stain}
                </span>
              ))}
            </div>
          </div>

          {/* Clinical Significance Callout */}
          <div style={{
            padding: '1rem',
            borderRadius: '10px',
            background: 'rgba(212, 160, 48, 0.08)',
            borderLeft: '3px solid #d4a030',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#facc15',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <Info size={13} />
              <span>Anatomical Truth vs. Cultural Denial</span>
            </div>
            <p style={{
              fontSize: '0.85rem',
              lineHeight: 1.5,
              color: '#e2e8f0',
              margin: 0
            }}>
              {activeSpecimen.clinicalSignificance}
            </p>
          </div>

          {/* The Core Question Refrain */}
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.82rem',
            color: '#94a3b8',
            fontStyle: 'italic',
            lineHeight: 1.5
          }}>
            &ldquo;Why isn&rsquo;t this weird to more of us, given that routine infant surgery excises this exact, densely innervated mucocutaneous tissue before the individual can ever consent?&rdquo;
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.94)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Toolbar */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
                SPECIMEN INSPECTOR // {activeSpecimen.citation}
              </div>
              <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: '0.2rem 0 0', fontFamily: FONT.display }}>
                {activeSpecimen.title}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <a
                href={activeSpecimen.src}
                download={`${activeSpecimen.id}.webp`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                <Download size={13} />
                <span>Save High-Res</span>
              </a>

              <button
                onClick={() => setIsLightboxOpen(false)}
                style={{
                  padding: '0.45rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer'
                }}
                title="Close Lightbox"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Full Screen Viewport */}
          <div 
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              cursor: 'zoom-out'
            }}
          >
            <img 
              src={activeSpecimen.src} 
              alt={activeSpecimen.title}
              style={{
                maxWidth: '94vw',
                maxHeight: '78vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Bottom Caption */}
          <div 
            style={{
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              maxWidth: '900px',
              margin: '0 auto',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: '#cbd5e1',
              lineHeight: 1.5
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {activeSpecimen.summary}
          </div>
        </div>
      )}
    </section>
  );
}
