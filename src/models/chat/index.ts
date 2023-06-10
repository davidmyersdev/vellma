import { openaiAdapter } from './adapters'
import { type Message } from '#data'
import { integrationNames } from '#data/internal'
import { type Globals } from '#globals'

export type ChatAdapter = {
  call: (messages: Message[]) => Promise<Message>,
}

export type ChatIntegration = keyof typeof chatAdapters

export type ChatModel = ReturnType<typeof useChat>
export type ChatModelConfig = {
  integration?: ChatIntegration,
}

const chatAdapters = {
  [integrationNames.openai]: openaiAdapter,
}

const useChatAdapter = (globals: Globals): ChatAdapter => {
  const fn = chatAdapters[globals.integration]

  return fn(globals)
}

export const useChat = (globals: Globals) => {
  const memory = <Message[]>[]
  const adapter = useChatAdapter(globals)

  return {
    add: async (message: Message) => {
      memory.push(message)
    },
    clear: async () => {
      memory.splice(0, memory.length)
    },
    generate: async (...messages: Message[]) => {
      memory.push(...messages)

      const message = await adapter.call([...memory])

      memory.push(message)

      return message
    },
    history: async () => {
      return [...memory]
    },
  }
}
