import {
  comments,
  defineConfig,
  javascript,
  jsonc,
  prettier,
  typescript
} from '@kazupon/eslint-config'

export default defineConfig(
  javascript(),
  typescript(),
  comments(),
  jsonc({
    json: true,
    json5: true,
    jsonc: true
  }),
  prettier(),
  {
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
