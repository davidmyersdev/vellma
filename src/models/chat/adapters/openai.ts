import { type ChatAdapter } from '..'
import { type Globals } from '#config'

// Todo: Combine models and properties into just "data" or maybe "schemas" for now.
import { type Message, type Role, message as toMessage, zRole } from '#data'
import { type OpenAiConfig, type OpenAiIntegration, type OpenAiMessage, type OpenAiRole } from '#integrations/openai'

export type OpenAiAdapterConfig = { openai: OpenAiIntegration, config?: OpenAiConfig } | { config: OpenAiConfig, openai?: OpenAiIntegration }

export const toExternalMessage = (message: Message): OpenAiMessage => {
  return {
    content: message.text,
    role: toExternalRole(message.role),
  }
}

export const toExternalRole = (role: Role): OpenAiRole => {
  if (role === zRole.enum.assistant) return 'assistant'
  if (role === zRole.enum.human) return 'user'
  if (role === zRole.enum.system) return 'system'

  throw new Error('[chat][openai] Unsupported role')
}

export const toInternalMessage = (message: OpenAiMessage): Message => {
  return toMessage({
    text: message.content,
    role: toInternalRole(message.role),
  })
}

export const toInternalRole = (role: OpenAiRole): Role => {
  if (role === 'assistant') return zRole.enum.assistant
  if (role === 'user') return zRole.enum.human
  if (role === 'system') return zRole.enum.system

  throw new Error('[chat][openai] Unsupported role')
}

export const openaiAdapter = (globals: Globals): ChatAdapter => {
  return {
    call: async (messages) => {
      const externalMessages = messages.map(toExternalMessage)
      // Todo: Add support for overriding the model.
      const { json } = await globals.integrations.openai.chat({ messages: externalMessages, model: 'gpt-3.5-turbo' })
      const { message: newExternalMessage } = json.choices[0]

      if (!newExternalMessage) {
        throw new Error('[chat][openai] No message returned')
      }

      return toInternalMessage(newExternalMessage)
    },
  }
}
