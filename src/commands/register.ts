import { WORKSPACE_MANIFEST_FILENAME } from '@pnpm/constants'
import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import { findWorkspacePackages } from '@pnpm/workspace.find-packages'
import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest'
import path from 'node:path'
import writeYamlFile from 'write-yaml-file'
import { fail, log } from '../utils.js'

import type { Command } from 'gunshi'

const options = {
  catalog: {
    type: 'string',
    short: 'c',
    default: 'default'
  },
  dependency: {
    type: 'string',
    short: 'd',
    required: true
  },
  alias: {
    type: 'string',
    short: 'a',
    required: true
  }
} as const

const command: Command<typeof options> = {
  name: 'register',
  description: 'Register the dependency to the catalog',
  options,
  usage: {
    options: {
      dependency: 'Register the dependency, required. use with --alias and --catalog options',
      alias: 'Register the alias, required. Use with --dependency and --catalog options',
      catalog:
        "Register the catalog. Use with --dependency and --alias options. Default is 'default'"
    },
    examples: `# Register the dependency to the catalog:
pnpmc register --dependency typescript --alias ^5.7.9 --catalog tools`
  },
  async run(ctx) {
    const { dependency, alias, catalog } = ctx.values
    await register(ctx.env.cwd!, dependency, alias, catalog)
  }
}

export default command

async function register(
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
  log(catalogText)
  log()

  const dependencyText = await orverrideDependency(workspaceDir, dependency, catalog)
  if (!dependencyText) {
    return
  }
  log(dependencyText)
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
