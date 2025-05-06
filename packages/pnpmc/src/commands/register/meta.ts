/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import type { Args, Command } from 'gunshi'

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
} satisfies Args

export default {
  name: 'register',
  description: 'Register the dependency to the catalog',
  args,
  examples: `# Register the dependency to the catalog:
pnpmc register --dependency typescript --alias ^5.7.9 --catalog tools`
} satisfies Command<typeof args>
