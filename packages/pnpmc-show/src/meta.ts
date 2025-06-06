/**
 * Entry point module for meta of pnpmc-show command.
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import type { Args, Command } from 'gunshi'

const args = {
  catalog: {
    type: 'boolean',
    description: 'Display the catalog only',
    short: 'c',
    default: false
  },
  dependency: {
    type: 'boolean',
    description: 'Display the catalogable dependencies only',
    short: 'd',
    default: false
  }
} satisfies Args

export default {
  name: 'show',
  description: 'Show the catalog and catalogable dependencies (default command)',
  args,
  examples: async ctx => `# Show the catalog and catalogable dependencies:
${ctx.callMode === 'entry' ? ctx.env.name : `${ctx.env.name} ${ctx.name}`} # \`pnpmc\` is equivalent to \`pnpm show\``
} satisfies Command<typeof args>
