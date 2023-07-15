import chalk from 'chalk'
import { openai } from 'vellma/integrations'
import { useChat } from 'vellma/models'
import { terminalIo, useIo } from 'vellma/peripherals'
import { codeRunnerTool } from 'vellma/tools'

// Config
const io = useIo(terminalIo())
const peripherals = { io }

// Vellma initialization
const integration = openai({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, peripherals })
const tools = [codeRunnerTool({ peripherals })]
const { factory, model } = useChat({ integration, peripherals, tools })

// Output helpers
const labelAssistant = chalk.cyan('Assistant:')
const labelHuman = chalk.green('You:')

// Initial prompts
const systemPrompt = `You are a very skilled JavaScript developer. You have access to a function that runs JavaScript code. When asked to perform a specific computation, please use the function to run the code. Please try to make the code readable with proper indentation and decriptive variable names.`
const systemMessage = factory.system({ text: systemPrompt })

await model.add(systemMessage)

// Chat loop
while (true) {
  const humanAnswer = await io.prompt(`${labelHuman}\n`)

  await io.write(`\n`)

  const humanMessage = factory.human({ text: humanAnswer })
  const assistantMessage = await model.generate(humanMessage)

  await io.write(`${labelAssistant}\n${assistantMessage.text}\n\n`)
}