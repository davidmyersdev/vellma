import { memoryAdapter } from './adapters/memory'

export type StorageAdapter = {
  get: <Key = unknown, Data = unknown>(key: Key) => Promise<Data>,
  remove: <Key = unknown>(key: Key) => Promise<void>,
  set: <Key = unknown, Data = unknown>(key: Key, data: Data) => Promise<void>,
}

export type StoragePeripheral = Omit<StorageAdapter, 'get'> & {
  get: {
    <Key = unknown, Data = unknown>(key: Key, fallback: Data): Promise<Data>,
    <Key = unknown, Data = unknown>(key: Key): Promise<Data | undefined>,
  },
}

/**
 * Create an object for interacting with storage.
 *
 * @param adapter The adapter to use for storing data. Defaults to `memoryAdapter()`.
 * @returns A StoragePeripheral object.
 */
export const useStorage = (adapter: StorageAdapter = memoryAdapter()): StoragePeripheral => {
  return {
    /**
     *
     * @param key A key to use for retrieving data.
     * @param fallback An optional fallback value to return if the key does not exist.
     * @returns The data stored at the key, or the fallback value if the key does not exist.
     */
    get: async <Key = unknown, Data = unknown>(key: Key, fallback?: Data) => {
      return await adapter.get<Key, Data>(key) ?? fallback
    },
    remove: adapter.remove,
    set: adapter.set,
  }
}
