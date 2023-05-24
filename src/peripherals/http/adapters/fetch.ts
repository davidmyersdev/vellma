import crossFetch from 'cross-fetch'

/**
 * Universal WHATWG Fetch API for Node, Browsers and React Native.
 *
 * @see https://www.npmjs.com/package/cross-fetch
 */
export const fetchAdapter = () => {
  return {
    fetch: crossFetch,
  }
}
