import { type LoggerAdapter } from '..'

export const fileLogger = (path = `./tmp/logger-${Date.now()}.log`): LoggerAdapter => {
  const writeLine = async (text: string) => {
    const { appendFileSync } = await import('node:fs')

    appendFileSync(path, `${text}\n`)
  }

  return {
    debug: async (data) => {
      await writeLine(`DEBUG: ${data}`)
    },
    error: async (data) => {
      await writeLine(`ERROR: ${data}`)
    },
    info: async (data) => {
      await writeLine(`INFO: ${data}`)
    },
    warn: async (data) => {
      await writeLine(`WARN: ${data}`)
    },
  }
}
