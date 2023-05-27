import { type HttpAdapter, type HttpPeripheral, adaptHttp } from './http'
import { type IoAdapter, type IoPeripheral, adaptIo } from './io'

export type PeripheralAdapters = {
  http: HttpAdapter,
  io: IoAdapter,
}

export type Peripherals = {
  http: HttpPeripheral,
  io: IoPeripheral,
}

export const adapt = ({ http, io }: Partial<PeripheralAdapters>) => {
  return {
    http: adaptHttp(http),
    io: adaptIo(io),
  } satisfies Peripherals
}
