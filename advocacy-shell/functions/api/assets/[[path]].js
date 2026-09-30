export async function onRequestGet(context) {
  const { env, params } = context;
  const pathArray = params.path || [];
  let fullPath = pathArray.map(p => decodeURIComponent(p)).join('/');
  
  if (!fullPath.startsWith('documents/') && !fullPath.startsWith('thumbnails/')) {
    fullPath = `documents/${fullPath}`;
  }
  
  if (!env.ARCHIVE_BUCKET) {
    return new Response("R2 bucket binding (ARCHIVE_BUCKET) not found", { status: 500 });
  }
  
  try {
    let object = await env.ARCHIVE_BUCKET.get(fullPath);
    // Fallback for previously ingested files saved with double prefix
    if (!object && fullPath.startsWith('documents/')) {
      object = await env.ARCHIVE_BUCKET.get(`documents/${fullPath}`);
    }

    if (!object) {
      return new Response(`Document not found in the archive: ${fullPath}`, { status: 404 });
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    return new Response(object.body, { headers });
  } catch (error) {
    return new Response(`Error retrieving asset: ${error.message}`, { status: 500 });
  }
}
