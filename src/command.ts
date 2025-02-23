import { parseArgs, resolveArgs } from 'args-tokens'
import pc from 'picocolors'
import { commands } from './commands/index.js'
import { fail, log } from './utils.js'

import type { ArgOptions, ArgToken, ArgValues } from 'args-tokens'
import type {
  Command,
  CommandContext,
  CommandEnvironment,
  CommandUsageRender
} from './commands/types'

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

const COMMON_OPTIONS_USAGE: Record<
  keyof typeof COMMON_OPTIONS,
  CommandUsageRender<typeof COMMON_OPTIONS>
> = {
  help: 'Display this help message',
  version: 'Display this version'
}

function resolveCommandUsageRender<Options extends ArgOptions>(
  ctx: CommandContext<Options>,
  redner: CommandUsageRender<Options>
): string {
  return typeof redner === 'function' ? redner(ctx) : redner
}

function showUsage<Options extends ArgOptions>(ctx: CommandContext<Options>): void {
  log(renderUsage(ctx))
}

function getOptionsPairs<Options extends ArgOptions>(
  ctx: CommandContext<Options>
): Record<string, string> {
  return Object.entries(ctx.options).reduce(
    (acc, [name, value]) => {
      let key = `--${name}`
      if (value.short) {
        key = `-${value.short}, ${key}`
      }
      if (value.type !== 'boolean') {
        if (value.required) {
          key = `${key} <${name}>`
        } else {
          if (value.default) {
            key = `${key} [${name}]`
          }
        }
      }
      acc[name] = key
      return acc
    },
    {} as Record<string, string>
  )
}

function generateOptionsUsage<Options extends ArgOptions>(
  ctx: CommandContext<Options>,
  optionsPairs: Record<string, string>
): string {
  const optoinsMaxLength = Math.max(
    ...Object.entries(optionsPairs).map(([_, value]) => value.length)
  )
  return Object.entries(optionsPairs)
    .map(([key, value]) => {
      const desc = resolveCommandUsageRender(ctx, ctx.usage.options[key])
      const option = `${value.padEnd(optoinsMaxLength + ctx.middleMargin)}${desc || ''}`
      return `${option.padStart(ctx.leftMargin + option.length)}`
    })
    .join('\n')
}

