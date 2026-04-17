#!/bin/bash
# ═══════════════════════════════════════════
# CircumSurvey Findings Site — Project Setup
# ═══════════════════════════════════════════
# Run this once after cloning to set up the
# Vite + React development environment.
#
# Prerequisites: Node.js 18+ installed
# Usage: chmod +x setup.sh && ./setup.sh
# ═══════════════════════════════════════════

set -e

echo ""
echo "★ CircumSurvey Findings Site — Setup"
echo "══════════════════════════════════════"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "   Install it from https://nodejs.org (LTS version recommended)"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✓ Node.js ${NODE_VERSION} detected"

# Check if package.json already exists (already initialized)
if [ -f "package.json" ]; then
    echo "✓ package.json exists — running npm install"
    npm install
else
    echo "→ Initializing Vite + React project..."
    
    # Create package.json
    cat > package.json << 'PKGJSON'
{
  "name": "circumsurvey-findings",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "description": "The Accidental Intactivist's Inquiry — Phase 1 Data Explorer",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "aggregate": "python3 scripts/aggregate.py"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0"
  }
}
PKGJSON

    npm install
fi

echo ""
echo "✓ Dependencies installed"
echo ""

# Create vite.config.js if it doesn't exist
if [ ! -f "vite.config.js" ]; then
    cat > vite.config.js << 'VITECONF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
})
VITECONF
    echo "✓ vite.config.js created"
fi

# Create index.html if it doesn't exist
if [ ! -f "index.html" ]; then
    cat > index.html << 'INDEXHTML'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Accidental Intactivist's Inquiry — Phase 1 Findings</title>
    <meta name="description" content="Interactive data explorer for the largest comparative survey of intact, circumcised, and restoring populations ever assembled from lived experience." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Outfit:wght@200;300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700;800&family=Barlow+Condensed:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
INDEXHTML
    echo "✓ index.html created"
fi

# Create src/main.jsx if it doesn't exist
if [ ! -f "src/main.jsx" ]; then
    cat > src/main.jsx << 'MAINJSX'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
MAINJSX
    echo "✓ src/main.jsx created"
fi

# Create placeholder App.jsx
if [ ! -f "src/App.jsx" ]; then
    cat > src/App.jsx << 'APPJSX'
export default function App() {
  return (
    <div style={{
      fontFamily: "'Josefin Sans', sans-serif",
      background: '#faf6f0',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div>
        <div style={{
          height: '5px',
          background: 'linear-gradient(90deg, #e85d50, #f09860, #f0c840, #68b878, #5888c0)',
          width: '200px',
          margin: '0 auto 1.5rem',
          borderRadius: '3px',
        }} />
        <h1 style={{
          fontWeight: 700,
          fontSize: '2rem',
          color: '#2a2622',
          letterSpacing: '0.03em',
          marginBottom: '0.25rem',
        }}>
          ★ Tomorrow's Bureau
        </h1>
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 300,
          fontSize: '0.9rem',
          color: '#888',
        }}>
          CircumSurvey Findings Site — Ready to build.
        </p>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem',
          color: '#bbb',
          marginTop: '1rem',
        }}>
          Run: npm run dev
        </p>
      </div>
    </div>
  )
}
APPJSX
    echo "✓ src/App.jsx created (placeholder)"
fi

# Create global CSS
if [ ! -f "src/styles/globals.css" ]; then
    cat > src/styles/globals.css << 'GLOBALCSS'
/* ═══════════════════════════════════════════
   Tomorrow's Bureau — Global Design System
   CircumSurvey Findings Site
   ═══════════════════════════════════════════ */

:root {
  /* Editorial palette (cream sections) */
  --cream: #faf6f0;
  --cream-dark: #f0ece4;
  --cream-border: #e8e2d8;
  --cream-rule: #d4cfc4;
  --text-dark: #2a2622;
  --text-body: #5a5a52;
  --text-muted: #999;

  /* Bureau palette (dark sections) */
  --bureau-bg: #0e0e10;
  --bureau-card: #18181c;
  --bureau-border: #222228;
  --bureau-text: #eeeef0;
  --bureau-text-sec: #8a8a96;

  /* Accent colors */
  --star-red: #e85d50;
  --warm-orange: #f09860;
  --sunny-yellow: #f0c840;
  --fresh-green: #68b878;
  --calm-blue: #5888c0;
  --gold: #d4a030;

  /* Pathway colors (data visualizations only) */
  --pathway-intact: #5888c0;
  --pathway-circumcised: #e85d50;
  --pathway-restoring: #f0c840;
  --pathway-observer: #a0a0a0;
  --pathway-born-circ: #cc6855;

  /* Rainbow gradient */
  --rainbow: linear-gradient(90deg, var(--star-red), var(--warm-orange), var(--sunny-yellow), var(--fresh-green), var(--calm-blue));

  /* Typography */
  --font-display: 'Josefin Sans', sans-serif;
  --font-body: 'Outfit', sans-serif;
  --font-data: 'JetBrains Mono', monospace;
  --font-label: 'Barlow Condensed', sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  font-weight: 300;
  background: var(--cream);
  color: var(--text-dark);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar styling for dark sections */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
GLOBALCSS
    echo "✓ src/styles/globals.css created"
fi

echo ""
echo "══════════════════════════════════════"
echo "★ Setup complete!"
echo "══════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Place your CSV in data/raw/responses.csv"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:5173"
echo ""
echo "To build with Claude Desktop:"
echo "  - Attach CLAUDE.md to your first message"
echo "  - Reference docs/DESIGN_MOTIF_REFERENCE.html"
echo "    for the Tomorrow's Bureau aesthetic"
echo ""
echo "To build with Claude Code:"
echo "  - Run: claude (in this directory)"
echo "  - It will automatically read CLAUDE.md"
echo ""
