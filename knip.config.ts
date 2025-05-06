import type { KnipConfig } from 'knip'

export default {
  workspaces: {
    '.': {
      entry: 'scripts/*.ts',
      project: '**/*.ts'
    },
    'packages/*': {
      entry: ['src/index.ts', 'tsdown.config.ts'],
      project: '**/*.ts'
    }
  },
  ignoreDependencies: ['lint-staged']
} satisfies KnipConfig
