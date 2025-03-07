import { interopDefault } from '@kazupon/jts-utils'

import type { ArgOptions, Command, LazyCommand } from 'gunshi'

export const commands = new Map<string, Command<ArgOptions> | LazyCommand<ArgOptions>>()
commands.set(
  'show',
  (async () => await interopDefault(import('./show.js'))) as unknown as LazyCommand<ArgOptions>
)
commands.set(
  'register',
  (async () => await interopDefault(import('./register.js'))) as unknown as LazyCommand<ArgOptions>
)
