import chalk from 'chalk'
import { toValue } from 'vellma'
import { openai } from 'vellma/integrations'
import { useChat } from 'vellma/models'
import { jsonFileStorage, terminalIo, useIo, useStorage } from 'vellma/peripherals'
import { codeRunnerTool, valTownCodeRunner } from 'vellma/tools'

// Config
const io = useIo(terminalIo())
const storage = useStorage(jsonFileStorage('./tmp/code-runner.json'))
const peripherals = { storage }

// Vellma initialization
const integration = openai({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, peripherals })
const codeRunner = codeRunnerTool(valTownCodeRunner({ peripherals }))
const tools = [codeRunner]
const { factory, model } = useChat({ integration, peripherals, tools })

// Output helpers
const labelAssistant = chalk.cyan('Assistant:')
const labelHuman = chalk.green('You:')

// Initial prompts
const systemPrompt = `You are a very skilled JavaScript developer. You have access to a function that runs JavaScript code. When asked to perform a specific computation, please use the function to run the code. Please try to make the code readable with proper indentation and decriptive variable names.`
const systemMessage = factory.system({ text: systemPrompt })

await io.write(chalk.grey(`System:\n${systemMessage.text}\n\n`))

const initialHumanPrompt = `What is the 112th prime number?`
const initialHumanMessage = factory.human({ text: initialHumanPrompt })

await io.write(`${labelHuman}\n${initialHumanMessage.text}\n\n`)

const initialReply = await toValue(model.generate(systemMessage, initialHumanMessage))

await io.write(`${labelAssistant}\n${initialReply.text}\n\n`)

// Chat loop
while (true) {
  const humanAnswer = await io.prompt(`${labelHuman}\n`)

  await io.write(`\n`)

  const humanMessage = factory.human({ text: humanAnswer })
  const assistantMessage = await toValue(model.generate(humanMessage))

  await io.write(`${labelAssistant}\n${assistantMessage.text}\n\n`)
}
