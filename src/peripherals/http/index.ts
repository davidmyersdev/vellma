import { fetchAdapter } from './adapters/fetch'

export type HttpAdapter = {
  fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>,
}

export type HttpPeripheral = ReturnType<typeof adaptHttp>

export const adaptHttp = (adapter: HttpAdapter = fetchAdapter()) => {
  return {
    fetch: adapter.fetch,
  }
}
