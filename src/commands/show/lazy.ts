/**
 * @author kazuya kawaguchi (a.k.a @kazupon)
 * @license MIT
 */

import { interopDefault } from '@kazupon/jts-utils'
import { lazy } from 'gunshi/definition'
import meta from './meta.js'

export default lazy<typeof meta.options>(async () => interopDefault(import('./runner.js')), meta)
