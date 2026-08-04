import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

// Define the routes we want to prerender (matching router.js valid paths)
const routes = [
  '/',
  '/pathways',
  '/correlations',
  '/pairs',
  '/demographics',
  '/pleasure-gap',
  '/methodology',
  '/numbers',
  '/restoration-journey',
  '/religious-mirrors',
  '/narrative-mirrors',
  '/culture',
  '/observer-lens',
  '/adult-experience',
  '/for-parents',
  '/about',
  '/faq',
  '/the-forward-view',
  '/contact'
];

const distIndexHtmlPath = path.join(distDir, 'index.html');
const originalIndexHtml = fs.readFileSync(distIndexHtmlPath, 'utf8');

// Simple static file server
const server = http.createServer((req, res) => {
  console.log("Incoming request:", req.url);
  // Strip query string
  const urlPath = req.url.split('?')[0];
  const reqPath = urlPath === '/' ? '/index.html' : urlPath;
  let filePath = path.join(distDir, reqPath);
  
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // SPA fallback
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(originalIndexHtml, 'utf-8');
    console.log(`[200] ${req.url} -> (fallback to memory index.html)`);
    return;
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`[500] ${req.url} -> ${filePath}`, err);
      res.writeHead(500);
      res.end(`Error: ${err.code}`);
      return;
    }
    console.log(`[200] ${req.url} -> ${filePath}`);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

const HOST = '127.0.0.1';

server.listen(0, HOST, async () => {
  const PORT = server.address().port;
  console.log(`Starting prerender on port ${PORT}...`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  
  // Set viewport to a reasonable desktop size
  await page.setViewport({ width: 1280, height: 800 });

  for (const route of routes) {
    const url = `http://${HOST}:${PORT}${route}`;
    console.log(`Prerendering ${route}...`);
    
    // Go to page, wait until network is mostly idle
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Ensure React has mounted (wait for the root div to have children)
    await page.waitForFunction(() => document.querySelector('#root').children.length > 0);
    
    // Wait an extra second for any initial D3/GSAP animations to settle visually
    await new Promise(r => setTimeout(r, 1000));

    // Get fully rendered HTML
    let html = await page.evaluate(() => document.documentElement.outerHTML);
    
    // Inject OG image meta tags into the <head>
    const ogImageName = route === '/' ? 'index.png' : `${route.substring(1).replace(/\//g, '-')}.png`;
    const ogImageUrl = `https://circumsurvey.dev/og-images/${ogImageName}`;
    const metaTags = `
      <meta property="og:image" content="${ogImageUrl}" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="${ogImageUrl}" />
    `;
    html = html.replace('</head>', `${metaTags}\n</head>`);

    const finalHtml = `<!DOCTYPE html>\n<html lang="en">\n${html}\n</html>`;

    // Save to dist/route/index.html
    const routeDir = path.join(distDir, route === '/' ? '' : route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(routeDir, 'index.html'), finalHtml, 'utf8');

    // Take screenshot for social media preview
    // Hide UI elements that shouldn't appear in the preview
    await page.addStyleTag({
      content: `
        header, footer, nav, .explore-masthead, .global-footer, .docent-drawer, button { 
          display: none !important; 
        }
        .explore-page-container {
          padding: 0 !important;
          margin: 0 !important;
        }
        body { 
          overflow: hidden !important; 
        }
      `
    });

    // Wait briefly for layout to adjust after hiding elements
    await new Promise(r => setTimeout(r, 200));

    const ogImagesDir = path.join(distDir, 'og-images');
    if (!fs.existsSync(ogImagesDir)) {
      fs.mkdirSync(ogImagesDir, { recursive: true });
    }
    
    await page.screenshot({ path: path.join(ogImagesDir, ogImageName) });
  }

  await browser.close();
  server.close();
  console.log('Prerendering complete!');
});
