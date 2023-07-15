import { type LoggerAdapter } from '..'

export const nullLogger = (): LoggerAdapter => {
  return {
    debug: async () => {},
    error: async () => {},
    info: async () => {},
    warn: async () => {},
  }
}
