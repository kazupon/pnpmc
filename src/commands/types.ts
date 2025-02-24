import type { Awaitable } from '@kazupon/jts-utils'
import type { ArgOptions, ArgValues } from 'args-tokens'

/**
 * The command environment
 */
export interface CommandEnvironment {
  /**
   * The current working directory
   */
  cwd: string
  /**
   * The command name
   */
  name: string
  /**
   * The command description
   */
  description?: string
  /**
   * The command version
   */
  version?: string
}

export interface CommandOptions {
  /**
   * The left margin of the command output
   * @default 2
   */
  leftMargin?: number
  /**
   * The middle margin of the command output
   * @default 10
   */
  middleMargin?: number
  /**
   * Whether to display the usage option type
   * @default false
   */
  usageOptionType?: boolean
}

export interface CommandContext<Options extends ArgOptions, Values = ArgValues<Options>> {
  name: string
  description: CommandUsageRender<Options>
  locale: Intl.Locale
  env: CommandEnvironment
  options?: Options
  values: Values
  positionals: string[]
  usage: CommandUsage<Options>
  commandOptions: Required<CommandOptions>
}

export type CommandUsageRender<Options extends ArgOptions> =
  | ((ctx: CommandContext<Options>) => string)
  | string

interface CommandUsage<Options extends ArgOptions> {
  options?: {
    [Option in keyof Options]: CommandUsageRender<Options>
  }
  examples?: CommandUsageRender<Options>
}

export interface Command<Options extends ArgOptions> {
  name: string
  description: CommandUsageRender<Options>
  options?: Options
  usage?: CommandUsage<Options>
  run(ctx: CommandContext<Options>): Awaitable<void>
}
