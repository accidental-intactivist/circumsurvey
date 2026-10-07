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
        .welcome-btn:hover { background-color: var(--c-goldBright, #e8b840) !important; color: var(--c-bgDeep, #050506) !important; }
      `}</style>
      
      <div className="welcome-modal" style={{
        backgroundColor: 'var(--c-bgCard, #18181c)',
        color: 'var(--c-text, #f1f1f1)',
        borderRadius: '4px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
        border: '1px solid var(--c-ghost, #3f3f46)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Header / Graphic Area */}
        <div style={{ 
          padding: '40px 32px 32px',
          textAlign: 'center',
          position: 'relative',
          borderBottom: '1px solid var(--c-ghost, #3f3f46)'
        }}>
          <button 
            onClick={handleClose}
            style={{ 
              position: 'absolute', top: '16px', right: '16px',
              background: 'transparent', border: 'none', color: 'var(--c-dim, #8b8b94)',
              borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
          
          <h2 style={{ margin: 0, color: 'var(--c-gold, #d4a030)', fontSize: '32px', fontWeight: '400', fontFamily: 'var(--f-display, "Playfair Display", serif)' }}>
            Welcome to the Data Explorer
          </h2>
          <p style={{ margin: '16px 0 0 0', color: 'var(--c-dim, #8b8b94)', fontSize: '16px', lineHeight: 1.5, fontFamily: 'var(--f-body, "Barlow", sans-serif)' }}>
            Dive deep into the findings of The Accidental Intactivist's Inquiry.
          </p>
        </div>

        {/* Features List */}
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--c-gold, #d4a030)', marginTop: '2px' }}>
                <Search size={22} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '600', color: 'var(--c-textBright, white)', fontFamily: 'var(--f-body, "Barlow", sans-serif)' }}>Ask the AI Copilot</h3>
                <p style={{ margin: 0, color: 'var(--c-dim, #8b8b94)', fontSize: '15px', lineHeight: 1.5, fontFamily: 'var(--f-body, "Barlow", sans-serif)' }}>
                  Use natural language to search the data. Ask questions like "How many respondents felt pressured?"
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--c-gold, #d4a030)', marginTop: '2px' }}>
                <Filter size={22} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '600', color: 'var(--c-textBright, white)', fontFamily: 'var(--f-body, "Barlow", sans-serif)' }}>Filter by Demographics</h3>
                <p style={{ margin: 0, color: 'var(--c-dim, #8b8b94)', fontSize: '15px', lineHeight: 1.5, fontFamily: 'var(--f-body, "Barlow", sans-serif)' }}>
                  Apply filters at the top of the page to see how different cohorts answered the same questions.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--c-gold, #d4a030)', marginTop: '2px' }}>
                <PieChart size={22} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '600', color: 'var(--c-textBright, white)', fontFamily: 'var(--f-body, "Barlow", sans-serif)' }}>Build a Custom Report</h3>
                <p style={{ margin: 0, color: 'var(--c-dim, #8b8b94)', fontSize: '15px', lineHeight: 1.5, fontFamily: 'var(--f-body, "Barlow", sans-serif)' }}>
                  Click the "+" button next to any chart to add it to your own shareable report.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--c-gold, #d4a030)', marginTop: '2px' }}>
                <Settings size={22} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '600', color: 'var(--c-textBright, white)', fontFamily: 'var(--f-body, "Barlow", sans-serif)' }}>Customize Your Experience</h3>
                <p style={{ margin: 0, color: 'var(--c-dim, #8b8b94)', fontSize: '15px', lineHeight: 1.5, fontFamily: 'var(--f-body, "Barlow", sans-serif)' }}>
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
              padding: '14px',
              backgroundColor: 'transparent',
              color: 'var(--c-gold, #d4a030)',
              border: '1px solid var(--c-gold, #d4a030)',
              borderRadius: '4px',
              fontSize: '15px',
              fontFamily: 'var(--f-condensed, "Barlow Condensed", sans-serif)',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
