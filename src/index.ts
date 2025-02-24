import path from 'node:path'
import { URL } from 'node:url'
import { run } from './command.js'
import { commands } from './commands/index.js'
import { default as show } from './commands/show.js'
import { fail, readPackageJson } from './utils.js'

import type { ArgOptions } from 'args-tokens'
import type { CommandEnvironment } from './commands/types'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

async function main() {
  const pkgJson = await readPackageJson(path.resolve(__dirname, '../package.json'))

  const env = {
    name: 'pnpmc',
    cwd: process.cwd(),
    description: pkgJson.description as string,
    version: pkgJson.version as string,
    entry: show,
    subCommands: commands
  } satisfies CommandEnvironment<ArgOptions>

  await run<ArgOptions>(process.argv.slice(2), env)
}

main().catch(error => {
  fail(error)
})
