import { z } from 'zod'

export type JsonLikeValue = z.infer<typeof zJsonLikeValue>
export type JsonLike = JsonLikeValue | { [key: string]: JsonLike } | JsonLike[]

export const zJsonLikeValue = z.union([z.string(), z.number(), z.boolean(), z.null()])
export const zJsonLike: z.ZodType<JsonLike> = z.lazy(() => {
  return z.union([zJsonLikeValue, z.array(zJsonLike), z.record(zJsonLike)])
})

// https://zod.dev/?id=json-type
export const json = (data: unknown) => {
  return zJsonLike.parse(data)
}
