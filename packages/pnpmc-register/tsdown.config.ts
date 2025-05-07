import { defineConfig } from 'tsdown'

export default defineConfig({
  outDir: 'lib',
  entry: ['src/cli.ts', 'src/index.ts', 'src/meta.ts', 'src/runner.ts'],
  dts: true,
  clean: true,
  noExternal: ['pnpmc-utils'],
  external: ['../package.json']
})
