/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { lazyWithTypes } from 'gunshi/definition'
import metaRegister from 'pnpmc-register/meta'
import metaShow from 'pnpmc-show/meta'
import { load } from './loader.js'

export const showLazy = lazyWithTypes<{ args: typeof metaShow.args }>()(
  async () => await load('pnpmc-show'),
  metaShow
)

export const registerLazy = lazyWithTypes<{ args: typeof metaRegister.args }>()(
  async () => await load('pnpmc-register'),
  metaRegister
)
