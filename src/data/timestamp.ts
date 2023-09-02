import { z } from 'zod'

export type Timestamp = z.infer<typeof zTimestamp>
export type TimestampLike = z.infer<typeof zTimestampLike>

export const zTimestampLike = z.union([z.number(), z.string(), z.date()])
export const zTimestamp = zTimestampLike.pipe(z.coerce.date())

export const timestamp = (timestampLike: TimestampLike = new Date()): Date => {
  return zTimestamp.parse(timestampLike)
}
