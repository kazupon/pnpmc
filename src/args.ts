import { parseArgs } from 'node:util'

const SUB_COMMANDS = ['register', 'show'] as const
const DEFAULT_COMMAND = 'show' satisfies SubCommand

type SubCommand = (typeof SUB_COMMANDS)[number]

export function parse(args: string[]) {
  const result = parseArgs({
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

  const firstToken = result.tokens[0]
  const command: SubCommand = firstToken
    ? firstToken.kind === 'positional' &&
      firstToken.index === 0 &&
      (SUB_COMMANDS as unknown as string[]).includes(firstToken.value)
      ? (firstToken.value as SubCommand)
      : DEFAULT_COMMAND
    : DEFAULT_COMMAND

  return {
    command,
    options: result.values
  }
}

export function usage(): string {
  return `USAGE:
  pnpmc <commands> <options>

COMMANDS:
  show                 Show the catalog and catalogable dependencies.
  register             Register the dependency to the catalog.

OPTIONS:
  --dependency, -d     Register the dependency. Use with --alias and --catalog options.
  --catalog, -c        Register the catalog. Use with --dependency and --alias options. Default is 'default'.
  --alias, -a          Register the alias. Use with --dependency and --catalog options.
  --help, -h           Show help.
  --version, -v        Show version.

EXAMPLES:
  1. Show the catalog and catalogable dependencies:
    pnpmc  # \`pnpmc\` is equivalent to \`pnpm show\`

  2. Register the dependency to the catalog:
    pnpmc register --dependency typescript --alias ^5.7.9 --catalog tools
`
}
