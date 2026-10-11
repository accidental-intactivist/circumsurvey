import React from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import GuideView from './GuideView';
import { queryToParams, paramsToQuery } from '../../lib/guides/dimensions.js';

// Pre-defined shortcut slugs for the interactive guides
const GUIDE_SHORTCUTS = {
  'parents': { relationship: 'expectant-parent' },
  'restoration': { relationship: 'circumcised-man', concerns: 'restoration-guidance' },
  'grief': { relationship: 'circumcised-man', concerns: 'grief-anger' }
};

export default function GuideOrProfile() {
  const params = useParams();
  const location = useLocation();
  const slug = params['*'] || params.id || '';

  const cleanSlug = slug.toLowerCase().trim();

  // If the slug matches a known interactive guide, redirect to /guides/view with the correct params
  // Or, better yet, we can render the GuideView inline and inject the searchParams.
  // To avoid confusing the GuideView which relies heavily on useSearchParams(), 
  // we can just cleanly redirect to the full /guides/view? query so the URL is shareable,
  // OR we can render the GuideView and intercept the router. 
  // Wait, the user specifically wants the URL to remain "intactivist.guide/to/parents".
  // Let's create a custom search string and pass it down.
  
  if (GUIDE_SHORTCUTS[cleanSlug]) {
    // If we want to keep the URL as /to/parents, we need GuideView to not overwrite the URL.
    // However, GuideView reads from useSearchParams() and writes back to it.
    // React Router allows useSearchParams() to work perfectly fine on any route!
    // We just need to make sure the initial render has the parameters.
    // If they aren't in the URL, GuideView will use its defaults.
    
    // Instead of rendering GuideView inline (which will break if the user changes tabs and it writes to the URL),
    // let's do a soft redirect so the state is preserved, or just let them use the shortcut to get there.
    
    // Actually, if they want "/to/parents" to be the canonical URL, we can inject a wrapper 
    // but the easiest is to just redirect to the fully expanded GuideView for now so printing/sharing works,
    // OR we intercept GuideView. 
    
    const config = GUIDE_SHORTCUTS[cleanSlug];
    return <GuideView overrideParams={config} />;
  }

  // Otherwise, treat it as an Entity Profile
  return <ProfilePage />;
}
