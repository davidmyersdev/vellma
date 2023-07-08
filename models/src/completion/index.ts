import { id as makeId } from 'ellma'
import { type Model } from '..'

export type CompletionIntegration = {
  completion: (text: string) => Promise<string>,
}

export type CompletionModel = Omit<Model, 'model'> & ReturnType<typeof useCompletion>

export type CompletionModelConfig = {
  integration: CompletionIntegration,
}

export const useCompletion = ({ integration }: CompletionModelConfig) => {
  const id = makeId()

  const generate = async (text: string) => {
    return await integration.completion(text)
  }

  return {
    id,
    model: {
      generate,
    },
  }
}
