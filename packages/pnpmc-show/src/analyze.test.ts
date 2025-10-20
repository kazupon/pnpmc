import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest'
import path from 'node:path'
import { findWorkspacePackages } from 'pnpmc-workspace-find-packages'
import { describe, expect, test } from 'vitest'
import {
  analyzeDependencies,
  collectCatalogDependencies,
  collectProjectDependencies
} from './analyze.js'

test('collectCatalogDependencies', async () => {
  const manifest = await readWorkspaceManifest(
    path.resolve(import.meta.dirname, '../test/fixtures/default')
  )
  const deps = collectCatalogDependencies(manifest!)
  expect([...deps]).toEqual(['typescript'])
})

test('collectProjectDependencies', async () => {
  const projects = await findWorkspacePackages(
    path.resolve(import.meta.dirname, '../test/fixtures/no-catalog')
  )
  const deps = collectProjectDependencies(projects)
  const [root, package1, package2] = projects
  expect(deps.get('package1')).toEqual([root])
  expect(deps.get('package2')).toEqual([root])
  expect(deps.get('typescript')).toEqual([package1, package2])
})

describe('analyzeDependencies', () => {
  test('no catalog', async () => {
    const workspaceDir = path.resolve(import.meta.dirname, '../test/fixtures/no-catalog')
    const manifest = await readWorkspaceManifest(workspaceDir)
    const deps = await analyzeDependencies(workspaceDir, manifest!)

    expect(deps.size).toBe(1)
    const [package1, package2] = deps.get('typescript')!
    expect(package1.path).toBe('/packages/package1')
    expect(package1.name).toBe('package1')
    expect(package1.dependency).toBe('typescript')
    expect(package1.alias).toBe('^5.7.3')
    expect(package1.cataloged).toBe(false)
    expect(package2.path).toBe('/packages/package2')
    expect(package2.name).toBe('package2')
    expect(package2.dependency).toBe('typescript')
    expect(package2.alias).toBe('^5.6.0')
    expect(package2.cataloged).toBe(false)
  })

  test('defined catalog', async () => {
    const workspaceDir = path.resolve(import.meta.dirname, '../test/fixtures/defined-catalog')
    const manifest = await readWorkspaceManifest(workspaceDir)
    const deps = await analyzeDependencies(workspaceDir, manifest!)

    expect(deps.size).toBe(0)
  })

  test('defined with named catalog', async () => {
    const workspaceDir = path.resolve(import.meta.dirname, '../test/fixtures/named')
    const manifest = await readWorkspaceManifest(workspaceDir)
    const deps = await analyzeDependencies(workspaceDir, manifest!)

    expect(deps.size).toBe(0)
  })

  test('dep still is not yet in the catalog', async () => {
    const workspaceDir = path.resolve(
      import.meta.dirname,
      '../test/fixtures/still-not-defined-catalog'
    )
    const manifest = await readWorkspaceManifest(workspaceDir)
    const deps = await analyzeDependencies(workspaceDir, manifest!)

    expect(deps.size).toBe(1)
    const [package1, package2] = deps.get('typescript')!
    expect(package1.path).toBe('/packages/package1')
    expect(package1.name).toBe('package1')
    expect(package1.dependency).toBe('typescript')
    expect(package1.alias).toBe('catalog:')
    expect(package1.cataloged).toBe(true)
    expect(package2.path).toBe('/packages/package2')
    expect(package2.name).toBe('package2')
    expect(package2.dependency).toBe('typescript')
    expect(package2.alias).toBe('^5.0.0')
    expect(package2.cataloged).toBe(false)
  })

  test('dep in root', async () => {
    const workspaceDir = path.resolve(import.meta.dirname, '../test/fixtures/root')
    const manifest = await readWorkspaceManifest(workspaceDir)
    const deps = await analyzeDependencies(workspaceDir, manifest!)

    expect(deps.size).toBe(1)
    const [root, package1, package2] = deps.get('typescript')!
    expect(root.path).toBe('/')
    expect(root.name).toBe('root')
    expect(root.dependency).toBe('typescript')
    expect(root.alias).toBe('^4.5.4')
    expect(root.cataloged).toBe(false)
    expect(package1.path).toBe('/packages/package1')
    expect(package1.name).toBe('package1')
    expect(package1.dependency).toBe('typescript')
    expect(package1.alias).toBe('^5.7.3')
    expect(package1.cataloged).toBe(false)
    expect(package2.path).toBe('/packages/package2')
    expect(package2.name).toBe('package2')
    expect(package2.dependency).toBe('typescript')
    expect(package2.alias).toBe('^5.6.0')
    expect(package2.cataloged).toBe(false)
  })

  test('workspace', async () => {
    const workspaceDir = path.resolve(import.meta.dirname, '../test/fixtures/workspace')
    const manifest = await readWorkspaceManifest(workspaceDir)
    const deps = await analyzeDependencies(workspaceDir, manifest!)

    expect(deps.size).toBe(0)
  })

  test('devDependencies', async () => {
    const workspaceDir = path.resolve(import.meta.dirname, '../test/fixtures/dev-deps')
    const manifest = await readWorkspaceManifest(workspaceDir)
    const deps = await analyzeDependencies(workspaceDir, manifest!)

    expect(deps.size).toBe(1)
    const [package1, package2] = deps.get('typescript')!
    expect(package1.path).toBe('/packages/package1')
    expect(package1.name).toBe('package1')
    expect(package1.dependency).toBe('typescript')
    expect(package1.alias).toBe('^5.7.3')
    expect(package1.cataloged).toBe(false)
    expect(package2.path).toBe('/packages/package2')
    expect(package2.name).toBe('package2')
    expect(package2.dependency).toBe('typescript')
    expect(package2.alias).toBe('^5.6.0')
    expect(package2.cataloged).toBe(false)
  })
})
