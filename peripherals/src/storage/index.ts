import { type Identity } from 'vellma'
import { type z } from 'zod'
import { inMemoryStorage } from './adapters'

export * from './adapters'

export type StorageAdapter = {
  // Todo: Make it possible to build storage adapters (or buckets) from a schema.
  // This will handle the scenario where we need to be able to define custom buckets outside of the context
  // of Vellma.
  bucket: <T extends StorageBucketAttributes>(schema: StorageBucketSchema<T>) => Promise<StorageBucketAdapter>,
}

/**
 * An interface for interacting with a bucket of data.
 */
export type StorageBucketAdapter<T extends StorageBucketAttributes = StorageBucketAttributes> = {
  /**
   * Returns all objects in the bucket.
   */
  all: () => Promise<StorageBucketOutput<T>[]>,
  /**
   * Destroys all objects in the bucket that match the given attributes.
   */
  destroy: (attributes: Partial<StorageBucketInput<T>>) => Promise<void>,
  /**
   * Returns the first object in the bucket that matches the given attributes.
   */
  find: (attributes: Partial<StorageBucketInput<T>>) => Promise<StorageBucketOutput<T> | undefined>,
  /**
   * Creates or updates an object in the bucket that matches the given id.
   */
  save: (attributes: StorageBucketInput<T> & { id: string }) => Promise<void>,
  /**
   * Returns all objects in the bucket that match the given attributes.
   */
  where: (attributes: Partial<StorageBucketInput<T>>) => Promise<StorageBucketOutput<T>[]>,
}

export type StorageBucketAttributes = z.ZodObject<{ id: z.ZodString | z.ZodDefault<z.ZodString> }>
export type StorageBucketInput<T extends StorageBucketAttributes = StorageBucketAttributes> = Identity<z.input<T>>
export type StorageBucketOutput<T extends StorageBucketAttributes = StorageBucketAttributes> = Identity<z.infer<T>>
export type StorageBucketSchema<T extends StorageBucketAttributes = StorageBucketAttributes> = {
  name: string,
  attributes: T,
}

export type StoragePeripheral = {
  bucket: <T extends StorageBucketAttributes>(schema: StorageBucketSchema<T>) => Promise<StorageBucketAdapter<T>>,
}

export const storageBucket = <T extends StorageBucketAttributes>(schema: StorageBucketSchema<T>) => {
  return schema
}

/**
 * Create an object for interacting with storage.
 *
 * @param adapter The adapter to use for storing data. Defaults to `inMemoryStorage()`.
 * @returns A StoragePeripheral object.
 */
export const useStorage = (adapter: StorageAdapter): StoragePeripheral => {
  return adapter as StoragePeripheral
}

export const useInMemoryStorage = (): StoragePeripheral => {
  return useStorage(inMemoryStorage())
}
