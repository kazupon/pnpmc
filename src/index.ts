import { run } from './command.js'
import { fail } from './utils.js'

async function main() {
  await run(process.argv.slice(2), process.cwd())
}

main().catch(error => {
  fail(error)
})
