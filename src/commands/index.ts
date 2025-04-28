/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { interopDefault } from '@kazupon/jts-utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const commands: Map<string, any> = new Map()
commands.set('show', async () => await interopDefault(import('./show.js')))
commands.set('register', async () => await interopDefault(import('./register.js')))
