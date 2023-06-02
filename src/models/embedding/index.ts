import { openai } from './adapters'
import { type Vector } from '#data'
import { integrationNames } from '#data/internal'
import { type Globals } from '#globals'

export type EmbeddingAdapter = {
  call: (text: string | string[]) => Promise<Vector>,
}

export type EmbeddingIntegration = keyof typeof adapters

export type EmbeddingModel = ReturnType<typeof useEmbedding>
export type EmbeddingModelConfig = {
  integration?: EmbeddingIntegration,
}

const adapters = {
  [integrationNames.openai]: openai,
}

const useAdapter = (globals: Globals): EmbeddingAdapter => {
  const fn = adapters[globals.integration]

  return fn(globals)
}

export const useEmbedding = (globals: Globals) => {
  const adapter = useAdapter(globals)

  return {
    call: adapter.call,
  }
}
