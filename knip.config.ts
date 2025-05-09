import type { KnipConfig } from 'knip'

export default {
  workspaces: {
    '.': {
      entry: ['scripts/*.ts'],
      project: '**/*.ts'
    },
    'packages/*': {
      entry: ['src/index.ts', 'tsdown.config.ts'],
      project: '**/*.ts'
    },
    'packages/pnpmc': {
      entry: ['src/index.ts', 'tsdown.config.ts'],
      ignoreDependencies: ['pnpmc-show', 'pnpmc-register']
    },
    'packages/pnpmc-*': {
      entry: ['src/cli.ts', 'src/index.ts', 'tsdown.config.ts'],
      project: '**/*.ts'
    }
  },
  ignoreDependencies: ['lint-staged', '@pnpm/logger']
} satisfies KnipConfig
