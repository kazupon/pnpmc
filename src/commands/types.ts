import type { Awaitable } from '@kazupon/jts-utils'
import type { ArgOptions, ArgValues } from 'args-tokens'

export interface CommandContext<Options extends ArgOptions, Values = ArgValues<Options>> {
  description: CommandHelpRender<Options>
  locale: Intl.Locale
  cwd: string
  options: Options
  values: Values
  positionals: string[]
  help: CommandHelp<Options>
}

export type CommandHelpRender<Options extends ArgOptions> =
  | ((ctx: CommandContext<Options>) => string)
  | string

interface CommandHelp<Options extends ArgOptions> {
  usage: CommandHelpRender<Options>
  options: CommandHelpRender<Options>
  examples?: CommandHelpRender<Options>
}

export interface Command<Options extends ArgOptions> {
  options: Options
  description: CommandHelpRender<Options>
  help: CommandHelp<Options>
  run(ctx: CommandContext<Options>): Awaitable<void>
}
