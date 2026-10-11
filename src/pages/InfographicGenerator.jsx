import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, Share2, Sparkles, AlertCircle, BarChart2, Globe2, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const THEMES = {
  dark: { bg: '#0f0f14', text: '#ffffff', accent: '#d4a030', secondary: '#9ca3af' },
  light: { bg: '#f9f9f9', text: '#111827', accent: '#d4a030', secondary: '#4b5563' },
  ocean: { bg: '#0a192f', text: '#e6f1ff', accent: '#64ffda', secondary: '#8892b0' }
};

const DATASETS = [
  {
    id: 'pleasure-gap',
    title: 'The 36% Pleasure Gap',
    icon: <BarChart2 size={24} />,
    description: 'Sensory deficit documented in circumcised men.',
    data: {
      stat: '36%',
      headline: 'The Physiological Cost of Routine Cutting',
      subtext: 'A landmark survey reveals a 36% reduction in specific sensory experiences among circumcised men compared to intact peers.',
      source: 'CircumSurvey Phase 1 Findings',
      accentColor: '#e8a44a'
    }
  },
  {
    id: 'global-incidence',
    title: 'The Global Reality',
    icon: <Globe2 size={24} />,
    description: 'How the US compares to the rest of the developed world.',
    data: {
      stat: '70%',
      headline: 'The American Outlier',
      subtext: 'Globally, the vast majority of men are intact. The U.S. remains the only developed country in the world that routinely circumcises male infants for non-religious reasons.',
      source: 'World Health Organization (WHO) Data',
      accentColor: '#5b93c7'
    }
  },
  {
    id: 'medical-consensus',
    title: 'No Medical Justification',
    icon: <AlertCircle size={24} />,
    description: 'The stance of international medical bodies.',
    data: {
      stat: '0',
      headline: 'Major Medical Associations Recommending It',
      subtext: 'No national or international medical association in the world—including the AAP—recommends routine infant circumcision.',
      source: 'KNMG, BMA, RACP Policy Statements',
      accentColor: '#e86868'
    }
  }
];

export default function InfographicGenerator() {
  const [activeDataset, setActiveDataset] = useState(DATASETS[0]);
  const [activeTheme, setActiveTheme] = useState('dark');
  const [isGenerating, setIsGenerating] = useState(false);
  const graphicRef = useRef(null);

  const handleDownload = async () => {
    if (!graphicRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(graphicRef.current, { quality: 1, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `circumsurvey-${activeDataset.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const theme = THEMES[activeTheme];

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', fontFamily: 'var(--f-body)', paddingBottom: '4rem' }}>
      <header style={{ padding: '3rem 2rem 2rem', textAlign: 'center', background: 'var(--c-bg)', borderBottom: '1px solid var(--c-ghost)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--c-goldBright)', fontFamily: 'var(--f-condensed)', fontWeight: 800, letterSpacing: '0.1em' }}>
          <Sparkles size={16} /> SHARE STUDIO
        </div>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '2.5rem', margin: '0 0 1rem 0' }}>Dynamic Infographics</h1>
        <p style={{ color: 'var(--c-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Select a data point below to instantly generate a high-resolution, beautifully branded infographic ready for Instagram, Pinterest, or Twitter.
        </p>
      </header>

      <div style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '350px 1fr', gap: '3rem', alignItems: 'start' }}>
        
        {/* LEFT PANE: Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--f-condensed)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-dim)', marginBottom: '1rem', fontSize: '0.85rem' }}>1. Select Data Point</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {DATASETS.map(ds => (
                <button
                  key={ds.id}
                  onClick={() => setActiveDataset(ds)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    background: activeDataset.id === ds.id ? 'rgba(212,160,48,0.1)' : 'var(--c-bgCard)',
                    border: `1px solid ${activeDataset.id === ds.id ? 'var(--c-goldBright)' : 'var(--c-ghost)'}`,
                    padding: '1rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: activeDataset.id === ds.id ? 'var(--c-goldBright)' : 'var(--c-textBright)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {ds.icon} {ds.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--c-muted)' }}>{ds.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--f-condensed)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-dim)', marginBottom: '1rem', fontSize: '0.85rem' }}>2. Select Theme</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {Object.keys(THEMES).map(tKey => (
                <button
                  key={tKey}
                  onClick={() => setActiveTheme(tKey)}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', textTransform: 'capitalize', fontWeight: 'bold',
                    background: THEMES[tKey].bg, color: THEMES[tKey].text,
                    border: `2px solid ${activeTheme === tKey ? 'var(--c-goldBright)' : 'var(--c-ghost)'}`
                  }}
                >
                  {tKey}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="lux-hover-lift"
              style={{
                width: '100%', padding: '1rem', background: 'var(--c-goldBright)', color: '#000',
                border: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                fontSize: '1.05rem', cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1
              }}
            >
              <Download size={20} />
              {isGenerating ? 'Generating High-Res Image...' : 'Download Image'}
            </button>
          </div>
        </div>

        {/* RIGHT PANE: Canvas Preview */}
        <div style={{ background: 'var(--c-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--c-ghost)', display: 'flex', justifyContent: 'center' }}>
          
          {/* THE CANVAS */}
          <div 
            ref={graphicRef}
            style={{
              width: '1080px', // Standard Instagram Post width
              height: '1080px',
              background: theme.bg,
              color: theme.text,
              padding: '80px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              boxSizing: 'border-box',
              transform: 'scale(0.5)', // Scale down for preview
              transformOrigin: 'top center',
              marginBottom: '-540px' // Compensate for scale
            }}
          >
            {/* Top Branding */}
            <div style={{ position: 'absolute', top: '60px', left: '80px', right: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${theme.secondary}`, paddingBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--f-condensed)', fontWeight: 800, fontSize: '24px', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', background: activeDataset.data.accentColor, borderRadius: '50%' }}></div>
                The Accidental Intactivist
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '20px', color: theme.secondary }}>@circumsurvey</div>
            </div>

            {/* Core Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '40px' }}>
              <div style={{ 
                fontFamily: 'var(--f-display)', 
                fontSize: '240px', 
                fontWeight: 800, 
                lineHeight: 0.8,
                color: activeDataset.data.accentColor,
                letterSpacing: '-0.05em'
              }}>
                {activeDataset.data.stat}
              </div>
              
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '85px', fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
                {activeDataset.data.headline}
              </h2>
              
              <p style={{ fontFamily: 'var(--f-body)', fontSize: '42px', lineHeight: 1.5, color: theme.secondary, maxWidth: '900px', margin: 0 }}>
                {activeDataset.data.subtext}
              </p>
            </div>

            {/* Footer Citation */}
            <div style={{ position: 'absolute', bottom: '60px', left: '80px', display: 'flex', alignItems: 'center', gap: '16px', color: theme.secondary, fontSize: '28px', fontFamily: 'var(--f-condensed)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <LinkIcon size={32} />
              SOURCE: {activeDataset.data.source}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
