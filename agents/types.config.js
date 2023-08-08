import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'

const root = dirname(fileURLToPath(import.meta.url))
const base = basename(root)

export default defineConfig({
  input: join(root, `../tmp/types/${base}/index.d.ts`),
  external: [
    /^vellma(?:\/.+)?$/,
  ],
  output: {
    file: join(root, './dist/index.d.ts'),
    format: 'es',
  },
  plugins: [
    dts(),
  ],
})
