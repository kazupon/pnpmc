import { defineConfig } from 'tsdown'

export default defineConfig({
  outDir: 'lib',
  entry: ['src/index.ts', 'src/command/index.ts', 'src/command/meta.ts', 'src/command/runner.ts'],
  dts: true,
  clean: true,
  external: ['../package.json']
})
