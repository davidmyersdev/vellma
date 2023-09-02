import { type Vector, chainable, id as makeId, zVector } from 'vellma'
import { type Peripherals, storageBucket, useCrypto, useInMemoryStorage } from 'vellma/peripherals'
import { type z } from 'zod'
import { type Model } from '..'

export type EmbeddingIntegration = {
  embedding: (text: string) => Promise<Vector>,
}

export type EmbeddingModel = Omit<Model, 'model'> & ReturnType<typeof useEmbedding>

export type EmbeddingModelConfig = {
  integration: EmbeddingIntegration,
  peripherals?: Partial<Peripherals>,
}

export type EmbeddingData = z.output<typeof embeddingSchema['attributes']>

export const embeddingSchema = storageBucket({
  name: 'embeddings',
  attributes: zVector,
})

export const useEmbedding = ({ integration, peripherals = {} }: EmbeddingModelConfig) => {
  const id = makeId()
  const { crypto = useCrypto(), storage = useInMemoryStorage() } = peripherals
  const embeddings = chainable(storage.bucket(embeddingSchema))

  const generate = async (text: string) => {
    // Todo: Use the modelId as well as the text to generate a hash.
    const hash = await crypto.hash('SHA-512', text)
    const storedVector = await embeddings.find({ hash })

    if (storedVector) {
      return storedVector
    }

    const vector = await integration.embedding(text)

    await embeddings.save({ ...vector, hash })

    return vector
  }

  return {
    id,
    model: {
      generate,
    },
  }
}
