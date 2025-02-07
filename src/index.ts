import { WORKSPACE_MANIFEST_FILENAME } from '@pnpm/constants'
import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import { findWorkspacePackages } from '@pnpm/workspace.find-packages'
import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest'
import path from 'node:path'
import pc from 'picocolors'
import writeYamlFile from 'write-yaml-file'
import { analyzeDependencies } from './analyze'
import { parse as parseArgs, usage } from './args'
import { readPackageJson } from './utils'

import type { WorkspaceManifest } from '@pnpm/workspace.read-manifest'

async function main() {
  const args = process.argv.slice(2)
  const { options: argv, command } = parseArgs(args)

  if (argv.version) {
    console.log(await version())
    return
  }

  console.log(pc.cyanBright(await footer()))
  console.log()

  if (argv.help) {
    console.log(usage())
    return
  }

  function isRegisterable(): boolean {
    // @ts-ignore -- NOTE: change to boolean with exclamations operator
    return !!argv.dependency && !!argv.alias && argv.catalog
  }

  const cwd = process.cwd()
  if (command === 'register') {
    if (isRegisterable()) {
      await update(cwd, argv.dependency as string, argv.alias as string, argv.catalog as string)
    } else {
      console.log(usage())
    }
  } else if (command === 'show') {
    await display(cwd)
  } else {
    console.log(usage())
  }
}

async function version(): Promise<string> {
  const pkgJson = await readPackageJson(path.resolve(__dirname, '../package.json'))
  return `${pkgJson.version as string}`
}

async function footer(): Promise<string> {
  const pkgJsonPath = path.resolve(__dirname, '../package.json')
  const pkgJson = await readPackageJson(pkgJsonPath)
  const version = pkgJson.version as string
  const name = pkgJson.name as string
  const title = pkgJson.description as string
  return `${title} (${name} v${version})`
}

async function display(target: string): Promise<void> {
  const workspaceDir = await findWorkspaceDir(target)
  if (workspaceDir == null) {
    // TODO: handle message
    return
  }

  const manifest = await readWorkspaceManifest(workspaceDir)
  if (manifest == null) {
    fail('No workspace manifest found')
  }

  console.log(catalogs(manifest))
  console.log()

  const catalogableDeps = await analyzeDependencies(workspaceDir, manifest)
  if (catalogableDeps.size > 0) {
    console.log(catalogableDependencies(catalogableDeps))
    console.log()
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
    for (const [dep, ver] of Object.entries(manifest.catalog)) {
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

  for (const [depName, deps] of catalogableDeps.entries()) {
    text += `  ${depName}:\n`
    const depsPathMaxLength = Math.max(...deps.map(dep => dep.path.length))
    const depsNameMaxLength = Math.max(...deps.map(dep => dep.name?.length || 0))
    for (const dep of deps) {
      text += `    ${dep.path.padEnd(depsPathMaxLength)}`
      if (dep.name) {
        // NOTE: padEnd with 3 spaces for `()`
        text += ` ${`(${dep.name})`.padEnd(depsNameMaxLength + 3)}: `
      } else {
        text += ': '
      }
      text += `${dep.alias}\n`
    }
  }

  return text
}

async function update(
  target: string,
  dependency: string,
  alias: string,
  catalog: string
): Promise<void> {
  const workspaceDir = await findWorkspaceDir(target)
  if (workspaceDir == null) {
    // TODO: handle message
    return
  }

  const catalogText = await registerCatalog(workspaceDir, dependency, alias, catalog)
  console.log(catalogText)
  console.log()

  const dependencyText = await orverrideDependency(workspaceDir, dependency, catalog)
  if (!dependencyText) {
    return
  }
  console.log(dependencyText)
}

interface WorkspaceCatalog {
  [dependencyName: string]: string
}

interface WorkspaceNamedCatalogs {
  [catalogName: string]: WorkspaceCatalog
}

interface WritableWorkspaceManifest {
  packages: string[]
  catalog?: WorkspaceCatalog
  catalogs?: WorkspaceNamedCatalogs
}

async function registerCatalog(
  workspaceDir: string,
  dependency: string,
  alias: string,
  catalog: string
): Promise<string> {
  const manifest = await readWorkspaceManifest(workspaceDir)
  if (manifest == null) {
    fail('No workspace manifest found')
  }

  function override(
    catalog: WorkspaceCatalog,
    catalogName: string,
    alias: string,
    dependency: string
  ): string {
    if (catalog[dependency] !== alias) {
      catalog[dependency] = alias
      return `📙 Registered '${dependency}' as '${alias}' in Catalog '${catalogName}'`
    } else {
      return ''
    }
  }

  const writableManifest = structuredClone(manifest) as unknown as WritableWorkspaceManifest
  let ret = ''
  if (catalog === 'default') {
    const _catalog = (writableManifest.catalog = writableManifest.catalog || {})
    ret = override(_catalog, catalog, alias, dependency)
  } else {
    const catalogs = (writableManifest.catalogs = writableManifest.catalogs || {})
    const _catalog = (catalogs[catalog] = catalogs[catalog] || ({} as WorkspaceCatalog))
    ret = override(_catalog, catalog, alias, dependency)
  }

  if (!ret.length) {
    return `📙 No update, '${catalog}' is already registered in Catalog`
  }

  try {
    await writeYamlFile(path.join(workspaceDir, WORKSPACE_MANIFEST_FILENAME), writableManifest)
  } catch (error: unknown) {
    fail(error)
  }

  return ret
}

async function orverrideDependency(
  workspaceDir: string,
  dependency: string,
  catalog: string
): Promise<string> {
  let ret = ``

  const projects = await findWorkspacePackages(workspaceDir)
  for (const project of projects) {
    const dependencies = (project.manifest.dependencies = project.manifest.dependencies || {})
    const devDependencies = (project.manifest.devDependencies =
      project.manifest.devDependencies || {})
    for (const deps of [dependencies, devDependencies]) {
      const alias = deps[dependency]
      const catalogAlias = `catalog:${catalog === 'default' ? '' : catalog}`
      if (alias && !alias.startsWith(catalogAlias)) {
        deps[dependency] = catalogAlias
        try {
          await project.writeProjectManifest(project.manifest)
          const pkgPath = project.rootDir.split(workspaceDir)[1] || '/'
          const displayName = `${pkgPath}${project.manifest.name ? ` (${project.manifest.name})` : ''} `
          ret += `📦 Overridden '${dependency}' alias on ${displayName}: ${alias} -> ${deps[dependency]} \n`
        } catch (error: unknown) {
          fail(error)
        }
      }
    }
  }

  return ret
}

function fail(...messages: unknown[]): never {
  console.error(...messages)
  process.exit(1)
}

main().catch(error => {
  fail(error)
})
