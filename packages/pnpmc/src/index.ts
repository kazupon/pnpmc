/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { fail, runCli } from 'pnpmc-utils'
import { commands, showLazy } from './commands.js'

async function main() {
  const pkgJson = (await import('../package.json', { with: { type: 'json' } })).default
  await runCli(process.argv.slice(2), showLazy, {
    pkgJson,
    cwd: process.cwd(),
    subCommands: commands
  })
}

main().catch(error => {
  fail(error)
})
