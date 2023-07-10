import chalk from 'chalk'
import { openai } from 'vellma/integrations'
import { useChat } from 'vellma/models'
import { terminalIo, useIo } from 'vellma/peripherals'

const functions = [
  {
    name: 'add_event_to_calendar',
    description: 'Add an event to the calendar.',
    parameters: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'A brief description of the event.',
        },
        timestamp: {
          type: 'string',
          description: 'An ISO-8601 timestamp for the event.',
        },
      },
      required: ['description', 'timestamp'],
    },
  },
]

const addEventToCalendar = ({ description: _description, timestamp: _timestamp }: { description: string, timestamp: string }) => {
  // An example error response.
  // return {
  //   errors: [{ message: 'The was an unexpected error.' }],
  //   status: 500,
  //   success: false,
  // }

  return {
    status: 200,
    success: true,
  }
}

// Output helpers
const labelAssistant = chalk.cyan('Assistant:')
const labelHuman = chalk.green('You:')
const io = useIo(terminalIo())
const peripherals = { io }

// Vellma initialization
const integration = openai({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, peripherals })
const { factory, model } = useChat({ functions, integration, peripherals })

// Initial prompts
const systemPrompt = `You are a virtual assistant that helps keep track of various tasks, events, and schedules. Today is ${(new Date()).toLocaleDateString()} When asked to keep track of something, please respond with "Okay, I have taken note of that for you." or some variation that fits the specific task. When asked about tasks or events with specific dates or times, use the current conversation to reply. Do not make up events or tasks. If there is nothing on a given day or time, just state that you do not see anything on the schedule. Start the conversation by asking what you can do for me today.`
const systemMessage = factory.system({ text: systemPrompt })
const welcomeMessage = await model.generate(systemMessage)

await io.write(`${labelAssistant}\n${welcomeMessage.text}\n\n`)

// Chat loop
while (true) {
  const humanAnswer = await io.prompt(`${labelHuman}\n`)
  const humanMessage = factory.human({ text: humanAnswer })
  const assistantMessage = await model.generate(humanMessage)

  if (assistantMessage.function?.name === 'add_event_to_calendar') {
    const args = assistantMessage.function.args as { description: string, timestamp: string }
    const functionResult = addEventToCalendar(args)
    const functionMessage = factory.function({ name: 'add_event_to_calendar', text: JSON.stringify(functionResult, null, 2) })
    const assistantNextMessage = await model.generate(functionMessage)

    await io.write(`\n${labelAssistant}\n${assistantNextMessage.text}\n\n`)
  } else if (assistantMessage.function) {
    // Todo: Handle unknown function call.
    await io.write(JSON.stringify(assistantMessage.function, null, 2))
  } else {
    await io.write(`\n${labelAssistant}\n${assistantMessage.text}\n\n`)
  }
}
