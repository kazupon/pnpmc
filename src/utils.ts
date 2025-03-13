export function log(...args: unknown[]): void {
  console.log(...args)
}

export function fail(...messages: unknown[]): never {
  console.error(...messages)
  process.exit(1)
}
