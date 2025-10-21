/**
 * Entry point module for meta of pnpmc-show command.
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { defineWithTypes } from 'gunshi/definition'

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
} as const

export default defineWithTypes<{ args: typeof args }>()({
  name: 'show',
  args,
  description: 'Show the catalog and catalogable dependencies (default command)',
  examples: async ctx => `# Show the catalog and catalogable dependencies:
${ctx.callMode === 'entry' ? ctx.env.name : `${ctx.env.name} ${ctx.name}`} # \`pnpmc\` is equivalent to \`pnpm show\``
})
