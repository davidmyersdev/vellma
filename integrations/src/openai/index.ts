import { withDefaults } from '..'
import { chat, completion, embedding } from './adapters'
import { type ApiConfig } from './api'

export const openai = (config: ApiConfig) => {
  return withDefaults({
    chat: async (messages) => {
      return chat({ ...config, messages })
    },
    completion: async (text) => {
      return completion({ ...config, text })
    },
    embedding: async (text) => {
      return embedding({ ...config, text })
    },
  })
}
