import { interopDefault } from '@kazupon/jts-utils'

export const commands = new Map()
commands.set('show', async () => await interopDefault(import('./show.js')))
commands.set('register', async () => await interopDefault(import('./register.js')))
