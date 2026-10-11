import { useUser } from '@clerk/clerk-react';

/**
 * Mirrors ProtectedRoute's curator check, without redirecting. Used to reveal
 * draft guide modules (e.g. faith modules awaiting community review) to curators.
 */
export function useIsCurator() {
  const { isLoaded, isSignedIn, user } = useUser();
  const isLocal = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if (isLocal) return true;
  if (!isLoaded || !isSignedIn || !user) return false;
  const role = user.publicMetadata?.role;
  return role === 'admin' || role === 'curator'
    || user.emailAddresses.some(e => e.emailAddress.includes('apettit') || e.emailAddress.includes('tim'));
}
