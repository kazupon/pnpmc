import path from 'node:path'
import { afterEach, expect, test, vi } from 'vitest'
import { createCommandContext } from '../command'

afterEach(() => {
  vi.resetAllMocks()
})

function defineMockLog(utils: typeof import('../utils')) {
  const logs: unknown[] = []
  vi.spyOn(utils, 'log').mockImplementation((...args: unknown[]) => {
    logs.push(args)
  })

  return () => logs.join(`\n`)
}

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
    cwd,
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
    cwd,
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
    cwd,
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
    cwd,
    show
  )

  await show.run(ctx)

  const message = log()
  expect(message).toContain('Defined catalogs')
  expect(message).toContain('Catalogable Dependencies')
  expect(message).toMatchSnapshot()
})
