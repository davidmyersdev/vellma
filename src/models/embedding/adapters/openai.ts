import { type EmbeddingAdapter } from '..'
import { vector } from '#data'
import { type Globals } from '#globals'

export const openai = ({ integrations }: Globals): EmbeddingAdapter => {
  const model = 'text-embedding-ada-002'

  return {
    call: async (text) => {
      const { json: { data: embedding } } = await integrations.openai.embed({ input: text, model })

      return vector({
        embedding,
        embeddingSource: text,
        modelId: model,
      })
    },
  }
}
