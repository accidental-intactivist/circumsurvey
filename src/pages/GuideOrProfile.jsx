import React from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import GuideView from './GuideView';
import HadachekExhibitPage from './HadachekExhibitPage';
import LegalActionsGuidePage from './LegalActionsGuidePage';
import DiseaseOfTheDecadePage from './DiseaseOfTheDecadePage';
import ReciteBackConsentPage from './ReciteBackConsentPage';
import UsRicRatesPage from './UsRicRatesPage';
import { queryToParams, paramsToQuery } from '../../lib/guides/dimensions.js';

// Pre-defined shortcut slugs for the interactive guides
const GUIDE_SHORTCUTS = {
  'parents': { relationship: 'expectant-parent' },
  'expectant-parents': { relationship: 'expectant-parent' },
  'restoration': { relationship: 'circumcised-man', concerns: 'restoration-guidance' },
  'grief': { relationship: 'circumcised-man', concerns: 'grief-anger' }
};

export default function GuideOrProfile() {
  const params = useParams();
  const location = useLocation();
  const slug = params['*'] || params.id || '';

  const cleanSlug = slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '');

  // US RIC Rates Dossier
  if (
    cleanSlug === 'rates' ||
    cleanSlug === 'us-ric-rates' ||
    cleanSlug === 'us_ric_rates' ||
    cleanSlug === 'ric-rates' ||
    cleanSlug === 'prevalence'
  ) {
    return <UsRicRatesPage />;
  }

  // Form 104-RIC Recite-Back Consent Form
  if (
    cleanSlug === 'consent' ||
    cleanSlug === 'honest-consent' ||
    cleanSlug === 'recite-back' ||
    cleanSlug === 'form-104' ||
    cleanSlug === 'form-104-ric'
  ) {
    return <ReciteBackConsentPage />;
  }

  // Disease of the Decade canonical exhibit
  if (
    cleanSlug === 'disease-of-the-decade' || 
    cleanSlug === 'disease_of_the_decade' || 
    cleanSlug === 'retcons' ||
    cleanSlug === 'disease' ||
    cleanSlug === 'decades'
  ) {
    return <DiseaseOfTheDecadePage />;
  }

  // Landmark legal cases and curated exhibits are not person profiles
  if (cleanSlug === 'hadachek_v_oregon' || cleanSlug === 'hadachek' || cleanSlug === 'hadachek-v-oregon') {
    return <HadachekExhibitPage />;
  }

  if (
    cleanSlug === 'huff_v_colorado' || 
    cleanSlug === 'huff' || 
    cleanSlug === 'huff-v-colorado' ||
    cleanSlug === 'legal' ||
    cleanSlug === 'litigation' ||
    cleanSlug === 'legislative' ||
    cleanSlug === 'legal-actions'
  ) {
    return <LegalActionsGuidePage />;
  }

  // If the slug matches a known interactive guide shortcut
  if (GUIDE_SHORTCUTS[cleanSlug]) {
    const config = GUIDE_SHORTCUTS[cleanSlug];
    return <GuideView overrideParams={config} />;
  }

  // Otherwise, treat it as an Entity Profile
  return <ProfilePage />;
}
