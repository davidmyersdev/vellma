import { type Message, id as makeId, messageFactory } from 'vellma'
import { type ChatIntegration } from 'vellma/integrations'
import { type Peripherals, useLogger, useStorage } from 'vellma/peripherals'
import { type Tool } from 'vellma/tools'
import { type Model } from '..'

export type ChatModel = Omit<Model, 'model'> & ReturnType<typeof useChat>

export type ChatModelConfig = {
  integration: ChatIntegration,
  model?: string,
  peripherals?: Partial<Peripherals>,
  retries?: number,
  toolToUse?: string,
  tools?: Tool[],
}

export const useChat = ({ integration, model, peripherals = {}, retries = 2, toolToUse, tools = [] }: ChatModelConfig) => {
  const id = makeId()
  const { logger = useLogger(), storage = useStorage() } = peripherals

  const add = async (...messages: Message[]) => {
    await storage.set(id, [...await get(id), ...messages])
  }

  const set = async (message: Message) => {
    const messages = await get(id)
    const foundIndex = messages.findIndex(m => m.id === message.id)

    if (foundIndex >= 0) {
      const updated = messages.map((item, index) => index === foundIndex ? message : item)

      return await storage.set(id, updated)
    }

    await storage.set(id, [...await get(id), message])
  }

  // Todo: Make function behavior configurable. Users should have the ability to control whether a function retries or
  // not, how many times it retries, and whether or not special handling should be incorporated for the response.
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

  const handleTools = async function* (fnCall: NonNullable<Message['function']>) {
    const tool = tools.find(t => t.schema.name === fnCall.name)

    if (!tool) {
      throw new Error('[models][chat] no tool found for fn call')
    }

    const args = fnCall.args as string
    const functionResult = await getFnResult(tool, args)
    const functionMessage = messageFactory.function({ name: tool.schema.name, text: JSON.stringify(functionResult, null, 2) })

    await add(functionMessage)

    yield* attemptGenerate()
  }

  const attemptGenerate = async function* (): AsyncGenerator<Message> {
    const messages = await get(id)
    const reply = await integration.chat(messages, { model, peripherals, toolToUse, tools })

    for await (const chunk of reply) {
      await set(chunk)

      if (chunk.function) {
        // Todo: Yield a status update message.
        const fullMessage = await reply.get()

        if (fullMessage.function) {
          yield* handleTools(fullMessage.function)
        }
      }

      yield chunk
    }
  }

  const clear = async () => {
    await storage.remove(id)
  }

  const generate = async function* (...messages: Message[]) {
    await add(...messages)

    // Initial attempt.
    try {
      return yield* attemptGenerate()
    } catch (error) {
      await logger.error(`[models][chat] An error occurred: ${String(error)}`)
    }

    // Reattempt as many times as is allowed.
    for (let i = 0; i < retries; i++) try {
      await logger.debug(`[models][chat] Reattempting to generate message... (${i + 1}/${retries})`)

      return yield* attemptGenerate()
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
