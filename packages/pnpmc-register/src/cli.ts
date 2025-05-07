/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { fail, runCli } from 'pnpmc-utils'
import { default as register } from './index.js'

async function main() {
  const pkgJson = (await import('../package.json', { with: { type: 'json' } })).default
  await runCli(process.argv.slice(2), register, {
    pkgJson,
    cwd: process.cwd()
  })
}

main().catch(error => {
  fail(error)
})
