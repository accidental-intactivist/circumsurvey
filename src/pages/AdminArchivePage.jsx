import React, { useState, useRef } from 'react';
import './AdminArchivePage.css';

const AdminArchivePage = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [metadata, setMetadata] = useState({
    title: '',
    series: '',
    date: ''
  });
  const [status, setStatus] = useState({ state: 'idle', message: '', details: null });
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus({ state: 'loading', message: 'Uploading and processing document...', details: null });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to ingest document');
      }

      setStatus({ 
        state: 'success', 
        message: data.message,
        details: `R2 URL: ${data.r2_url} | Chunks Vectorized: ${data.chunks_vectorized}`
      });
      setFile(null);
      setMetadata({ title: '', series: '', date: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (error) {
      setStatus({ state: 'error', message: error.message, details: null });
    }
  };

  return (
    <div className="admin-archive-container">
      <div className="admin-header">
        <h1>Archive Ingestion</h1>
        <p>Upload raw PDFs to Cloudflare R2, Gemini OCR, and Vectorize</p>
      </div>

      <div className="glass-panel">
        <form onSubmit={handleSubmit}>
          
          <div 
            className={`dropzone ${isDragging ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
              accept=".pdf,image/*"
            />
            <div className="dropzone-icon">📄</div>
            <p>Drag & drop your document here, or <span className="highlight">click to browse</span></p>
          </div>

          {file && (
            <div className="selected-file">
              <span>{file.name}</span>
              <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Document Title</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              className="glass-input" 
              value={metadata.title}
              onChange={handleInputChange}
              placeholder="e.g. 1994 Awakenings Full Report"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="series">Series</label>
              <input 
                type="text" 
                id="series" 
                name="series" 
                className="glass-input" 
                value={metadata.series}
                onChange={handleInputChange}
                placeholder="e.g. Series 2"
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="date">Date</label>
              <input 
                type="text" 
                id="date" 
                name="date" 
                className="glass-input" 
                value={metadata.date}
                onChange={handleInputChange}
                placeholder="e.g. 1994"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={!file || status.state === 'loading'}
          >
            {status.state === 'loading' ? (
              <><span className="loader"></span> Processing...</>
            ) : 'Upload & Process'}
          </button>
        </form>

        {status.state !== 'idle' && (
          <div className="status-panel">
            <h3 className={status.state === 'error' ? 'status-error' : 'status-success'}>
              {status.state === 'loading' ? 'In Progress...' : status.state === 'error' ? 'Error' : 'Success!'}
            </h3>
            <p>{status.message}</p>
            {status.details && <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>{status.details}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminArchivePage;
