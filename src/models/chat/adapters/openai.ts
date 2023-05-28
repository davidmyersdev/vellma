import { type ChatAdapter } from '..'
import { type Message, message as toMessage } from '#data/models'
import { type Role, roles } from '#data/properties'
import { type OpenAiApiChatMessage, type OpenAiApiChatRole, type OpenAiIntegration } from '../../../integrations/openai'

export const toExternalMessage = (message: Message): OpenAiApiChatMessage => {
  return {
    content: message.text,
    role: toExternalRole(message.role),
  }
}

export const toExternalRole = (role: Role): OpenAiApiChatRole => {
  if (role === roles.assistant) return 'assistant'
  if (role === roles.human) return 'user'
  if (role === roles.system) return 'system'

  throw new Error('[chat][openai] Unsupported role')
}

export const toInternalMessage = (message: OpenAiApiChatMessage): Message => {
  return toMessage({
    text: message.content,
    role: toInternalRole(message.role),
  })
}

export const toInternalRole = (role: OpenAiApiChatRole): Role => {
  if (role === 'assistant') return roles.assistant
  if (role === 'user') return roles.human
  if (role === 'system') return roles.system

  throw new Error('[chat][openai] Unsupported role')
}

export const openaiAdapter = (integration: OpenAiIntegration): ChatAdapter => {
  return {
    send: async (messages) => {
      const externalMessages = messages.map(toExternalMessage)
      const { json } = await integration.chat({ messages: externalMessages, model: 'gpt-3.5-turbo' })
      const { message: newExternalMessage } = json.choices[0]

      if (!newExternalMessage) {
        throw new Error('[chat][openai] No message returned')
      }

      return toInternalMessage(newExternalMessage)
    },
  }
}
