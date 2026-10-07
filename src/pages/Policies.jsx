import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, FileText, Lock, AlertTriangle } from 'lucide-react';

export default function Policies() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('terms');

  const getAnalogBandClass = () => {
    if (['vaporwave', 'woz'].includes(theme)) return 'analog-band-neon';
    if (['ocean', 'agnes'].includes(theme)) return 'analog-band-eighties-cool';
    if (['pueblo', 'amber'].includes(theme)) return 'analog-band-pueblo';
    return 'analog-band-seventies';
  };

  const tabs = [
    { id: 'terms', label: 'Terms of Service', icon: <FileText size={18} /> },
    { id: 'medical', label: 'Medical Disclaimer', icon: <AlertTriangle size={18} /> },
    { id: 'dmca', label: 'Copyright & DMCA', icon: <Shield size={18} /> },
    { id: 'privacy', label: 'Privacy Policy', icon: <Lock size={18} /> }
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
      
      <div style={{ maxWidth: '900px', width: '100%' }}>
        <div className={getAnalogBandClass()} style={{ height: '6px', width: '80px', marginBottom: '2rem', borderRadius: '3px' }} />
        
        <h1 style={{ margin: '0 0 2rem 0', fontSize: '3rem', fontFamily: 'var(--f-display)', letterSpacing: '-0.02em', color: 'var(--c-textBright)' }}>
          Legal & Policies
        </h1>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          
          {/* Sidebar Nav */}
          <div style={{ flex: '0 0 250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.2rem', 
                  background: activeTab === tab.id ? 'var(--c-bgCard)' : 'transparent', 
                  border: '1px solid', borderColor: activeTab === tab.id ? 'var(--c-gold)' : 'transparent', 
                  borderRadius: '8px', 
                  color: activeTab === tab.id ? 'var(--c-goldBright)' : 'var(--c-dim)', 
                  cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', transition: 'all 0.2s'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lux-lens" style={{ flex: '1 1 500px', padding: '3rem', borderRadius: '16px', border: '1px solid var(--c-ghost)' }}>
            
            {activeTab === 'terms' && (
              <div style={{ color: 'var(--c-text)', lineHeight: 1.8 }}>
                <h2 style={{ color: 'var(--c-textBright)', marginTop: 0, fontFamily: 'var(--f-display)' }}>Terms of Service</h2>
                <p><strong>Last Updated:</strong> September 2026</p>
                <p>Welcome to the Intactivism Archive. By accessing or using this website, you agree to be bound by these Terms of Service.</p>
                
                <h3 style={{ color: 'var(--c-goldBright)', marginTop: '2rem' }}>1. Educational and Historical Purpose</h3>
                <p>This website acts strictly as a digital repository and archive for historical documents, medical journals, personal letters, and advocacy materials related to circumcision and genital autonomy. The materials provided are for sociological, historical, and educational research purposes only.</p>
                
                <h3 style={{ color: 'var(--c-goldBright)', marginTop: '2rem' }}>2. Third-Party Content (Section 230)</h3>
                <p>The documents hosted within this archive were authored by third parties. The views, opinions, allegations, and factual claims expressed in these archived documents belong solely to their original authors and do not necessarily reflect the views of the archive operators. Pursuant to Section 230 of the Communications Decency Act (47 U.S.C. § 230), the operators of this site are not the publishers or speakers of any information provided by third-party authors and are immune from civil liability regarding such content.</p>
                
                <h3 style={{ color: 'var(--c-goldBright)', marginTop: '2rem' }}>3. Acceptable Use</h3>
                <p>You may use the Report Builder and Media Lists for personal research and educational purposes. You agree not to use the archive or its AI tools to harass, defame, or generate malicious content against any individual or organization.</p>
              </div>
            )}

            {activeTab === 'medical' && (
              <div style={{ color: 'var(--c-text)', lineHeight: 1.8 }}>
                <h2 style={{ color: 'var(--c-textBright)', marginTop: 0, fontFamily: 'var(--f-display)' }}>Medical Disclaimer</h2>
                <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '2rem' }}>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                    <AlertTriangle size={20} /> NOT MEDICAL ADVICE
                  </strong>
                  The content contained in this archive is provided for historical, sociological, and educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
                </div>
                <p>Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read in this archive.</p>
                <p>The archive contains historical medical journals and documents that may reflect outdated, experimental, or debunked medical practices. The inclusion of these documents is for historical preservation and does not constitute an endorsement of their medical validity or safety.</p>
              </div>
            )}

            {activeTab === 'dmca' && (
              <div style={{ color: 'var(--c-text)', lineHeight: 1.8 }}>
                <h2 style={{ color: 'var(--c-textBright)', marginTop: 0, fontFamily: 'var(--f-display)' }}>Copyright & DMCA Policy</h2>
                <p>The Intactivism Archive operates under the principles of Fair Use (17 U.S.C. § 107) for the purposes of criticism, comment, news reporting, teaching, scholarship, and research. We are a non-commercial educational repository.</p>
                
                <h3 style={{ color: 'var(--c-goldBright)', marginTop: '2rem' }}>Takedown Requests</h3>
                <p>If you are a copyright owner or an agent thereof, and you believe that any content hosted in this archive infringes upon your copyrights, you may submit a notification pursuant to the Digital Millennium Copyright Act ("DMCA") by using our <a href="/contact" style={{ color: 'var(--c-blue)' }}>Removal Request Form</a>.</p>
                
                <p>Please provide the following information:</p>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--c-dim)' }}>
                  <li>Identification of the copyrighted work claimed to have been infringed.</li>
                  <li>Identification of the material that is claimed to be infringing (including the exact URL or Document Title).</li>
                  <li>Your contact information (name, address, telephone number, and email address).</li>
                  <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner.</li>
                </ul>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div style={{ color: 'var(--c-text)', lineHeight: 1.8 }}>
                <h2 style={{ color: 'var(--c-textBright)', marginTop: 0, fontFamily: 'var(--f-display)' }}>Privacy Policy</h2>
                
                <h3 style={{ color: 'var(--c-goldBright)', marginTop: '2rem' }}>1. Information We Collect</h3>
                <p>If you create an account to use the Report Builder, we collect standard authentication information (Name, Email) via our authentication provider, Clerk. We also store the contents of your generated reports and saved Media Lists.</p>
                
                <h3 style={{ color: 'var(--c-goldBright)', marginTop: '2rem' }}>2. Document Redaction Policy (PII)</h3>
                <p>This archive contains historical documents and personal letters. If you are a living individual mentioned in an archived document and you wish to have your Personally Identifiable Information (PII) redacted, please submit a request via our <a href="/contact" style={{ color: 'var(--c-blue)' }}>Removal Request Form</a>. We review these requests on a case-by-case basis, balancing historical integrity with personal privacy rights.</p>
                
                <h3 style={{ color: 'var(--c-goldBright)', marginTop: '2rem' }}>3. Cookies</h3>
                <p>We use local storage and cookies strictly for functional purposes (maintaining your session, saving local media lists, and remembering your theme preferences). We do not use tracking or advertising cookies.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
