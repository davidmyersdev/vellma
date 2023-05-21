import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import chalk from 'chalk'
import { buildApiInstance } from '../api'
import { env } from '../../env'
import { type Io } from '../io'
import { root } from '../filesystem'

export type EmbedOptions = {
  io: Io,
}

export const embedding = async ({ io }: EmbedOptions) => {
  const {
    apiKey,
    // organization,
    userId,
  } = env()
  const api = buildApiInstance({ apiKey, userId })

  // Todo: Add log helpers for agent, user, and system messages.
  const input = await io.prompt(chalk.white('Please enter some text to create an embedding:\n'))

  console.log(chalk.gray('Thinking...'))

  const { json: embedding } = await api.embedding({ input })

  writeFileSync(join(root, 'output', `embedding-${Date.now()}.json`), JSON.stringify(embedding, null, 2))

  if (embedding.data) {
    await io.write(JSON.stringify(embedding.data, null, 2))
  }
}
