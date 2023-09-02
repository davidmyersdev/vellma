import { type StorageAdapter, type StorageBucketOutput } from '..'

export type JsonFileStore = Record<string, Record<string, StorageBucketOutput>>

export const jsonFileStorage = (path = `./tmp/storage-${Date.now()}.json`): StorageAdapter => {
  const isMatch = <A extends Record<string, unknown>, D extends Record<string, unknown>>(attributes: A, data: D) => {
    return Object.entries(attributes).every(([key, value]) => {
      return data[key] === value
    })
  }

  return {
    bucket: async ({ name }) => {
      const { readFileSync, writeFileSync } = await import('node:fs')

      const bucket = () => {
        return store()[name] || {}
      }

      const store = (): JsonFileStore => {
        try {
          const file = readFileSync(path, 'utf-8')

          return JSON.parse(file)
        } catch (_error) {
          return {}
        }
      }

      const write = (bucketData: unknown) => {
        const jsonString = JSON.stringify({ ...store(), [name]: bucketData }, null, 2)

        writeFileSync(path, `${jsonString}\n`)
      }

      return {
        all: async () => {
          const bucketData = bucket()

          return Object.values(bucketData)
        },
        destroy: async (attributes) => {
          const bucketData = bucket()

          for (const data of Object.values(bucketData)) {
            if (isMatch(attributes, data)) {
              delete bucketData[data.id]
            }
          }

          write(bucketData)
        },
        find: async (attributes) => {
          const bucketData = bucket()

          return Object.values(bucketData).find((data) => {
            return isMatch(attributes, data)
          })
        },
        save: async (attributes) => {
          const bucketData = bucket()

          bucketData[attributes.id] = { ...bucketData[attributes.id], ...attributes }

          write(bucketData)
        },
        where: async (attributes) => {
          const bucketData = bucket()

          return Object.values(bucketData).filter((data) => {
            return isMatch(attributes, data)
          })
        },
      }
    },
  }
}
