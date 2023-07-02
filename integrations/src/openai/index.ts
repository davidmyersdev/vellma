import { withDefaults } from '..'
import { chat, complete, embedding } from './adapters'
import { type ApiConfig } from './api'

export const openai = (config: ApiConfig) => {
  return withDefaults({
    chat: async (messages) => {
      return chat({ ...config, messages })
    },
    complete: async (text) => {
      return complete({ ...config, text })
    },
    embedding: async (text) => {
      return embedding({ ...config, text })
    },
  })
}
