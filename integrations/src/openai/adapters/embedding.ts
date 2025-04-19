import { vector } from 'vellma'
import { type ApiEmbeddingConfig, embedding as embeddingApi } from '../api'

export type EmbeddingConfig = Omit<ApiEmbeddingConfig, 'input' | 'user'> & {
  text: string,
  userId?: string,
}

export const embedding = async (config: EmbeddingConfig) => {
  const { text: input, userId: user } = config
  const { json: { data: [{ embedding }], model } } = await embeddingApi({ ...config, input, user })

  return vector({
    // Todo: Add hash...
    embedding,
    embeddingSource: input,
    modelId: model,
  })
}
