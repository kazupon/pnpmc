/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { cli } from 'gunshi'
import {
  renderHeader as renderHeaderBase,
  renderValidationErrors as renderValidationErrorsBase
} from 'gunshi/renderer'
import pc from 'picocolors'

import type { Args, Command, LazyCommand } from 'gunshi'

export function log(...args: unknown[]): void {
  console.log(...args)
}

export function fail(...messages: unknown[]): never {
  console.error(...messages)
  process.exit(1)
}

export async function runCli<A extends Args = Args>(
  args: string[],
  entry: Command<A>,
  options: {
    pkgJson: { name: string; description: string; version: string }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subCommands?: Map<string, Command<any> | LazyCommand<any>>
    cwd: string
  }
) {
  await cli(args, entry, {
    name: options.pkgJson.name,
    description: options.pkgJson.description,
    version: options.pkgJson.version,
    subCommands: options.subCommands,
    cwd: options.cwd,
    renderHeader: async ctx => pc.cyanBright(await renderHeaderBase(ctx)),
    renderValidationErrors: async (ctx, e) => {
      const messages: string[] = []
      messages.push(pc.redBright(await renderValidationErrorsBase(ctx, e)))
      messages.push(
        '',
        `For more info, run \`${ctx.env.name || ctx.translate('COMMAND')} ${ctx.name || ctx.translate('SUBCOMMAND')} --help\``,
        ''
      )
      return messages.join('\n')
    }
  })
}
