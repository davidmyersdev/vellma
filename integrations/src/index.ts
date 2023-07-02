import { type ChatIntegration, type CompleteIntegration, type EmbeddingIntegration } from 'ellma/models'
import { openai } from './openai'

export type Integration = ChatIntegration & CompleteIntegration & EmbeddingIntegration

export const withDefaults = (integration: Partial<Integration>): Integration => {
  return {
    chat: async () => { throw new Error('[integration] not implemented') },
    complete: async () => { throw new Error('[integration] not implemented') },
    embedding: async () => { throw new Error('[integration] not implemented') },
    ...integration,
  }
}

export {
  openai,
}
