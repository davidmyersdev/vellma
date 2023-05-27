import { memoryAdapter } from './adapters/memory'

export type StorageAdapter = {
  get: (key: unknown) => Promise<unknown>,
  set: (key: unknown, data: unknown) => Promise<void>,
}

export type StoragePeripheral = ReturnType<typeof adaptStorage>

/**
 * Create an object for interacting with storage.
 *
 * @param adapter The adapter to use for storing data. Defaults to `memoryAdapter()`.
 * @returns A StoragePeripheral object.
 */
export const adaptStorage = (adapter: StorageAdapter = memoryAdapter()) => {
  return {
    get: adapter.get,
    set: adapter.set,
  }
}
