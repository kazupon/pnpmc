import { describe, expect, test } from 'vitest'
import { createCommandContext, renderUsage } from './command'

import type { ArgOptions } from 'args-tokens'
import type { Command } from './commands/types'

describe('renderUsage', () => {
  test('basic', () => {
    const command = {
      options: {
        foo: {
          type: 'string',
          short: 'f'
        },
        bar: {
          type: 'boolean'
        },
        baz: {
          type: 'number',
          short: 'b',
          default: 42
        },
        qux: {
          type: 'string',
          short: 'q',
          required: true
        }
      },
      name: 'test',
      description: 'A test command',
      usage: {
        options: {
          foo: 'The foo option',
          bar: 'The bar option',
          baz: 'The baz option',
          qux: 'The qux option'
        },
        examples: `# Example 1\n $test --foo bar --bar --baz 42 --qux quux\n# Example 2\n$ test -f bar -b 42 -q quux`
      },
      run: async () => {
        // something here
      }
    } as Command<ArgOptions>
    const ctx = createCommandContext(
      command.options,
      {}, // argument values
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1' },
      command
    )

    expect(renderUsage(ctx)).toMatchSnapshot()
  })

  test('no options', () => {
    const command = {
      name: 'test',
      description: 'A test command',
      usage: {
        examples: `# Example 1\n $test\n# Example 2\n$ test`
      },
      run: async () => {
        // something here
      }
    } as Command<ArgOptions>
    const ctx = createCommandContext(
      command.options,
      {}, // argument values
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1' },
      command
    )

    expect(renderUsage(ctx)).toMatchSnapshot()
  })

  test('no required options', () => {
    const command = {
      options: {
        foo: {
          type: 'string',
          short: 'f'
        },
        bar: {
          type: 'boolean'
        },
        baz: {
          type: 'number',
          short: 'b',
          default: 42
        }
      },
      name: 'test',
      description: 'A test command',
      usage: {
        options: {
          foo: 'The foo option',
          bar: 'The bar option',
          baz: 'The baz option'
        }
      },
      run: async () => {
        // something here
      }
    } as Command<ArgOptions>
    const ctx = createCommandContext(
      command.options,
      {}, // argument values
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1' },
      command
    )

    expect(renderUsage(ctx)).toMatchSnapshot()
  })

  test('no examples', () => {
    const command = {
      options: {
        foo: {
          type: 'string',
          short: 'f'
        },
        bar: {
          type: 'boolean'
        },
        baz: {
          type: 'number',
          short: 'b',
          default: 42
        },
        qux: {
          type: 'string',
          short: 'q',
          required: true
        }
      },
      name: 'test',
      description: 'A test command',
      usage: {
        options: {
          foo: 'The foo option',
          bar: 'The bar option',
          baz: 'The baz option',
          qux: 'The qux option'
        }
      },
      run: async () => {
        // something here
      }
    } as Command<ArgOptions>
    const ctx = createCommandContext(
      command.options,
      {}, // argument values
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1' },
      command
    )

    expect(renderUsage(ctx)).toMatchSnapshot()
  })

  test('enable usageOptionType', () => {
    const command = {
      options: {
        foo: {
          type: 'string',
          short: 'f'
        },
        bar: {
          type: 'boolean'
        },
        baz: {
          type: 'number',
          short: 'b',
          default: 42
        },
        qux: {
          type: 'string',
          short: 'q',
          required: true
        }
      },
      name: 'test',
      description: 'A test command',
      usage: {
        options: {
          foo: 'The foo option',
          bar: 'The bar option',
          baz: 'The baz option',
          qux: 'The qux option'
        },
        examples: `# Example 1\n $test --foo bar --bar --baz 42 --qux quux\n# Example 2\n$ test -f bar -b 42 -q quux`
      },
      run: async () => {
        // something here
      }
    } as Command<ArgOptions>
    const ctx = createCommandContext(
      command.options,
      {}, // argument values
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1' },
      command,
      { usageOptionType: true, leftMargin: 4, middleMargin: 12 }
    )

    expect(renderUsage(ctx)).toMatchSnapshot()
  })
})

describe.skip('renderUsageDefault', () => {})
