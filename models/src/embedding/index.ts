import { type Vector, id as makeId } from 'ellma'
import { type Peripherals, useCrypto, useStorage } from 'ellma/peripherals'
import { type Model } from '..'

export type EmbeddingIntegration = {
  embedding: (text: string) => Promise<Vector>,
}

export type EmbeddingModel = Omit<Model, 'model'> & ReturnType<typeof useEmbedding>

export type EmbeddingModelConfig = {
  integration: EmbeddingIntegration,
  peripherals?: Partial<Peripherals>,
}

export const useEmbedding = ({ integration, peripherals = {} }: EmbeddingModelConfig) => {
  const id = makeId()
  const { crypto = useCrypto(), storage = useStorage() } = peripherals

  const generate = async (text: string) => {
    // Todo: Use the modelId as well as the text to generate a hash.
    const hash = await crypto.hash('SHA-512', text)
    const storageKey = `embedding:${hash}`
    const storedVector = await storage.get<string, Vector>(storageKey)

    if (storedVector) {
      return storedVector
    }

    const vector = await integration.embedding(text)

    await storage.set(storageKey, vector)

    return vector
  }

  return {
    id,
    model: {
      generate,
    },
  }
}
