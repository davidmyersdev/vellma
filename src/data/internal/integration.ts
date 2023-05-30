import { z } from 'zod'

export type IntegrationName = z.infer<typeof zIntegrationName>

export const zIntegrationName = z.enum([
  'openai',
])
