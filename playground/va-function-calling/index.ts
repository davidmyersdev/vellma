import chalk from 'chalk'
import { type Message } from 'vellma'
import { openai } from 'vellma/integrations'
import { useChat } from 'vellma/models'
import { terminalIo, useIo } from 'vellma/peripherals'
import { functions } from './functions'

// Config
const io = useIo(terminalIo())
const peripherals = { io }

// Vellma initialization
const integration = openai({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, peripherals })
const { factory, model } = useChat({ integration, peripherals, functions: Object.values(functions).map(f => f.schema) })

// Output helpers
const labelAssistant = chalk.cyan('Assistant:')
const labelHuman = chalk.green('You:')

// Initial prompts
const systemPrompt = `You are a virtual assistant that helps keep track of various tasks, events, and schedules. Today is ${(new Date()).toLocaleDateString()} When asked to keep track of something, please respond with "Okay, I have taken note of that for you." or some variation that fits the specific task. When asked about tasks or events with specific dates or times, use the current conversation to reply. Do not make up events or tasks. If there is nothing on a given day or time, just state that you do not see anything on the schedule. Start the conversation by asking what you can do for me today.`
const systemMessage = factory.system({ text: systemPrompt })
const welcomeMessage = await model.generate(systemMessage)

await io.write(`${labelAssistant}\n${welcomeMessage.text}\n\n`)

const handleFunctionCall = async (fnCall: NonNullable<Message['function']>): Promise<Message> => {
  const fn = functions[fnCall.name as keyof typeof functions]
  const args = fnCall.args as any
  const functionResult = await fn.handler(args)
  const functionMessage = factory.function({ name: fn.schema.name, text: JSON.stringify(functionResult, null, 2) })
  const assistantNextMessage = await model.generate(functionMessage)

  if (assistantNextMessage.function) {
    return await handleFunctionCall(assistantNextMessage.function)
  }

  return assistantNextMessage
}

// Chat loop
while (true) {
  const humanAnswer = await io.prompt(`${labelHuman}\n`)
  const humanMessage = factory.human({ text: humanAnswer })
  const assistantMessage = await model.generate(humanMessage)

  if (assistantMessage.function) {
    const assistantNextMessage = await handleFunctionCall(assistantMessage.function)

    await io.write(`\n${labelAssistant}\n${assistantNextMessage.text}\n\n`)
  } else {
    await io.write(`\n${labelAssistant}\n${assistantMessage.text}\n\n`)
  }
}
