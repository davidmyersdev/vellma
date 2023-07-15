import chalk from 'chalk'
import { openai } from 'vellma/integrations'
import { useChat } from 'vellma/models'
import { terminalIo, useIo } from 'vellma/peripherals'
import { tools } from './tools'

// Config
const io = useIo(terminalIo())
const peripherals = { io }

// Vellma initialization
const integration = openai({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, peripherals })
const { factory, model } = useChat({ integration, peripherals, tools })

// Output helpers
const labelAssistant = chalk.cyan('Assistant:')
const labelHuman = chalk.green('You:')

// Initial prompts
const systemPrompt = `You are a virtual assistant that helps keep track of various tasks, events, and schedules. Today is ${(new Date()).toLocaleDateString()} When asked to keep track of something, please respond with "Okay, I have taken note of that for you." or some variation that fits the specific task. When asked about tasks or events with specific dates or times, use the current conversation to reply. Do not make up events or tasks. If there is nothing on a given day or time, just state that you do not see anything on the schedule. Start the conversation by asking what you can do for me today.`
const systemMessage = factory.system({ text: systemPrompt })
const welcomeMessage = await model.generate(systemMessage)

await io.write(`${labelAssistant}\n${welcomeMessage.text}\n\n`)

// Chat loop
while (true) {
  const humanAnswer = await io.prompt(`${labelHuman}\n`)

  await io.write(`\n`)

  const humanMessage = factory.human({ text: humanAnswer })
  const assistantMessage = await model.generate(humanMessage)

  await io.write(`\n${labelAssistant}\n${assistantMessage.text}\n\n`)
}
