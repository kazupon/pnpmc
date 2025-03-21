import {
  comments,
  defineConfig,
  javascript,
  jsonc,
  markdown,
  prettier,
  typescript
} from '@kazupon/eslint-config'

export default defineConfig(
  javascript(),
  typescript({
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  }),
  comments(),
  jsonc({
    json: true,
    json5: true,
    jsonc: true
  }),
  markdown(),
  prettier(),
  {
    name: 'ignores',
    ignores: [
      '.vscode',
      '.github',
      'lib',
      'bin',
      'tsconfig.json',
      'pnpm-lock.yaml',
      'eslint.config.ts',
      'test/fixtures'
    ]
  }
)
