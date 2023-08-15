import { type ConsumableMessage, type Message } from 'vellma'
import { type CompletionIntegration, type EmbeddingIntegration } from 'vellma/models'
import { openai } from './openai'

export type Integration = ChatIntegration & CompletionIntegration & EmbeddingIntegration

export type ChatIntegration = {
  chat: (messages: Message[], metadata?: any) => Promise<ConsumableMessage>,
}

export const withDefaults = (integration: Partial<Integration>): Integration => {
  return {
    chat: async () => { throw new Error('[integration] not implemented') },
    completion: async () => { throw new Error('[integration] not implemented') },
    embedding: async () => { throw new Error('[integration] not implemented') },
    ...integration,
  }
}

export {
  openai,
}
