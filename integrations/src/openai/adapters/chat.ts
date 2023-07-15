import { type JsonLike, type Message, type Role, message as toMessage, zRole } from 'vellma'
import { type Tool } from 'vellma/tools'
import { type ApiChatConfig, type ApiChatMessage, type ApiChatRole, chat as chatApi } from '../api'

export type AdapterChatConfig = Omit<ApiChatConfig, 'functions' | 'messages'> & {
  messages: Message[],
  tools: Tool[],
}

const toExternalMessage = (message: Message): ApiChatMessage => {
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

const toInternalFunction = (function_call: ApiChatMessage['function_call']) => {
  // console.log(function_call.arguments)
  // const args = function_call?.arguments ? (JSON.parse(function_call.arguments) as JsonLike) : undefined
  const args = function_call?.arguments
  const name = function_call?.name

  return {
    args,
    name,
  }
}

const toInternalMessage = (message: ApiChatMessage): Message => {
  return toMessage({
    function: message.function_call ? toInternalFunction(message.function_call) : undefined,
    name: message.name,
    role: toInternalRole(message.role),
    text: message.content || '',
  })
}

const toInternalRole = (role: ApiChatRole): Role => {
  if (role === 'assistant') return zRole.enum.assistant
  if (role === 'function') return zRole.enum.function
  if (role === 'user') return zRole.enum.human
  if (role === 'system') return zRole.enum.system

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

export const chat = async ({ tools, ...config }: AdapterChatConfig) => {
  const messages = config.messages.map(toExternalMessage)
  const functions = tools?.length ? toolsToFunctions(tools) : undefined
  const { json } = await chatApi({ ...config, functions, messages })

  try {
    const { message: newExternalMessage } = json.choices[0]

    return toInternalMessage(newExternalMessage!)
  } catch (error) {
    throw new Error(`[integrations][openai][chat] invalid response: ${error}`)
  }
}
