import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { FileText } from 'lucide-react';

// Configure the worker for react-pdf if not already done
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

class PDFErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn("PDF thumbnail preview error:", err);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function PDFThumbnail({ url, className = '' }) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const fallbackIcon = (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-dim)' }}>
      <FileText size={32} style={{ opacity: 0.3 }} />
    </div>
  );

  return (
    <div className={className} style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-bgSoft)', position: 'relative' }}>
      {!success && !error && fallbackIcon}
      <PDFErrorBoundary fallback={fallbackIcon}>
        <React.Suspense fallback={fallbackIcon}>
          <Document
            file={url}
            onLoadSuccess={() => setSuccess(true)}
            onLoadError={() => setError(true)}
            loading={null}
            error={<FileText size={32} style={{ opacity: 0.3, color: 'var(--c-dim)' }} />}
          >
            <Page 
              pageNumber={1} 
              height={280} 
              renderTextLayer={false} 
              renderAnnotationLayer={false} 
            />
          </Document>
        </React.Suspense>
      </PDFErrorBoundary>
      
      {/* Optional: Add a subtle overlay so it doesn't look like an interactive document but a thumbnail */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, var(--c-bgDeep))', pointerEvents: 'none' }} />
    </div>
  );
}
