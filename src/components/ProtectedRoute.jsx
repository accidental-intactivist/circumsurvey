import React from 'react';
import { useUser, RedirectToSignIn } from '@clerk/clerk-react';

export default function ProtectedRoute({ children, requireCurator }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isLocal) {
    return children;
  }

  if (!isLoaded) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--c-dim)' }}>Authenticating...</div>;
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // If we require Curator access, we check if the user is an admin.
  // For now, we can check publicMetadata.role === 'admin' OR if it's the specific users.
  if (requireCurator) {
    const isCurator = user.publicMetadata?.role === 'admin' || user.publicMetadata?.role === 'curator' || user.emailAddresses.some(e => e.emailAddress.includes('apettit') || e.emailAddress.includes('tim'));
    if (!isCurator) {
      return (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--c-dim)' }}>
          <h2 style={{ color: 'var(--c-textBright)' }}>Access Denied</h2>
          <p>You do not have Curator privileges to access this area.</p>
        </div>
      );
    }
  }

  return children;
}
