import { parseArgs, resolveArgs } from 'args-tokens'
import path from 'node:path'
import pc from 'picocolors'
import { commands } from './commands/index.js'
import { fail, log, readPackageJson } from './utils.js'

import type { ArgOptions, ArgToken, ArgValues } from 'args-tokens'
import type { Command, CommandContext, CommandHelpRender } from './commands/types'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

type Commands = keyof typeof commands

const DEFAULT_COMMAND = 'show'

const COMMON_OPTIONS = {
  help: {
    type: 'boolean',
    short: 'h'
  },
  version: {
    type: 'boolean',
    short: 'v'
  }
} as const satisfies ArgOptions

function resolveCommandHelpRender<Options extends ArgOptions>(
  ctx: CommandContext<Options>,
  redner: CommandHelpRender<Options>
): string {
  return typeof redner === 'function' ? redner(ctx) : redner
}

export function showHelp<Options extends ArgOptions>(ctx: CommandContext<Options>): void {
  log(renderHelp(ctx))
}

function renderHelp<Options extends ArgOptions>(ctx: CommandContext<Options>): string {
  const messages = [
    `${resolveCommandHelpRender(ctx, ctx.description)}

USAGE:
${resolveCommandHelpRender(ctx, ctx.help.usage)}

OPTIONS:
${resolveCommandHelpRender(ctx, ctx.help.options)}
`
  ]

  if (ctx.help.examples) {
    messages.push(`EXAMPLES:
${resolveCommandHelpRender(ctx, ctx.help.examples)}`)
  } else {
    messages.push('')
  }

  return messages.join('\n')
}

function getCommandRaw(tokens: ArgToken[]): string {
  const firstToken = tokens[0]
  if (
    firstToken &&
    firstToken.kind === 'positional' &&
    firstToken.index === 0 &&
    firstToken.value
  ) {
    return firstToken.value
  } else {
    return ''
  }
}

async function version(): Promise<string> {
  const pkgJson = await readPackageJson(path.resolve(__dirname, '../package.json'))
  return `${pkgJson.version as string}`
}

async function header(): Promise<string> {
  const pkgJsonPath = path.resolve(__dirname, '../package.json')
  const pkgJson = await readPackageJson(pkgJsonPath)
  const version = pkgJson.version as string
  const name = pkgJson.name as string
  const title = pkgJson.description as string
  return `${title} (${name} v${version})`
}

export function createCommandContext<Options extends ArgOptions, Values = ArgValues<Options>>(
  options: Options,
  values: Values,
  positionals: string[],
  cwd: string,
  command: Command<Options>
): CommandContext<Options, Values> {
  return {
    description: command.description,
    locale: new Intl.Locale('en'), // TODO: resolve locale on runtime and abstraction
    cwd,
    options,
    values,
    positionals,
    help: command.help
  }
}

async function showHelpDefault<Options extends ArgOptions>(
  ctx: CommandContext<Options>
): Promise<void> {
  const loadedCommands = (await Promise.all(
    Object.entries(commands).map(async ([key, cmd]) => [key, await cmd()])
  )) as [Commands, Command<ArgOptions>][]

  const message = `USAGE:
  pnpmc [show] <OPTIONS>
  pnpmc <COMMANDS>

COMMANDS:
${loadedCommands.map(([key, cmd]) => `  ${key.padEnd(21)}${resolveCommandHelpRender(ctx, cmd.description)}`).join('\n')}

For more info, run any command with the \`--help\` flag:
${loadedCommands.map(([key, _]) => `  pnpmc ${key} --help`).join('\n')}

OPTIONS:
${resolveCommandHelpRender(ctx, ctx.help.options)}
  -v, --version        Display the version

EXAMPLES:
${loadedCommands
  .map(([_, cmd]) => cmd.help.examples)
  .filter(Boolean)
  .join('\n\n')}
`
  log(message)
}

function resolveOptions<Options extends ArgOptions>(options: Options): Options {
  return Object.assign(Object.create(null) as Options, options, COMMON_OPTIONS)
}

async function showHeader(): Promise<void> {
  log(pc.cyanBright(await header()))
  log()
}

export async function run(args: string[], cwd: string): Promise<void> {
  const tokens = parseArgs(args)
  const rawCommand = getCommandRaw(tokens)

  const omitted = !rawCommand
  const command = (rawCommand || DEFAULT_COMMAND) as Commands
  const resolvedCommand = (await commands[command]()) as Command<ArgOptions>
  const options = resolveOptions(resolvedCommand.options)

  let resolvedArgs: ReturnType<typeof resolveArgs> | undefined
  try {
    resolvedArgs = resolveArgs(options, tokens)
  } catch (e: unknown) {
    await showHeader()
    if (e instanceof AggregateError) {
      for (const err of e.errors as Error[]) {
        console.error(pc.red(err.message))
      }
      log()
      log(`For more info, run \`pnpmc ${command} --help\` flag`)
      fail()
    } else {
      throw e
    }
  }

  await showHeader()
  const { values, positionals } = resolvedArgs
  if (values.version) {
    log(await version())
    return
  }

  const ctx = createCommandContext(options, values, positionals, cwd, resolvedCommand)
  if (values.help) {
    if (omitted) {
      await showHelpDefault(ctx)
      return
    } else {
      showHelp(ctx)
      return
    }
  }

  await resolvedCommand.run(ctx)
}
