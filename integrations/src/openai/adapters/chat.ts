import { type Message, type Role, message as toMessage, zRole } from 'vellma'
import { type ApiChatConfig, type ApiChatMessage, type ApiChatRole, chat as chatApi } from '../api'

export type AdapterChatConfig = Omit<ApiChatConfig, 'messages'> & {
  messages: Message[],
}

const toExternalMessage = (message: Message): ApiChatMessage => {
  return {
    content: message.text,
    role: toExternalRole(message.role),
  }
}

const toExternalRole = (role: Role): ApiChatRole => {
  if (role === zRole.enum.assistant) return 'assistant'
  if (role === zRole.enum.human) return 'user'
  if (role === zRole.enum.system) return 'system'

  throw new Error(`[openai][chat] invalid role: ${role}`)
}

const toInternalMessage = (message: ApiChatMessage): Message => {
  return toMessage({
    text: message.content,
    role: toInternalRole(message.role),
  })
}

const toInternalRole = (role: ApiChatRole): Role => {
  if (role === 'assistant') return zRole.enum.assistant
  if (role === 'user') return zRole.enum.human
  if (role === 'system') return zRole.enum.system

  throw new Error(`[openai][chat] invalid role: ${role}`)
}

export const chat = async (config: AdapterChatConfig) => {
  const messages = config.messages.map(toExternalMessage)
  const { json } = await chatApi({ ...config, messages })
  const { message: newExternalMessage } = json.choices[0]

  if (!newExternalMessage) {
    throw new Error('[openai][chat] invalid response')
  }

  return toInternalMessage(newExternalMessage)
}
