import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'bin/merge-dir.js'],
  dts: true,
  format: ['esm', 'cjs']
})
