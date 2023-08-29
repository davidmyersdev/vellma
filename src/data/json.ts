import { z } from 'zod'

export type JsonLike = JsonLikeValue | { [key: string]: JsonLike } | JsonLike[]
export type JsonLikeValue = z.infer<typeof zJsonLikeValue>
export type JsonSerializable = JsonSerializableValue | { [key: string]: JsonSerializable } | JsonSerializable[]
export type JsonSerializableValue = z.infer<typeof zJsonSerializableValue>

export const zJsonLikeValue = z.union([z.string(), z.number(), z.boolean(), z.null()])
export const zJsonLike: z.ZodType<JsonLike> = z.lazy(() => {
  return z.union([zJsonLikeValue, z.array(zJsonLike), z.record(zJsonLike)])
})

export const zJsonSerializableValue = z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined(), z.date()])
export const zJsonSerializable: z.ZodType<JsonSerializable> = z.lazy(() => {
  return z.union([zJsonSerializableValue, z.array(zJsonSerializable), z.record(zJsonSerializable)])
})

// https://zod.dev/?id=json-type
export const jsonLike = (data: unknown) => {
  return zJsonLike.parse(data)
}

export const toJson = (data: JsonSerializable): JsonLike => {
  return JSON.parse(JSON.stringify(data))
}
