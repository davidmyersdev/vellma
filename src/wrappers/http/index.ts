import { fetchAdapter } from './adapters/fetch'

export type HttpAdapter = {
  fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>,
}
export type HttpWrapper = ReturnType<typeof wrapHttp>

export const wrapHttp = (adapter: HttpAdapter = fetchAdapter()) => {
  return {
    fetch: adapter.fetch,
  }
}
