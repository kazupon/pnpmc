import { vi } from 'vitest'
export function defineMockLog(utils: typeof import('../src/utils')): () => string {
  const logs: unknown[] = []
  vi.spyOn(utils, 'log').mockImplementation((...args: unknown[]) => {
    logs.push(args)
  })

  return () => logs.join(`\n`)
}
