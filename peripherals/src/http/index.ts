import { fetchAdapter } from './adapters/fetch'

export type HttpAdapter = {
  fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>,
}

export type HttpPeripheral = ReturnType<typeof useHttp>

export const useHttp = (adapter: HttpAdapter = fetchAdapter()) => {
  return {
    fetch: adapter.fetch,
  }
}
