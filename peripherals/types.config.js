import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  input: join(root, '../tmp/types/peripherals/src/index.d.ts'),
  external: [
    /^ellma(?:\/.+)?$/,
  ],
  output: {
    file: join(root, './dist/index.d.ts'),
    format: 'es',
  },
  plugins: [
    dts(),
  ],
})
