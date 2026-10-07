import re

with open('src/pages/DocumentView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_return = '''  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', position: 'relative' }}>
      
      {/* Cinematic Blurred Background */}
      {coverImage && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: '40vh',
          backgroundImage: url(),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(60px) brightness(0.4)',
          opacity: 0.6,
          zIndex: 0,
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: '-webkit-linear-gradient(top, black 50%, transparent 100%)'
        }} />
      )}

      {/* Main Content Area */}
      <div className="lux-glide-in" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        
        <Link to="/library" style={{ color: 'var(--c-textBright)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          <span style={{ fontSize: '1.2rem' }}>&larr;</span> Return to Index
        </Link>

        {/* Hero Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="analog-band-cool" style={{ height: '4px', width: '60px', marginBottom: '2rem', borderRadius: '2px' }} />
          
          <div style={{ color: 'var(--c-goldBright)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            {doc.source_collection}
          </div>
          
          <h1 style={{ margin: '0 0 1rem 0', fontSize: '2.5rem', fontFamily: 'var(--f-display)', letterSpacing: '-0.02em', lineHeight: '1.1', color: 'var(--c-textBright)' }}>
            {getCleanTitle(doc, metadata)}
          </h1>
          
          {metadata.author && (
            <div style={{ color: 'var(--c-text)', fontSize: '1.1rem', marginBottom: '2rem', fontStyle: 'italic' }}>
              by {metadata.author}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ border: '1px solid var(--c-dim)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--c-text)', letterSpacing: '0.05em' }}>
              TYPE: {doc.type.replace('_', ' ').replace(/newspaper clipping/i, 'news article').replace(/other/i, 'document').replace(/^pdf$/i, 'document').toUpperCase()}
            </span>
            <span style={{ border: '1px solid var(--c-dim)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--c-text)', letterSpacing: '0.05em' }}>
              DATE: {metadata.date || 'UNKNOWN'}
            </span>
          </div>
        </div>

        {/* Viewer Section (Moved UP!) */}
        {doc.url && (
          <div style={{ marginBottom: '4rem' }}>
            <div className="lux-lens" style={{ overflow: 'hidden', height: '80vh', display: 'flex', flexDirection: 'column', borderRadius: '12px', border: '1px solid var(--c-ghost)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
              {isPending ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '1rem' }}>??</div>
                  <h2 style={{ color: 'var(--c-goldBright)', margin: '0 0 1rem 0' }}>Physical Document</h2>
                  <p style={{ color: 'var(--c-text)', maxWidth: '500px', margin: '0 0 2rem 0', lineHeight: 1.8 }}>
                    This item is cataloged in the physical Tim Hammond Archive (UMass MS 1205) but has not yet been digitized.
                  </p>
                </div>
              ) : doc.type === 'dataset' ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '1rem' }}>??</div>
                  <h2 style={{ color: 'var(--c-textBright)', margin: '0 0 1rem 0' }}>Interactive SQL Dataset</h2>
                  <p style={{ color: 'var(--c-text)', maxWidth: '500px', margin: '0 0 2rem 0', lineHeight: 1.8 }}>
                    This is a structured qualitative dataset rather than a traditional document.
                  </p>
                  <Link
                    to={doc.url}
                    className="lux-hover-lift"
                    style={{ background: 'var(--c-goldBright)', color: '#000', padding: '1rem 2.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
                  >
                    Launch Interactive Explorer
                  </Link>
                </div>
              ) : (doc.url && doc.url.toLowerCase().endsWith('.pdf')) ? (
                <object 
                  data={doc.url + "#toolbar=0&navpanes=0&scrollbar=0"} 
                  type="application/pdf" 
                  width="100%" 
                  height="100%"
                  style={{ flex: 1, border: 'none', background: '#e0e0e0' }}
                >
                  <div style={{ padding: '4rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--c-text)', marginBottom: '1rem' }}>Your browser does not support inline PDFs.</p>
                    <a href={doc.url} style={{ color: 'var(--c-goldBright)' }}>Click here to download the PDF</a>
                  </div>
                </object>
              ) : mediaUrls.length > 0 || (doc.url && doc.url.match(/\.(jpeg|jpg|gif|png)$/i)) ? (
                <div style={{ flex: 1, background: 'var(--c-bgDeep)', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={mediaUrls[0] || doc.url} 
                    alt={doc.title} 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                  />
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '1rem' }}>??</div>
                  <h2 style={{ color: 'var(--c-textBright)', margin: '0 0 1rem 0' }}>External Source</h2>
                  <p style={{ color: 'var(--c-text)', maxWidth: '400px', margin: 0, lineHeight: 1.6 }}>
                    Inline viewing is not supported. Click the button above to view this content.
                  </p>
                </div>
              )}
            </div>
            
            {doc.url && doc.type !== 'dataset' && (
              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    color: 'var(--c-gold)',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  DOWNLOAD SOURCE FILE &rarr;
                </a>
              </div>
            )}
          </div>
        )}

        {/* Abstract & Metadata (Moved Down) */}
        <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 500px' }}>
            <div className="lux-lens" style={{ padding: '2.5rem', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--c-textBright)', fontSize: '1.4rem', letterSpacing: '0.05em' }}>Abstract & Description</h3>
              <p style={{ color: 'var(--c-text)', lineHeight: '1.8', margin: 0, fontSize: '1.1rem' }}>
                {metadata.abstract || metadata.description || "No abstract or description is available for this document in the archive."}
              </p>
              
              {/* Added Metadata fields if available */}
              {metadata.organizations && metadata.organizations.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <h4 style={{ color: 'var(--c-dim)', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>Organizations Mentioned</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {metadata.organizations.map(o => (
                      <span key={o} style={{ background: 'var(--c-bgDeep)', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--c-text)' }}>{o}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Optional Sidebar for Cover Image if it exists */}
          {coverImage && (
            <div style={{ flex: '0 0 350px' }} className="mobile-only-full-width">
              <div style={{
                width: '100%',
                aspectRatio: '3/4',
                borderRadius: '8px',
                backgroundImage: url(),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)'
              }} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
'''

start_idx = content.find('  return (')
if start_idx != -1:
    new_content = content[:start_idx] + new_return
    with open('src/pages/DocumentView.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced return block in DocumentView.jsx successfully.")
else:
    print("Failed to find '  return ('")
