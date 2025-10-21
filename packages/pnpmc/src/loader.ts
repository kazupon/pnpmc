/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { detect, resolveCommand } from 'package-manager-detector'
import { x } from 'tinyexec'

import type { CommandContext, CommandRunner, GunshiParamsConstraint } from 'gunshi'

export async function load<G extends GunshiParamsConstraint>(
  pkg: string
): Promise<CommandRunner<G>> {
  const mod = await loadCommandRunner<G>(`${pkg}/runner`)
  if (mod == null) {
    const pm = await detect()
    if (pm == null) {
      throw new Error('Fatal Error: Cannot detect package manager')
    }
    async function runner<G extends GunshiParamsConstraint>(ctx: CommandContext<G>): Promise<void> {
      const subCommand = ctx.env.version ? `${pkg}@${ctx.env.version}` : pkg
      const resolvedCommand = resolveCommand(pm!.agent, 'execute', [subCommand, ...ctx._.slice(1)]) // resolved args with removed the sub-command of parent command
      if (resolvedCommand == null) {
        throw new Error(`Fatal Error: Cannot resolve command '${ctx._[0]}'`)
      }
      await x(resolvedCommand.command, resolvedCommand.args, {
        nodeOptions: {
          cwd: ctx.env.cwd,
          stdio: 'inherit',
          env: Object.assign(Object.create(null), process.env, { PMPMC_LOADED: 'true' })
        }
      })
    }
    return runner
  } else {
    return mod
  }
}

async function loadCommandRunner<G extends GunshiParamsConstraint>(
  pkg: string
): Promise<CommandRunner<G> | null> {
  let mod: Promise<CommandRunner<G> | null> | undefined
  try {
    mod = await import(pkg).then(m => m.default || m)
  } catch (error: unknown) {
    if (isErrorModuleNotFound(error)) {
      mod = Promise.resolve(null)
    }
  }
  if (mod === undefined) {
    throw new Error(`Fatal Error: '${pkg}' Command Runner loading failed`)
  }
  return mod
}

function isErrorModuleNotFound(e: unknown): e is NodeJS.ErrnoException {
  return (
    e instanceof Error &&
    'code' in e &&
    typeof e.code === 'string' &&
    e.code === 'ERR_MODULE_NOT_FOUND'
  )
}
