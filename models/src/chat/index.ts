import { type Message, id as makeId, messageFactory } from 'vellma'
import { type Peripherals, useStorage } from 'vellma/peripherals'
import { type Model } from '..'

export type ChatIntegration = {
  chat: (messages: Message[]) => Promise<Message>,
}

export type ChatModel = Omit<Model, 'model'> & ReturnType<typeof useChat>

export type ChatModelConfig = {
  integration: ChatIntegration,
  peripherals?: Partial<Peripherals>,
  retries?: number,
}

export const useChat = ({ integration, peripherals: { storage = useStorage() } = {}, retries = 2 }: ChatModelConfig) => {
  const id = makeId()

  const add = async (message: Message) => {
    await storage.set(id, [...await get(id), message])
  }

  const clear = async () => {
    await storage.remove(id)
  }

  const generate = async (...messages: Message[]) => {
    const all = [...await get(id), ...messages]

    await hydrate(all)

    for (let i = 0; i < retries; i++) {
      try {
        const reply = await integration.chat(all)

        await add(reply)

        return reply
      } catch (error) {
        // do nothing for now.
      }
    }

    throw new Error('[models][chat] exceeded maximum retries.')
  }

  const get = async (id: string) => {
    return await storage.get<string, Message[]>(id, [])
  }

  const history = async () => {
    return [...await get(id)]
  }

  const hydrate = async (messages: Message[]) => {
    await storage.set(id, messages)
  }

  return {
    id,
    factory: messageFactory,
    model: {
      add,
      clear,
      generate,
      history,
      hydrate,
    },
  }
}
