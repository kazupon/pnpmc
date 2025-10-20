/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { runCli } from 'pnpmc-utils'
import show from './index.js'

async function main() {
  const { default: pkgJson } = await import('../package.json', { with: { type: 'json' } })
  await runCli(process.argv.slice(2), show, {
    pkgJson,
    cwd: process.cwd()
  })
}

await main()
