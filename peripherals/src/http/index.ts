import { fetchHttp } from './adapters/fetch-http'

export type HttpAdapter = {
  fetch: typeof fetch,
}

export type HttpPeripheral = ReturnType<typeof useHttp>

export const useHttp = (adapter: HttpAdapter = fetchHttp()) => {
  return {
    fetch: adapter.fetch,
  }
}
