import { type StorageAdapter, withDefaults } from '..'

export const inMemoryStorage = (): StorageAdapter => {
  const store = new Map<any, any>()

  return withDefaults({
    get: async <Key = unknown, Data = unknown>(key: Key): Promise<Data> => {
      return store.get(key)
    },
    remove: async <Key = unknown>(key: Key) => {
      store.delete(key)
    },
    set: async <Key = unknown, Data = unknown>(key: Key, data: Data) => {
      store.set(key, data)
    },
  })
}
