import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: ['tsdown.config.ts', 'src/index.ts'],
  ignoreDependencies: ['lint-staged']
}

export default config
