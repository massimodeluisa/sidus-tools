import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

/**
 * Vite 8: prefer resolve.tsconfigPaths for tsconfig paths;
 * keep explicit @ alias as a stable fallback for tooling.
 * @see https://vite.dev/blog/announcing-vite8
 *
 * satellite.js v7 root re-exports WASM pthreads bulk APIs that use top-level await
 * inside worker entries. Rolldown's worker IIFE format rejects that and fails build.
 * Alias to a pure-JS re-export (classic SGP4 only): see src/lib/vendor/satellite-js-pure.ts.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': path.resolve(rootDir, './src'),
      'satellite.js': path.resolve(rootDir, './src/lib/vendor/satellite-js-pure.ts'),
    },
  },
})
