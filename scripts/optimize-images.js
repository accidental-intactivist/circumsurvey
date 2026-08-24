import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.resolve('public');
const FLYERS_DIR = path.join(PUBLIC_DIR, 'flyers');

const images = [
  { path: path.join(FLYERS_DIR, 'recruitment-1.png'), width: 168 },
  { path: path.join(FLYERS_DIR, 'recruitment-2.png'), width: 168 },
  { path: path.join(FLYERS_DIR, 'recruitment-3.jpg'), width: 221 },
  { path: path.join(PUBLIC_DIR, 'tone-headshot.jpg'), width: 84 },
];

async function optimizeImages() {
  for (const img of images) {
    if (!fs.existsSync(img.path)) {
      console.warn(`File not found: ${img.path}`);
      continue;
    }

    const { dir, name } = path.parse(img.path);
    const outPath = path.join(dir, `${name}.webp`);

    try {
      await sharp(img.path)
        .resize(img.width)
        .webp({ quality: 80 })
        .toFile(outPath);
      console.log(`Optimized: ${img.path} -> ${outPath}`);
    } catch (err) {
      console.error(`Error optimizing ${img.path}:`, err);
    }
  }
}

optimizeImages();
