import React from 'react';

export default function VintageArt() {
  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-20 pointer-events-none" style={{ zIndex: 0 }}>
      <div className="w-3/4 h-3/4 border-4 border-dashed border-[var(--text-primary)] rounded-lg flex items-center justify-center">
        <span className="text-[var(--text-primary)] font-serif text-2xl">
          [1970s Pee Chee Line Art Placeholder]
        </span>
      </div>
    </div>
  );
}
