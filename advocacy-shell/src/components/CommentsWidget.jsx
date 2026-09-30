import React, { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';

export default function CommentsWidget({ docId, title }) {
  const { user, isSignedIn } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [docId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?doc_id=${encodeURIComponent(docId)}`);
      if (res.ok) {
        setComments(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch comments", e);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_id: docId,
          user_id: user.id,
          user_name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Anonymous',
          comment: newComment
        })
      });

      if (res.ok) {
        setNewComment('');
        setStatusMsg("Your comment has been submitted and is pending moderation.");
        setTimeout(() => setStatusMsg(''), 5000);
      } else {
        setStatusMsg("Failed to submit comment.");
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("An error occurred.");
    }
  };

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--c-ghost)', paddingTop: '2rem' }}>
      <h3 style={{ color: 'var(--c-textBright)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <MessageSquare size={20} /> Discussion {comments.length > 0 ? `(${comments.length})` : ''}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        {loading ? (
          <div style={{ color: 'var(--c-dim)' }}>Loading discussion...</div>
        ) : comments.length === 0 ? (
          <div style={{ color: 'var(--c-dim)', fontStyle: 'italic' }}>No comments yet. Start the conversation!</div>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{ background: 'var(--c-bgSoft)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--c-borderMuted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--c-goldBright)' }}>{c.user_name}</strong>
                <span style={{ color: 'var(--c-dim)', fontSize: '0.85rem' }}>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p style={{ margin: 0, color: 'var(--c-text)', lineHeight: 1.6 }}>{c.comment}</p>
            </div>
          ))
        )}
      </div>

      <div style={{ background: 'var(--c-bgDeep)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--c-ghost)' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--c-textBright)' }}>Leave a comment</h4>
        {isSignedIn ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea 
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts or historical context..."
              rows={4}
              required
              style={{ padding: '1rem', background: 'var(--c-bg)', border: '1px solid var(--c-ghost)', borderRadius: '6px', color: 'var(--c-text)', fontFamily: 'inherit', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--c-green)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {statusMsg && <><Clock size={16} /> {statusMsg}</>}
              </span>
              <button 
                type="submit" 
                className="lux-hover-lift"
                style={{ background: 'var(--c-blue)', color: '#000', fontWeight: 'bold', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer' }}
              >
                Submit Comment
              </button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--c-bgSoft)', borderRadius: '6px' }}>
            <p style={{ color: 'var(--c-text)', marginBottom: '1rem' }}>You must be signed in to participate in the discussion.</p>
            <SignInButton mode="modal">
              <button style={{ background: 'var(--c-gold)', color: '#000', fontWeight: 'bold', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                Sign In to Comment
              </button>
            </SignInButton>
          </div>
        )}
      </div>
    </div>
  );
}
