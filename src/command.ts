import { parseArgs, resolveArgs } from 'args-tokens'
import pc from 'picocolors'
import { fail, log, nullObject } from './utils.js'

import type { ArgOptions, ArgToken, ArgValues } from 'args-tokens'
import type {
  Command,
  CommandContext,
  CommandEnvironment,
  CommandOptions,
  CommandUsageRender,
  LazyCommand
} from './commands/types'

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
  return Object.entries(ctx.options!).reduce(
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
  const optionsMaxLength = Math.max(
    ...Object.entries(optionsPairs).map(([_, value]) => value.length)
  )
  const optionSchemaMaxLength = ctx.commandOptions.usageOptionType
    ? Math.max(...Object.entries(optionsPairs).map(([key, _]) => ctx.options![key].type.length))
    : 0
  return Object.entries(optionsPairs)
    .map(([key, value]) => {
      const rawDesc = resolveCommandUsageRender(ctx, ctx.usage.options![key])
      const optionsSchema = ctx.commandOptions.usageOptionType ? `[${ctx.options![key].type}] ` : ''
      // padEnd is used to align the `[]` symbols
      const desc = `${optionsSchema ? optionsSchema.padEnd(optionSchemaMaxLength + 3) : ''}${rawDesc}`
      const option = `${value.padEnd(optionsMaxLength + ctx.commandOptions.middleMargin)}${desc}`
      return `${option.padStart(ctx.commandOptions.leftMargin + option.length)}`
    })
    .join('\n')
}

function hasOptions<Options extends ArgOptions>(ctx: CommandContext<Options>): boolean {
  return !!(ctx.options && Object.keys(ctx.options).length > 0)
}

function hasRequiredOptions<Options extends ArgOptions>(ctx: CommandContext<Options>): boolean {
  return !!(ctx.options && Object.values(ctx.options).some(opt => opt.required))
}

function generateOptionsSymbols<Options extends ArgOptions>(ctx: CommandContext<Options>): string {
  return hasOptions(ctx) ? (hasRequiredOptions(ctx) ? '<OPTIONS>' : '[OPTIONS]') : ''
}

