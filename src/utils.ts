import { promises as fs } from 'node:fs'

export async function readPackageJson(target: string): Promise<Record<string, unknown>> {
  return JSON.parse(await fs.readFile(target, 'utf-8')) as Record<string, unknown>
}

export function log(...args: unknown[]): void {
  console.log(...args)
}

export function fail(...messages: unknown[]): never {
  console.error(...messages)
  process.exit(1)
}

export function nullObject<T>(): T {
  return Object.create(null) as T
}
