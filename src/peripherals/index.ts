import { type HttpAdapter, type HttpPeripheral, adaptHttp } from './http'
import { type IoAdapter, type IoPeripheral, adaptIo } from './io'
import { type StorageAdapter, type StoragePeripheral, adaptStorage } from './storage'

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

export const usePeripherals = ({ http, io, storage }: Partial<PeripheralAdapters>) => {
  return {
    http: adaptHttp(http),
    io: adaptIo(io),
    storage: adaptStorage(storage),
  } satisfies Peripherals
}
