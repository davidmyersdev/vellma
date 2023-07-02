import chalk from 'chalk'
import { openai } from 'ellma/integrations'
import { useComplete } from 'ellma/models'
import { ioTerminal, useIo } from 'ellma/peripherals'

// Ellma initialization
const integration = openai({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const { model } = useComplete({ integration })
const io = useIo(ioTerminal())

// Completion loop
while (true) {
  const prompt = await io.prompt(chalk.green('Prompt: '))
  const completion = await model.generate(prompt)

  await io.write(`${chalk.cyan('Result: ')}${prompt}${chalk.cyan(completion)}\n\n`)
}
