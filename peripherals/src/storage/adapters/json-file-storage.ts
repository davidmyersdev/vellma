import { withDefaults } from '..'

export const jsonFileStorage = (path = `./tmp/storage-${Date.now()}.json`) => {
  const readStore = async () => {
    const { readFileSync } = await import('node:fs')

    try {
      const file = readFileSync(path, 'utf-8')

      return JSON.parse(file)
    } catch (_error) {
      return {}
    }
  }

  const writeStore = async (store: unknown) => {
    const { writeFileSync } = await import('node:fs')
    const jsonString = JSON.stringify(store, null, 2)

    writeFileSync(path, `${jsonString}\n`)
  }

  return withDefaults({
    each: async (callback) => {
      const store = await readStore()
      const keys = Object.keys(store)

      for (const key of keys) {
        const step = await callback(key as any, store[key])

        if (step?.break) {
          break
        }
      }
    },
    get: async (key) => {
      const store = await readStore()

      return store[key as string]
    },
    remove: async (key) => {
      const store = await readStore()

      delete store[key as string]

      await writeStore(store)
    },
    set: async (key, data) => {
      const store = await readStore()

      store[key as string] = data

      await writeStore(store)
    },
  })
}
