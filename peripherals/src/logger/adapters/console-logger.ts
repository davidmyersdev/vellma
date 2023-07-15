import { type LoggerAdapter } from '..'

export const consoleLogger = (): LoggerAdapter => {
  return {
    debug: async (data) => {
      // eslint-disable-next-line no-console
      console.debug(data)
    },
    error: async (data) => {
      console.error(data)
    },
    info: async (data) => {
      // eslint-disable-next-line no-console
      console.info(data)
    },
    warn: async (data) => {
      console.warn(data)
    },
  }
}
