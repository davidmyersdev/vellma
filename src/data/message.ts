import { z } from 'zod'
import { id, timestamp, zId, zRole, zTimestamp } from '#data'

export type Message = z.infer<typeof zMessage>
export type AssistantMessage = z.infer<typeof zAssistantMessage>
export type HumanMessage = z.infer<typeof zHumanMessage>
export type SystemMessage = z.infer<typeof zSystemMessage>

export const zMessage = z.object({
  id: zId.default(() => id()),
  createdAt: zTimestamp.default(() => timestamp()),
  role: zRole,
  text: z.string(),
  userId: z.string().optional(),
})

export const zAssistantMessage = zMessage.extend({
  role: z.literal(zRole.enum.assistant).default(zRole.enum.assistant),
})

export const zHumanMessage = zMessage.extend({
  role: z.literal(zRole.enum.human).default(zRole.enum.human),
})

export const zSystemMessage = zMessage.extend({
  role: z.literal(zRole.enum.system).default(zRole.enum.system),
})

export const message = (thing: unknown): Message => {
  return zMessage.parse(thing)
}

export const messages = {
  assistant: (thing: unknown): Message => {
    return zAssistantMessage.parse(thing)
  },
  human: (thing: unknown): Message => {
    return zHumanMessage.parse(thing)
  },
  system: (thing: unknown): Message => {
    return zSystemMessage.parse(thing)
  },
}
