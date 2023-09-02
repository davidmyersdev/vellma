import { id } from 'vellma'
import { jsonFileStorage, storageBucket, useStorage } from 'vellma/peripherals'
import { tool } from 'vellma/tools'
import { z } from 'zod'

const db = useStorage(jsonFileStorage())

export const eventSchema = storageBucket({
  name: 'events',
  attributes: z.object({
    id: z.string(),
    name: z.string(),
    timestamp: z.string(),
    description: z.string().optional(),
  }),
})

export const tools = [
  tool({
    handler: async (args: { name: string, timestamp: string, description?: string }) => {
      const event = { ...args, id: id() }
      const events = await db.bucket(eventSchema)

      await events.save(event)

      return { event, success: true }
    },
    name: 'addEventToCalendar',
    description: 'Add an event to the calendar.',
    args: {
      description: {
        type: 'string',
        description: 'A description of the event, if applicable.',
      },
      name: {
        type: 'string',
        description: 'The name of the event.',
        required: true,
      },
      timestamp: {
        type: 'string',
        description: 'An ISO-8601 timestamp (including timezone) for the event.',
        required: true,
      },
    },
  }),
]
