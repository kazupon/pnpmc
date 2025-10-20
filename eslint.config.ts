import { includeIgnoreFile } from '@eslint/compat'
import {
  comments,
  defineConfig,
  javascript,
  jsonc,
  markdown,
  prettier,
  imports,
  regexp,
  promise,
  unicorn,
  stylistic,
  typescript,
  yaml
} from '@kazupon/eslint-config'
import { globalIgnores } from 'eslint/config'
import { fileURLToPath, URL } from 'node:url'

import type { Linter } from 'eslint'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

const config: ReturnType<typeof defineConfig> = defineConfig(
  javascript(),
  stylistic(),
  typescript({
    parserOptions: {
      tsconfigRootDir: import.meta.dirname
    },
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
        '**/test/**.ts',
        '**/bench/**.js'
      ]
    }
  }),
  imports({
    typescript: true,
    rules: {
      'import/extensions': ['error', 'ignorePackages', { js: 'never', ts: 'never' }]
    }
  }),
  promise(),
  regexp(),
  unicorn({
    rules: {
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off'
    }
  }),
  jsonc({
    json: true,
    json5: true,
    jsonc: true
  }),
  yaml({
    prettier: true
  }),
  markdown({
    preferences: true
  }),
  prettier(),
  includeIgnoreFile(gitignorePath),
  globalIgnores([
    '.vscode',
    '.github',
    '**/lib/**',
    '**/bin/**',
    'tsconfig.json',
    'pnpm-lock.yaml',
    'CHANGELOG.md',
    'pnpm-workspace.yaml',
    'eslint.config.ts',
    '**/test/fixtures/**'
  ]) as Linter.Config
)

export default config