export function renderUsage<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): string {
  const messages: string[] = []

  // render description
  if (ctx.description) {
    messages.push(resolveCommandUsageRender(ctx, ctx.description), '')
  }

  // render usage
  const usageStr = `${ctx.env.name} ${ctx.name} ${generateOptionsSymbols(ctx)}`
  messages.push(`USAGE:`)
  messages.push(usageStr.padStart(ctx.commandOptions.leftMargin + usageStr.length))
  messages.push('')

  // render options
  if (hasOptions(ctx)) {
    messages.push('OPTIONS:')
    const optionsPairs = getOptionsPairs(ctx)
    messages.push(generateOptionsUsage(ctx, optionsPairs))
    messages.push('')
  }

  // render examples
  if (ctx.usage.examples) {
    const examples = resolveCommandUsageRender(ctx, ctx.usage.examples)
      .split('\n')
      .map(example => example.padStart(ctx.commandOptions.leftMargin + example.length))
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

export function renderHeader<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): string {
  const title = ctx.env.description || ctx.env.name || ''
  return title
    ? `${title} (${ctx.env.name}${ctx.env.version ? ` v${ctx.env.version}` : ''})`
    : title
}

export function createCommandContext<Options extends ArgOptions, Values = ArgValues<Options>>(
  options: Options | undefined,
  values: Values,
  positionals: string[],
  env: CommandEnvironment,
  command: Command<Options>,
  commandOptions: Required<CommandOptions> = COMMAND_OPTIONS_DEFAULT
): Readonly<CommandContext<Options, Values>> {
  const usage = command.usage || nullObject<Options>()
  usage.options = Object.assign(nullObject<Options>(), usage.options, COMMON_OPTIONS_USAGE)
  return Object.freeze({
    name: command.name,
    description: command.description,
    locale: new Intl.Locale('en'), // TODO: resolve locale on runtime and abstraction
    env,
    options,
    values,
    positionals,
    usage,
    commandOptions
  })
}

function resolveEntry<Options extends ArgOptions>(ctx: Readonly<CommandContext<Options>>): string {
  return `${ctx.env.name}` || '<COMMAND>'
}

export async function renderUsageDefault<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string> {
  const loadedCommands = await Promise.all(
    Object.entries(ctx.env.subCommands || {}).map(async ([_, cmd]) => await resolveLazyCommand(cmd))
  )

  const hasManyCommands = loadedCommands.length > 1
  const defaultCommand = `${ctx.env.name}${hasManyCommands ? ` [${ctx.name}]` : ''} ${hasOptions(ctx) ? '<OPTIONS>' : ''} `

  // render usage
  const messages = [
    'USAGE:',
    defaultCommand.padStart(ctx.commandOptions.leftMargin + defaultCommand.length)
  ]

  // render commands
  if (hasManyCommands) {
    const commandsUsage = `${resolveEntry(ctx)} <COMMANDS>`
    messages.push(commandsUsage.padStart(ctx.commandOptions.leftMargin + commandsUsage.length))
    messages.push('')
    messages.push('COMMANDS:')
    const commandMaxLength = Math.max(...loadedCommands.map(cmd => cmd.name.length))
    const commandsStr = loadedCommands.map(cmd => {
      const key = cmd.name
      const desc = resolveCommandUsageRender(ctx as CommandContext<Options>, cmd.description || '')
      const command = `${key.padEnd(commandMaxLength + ctx.commandOptions.middleMargin)}${desc} `
      return `${command.padStart(ctx.commandOptions.leftMargin + command.length)} `
    })
    messages.push(...commandsStr)
    messages.push('')
    messages.push(`For more info, run any command with the \`--help\` flag:`)
    messages.push(
      ...loadedCommands.map(cmd => {
        const commandHelp = `${ctx.env.name} ${cmd.name} --help`
        return `${commandHelp.padStart(ctx.commandOptions.leftMargin + commandHelp.length)}`
      })
    )
  }
  messages.push('')

  // render options
  if (hasOptions(ctx)) {
    messages.push('OPTIONS:')
    const optionsPairs = getOptionsPairs(ctx)
    messages.push(generateOptionsUsage(ctx, optionsPairs))
    messages.push('')
  }

  // render examples
  if (ctx.usage.examples) {
    const examples = resolveCommandUsageRender(ctx, ctx.usage.examples)
      .split('\n')
      .map(example => example.padStart(ctx.commandOptions.leftMargin + example.length))
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

function resolveOptions<Options extends ArgOptions>(options?: Options): Options {
  return Object.assign(Object.create(null) as Options, options, COMMON_OPTIONS)
}

function showHeader<Options extends ArgOptions>(ctx: CommandContext<Options>): void {
  const header = renderHeader(ctx)
  if (header) {
    log(pc.cyanBright(header))
    log()
  }
}

function showVersion<Options extends ArgOptions>(ctx: CommandContext<Options>): void {
  log(ctx.env.version)
}

function renderValidationErrors<Options extends ArgOptions>(
  ctx: CommandContext<Options>,
  error: AggregateError
): string {
  const messages = [] as string[]
  for (const err of error.errors as Error[]) {
    messages.push(err.message)
  }
  messages.push('')
  messages.push(`For more info, run \`${resolveEntry(ctx)} ${ctx.name} --help\``)
  return messages.join('\n')
}

function showValidationErrors<Options extends ArgOptions>(
  ctx: CommandContext<Options>,
  error: AggregateError
): void {
  log(renderValidationErrors(ctx, error))
}

async function resolveCommand<Options extends ArgOptions>(
  raw: string,
  env: CommandEnvironment<Options>
): Promise<[string | undefined, Command<Options> | undefined]> {
  const omitted = !raw
  if (omitted) {
    let name: string | undefined
    if (env.entry) {
      if (typeof env.entry === 'string') {
        name = env.entry
      } else if (typeof env.entry === 'object') {
        return [env.entry.name, env.entry]
      }
    }

    if (env.subCommands == null) {
      return [undefined, undefined]
    }

    if (name) {
      // find sub command with entry command name
      return [raw, await loadCommand(raw, env)]
    } else {
      // find command from such commands that has default flag
      const found = (
        await Promise.all(
          Object.entries(env.subCommands || {}).map(
            async ([_, cmd]) => await resolveLazyCommand(cmd)
          )
        )
      ).find(cmd => cmd.default)
      return found ? [found.name, found] : [undefined, undefined]
    }
  } else {
    if (env.subCommands == null) {
      return [raw, undefined]
    }
    return [raw, await loadCommand(raw, env)]
  }
}

async function resolveLazyCommand<Options extends ArgOptions>(
  cmd: Command<Options> | LazyCommand<Options>
): Promise<Command<Options>> {
  return typeof cmd == 'function' ? await cmd() : cmd
}

async function loadCommand<Options extends ArgOptions>(
  name: string,
  env: CommandEnvironment<Options>
): Promise<Command<Options>> {
  const cmd = env.subCommands![name]
  return await resolveLazyCommand(cmd)
}

const COMMAND_OPTIONS_DEFAULT: Required<CommandOptions> = {
  leftMargin: 2,
  middleMargin: 10,
  usageOptionType: false
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
  opts: CommandOptions = COMMAND_OPTIONS_DEFAULT
): Promise<void> {
  const tokens = parseArgs(args)

  const raw = getCommandRaw(tokens)
  const [name, command] = await resolveCommand(raw, env)
  if (!command) {
    fail(`Command not found: ${name || ''}`)
  }

  const options = resolveOptions(command.options)

  const { values, positionals, error } = resolveArgs(options, tokens)
  const ctx = createCommandContext(
    options,
    values,
    positionals,
    env,
    command,
    opts as Required<CommandOptions>
  )
  if (values.version) {
    showVersion(ctx)
    return
  }

  showHeader(ctx)

  if (values.help) {
    const omitted = !raw
    if (omitted) {
      await showUsageDefault(ctx)
      return
    } else {
      showUsage(ctx)
      return
    }
  }

  if (error) {
    showValidationErrors(ctx, error)
    fail() // TODO: should we fail?
  }

  await command.run(ctx)
}
