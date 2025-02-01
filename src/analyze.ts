import { findWorkspacePackages } from '@pnpm/workspace.find-packages'

import type { Project } from '@pnpm/workspace.find-packages'
import type { WorkspaceManifest } from '@pnpm/workspace.read-manifest'

export function collectCatalogDependencies(manifest: WorkspaceManifest): Set<string> {
  const deps = new Set<string>()
  function doCollect(catalog: NonNullable<typeof manifest.catalog>, deps: Set<string>) {
    for (const dep of Object.keys(catalog)) {
      deps.add(dep)
    }
  }

  if (manifest.catalog) {
    doCollect(manifest.catalog, deps)
  }

  if (manifest.catalogs) {
    for (const catalog of Object.values(manifest.catalogs)) {
      doCollect(catalog, deps)
    }
  }

  return deps
}

export function collectProjectDependencies(projects: Project[]): Map<string, Project[]> {
  const deps = new Map<string, Project[]>()
  for (const project of projects) {
    const dep = project.manifest.dependencies || {}
    if (Object.keys(dep).length > 0) {
      for (const d of Object.keys(dep)) {
        const p = deps.get(d) || []
        p.push(project)
        deps.set(d, p)
      }
    }
    // TODO: handle devDependencies
  }
  return deps
}

export interface CatalogableDependency {
  /**
   * The path of the workspace package. e.g, `./packages/foo`, `./packages/bar`.
   * if the package is root, the path is `/`.
   */
  path: string
  /**
   * The name of the workspace package. e.g, `foo`, `@workspace1/foo`
   */
  name?: string
  /**
   * The dependency name on workspacne package. e.g, `typescript`, `eslint`
   */
  dependency: string
  /**
   * The alias of the dependency on workspace package. e.g, `^1.0.0`, `latest` and more
   */
  alias: string // TODO: should be more specific
  /**
   * The dependency is cataloged or not.
   */
  cataloged: boolean
}

export async function analyzeDependencies(
  workspaceDir: string,
  manifest: WorkspaceManifest
): Promise<Map<string, CatalogableDependency[]>> {
  const ret = new Map<string, CatalogableDependency[]>()

  const catalogDeps = collectCatalogDependencies(manifest)
  const projects = await findWorkspacePackages(workspaceDir)
  const projectDeps = collectProjectDependencies(projects)

  for (const [dep, projects] of projectDeps.entries()) {
    if (projects.length > 1) {
      const catalogableDeps: CatalogableDependency[] = []
      for (const project of projects) {
        const deps = project.manifest.dependencies || {}
        // TODO: handle devDependencies
        const pkgPath = project.rootDir.split(workspaceDir)[1] || '/'
        const alias = deps[dep]
        if (alias && !alias.startsWith('workspace:')) {
          catalogableDeps.push({
            name: project.manifest.name,
            path: pkgPath,
            dependency: dep,
            alias,
            cataloged: alias.startsWith('catalog:')
          })
        }
      }

      if (
        catalogableDeps.length > 1 &&
        (!catalogDeps.has(dep) || catalogableDeps.some(dep => !dep.cataloged))
      ) {
        ret.set(dep, catalogableDeps)
      }
    }
  }

  return ret
}
