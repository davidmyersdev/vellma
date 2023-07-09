import chalk from 'chalk'
import { openai } from 'vellma/integrations'
import { useCompletion } from 'vellma/models'
import { terminalIo, useIo } from 'vellma/peripherals'

// Vellma initialization
const integration = openai({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const { model } = useCompletion({ integration })
const io = useIo(terminalIo())

// Completion loop
while (true) {
  const prompt = await io.prompt(chalk.green('Prompt: '))
  const completion = await model.generate(prompt)

  await io.write(`${chalk.cyan('Result: ')}${prompt}${chalk.cyan(completion)}\n\n`)
}
