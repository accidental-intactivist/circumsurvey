import React from 'react';

/**
 * StickyScrollyBlock — Creates a background/foreground split layout.
 * The `stickyContent` (like CIRODotExplorer) remains pinned to the viewport
 * while the `scrollingContent` (narrative text cards) scrolls normally on top.
 */
export default function StickyScrollyBlock({ stickyContent, scrollingContent }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Background Sticky Layer */}
      <div 
        style={{ 
          position: 'sticky', 
          top: 0, 
          height: '100vh', 
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          zIndex: 5, // Above the generic background canvas (0), below the narrative glass cards (10)
        }}
      >
        <div style={{ 
          width: '90%', 
          maxWidth: 1400, 
          height: '80vh', 
          position: 'relative',
        }}>
          {stickyContent}
        </div>
      </div>

      {/* Foreground Scrolling Layer */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10,
        display: 'grid',
        gridTemplateColumns: '1fr minmax(auto, 800px) 1fr',
        pointerEvents: 'none', // Let clicks pass through to the visualization if needed
      }}>
        {/* Left Column Canvas - reserved for background intrigue / negative space */}
        <div />

        {/* Center Content Canvas */}
        <div style={{ 
          width: '100%', 
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 1rem'
        }}>
          {scrollingContent}
        </div>

        {/* Right Column Canvas - reserved for background intrigue / negative space */}
        <div />
      </div>
    </div>
  );
}
