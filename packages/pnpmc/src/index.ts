/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { runCli } from 'pnpmc-utils'
import { commands, showLazy } from './commands.js'

async function main() {
  const { default: pkgJson } = await import('../package.json', { with: { type: 'json' } })
  await runCli(process.argv.slice(2), showLazy, {
    pkgJson,
    cwd: process.cwd(),
    subCommands: commands
  })
}

await main()
