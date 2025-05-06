import type { KnipConfig } from 'knip'

export default {
  workspaces: {
    '.': {
      entry: 'scripts/*.ts',
      project: 'scripts/**/*.ts'
    },
    'packages/*': {
      entry: ['src/index.ts', 'tsdown.config.ts'],
      project: '**/*.ts'
    }
  },
  // entry: ['tsdown.config.ts', 'src/index.ts'],
  ignoreDependencies: ['lint-staged']
} satisfies KnipConfig
