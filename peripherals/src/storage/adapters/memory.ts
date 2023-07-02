import { type StorageAdapter } from '..'

export const memoryAdapter = (): StorageAdapter => {
  const store = new Map<any, any>()

  return {
    get: async <Key = unknown, Data = unknown>(key: Key): Promise<Data> => {
      return store.get(key)
    },
    remove: async <Key = unknown>(key: Key) => {
      store.delete(key)
    },
    set: async <Key = unknown, Data = unknown>(key: Key, data: Data) => {
      store.set(key, data)
    },
  }
}
