import { defineConfig } from 'tsdown'

export default defineConfig({
  outDir: 'lib',
  entry: 'src/index.ts',
  dts: true,
  clean: true,
  noExternal: ['pnpmc-utils', 'pnpmc-show/meta', 'pnpmc-register/meta'],
  external: ['../package.json']
})
