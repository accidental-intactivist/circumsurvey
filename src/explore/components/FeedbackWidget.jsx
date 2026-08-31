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
          backgroundColor: '#1a1b1e',
          color: '#e5e7eb',
          borderRadius: '16px',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
          padding: '24px',
          width: 'calc(100vw - 48px)',
          maxWidth: '320px',
          marginBottom: '16px',
          pointerEvents: 'auto',
          transformOrigin: 'bottom right',
          animation: 'feedbackPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          
          <style>{`
            @keyframes feedbackPop {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .feedback-input::placeholder { color: #6b7280; }
            .feedback-input:focus { outline: none; border-color: #3b82f6 !important; }
            .feedback-btn { transition: all 0.2s ease; }
            .feedback-btn:hover { background-color: #2563eb !important; }
          `}</style>

          {isSubmitted ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', textAlign: 'center' }}>
              <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Thank you!</h3>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>Your feedback helps us improve.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Send Feedback</h3>
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>
              
              <textarea
                className="feedback-input"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What do you think? Did you find what you were looking for?"
                rows={4}
                style={{
                  width: '100%',
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '12px',
                  fontSize: '14px',
                  resize: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '16px',
                  transition: 'border-color 0.2s ease'
                }}
              />
              
              <button
                type="submit"
                className="feedback-btn"
                disabled={!feedback.trim()}
                style={{
                  width: '100%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: feedback.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: feedback.trim() ? 1 : 0.5
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
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.39)',
          pointerEvents: 'auto',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

    </div>
  );
}
