import { z } from 'zod'

export type PeripheralName = z.infer<typeof zPeripheralName>

export const zPeripheralName = z.enum([
  'openai',
])
