import { type Message, chainable, id, messageFactory, timestamp, zId, zJsonLike, zRole, zTimestamp } from 'vellma'
import { type ChatIntegration } from 'vellma/integrations'
import { type Peripherals, storageBucket, useInMemoryStorage, useLogger } from 'vellma/peripherals'
import { type Tool } from 'vellma/tools'
import { z } from 'zod'
import { type Model } from '..'

export type ChatModel = Omit<Model, 'model'> & ReturnType<typeof useChat>

export type ChatModelConfig = {
  integration: ChatIntegration,
  chatId?: string,
  model?: string,
  peripherals?: Partial<Peripherals>,
  retries?: number,
  toolToUse?: string,
  tools?: Tool[],
}

export type ChatData = z.output<typeof chatSchema['attributes']>
export type ChatMessageData = z.output<typeof chatMessageSchema['attributes']>

export const chatSchema = storageBucket({
  name: 'chats',
  attributes: z.object({
    id: zId.default(() => id()),
    createdAt: zTimestamp.default(() => timestamp()),
    updatedAt: zTimestamp.default(() => timestamp()),
  }),
})

export const chatMessageSchema = storageBucket({
  name: 'chatMessages',
  attributes: z.object({
    id: zId.default(() => id()),
    chatId: zId.optional(),
    userId: z.string().optional(),
    function: z.object({
      args: zJsonLike.or(z.string()),
      // Todo: Maybe enum the function list?
      name: z.string(),
    }).optional(),
    name: z.string().optional(),
    role: zRole,
    text: z.string().optional().default(''),
    textDelta: z.string().optional().default(''),
    createdAt: zTimestamp.default(() => timestamp()),
    updatedAt: zTimestamp.default(() => timestamp()),
  }),
})

export const useChat = (config: ChatModelConfig) => {
  const { integration, chatId = id(), model, peripherals = {}, retries = 2, toolToUse, tools = [] } = config
  const { logger = useLogger(), storage = useInMemoryStorage() } = peripherals

  const chats = chainable(storage.bucket(chatSchema))
  const chatMessages = chainable(chats.find({ id: chatId }).then((result) => {
    return Promise.resolve(result || chats.save({ id: chatId, createdAt: new Date(), updatedAt: new Date() })).then(() => storage.bucket(chatMessageSchema))
  }))

  // Todo: Rename to something more suitable such as `merge`, `sync`, or `hydrate`.
  const add = async (...messages: Message[]) => {
    for (const message of messages) {
      await chatMessages.save({ ...message, chatId, updatedAt: timestamp() })
    }
  }

  const attemptGenerate = async function* (): AsyncGenerator<Message> {
    const messages = await chatMessages.where({ chatId })
    const orderedMessages = messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    const reply = await integration.chat(orderedMessages, { model, peripherals, toolToUse, tools })

    for await (const chunk of reply) {
      await add(chunk)

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

  const generate = async function* (...messages: Message[]) {
    await add(...messages)

    const errors = [] as any[]

    // Initial attempt.
    try {
      return yield* attemptGenerate()
    } catch (error) {
      errors.push(error)
      await logger.error({ message: `[models][chat] An error occurred:`, error: error as Record<string, string> })
    }

    // Reattempt as many times as is allowed.
    for (let i = 0; i < retries; i++) try {
      await logger.debug(`[models][chat] Reattempting to generate message... (${i + 1}/${retries})`)

      return yield* attemptGenerate()
    } catch (error) {
      errors.push(error)
      await logger.error({ message: `[models][chat] An error occurred:`, error: error as Record<string, string> })
    }

    // Throw errors
    throw errors.at(-1)

    // throw new Error('[models][chat] exceeded maximum retries.')
  }

  // Todo: Make function behavior configurable. Users should have the ability to control whether a function retries or
  // not, how many times it retries, and whether or not special handling should be incorporated for the response.
  const getToolResult = async (tool: Tool, toolArgsJson: string) => {
    try {
      let args = JSON.parse(toolArgsJson)

      // Todo: Figure out how to handle scenarios where args are a JSON-encoded string of JSON.
      while (typeof args !== 'object') {
        args = JSON.parse(args)
      }

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
    const functionResult = await getToolResult(tool, args)
    const functionMessage = messageFactory.function({ name: tool.schema.name, text: JSON.stringify(functionResult, null, 2) })

    await add(functionMessage)

    yield* attemptGenerate()
  }

  return {
    chatId,
    factory: messageFactory,
    model: {
      add,
      generate,
    },
  }
}
