/**
 * Entry point module for runner of pnpmc-show command.
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { WORKSPACE_MANIFEST_FILENAME } from '@pnpm/constants'
import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest'
import { fail, log } from 'pnpmc-utils'
import { analyzeDependencies } from './analyze.js'
import meta from './meta.js'

import type { WorkspaceManifest } from '@pnpm/workspace.read-manifest'
import type { CommandRunner } from 'gunshi'

const run: CommandRunner<{ args: typeof meta.args }> = async ({ values, env: { cwd } }) => {
  await display(cwd!, {
    showCategory: !values.catalog && !values.dependency ? true : values.catalog,
    showDependency: !values.catalog && !values.dependency ? true : values.dependency
  })
}

async function display(
  target: string,
  options: { showCategory: boolean; showDependency: boolean }
): Promise<void> {
  const workspaceDir = await findWorkspaceDir(target)
  if (workspaceDir == null) {
    // TODO: handle message
    return
  }

  const manifest = await readWorkspaceManifest(workspaceDir)
  if (manifest == null) {
    fail('No workspace manifest found')
  }

  if (options.showCategory) {
    log(catalogs(manifest))
    log()
  }

  if (options.showDependency) {
    const catalogableDeps = await analyzeDependencies(workspaceDir, manifest)
    if (catalogableDeps.size > 0) {
      log(catalogableDependencies(catalogableDeps))
      log()
    }
  }
}

function catalogs(manifest: WorkspaceManifest): string {
  let catalogs = `📙 Defined catalogs in ${WORKSPACE_MANIFEST_FILENAME}:\n`
  if (manifest.catalog == null && manifest.catalogs == null) {
    catalogs += '  (none)'
    return catalogs
  }

  if (manifest.catalog) {
    catalogs += '  default:\n'
    const sortedCatalog = new Map(
      [...Object.entries(manifest.catalog)].toSorted((a, b) => a[0].localeCompare(b[0]))
    )
    for (const [dep, ver] of sortedCatalog.entries()) {
      catalogs += `    ${dep}: ${ver}\n`
    }
  }

  if (manifest.catalogs) {
    for (const [name, catalog] of Object.entries(manifest.catalogs)) {
      catalogs += `  ${name}:\n`
      for (const [dep, ver] of Object.entries(catalog)) {
        catalogs += `    ${dep}: ${ver}\n`
      }
    }
  }

  return catalogs
}

function catalogableDependencies(
  catalogableDeps: Awaited<ReturnType<typeof analyzeDependencies>>
): string {
  let text = `📦 Catalogable Dependencies (${catalogableDeps.size}):\n`

  const sortedCatalogableDeps = new Map(
    [...catalogableDeps.entries()].toSorted((a, b) => a[0].localeCompare(b[0]))
  )
  for (const [depName, deps] of sortedCatalogableDeps.entries()) {
    text += `  ${depName}:\n`
    const depsPathMaxLength = Math.max(...deps.map(dep => dep.path.length))
    const depsNameMaxLength = Math.max(...deps.map(dep => dep.name?.length || 0))
    for (const dep of deps) {
      text += `    ${dep.path.padEnd(depsPathMaxLength)}`
      // NOTE: padEnd with 3 spaces for `()`
      text += dep.name ? ` ${`(${dep.name})`.padEnd(depsNameMaxLength + 3)}: ` : ': '
      text += `${dep.alias}\n`
    }
  }

  return text
}

export default run
