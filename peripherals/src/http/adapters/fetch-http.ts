import { type HttpAdapter } from '..'

/**
 * Universal WHATWG Fetch API for Node, Browsers and React Native.
 *
 * @see https://www.npmjs.com/package/cross-fetch
 */
export const fetchHttp = (): HttpAdapter => {
  return {
    fetch: async (...args) => {
      if ('fetch' in globalThis) {
        return globalThis.fetch(...args)
      }

      // The types from undici do not align with the types for fetch.
      // https://github.com/nodejs/undici/issues/1943
      const { fetch } = (await import('undici')) as unknown as { fetch: typeof globalThis.fetch }

      return fetch(...args)
    },
  }
}
