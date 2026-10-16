import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useLocation } from 'react-router-dom';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Maximize, RotateCw } from 'lucide-react';
import ThinkingSpirograph from './ThinkingSpirograph';

class PDFErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("PDFErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'var(--c-red)', padding: '3rem', fontFamily: 'var(--f-condensed)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
          <h2>Failed to load PDF viewer</h2>
          <p style={{ color: 'var(--c-muted)', fontSize: '0.9rem', textTransform: 'none', letterSpacing: 'normal' }}>
            {this.state.error?.message || "The PDF could not be loaded or was not found."}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Configure the worker for react-pdf with polyfills for engines missing modern TC39 features
const rawWorkerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
try {
  const workerBlob = new Blob([
    `if (typeof Uint8Array !== 'undefined') {
      if (!Uint8Array.prototype.toHex) {
        Uint8Array.prototype.toHex = function() {
          return Array.from(this).map(b => b.toString(16).padStart(2, '0')).join('');
        };
      }
      if (!Uint8Array.fromHex) {
        Uint8Array.fromHex = function(hex) {
          const bytes = new Uint8Array(hex.length / 2);
          for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
          }
          return bytes;
        };
      }
    }
    if (typeof Map !== 'undefined') {
      if (!Map.prototype.getOrInsertComputed) {
        Map.prototype.getOrInsertComputed = function(key, callback) {
          if (this.has(key)) return this.get(key);
          const val = callback(key);
          this.set(key, val);
          return val;
        };
      }
      if (!Map.prototype.getOrInsert) {
        Map.prototype.getOrInsert = function(key, defaultValue) {
          if (this.has(key)) return this.get(key);
          this.set(key, defaultValue);
          return defaultValue;
        };
      }
    }
    if (typeof Promise !== 'undefined' && !Promise.withResolvers) {
      Promise.withResolvers = function() {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        return { promise, resolve, reject };
      };
    }
    import ${JSON.stringify(rawWorkerUrl)};`
  ], { type: 'text/javascript' });
  pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
} catch (e) {
  pdfjs.GlobalWorkerOptions.workerSrc = rawWorkerUrl;
}

export default function CustomPDFViewer({ url, onPageCount }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [darkMode, setDarkMode] = useState(false);
  const [rotation, setRotation] = useState(0);
  const containerRef = React.useRef(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const targetPage = (!isNaN(pageParam) && pageParam > 0) ? pageParam : 1;
  const highlightText = searchParams.get('highlight') || '';

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    const startPage = Math.min(Math.max(1, targetPage), numPages || 1);
    setPageNumber(startPage);
    if (onPageCount) onPageCount(numPages);
    
    if (highlightText) {
      setTimeout(() => {
        try {
          window.find(highlightText.substring(0, 50));
        } catch(e) {}
      }, 1000);
    }
  }

  React.useEffect(() => {
    if (targetPage && numPages) {
      setPageNumber(Math.min(Math.max(1, targetPage), numPages));
    }
  }, [targetPage, numPages]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bgDeep)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--c-ghost)' }}>
      {highlightText && (
        <div style={{ padding: '0.75rem', background: 'var(--c-gold)', color: '#000', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 10 }}>
          Searching for Context: "{highlightText.length > 60 ? highlightText.substring(0, 60) + '...' : highlightText}"
          <br/>
          <span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>(Use Ctrl+F / Cmd+F to locate this passage)</span>
        </div>
      )}

      {/* Floating Glassmorphic Toolbar */}
      <div style={{ 
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '0.5rem 1rem', 
        display: 'flex', 
        gap: '1.5rem',
        alignItems: 'center', 
        background: 'rgba(20, 20, 24, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '100px',
        color: 'var(--c-textBright)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--c-muted)', fontFamily: 'var(--f-condensed)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {numPages ? `${numPages} Pgs` : 'Loading'}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="lux-hover-lift" style={{ background: 'var(--c-bgSoft)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>-</button>
          <span style={{ fontSize: '0.85rem', color: 'var(--c-textBright)', fontFamily: 'var(--f-condensed)', minWidth: '40px', textAlign: 'center', fontWeight: 'bold' }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="lux-hover-lift" style={{ background: 'var(--c-bgSoft)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>+</button>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--c-ghost)' }} />

        <button 
          onClick={() => setDarkMode(d => !d)} 
          className="lux-hover-lift" 
          style={{ background: darkMode ? 'var(--c-goldBright)' : 'var(--c-bgSoft)', color: darkMode ? '#000' : 'var(--c-textBright)', border: '1px solid var(--c-ghost)', padding: '0.3rem 0.8rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s' }}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        <div style={{ width: '1px', height: '20px', background: 'var(--c-ghost)' }} />

        <button 
          onClick={() => setRotation(r => (r + 90) % 360)}
          className="lux-hover-lift" 
          style={{ background: 'transparent', color: 'var(--c-textBright)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          title="Rotate 90 degrees"
        >
          <RotateCw size={18} />
        </button>

        <button 
          onClick={toggleFullscreen}
          className="lux-hover-lift" 
          style={{ background: 'transparent', color: 'var(--c-textBright)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          title="Toggle Fullscreen"
        >
          <Maximize size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem', background: 'var(--c-bg)', paddingBottom: '6rem' }}>
        <PDFErrorBoundary>
          <React.Suspense fallback={<div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--c-muted)', fontFamily: 'var(--f-mono)' }}><ThinkingSpirograph size={40} text={null} /><div>Loading PDF Engine...</div></div>}>
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--c-gold)', fontFamily: 'var(--f-condensed)', textTransform: 'uppercase', letterSpacing: '0.1em' }}><ThinkingSpirograph size={60} text={null} /><div>Loading PDF...</div></div>}
              error={<div style={{ color: 'var(--c-red)', padding: '3rem', fontFamily: 'var(--f-condensed)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Failed to load PDF.</div>}
            >
              {numPages && Array.from(new Array(numPages), (el, index) => (
                <div 
                  key={`page_${index + 1}`} 
                  style={{ 
                    marginBottom: '2.5rem', 
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    filter: darkMode ? 'invert(0.9) hue-rotate(180deg) brightness(1.2)' : 'none'
                  }}
                >
                  <Page 
                    pageNumber={index + 1} 
                    scale={scale} 
                    rotate={rotation}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="lux-pdf-page"
                  />
                </div>
              ))}
            </Document>
          </React.Suspense>
        </PDFErrorBoundary>
      </div>
    </div>
  );
}
