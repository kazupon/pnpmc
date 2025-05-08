import { createCommandContext } from 'gunshi/context'
import path from 'node:path'
import { afterEach, expect, test, vi } from 'vitest'

vi.mock('pnpmc-utils')

function defineMockLog(utils: typeof import('pnpmc-utils')): () => string {
  const logs: unknown[] = []
  vi.spyOn(utils, 'log').mockImplementation((...args: unknown[]) => {
    logs.push(args)
  })

  return () => logs.join(`\n`)
}

afterEach(() => {
  vi.resetAllMocks()
})

test('default', async () => {
  const meta = (await import('./meta.js')).default
  const run = (await import('./runner.js')).default
  const utils = await import('pnpmc-utils')
  const log = defineMockLog(utils)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../test/fixtures/basic')
  const ctx = await createCommandContext({
    args: meta.args,
    values: {
      catalog: false,
      dependency: false
    },
    positionals: [],
    rest: [],
    argv: [],
    tokens: [],
    command: { ...meta, run },
    omitted: true,
    commandOptions: { cwd, version: '0.0.0', name: 'pnpmc' }
  })

  await run(ctx)

  const message = log()
  expect(message).toContain('Defined catalogs')
  expect(message).toContain('Catalogable Dependencies')
  expect(message).toMatchSnapshot()
})

test('catalog only', async () => {
  const meta = (await import('./meta.js')).default
  const run = (await import('./runner.js')).default
  const utils = await import('pnpmc-utils')
  const log = defineMockLog(utils)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../test/fixtures/basic')
  const ctx = await createCommandContext({
    args: meta.args,
    values: {
      catalog: true,
      dependency: false
    },
    positionals: [],
    rest: [],
    argv: [],
    tokens: [],
    commandOptions: { cwd, version: '0.0.0', name: 'pnpmc' },
    command: { ...meta, run },
    omitted: true
  })

  await run(ctx)

  const message = log()
  expect(message).toContain('Defined catalogs')
  expect(message).not.toContain('Catalogable Dependencies')
  expect(message).toMatchSnapshot()
})

test('dependency only', async () => {
  const meta = (await import('./meta.js')).default
  const run = (await import('./runner.js')).default
  const utils = await import('pnpmc-utils')
  const log = defineMockLog(utils)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../test/fixtures/basic')
  const ctx = await createCommandContext({
    args: meta.args,
    values: {
      catalog: false,
      dependency: true
    },
    positionals: [],
    rest: [],
    argv: [],
    tokens: [],
    commandOptions: { cwd, version: '0.0.0', name: 'pnpmc' },
    command: { ...meta, run },
    omitted: true
  })

  await run(ctx)

  const message = log()
  expect(message).not.toContain('Defined catalogs')
  expect(message).toContain('Catalogable Dependencies')
  expect(message).toMatchSnapshot()
})

test('both option enable', async () => {
  const meta = (await import('./meta.js')).default
  const run = (await import('./runner.js')).default
  const utils = await import('pnpmc-utils')
  const log = defineMockLog(utils)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../test/fixtures/basic')
  const ctx = await createCommandContext({
    args: meta.args,
    values: {
      catalog: true,
      dependency: true
    },
    positionals: [],
    rest: [],
    argv: [],
    tokens: [],
    commandOptions: { cwd, version: '0.0.0', name: 'pnpmc' },
    command: { ...meta, run },
    omitted: true
  })

  await run(ctx)

  const message = log()
  expect(message).toContain('Defined catalogs')
  expect(message).toContain('Catalogable Dependencies')
  expect(message).toMatchSnapshot()
})
