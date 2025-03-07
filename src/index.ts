import { cli } from 'gunshi'
import {
  renderHeader as renderHeaderBase,
  renderValidationErrors as renderValidationErrorsBase
} from 'gunshi/renderer'
import path from 'node:path'
import { URL } from 'node:url'
import pc from 'picocolors'
import { commands } from './commands/index.js'
import { default as show } from './commands/show.js'
import { fail, readPackageJson } from './utils.js'

import type { ArgOptions, Command } from 'gunshi'

// import type { CommandEnvironment, ArgOptions } from 'gunshi'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

async function main() {
  const pkgJson = await readPackageJson(path.resolve(__dirname, '../package.json'))

  await cli<ArgOptions>(process.argv.slice(2), show as unknown as Command<ArgOptions>, {
    name: 'pnpmc',
    cwd: process.cwd(),
    description: pkgJson.description as string,
    version: pkgJson.version as string,
    subCommands: commands,
    renderHeader: async ctx => pc.cyanBright(await renderHeaderBase(ctx)),
    renderValidationErrors: async (ctx, e) => pc.redBright(await renderValidationErrorsBase(ctx, e))
  })
}

main().catch(error => {
  fail(error)
})
