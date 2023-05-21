import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import chalk from 'chalk'
import { buildApiInstance } from '../api'
import { env } from '../../env'
import { prompt } from '../interface'
import { root } from '../filesystem'

export const embedding = async () => {
  const {
    apiKey,
    // organization,
    userId,
  } = env()
  const api = buildApiInstance({ apiKey, userId })

  // Todo: Add log helpers for agent, user, and system messages.
  const input = await prompt(chalk.white('Please enter some text to create an embedding:\n'))

  console.log(chalk.gray('Thinking...'))

  const { json: embedding } = await api.embedding({ input })

  writeFileSync(join(root, 'output', `embedding-${Date.now()}.json`), JSON.stringify(embedding, null, 2))

  console.log(embedding.data)
}
