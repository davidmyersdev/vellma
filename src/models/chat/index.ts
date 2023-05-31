import { type Message } from '#data'

export * from './adapters'

export type ChatAdapter = {
  call: (messages: Message[]) => Promise<Message>,
}

export type ChatModel = ReturnType<typeof useChat>

export const useChat = (adapter: ChatAdapter) => {
  return {
    call: adapter.call,
  }
}
