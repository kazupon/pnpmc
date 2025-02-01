import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import pc from 'picocolors'
import { analyzeDependencies } from './analyze'

import type { WorkspaceManifest } from '@pnpm/workspace.read-manifest'

async function main() {
  const cwd = process.cwd()

  console.log(pc.cyanBright(await renderFooter()))
  console.log()

  const workspaceDir = await findWorkspaceDir(cwd)
  if (workspaceDir == null) {
    // TODO: handle message
    return
  }

  const manifest = await readWorkspaceManifest(workspaceDir)
  if (manifest == null) {
    fail('No workspace manifest found')
  }

  console.log(renderCatalogs(manifest))
  console.log()

  const catalogableDeps = await analyzeDependencies(workspaceDir, manifest)
  if (catalogableDeps.size > 0) {
    console.log(renderCatalogableDependencies(catalogableDeps))
    console.log()
  }
}

async function renderFooter(): Promise<string> {
  const pkgJsonPath = path.resolve(__dirname, '../package.json')
  const pkgJson = JSON.parse(await fs.readFile(pkgJsonPath, 'utf-8')) as Record<string, unknown>
  const version = pkgJson.version as string
  const name = pkgJson.name as string
  const title = pkgJson.description as string
  return `${title} (${name} v${version})`
}

function renderCatalogs(manifest: WorkspaceManifest): string {
  let catalogs = `📙 Defined catalogs in pnpm-workspace.yaml:\n`
  if (manifest.catalog == null && manifest.catalogs == null) {
    catalogs += '  (none)'
    return catalogs
  }

  if (manifest.catalog) {
    catalogs += '  default:\n'
    for (const [dep, ver] of Object.entries(manifest.catalog)) {
      catalogs += `    ${dep}: ${ver}`
    }
  }

  if (manifest.catalogs) {
    for (const [name, catalog] of Object.entries(manifest.catalogs)) {
      catalogs += `  ${name}:\n`
      for (const [dep, ver] of Object.entries(catalog)) {
        catalogs += `    ${dep}: ${ver}`
      }
    }
  }

  return catalogs
}

function renderCatalogableDependencies(
  catalogableDeps: Awaited<ReturnType<typeof analyzeDependencies>>
): string {
  let text = `📦 Catalogable Dependencies (${catalogableDeps.size}):\n`

  for (const [depName, deps] of catalogableDeps.entries()) {
    text += `  ${depName}:\n`
    for (const dep of deps) {
      text += `    ${dep.path}`
      if (dep.name) {
        text += ` (${dep.name}): `
      } else {
        text += ': '
      }
      text += `${dep.alias}\n`
    }
  }

  return text
}

function fail(...messages: string[]): never {
  console.error(...messages)
  process.exit(1)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
