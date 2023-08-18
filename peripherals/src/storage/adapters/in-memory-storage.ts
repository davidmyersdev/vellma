import { type StorageAdapter, withDefaults } from '..'

export const inMemoryStorage = (): StorageAdapter => {
  const store = new Map<any, any>()

  return withDefaults({
    each: async (callback) => {
      for (const key of store.keys()) {
        const step = await callback(key as any, store.get(key))

        if (step?.break) {
          break
        }
      }
    },
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
