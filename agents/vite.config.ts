import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { externalizeDeps } from 'vite-plugin-externalize-deps'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: './index.ts',
      fileName: 'index',
      formats: ['cjs', 'es'],
    },
    outDir: './dist',
  },
  plugins: [
    externalizeDeps({
      include: [
        /^vellma(?:\/.*)?/,
      ],
    }),
  ],
  resolve: {
    alias: {
      vellma: join(root, '../src'),
    },
  },
  root,
})
