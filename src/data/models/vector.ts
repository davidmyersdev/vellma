import { z } from 'zod'
import { id, timestamp, zId, zTimestamp } from '#data/properties'

export type Embedding = z.infer<typeof zEmbedding>
export type Vector = z.infer<typeof zVector>

export const zEmbedding = z.array(z.number())

export const zVector = z.object({
  id: zId.default(() => id()),
  createdAt: zTimestamp.default(() => timestamp()),
  embedding: zEmbedding,
  embeddingSource: z.string(),
  modelId: z.string(),
})

export const vector = (thing: unknown): Vector => {
  return zVector.parse(thing)
}
