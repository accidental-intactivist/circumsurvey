import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'
import path from 'path'

export default defineConfig({
  cacheDir: path.join(os.tmpdir(), 'vite-circumsurvey-cache'),
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    // Inline small assets to reduce requests
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-d3': ['d3-force', 'd3-format', 'd3-geo', 'd3-hexbin', 'd3-sankey', 'd3-scale', 'd3-shape'],
          'vendor-gsap': ['gsap', '@gsap/react'],
          'vendor-leaflet': ['leaflet', 'react-leaflet', 'topojson-client'],
          'vendor-lottie': ['lottie-web']
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    execArgv: ['--experimental-require-module'],
    server: {
      deps: {
        inline: [/@asamuzakjp\/css-color/, /@csstools\/css-calc/]
      }
    },
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'worker/**', 'tests/**']
  }
})
