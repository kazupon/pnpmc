import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import { createCommandContext } from 'gunshi/context'
import path from 'node:path'
import { findWorkspacePackages } from 'pnpmc-workspace-find-packages'
import { afterEach, expect, test, vi } from 'vitest'
import writeYamlFile from 'write-yaml-file'

vi.mock('pnpmc-utils')

function defineMockLog(utils: typeof import('pnpmc-utils')): () => string {
  const logs: unknown[] = []
  vi.spyOn(utils, 'log').mockImplementation((...args: unknown[]) => {
    logs.push(args)
  })

  return () => logs.join(`\n`)
}

let _cacheProjects: Awaited<ReturnType<typeof findWorkspacePackages>> | undefined

vi.mock('write-yaml-file')
vi.mock('pnpmc-workspace-find-packages', async original => {
  const mod = await original<typeof import('pnpmc-workspace-find-packages')>()
  async function findWorkspacePackages(
    workspaceRoot: string,
    opts?: Parameters<typeof mod.findWorkspacePackages>[1]
  ): ReturnType<typeof mod.findWorkspacePackages> {
    if (!_cacheProjects) {
      _cacheProjects = await mod.findWorkspacePackages(workspaceRoot, opts)
      for (const project of _cacheProjects) {
        project.writeProjectManifest = vi.fn()
      }
    }
    return _cacheProjects
  }
  return {
    ...mod,
    findWorkspacePackages
  }
})

function getProject(name: string, projects: Awaited<ReturnType<typeof findWorkspacePackages>>) {
  return projects.find(p => p.manifest.name === name)
}

afterEach(() => {
  _cacheProjects = undefined
  vi.resetAllMocks()
})

test('basic', async () => {
  const meta = (await import('./meta.js')).default
  const run = (await import('./runner.js')).default
  const utils = await import('pnpmc-utils')
  const log = defineMockLog(utils)
  const mockWriteYamlFile = vi.mocked(writeYamlFile)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../test/fixtures/basic')
  const ctx = await createCommandContext({
    args: meta.args,
    values: {
      dependency: 'typescript',
      alias: '^5.7.0',
      catalog: 'tools'
    },
    positionals: [],
    rest: [],
    argv: [],
    tokens: [],
    command: { ...meta, run },
    omitted: true,
    callMode: 'entry',
    cliOptions: { cwd, version: '0.0.0', name: 'pnpmc' }
  })

  // fire!
  await run(ctx)

  // check console output
  const message = log()
  expect(message).toContain(`Registered 'typescript' as '^5.7.0' in Catalog 'tools'`)
  expect(message).toContain(
    `Overridden 'typescript' alias on /packages/package1 (package1) : ^5.7.3 -> catalog:tools`
  )
  expect(message).toContain(
    `Overridden 'typescript' alias on /packages/package2 (package2) : ^5.6.0 -> catalog:tools`
  )
  expect(message).toMatchSnapshot()

  const workspaceDir = await findWorkspaceDir(cwd)
  const projects = await findWorkspacePackages(workspaceDir!)

  // check pnpm-workspace.yaml
  expect(mockWriteYamlFile.mock.calls[0][1]).toMatchObject({
    catalogs: { tools: { typescript: '^5.7.0' } }
  })

  // check package1/package.json
  const package1 = getProject('package1', projects)!
  const mockWriteProjectManifest1 = vi.mocked(package1.writeProjectManifest)
  expect(mockWriteProjectManifest1.mock.calls[0][0]).toMatchObject({
    name: 'package1',
    dependencies: { typescript: 'catalog:tools' }
  })

  // check package1/package.json
  const package2 = getProject('package2', projects)!
  const mockWriteProjectManifest2 = vi.mocked(package2.writeProjectManifest)
  expect(mockWriteProjectManifest2.mock.calls[0][0]).toMatchObject({
    name: 'package2',
    dependencies: { typescript: 'catalog:tools' }
  })
})

test('default catalog', async () => {
  const meta = (await import('./meta.js')).default
  const run = (await import('./runner.js')).default
  const utils = await import('pnpmc-utils')
  const log = defineMockLog(utils)
  const mockWriteYamlFile = vi.mocked(writeYamlFile)
  // @ts-ignore
  const cwd = path.resolve(import.meta.dirname, '../test/fixtures/basic')
  const ctx = await createCommandContext({
    args: meta.args,
    values: {
      dependency: 'typescript',
      alias: '^5.7.0',
      catalog: 'default'
    },
    positionals: [],
    rest: [],
    argv: [],
    tokens: [],
    command: { ...meta, run },
    omitted: true,
    callMode: 'entry',
    cliOptions: { cwd, version: '0.0.0', name: 'pnpmc' }
  })

  // fire!
  await run(ctx)

  // check console output
  const message = log()
  expect(message).toContain(`Registered 'typescript' as '^5.7.0' in Catalog 'default'`)
  expect(message).toContain(
    `Overridden 'typescript' alias on /packages/package1 (package1) : ^5.7.3 -> catalog:`
  )
  expect(message).toContain(
    `Overridden 'typescript' alias on /packages/package2 (package2) : ^5.6.0 -> catalog:`
  )
  expect(message).toMatchSnapshot()

  const workspaceDir = await findWorkspaceDir(cwd)
  const projects = await findWorkspacePackages(workspaceDir!)

  // check pnpm-workspace.yaml
  expect(mockWriteYamlFile.mock.calls[0][1]).toMatchObject({ catalog: { typescript: '^5.7.0' } })

  // check package1/package.json
  const package1 = getProject('package1', projects)!
  const mockWriteProjectManifest1 = vi.mocked(package1.writeProjectManifest)
  expect(mockWriteProjectManifest1.mock.calls[0][0]).toMatchObject({
    name: 'package1',
    dependencies: { typescript: 'catalog:' }
  })

  // check package1/package.json
  const package2 = getProject('package2', projects)!
  const mockWriteProjectManifest2 = vi.mocked(package2.writeProjectManifest)
  expect(mockWriteProjectManifest2.mock.calls[0][0]).toMatchObject({
    name: 'package2',
    dependencies: { typescript: 'catalog:' }
  })
})
