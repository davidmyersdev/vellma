import { type CreateChatCompletionResponse } from 'openai'
import { type ChatMessage, type Consumable, type JsonLike, type Role, streamNewlineSplitter, streamTextDecoder, toConsumable, message as vMessage, zRole } from 'vellma'
import { type Peripherals, useLogger } from 'vellma/peripherals'
import { type Tool } from 'vellma/tools'
import { type ApiChatMessage, type ApiChatModel, type ApiChatRole, type ApiConfig, type ApiResponse, apiClient } from '../api'

export type ApiChatConfig = ApiConfig & {
  messages: ApiChatMessage[],
  function_call?: 'auto' | 'none' | { name: string },
  functions?: JsonLike[],
  model?: ApiChatModel,
}
export type ApiChatResponse = ApiResponse<CreateChatCompletionResponse>
export type ApiChatResponseData = CreateChatCompletionResponse

export type DataChunk = {
  id: string,
  object: string,
  created: number,
  model: string,
  choices: Array<{
    delta: DataChunkDelta,
    finish_reason?: string,
    index: number,
  }>,
}

export type DataChunkDelta = {
  content?: string,
  function_call?: {
    name?: string,
    arguments?: string,
  },
  role?: ApiChatRole,
}

export type AdapterChatConfig = Omit<ApiChatConfig, 'functions' | 'messages'> & {
  messages: ChatMessage[],
  toolToUse?: string,
  tools: Tool[],
}

const toMessage = (message: ChatMessage): ApiChatMessage => {
  return {
    content: message.text,
    function_call: message.function
      ? {
          arguments: JSON.stringify(message.function.args, null, 2),
          name: message.function.name,
        }
      : undefined,
    name: message.name,
    role: toExternalRole(message.role),
  }
}

const toExternalRole = (role: Role): ApiChatRole => {
  if (role === zRole.enum.assistant) return 'assistant'
  if (role === zRole.enum.function) return 'function'
  if (role === zRole.enum.human) return 'user'
  if (role === zRole.enum.system) return 'system'

  throw new Error(`[openai][chat] invalid role: ${role}`)
}

const toolsToFunctions = (tools: Tool[]): JsonLike[] => {
  const functions = tools.map(({ schema }) => {
    const required: string[] = []
    const properties = Object.entries(schema.args).reduce<Record<string, JsonLike>>((props, [key, value]) => {
      if (value.required) required.push(key)

      const { required: _required, ...acceptedArgs } = value

      props[key] = {
        ...acceptedArgs,
      }

      return props
    }, {})

    return {
      name: schema.name,
      description: schema.description || null,
      parameters: {
        type: 'object',
        properties,
        required,
      },
    }
  })

  return functions
}

const streamDataParser = ({ logger = useLogger() }: Partial<Peripherals> = {}) => {
  const dataChunkPrefix = 'data: '
  const dataChunkDoneValue = '[DONE]'

  return new TransformStream<string | undefined, DataChunk>({
    async transform(textChunk, controller) {
      if (textChunk?.startsWith(dataChunkPrefix)) {
        const maybeJson = textChunk.slice(dataChunkPrefix.length)

        try {
          const dataChunk = JSON.parse(maybeJson)

          controller.enqueue(dataChunk)
        } catch (error) {
          if (maybeJson !== dataChunkDoneValue) {
            await logger.error(`[integrations][openai][chat] error:\n${JSON.stringify(error, null, 2)}`)
          }
        }
      }
    },
  })
}

const streamDataDeltaExtractor = () => {
  return new TransformStream<DataChunk | undefined, DataChunkDelta>({
    async transform(dataChunk, controller) {
      if (dataChunk?.choices[0].delta) {
        const dataDelta = dataChunk.choices[0].delta

        controller.enqueue(dataDelta)
      }
    },
  })
}

const streamMessageHydrator = (message: ChatMessage) => {
  return new TransformStream<DataChunkDelta | undefined, ChatMessage>({
    async transform(dataDelta, controller) {
      if (dataDelta) {
        if (dataDelta.content) {
          message.text += dataDelta.content

          controller.enqueue({
            ...message,
            textDelta: dataDelta.content,
          })
        }

        if (dataDelta.function_call) {
          if (dataDelta.function_call?.name) {
            message.function = {
              name: dataDelta.function_call.name,
              args: '',
            }
          }

          if (message.function && dataDelta.function_call?.arguments) {
            message.function.args += dataDelta.function_call.arguments
          }

          controller.enqueue({
            ...message,
          })
        }
      }
    },
  })
}

export const chat = async ({ toolToUse, tools, ...config }: AdapterChatConfig): Promise<Consumable<ChatMessage>> => {
  const { model = 'gpt-4', peripherals = {} } = config
  const messages = config.messages.map(toMessage)
  const function_call = toolToUse ? { name: toolToUse } : undefined
  const functions = tools?.length ? toolsToFunctions(tools) : undefined

  const api = apiClient(config)
  const response = await api.post('/v1/chat/completions', { body: { function_call, functions, messages, model, stream: true } }) as ApiChatResponse

  if (!response.body) {
    throw new Error(`[integrations][openai][chat] missing response body`)
  }

  const message = vMessage({ role: 'assistant' })
  const stream = (response.body as ReadableStream<Uint8Array>)
    .pipeThrough(streamTextDecoder(peripherals))
    .pipeThrough(streamNewlineSplitter(peripherals))
    .pipeThrough(streamDataParser(peripherals))
    .pipeThrough(streamDataDeltaExtractor())
    .pipeThrough(streamMessageHydrator(message))

  return toConsumable(message, { stream })
}
