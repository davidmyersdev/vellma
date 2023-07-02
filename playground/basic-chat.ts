import chalk from 'chalk'
import { openai } from 'ellma/integrations'
import { useChat } from 'ellma/models'
import { ioTerminal, useIo } from 'ellma/peripherals'

// Output helpers
const labelAssistant = chalk.cyan('Assistant:')
const labelHuman = chalk.green('You:')

// Ellma initialization
const integration = openai({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const { factory, model } = useChat({ integration })
const io = useIo(ioTerminal())

// Chat loop
while (true) {
  const humanAnswer = await io.prompt(`${labelHuman}\n`)
  const humanMessage = factory.human({ text: humanAnswer })
  const assistantMessage = await model.generate(humanMessage)

  await io.write(`\n${labelAssistant}\n${assistantMessage.text}\n\n`)
}
