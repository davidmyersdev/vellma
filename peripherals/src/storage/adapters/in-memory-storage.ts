import { type StorageAdapter, type StorageBucketAttributes, type StorageBucketOutput, type StorageBucketSchema } from '..'

export type InMemoryStore = Record<string, Record<string, StorageBucketOutput>>

export const inMemoryStorage = (): StorageAdapter => {
  const store: InMemoryStore = {}

  const findOrCreateBucket = <T extends StorageBucketAttributes>({ name }: StorageBucketSchema<T>): Record<string, StorageBucketOutput<T>> => {
    if (!(name in store)) {
      store[name] = {}
    }

    return store[name]
  }

  const isMatch = <A extends Record<string, unknown>, D extends Record<string, unknown>>(attributes: A, data: D) => {
    return Object.entries(attributes).every(([key, value]) => {
      return data[key] === value
    })
  }

  return {
    bucket: async (bucketSchema) => {
      const bucket = findOrCreateBucket(bucketSchema)

      return {
        all: async () => {
          return Object.values(bucket)
        },
        destroy: async (attributes) => {
          for (const data of Object.values(bucket)) {
            if (isMatch(attributes, data)) {
              delete bucket[data.id]
            }
          }
        },
        find: async (attributes) => {
          return Object.values(bucket).find((data) => {
            return isMatch(attributes, data)
          })
        },
        save: async (attributes) => {
          bucket[attributes.id] = { ...bucket[attributes.id], ...attributes }
        },
        where: async (attributes) => {
          return Object.values(bucket).filter((data) => {
            return isMatch(attributes, data)
          })
        },
      }
    },
  }
}
