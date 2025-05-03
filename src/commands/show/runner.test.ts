import { createCommandContext } from 'gunshi/context'
import path from 'node:path'
import { afterEach, expect, test, vi } from 'vitest'
import { defineMockLog } from '../../../test/utils.js'

afterEach(() => {
  vi.resetAllMocks()
})

test('default', async () => {
  const meta = (await import('./meta')).default
  const run = (await import('./runner')).default
  const utils = await import('../../utils')
  const log = defineMockLog(utils)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../../../test/fixtures/basic')
  const ctx = await createCommandContext({
    options: meta.options,
    values: {
      catalog: false,
      dependency: false
    },
    positionals: [],
    rest: [],
    args: [],
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
  const meta = (await import('./meta')).default
  const run = (await import('./runner')).default
  const utils = await import('../../utils')
  const log = defineMockLog(utils)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../../../test/fixtures/basic')
  const ctx = await createCommandContext({
    options: meta.options,
    values: {
      catalog: true,
      dependency: false
    },
    positionals: [],
    rest: [],
    args: [],
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
  const meta = (await import('./meta')).default
  const run = (await import('./runner')).default
  const utils = await import('../../utils')
  const log = defineMockLog(utils)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../../../test/fixtures/basic')
  const ctx = await createCommandContext({
    options: meta.options,
    values: {
      catalog: false,
      dependency: true
    },
    positionals: [],
    rest: [],
    args: [],
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
  const meta = (await import('./meta')).default
  const run = (await import('./runner')).default
  const utils = await import('../../utils')
  const log = defineMockLog(utils)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../../../test/fixtures/basic')
  const ctx = await createCommandContext({
    options: meta.options,
    values: {
      catalog: true,
      dependency: true
    },
    positionals: [],
    rest: [],
    args: [],
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
