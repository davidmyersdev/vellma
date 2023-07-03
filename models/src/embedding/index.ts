import { type Vector, id as makeId } from 'ellma/data'
import { type Peripherals, useStorage } from 'ellma/peripherals'
import { type Model } from '..'

export type EmbeddingIntegration = {
  embedding: (text: string) => Promise<Vector>,
}

export type EmbeddingModel = Omit<Model, 'model'> & ReturnType<typeof useEmbedding>

export type EmbeddingModelConfig = {
  integration: EmbeddingIntegration,
  peripherals?: Partial<Peripherals>,
}

// Todo: Store embeddings to prevent duplicate API calls.
export const useEmbedding = ({ integration, peripherals: { storage: _storage = useStorage() } = {} }: EmbeddingModelConfig) => {
  const id = makeId()

  const generate = async (text: string) => {
    return await integration.embedding(text)
  }

  return {
    id,
    model: {
      generate,
    },
  }
}
