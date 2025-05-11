/**
 * Forked from @pnpm/workspace.find-packages
 * ref: https://github.com/pnpm/pnpm/tree/main/workspace/find-packages
 *
 * Diferences the following:
 * - check root field warning
 * - wheather to be able to install workspace packages
 *
 * This package is designed to reduce dependecies.
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { findPackages } from '@pnpm/fs.find-packages'
import { lexCompare } from '@pnpm/util.lex-comparator'

import type { Project, SupportedArchitectures } from '@pnpm/types'

export type WorkspacePackagesPatterns = 'all-packages' | string[]
export type { Project }

export interface FindWorkspacePackagesOpts {
  /**
   * An array of globs for the packages included in the workspace.
   *
   * In most cases, callers should read the pnpm-workspace.yml and pass the
   * "packages" field.
   */
  patterns?: string[]

  engineStrict?: boolean
  packageManagerStrict?: boolean
  packageManagerStrictVersion?: boolean
  nodeVersion?: string
  sharedWorkspaceLockfile?: boolean
  supportedArchitectures?: SupportedArchitectures
}

export async function findWorkspacePackages(
  workspaceRoot: string,
  opts?: FindWorkspacePackagesOpts
): Promise<Project[]> {
  return await findWorkspacePackagesNoCheck(workspaceRoot, opts)
}

export async function findWorkspacePackagesNoCheck(
  workspaceRoot: string,
  opts?: { patterns?: string[] }
): Promise<Project[]> {
  const pkgs = await findPackages(workspaceRoot, {
    ignore: ['**/node_modules/**', '**/bower_components/**'],
    includeRoot: true,
    patterns: opts?.patterns
  })
  pkgs.sort((pkg1: { rootDir: string }, pkg2: { rootDir: string }) =>
    lexCompare(pkg1.rootDir, pkg2.rootDir)
  )
  return pkgs
}
