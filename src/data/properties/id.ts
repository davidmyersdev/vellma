import { nanoid } from 'nanoid'
import { z } from 'zod'

export type Id = z.infer<typeof zId>

export const id = (): Id => {
  return nanoid()
}

export const zId = z.string()
