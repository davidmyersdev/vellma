import { z } from 'zod'
import { id, zId } from './id'
import { zJsonLike } from './json'
import { zRole } from './role'
import { timestamp, zTimestamp } from './timestamp'

export type ChatMessage = z.infer<typeof zMessage>
export type AssistantMessage = z.infer<typeof zAssistantMessage>
export type HumanMessage = z.infer<typeof zHumanMessage>
export type SystemMessage = z.infer<typeof zSystemMessage>

export const zMessage = z.object({
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
})

export const zAssistantMessage = zMessage.extend({
  role: z.literal(zRole.enum.assistant).default(zRole.enum.assistant),
})

export const zAssistantFunctionMessage = zAssistantMessage.extend({
  function: z.object({
    args: zJsonLike,
    // Todo: Maybe enum the function list?
    name: z.string(),
  }),
  text: z.string().optional(),
})

export const zFunctionMessage = zMessage.extend({
  name: z.string(),
  role: z.literal(zRole.enum.function).default(zRole.enum.function),
})

export const zHumanMessage = zMessage.extend({
  role: z.literal(zRole.enum.human).default(zRole.enum.human),
})

export const zSystemMessage = zMessage.extend({
  role: z.literal(zRole.enum.system).default(zRole.enum.system),
})

export const message = (thing: unknown): ChatMessage => {
  return zMessage.parse(thing)
}

export const messageFactory = {
  assistant: (thing: unknown): ChatMessage => {
    return zAssistantMessage.parse(thing)
  },
  function: (thing: unknown): ChatMessage => {
    return zFunctionMessage.parse(thing)
  },
  human: (thing: unknown): ChatMessage => {
    return zHumanMessage.parse(thing)
  },
  system: (thing: unknown): ChatMessage => {
    return zSystemMessage.parse(thing)
  },
}
