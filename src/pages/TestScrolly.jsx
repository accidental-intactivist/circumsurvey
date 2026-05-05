import React, { useState } from 'react';
import ContinuousManSvg from '../components/scrollytelling/ContinuousManSvg';

const TestScrolly = () => {
  const [color, setColor] = useState('#00ffff'); // Default cyan

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '300vh', padding: '2rem' }}>
      <header style={{ position: 'fixed', top: 0, left: 0, padding: '1rem', zIndex: 100, backgroundColor: 'rgba(0,0,0,0.8)', borderBottom: '1px solid #333' }}>
        <h2>Scrollytelling Proof of Concept</h2>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={() => setColor('#00ffff')} style={{ background: '#00ffff', border: 'none', padding: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>Cyan</button>
          <button onClick={() => setColor('#ff00ff')} style={{ background: '#ff00ff', border: 'none', padding: '0.5rem', cursor: 'pointer', color: '#fff', fontWeight: 'bold' }}>Magenta</button>
          <button onClick={() => setColor('#ffffff')} style={{ background: '#ffffff', border: 'none', padding: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>White</button>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>Scroll down to see the GSAP DrawSVG animation in action.</p>
      </header>

      {/* Spacer to force scroll */}
      <div style={{ height: '80vh' }}></div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <ContinuousManSvg color={color} />
      </div>
      
      {/* Spacer to force scroll */}
      <div style={{ height: '80vh' }}></div>
    </div>
  );
};

export default TestScrolly;
