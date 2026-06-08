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
  },
  test: {
    environment: 'jsdom',
    globals: true,
    execArgv: ['--experimental-require-module'],
    server: {
      deps: {
        inline: [/@asamuzakjp\/css-color/, /@csstools\/css-calc/]
      }
    }
  }
})
