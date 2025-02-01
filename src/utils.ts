import { promises as fs } from 'node:fs'

export async function readPackageJson(target: string): Promise<Record<string, unknown>> {
  return JSON.parse(await fs.readFile(target, 'utf-8')) as Record<string, unknown>
}
