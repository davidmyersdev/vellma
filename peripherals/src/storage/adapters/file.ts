import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { type StorageAdapter, withDefaults } from '..'

const defaultPath = () => {
  return resolve(join('tmp', `${Date.now()}-storage.json`))
}

export const storageFile = (path = defaultPath()): StorageAdapter => {
  const store: Record<string, any> = {}

  if (existsSync(path)) {
    const file = readFileSync(path, 'utf-8')

    Object.assign(store, JSON.parse(file))
  }

  const updateStore = () => {
    writeFileSync(path, JSON.stringify(store, null, 2))
  }

  return withDefaults({
    each: async (callback) => {
      const keys = Object.keys(store)

      for (const key of keys) {
        await callback(key as any, store[key])
      }
    },
    get: async <Key = unknown, Data = unknown>(key: Key): Promise<Data> => {
      return store[key as string]
    },
    remove: async <Key = unknown>(key: Key) => {
      delete store[key as string]

      updateStore()
    },
    set: async <Key = unknown, Data = unknown>(key: Key, data: Data) => {
      store[key as string] = data

      updateStore()
    },
  })
}
