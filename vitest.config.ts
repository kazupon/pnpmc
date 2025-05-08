import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // NOTE(kazupon): 'pnpmc-utils' is private package, so we need to resolve it to the local path
      'pnpmc-utils': path.resolve(import.meta.dirname, './packages/pnpmc-utils/src/index.ts')
    }
  }
})
