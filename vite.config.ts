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
        /^vellma(?:\/.*)?/,
      ],
    }),
  ],
  resolve: {
    alias: {
      '#data': join(root, './src/data'),
      '#globals': join(root, './src/globals'),
      'vellma/integrations': join(root, './integrations/src'),
      'vellma/models': join(root, './models/src'),
      'vellma/peripherals': join(root, './peripherals/src'),
      'vellma': join(root, './src'),
    },
  },
  root,
})
