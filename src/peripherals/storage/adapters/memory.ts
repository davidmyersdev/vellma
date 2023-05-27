import { type StorageAdapter } from '..'

export const memoryAdapter = (): StorageAdapter => {
  const store = new Map<unknown, unknown>()

  return {
    get: async (key: unknown): Promise<unknown> => {
      return store.get(key)
    },
    set: async (key: unknown, data: unknown) => {
      store.set(key, data)
    },
  }
}
