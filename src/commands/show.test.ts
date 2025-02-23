import path from 'node:path'
import { afterEach, expect, test, vi } from 'vitest'
import { defineMockLog } from '../../test/utils'
import { createCommandContext } from '../command'

afterEach(() => {
  vi.resetAllMocks()
})

test('default', async () => {
  const { default: show } = await import('./show')
  const utils = await import('../utils')
  const log = defineMockLog(utils)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../../test/fixtures/basic')
  const ctx = createCommandContext(
    show.options,
    {
      catalog: false,
      dependency: false
    },
    [],
    { cwd, version: '0.0.0', name: 'pnpmc' },
    show
  )

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
  const ctx = createCommandContext(
    show.options,
    {
      catalog: true,
      dependency: false
    },
    [],
    { cwd, version: '0.0.0', name: 'pnpmc' },
    show
  )

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
  const ctx = createCommandContext(
    show.options,
    {
      catalog: false,
      dependency: true
    },
    [],
    { cwd, version: '0.0.0', name: 'pnpmc' },
    show
  )

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
  const ctx = createCommandContext(
    show.options,
    {
      catalog: true,
      dependency: true
    },
    [],
    { cwd, version: '0.0.0', name: 'pnpmc' },
    show
  )

  await show.run(ctx)

  const message = log()
  expect(message).toContain('Defined catalogs')
  expect(message).toContain('Catalogable Dependencies')
  expect(message).toMatchSnapshot()
})
