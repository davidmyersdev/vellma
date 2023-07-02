import { id as makeId } from 'ellma/data'
import { type Model } from '..'

export type CompleteIntegration = {
  complete: (text: string) => Promise<string>,
}

export type CompleteModel = Omit<Model, 'model'> & ReturnType<typeof useComplete>

export type CompleteModelConfig = {
  integration: CompleteIntegration,
}

export const useComplete = ({ integration }: CompleteModelConfig) => {
  const id = makeId()

  const generate = async (text: string) => {
    return await integration.complete(text)
  }

  return {
    id,
    model: {
      generate,
    },
  }
}
