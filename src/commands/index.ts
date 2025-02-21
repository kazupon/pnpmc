import { interopDefault } from '@kazupon/jts-utils'

export const commands = {
  show: async () => await interopDefault(import('./show')),
  register: async () => await interopDefault(import('./register'))
}
