import chalk from 'chalk'
import { openai } from 'ellma/integrations'
import { useEmbedding } from 'ellma/models'
import { ioTerminal, useIo } from 'ellma/peripherals'

// Ellma initialization
const integration = openai({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const { model } = useEmbedding({ integration })
const io = useIo(ioTerminal())

// Chat loop
while (true) {
  const text = await io.prompt(chalk.green('Chunk:\n'))
  const vector = await model.generate(text)

  await io.write(`\n${chalk.cyan('Vector:')}\n${JSON.stringify(vector, null, 2)}\n\n`)
}
