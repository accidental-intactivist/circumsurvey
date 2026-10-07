import { generateFriendlySlug } from './slugs';

/**
 * Standardized mapping for how different content types route to the frontend.
 * This allows easy expansion for future media types without refactoring logic.
 */
export const RouteRegistry = {
  archive: {
    types: [
      'pdf', 'newspaper_clipping', 'medical_journal', 'policy_guideline', 
      'legal_document', 'multimedia', 'video', 'audio', 'document', 
      'letter', 'book', 'zine', 'newsletter', 'proceedings', 'report'
    ],
    basePath: '/library',
    defaultActionText: 'View in Document Viewer',
    useFriendlySlug: true
  },
  news: {
    types: [
      'external_news', 'recap', 'essay', 'article', 'internal_news', 
      'press_release', 'blog_post'
    ],
    basePath: '/news',
    defaultActionText: 'Read Full Article',
    useFriendlySlug: false
  },
  collection: {
    types: ['collection', 'exhibition'],
    basePath: '/collections',
    defaultActionText: 'Explore Collection',
    useFriendlySlug: false
  },
  entity: {
    types: ['person', 'organization', 'institution'],
    basePath: '/to',
    defaultActionText: 'View Profile',
    useFriendlySlug: true
  }
};

/**
 * Given any content item from the CMS/API, returns the canonical route and UI text.
 * @param {Object} item - The document or entity item.
 * @param {Object} [metadata] - Optional metadata, parsed from item.metadata_json.
 * @returns {Object} { path, actionText, category, isKnownType }
 */
export function resolveItemRoute(item, metadata = null) {
  if (!item || !item.id) {
    return { path: '#', actionText: 'View Details', category: 'unknown', isKnownType: false };
  }

  const itemType = (item.type || 'document').toLowerCase();
  
  let parsedMeta = metadata;
  if (!parsedMeta && item.metadata_json) {
    try { parsedMeta = JSON.parse(item.metadata_json); } catch(e) {}
  }
  
  for (const [category, config] of Object.entries(RouteRegistry)) {
    if (config.types.includes(itemType)) {
      let finalId = item.id;
      if (config.useFriendlySlug && category !== 'entity') {
         finalId = generateFriendlySlug(item, parsedMeta || {});
      } else if (category === 'entity' && item.slug) {
         finalId = item.slug;
      }
      
      return {
        path: `${config.basePath}/${finalId}`,
        actionText: config.defaultActionText,
        category,
        isKnownType: true
      };
    }
  }

  // Fallback for unknown items (default to internal archive viewer)
  const fallbackId = generateFriendlySlug(item, parsedMeta || {});
  return {
    path: `/library/${fallbackId}`,
    actionText: 'View Document',
    category: 'fallback',
    isKnownType: false
  };
}
