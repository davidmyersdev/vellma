import { type Message, id as makeId, messageFactory } from 'vellma'
import { type Peripherals, useLogger, useStorage } from 'vellma/peripherals'
import { type Tool } from 'vellma/tools'
import { type Model } from '..'

export type ChatIntegration = {
  chat: (messages: Message[], metadata?: any) => Promise<Message>,
}

export type ChatModel = Omit<Model, 'model'> & ReturnType<typeof useChat>

export type ChatModelConfig = {
  integration: ChatIntegration,
  peripherals?: Partial<Peripherals>,
  retries?: number,
  tools?: Tool[],
}

export const useChat = ({ integration, peripherals = {}, retries = 2, tools = [] }: ChatModelConfig) => {
  const id = makeId()
  const { logger = useLogger(), storage = useStorage() } = peripherals

  const add = async (message: Message) => {
    await storage.set(id, [...await get(id), message])
  }

  const getFnResult = async (tool: Tool, toolArgsJson: string) => {
    try {
      const args = JSON.parse(toolArgsJson)

      return await tool.handler(args)
    } catch (error: unknown) {
      if (error instanceof SyntaxError && /json/i.test(error.message)) {
        return 'The arguments you provided are not valid JSON. Please try calling this function again with valid JSON.'
      }

      return error
    }
  }

  const handleTools = async (fnCall: NonNullable<Message['function']>): Promise<Message> => {
    const tool = tools.find(t => t.schema.name === fnCall.name)

    if (!tool) {
      throw new Error('[models][chat] no tool found for fn call')
    }

    const args = fnCall.args as any
    const functionResult = await getFnResult(tool, args)
    const functionMessage = messageFactory.function({ name: tool.schema.name, text: JSON.stringify(functionResult, null, 2) })

    return await generate(functionMessage)
  }

  const attemptGenerate = async (messages: Message[]) => {
    const reply = await integration.chat(messages, { tools })

    await add(reply)

    if (reply.function) return await handleTools(reply.function)

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
    } catch (error) {
      await logger.error(`[models][chat] An error occurred: ${String(error)}`)
    }

    // Reattempt as many times as is allowed.
    for (let i = 0; i < retries; i++) try {
      await logger.debug(`[models][chat] Reattempting to generate message... (${i + 1}/${retries})`)

      return await attemptGenerate(allMessages)
    } catch (error) {
      await logger.error(`[models][chat] An error occurred: ${String(error)}`)
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
