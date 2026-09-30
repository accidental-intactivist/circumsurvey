import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Send, FileWarning, Search, ShieldAlert, Loader } from 'lucide-react';

export default function Contact() {
  const { theme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          ...formData
        })
      });

      if (!res.ok) throw new Error('Failed to submit. Please try again later.');
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const getAnalogBandClass = () => {
    if (['vaporwave', 'woz'].includes(theme)) return 'analog-band-neon';
    if (['ocean', 'agnes'].includes(theme)) return 'analog-band-eighties-cool';
    if (['pueblo', 'amber'].includes(theme)) return 'analog-band-pueblo';
    return 'analog-band-seventies';
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
      
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <div className={getAnalogBandClass()} style={{ height: '6px', width: '80px', marginBottom: '2rem', borderRadius: '3px' }} />
        
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '3rem', fontFamily: 'var(--f-display)', letterSpacing: '-0.02em', color: 'var(--c-textBright)' }}>
          Contact & Submissions
        </h1>
        
        <p style={{ color: 'var(--c-text)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '3rem', maxWidth: '600px' }}>
          Get in touch with the archivist, suggest new resources for the digital library, or submit a formal removal request.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { setActiveTab('general'); setSuccess(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: activeTab === 'general' ? 'var(--c-bgDeep)' : 'transparent', border: activeTab === 'general' ? '1px solid var(--c-gold)' : '1px solid var(--c-ghost)', borderRadius: '8px', color: activeTab === 'general' ? 'var(--c-goldBright)' : 'var(--c-text)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <Send size={18} /> General Inquiry
          </button>
          <button 
            onClick={() => { setActiveTab('suggest_resource'); setSuccess(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: activeTab === 'suggest_resource' ? 'var(--c-bgDeep)' : 'transparent', border: activeTab === 'suggest_resource' ? '1px solid var(--c-blue)' : '1px solid var(--c-ghost)', borderRadius: '8px', color: activeTab === 'suggest_resource' ? '#60a5fa' : 'var(--c-text)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <Search size={18} /> Suggest Resource
          </button>
          <button 
            onClick={() => { setActiveTab('removal_request'); setSuccess(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: activeTab === 'removal_request' ? 'var(--c-bgDeep)' : 'transparent', border: activeTab === 'removal_request' ? '1px solid var(--c-tangerine)' : '1px solid var(--c-ghost)', borderRadius: '8px', color: activeTab === 'removal_request' ? 'var(--c-tangerine)' : 'var(--c-text)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <FileWarning size={18} /> Request Removal
          </button>
        </div>

        {/* Form Container */}
        <div className="lux-lens" style={{ padding: '3rem', borderRadius: '16px', border: '1px solid var(--c-ghost)' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ color: 'var(--c-goldBright)', fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
              <h2 style={{ color: 'var(--c-textBright)', margin: '0 0 1rem 0' }}>Request Submitted</h2>
              <p style={{ color: 'var(--c-text)', margin: 0 }}>Thank you. Your message has been forwarded to the archivist for review.</p>
              <button 
                onClick={() => setSuccess(false)}
                style={{ marginTop: '2rem', padding: '0.8rem 1.5rem', background: 'transparent', border: '1px solid var(--c-dim)', borderRadius: '8px', color: 'var(--c-text)', cursor: 'pointer' }}
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {activeTab === 'removal_request' && (
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <ShieldAlert size={24} color="#ef4444" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#ef4444', display: 'block', marginBottom: '0.5rem' }}>DMCA & Privacy Removal Policy</strong>
                    <span style={{ color: 'var(--c-text)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      If you are the copyright holder of a document, or if a document contains sensitive personal identifying information about you (and you are currently living), please provide the exact URL of the document and the legal basis for your removal request below.
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'suggest_resource' && (
                <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <Search size={24} color="#3b82f6" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '0.5rem' }}>Suggest an addition to the library</strong>
                    <span style={{ color: 'var(--c-text)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      We are always looking for historically significant documents, medical journals, or legal records related to genital autonomy. Please provide a link to the resource or describe it in detail below.
                    </span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: 'var(--c-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    style={{ padding: '1rem', background: 'var(--c-bgDeep)', border: '1px solid var(--c-ghost)', borderRadius: '8px', color: 'var(--c-textBright)', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: 'var(--c-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Email</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    style={{ padding: '1rem', background: 'var(--c-bgDeep)', border: '1px solid var(--c-ghost)', borderRadius: '8px', color: 'var(--c-textBright)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--c-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {activeTab === 'removal_request' ? 'Document URL / Title' : activeTab === 'suggest_resource' ? 'Resource Title / Link' : 'Subject'}
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  style={{ padding: '1rem', background: 'var(--c-bgDeep)', border: '1px solid var(--c-ghost)', borderRadius: '8px', color: 'var(--c-textBright)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--c-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {activeTab === 'removal_request' ? 'Reason for Removal Request' : 'Message'}
                </label>
                <textarea 
                  required 
                  rows={6}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  style={{ padding: '1rem', background: 'var(--c-bgDeep)', border: '1px solid var(--c-ghost)', borderRadius: '8px', color: 'var(--c-textBright)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</div>}

              <button 
                type="submit" 
                disabled={loading}
                className="lux-hover-lift"
                style={{ marginTop: '1rem', padding: '1.2rem', background: 'var(--c-textBright)', color: 'var(--c-bg)', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}
              >
                {loading ? <Loader className="animate-spin" size={18} style={{ margin: '0 auto' }} /> : 'Send Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
