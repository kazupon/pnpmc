import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import { findWorkspacePackages } from '@pnpm/workspace.find-packages'
import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest'
import path from 'node:path'
import { expect, test } from 'vitest'

test.skip('findWorkspaceDir', async () => {
  console.log('hello pnpmc!', path.resolve(__dirname, '../test/fixtures'))
  console.log(
    process.env['NPM_CONFIG_WORKSPACE_DIR'],
    process.env['NPM_CONFIG_WORKSPACE_DIR'.toLowerCase()]
  )
  const workspaceDir = await findWorkspaceDir(path.resolve(__dirname, '../test/fixtures'))
  const manifest = await readWorkspaceManifest(path.resolve(__dirname, '../test/fixtures'))
  console.log('manifest', manifest)
  const pkgs = await findWorkspacePackages(path.resolve(__dirname, '../test/fixtures'))
  console.log('pkgs', pkgs)
  const p = pkgs[0]
  const m = p.manifest
  m.dependencies = m.dependencies || {}
  m.dependencies['@pnpm/find-workspace-dir'] = 'latest'
  await p.writeProjectManifest(m)
  expect(1).toBe(workspaceDir)
})
