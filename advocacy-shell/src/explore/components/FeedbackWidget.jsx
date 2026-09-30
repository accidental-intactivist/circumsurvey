import { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2 } from 'lucide-react';
import { useTelemetry } from '../lib/telemetry';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { trackEvent } = useTelemetry();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    trackEvent('feedback_submitted', { feedback_text: feedback });
    setIsSubmitted(true);
    
    // Auto-close after a delay
    setTimeout(() => {
      setIsOpen(false);
      // Reset form silently after modal closes
      setTimeout(() => {
        setIsSubmitted(false);
        setFeedback('');
      }, 300);
    }, 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      pointerEvents: 'none' // Let clicks pass through the container
    }}>
      
      {/* Popover Form */}
      {isOpen && (
        <div style={{
          backgroundColor: 'var(--c-bgCard, #18181c)',
          color: 'var(--c-text, #f1f1f1)',
          borderRadius: '2px', // Tomorrow Bureau uses sharp/minimal borders usually, but 8px is fine too. Let's use 8px
          border: '1px solid var(--c-ghost, #3f3f46)',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.8)',
          padding: '24px',
          width: 'calc(100vw - 48px)',
          maxWidth: '320px',
          marginBottom: '16px',
          pointerEvents: 'auto',
          transformOrigin: 'bottom right',
          animation: 'feedbackPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: 'var(--f-body, "Barlow", sans-serif)'
        }}>
          
          <style>{`
            @keyframes feedbackPop {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .feedback-input::placeholder { color: var(--c-dim, #8b8b94); font-style: italic; }
            .feedback-input:focus { outline: none; border-color: var(--c-gold, #d4a030) !important; }
            .feedback-btn { transition: all 0.2s ease; }
            .feedback-btn:hover:not(:disabled) { background-color: var(--c-goldBright, #e8b840) !important; color: var(--c-bgDeep, #050506) !important; }
          `}</style>

          {isSubmitted ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', textAlign: 'center' }}>
              <CheckCircle2 size={48} color="var(--c-gold, #d4a030)" style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '400', fontFamily: 'var(--f-display, "Playfair Display", serif)', color: 'var(--c-textBright, white)' }}>Thank you</h3>
              <p style={{ margin: 0, color: 'var(--c-dim, #8b8b94)', fontSize: '15px' }}>Your perspective is deeply appreciated.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '400', fontFamily: 'var(--f-display, "Playfair Display", serif)', color: 'var(--c-gold, #d4a030)', letterSpacing: '0.02em' }}>Reader Feedback</h3>
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--c-dim, #8b8b94)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>
              
              <textarea
                className="feedback-input"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Did anything in the data surprise you? How does this survey affect your perspective on circumcision? We'd love to hear your thoughts."
                rows={5}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--c-bgSoft, #131316)',
                  border: '1px solid var(--c-ghost, #3f3f46)',
                  borderRadius: '4px',
                  color: 'var(--c-textBright, white)',
                  padding: '12px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '16px',
                  transition: 'border-color 0.2s ease',
                  lineHeight: '1.4'
                }}
              />
              
              <button
                type="submit"
                className="feedback-btn"
                disabled={!feedback.trim()}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: 'var(--c-gold, #d4a030)',
                  border: '1px solid var(--c-gold, #d4a030)',
                  borderRadius: '4px',
                  padding: '10px',
                  fontSize: '14px',
                  fontFamily: 'var(--f-condensed, "Barlow Condensed", sans-serif)',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: feedback.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: feedback.trim() ? 1 : 0.4
                }}
              >
                <Send size={16} />
                Send Feedback
              </button>
            </form>
          )}
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        id="tour-feedback"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: 'var(--c-bgCard, #18181c)',
          color: 'var(--c-gold, #d4a030)',
          border: '1px solid var(--c-ghost, #3f3f46)',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
          pointerEvents: 'auto',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = 'var(--c-gold)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'var(--c-ghost)'; }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

    </div>
  );
}
