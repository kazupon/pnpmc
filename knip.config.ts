import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: ['src/index.ts', 'eslint.config.ts', 'tsdown.config.ts'],
  ignoreDependencies: ['lint-staged']
}

export default config
