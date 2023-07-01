import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rollup'
import alias from '@rollup/plugin-alias'
import dts from 'rollup-plugin-dts'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  input: join(root, './tmp/types/src/index.d.ts'),
  external: [
    /^ellma(?:\/.+)?$/,
  ],
  output: {
    file: join(root, './dist/index.d.ts'),
    format: 'es',
  },
  plugins: [
    alias({
      entries: [
        {
          find: '#data',
          replacement: join(root, './src/data'),
        },
        {
          find: '#globals',
          replacement: join(root, './src/globals'),
        },
      ],
    }),
    dts(),
  ],
})
