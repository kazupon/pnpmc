/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { detect, resolveCommand } from 'package-manager-detector'
import { x } from 'tinyexec'

import type { Args, CommandContext, CommandRunner } from 'gunshi'

export async function load<A extends Args = Args>(pkg: string): Promise<CommandRunner<A>> {
  const mod = await loadCommandRunner<A>(`${pkg}/runner`)
  if (mod != null) {
    return mod
  } else {
    const pm = await detect()
    if (pm == null) {
      throw new Error('Fatal Error: Cannot detect package manager')
    }
    async function runner<A extends Args>(ctx: CommandContext<A>): Promise<void> {
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
  }
}

async function loadCommandRunner<A extends Args = Args>(
  pkg: string
): Promise<CommandRunner<A> | null> {
  let mod: Promise<CommandRunner<A> | null> | undefined
  try {
    mod = await import(pkg).then(m => m.default || m)
  } catch (e: unknown) {
    if (isErrorModuleNotFound(e)) {
      mod = Promise.resolve(null)
    }
  }
  if (mod === undefined) {
    throw new Error(`Fatal Error: '${pkg}' Commnad Runner loading failed`)
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
