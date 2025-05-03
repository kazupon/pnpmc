/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import type { ArgOptions, Command } from 'gunshi'

const options = {
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
} satisfies ArgOptions

export default {
  name: 'register',
  description: 'Register the dependency to the catalog',
  options,
  examples: `# Register the dependency to the catalog:
pnpmc register --dependency typescript --alias ^5.7.9 --catalog tools`
} satisfies Command<typeof options>
