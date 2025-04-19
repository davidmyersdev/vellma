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
      const { readFile, writeFile } = await import('node:fs/promises')

      const bucket = async () => {
        return (await store())[name] || {}
      }

      const store = async (): Promise<JsonFileStore> => {
        try {
          const file = await readFile(path, 'utf-8')

          return JSON.parse(file)
        } catch (_error) {
          return {}
        }
      }

      const write = async (bucketData: unknown) => {
        const jsonString = JSON.stringify({ ...store(), [name]: bucketData }, null, 2)

        await writeFile(path, `${jsonString}\n`)
      }

      return {
        all: async () => {
          const bucketData = await bucket()

          return Object.values(bucketData)
        },
        destroy: async (attributes) => {
          const bucketData = await bucket()

          for (const data of Object.values(bucketData)) {
            if (isMatch(attributes, data)) {
              delete bucketData[data.id]
            }
          }

          await write(bucketData)
        },
        find: async (attributes) => {
          const bucketData = await bucket()

          return Object.values(bucketData).find((data) => {
            return isMatch(attributes, data)
          })
        },
        save: async (attributes) => {
          const bucketData = await bucket()

          bucketData[attributes.id] = { ...bucketData[attributes.id], ...attributes }

          await write(bucketData)
        },
        where: async (attributes) => {
          const bucketData = await bucket()

          return Object.values(bucketData).filter((data) => {
            return isMatch(attributes, data)
          })
        },
      }
    },
  }
}
