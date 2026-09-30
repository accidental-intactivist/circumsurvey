export function generateFriendlySlug(doc, meta) {
  let title = meta?.academic_title || doc.title || 'untitled';
  title = title.toLowerCase()
    .replace(/\.(pdf|mov|mp4|webm|ogg)$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
    
  if (!title) title = 'document';

  const friendlyId = doc.id ? String(doc.id).replace('umass-ms1205-raw-', 'tim-hammond-archive-') : 'unknown';
  return `${title}--${friendlyId}`;
}

export function parseFriendlySlug(routeId) {
  let id = routeId;
  if (routeId.includes('--')) {
    id = routeId.split('--').pop();
  }
  if (id.startsWith('tim-hammond-archive-')) {
    id = id.replace('tim-hammond-archive-', 'umass-ms1205-raw-');
  }
  return id;
}
