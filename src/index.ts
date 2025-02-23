import path from 'node:path'
import { URL } from 'node:url'
import { run } from './command.js'
import { fail, readPackageJson } from './utils.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

async function main() {
  const pkgJson = await readPackageJson(path.resolve(__dirname, '../package.json'))
  const args = process.argv.slice(2)
  const env = {
    name: 'pnpmc',
    cwd: process.cwd(),
    description: pkgJson.description as string,
    version: pkgJson.version as string
  }
  await run(args, env)
}

main().catch(error => {
  fail(error)
})
