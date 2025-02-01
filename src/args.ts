import { parseArgs } from 'node:util'

export function parse(args: string[]) {
  return parseArgs({
    allowPositionals: true,
    strict: false,
    args,
    options: {
      help: {
        type: 'boolean',
        short: 'h'
      },
      version: {
        type: 'boolean',
        short: 'v'
      },
      catalog: {
        type: 'string',
        short: 'c',
        default: 'default'
      },
      dependency: {
        type: 'string',
        short: 'd'
      },
      alias: {
        type: 'string',
        short: 'a'
      }
    },
    tokens: true
  })
}

export function usage(): string {
  return `USAGE:
  pnpmc <options>

OPTIONS:
  --dependency, -d     Register the dependency. Use with --alias and --catalog options.
  --catalog, -c        Register the catalog. Use with --dependency and --alias options. Default is 'default'.
  --alias, -a          Register the alias. Use with --dependency and --catalog options.
  --help, -h           Show help.
  --version, -v        Show version.

EXAMPLES:
  1. Show the catalog and catalogable dependencies:
    pnpmc

  2. Register the dependency to the catalog:
    pnpmc --dependency typescript --alias ^5.7.9 --catalog tools
`
}
