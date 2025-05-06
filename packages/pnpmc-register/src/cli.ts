/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { interopDefault } from '@kazupon/jts-utils'
import { cli } from 'gunshi'
import {
  renderHeader as renderHeaderBase,
  renderValidationErrors as renderValidationErrorsBase
} from 'gunshi/renderer'
import pc from 'picocolors'
import { default as register } from './index.js'
import { fail } from './utils.js'

async function main() {
  const pkgJson = await interopDefault(import('../package.json', { with: { type: 'json' } }))

  await cli(process.argv.slice(2), register, {
    name: pkgJson.name,
    cwd: process.cwd(),
    description: pkgJson.description,
    version: pkgJson.version,
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

main().catch(error => {
  fail(error)
})
