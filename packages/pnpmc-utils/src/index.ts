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

import type { PluginId as RendererId, UsageRendererExtension } from '@gunshi/plugin-renderer'
import type { Args, CliOptions, Command, DefaultGunshiParams, GunshiParams } from 'gunshi'

const rendererId = 'g:renderer'

type PnpmcExtension = Record<RendererId, UsageRendererExtension>

export function log(...args: unknown[]): void {
  console.log(...args)
}

export function fail(...messages: unknown[]): never {
  console.error(...messages)
  // eslint-disable-next-line unicorn/no-process-exit -- NOTE: This is a CLI utility
  process.exit(1)
}

export async function runCli<G extends GunshiParams = DefaultGunshiParams>(
  args: string[],
  entry: Command<G>,
  options: {
    pkgJson: { name: string; description: string; version: string }
    subCommands?: CliOptions['subCommands']
    cwd: string
  }
) {
  await cli<GunshiParams<{ extensions: PnpmcExtension; args: Args }>>(args, entry, {
    name: options.pkgJson.name,
    description: options.pkgJson.description,
    version: options.pkgJson.version,
    subCommands: options.subCommands,
    cwd: options.cwd,
    renderHeader: process.env.PMPMC_LOADED
      ? null
      : async ctx => pc.cyanBright(await renderHeaderBase(ctx)),
    renderValidationErrors: async (ctx, e) => {
      const renderer = ctx.extensions[rendererId]
      const messages: string[] = []
      messages.push(pc.redBright(await renderValidationErrorsBase(ctx, e)))
      // eslint-disable-next-line unicorn/prefer-single-call -- NOTE: readability
      messages.push(
        '',
        `For more info, run \`${ctx.env.name || renderer.text('_:COMMAND')} ${ctx.name || renderer.text('_:SUBCOMMAND')} --help\``,
        ''
      )
      return messages.join('\n')
    }
  })
}
