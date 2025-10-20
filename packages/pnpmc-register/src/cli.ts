/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { runCli } from 'pnpmc-utils'
import register from './index.js'

async function main() {
  const { default: pkgJson } = await import('../package.json', { with: { type: 'json' } })
  await runCli(process.argv.slice(2), register, {
    pkgJson,
    cwd: process.cwd()
  })
}

await main()
