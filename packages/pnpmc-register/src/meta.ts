/**
 * Entry point module for meta of pnpmc-register command.
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { defineWithTypes } from 'gunshi/definition'

const args = {
  catalog: {
    type: 'string',
    description: 'Register the catalog. Use with --dependency and --alias options.',
    short: 'c',
    default: 'default'
  },
  dependency: {
    type: 'string',
    description: 'Register the dependency, required. use with --alias and --catalog options',
    short: 'd',
    required: true
  },
  alias: {
    type: 'string',
    description: 'Register the alias, required. Use with --dependency and --catalog options',
    short: 'a',
    required: true
  }
} as const

export default defineWithTypes<{ args: typeof args }>()({
  name: 'register',
  description: 'Register the dependency to the catalog',
  args,
  examples: async ctx => `# Register the dependency to the catalog:
${ctx.callMode === 'entry' ? ctx.env.name : `${ctx.env.name} ${ctx.name}`} --dependency typescript --alias ^5.7.9 --catalog tools`
})
