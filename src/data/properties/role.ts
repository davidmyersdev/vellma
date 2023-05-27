import { z } from 'zod'

export type Role = z.infer<typeof zRole>

export const zRole = z.enum([
  'assistant',
  'human',
  'system',
])

export const roles = zRole.enum
