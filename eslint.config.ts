import {
  comments,
  defineConfig,
  javascript,
  jsonc,
  markdown,
  prettier,
  typescript
} from '@kazupon/eslint-config'
import { globalIgnores } from 'eslint/config'

import type { Linter } from 'eslint'

export default defineConfig(
  javascript(),
  typescript({
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  }),
  comments({
    kazupon: {
      ignores: [
        '**/*.test.ts',
        '**/*.test.js',
        '**/*.test-d.ts',
        '**/*.spec.ts',
        '**/*.spec.js',
        'test/**.ts',
        'bench/**.js'
      ]
    }
  }),
  jsonc({
    json: true,
    json5: true,
    jsonc: true
  }),
  markdown(),
  prettier(),
  globalIgnores([
    '.vscode',
    '.github',
    'lib',
    'bin',
    'tsconfig.json',
    'pnpm-lock.yaml',
    'eslint.config.ts',
    'test/fixtures'
  ]) as Linter.Config
)
