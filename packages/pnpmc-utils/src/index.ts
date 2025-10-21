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

const rendererId: RendererId = 'g:renderer'

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
  options: CliOptions<G> & { pkgJson: { name: string; description: string; version: string } }
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

      // render validation errors of gunshi core
      messages.push(pc.redBright(await renderValidationErrorsBase(ctx, e)))

      // render help suggestion
      const cmdName = ctx.env.name ?? renderer?.text('_:COMMAND') ?? '<command>'
      const subCmdName = ctx.name ?? renderer?.text('_:SUBCOMMAND') ?? '<subcommand>'
      messages.push('', `For more info, run \`${cmdName} ${subCmdName} --help\``, '')

      return messages.join('\n')
    }
  })
}
