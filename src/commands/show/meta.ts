/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import type { ArgOptions, Command } from 'gunshi'

const options = {
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
} satisfies ArgOptions

export default {
  name: 'show',
  description: 'Show the catalog and catalogable dependencies (default command)',
  options,
  examples: `# Show the catalog and catalogable dependencies:
pnpmc  # \`pnpmc\` is equivalent to \`pnpm show\``
} satisfies Command<typeof options>
