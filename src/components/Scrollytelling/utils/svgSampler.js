/**
 * SVG Path Sampler
 * Converts raw SVG 'd' string paths into normalized coordinate arrays
 * for the Kinetic Vectorism engine.
 */

export function samplePathToPoints(pathString, numPoints = 200) {
  // Create an invisible SVG element to use the browser's native geometry API
  const svgNS = "http://www.w3.org/2000/svg";
  const pathEl = document.createElementNS(svgNS, "path");
  pathEl.setAttribute("d", pathString);
  
  const totalLength = pathEl.getTotalLength();
  const points = [];
  
  // Find bounding box to normalize coordinates between 0 and 1
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  
  // First pass: collect points and find bounds
  const rawPoints = [];
  for (let i = 0; i < numPoints; i++) {
    const distance = (i / (numPoints - 1)) * totalLength;
    const pt = pathEl.getPointAtLength(distance);
    rawPoints.push(pt);
    
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }
  
  const width = Math.max(maxX - minX, 0.0001);
  const height = Math.max(maxY - minY, 0.0001);
  
  // Normalizing to aspect ratio aware -0.5 to 0.5 coordinate space
  // This allows the canvas engine to easily scale it up to screen dimensions
  const aspectRatio = width / height;
  
  for (let i = 0; i < numPoints; i++) {
    const pt = rawPoints[i];
    // Normalized 0 to 1
    const nx = (pt.x - minX) / width;
    const ny = (pt.y - minY) / height;
    
    // Shift to center (-0.5 to 0.5) and apply aspect ratio bounds
    // We want the shape centered
    points.push({
      x: (nx - 0.5) * (aspectRatio > 1 ? 1 : aspectRatio),
      y: (ny - 0.5) * (aspectRatio < 1 ? 1 : 1 / aspectRatio)
    });
  }
  
  return points;
}
