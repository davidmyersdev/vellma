import { defineConfig } from 'vite'
import { externalizeDeps } from 'vite-plugin-externalize-deps'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['cjs', 'es'],
    },
  },
  plugins: [
    externalizeDeps(),
  ],
})
