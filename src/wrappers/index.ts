import { type HttpAdapter, type HttpWrapper, wrapHttp } from './http'
import { type IoAdapter, type IoWrapper, wrapIo } from './io'

export type WrapperAdapters = {
  http: HttpAdapter,
  io: IoAdapter,
}
export type Wrappers = {
  http: HttpWrapper,
  io: IoWrapper,
}

export const wrap = ({ http, io }: Partial<WrapperAdapters>) => {
  return {
    http: wrapHttp(http),
    io: wrapIo(io),
  } satisfies Wrappers
}
