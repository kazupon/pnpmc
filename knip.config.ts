import type { KnipConfig } from 'knip'

export default {
  entry: ['tsdown.config.ts', 'src/index.ts'],
  ignoreDependencies: ['lint-staged']
} satisfies KnipConfig
