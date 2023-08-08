import chalk from 'chalk'
import { openai } from 'vellma/integrations'
import { useChat } from 'vellma/models'
import { terminalIo, terminalLogger, useIo, useLogger } from 'vellma/peripherals'
import { webBrowserTool } from 'vellma/tools'

// Output helpers
const labelAssistant = chalk.cyan('Assistant:')
const labelHuman = chalk.green('You:')

// Vellma initialization
const integration = openai({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const io = useIo(terminalIo())
const logger = useLogger(terminalLogger())
const peripherals = { io, logger }
const modelId = 'gpt-3.5-turbo-16k'
const { factory, model } = useChat({ integration, peripherals, model: modelId, tools: [webBrowserTool({ peripherals })] })

// Chat loop
while (true) {
  const humanAnswer = await io.prompt(`${labelHuman}\n`)

  await io.write(`\n`)

  const humanMessage = factory.human({ text: humanAnswer })
  const assistantMessage = await model.generate(humanMessage)

  await io.write(`${labelAssistant}\n${assistantMessage.text}\n\n`)
}
