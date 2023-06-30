import { type HttpAdapter, type HttpPeripheral, useHttp } from './http'
import { type IoAdapter, type IoPeripheral, useIo } from './io'
import { type StorageAdapter, type StoragePeripheral, useStorage } from './storage'

export type PeripheralAdapters = {
  http: HttpAdapter,
  io: IoAdapter,
  storage: StorageAdapter,
}

export type Peripherals = {
  http: HttpPeripheral,
  io: IoPeripheral,
  storage: StoragePeripheral,
}

export const usePeripherals = ({ http, io, storage }: Partial<PeripheralAdapters>): Peripherals => {
  return {
    http: useHttp(http),
    io: useIo(io),
    storage: useStorage(storage),
  }
}
