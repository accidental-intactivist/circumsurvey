import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
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
    include: ['src/**/*.test.{js,jsx}']
  }
})
