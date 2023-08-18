import { inMemoryStorage } from './adapters/in-memory-storage'

export * from './adapters'

export type StorageAdapter = {
  each: <Key = unknown, Data = unknown>(callback: (key: Key, data: Data) => Promise<void | { break: true }>) => Promise<void>,
  get: <Key = unknown, Data = unknown>(key: Key) => Promise<Data>,
  remove: <Key = unknown>(key: Key) => Promise<void>,
  set: <Key = unknown, Data = unknown>(key: Key, data: Data) => Promise<void>,
}

export type StoragePeripheral = Omit<StorageAdapter, 'get'> & {
  all: <Data = unknown>() => Promise<Data[]>,
  filter: <Key = unknown, Data = unknown>(callback: (key: Key, data: Data) => Promise<boolean>) => Promise<Data[]>,
  find: <Key = unknown, Data = unknown>(callback: (key: Key, data: Data) => Promise<boolean>) => Promise<Data | undefined>,
  get: {
    <Key = unknown, Data = unknown>(key: Key, fallback: Data): Promise<Data>,
    <Key = unknown, Data = unknown>(key: Key): Promise<Data | undefined>,
  },
}

export const withDefaults = (adapter: Partial<StorageAdapter>): StorageAdapter => {
  return {
    each: async () => { throw new Error('[storage] not implemented') },
    get: async () => { throw new Error('[storage] not implemented') },
    remove: async () => { throw new Error('[storage] not implemented') },
    set: async () => { throw new Error('[storage] not implemented') },
    ...adapter,
  }
}

/**
 * Create an object for interacting with storage.
 *
 * @param adapter The adapter to use for storing data. Defaults to `inMemoryStorage()`.
 * @returns A StoragePeripheral object.
 */
export const useStorage = (adapter: StorageAdapter = inMemoryStorage()): StoragePeripheral => {
  return {
    ...adapter,
    /**
     * Return all entries.
     *
     * @returns An array of all entries.
     */
    all: async <Key = unknown, Data = unknown>() => {
      const results: Data[] = []

      await adapter.each<Key, Data>(async (_key, data) => {
        results.push(data)
      })

      return results
    },
    /**
     * Enumerate all entries and return those that match.
     *
     * @param callback The callback to assert whether the entry is a match.
     * @returns An array of matching entries.
     */
    filter: async <Key = unknown, Data = unknown>(callback: (key: Key, data: Data) => Promise<boolean>) => {
      const results: Data[] = []

      adapter.each<Key, Data>(async (key, data) => {
        if (await callback(key, data)) {
          results.push(data)
        }
      })

      return results
    },
    /**
     * Find the first entry that matches, stop enumerating, and return it.
     *
     * @param callback The callback to assert whether the entry is a match.
     * @returns The matching entry.
     */
    find: async <Key = unknown, Data = unknown>(callback: (key: Key, data: Data) => Promise<boolean>) => {
      let result: any

      adapter.each<Key, Data>(async (key, data) => {
        const isMatch = await callback(key, data)

        if (isMatch) {
          result = data

          return { break: true }
        }
      })

      return result
    },
    /**
     * @param key A key to use for retrieving data.
     * @param fallback An optional fallback value to return if the key does not exist.
     * @returns The data stored at the key, or the fallback value if the key does not exist.
     */
    get: async (key: any, fallback?: any) => {
      return await adapter.get(key) ?? fallback
    },
  }
}
