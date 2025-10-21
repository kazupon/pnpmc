import type { KnipConfig } from 'knip'

export default {
  workspaces: {
    '.': {
      project: '**/*.ts'
    },
    'packages/*': {
      project: '**/*.ts'
    },
    'packages/pnpmc-*': {
      project: '**/*.ts'
    }
  },
  ignoreDependencies: ['lint-staged']
} satisfies KnipConfig
