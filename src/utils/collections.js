export function resolveCollectionName(doc, defaultFallback = 'The Tim Hammond Genital Autonomy Archive') {
  if (!doc) return defaultFallback;

  let subject = typeof doc === 'string' ? doc : (doc.source_collection || doc.collection || 'Uncategorized');

  // Any internal folder or WeTransfer upload names belong to the Tim Hammond Archive
  const sLower = (subject || '').toLowerCase();
  if (
    sLower.includes('wetransfer') ||
    sLower.includes('article-downloads') ||
    sLower.includes('downloads-folder') ||
    sLower.includes('bulk ingest') ||
    sLower === 'uncategorized' ||
    sLower.startsWith('wetransfer_')
  ) {
    return defaultFallback;
  }

  if (subject === 'Bulk Ingest') {
    try {
      const meta = doc.metadata_json ? (typeof doc.metadata_json === 'string' ? JSON.parse(doc.metadata_json) : doc.metadata_json) : {};
      const orgs = meta.gemini_extracted_metadata?.organizations || [];
      const title = meta.gemini_extracted_metadata?.title || doc.title || '';
      const orgStr = orgs.join(' ').toLowerCase();
      const titleStr = title.toLowerCase();
      
      if (orgStr.includes('michigan state') || orgStr.includes('changing men') || titleStr.includes('clipping') || titleStr.includes('newspaper')) {
        return 'MSU Clippings';
      } else if (orgStr.match(/nocirc|noharmm|doc|arc|genital autonomy|attorney|lawyer|human rights|nurses for the rights/i) || titleStr.match(/nocirc|noharmm|doc|arc|newsletter|proceedings/i)) {
        return 'UMass MS 1205';
      } else {
        return defaultFallback;
      }
    } catch (_e) {
      return defaultFallback;
    }
  }
  
  return subject;
}

