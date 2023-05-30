import { z } from 'zod'

export type OpenAiMessage = z.infer<typeof zOpenAiMessage>
export type OpenAiRole = z.infer<typeof zOpenAiRole>

export const zOpenAiRole = z.enum([
  'assistant',
  'system',
  'user',
])

export const zOpenAiMessage = z.object({
  role: zOpenAiRole,
  content: z.string(),
  name: z.string().optional(),
})
