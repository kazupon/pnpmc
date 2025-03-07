import { createCommandContext } from 'gunshi/context'
import path from 'node:path'
import { afterEach, expect, test, vi } from 'vitest'
import { defineMockLog } from '../../test/utils'

afterEach(() => {
  vi.resetAllMocks()
})

test('default', async () => {
  const { default: show } = await import('./show')
  const utils = await import('../utils')
  const log = defineMockLog(utils)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../../test/fixtures/basic')
  const ctx = await createCommandContext({
    options: show.options,
    values: {
      catalog: false,
      dependency: false
    },
    positionals: [],
    command: show,
    omitted: true,
    commandOptions: { cwd, version: '0.0.0', name: 'pnpmc' }
  })

  await show.run(ctx)

  const message = log()
  expect(message).toContain('Defined catalogs')
  expect(message).toContain('Catalogable Dependencies')
  expect(message).toMatchSnapshot()
})

test('catalog only', async () => {
  const { default: show } = await import('./show')
  const utils = await import('../utils')
  const log = defineMockLog(utils)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../../test/fixtures/basic')
  const ctx = await createCommandContext({
    options: show.options,
    values: {
      catalog: true,
      dependency: false
    },
    positionals: [],
    commandOptions: { cwd, version: '0.0.0', name: 'pnpmc' },
    command: show,
    omitted: true
  })

  await show.run(ctx)

  const message = log()
  expect(message).toContain('Defined catalogs')
  expect(message).not.toContain('Catalogable Dependencies')
  expect(message).toMatchSnapshot()
})

test('dependency only', async () => {
  const { default: show } = await import('./show')
  const utils = await import('../utils')
  const log = defineMockLog(utils)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../../test/fixtures/basic')
  const ctx = await createCommandContext({
    options: show.options,
    values: {
      catalog: false,
      dependency: true
    },
    positionals: [],
    commandOptions: { cwd, version: '0.0.0', name: 'pnpmc' },
    command: show,
    omitted: true
  })

  await show.run(ctx)

  const message = log()
  expect(message).not.toContain('Defined catalogs')
  expect(message).toContain('Catalogable Dependencies')
  expect(message).toMatchSnapshot()
})

test('both option enable', async () => {
  const { default: show } = await import('./show')
  const utils = await import('../utils')
  const log = defineMockLog(utils)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../../test/fixtures/basic')
  const ctx = await createCommandContext({
    options: show.options,
    values: {
      catalog: true,
      dependency: true
    },
    positionals: [],
    commandOptions: { cwd, version: '0.0.0', name: 'pnpmc' },
    command: show,
    omitted: true
  })

  await show.run(ctx)

  const message = log()
  expect(message).toContain('Defined catalogs')
  expect(message).toContain('Catalogable Dependencies')
  expect(message).toMatchSnapshot()
})
