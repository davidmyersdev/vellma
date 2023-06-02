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
  const chatAdapter = useChatAdapter(globals)

  return {
    call: chatAdapter.call,
  }
}
