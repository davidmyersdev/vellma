import { type JsonLike } from 'vellma'
import { consoleLogger, nullLogger, terminalLogger } from './adapters'

export * from './adapters'

export type LoggerAdapter = {
  debug: (data: JsonLike) => Promise<void>,
  error: (data: JsonLike) => Promise<void>,
  info: (data: JsonLike) => Promise<void>,
  warn: (data: JsonLike) => Promise<void>,
}

export type LoggerPeripheral = LoggerAdapter

const defaultAdapter = (): LoggerAdapter => {
  if (typeof process !== 'undefined') {
    return terminalLogger()
  }

  if (typeof console !== 'undefined') {
    return consoleLogger()
  }

  return nullLogger()
}

/**
 * Create a logger for diagnostic output.
 *
 * @param adapter The adapter to use for logging output.
 * @returns A LoggerPeripheral object.
 */
export const useLogger = (adapter: LoggerAdapter = defaultAdapter()) => {
  return {
    ...adapter,
  }
}
