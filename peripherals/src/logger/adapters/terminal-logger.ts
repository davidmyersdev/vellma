import chalk from 'chalk'
import { type JsonLike } from 'vellma'
import { type LoggerAdapter } from '..'

export type TerminalLoggerConfig = {
  output?: Pick<NodeJS.WritableStream, 'write'>,
}

// Todo: Move terminal IO (the basic process version) into a separate module with a typeof check and fallback.
export const terminalLogger = ({ output }: TerminalLoggerConfig = {}): LoggerAdapter => {
  const getWriter = async () => {
    if (output) {
      return output
    }

    const { stdout } = await import('node:process')

    return stdout
  }

  const writeLine = async (data: JsonLike) => {
    const writer = await getWriter()

    writer.write(`${data}\n`)
  }

  return {
    debug: async (data) => {
      writeLine(chalk.grey(data))
    },
    error: async (data) => {
      writeLine(chalk.red(data))
    },
    info: async (data) => {
      writeLine(chalk.grey(data))
    },
    warn: async (data) => {
      writeLine(chalk.yellow(data))
    },
  }
}
