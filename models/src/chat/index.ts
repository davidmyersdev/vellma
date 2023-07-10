import { type JsonLike, type Message, id as makeId, messageFactory } from 'vellma'
import { type Peripherals, useIo, useStorage } from 'vellma/peripherals'
import { type Model } from '..'

export type ChatIntegration = {
  chat: (messages: Message[], metadata?: any) => Promise<Message>,
}

export type ChatModel = Omit<Model, 'model'> & ReturnType<typeof useChat>

export type ChatModelConfig = {
  integration: ChatIntegration,
  functions?: JsonLike[],
  peripherals?: Partial<Peripherals>,
  retries?: number,
}

export const useChat = ({ functions, integration, peripherals: { io = useIo(), storage = useStorage() } = {}, retries = 2 }: ChatModelConfig) => {
  const id = makeId()

  const add = async (message: Message) => {
    await storage.set(id, [...await get(id), message])
  }

  const attemptGenerate = async (messages: Message[]) => {
    const reply = await integration.chat(messages, { functions })

    await add(reply)

    return reply
  }

  const clear = async () => {
    await storage.remove(id)
  }

  const generate = async (...messages: Message[]) => {
    const allMessages = [...await get(id), ...messages]

    await hydrate(allMessages)

    // Initial attempt.
    try {
      return await attemptGenerate(allMessages)
    } catch (_initialError) {
      // Todo: Add logger.
    }

    // Retry as many times as is configured.
    for (let i = 0; i < retries; i++) try {
      await io.write(`Retrying... (${i + 1}/${retries})\n`)

      return await attemptGenerate(allMessages)
    } catch (_retryError) {
      // Todo: Add logger.
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
