import { type HttpPeripheral } from './http'
import { type IoPeripheral } from './io'
import { type StoragePeripheral } from './storage'

export * from './http'
export * from './io'
export * from './storage'

export type Peripherals = {
  http: HttpPeripheral,
  io: IoPeripheral,
  storage: StoragePeripheral,
}
