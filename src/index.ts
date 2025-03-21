import { interopDefault } from '@kazupon/jts-utils'
import { cli } from 'gunshi'
import {
  renderHeader as renderHeaderBase,
  renderValidationErrors as renderValidationErrorsBase
} from 'gunshi/renderer'
import pc from 'picocolors'
import { commands } from './commands/index.js'
import { default as show } from './commands/show.js'
import { fail } from './utils.js'

async function main() {
  const pkgJson = await interopDefault(import('../package.json', { with: { type: 'json' } }))

  await cli(process.argv.slice(2), show, {
    name: 'pnpmc',
    cwd: process.cwd(),
    description: pkgJson.description,
    version: pkgJson.version,
    subCommands: commands,
    renderHeader: async ctx => pc.cyanBright(await renderHeaderBase(ctx)),
    renderValidationErrors: async (ctx, e) => {
      const messages: string[] = []
      messages.push(pc.redBright(await renderValidationErrorsBase(ctx, e)))
      messages.push(
        '',
        `For more info, run \`${ctx.env.name || ctx.translation('COMMAND')} ${ctx.name || ctx.translation('SUBCOMMAND')} --help\``,
        ''
      )
      return messages.join('\n')
    }
  })
}

main().catch(error => {
  fail(error)
})
