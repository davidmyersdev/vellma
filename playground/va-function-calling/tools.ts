import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { id } from 'vellma'
import { fileStorage, useStorage } from 'vellma/peripherals'
import { tool } from 'vellma/tools'

const thisDir = dirname(fileURLToPath(import.meta.url))
const db = useStorage(fileStorage(join(thisDir, 'events.json')))

export const tools = [
  tool({
    handler: async (args: { name: string, timestamp: string, description?: string }) => {
      const event = { ...args, id: id() }

      await db.set(event.id, event)

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