function renderUsage<Options extends ArgOptions>(ctx: CommandContext<Options>): string {
  const hasOptions = Object.keys(ctx.options).length > 0
  const usageStr = `${ctx.env.name} ${ctx.name} ${hasOptions ? '<OPTIONS>' : ''}`

  // render description
  const messages = [resolveCommandUsageRender(ctx, ctx.description), '']

  // render usage
  messages.push(`USAGE:`)
  messages.push(usageStr.padStart(ctx.leftMargin + usageStr.length))
  messages.push('')

  // render options
  if (hasOptions) {
    messages.push('OPTIONS:')
    const optionsPairs = getOptionsPairs(ctx)
    messages.push(generateOptionsUsage(ctx, optionsPairs))
    messages.push('')
  }

  // render examples
  if (ctx.usage.examples) {
    const examples = resolveCommandUsageRender(ctx, ctx.usage.examples)
      .split('\n')
      .map(exmaple => exmaple.padStart(ctx.leftMargin + exmaple.length))
    messages.push(`EXAMPLES: `)
    messages.push(...examples)
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

function renderHeader<Options extends ArgOptions>(ctx: CommandContext<Options>): string {
  return `${ctx.env.description || ctx.env.name} (${ctx.env.name} v${ctx.env.version || 'N/A'})`
}

export function createCommandContext<Options extends ArgOptions, Values = ArgValues<Options>>(
  options: Options,
  values: Values,
  positionals: string[],
  env: CommandEnvironment,
  command: Command<Options>,
  leftMargin = 2,
  middleMargin = 10
): CommandContext<Options, Values> {
  const usage = command.usage
  usage.options = Object.assign(Object.create(null) as Options, usage.options, COMMON_OPTIONS_USAGE)
  return {
    name: command.name,
    description: command.description,
    locale: new Intl.Locale('en'), // TODO: resolve locale on runtime and abstraction
    env,
    options,
    values,
    positionals,
    usage,
    leftMargin,
    middleMargin
  }
}

async function renderUsageDefault<Options extends ArgOptions>(
  ctx: CommandContext<Options>
): Promise<string> {
  const loadedCommands = (await Promise.all(
    Object.entries(commands).map(async ([key, cmd]) => [key, await cmd()])
  )) as [Commands, Command<ArgOptions>][]
  const hasOptions = Object.keys(ctx.options).length > 0

  const defaultCommand = `${ctx.env.name} [show] ${hasOptions ? '<OPTIONS>' : ''} `
  const hasManyCommands = loadedCommands.length > 1

  // render usage
  const messages = ['USAGE:', defaultCommand.padStart(ctx.leftMargin + defaultCommand.length)]

  // render commands
  if (hasManyCommands) {
    const commandsUsage = `${ctx.env.name} <COMMANDS>`
    messages.push(commandsUsage.padStart(ctx.leftMargin + commandsUsage.length))
    messages.push('')
    messages.push('COMMANDS:')
    const commandMaxLength = Math.max(...loadedCommands.map(([key, _]) => key.length))
    const commandsStr = loadedCommands.map(([key, cmd]) => {
      const desc = resolveCommandUsageRender(ctx, cmd.description)
      const command = `${key.padEnd(commandMaxLength + ctx.middleMargin)}${desc} `
      return `${command.padStart(ctx.leftMargin + command.length)} `
    })
    messages.push(...commandsStr)
    messages.push('')
    messages.push(`For more info, run any command with the \`--help\` flag:`)
    messages.push(
      ...loadedCommands.map(([key, _]) => {
        const commandHelp = `${ctx.env.name} ${key} --help`
        return `${commandHelp.padStart(ctx.leftMargin + commandHelp.length)}`
      })
    )
    messages.push('')
  }

  // render options
  if (hasOptions) {
    messages.push('OPTIONS:')
    const optionsPairs = getOptionsPairs(ctx)
    messages.push(generateOptionsUsage(ctx, optionsPairs))
    messages.push('')
  }

  // render examples
  if (ctx.usage.examples) {
    const examples = resolveCommandUsageRender(ctx, ctx.usage.examples)
      .split('\n')
      .map(exmaple => exmaple.padStart(ctx.leftMargin + exmaple.length))
    messages.push(`EXAMPLES:`)
    messages.push(...examples)
  }
  messages.push('')

  return messages.join('\n')
}

async function showUsageDefault<Options extends ArgOptions>(
  ctx: CommandContext<Options>
): Promise<void> {
  log(await renderUsageDefault(ctx))
}

function resolveOptions<Options extends ArgOptions>(options: Options): Options {
  return Object.assign(Object.create(null) as Options, options, COMMON_OPTIONS)
}

function showHeader<Options extends ArgOptions>(ctx: CommandContext<Options>): void {
  log(pc.cyanBright(renderHeader(ctx)))
}

function showVersion<Options extends ArgOptions>(ctx: CommandContext<Options>): void {
  log(ctx.env.version)
}

function showValidationErrors(error: AggregateError): void {
  for (const err of error.errors as Error[]) {
    console.error(pc.red(err.message))
  }
}

function showMoreUsage(command: string): void {
  log(`For more info, run \`pnpmc ${command} --help\``)
}

interface CommandOptions {
  /**
   * The left margin of the command output
   * @default 2
   */
  leftMargin: number
  /**
   * The middle margin of the command output
   * @default 10
   */
  middleMargin: number
}

/**
 * Run the command
 * @param args - command line arguments
 * @param env - a {@link CommandEnvironment | command environment}
 * @param opts - a {@link CommandOptions | command options}
 */
export async function run(
  args: string[],
  env: CommandEnvironment,
  opts: CommandOptions = {
    leftMargin: 2,
    middleMargin: 10
  }
): Promise<void> {
  const tokens = parseArgs(args)
  const rawCommand = getCommandRaw(tokens)

  const omitted = !rawCommand
  const command = (rawCommand || DEFAULT_COMMAND) as Commands
  const resolvedCommand = (await commands[command]()) as Command<ArgOptions>
  const options = resolveOptions(resolvedCommand.options)

  const { values, positionals, error } = resolveArgs(options, tokens)
  const ctx = createCommandContext(
    options,
    values,
    positionals,
    env,
    resolvedCommand,
    opts.leftMargin,
    opts.middleMargin
  )
  if (values.version) {
    showVersion(ctx)
    return
  }

  showHeader(ctx)
  log()

  if (values.help) {
    if (omitted) {
      await showUsageDefault(ctx)
      return
    } else {
      showUsage(ctx)
      return
    }
  }

  if (error) {
    showValidationErrors(error)
    log()
    showMoreUsage(command)
    fail()
  }

  await resolvedCommand.run(ctx)
}
