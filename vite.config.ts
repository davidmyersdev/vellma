import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { externalizeDeps } from 'vite-plugin-externalize-deps'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['cjs', 'es'],
    },
  },
  plugins: [
    externalizeDeps({
      include: [
        /^ellma(?:\/.*)?/,
      ],
    }),
  ],
  resolve: {
    alias: {
      '#data': join(root, './src/data'),
      '#globals': join(root, './src/globals'),
      '#models': join(root, './src/models'),
      'ellma': root,
    },
  },
  root,
})
