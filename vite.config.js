import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function findingsApiProxyPlugin() {
  return {
    name: 'findings-api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/findings-api')) {
          const targetUrl = 'https://findings.circumsurvey.online/api' + req.url.replace('/findings-api', '');
          try {
            const resp = await fetch(targetUrl);
            res.statusCode = resp.status;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            const buf = await resp.arrayBuffer();
            res.end(Buffer.from(buf));
          } catch (err) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), findingsApiProxyPlugin()],
  server: {
    proxy: {
      '/api/': {
        target: 'https://advocacy-shell.pages.dev',
        changeOrigin: true,
        secure: false
      }
    },
    watch: {
      ignored: ['**/pipeline_staging/**']
    }
  },
  resolve: {
    alias: {
      '@empire/ui': path.resolve(__dirname, '../circumsurvey/src/explore/components'),
      '@empire/styles': path.resolve(__dirname, '../circumsurvey/src/styles')
    },
    dedupe: ['react', 'react-dom']
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.js',
    include: ['src/**/*.test.{js,jsx}', 'lib/**/*.test.js']
  }
})
