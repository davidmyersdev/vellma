import { type Message } from '#data/models'

export * from './adapters'

export type ChatAdapter = {
  send: (messages: Message[]) => Promise<Message>,
}

export type ChatPeripheral = ReturnType<typeof adaptChat>

export const adaptChat = (adapter: ChatAdapter) => {
  return {
    send: adapter.send,
  }
}
