import { join, resolve } from 'node:path'
import chalk from 'chalk'
import { openai } from 'vellma/integrations'
import { useEmbedding } from 'vellma/models'
import { jsonFileStorage, terminalIo, useIo, useStorage } from 'vellma/peripherals'

// Vellma initialization
const dbFile = resolve(join('tmp', 'playground-basic-embedding.json'))
const io = useIo(terminalIo())
const storage = useStorage(jsonFileStorage(dbFile))
const peripherals = { io, storage }
const integration = openai({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const { model } = useEmbedding({ integration, peripherals })

// Chat loop
while (true) {
  const text = await io.prompt(chalk.green('Chunk:\n'))
  const vector = await model.generate(text)

  await io.write(`\n${chalk.cyan('Vector:')}\n${JSON.stringify({ ...vector, embedding: '[...]' }, null, 2)}\n\n`)
}
