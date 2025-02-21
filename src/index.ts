import { run } from './command'
import { fail } from './utils'

async function main() {
  await run(process.argv.slice(2), process.cwd())
}

main().catch(error => {
  fail(error)
})
