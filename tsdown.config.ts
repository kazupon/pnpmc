import { defineConfig } from 'tsdown'

export default defineConfig({
  outDir: 'lib',
  entry: 'src/index.ts',
  dts: true,
  clean: true
})
