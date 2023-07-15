import { type CryptoPeripheral } from './crypto'
import { type HttpPeripheral } from './http'
import { type IoPeripheral } from './io'
import { type LoggerPeripheral } from './logger'
import { type StoragePeripheral } from './storage'

export * from './crypto'
export * from './http'
export * from './io'
export * from './logger'
export * from './storage'

export type Peripherals = {
  crypto: CryptoPeripheral,
  http: HttpPeripheral,
  io: IoPeripheral,
  logger: LoggerPeripheral,
  storage: StoragePeripheral,
}
