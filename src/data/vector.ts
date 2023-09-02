import { z } from 'zod'
import { id, zId } from './id'
import { timestamp, zTimestamp } from './timestamp'

export type Embedding = z.infer<typeof zEmbedding>
export type Vector = z.infer<typeof zVector>

export const zEmbedding = z.array(z.number())

export const zVector = z.object({
  id: zId.default(() => id()),
  createdAt: zTimestamp.default(() => timestamp()),
  embedding: zEmbedding,
  embeddingSource: z.string(),
  hash: z.string(),
  modelId: z.string(),
})

export const vector = (thing: unknown): Vector => {
  return zVector.parse(thing)
}
