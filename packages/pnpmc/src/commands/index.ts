/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { default as registerLazy } from './register/lazy.js'
import { default as showLazy } from './show/lazy.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const commands: Map<string, any> = new Map()
commands.set('show', showLazy)
commands.set('register', registerLazy)
