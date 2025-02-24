import { describe, expect, test } from 'vitest'
import { createCommandContext, renderHeader, renderUsage, renderUsageDefault } from './command'

import type { ArgOptions } from 'args-tokens'
import type { Command, LazyCommand } from './commands/types'

const NOOP = async () => {}

describe('renderHeader', () => {
  const command = {
    name: 'test',
    description: 'A test command',
    run: NOOP
  } as Command<ArgOptions>

  test('basic', () => {
    const ctx = createCommandContext(
      command.options,
      {},
      [],
      { cwd: '/path/to/cmd1', description: 'this is command line', version: '0.0.0', name: 'cmd1' },
      command
    )

    expect(renderHeader(ctx)).toEqual('this is command line (cmd1 v0.0.0)')
  })

  test('no description', () => {
    const ctx = createCommandContext(
      command.options,
      {},
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1' },
      command
    )

    expect(renderHeader(ctx)).toEqual('cmd1 (cmd1 v0.0.0)')
  })

  test('no name & no description', () => {
    const ctx = createCommandContext(command.options, {}, [], { cwd: '/path/to/cmd1' }, command)

    expect(renderHeader(ctx)).toEqual('')
  })

  test('no version', () => {
    const ctx = createCommandContext(
      command.options,
      {},
      [],
      { cwd: '/path/to/cmd1', name: 'cmd1', description: 'this is command line' },
      command
    )

    expect(renderHeader(ctx)).toEqual('this is command line (cmd1)')
  })
})

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
        examples: `# Example 1\n$ test --foo bar --bar --baz 42 --qux quux\n# Example 2\n$ test -f bar -b 42 -q quux`
      },
      run: NOOP
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
      run: NOOP
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
      run: NOOP
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
        examples: `# Example 1\n$ test --foo bar --bar --baz 42 --qux quux\n# Example 2\n$ test -f bar -b 42 -q quux`
      },
      run: NOOP
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

describe('renderUsageDefault', () => {
  const show = {
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
    name: 'show',
    description: 'A show command',
    usage: {
      options: {
        foo: 'The foo option',
        bar: 'The bar option',
        baz: 'The baz option',
        qux: 'The qux option'
      },
      examples: `# Example 1\n$ test --foo bar --bar --baz 42 --qux quux\n# Example 2\n$ test -f bar -b 42 -q quux`
    },
    run: NOOP
  } as Command<ArgOptions>

  const commands = {
    show,
    command1: {
      name: 'command1',
      options: {
        foo: {
          type: 'string',
          short: 'f'
        }
      },
      default: true,
      description: 'this is command1',
      usage: {
        options: {
          foo: 'The foo option'
        }
      },
      run: NOOP
    },
    command2: () =>
      Promise.resolve({
        name: 'command1',
        options: {
          bar: {
            type: 'boolean',
            short: 'b'
          }
        },
        description: 'this is command2',
        usage: {
          options: {
            bar: 'The bar option'
          }
        },
        run: NOOP
      })
  } as Record<string, Command<ArgOptions> | LazyCommand<ArgOptions>>

  test('basic', async () => {
    const ctx = createCommandContext(
      show.options,
      {},
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1', entry: show, subCommands: commands },
      show
    )

    expect(await renderUsageDefault(ctx)).toMatchSnapshot()
  })

  test('no subCommands', async () => {
    const ctx = createCommandContext(
      show.options,
      {},
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1', entry: show },
      show
    )

    expect(await renderUsageDefault(ctx)).toMatchSnapshot()
  })
})
