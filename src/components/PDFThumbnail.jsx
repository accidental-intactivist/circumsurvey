import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { FileText } from 'lucide-react';

// Configure the worker for react-pdf if not already done
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export default function PDFThumbnail({ url, className = '' }) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={className} style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-bgSoft)', position: 'relative' }}>
      {!success && !error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-dim)' }}>
           <FileText size={32} style={{ opacity: 0.3 }} />
        </div>
      )}
      <React.Suspense fallback={<div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={32} style={{ opacity: 0.3 }} /></div>}>
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
      
      {/* Optional: Add a subtle overlay so it doesn't look like an interactive document but a thumbnail */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, var(--c-bgDeep))', pointerEvents: 'none' }} />
    </div>
  );
}
