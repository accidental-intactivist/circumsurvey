import { useState, useEffect } from 'react';
import { X, Search, Filter, PieChart, Settings } from 'lucide-react';
import { useTelemetry } from '../lib/telemetry';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { trackEvent } = useTelemetry();

  useEffect(() => {
    // Check if the user has seen the modal before
    const hasSeenWelcome = localStorage.getItem('circumsurvey_has_seen_welcome');
    if (!hasSeenWelcome) {
      // Add a slight delay so it doesn't instantly jump scare them on load
      const timer = setTimeout(() => {
        setIsOpen(true);
        trackEvent('welcome_modal_viewed');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [trackEvent]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('circumsurvey_has_seen_welcome', 'true');
    trackEvent('welcome_modal_dismissed');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <style>{`
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .welcome-modal {
          animation: modalEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .welcome-btn:hover { background-color: #2563eb !important; }
      `}</style>
      
      <div className="welcome-modal" style={{
        backgroundColor: '#1a1b1e',
        color: '#e5e7eb',
        borderRadius: '24px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Header / Graphic Area */}
        <div style={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          padding: '40px 32px 32px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button 
            onClick={handleClose}
            style={{ 
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white',
              borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
          
          <h2 style={{ margin: 0, color: 'white', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.02em' }}>
            Welcome to the Data Explorer
          </h2>
          <p style={{ margin: '12px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: 1.5 }}>
            Dive deep into the findings of The Accidental Intactivist's Inquiry.
          </p>
        </div>

        {/* Features List */}
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '12px', borderRadius: '12px' }}>
                <Search size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: 'white' }}>Ask the AI Copilot</h3>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px', lineHeight: 1.5 }}>
                  Use natural language to search the data. Ask questions like "How many respondents felt pressured?"
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', padding: '12px', borderRadius: '12px' }}>
                <Filter size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: 'white' }}>Filter by Demographics</h3>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px', lineHeight: 1.5 }}>
                  Apply filters at the top of the page to see how different cohorts answered the same questions.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '12px' }}>
                <PieChart size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: 'white' }}>Build a Custom Report</h3>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px', lineHeight: 1.5 }}>
                  Click the "+" button next to any chart to add it to your own shareable report.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '12px', borderRadius: '12px' }}>
                <Settings size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: 'white' }}>Customize Your Experience</h3>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px', lineHeight: 1.5 }}>
                  Use the settings menu to change the theme, adjust font sizes, or pause the background animations.
                </p>
              </div>
            </div>
          </div>

          <button 
            className="welcome-btn"
            onClick={handleClose}
            style={{
              width: '100%',
              marginTop: '32px',
              padding: '16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
