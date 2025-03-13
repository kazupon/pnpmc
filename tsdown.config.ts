import { defineConfig } from 'tsdown'

const config: ReturnType<typeof defineConfig> = defineConfig({
  outDir: 'lib',
  entry: 'src/index.ts',
  dts: true,
  clean: true,
  bundleDts: true
})

export default config
