/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { lazy } from 'gunshi/definition'
import { default as metaRegister } from 'pnpmc-register/meta'
import { default as metaShow } from 'pnpmc-show/meta'

export const showLazy = lazy<typeof metaShow.args>(
  async () => (await import('pnpmc-show/runner')).default,
  metaShow
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const commands: Map<string, any> = new Map()

commands.set(metaShow.name, showLazy)
commands.set(
  metaRegister.name,
  lazy<typeof metaRegister.args>(
    async () => (await import('pnpmc-register/runner')).default,
    metaRegister
  )
)
